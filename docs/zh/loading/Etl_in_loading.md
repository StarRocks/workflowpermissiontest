displayed_sidebar: docs

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

# 数据导入转换

StarRocks 支持在数据导入时进行数据转换。

该功能支持 [Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)、 [Broker Load](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) 和 [Routine Load](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)，但不支持 [Spark Load](../sql-reference/sql-statements/loading_unloading/SPARK_LOAD.md)。

<InsertPrivNote />

本文以 CSV 数据为例，介绍如何在数据导入时进行抽取和转换。支持的数据文件格式因您选择的导入方式而异。

:::note

对于 CSV 数据，您可以使用 UTF-8 字符串作为文本分隔符，例如逗号 (,)、制表符或管道符 (|)，其长度不超过 50 字节。

:::

## 适用场景

当您将数据文件导入 StarRocks 表时，数据文件中的数据可能无法完全映射到 StarRocks 表中的数据。在这种情况下，您无需在将数据导入 StarRocks 表之前进行抽取或转换。StarRocks 可以在导入过程中帮助您抽取和转换数据：

- 跳过不需要导入的列。
  
  您可以跳过不需要导入的列。此外，如果数据文件中的列顺序与 StarRocks 表中的列顺序不同，您可以创建数据文件与 StarRocks 表之间的列映射。

- 过滤掉您不想导入的行。
  
  您可以指定过滤条件，StarRocks 将根据这些条件过滤掉您不想导入的行。

- 从原始列生成新列。
  
  生成列是根据数据文件的原始列计算出的特殊列。您可以将生成列映射到 StarRocks 表的列。

- 从文件路径中抽取分区字段值。
  
  如果数据文件是由 Apache Hive™ 生成的，您可以从文件路径中抽取分区字段值。

## 数据示例

1. 在您的本地文件系统创建数据文件。

   a. 创建一个名为 `file1.csv` 的数据文件。该文件包含四列，依次表示用户 ID、用户性别、事件日期和事件类型。

      ```Plain
      354,female,2020-05-20,1
      465,male,2020-05-21,2
      576,female,2020-05-22,1
      687,male,2020-05-23,2
      ```

   b. 创建一个名为 `file2.csv` 的数据文件。该文件只包含一列，表示日期。

      ```Plain
      2020-05-20
      2020-05-21
      2020-05-22
      2020-05-23
      ```

2. 在您的 StarRocks 数据库 `test_db` 中创建表。

   > **NOTE**
   >
   > 自 v2.5.7 起，StarRocks 支持在建表或增加分区时自动设置分桶数量 (BUCKETS)。您无需再手动设置分桶数量。详细信息，请参见 [设置分桶数量](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets)。

   a. 创建一个名为 `table1` 的表，其中包含三列：`event_date`、`event_type` 和 `user_id`。

      ```SQL
      MySQL [test_db]> CREATE TABLE table1
      (
          `event_date` DATE COMMENT "event date",
          `event_type` TINYINT COMMENT "event type",
          `user_id` BIGINT COMMENT "user ID"
      )
      DISTRIBUTED BY HASH(user_id);
      ```

   b. 创建一个名为 `table2` 的表，其中包含四列：`date`、`year`、`month` 和 `day`。

      ```SQL
      MySQL [test_db]> CREATE TABLE table2
      (
          `date` DATE COMMENT "date",
          `year` INT COMMENT "year",
          `month` TINYINT COMMENT "month",
          `day` TINYINT COMMENT "day"
      )
      DISTRIBUTED BY HASH(date);
      ```

3. 将 `file1.csv` 和 `file2.csv` 上传到您的 HDFS 集群的 `/user/starrocks/data/input/` 路径，将 `file1.csv` 的数据发布到您的 Kafka 集群的 `topic1`，并将 `file2.csv` 的数据发布到您的 Kafka 集群的 `topic2`。

## 跳过不需要导入的列

您想导入 StarRocks 表的数据文件可能包含一些无法映射到 StarRocks 表的任何列的列。在这种情况下，StarRocks 支持只导入可以从数据文件映射到 StarRocks 表的列。

此功能支持从以下数据源导入数据：

- 本地文件系统

- HDFS 和云存储
  
  > **NOTE**
  >
  > 本节以 HDFS 为例介绍。

- Kafka

