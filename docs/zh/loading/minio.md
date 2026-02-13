displayed_sidebar: docs
toc_max_heading_level: 4

# 从 MinIO 导入数据

StarRocks 提供以下选项用于从 MinIO 导入数据：

- 使用 [INSERT](../sql-reference/sql-statements/loading_unloading/INSERT.md)+[`FILES()`](../sql-reference/sql-functions/table-functions/files.md) 进行同步导入
- 使用 [Broker Load](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) 进行异步导入

这些选项各有优势，将在以下章节详细介绍。

在大多数情况下，我们推荐您使用 INSERT+`FILES()` 方法，它使用起来更简单方便。

然而，INSERT+`FILES()` 方法目前仅支持 Parquet、ORC 和 CSV 文件格式。因此，如果您需要导入 JSON 等其他文件格式的数据，或者在数据导入过程中[执行 DELETE 等数据变更操作](../loading/Load_to_Primary_Key_tables.md)，则可以使用 Broker Load。

## 准备工作

### 准备源数据

请确保您要导入 StarRocks 的源数据已正确存储在 MinIO 存储桶中。您还应考虑数据和数据库的地理位置，因为当存储桶和 StarRocks 集群位于同一区域时，数据传输成本会大大降低。

在本主题中，我们为您提供了一个示例数据集。您可以使用 `curl` 下载：

```bash
curl -O https://starrocks-examples.s3.amazonaws.com/user_behavior_ten_million_rows.parquet
```

将 Parquet 文件导入到您的 MinIO 系统中，并记下存储桶名称。本指南中的示例
使用存储桶名称 `/starrocks`。

### 权限检查

<InsertPrivNote />

### 收集连接详情

简而言之，要使用 MinIO 访问密钥认证，您需要收集以下信息：

- 存储您数据的存储桶
- 如果要访问存储桶中的特定对象，则需要对象键（对象名称）
- MinIO 端点
- 用作访问凭证的访问密钥和秘密密钥。

![MinIO access key](../_assets/quick-start/MinIO-create.png)

## 使用 INSERT+FILES()

此方法从 v3.1 版本起可用，目前仅支持 Parquet、ORC 和 CSV（从 v3.3.0 版本起支持）文件格式。

### INSERT+FILES() 的优势

[`FILES()`](../sql-reference/sql-functions/table-functions/files.md) 可以根据您指定的路径相关属性读取存储在云存储中的文件，推断文件中的表结构，然后将文件中的数据作为数据行返回。

使用 `FILES()`，您可以：

- 使用 [SELECT](../sql-reference/sql-statements/table_bucket_part_index/SELECT.md) 直接从 MinIO 查询数据。
- 使用 [CREATE TABLE AS SELECT](../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE_AS_SELECT.md) (CTAS) 创建并导入表。
- 使用 [INSERT](../sql-reference/sql-statements/loading_unloading/INSERT.md) 将数据导入到现有表。

### 典型示例

#### 使用 SELECT 直接从 MinIO 查询

使用 SELECT+`FILES()` 直接从 MinIO 查询可以在创建表之前很好地预览数据集内容。例如：

- 在不存储数据的情况下预览数据集。
- 查询最小值和最大值，并决定要使用的数据类型。
- 检查 `NULL` 值。

以下示例查询了先前已添加到您的 MinIO 系统中的示例数据集。

:::tip

命令的突出显示部分包含您可能需要更改的设置：

- 设置 `endpoint` 和 `path` 以匹配您的 MinIO 系统。
- 如果您的 MinIO 系统使用 SSL，请将 `enable_ssl` 设置为 `true`。
- 将您的 MinIO 访问密钥和秘密密钥替换为 `AAA` 和 `BBB`。

:::

```sql
SELECT * FROM FILES
(
    -- highlight-start
    "aws.s3.endpoint" = "http://minio:9000",
    "path" = "s3://starrocks/user_behavior_ten_million_rows.parquet",
    "aws.s3.enable_ssl" = "false",
    "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
    "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    -- highlight-end
    "format" = "parquet",
    "aws.s3.use_aws_sdk_default_behavior" = "false",
    "aws.s3.use_instance_profile" = "false",
    "aws.s3.enable_path_style_access" = "true"
)
LIMIT 3;
```

系统返回以下查询结果：

