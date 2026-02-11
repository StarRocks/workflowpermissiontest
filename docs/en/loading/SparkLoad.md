---
displayed_sidebar: docs
---

# Bulk Data Import with Spark Load

Spark Load uses external Apache Spark™ resources to preprocess imported data, thereby improving import performance and saving computing resources. It is primarily used for **initial migration** and **importing large amounts of data** into StarRocks (up to TB level data volume).

Spark Load is an **asynchronous** import method. Users need to create a Spark type import job via the MySQL protocol and use `SHOW LOAD` to view the import results.

> **Note**
>
> - Only users with INSERT permissions on a StarRocks table can import data into that table. You can grant the necessary permissions as described in [GRANT](../sql-reference/sql-statements/account-management/GRANT.md).
> - Spark Load cannot be used to import data into primary key tables.

## Terminology

- **Spark ETL**: Primarily responsible for data ETL during the import process, including global dictionary construction (BITMAP type), partitioning, sorting, aggregation, etc.
- **Broker**: A Broker is an independent stateless process. It encapsulates the file system interface and provides StarRocks with the ability to read files from remote storage systems.
- **Global Dictionary**: A data structure that stores the mapping from original values to encoded values. Original values can be of any data type, while encoded values are integers. The global dictionary is mainly used for pre-calculation in scenarios requiring accurate deduplication.

## Principle

Users submit Spark type import jobs via the MySQL client; FE records metadata and returns the submission result.

The execution of a Spark Load task is divided into the following main stages.

1. The user submits a Spark Load job to FE.
2. FE schedules the ETL task to be executed on the Apache Spark™ cluster.
3. The Apache Spark™ cluster executes the ETL task, including global dictionary construction (BITMAP type), partitioning, sorting, aggregation, etc.
4. After the ETL task is completed, FE obtains the data path of each preprocessed slice and schedules the relevant BEs to execute Push tasks.
5. BEs read data from HDFS through the Broker process and convert it into StarRocks storage format.
    > If you choose not to use the Broker process, BEs will read data directly from HDFS.
6. FE schedules the version to take effect and completes the import job.

The following diagram illustrates the main process of Spark Load.

![Spark load](../_assets/4.3.2-1.png)

---

## Global Dictionary

### Applicable Scenarios

Currently, BITMAP columns in StarRocks are implemented using Roaringbitmap, which only accepts integers as input data types. Therefore, if you want to implement pre-calculation for BITMAP columns during the import process, you need to convert the input data type to an integer.

In the existing import process of StarRocks, the data structure for the global dictionary is implemented based on Hive tables, which stores the mapping from original values to encoded values.

### Construction Process

1. Read data from the upstream data source and generate a temporary Hive table, named `hive-table`.
2. Extract the values of non-emphasized fields from `hive-table` to generate a new Hive table, named `distinct-value-table`.
3. Create a new global dictionary table, named `dict-table`, with one column for original values and one column for encoded values.
4. Perform a left join between `distinct-value-table` and `dict-table`, then use window functions to encode the set. Finally, write both the original and encoded values of the deduplicated columns back to `dict-table`.
5. Perform a join between `dict-table` and `hive-table` to replace the original values in `hive-table` with integer encoded values.
6. `hive-table` will be read by the next data preprocessing step and then imported into StarRocks after computation.

## Data Preprocessing

The basic process of data preprocessing is as follows:

1. Read data from the upstream data source (HDFS files or Hive tables).
2. Complete field mapping and calculations for the read data, then generate `bucket-id` based on partitioning information.
3. Generate `RollupTree` based on the Rollup metadata of the StarRocks table.
4. Iterate `RollupTree` and perform hierarchical aggregation operations. Rollups of the next level can be calculated from Rollups of the previous level.
5. After each aggregation calculation is completed, the data will be bucketed based on `bucket-id` and then written to HDFS.
6. Subsequent Broker processes will pull files from HDFS and import them into StarRocks BE nodes.

## Basic Operations

### Configure ETL Cluster

Apache Spark™ is used as an external computing resource in StarRocks for ETL work. There may be other external resources added to StarRocks, such as Spark/GPU for querying, HDFS/S3 for external storage, MapReduce for ETL, etc. Therefore, we introduced `Resource Management` to manage these external resources used by StarRocks.

Before submitting an Apache Spark™ import job, please configure the Apache Spark™ cluster to execute ETL tasks. The operation syntax is as follows:

~~~sql
-- Create an Apache Spark™ resource
CREATE EXTERNAL RESOURCE resource_name
PROPERTIES
(
 type = spark,
 spark_conf_key = spark_conf_value,
 working_dir = path,
 broker = broker_name,
 broker.property_key = property_value
);

