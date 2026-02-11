---
displayed_sidebar: docs
---

# データのバックアップとリストア

このトピックでは、StarRocksでのデータのバックアップとリストア、または新しいStarRocksクラスターへのデータ移行について説明します。

StarRocksは、データをスナップショットとしてリモートストレージシステムにバックアップし、そのデータを任意のStarRocksクラスターにリストアすることをサポートしています。

v3.4.0以降、StarRocksはより多くのオブジェクトをサポートし、柔軟性を向上させるために構文をリファクタリングすることにより、BACKUPおよびRESTOREの機能を強化しました。

StarRocksは以下のリモートストレージシステムをサポートしています。

- Apache™ Hadoop® (HDFS) クラスター
- AWS S3
- Google GCS
- MinIO

StarRocksは以下のオブジェクトのバックアップをサポートしています。

- 内部データベース、テーブル（全てのタイプとパーティショニング戦略）、およびパーティション
- 外部カタログのメタデータ（v3.4.0以降でサポート）
- 同期マテリアライズドビューと非同期マテリアライズドビュー
- 論理ビュー（v3.4.0以降でサポート）
- ユーザー定義関数 (UDF)（v3.4.0以降でサポート）

> **NOTE**
>
> Shared-data StarRocksクラスターはデータのBACKUPとRESTOREをサポートしていません。

## リポジトリの作成

データをバックアップする前に、リポジトリを作成する必要があります。これはリモートストレージシステムにデータスナップショットを保存するために使用されます。StarRocksクラスター内に複数のリポジトリを作成できます。詳細な手順については、[CREATE REPOSITORY](../../sql-reference/sql-statements/backup_restore/CREATE_REPOSITORY.md)を参照してください。

- HDFSにリポジトリを作成する

以下の例は、HDFSクラスターに`test_repo`という名前のリポジトリを作成します。

```SQL
CREATE REPOSITORY test_repo
WITH BROKER
ON LOCATION "hdfs://<hdfs_host>:<hdfs_port>/repo_dir/backup"
PROPERTIES(
    "username" = "<hdfs_username>",
    "password" = "<hdfs_password>"
);
```

- AWS S3にリポジトリを作成する

  AWS S3へのアクセス認証方法として、IAMユーザーベースの認証情報（Access KeyとSecret Key）、Instance Profile、またはAssumed Roleを選択できます。

  - 以下の例は、IAMユーザーベースの認証情報を認証方法として使用し、AWS S3バケット`bucket_s3`に`test_repo`という名前のリポジトリを作成します。

  ```SQL
  CREATE REPOSITORY test_repo
  WITH BROKER
  ON LOCATION "s3a://bucket_s3/backup"
  PROPERTIES(
      "aws.s3.access_key" = "XXXXXXXXXXXXXXXXX",
      "aws.s3.secret_key" = "yyyyyyyyyyyyyyyyyyyyyyyy",
      "aws.s3.region" = "us-east-1"
  );
  ```

  - 以下の例は、Instance Profileを認証方法として使用し、AWS S3バケット`bucket_s3`に`test_repo`という名前のリポジトリを作成します。

  ```SQL
  CREATE REPOSITORY test_repo
  WITH BROKER
  ON LOCATION "s3a://bucket_s3/backup"
  PROPERTIES(
      "aws.s3.use_instance_profile" = "true",
      "aws.s3.region" = "us-east-1"
  );
  ```

  - 以下の例は、Assumed Roleを認証方法として使用し、AWS S3バケット`bucket_s3`に`test_repo`という名前のリポジトリを作成します。

  ```SQL
  CREATE REPOSITORY test_repo
  WITH BROKER
  ON LOCATION "s3a://bucket_s3/backup"
  PROPERTIES(
      "aws.s3.use_instance_profile" = "true",
      "aws.s3.iam_role_arn" = "arn:aws:iam::xxxxxxxxxx:role/yyyyyyyy",
      "aws.s3.region" = "us-east-1"
  );
  ```

