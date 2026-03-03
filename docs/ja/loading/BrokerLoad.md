---
displayed_sidebar: docs
---

# HDFSまたはクラウドストレージからデータをロードする

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

Broker Loadを使用すると、HDFSまたはクラウドストレージからStarRocksに大量のデータをロードできます。

Broker Loadは非同期ロードモードで実行されます。ロードジョブを送信すると、StarRocksは非同期でジョブを実行します。ジョブの結果を確認するには、[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md)ステートメントまたは`curl`コマンドを使用する必要があります。

Broker Loadは、単一テーブルロードと複数テーブルロードをサポートしています。1つのBroker Loadジョブを実行することで、1つまたは複数のデータファイルを1つまたは複数の宛先テーブルにロードできます。Broker Loadは、複数のデータファイルをロードするために実行される各ロードジョブのトランザクションアトミック性を保証します。アトミック性とは、1つのロードジョブ内の複数のデータファイルのロードがすべて成功するか、すべて失敗する必要があることを意味します。一部のデータファイルのロードが成功し、他のファイルのロードが失敗するということは決してありません。

Broker Loadは、データロード時のデータ変換をサポートし、データロード中のUPSERTおよびDELETE操作によるデータ変更をサポートします。詳細については、[ロード時のデータ変換](../loading/Etl_in_loading.md)および[ロードによるデータ変更](../loading/Load_to_Primary_Key_tables.md)を参照してください。

<InsertPrivNote />

## 背景情報

v2.4以前では、StarRocksはBroker Loadジョブを実行する際に、StarRocksクラスターと外部ストレージシステム間の接続を確立するためにブローカーに依存していました。そのため、ロードステートメントで使用するブローカーを指定するために、`WITH BROKER "<broker_name>"`を入力する必要があります。これは「ブローカーベースのロード」と呼ばれます。ブローカーは、ファイルシステムインターフェースと統合された独立したステートレスサービスです。ブローカーを使用すると、StarRocksは外部ストレージシステムに保存されているデータファイルにアクセスして読み取り、独自のコンピューティングリソースを使用してこれらのデータファイルのデータを前処理およびロードできます。

v2.5以降、StarRocksはBroker Loadジョブを実行する際に、StarRocksクラスターと外部ストレージシステム間の接続を確立するためにブローカーに依存しなくなりました。そのため、ロードステートメントでブローカーを指定する必要はなくなりましたが、`WITH BROKER`キーワードは保持する必要があります。これは「ブローカーフリーのロード」と呼ばれます。

データがHDFSに保存されている場合、ブローカーフリーのロードが機能しない状況に遭遇することがあります。これは、データが複数のHDFSクラスターにまたがって保存されている場合や、複数のKerberosユーザーを構成している場合に発生する可能性があります。このような状況では、代わりにブローカーベースのロードを使用することができます。これを成功させるには、少なくとも1つの独立したブローカーグループがデプロイされていることを確認してください。これらの状況での認証構成とHA構成の指定方法については、[HDFS](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs)を参照してください。

## サポートされているデータファイル形式

Broker Loadは、以下のデータファイル形式をサポートしています。

- CSV

- Parquet

- ORC

> **注**
>
> CSVデータについては、以下の点に注意してください。
>
> - カンマ (,)、タブ、パイプ (|) など、長さが50バイトを超えないUTF-8文字列をテキスト区切り文字として使用できます。
> - NULL値は`\N`を使用して示されます。たとえば、データファイルが3つの列で構成されており、そのデータファイルからのレコードが最初の列と3番目の列にデータを含み、2番目の列にはデータを含まない場合を考えます。この状況では、2番目の列にNULL値を示すために`\N`を使用する必要があります。これは、レコードが`a,\N,b`ではなく`a,,b`としてコンパイルされる必要があることを意味します。`a,,b`は、レコードの2番目の列が空の文字列を保持していることを示します。

## サポートされているストレージシステム

Broker Loadは、以下のストレージシステムをサポートしています。

- HDFS

- AWS S3

- Google GCS

- MinIOなどのS3互換ストレージシステム

- Microsoft Azure Storage

## 仕組み

FEにロードジョブを送信すると、FEはクエリプランを生成し、利用可能なBEの数とロードしたいデータファイルのサイズに基づいてクエリプランを分割し、各部分を利用可能なBEに割り当てます。ロード中、関与する各BEは、HDFSまたはクラウドストレージシステムからデータファイルのデータをプルし、データを前処理し、StarRocksクラスターにデータをロードします。すべてのBEがクエリプランの担当部分を完了すると、FEはロードジョブが成功したかどうかを判断します。

次の図は、Broker Loadジョブのワークフローを示しています。

![Broker Loadのワークフロー](../_assets/broker_load_how-to-work_en.png)

## 基本的な操作

### 複数テーブルのロードジョブを作成する

