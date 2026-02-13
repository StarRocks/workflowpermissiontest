---
displayed_sidebar: docs
---

# 加载时数据转换

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'
StarRocks 支持加载时数据转换。

此功能支持 [Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)、[Broker Load](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) 和 [Routine Load](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)，但不支持 [Spark Load](../sql-reference/sql-statements/loading_unloading/SPARK_LOAD.md)。

<InsertPrivNote />

本主题通过示例数据，介绍如何在加载时抽取和转换数据。支持的数据文件格式取决于所选的加载方式。

:::note
对于 CSV 数据，逗号 (,)、制表符、竖线 (|) 等不超过 50 字节长度的 UTF-8 字符串都可以用作文本分隔符。
:::

## 场景

将数据文件加载到 StarRocks 表时，数据文件中的数据可能无法完全映射到 StarRocks 表中的数据。在这种情况下，无需在加载到 StarRocks 表之前抽取或转换数据。StarRocks 支持在加载过程中抽取和转换数据。

- 跳过不需要加载的列。

  您可以跳过不需要加载的列。此外，如果数据文件中的列与 StarRocks 表中的列顺序不同，您可以创建数据文件与 StarRocks 表之间的列映射。

- 过滤掉不想加载的行。

  通过指定过滤条件，StarRocks 会过滤掉您不想加载的所有行。

- 从原始列生成新列。

  生成列是根据数据文件的原始列计算出的特殊列。您可以将生成列映射到 StarRocks 表的列。

- 从文件路径中提取分区字段值。

  如果数据文件是由 Apache Hive™ 生成的，您可以从文件路径中提取分区字段值。

## 数据示例

1.  在本地文件系统上创建数据文件。

    a. 创建一个名为 `file1.csv` 的数据文件。该文件由 4 列组成，依次代表用户 ID、用户性别、事件日期和事件类型。

    ```Plain
    354,female,2020-05-20,1
    465,male,2020-05-21,2
    576,female,2020-05-22,1
    687,male,2020-05-23,2
    ```

    b. 创建一个名为 `file2.csv` 的数据文件。该文件只包含 1 列，代表日期。

    ```Plain
    2020-05-20
    2020-05-21
    2020-05-22
    2020-05-23
    ```

2.  在 StarRocks 数据库 `test_db` 中创建表。

    :::note

    从 v2.5.7 起，StarRocks 可以在创建表或添加分区时自动设置桶数 (BUCKETS)。您无需手动设置桶数。有关详细信息，请参阅[设置桶数](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets)。

    :::

    a. 创建一个名为 `table1` 的表，由 `event_date`、`event_type` 和 `user_id` 三列组成。

    ```SQL
    MySQL [test_db]> CREATE TABLE table1
    (
        `event_date` DATE COMMENT "事件日期",
        `event_type` TINYINT COMMENT "事件类型",
        `user_id` BIGINT COMMENT "用户 ID"
    )
    DISTRIBUTED BY HASH(user_id);
    ```

    b. 创建一个名为 `table2` 的表，由 `date`、`year`、`month` 和 `day` 四列组成。

    ```SQL
    MySQL [test_db]> CREATE TABLE table2
    (
        `date` DATE COMMENT "日期",
        `year` INT COMMENT "年份",
        `month` TINYINT COMMENT "月份",
        `day` TINYINT COMMENT "日期"
    )
    DISTRIBUTED BY HASH(date);
    ```

3.  将 `file1.csv` 和 `file2.csv` 上传到 HDFS 集群的 `/user/starrocks/data/input/` 路径，并将 `file1.csv` 的数据发布到 Kafka 集群的 `topic1`，将 `file2.csv` 的数据发布到 Kafka 集群的 `topic2`。

## 跳过不需要加载的列

要加载到 StarRocks 表中的数据文件可能包含无法映射到 StarRocks 表中任何列的列。在这种情况下，StarRocks 支持只从数据文件中加载可以映射到 StarRocks 表列的列。

此功能支持从以下数据源加载数据：

- 本地文件系统

- HDFS 和 云存储

  > **NOTE**
  >
  > 本节以 HDFS 为例。

- Kafka

