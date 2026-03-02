---
displayed_sidebar: docs
---

# HDFSのクラウドストレージにデータをロードする

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

StarRocksは、HDFSまたはクラウドストレージからStarRocksに大量のデータをロードするのに役立つ、MySQLベースのBroker Loadというロード方法を提供します。

Broker Loadは非同期ロードモードで実行されます。ロードジョブを送信すると、StarRocksは非同期でジョブを実行します。あなたは使用する必要があります[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md)ステートメント、または`curl`ジョブの結果を確認するコマンド。

Broker Loadは、単一テーブルロードと複数テーブルロードをサポートしています。1つのBroker Loadジョブを実行することで、1つまたは複数のデータファイルを1つまたは複数の宛先テーブルにロードできます。Broker Loadは、複数のデータファイルをロードするために実行される各ロードジョブのトランザクションアトミシティを保証します。アトミシティとは、1つのロードジョブにおける複数のデータファイルのロードが、すべて成功するか、すべて失敗するかのいずれかであることを意味します。一部のデータファイルのロードが成功し、他のファイルのロードが失敗するということは決してありません。

Broker Loadは、データロード時のデータ変換をサポートし、データロード中のUPSERTおよびDELETE操作によるデータ変更をサポートします。詳細については、以下を参照してください。[読み込み時にデータを変換](../loading/Etl_in_loading.md)と[読み込みによってデータを変更する](../loading/Load_to_Primary_Key_tables.md)。

<InsertPrivNote />

## 背景情報

v2.4以前では、StarRocksがBroker Loadジョブを実行する際、StarRocksクラスターと外部ストレージシステム間の接続を確立するためにブローカーに依存していました。そのため、入力する必要がありました`WITH BROKER "<broker_name>"`ロードステートメントで使用したいブローカーを指定します。これは「ブローカーベースのロード」と呼ばれます。ブローカーは、ファイルシステムインターフェースと統合された独立したステートレスなサービスです。ブローカーを使用すると、StarRocksは外部ストレージシステムに保存されているデータファイルにアクセスして読み取ることができ、独自のコンピューティングリソースを使用してこれらのデータファイルのデータを前処理およびロードできます。

v2.5以降、StarRocksはBroker Loadジョブを実行する際に、StarRocksクラスターと外部ストレージシステム間の接続を確立するためにブローカーに依存しなくなりました。そのため、ロードステートメントでブローカーを指定する必要はありませんが、まだ保持する必要があります。`WITH BROKER`キーワード。これは「ブローカーフリーローディング」と呼ばれます。

HDFSにデータが保存されている場合、ブローカーフリーローディングが機能しない状況に遭遇する可能性があります。これは、データが複数のHDFSクラスターにまたがって保存されている場合、または複数のKerberosユーザーを設定している場合に発生する可能性があります。これらの状況では、代わりにブローカーベースのローディングを使用することができます。これを成功させるには、少なくとも1つの独立したブローカーグループがデプロイされていることを確認してください。これらの状況で認証設定とHA設定を指定する方法については、以下を参照してください。[HDFS](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs)。

## サポートされているデータファイル形式

Broker Load は以下のデータファイル形式をサポートしています。

- CSV

- パルケ

- ORC

> **注**
>
> CSVデータについては、以下の点に注意してください。
>
> - テキスト区切り文字として、カンマ (,)、タブ、パイプ (|) などの UTF-8 文字列で、長さが 50 バイトを超えないものを使用できます。
> - ヌル値は、〜を用いて示されます。`\N`例えば、データファイルが3つの列で構成されており、そのデータファイル内のレコードが1列目と3列目にはデータを持つものの、2列目にはデータを持たないとします。このような状況では、〜を使用する必要があります。`\N`2列目でnull値を表す。これは、レコードが次のようにコンパイルされなければならないことを意味します。`a,\N,b`～の代わりに`a,,b`。`a,,b`は、レコードの2列目が空文字列であることを示します。

## 対応ストレージシステム

ブローカーロードは以下のストレージシステムをサポートしています。

- HDFS

- AWS S3

- Google GCS

- MinIOなどの他のS3互換ストレージシステム

- Microsoft Azure Storage

## 仕組み

FEにロードジョブを送信すると、FEはクエリプランを生成し、利用可能なBEの数とロードするデータファイルのサイズに基づいてクエリプランを分割し、各クエリプランのセクションを利用可能なBEに割り当てます。ロード中、関与する各BEは、HDFSまたはクラウドストレージシステムからデータファイルのデータをプルし、データを前処理し、StarRocksクラスターにデータをロードします。すべてのBEがクエリプランのセクションを完了した後、FEはロードジョブが成功したかどうかを判断します。

以下の図は、Broker Loadジョブのワークフローを示しています。

![Broker Loadのワークフロー](../_assets/broker_load_how-to-work_en.png)

## 基本的な操作

### 複数テーブルのロードジョブを作成する