```plaintext
+--------+---------+------------+--------------+---------------------+
| UserID | ItemID  | CategoryID | BehaviorType | Timestamp           |
+--------+---------+------------+--------------+---------------------+
| 543711 |  829192 |    2355072 | pv           | 2017-11-27 08:22:37 |
| 543711 | 2056618 |    3645362 | pv           | 2017-11-27 10:16:46 |
| 543711 | 1165492 |    3645362 | pv           | 2017-11-27 10:17:00 |
+--------+---------+------------+--------------+---------------------+
3 rows in set (0.41 sec)
```

:::info

请注意，上面返回的列名由 Parquet 文件提供。

:::

#### 使用 CTAS 创建并导入表

这是上一个示例的延续。之前的查询被包装在 CREATE TABLE AS SELECT (CTAS) 中，以便使用表结构推断来自动化表的创建。这意味着 StarRocks 将推断表结构，创建您想要的表，然后将数据导入该表。当使用 `FILES()` 表函数处理 Parquet 文件时，无需提供列名和类型来创建表，因为 Parquet 格式本身包含列名。

:::note

使用表结构推断的 CREATE TABLE 语法不允许设置副本数量，因此请在创建表之前进行设置。以下示例适用于单个副本的系统：

```SQL
ADMIN SET FRONTEND CONFIG ('default_replication_num' = '1');
```

:::

创建数据库并切换到该数据库：

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

使用 CTAS 创建表并导入先前已添加到您的 MinIO 系统中的示例数据集数据。

:::tip

命令的突出显示部分包含您可能需要更改的设置：

- 设置 `endpoint` 和 `path` 以匹配您的 MinIO 系统。
- 如果您的 MinIO 系统使用 SSL，请将 `enable_ssl` 设置为 `true`。
- 将您的 MinIO 访问密钥和秘密密钥替换为 `AAA` 和 `BBB`。

:::

```sql
CREATE TABLE user_behavior_inferred AS
SELECT * FROM FILES
(
    -- highlight-start
    "aws.s3.endpoint" = "http://minio:9000",
    "path" = "s3://starrocks/user_behavior_ten_million_rows.parquet",
    "aws.s3.enable_ssl" = "false",
    "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
    "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    -- highlight-end
    "format" = "parquet",
    "aws.s3.use_aws_sdk_default_behavior" = "false",
    "aws.s3.use_instance_profile" = "false",
    "aws.s3.enable_path_style_access" = "true"
);
```

```plaintext
Query OK, 10000000 rows affected (3.17 sec)
{'label':'insert_a5da3ff5-9ee4-11ee-90b0-02420a060004', 'status':'VISIBLE', 'txnId':'17'}
```

创建表后，您可以使用 [DESCRIBE](../sql-reference/sql-statements/table_bucket_part_index/DESCRIBE.md) 查看其表结构：

```SQL
DESCRIBE user_behavior_inferred;
```

系统返回以下查询结果：

```Plaintext
+--------------+------------------+------+-------+---------+-------+
| Field        | Type             | Null | Key   | Default | Extra |
+--------------+------------------+------+-------+---------+-------+
| UserID       | bigint           | YES  | true  | NULL    |       |
| ItemID       | bigint           | YES  | true  | NULL    |       |
| CategoryID   | bigint           | YES  | true  | NULL    |       |
| BehaviorType | varchar(1048576) | YES  | false | NULL    |       |
| Timestamp    | varchar(1048576) | YES  | false | NULL    |       |
+--------------+------------------+------+-------+---------+-------+
```

查询表以验证数据是否已导入其中。例如：

```SQL
SELECT * from user_behavior_inferred LIMIT 3;
```

返回以下查询结果，表明数据已成功导入：

```Plaintext
+--------+--------+------------+--------------+---------------------+
| UserID | ItemID | CategoryID | BehaviorType | Timestamp           |
+--------+--------+------------+--------------+---------------------+
|     58 | 158350 |    2355072 | pv           | 2017-11-27 13:06:51 |
|     58 | 158590 |    3194735 | pv           | 2017-11-27 02:21:04 |
|     58 | 215073 |    3002561 | pv           | 2017-11-30 10:55:42 |
+--------+--------+------------+--------------+---------------------+
```

#### 使用 INSERT 导入到现有表

您可能希望自定义要导入的表，例如：

- 列数据类型、可空性设置或默认值
- 键类型和列
- 数据分区和分桶

:::tip

创建最有效的表结构需要了解数据将如何使用以及列的内容。本主题不涵盖表设计。有关表设计的信息，请参阅 [表模型](../table_design/StarRocks_table_design.md)。

:::

在此示例中，我们根据对表将如何查询以及 Parquet 文件中数据的了解来创建表。通过直接在 MinIO 中查询文件可以获取对 Parquet 文件中数据的了解。