大多数情况下，CSV 文件中的列没有名称。在某些 CSV 文件中，第一行由列名组成，但 StarRocks 将第一行的内容视为普通数据而不是列名。因此，加载 CSV 文件时，必须在作业创建语句或命令中**按顺序**为 CSV 文件的列临时命名。这些临时命名的列将**按名称**映射到 StarRocks 表中的列。对于数据文件中的列，请注意以下几点：

- 使用 StarRocks 表的列名映射的临时命名的列的数据将直接加载。

- 无法映射到 StarRocks 表中列的列将被忽略，这些列的数据将不被加载。

- 如果某些列可以映射到 StarRocks 表中的列，但在作业创建语句或命令中未临时命名，则加载作业将报告错误。

本节以 `file1.csv` 和 `table1` 为例。`file1.csv` 中的 4 列分别临时命名为 `user_id`、`user_gender`、`event_date` 和 `event_type`。在 `file1.csv` 的临时命名列中，`user_id`、`event_date` 和 `event_type` 可以映射到 `table1` 的特定列，而 `user_gender` 无法映射到 `table1` 的任何列。因此，`user_id`、`event_date` 和 `event_type` 将加载到 `table1` 中，而 `user_gender` 将不被加载。

### 数据加载

#### 从本地文件系统加载数据

如果 `file1.csv` 存储在本地文件系统中，请执行以下命令创建 [Stream Load](../loading/StreamLoad.md) 作业。

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: user_id, user_gender, event_date, event_type" \
    -T file1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table1/_stream_load
```

> **NOTE**
>
> 选择 Stream Load 时，必须使用 `columns` 参数临时命名数据文件的列，并创建数据文件与 StarRocks 表之间的列映射。

有关详细语法和参数说明，请参阅 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

#### 从 HDFS 集群加载数据

如果 `file1.csv` 存储在 HDFS 集群中，请执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业。

```SQL
LOAD LABEL test_db.label1
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/data/input/file1.csv")
    INTO TABLE `table1`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (user_id, user_gender, event_date, event_type)
)
WITH BROKER;
```

> **NOTE**
>
> 选择 Broker Load 时，必须使用 `column_list` 参数临时命名数据文件的列，并创建数据文件与 StarRocks 表之间的列映射。

有关详细语法和参数说明，请参阅 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 从 Kafka 集群加载数据

如果 `file1.csv` 的数据已发布到 Kafka 集群的 `topic1`，请执行以下语句创建 [Routine Load](../loading/RoutineLoad.md) 作业。

```SQL
CREATE ROUTINE LOAD test_db.table101 ON table1
    COLUMNS TERMINATED BY ",",
    COLUMNS(user_id, user_gender, event_date, event_type)
