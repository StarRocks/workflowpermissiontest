---
displayed_sidebar: docs
---

# オブジェクトストレージまたは HDFS からのデータロード

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

StarRocks は、MySQL ベースの Broker Load というロード方法を提供しており、大量のデータを HDFS やクラウドストレージから StarRocks にロードするのに役立ちます。

Broker Load は非同期ロードモードで実行されます。ロード編集を送信すると、StarRocks はジョブを非同期的に実行します。[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md) ステートメントまたは `curl` コマンドを使用して、ジョブの結果を確認する必要があります。

Broker Load は、シングルテーブルロードとマルチテーブルロードをサポートしています。1 つの Broker Load ジョブを実行して、1 つまたは複数のデータファイルを 1 つまたは複数の宛先テーブルにロードできます。Broker Load は、複数のデータファイルをロードするために実行される各ロードジョブのトランザクションの原子性を保証します。原子性とは、1 つのロードジョブで複数のデータファイルのロードがすべて成功するか、すべて失敗する必要があることを意味します。一部のデータファイルのロードが成功し、他のファイルのロードが失敗するということは決して起こりません。

Broker Load は、データロード時のデータ変換をサポートし、データロード中の UPSERT および DELETE 操作によるデータ変更をサポートします。詳細については、[ロード時のデータ変換](../loading/Etl_in_loading.md) および [ロードによるデータ変更](../loading/Load_to_Primary_Key_tables.md) を参照してください。

<InsertPrivNote />

## 背景情報

v2.4 以前では、StarRocks は Broker Load ジョブを実行する際に、StarRocks クラスタと外部ストレージシステム間の接続を確立するために broker に依存していました。したがって、ロードステートメントで使用する broker を指定するには、`WITH BROKER "<broker_name>"` を入力する必要があります。これは「broker ベースのロード」と呼ばれます。broker は、ファイルシステムインターフェースと統合された、独立したステートレスサービスです。broker を使用すると、StarRocks は外部ストレージシステムに保存されているデータファイルにアクセスして読み取ることができ、独自のコンピューティングリソースを使用して、これらのデータファイルのデータを前処理およびロードできます。

v2.5 以降、StarRocks は Broker Load ジョブを実行する際に、StarRocks クラスタと外部ストレージシステム間の接続を確立するために broker に依存しなくなりました。したがって、ロードステートメントで broker を指定する必要はなくなりましたが、`WITH BROKER` キーワードは保持する必要があります。これは「broker フリーロード」と呼ばれます。

データが HDFS に保存されている場合、broker フリーロードが機能しない状況が発生する可能性があります。これは、データが複数の HDFS クラスタに保存されている場合、または複数の Kerberos ユーザーを設定している場合に発生する可能性があります。このような場合は、代わりに broker ベースのロードを使用することができます。これを正常に行うには、少なくとも 1 つの独立した broker グループがデプロイされていることを確認してください。このような状況で認証構成と HA 構成を指定する方法については、[HDFS](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs) を参照してください。

## サポートされているデータファイル形式

Broker Load は、次のデータファイル形式をサポートしています。

- CSV

- Parquet

- ORC

> **NOTE**
>
> CSV データの場合、次の点に注意してください。
>
> - コンマ (,)、タブ、パイプ (|) などの UTF-8 文字列を、長さが 50 バイトを超えないテキスト区切り文字として使用できます。
> - Null 値は、`\N` を使用して示されます。たとえば、データファイルが 3 つの列で構成されており、そのデータファイルのレコードが 1 列目と 3 列目にデータを保持し、2 列目にデータがないとします。この場合、2 列目に `\N` を使用して Null 値を示す必要があります。つまり、レコードは `a,,b` ではなく `a,\N,b` としてコンパイルする必要があります。`a,,b` は、レコードの 2 列目が空の文字列を保持していることを示します。

## サポートされているストレージシステム

Broker Load は、次のストレージシステムをサポートしています。

- HDFS

- AWS S3

- Google GCS

- MinIO などの他の S3 互換ストレージシステム

- Microsoft Azure Storage

## 仕組み

