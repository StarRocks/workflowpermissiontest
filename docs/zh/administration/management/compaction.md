---
displayed_sidebar: docs
---

# 共享数据集群的 Compaction

本主题介绍了如何在 StarRocks 共享数据集群中管理 Compaction。

## 概述

StarRocks 中的每次数据加载操作都会生成新版本的数据文件。Compaction 将不同版本的数据文件合并成更大的文件，减少小文件数量，提高查询效率。

## Compaction 分数

### 概述

*Compaction 分数* 反映了分区中数据文件的合并状态。分数越高表示合并进度越低，意味着该分区有更多未合并的数据文件版本。FE 维护每个分区的 Compaction 分数信息，包括最大 Compaction 分数（分区中所有 Tablet 的最高分数）。

如果分区的最大 Compaction 分数低于 FE 参数 `lake_compaction_score_selector_min_score`（默认值：10），则该分区的 Compaction 被认为已完成。最大 Compaction 分数超过 100 表示 Compaction 处于不健康状态。当分数超过 FE 参数 `lake_ingest_slowdown_threshold`（默认值：100）时，系统会减慢该分区的数据加载事务提交速度。如果超过 `lake_compaction_score_upper_bound`（默认值：2000），系统将拒绝该分区的导入事务。

### 计算规则

通常，每个数据文件对 Compaction 分数贡献 1。例如，如果一个分区有一个 Tablet，并且第一次加载操作生成了 10 个数据文件，则该分区的最大 Compaction 分数为 10。一个事务在 Tablet 内生成的所有数据文件都被分组为一个 Rowset。

在分数计算过程中，Tablet 的 Rowset 按大小分组，文件数量最多的组决定了 Tablet 的 Compaction 分数。

例如，一个 Tablet 进行了 7 次加载操作，生成了大小分别为：100 MB、100 MB、100 MB、10 MB、10 MB、10 MB 和 10 MB 的 Rowset。在计算过程中，系统会将三个 100 MB 的 Rowset 分成一组，将四个 10 MB 的 Rowset 分成另一组。Compaction 分数是根据文件数量更多的组来计算的。在本例中，第二组具有更高的 Compaction 分数。Compaction 优先处理分数更高的组，因此在第一次 Compaction 后，Rowset 分布将是：100 MB、100 MB、100 MB 和 40 MB。

## Compaction 工作流程

对于共享数据集群，StarRocks 引入了一种新的由 FE 控制的 Compaction 机制：

1.  **分数计算**：Leader FE 节点根据事务发布结果计算并存储分区的 Compaction 分数。
2.  **候选选择**：FE 选择最大 Compaction 分数最高的分区作为 Compaction 候选。
3.  **任务生成**：FE 为选定的分区启动 Compaction 事务，生成 Tablet 级别的子任务，并将其分发给计算节点 (CN)，直到达到 FE 参数 `lake_compaction_max_tasks` 设置的限制。
4.  **子任务执行**：CN 在后台执行 Compaction 子任务。每个 CN 的并发子任务数量由 CN 参数 `compact_threads` 控制。
5.  **结果收集**：FE 聚合子任务结果并提交 Compaction 事务。
6.  **发布**：FE 发布成功提交的 Compaction 事务。

## 管理 Compaction

### 查看 Compaction 分数

-   您可以使用 SHOW PROC 语句查看特定表中分区的 Compaction 分数。通常，您只需要关注 `MaxCS` 字段。如果 `MaxCS` 低于 10，则认为 Compaction 已完成。如果 `MaxCS` 高于 100，则 Compaction 分数相对较高。如果 `MaxCS` 超过 500，则 Compaction 分数非常高，可能需要手动干预。

    ```Plain
    SHOW PARTITIONS FROM <table_name>
    SHOW PROC '/dbs/<database_name>/<table_name>/partitions'
    ```

    示例：

    ```Plain
    mysql> SHOW PROC '/dbs/load_benchmark/store_sales/partitions';
    +-------------+---------------+----------------+----------------+-------------+--------+--------------+-------+------------------------------+---------+----------+-----------+----------+------------+-------+-------+-------+
    | PartitionId | PartitionName | CompactVersion | VisibleVersion | NextVersion | State  | PartitionKey | Range | DistributionKey              | Buckets | DataSize | RowCount  | CacheTTL | AsyncWrite | AvgCS | P50CS | MaxCS |
    +-------------+---------------+----------------+----------------+-------------+--------+--------------+-------+------------------------------+---------+----------+-----------+----------+------------+-------+-------+-------+
    | 38028       | store_sales   | 913            | 921            | 923         | NORMAL |              |       | ss_item_sk, ss_ticket_number | 64      | 15.6GB   | 273857126 | 2592000  | false      | 10.00 | 10.00 | 10.00 |
    +-------------+---------------+----------------+----------------+-------------+--------+--------------+-------+------------------------------+---------+----------+-----------+----------+------------+-------+-------+-------+
    1 row in set (0.20 sec)
    ```