> **NOTE**
>
> StarRocksは、S3Aプロトコルにのみ従ってAWS S3にリポジトリを作成することをサポートしています。したがって、AWS S3にリポジトリを作成する際は、`ON LOCATION`でリポジトリのロケーションとして渡すS3 URIの`s3://`を`s3a://`に置き換える必要があります。

- Google GCSにリポジトリを作成する

以下の例は、Google GCSバケット`bucket_gcs`に`test_repo`という名前のリポジトリを作成します。

```SQL
CREATE REPOSITORY test_repo
WITH BROKER
ON LOCATION "s3a://bucket_gcs/backup"
PROPERTIES(
    "fs.s3a.access.key" = "xxxxxxxxxxxxxxxxxxxx",
    "fs.s3a.secret.key" = "yyyyyyyyyyyyyyyyyyyy",
    "fs.s3a.endpoint" = "storage.googleapis.com"
);
```

> **NOTE**
>
> - StarRocksは、S3Aプロトコルにのみ従ってGoogle GCSにリポジトリを作成することをサポートしています。したがって、Google GCSにリポジトリを作成する際は、`ON LOCATION`でリポジトリのロケーションとして渡すGCS URIのプレフィックスを`s3a://`に置き換える必要があります。
> - エンドポイントアドレスに`https`を指定しないでください。

- MinIOにリポジトリを作成する

以下の例は、MinIOバケット`bucket_minio`に`test_repo`という名前のリポジトリを作成します。

```SQL
CREATE REPOSITORY test_repo
WITH BROKER
ON LOCATION "s3://bucket_minio/backup"
PROPERTIES(
    "aws.s3.access_key" = "XXXXXXXXXXXXXXXXX",
    "aws.s3.secret_key" = "yyyyyyyyyyyyyyyyy",
    "aws.s3.endpoint" = "http://minio:9000"
);
```

リポジトリが作成された後、[SHOW REPOSITORIES](../../sql-reference/sql-statements/backup_restore/SHOW_REPOSITORIES.md)を使用してリポジトリを確認できます。データをリストアした後、[DROP REPOSITORY](../../sql-reference/sql-statements/backup_restore/DROP_REPOSITORY.md)を使用してStarRocks内のリポジトリを削除できます。ただし、リモートストレージシステムにバックアップされたデータスナップショットはStarRocks経由で削除することはできません。リモートストレージシステムで手動で削除する必要があります。

## データのバックアップ

リポジトリが作成されたら、データスナップショットを作成し、リモートリポジトリにバックアップする必要があります。詳細な手順については、[BACKUP](../../sql-reference/sql-statements/backup_restore/BACKUP.md)を参照してください。BACKUPは非同期操作です。[SHOW BACKUP](../../sql-reference/sql-statements/backup_restore/SHOW_BACKUP.md)を使用してBACKUPジョブのステータスを確認したり、[CANCEL BACKUP](../../sql-reference/sql-statements/backup_restore/CANCEL_BACKUP.md)を使用してBACKUPジョブをキャンセルしたりできます。

StarRocksは、データベース、テーブル、またはパーティションの粒度でのFULLバックアップをサポートしています。