ロードジョブを FE に送信すると、FE はクエリプランを生成し、使用可能な BE の数とロードするデータファイルのサイズに基づいてクエリプランを分割し、クエリプランの各部分を使用可能な BE に割り当てます。ロード中、関係する各 BE は、HDFS またはクラウドストレージシステムからデータファイルのデータをプルし、データを前処理してから、データを StarRocks クラスタにロードします。すべての BE がクエリプランの部分を完了すると、FE はロードジョブが成功したかどうかを判断します。

次の図は、Broker Load ジョブのワークフローを示しています。

![Broker Load のワークフロー](../_assets/broker_load_how-to-work_en.png)

## 基本操作

### マルチテーブルロードジョブの作成

このトピックでは、CSV を例として使用して、複数のデータファイルを複数のテーブルにロードする方法について説明します。他のファイル形式でデータをロードする方法、および Broker Load の構文とパラメータの説明については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

StarRocks では、一部のリテラルが SQL 言語によって予約語として使用されていることに注意してください。これらのキーワードを SQL ステートメントで直接使用しないでください。このようなキーワードを SQL ステートメントで使用する場合は、バッククォート (` `) で囲んでください。[キーワード](../sql-reference/sql-statements/keywords.md) を参照してください。

#### データ例

1. ローカルファイルシステムに CSV ファイルを作成します。

   a. `file1.csv` という名前の CSV ファイルを作成します。ファイルは、ユーザー ID、ユーザー名、ユーザーのスコアを順番に表す 3 つの列で構成されています。

      ```Plain
      1,Lily,23
      2,Rose,23
      3,Alice,24
      4,Julia,25
      ```

   b. `file2.csv` という名前の CSV ファイルを作成します。ファイルは、都市 ID と都市名を順番に表す 2 つの列で構成されています。

      ```Plain
      200,'Beijing'
      ```

2. StarRocks データベース `test_db` に StarRocks テーブルを作成します。

   > **NOTE**
   >
   > v2.5.7 以降、StarRocks はテーブルの作成時またはパーティションの追加時に、バケット数 (BUCKETS) を自動的に設定できます。バケット数を手動で設定する必要はなくなりました。詳細については、[バケット数の設定](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets) を参照してください。

   a. `table1` という名前の主キーテーブルを作成します。テーブルは、`id`、`name`、`score` の 3 つの列で構成されており、`id` が主キーです。

      ```SQL
      CREATE TABLE `table1`
      (
          `id` int(11) NOT NULL COMMENT "ユーザー ID",
          `name` varchar(65533) NULL DEFAULT "" COMMENT "ユーザー名",
          `score` int(11) NOT NULL DEFAULT "0" COMMENT "ユーザーのスコア"
      )
      ENGINE=OLAP
      PRIMARY KEY(`id`)
      DISTRIBUTED BY HASH(`id`);
      ```

   b. `table2` という名前の主キーテーブルを作成します。テーブルは、`id` と `city` の 2 つの列で構成されており、`id` が主キーです。

      ```SQL
      CREATE TABLE `table2`
      (
          `id` int(11) NOT NULL COMMENT "都市 ID",
          `city` varchar(65533) NULL DEFAULT "" COMMENT "都市名"
      )
      ENGINE=OLAP
      PRIMARY KEY(`id`)
      DISTRIBUTED BY HASH(`id`);
      ```

3. `file1.csv` と `file2.csv` を、HDFS クラスタの `/user/starrocks/` パス、AWS S3 バケット `bucket_s3` の `input` フォルダ、Google GCS バケット `bucket_gcs` の `input` フォルダ、MinIO バケット `bucket_minio` の `input` フォルダ、および Azure Storage の指定されたパスにアップロードします。

#### HDFS からのデータロード

HDFS クラスタの `/user/starrocks` パスから `file1.csv` と `file2.csv` をそれぞれ `table1` と `table2` にロードするには、次のステートメントを実行します。

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

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs) を参照してください。

#### AWS S3 からのデータロード

AWS S3 バケット `bucket_s3` の `input` フォルダから `file1.csv` と `file2.csv` をそれぞれ `table1` と `table2` にロードするには、次のステートメントを実行します。

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