-- Delete an Apache Spark™ resource
DROP RESOURCE resource_name;

-- Show resources
SHOW RESOURCES
SHOW PROC "/resources";

-- Permissions
GRANT USAGE_PRIV ON RESOURCE resource_name TO user_identityGRANT USAGE_PRIV ON RESOURCE resource_name TO ROLE role_name;
REVOKE USAGE_PRIV ON RESOURCE resource_name FROM user_identityREVOKE USAGE_PRIV ON RESOURCE resource_name FROM ROLE role_name;
~~~

- Create Resource

**Example**:

~~~sql
-- Yarn cluster mode
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

-- Yarn HA cluster mode
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

`resource-name` is the name of the Apache Spark™ resource configured in StarRocks.

`PROPERTIES` includes parameters related to the Apache Spark™ resource, as follows:
> **Note**
>
> For a detailed explanation of Apache Spark™ resource PROPERTIES, please refer to [CREATE RESOURCE](../sql-reference/sql-statements/Resource/CREATE_RESOURCE.md).

- Spark-related parameters:
  - `type`: Resource type, required, currently only `spark` is supported.
  - `spark.master`: Required, currently only `yarn` is supported.
    - `spark.submit.deployMode`: Deployment mode of the Apache Spark™ program, required, currently `cluster` and `client` are supported.
    - `spark.hadoop.fs.defaultFS`: Required if master is yarn.
    - Parameters related to yarn ResourceManager, required.
      - A single ResourceManager on a single node
        `spark.hadoop.yarn.resourcemanager.address`: Address of the single-point ResourceManager.
      - ResourceManager HA
        > You can choose to specify the hostname or address of the ResourceManager.
        - `spark.hadoop.yarn.resourcemanager.ha.enabled`: Enable ResourceManager HA, set to `true`.
        - `spark.hadoop.yarn.resourcemanager.ha.rm-ids`: List of ResourceManager logical IDs.
        - `spark.hadoop.yarn.resourcemanager.hostname.rm-id`: For each rm-id, specify the hostname corresponding to the ResourceManager.
        - `spark.hadoop.yarn.resourcemanager.address.rm-id`: For each rm-id, specify the `host:port` where clients submit jobs.

- `*working_dir`: The directory used by ETL. Required if Apache Spark™ is used as an ETL resource. For example: `hdfs://host:port/tmp/starrocks`.

- Broker-related parameters:
  - `broker`: Broker name. Required if Apache Spark™ is used as an ETL resource. You need to complete the configuration in advance using the `ALTER SYSTEM ADD BROKER` command.
  - `broker.property_key`: Information to be specified when the Broker process reads intermediate files generated by ETL (e.g., authentication information).

**Note**:

The above describes the parameters for loading via the Broker process. If you plan to load data without a Broker process, you should note the following:

