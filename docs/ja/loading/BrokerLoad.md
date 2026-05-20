---
displayed_sidebar: docs
---

# HDFSまたはクラウドストレージからデータをロードする

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

Broker Loadを使用して、HDFSまたはクラウドストレージからStarRocksに大量のデータをロードできます。

Broker Loadは非同期ロードモードで実行されます。ロードジョブを送信すると、StarRocksは非同期でジョブを実行します。[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md)ステートメントまたは`curl`コマンドを使用して、ジョブの結果を確認する必要があります。

Broker Loadは、単一テーブルロードと複数テーブルロードをサポートしています。1つのBroker Loadジョブを実行することで、1つまたは複数のデータファイルを1つまたは複数の宛先テーブルにロードできます。Broker Loadは、複数のデータファイルをロードするために実行される各ロードジョブのトランザクションアトミック性を保証します。アトミック性とは、1つのロードジョブにおける複数のデータファイルのロードがすべて成功するか、すべて失敗する必要があることを意味します。一部のデータファイルのロードが成功し、他のファイルのロードが失敗するということは決してありません。

Broker Loadは、データロード時のデータ変換をサポートし、データロード中のUPSERTおよびDELETE操作によるデータ変更をサポートします。詳細については、[ロード時のデータ変換](../loading/Etl_in_loading.md)および[ロードによるデータ変更](../loading/Load_to_Primary_Key_tables.md)を参照してください。

<InsertPrivNote />

## 背景情報

v2.4以前では、StarRocksはBroker Loadジョブを実行する際に、StarRocksクラスターと外部ストレージシステム間の接続を確立するためにブローカーに依存していました。そのため、ロードステートメントで使用するブローカーを指定するために`WITH BROKER "<broker_name>"`を入力する必要があります。これは「ブローカーベースのロード」と呼ばれます。ブローカーは、ファイルシステムインターフェースと統合された独立したステートレスサービスです。ブローカーを使用すると、StarRocksは外部ストレージシステムに保存されているデータファイルにアクセスして読み取り、独自のコンピューティングリソースを使用してこれらのデータファイルのデータを前処理およびロードできます。

v2.5以降、StarRocksはBroker Loadジョブを実行する際に、StarRocksクラスターと外部ストレージシステム間の接続を確立するためにブローカーに依存しなくなりました。そのため、ロードステートメントでブローカーを指定する必要はなくなりましたが、`WITH BROKER`キーワードは保持する必要があります。これは「ブローカーフリーロード」と呼ばれます。

データがHDFSに保存されている場合、ブローカーフリーロードが機能しない状況に遭遇することがあります。これは、データが複数のHDFSクラスターにまたがって保存されている場合や、複数のKerberosユーザーを構成している場合に発生する可能性があります。このような状況では、代わりにブローカーベースのロードを使用することができます。これを成功させるには、少なくとも1つの独立したブローカーグループがデプロイされていることを確認してください。このような状況での認証構成とHA構成の指定方法については、[HDFS](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs)を参照してください。

## サポートされているデータファイル形式

Broker Loadは以下のデータファイル形式をサポートしています。

- CSV

- Parquet

- ORC

> **注**
>
> CSVデータについては、以下の点に注意してください。
>
> - テキスト区切り文字として、カンマ (,)、タブ、パイプ (|) など、長さが50バイトを超えないUTF-8文字列を使用できます。
> - NULL値は`\N`を使用して示されます。たとえば、データファイルが3つの列で構成され、そのデータファイルからのレコードが最初の列と3番目の列にデータを持つが、2番目の列にはデータを持たない場合、この状況では、2番目の列に`\N`を使用してNULL値を示す必要があります。これは、レコードが`a,,b`ではなく`a,\N,b`としてコンパイルされる必要があることを意味します。`a,,b`は、レコードの2番目の列が空の文字列であることを示します。

## サポートされているストレージシステム

Broker Loadは以下のストレージシステムをサポートしています。

- HDFS

- AWS S3

- Google GCS

- MinIOなどのS3互換ストレージシステム

- Microsoft Azure Storage

## 仕組み

ロードジョブをFEに送信すると、FEはクエリプランを生成し、利用可能なBEの数とロードするデータファイルのサイズに基づいてクエリプランを分割し、各部分を利用可能なBEに割り当てます。ロード中、関与する各BEはHDFSまたはクラウドストレージシステムからデータファイルのデータをプルし、データを前処理し、StarRocksクラスターにデータをロードします。すべてのBEがクエリプランの割り当てられた部分を完了した後、FEはロードジョブが成功したかどうかを判断します。

次の図は、Broker Loadジョブのワークフローを示しています。