このトピックでは、CSVを例として、複数のデータファイルを複数のテーブルにロードする方法について説明します。他のファイル形式でデータをロードする方法、およびBroker Loadの構文とパラメータの説明については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

StarRocksでは、一部のリテラルがSQL言語の予約済みキーワードとして使用されることに注意してください。これらのキーワードをSQLステートメントで直接使用しないでください。SQLステートメントでそのようなキーワードを使用したい場合は、バッククォート (`) で囲んでください。参照：[キーワード](../sql-reference/sql-statements/keywords.md)。

#### データ例

1. ローカルファイルシステムにCSVファイルを作成します。

   a. という名前のCSVファイルを作成します。`file1.csv`。このファイルは3つの列で構成されており、それぞれユーザーID、ユーザー名、ユーザーのスコアを順番に表しています。

   ```Plain
   1,Lily,23
   2,Rose,23
   3,Alice,24
   4,Julia,25
   ```

   b. という名前のCSVファイルを作成します。`file2.csv`。このファイルは2つの列で構成されており、それぞれ都市IDと都市名を順番に表しています。

   ```Plain
   200,'Beijing'
   ```

2. StarRocksデータベースにStarRocksテーブルを作成します。`test_db`。

   > **注**
   >
   > v2.5.7以降、StarRocksはテーブルを作成したりパーティションを追加したりする際に、バケット数 (BUCKETS) を自動的に設定できます。手動でバケット数を設定する必要はなくなりました。詳細については、以下を参照してください。[バケット数を設定する](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets)。

   a. という名前のPrimary Keyテーブルを作成します。`table1`。このテーブルは3つの列で構成されています：`id`、`name`、および`score`。そのうち`id`がプライマリキーです。

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

   b. という名前のPrimary Keyテーブルを作成します。`table2`。このテーブルは2つの列で構成されています：`id`および`city`。そのうち`id`がプライマリキーです。

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

3. アップロード`file1.csv`と`file2.csv`を`/user/starrocks/`HDFSクラスターのパスに、`input`AWS S3バケットのフォルダーに`bucket_s3`, を`input` Google GCSバケットのフォルダー`bucket_gcs`, を`input` MinIOバケットのフォルダー`bucket_minio`, およびAzure Storageの指定されたパスにロードします。

#### HDFSからデータをロードする

次のステートメントを実行して、`file1.csv` と `file2.csv` を`/user/starrocks` HDFSクラスターのパスから`table1` と `table2` にそれぞれロードします。

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

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs)を参照してください。

#### AWS S3からデータをロードする

次のステートメントを実行して、`file1.csv` と `file2.csv` を`input` AWS S3バケットのフォルダー`bucket_s3` から`table1` と `table2` にそれぞれロードします。

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
> Broker LoadはS3Aプロトコルにのみ従ってAWS S3へのアクセスをサポートします。したがって、AWS S3からデータをロードする場合、`s3://` をファイルパスとして渡すS3 URIの`s3a://` に置き換える必要があります。

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメーターのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#aws-s3)を参照してください。

v3.1以降、StarRocksはINSERTコマンドとTABLEキーワードを使用して、Parquet形式またはORC形式のファイルをAWS S3から直接ロードすることをサポートしており、最初に外部テーブルを作成する手間を省きます。詳細については、[INSERTを使用したデータのロード > TABLEキーワードを使用して外部ソースのファイルからデータを直接挿入する](../loading/InsertInto.md#insert-data-directly-from-files-in-an-external-source-using-files)を参照してください。

#### Google GCSからデータをロードする

次のステートメントを実行して、`file1.csv` と `file2.csv` を`input` Google GCSバケットのフォルダー`bucket_gcs` に`table1` と`table2` にそれぞれロードします。

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

> **注記**
>
> Broker Loadは、gsプロトコルに従ってのみGoogle GCSへのアクセスをサポートしています。したがって、Google GCSからデータをロードする場合、ファイルパスとして渡すGCS URIに`gs://` をプレフィックスとして含める必要があります。

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#google-gcs) を参照してください。

#### その他のS3互換ストレージシステムからデータをロードする

MinIOを例にとります。以下のステートメントを実行して、MinIOバケットの`file1.csv` と`file2.csv` を、`input` フォルダから`bucket_minio` と`table1` にそれぞれロードできます。`table2` にそれぞれロードします。

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

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#other-s3-compatible-storage-system) を参照してください。

#### Microsoft Azure Storageからデータをロードする

以下のステートメントを実行して、Azure Storageの指定されたパスから`file1.csv` と`file2.csv` をロードします。

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
> Azure Storageからデータをロードする場合、使用するアクセスプロトコルと特定のストレージサービスに基づいて、どのプレフィックスを使用するかを決定する必要があります。上記の例では、Blob Storageを例としています。
>
> - Blob Storageからデータをロードする場合、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスに`wasb://` または`wasbs://` をプレフィックスとして含める必要があります。
>   - Blob StorageがHTTP経由でのみアクセスを許可している場合、プレフィックスとして`wasb://` を使用します（例：`wasb://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*`）。
>   - Blob StorageがHTTPS経由でのみアクセスを許可している場合、プレフィックスとして`wasbs://` を使用します（例：`wasbs://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*`
> - ）。Data Lake Storage Gen1からデータをロードする場合、ファイルパスに`adl://` をプレフィックスとして含める必要があります（例：`adl://<data_lake_storage_gen1_name>.azuredatalakestore.net/<path>/<file_name>`）。
> - Data Lake Storage Gen2からデータをロードする場合、`abfs://`または`abfss://`を、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスのプレフィックスとして使用します。
>   - Data Lake Storage Gen2がHTTP経由でのみアクセスを許可している場合、`abfs://`をプレフィックスとして使用します。例：`abfs://<container>@<storage_account>.dfs.core.windows.net/<file_name>`。
>   - Data Lake Storage Gen2がHTTPS経由でのみアクセスを許可している場合、`abfss://`をプレフィックスとして使用します。例：`abfss://<container>@<storage_account>.dfs.core.windows.net/<file_name>`。

上記の例では、`StorageCredentialParams`は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#microsoft-azure-storage)を参照してください。

#### データのクエリ

HDFSクラスター、AWS S3バケット、またはGoogle GCSバケットからのデータロードが完了した後、SELECTステートメントを使用してStarRocksテーブルのデータをクエリし、ロードが成功したことを確認できます。

1. 以下のステートメントを実行して、`table1`のデータをクエリします。

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

2. 以下のステートメントを実行して、`table2`のデータをクエリします。

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

単一のデータファイル、または指定されたパスからすべてのデータファイルを単一の宛先テーブルにロードすることもできます。AWS S3バケット`bucket_s3`に`input`という名前のフォルダーが含まれているとします。`input`フォルダーには複数のデータファイルが含まれており、そのうちの1つは`file1.csv`という名前です。これらのデータファイルは、`table1`と同じ数の列で構成されており、これらの各データファイルの列は、`table1`の列に順番に1対1でマッピングできます。

を`file1.csv`にロードするには、`table1`以下のステートメントを実行します。

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

フォルダーからすべてのデータファイルを`input`にロードするには、`table1`以下のステートメントを実行します。

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

上記の例では、`StorageCredentialParams`は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#aws-s3)を参照してください。

### ロードジョブを表示する

Broker Loadでは、SHOW LOADステートメントまたは`curl`コマンドを使用してロードジョブを表示できます。

#### SHOW LOADを使用する

詳細については、以下を参照してください。 [SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md)。

#### curlを使用する

構文は次のとおりです。

```Bash
curl --location-trusted -u <username>:<password> \
    'http://<fe_host>:<fe_http_port>/api/<database_name>/_load_info?label=<label_name>'
```

> **注**
>
> パスワードが設定されていないアカウントを使用する場合、入力する必要があるのは `<username>:`。

たとえば、次のコマンドを実行して、ラベルが `label1` であるロードジョブの情報を `test_db` データベースで表示できます。

```Bash
curl --location-trusted -u <username>:<password> \
    'http://<fe_host>:<fe_http_port>/api/test_db/_load_info?label=label1'
```

「`curl`」コマンドは、指定されたラベルを持つ最も最近実行されたロードジョブの情報をJSONオブジェクトとして返します。 `jobInfo`:

```JSON
{"jobInfo":{"dbName":"default_cluster:test_db","tblNames":["table1_simple"],"label":"label1","state":"FINISHED","failMsg":"","trackingUrl":""},"status":"OK","msg":"Success"}%
```

次の表は、`jobInfo` のパラメータについて説明しています。

| **パラメータ** | **説明                                              |
| ------------- | ------------------------------------------------------------ |
| dbName        | データがロードされるデータベースの名前                       |
| tblNames      | データがロードされるテーブルの名前                           |
| label         | ロードジョブのラベル                                         |
| state         | ロードジョブのステータス。有効な値:**: ロードジョブはスケジュール待ちのキューに入っています。<ul><li>`PENDING`: ロードジョブはスケジュール待ちのキューに入っています。</li><li>`QUEUEING`: ロードジョブが実行中です。</li><li>`LOADING`: トランザクションがコミットされました。</li><li>`PREPARED`: ロードジョブが成功しました。</li><li>`FINISHED`: ロードジョブが失敗しました。</li><li>`CANCELLED`詳細については、「非同期ロード」セクションを </li></ul>ロードの概念[ で参照してください。 |](./loading_introduction/loading_concepts.md)| failMsg       | ロードジョブが失敗した理由。ロードジョブの `state` の値が `PENDING`、`LOADING`、または `FINISHED` の場合、`NULL` が `failMsg` パラメータに対して返されます。ロードジョブの `state` の値が `CANCELLED` の場合、`failMsg` パラメータに対して返される値は、`type` と `msg`。<ul><li>「`type`」の部分には、以下のいずれかの値が入ります。</li><ul><li>`USER_CANCEL`: ロードジョブは手動でキャンセルされました。</li><li>`ETL_SUBMIT_FAIL`: ロードジョブの送信に失敗しました。</li><li>`ETL-QUALITY-UNSATISFIED`: 不適格データの割合が「`max-filter-ratio`」パラメーターの値を超えたため、ロードジョブが失敗しました。</li><li>`LOAD-RUN-FAIL`: ロードジョブは「`LOADING`」ステージで失敗しました。</li><li>`TIMEOUT`: ロードジョブは指定されたタイムアウト期間内に完了できませんでした。</li><li>`UNKNOWN`: 不明なエラーによりロードジョブが失敗しました。</li></ul><li>「`msg`」の部分は、ロード失敗の詳細な原因を示します。</li></ul>| trackingUrl | ロードジョブで検出された不適格データにアクセスするために使用されるURL。 「`curl`」または「`wget`」コマンドを使用してURLにアクセスし、不適格データを取得できます。不適格データが検出されない場合、「`NULL`」が「`trackingUrl`」パラメーターに対して返されます。|
| status | ロードジョブのHTTPリクエストのステータス。有効な値: 「`OK`」と「`Fail`」。|
| msg | ロードジョブのHTTPリクエストのエラー情報。|

### ロードジョブをキャンセルする

ロードジョブが「**CANCELLED**」または「**FINISHED**」ステージにない場合、「[CANCEL LOAD](../sql-reference/sql-statements/loading_unloading/CANCEL_LOAD.md)」ステートメントを使用してジョブをキャンセルできます。

例えば、データベース「`label1`」で、ラベルが「`test_db`」のロードジョブをキャンセルするには、以下のステートメントを実行します。

```SQL
CANCEL LOAD
FROM test_db
WHERE LABEL = "label";
```

## ジョブの分割と並行実行

Broker Loadジョブは、1つ以上のタスクに分割され、並行して実行できます。ロードジョブ内のタスクは単一のトランザクション内で実行されます。それらはすべて成功するか、すべて失敗する必要があります。StarRocksは、「`data_desc`」ステートメントで「`LOAD`」を宣言する方法に基づいて、各ロードジョブを分割します。

- 複数の「`data_desc`」パラメーターを宣言し、それぞれが異なるテーブルを指定する場合、各テーブルのデータをロードするためのタスクが生成されます。

- 複数の「`data_desc`」パラメーターを宣言し、それぞれが同じテーブルの異なるパーティションを指定する場合、各パーティションのデータをロードするためのタスクが生成されます。

さらに、各タスクは1つ以上のインスタンスに分割され、StarRocksクラスターのBEに均等に分散され、並行して実行されます。StarRocksは、以下の「」に基づいて各タスクを分割します。[FE構成](../administration/management/FE_configuration.md):

- `min_bytes_per_broker_scanner`：各インスタンスによって処理されるデータの最小量。デフォルト量は64MBです。

- `load_parallel_instance_num`：個々のBE上の各ロードジョブで許可される同時インスタンスの数。デフォルト数は1です。

  個々のタスクにおけるインスタンス数を計算するには、以下の式を使用できます。

  **個々のタスクにおけるインスタンス数 = min(個々のタスクによってロードされるデータ量/`min_bytes_per_broker_scanner`、`load_parallel_instance_num` x BEの数)**

ほとんどの場合、1つの`data_desc`が各ロードジョブに対して宣言され、各ロードジョブは1つのタスクにのみ分割され、そのタスクはBEの数と同じ数のインスタンスに分割されます。

## 関連する構成項目

「[FE構成項目](../administration/management/FE_configuration.md) `max_broker_load_job_concurrency`」は、StarRocksクラスター内で同時に実行できるBroker Loadジョブの最大数を指定します。

StarRocks v2.4以前では、特定の期間内に送信されたBroker Loadジョブの総数が最大数を超えると、超過したジョブはキューに入れられ、送信時間に基づいてスケジュールされます。

StarRocks v2.5以降では、特定の期間内に送信されたBroker Loadジョブの総数が最大数を超えると、超過したジョブはキューに入れられ、優先度に基づいてスケジュールされます。ジョブ作成時に`priority`パラメータを使用してジョブの優先度を指定できます。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#opt_properties)を参照してください。また、[ALTER LOAD](../sql-reference/sql-statements/loading_unloading/ALTER_LOAD.md)を使用して、**QUEUEING**または**LOADING**状態にある既存のジョブの優先度を変更することもできます。
