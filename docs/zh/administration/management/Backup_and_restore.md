---
displayed_sidebar: docs
---

# 备份和恢复数据

本文介绍如何在 StarRocks 中备份和恢复数据，或将数据迁移到新的 StarRocks 集群。

StarRocks 支持将数据以快照形式备份到远程存储系统，并可将数据恢复到任意 StarRocks 集群。

从 v3.4.0 版本开始，StarRocks 增强了 BACKUP 和 RESTORE 的功能，支持更多对象并重构了语法以提供更好的灵活性。

StarRocks 支持以下远程存储系统：

- Apache™ Hadoop® (HDFS) 集群
- AWS S3
- Google GCS
- MinIO

StarRocks 支持备份以下对象：

- 内部数据库、表（所有类型和分区策略）以及分区
- 外部 Catalog 的元数据（v3.4.0 版本及以后支持）
- 同步物化视图和异步物化视图
- 逻辑视图（v3.4.0 版本及以后支持）
- 用户自定义函数（v3.4.0 版本及以后支持）

> **注意**
>
> 共享数据 StarRocks 集群不支持数据 BACKUP 和 RESTORE。

## 创建仓库

在备份数据之前，您需要创建一个仓库，用于在远程存储系统中存储数据快照。您可以在 StarRocks 集群中创建多个仓库。有关详细说明，请参阅 [CREATE REPOSITORY](../../sql-reference/sql-statements/backup_restore/CREATE_REPOSITORY.md)。

- 在 HDFS 中创建仓库

以下示例在 HDFS 集群中创建了一个名为 `test_repo` 的仓库。

```SQL
CREATE REPOSITORY test_repo
WITH BROKER
ON LOCATION "hdfs://<hdfs_host>:<hdfs_port>/repo_dir/backup"
PROPERTIES(
    "username" = "<hdfs_username>", // 用户名
    "password" = "<hdfs_password>"  // 密码
);
```

- 在 AWS S3 中创建仓库

  您可以选择基于 IAM 用户的凭证（Access Key 和 Secret Key）、Instance Profile 或 Assumed Role 作为访问 AWS S3 的凭证方式。

  - 以下示例在 AWS S3 存储桶 `bucket_s3` 中创建了一个名为 `test_repo` 的仓库，使用基于 IAM 用户的凭证作为凭证方式。

  ```SQL
  CREATE REPOSITORY test_repo
  WITH BROKER
  ON LOCATION "s3a://bucket_s3/backup"
  PROPERTIES(
      "aws.s3.access_key" = "XXXXXXXXXXXXXXXXX", // Access Key
      "aws.s3.secret_key" = "yyyyyyyyyyyyyyyyyyyyyyyy", // Secret Key
      "aws.s3.region" = "us-east-1" // 地域
  );
  ```

  - 以下示例在 AWS S3 存储桶 `bucket_s3` 中创建了一个名为 `test_repo` 的仓库，使用 Instance Profile 作为凭证方式。

  ```SQL
  CREATE REPOSITORY test_repo
  WITH BROKER
  ON LOCATION "s3a://bucket_s3/backup"
  PROPERTIES(
      "aws.s3.use_instance_profile" = "true", // 是否使用 Instance Profile
      "aws.s3.region" = "us-east-1" // 地域
  );
  ```

  - 以下示例在 AWS S3 存储桶 `bucket_s3` 中创建了一个名为 `test_repo` 的仓库，使用 Assumed Role 作为凭证方式。

  ```SQL
  CREATE REPOSITORY test_repo
  WITH BROKER
  ON LOCATION "s3a://bucket_s3/backup"
  PROPERTIES(
      "aws.s3.use_instance_profile" = "true", // 是否使用 Instance Profile
      "aws.s3.iam_role_arn" = "arn:aws:iam::xxxxxxxxxx:role/yyyyyyyy", // IAM Role ARN
      "aws.s3.region" = "us-east-1" // 地域
  );
  ```

> **注意**
>
> StarRocks 仅支持按照 S3A 协议在 AWS S3 中创建仓库。因此，当您在 AWS S3 中创建仓库时，必须将 `ON LOCATION` 中作为仓库位置传入的 S3 URI 中的 `s3://` 替换为 `s3a://`。

- 在 Google GCS 中创建仓库

以下示例在 Google GCS 存储桶 `bucket_gcs` 中创建了一个名为 `test_repo` 的仓库。

