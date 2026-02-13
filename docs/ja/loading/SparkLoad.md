displayed_sidebar: docs

# Spark Load を使用して大量のデータをロードする

Spark Load は、外部の Apache Spark™ リソースを使用してインポートされるデータを前処理します。これにより、インポートパフォーマンスが向上し、コンピュートリソースを節約できます。主に StarRocks への**初期移行**や**大量のデータインポート** (データ量は TB レベルまで) に使用されます。

Spark Load は**非同期**のインポート方式であり、ユーザーは MySQL プロトコルを介して Spark タイプインポートジョブを作成し、`SHOW LOAD` を使用してインポート結果を確認する必要があります。

> **注意**
>
> - StarRocks テーブルに INSERT 権限を持つユーザーのみがこのテーブルにデータをロードできます。必要な権限を付与するには、[GRANT](../sql-reference/sql-statements/account-management/GRANT.md) で提供されている指示に従ってください。
> - Spark Load は 主キーテーブル にデータをロードするために使用することはできません。

## 用語解説

- **Spark ETL**: 主にインポート処理におけるデータの ETL を担当します。これには、グローバル辞書構築 (BITMAP タイプ)、パーティション化、ソート、集計などが含まれます。
- **Broker**: Broker は独立したステートレスなプロセスです。ファイルシステムインターフェースをカプセル化し、StarRocks にリモートストレージシステムからファイルを読み取る機能を提供します。
- **グローバル辞書**: 元の値からエンコードされた値へのデータをマッピングするデータ構造を保存します。元の値は任意のデータ型にできますが、エンコードされた値は整数です。グローバル辞書は主に、正確な重複排除カウントが事前計算されるシナリオで主に使用されます。

## 基本原理

ユーザーは MySQL クライアントを介して Spark タイプインポートジョブを送信します。FE はメタデータを記録し、送信結果を返します。

Spark Load タスクの実行は、以下の主要なフェーズに分かれています。

1.  ユーザーは Spark Load ジョブを FE に送信します。
2.  FE は ETL タスクの実行を Apache Spark™ クラスターにスケジュールします。
3.  Apache Spark™ クラスターは、グローバル辞書構築 (BITMAP タイプ)、パーティション化、ソート、集計などを含む ETL タスクを実行します。
4.  ETL タスクが完了した後、FE は前処理された各スライスのデータパスを取得し、関連する BE に Push タスクを実行するようスケジュールします。
5.  BE は Broker プロセスを介して HDFS からデータを読み込み、StarRocks ストレージ形式に変換します。
    > Broker プロセスを使用しない場合、BE は HDFS から直接データを読み込みます。
6.  FE は有効なバージョンをスケジュールし、インポートジョブを完了します。

次の図は、Spark Load の主要な流れを示しています。

![Spark Load](../_assets/4.3.2-1.png)

---

## グローバル辞書

### 適用シナリオ

現在、StarRocks の BITMAP 列は Roaringbitmap を使用して実装されており、入力データ型として整数のみを扱います。そのため、インポート処理で BITMAP 列の事前計算を実装する場合、入力データ型を整数に変換する必要があります。

StarRocks の既存のインポート処理では、グローバル辞書のデータ構造は Hive テーブルに基づいて実装されており、元の値からエンコードされた値へのマッピングを保存します。

### 構築プロセス

1.  アップストリームのデータソースからデータを読み込み、`hive-table` という名前の一時的な Hive テーブルを生成します。
2.  `hive-table` の重複排除されたフィールドの値を抽出し、`distinct-value-table` という名前の新しい Hive テーブルを生成します。
3.  元の値用の列とエンコードされた値用の列を 1 つずつ持つ、`dict-table` という名前の新しいグローバル辞書テーブルを作成します。
4.  `distinct-value-table` と `dict-table` を左ジョインし、その後、ウィンドウ関数を使用してこのセットをエンコードします。最後に、重複排除された列の元の値とエンコードされた値の両方が `dict-table` に書き戻されます。
5.  `dict-table` と `hive-table` をジョインして、`hive-table` 内の元の値を整数エンコードされた値に置き換える作業を完了します。
6.  `hive-table` は次回のデータ前処理で読み込まれ、計算後、StarRocks にインポートされます。

