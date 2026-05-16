---
displayed_sidebar: docs
sidebar_position: 2
toc_max_heading_level: 2
description: Kafka routine load with shared-data storage
---

# 使用共享存储的 Kafka Routine Load 到 StarRocks

import Clients from '../_assets/quick-start/_clientsCompose.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'

## 关于 Routine Load

Routine Load 使用 Apache Kafka，或者在本实验中使用的 Redpanda，持续将数据流式传输到 StarRocks。数据被流式传输到一个 Kafka topic 中，然后 Routine Load 任务将数据消费到 StarRocks 中。有关 Routine Load 的更多详细信息将在本实验结束时提供。

## 关于 shared-data

在存储与计算分离的系统中，数据存储在低成本、可靠的远程存储系统（如 Amazon S3、Google Cloud Storage、Azure Blob Storage 和其他 S3 兼容存储，如 MinIO）中。热数据在本地缓存，当缓存命中时，查询性能与存储计算耦合架构相当。计算节点 (CN) 可以按需在几秒钟内添加或移除。这种架构降低了存储成本，确保了更好的资源隔离，并提供了弹性和可伸缩性。

本教程涵盖：

- 使用 Docker Compose 运行 StarRocks、Redpanda 和 MinIO
- 使用 MinIO 作为 StarRocks 存储层
- 配置 StarRocks 以使用 shared-data
- 添加 Routine Load 任务以从 Redpanda 消费数据

使用的数据是合成数据。

本文档包含大量信息，开头部分提供了分步内容，技术细节则放在了文档末尾。这样做是为了按以下顺序实现这些目的：

1. 配置 Routine Load。
2. 让读者能够在 shared-data 部署中加载数据并分析这些数据。
3. 提供 shared-data 部署的配置详情。

---

## 前提条件

### Docker