大多数情况下，CSV 文件中的列是未命名的。对于某些 CSV 文件，第一行由列名组成，但 StarRocks 将第一行的内容作为普通数据处理，而不是列名。因此，当您导入 CSV 文件时，您必须在作业创建语句或命令中**按顺序**临时命名 CSV 文件的列。这些临时命名的列会**通过名称**映射到 StarRocks 表的列。请注意数据文件的列的以下几点：

- 可以映射到 StarRocks 表的列，并使用 StarRocks 表中列的名称进行临时命名的列，其数据会直接导入。

- 无法映射到 StarRocks 表的列将被忽略，这些列的数据不会导入。

- 如果某些列可以映射到 StarRocks 表的列，但未在作业创建语句或命令中临时命名，则导入作业会报告错误。

本节以 `file1.csv` 和 `table1` 为例。`file1.csv` 的四列依次临时命名为 `user_id`、`user_gender`、`event_date` 和 `event_type`。在 `file1.csv` 的临时命名列中，`user_id`、`event_date` 和 `event_type` 可以映射到 `table1` 的特定列，而 `user_gender` 无法映射到 `table1` 的任何列。因此，`user_id`、`event_date` 和 `event_type` 会导入到 `table1`，但 `user_gender` 不会导入。

### 导入数据

#### 从本地文件系统导入数据

如果 `file1.csv` 存储在您的本地文件系统，运行以下命令创建 [Stream Load](../loading/StreamLoad.md) 作业：

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
> 如果您选择 Stream Load，您必须使用 `columns` 参数临时命名数据文件的列，以创建数据文件与 StarRocks 表之间的列映射。

详细语法和参数说明，请参见 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

#### 从 HDFS 集群导入数据

如果 `file1.csv` 存储在您的 HDFS 集群中，执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业：

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
> 如果您选择 Broker Load，您必须使用 `column_list` 参数临时命名数据文件的列，以创建数据文件与 StarRocks 表之间的列映射。

详细语法和参数说明，请参见 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 从 Kafka 集群导入数据

如果 `file1.csv` 的数据发布到您的 Kafka 集群的 `topic1`，执行以下语句创建 [Routine Load](../loading/RoutineLoad.md) 作业：

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
> 如果您选择 Routine Load，您必须使用 `COLUMNS` 参数临时命名数据文件的列，以创建数据文件与 StarRocks 表之间的列映射。

详细语法和参数说明，请参见 [CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)。

### 查询数据

从您的本地文件系统、HDFS 集群或 Kafka 集群导入数据完成后，查询 `table1` 的数据，验证导入是否成功：

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

## 过滤掉您不想导入的行

当您将数据文件导入 StarRocks 表时，您可能不想导入数据文件中的特定行。在这种情况下，您可以使用 WHERE 子句来指定您想导入的行。StarRocks 会过滤掉所有不满足 WHERE 子句中指定过滤条件的行。

此功能支持从以下数据源导入数据：

- 本地文件系统

- HDFS 和云存储
  > **NOTE**
  >
  > 本节以 HDFS 为例介绍。

- Kafka

本节以 `file1.csv` 和 `table1` 为例。如果您只想从 `file1.csv` 中导入 `event_type` 为 `1` 的行到 `table1`，您可以使用 WHERE 子句指定过滤条件 `event_type = 1`。

### 导入数据

#### 从本地文件系统导入数据

如果 `file1.csv` 存储在您的本地文件系统，运行以下命令创建 [Stream Load](../loading/StreamLoad.md) 作业：

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: user_id, user_gender, event_date, event_type" \
    -H "where: event_type=1" \
    -T file1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table1/_stream_load