- You do not need to specify `broker`.
- If you need to configure user authentication and NameNode HA, you need to configure parameters in the hdfs-site.xml file in the HDFS cluster. For a description of the parameters, refer to [broker_properties](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md#hdfs). And you need to move the **hdfs-site.xml** file to **$FE_HOME/conf** under each FE and **$BE_HOME/conf** under each BE.

> Note
>
> If HDFS files can only be accessed by specific users, you still need to specify the HDFS username in `broker.name` and the user password in `broker.password`.

- View Resources

Regular accounts can only view resources they have `USAGE-PRIV` access to. Root and admin accounts can view all resources.

- Resource Permissions

Resource permissions are managed by `GRANT REVOKE`, and currently only `USAGE-PRIV` permission is supported. You can grant `USAGE-PRIV` permission to users or roles.

~~~sql
-- Grant user0 permission to access spark0 resource
GRANT USAGE_PRIV ON RESOURCE "spark0" TO "user0"@"%";

-- Grant role0 permission to access spark0 resource
GRANT USAGE_PRIV ON RESOURCE "spark0" TO ROLE "role0";

-- Grant user0 permission to access all resources
GRANT USAGE_PRIV ON RESOURCE* TO "user0"@"%";

-- Grant role0 permission to access all resources
GRANT USAGE_PRIV ON RESOURCE* TO ROLE "role0";

-- Revoke user0's usage permission on spark0 resource
REVOKE USAGE_PRIV ON RESOURCE "spark0" FROM "user0"@"%";
~~~

### Configure Spark Client

Configure the Spark client for FE so that the latter can submit Spark tasks by executing the `spark-submit` command. It is recommended to use the official version of Spark2 2.4.5 or higher [spark download address](https://archive.apache.org/dist/spark/). After downloading, please follow the steps below to complete the configuration.

- Configure `SPARK-HOME`

Place the Spark client in a directory on the same machine as FE, and configure `spark_home_default_dir` in the FE configuration file to this directory. By default, this directory is `lib/spark2x` path in the FE root directory, and it cannot be empty.

- **Configure SPARK Dependency Packages**

To configure dependency packages, compress and archive all jar files in the `jars` folder under the Spark client and configure the `spark_resource_path` item in the FE configuration to this zip file. If this configuration is empty, FE will try to find the `lib/spark2x/jars/spark-2x.zip` file in the FE root directory. If FE cannot find it, it will report an error.

When submitting a Spark Load job, the archived dependency files will be uploaded to a remote repository. The default repository path is located in the `working_dir/{cluster_id}` directory and named `--spark-repository--{resource-name}`, which means one resource in the cluster corresponds to one remote repository. The directory structure reference is as follows:

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

In addition to Spark dependencies (named `spark-2x.zip` by default), FE will also upload DPP dependencies to the remote repository. If all dependencies submitted by Spark Load already exist in the remote repository, there is no need to upload them again, which saves time from repeatedly uploading a large number of files each time.

### Configure YARN Client

Configure the Yarn client for FE so that FE can execute Yarn commands to get the status of running applications or terminate them. It is recommended to use the official version of Hadoop2 2.5.2 or higher ([hadoop download address](https://archive.apache.org/dist/hadoop/common/)). After downloading, please follow the steps below to complete the configuration:

- **Configure YARN Executable Path**

Place the downloaded Yarn client in a directory on the same machine as FE, and configure the `yarn_client_path` item in the FE configuration file to the Yarn binary executable file. By default, this file is `lib/yarn-client/hadoop/bin/yarn` path in the FE root directory.

- **Configure Path for YARN Configuration Files (Optional)**

When FE obtains the status of an application or terminates it via the Yarn client, by default, StarRocks generates the configuration files required to execute Yarn commands in the `lib/yarn-config` path of the FE root directory. This path can be modified by configuring the `yarn_config_dir` entry in the FE configuration file, which currently includes `core-site.xml` and `yarn-site.xml`.

### Create Import Job

**Syntax:**

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

**Example 1**: Upstream data source is HDFS

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

**Example 2**: Upstream data source is Hive.

- Step 1: Create a new Hive resource

~~~sql
CREATE EXTERNAL RESOURCE hive0
PROPERTIES
( 
    "type" = "hive",
    "hive.metastore.uris" = "thrift://xx.xx.xx.xx:8080"
);
 ~~~

- Step 2: Create a new Hive external table

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

- Step 3: Submit the load command, requiring that the columns in the StarRocks table to be imported exist in the Hive external table.

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

Introduction to parameters in Spark Load:

- **Label**

The label of the import job. Each import job has a label, which is unique in the database and follows the same rules as Broker Load.

- **Data Description Parameters**

Currently, supported data sources are CSV and Hive tables. Other rules are the same as Broker Load.

- **Import Job Parameters**

Import job parameters refer to the parameters belonging to the `opt_properties` section of the import statement. These parameters apply to the entire import job. The rules are the same as Broker Load.

- **Spark Resource Parameters**

Spark resources need to be configured in StarRocks in advance, and users need to be granted USAGE-PRIV permission before the resource can be applied to Spark Load.
When users have temporary needs, they can set Spark resource parameters, such as adding resources to the job and modifying Spark configuration. This setting only takes effect for this job and does not affect existing configurations in the StarRocks cluster.

~~~sql
WITH RESOURCE 'spark0'
(
    "spark.driver.memory" = "1g",
    "spark.executor.memory" = "3g"
)
~~~

- **Import when data source is Hive**

Currently, to use Hive tables during the import process, you need to create an external table of type `Hive` and then specify its name when submitting the import command.

- **Import Process to Build Global Dictionary**

In the load command, you can specify the fields required to build a global dictionary in the following format: `StarRocks field name=bitmap_dict(Hive table field name)`. Please note that currently, **the global dictionary is only supported when the upstream data source is a Hive table**.

- **Load Binary Data**

Starting from v2.5.17, Spark Load supports the `bitmap_from_binary` function, which can convert binary data into bitmap data. If the column type of the Hive table or HDFS file is binary, and the corresponding column in the StarRocks table is an aggregate column of type bitmap, you can specify the field in the load command in the following format, `StarRocks field name=bitmap_from_binary(Hive table field name)`. This eliminates the need to build a global dictionary.

## View Import Job

Spark Load import is asynchronous, as is Broker Load. Users must record the label of the import job and use it in the `SHOW LOAD` command to view the import results. The command for viewing imports is common to all import methods. An example is as follows.

For a detailed explanation of return parameters, please refer to Broker Load. The differences are as follows.

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

Current stage of the import job.
PENDING: Job submitted.
ETL: Spark ETL submitted.
LOADING: FE schedules BE to perform push operation.
FINISHED: Push completed, version takes effect.

An import job has two final stages – `CANCELLED` and `FINISHED`, both indicating that the load job has completed. `CANCELLED` means the import failed, and `FINISHED` means the import succeeded.

- **Progress**

Description of the import job progress. There are two types of progress – ETL and LOAD, which correspond to the two stages of the import process, ETL and LOADING.

- The progress of LOAD ranges from 0~100%.

`LOAD progress = number of tablets of all currently completed replica imports / total number of tablets for this import job * 100%`.

- If all tables have been imported, the LOAD progress will be 99%, and it will change to 100% when the import enters the final verification stage.

- Import progress is not linear. If the progress does not change for a period of time, it does not mean that the import is not executing.

- **Type**

Type of import job. SPARK indicates Spark Load.

- **CreateTime/EtlStartTime/EtlFinishTime/LoadStartTime/LoadFinishTime**

These values represent the time the import was created, the time the ETL stage started, the time the ETL stage completed, the time the LOADING stage started, and the time the entire import job completed.

- **JobDetails**

Displays the detailed running status of the job, including the number of files imported, total size (in bytes), number of subtasks, raw rows being processed, etc. For example:

~~~json
 {"ScannedRows":139264,"TaskNumber":1,"FileNumber":1,"FileSize":940754064}
~~~

- **URL**

You can copy the input to a browser to access the web interface of the corresponding application.

### View Apache Spark™ Launcher Submission Logs

Sometimes, users need to view the detailed logs generated during Apache Spark™ job submission. By default, the logs are saved in the `log/spark_launcher_log` path in the FE root directory, named `spark-launcher-{load-job-id}-{label}.log`. The logs are kept in this directory for a period of time and are deleted when the import information in the FE metadata is cleared. The default retention period is 3 days.

### Cancel Import

When a Spark Load job's status is not `CANCELLED` or `FINISHED`, users can manually cancel it by specifying the Label of the import job.

---

## Related System Configurations

**FE Configuration:** The following configurations are system-level configurations for Spark Load and apply to all Spark Load import jobs. Configuration values can be adjusted by modifying `fe.conf`.

- `enable-spark-load`: Enables Spark Load and resource creation, default value is false.
- `spark-load-default-timeout-second`: Default timeout for jobs is 259200 seconds (3 days).
- `spark-home-default-dir`: Spark client path (`fe/lib/spark2x`).
- `spark-resource-path`: Path to the packaged Spark dependency file (default is empty).
- `spark-launcher-log-dir`: Directory where Spark client submission logs are stored (`fe/log/spark-launcher-log`).
- `yarn-client-path`: Path to the Yarn binary executable (`fe/lib/yarn-client/hadoop/bin/yarn`).
- `yarn-config-dir`: Path to Yarn's configuration files (`fe/lib/yarn-config`).

---

## Best Practices

Spark Load is most suitable when the raw data is located in a file system (HDFS) and the data volume is in the range of tens of GB to TB. For smaller data volumes, use Stream Load or Broker Load.

For a complete Spark Load import example, please refer to the demo on GitHub: [https://github.com/StarRocks/demo/blob/master/docs/03_sparkLoad2StarRocks.md](https://github.com/StarRocks/demo/blob/master/docs/03_sparkLoad2StarRocks.md)

## Frequently Asked Questions

- `Error: When running with master 'yarn' either HADOOP-CONF-DIR or YARN-CONF-DIR must be set in the environment.`

When using Spark Load, the `HADOOP-CONF-DIR` environment variable is not configured in the Spark client's `spark-env.sh`.

- `Error: Cannot run program "xxx/bin/spark-submit": error=2, No such file or directory`

When using Spark Load, the `spark_home_default_dir` configuration item does not specify the Spark client's root directory.

- `Error: File xxx/jars/spark-2x.zip does not exist.`

When using Spark Load, the `spark-resource-path` configuration item does not point to the packaged zip file.

- `Error: yarn client does not exist in path: xxx/yarn-client/hadoop/bin/yarn`

When using Spark Load, the `yarn-client-path` configuration item does not specify the Yarn executable file.

- `ERROR: Cannot execute hadoop-yarn/bin/... /libexec/yarn-config.sh`

When using Hadoop with CDH, the `HADOOP_LIBEXEC_DIR` environment variable needs to be configured.
Since the `hadoop-yarn` and hadoop directories are different, the default `libexec` directory will look for `hadoop-yarn/bin/... /libexec`, while `libexec` is located in the hadoop directory.
The `yarn application status` command reports an error when getting the Spark task status, causing the import job to fail.