![Broker Loadのワークフロー](../_assets/broker_load_how-to-work_en.png)

## 基本操作

### 複数テーブルロードジョブの作成

このトピックでは、CSVを例として、複数のデータファイルを複数のテーブルにロードする方法について説明します。他のファイル形式でのデータのロード方法、およびBroker Loadの構文とパラメーターの説明については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)を参照してください。

StarRocksでは、一部のリテラルがSQL言語の予約済みキーワードとして使用されます。これらのキーワードをSQLステートメントで直接使用しないでください。SQLステートメントでそのようなキーワードを使用したい場合は、バッククォート (`) で囲んでください。参照: [キーワード](../sql-reference/sql-statements/keywords.md)。

#### データ例

1. ローカルファイルシステムにCSVファイルを作成します。

   a. `file1.csv`という名前のCSVファイルを作成します。このファイルは、ユーザーID、ユーザー名、ユーザーのスコアを順に表す3つの列で構成されています。

   ```Plain
   1,Lily,23
   2,Rose,23
   3,Alice,24
   4,Julia,25
   ```

   b. `file2.csv`という名前のCSVファイルを作成します。このファイルは、都市IDと都市名を順に表す2つの列で構成されています。

   ```Plain
   200,'Beijing'
   ```

2. StarRocksデータベース `test_db` にStarRocksテーブルを作成します。

   > **注**
   >
   > v2.5.7以降、StarRocksはテーブルの作成時またはパーティションの追加時にバケット数 (BUCKETS) を自動的に設定できます。手動でバケット数を設定する必要はなくなりました。詳細については、以下を参照してください。[バケット数を設定する](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets)。

   a. `table1`という名前のプライマリキーテーブルを作成します。このテーブルは、`id`、`name`、`score`の3つの列で構成されており、そのうち`id`がプライマリキーです。

   ```SQL
   CREATE TABLE `table1`
   (
       `id` int(11) NOT NULL COMMENT "user ID",
       `name` varchar(65533) NULL DEFAULT "" COMMENT "user name",
       `score` int(11) NOT NULL DEFAULT "0" COMMENT "user score"
   )
   ENGINE=OLAP
   PRIMARY KEY(`id`)
   DISTRIBUTED BY HASH(`id`);
   ```

   b. `table2`という名前のプライマリキーテーブルを作成します。このテーブルは、`id`と`city`の2つの列で構成されており、そのうち`id`がプライマリキーです。

   ```SQL
   CREATE TABLE `table2`
   (
       `id` int(11) NOT NULL COMMENT "city ID",
       `city` varchar(65533) NULL DEFAULT "" COMMENT "city name"
   )
   ENGINE=OLAP
   PRIMARY KEY(`id`)
   DISTRIBUTED BY HASH(`id`);
   ```

3. `file1.csv`と`file2.csv`を、HDFSクラスターの`/user/starrocks/`パス、AWS S3バケット`bucket_s3`の`input`フォルダー、Google GCSバケット`bucket_gcs`の`input`フォルダー、MinIOバケット`bucket_minio`の`input`フォルダー、およびAzure Storageの指定されたパスにアップロードします。

#### HDFSからデータをロードする

以下のステートメントを実行して、HDFSクラスターの`/user/starrocks`パスから`file1.csv`と`file2.csv`を、それぞれ`table1`と`table2`にロードします。

```SQL
LOAD LABEL test_db.label1
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/file1.csv")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    (id, name, score)
    ,
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/file2.csv")
    INTO TABLE table2
    COLUMNS TERMINATED BY ","
    (id, city)
)
WITH BROKER
(
    StorageCredentialParams
)
PROPERTIES
(
    "timeout" = "3600"
);
```

上記の例では、`StorageCredentialParams`は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs)。

#### AWS S3からデータをロードする

以下のステートメントを実行して、AWS S3バケット`bucket_s3`の`input`フォルダーから`file1.csv`と`file2.csv`を、それぞれ`table1`と`table2`にロードします。

```SQL
LOAD LABEL test_db.label2
(
    DATA INFILE("s3a://bucket_s3/input/file1.csv")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    (id, name, score)
    ,
    DATA INFILE("s3a://bucket_s3/input/file2.csv")
    INTO TABLE table2
    COLUMNS TERMINATED BY ","
    (id, city)
)
WITH BROKER
(
    StorageCredentialParams
);
```

> **注**
>
> Broker Loadは、S3Aプロトコルにのみ従ってAWS S3へのアクセスをサポートしています。したがって、AWS S3からデータをロードする際は、ファイルパスとして渡すS3 URI内の`s3://`を`s3a://`に置き換える必要があります。