テーブルに大量のデータを保存している場合、パーティションごとにデータをバックアップおよびリストアすることをお勧めします。これにより、ジョブの失敗時の再試行コストを削減できます。定期的に増分データをバックアップする必要がある場合は、テーブルに[パーティショニングプラン](../../table_design/data_distribution/Data_distribution.md#partitioning)を設定し、毎回新しいパーティションのみをバックアップできます。

### データベースのバックアップ

データベースに対して完全なBACKUPを実行すると、そのデータベース内のすべてのテーブル、同期および非同期マテリアライズドビュー、論理ビュー、およびUDFがバックアップされます。

以下の例は、データベース`sr_hub`をスナップショット`sr_hub_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
-- v3.4.0以降でサポート。
BACKUP DATABASE sr_hub SNAPSHOT sr_hub_backup
TO test_repo;

-- 以前のバージョンでの構文と互換性があります。
BACKUP SNAPSHOT sr_hub.sr_hub_backup
TO test_repo;
```

### テーブルのバックアップ

StarRocksは、全てのタイプとパーティショニング戦略のテーブルのバックアップとリストアをサポートしています。テーブルに対して完全なBACKUPを実行すると、そのテーブルと、その上に構築された同期マテリアライズドビューがバックアップされます。

以下の例は、データベース`sr_hub`からテーブル`sr_member`をスナップショット`sr_member_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
-- v3.4.0以降でサポート。
BACKUP DATABASE sr_hub SNAPSHOT sr_member_backup
TO test_repo
ON (TABLE sr_member);

-- 以前のバージョンでの構文と互換性があります。
BACKUP SNAPSHOT sr_hub.sr_member_backup
TO test_repo
ON (sr_member);
```

以下の例は、データベース`sr_hub`から2つのテーブル`sr_member`と`sr_pmc`をスナップショット`sr_core_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_core_backup
TO test_repo
ON (TABLE sr_member, TABLE sr_pmc);
```

以下の例は、データベース`sr_hub`からすべてのテーブルをスナップショット`sr_all_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_all_backup
TO test_repo
ON (ALL TABLES);
```

### パーティションのバックアップ

以下の例は、データベース`sr_hub`のテーブル`sr_member`のパーティション`p1`をスナップショット`sr_par_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
-- v3.4.0以降でサポート。
BACKUP DATABASE sr_hub SNAPSHOT sr_par_backup
TO test_repo
ON (TABLE sr_member PARTITION (p1));

-- 以前のバージョンでの構文と互換性があります。
BACKUP SNAPSHOT sr_hub.sr_par_backup
TO test_repo
ON (sr_member PARTITION (p1));
```

複数のパーティション名をコンマ (`,`) で区切って指定することで、パーティションを一括でバックアップできます。

### マテリアライズドビューのバックアップ

同期マテリアライズドビューは、ベーステーブルのBACKUP操作と同時にバックアップされるため、手動でバックアップする必要はありません。

非同期マテリアライズドビューは、それが属するデータベースのBACKUP操作と同時にバックアップできます。手動でバックアップすることもできます。

以下の例は、データベース`sr_hub`からマテリアライズドビュー`sr_mv1`をスナップショット`sr_mv1_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_mv1_backup
TO test_repo
ON (MATERIALIZED VIEW sr_mv1);
```

以下の例は、データベース`sr_hub`から2つのマテリアライズドビュー`sr_mv1`と`sr_mv2`をスナップショット`sr_mv2_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_mv2_backup
TO test_repo
ON (MATERIALIZED VIEW sr_mv1, MATERIALIZED VIEW sr_mv2);
```

以下の例は、データベース`sr_hub`からすべてのマテリアライズドビューをスナップショット`sr_mv3_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_mv3_backup
TO test_repo
ON (ALL MATERIALIZED VIEWS);
```

### 論理ビューのバックアップ

以下の例は、データベース`sr_hub`から論理ビュー`sr_view1`をスナップショット`sr_view1_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_view1_backup
TO test_repo
ON (VIEW sr_view1);
```

以下の例は、データベース`sr_hub`から2つの論理ビュー`sr_view1`と`sr_view2`をスナップショット`sr_view2_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_view2_backup
TO test_repo
ON (VIEW sr_view1, VIEW sr_view2);
```

以下の例は、データベース`sr_hub`からすべての論理ビューをスナップショット`sr_view3_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_view3_backup
TO test_repo
ON (ALL VIEWS);
```

### UDFのバックアップ

以下の例は、データベース`sr_hub`からUDF`sr_udf1`をスナップショット`sr_udf1_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_udf1_backup
TO test_repo
ON (FUNCTION sr_udf1);
```

以下の例は、データベース`sr_hub`から2つのUDF`sr_udf1`と`sr_udf2`をスナップショット`sr_udf2_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_udf2_backup
TO test_repo
ON (FUNCTION sr_udf1, FUNCTION sr_udf2);
```

以下の例は、データベース`sr_hub`からすべてのUDFをスナップショット`sr_udf3_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_udf3_backup
TO test_repo
ON (ALL FUNCTIONS);
```

### 外部カタログのメタデータのバックアップ

以下の例は、外部カタログ`iceberg`のメタデータをスナップショット`iceberg_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP EXTERNAL CATALOG (iceberg) SNAPSHOT iceberg_backup
TO test_repo;
```

以下の例は、2つの外部カタログ`iceberg`と`hive`のメタデータをスナップショット`iceberg_hive_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP EXTERNAL CATALOGS (iceberg, hive) SNAPSHOT iceberg_hive_backup
TO test_repo;
```

以下の例は、すべての外部カタログのメタデータをスナップショット`all_catalog_backup`としてバックアップし、そのスナップショットをリポジトリ`test_repo`にアップロードします。

```SQL
BACKUP ALL EXTERNAL CATALOGS SNAPSHOT all_catalog_backup
TO test_repo;
```

外部カタログに対するBACKUP操作をキャンセルするには、次のステートメントを実行します。

```SQL
CANCEL BACKUP FOR EXTERNAL CATALOG;
```

## データのリストア

リモートストレージシステムにバックアップされたデータスナップショットを、現在のStarRocksクラスターまたは他のStarRocksクラスターにリストアして、データを回復または移行できます。

**スナップショットからオブジェクトをリストアする際は、スナップショットのタイムスタンプを指定する必要があります。**

リモートストレージシステム内のデータスナップショットをリストアするには、[RESTORE](../../sql-reference/sql-statements/backup_restore/RESTORE.md)ステートメントを使用します。

RESTOREは非同期操作です。[SHOW RESTORE](../../sql-reference/sql-statements/backup_restore/SHOW_RESTORE.md)を使用してRESTOREジョブのステータスを確認したり、[CANCEL RESTORE](../../sql-reference/sql-statements/backup_restore/CANCEL_RESTORE.md)を使用してRESTOREジョブをキャンセルしたりできます。

### （オプション）新しいクラスターにリポジトリを作成する

データを別のStarRocksクラスターに移行するには、ターゲットクラスターで同じ**リポジトリ名**と**ロケーション**を持つリポジトリを作成する必要があります。そうしないと、以前にバックアップされたデータスナップショットを表示できません。詳細については、[リポジトリの作成](#create-a-repository)を参照してください。

### スナップショットタイムスタンプの取得

データをリストアする前に、[SHOW SNAPSHOT](../../sql-reference/sql-statements/backup_restore/SHOW_SNAPSHOT.md)を使用してリポジトリ内のスナップショットを確認し、タイムスタンプを取得できます。

以下の例は、`test_repo`内のスナップショット情報を確認します。

```Plain
mysql> SHOW SNAPSHOT ON test_repo;
+------------------+-------------------------+--------+
| Snapshot         | Timestamp               | Status |
+------------------+-------------------------+--------+
| sr_member_backup | 2023-02-07-14-45-53-143 | OK     |
+------------------+-------------------------+--------+
1 row in set (1.16 sec)
```

### データベースのリストア

以下の例は、スナップショット`sr_hub_backup`内のデータベース`sr_hub`をターゲットクラスター内のデータベース`sr_hub`にリストアします。スナップショットにデータベースが存在しない場合、システムはエラーを返します。ターゲットクラスターにデータベースが存在しない場合、システムは自動的に作成します。

```SQL
-- v3.4.0以降でサポート。
RESTORE SNAPSHOT sr_hub_backup
FROM test_repo
DATABASE sr_hub
PROPERTIES("backup_timestamp" = "2024-12-09-10-25-58-842");

-- 以前のバージョンでの構文と互換性があります。
RESTORE SNAPSHOT sr_hub.sr_hub_backup
FROM `test_repo` 
PROPERTIES("backup_timestamp" = "2024-12-09-10-25-58-842");
```

以下の例は、スナップショット`sr_hub_backup`内のデータベース`sr_hub`をターゲットクラスター内のデータベース`sr_hub_new`にリストアします。スナップショットにデータベース`sr_hub`が存在しない場合、システムはエラーを返します。ターゲットクラスターにデータベース`sr_hub_new`が存在しない場合、システムは自動的に作成します。

```SQL
-- v3.4.0以降でサポート。
RESTORE SNAPSHOT sr_hub_backup
FROM test_repo
DATABASE sr_hub AS sr_hub_new
PROPERTIES("backup_timestamp" = "2024-12-09-10-25-58-842");
```

### テーブルのリストア

以下の例は、スナップショット`sr_member_backup`内のデータベース`sr_hub`のテーブル`sr_member`を、ターゲットクラスター内のデータベース`sr_hub`のテーブル`sr_member`にリストアします。

```SQL
-- v3.4.0以降でサポート。
RESTORE SNAPSHOT sr_member_backup
FROM test_repo 
DATABASE sr_hub 
ON (TABLE sr_member) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");

-- 以前のバージョンでの構文と互換性があります。
RESTORE SNAPSHOT sr_hub.sr_member_backup
FROM test_repo
ON (sr_member)
PROPERTIES ("backup_timestamp"="2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_member_backup`内のデータベース`sr_hub`のテーブル`sr_member`を、ターゲットクラスター内のデータベース`sr_hub_new`のテーブル`sr_member_new`にリストアします。

```SQL
RESTORE SNAPSHOT sr_member_backup
FROM test_repo 
DATABASE sr_hub  AS sr_hub_new
ON (TABLE sr_member AS sr_member_new) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_core_backup`内のデータベース`sr_hub`の2つのテーブル`sr_member`と`sr_pmc`を、ターゲットクラスター内のデータベース`sr_hub`の2つのテーブル`sr_member`と`sr_pmc`にリストアします。

```SQL
RESTORE SNAPSHOT sr_core_backup
FROM test_repo 
DATABASE sr_hub
ON (TABLE sr_member, TABLE sr_pmc) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_all_backup`内のデータベース`sr_hub`からすべてのテーブルをリストアします。

```SQL
RESTORE SNAPSHOT sr_all_backup
FROM test_repo
DATABASE sr_hub
ON (ALL TABLES);
```

以下の例は、スナップショット`sr_all_backup`内のデータベース`sr_hub`からすべてのテーブルのうちの1つをリストアします。

```SQL
RESTORE SNAPSHOT sr_all_backup
FROM test_repo
DATABASE sr_hub
ON (TABLE sr_member) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

### パーティションのリストア

以下の例は、スナップショット`sr_par_backup`内のテーブル`sr_member`のパーティション`p1`を、ターゲットクラスター内のテーブル`sr_member`のパーティション`p1`にリストアします。

```SQL
-- v3.4.0以降でサポート。
RESTORE SNAPSHOT sr_par_backup
FROM test_repo
DATABASE sr_hub
ON (TABLE sr_member PARTITION (p1)) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");

-- 以前のバージョンでの構文と互換性があります。
RESTORE SNAPSHOT sr_hub.sr_par_backup
FROM test_repo
ON (sr_member PARTITION (p1)) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

複数のパーティション名をコンマ (`,`) で区切って指定することで、パーティションを一括でリストアできます。

### マテリアライズドビューのリストア

以下の例は、スナップショット`sr_mv1_backup`内のデータベース`sr_hub`からマテリアライズドビュー`sr_mv1`をターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_mv1_backup
FROM test_repo
DATABASE sr_hub
ON (MATERIALIZED VIEW sr_mv1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_mv2_backup`内のデータベース`sr_hub`から2つのマテリアライズドビュー`sr_mv1`と`sr_mv2`をターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_mv2_backup
FROM test_repo
DATABASE sr_hub
ON (MATERIALIZED VIEW sr_mv1, MATERIALIZED VIEW sr_mv2) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_mv3_backup`内のデータベース`sr_hub`からすべてのマテリアライズドビューをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_mv3_backup
FROM test_repo
DATABASE sr_hub
ON (ALL MATERIALIZED VIEWS) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_mv3_backup`内のデータベース`sr_hub`からすべてのマテリアライズドビューのうちの1つをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_mv3_backup
FROM test_repo
DATABASE sr_hub
ON (MATERIALIZED VIEW sr_mv1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

:::info

RESTORE後、[SHOW MATERIALIZED VIEWS](../../sql-reference/sql-statements/materialized_view/SHOW_MATERIALIZED_VIEW.md)を使用してマテリアライズドビューのステータスを確認できます。

- マテリアライズドビューがアクティブな場合は、直接使用できます。
- マテリアライズドビューが非アクティブな場合は、そのベーステーブルがリストアされていないためである可能性があります。すべてのベーステーブルがリストアされた後、[ALTER MATERIALIZED VIEW](../../sql-reference/sql-statements/materialized_view/ALTER_MATERIALIZED_VIEW.md)を使用してマテリアライズドビューを再アクティブ化できます。

:::

### 論理ビューのリストア

以下の例は、スナップショット`sr_view1_backup`内のデータベース`sr_hub`から論理ビュー`sr_view1`をターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_view1_backup
FROM test_repo
DATABASE sr_hub
ON (VIEW sr_view1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_view2_backup`内のデータベース`sr_hub`から2つの論理ビュー`sr_view1`と`sr_view2`をターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_view2_backup
FROM test_repo
DATABASE sr_hub
ON (VIEW sr_view1, VIEW sr_view2) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_view3_backup`内のデータベース`sr_hub`からすべての論理ビューをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_view3_backup
FROM test_repo
DATABASE sr_hub
ON (ALL VIEWS) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_view3_backup`内のデータベース`sr_hub`からすべての論理ビューのうちの1つをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_view3_backup
FROM test_repo
DATABASE sr_hub
ON (VIEW sr_view1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

### UDFのリストア

以下の例は、スナップショット`sr_udf1_backup`内のデータベース`sr_hub`からUDF`sr_udf1`をターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_udf1_backup
FROM test_repo
DATABASE sr_hub
ON (FUNCTION sr_udf1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_udf2_backup`内のデータベース`sr_hub`から2つのUDF`sr_udf1`と`sr_udf2`をターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_udf2_backup
FROM test_repo
DATABASE sr_hub
ON (FUNCTION sr_udf1, FUNCTION sr_udf2) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_udf3_backup`内のデータベース`sr_hub`からすべてのUDFをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_udf3_backup
FROM test_repo
DATABASE sr_hub
ON (ALL FUNCTIONS) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`sr_udf3_backup`内のデータベース`sr_hub`からすべてのUDFのうちの1つをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT sr_udf3_backup
FROM test_repo
DATABASE sr_hub
ON (FUNCTION sr_udf1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

### 外部カタログのメタデータのリストア

以下の例は、スナップショット`iceberg_backup`内の外部カタログ`iceberg`のメタデータをターゲットクラスターにリストアし、`iceberg_new`として名前を変更します。

```SQL
RESTORE SNAPSHOT iceberg_backup
FROM test_repo
EXTERNAL CATALOG (iceberg AS iceberg_new) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`iceberg_hive_backup`内の2つの外部カタログ`iceberg`と`hive`のメタデータをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT iceberg_hive_backup
FROM test_repo 
EXTERNAL CATALOGS (iceberg, hive)
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下の例は、スナップショット`all_catalog_backup`内のすべての外部カタログのメタデータをターゲットクラスターにリストアします。

```SQL
RESTORE SNAPSHOT all_catalog_backup
FROM test_repo 
ALL EXTERNAL CATALOGS
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

外部カタログに対するRESTORE操作をキャンセルするには、次のステートメントを実行します。

```SQL
CANCEL RESTORE FOR EXTERNAL CATALOG;
```

## BACKUPまたはRESTOREジョブの構成

BE構成ファイル**be.conf**で以下の構成項目を修正することで、BACKUPまたはRESTOREジョブのパフォーマンスを最適化できます。

| 構成項目                | 説明                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `make_snapshot_worker_count`     | BEノード上のBACKUPジョブのスナップショット作成タスクのスレッドの最大数。デフォルト: `5`。この構成項目の値を増やすと、スナップショット作成タスクの並行度が高まります。 |
| `release_snapshot_worker_count`     | BEノード上の失敗したBACKUPジョブのスナップショット解放タスクのスレッドの最大数。デフォルト: `5`。この構成項目の値を増やすと、スナップショット解放タスクの並行度が高まります。 |
| `upload_worker_count`     | BEノード上のBACKUPジョブのアップロードタスクのスレッドの最大数。デフォルト: `0`。`0`は、BEが存在するマシンのCPUコア数に値を設定することを示します。この構成項目の値を増やすと、アップロードタスクの並行度が高まります。 |
| `download_worker_count`   | BEノード上のRESTOREジョブのダウンロードタスクのスレッドの最大数。デフォルト: `0`。`0`は、BEが存在するマシンのCPUコア数に値を設定することを示します。この構成項目の値を増やすと、ダウンロードタスクの並行度が高まります。 |

## 使用上の注意

- グローバル、データベース、テーブル、パーティションレベルでのバックアップおよびリストア操作には、異なる権限が必要です。詳細については、[シナリオに応じたロールのカスタマイズ](../user_privs/authorization/User_privilege.md#customize-roles-based-on-scenarios)を参照してください。
- 各データベースでは、同時に実行できるBACKUPまたはRESTOREジョブは1つだけです。そうでない場合、StarRocksはエラーを返します。
- BACKUPおよびRESTOREジョブはStarRocksクラスターの多くのリソースを占有するため、StarRocksクラスターの負荷が低いときにデータをバックアップおよびリストアすることをお勧めします。
- StarRocksは、データバックアップのためのデータ圧縮アルゴリズムの指定をサポートしていません。
- データはスナップショットとしてバックアップされるため、スナップショット生成時にロードされたデータはスナップショットに含まれません。したがって、スナップショットが生成された後、かつRESTOREジョブが完了する前に古いクラスターにデータをロードした場合、そのデータをリストア先のクラスターにもロードする必要があります。データ移行が完了した後、一定期間両方のクラスターにデータを並行してロードし、データとサービスの正確性を検証した上で、アプリケーションを新しいクラスターに移行することをお勧めします。
- RESTOREジョブが完了するまで、リストア対象のテーブルを操作することはできません。
- Primary Keyテーブルは、v2.5より前のStarRocksクラスターにリストアすることはできません。
- リストアするテーブルは、リストア前に新しいクラスターで作成する必要はありません。RESTOREジョブが自動的に作成します。
- リストア対象のテーブルと同じ名前の既存テーブルがある場合、StarRocksはまず既存テーブルのスキーマがリストア対象テーブルのスキーマと一致するかどうかを確認します。スキーマが一致する場合、StarRocksは既存テーブルをスナップショット内のデータで上書きします。スキーマが一致しない場合、RESTOREジョブは失敗します。キーワード`AS`を使用してリストア対象のテーブルの名前を変更するか、データをリストアする前に既存のテーブルを削除することができます。
- RESTOREジョブが既存のデータベース、テーブル、またはパーティションを上書きする場合、ジョブがCOMMITフェーズに入った後、上書きされたデータを元に戻すことはできません。この時点でRESTOREジョブが失敗またはキャンセルされた場合、データが破損し、アクセスできなくなる可能性があります。この場合、RESTORE操作を再度実行し、ジョブが完了するのを待つしかありません。したがって、現在のデータがもう使用されていないことを確認できない限り、上書きによるデータのリストアは推奨されません。上書き操作は、まずスナップショットと既存のデータベース、テーブル、またはパーティション間のメタデータの整合性をチェックします。不整合が検出された場合、RESTORE操作は実行できません。
- 現在、StarRocksはユーザーアカウント、権限、およびリソースグループに関連する構成データのバックアップとリストアをサポートしていません。
- 現在、StarRocksはテーブル間のColocate Join関係のバックアップとリストアをサポートしていません。
