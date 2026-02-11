```markdown
displayed_sidebar: docs
---

# Spark Load を使用したデータの一括インポート

Spark Load は、外部の Apache Spark™ リソースを使用してインポートするデータを前処理することで、インポートパフォーマンスを向上させ、計算リソースを節約します。これは主に、**初期移行** や StarRocks への **大量データ (TB レベルのデータ量)** のインポートに使用されます。

Spark Load は**非同期**インポート方法であり、ユーザーは MySQL プロトコルを介して Spark タイプのインポートジョブを作成し、`SHOW LOAD` を使用してインポート結果を表示する必要があります。

> **注意**
>
> - StarRocks テーブルに対して INSERT 権限を持つユーザーのみが、そのテーブルにデータをインポートできます。[GRANT](../sql-reference/sql-statements/account-management/GRANT.md) に記載されている手順に従って、必要な権限を付与してください。
> - Spark Load は主キーテーブルへのデータのインポートには使用できません。

## 用語解説

- **Spark ETL**: グローバル辞書構築 (BITMAP 型)、パーティショニング、ソート、集計など、インポートプロセスにおけるデータ ETL を主に担当します。
- **Broker**: Broker は独立したステートレスなプロセスです。ファイルシステムインターフェースをカプセル化し、StarRocks にリモートストレージシステムからファイルを読み取る機能を提供します。
- **Global Dictionary**: データを元の値からエンコードされた値にマッピングするデータ構造を保持します。元の値は任意のデータ型であり、エンコードされた値は整数です。グローバル辞書は、主に正確な重複排除を事前計算するシナリオで使用されます。

## 原理

ユーザーは MySQL クライアントを介して Spark タイプのインポートジョブを送信します。FE はメタデータを記録し、送信結果を返します。

Spark Load タスクの実行は、以下の主要なフェーズに分かれています。

1. ユーザーは Spark Load ジョブを FE に送信します。
2. FE は ETL タスクの実行を Apache Spark™ クラスターにスケジュールします。
3. Apache Spark™ クラスターは、グローバル辞書構築 (BITMAP 型)、パーティショニング、ソート、集計などを含む ETL タスクを実行します。
4. ETL タスクが完了すると、FE は各前処理済みスライスのデータパスを取得し、関連する BE に Push タスクの実行をスケジュールします。
5. BE は Broker プロセスを介して HDFS からデータを読み取り、StarRocks のストレージ形式に変換します。
    > Broker プロセスを使用しない場合、BE は HDFS から直接データを読み取ります。
6. FE は有効なバージョンをスケジュールし、インポートジョブを完了します。

以下の図は Spark Load の主なフローを示しています。

![Spark load](../_assets/4.3.2-1.png)

---

## グローバル辞書

### 適用シナリオ

現在、StarRocks の BITMAP 列は Roaringbitmap を使用して実装されており、入力データ型として整数のみを受け入れます。したがって、インポートプロセス中に BITMAP 列の事前計算を実装する場合、入力データ型を整数に変換する必要があります。

StarRocks の既存のインポートプロセスでは、グローバル辞書のデータ構造は Hive テーブルに基づいて実装されており、元の値からエンコードされた値へのマッピングを保持しています。

### 構築プロセス

1. アップストリームデータソースからデータを読み取り、`hive-table` という名前の一時的な Hive テーブルを生成します。
2. `hive-table` の強調されていないフィールドの値を抽出し、`distinct-value-table` という名前の新しい Hive テーブルを生成します。
3. 新しいグローバル辞書テーブルを `dict-table` という名前で作成します。このテーブルには、元の値用とエンコードされた値用の2つの列があります。
4. `distinct-value-table` と `dict-table` の間に左結合を実行し、ウィンドウ関数を使用してそのセットをエンコードします。最後に、重複排除された列の元の値とエンコードされた値の両方を `dict-table` に書き戻します。
5. `dict-table` と `hive-table` の間に結合を実行し、`hive-table` 内の元の値を整数エンコード値に置き換える作業を完了します。
6. `hive-table` は次回のデータ前処理で読み取られ、計算後に StarRocks にインポートされます。

## データ前処理

データ前処理の基本プロセスは以下のとおりです。

1. アップストリームデータソース (HDFS ファイルまたは Hive テーブル) からデータを読み取ります。
2. 読み取られたデータのフィールドマッピングと計算を完了し、パーティション情報に基づいて `bucket-id` を生成します。
3. StarRocks テーブルの Rollup メタデータに基づいて RollupTree を生成します。
4. RollupTree をイテレートし、階層的集計操作を実行します。次のレイヤーの Rollup は、前のレイヤーの Rollup から計算できます。
5. 集計計算が完了するたびに、データは `bucket-id` に基づいてバケットに分割され、HDFS に書き込まれます。
6. 後続の Broker プロセスは HDFS からファイルをプルし、StarRocks BE ノードにインポートします。

## 基本操作

### ETL クラスターの構成

Apache Spark™ は、StarRocks で ETL 作業用の外部計算リソースとして使用されます。クエリ用の Spark/GPU、外部ストレージ用の HDFS/S3、ETL 用の MapReduce など、他の外部リソースが StarRocks に追加される可能性があります。そのため、StarRocks が使用するこれらの外部リソースを管理するために、`リソース管理 (Resource Management)` を導入しました。

Apache Spark™ インポートジョブを送信する前に、ETL タスクを実行するように Apache Spark™ クラスターを構成してください。操作構文は次のとおりです。

~~~sql
-- Apache Spark™ リソースを作成
CREATE EXTERNAL RESOURCE resource_name
PROPERTIES
(
 type = spark,
 spark_conf_key = spark_conf_value,
 working_dir = path,
 broker = broker_name,
 broker.property_key = property_value
);

-- Apache Spark™ リソースを削除
DROP RESOURCE resource_name;

-- リソースを表示
SHOW RESOURCES
SHOW PROC "/resources";

-- 権限
GRANT USAGE_PRIV ON RESOURCE resource_name TO user_identityGRANT USAGE_PRIV ON RESOURCE resource_name TO ROLE role_name;
REVOKE USAGE_PRIV ON RESOURCE resource_name FROM user_identityREVOKE USAGE_PRIV ON RESOURCE resource_name FROM ROLE role_name;
~~~

- リソースの作成

**例**：

~~~sql
-- yarn クラスターモード
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

-- yarn HA クラスターモード
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

`PROPERTIES` には、Apache Spark™ リソースに関連する以下のパラメータが含まれています。
> **注意**
>
> Apache Spark™ リソースの PROPERTIES の詳細については、[CREATE RESOURCE](../sql-reference/sql-statements/Resource/CREATE_RESOURCE.md) を参照してください。

- Spark 関連パラメータ:
  - `type`: リソースタイプ。必須。現在 `spark` のみサポート。
  - `spark.master`: 必須。現在 `yarn` のみサポート。
    - `spark.submit.deployMode`: Apache Spark™ プログラムのデプロイモード。必須。現在 `cluster` および `client` をサポート。
    - `spark.hadoop.fs.defaultFS`: master が yarn の場合、必須。
    - yarn リソースマネージャーに関連するパラメータ。必須。
      - 単一ノード上の1つの ResourceManager
        `spark.hadoop.yarn.resourcemanager.address`: 単一ポイントのリソースマネージャーのアドレス。
      - ResourceManager HA
        > ResourceManager のホスト名またはアドレスの指定を選択できます。
        - `spark.hadoop.yarn.resourcemanager.ha.enabled`: リソースマネージャー HA を有効にします。`true` に設定。
        - `spark.hadoop.yarn.resourcemanager.ha.rm-ids`: リソースマネージャーの論理 ID リスト。
        - `spark.hadoop.yarn.resourcemanager.hostname.rm-id`: 各 rm-id について、リソースマネージャーに対応するホスト名を指定します。
        - `spark.hadoop.yarn.resourcemanager.address.rm-id`: 各 rm-id について、クライアントがジョブを送信する `host:port` を指定します。

- `*working_dir`: ETL が使用するディレクトリ。Apache Spark™ が ETL リソースとして使用される場合、必須。例: `hdfs://host:port/tmp/starrocks`。