このトピックでは、CSVを例として、複数のデータファイルを複数のテーブルにロードする方法について説明します。他のファイル形式でのデータのロード方法、およびBroker Loadの構文とパラメータの説明については、以下を参照してください。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md).

StarRocksでは、一部のリテラルがSQL言語によって予約キーワードとして使用されることに注意してください。これらのキーワードをSQLステートメントで直接使用しないでください。SQLステートメントでそのようなキーワードを使用したい場合は、バッククォート (`) で囲んでください。参照：[キーワード](../sql-reference/sql-statements/keywords.md).

#### データ例

1. ローカルファイルシステムにCSVファイルを作成します。

   a. という名前のCSVファイルを作成します。`file1.csv`。このファイルは、ユーザーID、ユーザー名、ユーザーのスコアを順に表す3つの列で構成されています。

   ```Plain
   1,Lily,23
   2,Rose,23
   3,Alice,24
   4,Julia,25
   ```

   b. という名前のCSVファイルを作成します。`file2.csv`。このファイルは、都市IDと都市名を順に表す2つの列で構成されています。

   ```Plain
   200,'Beijing'
   ```

2. StarRocksデータベースにStarRocksテーブルを作成します。`test_db`.

   > **注**
   >
   > v2.5.7以降、StarRocksはテーブルを作成またはパーティションを追加する際に、バケット数 (BUCKETS) を自動的に設定できるようになりました。手動でバケット数を設定する必要はなくなりました。詳細については、以下を参照してください。[バケット数を設定する](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets).

   a. という名前のプライマリキーテーブルを作成します。`table1`。このテーブルは、次の3つの列で構成されています。`id`、`name`、および`score`。そのうち`id`がプライマリキーです。

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

   b. という名前のプライマリキーテーブルを作成します。`table2`。このテーブルは、次の2つの列で構成されています。`id`と`city`。そのうち`id`がプライマリキーです。

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

3. をアップロードします。`file1.csv`と`file2.csv`を`/user/starrocks/`HDFSクラスターのパスに、`input`AWS S3バケットのフォルダーに`bucket_s3`, を`input` Google GCSバケットのフォルダー`bucket_gcs`, を`input` MinIOバケットのフォルダー`bucket_minio`, およびAzure Storageの指定されたパスにロードします。

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

次のステートメントを実行して、`file1.csv` と `file2.csv` を`input` Google GCSバケットのフォルダー`bucket_gcs` に `table1` と `table2` にそれぞれロードします。

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
> Broker Loadは、gsプロトコルにのみ従ってGoogle GCSへのアクセスをサポートしています。したがって、Google GCSからデータをロードする際は、`gs://` をファイルパスとして渡すGCS URIのプレフィックスとして含める必要があります。

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#google-gcs) を参照してください。

#### 他のS3互換ストレージシステムからデータをロードする

MinIOを例にとります。以下のステートメントを実行して、`file1.csv` と `file2.csv` を `input` MinIOバケットのフォルダーから `bucket_minio` に `table1` と `table2` にそれぞれロードできます。

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

以下のステートメントを実行して、`file1.csv` と `file2.csv` をAzure Storageの指定されたパスからロードします。

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
> Azure Storageからデータをロードする際は、使用するアクセスプロトコルと特定のストレージサービスに基づいて、どのプレフィックスを使用するかを決定する必要があります。上記の例では、Blob Storageを例としています。
>
> - Blob Storageからデータをロードする際は、`wasb://` または `wasbs://` を、ストレージアカウントへのアクセスに使用されるプロトコルに基づいてファイルパスのプレフィックスとして含める必要があります。
>   - Blob StorageがHTTP経由でのみアクセスを許可している場合は、`wasb://` をプレフィックスとして使用します。例: `wasb://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*`。
>   - Blob StorageがHTTPS経由でのみアクセスを許可している場合は、`wasbs://` をプレフィックスとして使用します。例: `wasbs://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*`
> - Data Lake Storage Gen1からデータをロードする際は、`adl://` をファイルパスのプレフィックスとして含める必要があります。例: `adl://<data_lake_storage_gen1_name>.azuredatalakestore.net/<path>/<file_name>`。
> - Data Lake Storage Gen2からデータをロードする際は、`abfs://`または`abfss://`を、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスのプレフィックスとして使用します。
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
| state         | ロードジョブのステータス。有効な値:**: ロードジョブはスケジュール待ちのキューに入っています。<ul><li>`PENDING`: ロードジョブはスケジュール待ちのキューに入っています。</li><li>`QUEUEING`: ロードジョブが実行中です。</li><li>`LOADING`: トランザクションがコミットされました。</li><li>`PREPARED`: ロードジョブが成功しました。</li><li>`FINISHED`: ロードジョブが失敗しました。</li><li>`CANCELLED`詳細については、「非同期ロード」セクションを </li></ul>ロードの概念[ で参照してください。 |](./loading_introduction/loading_concepts.md)| failMsg       | ロードジョブが失敗した理由。ロードジョブの `state` の値が `PENDING`、`LOADING`、または `FINISHED` の場合、`NULL` が `failMsg` パラメータに対して返されます。ロードジョブの `state` の値が `CANCELLED` の場合、`failMsg` パラメータに対して返される値は、`type` と `msg`。<ul><li>「`type`」の部分には、次のいずれかの値を指定できます。</li><ul><li>`USER_CANCEL`: ロードジョブは手動でキャンセルされました。</li><li>`ETL_SUBMIT_FAIL`: ロードジョブの送信に失敗しました。</li><li>`ETL-QUALITY-UNSATISFIED`: 不適格データの割合が「`max-filter-ratio`」パラメーターの値を超えたため、ロードジョブは失敗しました。</li><li>`LOAD-RUN-FAIL`: ロードジョブは「`LOADING`」ステージで失敗しました。</li><li>`TIMEOUT`: ロードジョブは指定されたタイムアウト期間内に完了しませんでした。</li><li>`UNKNOWN`: 不明なエラーによりロードジョブは失敗しました。</li></ul><li>「`msg`」の部分は、ロード失敗の詳細な原因を示します。</li></ul> |
| trackingUrl | ロードジョブで検出された不適格データにアクセスするために使用されるURLです。`curl`または`wget`コマンドを使用してURLにアクセスし、不適格データを取得できます。不適格データが検出されない場合、`NULL`が「`trackingUrl`」パラメーターに対して返されます。 |
| status | ロードジョブのHTTPリクエストのステータスです。有効な値:`OK`および`Fail`。 |
| msg | ロードジョブのHTTPリクエストのエラー情報。 |

### ロードジョブをキャンセルする

ロードジョブが「**CANCELLED**」または「**FINISHED**」ステージにない場合、[CANCEL LOAD](../sql-reference/sql-statements/loading_unloading/CANCEL_LOAD.md)ステートメントを使用してジョブをキャンセルできます。

たとえば、ラベルが「`label1`」で、データベースが「`test_db`」であるロードジョブをキャンセルするには、次のステートメントを実行します。

```SQL
CANCEL LOAD
FROM test_db
WHERE LABEL = "label";
```

## ジョブの分割と並行実行

Broker Loadジョブは、並行して実行される1つ以上のタスクに分割できます。ロードジョブ内のタスクは単一のトランザクション内で実行され、すべて成功するか、すべて失敗する必要があります。StarRocksは、各ロードジョブを、`data_desc`を`LOAD`ステートメントでどのように宣言するかによって分割します。

- 複数の`data_desc`パラメーターを宣言し、それぞれが異なるテーブルを指定する場合、各テーブルのデータをロードするためのタスクが生成されます。

- 複数の`data_desc`パラメーターを宣言し、それぞれが同じテーブルの異なるパーティションを指定する場合、各パーティションのデータをロードするためのタスクが生成されます。

さらに、各タスクは1つ以上のインスタンスにさらに分割でき、これらはStarRocksクラスターのBEに均等に分散され、並行して実行されます。StarRocksは、次の[FE構成](../administration/management/FE_configuration.md):

- `min_bytes_per_broker_scanner`：各インスタンスによって処理されるデータの最小量。デフォルト量は64MBです。

- `load_parallel_instance_num`：個々のBE上の各ロードジョブで許可される同時インスタンスの数。デフォルト数は1です。

  個々のタスクにおけるインスタンス数を計算するには、以下の式を使用できます。

  **個々のタスクにおけるインスタンス数 = min(個々のタスクによってロードされるデータ量/`min_bytes_per_broker_scanner`、`load_parallel_instance_num` x BEの数)**

ほとんどの場合、1つの`data_desc`が各ロードジョブに対して宣言され、各ロードジョブは1つのタスクにのみ分割され、そのタスクはBEの数と同じ数のインスタンスに分割されます。

## 関連する構成項目

「[FE構成項目](../administration/management/FE_configuration.md) `max_broker_load_job_concurrency`」は、StarRocksクラスター内で同時に実行できるBroker Loadジョブの最大数を指定します。

StarRocks v2.4以前では、特定の期間内に送信されたBroker Loadジョブの総数が最大数を超えると、超過したジョブはキューに入れられ、送信時間に基づいてスケジュールされます。

StarRocks v2.5以降では、特定の期間内に送信されたBroker Loadジョブの総数が最大数を超えると、超過したジョブはキューに入れられ、優先度に基づいてスケジュールされます。ジョブ作成時に`priority`パラメータを使用してジョブの優先度を指定できます。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#opt_properties)を参照してください。また、[ALTER LOAD](../sql-reference/sql-statements/loading_unloading/ALTER_LOAD.md)を使用して、**QUEUEING**または**LOADING**状態にある既存のジョブの優先度を変更することもできます。