FROM KAFKA
(
    "kafka_broker_list" = "<kafka_broker_host>:<kafka_broker_port>",
    "kafka_topic" = "topic1",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```

> **NOTE**
>
> 选择 Routine Load 时，必须使用 `COLUMNS` 参数临时命名数据文件的列，并创建数据文件与 StarRocks 表之间的列映射。

有关详细语法和参数说明，请参阅 [CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)。

### 数据查询

完成从本地文件系统、HDFS 集群或 Kafka 集群加载数据后，查询 `table1` 中的数据以验证加载是否成功。

```SQL
MySQL [test_db]> SELECT * FROM table1;
+------------+------------+---------+
| event_date | event_type | user_id |
+------------+------------+---------+
| 2020-05-22 |          1 |     576 |
| 2020-05-20 |          1 |     354 |
| 2020-05-21 |          2 |     465 |
| 2020-05-23 |          2 |     687 |
+------------+------------+---------+
4 rows in set (0.01 sec)
```

## 过滤掉不想加载的行

将数据文件加载到 StarRocks 表时，有时您不希望加载数据文件中的特定行。在这种情况下，您可以使用 WHERE 子句指定要加载的行。StarRocks 将过滤掉所有不满足 WHERE 子句中指定过滤条件的行。

此功能支持从以下数据源加载数据：

- 本地文件系统

- HDFS 和 云存储
  > **NOTE**
  >
  > 本节以 HDFS 为例。

- Kafka

本节以 `file1.csv` 和 `table1` 为例。如果您只想将 `file1.csv` 中事件类型为 `1` 的行加载到 `table1` 中，可以使用 WHERE 子句指定过滤条件 `event_type = 1`。

### 数据加载

#### 从本地文件系统加载数据

如果 `file1.csv` 存储在本地文件系统中，请执行以下命令创建 [Stream Load](../loading/StreamLoad.md) 作业。

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: user_id, user_gender, event_date, event_type" \
    -H "where: event_type=1" \
    -T file1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table1/_stream_load
```

有关详细语法和参数说明，请参阅 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

#### 从 HDFS 集群加载数据

如果 `file1.csv` 存储在 HDFS 集群中，请执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业。

```SQL
LOAD LABEL test_db.label2
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/data/input/file1.csv")
    INTO TABLE `table1`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (user_id, user_gender, event_date, event_type)
    WHERE event_type = 1
)
WITH BROKER;
```

有关详细语法和参数说明，请参阅 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 从 Kafka 集群加载数据

如果 `file1.csv` 的数据已发布到 Kafka 集群的 `topic1`，请执行以下语句创建 [Routine Load](../loading/RoutineLoad.md) 作业。

```SQL
CREATE ROUTINE LOAD test_db.table102 ON table1
COLUMNS TERMINATED BY ",",
COLUMNS (user_id, user_gender, event_date, event_type),
WHERE event_type = 1
FROM KAFKA
(
    "kafka_broker_list" = "<kafka_broker_host>:<kafka_broker_port>",
    "kafka_topic" = "topic1",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```

有关详细语法和参数说明，请参阅 [CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)。

### 数据查询

完成从本地文件系统、HDFS 集群或 Kafka 集群加载数据后，查询 `table1` 中的数据以验证加载是否成功。

```SQL
MySQL [test_db]> SELECT * FROM table1;
+------------+------------+---------+
| event_date | event_type | user_id |
+------------+------------+---------+
| 2020-05-20 |          1 |     354 |
| 2020-05-22 |          1 |     576 |
+------------+------------+---------+
2 rows in set (0.01 sec)
```

## 从原始列生成新列

将数据文件加载到 StarRocks 表时，数据文件中的某些数据可能需要在加载到 StarRocks 表之前进行转换。在这种情况下，您可以使用作业创建命令或语句中的函数或表达式来实现数据转换。

此功能支持从以下数据源加载数据：

- 本地文件系统

- HDFS 和 云存储
  > **NOTE**
  >
  > 本节以 HDFS 为例。

- Kafka

本节以 `file2.csv` 和 `table2` 为例。`file2.csv` 只包含一列，表示日期。为了从 `file2.csv` 中提取每个日期的年、月、日，您可以使用 [year](../sql-reference/sql-functions/date-time-functions/year.md)、[month](../sql-reference/sql-functions/date-time-functions/month.md) 和 [day](../sql-reference/sql-functions/date-time-functions/day.md) 函数，并将提取的数据加载到 `table2` 的 `year`、`month` 和 `day` 列中。

### 数据加载

#### 从本地文件系统加载数据

如果 `file2.csv` 存储在本地文件系统中，请执行以下命令创建 [Stream Load](../loading/StreamLoad.md) 作业。

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns:date,year=year(date),month=month(date),day=day(date)" \
    -T file2.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table2/_stream_load
```

> **NOTE**
>
> - 在 `columns` 参数中，您必须首先**将数据文件的所有列**临时命名，然后临时命名要从数据文件原始列生成的任何新列。如上例所示，`file2.csv` 中的唯一列被临时命名为 `date`，然后调用 `year=year(date)`、`month=month(date)` 和 `day=day(date)` 函数来生成三个临时命名为 `year`、`month` 和 `day` 的新列。
>
> - Stream Load 不支持 `column_name = function(column_name)`，但支持 `column_name = function(column_name)`。

有关详细语法和参数说明，请参阅 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

#### 从 HDFS 集群加载数据

如果 `file2.csv` 存储在 HDFS 集群中，请执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业。

```SQL
LOAD LABEL test_db.label3
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/data/input/file2.csv")
    INTO TABLE `table2`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (date)
    SET(year=year(date), month=month(date), day=day(date))
)
WITH BROKER;
```

> **NOTE**
>
> 您必须首先使用 `column_list` 参数**将数据文件的所有列**临时命名，然后使用 SET 子句临时命名要从数据文件的原始列生成的任何新列。如上例所示，`file2.csv` 中的唯一列在 `column_list` 参数中被临时命名为 `date`，然后调用 SET 子句中的 `year=year(date)`、`month=month(date)` 和 `day=day(date)` 函数来生成三个临时命名为 `year`、`month` 和 `day` 的新列。

有关详细语法和参数说明，请参阅 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 从 Kafka 集群加载数据

如果 `file2.csv` 的数据已发布到 Kafka 集群的 `topic2`，请执行以下语句创建 [Routine Load](../loading/RoutineLoad.md) 作业。

```SQL
CREATE ROUTINE LOAD test_db.table201 ON table2
    COLUMNS TERMINATED BY ",",
    COLUMNS(date,year=year(date),month=month(date),day=day(date))