```SQL
CREATE REPOSITORY test_repo
WITH BROKER
ON LOCATION "s3a://bucket_gcs/backup"
PROPERTIES(
    "fs.s3a.access.key" = "xxxxxxxxxxxxxxxxxxxx", // Access Key
    "fs.s3a.secret.key" = "yyyyyyyyyyyyyyyyyyyy", // Secret Key
    "fs.s3a.endpoint" = "storage.googleapis.com" // Endpoint
);
```

> **注意**
>
> - StarRocks 仅支持按照 S3A 协议在 Google GCS 中创建仓库。因此，当您在 Google GCS 中创建仓库时，必须将 `ON LOCATION` 中作为仓库位置传入的 GCS URI 中的前缀替换为 `s3a://`。
> - 请勿在 endpoint 地址中指定 `https`。

- 在 MinIO 中创建仓库

以下示例在 MinIO 存储桶 `bucket_minio` 中创建了一个名为 `test_repo` 的仓库。

```SQL
CREATE REPOSITORY test_repo
WITH BROKER
ON LOCATION "s3://bucket_minio/backup"
PROPERTIES(
    "aws.s3.access_key" = "XXXXXXXXXXXXXXXXX", // Access Key
    "aws.s3.secret_key" = "yyyyyyyyyyyyyyyyy", // Secret Key
    "aws.s3.endpoint" = "http://minio:9000" // Endpoint
);
```

仓库创建完成后，您可以通过 [SHOW REPOSITORIES](../../sql-reference/sql-statements/backup_restore/SHOW_REPOSITORIES.md) 查看仓库。数据恢复后，您可以使用 [DROP REPOSITORY](../../sql-reference/sql-statements/backup_restore/DROP_REPOSITORY.md) 在 StarRocks 中删除仓库。但是，备份在远程存储系统中的数据快照无法通过 StarRocks 删除。您需要手动在远程存储系统中删除它们。

## 备份数据

仓库创建完成后，您需要在远程仓库中创建并备份数据快照。有关详细说明，请参阅 [BACKUP](../../sql-reference/sql-statements/backup_restore/BACKUP.md)。BACKUP 是一个异步操作。您可以使用 [SHOW BACKUP](../../sql-reference/sql-statements/backup_restore/SHOW_BACKUP.md) 查看 BACKUP 作业的状态，或使用 [CANCEL BACKUP](../../sql-reference/sql-statements/backup_restore/CANCEL_BACKUP.md) 取消 BACKUP 作业。

StarRocks 支持在数据库、表或分区粒度上进行 FULL 备份。

