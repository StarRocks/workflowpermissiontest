---
displayed_sidebar: docs
---

import FEConfigMethod from '../../_assets/commonMarkdown/FE_config_method.mdx'

import AdminSetFrontendNote from '../../_assets/commonMarkdown/FE_config_note.mdx'

import StaticFEConfigNote from '../../_assets/commonMarkdown/StaticFE_config_note.mdx'

import EditionSpecificFEItem from '../../_assets/commonMarkdown/Edition_Specific_FE_Item.mdx'

# FE 配置

<FEConfigMethod />
## 查看FE配置项

FE启动后，您可以在MySQL客户端执行 `ADMIN SHOW FRONTEND CONFIG` 命令来查看参数配置。如果您想查询特定参数的配置，请执行以下命令：

```SQL
ADMIN SHOW FRONTEND CONFIG [LIKE "pattern"];
```

关于返回字段的详细描述，请参见 [ADMIN SHOW CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md) 。

:::note
您必须具有管理员权限才能运行集群管理相关的命令。
:::
## 配置 FE 参数
### 配置 FE 动态参数

您可以使用 [ADMIN SET FRONTEND CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md) 来配置或修改 FE 动态参数的设置。

```SQL
ADMIN SET FRONTEND CONFIG ("key" = "value");
```

<AdminSetFrontendNote />
### 配置 FE 静态参数

<StaticFEConfigNote />
## 了解 FE 参数
### 日志记录
##### audit_log_delete_age

- 默认值：30d
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：审计日志文件的保留期限。默认值 `30d` 指定每个审计日志文件可以保留 30 天。StarRocks 会检查每个审计日志文件，并删除 30 天前生成的文件。
- 引入版本：-
##### audit_log_dir

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/log"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：存储审计日志文件的目录。
- 引入版本：-
##### audit_log_enable_compress

- 默认值：false
- 类型：Boolean
- 单位：N/A
- 是否可修改：否
- 描述：如果为 true，则生成的 Log4j2 配置会将“.gz”后缀附加到轮转的审计日志文件名 (fe.audit.log.*)，以便 Log4j2 在翻转时生成压缩的 (.gz) 归档审计日志文件。此设置在 FE 启动期间的 Log4jConfig.initLogging 中读取，并应用于审计日志的 RollingFile appender；它仅影响轮转/归档的文件，而不影响活动的审计日志。由于该值在启动时初始化，因此更改它需要重新启动 FE 才能生效。与审计日志轮转设置（audit_log_dir、audit_log_roll_interval、audit_roll_maxsize、audit_log_roll_num）一起使用。
- 引入版本：3.2.12
##### audit_log_json_format

- 默认值：false
- 类型：Boolean
- 单位：N/A
- 是否可变：是
- 描述：如果设置为 true，FE 审计事件将以结构化的 JSON 格式（Jackson ObjectMapper 序列化带注释的 AuditEvent 字段的 Map）发出，而不是默认的管道分隔的“key=value”字符串。此设置会影响 AuditLogBuilder 处理的所有内置审计接收器：连接审计、查询审计、大查询审计（当事件符合条件时，大查询阈值字段会添加到 JSON 中）和慢查询审计输出。为大查询阈值和“features”字段添加注释的字段会进行特殊处理（从普通审计条目中排除；根据适用情况包含在大查询或功能日志中）。启用此功能可以使日志可供日志收集器或 SIEM 进行机器解析；请注意，它会更改日志格式，并且可能需要更新任何期望使用旧的管道分隔格式的现有解析器。
- 引入版本：3.2.7
##### audit_log_modules

- 默认值：slow_query, query
- 类型：String[]
- 单位：-
- 是否可变：否
- 描述：StarRocks 生成审计日志条目的模块。默认情况下，StarRocks 为 `slow_query` 模块和 `query` 模块生成审计日志。从 v3.0 版本开始，支持 `connection` 模块。使用逗号 (,) 和空格分隔模块名称。
- 引入版本：-
##### audit_log_roll_interval

- 默认值：DAY
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：StarRocks 滚动审计日志条目的时间间隔。有效值：`DAY` 和 `HOUR`。
  - 如果此参数设置为 `DAY`，则会将 `yyyyMMdd` 格式的后缀添加到审计日志文件的名称中。
  - 如果此参数设置为 `HOUR`，则会将 `yyyyMMddHH` 格式的后缀添加到审计日志文件的名称中。
- 引入版本：-
##### audit_log_roll_num

- 默认值：90
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：在 `audit_log_roll_interval` 参数指定的每个保留周期内，可以保留的审计日志文件的最大数量。
- 引入版本：-
##### bdbje_log_level

- 默认值：INFO
- 类型：String
- 单位：-
- 是否可变：否
- 描述：控制 StarRocks 中 Berkeley DB Java Edition (BDB JE) 使用的日志级别。在 BDB 环境初始化期间，`BDBEnvironment.initConfigs()` 将此值应用于 `com.sleepycat.je` 包的 Java 日志记录器和 BDB JE 环境文件日志级别 (EnvironmentConfig.FILE_LOGGING_LEVEL)。接受标准的 java.util.logging.Level 名称，例如 SEVERE、WARNING、INFO、CONFIG、FINE、FINER、FINEST、ALL、OFF。设置为 ALL 将启用所有日志消息。增加详细程度会增加日志量，并可能影响磁盘 I/O 和性能；该值在 BDB 环境初始化时读取，因此仅在环境（重新）初始化后生效。
- 引入版本：v3.2.0
##### big_query_log_delete_age

- 默认值：7d
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：控制 FE 大查询日志文件（`fe.big_query.log.*`）在自动删除之前保留的时间。该值作为 IfLastModified age 传递给 Log4j 的删除策略——任何上次修改时间早于此值的轮转大查询日志都将被删除。支持的后缀包括 `d`（天）、`h`（小时）、`m`（分钟）和 `s`（秒）。例如：`7d`（7 天）、`10h`（10 小时）、`60m`（60 分钟）和 `120s`（120 秒）。此项与 `big_query_log_roll_interval` 和 `big_query_log_roll_num` 协同工作，以确定要保留或清除的文件。
- 引入版本：v3.2.0
##### big_query_log_dir

- 默认值: `Config.STARROCKS_HOME_DIR + "/log"`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: FE 写入大查询转储日志 (`fe.big_query.log.*`) 的目录。Log4j 配置使用此路径为 `fe.big_query.log` 及其轮转文件创建 RollingFile appender。轮转和保留由 `big_query_log_roll_interval` (基于时间的后缀)、`log_roll_size_mb` (大小触发器)、`big_query_log_roll_num` (最大文件数) 和 `big_query_log_delete_age` (基于时间的删除) 管理。大查询记录会针对超过用户定义阈值的查询进行记录，例如 `big_query_log_cpu_second_threshold`、`big_query_log_scan_rows_threshold` 或 `big_query_log_scan_bytes_threshold`。使用 `big_query_log_modules` 来控制哪些模块将日志记录到此文件。
- 引入版本: v3.2.0
##### big_query_log_modules

- 默认值: `{"query"}`
- 类型: String[]
- 单位: -
- 是否可修改: 否
- 描述: 启用每个模块的big query日志记录的模块名称后缀列表。典型值是逻辑组件名称。例如，默认值 `query` 会生成 `big_query.query`。
- 引入版本: v3.2.0
##### big_query_log_roll_interval

- 默认值: `"DAY"`
- 类型: String
- 单位: -
- 是否可修改: 否
- 描述: 指定用于构造 `big_query` 日志追加器的滚动文件名中的日期部分的时间间隔。有效值（不区分大小写）为 `DAY`（默认值）和 `HOUR`。`DAY` 生成每日模式 (`"%d{yyyyMMdd}"`)，`HOUR` 生成每小时模式 (`"%d{yyyyMMddHH}"`)。该值与基于大小的滚动 (`big_query_roll_maxsize`) 和基于索引的滚动 (`big_query_log_roll_num`) 结合使用，以形成 RollingFile filePattern。无效值会导致日志配置生成失败 (IOException)，并可能阻止日志初始化或重新配置。与 `big_query_log_dir`、`big_query_roll_maxsize`、`big_query_log_roll_num` 和 `big_query_log_delete_age` 一起使用。
- 引入版本: v3.2.0
##### big_query_log_roll_num

- 默认值：10
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：每个 `big_query_log_roll_interval` 要保留的 FE 大查询轮转日志文件的最大数量。此值绑定到 RollingFile appender 的 DefaultRolloverStrategy `max` 属性，用于 `fe.big_query.log`；当日志轮转（按时间或按 `log_roll_size_mb`）时，StarRocks 最多保留 `big_query_log_roll_num` 个索引文件（filePattern 使用时间后缀加索引）。早于此计数的文件可能会被轮转删除，并且 `big_query_log_delete_age` 还可以按上次修改时间删除文件。
- 引入版本：v3.2.0
##### dump_log_delete_age

- 默认值：7d
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：Dump 日志文件的保留期限。默认值 `7d` 指定每个 Dump 日志文件可以保留 7 天。StarRocks 会检查每个 Dump 日志文件，并删除 7 天前生成的日志文件。
- 引入版本：-
##### dump_log_dir

- 默认值: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- 类型: String
- 单位: -
- 是否可修改: 否
- 描述: 存储 dump 日志文件的目录。
- 引入版本: -
##### dump_log_modules

- 默认值：query
- 类型：String[]
- 单位：-
- 是否可变：否
- 描述：用于指定 StarRocks 生成 dump 日志的模块。默认情况下，StarRocks 会为 query 模块生成 dump 日志。使用英文逗号 (,) 和空格分隔模块名称。
- 引入版本：-
##### dump_log_roll_interval

- 默认值：DAY
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：StarRocks 转储日志条目的时间间隔。有效值：`DAY` 和 `HOUR`。
  - 如果此参数设置为 `DAY`，则会将 `yyyyMMdd` 格式的后缀添加到转储日志文件的名称中。
  - 如果此参数设置为 `HOUR`，则会将 `yyyyMMddHH` 格式的后缀添加到转储日志文件的名称中。
- 引入版本：-
##### dump_log_roll_num

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可修改: 否
- 描述: 在 `dump_log_roll_interval` 参数指定的每个保留期内，可以保留的最大 dump 日志文件数。
- 引入版本: -
##### edit_log_write_slow_log_threshold_ms

- 默认值：2000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：JournalWriter 使用的阈值（以毫秒为单位），用于检测和记录慢速 edit-log 批量写入。在批量提交后，如果批量持续时间超过此值，JournalWriter 会发出一个 WARN，其中包含批量大小、持续时间和当前 journal 队列大小（速率限制为大约每 2 秒一次）。此设置仅控制 FE 的 Leader 节点上潜在的 IO 或复制延迟的日志记录/警报；它不会更改提交或回滚行为（请参阅 `edit_log_roll_num` 和与提交相关的设置）。无论此阈值如何，指标更新仍然会发生。
- 引入版本：v3.2.3
##### enable_audit_sql

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：当此项设置为 `true` 时，FE 审计子系统会将语句的 SQL 文本记录到 FE 审计日志 (`fe.audit.log`) 中，这些语句由 ConnectProcessor 处理。存储的语句遵循其他控制：加密语句会被编辑 (`AuditEncryptionChecker`)，如果设置了 `enable_sql_desensitize_in_log`，敏感凭据可能会被编辑或脱敏，摘要记录由 `enable_sql_digest` 控制。当设置为 `false` 时，ConnectProcessor 会将审计事件中的语句文本替换为 "?" —— 其他审计字段（用户、主机、持续时间、状态、通过 `qe_slow_log_ms` 进行的慢查询检测以及指标）仍然会被记录。启用 SQL 审计可以提高取证和故障排除的可见性，但可能会暴露敏感的 SQL 内容并增加日志量和 I/O；禁用它可以提高隐私，但会失去审计日志中的完整语句可见性。
- 引入版本：-
##### enable_profile_log

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：是否启用 profile 日志。启用此功能后，FE 会将每个查询的 profile 日志（由 `ProfileManager` 生成的序列化 `queryDetail` JSON）写入 profile 日志接收器。只有在同时启用 `enable_collect_query_detail_info` 时，才会执行此日志记录；当启用 `enable_profile_log_compress` 时，JSON 可能会在记录之前进行 gzip 压缩。Profile 日志文件由 `profile_log_dir`、`profile_log_roll_num`、`profile_log_roll_interval` 管理，并根据 `profile_log_delete_age` 轮换/删除（支持 `7d`、`10h`、`60m`、`120s` 等格式）。禁用此功能会停止写入 profile 日志（减少磁盘 I/O、压缩 CPU 和存储使用量）。
- 引入版本：v3.2.5
##### enable_qe_slow_log

- 默认值：true
- 类型：Boolean
- 单位：N/A
- 是否可变：是
- 描述：启用后，FE 内置的审计插件 (AuditLogBuilder) 会将执行时间（“Time”字段）超过 `qe_slow_log_ms` 配置的阈值的查询事件写入慢查询审计日志 (AuditLog.getSlowAudit)。如果禁用，这些慢查询条目将被抑制（常规查询和连接审计日志不受影响）。慢审计条目遵循全局 `audit_log_json_format` 设置（JSON 与纯字符串）。使用此标志可以独立于常规审计日志记录来控制慢查询审计卷的生成；当 `qe_slow_log_ms` 较低或工作负载产生许多长时间运行的查询时，关闭它可以减少日志 I/O。
- 引入版本：3.2.11
##### enable_sql_desensitize_in_log

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：如果此项设置为 `true`，系统会在将敏感 SQL 内容写入日志和查询详情记录之前，替换或隐藏这些内容。遵循此配置的代码路径包括 ConnectProcessor.formatStmt（审计日志）、StmtExecutor.addRunningQueryDetail（查询详情）和 SimpleExecutor.formatSQL（内部执行器日志）。启用此功能后，无效的 SQL 可能会被替换为固定的脱敏消息，凭据（用户/密码）会被隐藏，并且 SQL 格式化程序需要生成经过清理的表示形式（它还可以启用摘要式输出）。这减少了审计/内部日志中敏感字面量和凭据的泄漏，但也意味着日志和查询详情不再包含原始的完整 SQL 文本（这可能会影响重放或调试）。
- 引入版本：-
##### internal_log_delete_age

- 默认值：7d
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：指定 FE 内部日志文件（写入到 `internal_log_dir`）的保留期限。该值是一个持续时间字符串。支持的后缀：`d`（天）、`h`（小时）、`m`（分钟）、`s`（秒）。示例：`7d`（7 天）、`10h`（10 小时）、`60m`（60 分钟）、`120s`（120 秒）。此项被替换到 log4j 配置中，作为 RollingFile Delete 策略使用的 `<IfLastModified age="..."/>` 谓词。在日志滚动期间，将删除上次修改时间早于此持续时间的文件。增加此值可以更快地释放磁盘空间，或者减少此值可以更长时间地保留内部物化视图或统计信息日志。
- 引入版本：v3.2.4
##### internal_log_dir

- 默认值: `Config.STARROCKS_HOME_DIR + "/log"`
- 类型: String
- 单位: -
- 是否可修改: 否
- 描述: FE 日志子系统用于存储内部日志 (`fe.internal.log`) 的目录。此配置被替换到 Log4j 配置中，并确定 InternalFile appender 将内部/物化视图/统计信息日志写入的位置，以及 `internal.<module>` 下的每个模块记录器放置其文件的位置。确保目录存在、可写且具有足够的磁盘空间。此目录中文件的日志滚动和保留由 `log_roll_size_mb`、`internal_log_roll_num`、`internal_log_delete_age` 和 `internal_log_roll_interval` 控制。如果启用了 `sys_log_to_console`，则内部日志可能会写入控制台而不是此目录。
- 引入版本: v3.2.4
##### internal_log_json_format

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果设置为 `true`，内部统计/审计条目将作为紧凑的 JSON 对象写入统计审计日志记录器。JSON 包含键 "executeType" (InternalType: QUERY 或 DML)、"queryId"、"sql" 和 "time" (经过的毫秒数)。如果设置为 `false`，则相同的信息将记录为单个格式化的文本行（"statistic execute: ... | QueryId: [...] | SQL: ..."）。启用 JSON 可以提高机器解析能力以及与日志处理器的集成，但也会导致原始 SQL 文本包含在日志中，这可能会暴露敏感信息并增加日志大小。
- 引入版本：-
##### internal_log_modules

- 默认值: `{"base", "statistic"}`
- 类型: String[]
- 单位: -
- 是否可变: 否
- 描述: 接收专用内部日志的模块标识符列表。对于每个条目 X，Log4j 会创建一个名为 `internal.&lt;X&gt;` 的 logger，级别为 INFO，并且 additivity="false"。这些 logger 会路由到内部 appender（写入到 `fe.internal.log`），或者在启用 `sys_log_to_console` 时路由到控制台。根据需要使用短名称或包片段 — 确切的 logger 名称变为 `internal.` + 配置的字符串。内部日志文件轮转和保留遵循 `internal_log_dir`、`internal_log_roll_num`、`internal_log_delete_age`、`internal_log_roll_interval` 和 `log_roll_size_mb`。添加模块会导致其运行时消息被分离到内部 logger 流中，以便更轻松地进行调试和审计。
- 引入版本: v3.2.4
##### internal_log_roll_interval

- 默认值：DAY
- 类型：String
- 单位：-
- 是否可变：否
- 描述：控制 FE 内部日志追加器的基于时间的滚动间隔。可接受的值（不区分大小写）为 `HOUR` 和 `DAY`。`HOUR` 生成每小时的文件模式（`"%d{yyyyMMddHH}"`），`DAY` 生成每日文件模式（`"%d{yyyyMMdd}"`），这些模式由 RollingFile TimeBasedTriggeringPolicy 用于命名轮转的 `fe.internal.log` 文件。无效值会导致初始化失败（构建活动 Log4j 配置时会抛出 IOException）。滚动行为还取决于相关设置，例如 `internal_log_dir`、`internal_roll_maxsize`、`internal_log_roll_num` 和 `internal_log_delete_age`。
- 引入版本：v3.2.4
##### internal_log_roll_num

- 默认值: 90
- 类型: Int
- 单位: -
- 是否可修改: 否
- 描述: 内部 appender (`fe.internal.log`) 要保留的内部 FE 日志文件的最大滚动数量。此值用作 Log4j DefaultRolloverStrategy 的 `max` 属性；发生滚动时，StarRocks 最多保留 `internal_log_roll_num` 个存档文件，并删除较旧的文件（也由 `internal_log_delete_age` 管理）。较低的值会减少磁盘使用量，但会缩短日志历史记录；较高的值会保留更多历史内部日志。此项与 `internal_log_dir`、`internal_log_roll_interval` 和 `internal_roll_maxsize` 协同工作。
- 引入版本: v3.2.4
##### log_cleaner_audit_log_min_retention_days

- 默认值：3
- 类型：Int
- 单位：天
- 是否可修改：是
- 描述：审计日志文件的最短保留天数。即使磁盘使用率很高，也不会删除比此时间新的审计日志文件。这样可确保为合规性和故障排除目的保留审计日志。
- 引入版本：-
##### log_cleaner_check_interval_second

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：检查磁盘使用情况和清理日志的间隔（秒）。清理程序会定期检查每个日志目录的磁盘使用情况，并在必要时触发清理。默认值为 300 秒（5 分钟）。
- 引入版本：-
##### log_cleaner_disk_usage_target

- 默认值：60
- 类型：Int
- 单位：百分比
- 是否可修改：是
- 描述：日志清理后的目标磁盘使用率（百分比）。日志清理将持续进行，直到磁盘使用率降至此阈值以下。清理器会逐个删除最旧的日志文件，直到达到目标值为止。
- 引入版本：-
##### log_cleaner_disk_usage_threshold

- 默认值：80
- 类型：Int
- 单位：百分比
- 是否可变：是
- 描述：触发日志清理的磁盘使用率阈值（百分比）。当磁盘使用率超过此阈值时，将启动日志清理。清理程序会独立检查每个配置的日志目录，并处理超过此阈值的目录。
- 引入版本：-
##### log_cleaner_disk_util_based_enable

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：启用基于磁盘使用率的自动日志清理。 启用后，当磁盘使用率超过阈值时，将清理日志。 日志清理器作为 FE 节点上的后台守护程序运行，有助于防止日志文件累积导致磁盘空间耗尽。
- 引入版本：-
##### log_plan_cancelled_by_crash_be

- 默认值：true
- 类型：boolean
- 单位：-
- 是否可修改：是
- 描述：是否在查询因 BE 崩溃或 RPC 异常而取消时，启用查询执行计划日志记录。启用此功能后，当查询因 BE 崩溃或 `RpcException` 而取消时，StarRocks 会将查询执行计划（位于 `TExplainLevel.COSTS`）记录为 WARN 条目。该日志条目包括 QueryId、SQL 和 COSTS 计划；在 ExecuteExceptionHandler 路径中，还会记录异常堆栈跟踪。当启用 `enable_collect_query_detail_info` 时，将跳过日志记录（计划随后存储在查询详细信息中）——在代码路径中，通过验证查询详细信息是否为空来执行检查。请注意，在 ExecuteExceptionHandler 中，仅在第一次重试时记录计划 (`retryTime == 0`)。启用此功能可能会增加日志量，因为完整的 COSTS 计划可能很大。
- 引入版本：v3.2.0
##### log_register_and_unregister_query_id

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否允许 FE 记录来自 QeProcessorImpl 的查询注册和注销消息（例如，`"register query id = {}"` 和 `"deregister query id = {}"`）。仅当查询具有非空的 ConnectContext 且命令不是 `COM_STMT_EXECUTE` 或会话变量 `isAuditExecuteStmt()` 为 true 时，才会发出日志。由于这些消息是为每个查询生命周期事件编写的，因此启用此功能可能会产生大量的日志，并在高并发环境中成为吞吐量瓶颈。启用它可以进行调试或审计；禁用它可以减少日志记录开销并提高性能。
- 引入版本：v3.3.0、v3.4.0、v3.5.0
##### log_roll_size_mb

- 默认值：1024
- 类型：Int
- 单位：MB
- 是否可修改：否
- 描述：系统日志文件或审计日志文件的最大大小。
- 引入版本：-
##### proc_profile_file_retained_days

- 默认值：1
- 类型：Int
- 单位：天
- 是否可变：是
- 描述：在 `sys_log_dir/proc_profile` 目录下生成的进程分析文件（CPU 和内存）的保留天数。ProcProfileCollector 通过从当前时间（格式为 yyyyMMdd-HHmmss）减去 `proc_profile_file_retained_days` 天来计算截止时间，并删除时间戳部分在字典顺序上早于该截止时间的 profile 文件（即 timePart.compareTo(timeToDelete) &lt; 0）。文件删除也遵守由 `proc_profile_file_retained_size_bytes` 控制的基于大小的截止时间。Profile 文件使用前缀 `cpu-profile-` 和 `mem-profile-`，并在收集后进行压缩。
- 引入版本：v3.2.12
##### proc_profile_file_retained_size_bytes

- 默认值：2L * 1024 * 1024 * 1024 (2147483648)
- 类型：Long
- 单位：Bytes
- 是否可变：是
- 描述：在 profile 目录下，保留的 CPU 和内存 profile 文件（文件名前缀为 `cpu-profile-` 和 `mem-profile-`）的最大总字节数。当有效 profile 文件的总和超过 `proc_profile_file_retained_size_bytes` 时，收集器将删除最旧的 profile 文件，直到剩余总大小小于或等于 `proc_profile_file_retained_size_bytes`。早于 `proc_profile_file_retained_days` 的文件也会被删除，无论大小如何。此设置控制 profile 归档的磁盘使用量，并与 `proc_profile_file_retained_days` 交互以确定删除顺序和保留时间。
- 引入版本：v3.2.12
##### profile_log_delete_age