FROM KAFKA
(
    "kafka_broker_list" = "<kafka_broker_host>:<kafka_broker_port>",
    "kafka_topic" = "topic2",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```

> **NOTE**
>
> 在 `COLUMNS` 参数中，您必须首先**将数据文件的所有列**临时命名，然后临时命名要从数据文件原始列生成的任何新列。如上例所示，`file2.csv` 中的唯一列被临时命名为 `date`，然后调用 `year=year(date)`、`month=month(date)` 和 `day=day(date)` 函数来生成三个临时命名为 `year`、`month` 和 `day` 的新列。

有关详细语法和参数说明，请参阅 [CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)。

### 数据查询

完成从本地文件系统、HDFS 集群或 Kafka 集群加载数据后，查询 `table2` 中的数据以验证加载是否成功。

```SQL
MySQL [test_db]> SELECT * FROM table2;
+------------+------+-------+------+
| date       | year | month | day  |
+------------+------+-------+------+
| 2020-05-20 | 2020 |  5    | 20   |
| 2020-05-21 | 2020 |  5    | 21   |
| 2020-05-22 | 2020 |  5    | 22   |
| 2020-05-23 | 2020 |  5    | 23   |
+------------+------+-------+------+
4 rows in set (0.01 sec)
```

## 从文件路径中提取分区字段值

如果指定的文件路径包含分区字段，您可以使用 `COLUMNS FROM PATH AS` 参数指定要从文件路径中提取的分区字段。文件路径中的分区字段等同于数据文件中的列。`COLUMNS FROM PATH AS` 参数仅在从 HDFS 集群加载数据时支持。

例如，您想加载从 Hive 生成的以下 4 个数据文件：

```Plain
/user/starrocks/data/input/date=2020-05-20/data
1,354
/user/starrocks/data/input/date=2020-05-21/data
2,465
/user/starrocks/data/input/date=2020-05-22/data
1,576
/user/starrocks/data/input/date=2020-05-23/data
2,687
```

这 4 个数据文件存储在 HDFS 集群的 `/user/starrocks/data/input/` 路径中。这些数据文件都按分区字段 `date` 进行分区，并由 2 列组成，依次代表事件类型和用户 ID。

### 从 HDFS 集群加载数据

执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业，该作业将从 `/user/starrocks/data/input/` 文件路径中提取 `date` 分区字段值，并且您可以使用通配符 (*) 指定将文件路径中的所有数据文件加载到 `table1` 中。

```SQL
LOAD LABEL test_db.label4
(
    DATA INFILE("hdfs://<fe_host>:<fe_http_port>/user/starrocks/data/input/date=*/*")
    INTO TABLE `table1`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (event_type, user_id)
    COLUMNS FROM PATH AS (date)
    SET(event_date = date)
)
WITH BROKER;
```

> **NOTE**
>
> 在上例中，指定文件路径中的 `date` 分区字段等同于 `table1` 的 `event_date` 列。因此，您必须使用 SET 子句将 `date` 分区字段映射到 `event_date` 列。如果指定文件路径中的分区字段与 StarRocks 表中的列同名，则无需使用 SET 子句创建映射。

有关详细语法和参数说明，请参阅 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

### 数据查询

完成从 HDFS 集群加载数据后，查询 `table1` 中的数据以验证加载是否成功。

```SQL
MySQL [test_db]> SELECT * FROM table1;
+------------+------------+---------+
| event_date | event_type | user_id |
+------------+------------+---------+
| 2020-05-22 |          1 |     576 |
| 2020-05-20 |          1 |     354 |
| 2020-05-21 |          2 |     465 |
| 2020-05-23 |          2 |     687 |
+------------+------------+---------+
4 rows in set (0.01 sec)
```
