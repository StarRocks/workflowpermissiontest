---
displayed_sidebar: docs
sidebar_position: 2
toc_max_heading_level: 2
description: Kafka routine load with shared-data storage
---

# 在存算分离模式下使用 Kafka 的 Routine Load 功能导入数据至 StarRocks

import Clients from '../_assets/quick-start/_clientsCompose.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'

Routine Load 是一种使用 Apache Kafka（在本实验中为 Redpanda）将数据持续流式传输到 StarRocks 的方法。数据被流式传输到 Kafka topic 中，然后 Routine Load 作业将数据导入到 StarRocks 中。有关 Routine Load 的更多详细信息，请在本实验的末尾提供。
## 关于存算分离

在存算分离的系统中，数据存储在低成本、高可靠的远端存储系统中，例如 Amazon S3、Google Cloud Storage、Azure Blob Storage 以及其他 S3 兼容的存储系统（如 MinIO）。热数据缓存在本地，当缓存命中时，查询性能与存算一体架构相当。计算节点（CN）可以根据需要在几秒钟内添加或删除。这种架构降低了存储成本，确保了更好的资源隔离，并提供了弹性和可扩展性。

本教程包括：

- 使用 Docker Compose 运行 StarRocks、Redpanda 和 MinIO
- 使用 MinIO 作为 StarRocks 的存储层
- 为存算分离配置 StarRocks
- 添加一个 Routine Load 作业来消费来自 Redpanda 的数据

所使用的数据是合成数据。

本文档包含大量信息，开头以循序渐进的内容呈现，结尾提供技术细节。这样做是为了按以下顺序实现这些目的：

1. 配置 Routine Load。
2. 允许读者在存算分离部署中加载数据并分析该数据。
3. 提供存算分离部署的配置详情。

---
## 前提条件
### Docker