- Broker 関連パラメータ:
  - `broker`: Broker 名。Apache Spark™ が ETL リソースとして使用される場合、必須。`ALTER SYSTEM ADD BROKER` コマンドを使用して事前に構成する必要があります。
  - `broker.property_key`: Broker プロセスが ETL によって生成された中間ファイルを読み取る際に指定する情報 (例: 認証情報)。

**注意**:

上記は Broker プロセスを介してロードされるパラメータの説明です。Broker プロセスなしでデータをロードする予定がある場合は、以下の点に注意してください。

- `broker` を指定する必要はありません。
- ユーザー認証と NameNode ノードの HA を構成する必要がある場合は、HDFS クラスターの hdfs-site.xml ファイルでパラメータを構成する必要があります。パラメータの説明については、[broker_properties](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs) を参照してください。また、**hdfs-site.xml** ファイルを各 FE の **$FE_HOME/conf** と各 BE の **$BE_HOME/conf** に移動する必要があります。

> 注意
>
> HDFS ファイルが特定のユーザーのみにアクセス可能である場合でも、HDFS ユーザー名を `broker.name` に、ユーザーパスワードを `broker.password` に指定する必要があります。

- リソースの表示

通常のユーザーアカウントは、`USAGE-PRIV` アクセス権を持つリソースのみを表示できます。root および admin アカウントはすべてのリソースを表示できます。

