---
displayed_sidebar: docs
---

# 从 Apache Flink® 连续加载数据

StarRocks Connector for Apache Flink® (简称 Flink connector) 帮助您使用 Flink 将数据加载到 StarRocks 中。其基本原理是累积数据，然后通过 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) 一次性将所有数据加载到 StarRocks 中。

Flink connector 支持 DataStream API、Table API & SQL 和 Python API。它比 Apache Flink® 提供的 [flink-connector-jdbc](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/table/jdbc/) 具有更高且更稳定的性能。

> **注意**
>
> 使用 Flink connector 将数据加载到 StarRocks 表中需要对目标 StarRocks 表拥有 SELECT 和 INSERT 权限。如果您没有这些权限，请按照 [GRANT](../sql-reference/sql-statements/account-management/GRANT.md) 中提供的说明，将这些权限授予您用于连接 StarRocks 集群的用户。

## 版本要求

| Connector | Flink                         | StarRocks     | Java | Scala     |
|-----------|-------------------------------|---------------| ---- |-----------|
| 1.2.11    | 1.15,1.16,1.17,1.18,1.19,1.20 | 2.1 及更高版本 | 8    | 2.11,2.12 |
| 1.2.10    | 1.15,1.16,1.17,1.18,1.19      | 2.1 及更高版本 | 8    | 2.11,2.12 |
| 1.2.9     | 1.15,1.16,1.17,1.18           | 2.1 及更高版本 | 8    | 2.11,2.12 |
| 1.2.8     | 1.13,1.14,1.15,1.16,1.17      | 2.1 及更高版本 | 8    | 2.11,2.12 |
| 1.2.7     | 1.11,1.12,1.13,1.14,1.15      | 2.1 及更高版本 | 8    | 2.11,2.12 |

## 获取 Flink connector

您可以通过以下方式获取 Flink connector JAR 文件：

- 直接下载已编译的 Flink connector JAR 文件。
- 将 Flink connector 作为依赖项添加到您的 Maven 项目中，然后下载 JAR 文件。
- 自行编译 Flink connector 的源代码以生成 JAR 文件。

Flink connector JAR 文件的命名格式如下：

- 从 Flink 1.15 起，格式为 `flink-connector-starrocks-${connector_version}_flink-${flink_version}.jar`。例如，如果您安装 Flink 1.15 并希望使用 Flink connector 1.2.7，则可以使用 `flink-connector-starrocks-1.2.7_flink-1.15.jar`。

- 在 Flink 1.15 之前，格式为 `flink-connector-starrocks-${connector_version}_flink-${flink_version}_${scala_version}.jar`。例如，如果您的环境安装了 Flink 1.14 和 Scala 2.12，并希望使用 Flink connector 1.2.7，则可以使用 `flink-connector-starrocks-1.2.7_flink-1.14_2.12.jar`。

> **注意**
>
> 通常，最新版本的 Flink connector 仅保持与 Flink 最近三个版本的兼容性。

### 下载已编译的 Jar 文件