- 由于对 MinIO 中数据集的查询表明 `Timestamp` 列包含与 `datetime` 数据类型匹配的数据，因此在以下 DDL 中指定了列类型。
- 通过查询 MinIO 中的数据，您可以发现数据集中没有 `NULL` 值，因此 DDL 没有将任何列设置为可空。
- 根据对预期查询类型的了解，将排序键和分桶列设置为 `UserID` 列。对于此数据，您的用例可能有所不同，因此您可能会决定除了 `UserID` 之外或代替 `UserID` 使用 `ItemID` 作为排序键。

创建数据库并切换到该数据库：

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

手动创建表（我们建议表具有与您要从 MinIO 导入的 Parquet 文件相同的表结构）：

```SQL
CREATE TABLE user_behavior_declared
(
    UserID int(11) NOT NULL,
    ItemID int(11) NOT NULL,
    CategoryID int(11) NOT NULL,
    BehaviorType varchar(65533) NOT NULL,
    Timestamp datetime NOT NULL
)
ENGINE = OLAP 
DUPLICATE KEY(UserID)
DISTRIBUTED BY HASH(UserID)
PROPERTIES
(
    'replication_num' = '1'
);
```

显示表结构，以便您可以将其与 `FILES()` 表函数推断出的表结构进行比较：

```sql
DESCRIBE user_behavior_declared;
```

```plaintext
+--------------+----------------+------+-------+---------+-------+
| Field        | Type           | Null | Key   | Default | Extra |
+--------------+----------------+------+-------+---------+-------+
| UserID       | int            | NO   | true  | NULL    |       |
| ItemID       | int            | NO   | false | NULL    |       |
| CategoryID   | int            | NO   | false | NULL    |       |
| BehaviorType | varchar(65533) | NO   | false | NULL    |       |
| Timestamp    | datetime       | NO   | false | NULL    |       |
+--------------+----------------+------+-------+---------+-------+
5 rows in set (0.00 sec)
```

:::tip

比较您刚刚创建的表结构与之前使用 `FILES()` 表函数推断出的表结构。查看：

- 数据类型
- 可空性
- 键字段

为了更好地控制目标表的表结构并获得更好的查询性能，我们建议您在生产环境中手动指定表结构。将时间戳字段的数据类型设置为 `datetime` 比使用 `varchar` 更高效。

:::

创建表后，您可以使用 INSERT INTO SELECT FROM FILES() 导入数据：

:::tip

命令的突出显示部分包含您可能需要更改的设置：

- 设置 `endpoint` 和 `path` 以匹配您的 MinIO 系统。
- 如果您的 MinIO 系统使用 SSL，请将 `enable_ssl` 设置为 `true`。
- 将您的 MinIO 访问密钥和秘密密钥替换为 `AAA` 和 `BBB`。

:::

```SQL
INSERT INTO user_behavior_declared
SELECT * FROM FILES
(
    -- highlight-start
    "aws.s3.endpoint" = "http://minio:9000",
    "path" = "s3://starrocks/user_behavior_ten_million_rows.parquet",
    "aws.s3.enable_ssl" = "false",
    "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
    "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    -- highlight-end
    "format" = "parquet",
    "aws.s3.use_aws_sdk_default_behavior" = "false",
    "aws.s3.use_instance_profile" = "false",
    "aws.s3.enable_path_style_access" = "true"
);
```

导入完成后，您可以查询表以验证数据是否已导入其中。例如：

```SQL
SELECT * from user_behavior_declared LIMIT 3;
```

返回以下查询结果，表明数据已成功导入：

```Plaintext
+--------+---------+------------+--------------+---------------------+
| UserID | ItemID  | CategoryID | BehaviorType | Timestamp           |
+--------+---------+------------+--------------+---------------------+
|     58 | 4309692 |    1165503 | pv           | 2017-11-25 14:06:52 |
|     58 |  181489 |    1165503 | pv           | 2017-11-25 14:07:22 |
|     58 | 3722956 |    1165503 | pv           | 2017-11-25 14:09:28 |
+--------+---------+------------+--------------+---------------------+
```

#### 检查导入进度

您可以从 StarRocks Information Schema 中的 [`loads`](../sql-reference/information_schema/loads.md) 视图查询 INSERT 任务的进度。此功能从 v3.1 版本起支持。例如：

```SQL
SELECT * FROM information_schema.loads ORDER BY JOB_ID DESC;
```

有关 `loads` 视图中提供的字段信息，请参阅 [`loads`](../sql-reference/information_schema/loads.md)。