## データ前処理

データ前処理の基本的なプロセスは以下の通りです。

1.  アップストリームのデータソース (HDFS ファイルまたは Hive テーブル) からデータを読み込みます。
2.  読み込んだデータのフィールドマッピングと計算を完了し、その後、パーティション情報に基づいて `bucket-id` を生成します。
3.  StarRocks テーブルの Rollup メタデータに基づいて RollupTree を生成します。
4.  RollupTree を反復処理し、階層的な集計操作を実行します。次の階層の Rollup は、前の階層の Rollup から計算できます。
5.  集計計算が完了するたびに、データは `bucket-id` に従ってバケッティングされ、その後 HDFS に書き込まれます。
6.  その後の Broker プロセスは HDFS からファイルをプルし、StarRocks BE ノードにインポートします。

## 基本操作

### ETL クラスターの構成

StarRocks では、ETL 作業に Apache Spark™ が外部の計算リソースとして使用されます。クエリ用の Spark/GPU、外部ストレージ用の HDFS/S3、ETL 用の MapReduce など、他の外部リソースが StarRocks に追加される場合もあります。そのため、StarRocks で使用されるこれらの外部リソースを管理するために `Resource Management` を導入しています。

Apache Spark™ インポートジョブを送信する前に、ETL タスクを実行するための Apache Spark™ クラスターを構成します。操作の構文は以下の通りです。

~~~sql
-- create Apache Spark™ resource
CREATE EXTERNAL RESOURCE resource_name
PROPERTIES
(
 type = spark,
 spark_conf_key = spark_conf_value,
 working_dir = path,
 broker = broker_name,
 broker.property_key = property_value
);

-- drop Apache Spark™ resource
DROP RESOURCE resource_name;

-- show resources
SHOW RESOURCES
SHOW PROC "/resources";

-- privileges
GRANT USAGE_PRIV ON RESOURCE resource_name TO user_identityGRANT USAGE_PRIV ON RESOURCE resource_name TO ROLE role_name;
REVOKE USAGE_PRIV ON RESOURCE resource_name FROM user_identityREVOKE USAGE_PRIV ON RESOURCE resource_name FROM ROLE role_name;
~~~

- リソースの作成

**例**:

~~~sql
-- yarn cluster mode
CREATE EXTERNAL RESOURCE "spark0"
PROPERTIES
(
    "type" = "spark",
    "spark.master" = "yarn",
    "spark.submit.deployMode" = "cluster",
    "spark.jars" = "xxx.jar,yyy.jar",
    "spark.files" = "/tmp/aaa,/tmp/bbb",
    "spark.executor.memory" = "1g",
    "spark.yarn.queue" = "queue0",
    "spark.hadoop.yarn.resourcemanager.address" = "127.0.0.1:9999",
    "spark.hadoop.fs.defaultFS" = "hdfs://127.0.0.1:10000",
    "working_dir" = "hdfs://127.0.0.1:10000/tmp/starrocks",
    "broker" = "broker0",
    "broker.username" = "user0",
    "broker.password" = "password0"
);

-- yarn HA cluster mode
CREATE EXTERNAL RESOURCE "spark1"
PROPERTIES
(
    "type" = "spark",
    "spark.master" = "yarn",
    "spark.submit.deployMode" = "cluster",
    "spark.hadoop.yarn.resourcemanager.ha.enabled" = "true",
    "spark.hadoop.yarn.resourcemanager.ha.rm-ids" = "rm1,rm2",
    "spark.hadoop.yarn.resourcemanager.hostname.rm1" = "host1",
    "spark.hadoop.yarn.resourcemanager.hostname.rm2" = "host2",
    "spark.hadoop.fs.defaultFS" = "hdfs://127.0.0.1:10000",
    "working_dir" = "hdfs://127.0.0.1:10000/tmp/starrocks",
    "broker" = "broker1"
);
~~~

`resource-name` は、StarRocks で構成された Apache Spark™ リソースの名前です。

