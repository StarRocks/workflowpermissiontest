---
displayed_sidebar: docs
---

# 通过 AuditLoader 管理 StarRocks 内部的审计日志

本文介绍如何通过插件 AuditLoader 在 StarRocks 表中管理审计日志。

StarRocks 将审计日志存储在本地文件 **fe/log/fe.audit.log** 中，而不是内部数据库。AuditLoader 插件允许您直接在集群中管理审计日志。安装后，AuditLoader 从文件中读取日志，并通过 HTTP PUT 将其加载到 StarRocks 中。然后，您可以使用 SQL 语句在 StarRocks 中查询审计日志。

## 创建用于存储审计日志的表

在 StarRocks 集群中创建数据库和表，用于存储审计日志。详细说明请参阅 [CREATE DATABASE](../../sql-reference/sql-statements/Database/CREATE_DATABASE.md) 和 [CREATE TABLE](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md)。

由于不同 StarRocks 版本的审计日志字段可能有所不同，请务必遵循以下建议，以避免在升级过程中出现兼容性问题：

> **注意**
>
> - 所有新增字段应标记为 `NULL`。
> - 字段不应重命名，因为用户可能依赖它们。
> - 字段类型只能进行向后兼容的更改，例如 `VARCHAR(32)` -> `VARCHAR(64)`，以避免插入时出错。
> - `AuditEvent` 字段仅按名称解析。表中列的顺序无关紧要，用户可以随时更改。
> - 表中不存在的 `AuditEvent` 字段将被忽略，因此用户可以删除不需要的列。

```SQL
CREATE DATABASE starrocks_audit_db__;

CREATE TABLE starrocks_audit_db__.starrocks_audit_tbl__ (
  `queryId` VARCHAR(64) COMMENT "查询的唯一ID",
  `timestamp` DATETIME NOT NULL COMMENT "查询开始时间",
  `queryType` VARCHAR(12) COMMENT "查询类型 (query, slow_query, connection)",
  `clientIp` VARCHAR(32) COMMENT "客户端IP",
  `user` VARCHAR(64) COMMENT "查询用户名",
  `authorizedUser` VARCHAR(64) COMMENT "用户的唯一标识符，即user_identity",
  `resourceGroup` VARCHAR(64) COMMENT "资源组名称",
  `catalog` VARCHAR(32) COMMENT "Catalog 名称",
  `db` VARCHAR(96) COMMENT "查询运行所在的数据库",
  `state` VARCHAR(8) COMMENT "查询状态 (EOF, ERR, OK)",
  `errorCode` VARCHAR(512) COMMENT "错误码",
  `queryTime` BIGINT COMMENT "查询执行时间（毫秒）",
  `scanBytes` BIGINT COMMENT "查询扫描的字节数",
  `scanRows` BIGINT COMMENT "查询扫描的行数",
  `returnRows` BIGINT COMMENT "查询返回的行数",
  `cpuCostNs` BIGINT COMMENT "查询消耗的CPU时间（纳秒）",
  `memCostBytes` BIGINT COMMENT "查询消耗的内存（字节）",
  `stmtId` INT COMMENT "SQL语句的增量ID",
  `isQuery` TINYINT COMMENT "该SQL是否为查询语句 (1或0)",
  `feIp` VARCHAR(128) COMMENT "执行该语句的FE IP",
  `stmt` VARCHAR(1048576) COMMENT "原始SQL语句",
  `digest` VARCHAR(32) COMMENT "慢SQL的指纹",
  `planCpuCosts` DOUBLE COMMENT "查询规划期间的CPU使用量（纳秒）",
  `planMemCosts` DOUBLE COMMENT "查询规划期间的内存使用量（字节）",
  `pendingTimeMs` BIGINT COMMENT "查询在队列中等待的时间（毫秒）",
  `candidateMVs` VARCHAR(65533) NULL COMMENT "候选物化视图列表",
  `hitMvs` VARCHAR(65533) NULL COMMENT "匹配的物化视图列表",
  `warehouse` VARCHAR(32) NULL COMMENT "Warehouse 名称"
) ENGINE = OLAP
DUPLICATE KEY (`queryId`, `timestamp`, `queryType`)
COMMENT "审计日志表"
PARTITION BY date_trunc('day', `timestamp`)
PROPERTIES (
  "replication_num" = "1",
  "partition_live_number" = "30"
);
```