- 默认值：1d
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：控制 FE profile 日志文件在符合删除条件前保留的时间。该值被注入到 Log4j 的 `&lt;IfLastModified age="..."/&gt;` 策略中（通过 `Log4jConfig`），并与 `profile_log_roll_interval` 和 `profile_log_roll_num` 等轮转设置一起应用。支持的后缀：`d`（天）、`h`（小时）、`m`（分钟）、`s`（秒）。例如：`7d`（7 天）、`10h`（10 小时）、`60m`（60 分钟）、`120s`（120 秒）。
- 引入版本：v3.2.5
##### profile_log_dir

- 默认值: `Config.STARROCKS_HOME_DIR + "/log"`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: FE profile 日志的写入目录。Log4jConfig 使用此值来放置与 profile 相关的 appender (在此目录下创建 `fe.profile.log` 和 `fe.features.log` 等文件)。这些文件的滚动和保留由 `profile_log_roll_size_mb`、`profile_log_roll_num` 和 `profile_log_delete_age` 控制；时间戳后缀格式由 `profile_log_roll_interval` 控制 (支持 DAY 或 HOUR)。由于默认目录位于 `STARROCKS_HOME_DIR` 下，请确保 FE 进程对该目录具有写入和滚动/删除权限。
- 引入版本: v3.2.5
##### profile_log_roll_interval

- 默认值：DAY
- 类型：String
- 单位：-
- 是否可变：否
- 描述：控制用于生成 profile 日志文件名的日期部分的时间粒度。有效值（不区分大小写）为 `HOUR` 和 `DAY`。`HOUR` 生成 `"%d{yyyyMMddHH}"` 模式（每小时时间桶），`DAY` 生成 `"%d{yyyyMMdd}"` 模式（每日时间桶）。此值用于计算 Log4j 配置中的 `profile_file_pattern`，并且仅影响基于时间的滚动文件名组件；基于大小的滚动仍然由 `profile_log_roll_size_mb` 控制，保留由 `profile_log_roll_num` / `profile_log_delete_age` 控制。无效值会在日志初始化期间导致 IOException（错误消息：`"profile_log_roll_interval config error: <value>"`）。对于大容量 profiling，选择 `HOUR` 以限制每小时每个文件的大小，或者对于每日聚合，选择 `DAY`。
- 引入版本：v3.2.5
##### profile_log_roll_num

- 默认值：5
- 类型：Int
- 单位：-
- 是否可变：否
- 描述：指定 profile 日志记录器通过 Log4j 的 DefaultRolloverStrategy 保留的最大轮转 profile 日志文件数。此值作为 `${profile_log_roll_num}` 注入到日志 XML 中（例如，`&lt;DefaultRolloverStrategy max="${profile_log_roll_num}" fileIndex="min"&gt;`）。轮转由 `profile_log_roll_size_mb` 或 `profile_log_roll_interval` 触发；发生轮转时，Log4j 最多保留这些索引文件，并且较旧的索引文件有资格被删除。磁盘上的实际保留也受 `profile_log_delete_age` 和 `profile_log_dir` 位置的影响。较低的值会减少磁盘使用量，但会限制保留的历史记录；较高的值会保留更多历史 profile 日志。
- 引入版本：v3.2.5
##### profile_log_roll_size_mb

- 默认值：1024
- 类型：Int
- 单位：MB
- 是否可修改：否
- 描述：设置触发基于大小的 FE profile 日志文件滚动更新的大小阈值（以 MB 为单位）。此值由 Log4j RollingFile SizeBasedTriggeringPolicy 用于 `ProfileFile` appender；当 profile 日志超过 `profile_log_roll_size_mb` 时，它将进行轮换。当达到 `profile_log_roll_interval` 时，也会按时间进行轮换 - 任何一种情况都会触发滚动更新。结合 `profile_log_roll_num` 和 `profile_log_delete_age`，此项控制保留多少历史 profile 文件以及何时删除旧文件。轮换文件的压缩由 `enable_profile_log_compress` 控制。
- 引入版本：v3.2.5
##### qe_slow_log_ms

- 默认值：5000
- 类型：Long
- 单位：毫秒
- 是否可修改：是
- 描述：用于确定查询是否为慢查询的阈值。如果查询的响应时间超过此阈值，则会在 **fe.audit.log** 中将其记录为慢查询。
- 引入版本：-
##### slow_lock_log_every_ms

- 默认值: 3000L
- 类型: Long
- 单位: 毫秒
- 是否可变: 是
- 描述: 在为同一 SlowLockLogStats 实例发出另一个 "slow lock" 警告之前，要等待的最小间隔（以毫秒为单位）。LockUtils 在锁等待时间超过 slow_lock_threshold_ms 后会检查此值，并且会禁止显示其他警告，直到自上次记录的 slow-lock 事件以来已经过了 slow_lock_log_every_ms 毫秒。使用较大的值可以减少长时间争用期间的日志量，或者使用较小的值可以获得更频繁的诊断信息。更改会在运行时生效，以供后续检查。
- 引入版本: v3.2.0
##### slow_lock_print_stack

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否允许 LockManager 在 `logSlowLockTrace` 发出的慢锁警告的 JSON payload 中包含拥有线程的完整堆栈跟踪（"stack" 数组通过 `LogUtil.getStackTraceToJsonArray` 填充，`start=0` 且 `max=Short.MAX_VALUE`）。此配置仅控制当锁获取超过 `slow_lock_threshold_ms` 配置的阈值时显示的锁持有者的额外堆栈信息。启用此功能通过提供持有锁的精确线程堆栈来帮助调试；禁用此功能可减少高并发环境中捕获和序列化堆栈跟踪所导致的日志量以及 CPU/内存开销。
- 引入版本：v3.3.16、v3.4.5、v3.5.1
##### slow_lock_threshold_ms

- 默认值：3000L
- 类型：long
- 单位：毫秒
- 是否可修改：是
- 描述：用于将锁操作或持有的锁归类为“慢速”的阈值（以毫秒为单位）。当锁的等待或持有时间超过此值时，StarRocks 将（根据上下文）发出诊断日志，包括堆栈跟踪或等待者/所有者信息，并且在 LockManager 中，在此延迟后启动死锁检测。它被 LockUtils（慢锁日志记录）、QueryableReentrantReadWriteLock（过滤慢速读取器）、LockManager（死锁检测延迟和慢锁跟踪）、LockChecker（周期性慢锁检测）和其他调用者（例如，DiskAndTabletLoadReBalancer 日志记录）使用。降低该值会增加灵敏度和日志记录/诊断开销；将其设置为 0 或负数会禁用基于初始等待的死锁检测延迟行为。与 slow_lock_log_every_ms、slow_lock_print_stack 和 slow_lock_stack_trace_reserve_levels 一起调整。
- 引入版本：3.2.0
##### sys_log_delete_age

- 默认值：7d
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：系统日志文件的保留期限。默认值 `7d` 指定每个系统日志文件可以保留 7 天。StarRocks 会检查每个系统日志文件，并删除 7 天前生成的日志文件。
- 引入版本：-
##### sys_log_dir

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/log"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：存储系统日志文件的目录。
- 引入版本：-
##### sys_log_enable_compress

- 默认值：false
- 类型：boolean
- 单位：-
- 是否可修改：否
- 描述：如果此项设置为 `true`，系统会在轮转的系统日志文件名后追加“.gz”后缀，以便 Log4j 生成 gzip 压缩的 FE 系统轮转日志（例如，fe.log.*）。此值在 Log4j 配置生成期间读取 (Log4jConfig.initLogging / generateActiveLog4jXmlConfig)，并控制 RollingFile filePattern 中使用的 `sys_file_postfix` 属性。启用此功能可以减少保留日志的磁盘使用量，但会增加轮转期间的 CPU 和 I/O，并更改日志文件名，因此读取日志的工具或脚本必须能够处理 .gz 文件。请注意，审计日志使用单独的压缩配置，即 `audit_log_enable_compress`。
- 引入版本：v3.2.12
##### sys_log_format

- 默认值: "plaintext"
- 类型: String
- 单位: -
- 是否可修改: 否
- 描述: 选择用于 FE 日志的 Log4j 布局。有效值: `"plaintext"` (默认) 和 `"json"`。这些值不区分大小写。`"plaintext"` 使用易于理解的时间戳、级别、线程、class.method:line 以及 WARN/ERROR 的堆栈跟踪来配置 PatternLayout。`"json"` 配置 JsonTemplateLayout 并发出结构化的 JSON 事件 (UTC 时间戳、级别、线程 id/name、源文件/方法/行、消息、异常 stackTrace)，适用于日志聚合器 (ELK, Splunk)。JSON 输出遵守 `sys_log_json_max_string_length` 和 `sys_log_json_profile_max_string_length` 以获得最大字符串长度。
- 引入版本: v3.2.10
##### sys_log_json_max_string_length

- 默认值：1048576
- 类型：Int
- 单位：Bytes
- 是否可变：否
- 描述：设置用于 JSON 格式系统日志的 JsonTemplateLayout "maxStringLength" 值。当 `sys_log_format` 设置为 `"json"` 时，如果字符串值字段（例如 "message" 和字符串化的异常堆栈跟踪）的长度超过此限制，则会被截断。该值被注入到 `Log4jConfig.generateActiveLog4jXmlConfig()` 中生成的 Log4j XML 中，并应用于 default、warning、audit、dump 和 bigquery 布局。profile 布局使用单独的配置 (`sys_log_json_profile_max_string_length`)。降低此值会减小日志大小，但可能会截断有用的信息。
- 引入版本：3.2.11
##### sys_log_json_profile_max_string_length

- 默认值: 104857600 (100 MB)
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 当 `sys_log_format` 为 "json" 时，设置 profile (以及相关功能) 日志追加器的 JsonTemplateLayout 的 maxStringLength。JSON 格式的 profile 日志中的字符串字段值将被截断为此字节长度；非字符串字段不受影响。此项应用于 Log4jConfig `JsonTemplateLayout maxStringLength`，当使用 `plaintext` 日志记录时将被忽略。保持该值足够大，以满足您需要的完整消息，但请注意，较大的值会增加日志大小和 I/O。
- 引入版本: v3.2.11
##### sys_log_level

- 默认值：INFO
- 类型：String
- 单位：-
- 是否可变：否
- 描述：系统日志条目的分类级别。有效值：`INFO`、`WARN`、`ERROR` 和 `FATAL`。
- 引入版本：-
##### sys_log_roll_interval

- 默认值：DAY
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：StarRocks 滚动系统日志条目的时间间隔。有效值：`DAY` 和 `HOUR`。
  - 如果此参数设置为 `DAY`，则会将 `yyyyMMdd` 格式的后缀添加到系统日志文件的名称中。
  - 如果此参数设置为 `HOUR`，则会将 `yyyyMMddHH` 格式的后缀添加到系统日志文件的名称中。
- 引入版本：-
##### sys_log_roll_num

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可修改: 否
- 描述: 在 `sys_log_roll_interval` 参数指定的每个保留期内，可以保留的系统日志文件的最大数量。
- 引入版本: -
##### sys_log_to_console

- 默认值：false（除非环境变量 `SYS_LOG_TO_CONSOLE` 设置为 "1"）
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：如果此项设置为 `true`，系统会将 Log4j 配置为将所有日志发送到控制台（ConsoleErr appender），而不是基于文件的 appender。此值在生成活动的 Log4j XML 配置时读取（这会影响根 logger 和每个模块的 logger appender 选择）。它的值是从进程启动时的 `SYS_LOG_TO_CONSOLE` 环境变量中捕获的。在运行时更改它没有任何效果。此配置通常用于容器化或 CI 环境，在这些环境中，stdout/stderr 日志收集优于写入日志文件。
- 引入版本：v3.2.0
##### sys_log_verbose_modules

- 默认值：空字符串
- 类型：String[]
- 单位：-
- 是否可修改：否
- 描述：用于生成 StarRocks 系统日志的模块。如果此参数设置为 `org.apache.starrocks.catalog`，则 StarRocks 仅为 catalog 模块生成系统日志。使用逗号 (,) 和空格分隔模块名称。
- 引入版本：-
##### sys_log_warn_modules

- 默认值：{}
- 类型：String[]
- 单位：-
- 是否可变：否
- 描述：系统将在启动时配置为 WARN 级别 logger 并路由到 warning appender (SysWF)（即 `fe.warn.log` 文件）的 logger 名称或包前缀的列表。条目会插入到生成的 Log4j 配置中（与内置的 warn 模块（如 org.apache.kafka、org.apache.hudi 和 org.apache.hadoop.io.compress）一起），并生成如下 logger 元素：`<Logger name="... " level="WARN"><AppenderRef ref="SysWF"/></Logger>`。建议使用完全限定的包和类前缀（例如，“com.example.lib”），以禁止将嘈杂的 INFO/DEBUG 输出到常规日志中，并允许单独捕获警告。
- 引入版本：v3.2.13
### 服务器
##### brpc_idle_wait_max_time

- 默认值：10000
- 类型：Int
- 单位：ms
- 是否可修改：否
- 描述：bRPC 客户端在空闲状态下的最长等待时间。
- 引入版本：-
##### brpc_inner_reuse_pool

- 默认值：true
- 类型：boolean
- 单位：-
- 是否可修改：否
- 描述：控制底层 BRPC 客户端是否使用内部共享重用池来管理连接/通道。StarRocks 在 BrpcProxy 中构造 RpcClientOptions 时读取 `brpc_inner_reuse_pool` (通过 `rpcOptions.setInnerResuePool(...)`)。启用后 (true)，RPC 客户端会重用内部池，以减少每次调用创建连接的开销，从而降低 FE 到 BE / LakeService RPC 的连接 churn、内存和文件描述符的使用量。禁用后 (false)，客户端可能会创建更隔离的池（以更高的资源使用量为代价来提高并发隔离）。更改此值需要重启进程才能生效。
- 引入版本：v3.3.11、v3.4.1、v3.5.0
##### brpc_min_evictable_idle_time_ms

- 默认值：120000
- 类型：Int
- 单位：毫秒
- 是否可修改：否
- 描述：空闲 BRPC 连接在连接池中必须保持的时间（以毫秒为单位），之后才有资格被驱逐。应用于 `BrpcProxy` 使用的 RpcClientOptions（通过 RpcClientOptions.setMinEvictableIdleTime）。提高此值可以更长时间地保持空闲连接（减少重新连接的 churn）；降低此值可以更快地释放未使用的套接字（减少资源使用）。与 `brpc_connection_pool_size` 和 `brpc_idle_wait_max_time` 一起调整，以平衡连接重用、连接池增长和驱逐行为。
- 引入版本：v3.3.11、v3.4.1、v3.5.0
##### brpc_reuse_addr

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：如果设置为 true，StarRocks 会设置套接字选项，以允许由 brpc RpcClient 创建的客户端套接字重用本地地址（通过 RpcClientOptions.setReuseAddress）。启用此选项可以减少绑定失败，并允许在套接字关闭后更快地重新绑定本地端口，这对于高频率连接或快速重启非常有用。如果设置为 false，则禁用地址/端口重用，这可以减少意外端口共享的可能性，但可能会增加瞬时绑定错误。此选项与 `brpc_connection_pool_size` 和 `brpc_short_connection` 配置的连接行为相互影响，因为它会影响客户端套接字重新绑定和重用的速度。
- 引入版本：v3.3.11、v3.4.1、v3.5.0
##### cluster_name

- 默认值：StarRocks Cluster
- 类型：String
- 单位：-
- 是否可变：否
- 描述：FE 所属的 StarRocks 集群的名称。集群名称显示在网页上的 `Title` 中。
- 引入版本：-
##### dns_cache_ttl_seconds