`PROPERTIES` には、Apache Spark™ リソースに関連する以下のパラメータが含まれます。
> **注意**
>
> Apache Spark™ リソースの PROPERTIES の詳細については、[CREATE RESOURCE](../sql-reference/sql-statements/Resource/CREATE_RESOURCE.md) を参照してください。

- Spark 関連パラメータ:
  - `type`: リソースタイプ、必須、現在は `spark` のみをサポートします。
  - `spark.master`: 必須、現在は `yarn` のみをサポートします。
    - `spark.submit.deployMode`: Apache Spark™ プログラムのデプロイモード、必須、現在は `cluster` と `client` の両方をサポートします。
    - `spark.hadoop.fs.defaultFS`: `master` が `yarn` の場合、必須です。
    - yarn リソースマネージャーに関連するパラメータ、必須。
      - 単一ノード上の 1 つの ResourceManager
        `spark.hadoop.yarn.resourcemanager.address`: シングルポイントリソースマネージャーのアドレス。
      - ResourceManager HA
        > ResourceManager のホスト名またはアドレスを指定できます。
        - `spark.hadoop.yarn.resourcemanager.ha.enabled`: リソースマネージャーの HA を有効にするには、`true` に設定します。
        - `spark.hadoop.yarn.resourcemanager.ha.rm-ids`: リソースマネージャーの論理 ID のリスト。
        - `spark.hadoop.yarn.resourcemanager.hostname.rm-id`: 各 rm-id について、リソースマネージャーに対応するホスト名を指定します。
        - `spark.hadoop.yarn.resourcemanager.address.rm-id`: 各 rm-id について、クライアントがジョブを送信するための `host:port` を指定します。

- `*working_dir`: ETL が使用するディレクトリ。Apache Spark™ が ETL リソースとして使用される場合、必須です。例: `hdfs://host:port/tmp/starrocks`。

- Broker 関連パラメータ:
  - `broker`: Broker 名。Apache Spark™ が ETL リソースとして使用される場合、必須です。事前に `ALTER SYSTEM ADD BROKER` コマンドを使用して設定を完了する必要があります。
  - `broker.property_key`: Broker プロセスが ETL によって生成された中間ファイルを読み取る際に指定する情報 (例: 認証情報)。

**注意事項**:

上記は Broker プロセスを介したロードのパラメータの説明です。Broker プロセスなしでデータをロードする場合、以下に注意してください。

- `broker` を指定する必要はありません。
- ユーザー認証と NameNode ノードの HA を構成する必要がある場合、HDFS クラスターの hdfs-site.xml ファイルでパラメータを構成する必要があります。パラメータの説明については [broker_properties](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs) を参照してください。また、**hdfs-site.xml** ファイルを各 FE の **$FE_HOME/conf** および各 BE の **$BE_HOME/conf** の下に移動する必要があります。

> 注意
>
> HDFS ファイルが特定のユーザーのみによってアクセスできる場合でも、`broker.name` に HDFS ユーザー名、`broker.password` にユーザーパスワードを指定する必要があります。

- リソースの表示

通常のユーザーアカウントは、`USAGE-PRIV` アクセス権を持つリソースのみを表示できます。root および admin アカウントはすべてのリソースを表示できます。

- リソース権限

リソース権限は `GRANT REVOKE` を介して管理され、現在は `USAGE-PRIV` 権限のみをサポートしています。`USAGE-PRIV` 権限をユーザーまたはロールに付与できます。

~~~sql
-- Grant access to spark0 resources to user0
GRANT USAGE_PRIV ON RESOURCE "spark0" TO "user0"@"%";

-- Grant access to spark0 resources to role0
GRANT USAGE_PRIV ON RESOURCE "spark0" TO ROLE "role0";

-- Grant access to all resources to user0
GRANT USAGE_PRIV ON RESOURCE* TO "user0"@"%";

-- Grant access to all resources to role0
GRANT USAGE_PRIV ON RESOURCE* TO ROLE "role0";

-- Revoke the use privileges of spark0 resources from user user0
REVOKE USAGE_PRIV ON RESOURCE "spark0" FROM "user0"@"%";
~~~

### Spark クライアントの構成