- [Docker](https://docs.docker.com/engine/install/)
- 分配给 Docker 的 4 GB 内存
- 分配给 Docker 的 10 GB 可用磁盘空间
### SQL 客户端

您可以使用在 Docker 环境中提供的 SQL 客户端，或者使用您系统上的客户端。许多与 MySQL 兼容的客户端都可以工作，本指南介绍了 DBeaver 和 MySQL Workbench 的配置。
### curl

`curl` 用于下载 Compose 文件和用于生成数据的脚本。通过在您的操作系统提示符下运行 `curl` 或 `curl.exe` 来检查是否已安装。如果未安装 curl，请 [在此处获取 curl](https://curl.se/dlwiz/?type=bin) 。
### Python

需要 Python 3 和 Apache Kafka 的 Python 客户端 `kafka-python`。

- [Python](https://www.python.org/)
- [`kafka-python`](https://pypi.org/project/kafka-python/)

---
## 术语
### FE

FE 节点负责元数据管理、客户端连接管理、查询计划和查询调度。每个 FE 在其内存中存储并维护元数据的完整副本，这保证了 FE 之间的无差别服务。
计算节点负责在存算分离部署中执行查询计划。
### BE

后端节点负责在存算一体部署中进行数据存储和执行查询计划。

:::note
本指南不使用 BE，此处包含此信息是为了让您了解 BE 和 CN 之间的区别。
:::

---
## 启动 StarRocks

要使用对象存储以存算分离模式运行 StarRocks，您需要：

- 一个前端引擎 (FE)
- 一个计算节点 (CN)
- 对象存储

本指南使用 MinIO，它是一个与 S3 兼容的对象存储提供商。MinIO 是在 GNU Affero General Public License 许可下提供的。
### 下载实验文件
#### `docker-compose.yml`

```bash
mkdir routineload
cd routineload
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/docker-compose.yml
```
#### `gen.py`

`gen.py` 是一个脚本，它使用 Apache Kafka 的 Python 客户端向 Kafka topic 发布（生产）数据。该脚本已使用 Redpanda 容器的地址和端口编写。

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/gen.py
```
## 启动 StarRocks、MinIO 和 Redpanda

```bash
docker compose up --detach --wait --wait-timeout 120
```

检查服务的进度。容器变为健康状态需要 30 秒或更长时间。`routineload-minio_mc-1` 容器不会显示健康指标，并且在完成使用 StarRocks 将使用的访问密钥配置 MinIO 后，它将退出。等待 `routineload-minio_mc-1` 以代码 `0` 退出，其余服务处于 `Healthy` 状态。

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

为了将 MinIO 用于 StarRocks 的对象存储，StarRocks 需要一个 MinIO 访问密钥。该访问密钥是在启动 Docker 服务期间生成的。为了帮助您更好地了解 StarRocks 连接到 MinIO 的方式，您应该验证该密钥是否存在。
### 打开 MinIO Web UI

在浏览器中访问 http://localhost:9001/access-keys 。用户名和密码在 Docker Compose 文件中指定，分别为 `miniouser` 和 `miniopassword`。您应该看到有一个访问密钥。密钥是 `AAAAAAAAAAAAAAAAAAAA`，您无法在 MinIO 控制台中看到 secret，但它在 Docker Compose 文件中，是 `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`：

![查看 MinIO 访问密钥](../_assets/quick-start/MinIO-view-key.png)

---
### 为您的数据创建一个存储桶

在 StarRocks 中创建存储卷时，您需要指定数据的 `LOCATION`：

```sh
    LOCATIONS = ("s3://my-starrocks-bucket/")
```

打开 [http://localhost:9001/buckets](http://localhost:9001/buckets) ，并为存储卷添加一个存储桶。将存储桶命名为 `my-starrocks-bucket`。接受三个已列出选项的默认设置。

---
## SQL 客户端

<Clients />

---
## 存算分离模式下的 StarRocks 配置

目前您已经成功运行了 StarRocks 和 MinIO。MinIO 访问密钥用于连接 StarRocks 和 MinIO。

以下是 `FE` 的配置，用于指定 StarRocks 部署将使用存算分离。此配置在 Docker Compose 创建部署时被添加到 `fe.conf` 文件中。

```sh
# 启用存算分离运行模式
run_mode = shared_data
cloud_native_storage_type = S3
```

:::info
您可以通过从 `quickstart` 目录运行以下命令并查看文件末尾来验证这些设置：
:::

```sh
docker compose exec starrocks-fe \
  cat /opt/starrocks/fe/conf/fe.conf
```
:::
### 使用 SQL 客户端连接到 StarRocks

:::tip

从包含 `docker-compose.yml` 文件的目录运行此命令。

如果您使用的客户端不是 mysql CLI，请立即打开它。
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
应该没有任何存储卷，您接下来将创建一个。
:::

```sh
Empty set (0.04 sec)
```
#### 创建一个存算分离存储卷

之前您在 MinIO 中创建了一个名为 `my-starrocks-volume` 的存储桶，并且您已验证 MinIO 是否具有名为 `AAAAAAAAAAAAAAAAAAAA` 的访问密钥。以下 SQL 将使用访问密钥和密钥在 MionIO 存储桶中创建一个存储卷。

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

现在您应该看到一个存储卷已列出，之前它是一个空集：

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

查看存储卷的详细信息，并注意这还不是默认卷，并且它已配置为使用您的存储桶：

```
DESC STORAGE VOLUME s3_volume\G
```

:::tip
本文档以及 StarRocks 文档中的许多其他文档中的某些 SQL，都使用 `\G` 而不是分号。`\G` 会导致 mysql CLI 垂直呈现查询结果。

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

以下 SQL 命令需要在您的 SQL 客户端中运行。

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
### 打开 Redpanda 控制台

现在还没有任何 topic，topic 将在下一步创建。

http://localhost:8080/overview
### 将数据发布到 Redpanda topic

在 `routineload/` 文件夹的命令 shell 中，运行以下命令来生成数据：

```python
python gen.py 5
```

:::tip

在您的系统中，您可能需要使用 `python3` 代替命令中的 `python`。

如果您缺少 `kafka-python`，请尝试：

```
pip install kafka-python
```
或者

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

在 Redpanda 控制台中，导航到 http://localhost:8080/topics ，您将看到一个名为 `test2` 的主题。选择该主题，然后选择 **Messages** 选项卡，您将看到五个与 `gen.py` 输出匹配的消息。
## 消费消息

在 StarRocks 中，您需要创建一个 Routine Load 作业来：

1. 从 Redpanda topic `test2` 中消费消息。
2. 将这些消息导入到表 `site_clicks` 中。

StarRocks 配置为使用 MinIO 进行存储，因此插入到 `site_clicks` 表中的数据将存储在 MinIO 中。
### 创建一个 Routine Load 作业

在 SQL 客户端中运行以下命令来创建一个 Routine Load 作业。该命令的详细解释将在实验的最后给出。

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
### 验证 `Routine Load` 作业

```SQL
SHOW ROUTINE LOAD\G
```

验证以下三个突出显示的行：

1.  状态应为 `RUNNING`
2.  `topic` 应为 `test2`，`broker` 应为 `redpanda:2092`
3.  统计信息应显示 0 或 5 个已加载的行，具体取决于您运行 `SHOW ROUTINE LOAD` 命令的时间。 如果有 0 个已加载的行，请再次运行。

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
## 验证数据是否存储在 MinIO 中

打开 MinIO [http://localhost:9001/browser/](http://localhost:9001/browser/) ，并验证 `my-starrocks-bucket` 下是否存储了对象。

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

再次运行 `gen.py` 会将另外五个记录发布到 Redpanda。

```bash
python gen.py 5
```
### 验证数据是否已添加

由于 Routine Load 作业按计划运行（默认情况下每 10 秒一次），因此数据将在几秒钟内完成导入。

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

既然您已经体验了在存算分离模式下使用 StarRocks ，那么了解配置就非常重要了。
### CN 配置

这里使用的 CN 配置是默认配置，因为 CN 是为存算分离使用而设计的。默认配置如下所示。您无需进行任何更改。

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

FE 的配置与默认配置略有不同，因为必须将 FE 配置为期望数据存储在对象存储中，而不是 BE 节点上的本地磁盘上。

`docker-compose.yml` 文件在 `command` 中生成 FE 配置。

```plaintext
# 启用存算分离，设置存储类型，设置 endpoint
run_mode = shared_data
cloud_native_storage_type = S3
```

:::note
此配置文件不包含 FE 的默认条目，仅显示存算分离配置。
:::

非默认的 FE 配置设置：

:::note
许多配置参数都带有 `s3_` 前缀。此前缀用于所有与 Amazon S3 兼容的存储类型（例如：S3、GCS 和 MinIO）。当使用 Azure Blob Storage 时，前缀为 `azure_`。
:::
#### `run_mode=shared_data`

该配置项用于启用存算分离模式。
#### `cloud_native_storage_type=S3`

该参数用于指定是否使用 S3 兼容的存储或 Azure Blob Storage。对于 MinIO，该参数值始终为 S3。
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

Bucket 的名称。
#### `aws_s3_access_key=AAAAAAAAAAAAAAAAAAAA`

MinIO 访问密钥。
#### `aws_s3_secret_key=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`

MinIO 访问密钥。
#### `aws_s3_use_instance_profile=false`

当使用 MinIO 时，会使用访问密钥，因此实例配置文件不与 MinIO 一起使用。
#### `aws_s3_use_aws_sdk_default_behavior=false`

当使用 MinIO 时，此参数始终设置为 false。

---
## 关于 Routine Load 命令的注意事项

StarRocks Routine Load 接受许多参数。这里只介绍本教程中使用的参数，其余参数将在更多信息部分链接。

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

`CREATE ROUTINE LOAD ON` 的参数如下：

- database_name.job_name
- table_name

`database_name` 是可选的。在本实验中，它是 `quickstart` 并且已被指定。

`job_name` 是必需的，这里是 `clicks`。

`table_name` 是必需的，这里是 `site_clicks`。
### Job properties

### Job properties

作业属性
#### 属性 `format`

```
"format" = "JSON",
```

在这种情况下，数据为 JSON 格式，因此该属性设置为 `JSON`。其他有效的格式包括：`CSV`、`JSON` 和 `Avro`。`CSV` 是默认格式。
#### 属性 `jsonpaths`

```
"jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
```

您想要从 JSON 格式的数据中加载的字段名称。此参数的值是有效的 JsonPath 表达式。更多信息请参见本页末尾。
### 数据源属性
#### `kafka_broker_list`

```
"kafka_broker_list" = "redpanda:29092",
```

Kafka 的 Broker 连接信息。格式为 `<kafka_broker_name_or_ip>:<broker_ port>`。多个 Broker 之间用逗号分隔。
#### `kafka_topic`

```
"kafka_topic" = "test2",
```

要消费的 Kafka topic。
#### `kafka_partitions` 和 `kafka_offsets`

```
"kafka_partitions" = "0",
"kafka_offsets" = "OFFSET_BEGINNING"
```

这些属性一起展示，因为每个 `kafka_partitions` 条目都需要一个 `kafka_offset`。

`kafka_partitions` 是要消费的一个或多个分区的列表。如果未设置此属性，则会消费所有分区。

`kafka_offsets` 是一个偏移量列表，`kafka_partitions` 中列出的每个分区对应一个偏移量。在本例中，该值为 `OFFSET_BEGINNING`，这将导致消费所有数据。默认情况下，仅消费新数据。

---
## 概述

在本教程中，您将：

- 在 Docker 中部署了 StarRocks、Reedpanda 和 MinIO
- 创建了一个 Routine Load 作业，用于从 Kafka topic 中消费数据
- 学习了如何配置使用 MinIO 的 StarRocks 存储卷
## 更多信息

[StarRocks 架构](../introduction/Architecture.md)

本实验使用的示例非常简单。Routine Load 还有更多的选项和功能。 [了解更多](../loading/RoutineLoad.md) 。

[JSONPath](https://goessner.net/articles/JsonPath/)