- [Docker](https://docs.docker.com/engine/install/)
- 分配给 Docker 4 GB RAM
- 分配给 Docker 10 GB 的可用磁盘空间

### SQL 客户端

您可以使用 Docker 环境中提供的 SQL 客户端，也可以使用系统上的客户端。许多 MySQL 兼容的客户端都适用，本指南涵盖了 DBeaver 和 MySQL Workbench 的配置。

### curl

`curl` 用于下载 Compose 文件和生成数据的脚本。通过在操作系统提示符下运行 `curl` 或 `curl.exe` 来检查是否已安装。如果 `curl` 未安装，[请在此处获取 curl](https://curl.se/dlwiz/?type=bin)。

### Python

需要 Python 3 和 Apache Kafka 的 Python 客户端 `kafka-python`。

- [Python](https://www.python.org/)
- [`kafka-python`](https://pypi.org/project/kafka-python/)

---

## 术语

### FE

Frontend 节点负责元数据管理、客户端连接管理、查询规划和查询调度。每个 FE 在其内存中存储和维护一份完整的元数据副本，这保证了 FE 之间服务的无差别性。

### CN

Compute 节点在 shared-data 部署中负责执行查询计划。

### BE

Backend 节点在 shared-nothing 部署中负责数据存储和执行查询计划。

:::note
本指南不使用 BE，此信息包含在此处，以便您了解 BE 和 CN 之间的区别。
:::

---

## 启动 StarRocks

要使用对象存储运行带有 shared-data 的 StarRocks，您需要：

- 一个 Frontend Engine (FE)
- 一个 Compute Node (CN)
- 对象存储

本指南使用 MinIO，它是一个 S3 兼容的对象存储提供商。MinIO 是根据 GNU Affero General Public License 提供的。

### 下载实验文件

#### `docker-compose.yml`

```bash
mkdir routineload
cd routineload
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/docker-compose.yml
```

#### `gen.py`

`gen.py` 是一个使用 Apache Kafka 的 Python 客户端将数据发布（生产）到 Kafka topic 的脚本。该脚本已用 Redpanda 容器的地址和端口编写。

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/gen.py
```

## 启动 StarRocks、MinIO 和 Redpanda

```bash
docker compose up --detach --wait --wait-timeout 120
```

检查服务的进度。容器需要 30 秒或更长时间才能变得健康。`routineload-minio_mc-1` 容器不会显示健康指示器，它会在完成用 StarRocks 将使用的访问密钥配置 MinIO 后退出。等待 `routineload-minio_mc-1` 以 `0` 代码退出，并且其余服务为 `Healthy`。

运行 `docker compose ps` 直到服务健康：

```bash
docker compose ps
```

```plaintext
WARN[0000] /Users/droscign/routineload/docker-compose.yml: `version` is obsolete
[+] Running 6/7
 ✔ Network routineload_default       Crea...          0.0s
 ✔ Container minio                   Healthy          5.6s
 ✔ Container redpanda                Healthy          3.6s
 ✔ Container redpanda-console        Healt...         1.1s
 ⠧ Container routineload-minio_mc-1  Waiting          23.1s
 ✔ Container starrocks-fe            Healthy          11.1s
 ✔ Container starrocks-cn            Healthy          23.0s
container routineload-minio_mc-1 exited (0)
```

---

## 检查 MinIO 凭据

为了将 MinIO 用作 StarRocks 的对象存储，StarRocks 需要一个 MinIO 访问密钥。访问密钥是在 Docker 服务启动期间生成的。为了帮助您更好地理解 StarRocks 连接 MinIO 的方式，您应该验证密钥是否存在。

### 打开 MinIO Web UI

浏览至 http://localhost:9001/access-keys 用户名和密码在 Docker compose 文件中指定，分别为 `miniouser` 和 `miniopassword`。您应该会看到有一个访问密钥。密钥是 `AAAAAAAAAAAAAAAAAAAA`，您无法在 MinIO 控制台中看到 secret，但它在 Docker compose 文件中是 `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`：

![查看 MinIO 访问密钥](../_assets/quick-start/MinIO-view-key.png)

---

### 为您的数据创建一个 bucket

当您在 StarRocks 中创建存储卷时，您将指定数据的 `LOCATION`：

```sh
    LOCATIONS = ("s3://my-starrocks-bucket/")
```

打开 [http://localhost:9001/buckets](http://localhost:9001/buckets) 并为存储卷添加一个 bucket。将 bucket 命名为 `my-starrocks-bucket`。接受列出的三个选项的默认值。

---

## SQL 客户端

<Clients />

---

## StarRocks shared-data 配置

此时，您已运行 StarRocks 和 MinIO。MinIO 访问密钥用于连接 StarRocks 和 MinIO。

这是 `FE` 配置的一部分，它指定 StarRocks 部署将使用共享数据。这是 Docker Compose 创建部署时添加到文件 `fe.conf` 的。

```sh
# enable the shared data run mode
run_mode = shared_data
cloud_native_storage_type = S3
```

:::info
您可以通过从 `quickstart` 目录运行此命令并查看文件末尾来验证这些设置：
:::

```sh
docker compose exec starrocks-fe \
  cat /opt/starrocks/fe/conf/fe.conf
```
:::

### 使用 SQL 客户端连接到 StarRocks

:::tip

从包含 `docker-compose.yml` 文件的目录运行此命令。

如果您使用的客户端不是 mysql CLI，请立即打开。
:::

```sql
docker compose exec starrocks-fe \
mysql -P9030 -h127.0.0.1 -uroot --prompt="StarRocks > "
```

#### 检查存储卷

```sql
SHOW STORAGE VOLUMES;
```

:::tip
不应该有存储卷，您接下来将创建一个。
:::

```sh
Empty set (0.04 sec)
```

#### 创建 shared-data 存储卷

早些时候，您在 MinIO 中创建了一个名为 `my-starrocks-volume` 的 bucket，并验证了 MinIO 有一个名为 `AAAAAAAAAAAAAAAAAAAA` 的访问密钥。以下 SQL 将使用访问密钥和 secret 在 MinIO bucket 中创建一个存储卷。

```sql
CREATE STORAGE VOLUME s3_volume
    TYPE = S3
    LOCATIONS = ("s3://my-starrocks-bucket/")
    PROPERTIES
    (
         "enabled" = "true",
         "aws.s3.endpoint" = "minio:9000",
         "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
         "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
         "aws.s3.use_instance_profile" = "false",
         "aws.s3.use_aws_sdk_default_behavior" = "false"
     );
```

现在您应该看到列出了一个存储卷，之前它是空集：

```
SHOW STORAGE VOLUMES;
```

```
+----------------+
| Storage Volume |
+----------------+
| s3_volume      |
+----------------+
1 row in set (0.02 sec)
```

查看存储卷的详细信息，并注意它尚未成为默认卷，并且已配置为使用您的 bucket：

```
DESC STORAGE VOLUME s3_volume\G
```

:::tip
本文档中的某些 SQL 以及 StarRocks 文档中的许多其他文档都以 `\G` 结尾而不是分号。`\G` 会导致 mysql CLI 垂直渲染查询结果。

许多 SQL 客户端不解释垂直格式输出，因此您应该将 `\G` 替换为 `;`。
:::

```sh
*************************** 1. row ***************************
     Name: s3_volume
     Type: S3
# highlight-start
IsDefault: false
 Location: s3://my-starrocks-bucket/
# highlight-end
   Params: {"aws.s3.access_key":"******","aws.s3.secret_key":"******","aws.s3.endpoint":"minio:9000","aws.s3.region":"us-east-1","aws.s3.use_instance_profile":"false","aws.s3.use_web_identity_token_file":"false","aws.s3.use_aws_sdk_default_behavior":"false"}
  Enabled: true
  Comment:
1 row in set (0.02 sec)
```

## 设置默认存储卷

```
SET s3_volume AS DEFAULT STORAGE VOLUME;
```

```
DESC STORAGE VOLUME s3_volume\G
```

```sh
*************************** 1. row ***************************
     Name: s3_volume
     Type: S3
# highlight-next-line
IsDefault: true
 Location: s3://my-starrocks-bucket/
   Params: {"aws.s3.access_key":"******","aws.s3.secret_key":"******","aws.s3.endpoint":"minio:9000","aws.s3.region":"us-east-1","aws.s3.use_instance_profile":"false","aws.s3.use_web_identity_token_file":"false","aws.s3.use_aws_sdk_default_behavior":"false"}
  Enabled: true
  Comment:
1 row in set (0.02 sec)
```

---

## 创建表

这些 SQL 命令在您的 SQL 客户端中运行。

```SQL
CREATE DATABASE IF NOT EXISTS quickstart;
```

验证数据库 `quickstart` 是否正在使用存储卷 `s3_volume`：

```
SHOW CREATE DATABASE quickstart \G
```

```sh
*************************** 1. row ***************************
       Database: quickstart
Create Database: CREATE DATABASE `quickstart`
# highlight-next-line
PROPERTIES ("storage_volume" = "s3_volume")
```

```SQL
USE quickstart;
```

```SQL
CREATE TABLE site_clicks (
    `uid` bigint NOT NULL COMMENT "uid",
    `site` string NOT NULL COMMENT "site url",
    `vtime` bigint NOT NULL COMMENT "vtime"
)
DISTRIBUTED BY HASH(`uid`)
PROPERTIES("replication_num"="1");
```

---

### 打开 Redpanda 控制台

目前还没有 topic，下一步将创建一个 topic。

http://localhost:8080/overview

### 发布数据到 Redpanda topic

从 `routineload/` 文件夹中的命令行 shell 运行此命令以生成数据：

```python
python gen.py 5
```

:::tip

在您的系统上，您可能需要将命令中的 `python` 替换为 `python3`。

如果您缺少 `kafka-python`，请尝试：

```
pip install kafka-python
```
 或

```
pip3 install kafka-python
```

:::

```plaintext
b'{ "uid": 6926, "site": "https://docs.starrocks.io/", "vtime": 1718034793 } '
b'{ "uid": 3303, "site": "https://www.starrocks.io/product/community", "vtime": 1718034793 } '
b'{ "uid": 227, "site": "https://docs.starrocks.io/", "vtime": 1718034243 } '
b'{ "uid": 7273, "site": "https://docs.starrocks.io/", "vtime": 1718034794 } '
b'{ "uid": 4666, "site": "https://www.starrocks.io/", "vtime": 1718034794 } '
```

### 在 Redpanda 控制台中验证

导航到 Redpanda 控制台中的 http://localhost:8080/topics，您将看到一个名为 `test2` 的 topic。选择该 topic，然后选择 **Messages** 选项卡，您将看到与 `gen.py` 输出匹配的五条消息。

## 消费消息

在 StarRocks 中，您将创建一个 Routine Load 任务来：

1. 消费 Redpanda topic `test2` 中的消息
2. 将这些消息加载到表 `site_clicks` 中

StarRocks 已配置为使用 MinIO 进行存储，因此插入到 `site_clicks` 表中的数据将存储在 MinIO 中。

### 创建 Routine Load 任务

在 SQL 客户端中运行此命令以创建 Routine Load 任务，该命令将在实验结束时详细解释。

```SQL
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
PROPERTIES
(
    "format" = "JSON",
    "jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
)
FROM KAFKA
(     
    "kafka_broker_list" = "redpanda:29092",
    "kafka_topic" = "test2",
    "kafka_partitions" = "0",
    "kafka_offsets" = "OFFSET_BEGINNING"
);
```

### 验证 Routine Load 任务

```SQL
SHOW ROUTINE LOAD\G
```

验证三条高亮行：

1. 状态应为 `RUNNING`
2. topic 应为 `test2`，broker 应为 `redpanda:2092`
3. 统计信息应显示 0 或 5 行已加载行，具体取决于您运行 `SHOW ROUTINE LOAD` 命令的时间。如果已加载行为 0，请再次运行。

```SQL
*************************** 1. row ***************************
                  Id: 10078
                Name: clicks
          CreateTime: 2024-06-12 15:51:12
           PauseTime: NULL
             EndTime: NULL
              DbName: quickstart
           TableName: site_clicks
           -- highlight-next-line
               State: RUNNING
      DataSourceType: KAFKA
      CurrentTaskNum: 1
       JobProperties: {"partitions":"*","partial_update":"false","columnToColumnExpr":"*","maxBatchIntervalS":"10","partial_update_mode":"null","whereExpr":"*","dataFormat":"json","timezone":"Etc/UTC","format":"json","log_rejected_record_num":"0","taskTimeoutSecond":"60","json_root":"","maxFilterRatio":"1.0","strict_mode":"false","jsonpaths":"[\"$.uid\",\"$.site\",\"$.vtime\"]","taskConsumeSecond":"15","desireTaskConcurrentNum":"5","maxErrorNum":"0","strip_outer_array":"false","currentTaskConcurrentNum":"1","maxBatchRows":"200000"}
       -- highlight-next-line
DataSourceProperties: {"topic":"test2","currentKafkaPartitions":"0","brokerList":"redpanda:29092"}
    CustomProperties: {"group.id":"clicks_ea38a713-5a0f-4abe-9b11-ff4a241ccbbd"}
    -- highlight-next-line
           Statistic: {"receivedBytes":0,"errorRows":0,"committedTaskNum":0,"loadedRows":0,"loadRowsRate":0,"abortedTaskNum":0,"totalRows":0,"unselectedRows":0,"receivedBytesRate":0,"taskExecuteTimeMs":1}
            Progress: {"0":"OFFSET_ZERO"}
   TimestampProgress: {}
ReasonOfStateChanged:
        ErrorLogUrls:
         TrackingSQL:
            OtherMsg:
LatestSourcePosition: {}
1 row in set (0.00 sec)
```

```SQL
SHOW ROUTINE LOAD\G
```

```SQL
*************************** 1. row ***************************
                  Id: 10076
                Name: clicks
          CreateTime: 2024-06-12 18:40:53
           PauseTime: NULL
             EndTime: NULL
              DbName: quickstart
           TableName: site_clicks
               State: RUNNING
      DataSourceType: KAFKA
      CurrentTaskNum: 1
       JobProperties: {"partitions":"*","partial_update":"false","columnToColumnExpr":"*","maxBatchIntervalS":"10","partial_update_mode":"null","whereExpr":"*","dataFormat":"json","timezone":"Etc/UTC","format":"json","log_rejected_record_num":"0","taskTimeoutSecond":"60","json_root":"","maxFilterRatio":"1.0","strict_mode":"false","jsonpaths":"[\"$.uid\",\"$.site\",\"$.vtime\"]","taskConsumeSecond":"15","desireTaskConcurrentNum":"5","maxErrorNum":"0","strip_outer_array":"false","currentTaskConcurrentNum":"1","maxBatchRows":"200000"}
DataSourceProperties: {"topic":"test2","currentKafkaPartitions":"0","brokerList":"redpanda:29092"}
    CustomProperties: {"group.id":"clicks_a9426fee-45bb-403a-a1a3-b3bc6c7aa685"}
               -- highlight-next-line
           Statistic: {"receivedBytes":372,"errorRows":0,"committedTaskNum":1,"loadedRows":5,"loadRowsRate":0,"abortedTaskNum":0,"totalRows":5,"unselectedRows":0,"receivedBytesRate":0,"taskExecuteTimeMs":519}
            Progress: {"0":"4"}
   TimestampProgress: {"0":"1718217035111"}
ReasonOfStateChanged:
        ErrorLogUrls:
         TrackingSQL:
            OtherMsg:
                       -- highlight-next-line
LatestSourcePosition: {"0":"5"}
1 row in set (0.00 sec)
```

---

## 验证数据存储在 MinIO 中

打开 MinIO [http://localhost:9001/browser/](http://localhost:9001/browser/) 并验证 `my-starrocks-bucket` 下是否存在存储对象。

---

## 从 StarRocks 查询数据

```SQL
USE quickstart;
SELECT * FROM site_clicks;
```

```SQL
+------+--------------------------------------------+------------+
| uid  | site                                       | vtime      |
+------+--------------------------------------------+------------+
| 4607 | https://www.starrocks.io/blog              | 1718031441 |
| 1575 | https://www.starrocks.io/                  | 1718031523 |
| 2398 | https://docs.starrocks.io/                 | 1718033630 |
| 3741 | https://www.starrocks.io/product/community | 1718030845 |
| 4792 | https://www.starrocks.io/                  | 1718033413 |
+------+--------------------------------------------+------------+
5 rows in set (0.07 sec)
```

## 发布额外数据

再次运行 `gen.py` 将向 Redpanda 发布另外五条记录。

```bash
python gen.py 5
```

### 验证数据是否已添加

由于 Routine Load 任务按计划运行（默认每 10 秒），数据将在几秒钟内加载。

```SQL
SELECT * FROM site_clicks;
````

```
+------+--------------------------------------------+------------+
| uid  | site                                       | vtime      |
+------+--------------------------------------------+------------+
| 6648 | https://www.starrocks.io/blog              | 1718205970 |
| 7914 | https://www.starrocks.io/                  | 1718206760 |
| 9854 | https://www.starrocks.io/blog              | 1718205676 |
| 1186 | https://www.starrocks.io/                  | 1718209083 |
| 3305 | https://docs.starrocks.io/                 | 1718209083 |
| 2288 | https://www.starrocks.io/blog              | 1718206759 |
| 7879 | https://www.starrocks.io/product/community | 1718204280 |
| 2666 | https://www.starrocks.io/                  | 1718208842 |
| 5801 | https://www.starrocks.io/                  | 1718208783 |
| 8409 | https://www.starrocks.io/                  | 1718206889 |
+------+--------------------------------------------+------------+
10 rows in set (0.02 sec)
```

---

## 配置详情

现在您已经体验了使用 StarRocks 和 shared-data，了解其配置非常重要。

### CN 配置

这里使用的 CN 配置是默认配置，因为 CN 专为 shared-data 使用而设计。默认配置如下所示。您无需进行任何更改。

```bash
sys_log_level = INFO

# ports for admin, web, heartbeat service
be_port = 9060
be_http_port = 8040
heartbeat_service_port = 9050
brpc_port = 8060
starlet_port = 9070
```

### FE 配置

FE 配置与默认配置略有不同，因为 FE 必须配置为预期数据存储在对象存储中，而不是 BE 节点上的本地磁盘中。

`docker-compose.yml` 文件在 `command` 中生成 FE 配置。

```plaintext
# enable shared data, set storage type, set endpoint
run_mode = shared_data
cloud_native_storage_type = S3
```

:::note
此配置文件不包含 FE 的默认条目，仅显示 shared-data 配置。
:::

非默认 FE 配置设置：

:::note
许多配置参数都带有 `s3_` 前缀。此`s3_`前缀用于所有 Amazon S3 兼容存储类型（例如：S3、GCS 和 MinIO）。当使用 Azure Blob Storage 时，前缀是 `azure_`。
:::

#### `run_mode=shared_data`

这将启用 shared-data 的使用。

#### `cloud_native_storage_type=S3`

这指定了是使用 S3 兼容存储还是 Azure Blob Storage。对于 MinIO，始终是 S3。

### `CREATE storage volume` 详情

```sql
CREATE STORAGE VOLUME s3_volume
    TYPE = S3
    LOCATIONS = ("s3://my-starrocks-bucket/")
    PROPERTIES
    (
         "enabled" = "true",
         "aws.s3.endpoint" = "minio:9000",
         "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
         "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
         "aws.s3.use_instance_profile" = "false",
         "aws.s3.use_aws_sdk_default_behavior" = "false"
     );
```

#### `aws_s3_endpoint=minio:9000`

MinIO 端点，包括端口号。

#### `aws_s3_path=starrocks`

bucket 名称。

#### `aws_s3_access_key=AAAAAAAAAAAAAAAAAAAA`

MinIO 访问密钥。

#### `aws_s3_secret_key=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`

MinIO 访问密钥 secret。

#### `aws_s3_use_instance_profile=false`

使用 MinIO 时，使用访问密钥，因此不与 MinIO 一起使用实例配置文件。

#### `aws_s3_use_aws_sdk_default_behavior=false`

使用 MinIO 时，此参数始终设置为 false。

---

## 关于 Routine Load 命令的说明

StarRocks Routine Load 有许多参数。本教程中只描述了使用的参数，其余的将在更多信息部分中链接。

```SQL
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
PROPERTIES
(
    "format" = "JSON",
    "jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
)
FROM KAFKA
(     
    "kafka_broker_list" = "redpanda:29092",
    "kafka_topic" = "test2",
    "kafka_partitions" = "0",
    "kafka_offsets" = "OFFSET_BEGINNING"
);
```

### 参数

```
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
```

`CREATE ROUTINE LOAD ON` 的参数是：
- database_name.job_name
- table_name

`database_name` 是可选的。在本实验中，它是 `quickstart` 并已指定。

`job_name` 是必需的，是 `clicks`

`table_name` 是必需的，是 `site_clicks`

### 任务属性

#### 属性 `format`

```
"format" = "JSON",
```

在这种情况下，数据是 JSON 格式，因此属性设置为 `JSON`。其他有效格式是：`CSV`、`JSON` 和 `Avro`。`CSV` 是默认值。

#### 属性 `jsonpaths`

```
"jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
```

您想要从 JSON 格式数据中加载的字段名称。此参数的值是有效的 JsonPath 表达式。更多信息可在本页末尾获取。

### 数据源属性

#### `kafka_broker_list`

```
"kafka_broker_list" = "redpanda:29092",
```

Kafka 的 broker 连接信息。格式为 `<kafka_broker_name_or_ip>:<broker_ port>`。多个 broker 用逗号分隔。

#### `kafka_topic`

```
"kafka_topic" = "test2",
```

要从中消费的 Kafka topic。

#### `kafka_partitions` 和 `kafka_offsets`

```
"kafka_partitions" = "0",
"kafka_offsets" = "OFFSET_BEGINNING"
```

这些属性一起呈现，因为每个 `kafka_partitions` 条目都需要一个 `kafka_offset`。

`kafka_partitions` 是要消费的一个或多个分区的列表。如果未设置此属性，则消费所有分区。

`kafka_offsets` 是偏移量的列表，`kafka_partitions` 中列出的每个分区对应一个偏移量。在这种情况下，值是 `OFFSET_BEGINNING`，这将导致消费所有数据。默认只消费新数据。

---

## 总结

在本教程中，您：

- 在 Docker 中部署了 StarRocks、Redpanda 和 MinIO
- 创建了一个 Routine Load 任务以从 Kafka topic 消费数据
- 学习了如何配置使用 MinIO 的 StarRocks 存储卷

## 更多信息

[StarRocks Architecture](../introduction/Architecture.md)

本实验使用的示例非常简单。Routine Load 还有更多选项和功能。 [了解更多](../loading/RoutineLoad.md)。

[JSONPath](https://goessner.net/articles/JsonPath/)