```

详细语法和参数说明，请参见 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

#### 从 HDFS 集群导入数据

如果 `file1.csv` 存储在您的 HDFS 集群中，执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业：

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

详细语法和参数说明，请参见 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 从 Kafka 集群导入数据

如果 `file1.csv` 的数据发布到您的 Kafka 集群的 `topic1`，执行以下语句创建 [Routine Load](../loading/RoutineLoad.md) 作业：

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

详细语法和参数说明，请参见 [CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)。

### 查询数据

从您的本地文件系统、HDFS 集群或 Kafka 集群导入数据完成后，查询 `table1` 的数据，验证导入是否成功：

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

当您将数据文件导入 StarRocks 表时，数据文件中的某些数据可能需要转换才能导入 StarRocks 表。在这种情况下，您可以在作业创建命令或语句中使用函数或表达式来实现数据转换。

此功能支持从以下数据源导入数据：

- 本地文件系统

- HDFS 和云存储
  > **NOTE**
  >
  > 本节以 HDFS 为例介绍。

- Kafka

本节以 `file2.csv` 和 `table2` 为例。`file2.csv` 只包含一列，表示日期。您可以使用 [year](../sql-reference/sql-functions/date-time-functions/year.md)、 [month](../sql-reference/sql-functions/date-time-functions/month.md) 和 [day](../sql-reference/sql-functions/date-time-functions/day.md) 函数从 `file2.csv` 中的每个日期中抽取年份、月份和日期，并将抽取的数据导入到 `table2` 的 `year`、`month` 和 `day` 列中。

### 导入数据

#### 从本地文件系统导入数据

如果 `file2.csv` 存储在您的本地文件系统，运行以下命令创建 [Stream Load](../loading/StreamLoad.md) 作业：

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
> - 在 `columns` 参数中，您必须首先临时命名数据文件的**所有列**，然后临时命名您想从原始列生成的新列。如前面的示例所示，`file2.csv` 的唯一列临时命名为 `date`，然后调用 `year=year(date)`、`month=month(date)` 和 `day=day(date)` 函数生成三个新列，并将其临时命名为 `year`、`month` 和 `day`。
>
> - Stream Load 不支持 `column_name = function(column_name)`，但支持 `column_name = function(column_name)`。

详细语法和参数说明，请参见 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

#### 从 HDFS 集群导入数据

如果 `file2.csv` 存储在您的 HDFS 集群中，执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业：

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
> 您必须首先使用 `column_list` 参数临时命名数据文件的**所有列**，然后使用 SET 子句临时命名您想从原始列生成的新列。如前面的示例所示，`file2.csv` 的唯一列在 `column_list` 参数中临时命名为 `date`，然后在 SET 子句中调用 `year=year(date)`、`month=month(date)` 和 `day=day(date)` 函数生成三个新列，并将其临时命名为 `year`、`month` 和 `day`。

详细语法和参数说明，请参见 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

#### 从 Kafka 集群导入数据

如果 `file2.csv` 的数据发布到您的 Kafka 集群的 `topic2`，执行以下语句创建 [Routine Load](../loading/RoutineLoad.md) 作业：

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
> 在 `COLUMNS` 参数中，您必须首先临时命名数据文件的**所有列**，然后临时命名您想从原始列生成的新列。如前面的示例所示，`file2.csv` 的唯一列临时命名为 `date`，然后调用 `year=year(date)`、`month=month(date)` 和 `day=day(date)` 函数生成三个新列，并将其临时命名为 `year`、`month` 和 `day`。

详细语法和参数说明，请参见 [CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md)。

### 查询数据

从您的本地文件系统、HDFS 集群或 Kafka 集群导入数据完成后，查询 `table2` 的数据，验证导入是否成功：

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

## 从文件路径中抽取分区字段值

如果您指定的文件路径包含分区字段，您可以使用 `COLUMNS FROM PATH AS` 参数来指定您想从文件路径中抽取的分区字段。文件路径中的分区字段等同于数据文件中的列。`COLUMNS FROM PATH AS` 参数仅在您从 HDFS 集群导入数据时支持。

例如，您想导入以下由 Hive 生成的四个数据文件：

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

这四个数据文件存储在您的 HDFS 集群的 `/user/starrocks/data/input/` 路径中。每个数据文件都按分区字段 `date` 分区，并包含两列，依次表示事件类型和用户 ID。

### 从 HDFS 集群导入数据

执行以下语句创建 [Broker Load](../loading/hdfs_load.md) 作业，该作业可以从 `/user/starrocks/data/input/` 文件路径中抽取 `date` 分区字段值，并使用通配符 (*) 指定您想导入文件路径中的所有数据文件到 `table1`：

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
> 在前面的示例中，指定文件路径中的 `date` 分区字段等同于 `table1` 的 `event_date` 列。因此，您需要使用 SET 子句将 `date` 分区字段映射到 `event_date` 列。如果指定文件路径中的分区字段与 StarRocks 表的某一列同名，则不需要使用 SET 子句创建映射。

详细语法和参数说明，请参见 [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)。

### 查询数据

从您的 HDFS 集群导入数据完成后，查询 `table1` 的数据，验证导入是否成功：

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