- 默认值：60
- 类型：Int
- 单位：秒
- 是否可修改：否
- 描述：成功 DNS 查找的 DNS 缓存 TTL（生存时间），以秒为单位。 这将设置 Java 安全属性 `networkaddress.cache.ttl`，该属性控制 JVM 缓存成功 DNS 查找的时间。 将此项设置为 `-1` 以允许系统始终缓存信息，或设置为 `0` 以禁用缓存。 这在 IP 地址频繁更改的环境中特别有用，例如 Kubernetes 部署或使用动态 DNS 时。
- 引入版本：v3.5.11，v4.0.4
##### enable_http_async_handler

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否允许系统异步处理 HTTP 请求。如果启用此功能，Netty worker 线程收到的 HTTP 请求将提交到单独的线程池，以进行服务逻辑处理，从而避免阻塞 HTTP 服务器。如果禁用，Netty worker 将处理服务逻辑。
- 引入版本：4.0.0
##### enable_http_validate_headers

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：控制 Netty 的 HttpServerCodec 是否执行严格的 HTTP 头部验证。该值在 `HttpServer` 中初始化 HTTP pipeline 时传递给 HttpServerCodec（参见 UseLocations）。为了向后兼容，默认值为 false，因为较新的 netty 版本强制执行更严格的头部规则 (https://github.com/netty/netty/pull/12760) 。设置为 true 以强制执行符合 RFC 标准的头部检查；这样做可能会导致来自旧客户端或代理的格式错误或不符合规范的请求被拒绝。更改需要重启 HTTP 服务器才能生效。
- 引入版本：v3.3.0, v3.4.0, v3.5.0
##### enable_https

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：是否在 FE 节点中启用 HTTPS 服务，与 HTTP 服务并行。
- 引入版本：v4.0
##### frontend_address

- 默认值：0.0.0.0
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：FE节点的 IP 地址。
- 引入版本：-
##### http_async_threads_num

- 默认值: 4096
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于异步 HTTP 请求处理的线程池大小。别名为 `max_http_sql_service_task_threads_num`。
- 引入版本: 4.0.0
##### http_backlog_num

- 默认值：1024
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中 HTTP 服务器所持有的 backlog 队列的长度。
- 引入版本：-
##### http_max_chunk_size

- 默认值: 8192
- 类型: Int
- 单位: Bytes
- 是否可修改: 否
- 描述: 设置 FE HTTP 服务器中 Netty 的 HttpServerCodec 处理的单个 HTTP chunk 允许的最大大小（以字节为单位）。它作为第三个参数传递给 HttpServerCodec，并限制分块传输或流式请求/响应期间的 chunk 长度。如果传入的 chunk 超过此值，Netty 将引发 frame-too-large 错误（例如，TooLongFrameException），并且请求可能会被拒绝。增加此值以允许合法的较大分块上传；保持较小的值可以减少内存压力和 DoS 攻击的攻击面。此设置与 `http_max_initial_line_length`、`http_max_header_size` 和 `enable_http_validate_headers` 一起使用。
- 引入版本: v3.2.0
##### http_max_header_size

- 默认值: 32768
- 类型: Int
- 单位: Bytes
- 是否可变: 否
- 描述: Netty 的 `HttpServerCodec` 解析的 HTTP 请求头块允许的最大大小（以字节为单位）。StarRocks 将此值传递给 `HttpServerCodec`（作为 `Config.http_max_header_size`）；如果传入请求的标头（名称和值组合）超过此限制，则编解码器将拒绝该请求（解码器异常），并且连接/请求将失败。仅当客户端合法地发送非常大的标头（大型 Cookie 或许多自定义标头）时才增加；较大的值会增加每个连接的内存使用量。与 `http_max_initial_line_length` 和 `http_max_chunk_size` 结合调整。更改需要重启 FE。
- 引入版本: v3.2.0
##### http_max_initial_line_length

- 默认值：4096
- 类型：Int
- 单位：Bytes
- 是否可变：否
- 描述：设置 Netty `HttpServerCodec` 接受的 HTTP 初始请求行（方法 + 请求目标 + HTTP 版本）的最大允许长度（以字节为单位），该 `HttpServerCodec` 用于 HttpServer 中。该值会传递给 Netty 的解码器，并且初始行长度大于此值的请求将被拒绝 (TooLongFrameException)。仅当您必须支持非常长的请求 URI 时才增加此值；较大的值会增加内存使用量，并可能增加暴露于格式错误/请求滥用的风险。与 `http_max_header_size` 和 `http_max_chunk_size` 一起调整。
- 引入版本：v3.2.0
##### http_port

- 默认值：8030
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中的 HTTP 服务器监听的端口。
- 引入版本：-
##### http_web_page_display_hardware

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：如果设置为 true，HTTP 索引页面（/index）会包含一个硬件信息部分，该部分通过 oshi 库（CPU、内存、进程、磁盘、文件系统、网络等）填充。oshi 可能会间接调用系统实用程序或读取系统文件（例如，它可以执行 `getent passwd` 等命令），这可能会暴露敏感的系统数据。如果您需要更严格的安全性，或者想要避免在主机上执行这些间接命令，请将此配置设置为 false，以禁用在 Web UI 上收集和显示硬件详细信息。
- 引入版本：v3.2.0
##### http_worker_threads_num

- 默认值：0
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：http server 用于处理 http 请求的工作线程数。如果值为负数或 0，线程数将是 CPU 核心数的两倍。
- 引入版本：v2.5.18, v3.0.10, v3.1.7, v3.2.2
##### https_port

- 默认值：8443
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点上的 HTTPS 服务器监听的端口。
- 引入版本：v4.0
##### max_mysql_service_task_threads_num

- 默认值：4096
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中的 MySQL 服务器可运行的用于处理任务的最大线程数。
- 引入版本：-
##### max_task_runs_threads_num

- 默认值：512
- 类型：Int
- 单位：线程
- 是否可修改：否
- 描述：控制 task-run 执行器线程池中的最大线程数。此值为并发 task-run 执行的上限；增加此值会提高并行度，但也会增加 CPU、内存和网络使用率，而减少此值可能会导致 task-run 积压和更高的延迟。根据预期的并发调度作业和可用的系统资源调整此值。
- 引入版本：v3.2.0
##### memory_tracker_enable

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：启用 FE 内存跟踪器子系统。当 `memory_tracker_enable` 设置为 `true` 时，`MemoryUsageTracker` 会定期扫描已注册的元数据模块，更新内存中的 `MemoryUsageTracker.MEMORY_USAGE` 映射，记录总数，并使 `MetricRepo` 在指标输出中公开内存使用情况和对象计数指标。使用 `memory_tracker_interval_seconds` 控制采样间隔。启用此功能有助于监控和调试内存消耗，但会引入 CPU 和 I/O 开销以及额外的指标基数。
- 引入版本：v3.2.4
##### memory_tracker_interval_seconds

- 默认值：60
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：FE `MemoryUsageTracker` 后台进程轮询并记录 FE 进程和已注册 `MemoryTrackable` 模块的内存使用情况的间隔（以秒为单位）。当 `memory_tracker_enable` 设置为 `true` 时，跟踪器会按照此频率运行，更新 `MEMORY_USAGE`，并记录聚合的 JVM 和被跟踪模块的使用情况。
- 引入版本：v3.2.4
##### mysql_nio_backlog_num

- 默认值：1024
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中 MySQL 服务器所持有的 backlog 队列的长度。
- 引入版本：-
##### mysql_server_version

- 默认值: 8.0.33
- 类型: String
- 单位: -
- 是否可修改: 是
- 描述: 返回给客户端的 MySQL 服务器版本。修改此参数会影响以下情况中的版本信息：
  1. `select version();`
  2. 握手数据包版本
  3. 全局变量 `version` 的值 (`show variables like 'version';`)
- 引入版本: -
##### mysql_service_io_threads_num

- 默认值：4
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点上的 MySQL 服务器可运行的用于处理 I/O 事件的最大线程数。
- 引入版本：-
##### mysql_service_kill_after_disconnect

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：控制当检测到 MySQL TCP 连接关闭（读取时遇到 EOF）时，服务器如何处理会话。如果设置为 `true`，服务器会立即终止该连接上任何正在运行的查询，并立即执行清理。如果设置为 `false`，服务器在断开连接时不会终止正在运行的查询，并且仅在没有挂起的请求任务时才执行清理，从而允许长时间运行的查询在客户端断开连接后继续运行。注意：尽管有一个简短的注释建议使用 TCP keep-alive，但此参数专门控制断开连接后的终止行为，应根据您是否希望终止孤立查询（建议在不可靠/负载均衡的客户端后面）或允许其完成来设置。
- 引入版本：-
##### mysql_service_nio_enable_keep_alive

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：为 MySQL 连接启用 TCP Keep-Alive。这对于负载均衡器后面的长时间空闲连接非常有用。
- 引入版本：-
##### net_use_ipv6_when_priority_networks_empty

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：一个布尔值，用于控制在未指定 `priority_networks` 时是否优先使用 IPv6 地址。`true` 表示当托管节点的服务器同时具有 IPv4 和 IPv6 地址，且未指定 `priority_networks` 时，允许系统优先使用 IPv6 地址。
- 引入版本：v3.3.0
##### priority_networks

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可变：否
- 描述：声明具有多个 IP 地址的服务器的选择策略。 请注意，最多只能有一个 IP 地址与此参数指定的列表匹配。 此参数的值是一个列表，其中包含以分号 (;) 分隔的条目，以 CIDR 表示法表示，例如 10.10.10.0/24。 如果没有 IP 地址与此列表中的条目匹配，则将随机选择服务器的可用 IP 地址。 从 v3.3.0 开始，StarRocks 支持基于 IPv6 的部署。 如果服务器同时具有 IPv4 和 IPv6 地址，并且未指定此参数，则系统默认使用 IPv4 地址。 您可以通过将 `net_use_ipv6_when_priority_networks_empty` 设置为 `true` 来更改此行为。
- 引入版本：-
##### proc_profile_cpu_enable

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：当此项设置为 `true` 时，后台 `ProcProfileCollector` 将使用 `AsyncProfiler` 收集 CPU profile，并在 `sys_log_dir/proc_profile` 下写入 HTML 报告。每次收集运行时，会根据 `proc_profile_collect_time_s` 配置的时长记录 CPU 堆栈，并使用 `proc_profile_jstack_depth` 获取 Java 堆栈深度。生成的 profile 会被压缩，旧文件会根据 `proc_profile_file_retained_days` 和 `proc_profile_file_retained_size_bytes` 进行清理。`AsyncProfiler` 需要 native library (`libasyncProfiler.so`)；`one.profiler.extractPath` 设置为 `STARROCKS_HOME_DIR/bin`，以避免 `/tmp` 上的 noexec 问题。
- 引入版本：v3.2.12
##### qe_max_connection

- 默认值：4096
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：所有用户可以与 FE 节点建立的最大连接数。从 v3.1.12 和 v3.2.7 版本开始，默认值已从 `1024` 更改为 `4096`。
- 引入版本：-
##### query_port

- 默认值：9030
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中 MySQL 服务器监听的端口。
- 引入版本：-
##### rpc_port

- 默认值：9020
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中 Thrift 服务器监听的端口。
- 引入版本：-
##### slow_lock_stack_trace_reserve_levels

- 默认值：15
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：控制当 StarRocks 为慢锁或持有锁转储锁调试信息时，捕获和发出的堆栈跟踪帧的数量。此值由 `QueryableReentrantReadWriteLock` 传递给 `LogUtil.getStackTraceToJsonArray`，用于为独占锁所有者、当前线程和最旧/共享的读取器生成 JSON。增加此值可以为诊断慢锁或死锁问题提供更多上下文，但代价是更大的 JSON 有效负载以及堆栈捕获的 CPU/内存略高；减少它可以降低开销。注意：当仅记录慢锁时，可以通过 `slow_lock_threshold_ms` 过滤读取器条目。
- 引入版本：v3.4.0, v3.5.0
##### ssl_cipher_blacklist

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可变：否
- 描述：以逗号分隔的列表，支持正则表达式，用于通过 IANA 名称将 ssl 密码套件列入黑名单。如果同时设置了白名单和黑名单，则黑名单优先。
- 引入版本：v4.0
##### ssl_cipher_whitelist

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：以逗号分隔的列表，支持正则表达式，用于通过 IANA 名称将 ssl 密码套件列入白名单。如果同时设置了白名单和黑名单，则黑名单优先。
- 引入版本：v4.0
##### task_runs_concurrency

- 默认值: 4
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 并发运行的 TaskRun 实例的全局限制。当当前运行计数大于或等于 `task_runs_concurrency` 时，`TaskRunScheduler` 会停止调度新的运行，因此该值限制了调度器之间的并行 TaskRun 执行。`MVPCTRefreshPartitioner` 也会使用它来计算每个 TaskRun 的分区刷新粒度。增加该值会提高并行度和资源使用率；降低该值会降低并发性，并使每次运行的分区刷新更大。除非有意禁用调度，否则不要设置为 0 或负数：0（或负数）将有效地阻止 `TaskRunScheduler` 调度新的 TaskRuns。
- 引入版本: v3.2.0
##### task_runs_queue_length

- 默认值：500
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：限制挂起队列中保存的待处理 TaskRun 项的最大数量。当有效的待处理 TaskRun 计数大于或等于 `task_runs_queue_length` 时，`TaskRunManager` 会检查当前的待处理计数并拒绝新的提交。在添加合并/接受的 TaskRun 之前，会重新检查相同的限制。调整此值以平衡内存和调度积压：对于大型突发工作负载，设置较高的值以避免拒绝，或者设置较低的值以限制内存并减少待处理积压。
- 引入版本：v3.2.0
##### thrift_backlog_num

- 默认值：1024
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：FE 节点中 Thrift 服务器所持有的 backlog 队列的长度。
- 引入版本：-
##### thrift_client_timeout_ms

- 默认值：5000
- 类型：Int
- 单位：毫秒
- 是否可变：否
- 描述：空闲客户端连接超时的时间长度。
- 引入版本：-
##### thrift_rpc_max_body_size

- 默认值：-1
- 类型：Int
- 单位：Bytes
- 是否可修改：否
- 描述：控制构造服务器的 Thrift 协议时允许的最大 Thrift RPC 消息体大小（以字节为单位）（在 `ThriftServer` 中传递给 TBinaryProtocol.Factory）。值为 `-1` 时禁用限制（无限制）。设置一个正值会强制执行上限，以便 Thrift 层拒绝大于此值的消息，这有助于限制内存使用并降低超大请求或 DoS 风险。将其设置为足够大的大小以适应预期的 payload（大型结构体或批量数据），以避免拒绝合法的请求。
- 引入版本：v3.2.0
##### thrift_server_max_worker_threads

- 默认值: 4096
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: FE 节点中 Thrift 服务器支持的最大工作线程数。
- 引入版本: -
##### thrift_server_queue_size

- 默认值：4096
- 类型：Int
- 单位：-
- 是否可变：否
- 描述：请求等待队列的长度。如果 thrift server 中正在处理的线程数超过 `thrift_server_max_worker_threads` 中指定的值，则新请求会添加到等待队列中。
- 引入版本：-
### 元数据和集群管理
##### alter_max_worker_queue_size

- 默认值：4096
- 类型：Int
- 单位：Tasks
- 是否可变：否
- 描述：控制 alter 子系统使用的内部工作线程池队列的容量。它与 `alter_max_worker_threads` 一起传递给 `AlterHandler` 中的 `ThreadPoolManager.newDaemonCacheThreadPool`。当待处理的 alter 任务数超过 `alter_max_worker_queue_size` 时，新的提交将被拒绝，并且可能会抛出 `RejectedExecutionException`（请参阅 `AlterHandler.handleFinishAlterTask`）。调整此值以平衡内存使用量和允许并发 alter 任务的积压量。
- 引入版本：v3.2.0
##### alter_max_worker_threads

- 默认值：4
- 类型：Int
- 单位：线程
- 是否可修改：否
- 描述：设置 AlterHandler 线程池中的最大工作线程数。AlterHandler 使用此值构造执行器，以运行和完成与 alter 相关的任务（例如，通过 handleFinishAlterTask 提交 `AlterReplicaTask`）。此值限制了 alter 操作的并发执行；增加此值会提高并行度和资源使用率，降低此值会限制并发 alter 操作，并可能成为瓶颈。执行器与 `alter_max_worker_queue_size` 一起创建，并且处理程序调度使用 `alter_scheduler_interval_millisecond`。
- 引入版本：v3.2.0
##### automated_cluster_snapshot_interval_seconds

- 默认值：600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：触发自动集群快照任务的间隔。
- 引入版本：v3.4.2
##### background_refresh_metadata_interval_millis

- 默认值：600000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：两次连续的 Hive 元数据缓存刷新之间的间隔。
- 引入版本：v2.5.5
##### background_refresh_metadata_time_secs_since_last_access_secs

- 默认值：3600 * 24
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：Hive 元数据缓存刷新任务的过期时间。对于已访问的 Hive catalog，如果超过指定时间未被访问，StarRocks 将停止刷新其缓存的元数据。对于未访问的 Hive catalog，StarRocks 将不会刷新其缓存的元数据。
- 引入版本：v2.5.5
##### bdbje_cleaner_threads

- 默认值：1
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：用于 StarRocks 日志的 Berkeley DB Java Edition (JE) 环境的后台清理线程数。此值在 `BDBEnvironment.initConfigs` 中的环境初始化期间读取，并使用 `Config.bdbje_cleaner_threads` 应用于 `EnvironmentConfig.CLEANER_THREADS`。它控制 JE 日志清理和空间回收的并行度；增加它可以加快清理速度，但会增加 CPU 和 I/O 对前台操作的干扰。更改仅在 BDB 环境（重新）初始化时生效，因此需要重启前端才能应用新值。
- 引入版本：v3.2.0
##### bdbje_heartbeat_timeout_second

- 默认值: 30
- 类型: Int
- 单位: 秒
- 是否可修改: 否
- 描述: StarRocks 集群中 leader、follower 和 observer FE 之间心跳超时的时间。
- 引入版本: -
##### bdbje_lock_timeout_second

- 默认值：1
- 类型：Int
- 单位：秒
- 是否可修改：否
- 描述：基于 BDB JE 的 FE 中锁的超时时间。
- 引入版本：-
##### bdbje_replay_cost_percent

- 默认值：150
- 类型：Int
- 单位：百分比
- 是否可变：否
- 描述：设置从 BDB JE 日志重放事务的相对成本（以百分比表示），与通过网络恢复获取相同数据相比。该值提供给底层 JE 复制参数 REPLAY_COST_PERCENT，通常 >100，表示重放通常比网络恢复更昂贵。在决定是否保留已清理的日志文件以进行潜在的重放时，系统会将重放成本乘以日志大小与网络恢复的成本进行比较；如果判断网络恢复更有效，则将删除文件。值为 0 将禁用基于此成本比较的保留。`REP_STREAM_TIMEOUT` 内的副本或任何活动复制所需的日志文件始终保留。
- 引入版本：v3.2.0
##### bdbje_replica_ack_timeout_second

- 默认值：10
- 类型：Int
- 单位：秒
- 是否可修改：否
- 描述：当元数据从 leader FE 写入到 follower FE 时，leader FE 等待来自指定数量的 follower FE 的 ACK 消息的最长时间。单位：秒。如果写入大量元数据，则 follower FE 需要很长时间才能将 ACK 消息返回给 leader FE，从而导致 ACK 超时。在这种情况下，元数据写入失败，并且 FE 进程退出。我们建议您增加此参数的值以防止出现这种情况。
- 引入版本：-
##### bdbje_reserved_disk_size

- 默认值：512 * 1024 * 1024 (536870912)
- 类型：Long
- 单位：Bytes
- 是否可变：否
- 描述：限制 Berkeley DB JE 将保留为“未保护”（可删除）的日志/数据文件的字节数。StarRocks 通过 `EnvironmentConfig.RESERVED_DISK` 在 BDBEnvironment 中将此值传递给 JE；JE 的内置默认值为 0（无限制）。StarRocks 默认值 (512 MiB) 可防止 JE 为未保护的文件保留过多的磁盘空间，同时允许安全清理过时的文件。在磁盘受限的系统上调整此值：减小它可以让 JE 更快地释放更多文件，增加它可以让 JE 保留更多保留空间。更改需要重新启动进程才能生效。
- 引入版本：v3.2.0
##### bdbje_reset_election_group

- 默认值：false
- 类型：String
- 单位：-
- 是否可变：否
- 描述：是否重置 BDBJE 复制组。如果此参数设置为 `TRUE`，FE 将重置 BDBJE 复制组（即删除所有可选举 FE 节点的信息）并作为 leader FE 启动。重置后，此 FE 将是集群中唯一的成员，其他 FE 可以使用 `ALTER SYSTEM ADD/DROP FOLLOWER/OBSERVER 'xxx'` 重新加入此集群。仅当由于大多数 follower FE 的数据已损坏而无法选举出 leader FE 时，才使用此设置。`reset_election_group` 用于替换 `metadata_failure_recovery`。
- 引入版本：-
##### black_host_connect_failures_within_time

- 默认值：5
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：黑名单 BE 节点允许的连接失败阈值。如果一个 BE 节点被自动添加到 BE 黑名单，StarRocks 将评估其连接性，并判断是否可以从 BE 黑名单中移除。在 `black_host_history_sec` 内，只有当黑名单 BE 节点的连接失败次数少于 `black_host_connect_failures_within_time` 中设置的阈值时，才能从 BE 黑名单中移除。
- 引入版本：v3.3.0
##### black_host_history_sec

- 默认值：2 * 60
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：BE 黑名单中保留 BE 节点历史连接失败的时间。如果一个 BE 节点被自动添加到 BE 黑名单中，StarRocks 会评估它的连接性，并判断它是否可以从 BE 黑名单中移除。在 `black_host_history_sec` 内，只有当黑名单中的 BE 节点的连接失败次数少于 `black_host_connect_failures_within_time` 中设置的阈值时，它才能从 BE 黑名单中移除。
- 引入版本：v3.3.0
##### brpc_connection_pool_size

- 默认值：16
- 类型：Int
- 单位：连接数
- 是否可修改：否
- 描述：FE 的 BrpcProxy 使用的每个端点的最大 BRPC 连接池大小。此值通过 `setMaxTotoal` 和 `setMaxIdleSize` 应用于 RpcClientOptions，因此它直接限制了并发的传出 BRPC 请求，因为每个请求都必须从连接池中借用一个连接。在高并发场景中，增加此值可以避免请求排队；增加此值会增加套接字和内存使用量，并可能增加远程服务器的负载。在进行调优时，请考虑相关的设置，如 `brpc_idle_wait_max_time`、`brpc_short_connection`、`brpc_inner_reuse_pool`、`brpc_reuse_addr` 和 `brpc_min_evictable_idle_time_ms`。更改此值不支持热加载，需要重启。
- 引入版本：v3.2.0
##### brpc_short_connection

- 默认值：false
- 类型：boolean
- 单位：-
- 是否可修改：否
- 描述：控制底层的 brpc RpcClient 是否使用短连接。启用时（`true`），将设置 RpcClientOptions.setShortConnection，并且连接在请求完成后关闭，从而减少长连接 socket 的数量，但会增加连接建立的开销和延迟。禁用时（`false`，默认值），将使用持久连接和连接池。启用此选项会影响连接池的行为，应与 `brpc_connection_pool_size`、`brpc_idle_wait_max_time`、`brpc_min_evictable_idle_time_ms`、`brpc_reuse_addr` 和 `brpc_inner_reuse_pool` 一起考虑。对于典型的高吞吐量部署，请保持禁用状态；仅在需要限制 socket 生存期或网络策略要求短连接时才启用。
- 引入版本：v3.3.11、v3.4.1、v3.5.0
##### catalog_try_lock_timeout_ms

- 默认值：5000
- 类型：Long
- 单位：毫秒
- 是否可修改：是
- 描述：获取全局锁的超时时长。
- 引入版本：-
##### checkpoint_only_on_leader

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：当设置为 `true` 时，CheckpointController 将仅选择 Leader FE 作为 checkpoint worker；当设置为 `false` 时，controller 可能会选择任何前端节点，并优先选择堆使用率较低的节点。如果设置为 `false`，worker 将按最近失败时间和 `heapUsedPercent` 排序（Leader 被视为具有无限使用率，以避免选择它）。对于需要集群快照元数据的操作，无论此标志如何设置，controller 都会强制选择 Leader。启用 `true` 会将 checkpoint 工作集中在 Leader 上（更简单，但会增加 Leader 的 CPU/内存和网络负载）；保持 `false` 会将 checkpoint 负载分配给负载较低的 FE。此设置会影响 worker 的选择以及与超时（如 `checkpoint_timeout_seconds`）和 RPC 设置（如 `thrift_rpc_timeout_ms`）的交互。
- 引入版本：v3.4.0, v3.5.0
##### checkpoint_timeout_seconds

- 默认值：24 * 3600
- 类型：Long
- 单位：秒
- 是否可变：是
- 描述： Leader 的 CheckpointController 等待 checkpoint worker 完成 checkpoint 的最长时间（以秒为单位）。该 controller 将此值转换为纳秒并轮询 worker 结果队列；如果在超时时间内未收到成功完成的消息，则会将 checkpoint 视为失败，并且 createImage 返回失败。增加此值可以适应运行时间较长的 checkpoint，但会延迟故障检测和后续镜像传播；减少此值会导致更快的故障转移/重试，但可能会为速度较慢的 worker 产生错误的超时。此设置仅控制 checkpoint 创建期间 `CheckpointController` 中的等待时间，不会更改 worker 的内部 checkpoint 行为。
- 引入版本：v3.4.0，v3.5.0
##### db_used_data_quota_update_interval_secs

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：数据库已使用数据配额的更新间隔。 StarRocks 会定期更新所有数据库的已使用数据配额，以跟踪存储消耗。此值用于配额执行和指标收集。允许的最小间隔为 30 秒，以防止过度的系统负载。小于 30 的值将被拒绝。
- 引入版本：-
##### drop_backend_after_decommission

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否在 BE 节点下线后删除该 BE 节点。`TRUE` 表示 BE 节点下线后立即删除该 BE 节点。`FALSE` 表示 BE 节点下线后不删除该 BE 节点。
- 引入版本：-
##### edit_log_port

- 默认值：9010
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：集群中 Leader FE、Follower FE 和 Observer FE 之间用于通信的端口。
- 引入版本：-
##### edit_log_roll_num

- 默认值：50000
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：在为元数据日志条目创建日志文件之前，可以写入的最大元数据日志条目数。此参数用于控制日志文件的大小。新的日志文件将被写入 BDBJE 数据库。
- 引入版本：-
##### edit_log_type

- 默认值：BDB
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：可以生成的编辑日志的类型。将该值设置为 `BDB`。
- 引入版本：-
##### enable_background_refresh_connector_metadata

- 默认值：v3.0 及更高版本中为 true，v2.5 中为 false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否启用定期 Hive 元数据缓存刷新。启用后，StarRocks 会轮询 Hive 集群的 Metastore（Hive Metastore 或 AWS Glue），并刷新频繁访问的 Hive catalog 的缓存元数据，以感知数据变化。`true` 表示启用 Hive 元数据缓存刷新，`false` 表示禁用它。
- 引入版本：v2.5.5
##### enable_collect_query_detail_info

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否收集查询的 profile 信息。如果设置为 `TRUE`，系统会收集查询的 profile 信息。如果设置为 `FALSE`，系统不会收集查询的 profile 信息。
- 引入版本：-
##### enable_create_partial_partition_in_batch

- 默认值：false
- 类型：boolean
- 单位：-
- 是否可变：是
- 描述：当此项设置为 `false` (默认) 时，StarRocks 强制批量创建的 Range 分区与标准时间单位边界对齐。它将拒绝未对齐的范围，以避免创建空洞。将此项设置为 `true` 会禁用该对齐检查，并允许批量创建部分（非标准）分区，这可能会产生间隙或未对齐的分区范围。只有当您有意需要部分批量分区并接受相关的风险时，才应将其设置为 `true`。
- 引入版本：v3.2.0
##### enable_internal_sql

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：当此项设置为 `true` 时，由内部组件（例如 SimpleExecutor）执行的内部 SQL 语句将被保留并写入内部审计或日志消息中（如果设置了 `enable_sql_desensitize_in_log`，则可以进一步进行脱敏）。当设置为 `false` 时，内部 SQL 文本将被禁止：格式化代码 (SimpleExecutor.formatSQL) 返回 "?"，并且实际语句不会发送到内部审计或日志消息。此配置不会更改内部语句的执行语义，它仅控制内部 SQL 的日志记录和可见性，以保护隐私或安全。
- 引入版本：-
##### enable_legacy_compatibility_for_replication

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否开启复制的旧版兼容模式。由于 StarRocks 在新旧版本之间的行为可能存在差异，这可能导致跨集群数据迁移期间出现问题。因此，在数据迁移之前，您必须为目标集群启用旧版兼容模式，并在数据迁移完成后禁用它。`true` 表示启用此模式。
- 引入版本：v3.1.10, v3.2.6
##### enable_show_materialized_views_include_all_task_runs

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：控制如何将 TaskRun 返回到 SHOW MATERIALIZED VIEWS 命令。如果此项设置为 `false`，StarRocks 仅返回每个任务的最新 TaskRun（为了兼容性的传统行为）。如果设置为 `true`（默认值），则 `TaskManager` 可能会包含同一任务的其他 TaskRun，前提是它们共享相同的起始 TaskRun ID（例如，属于同一作业），从而防止不相关的重复运行出现，同时允许显示与一个作业相关的多个状态，以进行调试和监控。将此项设置为 `false` 可恢复单次运行输出，或显示多运行作业历史记录以进行调试和监控。
- 引入版本：v3.3.0, v3.4.0, v3.5.0
##### enable_statistics_collect_profile

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否为统计信息查询生成 profile。您可以将此项设置为 `true` ，以允许 StarRocks 为系统统计信息的查询生成 query profile。
- 引入版本：v3.1.5
##### enable_table_name_case_insensitive

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：否
- 描述：是否对 catalog 名称、数据库名称、表名称、视图名称和物化视图名称启用不区分大小写的处理。目前，默认情况下表名是区分大小写的。
  - 启用此功能后，所有相关名称将以小写形式存储，并且所有包含这些名称的 SQL 命令将自动将其转换为小写。
  - 只能在创建集群时启用此功能。**集群启动后，无法通过任何方式修改此配置的值**。任何修改它的尝试都将导致错误。当 FE 检测到此配置项的值与首次启动集群时的值不一致时，FE 将无法启动。
  - 目前，此功能不支持 JDBC catalog 和表名。如果要对 JDBC 或 ODBC 数据源执行不区分大小写的处理，请勿启用此功能。
- 引入版本：v4.0
##### enable_task_history_archive

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：启用后，已完成的任务运行记录将归档到持久性任务运行历史记录表中，并记录到编辑日志中，以便查找（例如，`lookupHistory`、`lookupHistoryByTaskNames`、`lookupLastJobOfTasks`）包括已归档的结果。归档由 FE 的 Leader 执行，并在单元测试期间跳过（`FeConstants.runningUnitTest`）。启用后，将绕过内存中的过期和强制 GC 路径（代码从 `removeExpiredRuns` 和 `forceGC` 提前返回），因此保留/删除由持久性归档处理，而不是由 `task_runs_ttl_second` 和 `task_runs_max_history_number` 处理。禁用后，历史记录保留在内存中，并由这些配置进行清理。
- 引入版本：v3.3.1, v3.4.0, v3.5.0
##### enable_task_run_fe_evaluation

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：启用后，FE 将对 `TaskRunsSystemTable.supportFeEvaluation` 中的系统表 `task_runs` 执行本地评估。FE 端评估仅允许将列与常量进行比较的合取相等谓词，并且仅限于 `QUERY_ID` 和 `TASK_NAME` 列。启用此功能可以通过避免更广泛的扫描或其他远程处理来提高目标查找的性能；禁用它会强制 planner 跳过 `task_runs` 的 FE 评估，这可能会减少谓词裁剪并影响这些过滤器的查询延迟。
- 引入版本：v3.3.13、v3.4.3、v3.5.0
##### heartbeat_mgr_blocking_queue_size

- 默认值：1024
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：用于存储 Heartbeat Manager 运行的心跳任务的阻塞队列的大小。
- 引入版本：-
##### heartbeat_mgr_threads_num

- 默认值：8
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：Heartbeat Manager 运行 heartbeat 任务的线程数。
- 引入版本：-
##### ignore_materialized_view_error

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：FE 是否忽略由物化视图错误导致的元数据异常。如果 FE 因为物化视图错误导致的元数据异常而启动失败，您可以将此参数设置为 `true`，以允许 FE 忽略该异常。
- 引入版本：v2.5.10
##### ignore_meta_check

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：用于设置非 Leader FE 是否忽略与 Leader FE 之间的元数据差异。如果设置为 TRUE，则非 Leader FE 会忽略与 Leader FE 之间的元数据差异，并继续提供数据读取服务。即使您长时间停止 Leader FE，此参数也能确保持续的数据读取服务。如果设置为 FALSE，则非 Leader FE 不会忽略与 Leader FE 之间的元数据差异，并停止提供数据读取服务。
- 引入版本：-
##### ignore_task_run_history_replay_error

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：当 StarRocks 反序列化 `information_schema.task_runs` 的 TaskRun 历史行时，损坏或无效的 JSON 行通常会导致反序列化记录警告并抛出 RuntimeException。如果此项设置为 `true`，系统将捕获反序列化错误，跳过格式错误的记录，并继续处理剩余的行，而不是使查询失败。这将使 `information_schema.task_runs` 查询能够容忍 `_statistics_.task_run_history` 表中的错误条目。请注意，启用它会以静默方式删除损坏的历史记录（潜在的数据丢失），而不是显示明确的错误。
- 引入版本：v3.3.3, v3.4.0, v3.5.0
##### lock_checker_interval_second

- 默认值：30
- 类型：long
- 单位：秒
- 是否可变：是
- 描述：LockChecker 前端守护进程（命名为 "deadlock-checker"）执行之间的间隔，以秒为单位。该守护进程执行死锁检测和慢锁扫描；配置的值乘以 1000 以设置计时器，单位为毫秒。减小此值会降低检测延迟，但会增加调度和 CPU 开销；增加此值会降低开销，但会延迟检测和慢锁报告。更改会在运行时生效，因为守护进程每次运行时都会重置其间隔。此设置与 `lock_checker_enable_deadlock_check` （启用死锁检查）和 `slow_lock_threshold_ms` （定义什么构成慢锁）交互。
- 引入版本：v3.2.0
##### master_sync_policy

- 默认值：SYNC
- 类型：String
- 单位：-
- 是否可修改：否
- 描述： Leader FE将日志刷新到磁盘所基于的策略。此参数仅在当前FE为Leader FE时有效。有效值：
  - `SYNC`：当事务提交时，会同时生成一个日志条目并刷新到磁盘。
  - `NO_SYNC`：当事务提交时，日志条目的生成和刷新不会同时发生。
  - `WRITE_NO_SYNC`：当事务提交时，会同时生成一个日志条目，但不会刷新到磁盘。

  如果您只部署了一个Follower FE，我们建议您将此参数设置为`SYNC`。如果您部署了三个或更多个Follower FE，我们建议您将此参数和`replica_sync_policy`都设置为`WRITE_NO_SYNC`。

- 引入版本：-
##### max_bdbje_clock_delta_ms

- 默认值：5000
- 类型：Long
- 单位：毫秒
- 是否可修改：否
- 描述：在 StarRocks 集群中，leader FE 与 follower 或 observer FE 之间允许的最大时钟偏移量。
- 引入版本：-
##### meta_delay_toleration_second

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：follower FE 和 observer FE 上的元数据落后于 leader FE 上的元数据的最大时长。单位：秒。如果超过此时长，则非 leader FE 将停止提供服务。
- 引入版本：-
##### meta_dir

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/meta"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：存储元数据的目录。
- 引入版本：-
##### metadata_ignore_unknown_operation_type

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否忽略未知的日志 ID。当 FE 回滚时，早期版本的 FE 可能无法识别某些日志 ID。如果值为 `TRUE`，则 FE 会忽略未知的日志 ID。如果值为 `FALSE`，则 FE 会退出。
- 引入版本：-
##### profile_info_format

- 默认值: default
- 类型: String
- 单位: -
- 是否可变: 是
- 描述: 系统输出的 Profile 的格式。有效值：`default` 和 `json`。设置为 `default` 时，Profile 为默认格式。设置为 `json` 时，系统以 JSON 格式输出 Profile。
- 引入版本: v2.5
##### replica_ack_policy

- 默认值：SIMPLE_MAJORITY
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：用于确定日志条目是否有效的策略。默认值 `SIMPLE_MAJORITY` 指定，如果大多数 follower FE 返回 ACK 消息，则认为日志条目有效。
- 引入版本：-
##### replica_sync_policy

- 默认值：SYNC
- 类型：String
- 单位：-
- 是否可变：否
- 描述：follower FE 将日志刷新到磁盘所基于的策略。此参数仅在当前 FE 为 follower FE 时有效。有效值：
  - `SYNC`：提交事务时，会生成一个日志条目并同时刷新到磁盘。
  - `NO_SYNC`：提交事务时，日志条目的生成和刷新不会同时发生。
  - `WRITE_NO_SYNC`：提交事务时，会同时生成一个日志条目，但不会刷新到磁盘。
- 引入版本：-
##### start_with_incomplete_meta

- 默认值：false
- 类型：boolean
- 单位：-
- 是否可变：否
- 描述：如果为 true，则当镜像数据存在但 Berkeley DB JE (BDB) 日志文件丢失或损坏时，FE 将允许启动。`MetaHelper.checkMetaDir()` 使用此标志来绕过安全检查，否则会阻止从没有相应 BDB 日志的镜像启动；以这种方式启动可能会产生过时或不一致的元数据，仅应用于紧急恢复。`RestoreClusterSnapshotMgr` 在恢复集群快照时暂时将此标志设置为 true，然后将其回滚；该组件还在恢复期间切换 `bdbje_reset_election_group`。请勿在正常操作中启用，仅在从损坏的 BDB 数据恢复或显式恢复基于镜像的快照时启用。
- 引入版本：v3.2.0
##### table_keeper_interval_second

- 默认值：30
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：TableKeeper 守护进程的执行间隔，以秒为单位。TableKeeperDaemon 使用此值（乘以 1000）来设置其内部计时器，并定期运行 keeper 任务，以确保历史表存在、更正表属性（副本数）并更新分区 TTL。该守护进程仅在 Leader 节点上执行工作，并在 `table_keeper_interval_second` 更改时通过 setInterval 更新其运行时间隔。增加此值可降低调度频率和负载；减小此值可更快地响应丢失或过期的历史表。
- 引入版本：v3.3.1、v3.4.0、v3.5.0
##### task_runs_ttl_second

- 默认值：7 * 24 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：控制任务运行历史的生存时间 (TTL)。降低此值会缩短历史记录保留时间并减少内存/磁盘使用量；提高此值会延长历史记录保留时间，但会增加资源使用量。将此参数与 `task_runs_max_history_number` 和 `enable_task_history_archive` 结合使用，以实现可预测的保留和存储行为。
- 引入版本：v3.2.0
##### task_ttl_second

- 默认值：24 * 3600
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：任务的生存时间 (TTL)。对于手动任务（未设置计划时），TaskBuilder 使用此值来计算任务的 `expireTime` (`expireTime = now + task_ttl_second * 1000L`)。TaskRun 还在计算运行的执行超时时，将此值用作上限——有效的执行超时为 `min(task_runs_timeout_second, task_runs_ttl_second, task_ttl_second)`。调整此值会更改手动创建的任务保持有效的时间，并间接限制任务运行的最大允许执行时间。
- 引入版本：v3.2.0
##### thrift_rpc_retry_times

- 默认值：3
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：控制 Thrift RPC 调用的总尝试次数。此值由 `ThriftRPCRequestExecutor`（以及 `NodeMgr` 和 `VariableMgr` 等调用者）用作重试的循环计数 - 即，值为 3 表示最多允许三次尝试，包括初始尝试。在 `TTransportException` 上，执行器将尝试重新打开连接并重试到此计数；当原因是 `SocketTimeoutException` 或重新打开失败时，它不会重试。每次尝试都受 `thrift_rpc_timeout_ms` 配置的每次尝试超时限制。增加此值可以提高对瞬时连接故障的弹性，但会增加总体 RPC 延迟和资源使用。
- 引入版本：v3.2.0
##### thrift_rpc_strict_mode

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：控制 Thrift 服务器使用的 TBinaryProtocol "strict read" 模式。此值作为第一个参数传递给 Thrift 服务器堆栈中的 org.apache.thrift.protocol.TBinaryProtocol.Factory，并影响传入的 Thrift 消息的解析和验证方式。当 `true` （默认值）时，服务器强制执行严格的 Thrift 编码/版本检查，并遵守配置的 `thrift_rpc_max_body_size` 限制；当 `false` 时，服务器接受非严格（旧版/宽松）的消息格式，这可以提高与旧客户端的兼容性，但可能会绕过某些协议验证。在运行中的集群上更改此设置时请务必小心，因为它不可修改，并且会影响互操作性和解析安全性。
- 引入版本：v3.2.0
##### thrift_rpc_timeout_ms

- 默认值：10000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：用于 Thrift RPC 调用的默认网络/套接字超时（以毫秒为单位）。在 `ThriftConnectionPool` 中创建 Thrift 客户端时，它会传递给 TSocket（由前端和后端池使用），并且在计算 RPC 调用超时时，它还会添加到操作的执行超时中（例如，ExecTimeout*1000 + `thrift_rpc_timeout_ms`），例如 `ConfigBase`、`LeaderOpExecutor`、`GlobalStateMgr`、`NodeMgr`、`VariableMgr` 和 `CheckpointWorker`。增加此值可使 RPC 调用容忍更长的网络或远程处理延迟；减少此值会导致在慢速网络上更快地进行故障转移。更改此值会影响执行 Thrift RPC 的 FE 代码路径中的连接创建和请求截止时间。
- 引入版本：v3.2.0
##### txn_latency_metric_report_groups

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：是
- 描述：要报告的事务延迟指标组的逗号分隔列表。 导入类型被分类为用于监控的逻辑组。 启用某个组后，其名称将作为“type”标签添加到事务指标。有效值：`stream_load`、`routine_load`、`broker_load`、`insert` 和 `compaction`（仅适用于存算分离集群）。示例：`"stream_load,routine_load"`。
- 引入版本：v4.0
##### txn_rollback_limit

- 默认值：100
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：可以回滚的最大事务数。
- 引入版本：-
### 用户、角色和权限
##### enable_task_info_mask_credential

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果为 true，StarRocks 会在 `information_schema.tasks` 和 `information_schema.task_runs` 中返回任务 SQL 定义之前，通过将 `SqlCredentialRedactor.redact` 应用于 `DEFINITION` 列来编辑凭据。在 `information_schema.task_runs` 中，无论定义来自任务运行状态还是（如果为空）来自任务定义查找，都会应用相同的编辑。如果为 false，则返回原始任务定义（可能会暴露凭据）。屏蔽是 CPU/字符串处理工作，当任务或 task_runs 的数量很大时，可能会很耗时；仅当您需要未编辑的定义并接受安全风险时才禁用。
- 引入版本：v3.5.6
##### privilege_max_role_depth

- 默认值: 16
- 类型: Int
- 单位:
- 是否可修改: 是
- 描述: 角色的最大深度（继承级别）。
- 引入版本: v3.0.0
##### privilege_max_total_roles_per_user

- 默认值：64
- 类型：Int
- 单位：
- 是否可修改：是
- 描述：一个用户可以拥有的最大角色数量。
- 引入版本：v3.0.0
### 查询引擎
##### brpc_send_plan_fragment_timeout_ms

- 默认值：60000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：在发送执行计划片段之前应用于 BRPC TalkTimeoutController 的超时时间，以毫秒为单位。`BackendServiceClient.sendPlanFragmentAsync` 在调用后端 `execPlanFragmentAsync` 之前设置此值。它控制 BRPC 在从连接池借用空闲连接以及执行发送时等待的时间；如果超过此时间，RPC 将失败，并可能触发该方法的重试逻辑。将其设置得较低可以在发生争用时快速失败，或者提高它以容忍瞬时连接池耗尽或慢速网络。请注意：非常大的值可能会延迟故障检测并阻塞请求线程。
- 引入版本：v3.3.11、v3.4.1、v3.5.0
##### connector_table_query_trigger_analyze_large_table_interval

- 默认值：12 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：用于大表的查询触发 ANALYZE 任务的间隔。
- 引入版本：v3.4.0
##### connector_table_query_trigger_analyze_max_pending_task_num

- 默认值：100
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：FE 上处于 Pending 状态的查询触发 ANALYZE 任务的最大数量。
- 引入版本：v3.4.0
##### connector_table_query_trigger_analyze_max_running_task_num

- 默认值：2
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：FE 上处于 Running 状态的 query-trigger ANALYZE 任务的最大数量。
- 引入版本：v3.4.0
##### connector_table_query_trigger_analyze_small_table_interval

- 默认值: 2 * 3600
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 用于查询触发的小表的 ANALYZE 任务的间隔。
- 引入版本: v3.4.0
##### connector_table_query_trigger_analyze_small_table_rows

- 默认值: 10000000
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 用于确定表是否为小表的阈值，以触发查询触发的 ANALYZE 任务。
- 引入版本: v3.4.0
##### connector_table_query_trigger_task_schedule_interval

- 默认值：30
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：Scheduler 线程调度 query-trigger 后台任务的间隔。此配置项用于替换 v3.4.0 中引入的 `connector_table_query_trigger_analyze_schedule_interval`。这里的后台任务指的是 v3.4 中的 `ANALYZE` 任务，以及 v3.4 之后版本中低基数列字典的收集任务。
- 引入版本：v3.4.2
##### create_table_max_serial_replicas

- 默认值: 128
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 串行创建的最大副本数。如果实际副本数超过此值，将并发创建副本。如果创建表花费的时间过长，请尝试减小此值。
- 引入版本: -
##### default_mv_partition_refresh_number

- 默认值：1
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：当物化视图刷新涉及多个分区时，此参数控制默认情况下单个批次中刷新的分区数。
从 3.3.0 版本开始，系统默认一次刷新一个分区，以避免潜在的内存溢出（OOM）问题。在早期版本中，默认情况下一次刷新所有分区，这可能导致内存耗尽和任务失败。但是，请注意，当物化视图刷新涉及大量分区时，一次仅刷新一个分区可能会导致过多的调度开销、更长的总体刷新时间以及大量的刷新记录。在这种情况下，建议适当调整此参数，以提高刷新效率并降低调度成本。
- 引入版本：v3.3.0
##### default_mv_refresh_immediate

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否在创建异步物化视图后立即刷新。如果设置为 `true`，新创建的物化视图将立即刷新。
- 引入版本：v3.2.3
##### dynamic_partition_check_interval_seconds

- 默认值：600
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：检查新数据的时间间隔。如果检测到新数据，StarRocks 会自动为该数据创建分区。
- 引入版本：-
##### dynamic_partition_enable

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否启用动态分区功能。启用此功能后，StarRocks 会为新数据动态创建分区，并自动删除过期分区，以确保数据的新鲜度。
- 引入版本：-
##### enable_active_materialized_view_schema_strict_check

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否在激活非激活状态的物化视图时，严格检查数据类型长度的一致性。如果此项设置为 `false`，则当基表中数据类型的长度发生更改时，物化视图的激活不受影响。
- 引入版本：v3.3.4
##### enable_auto_collect_array_ndv

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否开启 ARRAY 类型的 NDV 信息的自动收集。
- 引入版本：v4.0
##### enable_backup_materialized_view

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：在备份或恢复特定数据库时，是否启用异步物化视图的 BACKUP 和 RESTORE。如果此项设置为 `false`，StarRocks 将跳过备份异步物化视图。
- 引入版本：v3.2.0
##### enable_collect_full_statistic

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否开启自动全量统计信息收集。默认开启此功能。
- 引入版本：-
##### enable_colocate_mv_index

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否支持在创建同步物化视图时，将同步物化视图索引与基表进行 Colocate Join。如果此项设置为 `true`，tablet sink 将提高同步物化视图的写入性能。
- 引入版本：v3.2.0
##### enable_decimal_v3

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否支持 DECIMAL V3 数据类型。
- 引入版本：-
##### enable_experimental_mv

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否启用异步物化视图功能。TRUE 表示启用此功能。从 v2.5.2 版本开始，默认启用此功能。对于早于 v2.5.2 的版本，默认禁用此功能。
- 引入版本：v2.4
##### enable_local_replica_selection

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否为查询选择本地副本。本地副本可以降低网络传输成本。如果此参数设置为 TRUE，则 CBO 优先选择与当前 FE 具有相同 IP 地址的 BE 上的 tablet 副本。如果此参数设置为 `FALSE`，则可以选择本地副本和非本地副本。
- 引入版本：-
##### enable_manual_collect_array_ndv

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否启用手动收集 ARRAY 类型的 NDV 信息。
- 引入版本：v4.0
##### enable_materialized_view

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否允许创建物化视图。
- 引入版本：-
##### enable_materialized_view_external_table_precise_refresh

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果基表是外部表（非云原生表），则设置为 `true` 以启用物化视图刷新的内部优化。启用后，物化视图刷新处理器会计算候选分区，并且仅刷新受影响的基表分区，而不是所有分区，从而减少 I/O 和刷新成本。设置为 `false` 会强制刷新外部表的完整分区。
- 引入版本：v3.2.9
##### enable_materialized_view_metrics_collect

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否默认收集异步物化视图的监控指标。
- 引入版本：v3.1.11，v3.2.5
##### enable_materialized_view_spill

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否为物化视图刷新任务启用中间结果落盘。
- 引入版本：v3.1.1
##### enable_materialized_view_text_based_rewrite

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否默认开启基于文本的查询改写。如果设置为 `true`，系统会在创建异步物化视图时构建抽象语法树。
- 引入版本：v3.2.5
##### enable_mv_automatic_active_check

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否允许系统自动检查并重新激活那些由于基表（视图）经历了 Schema Change 或者被删除并重新创建而设置为非激活状态的异步物化视图。请注意，此功能不会重新激活用户手动设置为非激活状态的物化视图。
- 引入版本：v3.1.6
##### enable_mv_automatic_repairing_for_broken_base_tables

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果此项设置为 `true`，当基表外部表被删除并重新创建，或者其表标识符发生更改时，StarRocks 会尝试自动修复物化视图基表元数据。修复流程可以更新物化视图的基表信息，收集外部表分区的分区级别修复信息，并在遵循 `autoRefreshPartitionsLimit` 的同时，驱动异步自动刷新物化视图的分区刷新决策。目前，自动修复支持 Hive 外表；不支持的表类型将导致物化视图设置为非活动状态并出现修复异常。分区信息收集是非阻塞的，失败会被记录。
- 引入版本：v3.3.19、v3.4.8、v3.5.6
##### enable_predicate_columns_collection

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否启用谓词列收集。如果禁用，则在查询优化期间不会记录谓词列。
- 引入版本：-
##### enable_query_queue_v2

- 默认值：true
- 类型：boolean
- 单位：-
- 是否可修改：否
- 描述：如果为 true，则将 FE 中基于 slot 的查询调度器切换到 Query Queue V2。该标志由 slot 管理器和跟踪器（例如，`BaseSlotManager.isEnableQueryQueueV2` 和 `SlotTracker#createSlotSelectionStrategy`）读取，以选择 `SlotSelectionStrategyV2` 而不是旧策略。`query_queue_v2_xxx` 配置选项和 `QueryQueueOptions` 仅在此标志启用时生效。从 v4.1 开始，默认值从 `false` 更改为 `true`。
- 引入版本：v3.3.4、v3.4.0、v3.5.0
##### enable_sql_blacklist

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否启用 SQL 查询的黑名单检查。启用此功能后，黑名单中的查询将无法执行。
- 引入版本：-
##### enable_statistic_collect

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否为 CBO 收集统计信息。此功能默认开启。
- 引入版本：-
##### enable_statistic_collect_on_first_load

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 控制由数据导入操作触发的自动统计信息收集和维护。这包括：
  - 首次将数据导入到分区时（分区版本等于 2）的统计信息收集。
  - 将数据导入到多分区表的空分区时的统计信息收集。
  - 用于 INSERT OVERWRITE 操作的统计信息复制和更新。

  **统计信息收集类型的决策策略：**
  
  - 对于 INSERT OVERWRITE: `deltaRatio = |targetRows - sourceRows| / (sourceRows + 1)`
    - 如果 `deltaRatio < statistic_sample_collect_ratio_threshold_of_first_load` (默认值: 0.1)，则不会执行统计信息收集。只会复制现有的统计信息。
    - 否则，如果 `targetRows > statistic_sample_collect_rows` (默认值: 200000)，则使用 SAMPLE 统计信息收集。
    - 否则，使用 FULL 统计信息收集。
  
  - 对于首次导入: `deltaRatio = loadRows / (totalRows + 1)`
    - 如果 `deltaRatio < statistic_sample_collect_ratio_threshold_of_first_load` (默认值: 0.1)，则不会执行统计信息收集。
    - 否则，如果 `loadRows > statistic_sample_collect_rows` (默认值: 200000)，则使用 SAMPLE 统计信息收集。
    - 否则，使用 FULL 统计信息收集。
  
  **同步行为：**
  
  - 对于 DML 语句 (INSERT INTO/INSERT OVERWRITE): 具有表锁的同步模式。导入操作会等待统计信息收集完成（最长等待时间为 `semi_sync_collect_statistic_await_seconds`）。
  - 对于 Stream Load 和 Broker Load: 无锁的异步模式。统计信息收集在后台运行，不会阻塞导入操作。
  
  :::note
  禁用此配置将阻止所有由导入触发的统计信息操作，包括 INSERT OVERWRITE 的统计信息维护，这可能导致表缺少统计信息。如果频繁创建新表并频繁导入数据，则启用此功能会增加内存和 CPU 开销。
  :::

- 引入版本: v3.1
##### enable_statistic_collect_on_update

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：控制 `UPDATE` 语句是否可以触发自动统计信息收集。 启用后，修改表数据的 `UPDATE` 操作可以通过与 `enable_statistic_collect_on_first_load` 控制的相同的基于数据摄取的统计信息框架来安排统计信息收集。 禁用此配置会跳过 `UPDATE` 语句的统计信息收集，同时保持加载触发的统计信息收集行为不变。
- 引入版本：v3.5.11，v4.0.4
##### enable_udf

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：是否启用 UDF。
- 引入版本：-
##### expr_children_limit

- 默认值：10000
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：一个表达式中允许的最大子表达式数量。
- 引入版本：-
##### histogram_buckets_size

- 默认值：64
- 类型：Long
- 单位：-
- 是否可变：是
- 描述：直方图的默认存储桶数量。
- 引入版本：-
##### histogram_max_sample_row_count

- 默认值: 10000000
- 类型: Long
- 单位: -
- 是否可修改: 是
- 描述: 用于直方图的最大采样行数。
- 引入版本: -
##### histogram_mcv_size

- 默认值：100
- 类型：Long
- 单位：-
- 是否可修改：是
- 描述：直方图中最常见值 (MCV) 的数量。
- 引入版本：-
##### histogram_sample_ratio

- 默认值：0.1
- 类型：Double
- 单位：-
- 是否可修改：是
- 描述：直方图的采样率。
- 引入版本：-
##### http_slow_request_threshold_ms

- 默认值：5000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：如果 HTTP 请求的响应时间超过此参数指定的值，则会生成日志来跟踪此请求。
- 引入版本：v2.5.15，v3.1.5
##### lock_checker_enable_deadlock_check

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：启用后，LockChecker 线程会使用 ThreadMXBean.findDeadlockedThreads() 执行 JVM 级别的死锁检测，并记录有问题的线程的堆栈跟踪。该检查在 LockChecker 守护进程中运行（其频率由 `lock_checker_interval_second` 控制），并将详细的堆栈信息写入日志，这可能会占用大量 CPU 和 I/O。仅在对实时或可重现的死锁问题进行故障排除时才启用此选项；在正常操作中保持启用状态可能会增加开销和日志量。
- 引入版本：v3.2.0
##### low_cardinality_threshold

- 默认值: 255
- 类型: Int
- 单位: -
- 是否可修改: 否
- 描述: 低基数字典的阈值。
- 引入版本: v3.5.0
##### materialized_view_min_refresh_interval

- 默认值：60
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：ASYNC 物化视图计划允许的最小刷新间隔（以秒为单位）。当使用基于时间的间隔创建物化视图时，该间隔将转换为秒，并且不得小于此值；否则，CREATE/ALTER 操作将失败并显示 DDL 错误。如果此值大于 0，则强制执行检查；将其设置为 0 或负值以禁用该限制，这可以防止过多的 TaskManager 调度以及过于频繁的刷新导致 FE 内存/CPU 使用率过高。此项不适用于 EVENT_TRIGGERED 刷新。
- 引入版本：v3.3.0、v3.4.0、v3.5.0
##### materialized_view_refresh_ascending

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：如果此参数设置为 `true`，物化视图分区刷新将按照分区键升序（从旧到新）迭代分区。如果设置为 `false`（默认值），系统将按降序（从新到旧）迭代。当分区刷新存在限制时，StarRocks 在 LIST 分区和 RANGE 分区的物化视图刷新逻辑中都会使用此参数来选择要处理的分区，并计算后续 TaskRun 执行的下一个起始/结束分区边界。更改此参数会改变首先刷新的分区以及下一个分区范围的推导方式；对于 RANGE 分区的物化视图，调度程序会验证新的起始/结束分区，如果更改会创建重复的边界（死循环），则会引发错误，因此请谨慎设置此参数。
- 引入版本：v3.3.1、v3.4.0、v3.5.0
##### max_allowed_in_element_num_of_delete

- 默认值: 10000
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: DELETE 语句中 IN 谓词允许的最大元素数量。
- 引入版本: -
##### max_create_table_timeout_second

- 默认值：600
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：创建表的最大超时时长。
- 引入版本：-
##### max_distribution_pruner_recursion_depth

- 默认值：100
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：分区裁剪器允许的最大递归深度。增加递归深度可以裁剪更多的元素，但也会增加 CPU 消耗。
- 引入版本：-
##### max_partitions_in_one_batch

- 默认值：4096
- 类型：Long
- 单位：-
- 是否可修改：是
- 描述：批量创建分区时，可以创建的最大分区数。
- 引入版本：-
##### max_planner_scalar_rewrite_num

- 默认值：100000
- 类型：Long
- 单位：-
- 是否可修改：是
- 描述：优化器可以重写标量算子的最大次数。
- 引入版本：-
##### max_query_queue_history_slots_number

- 默认值：0
- 类型：Int
- 单位：Slots
- 是否可变：是
- 描述：控制每个查询队列保留多少个最近释放（历史）的已分配插槽，用于监控和可观察性。当 `max_query_queue_history_slots_number` 设置为大于 0 的值时，BaseSlotTracker 会在内存队列中保存最多该数量的最近释放的 LogicalSlot 条目，并在超出限制时逐出最旧的条目。启用此功能会导致 getSlots() 包含这些历史条目（最新的优先），允许 BaseSlotTracker 尝试使用 ConnectContext 注册插槽以获得更丰富的 ExtraMessage 数据，并允许 LogicalSlot.ConnectContextListener 将查询完成元数据附加到历史插槽。当 `max_query_queue_history_slots_number` &lt;= 0 时，历史机制将被禁用（不使用额外的内存）。使用合理的值来平衡可观察性和内存开销。
- 引入版本：v3.5.0
##### max_query_retry_time

- 默认值：2
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：FE 上查询重试的最大次数。
- 引入版本：-
##### max_running_rollup_job_num_per_table

- 默认值：1
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：单个表可以并行运行的最大 rollup 任务数。
- 引入版本：-
##### max_scalar_operator_flat_children

- 默认值：10000
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：ScalarOperator 的最大扁平子节点数。您可以设置此限制，以防止优化器使用过多内存。
- 引入版本：-
##### max_scalar_operator_optimize_depth

- 默认值：256
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：ScalarOperator 优化可以应用的最大深度。
- 引入版本：-
##### mv_active_checker_interval_seconds

- 默认值：60
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：当后台 active_checker 线程启用时，系统会定期检测并自动重新激活由于 schema change 或基表（或视图）重建而变为 Inactive 状态的物化视图。此参数控制 checker 线程的调度间隔，以秒为单位。默认值由系统定义。
- 引入版本：v3.1.6
##### mv_rewrite_consider_data_layout_mode

- 默认值：`enable`
- 类型：String
- 单位：-
- 是否可变：是
- 描述：控制物化视图改写在选择最佳物化视图时，是否应考虑基表的数据布局。有效值：
  - `disable`：在选择候选物化视图时，从不使用数据布局标准。
  - `enable`：仅当查询被识别为对布局敏感时，才使用数据布局标准。
  - `force`：在选择最佳物化视图时，始终应用数据布局标准。
  更改此配置会影响 `BestMvSelector` 的行为，并且可以提高或扩大改写的适用性，具体取决于物理布局对于计划正确性或性能是否重要。
- 引入版本：-
##### publish_version_interval_ms

- 默认值：10
- 类型：Int
- 单位：毫秒
- 是否可修改：否
- 描述：发布版本验证任务的间隔时间。
- 引入版本：-
##### query_queue_slots_estimator_strategy

- 默认值：MAX
- 类型：String
- 单位：-
- 是否可修改：是
- 描述：当 `enable_query_queue_v2` 为 true 时，选择用于基于队列的查询的 slot 估计策略。有效值：MBE (基于内存)、PBE (基于并行度)、MAX (取 MBE 和 PBE 的最大值) 和 MIN (取 MBE 和 PBE 的最小值)。MBE 通过预测内存或计划成本除以每个 slot 的内存目标来估计 slot，并受 `totalSlots` 的限制。PBE 从 fragment 并行度（扫描范围计数或基数 / 每个 slot 的行数）和基于 CPU 成本的计算（使用每个 slot 的 CPU 成本）得出 slot，然后将结果限制在 [numSlots/2, numSlots] 范围内。MAX 和 MIN 分别通过取它们的最大值或最小值来组合 MBE 和 PBE。如果配置的值无效，则使用默认值 (`MAX`)。
- 引入版本：v3.5.0
##### query_queue_v2_concurrency_level

- 默认值：4
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：控制计算系统总查询槽时使用的逻辑并发“层”的数量。在存算一体模式下，总槽数 = `query_queue_v2_concurrency_level` * BE 数量 * 每个 BE 的核心数（来自 BackendResourceStat）。在多计算集群模式下，有效并发会缩减到 max(1, `query_queue_v2_concurrency_level` / 4)。如果配置的值为非正数，则将其视为 `4`。更改此值会增加或减少 totalSlots（以及并发查询容量），并影响每个槽的资源：memBytesPerSlot 是通过将每个 worker 的内存除以（每个 worker 的核心数 * 并发数）得出的，并且 CPU 统计使用 `query_queue_v2_cpu_costs_per_slot`。将其设置为与集群大小成比例；非常大的值可能会减少每个槽的内存并导致资源碎片。
- 引入版本：v3.3.4、v3.4.0、v3.5.0
##### query_queue_v2_cpu_costs_per_slot

- 默认值：1000000000
- 类型：Long
- 单位：planner CPU 成本单位
- 是否可变：是
- 描述：每个 slot 的 CPU 成本阈值，用于根据查询的 planner CPU 成本估算查询所需的 slot 数量。调度器将 slot 计算为 integer(plan_cpu_costs / `query_queue_v2_cpu_costs_per_slot`)，然后将结果限制在 [1, totalSlots] 范围内（totalSlots 源自查询队列 V2 `V2` 参数）。V2 代码将非正设置标准化为 1 (Math.max(1, value))，因此非正值实际上变为 `1`。增加此值会减少每个查询分配的 slot（倾向于更少、更大 slot 的查询）；减少此值会增加每个查询的 slot。与 `query_queue_v2_num_rows_per_slot` 和并发设置一起调整，以控制并行性与资源粒度。
- 引入版本：v3.3.4、v3.4.0、v3.5.0
##### query_queue_v2_num_rows_per_slot

- 默认值：4096
- 类型：Int
- 单位：行
- 是否可修改：是
- 描述：在评估每个查询的 slot 数量时，分配给单个调度 slot 的目标源行记录数。StarRocks 计算 estimated_slots = (Source Node 的基数) / `query_queue_v2_num_rows_per_slot`，然后将结果限制在 [1, totalSlots] 范围内，如果计算出的值非正数，则强制最小值为 1。totalSlots 源自可用资源（大致为 DOP * `query_queue_v2_concurrency_level` * number_of_workers/BE），因此取决于集群/核心数。增加此值可减少 slot 数量（每个 slot 处理更多行）并降低调度开销；减少此值可增加并行度（更多、更小的 slot），直至达到资源限制。
- 引入版本：v3.3.4、v3.4.0、v3.5.0
##### query_queue_v2_schedule_strategy

- 默认值：SWRR
- 类型：String
- 单位：-
- 是否可修改：是
- 描述：选择 Query Queue V2 用于对等待查询进行排序的调度策略。支持的值（不区分大小写）包括 `SWRR` (Smooth Weighted Round Robin，平滑加权轮询) — 默认值，适用于需要公平加权共享的混合/混合型工作负载 — 以及 `SJF` (Short Job First + Aging，短作业优先 + 老化) — 优先处理短作业，同时使用老化来避免饥饿。该值使用不区分大小写的枚举查找进行解析；无法识别的值将记录为错误，并使用默认策略。此配置仅在启用 Query Queue V2 时生效，并与 V2 大小设置（如 `query_queue_v2_concurrency_level`）交互。
- 引入版本：v3.3.12、v3.4.2、v3.5.0
##### semi_sync_collect_statistic_await_seconds

- 默认值：30
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：DML 操作（INSERT INTO 和 INSERT OVERWRITE 语句）期间半同步统计信息收集的最长等待时间。 Stream Load 和 Broker Load 使用异步模式，不受此配置的影响。如果统计信息收集时间超过此值，则加载操作将继续，而无需等待收集完成。此配置与 `enable_statistic_collect_on_first_load` 结合使用。
- 引入版本：v3.1
##### slow_query_analyze_threshold

- 默认值: 5
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 查询执行时间超过该阈值时，会触发 Query Feedback 分析。
- 引入版本: v3.4.0
##### statistic_analyze_status_keep_second

- 默认值：3 * 24 * 3600
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：保留收集任务历史记录的持续时间。默认值为 3 天。
- 引入版本：-
##### statistic_auto_analyze_end_time

- 默认值：23:59:59
- 类型：String
- 单位：-
- 是否可修改：是
- 描述：自动收集的结束时间。取值范围：`00:00:00` - `23:59:59`。
- 引入版本：-
##### statistic_auto_analyze_start_time

- 默认值：00:00:00
- 类型：String
- 单位：-
- 是否可修改：是
- 描述：自动收集的开始时间。取值范围：`00:00:00` - `23:59:59`。
- 引入版本：-
##### statistic_auto_collect_ratio

- 默认值: 0.8
- 类型: Double
- 单位: -
- 是否可修改: 是
- 描述: 用于确定自动收集的统计信息是否正常的阈值。如果统计信息的健康状况低于此阈值，则会触发自动收集。
- 引入版本: -
##### statistic_auto_collect_small_table_rows

- 默认值: 10000000
- 类型: Long
- 单位: -
- 是否可修改: 是
- 描述: 在自动收集期间，用于确定外部数据源（Hive、Iceberg、Hudi）中的表是否为小表的阈值。如果表的行数小于此值，则该表被视作小表。
- 引入版本: v3.2
##### statistic_cache_columns

- 默认值: 100000
- 类型: Long
- 单位: -
- 是否可修改: 否
- 描述: 统计信息表可以缓存的行数。
- 引入版本: -
##### statistic_cache_thread_pool_size

- 默认值：10
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：用于刷新统计信息缓存的线程池大小。
- 引入版本：-
##### statistic_collect_interval_sec

- 默认值: 5 * 60
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: 自动收集期间，检查数据更新的间隔。
- 引入版本: -
##### statistic_max_full_collect_data_size

- 默认值：100 * 1024 * 1024 * 1024
- 类型：Long
- 单位：字节
- 是否可修改：是
- 描述：自动收集统计信息的数据大小阈值。如果总大小超过此值，则执行抽样收集，而不是完整收集。
- 引入版本：-
##### statistic_sample_collect_rows

- 默认值：200000
- 类型：Long
- 单位：-
- 是否可变：是
- 描述：在数据导入触发统计信息收集操作期间，用于决定采用 SAMPLE 统计信息收集还是 FULL 统计信息收集的行数阈值。如果导入或更改的行数超过此阈值（默认为 200,000），则使用 SAMPLE 统计信息收集；否则，使用 FULL 统计信息收集。此设置与 `enable_statistic_collect_on_first_load` 和 `statistic_sample_collect_ratio_threshold_of_first_load` 结合使用。
- 引入版本：-
##### statistic_update_interval_sec

- 默认值: 24 * 60 * 60
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: 统计信息缓存的更新间隔。
- 引入版本: -
##### task_check_interval_second

- 默认值：60
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：任务后台作业的执行间隔。GlobalStateMgr 使用此值来调度 TaskCleaner FrontendDaemon，后者会调用 `doTaskBackgroundJob()`；该值乘以 1000 以设置守护进程的间隔（以毫秒为单位）。减小该值会使后台维护（任务清理、检查）运行得更频繁，反应更快，但会增加 CPU/IO 开销；增加该值会减少开销，但会延迟清理和检测过时的任务。调整此值以平衡维护响应性和资源使用率。
- 引入版本：v3.2.0
##### task_min_schedule_interval_s

- 默认值：10
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：SQL 层检查的任务计划允许的最小计划间隔（以秒为单位）。提交任务时，TaskAnalyzer 会将计划周期转换为秒，如果周期小于 `task_min_schedule_interval_s`，则拒绝提交并返回 ERR_INVALID_PARAMETER。这可以防止创建运行过于频繁的任务，并保护调度程序免受高频任务的影响。如果计划没有明确的开始时间，TaskAnalyzer 会将开始时间设置为当前 epoch 秒数。
- 引入版本：v3.3.0、v3.4.0、v3.5.0
##### task_runs_timeout_second

- 默认值：4 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：TaskRun 的默认执行超时时间（以秒为单位）。此配置项被 TaskRun 执行用作基准超时时间。如果 task run 的属性包含会话变量 `query_timeout` 或 `insert_timeout`，且值为正整数，则运行时使用该会话超时时间与 `task_runs_timeout_second` 之间的较大值。生效的超时时间不得超过配置的 `task_runs_ttl_second` 和 `task_ttl_second`。设置此配置项可以限制 task run 的执行时长。非常大的值可能会受到 task/task-run TTL 设置的限制。
- 引入版本：-
### 数据导入和数据导出
##### broker_load_default_timeout_second

- 默认值: 14400
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 一个 Broker Load 任务的超时时间。
- 引入版本: -
##### desired_max_waiting_jobs

- 默认值：1024
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：FE 中等待执行的最大任务数量。该数值代表所有任务，例如建表、数据导入和 schema change 任务。如果 FE 中等待执行的任务数量达到这个值，FE 将拒绝新的数据导入请求。该参数仅对异步数据导入生效。从 v2.5 版本开始，默认值从 100 更改为 1024。
- 引入版本：-
##### disable_load_job

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：当集群遇到错误时，是否禁用数据导入。这样可以防止集群错误造成的任何损失。默认值为 `FALSE`，表示不禁用数据导入。`TRUE` 表示禁用数据导入，并且集群处于只读状态。
- 引入版本：-
##### empty_load_as_error

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：用于指定当没有数据导入时，是否返回错误信息“all partitions have no load data”。取值范围：
  - `true`：如果没有数据导入，系统会显示失败消息，并返回错误“all partitions have no load data”。
  - `false`：如果没有数据导入，系统会显示成功消息，并返回 OK，而不是错误。
- 引入版本：-
##### enable_file_bundling

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否为存算分离表启用 File Bundling 优化。启用此功能（设置为 `true`）后，系统会自动捆绑由数据导入、Compaction 或 Publish 操作生成的数据文件，从而降低因高频访问外部存储系统而产生的 API 成本。您还可以使用 CREATE TABLE 属性 `file_bundling` 在表级别控制此行为。有关详细说明，请参见 [CREATE TABLE](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md) 。
- 引入版本：v4.0
##### enable_routine_load_lag_metrics

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否收集 Routine Load Kafka 分区 offset 延迟指标。请注意，将此项设置为 `true` 将调用 Kafka API 来获取分区的最新 offset。
- 引入版本：-
##### enable_sync_publish

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否在数据导入事务的发布阶段同步执行apply任务。此参数仅适用于主键表。有效值：
  - `TRUE`（默认值）：在数据导入事务的发布阶段同步执行apply任务。这意味着只有在apply任务完成后，数据导入事务才会被报告为成功，并且加载的数据才能真正被查询到。当任务一次性加载大量数据或频繁加载数据时，将此参数设置为 `true` 可以提高查询性能和稳定性，但可能会增加数据导入延迟。
  - `FALSE`：在数据导入事务的发布阶段异步执行apply任务。这意味着在apply任务提交后，数据导入事务就会被报告为成功，但加载的数据不能立即被查询到。在这种情况下，并发查询需要等待apply任务完成或超时后才能继续。当任务一次性加载大量数据或频繁加载数据时，将此参数设置为 `false` 可能会影响查询性能和稳定性。
- 引入版本：v3.2.0
##### export_checker_interval_second

- 默认值：5
- 类型：Int
- 单位：秒
- 是否可修改：否
- 描述：调度数据导出作业的时间间隔。
- 引入版本：-
##### export_max_bytes_per_be_per_task

- 默认值：268435456
- 类型：Long
- 单位：Bytes
- 是否可修改：是
- 描述：单个数据卸载任务从单个 BE 导出的最大数据量。
- 引入版本：-
##### export_running_job_num_limit

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 可以并行运行的数据导出任务的最大数量。
- 引入版本: -
##### export_task_default_timeout_second

- 默认值：2 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：数据导出任务的超时时长。
- 引入版本：-
##### export_task_pool_size

- 默认值：5
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：数据导出任务线程池的大小。
- 引入版本：-
##### external_table_commit_timeout_ms

- 默认值：10000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：向 StarRocks 外部表提交（发布）写入事务的超时时长。默认值 `10000` 表示超时时长为 10 秒。
- 引入版本：-
##### finish_transaction_default_lock_timeout_ms

- 默认值: 1000
- 类型: Int
- 单位: 毫秒 (MilliSeconds)
- 是否可修改: 是
- 描述: 完成事务时，获取数据库和表锁的默认超时时间。
- 引入版本: v4.0.0, v3.5.8
##### history_job_keep_max_second

- 默认值：7 * 24 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：历史作业可以保留的最长时间，例如 schema change 作业。
- 引入版本：-
##### insert_load_default_timeout_second

- 默认值: 3600
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 用于数据导入的 INSERT INTO 语句的超时时长。
- 引入版本: -
##### label_clean_interval_second

- 默认值：4 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：否
- 描述：清理标签的时间间隔。单位：秒。建议您指定一个较短的时间间隔，以确保能够及时清理历史标签。
- 引入版本：-
##### label_keep_max_num

- 默认值：1000
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：在一段时间内可以保留的最大数据导入作业数量。如果超过此数量，则会删除历史作业的信息。
- 引入版本：-
##### label_keep_max_second

- 默认值：3 * 24 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：已完成且处于 FINISHED 或 CANCELLED 状态的导入作业的标签保留的最长时间（以秒为单位）。默认值为 3 天。超过此时间后，标签将被删除。此参数适用于所有类型的导入作业。值过大将消耗大量内存。
- 引入版本：-
##### load_checker_interval_second

- 默认值: 5
- 类型: Int
- 单位: 秒
- 是否可修改: 否
- 描述: 滚动处理导入作业的时间间隔。
- 引入版本: -
##### load_parallel_instance_num

- 默认值：1
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：控制在单个主机上为 Broker Load 和 Stream Load 创建的并行导入片段实例的数量。LoadPlanner 使用此值作为每个主机的并行度，除非会话启用了自适应 Sink DOP；如果会话变量 `enable_adaptive_sink_dop` 为 true，则会话的 `sink_degree_of_parallelism` 将覆盖此配置。当需要 shuffle 时，此值将应用于片段并行执行（扫描片段和 Sink 片段并行执行实例）。当不需要 shuffle 时，它用作 Sink Pipeline DOP。注意：从本地文件导入会被强制为单个实例（Pipeline DOP = 1，并行执行 = 1），以避免本地磁盘争用。增加此数字会提高每个主机的并发性和吞吐量，但可能会增加 CPU、内存和 I/O 争用。
- 引入版本：v3.2.0
##### load_straggler_wait_second

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：BE 副本可以容忍的最大数据导入延迟。如果超过此值，则执行克隆以从其他副本克隆数据。
- 引入版本：-
##### loads_history_retained_days

- 默认值：30
- 类型：Int
- 单位：天
- 是否可修改：是
- 描述：在内部 `_statistics_.loads_history` 表中保留数据导入历史记录的天数。此值用于表创建，以设置表属性 `partition_live_number`，并传递给 `TableKeeper`（最小限制为 1），以确定要保留的每日分区数。增加或减少此值会调整已完成的数据导入作业在每日分区中保留的时间；它会影响新表的创建和 keeper 的裁剪行为，但不会自动重新创建过去的分区。`LoadsHistorySyncer` 在管理数据导入历史记录生命周期时依赖于此保留期限；其同步频率由 `loads_history_sync_interval_second` 控制。
- 引入版本：v3.3.6、v3.4.0、v3.5.0
##### loads_history_sync_interval_second

- 默认值：60
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：`LoadsHistorySyncer` 使用的时间间隔（以秒为单位），用于安排将已完成的导入作业从 `information_schema.loads` 定期同步到内部 `_statistics_.loads_history` 表。该值在构造函数中乘以 1000，以设置 FrontendDaemon 的时间间隔。同步器会跳过第一次运行（以允许创建表），并且仅导入一分钟前完成的导入；较小的值会增加 DML 和执行器的负载，而较大的值会延迟历史导入记录的可用性。有关目标表的保留/分区行为，请参见 `loads_history_retained_days`。
- 引入版本：v3.3.6、v3.4.0、v3.5.0
##### max_broker_load_job_concurrency

- 默认值：5
- 别名：async_load_task_pool_size
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：StarRocks 集群内允许的最大并发 Broker Load 作业数。此参数仅对 Broker Load 有效。此参数的值必须小于 `max_running_txn_num_per_db` 的值。从 v2.5 版本开始，默认值从 `10` 更改为 `5`。
- 引入版本：-
##### max_load_timeout_second

- 默认值：259200
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：数据导入作业允许的最长超时时间。如果超过此限制，数据导入作业将失败。此限制适用于所有类型的数据导入作业。
- 引入版本：-
##### max_routine_load_batch_size

- 默认值: 4294967296
- 类型: Long
- 单位: Bytes
- 是否可修改: 是
- 描述: 单个 Routine Load 任务可以导入的最大数据量。
- 引入版本: -
##### max_routine_load_task_concurrent_num

- 默认值：5
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：每个 Routine Load 作业的最大并发任务数。
- 引入版本：-
##### max_routine_load_task_num_per_be

- 默认值：16
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：每个 BE 上并发的 Routine Load 任务的最大数量。自 v3.1.0 起，此参数的默认值从 5 增加到 16，并且不再需要小于或等于 BE 静态参数 `routine_load_thread_pool_size`（已弃用）的值。
- 引入版本：-
##### max_running_txn_num_per_db

- 默认值：1000
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：每个数据库在 StarRocks 集群中允许运行的最大数据导入事务数。默认值为 `1000`。从 v3.1 版本开始，默认值从 `100` 更改为 `1000`。当数据库实际运行的数据导入事务数超过此参数的值时，将不会处理新的数据导入请求。同步数据导入作业的新请求将被拒绝，异步数据导入作业的新请求将被放入队列。我们不建议您增加此参数的值，因为这会增加系统负载。
- 引入版本：-
##### max_stream_load_timeout_second

- 默认值：259200
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：一个 Stream Load 任务允许的最长超时时间。
- 引入版本：-
##### max_tolerable_backend_down_num

- 默认值：0
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：允许的最大故障 BE 节点数。如果超过此数量，则无法自动恢复 Routine Load 作业。
- 引入版本：-
##### min_bytes_per_broker_scanner

- 默认值: 67108864
- 类型: Long
- 单位: Bytes
- 是否可修改: 是
- 描述: 单个 Broker Load 实例可以处理的最小数据量。
- 引入版本: -
##### min_load_timeout_second

- 默认值：1
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：允许的数据导入任务的最小超时时长。此限制适用于所有类型的数据导入任务。
- 引入版本：-
##### min_routine_load_lag_for_metrics

- 默认值：10000
- 类型：INT
- 单位：-
- 是否可修改：是
- 描述：在监控指标中显示的 Routine Load 作业的最小 offset 延迟。 offset 延迟大于此值的 Routine Load 作业将显示在指标中。
- 引入版本：-
##### period_of_auto_resume_min

- 默认值：5
- 类型：Int
- 单位：分钟
- 是否可修改：是
- 描述：Routine Load 作业自动恢复的间隔时间。
- 引入版本：-
##### prepared_transaction_default_timeout_second

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 预处理事务的默认超时时长。
- 引入版本: -
##### routine_load_task_consume_second

- 默认值：15
- 类型：Long
- 单位：秒
- 是否可变：是
- 描述：集群中每个 Routine Load 任务消费数据的最大时长。自 v3.1.0 起，Routine Load 作业支持在 [job_properties](../../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md#job_properties) 中使用新参数 `task_consume_second`。此参数适用于 Routine Load 作业中的单个导入任务，更加灵活。
- 引入版本：-
##### routine_load_task_timeout_second

- 默认值：60
- 类型：Long
- 单位：秒
- 是否可变：是
- 描述：集群中每个 Routine Load 任务的超时时长。自 v3.1.0 起，Routine Load 作业在 [job_properties](../../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md#job_properties) 中支持新的参数 `task_timeout_second`。此参数适用于 Routine Load 作业中的单个导入任务，更加灵活。
- 引入版本：-
##### routine_load_unstable_threshold_second

- 默认值: 3600
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: 如果某个 Routine Load 作业中的任何 task 滞后，则该 Routine Load 作业将设置为 UNSTABLE 状态。具体来说，如果正在消费的消息的时间戳与当前时间之差超过此阈值，并且数据源中存在未消费的消息，则会发生这种情况。
- 引入版本: -
##### spark_dpp_version

- 默认值：1.0.0
- 类型：String
- 单位：-
- 是否可变：否
- 描述：使用的 Spark 动态分区裁剪 (DPP) 的版本。
- 引入版本：-
##### spark_home_default_dir

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/lib/spark2x"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：Spark 客户端的根目录。
- 引入版本：-
##### spark_launcher_log_dir

- 默认值：sys_log_dir + "/spark_launcher_log"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：存储 Spark 日志文件的目录。
- 引入版本：-
##### spark_load_default_timeout_second

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 每个 Spark Load 作业的超时时间。
- 引入版本: -
##### spark_load_submit_timeout_second

- 默认值：300
- 类型：long
- 单位：秒
- 是否可修改：否
- 描述：提交 Spark 应用程序后，等待 YARN 响应的最长时间（以秒为单位）。`SparkLauncherMonitor.LogMonitor` 将此值转换为毫秒，如果作业在 UNKNOWN/CONNECTED/SUBMITTED 状态的时间超过此超时时间，将停止监控并强制终止 spark launcher 进程。`SparkLoadJob` 将此配置读取为默认值，并允许通过 `LoadStmt.SPARK_LOAD_SUBMIT_TIMEOUT` 属性为每个导入单独设置。将其设置得足够高，以适应 YARN 队列延迟；设置得太低可能会中止合法排队的作业，而设置得太高可能会延迟故障处理和资源清理。
- 引入版本：v3.2.0
##### spark_resource_path

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：Spark 依赖包的根目录。
- 引入版本：-
##### stream_load_default_timeout_second

- 默认值：600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：每个 Stream Load 任务的默认超时时长。
- 引入版本：-
##### stream_load_max_txn_num_per_be

- 默认值：-1
- 类型：Int
- 单位：Transactions
- 是否可变：是
- 描述：限制从单个 BE（后端）主机接受的并发 stream load 事务的数量。当设置为非负整数时，FrontendServiceImpl 会检查 BE 的当前事务计数（按客户端 IP），如果计数 >= 此限制，则拒绝新的 stream load begin 请求。值 &lt; 0 表示禁用限制（无限制）。此检查发生在 stream load begin 期间，超出限制时可能会导致 `streamload txn num per be exceeds limit` 错误。相关的运行时行为使用 `stream_load_default_timeout_second` 作为请求超时回退。
- 引入版本：v3.3.0、v3.4.0、v3.5.0
##### stream_load_task_keep_max_num

- 默认值：1000
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：StreamLoadMgr 在内存中保留的 Stream Load 任务的最大数量（全局，适用于所有数据库）。当跟踪的任务数 (`idToStreamLoadTask`) 超过此阈值时，StreamLoadMgr 首先调用 `cleanSyncStreamLoadTasks()` 以删除已完成的同步数据导入任务；如果大小仍然大于此阈值的一半，则调用 `cleanOldStreamLoadTasks(true)` 以强制删除较旧或已完成的任务。增加此值可在内存中保留更多任务历史记录；减少此值可降低内存使用率并使清理更积极。此值仅控制内存中的保留，不影响持久化/重放的任务。
- 引入版本：v3.2.0
##### stream_load_task_keep_max_second

- 默认值：3 * 24 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：已完成或已取消的 Stream Load 任务的保留窗口。如果一个任务达到最终状态，并且其结束时间戳早于此阈值（`currentMs - endTimeMs > stream_load_task_keep_max_second * 1000`），则它有资格被 `StreamLoadMgr.cleanOldStreamLoadTasks` 移除，并在加载持久化状态时被丢弃。适用于 `StreamLoadTask` 和 `StreamLoadMultiStmtTask`。如果任务总数超过 `stream_load_task_keep_max_num`，则可能会提前触发清理（同步任务由 `cleanSyncStreamLoadTasks` 优先处理）。设置此项以平衡历史记录/可调试性和内存使用。
- 引入版本：v3.2.0
##### transaction_clean_interval_second

- 默认值: 30
- 类型: Int
- 单位: 秒
- 是否可修改: 否
- 描述: 清理已完成事务的时间间隔。单位：秒。建议您指定一个较短的时间间隔，以确保及时清理已完成的事务。
- 引入版本: -
##### transaction_stream_load_coordinator_cache_capacity

- 默认值：4096
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：用于存储从事务标签到协调器节点的映射的缓存的容量。
- 引入版本：-
##### transaction_stream_load_coordinator_cache_expire_seconds

- 默认值：900
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：在协调器映射从缓存中逐出之前，缓存在缓存中保留的时间 (TTL)。
- 引入版本：-
##### yarn_client_path

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/lib/yarn-client/hadoop/bin/yarn"
- 类型：String
- 单位：-
- 是否可变：否
- 描述：Yarn 客户端包的根目录。
- 引入版本：-
##### yarn_config_dir

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/lib/yarn-config"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：存储 Yarn 配置文件的目录。
- 引入版本：-
### 统计报告
##### enable_collect_warehouse_metrics

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：如果设置为 `true`，系统会收集并导出每个 warehouse 的指标。启用此项会将 warehouse 级别的指标（slot/使用率/可用性）添加到指标输出中，并增加指标基数和收集开销。禁用此项会省略特定于 warehouse 的指标，并降低 CPU/网络和监控存储成本。
- 引入版本：v3.5.0
##### enable_http_detail_metrics

- 默认值：false
- 类型：boolean
- 单位：-
- 是否可修改：是
- 描述：如果为 true，HTTP 服务器会计算并公开详细的 HTTP worker 指标（特别是 `HTTP_WORKER_PENDING_TASKS_NUM` 指标）。启用此参数会导致服务器迭代 Netty worker 执行器，并在每个 `NioEventLoop` 上调用 `pendingTasks()` 以统计待处理的任务数；如果禁用此参数，则该指标返回 0，以避免产生开销。这种额外的收集可能会占用大量 CPU 资源并对延迟敏感 - 仅在调试或详细调查时启用。
- 引入版本：v3.2.3
##### proc_profile_collect_time_s

- 默认值: 120
- 类型: Int
- 单位: 秒
- 是否可修改: 是
- 描述: 单个进程 profile 收集的持续时间，以秒为单位。当 `proc_profile_cpu_enable` 或 `proc_profile_mem_enable` 设置为 `true` 时，AsyncProfiler 启动，收集器线程休眠此持续时间，然后停止 profiler 并写入 profile。较大的值会增加样本覆盖率和文件大小，但会延长 profiler 运行时并延迟后续收集；较小的值会降低开销，但可能产生不足的样本。确保此值与 `proc_profile_file_retained_days` 和 `proc_profile_file_retained_size_bytes` 等保留设置保持一致。
- 引入版本: v3.2.12
### 存储
##### alter_table_timeout_second

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: `schema change` 操作 (ALTER TABLE) 的超时时长。
- 引入版本: -
##### capacity_used_percent_high_water

- 默认值：0.75
- 类型：double
- 单位：小数 (0.0–1.0)
- 是否可变：是
- 描述：用于计算后端负载评分时，磁盘已用容量百分比（已用容量占总容量的比例）的高水位阈值。`BackendLoadStatistic.calcSore` 使用 `capacity_used_percent_high_water` 来设置 `LoadScore.capacityCoefficient`：如果某个 BE 的已用百分比小于 0.5，则该系数等于 0.5；如果已用百分比 > `capacity_used_percent_high_water`，则该系数 = 1.0；否则，该系数通过 (2 * usedPercent - 0.5) 随已用百分比线性变化。当系数为 1.0 时，负载评分完全由容量比例驱动；较低的值会增加副本计数的权重。调整此值会改变 balancer 对具有高磁盘利用率的 BE 的惩罚力度。
- 引入版本：v3.2.0
##### catalog_trash_expire_second

- 默认值：86400
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：数据库、表或分区删除后，元数据可以保留的最长时间。如果超过此时间，数据将被删除，并且无法通过 [RECOVER] (../../sql-reference/sql-statements/backup_restore/RECOVER.md) 命令恢复。
- 引入版本：-
##### check_consistency_default_timeout_second

- 默认值: 600
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: 副本一致性检查的超时时间。您可以根据您的 tablet 的大小设置此参数。
- 引入版本: -
##### consistency_check_cooldown_time_second

- 默认值：24 * 3600
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：控制同一 tablet 的一致性检查之间的最小间隔（以秒为单位）。在 tablet 选择期间，仅当 `tablet.getLastCheckTime()` 小于 `(currentTimeMillis - consistency_check_cooldown_time_second * 1000)` 时，tablet 才被认为是符合条件的。默认值 (24 * 3600) 强制每个 tablet 每天大约检查一次，以减少后端磁盘 I/O。降低此值会增加检查频率和资源使用量；提高此值会减少 I/O，但会降低不一致性检测的速度。该值在从索引的 tablet 列表中过滤掉已冷却的 tablet 时全局应用。
- 引入版本：v3.5.5
##### consistency_check_end_time

- 默认值: "4"
- 类型: String
- 单位: 小时 (0-23)
- 是否可修改: 否
- 描述: 指定 ConsistencyChecker 工作窗口的结束时间（一天中的小时）。该值通过系统时区中的 SimpleDateFormat("HH") 进行解析，并接受为 0–23（一位或两位数字）。StarRocks 将其与 `consistency_check_start_time` 一起使用，以确定何时调度和添加一致性检查作业。当 `consistency_check_start_time` 大于 `consistency_check_end_time` 时，窗口将跨越午夜（例如，默认值为 `consistency_check_start_time` = "23" 到 `consistency_check_end_time` = "4"）。当 `consistency_check_start_time` 等于 `consistency_check_end_time` 时，检查器永远不会运行。解析失败会导致 FE 启动时记录错误并退出，因此请提供有效的小时字符串。
- 引入版本: v3.2.0
##### consistency_check_start_time

- 默认值: "23"
- 类型: String
- 单位: 小时 (00-23)
- 是否可修改: 否
- 描述: 指定 ConsistencyChecker 工作窗口的开始时间（一天中的小时）。该值通过系统时区中的 SimpleDateFormat("HH") 进行解析，并接受 0–23（一位或两位数字）。StarRocks 将其与 `consistency_check_end_time` 结合使用，以确定何时调度和添加一致性检查作业。当 `consistency_check_start_time` 大于 `consistency_check_end_time` 时，窗口将跨越午夜（例如，默认值为 `consistency_check_start_time` = "23" 到 `consistency_check_end_time` = "4"）。当 `consistency_check_start_time` 等于 `consistency_check_end_time` 时，检查器永远不会运行。解析失败会导致 FE 启动时记录错误并退出，因此请提供有效的小时字符串。
- 引入版本: v3.2.0
##### consistency_tablet_meta_check_interval_ms

- 默认值：2 * 3600 * 1000
- 类型：Int
- 单位：毫秒
- 是否可变：是
- 描述：ConsistencyChecker 使用的间隔，用于在 `TabletInvertedIndex` 和 `LocalMetastore` 之间运行完整的 tablet 元数据一致性扫描。当 `当前时间 - lastTabletMetaCheckTime` 超过此值时，`runAfterCatalogReady` 中的守护程序会触发 checkTabletMetaConsistency。首次检测到无效 tablet 时，其 `toBeCleanedTime` 将设置为 `now + (consistency_tablet_meta_check_interval_ms / 2)`，因此实际删除将延迟到后续扫描。增加此值可降低扫描频率和负载（清理速度较慢）；降低此值可更快地检测和删除过时的 tablet（开销更高）。
- 引入版本：v3.2.0
##### default_replication_num

- 默认值：3
- 类型：Short
- 单位：-
- 是否可修改：是
- 描述：设置在 StarRocks 中创建表时，每个数据分区的默认副本数。您可以在创建表时，通过在 CREATE TABLE DDL 中指定 `replication_num=x` 来覆盖此设置。
- 引入版本：-
##### enable_auto_tablet_distribution

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否自动设置 bucket 的数量。
  - 如果此参数设置为 `TRUE`，则在创建表或添加分区时，无需指定 bucket 的数量。StarRocks 会自动确定 bucket 的数量。
  - 如果此参数设置为 `FALSE`，则在创建表或添加分区时，需要手动指定 bucket 的数量。如果在向表中添加新分区时未指定 bucket 数量，则新分区将继承创建表时设置的 bucket 数量。但是，您也可以手动为新分区指定 bucket 的数量。
- 从以下版本引入：v2.5.7
##### enable_experimental_rowstore

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否启用 [行列混存](../../table_design/hybrid_table.md) 功能。
- 引入版本：v3.2.3
##### enable_fast_schema_evolution

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否为 StarRocks 集群中的所有表启用快速 schema change。有效值为 `TRUE` 和 `FALSE` (默认值)。启用快速 schema change 可以提高 schema change 的速度，并在添加或删除列时减少资源使用。
- 引入版本：v3.2.0

> **注意**
>
> - StarRocks 存算分离集群从 v3.3.0 开始支持此参数。
> - 如果您需要为特定表配置快速 schema change，例如禁用特定表的快速 schema change，您可以在创建表时设置表属性 [`fast_schema_evolution`](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md#set-fast-schema-evolution) 。
##### enable_online_optimize_table

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：控制 StarRocks 在创建优化任务时是否使用非阻塞在线优化路径。当 `enable_online_optimize_table` 为 true 且目标表满足兼容性检查（没有分区/keys/sort specification，分布不是 `RandomDistributionDesc`，存储类型不是 `COLUMN_WITH_ROW`，启用了副本存储，并且该表不是存算分离表或物化视图）时，planner 会创建一个 `OnlineOptimizeJobV2` 来执行优化，而不会阻塞写入。如果为 false 或任何兼容性条件失败，StarRocks 将回退到 `OptimizeJobV2`，这可能会在优化期间阻止写入操作。
- 引入版本：v3.3.3, v3.4.0, v3.5.0
##### enable_strict_storage_medium_check

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：用于指定在用户创建表时，FE 是否需要严格检查 BE 的存储介质。如果设置为 `TRUE`，则在用户创建表时，FE 会检查 BE 的存储介质，如果 BE 的存储介质与 CREATE TABLE 语句中指定的 `storage_medium` 参数不同，则会报错。例如，CREATE TABLE 语句中指定的存储介质为 SSD，但 BE 的实际存储介质为 HDD，则表创建会失败。如果此参数为 `FALSE`，则 FE 在用户创建表时不检查 BE 的存储介质。
- 引入版本：-
##### max_bucket_number_per_partition

- 默认值: 1024
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 一个分区中可以创建的最大 bucket 数量。
- 引入版本: v3.3.2
##### max_column_number_per_table

- 默认值：10000
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：表中可以创建的最大列数。
- 引入版本：v3.3.2
##### max_dynamic_partition_num

- 默认值：500
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：限制在分析或创建动态分区表时可以一次创建的最大分区数。在动态分区 property enforcement 期间，systemtask_runs_max_history_number 会计算预期的分区数（结束偏移量 + 历史分区数），如果总数超过 `max_dynamic_partition_num`，则会抛出 DDL 错误。仅当您期望有非常大的分区范围时才提高此值；增加此值允许创建更多分区，但会增加元数据大小、调度工作和操作复杂性。
- 引入版本：v3.2.0
##### max_partition_number_per_table

- 默认值: 100000
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 一个表中可以创建的最大分区数。
- 引入版本: v3.3.2
##### max_task_consecutive_fail_count

- 默认值：10
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：任务在被调度器自动暂停之前可能连续失败的最大次数。当 `TaskSource.MV.equals(task.getSource())` 且 `max_task_consecutive_fail_count` 大于 0 时，如果任务的连续失败计数器达到或超过 `max_task_consecutive_fail_count`，则该任务将通过 TaskManager 暂停，并且对于物化视图任务，该物化视图将被停用。将抛出一个异常，指示暂停以及如何重新激活（例如，`ALTER MATERIALIZED VIEW <mv_name> ACTIVE`）。将此项设置为 0 或负值以禁用自动暂停。
- 引入版本：-
##### partition_recycle_retention_period_secs

- 默认值：1800
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：通过 INSERT OVERWRITE 或物化视图刷新操作删除的分区的元数据保留时间。请注意，此类元数据无法通过执行 [RECOVER](../../sql-reference/sql-statements/backup_restore/RECOVER.md) 进行恢复。
- 引入版本：v3.5.9
##### recover_with_empty_tablet

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否使用空 tablet 副本替换丢失或损坏的 tablet 副本。如果某个 tablet 副本丢失或损坏，则对该 tablet 或其他正常 tablet 的数据查询可能会失败。使用空 tablet 副本替换丢失或损坏的 tablet 副本可确保查询仍可执行。但是，由于数据丢失，结果可能不正确。默认值为 `FALSE`，表示不会使用空 tablet 副本替换丢失或损坏的 tablet 副本，并且查询失败。
- 引入版本：-
##### storage_usage_hard_limit_percent

- 默认值：95
- 别名：storage_flood_stage_usage_percent
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：BE 目录中存储使用率的硬性限制百分比。如果 BE 存储目录的存储使用率（百分比）超过此值，并且剩余存储空间小于 `storage_usage_hard_limit_reserve_bytes`，则数据导入和恢复作业将被拒绝。您需要将此项与 BE 配置项 `storage_flood_stage_usage_percent` 一起设置，以使配置生效。
- 引入版本：-
##### storage_usage_hard_limit_reserve_bytes

- 默认值：100 * 1024 * 1024 * 1024
- 别名：storage_flood_stage_left_capacity_bytes
- 类型：Long
- 单位：Bytes
- 是否可修改：是
- 描述：BE 目录中剩余存储空间的硬性限制。如果 BE 存储目录中的剩余存储空间小于此值，并且存储使用率（百分比）超过 `storage_usage_hard_limit_percent`，则数据导入和恢复作业将被拒绝。您需要将此参数与 BE 配置项 `storage_flood_stage_left_capacity_bytes` 一起设置，以使配置生效。
- 引入版本：-
##### storage_usage_soft_limit_percent

- 默认值：90
- 别名：storage_high_watermark_usage_percent
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：BE 目录中存储使用率的软限制百分比。如果 BE 存储目录的存储使用率（以百分比表示）超过此值，并且剩余存储空间小于 `storage_usage_soft_limit_reserve_bytes`，则无法将 tablet 克隆到此目录中。
- 引入版本：-
##### storage_usage_soft_limit_reserve_bytes

- 默认值：200 * 1024 * 1024 * 1024
- 别名：storage_min_left_capacity_bytes
- 类型：Long
- 单位：Bytes
- 是否可修改：是
- 描述：BE 目录中剩余存储空间的软限制。如果 BE 存储目录中的剩余存储空间小于此值，并且存储使用率（百分比）超过 `storage_usage_soft_limit_percent`，则无法将 tablet 克隆到此目录中。
- 引入版本：-
##### tablet_checker_lock_time_per_cycle_ms

- 默认值：1000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：tablet checker 在释放并重新获取表锁之前，每个周期的最大锁持有时间。小于 100 的值将被视为 100。
- 引入版本：v3.5.9, v4.0.2
##### tablet_create_timeout_second

- 默认值：10
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：创建 tablet 的超时时间。从 v3.1 版本开始，默认值从 1 秒更改为 10 秒。
- 引入版本：-
##### tablet_delete_timeout_second

- 默认值：2
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：删除一个 tablet 的超时时间。
- 引入版本：-
##### tablet_sched_balance_load_disk_safe_threshold

- 默认值：0.5
- 别名：balance_load_disk_safe_threshold
- 类型：Double
- 单位：-
- 是否可变：是
- 描述：用于确定BE磁盘使用率是否均衡的百分比阈值。如果所有BE的磁盘使用率都低于此值，则认为磁盘使用率是均衡的。如果磁盘使用率大于此值，并且最高和最低BE磁盘使用率之间的差异大于10％，则认为磁盘使用率不均衡，并将触发tablet重新平衡。
- 引入版本：-
##### tablet_sched_balance_load_score_threshold

- 默认值: 0.1
- 别名: balance_load_score_threshold
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 用于确定BE负载是否均衡的百分比阈值。如果一个BE的负载低于所有BE的平均负载，并且差值大于此值，则该BE处于低负载状态。相反，如果一个BE的负载高于平均负载，并且差值大于此值，则该BE处于高负载状态。
- 引入版本: -
##### tablet_sched_be_down_tolerate_time_s

- 默认值：900
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：调度器允许 BE 节点保持非活动状态的最长时间。 达到时间阈值后，该 BE 节点上的 tablet 将迁移到其他活动的 BE 节点。
- 引入版本：v2.5.7
##### tablet_sched_disable_balance

- 默认值：false
- 别名：disable_balance
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否禁用 tablet 均衡。`TRUE` 表示禁用 tablet 均衡。`FALSE` 表示启用 tablet 均衡。
- 引入版本：-
##### tablet_sched_disable_colocate_balance

- 默认值：false
- 别名：disable_colocate_balance
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否禁用 Colocate Table 的副本均衡。`TRUE` 表示禁用副本均衡。`FALSE` 表示启用副本均衡。
- 引入版本：-
##### tablet_sched_max_balancing_tablets

- 默认值：500
- 别名：max_balancing_tablets
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：可以同时进行 re-balancing 的 tablet 的最大数量。如果超过此值，将跳过 tablet 的 re-balancing。
- 引入版本：-
##### tablet_sched_max_clone_task_timeout_sec

- 默认值: 2 * 60 * 60
- 别名: max_clone_task_timeout_sec
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: 克隆一个 tablet 的最大超时时间。
- 引入版本: -
##### tablet_sched_max_not_being_scheduled_interval_ms

- 默认值：15 * 60 * 1000
- 类型：Long
- 单位：毫秒
- 是否可修改：是
- 描述：当 tablet 克隆任务正在被调度时，如果一个 tablet 在该参数指定的时间内没有被调度，StarRocks 会给它更高的优先级，以便尽快调度它。
- 引入版本：-
##### tablet_sched_max_scheduling_tablets

- 默认值: 10000
- 别名: max_scheduling_tablets
- 类型: Int
- 单位: -
- 是否可修改: 是
- 描述: 可同时调度的 tablet 的最大数量。如果超过此值，将跳过 tablet 均衡和修复检查。
- 引入版本: -
##### tablet_sched_min_clone_task_timeout_sec

- 默认值: 3 * 60
- 别名: min_clone_task_timeout_sec
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: 克隆一个 tablet 的最小超时时间。
- 引入版本: -
##### tablet_sched_num_based_balance_threshold_ratio

- 默认值：0.5
- 别名：-
- 类型：Double
- 单位：-
- 是否可变：是
- 描述：执行基于数量的均衡可能会打破磁盘大小的均衡，但是磁盘之间的最大差距不能超过 tablet_sched_num_based_balance_threshold_ratio * tablet_sched_balance_load_score_threshold。如果集群中有 tablet 不断地从 A 均衡到 B，又从 B 均衡到 A，请减小此值。如果希望 tablet 分布更加均衡，请增大此值。
- 引入版本：- 3.1
##### tablet_sched_repair_delay_factor_second

- 默认值：60
- 别名：tablet_repair_delay_factor_second
- 类型：Long
- 单位：秒
- 是否可变：是
- 描述：副本修复的间隔，以秒为单位。
- 引入版本：-
##### tablet_sched_slot_num_per_path

- 默认值：8
- 别名：schedule_slot_num_per_path
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：BE 存储目录下可并发运行的与 tablet 相关的最大任务数。从 v2.5 版本开始，此参数的默认值从 `4` 更改为 `8`。
- 引入版本：-
##### tablet_sched_storage_cooldown_second

- 默认值：-1
- 别名：storage_cooldown_second
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：从表创建时开始自动降冷的延迟时间。默认值 `-1` 指定禁用自动降冷。如果要启用自动降冷，请将此参数设置为大于 `-1` 的值。
- 引入版本：-
##### tablet_stat_update_interval_second

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可修改：否
- 描述：FE 从每个 BE 检索 tablet 统计信息的时间间隔。
- 引入版本：-
### 存算分离
##### aws_s3_access_key

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于访问您的 S3 bucket 的 Access Key ID。
- 引入版本：v3.0
##### aws_s3_endpoint

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于访问您的 S3 bucket 的 endpoint，例如 `https://s3.us-west-2.amazonaws.com`。
- 引入版本：v3.0
##### aws_s3_external_id

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于跨账户访问 S3 bucket 的 AWS 账户的外部 ID。
- 引入版本：v3.0
##### aws_s3_iam_role_arn

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：拥有访问您 S3 bucket 中数据文件权限的 IAM 角色的 ARN。
- 引入版本：v3.0
##### aws_s3_path

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于存储数据的 S3 路径。它由您的 S3 存储桶的名称及其下的子路径（如果有）组成，例如 `testbucket/subpath`。
- 引入版本：v3.0
##### aws_s3_region

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：您的 S3 bucket 所在的区域，例如 `us-west-2`。
- 引入版本：v3.0
##### aws_s3_secret_key

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于访问您的 S3 bucket 的 Secret Access Key。
- 引入版本：v3.0
##### aws_s3_use_aws_sdk_default_behavior

- 默认值：false
- 类型：布尔值
- 单位：-
- 是否可修改：否
- 描述：是否使用 AWS SDK 的默认身份验证凭证。有效值：true 和 false（默认）。
- 引入版本：v3.0
##### aws_s3_use_instance_profile

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：是否使用 Instance Profile 和 Assumed Role 作为访问 S3 的凭证方法。有效值：true 和 false（默认值）。
  - 如果您使用基于 IAM 用户的凭证（Access Key 和 Secret Key）访问 S3，则必须将此项指定为 `false`，并指定 `aws_s3_access_key` 和 `aws_s3_secret_key`。
  - 如果您使用 Instance Profile 访问 S3，则必须将此项指定为 `true`。
  - 如果您使用 Assumed Role 访问 S3，则必须将此项指定为 `true`，并指定 `aws_s3_iam_role_arn`。
  - 并且如果您使用外部 AWS 账户，您还必须指定 `aws_s3_external_id`。
- 引入版本：v3.0
##### azure_adls2_endpoint

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：您的 Azure Data Lake Storage Gen2 账号的 endpoint，例如 `https://test.dfs.core.windows.net`。
- 引入版本：v3.4.1
##### azure_adls2_oauth2_client_id

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于授权对您的 Azure Data Lake Storage Gen2 请求的托管身份的客户端 ID。
- 引入版本：v3.4.4
##### azure_adls2_oauth2_tenant_id

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于授权对您的 Azure Data Lake Storage Gen2 的请求的托管身份的租户 ID。
- 引入版本：v3.4.4
##### azure_adls2_oauth2_use_managed_identity

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：是否使用托管身份验证 Azure Data Lake Storage Gen2 的请求。
- 引入版本：v3.4.4
##### azure_adls2_path

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：用于存储数据的 Azure Data Lake Storage Gen2 路径。它由文件系统名称和目录名称组成，例如 `testfilesystem/starrocks`。
- 引入版本：v3.4.1
##### azure_adls2_sas_token

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于授权对您的 Azure Data Lake Storage Gen2 的请求的共享访问签名 (SAS)。
- 引入版本：v3.4.1
##### azure_adls2_shared_key

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于授权对您的 Azure Data Lake Storage Gen2 的请求的共享密钥。
- 引入版本：v3.4.1
##### azure_blob_endpoint

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：您的 Azure Blob Storage 账户的 endpoint，例如 `https://test.blob.core.windows.net`。
- 引入版本：v3.1
##### azure_blob_path

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于存储数据的 Azure Blob Storage 路径。它由存储帐户中容器的名称和容器下的子路径（如果有）组成，例如 `testcontainer/subpath`。
- 引入版本：v3.1
##### azure_blob_sas_token

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于授权对您的 Azure Blob Storage 的请求的共享访问签名 (SAS)。
- 引入版本：v3.1
##### azure_blob_shared_key

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于授权 Azure Blob Storage 请求的共享密钥。
- 引入版本：v3.1
##### azure_use_native_sdk

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否使用原生 SDK 访问 Azure Blob Storage，从而允许使用托管身份和服务主体进行身份验证。如果此项设置为 `false`，则仅允许使用共享密钥和 SAS Token 进行身份验证。
- 引入版本：v3.4.4
##### cloud_native_hdfs_url

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：HDFS 存储的 URL，例如 `hdfs://127.0.0.1:9000/user/xxx/starrocks/`。
- 引入版本：-
##### cloud_native_meta_port

- 默认值: 6090
- 类型: Int
- 单位: -
- 是否可修改: 否
- 描述: FE 云原生元数据服务器 RPC 监听端口。
- 引入版本: -
##### cloud_native_storage_type

- 默认值：S3
- 类型：String
- 单位：-
- 是否可变：否
- 描述：您使用的对象存储的类型。在存算分离模式下，StarRocks 支持将数据存储在 HDFS、Azure Blob (从 v3.1.1 版本开始支持)、Azure Data Lake Storage Gen2 (从 v3.4.1 版本开始支持)、Google Storage (使用原生 SDK，从 v3.5.1 版本开始支持) 以及与 S3 协议兼容的对象存储系统（例如 AWS S3 和 MinIO）中。有效值：`S3`（默认）、`HDFS`、`AZBLOB`、`ADLS2` 和 `GS`。如果您将此参数指定为 `S3`，则必须添加以 `aws_s3` 为前缀的参数。如果您将此参数指定为 `AZBLOB`，则必须添加以 `azure_blob` 为前缀的参数。如果您将此参数指定为 `ADLS2`，则必须添加以 `azure_adls2` 为前缀的参数。如果您将此参数指定为 `GS`，则必须添加以 `gcp_gcs` 为前缀的参数。如果您将此参数指定为 `HDFS`，则只需指定 `cloud_native_hdfs_url`。
- 引入版本：-
##### enable_load_volume_from_conf

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：是否允许 StarRocks 使用 FE 配置文件中指定的对象存储相关属性来创建内置的存储卷。从 v3.4.1 版本开始，默认值从 `true` 更改为 `false`。
- 引入版本：v3.1.0
##### gcp_gcs_impersonation_service_account

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：如果您使用基于模拟的身份验证来访问 Google Storage，则您要模拟的服务帐户。
- 引入版本：v3.5.1
##### gcp_gcs_path

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于存储数据的 Google Cloud 路径。它由您的 Google Cloud 存储桶的名称以及其下的子路径（如果有）组成，例如 `testbucket/subpath`。
- 引入版本：v3.5.1
##### gcp_gcs_service_account_email

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：创建服务帐户时生成的 JSON 文件中的电子邮件地址，例如 `user@hello.iam.gserviceaccount.com`。
- 引入版本：v3.5.1
##### gcp_gcs_service_account_private_key

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：在创建服务帐户时生成的 JSON 文件中的私钥，例如 `-----BEGIN PRIVATE KEY----xxxx-----END PRIVATE KEY-----\n`。
- 引入版本：v3.5.1
##### gcp_gcs_service_account_private_key_id

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：创建服务帐户时生成的 JSON 文件中的私钥 ID。
- 引入版本：v3.5.1
##### gcp_gcs_use_compute_engine_service_account

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：是否使用绑定到您的 Compute Engine 的服务帐户。
- 引入版本：v3.5.1
##### hdfs_file_system_expire_seconds

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可变：是
- 描述：由 HdfsFsManager 管理的未使用的缓存 HDFS/ObjectStore FileSystem 的生存时间（以秒为单位）。FileSystemExpirationChecker（每 60 秒运行一次）使用此值调用每个 HdfsFs.isExpired(...)；过期时，管理器关闭底层 FileSystem 并将其从缓存中删除。访问器方法（例如 `HdfsFs.getDFSFileSystem`、`getUserName`、`getConfiguration`）更新上次访问的时间戳，因此过期是基于不活动状态。较低的值会减少空闲资源占用，但会增加重新打开的开销；较高的值会保持句柄更长时间，并可能消耗更多资源。
- 引入版本：v3.2.0
##### lake_autovacuum_grace_period_minutes

- 默认值：30
- 类型：Long
- 单位：分钟
- 是否可修改：是
- 描述： 存算分离集群中保留历史数据版本的时间范围。在此时间范围内的历史数据版本在 Compaction 后不会通过 AutoVacuum 自动清理。您需要将此值设置得大于最大查询时间，以避免正在运行的查询访问的数据在查询完成之前被删除。自 v3.3.0、v3.2.5 和 v3.1.10 起，默认值已从 `5` 更改为 `30`。
- 引入版本：v3.1.0
##### lake_autovacuum_parallel_partitions

- 默认值：8
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：在存算分离集群中，可以同时进行 AutoVacuum 的最大分区数。AutoVacuum 是指 Compaction 之后的垃圾回收。
- 引入版本：v3.1.0
##### lake_autovacuum_partition_naptime_seconds

- 默认值：180
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：在存算分离集群中，对同一分区执行 AutoVacuum 操作的最小间隔。
- 引入版本：v3.1.0
##### lake_autovacuum_stale_partition_threshold

- 默认值：12
- 类型：Long
- 单位：小时
- 是否可修改：是
- 描述：如果一个分区在此时间范围内没有更新（数据导入、DELETE 或 Compaction），系统将不会对该分区执行 AutoVacuum。
- 引入版本：v3.1.0
##### lake_compaction_allow_partial_success

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果设置为 `true`，当存算分离集群中的一个子任务成功时，系统会认为此次 Compaction 操作成功。
- 引入版本：v3.5.2
##### lake_compaction_disable_ids

- 默认值：""
- 类型：String
- 单位：-
- 是否可修改：是
- 描述：在存算分离模式下，禁用 Compaction 的表或分区列表。格式为 `tableId1;partitionId2`，用分号分隔，例如 `12345;98765`。
- 引入版本：v3.4.4
##### lake_compaction_history_size

- 默认值：20
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：在存算分离集群中，保存在 Leader FE 节点内存中的最近成功完成的 Compaction 任务记录数。您可以使用 `SHOW PROC '/compactions'` 命令查看最近成功完成的 Compaction 任务记录。请注意，Compaction 历史记录存储在 FE 进程内存中，如果 FE 进程重启，这些记录将丢失。
- 引入版本：v3.1.0
##### lake_compaction_max_tasks

- 默认值：-1
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：在存算分离集群中允许的最大并发 Compaction 任务数。如果将此项设置为 `-1`，则表示以自适应方式计算并发任务数。如果将此值设置为 `0`，则禁用 Compaction。
- 引入版本：v3.1.0
##### lake_compaction_score_selector_min_score

- 默认值：10.0
- 类型：Double
- 单位：-
- 是否可修改：是
- 描述：触发存算分离集群执行 Compaction 操作的 Compaction Score 阈值。当某个 Partition 的 Compaction Score 大于或等于该值时，系统会对该 Partition 执行 Compaction。
- 引入版本：v3.1.0
##### lake_compaction_score_upper_bound

- 默认值：2000
- 类型：Long
- 单位：-
- 是否可修改：是
- 描述：存算分离集群中，单个分区 Compaction Score 的上限。`0` 表示无上限。仅当 `lake_enable_ingest_slowdown` 设置为 `true` 时，此配置项生效。当分区的 Compaction Score 达到或超过此上限时，系统会拒绝新的数据导入任务。从 v3.3.6 版本开始，默认值从 `0` 更改为 `2000`。
- 引入版本：v3.2.0
##### lake_enable_balance_tablets_between_workers

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：在存算分离集群中，云原生表的 tablet 迁移期间，是否均衡计算节点上的 tablet 数量。`true` 表示均衡计算节点上的 tablet，`false` 表示禁用此功能。
- 引入版本：v3.3.4
##### lake_enable_ingest_slowdown

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否在存算分离集群中启用数据导入减速。启用数据导入减速后，如果某个分区的 Compaction Score 超过 `lake_ingest_slowdown_threshold`，则该分区上的导入任务将被限流。此配置仅在 `run_mode` 设置为 `shared_data` 时生效。从 v3.3.6 版本开始，默认值从 `false` 更改为 `true`。
- 引入版本：v3.2.0
##### lake_ingest_slowdown_threshold

- 默认值：100
- 类型：Long
- 单位：-
- 是否可修改：是
- 描述：在存算分离集群中，触发数据导入减速的 Compaction Score 阈值。此配置仅在 `lake_enable_ingest_slowdown` 设置为 `true` 时生效。
- 引入版本：v3.2.0
##### lake_publish_version_max_threads

- 默认值：512
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：在存算分离集群中，Version Publish 任务的最大线程数。
- 引入版本：v3.2.0
##### meta_sync_force_delete_shard_meta

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否允许直接删除存算分离集群的元数据，跳过清理远端存储文件。 仅当需要清理的分片数量过多，导致 FE JVM 内存压力过大时，才建议将此项设置为 `true`。 请注意，启用此功能后，属于分片或 tablet 的数据文件将无法自动清理。
- 引入版本：v3.2.10，v3.3.3
##### run_mode

- 默认值：shared_nothing
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：StarRocks 集群的运行模式。有效值：`shared_data` 和 `shared_nothing`（默认）。
  - `shared_data` 表示在存算分离模式下运行 StarRocks。
  - `shared_nothing` 表示在存算一体模式下运行 StarRocks。

  > **注意**
  >
  > - 您不能同时为 StarRocks 集群采用 `shared_data` 和 `shared_nothing` 模式。不支持混合部署。
  > - 集群部署后，请勿更改 `run_mode`。否则，集群将无法重启。不支持从存算一体集群转换为存算分离集群，反之亦然。

- 引入版本：-
##### shard_group_clean_threshold_sec

- 默认值：3600
- 类型：Long
- 单位：秒
- 是否可修改：是
- 描述：FE 清理存算分离集群中未使用的 tablet 和分片组的时间间隔。在此时间阈值内创建的 tablet 和分片组将不会被清理。
- 引入版本：-
##### star_mgr_meta_sync_interval_sec

- 默认值：600
- 类型：Long
- 单位：秒
- 是否可修改：否
- 描述：在存算分离集群中，FE 与 StarMgr 运行周期性元数据同步的间隔。
- 引入版本：-
##### starmgr_grpc_server_max_worker_threads

- 默认值：1024
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：FE starmgr 模块中 gRPC 服务器使用的最大工作线程数。
- 引入版本：v4.0.0，v3.5.8
##### starmgr_grpc_timeout_seconds

- 默认值：5
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：
- 引入版本：-
### 数据湖
##### files_enable_insert_push_down_schema

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：启用后，分析器将尝试将目标表结构推送到 `files()` 表函数中，以用于 INSERT ... FROM files() 操作。这仅在源是 FileTableFunctionRelation，目标是内表，并且 SELECT 列表包含相应的 slot-ref 列（或 *）时适用。分析器会将 select 列与目标列进行匹配（计数必须匹配），短暂锁定目标表，并将文件列类型替换为非复杂类型的深度复制目标列类型（跳过诸如 parquet json -> array&lt;varchar&gt; 之类的复杂类型）。保留原始 files 表中的列名。这减少了数据摄取期间基于文件的类型推断导致的类型不匹配和松散性。
- 引入版本：v3.4.0，v3.5.0
##### hdfs_read_buffer_size_kb

- 默认值：8192
- 类型：Int
- 单位：千字节
- 是否可变：是
- 描述：HDFS 读取缓冲区的大小，以千字节为单位。StarRocks 将此值转换为字节 (`<< 10`)，并使用它来初始化 `HdfsFsManager` 中的 HDFS 读取缓冲区，并在不使用 Broker 访问时，填充发送到 BE 任务的 thrift 字段 `hdfs_read_buffer_size_kb`（例如，`TBrokerScanRangeParams`、`TDownloadReq`）。增加 `hdfs_read_buffer_size_kb` 可以提高顺序读取吞吐量，并减少系统调用开销，但会增加每个流的内存使用量；减少它可以减少内存占用，但可能会降低 IO 效率。调整时请考虑工作负载（许多小流与少量大型顺序读取）。
- 引入版本：v3.2.0
##### hdfs_write_buffer_size_kb

- 默认值: 1024
- 类型: Int
- 单位: KB
- 是否可修改: 是
- 描述: 设置直接写入 HDFS 或对象存储时使用的 HDFS 写入缓冲区大小（以 KB 为单位，不使用 broker 时）。FE 将此值转换为字节 (`<< 10`) 并在 HdfsFsManager 中初始化本地写入缓冲区，并在 Thrift 请求（例如，TUploadReq、TExportSink、sink options）中传播，以便后端/代理使用相同的缓冲区大小。增加此值可以提高大型顺序写入的吞吐量，但会增加每个写入器的内存开销；减小此值会降低每个流的内存使用量，并可能降低小型写入的延迟。与 `hdfs_read_buffer_size_kb` 一起调整，并考虑可用内存和并发写入器。
- 引入版本: v3.2.0
##### lake_batch_publish_max_version_num

- 默认值：10
- 类型：Int
- 单位：个数
- 是否可修改：是
- 描述：设置在为 lake (云原生) 表构建发布批次时，可以分组在一起的连续事务版本的上限。该值会传递给事务图批处理例程（参见 getReadyToPublishTxnListBatch），并与 `lake_batch_publish_min_version_num` 一起确定 TransactionStateBatch 的候选范围大小。较大的值可以通过批量处理更多提交来提高发布吞吐量，但会增加原子发布的范围（更长的可见性延迟和更大的回滚面），并且当版本不连续时，可能会在运行时受到限制。根据工作负载和可见性/延迟要求进行调整。
- 引入版本：v3.2.0
##### lake_batch_publish_min_version_num

- 默认值：1
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：设置 lake 表形成发布批次所需的最小连续事务版本数。DatabaseTransactionMgr.getReadyToPublishTxnListBatch 将此值与 `lake_batch_publish_max_version_num` 一起传递给 transactionGraph.getTxnsWithTxnDependencyBatch，以选择依赖事务。值为 `1` 允许单事务发布（无批处理）。大于 1 的值要求至少有那么多连续版本、单表、非复制事务可用；如果版本不连续、出现复制事务或 schema change 消耗了一个版本，则批处理将中止。增加此值可以通过对提交进行分组来提高发布吞吐量，但可能会因等待足够的连续事务而延迟发布。
- 引入版本：v3.2.0
##### lake_enable_batch_publish_version

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：启用后，PublishVersionDaemon 会批量处理同一 Lake（存算分离）表/分区的就绪事务，并一起发布它们的版本，而不是为每个事务单独发布。在存算分离 RunMode 中，守护进程调用 getReadyPublishTransactionsBatch() 并使用 publishVersionForLakeTableBatch(...) 执行分组发布操作（减少 RPC 并提高吞吐量）。禁用后，守护进程会通过 publishVersionForLakeTable(...) 回退到每个事务单独发布。该实现在切换时使用内部集合来协调进行中的工作，以避免重复发布，并且受 `lake_publish_version_max_threads` 通过线程池大小的影响。
- 引入版本：v3.2.0
##### lake_enable_tablet_creation_optimization

- 默认值：false
- 类型：boolean
- 单位：-
- 是否可变：是
- 描述：启用后，StarRocks 会优化存算分离模式下云原生表和物化视图的 tablet 创建，为物理分区下的所有 tablet 创建单个共享 tablet 元数据，而不是为每个 tablet 创建不同的元数据。这样可以减少表创建、rollup 和 schema change 作业期间产生的 tablet 创建任务和元数据/文件数量。此优化仅适用于云原生表/物化视图，并与 `file_bundling` 结合使用（后者重用相同的优化逻辑）。注意：对于使用 `file_bundling` 的表，schema change 和 rollup 作业会显式禁用此优化，以避免覆盖具有相同名称的文件。请谨慎启用 - 它会更改创建的 tablet 元数据的粒度，并可能影响副本创建和文件命名的行为。
- 引入版本：v3.3.1、v3.4.0、v3.5.0
##### lake_use_combined_txn_log

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果设置为 `true`，系统允许 Lake 表对相关事务使用组合事务日志路径。仅适用于存算分离集群。
- 引入版本：v3.3.7、v3.4.0、v3.5.0
##### enable_iceberg_commit_queue

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否为 Iceberg 表启用提交队列，以避免并发提交冲突。Iceberg 使用乐观并发控制（OCC）进行元数据提交。当多个线程同时提交到同一张表时，可能会发生冲突，并出现如下错误：“Cannot commit: Base metadata location is not same as the current table metadata location”。启用后，每个 Iceberg 表都有其自己的单线程执行器来执行提交操作，从而确保对同一表的提交是序列化的，并防止 OCC 冲突。不同的表可以并发提交，从而保持整体吞吐量。这是一个系统级的优化，旨在提高可靠性，应默认启用。如果禁用，并发提交可能会因乐观加锁冲突而失败。
- 引入版本：v4.1.0
##### iceberg_commit_queue_timeout_seconds

- 默认值：300
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：等待 Iceberg 提交操作完成的超时时间，以秒为单位。当使用提交队列 (`enable_iceberg_commit_queue=true`) 时，每个提交操作必须在此超时时间内完成。如果提交时间超过此超时时间，它将被取消并引发错误。影响提交时间的因素包括：正在提交的数据文件数量、表的元数据大小、底层存储的性能（例如，S3、HDFS）。
- 引入版本：v4.1.0
##### iceberg_commit_queue_max_size

- 默认值：1000
- 类型：Int
- 单位：Count
- 是否可变：否
- 描述：每个 Iceberg 表的最大待处理提交操作数。当使用提交队列 (`enable_iceberg_commit_queue=true`) 时，此参数限制可以为一个表排队的提交操作数。当达到限制时，额外的提交操作将在调用线程中执行（阻塞直到容量可用）。此配置在 FE 启动时读取，并应用于新创建的表执行器。需要重启 FE 才能生效。如果您希望对同一表进行多次并发提交，请增加此值。如果此值太低，则在高并发期间，提交可能会在调用线程中阻塞。
- 引入版本：v4.1.0
### 其他
##### agent_task_resend_wait_time_ms

- 默认值：5000
- 类型：Long
- 单位：毫秒
- 是否可修改：是
- 描述：FE 必须等待才能重新发送 agent task 的持续时间。只有当任务创建时间和当前时间之间的间隔超过此参数的值时，才能重新发送 agent task。此参数用于防止重复发送 agent task。
- 引入版本：-
##### allow_system_reserved_names

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否允许用户创建以 `__op` 和 `__row` 开头的列名。要启用此功能，请将此参数设置为 `TRUE`。请注意，这些名称格式在 StarRocks 中保留用于特殊目的，创建此类列可能会导致未定义的行为。因此，默认情况下禁用此功能。
- 引入版本：v3.2.0
##### auth_token

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于 FE 所属的 StarRocks 集群内身份验证的令牌。如果未指定此参数，StarRocks 将在首次启动集群的 leader FE 时，为集群生成一个随机令牌。
- 引入版本：-
##### authentication_ldap_simple_bind_base_dn

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：是
- 描述：基本 DN，LDAP 服务器从该位置开始搜索用户的身份验证信息。
- 引入版本：-
##### authentication_ldap_simple_bind_root_dn

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：是
- 描述：用于搜索用户身份验证信息的管理员 DN。
- 引入版本：-
##### authentication_ldap_simple_bind_root_pwd

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可修改：是
- 描述：用于搜索用户身份验证信息的管理员密码。
- 引入版本：-
##### authentication_ldap_simple_server_host

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：是
- 描述：LDAP 服务器运行所在的主机。
- 引入版本：-
##### authentication_ldap_simple_server_port

- 默认值：389
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：LDAP服务器的端口。
- 引入版本：-
##### authentication_ldap_simple_user_search_attr

- 默认值: uid
- 类型: String
- 单位: -
- 是否可修改: 是
- 描述: 用于标识 LDAP 对象中用户的属性名称。
- 引入版本: -
##### backup_job_default_timeout_ms

- 默认值: 86400 * 1000
- 类型: Int
- 单位: 毫秒
- 是否可修改: 是
- 描述: 备份作业的超时时长。如果超过此值，备份作业将失败。
- 引入版本: -
##### enable_collect_tablet_num_in_show_proc_backend_disk_path

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否开启在 `SHOW PROC /BACKENDS/{id}` 命令中收集每个磁盘上的 tablet 数量。
- 引入版本：v4.0.1, v3.5.8
##### enable_colocate_restore

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否为 Colocate Tables 启用备份和恢复功能。`true` 表示为 Colocate Tables 启用备份和恢复功能，`false` 表示禁用该功能。
- 引入版本：v3.2.10，v3.3.3
##### enable_materialized_view_concurrent_prepare

- 默认值：true
- 类型：Boolean
- 单位：
- 是否可修改：是
- 描述：是否并发准备物化视图以提升性能。
- 引入版本：v3.4.4
##### enable_metric_calculator

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：否
- 描述：指定是否启用定期收集指标的功能。有效值：`TRUE` 和 `FALSE`。`TRUE` 表示启用此功能，`FALSE` 表示禁用此功能。
- 引入版本：-
##### enable_mv_post_image_reload_cache

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否在 FE 加载镜像后执行重新加载标志检查。如果对基本物化视图执行检查，则不需要对与其相关的其他物化视图执行检查。
- 引入版本：v3.5.0
##### enable_mv_query_context_cache

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否开启查询级别的物化视图改写缓存，以提升查询改写性能。
- 引入版本：v3.3
##### enable_mv_refresh_collect_profile

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否默认对所有物化视图启用刷新物化视图时的 profile 收集。
- 引入版本：v3.3.0
##### enable_mv_refresh_extra_prefix_logging

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否在日志中启用物化视图名称的前缀，以便更好地进行调试。
- 引入版本：v3.4.0
##### enable_mv_refresh_query_rewrite

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否在物化视图刷新期间启用查询改写，以便查询可以直接使用改写后的物化视图，而不是基表，从而提高查询性能。
- 引入版本：v3.3
##### enable_trace_historical_node

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否允许系统跟踪历史节点。将此项设置为 `true`，您可以启用 Cache Sharing 功能，并允许系统在弹性伸缩期间选择正确的缓存节点。
- 引入版本：v3.5.1
##### es_state_sync_interval_second

- 默认值: 10
- 类型: Long
- 单位: 秒
- 是否可修改: 否
- 描述: FE 获取 Elasticsearch 索引并同步 StarRocks 外部表的元数据的时间间隔。
- 引入版本: -
##### hive_meta_cache_refresh_interval_s

- 默认值: 3600 * 2
- 类型: Long
- 单位: 秒
- 是否可修改: 否
- 描述: 缓存的 Hive 外表的元数据更新的时间间隔。
- 引入版本: -
##### hive_meta_store_timeout_s

- 默认值：10
- 类型：Long
- 单位：秒
- 是否可修改：否
- 描述：连接到 Hive Metastore 超时的时间。
- 引入版本：-
##### jdbc_connection_idle_timeout_ms

- 默认值：600000
- 类型：Int
- 单位：毫秒
- 是否可修改：否
- 描述：访问 JDBC catalog 的连接在超时之前可以保持空闲的最长时间。超时的连接被视为空闲连接。
- 引入版本：-
##### jdbc_connection_timeout_ms

- 默认值：10000
- 类型：Long
- 单位：毫秒
- 是否可修改：否
- 描述：HikariCP 连接池获取连接的超时时间，单位为毫秒。如果在指定时间内无法从连接池获取连接，则操作失败。
- 引入版本：v3.5.13
##### jdbc_query_timeout_ms

- 默认值：30000
- 类型：Long
- 单位：毫秒
- 是否可修改：是
- 描述：JDBC 语句查询执行的超时时间，单位为毫秒。此超时时间适用于通过 JDBC catalog 执行的所有 SQL 查询（例如，分区元数据查询）。该值在传递给 JDBC 驱动程序时会转换为秒。
- 引入版本：v3.5.13
##### jdbc_network_timeout_ms

- 默认值：30000
- 类型：Long
- 单位：毫秒
- 是否可修改：是
- 描述：JDBC网络操作（套接字读取）的超时时间，以毫秒为单位。此超时时间适用于数据库元数据调用（例如，getSchemas()、getTables()、getColumns()），以防止在外部数据库无响应时无限期阻塞。
- 引入版本：v3.5.13
##### jdbc_connection_pool_size

- 默认值：8
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：用于访问 JDBC catalog 的 JDBC 连接池的最大容量。
- 引入版本：-
##### jdbc_meta_default_cache_enable

- 默认值：false
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否启用 JDBC Catalog 元数据缓存的默认值。如果设置为 True，则新建的 JDBC Catalog 默认启用元数据缓存。
- 引入版本：-
##### jdbc_meta_default_cache_expire_sec

- 默认值: 600
- 类型: Long
- 单位: 秒
- 是否可修改: 是
- 描述: JDBC Catalog 元数据缓存的默认过期时间。当 `jdbc_meta_default_cache_enable` 设置为 true 时，新创建的 JDBC Catalog 默认会设置元数据缓存的过期时间。
- 引入版本: -
##### jdbc_minimum_idle_connections

- 默认值：1
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：用于访问 JDBC catalog 的 JDBC 连接池中空闲连接的最小数量。
- 引入版本：-
##### jwt_jwks_url

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：JSON Web Key Set (JWKS) 服务的 URL，或者 `fe/conf` 目录下公钥本地文件的路径。
- 引入版本：v3.5.0
##### jwt_principal_field

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于标识 JWT 中指示主体 (`sub`) 的字段的字符串。默认值为 `sub`。此字段的值必须与登录 StarRocks 的用户名相同。
- 引入版本：v3.5.0
##### jwt_required_audience

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于标识 JWT 中的受众 (`aud`) 的字符串列表。只有当列表中的一个值与 JWT 受众匹配时，JWT 才被认为是有效的。
- 引入版本：v3.5.0
##### jwt_required_issuer

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于标识 JWT 中颁发者 (`iss`) 的字符串列表。仅当列表中的某个值与 JWT 颁发者匹配时，JWT 才被视为有效。
- 引入版本：v3.5.0
##### locale

- 默认值：zh_CN.UTF-8
- 类型：String
- 单位：-
- 是否可变：否
- 描述：FE 使用的字符集。
- 引入版本：-
##### max_agent_task_threads_num

- 默认值：4096
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：Agent 任务线程池中允许的最大线程数。
- 引入版本：-
##### max_download_task_per_be

- 默认值：0
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：在每次 RESTORE 操作中，StarRocks 分配给每个 BE 节点的下载任务的最大数量。如果此项设置为小于等于 0，则不对任务数量进行限制。
- 引入版本：v3.1.0
##### max_mv_check_base_table_change_retry_times

- 默认值：10
- 类型：-
- 单位：-
- 是否可变：是
- 描述：刷新物化视图时，检测基表变更的最大重试次数。
- 引入版本：v3.3.0
##### max_mv_refresh_failure_retry_times

- 默认值：1
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：物化视图刷新失败时的最大重试次数。
- 引入版本：v3.3.0
##### max_mv_refresh_try_lock_failure_retry_times

- 默认值：3
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：物化视图刷新失败时，尝试获取锁的最大重试次数。
- 引入版本：v3.3.0
##### max_small_file_number

- 默认值：100
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：FE 目录中可以存储的小文件的最大数量。
- 引入版本：-
##### max_small_file_size_bytes

- 默认值：1024 * 1024
- 类型：Int
- 单位：Bytes
- 是否可修改：是
- 描述：小文件的最大大小。
- 引入版本：-
##### max_upload_task_per_be

- 默认值：0
- 类型：Int
- 单位：-
- 是否可变：是
- 描述：在每次 BACKUP 操作中，StarRocks 分配给一个 BE 节点的上传任务的最大数量。当此项设置为小于等于 0 时，则不对任务数量进行限制。
- 引入版本：v3.1.0
##### mv_create_partition_batch_interval_ms

- 默认值：1000
- 类型：Int
- 单位：ms
- 是否可修改：是
- 描述：在物化视图刷新期间，如果需要批量创建多个分区，系统会将它们分成每批 64 个分区的批次。为了降低因频繁创建分区而导致的失败风险，系统会在每个批次之间设置一个默认间隔（以毫秒为单位），以控制创建频率。
- 引入版本：v3.3
##### mv_plan_cache_max_size

- 默认值：1000
- 类型：Long
- 单位：
- 是否可修改：是
- 描述：物化视图计划缓存的最大大小（用于物化视图改写）。 如果有许多物化视图用于透明查询改写，您可以增加此值。
- 引入版本：v3.2
##### mv_plan_cache_thread_pool_size

- 默认值：3
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：物化视图计划缓存的默认线程池大小（用于物化视图改写）。
- 引入版本：v3.2
##### mv_refresh_default_planner_optimize_timeout

- 默认值: 30000
- 类型: -
- 单位: -
- 是否可修改: 是
- 描述: 刷新物化视图时，优化器规划阶段的默认超时时间。
- 引入版本: v3.3.0
##### mv_refresh_fail_on_filter_data

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：如果刷新中存在被过滤的数据，物化视图刷新是否失败。默认值为 true，表示失败；否则，表示忽略被过滤的数据并返回成功。
- 引入版本：-
##### mv_refresh_try_lock_timeout_ms

- 默认值：30000
- 类型：Int
- 单位：毫秒
- 是否可修改：是
- 描述：物化视图刷新尝试获取其基表/物化视图的数据库锁的默认尝试锁超时时间。
- 引入版本：v3.3.0
##### oauth2_auth_server_url

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：授权 URL。用户的浏览器将被重定向到的 URL，以便开始 OAuth 2.0 授权过程。
- 引入版本：v3.5.0
##### oauth2_client_id

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可变：否
- 描述：StarRocks 客户端的公共标识符。
- 引入版本：v3.5.0
##### oauth2_client_secret

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：用于通过授权服务器授权 StarRocks 客户端的密钥。
- 引入版本：v3.5.0
##### oauth2_jwks_url

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：JSON Web Key Set (JWKS) 服务的 URL，或者是 `conf` 目录下本地文件的路径。
- 引入版本：v3.5.0
##### oauth2_principal_field

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可变：否
- 描述：用于标识 JWT 中指示主体 (`sub`) 的字段的字符串。默认值为 `sub`。此字段的值必须与登录 StarRocks 的用户名相同。
- 引入版本：v3.5.0
##### oauth2_redirect_url

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：OAuth 2.0 认证成功后，用户的浏览器将被重定向到的 URL。授权码将被发送到此 URL。在大多数情况下，它需要配置为 `http://<starrocks_fe_url>:<fe_http_port>/api/oauth2`。
- 引入版本：v3.5.0
##### oauth2_required_audience

- 默认值：空字符串
- 类型：String
- 单位：-
- 是否可变：否
- 描述：用于标识 JWT 中受众 (`aud`) 的字符串列表。只有当列表中的一个值与 JWT 受众匹配时，JWT 才被认为是有效的。
- 引入版本：v3.5.0
##### oauth2_required_issuer

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：用于标识 JWT 中颁发者 (`iss`) 的字符串列表。仅当列表中的某个值与 JWT 颁发者匹配时，JWT 才被视为有效。
- 引入版本：v3.5.0
##### oauth2_token_server_url

- 默认值：空字符串
- 类型：字符串
- 单位：-
- 是否可修改：否
- 描述：授权服务器上 StarRocks 获取访问令牌的端点的 URL。
- 引入版本：v3.5.0
##### plugin_dir

- 默认值: System.getenv("STARROCKS_HOME") + "/plugins"
- 类型: String
- 单位: -
- 是否可修改: 否
- 描述: 存储插件安装包的目录。
- 引入版本: -
##### plugin_enable

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：是否可以在 FE 上安装插件。插件只能在 Leader FE 上安装或卸载。
- 引入版本：-
##### proc_profile_jstack_depth

- 默认值：128
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：系统收集 CPU 和内存 profile 时，Java 堆栈的最大深度。此值控制为每个采样的堆栈捕获多少 Java 堆栈帧：较大的值会增加跟踪细节和输出大小，并可能增加 profiling 开销，而较小的值会减少细节。此设置在为 CPU 和内存 profiling 启动 profiler 时使用，因此请调整它以平衡诊断需求和性能影响。
- 引入版本：-
##### proc_profile_mem_enable

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可修改：是
- 描述：是否启用进程内存分配配置文件的收集。如果此项设置为 `true`，系统会在 `sys_log_dir/proc_profile` 目录下生成一个名为 `mem-profile-<timestamp>.html` 的 HTML 配置文件，休眠 `proc_profile_collect_time_s` 秒以进行采样，并使用 `proc_profile_jstack_depth` 作为 Java 堆栈深度。生成的文件会根据 `proc_profile_file_retained_days` 和 `proc_profile_file_retained_size_bytes` 进行压缩和清除。原生提取路径使用 `STARROCKS_HOME_DIR` 以避免 `/tmp` noexec 问题。此项旨在解决内存分配热点问题。启用此项会增加 CPU、I/O 和磁盘使用率，并可能生成大型文件。
- 引入版本：v3.2.12
##### query_detail_explain_level

- 默认值：COSTS
- 类型：String
- 单位：-
- 是否可变：true
- 描述：EXPLAIN 语句返回的查询计划的详细程度。有效值：COSTS、NORMAL、VERBOSE。
- 引入版本：v3.2.12、v3.3.5
##### replication_interval_ms

- 默认值：100
- 类型：Int
- 单位：-
- 是否可修改：否
- 描述：复制任务被调度的最小时间间隔。
- 引入版本：v3.3.5
##### replication_max_parallel_data_size_mb

- 默认值：1048576
- 类型：Int
- 单位：MB
- 是否可修改：是
- 描述：允许并发同步的最大数据大小。
- 引入版本：v3.3.5
##### replication_max_parallel_replica_count

- 默认值：10240
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：允许并发同步的 tablet 副本的最大数量。
- 引入版本：v3.3.5
##### replication_max_parallel_table_count

- 默认值：100
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：允许的最大并发数据同步任务数。StarRocks 为每个表创建一个同步任务。
- 引入版本：v3.3.5
##### replication_transaction_timeout_sec

- 默认值：86400
- 类型：Int
- 单位：秒
- 是否可修改：是
- 描述：同步任务的超时时间。
- 引入版本：v3.3.5
##### skip_whole_phase_lock_mv_limit

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 控制 StarRocks 何时对具有相关物化视图的表应用“非锁定”优化。当此项设置为小于 0 时，系统始终应用非锁定优化，并且不复制查询的相关物化视图（减少 FE 内存使用和元数据复制/锁定争用，但可能会增加元数据并发问题的风险）。当设置为 0 时，禁用非锁定优化（系统始终使用安全的复制和锁定路径）。当设置为大于 0 时，仅对相关物化视图数量小于或等于配置阈值的表应用非锁定优化。此外，当该值大于等于 0 时，planner 会将查询 OLAP 表记录到优化器上下文中，以启用与物化视图相关的重写路径；当该值小于 0 时，将跳过此步骤。
- 引入版本: v3.2.1
##### small_file_dir

- 默认值: StarRocksFE.STARROCKS_HOME_DIR + "/small_files"
- 类型: String
- 单位: -
- 是否可修改: 否
- 描述: 小文件的根目录。
- 引入版本: -
##### task_runs_max_history_number

- 默认值：10000
- 类型：Int
- 单位：-
- 是否可修改：是
- 描述：在内存中保留的最大 task run 记录数，并用作查询已归档 task run 历史记录时的默认 LIMIT。当 `enable_task_history_archive` 为 false 时，此值限制内存中的历史记录：强制 GC 修剪较旧的条目，因此仅保留最新的 `task_runs_max_history_number`。当查询归档历史记录（且未提供显式 LIMIT）时，如果此值大于 0，则 `TaskRunHistoryTable.lookup` 使用 `"ORDER BY create_time DESC LIMIT <value>"`。注意：将其设置为 0 会禁用查询端的 LIMIT（无上限），但会导致内存中的历史记录截断为零（除非启用了归档）。
- 引入版本：v3.2.0
##### tmp_dir

- 默认值：StarRocksFE.STARROCKS_HOME_DIR + "/temp_dir"
- 类型：String
- 单位：-
- 是否可修改：否
- 描述：用于存储临时文件的目录，例如备份和恢复过程中生成的文件。这些过程完成后，生成的临时文件将被删除。
- 引入版本：-
##### transform_type_prefer_string_for_varchar

- 默认值：true
- 类型：Boolean
- 单位：-
- 是否可变：是
- 描述：在物化视图创建和 CTAS 操作中，是否优先为固定长度的 varchar 列选择 string 类型。
- 引入版本：v4.0.0

<EditionSpecificFEItem />