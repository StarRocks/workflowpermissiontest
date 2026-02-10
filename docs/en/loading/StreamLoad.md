---
displayed_sidebar: docs
keywords: ['Stream Load']
---

# Load Data from a Local File System

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

StarRocks provides two methods for loading data from a local file system:

- Use [Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) for synchronous import
- Use [Broker Load](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) for asynchronous import

Each method has its advantages:

- Stream Load supports CSV and JSON file formats. This method is recommended if you want to load data from a small number of files (each file not exceeding 10 GB).
- Broker Load supports Parquet, ORC, CSV, and JSON file formats (JSON file format supported from v3.2.3). This method is recommended if you want to load data from a large number of files (each file exceeding 10 GB), or if files are stored in Network Attached Storage (NAS) devices. **Starting from v2.5, Broker Load supports loading data from a local file system.**

For CSV data, please note the following:

- You can use UTF-8 strings (such as a comma (,), tab, or pipe (|)), with a length of no more than 50 bytes, as the text delimiter.
- Null values are represented by `\N`. For example, a data file contains three columns, and a record in this data file contains data in the first and third columns but not in the second column. In this case, you need to use `\N` in the second column to represent a null value. This means the record must compile to `a,\N,b` instead of `a,,b`. `a,,b` means the second column of the record contains an empty string.

Both Stream Load and Broker Load support data transformation during data import and data changes through UPSERT and DELETE operations during data import. For more information, see [Transform Data During Loading](../loading/Etl_in_loading.md) and [Change Data by Importing](../loading/Load_to_Primary_Key_tables.md).

## Prerequisites

### Check Permissions

<InsertPrivNote />

#### Check Network Configuration