上記の例では、`StorageCredentialParams`は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#aws-s3)。

v3.1以降、StarRocksはINSERTコマンドとTABLEキーワードを使用することで、Parquet形式またはORC形式のファイルをAWS S3から直接ロードすることをサポートしており、最初に外部テーブルを作成する手間を省きます。詳細については、以下を参照してください。[INSERTを使用してデータをロードする > TABLEキーワードを使用して外部ソースのファイルからデータを直接挿入する](../loading/InsertInto.md#insert-data-directly-from-files-in-an-external-source-using-files)。

#### Google GCSからデータをロードする

以下のステートメントを実行して、Google GCSバケット`bucket_gcs`の`input`フォルダーから`file1.csv`と`file2.csv`を、それぞれ`table1`と`table2`にロードします。

```SQL
LOAD LABEL test_db.label3
(
    DATA INFILE("gs://bucket_gcs/input/file1.csv")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    (id, name, score)
    ,
    DATA INFILE("gs://bucket_gcs/input/file2.csv")
    INTO TABLE table2
    COLUMNS TERMINATED BY ","
    (id, city)
)
WITH BROKER
(
    StorageCredentialParams
);
```

> **注**
>
> Broker Loadは、gsプロトコルにのみ従ってGoogle GCSへのアクセスをサポートしています。したがって、Google GCSからデータをロードする際は、ファイルパスとして渡すGCS URIに`gs://`をプレフィックスとして含める必要があります。

上記の例では、`StorageCredentialParams`は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#google-gcs)。

#### その他のS3互換ストレージシステムからデータをロードする

MinIOを例として使用します。以下のステートメントを実行して、MinIOバケット`bucket_minio`の`input`フォルダーから`file1.csv`と`file2.csv`を、それぞれ`table1`と`table2`にロードできます。

```SQL
LOAD LABEL test_db.label7
(
    DATA INFILE("s3://bucket_minio/input/file1.csv")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    (id, name, score)
    ,
    DATA INFILE("s3://bucket_minio/input/file2.csv")
    INTO TABLE table2
    COLUMNS TERMINATED BY ","
    (id, city)
)
WITH BROKER
(
    StorageCredentialParams
);
```

前述の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#other-s3-compatible-storage-system)。

#### Microsoft Azure Storage からデータをロードする

Azure Storage の指定されたパスから `file1.csv` と `file2.csv` をロードするには、次のステートメントを実行します。

```SQL
LOAD LABEL test_db.label8
(
    DATA INFILE("wasb[s]://<container>@<storage_account>.blob.core.windows.net/<path>/file1.csv")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    (id, name, score)
    ,
    DATA INFILE("wasb[s]://<container>@<storage_account>.blob.core.windows.net/<path>/file2.csv")
    INTO TABLE table2
    COLUMNS TERMINATED BY ","
    (id, city)
)
WITH BROKER
(
    StorageCredentialParams
);
```

> **注意**
>
> Azure Storage からデータをロードする場合、使用するアクセスプロトコルと特定のストレージサービスに基づいて、どのプレフィックスを使用するかを決定する必要があります。前述の例では、Blob Storage を例として使用しています。
>
> - Blob Storage からデータをロードする場合、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスに `wasb://` または `wasbs://` をプレフィックスとして含める必要があります。
>   - Blob Storage が HTTP 経由でのみアクセスを許可している場合、プレフィックスとして `wasb://` を使用します。例: `wasb://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*`。
>   - Blob Storage が HTTPS 経由でのみアクセスを許可している場合、プレフィックスとして `wasbs://` を使用します。例: `wasbs://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*`。
> - Data Lake Storage Gen1 からデータをロードする場合、ファイルパスに `adl://` をプレフィックスとして含める必要があります。例: `adl://<data_lake_storage_gen1_name>.azuredatalakestore.net/<path>/<file_name>`。
> - Data Lake Storage Gen2 からデータをロードする場合、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスに `abfs://` または `abfss://` をプレフィックスとして含める必要があります。
>   - Data Lake Storage Gen2 が HTTP 経由でのみアクセスを許可している場合、プレフィックスとして `abfs://` を使用します。例: `abfs://<container>@<storage_account>.dfs.core.windows.net/<file_name>`。
>   - Data Lake Storage Gen2 が HTTPS 経由でのみアクセスを許可している場合、プレフィックスとして `abfss://` を使用します。例: `abfss://<container>@<storage_account>.dfs.core.windows.net/<file_name>`。

前述の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#microsoft-azure-storage)。

#### データのクエリ

HDFS クラスター、AWS S3 バケット、または Google GCS バケットからのデータロードが完了したら、SELECT ステートメントを使用して StarRocks テーブルのデータをクエリし、ロードが成功したことを確認できます。

1. `table1` のデータをクエリするには、次のステートメントを実行します。

   ```SQL
   MySQL [test_db]> SELECT * FROM table1;
   +------+-------+-------+
   | id   | name  | score |
   +------+-------+-------+
   |    1 | Lily  |    23 |
   |    2 | Rose  |    23 |
   |    3 | Alice |    24 |
   |    4 | Julia |    25 |
   +------+-------+-------+
   4 rows in set (0.00 sec)
   ```

2. `table2` のデータをクエリするには、次のステートメントを実行します。

   ```SQL
   MySQL [test_db]> SELECT * FROM table2;
   +------+--------+
   | id   | city   |
   +------+--------+
   | 200  | Beijing|
   +------+--------+
   4 rows in set (0.01 sec)
   ```

### 単一テーブルのロードジョブを作成する

指定されたパスから単一のデータファイルまたはすべてのデータファイルを単一の宛先テーブルにロードすることもできます。AWS S3 バケット `bucket_s3` に `input` という名前のフォルダーが含まれているとします。`input` フォルダーには複数のデータファイルが含まれており、そのうちの1つは `file1.csv` という名前です。これらのデータファイルは `table1` と同じ数の列で構成されており、これらの各データファイルの列は `table1` の列に順序通りに1対1でマッピングできます。

`file1.csv` を `table1` にロードするには、次のステートメントを実行します。

```SQL
LOAD LABEL test_db.label_7
(
    DATA INFILE("s3a://bucket_s3/input/file1.csv")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    FORMAT AS "CSV"
)
WITH BROKER 
(
    StorageCredentialParams
);
```

`input` フォルダーからすべてのデータファイルを `table1` にロードするには、次のステートメントを実行します。

```SQL
LOAD LABEL test_db.label_8
(
    DATA INFILE("s3a://bucket_s3/input/*")
    INTO TABLE table1
    COLUMNS TERMINATED BY ","
    FORMAT AS "CSV"
)
WITH BROKER 
(
    StorageCredentialParams
);
```

前述の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#aws-s3)。

### ロードジョブを表示する

Broker Load を使用すると、SHOW LOAD ステートメントまたは `curl` コマンドを使用してロードジョブを表示できます。

#### SHOW LOAD を使用する

詳細については、以下を参照してください。[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md)。

#### curl を使用する

構文は次のとおりです。

```Bash
curl --location-trusted -u <username>:<password> \
    'http://<fe_host>:<fe_http_port>/api/<database_name>/_load_info?label=<label_name>'
```

> **注**
>
> パスワードが設定されていないアカウントを使用する場合、`<username>:` のみを入力する必要があります。

たとえば、`test_db` データベースで、ラベルが `label1` のロードジョブに関する情報を表示するには、次のコマンドを実行します。

```Bash
curl --location-trusted -u <username>:<password> \
    'http://<fe_host>:<fe_http_port>/api/test_db/_load_info?label=label1'
```

`curl` コマンドは、指定されたラベルを持つ最も最近実行されたロードジョブに関する情報を JSON オブジェクト `jobInfo` として返します。

```JSON
{"jobInfo":{"dbName":"default_cluster:test_db","tblNames":["table1_simple"],"label":"label1","state":"FINISHED","failMsg":"","trackingUrl":""},"status":"OK","msg":"Success"}%
```

以下の表は、`jobInfo`のパラメータについて説明しています。

| **パラメータ**| **説明**|
| ------------- | ------------------------------------------------------------ |
| dbName        | データがロードされるデータベースの名前 |
| tblNames      | データがロードされるテーブルの名前 |
| label         | ロードジョブのラベル |
| state         | ロードジョブのステータス。有効な値:<ul><li>`PENDING`: ロードジョブはスケジュール待ちのキューに入っています。</li><li>`QUEUEING`: ロードジョブはスケジュール待ちのキューに入っています。</li><li>`LOADING`: ロードジョブが実行中です。</li><li>`PREPARED`: トランザクションがコミットされました。</li><li>`FINISHED`: ロードジョブが成功しました。</li><li>`CANCELLED`: ロードジョブが失敗しました。</li></ul>詳細については、「非同期ロード」セクションを参照してください。[ロードの概念](./loading_introduction/loading_concepts.md)。|
| failMsg       | ロードジョブが失敗した理由。ロードジョブの`state`の値が`PENDING`、`LOADING`、または`FINISHED`の場合、`failMsg`パラメータには`NULL`が返されます。ロードジョブの`state`の値が`CANCELLED`の場合、`failMsg`パラメータに返される値は、`type`と`msg`の2つの部分で構成されます。<ul><li>`type`の部分は、以下のいずれかの値になります。</li><ul><li>`USER_CANCEL`: ロードジョブは手動でキャンセルされました。</li><li>`ETL_SUBMIT_FAIL`: ロードジョブの送信に失敗しました。</li><li>`ETL-QUALITY-UNSATISFIED`: 不適格データの割合が`max-filter-ratio`パラメータの値を超えたため、ロードジョブが失敗しました。</li><li>`LOAD-RUN-FAIL`: ロードジョブは`LOADING`ステージで失敗しました。</li><li>`TIMEOUT`: ロードジョブは指定されたタイムアウト期間内に完了できませんでした。</li><li>`UNKNOWN`: 不明なエラーによりロードジョブが失敗しました。</li></ul><li>`msg`の部分は、ロード失敗の詳細な原因を提供します。</li></ul>。|
| trackingUrl   | ロードジョブで検出された不適格データにアクセスするために使用されるURL。`curl`または`wget`コマンドを使用してURLにアクセスし、不適格データを取得できます。不適格データが検出されない場合、`trackingUrl`パラメータには`NULL`が返されます。|
| status        | ロードジョブのHTTPリクエストのステータス。有効な値: `OK`および`Fail`。|
| msg           | ロードジョブのHTTPリクエストのエラー情報。|

### ロードジョブをキャンセルする

ロードジョブが**キャンセル済み**または**完了済み**ステージにない場合、[CANCEL LOAD](../sql-reference/sql-statements/loading_unloading/CANCEL_LOAD.md)ステートメントを使用してジョブをキャンセルできます。

例えば、データベース`test_db`内のラベルが`label1`であるロードジョブをキャンセルするには、以下のステートメントを実行します。

```SQL
CANCEL LOAD
FROM test_db
WHERE LABEL = "label";
```

## ジョブの分割と並行実行

Broker Loadジョブは、並行して実行される1つ以上のタスクに分割できます。ロードジョブ内のタスクは単一のトランザクション内で実行されます。それらはすべて成功するか、すべて失敗する必要があります。StarRocksは、`LOAD`ステートメントで`data_desc`をどのように宣言するかに基づいて、各ロードジョブを分割します。

- 複数の`data_desc`パラメータを宣言し、それぞれが異なるテーブルを指定する場合、各テーブルのデータをロードするためのタスクが生成されます。

- 複数の`data_desc`パラメータを宣言し、それぞれが同じテーブルの異なるパーティションを指定する場合、各パーティションのデータをロードするためのタスクが生成されます。

さらに、各タスクは1つ以上のインスタンスにさらに分割でき、それらはStarRocksクラスターのBEに均等に分散され、並行して実行されます。StarRocksは、以下の[FE構成](../administration/management/FE_configuration.md)に基づいて各タスクを分割します。

- `min_bytes_per_broker_scanner`: 各インスタンスによって処理されるデータの最小量。デフォルトの量は64 MBです。

- `load_parallel_instance_num`: 個々のBE上の各ロードジョブで許可される同時インスタンスの数。デフォルトの数は1です。

  個々のタスクにおけるインスタンスの数を計算するには、以下の式を使用できます。

  **個々のタスクにおけるインスタンスの数 = min(個々のタスクによってロードされるデータ量/`min_bytes_per_broker_scanner`,`load_parallel_instance_num` x BEの数)**

ほとんどの場合、各ロードジョブに対して1つの`data_desc`のみが宣言され、各ロードジョブは1つのタスクにのみ分割され、そのタスクはBEの数と同じ数のインスタンスに分割されます。

## 関連する構成項目

[FE構成項目](../administration/management/FE_configuration.md) `max_broker_load_job_concurrency` は、StarRocksクラスター内で同時に実行できるBroker Loadジョブの最大数を指定します。

StarRocks v2.4以前では、特定の期間内に送信されたBroker Loadジョブの総数が最大数を超えると、超過したジョブはキューに入れられ、送信時間に基づいてスケジュールされます。

StarRocks v2.5以降では、特定の期間内に送信されたBroker Loadジョブの総数が最大数を超えると、超過したジョブはキューに入れられ、優先度に基づいてスケジュールされます。ジョブ作成時に`priority`パラメーターを使用してジョブの優先度を指定できます。参照：[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#opt_properties)。また、[ALTER LOAD](../sql-reference/sql-statements/loading_unloading/ALTER_LOAD.md) を使用して、**QUEUEING** または **LOADING** 状態にある既存のジョブの優先度を変更できます。