- リソース権限

リソース権限は `GRANT REVOKE` を介して管理され、現在 `USAGE-PRIV` 権限のみをサポートしています。`USAGE-PRIV` 権限をユーザーまたはロールに付与できます。

~~~sql
-- user0 に spark0 リソースへのアクセス権を付与
GRANT USAGE_PRIV ON RESOURCE "spark0" TO "user0"@"%";

-- role0 に spark0 リソースへのアクセス権を付与
GRANT USAGE_PRIV ON RESOURCE "spark0" TO ROLE "role0";

-- user0 にすべてのリソースへのアクセス権を付与
GRANT USAGE_PRIV ON RESOURCE* TO "user0"@"%";

-- role0 にすべてのリソースへのアクセス権を付与
GRANT USAGE_PRIV ON RESOURCE* TO ROLE "role0";

-- user0 から spark0 リソースの使用権限を撤回
REVOKE USAGE_PRIV ON RESOURCE "spark0" FROM "user0"@"%";
~~~

### Spark クライアントの構成

FE 用に Spark クライアントを構成して、FE が `spark-submit` コマンドを実行して Spark タスクを送信できるようにします。公式バージョンの Spark2 2.4.5 以降の使用をお勧めします ([Spark ダウンロードアドレス](https://archive.apache.org/dist/spark/))。ダウンロード後、以下の手順で設定を完了してください。

- `SPARK-HOME` の構成
  
Spark クライアントを FE と同じマシンのディレクトリに配置し、FE 設定ファイルで `spark_home_default_dir` をこのディレクトリに設定します。デフォルトでは、このディレクトリは FE ルートディレクトリの `lib/spark2x` パスであり、空にすることはできません。

- **SPARK 依存関係パッケージの構成**
  
依存関係パッケージを構成するには、Spark クライアントの jars フォルダー内のすべての jar ファイルを圧縮してアーカイブし、FE 構成の `spark_resource_path` エントリをこの zip ファイルに設定します。この構成が空の場合、FE は FE ルートディレクトリ内の `lib/spark2x/jars/spark-2x.zip` ファイルを検索しようとします。FE がそれを見つけられない場合、エラーを報告します。

Spark Load ジョブを送信すると、アーカイブされた依存関係ファイルはリモートリポジトリにアップロードされます。デフォルトのリポジトリパスは `working_dir/{cluster_id}` ディレクトリにあり、`--spark-repository--{resource-name}` という名前が付けられます。これは、クラスター内の1つのリソースが1つのリモートリポジトリに対応することを意味します。ディレクトリ構造のリファレンスは以下のとおりです。

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

Spark 依存関係 (デフォルトでは `spark-2x.zip` という名前) に加えて、FE は DPP 依存関係もリモートリポジトリにアップロードします。Spark Load によって送信されるすべての依存関係がすでにリモートリポジトリに存在する場合、依存関係を再度アップロードする必要がなく、大量のファイルを繰り返しアップロードする時間を節約できます。

### YARN クライアントの構成

FE 用に Yarn クライアントを構成して、FE が Yarn コマンドを実行して実行中のアプリケーションの状態を取得したり、それを終了したりできるようにします。公式バージョンの Hadoop2 2.5.2 以降の使用をお勧めします ([Hadoop ダウンロードアドレス](https://archive.apache.org/dist/hadoop/common/))。ダウンロード後、以下の手順で設定を完了してください。

- **YARN 実行可能パスの構成**
  
ダウンロードした Yarn クライアントを FE と同じマシンのディレクトリに配置し、FE 設定ファイルで `yarn_client_path` エントリを Yarn のバイナリ実行可能ファイルに設定します。デフォルトでは、このファイルは FE ルートディレクトリの `lib/yarn-client/hadoop/bin/yarn` パスです。

- **YARN の生成に必要な設定ファイルのパスの構成 (オプション)**
  
FE が Yarn クライアントを介してアプリケーションの状態を取得したり、アプリケーションを終了したりする場合、デフォルトでは、StarRocks は FE ルートディレクトリの `lib/yarn-config` パスに Yarn コマンドの実行に必要な設定ファイルを生成します。このパスは、FE 設定ファイルの `yarn_config_dir` エントリを構成することで変更できます。このエントリには現在、`core-site.xml` と `yarn-site.xml` が含まれています。

### インポートジョブの作成

**構文：**

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

**例 1**: アップストリームデータソースが HDFS の場合

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

**例 2**: アップストリームデータソースが Hive の場合。

- ステップ 1: 新しい Hive リソースを作成する

~~~sql
CREATE EXTERNAL RESOURCE hive0
PROPERTIES
( 
    "type" = "hive",
    "hive.metastore.uris" = "thrift://xx.xx.xx.xx:8080"
);
 ~~~

- ステップ 2: 新しい Hive 外部テーブルを作成する

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

- ステップ 3: インポートする StarRocks テーブルの列が Hive 外部テーブルに存在することを要求するロードコマンドを送信します。

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

Spark Load のパラメータの説明:

- **ラベル (Label)**
  
インポートジョブのラベル。各インポートジョブにはラベルがあり、そのラベルはデータベース内で一意であり、Broker Load と同じルールに従います。

- **データ記述型パラメータ**
  
現在、サポートされているデータソースは CSV および Hive テーブルです。その他のルールは Broker Load と同じです。

- **インポートジョブパラメータ**
  
インポートジョブパラメータとは、インポートステートメントの `opt_properties` 部分に属するパラメータを指します。これらのパラメータはインポートジョブ全体に適用されます。ルールは Broker Load と同じです。

- **Spark リソースパラメータ**
  
Spark リソースは StarRocks に事前に構成する必要があり、ユーザーには USAGE-PRIV 権限が付与されている必要があります。そうすることで、Spark Load にリソースを適用できます。
ユーザーが一時的な要件を持つ場合、ジョブにリソースを追加したり、Spark 構成を変更したりするなど、Spark リソースパラメータを設定できます。この設定は、そのジョブにのみ有効であり、StarRocks クラスターの既存の構成には影響しません。

~~~sql
WITH RESOURCE 'spark0'
(
    "spark.driver.memory" = "1g",
    "spark.executor.memory" = "3g"
)
~~~

- **データソースが Hive の場合のインポート**
  
現在、インポートプロセスで Hive テーブルを使用するには、`Hive` 型の外部テーブルを作成し、インポートコマンドを送信する際にその名前を指定する必要があります。

- **グローバル辞書を構築するためのインポートプロセス**
  
Load コマンドでは、グローバル辞書を構築するために必要なフィールドを次の形式で指定できます: `StarRocks フィールド名=bitmap_dict(Hive テーブルフィールド名)`。現在、**アップストリームデータソースが Hive テーブルの場合にのみグローバル辞書がサポートされる**ことに注意してください。

- **バイナリ型データのロード**

v2.5.17 以降、Spark Load はバイナリデータをビットマップデータに変換できる bitmap_from_binary 関数をサポートしています。Hive テーブルまたは HDFS ファイルの列型がバイナリで、StarRocks テーブルの対応する列がビットマップ型の集計列である場合、Load コマンドで次の形式でフィールドを指定できます:`StarRocks フィールド名=bitmap_from_binary(Hive テーブルフィールド名)`。これにより、グローバル辞書を構築する必要がなくなります。

## インポートジョブの表示

Spark Load インポートは非同期であり、Broker Load も同様です。ユーザーはインポートジョブのラベルを記録し、`SHOW LOAD` コマンドでそれを使用してインポート結果を表示する必要があります。インポートを表示するコマンドは、すべてのインポート方法で共通です。以下に例を示します。

返されるパラメータの詳細については、Broker Load を参照してください。違いは以下のとおりです。

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

- **状態 (State)**
  
インポートジョブの現在のフェーズ。
PENDING: ジョブが送信されました。
ETL: Spark ETL が送信されました。
LOADING: FE は BE に Push 操作の実行をスケジュールします。
FINISHED: Push が完了し、バージョンが有効になりました。

インポートジョブには、`CANCELLED` と `FINISHED` の2つの最終フェーズがあり、どちらも Load ジョブが完了したことを示します。`CANCELLED` はインポートの失敗を意味し、`FINISHED` はインポートの成功を意味します。

- **進捗 (Progress)**
  
インポートジョブの進捗の説明。ETL と LOAD の2種類の進捗があり、これらはインポートプロセスの2つのフェーズである ETL と LOADING に対応します。

- LOAD の進捗範囲は 0～100% です。
  
`LOAD 進捗 = 現在完了したすべてのレプリカインポート済みタブレット数 / このインポートジョブのタブレット総数 * 100%`。

- すべてのテーブルがインポートされると、LOAD 進捗は 99% になり、インポートが最終検証フェーズに入ると 100% に変更されます。

- インポート進捗は線形ではありません。一定期間進捗に変化がない場合でも、インポートが実行されていないという意味ではありません。

- **タイプ (Type)**

 インポートジョブのタイプ。SPARK は Spark Load を意味します。

- **CreateTime/EtlStartTime/EtlFinishTime/LoadStartTime/LoadFinishTime**

これらの値は、インポートの作成時間、ETL フェーズの開始時間、ETL フェーズの完了時間、LOADING フェーズの開始時間、およびインポートジョブ全体の完了時間を表します。

- **ジョブ詳細 (JobDetails)**

インポートされたファイル数、合計サイズ (バイト単位)、サブタスク数、処理中の元の行数など、ジョブの詳細な実行状態が表示されます。例：

~~~json
 {"ScannedRows":139264,"TaskNumber":1,"FileNumber":1,"FileSize":940754064}
~~~

- **URL**

入力をブラウザにコピーして、対応するアプリケーションの Web インターフェースにアクセスできます。

### Apache Spark™ Launcher 送信ログの表示

Apache Spark™ ジョブの送信中に生成された詳細ログを確認する必要がある場合があります。デフォルトでは、ログは FE ルートディレクトリの `log/spark_launcher_log` パスに `spark-launcher-{load-job-id}-{label}.log` という名前で保存されます。ログはこのディレクトリに一定期間保存され、FE メタデータ内のインポート情報がクリアされると削除されます。デフォルトの保持期間は3日間です。

### インポートのキャンセル

Spark Load ジョブの状態が `CANCELLED` または `FINISHED` でない場合、ユーザーはインポートジョブのラベルを指定することで手動でキャンセルできます。

---

## 関連システム構成

**FE 構成:** 以下の構成は Spark Load のシステムレベルの構成であり、すべての Spark Load インポートジョブに適用されます。`fe.conf` を変更することで、構成値を調整できます。

- enable-spark-load: Spark Load とリソース作成を有効にします。デフォルト値は false です。
- spark-load-default-timeout-second: ジョブのデフォルトのタイムアウト時間は 259200 秒 (3 日間) です。
- spark-home-default-dir: Spark クライアントのパス (`fe/lib/spark2x`)。
- spark-resource-path: パッケージ化された Spark 依存関係ファイルのパス (デフォルトは空)。
- spark-launcher-log-dir: Spark クライアントの送信ログが保存されるディレクトリ (`fe/log/spark-launcher-log`)。
- yarn-client-path: Yarn バイナリ実行可能ファイルのパス (`fe/lib/yarn-client/hadoop/bin/yarn`)。
- yarn-config-dir: Yarn の設定ファイルパス (`fe/lib/yarn-config`)。

---

## ベストプラクティス

Spark Load を使用するのに最適なシナリオは、元のデータがファイルシステム (HDFS) にあり、データ量が数十 GB から TB レベルの場合です。データ量が少ない場合は、Stream Load または Broker Load を使用してください。

Spark Load インポートの完全な例については、GitHub のデモを参照してください：[https://github.com/StarRocks/demo/blob/master/docs/03_sparkLoad2StarRocks.md](https://github.com/StarRocks/demo/blob/master/docs/03_sparkLoad2StarRocks.md)

## よくある質問

- `エラー: マスター 'yarn' で実行する場合、環境変数 HADOOP-CONF-DIR または YARN-CONF-DIR のいずれかを設定する必要があります。`

 Spark Load を使用する際、Spark クライアントの `spark-env.sh` で `HADOOP-CONF-DIR` 環境変数が構成されていません。

- `エラー: プログラム "xxx/bin/spark-submit" を実行できません: error=2, そのようなファイルまたはディレクトリはありません`

 Spark Load を使用する際、`spark_home_default_dir` 構成項目で Spark クライアントのルートディレクトリが指定されていません。

- `エラー: ファイル xxx/jars/spark-2x.zip は存在しません。`

 Spark Load を使用する際、`spark-resource-path` 構成項目がパッケージ化された zip ファイルを指していません。

- `エラー: パス xxx/yarn-client/hadoop/bin/yarn に yarn クライアントが存在しません。`

 Spark Load を使用する際、yarn-client-path 構成項目で Yarn 実行可能ファイルが指定されていません。

- `エラー: hadoop-yarn/bin/... /libexec/yarn-config.sh を実行できません`

 Hadoop を CDH と組み合わせて使用する場合、`HADOOP_LIBEXEC_DIR` 環境変数を構成する必要があります。
 `hadoop-yarn` と hadoop ディレクトリが異なるため、デフォルトの `libexec` ディレクトリは `hadoop-yarn/bin/... /libexec` を検索しますが、`libexec` は hadoop ディレクトリ内にあります。
 `yarn application status` コマンドが Spark タスクの状態をエラーで報告し、インポートジョブが失敗します。
```