Ensure that the machine where your data to be loaded resides can access the FE and BE nodes of your StarRocks cluster through [`http_port`](../administration/management/FE_configuration.md#http_port) (default: `8030`) and [`be_http_port`](../administration/management/BE_configuration.md#be_http_port) (default: `8040`).

## Load from a Local File System via Stream Load

Stream Load is a synchronous import method based on HTTP PUT. After you submit an import job, StarRocks runs the job synchronously and returns the job result after the job completes. You can determine whether the job is successful based on the job result.

> **NOTE**
>
> After data is imported into a StarRocks table through Stream Load, the data of materialized views created based on that table will also be updated.

### Principle

You can submit an import request to an FE based on the HTTP protocol on the client, and then the FE uses HTTP redirection to forward the import request to a specific BE or CN. You can also directly submit an import request to the BE or CN you choose on the client.

:::note

If you submit an import request to an FE, the FE uses a round-robin mechanism to decide which BE or CN will act as the coordinator to receive and process the import request. The round-robin mechanism helps achieve load balancing in a StarRocks cluster. Therefore, we recommend that you send import requests to an FE.

:::

The BE or CN that receives the import request runs as a coordinator BE or CN to split the data into multiple parts based on the schema used and assign the data of each part to other involved BEs or CNs. After the import is complete, the coordinator BE or CN returns the import job result to your client. Note that if the coordinator BE or CN stops during the import, the import job will fail.

The following figure shows the workflow of a Stream Load job.

![Stream Load Workflow](../_assets/4.2-1.png)

### Restrictions

Stream Load does not support loading data from CSV files that contain JSON format columns.

### Typical Example

This section uses curl as an example to describe how to load data from CSV or JSON files from a local file system into StarRocks. For detailed syntax and parameter descriptions, see [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md).

Please note that in StarRocks, some literals are used as reserved keywords by the SQL language. Do not use these keywords directly in SQL statements. If you want to use such keywords in SQL statements, enclose them in a pair of backticks (`` ` ``). See [Keywords](../sql-reference/sql-statements/keywords.md).

#### Load CSV Data

##### Prepare Dataset

In your local file system, create a CSV file named `example1.csv`. This file contains three columns, representing user ID, user name, and user score, in order.

```Plain
1,Lily,23
2,Rose,23
3,Alice,24
4,Julia,25
```

##### Create Database and Table

Create a database and switch to it:

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

Create a Primary Key table named `table1`. This table contains three columns: `id`, `name`, and `score`, where `id` is the primary key.

```SQL
CREATE TABLE `table1`
(
    `id` int(11) NOT NULL COMMENT "user ID",
    `name` varchar(65533) NULL COMMENT "user name",
    `score` int(11) NOT NULL COMMENT "user score"
)
ENGINE=OLAP
PRIMARY KEY(`id`)
DISTRIBUTED BY HASH(`id`);
```

:::note

Starting from v2.5.7, StarRocks can automatically set the number of buckets (BUCKETS) when you create a table or add a partition. You no longer need to manually set the number of buckets. For more information, see [Set the number of buckets](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets).

:::

##### Start Stream Load

Run the following command to load the data from `example1.csv` into `table1`:

```Bash
curl --location-trusted -u <username>:<password> -H "label:123" \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: id, name, score" \
    -T example1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/mydatabase/table1/_stream_load
```

:::note

- If the account you are using has no password set, you only need to enter `<username>:`.
- You can use [SHOW FRONTENDS](../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_FRONTENDS.md) to view the IP addresses and HTTP ports of FE nodes.

:::

`example1.csv` contains three columns, which are separated by commas (,), and can be mapped to the `id`, `name`, and `score` columns of `table1` in order. Therefore, you need to use the `column_separator` parameter to specify a comma (,) as the column separator. You also need to use the `columns` parameter to temporarily name the three columns of `example1.csv` as `id`, `name`, and `score`, which are mapped to the three columns of `table1` in order.

After the import is complete, you can query `table1` to verify whether the import is successful:

```SQL
SELECT * FROM table1;
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

#### Load JSON Data

Starting from v3.2.7, Stream Load supports compressing JSON data during transfer, thereby reducing network bandwidth overhead. Users can use the `compression` and `Content-Encoding` parameters to specify different compression algorithms. Supported compression algorithms include GZIP, BZIP2, LZ4_FRAME, and ZSTD. For syntax, see [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md).

##### Prepare Dataset

In your local file system, create a JSON file named `example2.json`. This file contains two columns, representing city ID and city name, in order.

```JSON
{"name": "Beijing", "code": 2}
```

##### Create Database and Table

Create a database and switch to it:

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

Create a Primary Key table named `table2`. This table contains two columns: `id` and `city`, where `id` is the primary key.

```SQL
CREATE TABLE `table2`
(
    `id` int(11) NOT NULL COMMENT "city ID",
    `city` varchar(65533) NULL COMMENT "city name"
)
ENGINE=OLAP
PRIMARY KEY(`id`)
DISTRIBUTED BY HASH(`id`);
```

:::note

Starting from v2.5.7, StarRocks can automatically set the number of buckets (BUCKETS) when you create a table or add a partition. You no longer need to manually set the number of buckets. For more information, see [Set the number of buckets](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets).

:::

##### Start Stream Load

Run the following command to load the data from `example2.json` into `table2`:

```Bash
curl -v --location-trusted -u <username>:<password> -H "strict_mode: true" \
    -H "Expect:100-continue" \
    -H "format: json" -H "jsonpaths: [\"$.name\", \"$.code\"]" \
    -H "columns: city,tmp_id, id = tmp_id * 100" \
    -T example2.json -XPUT \
    http://<fe_host>:<fe_http_port>/api/mydatabase/table2/_stream_load
```

:::note

- If the account you are using has no password set, you only need to enter `<username>:`.
- You can use [SHOW FRONTENDS](../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_FRONTENDS.md) to view the IP addresses and HTTP ports of FE nodes.

:::

`example2.json` contains two keys `name` and `code`, which are mapped to the `id` and `city` columns of `table2` as shown in the following figure.

![JSON - Column Mapping](../_assets/4.2-2.png)

The mapping shown in the preceding figure is described as follows:

- StarRocks extracts the `name` and `code` keys from `example2.json` and maps them to the `name` and `code` fields declared in the `jsonpaths` parameter.

- StarRocks extracts the `name` and `code` fields declared in the `jsonpaths` parameter and maps them **in order** to the `city` and `tmp_id` fields declared in the `columns` parameter.

- StarRocks extracts the `city` and `tmp_id` fields declared in the `columns` parameter and maps them **by name** to the `city` and `id` columns of `table2`.

:::note

In the preceding example, the value of `code` in `example2.json` is multiplied by 100 before being loaded into the `id` column of `table2`.

:::

For detailed mapping among `jsonpaths`, `columns`, and columns of StarRocks table, see the "Column mapping" section in [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md).

After the import is complete, you can query `table2` to verify whether the import is successful:

```SQL
SELECT * FROM table2;
+------+--------+
| id   | city   |
+------+--------+
| 200  | Beijing|
+------+--------+
4 rows in set (0.01 sec)
```

import Beta from '../_assets/commonMarkdown/_beta.mdx'

#### Merge Stream Load Requests

<Beta />

Starting from v3.4.0, the system supports merging multiple Stream Load requests.

:::warning

Please note that Merge Commit optimization is applicable to scenarios with **concurrent** Stream Load jobs on a single table. If the concurrency is 1, this optimization is not recommended. Also, think twice before setting `merge_commit_async` to `false` and `merge_commit_interval_ms` to a large value, as they might lead to degraded import performance.

:::

Merge Commit is an optimization for Stream Load, designed for high-concurrency, small-batch (from KB to tens of MB) real-time import scenarios. In earlier versions, each Stream Load request would generate a transaction and a data version, which led to the following problems in high-concurrency import scenarios:

- Excessive data versions affect query performance, and limiting the number of versions may cause `too many versions` errors.
- Merging data versions through Compaction increases resource consumption.
- It generates small files, increasing IOPS and I/O latency. In a compute-storage separated cluster, this also increases cloud object storage costs.
- The Leader FE node, as the transaction manager, may become a single point bottleneck.

Merge Commit mitigates these problems by merging multiple concurrent Stream Load requests within a time window into a single transaction. This reduces the number of transactions and versions generated by high-concurrency requests, thereby improving import performance.

Merge Commit supports both synchronous and asynchronous modes. Each mode has its advantages and disadvantages. You can choose based on your use case.

- **Synchronous mode**

  The server returns only after the merged transaction is committed, ensuring that the import is successful and visible.

- **Asynchronous mode**

  The server returns immediately after receiving the data. This mode does not guarantee import success.

| **Mode**   | **Advantages**                                               | **Disadvantages**                                                    |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Synchronous     | <ul><li>Ensures data durability and visibility when the request returns.</li><li>Guarantees that multiple sequential import requests from the same client are executed in order.</li></ul> | Each import request from the client is blocked until the server closes the merge window. If the window is too large, it may reduce the data processing capability of a single client. |
| Asynchronous     | Allows a single client to send subsequent import requests without waiting for the server to close the merge window, thereby improving import throughput. | <ul><li>Does not guarantee data durability or visibility upon return. The client must verify the transaction status later.</li><li>Does not guarantee that multiple sequential import requests from the same client are executed in order.</li></ul> |

##### Start Stream Load

- Run the following command to start a Stream Load job with Merge Commit enabled (synchronous mode), and set the merge window to `5000` milliseconds and the parallelism to `2`:

  ```Bash
  curl --location-trusted -u <username>:<password> \
      -H "Expect:100-continue" \
      -H "column_separator:," \
      -H "columns: id, name, score" \
      -H "enable_merge_commit:true" \
      -H "merge_commit_interval_ms:5000" \
      -H "merge_commit_parallel:2" \
      -T example1.csv -XPUT \
      http://<fe_host>:<fe_http_port>/api/mydatabase/table1/_stream_load
  ```

- Run the following command to start a Stream Load job with Merge Commit enabled (asynchronous mode), and set the merge window to `60000` milliseconds and the parallelism to `2`:

  ```Bash
  curl --location-trusted -u <username>:<password> \
      -H "Expect:100-continue" \
      -H "column_separator:," \
      -H "columns: id, name, score" \
      -H "enable_merge_commit:true" \
      -H "merge_commit_async:true" \
      -H "merge_commit_interval_ms:60000" \
      -H "merge_commit_parallel:2" \
      -T example1.csv -XPUT \
      http://<fe_host>:<fe_http_port>/api/mydatabase/table1/_stream_load
  ```

:::note

- Merge Commit only supports merging **homogeneous** import requests into a single database and table. "Homogeneous" means the Stream Load parameters are the same, including: general parameters, JSON format parameters, CSV format parameters, `opt_properties`, and Merge Commit parameters.
- For loading CSV format data, you must ensure that each row ends with a row delimiter. `skip_header` is not supported.
- The server automatically generates a label for the transaction. If a label is specified, it will be ignored.
- Merge Commit merges multiple import requests into a single transaction. If one request contains data quality issues, all requests in the transaction will fail.

:::

#### Check Stream Load Progress

After the import job is complete, StarRocks returns the job result in JSON format. For more information, see the "Return value" section in [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md).

Stream Load does not allow you to query the result of an import job using the SHOW LOAD statement.

#### Cancel Stream Load Job

Stream Load does not allow you to cancel import jobs. If an import job times out or encounters an error, StarRocks automatically cancels it.

### Parameter Configuration

This section describes some system parameters that you need to configure if you choose the Stream Load import method. These parameter configurations take effect for all Stream Load jobs.

- `streaming_load_max_mb`: The maximum size of each data file you want to load. The default maximum size is 10 GB. For more information, see [Configure BE or CN dynamic parameters](../administration/management/BE_configuration.md).

  We recommend that you do not load more than 10 GB of data at a time. If the size of a data file exceeds 10 GB, we recommend that you split the data file into smaller files, each less than 10 GB, and then load these files one by one. If you cannot split data files larger than 10 GB, you can increase the value of this parameter based on the file size.

  After you increase the value of this parameter, the new value takes effect only after you restart the BEs or CNs of your StarRocks cluster. In addition, system performance may degrade, and the cost of retrying upon import failure will increase.

  :::note

  When you load data from JSON files, please note the following:

  - The size of each JSON object in a file cannot exceed 4 GB. If any JSON object in a file exceeds 4 GB, StarRocks will throw the error "This parser can't support a document that big."

  - By default, the JSON body in an HTTP request cannot exceed 100 MB. If the JSON body exceeds 100 MB, StarRocks will throw the error "The size of this batch exceed the max size [104857600] of json type data data [8617627793]. Set ignore_json_size to skip check, although it may lead huge memory consuming." To prevent this error, you can add `"ignore_json_size:true"` in the HTTP request header to ignore the check on the JSON body size.

  :::

- `stream_load_default_timeout_second`: The timeout period for each import job. The default timeout period is 600 seconds. For more information, see [Configure FE dynamic parameters](../administration/management/FE_configuration.md#configure-fe-dynamic-parameters).

  If many import jobs you create time out, you can increase the value of this parameter based on the calculation result obtained from the following formula:

  **Timeout period for each import job > Amount of data to be loaded / Average loading speed**

  For example, if the data file you want to load is 10 GB in size and the average loading speed of your StarRocks cluster is 100 MB/s, set the timeout period to more than 100 seconds.

  :::note

  The **average loading speed** in the preceding formula is the average loading speed of your StarRocks cluster. It varies depending on disk I/O and the number of BEs or CNs in your StarRocks cluster.

  :::

  Stream Load also provides the `timeout` parameter, which allows you to specify the timeout period for a single import job. For more information, see [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md).

### Usage Notes

If a field for a certain record is missing in the data file to be loaded, and the column mapped to that field in the StarRocks table is defined as `NOT NULL`, StarRocks automatically fills `NULL` values in the mapped column of the StarRocks table during the loading of that record. You can also use the `ifnull()` function to specify a default value to be filled.

For example, if the field representing the city ID is missing in the `example2.json` file mentioned above, and you want to fill the mapped column of `table2` with value `x`, you can specify `"columns: city, tmp_id, id = ifnull(tmp_id, 'x')"`.

## Load from a Local File System via Broker Load

In addition to Stream Load, you can also use Broker Load to load data from a local file system. This feature is supported starting from v2.5.

Broker Load is an asynchronous import method. After you submit an import job, StarRocks runs the job asynchronously and does not return the job result immediately. You need to manually query the job result. See [Check Broker Load Progress](#check-broker-load-progress).

### Restrictions

- Currently, Broker Load only supports loading from a local file system through a single broker of v2.5 or later.
- High-concurrency queries against a single broker may lead to issues such as timeouts and OOMs. To mitigate the impact, you can use the `pipeline_dop` variable (see [System Variables](../sql-reference/System_variable.md#pipeline_dop)) to set the query parallelism for Broker Load. For queries against a single broker, we recommend setting `pipeline_dop` to a value less than `16`.

### Typical Example

Broker Load supports loading data from a single data file into a single table, from multiple data files into a single table, and from multiple data files into multiple tables. This section takes loading from multiple data files into a single table as an example.

Please note that in StarRocks, some literals are used as reserved keywords by the SQL language. Do not use these keywords directly in SQL statements. If you want to use such keywords in SQL statements, enclose them in a pair of backticks (`` ` ``). See [Keywords](../sql-reference/sql-statements/keywords.md).

#### Prepare Dataset

Take CSV file format as an example. Log in to your local file system and create two CSV files, `file1.csv` and `file2.csv`, in a specific storage location (for example, `/home/disk1/business/`). Both files contain three columns, representing user ID, user name, and user score, in order.

- `file1.csv`

  ```Plain
  1,Lily,21
  2,Rose,22
  3,Alice,23
  4,Julia,24
  ```

- `file2.csv`

  ```Plain
  5,Tony,25
  6,Adam,26
  7,Allen,27
  8,Jacky,28
  ```

#### Create Database and Table

Create a database and switch to it:

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

Create a Primary Key table named `mytable`. This table contains three columns: `id`, `name`, and `score`, where `id` is the primary key.

```SQL
CREATE TABLE `mytable`
(
    `id` int(11) NOT NULL COMMENT "User ID",
    `name` varchar(65533) NULL DEFAULT "" COMMENT "User name",
    `score` int(11) NOT NULL DEFAULT "0" COMMENT "User score"
)
ENGINE=OLAP
PRIMARY KEY(`id`)
DISTRIBUTED BY HASH(`id`)
PROPERTIES("replication_num"="1");
```

#### Start Broker Load

Run the following command to start a Broker Load job that loads data from all data files (`file1.csv` and `file2.csv`) stored in the `/home/disk1/business/` path of the local file system into the StarRocks table `mytable`:

```SQL
LOAD LABEL mydatabase.label_local
(
    DATA INFILE("file:///home/disk1/business/csv/*")
    INTO TABLE mytable
    COLUMNS TERMINATED BY ","
    (id, name, score)
)
WITH BROKER "sole_broker"
PROPERTIES
(
    "timeout" = "3600"
);
```

This job has four main parts:

- `LABEL`: A string used to query the status of the import job.
- `LOAD` declaration: Source URI, source data format, and target table name.
- `PROPERTIES`: Timeout value and any other attributes to apply to the import job.

For detailed syntax and parameter descriptions, see [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md).

#### Check Broker Load Progress

In v3.0 and earlier, use the [SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md) statement or curl command to view the progress of a Broker Load job.

In v3.1 and later, you can view the progress of a Broker Load job from the [`information_schema.loads`](../sql-reference/information_schema/loads.md) view:

```SQL
SELECT * FROM information_schema.loads;
```

If you have submitted multiple import jobs, you can filter by the `LABEL` associated with the job. Example:

```SQL
SELECT * FROM information_schema.loads WHERE LABEL = 'label_local';
```

After confirming that the import job is complete, you can query the table to see if the data has been successfully loaded. Example:

```SQL
SELECT * FROM mytable;
+------+-------+-------+
| id   | name  | score |
+------+-------+-------+
|    3 | Alice |    23 |
|    5 | Tony  |    25 |
|    6 | Adam  |    26 |
|    1 | Lily  |    21 |
|    2 | Rose  |    22 |
|    4 | Julia |    24 |
|    7 | Allen |    27 |
|    8 | Jacky |    28 |
+------+-------+-------+
8 rows in set (0.07 sec)
```

#### Cancel Broker Load Job

When an import job is not in the **CANCELLED** or **FINISHED** stage, you can use the [CANCEL LOAD](../sql-reference/sql-statements/loading_unloading/CANCEL_LOAD.md) statement to cancel the job.

For example, you can execute the following statement to cancel the import job with label `label_local` in the database `mydatabase`:

```SQL
CANCEL LOAD
FROM mydatabase
WHERE LABEL = "label_local";
```

## Load from NAS via Broker Load

There are two ways to load data from NAS using Broker Load:

- Treat NAS as a local file system and run the import job with a broker. See the previous section "[Load from a Local File System via Broker Load](#load-from-a-local-file-system-via-broker-load)".
- (Recommended) Treat NAS as a cloud storage system and run the import job without a broker.

This section describes the second method. The detailed operations are as follows:

1. Mount the NAS device to the same path on all BE or CN nodes and FE nodes of the StarRocks cluster. This allows all BEs or CNs to access the NAS device as if they were accessing files stored locally.

2. Use Broker Load to load data from the NAS device into the target StarRocks table. Example:

   ```SQL
   LOAD LABEL test_db.label_nas
   (
       DATA INFILE("file:///home/disk1/sr/*")
       INTO TABLE mytable
       COLUMNS TERMINATED BY ","
   )
   WITH BROKER
   PROPERTIES
   (
       "timeout" = "3600"
   );
   ```

   This job has four main parts:

   - `LABEL`: A string used to query the status of the import job.
   - `LOAD` declaration: Source URI, source data format, and target table name. Note that `DATA INFILE` in the declaration is used to specify the mount point folder path of the NAS device, as shown in the example above, where `file:///` is the prefix and `/home/disk1/sr` is the mount point folder path.
   - `BROKER`: You do not need to specify a broker name.
   - `PROPERTIES`: Timeout value and any other attributes to apply to the import job.

   For detailed syntax and parameter descriptions, see [BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md).

After submitting the job, you can view the import progress or cancel the job as needed. For detailed operations, see "[Check Broker Load Progress](#check-broker-load-progress)" and "[Cancel Broker Load Job](#cancel-broker-load-job)" in this topic.