直接从 [Maven Central Repository](https://repo1.maven.org/maven2/com/starrocks) 下载相应版本的 Flink connector Jar 文件。

### Maven 依赖

在您的 Maven 项目的 `pom.xml` 文件中，按照以下格式添加 Flink connector 作为依赖项。请将 `flink_version`、`scala_version` 和 `connector_version` 替换为相应的版本。

- Flink 1.15 及更高版本

    ```xml
    <dependency>
        <groupId>com.starrocks</groupId>
        <artifactId>flink-connector-starrocks</artifactId>
        <version>${connector_version}_flink-${flink_version}</version>
    </dependency>
    ```

- Flink 1.15 之前的版本

    ```xml
    <dependency>
        <groupId>com.starrocks</groupId>
        <artifactId>flink-connector-starrocks</artifactId>
        <version>${connector_version}_flink-${flink_version}_${scala_version}</version>
    </dependency>
    ```

### 自行编译

1. 下载 [Flink connector 源代码](https://github.com/StarRocks/starrocks-connector-for-apache-flink)。
2. 执行以下命令将 Flink connector 的源代码编译成 JAR 文件。请注意，`flink_version` 要替换为相应的 Flink 版本。

      ```bash
      sh build.sh <flink_version>
      ```

   例如，如果您的环境中的 Flink 版本是 1.15，则需要执行以下命令：

      ```bash
      sh build.sh 1.15
      ```

3. 进入 `target/` 目录，找到编译后生成的 Flink connector JAR 文件，例如 `flink-connector-starrocks-1.2.7_flink-1.15-SNAPSHOT.jar`。

> **注意**
>
> 未正式发布的 Flink connector 的名称包含 `SNAPSHOT` 后缀。

## 参数

### connector

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：您要使用的连接器。值必须为 "starrocks"。

### jdbc-url

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：用于连接 FE 的 MySQL 服务器的地址。您可以指定多个地址，它们必须用逗号 (,) 分隔。格式：`jdbc:mysql://<fe_host1>:<fe_query_port1>,<fe_host2>:<fe_query_port2>,<fe_host3>:<fe_query_port3>`。

### load-url

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：用于连接 FE 的 HTTP 服务器的地址。您可以指定多个地址，它们必须用分号 (;) 分隔。格式：`<fe_host1>:<fe_http_port1>;<fe_host2>:<fe_http_port2>`。

### database-name

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：您要加载数据到的 StarRocks 数据库的名称。

### table-name

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：您要用于将数据加载到 StarRocks 的表的名称。

### username

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：您用于将数据加载到 StarRocks 的账户的用户名。该账户需要对目标 StarRocks 表拥有 [SELECT 和 INSERT 权限](../sql-reference/sql-statements/account-management/GRANT.md)。

### password

**必填项**：是<br/>
**默认值**：无<br/>
**描述**：上述账户的密码。

### sink.version

**必填项**：否<br/>
**默认值**：AUTO<br/>
**描述**：用于加载数据的接口。此参数从 Flink connector 1.2.4 版本开始支持。<ul><li>`V1`：使用 [Stream Load](../loading/StreamLoad.md) 接口加载数据。1.2.4 之前的连接器只支持此模式。</li><li>`V2`：使用 [Stream Load 事务](./Stream_Load_transaction_interface.md) 接口加载数据。它要求 StarRocks 版本至少为 2.4。建议使用 `V2`，因为它优化了内存使用并提供了更稳定的 exactly-once 实现。</li><li>`AUTO`：如果 StarRocks 版本支持事务 Stream Load，将自动选择 `V2`，否则选择 `V1`。</li></ul>

### sink.label-prefix

**必填项**：否<br/>
**默认值**：无<br/>
**描述**：Stream Load 使用的 Label 前缀。如果您在使用 connector 1.2.8 及更高版本实现 exactly-once 语义，建议配置此项。请参阅 [exactly-once 使用说明](#exactly-once)。

### sink.semantic

**必填项**：否<br/>
**默认值**：at-least-once<br/>
**描述**：Sink 保证的语义。有效值：**at-least-once** 和 **exactly-once**。

### sink.buffer-flush.max-bytes

**必填项**：否<br/>
**默认值**：94371840 (90M)<br/>
**描述**：一次性发送到 StarRocks 之前，内存中可累积的最大数据量。最大值范围从 64 MB 到 10 GB。将此参数设置为更大的值可以提高加载性能，但可能会增加加载延迟。此参数仅在 `sink.semantic` 设置为 `at-least-once` 时生效。如果 `sink.semantic` 设置为 `exactly-once`，则内存中的数据在 Flink checkpoint 触发时刷新。在这种情况下，此参数不生效。

### sink.buffer-flush.max-rows

**必填项**：否<br/>
**默认值**：500000<br/>
**描述**：一次性发送到 StarRocks 之前，内存中可累积的最大行数。此参数仅在 `sink.version` 为 `V1` 且 `sink.semantic` 为 `at-least-once` 时可用。有效值：64000 到 5000000。

### sink.buffer-flush.interval-ms

**必填项**：否<br/>
**默认值**：300000<br/>
**描述**：数据刷新的间隔。此参数仅在 `sink.semantic` 设置为 `at-least-once` 时可用。有效值：1000 到 3600000。单位：毫秒。

### sink.max-retries

**必填项**：否<br/>
**默认值**：3<br/>
**描述**：系统重试执行 Stream Load 任务的次数。此参数仅在您将 `sink.version` 设置为 `V1` 时可用。有效值：0 到 10。

### sink.connect.timeout-ms

**必填项**：否<br/>
**默认值**：30000<br/>
**描述**：建立 HTTP 连接的超时时间。有效值：100 到 60000。单位：毫秒。在 Flink connector v1.2.9 之前，默认值为 `1000`。

### sink.socket.timeout-ms

**必填项**：否<br/>
**默认值**：-1<br/>
**描述**：从 1.2.10 版本开始支持。HTTP 客户端等待数据的时间。单位：毫秒。默认值 `-1` 表示没有超时。

### sink.sanitize-error-log

**必填项**：否<br/>
**默认值**：false<br/>
**描述**：从 1.2.12 版本开始支持。是否在错误日志中清理敏感数据以确保生产安全。当此项设置为 `true` 时，Stream Load 错误日志中的敏感行数据和列值将在 connector 和 SDK 日志中被脱敏。为保持向后兼容性，默认值为 `false`。

### sink.wait-for-continue.timeout-ms

**必填项**：否<br/>
**默认值**：10000<br/>
**描述**：从 1.2.7 版本开始支持。等待 FE 返回 HTTP 100-continue 响应的超时时间。有效值：`3000` 到 `60000`。单位：毫秒。

### sink.ignore.update-before

**必填项**：否<br/>
**默认值**：true<br/>
**描述**：从 1.2.8 版本开始支持。将数据加载到主键表时，是否忽略来自 Flink 的 `UPDATE_BEFORE` 记录。如果此参数设置为 false，则该记录将被视为对 StarRocks 表的删除操作。

### sink.parallelism

**必填项**：否<br/>
**默认值**：无<br/>
**描述**：加载的并行度。仅适用于 Flink SQL。如果未指定此参数，Flink 规划器将决定并行度。**在多并行度场景下，用户需要保证数据以正确的顺序写入。**

### sink.properties.*

**必填项**：否<br/>
**默认值**：无<br/>
**描述**：用于控制 Stream Load 行为的参数。例如，参数 `sink.properties.format` 指定 Stream Load 使用的格式，例如 CSV 或 JSON。有关支持的参数及其描述的列表，请参阅 [STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

### sink.properties.format

**必填项**：否<br/>
**默认值**：csv<br/>
**描述**：Stream Load 使用的格式。Flink connector 会在将每批数据发送到 StarRocks 之前将其转换为该格式。有效值：`csv` 和 `json`。

### sink.properties.column_separator

**必填项**：否<br/>
**默认值**：\t<br/>
**描述**：CSV 格式数据的列分隔符。

### sink.properties.row_delimiter

**必填项**：否<br/>
**默认值**：\n<br/>
**描述**：CSV 格式数据的行分隔符。

### sink.properties.max_filter_ratio

**必填项**：否<br/>
**默认值**：0<br/>
**描述**：Stream Load 的最大错误容忍度。它是由于数据质量不足而被过滤掉的数据记录的最大百分比。有效值：`0` 到 `1`。默认值：`0`。详情请参阅 [Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

### sink.properties.partial_update

**必填项**：否<br/>
**默认值**：`FALSE`<br/>
**描述**：是否使用部分更新。有效值：`TRUE` 和 `FALSE`。默认值：`FALSE`，表示禁用此功能。

### sink.properties.partial_update_mode

**必填项**：否<br/>
**默认值**：`row`<br/>
**描述**：指定部分更新的模式。有效值：`row` 和 `column`。<ul><li>`row` (默认值) 表示行模式下的部分更新，更适用于多列小批量实时更新场景。</li><li>`column` 表示列模式下的部分更新，更适用于少列多行批量更新场景。在这样的场景下，开启列模式可以带来更快的更新速度。例如，一个有 100 列的表，如果只更新其中 10 列（总列数的 10%），那么列模式下的更新速度是行模式的 10 倍。</li></ul>

### sink.properties.strict_mode

**必填项**：否<br/>
**默认值**：false<br/>
**描述**：指定是否为 Stream Load 启用严格模式。它会影响当存在不合格行（例如列值不一致）时的加载行为。有效值：`true` 和 `false`。默认值：`false`。详情请参阅 [Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)。

### sink.properties.compression

**必填项**：否<br/>
**默认值**：无<br/>
**描述**：Stream Load 使用的压缩算法。有效值：`lz4_frame`。JSON 格式的压缩需要 Flink connector 1.2.10+ 和 StarRocks v3.2.7+。CSV 格式的压缩仅需要 Flink connector 1.2.11+。

### sink.properties.prepared_timeout

**必填项**：否<br/>
**默认值**：无<br/>
**描述**：从 1.2.12 版本开始支持，并且仅在 `sink.version` 设置为 `V2` 时有效。需要 StarRocks 3.5.4 或更高版本。设置事务 Stream Load 从 `PREPARED` 阶段到 `COMMITTED` 阶段的超时时间（单位：秒）。通常，仅在 exactly-once 语义下需要设置此参数；at-least-once 语义通常不需要设置（连接器默认值为 300s）。如果 exactly-once 语义下未设置此参数，则应用 StarRocks FE 配置 `prepared_transaction_default_timeout_second`（默认 86400s）。详情请参阅 [StarRocks 事务超时管理](./Stream_Load_transaction_interface.md#transaction-timeout-management)。

## Flink 与 StarRocks 之间的数据类型映射

| Flink 数据类型                   | StarRocks 数据类型   |
|-----------------------------------|-----------------------|
| BOOLEAN                           | BOOLEAN               |
| TINYINT                           | TINYINT               |
| SMALLINT                          | SMALLINT              |
| INTEGER                           | INTEGER               |
| BIGINT                            | BIGINT                |
| FLOAT                             | FLOAT                 |
| DOUBLE                            | DOUBLE                |
| DECIMAL                           | DECIMAL               |
| BINARY                            | INT                   |
| CHAR                              | STRING                |
| VARCHAR                           | STRING                |
| STRING                            | STRING                |
| DATE                              | DATE                  |
| TIMESTAMP_WITHOUT_TIME_ZONE(N)    | DATETIME              |
| TIMESTAMP_WITH_LOCAL_TIME_ZONE(N) | DATETIME              |
| ARRAY&lt;T&gt;                        | ARRAY&lt;T&gt;              |
| MAP&lt;KT,VT&gt;                        | JSON STRING           |
| ROW&lt;arg T...&gt;                     | JSON STRING           |

## 使用说明

### Exactly Once

- 如果您希望 sink 保证 exactly-once 语义，我们建议您将 StarRocks 升级到 2.5 或更高版本，并将 Flink connector 升级到 1.2.4 或更高版本。
  - 从 Flink connector 1.2.4 版本开始，exactly-once 是基于 StarRocks 2.4 引入的 [Stream Load 事务接口](./Stream_Load_transaction_interface.md) 重新设计的。与之前基于非事务性 Stream Load 接口的实现相比，
    新实现减少了内存使用和 checkpoint 开销，从而提高了加载的实时性能和稳定性。

  - 如果 StarRocks 版本低于 2.4 或 Flink connector 版本低于 1.2.4，sink 将自动选择基于非事务性 Stream Load 接口的实现。

- 保证 exactly-once 的配置：

  - `sink.semantic` 的值需要设置为 `exactly-once`。

  - 如果 Flink connector 版本为 1.2.8 及更高，建议指定 `sink.label-prefix` 的值。请注意，label 前缀在 StarRocks 中的所有加载类型（如 Flink 任务、Routine Load 和 Broker Load）中必须是唯一的。

    - 如果指定了 label 前缀，Flink connector 将使用该 label 前缀清理可能在某些 Flink 故障场景中生成的悬挂事务，例如 Flink 任务在 checkpoint 仍在进行时失败。这些悬挂事务通常处于 `PREPARED` 状态，您可以使用 `SHOW PROC '/transactions/<db_id>/running';` 在 StarRocks 中查看它们。当 Flink 任务从 checkpoint 恢复时，Flink connector 将根据 label 前缀和 checkpoint 中的一些信息找到这些悬挂事务并中止它们。当 Flink 任务退出时，Flink connector 无法中止它们，因为实现 exactly-once 采用了两阶段提交机制。当 Flink 任务退出时，Flink connector 尚未收到 Flink checkpoint coordinator 关于事务是否应包含在成功 checkpoint 中的通知，如果这些事务被中止，可能会导致数据丢失。您可以在这篇 [博客文章](https://flink.apache.org/2018/02/28/an-overview-of-end-to-end-exactly-once-processing-in-apache-flink-with-apache-kafka-too/) 中了解如何在 Flink 中实现端到端 exactly-once。

    - 如果未指定 label 前缀，悬挂事务将仅在超时后由 StarRocks 清理。但是，如果 Flink 任务在事务超时之前频繁失败，则运行中的事务数量可能会达到 StarRocks `max_running_txn_num_per_db` 的限制。您可以为 `PREPARED` 事务设置较小的超时时间，以便在未指定 label 前缀时它们更快地过期。有关如何设置 prepared 超时的信息，请参阅下文。

- 如果您确定 Flink 任务在因停止或持续故障转移而长时间停机后最终将从 checkpoint 或 savepoint 恢复，请相应调整以下 StarRocks 配置，以避免数据丢失。

  - 调整 `PREPARED` 事务超时时间。请参阅下文了解如何设置超时时间。

    超时时间需要大于 Flink 任务的停机时间。否则，包含在成功 checkpoint 中的悬挂事务可能会在您重启 Flink 任务之前因超时而被中止，从而导致数据丢失。

    请注意，当您为此配置设置较大值时，最好指定 `sink.label-prefix` 的值，以便根据 label 前缀和 checkpoint 中的一些信息来清理悬挂事务，而不是因为超时（这可能导致数据丢失）。

  - `label_keep_max_second` 和 `label_keep_max_num`：StarRocks FE 配置，默认值分别为 `259200` 和 `1000`。详情请参阅 [FE 配置](./loading_introduction/loading_considerations.md#fe-configurations)。`label_keep_max_second` 的值需要大于 Flink 任务的停机时间。否则，Flink connector 无法通过使用 Flink savepoint 或 checkpoint 中保存的事务标签来检查 StarRocks 中事务的状态，并确定这些事务是否已提交，这最终可能导致数据丢失。

- 如何设置 PREPARED 事务的超时时间

  - 对于 Connector 1.2.12+ 和 StarRocks 3.5.4+，您可以通过配置连接器参数 `sink.properties.prepared_timeout` 来设置超时时间。默认情况下，该值未设置，并回退到 StarRocks FE 的全局配置 `prepared_transaction_default_timeout_second`（默认值 `86400`）。

  - 对于其他版本的 Connector 或 StarRocks，您可以通过配置 StarRocks FE 的全局配置 `prepared_transaction_default_timeout_second`（默认值 `86400`）来设置超时时间。

### 刷新策略

Flink connector 会在内存中缓冲数据，并通过 Stream Load 以批处理方式将其刷新到 StarRocks。在 at-least-once 和 exactly-once 之间，触发刷新的方式有所不同。

对于 at-least-once，当满足以下任何条件时会触发刷新：

- 缓冲行的字节数达到 `sink.buffer-flush.max-bytes` 的限制。
- 缓冲行的数量达到 `sink.buffer-flush.max-rows` 的限制。（仅对 sink version V1 有效）
- 自上次刷新以来经过的时间达到 `sink.buffer-flush.interval-ms` 的限制。
- 触发了 checkpoint。

对于 exactly-once，只有在触发 checkpoint 时才会发生刷新。

### 监控加载指标

Flink connector 提供以下指标来监控加载情况。

| 指标                     | 类型    | 描述                                                     |
|--------------------------|---------|-----------------------------------------------------------------|
| totalFlushBytes          | counter | 成功刷新的字节数。                                     |
| totalFlushRows           | counter | 成功刷新的行数。                                      |
| totalFlushSucceededTimes | counter | 数据成功刷新的次数。  |
| totalFlushFailedTimes    | counter | 数据刷新失败的次数。                  |
| totalFilteredRows        | counter | 过滤掉的行数，也包含在 totalFlushRows 中。    |

## 示例

以下示例展示了如何使用 Flink SQL 或 Flink DataStream 将数据加载到 StarRocks 表中。

### 准备工作

#### 创建 StarRocks 表

创建一个名为 `test` 的数据库，并创建一个名为 `score_board` 的主键表。

```sql
CREATE DATABASE `test`;

CREATE TABLE `test`.`score_board`
(
    `id` int(11) NOT NULL COMMENT "",
    `name` varchar(65533) NULL DEFAULT "" COMMENT "",
    `score` int(11) NOT NULL DEFAULT "0" COMMENT ""
)
ENGINE=OLAP
PRIMARY KEY(`id`)
COMMENT "OLAP"
DISTRIBUTED BY HASH(`id`);
```

#### 设置 Flink 环境

- 下载 Flink 二进制文件 [Flink 1.15.2](https://archive.apache.org/dist/flink/flink-1.15.2/flink-1.15.2-bin-scala_2.12.tgz)，并将其解压到目录 `flink-1.15.2`。
- 下载 [Flink connector 1.2.7](https://repo1.maven.org/maven2/com/starrocks/flink-connector-starrocks/1.2.7_flink-1.15/flink-connector-starrocks-1.2.7_flink-1.15.jar)，并将其放入 `flink-1.15.2/lib` 目录。
- 运行以下命令启动 Flink 集群：

    ```shell
    cd flink-1.15.2
    ./bin/start-cluster.sh
    ```

#### 网络配置

确保 Flink 所在机器能够通过 [`http_port`](../administration/management/FE_configuration.md#http_port) (默认: `8030`) 和 [`query_port`](../administration/management/FE_configuration.md#query_port) (默认: `9030`) 访问 StarRocks 集群的 FE 节点，并通过 [`be_http_port`](../administration/management/BE_configuration.md#be_http_port) (默认: `8040`) 访问 BE 节点。

### 使用 Flink SQL 运行

- 运行以下命令启动 Flink SQL 客户端。

    ```shell
    ./bin/sql-client.sh
    ```

- 创建一个 Flink 表 `score_board`，并通过 Flink SQL 客户端向表中插入值。
请注意，如果您想将数据加载到 StarRocks 的主键表中，必须在 Flink DDL 中定义主键。对于其他类型的 StarRocks 表，这是可选的。

    ```SQL
    CREATE TABLE `score_board` (
        `id` INT,
        `name` STRING,
        `score` INT,
        PRIMARY KEY (id) NOT ENFORCED
    ) WITH (
        'connector' = 'starrocks',
        'jdbc-url' = 'jdbc:mysql://127.0.0.1:9030',
        'load-url' = '127.0.0.1:8030',
        'database-name' = 'test',
        
        'table-name' = 'score_board',
        'username' = 'root',
        'password' = ''
    );

    INSERT INTO `score_board` VALUES (1, 'starrocks', 100), (2, 'flink', 100);
    ```

### 使用 Flink DataStream 运行

根据输入记录的类型（例如 CSV Java `String`、JSON Java `String` 或自定义 Java 对象），有几种实现 Flink DataStream 任务的方法。

- 输入记录为 CSV 格式的 `String`。请参阅 [LoadCsvRecords](https://github.com/StarRocks/starrocks-connector-for-apache-flink/tree/cd8086cfedc64d5181785bdf5e89a847dc294c1d/examples/src/main/java/com/starrocks/connector/flink/examples/datastream) 获取完整示例。

    ```java
    /**
     * 生成 CSV 格式的记录。每条记录有三个值，由 "\t" 分隔。
     * 这些值将被加载到 StarRocks 表中的 `id`、`name` 和 `score` 列。
     */
    String[] records = new String[]{
            "1\tstarrocks-csv\t100",
            "2\tflink-csv\t100"
    };
    DataStream<String> source = env.fromElements(records);

    /**
     * 使用所需属性配置连接器。
     * 您还需要添加属性 "sink.properties.format" 和 "sink.properties.column_separator"
     * 来告知连接器输入记录是 CSV 格式，并且列分隔符是 "\t"。
     * 您也可以在 CSV 格式记录中使用其他列分隔符，
     * 但请记住相应地修改 "sink.properties.column_separator"。
     */
    StarRocksSinkOptions options = StarRocksSinkOptions.builder()
            .withProperty("jdbc-url", jdbcUrl)
            .withProperty("load-url", loadUrl)
            .withProperty("database-name", "test")
            .withProperty("table-name", "score_board")
            .withProperty("username", "root")
            .withProperty("password", "")
            .withProperty("sink.properties.format", "csv")
            .withProperty("sink.properties.column_separator", "\t")
            .build();
    // 使用选项创建 sink。
    SinkFunction<String> starRockSink = StarRocksSink.sink(options);
    source.addSink(starRockSink);
    ```

- 输入记录为 JSON 格式的 `String`。请参阅 [LoadJsonRecords](https://github.com/StarRocks/starrocks-connector-for-apache-flink/tree/cd8086cfedc64d5181785bdf5e89a847dc294c1d/examples/src/main/java/com/starrocks/connector/flink/examples/datastream) 获取完整示例。

    ```java
    /**
     * 生成 JSON 格式的记录。
     * 每条记录有三个键值对，对应 StarRocks 表中的 `id`、`name` 和 `score` 列。
     */
    String[] records = new String[]{
            "{\"id\":1, \"name\":\"starrocks-json\", \"score\":100}",
            "{\"id\":2, \"name\":\"flink-json\", \"score\":100}",
    };
    DataStream<String> source = env.fromElements(records);

    /**
     * 使用所需属性配置连接器。
     * 您还需要添加属性 "sink.properties.format" 和 "sink.properties.strip_outer_array"
     * 来告知连接器输入记录是 JSON 格式并剥离最外层的数组结构。
     */
    StarRocksSinkOptions options = StarRocksSinkOptions.builder()
            .withProperty("jdbc-url", jdbcUrl)
            .withProperty("load-url", loadUrl)
            .withProperty("database-name", "test")
            .withProperty("table-name", "score_board")
            .withProperty("username", "root")
            .withProperty("password", "")
            .withProperty("sink.properties.format", "json")
            .withProperty("sink.properties.strip_outer_array", "true")
            .build();
    // 使用选项创建 sink。
    SinkFunction<String> starRockSink = StarRocksSink.sink(options);
    source.addSink(starRockSink);
    ```

- 输入记录为自定义 Java 对象。请参阅 [LoadCustomJavaRecords](https://github.com/StarRocks/starrocks-connector-for-apache-flink/tree/cd8086cfedc64d5181785bdf5e89a847dc294c1d/examples/src/main/java/com/starrocks/connector/flink/examples/datastream) 获取完整示例。

  - 在此示例中，输入记录是一个简单的 POJO `RowData`。

      ```java
      public static class RowData {
              public int id;
              public String name;
              public int score;
    
              public RowData() {}
    
              public RowData(int id, String name, int score) {
                  this.id = id;
                  this.name = name;
                  this.score = score;
              }
        }
      ```

  - 主程序如下：

    ```java
    // 生成以 RowData 作为容器的记录。
    RowData[] records = new RowData[]{
            new RowData(1, "starrocks-rowdata", 100),
            new RowData(2, "flink-rowdata", 100),
        };
    DataStream<RowData> source = env.fromElements(records);

    // 使用所需属性配置连接器。
    StarRocksSinkOptions options = StarRocksSinkOptions.builder()
            .withProperty("jdbc-url", jdbcUrl)
            .withProperty("load-url", loadUrl)
            .withProperty("database-name", "test")
            .withProperty("table-name", "score_board")
            .withProperty("username", "root")
            .withProperty("password", "")
            .build();

    /**
     * Flink connector 将使用 Java 对象数组 (Object[]) 来表示要加载到 StarRocks 表中的一行，
     * 并且每个元素都是一列的值。
     * 您需要定义 Object[] 的模式，该模式与 StarRocks 表的模式匹配。
     */
    TableSchema schema = TableSchema.builder()
            .field("id", DataTypes.INT().notNull())
            .field("name", DataTypes.STRING())
            .field("score", DataTypes.INT())
            // 当 StarRocks 表是主键表时，必须为 Primary Key `id` 指定 notNull()，例如 DataTypes.INT().notNull()。
            .primaryKey("id")
            .build();
    // 根据模式将 RowData 转换为 Object[]。
    RowDataTransformer transformer = new RowDataTransformer();
    // 使用模式、选项和转换器创建 sink。
    SinkFunction<RowData> starRockSink = StarRocksSink.sink(schema, options, transformer);
    source.addSink(starRockSink);
    ```

  - 主程序中的 `RowDataTransformer` 定义如下：

    ```java
    private static class RowDataTransformer implements StarRocksSinkRowBuilder<RowData> {
    
        /**
         * 根据输入的 RowData 设置对象数组的每个元素。
         * 数组的模式与 StarRocks 表的模式匹配。
         */
        @Override
        public void accept(Object[] internalRow, RowData rowData) {
            internalRow[0] = rowData.id;
            internalRow[1] = rowData.name;
            internalRow[2] = rowData.score;
            // 当 StarRocks 表是主键表时，您需要设置最后一个元素以指示数据加载是 UPSERT 还是 DELETE 操作。
            internalRow[internalRow.length - 1] = StarRocksSinkOP.UPSERT.ordinal();
        }
    }  
    ```

### 使用 Flink CDC 3.0 同步数据（支持 Schema 变更）

[Flink CDC 3.0](https://nightlies.apache.org/flink/flink-cdc-docs-stable) 框架可用于轻松构建从 CDC 源（如 MySQL 和 Kafka）到 StarRocks 的流式 ELT 管道。该管道可以同步整个数据库、合并分片表以及将 Schema 变更从源同步到 StarRocks。

自 v1.2.9 起，StarRocks 的 Flink connector 已作为 [StarRocks Pipeline Connector](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.1/docs/connectors/pipeline-connectors/starrocks/) 集成到此框架中。StarRocks Pipeline Connector 支持：

- 自动创建数据库和表
- Schema 变更同步
- 全量和增量数据同步

快速入门请参阅 [使用 Flink CDC 3.0 和 StarRocks Pipeline Connector 将 MySQL 流式 ELT 到 StarRocks](https://nightlies.apache.org/flink/flink-cdc-docs-stable/docs/get-started/quickstart/mysql-to-starrocks)。

建议使用 StarRocks v3.2.1 及更高版本以启用 [fast_schema_evolution](../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md#set-fast-schema-evolution)。这将提高添加或删除列的速度并减少资源使用。

## 最佳实践

### 将数据加载到主键表

本节将展示如何将数据加载到 StarRocks 主键表以实现部分更新和条件更新。
您可以通过 [通过加载变更数据](./Load_to_Primary_Key_tables.md) 了解这些功能的介绍。
这些示例使用 Flink SQL。

#### 准备工作

在 StarRocks 中创建一个名为 `test` 的数据库和一个名为 `score_board` 的主键表。

```SQL
CREATE DATABASE `test`;

CREATE TABLE `test`.`score_board`
(
    `id` int(11) NOT NULL COMMENT "",
    `name` varchar(65533) NULL DEFAULT "" COMMENT "",
    `score` int(11) NOT NULL DEFAULT "0" COMMENT ""
)
ENGINE=OLAP
PRIMARY KEY(`id`)
COMMENT "OLAP"
DISTRIBUTED BY HASH(`id`);
```

#### 部分更新

此示例将展示如何仅将数据加载到 `id` 和 `name` 列。

1. 在 MySQL 客户端中向 StarRocks 表 `score_board` 插入两行数据。

    ```SQL
    mysql> INSERT INTO `score_board` VALUES (1, 'starrocks', 100), (2, 'flink', 100);

    mysql> select * from score_board;
    +------+-----------+-------+
    | id   | name      | score |
    +------+-----------+-------+
    |    1 | starrocks |   100 |
    |    2 | flink     |   100 |
    +------+-----------+-------+
    2 rows in set (0.02 sec)
    ```

2. 在 Flink SQL 客户端中创建一个 Flink 表 `score_board`。

   - 定义仅包含 `id` 和 `name` 列的 DDL。
   - 将选项 `sink.properties.partial_update` 设置为 `true`，以告知 Flink connector 执行部分更新。
   - 如果 Flink connector 版本 `<= 1.2.7`，您还需要将选项 `sink.properties.columns` 设置为 `id,name,__op`，以告知 Flink connector 需要更新哪些列。请注意，您需要在末尾追加字段 `__op`。字段 `__op` 表示数据加载是 UPSERT 或 DELETE 操作，其值由连接器自动设置。

    ```SQL
    CREATE TABLE `score_board` (
        `id` INT,
        `name` STRING,
        PRIMARY KEY (id) NOT ENFORCED
    ) WITH (
        'connector' = 'starrocks',
        'jdbc-url' = 'jdbc:mysql://127.0.0.1:9030',
        'load-url' = '127.0.0.1:8030',
        'database-name' = 'test',
        'table-name' = 'score_board',
        'username' = 'root',
        'password' = '',
        'sink.properties.partial_update' = 'true',
        -- 仅适用于 Flink connector 版本 <= 1.2.7
        'sink.properties.columns' = 'id,name,__op'
    ); 
    ```

3. 向 Flink 表中插入两行数据。数据行主键与 StarRocks 表中行的主键相同，但 `name` 列中的值已修改。

    ```SQL
    INSERT INTO `score_board` VALUES (1, 'starrocks-update'), (2, 'flink-update');
    ```

4. 在 MySQL 客户端中查询 StarRocks 表。
  
    ```SQL
    mysql> select * from score_board;
    +------+------------------+-------+
    | id   | name             | score |
    +------+------------------+-------+
    |    1 | starrocks-update |   100 |
    |    2 | flink-update     |   100 |
    +------+------------------+-------+
    2 rows in set (0.02 sec)
    ```

    您可以看到只有 `name` 的值发生了变化，而 `score` 的值没有变化。

#### 条件更新

此示例将展示如何根据 `score` 列的值进行条件更新。只有当 `score` 的新值大于或等于旧值时，`id` 的更新才会生效。

1. 在 MySQL 客户端中向 StarRocks 表中插入两行数据。

    ```SQL
    mysql> INSERT INTO `score_board` VALUES (1, 'starrocks', 100), (2, 'flink', 100);
    
    mysql> select * from score_board;
    +------+-----------+-------+
    | id   | name      | score |
    +------+-----------+-------+
    |    1 | starrocks |   100 |
    |    2 | flink     |   100 |
    +------+-----------+-------+
    2 rows in set (0.02 sec)
    ```

2. 通过以下方式创建一个 Flink 表 `score_board`：
  
    - 定义包含所有列的 DDL。
    - 将选项 `sink.properties.merge_condition` 设置为 `score`，以告知连接器使用 `score` 列作为条件。
    - 将选项 `sink.version` 设置为 `V1`，以告知连接器使用 Stream Load。

    ```SQL
    CREATE TABLE `score_board` (
        `id` INT,
        `name` STRING,
        `score` INT,
        PRIMARY KEY (id) NOT ENFORCED
    ) WITH (
        'connector' = 'starrocks',
        'jdbc-url' = 'jdbc:mysql://127.0.0.1:9030',
        'load-url' = '127.0.0.1:8030',
        'database-name' = 'test',
        'table-name' = 'score_board',
        'username' = 'root',
        'password' = '',
        'sink.properties.merge_condition' = 'score',
        'sink.version' = 'V1'
        );
    ```

3. 向 Flink 表中插入两行数据。数据行主键与 StarRocks 表中行的主键相同。第一行数据在 `score` 列中的值较小，第二行数据在 `score` 列中的值较大。

    ```SQL
    INSERT INTO `score_board` VALUES (1, 'starrocks-update', 99), (2, 'flink-update', 101);
    ```

4. 在 MySQL 客户端中查询 StarRocks 表。

    ```SQL
    mysql> select * from score_board;
    +------+--------------+-------+
    | id   | name         | score |
    +------+--------------+-------+
    |    1 | starrocks    |   100 |
    |    2 | flink-update |   101 |
    +------+--------------+-------+
    2 rows in set (0.03 sec)
    ```

   您可以看到只有第二行数据的值发生了变化，第一行数据的值没有变化。

### 将数据加载到 BITMAP 类型的列中

[`BITMAP`](../sql-reference/data-types/other-data-types/BITMAP.md) 通常用于加速 distinct 计数，例如计数 UV，请参阅 [使用 Bitmap 进行精确去重计数](../using_starrocks/distinct_values/Using_bitmap.md)。
这里我们以 UV 计数为例，展示如何将数据加载到 `BITMAP` 类型的列中。

1. 在 MySQL 客户端中创建 StarRocks 聚合表。

   在 `test` 数据库中，创建一个聚合表 `page_uv`，其中 `visit_users` 列定义为 `BITMAP` 类型并配置聚合函数 `BITMAP_UNION`。

    ```SQL
    CREATE TABLE `test`.`page_uv` (
      `page_id` INT NOT NULL COMMENT 'page ID',
      `visit_date` datetime NOT NULL COMMENT 'access time',
      `visit_users` BITMAP BITMAP_UNION NOT NULL COMMENT 'user ID'
    ) ENGINE=OLAP
    AGGREGATE KEY(`page_id`, `visit_date`)
    DISTRIBUTED BY HASH(`page_id`);
    ```

2. 在 Flink SQL 客户端中创建 Flink 表。

    Flink 表中的 `visit_user_id` 列为 `BIGINT` 类型，我们希望将此列加载到 StarRocks 表中 `BITMAP` 类型的 `visit_users` 列。因此，在定义 Flink 表的 DDL 时，请注意：
    - 由于 Flink 不支持 `BITMAP`，您需要定义一个 `BIGINT` 类型的 `visit_user_id` 列来表示 StarRocks 表中 `BITMAP` 类型的 `visit_users` 列。
    - 您需要将选项 `sink.properties.columns` 设置为 `page_id,visit_date,user_id,visit_users=to_bitmap(visit_user_id)`，这会告诉连接器 Flink 表和 StarRocks 表之间的列映射。同时，您需要使用 [`to_bitmap`](../sql-reference/sql-functions/bitmap-functions/to_bitmap.md) 函数来告诉连接器将 `BIGINT` 类型的数据转换为 `BITMAP` 类型。

    ```SQL
    CREATE TABLE `page_uv` (
        `page_id` INT,
        `visit_date` TIMESTAMP,
        `visit_user_id` BIGINT
    ) WITH (
        'connector' = 'starrocks',
        'jdbc-url' = 'jdbc:mysql://127.0.0.1:9030',
        'load-url' = '127.0.0.1:8030',
        'database-name' = 'test',
        'table-name' = 'page_uv',
        'username' = 'root',
        'password' = '',
        'sink.properties.columns' = 'page_id,visit_date,visit_user_id,visit_users=to_bitmap(visit_user_id)'
    );
    ```

3. 在 Flink SQL 客户端中向 Flink 表加载数据。

    ```SQL
    INSERT INTO `page_uv` VALUES
       (1, CAST('2020-06-23 01:30:30' AS TIMESTAMP), 13),
       (1, CAST('2020-06-23 01:30:30' AS TIMESTAMP), 23),
       (1, CAST('2020-06-23 01:30:30' AS TIMESTAMP), 33),
       (1, CAST('2020-06-23 02:30:30' AS TIMESTAMP), 13),
       (2, CAST('2020-06-23 01:30:30' AS TIMESTAMP), 23);
    ```

4. 在 MySQL 客户端中从 StarRocks 表计算页面 UV。

    ```SQL
    MySQL [test]> SELECT `page_id`, COUNT(DISTINCT `visit_users`) FROM `page_uv` GROUP BY `page_id`;
    +---------+-----------------------------+
    | page_id | count(DISTINCT visit_users) |
    +---------+-----------------------------+
    |       2 |                           1 |
    |       1 |                           3 |
    +---------+-----------------------------+
    2 rows in set (0.05 sec)
    ```

### 将数据加载到 HLL 类型的列中

[`HLL`](../sql-reference/data-types/other-data-types/HLL.md) 可用于近似去重计数，请参阅 [使用 HLL 进行近似去重计数](../using_starrocks/distinct_values/Using_HLL.md)。

这里我们以 UV 计数为例，展示如何将数据加载到 `HLL` 类型的列中。

1. 创建 StarRocks 聚合表

   在 `test` 数据库中，创建一个聚合表 `hll_uv`，其中 `visit_users` 列定义为 `HLL` 类型并配置聚合函数 `HLL_UNION`。

    ```SQL
    CREATE TABLE `hll_uv` (
      `page_id` INT NOT NULL COMMENT 'page ID',
      `visit_date` datetime NOT NULL COMMENT 'access time',
      `visit_users` HLL HLL_UNION NOT NULL COMMENT 'user ID'
    ) ENGINE=OLAP
    AGGREGATE KEY(`page_id`, `visit_date`)
    DISTRIBUTED BY HASH(`page_id`);
    ```

2. 在 Flink SQL 客户端中创建 Flink 表。

   Flink 表中的 `visit_user_id` 列为 `BIGINT` 类型，我们希望将此列加载到 StarRocks 表中 `HLL` 类型的 `visit_users` 列。因此，在定义 Flink 表的 DDL 时，请注意：
    - 由于 Flink 不支持 `BITMAP`，您需要定义一个 `BIGINT` 类型的 `visit_user_id` 列来表示 StarRocks 表中 `HLL` 类型的 `visit_users` 列。
    - 您需要将选项 `sink.properties.columns` 设置为 `page_id,visit_date,user_id,visit_users=hll_hash(visit_user_id)`，这会告诉连接器 Flink 表和 StarRocks 表之间的列映射。同时，您需要使用 [`hll_hash`](../sql-reference/sql-functions/scalar-functions/hll_hash.md) 函数来告诉连接器将 `BIGINT` 类型的数据转换为 `HLL` 类型。

    ```SQL
    CREATE TABLE `hll_uv` (
        `page_id` INT,
        `visit_date` TIMESTAMP,
        `visit_user_id` BIGINT
    ) WITH (
        'connector' = 'starrocks',
        'jdbc-url' = 'jdbc:mysql://127.0.0.1:9030',
        'load-url' = '127.0.0.1:8030',
        'database-name' = 'test',
        'table-name' = 'hll_uv',
        'username' = 'root',
        'password' = '',
        'sink.properties.columns' = 'page_id,visit_date,visit_user_id,visit_users=hll_hash(visit_user_id)'
    );
    ```

3. 在 Flink SQL 客户端中向 Flink 表加载数据。

    ```SQL
    INSERT INTO `hll_uv` VALUES
       (3, CAST('2023-07-24 12:00:00' AS TIMESTAMP), 78),
       (4, CAST('2023-07-24 13:20:10' AS TIMESTAMP), 2),
       (3, CAST('2023-07-24 12:30:00' AS TIMESTAMP), 674);
    ```

4. 在 MySQL 客户端中从 StarRocks 表计算页面 UV。

    ```SQL
    mysql> SELECT `page_id`, COUNT(DISTINCT `visit_users`) FROM `hll_uv` GROUP BY `page_id`;
    **+---------+-----------------------------+
    | page_id | count(DISTINCT visit_users) |
    +---------+-----------------------------+
    |       3 |                           2 |
    |       4 |                           1 |
    +---------+-----------------------------+
    2 rows in set (0.04 sec)
    ```