如果您的表中存储了大量数据，建议您按分区进行数据备份和恢复。这样可以减少作业失败时的重试成本。如果您需要定期备份增量数据，可以为表配置一个 [分区方案](../../table_design/data_distribution/Data_distribution.md#partitioning)，每次只备份新分区。

### 备份数据库

对数据库执行完整 BACKUP 操作将备份数据库中的所有表、同步和异步物化视图、逻辑视图和 UDF。

以下示例将数据库 `sr_hub` 备份到快照 `sr_hub_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
-- v3.4.0 及以后版本支持。
BACKUP DATABASE sr_hub SNAPSHOT sr_hub_backup
TO test_repo;

-- 兼容早期版本语法。
BACKUP SNAPSHOT sr_hub.sr_hub_backup
TO test_repo;
```

### 备份表

StarRocks 支持备份和恢复所有类型和分区策略的表。对表执行完整 BACKUP 操作将备份该表及其上构建的同步物化视图。

以下示例将数据库 `sr_hub` 中的表 `sr_member` 备份到快照 `sr_member_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
-- v3.4.0 及以后版本支持。
BACKUP DATABASE sr_hub SNAPSHOT sr_member_backup
TO test_repo
ON (TABLE sr_member);

-- 兼容早期版本语法。
BACKUP SNAPSHOT sr_hub.sr_member_backup
TO test_repo
ON (sr_member);
```

以下示例将数据库 `sr_hub` 中的两张表 `sr_member` 和 `sr_pmc` 备份到快照 `sr_core_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_core_backup
TO test_repo
ON (TABLE sr_member, TABLE sr_pmc);
```

以下示例将数据库 `sr_hub` 中的所有表备份到快照 `sr_all_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_all_backup
TO test_repo
ON (ALL TABLES);
```

### 备份分区

以下示例将数据库 `sr_hub` 中表 `sr_member` 的分区 `p1` 备份到快照 `sr_par_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
-- v3.4.0 及以后版本支持。
BACKUP DATABASE sr_hub SNAPSHOT sr_par_backup
TO test_repo
ON (TABLE sr_member PARTITION (p1));

-- 兼容早期版本语法。
BACKUP SNAPSHOT sr_hub.sr_par_backup
TO test_repo
ON (sr_member PARTITION (p1));
```

您可以指定多个分区名（用逗号 (`,`) 分隔）来批量备份分区。

### 备份物化视图

您无需手动备份同步物化视图，因为它们会随同基础表的 BACKUP 操作一起备份。

异步物化视图可以随同其所属数据库的 BACKUP 操作一起备份。您也可以手动备份它们。

以下示例将数据库 `sr_hub` 中的物化视图 `sr_mv1` 备份到快照 `sr_mv1_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_mv1_backup
TO test_repo
ON (MATERIALIZED VIEW sr_mv1);
```

以下示例将数据库 `sr_hub` 中的两个物化视图 `sr_mv1` 和 `sr_mv2` 备份到快照 `sr_mv2_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_mv2_backup
TO test_repo
ON (MATERIALIZED VIEW sr_mv1, MATERIALIZED VIEW sr_mv2);
```

以下示例将数据库 `sr_hub` 中的所有物化视图备份到快照 `sr_mv3_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_mv3_backup
TO test_repo
ON (ALL MATERIALIZED VIEWS);
```

### 备份逻辑视图

以下示例将数据库 `sr_hub` 中的逻辑视图 `sr_view1` 备份到快照 `sr_view1_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_view1_backup
TO test_repo
ON (VIEW sr_view1);
```

以下示例将数据库 `sr_hub` 中的两个逻辑视图 `sr_view1` 和 `sr_view2` 备份到快照 `sr_view2_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_view2_backup
TO test_repo
ON (VIEW sr_view1, VIEW sr_view2);
```

以下示例将数据库 `sr_hub` 中的所有逻辑视图备份到快照 `sr_view3_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_view3_backup
TO test_repo
ON (ALL VIEWS);
```

### 备份 UDF

以下示例将数据库 `sr_hub` 中的 UDF `sr_udf1` 备份到快照 `sr_udf1_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_udf1_backup
TO test_repo
ON (FUNCTION sr_udf1);
```

以下示例将数据库 `sr_hub` 中的两个 UDF `sr_udf1` 和 `sr_udf2` 备份到快照 `sr_udf2_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_udf2_backup
TO test_repo
ON (FUNCTION sr_udf1, FUNCTION sr_udf2);
```

以下示例将数据库 `sr_hub` 中的所有 UDF 备份到快照 `sr_udf3_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP DATABASE sr_hub SNAPSHOT sr_udf3_backup
TO test_repo
ON (ALL FUNCTIONS);
```

### 备份外部 Catalog 的元数据

以下示例将外部 Catalog `iceberg` 的元数据备份到快照 `iceberg_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP EXTERNAL CATALOG (iceberg) SNAPSHOT iceberg_backup
TO test_repo;
```

以下示例将外部 Catalog `iceberg` 和 `hive` 的元数据备份到快照 `iceberg_hive_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP EXTERNAL CATALOGS (iceberg, hive) SNAPSHOT iceberg_hive_backup
TO test_repo;
```

以下示例将所有外部 Catalog 的元数据备份到快照 `all_catalog_backup` 中，并将该快照上传到仓库 `test_repo`。

```SQL
BACKUP ALL EXTERNAL CATALOGS SNAPSHOT all_catalog_backup
TO test_repo;
```

要取消外部 Catalog 的 BACKUP 操作，请执行以下语句：

```SQL
CANCEL BACKUP FOR EXTERNAL CATALOG;
```

## 恢复数据

您可以将远程存储系统中备份的数据快照恢复到当前或其它 StarRocks 集群，以恢复或迁移数据。

**从快照恢复对象时，必须指定快照的时间戳。**

使用 [RESTORE](../../sql-reference/sql-statements/backup_restore/RESTORE.md) 语句恢复远程存储系统中的数据快照。

RESTORE 是一个异步操作。您可以使用 [SHOW RESTORE](../../sql-reference/sql-statements/backup_restore/SHOW_RESTORE.md) 查看 RESTORE 作业的状态，或使用 [CANCEL RESTORE](../../sql-reference/sql-statements/backup_restore/CANCEL_RESTORE.md) 取消 RESTORE 作业。

### （可选）在新集群中创建仓库

要将数据迁移到另一个 StarRocks 集群，您需要在目标集群中创建与原集群具有相同**仓库名称**和**位置**的仓库，否则将无法查看之前备份的数据快照。有关详细信息，请参阅[创建仓库](#create-a-repository)。

### 获取快照时间戳

在恢复数据之前，您可以使用 [SHOW SNAPSHOT](../../sql-reference/sql-statements/backup_restore/SHOW_SNAPSHOT.md) 查看仓库中的快照以获取时间戳。

以下示例查看 `test_repo` 中的快照信息。

```Plain
mysql> SHOW SNAPSHOT ON test_repo;
+------------------+-------------------------+--------+
| Snapshot         | Timestamp               | Status |
+------------------+-------------------------+--------+
| sr_member_backup | 2023-02-07-14-45-53-143 | OK     |
+------------------+-------------------------+--------+
1 row in set (1.16 sec)
```

### 恢复数据库

以下示例将快照 `sr_hub_backup` 中的数据库 `sr_hub` 恢复到目标集群中的数据库 `sr_hub`。如果快照中不存在该数据库，系统将返回错误。如果目标集群中不存在该数据库，系统将自动创建。

```SQL
-- v3.4.0 及以后版本支持。
RESTORE SNAPSHOT sr_hub_backup
FROM test_repo
DATABASE sr_hub
PROPERTIES("backup_timestamp" = "2024-12-09-10-25-58-842");

-- 兼容早期版本语法。
RESTORE SNAPSHOT sr_hub.sr_hub_backup
FROM `test_repo` 
PROPERTIES("backup_timestamp" = "2024-12-09-10-25-58-842");
```

以下示例将快照 `sr_hub_backup` 中的数据库 `sr_hub` 恢复到目标集群中的数据库 `sr_hub_new`。如果快照中不存在数据库 `sr_hub`，系统将返回错误。如果目标集群中不存在数据库 `sr_hub_new`，系统将自动创建。

```SQL
-- v3.4.0 及以后版本支持。
RESTORE SNAPSHOT sr_hub_backup
FROM test_repo
DATABASE sr_hub AS sr_hub_new
PROPERTIES("backup_timestamp" = "2024-12-09-10-25-58-842");
```

### 恢复表

以下示例将快照 `sr_member_backup` 中数据库 `sr_hub` 的表 `sr_member` 恢复到目标集群中数据库 `sr_hub` 的表 `sr_member`。

```SQL
-- v3.4.0 及以后版本支持。
RESTORE SNAPSHOT sr_member_backup
FROM test_repo 
DATABASE sr_hub 
ON (TABLE sr_member) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");

-- 兼容早期版本语法。
RESTORE SNAPSHOT sr_hub.sr_member_backup
FROM test_repo
ON (sr_member)
PROPERTIES ("backup_timestamp"="2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_member_backup` 中数据库 `sr_hub` 的表 `sr_member` 恢复到目标集群中数据库 `sr_hub_new` 的表 `sr_member_new`。

```SQL
RESTORE SNAPSHOT sr_member_backup
FROM test_repo 
DATABASE sr_hub  AS sr_hub_new
ON (TABLE sr_member AS sr_member_new) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_core_backup` 中数据库 `sr_hub` 的两张表 `sr_member` 和 `sr_pmc` 恢复到目标集群中数据库 `sr_hub` 的两张表 `sr_member` 和 `sr_pmc`。

```SQL
RESTORE SNAPSHOT sr_core_backup
FROM test_repo 
DATABASE sr_hub
ON (TABLE sr_member, TABLE sr_pmc) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例从快照 `sr_all_backup` 中恢复数据库 `sr_hub` 的所有表。

```SQL
RESTORE SNAPSHOT sr_all_backup
FROM test_repo
DATABASE sr_hub
ON (ALL TABLES);
```

以下示例从快照 `sr_all_backup` 中恢复数据库 `sr_hub` 的一张表。

```SQL
RESTORE SNAPSHOT sr_all_backup
FROM test_repo
DATABASE sr_hub
ON (TABLE sr_member) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

### 恢复分区

以下示例将快照 `sr_par_backup` 中表 `sr_member` 的分区 `p1` 恢复到目标集群中表 `sr_member` 的分区 `p1`。

```SQL
-- v3.4.0 及以后版本支持。
RESTORE SNAPSHOT sr_par_backup
FROM test_repo
DATABASE sr_hub
ON (TABLE sr_member PARTITION (p1)) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");

-- 兼容早期版本语法。
RESTORE SNAPSHOT sr_hub.sr_par_backup
FROM test_repo
ON (sr_member PARTITION (p1)) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

您可以指定多个分区名（用逗号 (`,`) 分隔）来批量恢复分区。

### 恢复物化视图

以下示例将快照 `sr_mv1_backup` 中数据库 `sr_hub` 的物化视图 `sr_mv1` 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_mv1_backup
FROM test_repo
DATABASE sr_hub
ON (MATERIALIZED VIEW sr_mv1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_mv2_backup` 中数据库 `sr_hub` 的两个物化视图 `sr_mv1` 和 `sr_mv2` 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_mv2_backup
FROM test_repo
DATABASE sr_hub
ON (MATERIALIZED VIEW sr_mv1, MATERIALIZED VIEW sr_mv2) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_mv3_backup` 中数据库 `sr_hub` 的所有物化视图恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_mv3_backup
FROM test_repo
DATABASE sr_hub
ON (ALL MATERIALIZED VIEWS) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_mv3_backup` 中数据库 `sr_hub` 的一个物化视图恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_mv3_backup
FROM test_repo
DATABASE sr_hub
ON (MATERIALIZED VIEW sr_mv1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

:::info

RESTORE 后，您可以使用 [SHOW MATERIALIZED VIEWS](../../sql-reference/sql-statements/materialized_view/SHOW_MATERIALIZED_VIEW.md) 查看物化视图的状态。

- 如果物化视图处于活动状态，可以直接使用。
- 如果物化视图处于非活动状态，可能是因为其基础表未恢复。在所有基础表恢复后，您可以使用 [ALTER MATERIALIZED VIEW](../../sql-reference/sql-statements/materialized_view/ALTER_MATERIALIZED_VIEW.md) 重新激活物化视图。

:::

### 恢复逻辑视图

以下示例将快照 `sr_view1_backup` 中数据库 `sr_hub` 的逻辑视图 `sr_view1` 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_view1_backup
FROM test_repo
DATABASE sr_hub
ON (VIEW sr_view1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_view2_backup` 中数据库 `sr_hub` 的两个逻辑视图 `sr_view1` 和 `sr_view2` 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_view2_backup
FROM test_repo
DATABASE sr_hub
ON (VIEW sr_view1, VIEW sr_view2) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_view3_backup` 中数据库 `sr_hub` 的所有逻辑视图恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_view3_backup
FROM test_repo
DATABASE sr_hub
ON (ALL VIEWS) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_view3_backup` 中数据库 `sr_hub` 的一个逻辑视图恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_view3_backup
FROM test_repo
DATABASE sr_hub
ON (VIEW sr_view1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

### 恢复 UDF

以下示例将快照 `sr_udf1_backup` 中数据库 `sr_hub` 的 UDF `sr_udf1` 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_udf1_backup
FROM test_repo
DATABASE sr_hub
ON (FUNCTION sr_udf1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_udf2_backup` 中数据库 `sr_hub` 的两个 UDF `sr_udf1` 和 `sr_udf2` 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_udf2_backup
FROM test_repo
DATABASE sr_hub
ON (FUNCTION sr_udf1, FUNCTION sr_udf2) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_udf3_backup` 中数据库 `sr_hub` 的所有 UDF 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_udf3_backup
FROM test_repo
DATABASE sr_hub
ON (ALL FUNCTIONS) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `sr_udf3_backup` 中数据库 `sr_hub` 的一个 UDF 恢复到目标集群。

```SQL
RESTORE SNAPSHOT sr_udf3_backup
FROM test_repo
DATABASE sr_hub
ON (FUNCTION sr_udf1) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

### 恢复外部 Catalog 的元数据

以下示例将快照 `iceberg_backup` 中外部 Catalog `iceberg` 的元数据恢复到目标集群，并将其重命名为 `iceberg_new`。

```SQL
RESTORE SNAPSHOT iceberg_backup
FROM test_repo
EXTERNAL CATALOG (iceberg AS iceberg_new) 
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `iceberg_hive_backup` 中外部 Catalog `iceberg` 和 `hive` 的元数据恢复到目标集群。

```SQL
RESTORE SNAPSHOT iceberg_hive_backup
FROM test_repo 
EXTERNAL CATALOGS (iceberg, hive)
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

以下示例将快照 `all_catalog_backup` 中所有外部 Catalog 的元数据恢复到目标集群。

```SQL
RESTORE SNAPSHOT all_catalog_backup
FROM test_repo 
ALL EXTERNAL CATALOGS
PROPERTIES ("backup_timestamp" = "2024-12-09-10-52-10-940");
```

要取消外部 Catalog 的 RESTORE 操作，请执行以下语句：

```SQL
CANCEL RESTORE FOR EXTERNAL CATALOG;
```

## 配置 BACKUP 或 RESTORE 作业

您可以通过修改 BE 配置文件 **be.conf** 中的以下配置项来优化 BACKUP 或 RESTORE 作业的性能：

| 配置项                       | 描述                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| make_snapshot_worker_count   | BE 节点上 BACKUP 作业中创建快照任务的最大线程数。默认值：`5`。增加此配置项的值可提高创建快照任务的并发度。 |
| release_snapshot_worker_count | BE 节点上失败的 BACKUP 作业中释放快照任务的最大线程数。默认值：`5`。增加此配置项的值可提高释放快照任务的并发度。 |
| upload_worker_count          | BE 节点上 BACKUP 作业中上传任务的最大线程数。默认值：`0`。`0` 表示将此值设置为 BE 所在机器的 CPU 核心数。增加此配置项的值可提高上传任务的并发度。 |
| download_worker_count        | BE 节点上 RESTORE 作业中下载任务的最大线程数。默认值：`0`。`0` 表示将此值设置为 BE 所在机器的 CPU 核心数。增加此配置项的值可提高下载任务的并发度。 |

## 使用须知

- 在全局、数据库、表和分区级别执行备份和恢复操作需要不同的权限。有关详细信息，请参阅[基于场景自定义角色](../user_privs/authorization/User_privilege.md#customize-roles-based-on-scenarios)。
- 每个数据库每次只允许一个 BACKUP 或 RESTORE 作业运行。否则，StarRocks 将返回错误。
- BACKUP 和 RESTORE 作业会占用 StarRocks 集群的许多资源，因此您可以在 StarRocks 集群负载不高时进行数据备份和恢复。
- StarRocks 不支持为数据备份指定数据压缩算法。
- 由于数据是作为快照备份的，因此在快照生成时加载的数据不包含在快照中。因此，如果在生成快照后且 RESTORE 作业完成前将数据加载到旧集群中，您还需要将数据加载到恢复数据的集群中。建议您在数据迁移完成后的一段时间内并行将数据加载到两个集群中，并在验证数据和服务的正确性后将应用程序迁移到新集群。
- 在 RESTORE 作业完成之前，您无法操作要恢复的表。
- 主键表（Primary Key table）无法恢复到 v2.5 之前的 StarRocks 集群。
- 在恢复表之前，您无需在新集群中创建要恢复的表。RESTORE 作业会自动创建。
- 如果存在与要恢复的表同名的现有表，StarRocks 首先检查现有表的 schema 是否与要恢复的表匹配。如果 schema 匹配，StarRocks 将使用快照中的数据覆盖现有表。如果 schema 不匹配，RESTORE 作业将失败。您可以选择使用关键字 `AS` 重命名要恢复的表，或者在恢复数据之前删除现有表。
- 如果 RESTORE 作业覆盖现有数据库、表或分区，则在作业进入 COMMIT 阶段后，被覆盖的数据将无法恢复。如果 RESTORE 作业在此阶段失败或被取消，数据可能会损坏且无法访问。在这种情况下，您只能再次执行 RESTORE 操作并等待作业完成。因此，除非您确定当前数据不再使用，否则我们不建议通过覆盖方式恢复数据。覆盖操作首先检查快照与现有数据库、表或分区之间的元数据一致性。如果检测到不一致，则无法执行 RESTORE 操作。
- 目前，StarRocks 不支持备份和恢复与用户账户、权限和资源组相关的配置数据。
- 目前，StarRocks 不支持备份和恢复表之间的 Colocate Join 关系。