-   您还可以通过查询系统定义的视图 `information_schema.partitions_meta` 来查看分区 Compaction 分数。

    示例：

    ```Plain
    mysql> SELECT * FROM information_schema.partitions_meta ORDER BY Max_CS LIMIT 10;
    +--------------+----------------------------+----------------------------+--------------+-----------------+-----------------+----------------------+--------------+---------------+-----------------+-----------------------------------------+---------+-----------------+----------------+---------------------+-----------------------------+--------------+---------+-----------+------------+------------------+----------+--------+--------+-------------------------------------------------------------------+
    | DB_NAME      | TABLE_NAME                 | PARTITION_NAME             | PARTITION_ID | COMPACT_VERSION | VISIBLE_VERSION | VISIBLE_VERSION_TIME | NEXT_VERSION | PARTITION_KEY | PARTITION_VALUE | DISTRIBUTION_KEY                        | BUCKETS | REPLICATION_NUM | STORAGE_MEDIUM | COOLDOWN_TIME       | LAST_CONSISTENCY_CHECK_TIME | IS_IN_MEMORY | IS_TEMP | DATA_SIZE | ROW_COUNT  | ENABLE_DATACACHE | AVG_CS   | P50_CS | MAX_CS | STORAGE_PATH                                                      |
    +--------------+----------------------------+----------------------------+--------------+-----------------+-----------------+----------------------+--------------+---------------+-----------------+-----------------------------------------+---------+-----------------+----------------+---------------------+-----------------------------+--------------+---------+-----------+------------+------------------+----------+--------+--------+-------------------------------------------------------------------+
    | tpcds_1t     | call_center                | call_center                |        11905 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | cc_call_center_sk                       |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 12.3KB    |         42 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11906/11905 |
    | tpcds_1t     | web_returns                | web_returns                |        12030 |               3 |               3 | 2024-03-17 08:40:48  |            4 |               |                 | wr_item_sk, wr_order_number             |      16 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 3.5GB     |   71997522 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/12031/12030 |
    | tpcds_1t     | warehouse                  | warehouse                  |        11847 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | w_warehouse_sk                          |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 4.2KB     |         20 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11848/11847 |
    | tpcds_1t     | ship_mode                  | ship_mode                  |        11851 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | sm_ship_mode_sk                         |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 1.7KB     |         20 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11852/11851 |
    | tpcds_1t     | customer_address           | customer_address           |        11790 |               0 |               2 | 2024-03-17 08:32:19  |            3 |               |                 | ca_address_sk                           |      16 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 120.9MB   |    6000000 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11791/11790 |
    | tpcds_1t     | time_dim                   | time_dim                   |        11855 |               0 |               2 | 2024-03-17 08:30:48  |            3 |               |                 | t_time_sk                               |      16 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 864.7KB   |      86400 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11856/11855 |
    | tpcds_1t     | web_sales                  | web_sales                  |        12049 |               3 |               3 | 2024-03-17 10:14:20  |            4 |               |                 | ws_item_sk, ws_order_number             |     128 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 47.7GB    |  720000376 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/12050/12049 |
    | tpcds_1t     | store                      | store                      |        11901 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | s_store_sk                              |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 95.6KB    |       1002 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11902/11901 |
    | tpcds_1t     | web_site                   | web_site                   |        11928 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | web_site_sk                             |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 13.4KB    |         54 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11929/11928 |
    | tpcds_1t     | household_demographics     | household_demographics     |        11932 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | hd_demo_sk                              |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 2.1KB     |       7200 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11933/11932 |
    +--------------+----------------------------+----------------------------+--------------+-----------------+-----------------+----------------------+--------------+---------------+-----------------+-----------------------------------------+---------+-----------------+----------------+---------------------+-----------------------------+--------------+---------+-----------+------------+------------------+----------+--------+--------+-------------------------------------------------------------------+
    ```

### 查看 Compaction 任务