FE の Spark クライアントを構成し、FE が `spark-submit` コマンドを実行して Spark タスクを送信できるようにします。Spark2 2.4.5 以降の公式バージョンを使用することをお勧めします [spark ダウンロードアドレス](https://archive.apache.org/dist/spark/)。ダウンロード後、以下の手順で構成を完了してください。

- `SPARK-HOME` の構成

Spark クライアントを FE と同じマシンのディレクトリに配置し、FE 構成ファイルで `spark_home_default_dir` をこのディレクトリに構成します。これはデフォルトで FE ルートディレクトリ内の `lib/spark2x` パスであり、空にすることはできません。

- **Spark 依存パッケージの構成**

依存パッケージを構成するには、Spark クライアント下の jars フォルダーにあるすべての jar ファイルを zip 圧縮してアーカイブし、FE 構成の `spark_resource_path` 項目をこの zip ファイルに構成します。この構成が空の場合、FE は FE ルートディレクトリ内の `lib/spark2x/jars/spark-2x.zip` ファイルを検索しようとします。FE がそれを見つけられない場合、エラーを報告します。

Spark Load ジョブが送信されると、アーカイブされた依存ファイルはリモートリポジトリにアップロードされます。デフォルトのリポジトリパスは、`working_dir/{cluster_id}` ディレクトリの下に `--spark-repository--{resource-name}` という名前で作成されます。これは、クラスター内のリソースがリモートリポジトリに対応することを意味します。ディレクトリ構造は次のとおりです。

~~~bash
---spark-repository--spark0/

   |---archive-1.0.0/

   |        |\---lib-990325d2c0d1d5e45bf675e54e44fb16-spark-dpp-1.0.0\-jar-with-dependencies.jar

   |        |\---lib-7670c29daf535efe3c9b923f778f61fc-spark-2x.zip

   |---archive-1.1.0/

   |        |\---lib-64d5696f99c379af2bee28c1c84271d5-spark-dpp-1.1.0\-jar-with-dependencies.jar

   |        |\---lib-1bbb74bb6b264a270bc7fca3e964160f-spark-2x.zip

   |---archive-1.2.0/

   |        |-...

~~~

Spark 依存関係 (デフォルトで `spark-2x.zip` という名前) に加えて、FE は DPP 依存関係もリモートリポジトリにアップロードします。Spark Load によって送信されたすべての依存関係がリモートリポジトリにすでに存在する場合、依存関係を再度アップロードする必要はありません。これにより、毎回大量のファイルを繰り返しアップロードする時間を節約できます。

### YARN クライアントの構成

FE の yarn クライアントを構成し、FE が yarn コマンドを実行して、実行中のアプリケーションのステータスを取得したり、それを強制終了したりできるようにします。Hadoop2 2.5.2 以降の公式バージョンを使用することをお勧めします ([hadoop ダウンロードアドレス](https://archive.apache.org/dist/hadoop/common/))。ダウンロード後、以下の手順で構成を完了してください。

- **YARN 実行可能パスの構成**

ダウンロードした yarn クライアントを FE と同じマシンのディレクトリに配置し、FE 構成ファイルの `yarn_client_path` 項目を yarn のバイナリ実行可能ファイルに構成します。これはデフォルトで FE ルートディレクトリ内の `lib/yarn-client/hadoop/bin/yarn` パスです。

- **YARN を生成するために必要な構成ファイルのパスの構成 (オプション)**

FE が yarn クライアントを介してアプリケーションのステータスを取得したり、アプリケーションを強制終了したりする場合、デフォルトでは StarRocks は FE ルートディレクトリの `lib/yarn-config` パスに yarn コマンドの実行に必要な構成ファイルを生成します。このパスは、FE 構成ファイル内の `yarn_config_dir` エントリを構成することで変更できます。現在、これには `core-site.xml` と `yarn-site.xml` が含まれます。

### インポートジョブの作成

**構文:**

~~~sql
LOAD LABEL load_label
    (data_desc, ...)
WITH RESOURCE resource_name
[resource_properties]
[PROPERTIES (key1=value1, ... )]

* load_label:
    db_name.label_name

* data_desc:
    DATA INFILE ('file_path', ...)
    [NEGATIVE]
    INTO TABLE tbl_name
    [PARTITION (p1, p2)]
    [COLUMNS TERMINATED BY separator ]
    [(col1, ...)]
    [COLUMNS FROM PATH AS (col2, ...)]
    [SET (k1=f1(xx), k2=f2(xx))]
    [WHERE predicate]

    DATA FROM TABLE hive_external_tbl
    [NEGATIVE]
    INTO TABLE tbl_name
    [PARTITION (p1, p2)]
    [SET (k1=f1(xx), k2=f2(xx))]
    [WHERE predicate]

* resource_properties:
 (key2=value2, ...)
~~~

**例 1**: アップストリームのデータソースが HDFS の場合

~~~sql
LOAD LABEL db1.label1
(
    DATA INFILE("hdfs://abc.com:8888/user/starrocks/test/ml/file1")
    INTO TABLE tbl1
    COLUMNS TERMINATED BY ","
    (tmp_c1,tmp_c2)
    SET
    (
        id=tmp_c2,
        name=tmp_c1
    ),
    DATA INFILE("hdfs://abc.com:8888/user/starrocks/test/ml/file2")
    INTO TABLE tbl2
    COLUMNS TERMINATED BY ","
    (col1, col2)
    where col1 > 1
)
WITH RESOURCE 'spark0'
(
    "spark.executor.memory" = "2g",
    "spark.shuffle.compress" = "true"
)
PROPERTIES
(
    "timeout" = "3600"
);
~~~

**例 2**: アップストリームのデータソースが Hive の場合。

- ステップ 1: 新しい Hive リソースを作成します

~~~sql
CREATE EXTERNAL RESOURCE hive0
PROPERTIES
(
    "type" = "hive",
    "hive.metastore.uris" = "thrift://xx.xx.xx.xx:8080"
);
~~~

- ステップ 2: 新しい Hive 外部テーブルを作成します

~~~sql
CREATE EXTERNAL TABLE hive_t1
(
    k1 INT,
    K2 SMALLINT,
    k3 varchar(50),
    uuid varchar(100)
)
ENGINE=hive
PROPERTIES
(
    "resource" = "hive0",
    "database" = "tmp",
    "table" = "t1"
);
~~~

- ステップ 3: ロードコマンドを送信します。インポートされる StarRocks テーブルの列が Hive 外部テーブルに存在する必要があります。

~~~sql
LOAD LABEL db1.label1
(
    DATA FROM TABLE hive_t1
    INTO TABLE tbl1
    SET
    (
        uuid=bitmap_dict(uuid)
    )
)
WITH RESOURCE 'spark0'
(
    "spark.executor.memory" = "2g",
    "spark.shuffle.compress" = "true"
)
PROPERTIES
(
    "timeout" = "3600"
);
~~~

Spark Load のパラメータの紹介:

- **Label**

インポートジョブの Label です。各インポートジョブには、Broker Load と同じルールに従って、データベース内で一意の Label があります。

- **データ記述クラスのパラメータ**

現在、サポートされているデータソースは CSV および Hive テーブルです。その他のルールは Broker Load と同じです。

- **インポートジョブのパラメータ**

インポートジョブのパラメータは、インポートステートメントの `opt_properties` セクションに属するパラメータを指します。これらのパラメータはインポートジョブ全体に適用されます。ルールは Broker Load と同じです。

- **Spark リソースのパラメータ**

Spark リソースは事前に StarRocks に構成し、ユーザーは Spark Load にリソースを適用する前に USAGE-PRIV 権限を与えられる必要があります。Spark リソースのパラメータは、ユーザーが一時的な必要性がある場合 (例えば、ジョブにリソースを追加したり、Spark 構成を変更したりする場合) に設定できます。この設定はこのジョブにのみ有効であり、StarRocks クラスター内の既存の構成には影響しません。

~~~sql
WITH RESOURCE 'spark0'
(
    "spark.driver.memory" = "1g",
    "spark.executor.memory" = "3g"
)
~~~

- **データソースが Hive の場合のインポート**

現在、インポート処理で Hive テーブルを使用するには、`Hive` タイプの外部テーブルを作成し、その後、インポートコマンドを送信する際にその名前を指定する必要があります。

- **グローバル辞書を構築するためのインポートプロセス**

ロードコマンドでは、グローバル辞書を構築するために必要なフィールドを以下の形式で指定できます: `StarRocks フィールド名=bitmap_dict(Hive テーブルフィールド名)`。現在、**グローバル辞書はアップストリームのデータソースが Hive テーブルの場合にのみサポートされる**ことに注意してください。

- **バイナリ型データのロード**

v2.5.17 以降、Spark Load はバイナリデータをビットマップデータに変換できる bitmap_from_binary 関数をサポートしています。Hive テーブルまたは HDFS ファイルの列タイプがバイナリであり、StarRocks テーブル内の対応する列がビットマップ型の集計列である場合、ロードコマンドでフィールドを以下の形式で指定できます: `StarRocks フィールド名=bitmap_from_binary(Hive テーブルフィールド名)`。これにより、グローバル辞書を構築する必要がなくなります。

## インポートジョブの表示

Spark Load のインポートは Broker Load と同様に非同期です。ユーザーはインポートジョブの Label を記録し、`SHOW LOAD` コマンドで使用してインポート結果を確認する必要があります。インポートを表示するコマンドはすべてのインポート方法に共通です。例は以下の通りです。

返されるパラメータの詳細については、Broker Load を参照してください。違いは以下の通りです。

~~~sql
mysql> show load order by createtime desc limit 1\G
*************************** 1. row ***************************
  JobId: 76391
  Label: label1
  State: FINISHED
 Progress: ETL:100%; LOAD:100%
  Type: SPARK
 EtlInfo: unselected.rows=4; dpp.abnorm.ALL=15; dpp.norm.ALL=28133376
 TaskInfo: cluster:cluster0; timeout(s):10800; max_filter_ratio:5.0E-5
 ErrorMsg: N/A
 CreateTime: 2019-07-27 11:46:42
 EtlStartTime: 2019-07-27 11:46:44
 EtlFinishTime: 2019-07-27 11:49:44
 LoadStartTime: 2019-07-27 11:49:44
LoadFinishTime: 2019-07-27 11:50:16
  URL: http://1.1.1.1:8089/proxy/application_1586619723848_0035/
 JobDetails: {"ScannedRows":28133395,"TaskNumber":1,"FileNumber":1,"FileSize":200000}
~~~

- **State**

インポートされたジョブの現在の段階です。
PENDING: ジョブがコミットされました。
ETL: Spark ETL がコミットされました。
LOADING: FE は BE にプッシュ操作を実行するようスケジュールします。
FINISHED: プッシュが完了し、バージョンが有効になりました。

インポートジョブには `CANCELLED` と `FINISHED` の 2 つの最終段階があり、どちらもロードジョブが完了したことを示します。`CANCELLED` はインポートの失敗を示し、`FINISHED` はインポートの成功を示します。

- **Progress**

インポートジョブの進行状況の説明です。進行状況には ETL と LOAD の 2 種類があり、これらはインポート処理の 2 つのフェーズである ETL と LOADING に対応します。

- LOAD の進行状況の範囲は 0～100% です。

`LOAD progress = すべてのレプリケーションインポートの現在完了した tablet の数 / このインポートジョブの tablet の総数 * 100%`。

- すべてのテーブルがインポートされている場合、LOAD の進行状況は 99% であり、インポートが最終検証フェーズに入ると 100% に変わります。

- インポートの進行状況は線形ではありません。一定期間進行状況に変化がない場合でも、インポートが実行されていないことを意味するものではありません。

- **Type**

インポートジョブのタイプ。Spark Load の場合は SPARK。

- **CreateTime/EtlStartTime/EtlFinishTime/LoadStartTime/LoadFinishTime**

これらの値は、インポートが作成された時刻、ETL フェーズが開始された時刻、ETL フェーズが完了した時刻、LOADING フェーズが開始された時刻、およびインポートジョブ全体が完了した時刻を表します。

- **JobDetails**

ジョブの詳細な実行ステータスを表示します。これには、インポートされたファイルの数、合計サイズ (バイト単位)、サブタスクの数、処理中の元の行の数などが含まれます。例:

~~~json
 {"ScannedRows":139264,"TaskNumber":1,"FileNumber":1,"FileSize":940754064}
~~~

- **URL**

入力をブラウザにコピーして、対応するアプリケーションのウェブインターフェースにアクセスできます。

### Apache Spark™ Launcher コミットログの表示

ユーザーは Apache Spark™ ジョブコミット中に生成された詳細なログを表示する必要がある場合があります。デフォルトでは、ログは FE ルートディレクトリの `log/spark_launcher_log` パスに `spark-launcher-{load-job-id}-{label}.log` という名前で保存されます。ログはこのディレクトリに一定期間保存され、FE メタデータのインポート情報がクリーンアップされると消去されます。デフォルトの保持期間は 3 日間です。

### インポートのキャンセル

Spark Load ジョブのステータスが `CANCELLED` または `FINISHED` でない場合、ユーザーはインポートジョブの Label を指定することで手動でキャンセルできます。

---

## 関連するシステム構成

**FE 構成:** 以下の構成は Spark Load のシステムレベルの構成であり、すべての Spark Load インポートジョブに適用されます。構成値は主に `fe.conf` を変更することで調整できます。

- `enable-spark-load`: Spark Load とリソースの作成を有効にします。デフォルト値は false です。
- `spark-load-default-timeout-second`: ジョブのデフォルトのタイムアウトは 259200 秒 (3 日間) です。
- `spark-home-default-dir`: Spark クライアントパス (`fe/lib/spark2x`)。
- `spark-resource-path`: パッケージ化された Spark 依存関係ファイルへのパス (デフォルトでは空)。
- `spark-launcher-log-dir`: Spark クライアントのコミットログが保存されるディレクトリ (`fe/log/spark-launcher-log`)。
- `yarn-client-path`: yarn のバイナリ実行可能ファイルへのパス (`fe/lib/yarn-client/hadoop/bin/yarn`)。
- `yarn-config-dir`: Yarn の構成ファイルパス (`fe/lib/yarn-config`)。

---

## ベストプラクティス

Spark Load を使用するのに最も適したシナリオは、生データがファイルシステム (HDFS) にあり、データ量が数十 GB から TB レベルの場合です。データ量が少ない場合は Stream Load または Broker Load を使用してください。

Spark Load のインポートの完全な例については、GitHub のデモを参照してください: [https://github.com/StarRocks/demo/blob/master/docs/03_sparkLoad2StarRocks.md](https://github.com/StarRocks/demo/blob/master/docs/03_sparkLoad2StarRocks.md)

## FAQ

- `Error: When running with master 'yarn' either HADOOP-CONF-DIR or YARN-CONF-DIR must be set in the environment.`

Spark クライアントの `spark-env.sh` で `HADOOP-CONF-DIR` 環境変数を構成せずに Spark Load を使用しています。

- `Error: Cannot run program "xxx/bin/spark-submit": error=2, No such file or directory`

Spark Load を使用している際に、`spark_home_default_dir` 構成項目が Spark クライアントのルートディレクトリを指定していません。

- `Error: File xxx/jars/spark-2x.zip does not exist.`

Spark Load を使用している際に、`spark-resource-path` 構成項目がパックされた zip ファイルを指していません。

- `Error: yarn client does not exist in path: xxx/yarn-client/hadoop/bin/yarn`

Spark Load を使用している際に、`yarn-client-path` 構成項目が yarn 実行可能ファイルを指定していません。

- `ERROR: Cannot execute hadoop-yarn/bin/... /libexec/yarn-config.sh`

CDH で Hadoop を使用する場合、`HADOOP_LIBEXEC_DIR` 環境変数を構成する必要があります。`hadoop-yarn` と `hadoop` ディレクトリが異なるため、デフォルトの `libexec` ディレクトリは `hadoop-yarn/bin/... /libexec` を検索しますが、`libexec` は `hadoop` ディレクトリにあります。`yarn application status` コマンドで Spark タスクのステータスを取得する際にエラーが報告され、インポートジョブが失敗しました。