`starrocks_audit_tbl__` 以动态分区创建。默认情况下，第一个动态分区在表创建后 10 分钟创建。然后可以将审计日志加载到表中。您可以使用以下语句检查表中的分区：

```SQL
SHOW PARTITIONS FROM starrocks_audit_db__.starrocks_audit_tbl__;
```

分区创建后，您可以继续下一步。

## 下载并配置 AuditLoader

1.  [下载](https://releases.starrocks.io/resources/auditloader.zip) AuditLoader 安装包。该软件包兼容所有可用的 StarRocks 版本。

2.  解压安装包。

    ```shell
    unzip auditloader.zip
    ```

    解压后包含以下文件：

    -   **auditloader.jar**：AuditLoader 的 JAR 文件。
    -   **plugin.properties**：AuditLoader 的属性文件。您无需修改此文件。
    -   **plugin.conf**：AuditLoader 的配置文件。在大多数情况下，您只需修改文件中的 `user` 和 `password` 字段。

3.  修改 **plugin.conf** 以配置 AuditLoader。您必须配置以下各项，以确保 AuditLoader 正常工作：

    -   `frontend_host_port`：FE 的 IP 地址和 HTTP 端口，格式为 `<fe_ip>:<fe_http_port>`。建议将其设置为默认值 `127.0.0.1:8030`。StarRocks 中的每个 FE 都独立管理其审计日志，安装插件后，每个 FE 都会启动自己的后台线程来抓取和保存审计日志，并通过 Stream Load 将其写入。`frontend_host_port` 配置项用于为插件的后台 Stream Load 任务提供 HTTP 协议的 IP 和端口，此参数不支持多个值。参数的 IP 部分可以使用集群中任何 FE 的 IP，但不建议这样做，因为如果相应的 FE 崩溃，其他 FE 后台的审计日志写入任务也会因通信失败而失败。建议将其设置为默认值 `127.0.0.1:8030`，这样每个 FE 都使用自己的 HTTP 端口进行通信，从而避免在其他 FE 出现异常时影响通信（所有写入任务最终都会转发到 FE Leader 节点执行）。
    -   `database`：您创建的用于存储审计日志的数据库名称。
    -   `table`：您创建的用于存储审计日志的表名称。
    -   `user`：您的集群用户名。您必须拥有将数据加载 (LOAD_PRIV) 到表中的权限。
    -   `password`：您的用户密码。
    -   `secret_key`：用于加密密码的密钥（字符串，不能超过 16 字节）。如果未设置此参数，则表示 **plugin.conf** 中的密码不会被加密，您只需在 `password` 中指定明文密码。如果指定了此参数，则表示密码已通过此密钥加密，您需要在 `password` 中指定加密字符串。加密密码可以在 StarRocks 中使用 `AES_ENCRYPT` 函数生成：`SELECT TO_BASE64(AES_ENCRYPT('password','secret_key'));`。
    -   `filter`：审计日志加载的过滤条件。此参数基于 Stream Load 中的 [WHERE 参数](../../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md#opt_properties)，即 `-H “where: <condition>”`，默认为空字符串。示例：`filter=isQuery=1 and clientIp like '127.0.0.1%' and user='root'`。

4.  将文件重新打包。

    ```shell
    zip -q -m -r auditloader.zip auditloader.jar plugin.conf plugin.properties
    ```

5.  将软件包分发到所有托管 FE 节点的机器上。确保所有软件包都存储在相同的路径中。否则，安装将失败。分发软件包后，请记住复制软件包的绝对路径。

  > **注意**
  >
  > 您还可以将 **auditloader.zip** 分发到所有 FE 均可访问的 HTTP 服务（例如，`httpd` 或 `nginx`），并通过网络进行安装。请注意，在这两种情况下，**auditloader.zip** 都需要在执行安装后保留在路径中，并且安装后不应删除源文件。

## 安装 AuditLoader

执行以下语句以及您复制的路径，以在 StarRocks 中将 AuditLoader 作为插件安装：

```SQL
INSTALL PLUGIN FROM "<absolute_path_to_package>";
```

从本地软件包安装示例：

```SQL
INSTALL PLUGIN FROM "<absolute_path_to_package>";
```

如果您想通过网络路径安装插件，您需要在 INSTALL 语句的 PROPERTIES 中提供软件包的 MD5 值。

示例：

```sql
INSTALL PLUGIN FROM "http://xx.xx.xxx.xxx/extra/auditloader.zip" PROPERTIES("md5sum" = "3975F7B880C9490FE95F42E2B2A28E2D");
```

详细说明请参阅 [INSTALL PLUGIN](../../sql-reference/sql-statements/cluster-management/plugin/INSTALL_PLUGIN.md)。

## 验证安装并查询审计日志

1.  您可以通过 [SHOW PLUGINS](../../sql-reference/sql-statements/cluster-management/plugin/SHOW_PLUGINS.md) 检查安装是否成功。

    在以下示例中，插件 `AuditLoader` 的 `Status` 为 `INSTALLED`，表示安装成功。

    ```Plain
    mysql> SHOW PLUGINS\G
    *************************** 1. row ***************************
        Name: __builtin_AuditLogBuilder
        Type: AUDIT
    Description: builtin audit logger
        Version: 0.12.0
    JavaVersion: 1.8.31
    ClassName: com.starrocks.qe.AuditLogBuilder
        SoName: NULL
        Sources: Builtin
        Status: INSTALLED
    Properties: {}
    *************************** 2. row ***************************
        Name: AuditLoader
        Type: AUDIT
    Description: Available for versions 3.3.11+. Load audit log to starrocks, and user can view the statistic of queries
        Version: 5.0.0
    JavaVersion: 11
    ClassName: com.starrocks.plugin.audit.AuditLoaderPlugin
        SoName: NULL
        Sources: /x/xx/xxx/xxxxx/auditloader.zip
        Status: INSTALLED
    Properties: {}
    2 rows in set (0.01 sec)
    ```

2.  执行一些随机 SQL 语句以生成审计日志，并等待 60 秒（或您在配置 AuditLoader 时在 `max_batch_interval_sec` 项中指定的时间），以允许 AuditLoader 将审计日志加载到 StarRocks 中。

3.  通过查询表来检查审计日志。

    ```SQL
    SELECT * FROM starrocks_audit_db__.starrocks_audit_tbl__;
    ```

    以下示例显示审计日志成功加载到表中：

    ```Plain
    mysql> SELECT * FROM starrocks_audit_db__.starrocks_audit_tbl__\G
    *************************** 1. row ***************************
           queryId: 01975a33-4129-7520-97a2-05e641cec6c9
         timestamp: 2025-06-10 14:16:37
         queryType: query
          clientIp: xxx.xx.xxx.xx:65283
              user: root
    authorizedUser: 'root'@'%'
     resourceGroup: default_wg
           catalog: default_catalog
                db: 
             state: EOF
         errorCode:
         queryTime: 3
         scanBytes: 0
          scanRows: 0
        returnRows: 1
         cpuCostNs: 33711
      memCostBytes: 4200
            stmtId: 102
           isQuery: 1
              feIp: xxx.xx.xxx.xx
              stmt: SELECT * FROM starrocks_audit_db__.starrocks_audit_tbl__
            digest:
      planCpuCosts: 908
      planMemCosts: 0
     pendingTimeMs: -1
      candidateMvs: null
            hitMVs: null
    …………
    ```

## 故障排除

如果在创建动态分区并安装插件后没有审计日志加载到表中，您可以检查 **plugin.conf** 是否配置正确。要修改它，您必须首先卸载插件：

```SQL
UNINSTALL PLUGIN AuditLoader;
```

AuditLoader 的日志会打印在 **fe.log** 中，您可以通过在 **fe.log** 中搜索关键词 `audit` 来检索它们。所有配置正确设置后，您可以按照上述步骤再次安装 AuditLoader。
```