随着新数据加载到系统，FE 会不断调度 Compaction 任务在不同的 CN 节点上执行。您可以首先在 FE 上查看 Compaction 任务的总体状态，然后查看每个任务在 CN 上的执行详情。

#### 查看 Compaction 任务总体状态

您可以使用 SHOW PROC 语句查看 Compaction 任务的总体状态。

```SQL
SHOW PROC '/compactions';
```

示例：

```Plain
mysql> SHOW PROC '/compactions';
+---------------------+-------+---------------------+---------------------+---------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Partition           | TxnID | StartTime           | CommitTime          | FinishTime          | Error | Profile                                                                                                                                                                                                              |
+---------------------+-------+---------------------+---------------------+---------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ssb.lineorder.10081 | 15    | 2026-01-10 03:29:07 | 2026-01-10 03:29:11 | 2026-01-10 03:29:12 | NULL  | {"sub_task_count":12,"read_local_sec":0,"read_local_mb":218,"read_remote_sec":0,"read_remote_mb":0,"read_segment_count":120,"write_segment_count":12,"write_segment_mb":219,"write_remote_sec":4,"in_queue_sec":18} |
| ssb.lineorder.10068 | 16    | 2026-01-10 03:29:07 | 2026-01-10 03:29:13 | 2026-01-10 03:29:14 | NULL  | {"sub_task_count":12,"read_local_sec":0,"read_local_mb":218,"read_remote_sec":0,"read_remote_mb":0,"read_segment_count":120,"write_segment_count":12,"write_segment_mb":218,"write_remote_sec":4,"in_queue_sec":38} |
| ssb.lineorder.10055 | 20    | 2026-01-10 03:29:11 | 2026-01-10 03:29:15 | 2026-01-10 03:29:17 | NULL  | {"sub_task_count":12,"read_local_sec":0,"read_local_mb":218,"read_remote_sec":0,"read_remote_mb":0,"read_segment_count":120,"write_segment_count":12,"write_segment_mb":218,"write_remote_sec":4,"in_queue_sec":23} |
+---------------------+-------+---------------------+---------------------+---------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

返回以下字段：

-   `Partition`：Compaction 任务所属的分区。
-   `TxnID`：分配给 Compaction 任务的事务 ID。
-   `StartTime`：Compaction 任务开始时间。`NULL` 表示任务尚未启动。
-   `CommitTime`：Compaction 任务提交数据的时间。`NULL` 表示数据尚未提交。
-   `FinishTime`：Compaction 任务发布数据的时间。`NULL` 表示数据尚未发布。
-   `Error`：Compaction 任务的错误信息（如果有）。
-   `Profile`：（v3.2.12 和 v3.3.4 起支持）Compaction 任务完成后的 Profile。
    -   `sub_task_count`：分区中的子任务数量（等同于 Tablet 数量）。
    -   `read_local_sec`：所有子任务从本地缓存读取数据的总耗时。单位：秒。
    -   `read_local_mb`：所有子任务从本地缓存读取数据的总大小。单位：MB。
    -   `read_remote_sec`：所有子任务从远端存储读取数据的总耗时。单位：秒。
    -   `read_remote_mb`：所有子任务从远端存储读取数据的总大小。单位：MB。
    -   `read_segment_count`：所有子任务读取的文件总数。
    -   `write_segment_count`：所有子任务生成的新文件总数。
    -   `write_segment_mb`：所有子任务生成的新文件总大小。单位：MB。
    -   `write_remote_sec`：所有子任务向远端存储写入数据的总耗时。单位：秒。
    -   `in_queue_sec`：所有子任务在队列中的总停留时间。单位：秒。

#### 查看 Compaction 任务执行详情

每个 Compaction 任务被分成多个子任务，每个子任务对应一个 Tablet。您可以通过查询系统定义的视图 `information_schema.be_cloud_native_compactions` 来查看每个子任务的执行详情。

示例：

```Plain
mysql> SELECT * FROM information_schema.be_cloud_native_compactions;
+-------+--------+-----------+---------+---------+------+---------------------+-------------+----------+--------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| BE_ID | TXN_ID | TABLET_ID | VERSION | SKIPPED | RUNS | START_TIME          | FINISH_TIME | PROGRESS | STATUS | PROFILE                                                                                                                                                                                         |
+-------+--------+-----------+---------+---------+------+---------------------+-------------+----------+--------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 10001 |  51047 |     43034 |      12 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       82 |        | {"read_local_sec":0,"read_local_mb":31,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
| 10001 |  51048 |     43032 |      12 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       82 |        | {"read_local_sec":0,"read_local_mb":32,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
| 10001 |  51049 |     43033 |      12 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       82 |        | {"read_local_sec":0,"read_local_mb":31,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
    | 10001 |  51051 |     43038 |       9 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       84 |        | {"read_local_sec":0,"read_local_mb":31,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
    | 10001 |  51052 |     43036 |      12 |       0 |    0 | NULL                | NULL        |        0 |        |                                                                                                                                                                                                 |
    | 10001 |  51053 |     43035 |      12 |       0 |    1 | 2024-09-24 19:15:16 | NULL        |        2 |        | {"read_local_sec":0,"read_local_mb":1,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":100,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0}   |
    +-------+--------+-----------+---------+---------+------+---------------------+-------------+----------+--------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

返回以下字段：

-   `BE_ID`：CN 的 ID。
-   `TXN_ID`：子任务所属事务的 ID。
-   `TABLET_ID`：子任务所属 Tablet 的 ID。
-   `VERSION`：Tablet 的版本。
-   `RUNS`：子任务已执行的次数。
-   `START_TIME`：子任务开始时间。
-   `FINISH_TIME`：子任务结束时间。
-   `PROGRESS`：Tablet 的 Compaction 进度（百分比）。
-   `STATUS`：子任务的状态。如果发生错误，此字段将返回错误信息。
-   `PROFILE`：（v3.2.12 和 v3.3.4 起支持）子任务的运行时 Profile。
    -   `read_local_sec`：子任务从本地缓存读取数据的耗时。单位：秒。
    -   `read_local_mb`：子任务从本地缓存读取数据的大小。单位：MB。
    -   `read_remote_sec`：子任务从远端存储读取数据的耗时。单位：秒。
    -   `read_remote_mb`：子任务从远端存储读取数据的大小。单位：MB。
    -   `read_local_count`：子任务从本地缓存读取数据的次数。
    -   `read_remote_count`：子任务从远端存储读取数据的次数。
    -   `in_queue_sec`：子任务在队列中的停留时间。单位：秒。

### 配置 Compaction 任务

您可以使用这些 FE 和 CN (BE) 参数来配置 Compaction 任务。

#### FE 参数

您可以动态配置以下 FE 参数。

```SQL
ADMIN SET FRONTEND CONFIG ("lake_compaction_max_tasks" = "-1");
```

##### lake_compaction_max_tasks

-   默认值：-1
-   类型：Int
-   单位：-
-   是否可变：是
-   描述：共享数据集群中允许的最大并发 Compaction 任务数量。将此项设置为 `-1` 表示以自适应方式计算并发任务数量，即存活 CN 节点的数量乘以 16。将此值设置为 `0` 将禁用 Compaction。
-   引入版本：v3.1.0

```SQL
ADMIN SET FRONTEND CONFIG ("lake_compaction_disable_tables" = "11111;22222");
```

##### lake_compaction_disable_tables

-   默认值：""
-   类型：String
-   单位：-
-   是否可变：是
-   描述：禁用某些表的 Compaction。这不会影响已开始的 Compaction。此项的值是表 ID。多个值用分号分隔。
-   引入版本：v3.2.7

#### CN 参数

您可以动态配置以下 CN 参数。

```SQL
UPDATE information_schema.be_configs SET VALUE = 8
WHERE name = "compact_threads";
```

##### compact_threads

-   默认值：4
-   类型：Int
-   单位：-
-   是否可变：是
-   描述：用于并发 Compaction 任务的最大线程数。此配置从 v3.1.7 和 v3.2.2 起改为动态。
-   引入版本：v3.0.0

> **注意**
>
> 在生产环境中，建议将 `compact_threads` 设置为 BE/CN CPU 核心数的 25%。

##### max_cumulative_compaction_num_singleton_deltas

-   默认值：500
-   类型：Int
-   单位：-
-   是否可变：是
-   描述：单个 Cumulative Compaction 中可以合并的最大段数。如果在 Compaction 期间发生 OOM，您可以减小此值。
-   引入版本：-

> **注意**
>
> 在生产环境中，建议将 `max_cumulative_compaction_num_singleton_deltas` 设置为 `100`，以加速 Compaction 任务并减少其资源消耗。

##### lake_pk_compaction_max_input_rowsets

-   默认值：500
-   类型：Int
-   单位：-
-   是否可变：是
-   描述：共享数据集群中主键表 Compaction 任务允许的最大输入 Rowset 数量。此参数的默认值从 `5` 更改为 `1000`（自 v3.2.4 和 v3.1.10 起），并更改为 `500`（自 v3.3.1 和 v3.2.9 起）。在为主键表启用分层 Compaction 策略（通过将 `enable_pk_size_tiered_compaction_strategy` 设置为 `true`）后，StarRocks 无需限制每次 Compaction 的 Rowset 数量来减少写入放大。因此，此参数的默认值有所增加。
-   引入版本：v3.1.8, v3.2.3

> **注意**
>
> 在生产环境中，建议将 `max_cumulative_compaction_num_singleton_deltas` 设置为 `100`，以加速 Compaction 任务并减少其资源消耗。

### 手动触发 Compaction 任务

```SQL
-- 触发整个表的 Compaction。
ALTER TABLE <table_name> COMPACT;
-- 触发特定分区的 Compaction。
ALTER TABLE <table_name> COMPACT <partition_name>;
-- 触发多个分区的 Compaction。
ALTER TABLE <table_name> COMPACT (<partition_name>, <partition_name>, ...);
```

### 取消 Compaction 任务

您可以使用任务的事务 ID 手动取消 Compaction 任务。

```SQL
CANCEL COMPACTION WHERE TXN_ID = <TXN_ID>;
```

> **注意**
>
> -   CANCEL COMPACTION 语句必须从 Leader FE 节点提交。
> -   CANCEL COMPACTION 语句仅适用于尚未提交的事务，即在 `SHOW PROC '/compactions'` 的返回结果中，`CommitTime` 为 NULL。
> -   CANCEL COMPACTION 是一个异步过程。您可以通过执行 `SHOW PROC '/compactions'` 来检查任务是否已取消。

## 最佳实践

由于 Compaction 对查询性能至关重要，建议定期监控表和分区的数据合并状态。以下是一些最佳实践和指南：

-   尝试增加加载间隔时间（避免小于 10 秒的间隔）并增加每次加载的批次大小（避免小于 100 行数据的批次大小）。
-   调整 CN 上并行 Compaction 工作线程的数量以加速任务执行。在生产环境中，建议将 `compact_threads` 设置为 BE/CN CPU 核心数的 25%。
-   使用 `show proc '/compactions'` 和 `select * from information_schema.be_cloud_native_compactions;` 监控 Compaction 任务状态。
-   监控 Compaction 分数，并根据其配置告警。StarRocks 内置的 Grafana 监控模板包含此指标。
-   关注 Compaction 期间的资源消耗，尤其是内存使用。Grafana 监控模板也包含此指标。

## 故障排除

### 慢查询

要识别由不及时 Compaction 导致的慢查询，您可以在 SQL Profile 中检查单个 Fragment 内 `SegmentsReadCount` 除以 `TabletCount` 的值。如果这是一个很大的值，例如几十或更多，则不及时 Compaction 可能是慢查询的原因。

### 集群中最大 Compaction 分数过高

1.  使用 `ADMIN SHOW FRONTEND CONFIG LIKE "%lake_compaction%"` 和 `SELECT * FROM information_schema.be_configs WHERE name = "compact_threads"` 检查 Compaction 相关参数是否在合理范围内。
2.  使用 `SHOW PROC '/compactions'` 检查 Compaction 是否卡住：
    -   如果 `CommitTime` 保持为 NULL，请检查系统视图 `information_schema.be_cloud_native_compactions` 以了解 Compaction 卡住的原因。
    -   如果 `FinishTime` 保持为 NULL，请使用 `TxnID` 在 Leader FE 日志中搜索发布失败的原因。
3.  使用 `SHOW PROC '/compactions'` 检查 Compaction 是否运行缓慢：
    -   如果 `sub_task_count` 过大（使用 `SHOW PARTITIONS` 检查此分区中每个 Tablet 的大小），则表可能创建不当。
    -   如果 `read_remote_mb` 过大（超过总读取数据的 30%），请检查服务器磁盘大小，并通过 `SHOW BACKENDS` 检查 `DataCacheMetrics` 字段的缓存配额。
    -   如果 `write_remote_sec` 过大（超过总 Compaction 时间的 90%），则写入远端存储可能过慢。这可以通过检查带有关键字 `single upload latency` 和 `multi upload latency` 的共享数据特定监控指标来验证。
    -   如果 `in_queue_sec` 过大（每个 Tablet 的平均等待时间超过 60 秒），则参数设置可能不合理或有其他正在运行的 Compaction 过慢。