如果您提交了多个导入任务，可以根据与任务关联的 `LABEL` 进行过滤。例如：

```SQL
SELECT * FROM information_schema.loads WHERE LABEL = 'insert_e3b882f5-7eb3-11ee-ae77-00163e267b60' \G
*************************** 1. row ***************************
              JOB_ID: 10243
               LABEL: insert_e3b882f5-7eb3-11ee-ae77-00163e267b60
       DATABASE_NAME: mydatabase
               STATE: FINISHED
            PROGRESS: ETL:100%; LOAD:100%
                TYPE: INSERT
            PRIORITY: NORMAL
           SCAN_ROWS: 10000000
       FILTERED_ROWS: 0
     UNSELECTED_ROWS: 0
           SINK_ROWS: 10000000
            ETL_INFO:
           TASK_INFO: resource:N/A; timeout(s):300; max_filter_ratio:0.0
         CREATE_TIME: 2023-11-09 11:56:01
      ETL_START_TIME: 2023-11-09 11:56:01
     ETL_FINISH_TIME: 2023-11-09 11:56:01
     LOAD_START_TIME: 2023-11-09 11:56:01
    LOAD_FINISH_TIME: 2023-11-09 11:56:44
         JOB_DETAILS: {"All backends":{"e3b882f5-7eb3-11ee-ae77-00163e267b60":[10142]},"FileNumber":0,"FileSize":0,"InternalTableLoadBytes":311710786,"InternalTableLoadRows":10000000,"ScanBytes":581574034,"ScanRows":10000000,"TaskNumber":1,"Unfinished backends":{"e3b882f5-7eb3-11ee-ae77-00163e267b60":[]}}
           ERROR_MSG: NULL
        TRACKING_URL: NULL
        TRACKING_SQL: NULL
REJECTED_RECORD_PATH: NULL
```

:::tip

INSERT 是一个同步命令。如果 INSERT 任务仍在运行，您需要另开一个会话来检查其执行状态。

:::

### 比较磁盘上的表大小

此查询比较了具有推断表结构和手动声明表结构的表。由于推断的表结构包含可空列和用于时间戳的 varchar 类型，因此数据长度更大：

```sql
SELECT TABLE_NAME,
       TABLE_ROWS,
       AVG_ROW_LENGTH,
       DATA_LENGTH
FROM information_schema.tables
WHERE TABLE_NAME like 'user_behavior%'\G
```

```plaintext
*************************** 1. row ***************************
    TABLE_NAME: user_behavior_declared
    TABLE_ROWS: 10000000
AVG_ROW_LENGTH: 10
   DATA_LENGTH: 102562516
*************************** 2. row ***************************
    TABLE_NAME: user_behavior_inferred
    TABLE_ROWS: 10000000
AVG_ROW_LENGTH: 17
   DATA_LENGTH: 176803880
2 rows in set (0.04 sec)
```

## 使用 Broker Load

异步 Broker Load 进程负责建立与 MinIO 的连接，拉取数据，并将数据存储到 StarRocks 中。

此方法支持以下文件格式：

- Parquet
- ORC
- CSV
- JSON（v3.2.3 及更高版本支持）

### Broker Load 的优势

- Broker Load 在后台运行，客户端无需保持连接即可让任务继续。
- Broker Load 更适用于长时间运行的任务，默认超时时间为 4 小时。
- 除了 Parquet 和 ORC 文件格式外，Broker Load 还支持 CSV 文件格式和 JSON 文件格式（JSON 文件格式从 v3.2.3 版本起支持）。

### 数据流

![Broker Load 工作流](../_assets/broker_load_how-to-work_en.png)

1. 用户创建一个导入任务。
2. FE 创建查询计划并将其分发给 BE 或计算节点 (CN)。
3. BE 或 CN 从源端拉取数据并将数据导入到 StarRocks 中。

### 典型示例

创建一个表，启动导入进程，从先前已导入到 MinIO 系统中的示例数据集中拉取数据。

#### 创建数据库和表

创建数据库并切换到该数据库：

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

手动创建表（我们建议表具有与您要从 MinIO 导入的 Parquet 文件相同的表结构）：

```SQL
CREATE TABLE user_behavior
(
    UserID int(11) NOT NULL,
    ItemID int(11) NOT NULL,
    CategoryID int(11) NOT NULL,
    BehaviorType varchar(65533) NOT NULL,
    Timestamp datetime NOT NULL
)
ENGINE = OLAP 
DUPLICATE KEY(UserID)
DISTRIBUTED BY HASH(UserID)
PROPERTIES
(
    'replication_num' = '1'
);
```