> **NOTE**
>
> Broker Load は、S3A プロトコルに従ってのみ AWS S3 へのアクセスをサポートしています。したがって、AWS S3 からデータをロードする場合は、ファイルパスとして渡す S3 URI の `s3://` を `s3a://` に置き換える必要があります。

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#aws-s3) を参照してください。

v3.1 以降、StarRocks は INSERT コマンドと TABLE キーワードを使用して、Parquet 形式または ORC 形式のファイルのデータを AWS S3 から直接ロードすることをサポートしており、最初に外部テーブルを作成する手間を省くことができます。詳細については、[INSERT を使用したデータロード > TABLE キーワードを使用して外部ソースのファイルから直接データを挿入する](../loading/InsertInto.md#insert-data-directly-from-files-in-an-external-source-using-files) を参照してください。

#### Google GCS からのデータロード

Google GCS バケット `bucket_gcs` の `input` フォルダから `file1.csv` と `file2.csv` をそれぞれ `table1` と `table2` にロードするには、次のステートメントを実行します。

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

> **NOTE**
>
> Broker Load は、gs プロトコルに従ってのみ Google GCS へのアクセスをサポートしています。したがって、Google GCS からデータをロードする場合は、ファイルパスとして渡す GCS URI にプレフィックスとして `gs://` を含める必要があります。

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#google-gcs) を参照してください。

#### 他の S3 互換ストレージシステムからのデータロード

MinIO を例として使用します。次のステートメントを実行して、MinIO バケット `bucket_minio` の `input` フォルダから `file1.csv` と `file2.csv` をそれぞれ `table1` と `table2` にロードできます。

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

#### Microsoft Azure Storage からのデータロード

次のステートメントを実行して、Azure Storage の指定されたパスから `file1.csv` と `file2.csv` をロードします。

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

> **NOTICE**
  >
  > Azure Storage からデータをロードする場合は、使用するアクセスプロトコルと特定のストレージサービスに基づいて、使用するプレフィックスを決定する必要があります。上記の例では、Blob Storage を例として使用しています。
  >
  > - Blob Storage からデータをロードする場合は、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスにプレフィックスとして `wasb://` または `wasbs://` を含める必要があります。
  >   - Blob Storage が HTTP 経由でのみアクセスを許可する場合は、プレフィックスとして `wasb://` を使用します。たとえば、`wasb://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*` のようにします。
  >   - Blob Storage が HTTPS 経由でのみアクセスを許可する場合は、プレフィックスとして `wasbs://` を使用します。たとえば、`wasbs://<container>@<storage_account>.blob.core.windows.net/<path>/<file_name>/*` のようにします。
  > - Data Lake Storage Gen1 からデータをロードする場合は、ファイルパスにプレフィックスとして `adl://` を含める必要があります。たとえば、`adl://<data_lake_storage_gen1_name>.azuredatalakestore.net/<path>/<file_name>` のようにします。
  > - Data Lake Storage Gen2 からデータをロードする場合は、ストレージアカウントへのアクセスに使用されるプロトコルに基づいて、ファイルパスにプレフィックスとして `abfs://` または `abfss://` を含める必要があります。
  >   - Data Lake Storage Gen2 が HTTP 経由でのみアクセスを許可する場合は、プレフィックスとして `abfs://` を使用します。たとえば、`abfs://<container>@<storage_account>.dfs.core.windows.net/<file_name>` のようにします。
  >   - Data Lake Storage Gen2 が HTTPS 経由でのみアクセスを許可する場合は、プレフィックスとして `abfss://` を使用します。たとえば、`abfss://<container>@<storage_account>.dfs.core.windows.net/<file_name>` のようにします。

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#microsoft-azure-storage) を参照してください。

#### データクエリ

HDFS クラスタ、AWS S3 バケット、または Google GCS バケットからのデータのロードが完了したら、SELECT ステートメントを使用して StarRocks テーブルのデータをクエリし、ロードが成功したことを確認できます。

1. 次のステートメントを実行して、`table1` のデータをクエリします。

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

2. 次のステートメントを実行して、`table2` のデータをクエリします。

   ```SQL
   MySQL [test_db]> SELECT * FROM table2;
   +------+--------+
   | id   | city   |
   +------+--------+
   | 200  | Beijing|
   +------+--------+
   4 rows in set (0.01 sec)
   ```

### シングルテーブルロードジョブの作成

単一のデータファイル、または指定されたパスからのすべてのデータファイルを、単一の宛先テーブルにロードすることもできます。AWS S3 バケット `bucket_s3` に `input` という名前のフォルダが含まれているとします。`input` フォルダには複数のデータファイルが含まれており、そのうちの 1 つは `file1.csv` という名前です。これらのデータファイルは `table1` と同じ数の列で構成されており、これらの各データファイルの列は、`table1` の列に順番に 1 対 1 でマッピングできます。

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

`input` フォルダからすべてのデータファイルを `table1` にロードするには、次のステートメントを実行します。

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

上記の例では、`StorageCredentialParams` は、選択した認証方法によって異なる認証パラメータのグループを表します。詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#aws-s3) を参照してください。

### ロードジョブの表示

Broker Load では、SHOW LOAD ステートメントまたは `curl` コマンドを使用して、lob ジョブを表示できます。

#### SHOW LOAD の使用

詳細については、[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md) を参照してください。

#### curl の使用

構文は次のとおりです。

```Bash
curl --location-trusted -u <username>:<password> \
    'http://<fe_host>:<fe_http_port>/api/<database_name>/_load_info?label=<label_name>'
```

> **NOTE**
>
> パスワードが設定されていないアカウントを使用する場合は、`<username>:` のみを入力する必要があります。

たとえば、次のコマンドを実行して、`test_db` データベースでラベルが `label1` のロードジョブに関する情報を表示できます。

```Bash
curl --location-trusted -u <username>:<password> \
    'http://<fe_host>:<fe_http_port>/api/test_db/_load_info?label=label1'
```

`curl` コマンドは、指定されたラベルを持つ最後に実行されたロードジョブに関する情報を JSON オブジェクト `jobInfo` として返します。

```JSON
{"jobInfo":{"dbName":"default_cluster:test_db","tblNames":["table1_simple"],"label":"label1","state":"FINISHED","failMsg":"","trackingUrl":""},"status":"OK","msg":"Success"}%
```

次の表では、`jobInfo` のパラメータについて説明します。

| **パラメータ** | **説明**                                                     |
| ------------- | ------------------------------------------------------------ |
| dbName        | データのロード先のデータベースの名前                         |
| tblNames      | データのロード先のテーブルの名前。                           |
| label         | ロードジョブのラベル。                                       |
| state         | ロードジョブのステータス。有効な値:<ul><li>`PENDING`: ロードジョブは、スケジュールされるのを待機しているキューにあります。</li><li>`QUEUEING`: ロードジョブは、スケジュールされるのを待機しているキューにあります。</li><li>`LOADING`: ロードジョブが実行中です。</li><li>`PREPARED`: トランザクションがコミットされました。</li><li>`FINISHED`: ロードジョブが成功しました。</li><li>`CANCELLED`: ロードジョブが失敗しました。</li></ul>詳細については、[ロードの概念](./loading_introduction/loading_concepts.md) の「非同期ロード」セクションを参照してください。 |
| failMsg       | ロードジョブが失敗した理由。ロードジョブの `state` 値が `PENDING`、`LOADING`、または `FINISHED` の場合、`failMsg` パラメータには `NULL` が返されます。ロードジョブの `state` 値が `CANCELLED` の場合、`failMsg` パラメータに返される値は、`type` と `msg` の 2 つの部分で構成されます。<ul><li>`type` 部分には、次のいずれかの値を指定できます。</li><ul><li>`USER_CANCEL`: ロードジョブは手動でキャンセルされました。</li><li>`ETL_SUBMIT_FAIL`: ロードジョブの送信に失敗しました。</li><li>`ETL-QUALITY-UNSATISFIED`: 不適格なデータの割合が `max-filter-ratio` パラメータの値を超えたため、ロードジョブが失敗しました。</li><li>`LOAD-RUN-FAIL`: ロードジョブが `LOADING` ステージで失敗しました。</li><li>`TIMEOUT`: ロードジョブが指定されたタイムアウト期間内に完了しなかったため、失敗しました。</li><li>`UNKNOWN`: 不明なエラーが原因でロードジョブが失敗しました。</li></ul><li>`msg` 部分には、ロードの失敗の詳しい原因が記載されています。</li></ul> |
| trackingUrl   | ロードジョブで検出された不適格なデータにアクセスするために使用される URL。`curl` または `wget` コマンドを使用して URL にアクセスし、不適格なデータを取得できます。不適格なデータが検出されない場合、`trackingUrl` パラメータには `NULL` が返されます。 |
| status        | ロードジョブに対する HTTP リクエストのステータス。有効な値: `OK` と `Fail`。 |
| msg           | ロードジョブに対する HTTP リクエストのエラー情報。            |

### ロードジョブのキャンセル

ロードジョブが **CANCELLED** または **FINISHED** ステージにない場合は、[CANCEL LOAD](../sql-reference/sql-statements/loading_unloading/CANCEL_LOAD.md) ステートメントを使用してジョブをキャンセルできます。

たとえば、次のステートメントを実行して、データベース `test_db` でラベルが `label1` のロードジョブをキャンセルできます。

```SQL
CANCEL LOAD
FROM test_db
WHERE LABEL = "label";
```

## ジョブの分割と同時実行

Broker Load ジョブは、同時に実行される 1 つまたは複数のタスクに分割できます。ロードジョブ内のタスクは、単一のトランザクション内で実行されます。それらはすべて成功するか、失敗する必要があります。StarRocks は、`LOAD` ステートメントで `data_desc` をどのように宣言するかに基づいて、各ロードジョブを分割します。

- 複数の `data_desc` パラメータを宣言し、それぞれが異なるテーブルを指定する場合、各テーブルのデータをロードするためのタスクが生成されます。

- 複数の `data_desc` パラメータを宣言し、それぞれが同じテーブルの異なるパーティションを指定する場合、各パーティションのデータをロードするためのタスクが生成されます。

さらに、各タスクは 1 つまたは複数のインスタンスにさらに分割でき、それらは StarRocks クラスタの BE に均等に分散され、同時に実行されます。StarRocks は、次の [FE 構成](../administration/management/FE_configuration.md) に基づいて各タスクを分割します。

- `min_bytes_per_broker_scanner`: 各インスタンスによって処理されるデータの最小量。デフォルトの量は 64 MB です。

- `load_parallel_instance_num`: 個々の BE 上の各ロードジョブで許可される同時インスタンスの数。デフォルトの数は 1 です。
  
  次の式を使用して、個々のタスクのインスタンス数を計算できます。

  **個々のタスクのインスタンス数 = min(個々のタスクによってロードされるデータの量/`min_bytes_per_broker_scanner`、`load_parallel_instance_num` x BE の数)**

ほとんどの場合、各ロードジョブに対して 1 つの `data_desc` のみが宣言され、各ロードジョブは 1 つのタスクにのみ分割され、タスクは BE の数と同じ数のインスタンスに分割されます。

## 関連する構成項目

[FE 構成項目](../administration/management/FE_configuration.md) `max_broker_load_job_concurrency` は、StarRocks クラスタ内で同時に実行できる Broker Load ジョブの最大数を指定します。

StarRocks v2.4 以前では、特定の期間内に送信される Broker Load ジョブの合計数が最大数を超えると、過剰なジョブはキューに入れられ、送信時間に基づいてスケジュールされます。

StarRocks v2.5 以降では、特定の期間内に送信される Broker Load ジョブの合計数が最大数を超えると、過剰なジョブはキューに入れられ、優先度に基づいてスケジュールされます。ジョブの作成時に `priority` パラメータを使用して、ジョブの優先度を指定できます。[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#opt_properties) を参照してください。[ALTER LOAD](../sql-reference/sql-statements/loading_unloading/ALTER_LOAD.md) を使用して、**QUEUEING** または **LOADING** 状態にある既存のジョブの優先度を変更することもできます。