#### 启动 Broker Load

运行以下命令启动 Broker Load 任务，将示例数据集 `user_behavior_ten_million_rows.parquet` 中的数据导入到 `user_behavior` 表：

:::tip

命令的突出显示部分包含您可能需要更改的设置：

- 设置 `endpoint` 和 `DATA INFILE` 以匹配您的 MinIO 系统。
- 如果您的 MinIO 系统使用 SSL，请将 `enable_ssl` 设置为 `true`。
- 将您的 MinIO 访问密钥和秘密密钥替换为 `AAA` 和 `BBB`。

:::

```sql
LOAD LABEL UserBehavior
(
    -- highlight-start
    DATA INFILE("s3://starrocks/user_behavior_ten_million_rows.parquet")
    -- highlight-end
    INTO TABLE user_behavior
 )
 WITH BROKER
 (
    -- highlight-start
    "aws.s3.endpoint" = "http://minio:9000",
    "aws.s3.enable_ssl" = "false",
    "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
    "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    -- highlight-end
    "format" = "parquet",
    "aws.s3.use_aws_sdk_default_behavior" = "false",
    "aws.s3.use_instance_profile" = "false",
    "aws.s3.enable_path_style_access" = "true"
 )
PROPERTIES
(
    "timeout" = "72000"
);
```

此任务包含四个主要部分：

- `LABEL`：用于查询导入任务状态的字符串。
- `LOAD` 声明：源 URI、源数据格式和目标表名。
- `BROKER`：源的连接详情。
- `PROPERTIES`：超时值和适用于导入任务的任何其他属性。

有关详细语法和参数说明，请参阅 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 检查导入进度

您可以从 StarRocks Information Schema 中的 [`loads`](../sql-reference/information_schema/loads.md) 视图查询 Broker Load 任务的进度。此功能从 v3.1 版本起支持。

```SQL
SELECT * FROM information_schema.loads;
```

有关 `loads` 视图中提供的字段信息，请参阅 [`loads`](../sql-reference/information_schema/loads.md)。

如果您提交了多个导入任务，可以根据与任务关联的 `LABEL` 进行过滤。例如：

```sql
SELECT * FROM information_schema.loads
WHERE LABEL = 'UserBehavior'\G
```

```plaintext
*************************** 1. row ***************************
              JOB_ID: 10176
               LABEL: userbehavior
       DATABASE_NAME: mydatabase
               STATE: FINISHED
            PROGRESS: ETL:100%; LOAD:100%
                TYPE: BROKER
            PRIORITY: NORMAL
           SCAN_ROWS: 10000000
       FILTERED_ROWS: 0
     UNSELECTED_ROWS: 0
           SINK_ROWS: 10000000
            ETL_INFO:
           TASK_INFO: resource:N/A; timeout(s):72000; max_filter_ratio:0.0
         CREATE_TIME: 2023-12-19 23:02:41
      ETL_START_TIME: 2023-12-19 23:02:44
     ETL_FINISH_TIME: 2023-12-19 23:02:44
     LOAD_START_TIME: 2023-12-19 23:02:44
    LOAD_FINISH_TIME: 2023-12-19 23:02:46
         JOB_DETAILS: {"All backends":{"4aeec563-a91e-4c1e-b169-977b660950d1":[10004]},"FileNumber":1,"FileSize":132251298,"InternalTableLoadBytes":311710786,"InternalTableLoadRows":10000000,"ScanBytes":132251298,"ScanRows":10000000,"TaskNumber":1,"Unfinished backends":{"4aeec563-a91e-4c1e-b169-977b660950d1":[]}}
           ERROR_MSG: NULL
        TRACKING_URL: NULL
        TRACKING_SQL: NULL
REJECTED_RECORD_PATH: NULL
1 row in set (0.02 sec)
```

确认导入任务完成后，您可以检查目标表的一个子集，以查看数据是否已成功导入。例如：

```SQL
SELECT * from user_behavior LIMIT 3;
```

返回以下查询结果，表明数据已成功导入：

```Plaintext
+--------+---------+------------+--------------+---------------------+
| UserID | ItemID  | CategoryID | BehaviorType | Timestamp           |
+--------+---------+------------+--------------+---------------------+
|    142 | 2869980 |    2939262 | pv           | 2017-11-25 03:43:22 |
|    142 | 2522236 |    1669167 | pv           | 2017-11-25 15:14:12 |
|    142 | 3031639 |    3607361 | pv           | 2017-11-25 15:19:25 |
+--------+---------+------------+--------------+---------------------+
```
