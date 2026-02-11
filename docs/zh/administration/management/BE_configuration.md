---
displayed_sidebar: docs
---

import BEConfigMethod from '../../_assets/commonMarkdown/BE_config_method.mdx'

import CNConfigMethod from '../../_assets/commonMarkdown/CN_config_method.mdx'

import PostBEConfig from '../../_assets/commonMarkdown/BE_dynamic_note.mdx'

import StaticBEConfigNote from '../../_assets/commonMarkdown/StaticBE_config_note.mdx'

# BE 配置

<BEConfigMethod />

<CNConfigMethod />

## 查看 BE 配置项

您可以使用以下命令查看 BE 配置项：

```shell
curl http://<BE_IP>:<BE_HTTP_PORT>/varz
```

## 配置 BE 参数

<PostBEConfig />

<StaticBEConfigNote />

## 理解 BE 参数

### 日志

##### diagnose_stack_trace_interval_ms

- 默认值: 1800000 (30 分钟)
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 控制 DiagnoseDaemon 处理 `STACK_TRACE` 请求时，连续栈追踪诊断之间的最小时间间隔。当诊断请求到达时，如果上次收集的栈追踪发生在 `diagnose_stack_trace_interval_ms` 毫秒内，Daemon 将跳过收集和记录栈追踪。增加此值可以减少因频繁栈转储造成的 CPU 开销和日志量；减少此值可以捕获更频繁的追踪，以调试瞬态问题（例如，在长时间 `TabletsChannel::add_chunk` 阻塞的负载故障点模拟中）。
- 引入版本: v3.5.0

##### lake_replication_slow_log_ms

- 默认值: 30000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: Lake Replication 期间发出慢日志条目的阈值。每次文件复制后，代码会测量经过的时间（微秒），并将操作标记为慢速，如果经过的时间大于或等于 `lake_replication_slow_log_ms * 1000`。触发时，StarRocks 会写入一个 INFO 级别日志，其中包含该复制文件的大小、成本和追踪指标。增加此值可减少大/慢速传输造成的嘈杂慢日志；减少此值可更早地检测并发现较小的慢速复制事件。
- 引入版本: -

##### load_rpc_slow_log_frequency_threshold_seconds

- 默认值: 60
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 控制系统打印超出其配置的 RPC 超时的负载 RPC 慢日志条目的频率。慢日志还包括负载通道运行时配置文件。将此值设置为 0 实际上会导致每次超时都进行日志记录。
- 引入版本: v3.4.3, v3.5.0

##### log_buffer_level

- 默认值: 空字符串
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 日志刷新策略。默认值表示日志在内存中缓冲。有效值为 `-1` 和 `0`。`-1` 表示日志不缓冲在内存中。
- 引入版本: -

##### pprof_profile_dir

- 默认值: `${STARROCKS_HOME}/log`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: StarRocks 写入 pprof 制品 (Jemalloc 堆快照和 gperftools CPU 配置文件) 的目录路径。
- 引入版本: v3.2.0

##### sys_log_dir

- 默认值: `${STARROCKS_HOME}/log`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 存储系统日志 (包括 INFO, WARNING, ERROR 和 FATAL) 的目录。
- 引入版本: -

##### sys_log_level

- 默认值: INFO
- 类型: String
- 单位: -
- 是否可变: 是 (从 v3.3.0, v3.2.7 和 v3.1.12 开始)
- 描述: 系统日志条目的严重性级别。有效值: INFO, WARN, ERROR, FATAL。此项从 v3.3.0, v3.2.7 和 v3.1.12 开始变为动态配置。
- 引入版本: -

##### sys_log_roll_mode

- 默认值: SIZE-MB-1024
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 系统日志分段滚动的模式。有效值包括 `TIME-DAY`、`TIME-HOUR` 和 `SIZE-MB-`size。默认值表示日志分段滚动，每个段 1 GB。
- 引入版本: -

##### sys_log_roll_num

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 保留的日志段数量。
- 引入版本: -

##### sys_log_timezone

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否在日志前缀中显示时区信息。`true` 表示显示时区信息，`false` 表示不显示。
- 引入版本: -

##### sys_log_verbose_level

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 要打印的日志级别。此配置项用于控制代码中以 VLOG 开头的日志输出。
- 引入版本: -

##### sys_log_verbose_modules

- 默认值:
- 类型: Strings
- 单位: -
- 是否可变: 否
- 描述: 要打印的日志模块。例如，如果您将此配置项设置为 OLAP，StarRocks 只打印 OLAP 模块的日志。有效值是 BE 中的命名空间，包括 `starrocks`、`starrocks::debug`、`starrocks::fs`、`starrocks::io`、`starrocks::lake`、`starrocks::pipeline`、`starrocks::query_cache`、`starrocks::stream` 和 `starrocks::workgroup`。
- 引入版本: -

### 服务器

##### abort_on_large_memory_allocation

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 当单个分配请求超过配置的大分配阈值（`g_large_memory_alloc_failure_threshold` > 0 且请求大小 > 阈值）时，此标志控制进程的响应方式。如果为 true，当检测到此类大分配时，StarRocks 会立即调用 `std::abort()`（硬崩溃）。如果为 false，则分配被阻塞，分配器返回失败（nullptr 或 ENOMEM），以便调用者可以处理错误。此检查仅对未通过 TRY_CATCH_BAD_ALLOC 路径包装的分配生效（当捕获 bad-alloc 时，内存 hook 使用不同的流程）。启用此功能可快速调试意外的巨大分配；在生产环境中禁用此功能，除非您希望在尝试进行超大分配时立即中止进程。
- 引入版本: v3.4.3, 3.5.0, 4.0.0

##### arrow_flight_port

- 默认值: -1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE Arrow Flight SQL 服务器的 TCP 端口。`-1` 表示禁用 Arrow Flight 服务。在非 macOS 构建中，BE 在启动期间使用此端口调用 Arrow Flight SQL 服务器；如果端口不可用，服务器启动失败且 BE 进程退出。配置的端口在心跳负载中报告给 FE。
- 引入版本: v3.4.0, v3.5.0

##### be_exit_after_disk_write_hang_second

- 默认值: 60
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: 磁盘挂起后 BE 等待退出的时间长度。
- 引入版本: -

##### be_http_num_workers

- 默认值: 48
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: HTTP 服务器使用的线程数。
- 引入版本: -

##### be_http_port

- 默认值: 8040
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE HTTP 服务器端口。
- 引入版本: -

##### be_port

- 默认值: 9060
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE Thrift 服务器端口，用于接收来自 FE 的请求。
- 引入版本: -

##### be_service_threads

- 默认值: 64
- 类型: Int
- 单位: 线程
- 是否可变: 否
- 描述: BE Thrift 服务器用于处理后端 RPC/执行请求的工作线程数。此值在创建 BackendService 时传递给 ThriftServer，并控制可用的并发请求处理程序数量；当所有工作线程都忙时，请求将被排队。根据预期的并发 RPC 负载和可用的 CPU/内存进行调整：增加它会提高并发性，但也会增加每个线程的内存和上下文切换成本；减少它会限制并行处理并可能增加请求延迟。
- 引入版本: v3.2.0

##### brpc_connection_type

- 默认值: `"single"`
- 类型: string
- 单位: -
- 是否可变: 否
- 描述: bRPC 通道连接模式。有效值：
  - `"single"` (默认值): 每个通道一个持久 TCP 连接。
  - `"pooled"`: 一个持久连接池，用于提高并发性，但会消耗更多 socket/文件描述符。
  - `"short"`: 每个 RPC 创建的短生命周期连接，以减少持久资源使用，但延迟较高。
  此选择会影响每个 socket 的缓冲行为，并可能影响当未写入字节超过 socket 限制时的 `Socket.Write` 失败 (EOVERCROWDED)。
- 引入版本: v3.2.5

##### brpc_max_body_size

- 默认值: 2147483648
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: bRPC 的最大主体大小。
- 引入版本: -

##### brpc_max_connections_per_server

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 客户端为每个远程服务器端点维护的最大持久 bRPC 连接数。对于每个端点，`BrpcStubCache` 会创建一个 `StubPool`，其 `_stubs` 向量被预留为该大小。在首次访问时，会创建新的 stub，直到达到限制。此后，现有 stub 会以循环方式返回。增加此值会提高每个端点的并发性（减少单个通道上的争用），但会增加文件描述符、内存和通道的成本。
- 引入版本: v3.2.0

##### brpc_num_threads

- 默认值: -1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: bRPC 的 bthread 数量。值 `-1` 表示与 CPU 线程数相同。
- 引入版本: -

##### brpc_port

- 默认值: 8060
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE bRPC 端口，用于查看 bRPC 的网络统计信息。
- 引入版本: -

##### brpc_socket_max_unwritten_bytes

- 默认值: 1073741824
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 设置 bRPC 服务器中每个 socket 未写入出站字节的限制。当 socket 上缓冲的未写入数据量达到此限制时，后续的 `Socket.Write` 调用将以 EOVERCROWDED 失败。这可以防止每个连接的内存无限制增长，但可能导致非常大的消息或慢速对等体发送 RPC 失败。将此值与 `brpc_max_body_size` 对齐，以确保单个消息体不大于允许的未写入缓冲区。增加此值会提高每个连接的内存使用量。
- 引入版本: v3.2.0

##### brpc_stub_expire_s

- 默认值: 3600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: bRPC stub 缓存的过期时间。默认值是 60 分钟。
- 引入版本: -

##### compress_rowbatches

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 一个布尔值，控制 BE 之间 RPC 是否压缩行批次。`true` 表示压缩行批次，`false` 表示不压缩。
- 引入版本: -

##### consistency_max_memory_limit_percent

- 默认值: 20
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于计算一致性相关任务内存预算的百分比上限。在 BE 启动期间，最终的一致性限制计算为从 `consistency_max_memory_limit`（字节）解析的值和 (`process_mem_limit * consistency_max_memory_limit_percent / 100`) 中的最小值。如果 `process_mem_limit` 未设置（-1），则一致性内存被视为无限。对于 `consistency_max_memory_limit_percent`，小于 0 或大于 100 的值被视为 100。调整此值会增加或减少为一致性操作保留的内存，因此会影响查询和其他服务可用的内存。
- 引入版本: v3.2.0

##### delete_worker_count_normal_priority

- 默认值: 2
- 类型: Int
- 单位: 线程
- 是否可变: 否
- 描述: 分配给 BE 代理上处理删除（带有 DELETE 的 REALTIME_PUSH）任务的普通优先级工作线程数。在启动时，此值会添加到 `delete_worker_count_high_priority` 中，以确定 DeleteTaskWorkerPool 的大小（参见 agent_server.cpp）。池将前 `delete_worker_count_high_priority` 个线程分配为 HIGH 优先级，其余为 NORMAL；普通优先级线程处理标准删除任务并有助于整体删除吞吐量。增加此值可提高并发删除容量（更高的 CPU/IO 使用率）；减少此值可降低资源争用。
- 引入版本: v3.2.0

##### disable_mem_pools

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否禁用 MemPool。当此项设置为 `true` 时，MemPool 块池化被禁用，因此每个分配都会获得其自己的大小块，而不是重用或增加池化块。禁用池化会减少长期保留的缓冲内存，但代价是分配更频繁、块数增加，并跳过完整性检查（由于块数大而避免）。保持 `disable_mem_pools` 为 `false`（默认值）以受益于分配重用和更少的系统调用。仅当必须避免大量池化内存保留（例如，低内存环境或诊断运行）时才将其设置为 `true`。
- 引入版本: v3.2.0

##### enable_https

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 当此项设置为 `true` 时，BE 的 bRPC 服务器将配置为使用 TLS：`ServerOptions.ssl_options` 将在 BE 启动时填充 `ssl_certificate_path` 和 `ssl_private_key_path` 指定的证书和私钥。这为传入的 bRPC 连接启用 HTTPS/TLS；客户端必须使用 TLS 连接。确保证书和密钥文件存在，BE 进程可访问，并符合 bRPC/SSL 预期。
- 引入版本: v4.0.0

##### enable_jemalloc_memory_tracker

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 当此项设置为 `true` 时，BE 会启动一个后台线程（jemalloc_tracker_daemon），该线程每秒轮询 jemalloc 统计信息一次，并使用 jemalloc 的 "stats.metadata" 值更新 GlobalEnv jemalloc 元数据 MemTracker。这确保了 jemalloc 元数据消耗被包含在 StarRocks 进程内存核算中，并防止低估 jemalloc 内部使用的内存。跟踪器仅在非 macOS 构建上编译/启动（#ifndef __APPLE__），并作为名为 "jemalloc_tracker_daemon" 的守护线程运行。由于此设置会影响启动行为和维护 MemTracker 状态的线程，更改它需要重新启动。仅当不使用 jemalloc 或 jemalloc 跟踪有意以不同方式管理时才禁用；否则保持启用以维护准确的内存核算和分配保护。
- 引入版本: v3.2.12

##### enable_jvm_metrics

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 控制系统是否在启动时初始化和注册 JVM 特定的指标。启用时，指标子系统将创建 JVM 相关的收集器（例如，堆、GC 和线程指标）以供导出；禁用时，这些收集器不会被初始化。此参数用于向前兼容，并可能在未来版本中移除。使用 `enable_system_metrics` 控制系统级指标收集。
- 引入版本: v4.0.0

##### get_pindex_worker_count

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 设置 UpdateManager 中 "get_pindex" 线程池的工作线程数，该线程池用于加载/获取持久索引数据（用于为主键表应用 RowSet）。在运行时，配置更新将调整池的最大线程数：如果 `>0`，则应用该值；如果为 0，则运行时回调使用 CPU 核心数 (CpuInfo::num_cores())。在初始化时，池的最大线程数计算为 max(get_pindex_worker_count, max_apply_thread_cnt * 2)，其中 max_apply_thread_cnt 是 apply 线程池的最大值。增加此值可提高 pindex 加载的并行性；降低此值可减少并发性和内存/CPU 使用率。
- 引入版本: v3.2.0

##### heartbeat_service_port

- 默认值: 9050
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE 心跳服务端口，用于接收来自 FE 的心跳。
- 引入版本: -

##### heartbeat_service_thread_count

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE 心跳服务的线程数。
- 引入版本: -

##### local_library_dir

- 默认值: `${UDF_RUNTIME_DIR}`
- 类型: string
- 单位: -
- 是否可变: 否
- 描述: BE 上的本地目录，用于暂存 UDF（用户定义函数）库和 Python UDF 工作进程操作。StarRocks 会将 UDF 库从 HDFS 复制到此路径，在 `<local_library_dir>/pyworker_<pid>` 创建每个 worker 的 Unix 域 socket，并在执行前将 Python worker 进程切换到此目录。该目录必须存在，BE 进程可写入，并驻留在支持 Unix 域 socket 的文件系统上（即本地文件系统）。由于此配置在运行时不可变，请在启动前设置它，并确保每个 BE 上都有足够的权限和磁盘空间。
- 引入版本: v3.2.0

##### max_transmit_batched_bytes

- 默认值: 262144
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 在刷新到网络之前，单个传输请求中要累积的最大序列化字节数。发送方实现将序列化后的 ChunkPB 负载添加到 PTransmitChunkParams 请求中，并在累积字节数超过 `max_transmit_batched_bytes` 或达到 EOS 时发送请求。增加此值可减少 RPC 频率并提高吞吐量，但会增加每个请求的延迟和内存使用；减少此值可降低延迟和内存，但会增加 RPC 速率。
- 引入版本: v3.2.0

##### mem_limit

- 默认值: 90%
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: BE 进程内存上限。您可以将其设置为百分比（“80%”）或物理限制（“100G”）。默认硬限制是服务器内存大小的 90%，软限制是 80%。如果要在同一服务器上部署 StarRocks 和其他内存密集型服务，则需要配置此参数。
- 引入版本: -

##### memory_max_alignment

- 默认值: 16
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 设置 MemPool 将接受的对齐分配的最大字节对齐。仅当调用者需要更大对齐时（用于 SIMD、设备缓冲区或 ABI 约束）才增加此值。较大的值会增加每个分配的填充和保留内存浪费，并且必须保持在系统分配器和平台支持的范围内。
- 引入版本: v3.2.0

##### memory_urgent_level

- 默认值: 85
- 类型: long
- 单位: 百分比 (0-100)
- 是否可变: 是
- 描述: 紧急内存水位线，表示为进程内存限制的百分比。当进程内存消耗超过 `(limit * memory_urgent_level / 100)` 时，BE 会触发即时内存回收，这会强制数据缓存收缩、驱逐更新缓存，并使持久/Lake MemTable 被视为“已满”，因此它们将很快被刷新/压缩。代码验证此设置必须大于 `memory_high_level`，并且 `memory_high_level` 必须大于或等于 `1`，且小于或等于 `100`。较低的值会导致更激进、更早的回收，即更频繁的缓存逐出和刷新。较高的值会延迟回收，如果太接近 100，则有 OOM 风险。将此项与 `memory_high_level` 和数据缓存相关的自动调整设置一起调整。
- 引入版本: v3.2.0

##### net_use_ipv6_when_priority_networks_empty

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 一个布尔值，控制当 `priority_networks` 未指定时是否优先使用 IPv6 地址。`true` 表示当托管节点的服务器同时具有 IPv4 和 IPv6 地址且 `priority_networks` 未指定时，允许系统优先使用 IPv6 地址。
- 引入版本: v3.3.0

##### num_cores

- 默认值: 0
- 类型: Int
- 单位: 核心
- 是否可变: 否
- 描述: 控制系统用于 CPU 感知决策（例如，线程池大小调整和运行时调度）的 CPU 核心数。值为 0 启用自动检测：系统读取 `/proc/cpuinfo` 并使用所有可用核心。如果设置为正整数，该值将覆盖检测到的核心数并成为实际核心数。在容器内运行时，cgroup cpuset 或 cpu quota 设置可以进一步限制可用核心；`CpuInfo` 也遵守这些 cgroup 限制。
- 引入版本: v3.2.0

##### plugin_path

- 默认值: `${STARROCKS_HOME}/plugin`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: StarRocks 加载外部插件（动态库、连接器制品、UDF 二进制文件等）的文件系统目录。`plugin_path` 应指向 BE 进程可访问的目录（读写执行权限），并且在加载插件之前必须存在。确保正确的所有权，并且插件文件使用平台的原生二进制扩展名（例如，Linux 上的 .so）。
- 引入版本: v3.2.0

##### priority_networks

- 默认值: 空字符串
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 声明具有多个 IP 地址的服务器的选择策略。请注意，最多只有一个 IP 地址必须与此参数指定列表中的条目匹配。此参数的值是一个列表，由以分号 (;) 分隔的 CIDR 格式条目组成，例如 `10.10.10.0/24`。如果没有 IP 地址与此列表中的条目匹配，则将随机选择服务器的可用 IP 地址。从 v3.3.0 开始，StarRocks 支持基于 IPv6 的部署。如果服务器同时具有 IPv4 和 IPv6 地址，并且未指定此参数，则系统默认使用 IPv4 地址。您可以通过将 `net_use_ipv6_when_priority_networks_empty` 设置为 `true` 来更改此行为。
- 引入版本: -

##### rpc_compress_ratio_threshold

- 默认值: 1.1
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 用于决定是否以压缩形式通过网络发送序列化行批次的阈值（uncompressed_size / compressed_size）。当尝试压缩时（例如，在 DataStreamSender、exchange sink、tablet sink 索引通道、字典缓存写入器中），StarRocks 会计算 compress_ratio = uncompressed_size / compressed_size；仅当 compress_ratio `>` rpc_compress_ratio_threshold 时才使用压缩负载。默认值为 1.1，表示压缩数据必须比未压缩数据小至少约 9.1% 才能使用。降低此值以优先压缩（更多 CPU 消耗以获得较小的带宽节省）；提高此值以避免压缩开销，除非它产生更大的尺寸缩减。注意：这适用于 RPC/shuffle 序列化，并且仅当启用行批次压缩时 (compress_rowbatches) 才有效。
- 引入版本: v3.2.0

##### ssl_private_key_path

- 默认值: 空字符串
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: TLS/SSL 私钥 (PEM) 的文件系统路径，BE 的 bRPC 服务器将其用作默认证书的私钥。当 `enable_https` 设置为 `true` 时，系统在进程启动时将 `brpc::ServerOptions::ssl_options().default_cert.private_key` 设置为此路径。文件必须可由 BE 进程访问，并且必须与 `ssl_certificate_path` 提供的证书匹配。如果未设置此值或文件丢失或不可访问，HTTPS 将不会被配置，bRPC 服务器可能无法启动。使用限制性文件系统权限（例如，600）保护此文件。
- 引入版本: v4.0.0

##### thrift_client_retry_interval_ms

- 默认值: 100
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: Thrift 客户端重试的时间间隔。
- 引入版本: -

##### thrift_connect_timeout_seconds

- 默认值: 3
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: 创建 Thrift 客户端时使用的连接超时（秒）。ClientCacheHelper::_create_client 将此值乘以 1000 并将其传递给 ThriftClientImpl::set_conn_timeout()，因此它控制由 BE 客户端缓存打开的新 Thrift 连接的 TCP/连接握手超时。此设置仅影响连接建立；发送/接收超时是单独配置的。非常小的值可能导致高延迟网络上的虚假连接失败，而大值则会延迟无法访问的对等体的检测。
- 引入版本: v3.2.0

##### thrift_port

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于导出内部基于 Thrift 的 BackendService 的端口。当进程作为 Compute Node 运行且此项设置为非零值时，它将覆盖 `be_port` 并且 Thrift 服务器绑定到此值；否则使用 `be_port`。此配置已弃用——设置非零 `thrift_port` 会记录警告，建议改用 `be_port`。
- 引入版本: v3.2.0

##### thrift_rpc_connection_max_valid_time_ms

- 默认值: 5000
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: Thrift RPC 连接的最大有效时间。如果连接在连接池中存在的时间超过此值，它将被关闭。必须与 FE 配置 `thrift_client_timeout_ms` 保持一致。
- 引入版本: -

##### thrift_rpc_max_body_size

- 默认值: 0
- 类型: Int
- 单位:
- 是否可变: 否
- 描述: RPC 的最大字符串主体大小。`0` 表示大小无限制。
- 引入版本: -

##### thrift_rpc_strict_mode

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否启用 Thrift 的严格执行模式。有关 Thrift 严格模式的更多信息，请参阅 [Thrift Binary protocol encoding](https://github.com/apache/thrift/blob/master/doc/specs/thrift-binary-protocol.md)。
- 引入版本: -

##### thrift_rpc_timeout_ms

- 默认值: 5000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: Thrift RPC 的超时时间。
- 引入版本: -

##### transaction_apply_thread_pool_num_min

- 默认值: 0
- 类型: Int
- 单位: 线程
- 是否可变: 是
- 描述: 设置 BE 的 UpdateManager 中 "update_apply" 线程池的最小线程数——该线程池用于应用主键表的 RowSet。值为 0 表示禁用固定最小值（不强制下限）；当 `transaction_apply_worker_count` 也为 0 时，池的最大线程数默认为 CPU 核心数，因此有效 worker 容量等于 CPU 核心数。您可以提高此值以保证应用事务的基线并发性；设置过高可能会增加 CPU 争用。更改通过 `update_config` HTTP 处理程序在运行时应用（它调用 apply 线程池上的 `update_min_threads`）。
- 引入版本: v3.2.11

##### transaction_publish_version_thread_pool_num_min

- 默认值: 0
- 类型: Int
- 单位: 线程
- 是否可变: 是
- 描述: 设置 AgentServer "publish_version" 动态线程池中保留的最小线程数（用于发布事务版本/处理 `TTaskType::PUBLISH_VERSION` 任务）。在启动时，池以 min = max(config value, MIN_TRANSACTION_PUBLISH_WORKER_COUNT) (MIN_TRANSACTION_PUBLISH_WORKER_COUNT = 1) 创建，因此默认 0 会导致最小 1 个线程。在运行时更改此值会调用更新回调以调用 ThreadPool::update_min_threads，提高或降低池的保证最小值（但不低于强制最小值 1）。与 `transaction_publish_version_worker_count`（最大线程数）和 `transaction_publish_version_thread_pool_idle_time_ms`（空闲超时）协调。
- 引入版本: v3.2.11

##### use_mmap_allocate_chunk

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 当此项设置为 `true` 时，系统使用匿名私有 mmap 映射 (MAP_ANONYMOUS | MAP_PRIVATE) 分配 chunk，并使用 munmap 释放它们。启用此功能可能会创建许多虚拟内存映射，因此您必须提高内核限制（作为 root 用户，运行 `sysctl -w vm.max_map_count=262144` 或 `echo 262144 > /proc/sys/vm/max_map_count`），并将 `chunk_reserved_bytes_limit` 设置为相对较大的值。否则，启用 mmap 可能会由于频繁映射/取消映射而导致性能非常差。
- 引入版本: v3.2.0

### 元数据和集群管理

##### cluster_id

- 默认值: -1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 此 StarRocks 后端的全局集群标识符。在启动时，StorageEngine 将 config::cluster_id 读取到其实际集群 ID，并验证所有数据根路径都包含相同的集群 ID（参见 StorageEngine::_check_all_root_path_cluster_id）。值为 -1 表示“未设置”——引擎可以从现有数据目录或主节点心跳中派生实际 ID。如果配置了非负 ID，则配置 ID 与数据目录中存储的 ID 之间的任何不匹配都将导致启动验证失败 (Status::Corruption)。当某些根缺少 ID 且引擎被允许写入 ID (options.need_write_cluster_id) 时，它会将实际 ID 持久化到这些根中。
- 引入版本: v3.2.0

##### consistency_max_memory_limit

- 默认值: 10G
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: CONSISTENCY 内存 Tracker 的内存大小规范。
- 引入版本: v3.2.0

##### make_snapshot_rpc_timeout_ms

- 默认值: 20000
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: 设置在远程 BE 上创建快照时使用的 Thrift RPC 超时（毫秒）。当远程快照创建经常超出默认超时时，增加此值；降低此值可更快地对无响应的 BE 失败。请注意，其他超时可能会影响端到端操作（例如，有效的 Tablet 写入器打开超时可能与 `tablet_writer_open_rpc_timeout_sec` 和 `load_timeout_sec` 相关）。
- 引入版本: v3.2.0

##### metadata_cache_memory_limit_percent

- 默认值: 30
- 类型: Int
- 单位: 百分比
- 是否可变: 是
- 描述: 将元数据 LRU 缓存大小设置为进程内存限制的百分比。在启动时，StarRocks 计算缓存字节数，公式为 (process_mem_limit * metadata_cache_memory_limit_percent / 100)，并将其传递给元数据缓存分配器。该缓存仅用于非 PRIMARY_KEYS RowSet（不支持 PK 表），并且仅在 metadata_cache_memory_limit_percent > 0 时启用；将其设置为 <= 0 以禁用元数据缓存。增加此值会提高元数据缓存容量，但会减少其他组件可用的内存；根据工作负载和系统内存进行调整。在 BE_TEST 构建中不活跃。
- 引入版本: v3.2.10

##### retry_apply_interval_second

- 默认值: 30
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 调度失败的 Tablet apply 操作重试时使用的基本间隔（秒）。它直接用于在提交失败后调度重试，并作为回退的基本乘数：下一次重试延迟计算为 min(600, `retry_apply_interval_second` * failed_attempts)。代码还使用 `retry_apply_interval_second` 计算累积重试持续时间（等差数列和），并将其与 `retry_apply_timeout_second` 进行比较，以决定是否继续重试。仅当 `enable_retry_apply` 为 true 时有效。增加此值会延长单个重试延迟和累积重试时间；减少此值会使重试更频繁，并可能在达到 `retry_apply_timeout_second` 之前增加尝试次数。
- 引入版本: v3.2.9

##### retry_apply_timeout_second

- 默认值: 7200
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 允许应用挂起版本之前允许的最大累积重试时间（秒），超过此时间后，apply 进程将放弃，Tablet 进入错误状态。apply 逻辑根据 `retry_apply_interval_second` 累积指数/退避间隔，并将总持续时间与 `retry_apply_timeout_second` 进行比较。如果 `enable_retry_apply` 为 true 且错误被认为是可重试的，则会重新安排 apply 尝试，直到累积退避超过 `retry_apply_timeout_second`；然后 apply 停止，Tablet 转换为错误状态。明确不可重试的错误（例如 Corruption）将不重试，无论此设置如何。调整此值以控制 StarRocks 将继续重试 apply 操作的时间（默认 7200 秒 = 2 小时）。
- 引入版本: v3.3.13, v3.4.3, v3.5.0

##### txn_commit_rpc_timeout_ms

- 默认值: 60000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: BE stream-load 和事务提交调用使用的 Thrift RPC 连接的最大允许生命周期（毫秒）。StarRocks 将此值设置为发送到 FE 的请求的 `thrift_rpc_timeout_ms`（用于 stream_load 规划、loadTxnBegin/loadTxnPrepare/loadTxnCommit 和 getLoadTxnStatus）。如果连接在池中时间超过此值，它将被关闭。当提供了每个请求超时 (`ctx->timeout_second`) 时，BE 将 RPC 超时计算为 rpc_timeout_ms = max(ctx*1000/4, min(ctx*1000/2, txn_commit_rpc_timeout_ms))，因此有效 RPC 超时受限于上下文和此配置。请保持此值与 FE 的 `thrift_client_timeout_ms` 一致，以避免超时不匹配。
- 引入版本: v3.2.0

##### txn_map_shard_size

- 默认值: 128
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 事务管理器用于分区事务锁和减少争用的锁映射分片数。其值应为 2 的幂 (2^n)；增加它会增加并发性并减少锁争用，但会增加额外的内存和少量簿记开销。根据预期的并发事务和可用内存选择分片计数。
- 引入版本: v3.2.0

##### txn_shard_size

- 默认值: 1024
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 控制事务管理器使用的锁分片数量。此值决定了事务锁的分片大小。它必须是 2 的幂；将其设置为较大值可以减少锁争用并提高并发 COMMIT/PUBLISH 吞吐量，但代价是额外的内存和更细粒度的内部簿记。
- 引入版本: v3.2.0

##### update_schema_worker_count

- 默认值: 3
- 类型: Int
- 单位: 线程
- 是否可变: 否
- 描述: 设置后端“update_schema”动态 ThreadPool 中处理 TTaskType::UPDATE_SCHEMA 任务的最大工作线程数。ThreadPool 在启动时在 `agent_server` 中创建，最小线程数为 0（空闲时可缩减到零），最大线程数等于此设置；该池使用默认的空闲超时和实际上无限的队列。增加此值以允许更多并发的模式更新任务（更高的 CPU 和内存使用），或降低此值以限制并行模式操作。
- 引入版本: v3.2.3

##### update_tablet_meta_info_worker_count

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 设置后端线程池中处理 Tablet 元数据更新任务的最大工作线程数。线程池在后端启动期间创建，最小线程数为 0（空闲时可缩减到零），最大线程数等于此设置（限制为至少 1）。在运行时更新此值将调整池的最大线程数。增加它以允许更多并发的元数据更新任务，或降低它以限制并发性。
- 引入版本: v4.1.0, v4.0.6, v3.5.13

### 用户、角色和权限

##### ssl_certificate_path

- 默认值:
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: TLS/SSL 证书文件 (PEM) 的绝对路径，当 `enable_https` 为 true 时，BE 的 bRPC 服务器将使用此证书作为默认证书。在 BE 启动时，此值将复制到 `brpc::ServerOptions::ssl_options().default_cert.certificate`；您还必须将 `ssl_private_key_path` 设置为匹配的私钥。如果您的 CA 要求，请以 PEM 格式提供服务器证书和任何中间证书（证书链）。该文件必须可由 StarRocks BE 进程读取，并且仅在启动时应用。如果未设置或无效，而 `enable_https` 已启用，则 bRPC TLS 设置可能会失败并阻止服务器正常启动。
- 引入版本: v4.0.0

### 查询引擎

##### clear_udf_cache_when_start

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 启用时，BE 的 UserFunctionCache 将在启动时清除所有本地缓存的用户函数库。在 UserFunctionCache::init 期间，代码会调用 _reset_cache_dir()，该函数会从配置的 UDF 库目录（组织成 kLibShardNum 子目录）中删除 UDF 文件，并删除具有 Java/Python UDF 后缀（.jar/.py）的文件。禁用时（默认），BE 会加载现有缓存的 UDF 文件而不是删除它们。启用此功能会强制 UDF 二进制文件在重启后首次使用时重新下载（增加网络流量和首次使用延迟）。
- 引入版本: v4.0.0

##### dictionary_speculate_min_chunk_size

- 默认值: 10000
- 类型: Int
- 单位: 行
- 是否可变: 否
- 描述: StringColumnWriter 和 DictColumnWriter 用于触发字典编码推测的最小行数（块大小）。如果传入的列（或累积缓冲区加上传入行）的大小大于或等于 `dictionary_speculate_min_chunk_size`，写入器将立即运行推测并设置编码（DICT、PLAIN 或 BIT_SHUFFLE），而不是缓冲更多行。推测使用 `dictionary_encoding_ratio` 用于字符串列，`dictionary_encoding_ratio_for_non_string_column` 用于数值/非字符串列，以决定字典编码是否有利。此外，较大的列字节大小（大于或等于 UINT32_MAX）会强制立即推测以避免 `BinaryColumn<uint32_t>` 溢出。
- 引入版本: v3.2.0

##### disable_storage_page_cache

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 一个布尔值，控制是否禁用 PageCache。
  - 启用 PageCache 后，StarRocks 会缓存最近扫描的数据。
  - 当重复执行类似查询时，PageCache 可以显著提高查询性能。
  - `true` 表示禁用 PageCache。
  - 从 StarRocks v2.4 开始，此项的默认值已从 `true` 更改为 `false`。
- 引入版本: -

##### enable_bitmap_index_memory_page_cache

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否为 Bitmap 索引启用内存缓存。如果您想使用 Bitmap 索引加速点查询，建议使用内存缓存。
- 引入版本: v3.1

##### enable_compaction_flat_json

- 默认值: True
- 类型: Boolean
- 单位:
- 是否可变: 是
- 描述: 是否为 Flat JSON 数据启用 Compaction。
- 引入版本: v3.3.3

##### enable_json_flat

- 默认值: false
- 类型: Boolean
- 单位:
- 是否可变: 是
- 描述: 是否启用 Flat JSON 功能。启用此功能后，新加载的 JSON 数据将自动展平，从而提高 JSON 查询性能。
- 引入版本: v3.3.0

##### enable_lazy_dynamic_flat_json

- 默认值: True
- 类型: Boolean
- 单位:
- 是否可变: 是
- 描述: 当查询在读取过程中缺少 Flat JSON 模式时，是否启用 Lazy Dyamic Flat JSON。当此项设置为 `true` 时，StarRocks 会将 Flat JSON 操作推迟到计算过程，而不是读取过程。
- 引入版本: v3.3.3

##### enable_ordinal_index_memory_page_cache

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否为序数索引启用内存缓存。序数索引是将行 ID 映射到数据页位置的映射，可用于加速扫描。
- 引入版本: -

##### enable_string_prefix_zonemap

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否为使用前缀 Min/Max 的字符串 (CHAR/VARCHAR) 列启用 ZoneMap。对于非键字符串列，Min/Max 值被截断为由 `string_prefix_zonemap_prefix_len` 配置的固定前缀长度。
- 引入版本: -

##### enable_zonemap_index_memory_page_cache

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否为 ZoneMap 索引启用内存缓存。如果您想使用 ZoneMap 索引加速扫描，建议使用内存缓存。
- 引入版本: -

##### exchg_node_buffer_size_bytes

- 默认值: 10485760
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 每个查询的交换节点接收端最大缓冲区大小。此配置项是软限制。当数据以过快的速度发送到接收端时，会触发反压。
- 引入版本: -

##### file_descriptor_cache_capacity

- 默认值: 16384
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 可缓存的文件描述符数量。
- 引入版本: -

##### flamegraph_tool_dir

- 默认值: `${STARROCKS_HOME}/bin/flamegraph`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: Flamegraph 工具的目录，应包含 pprof、stackcollapse-go.pl 和 flamegraph.pl 脚本，用于从配置文件数据生成火焰图。
- 引入版本: -

##### fragment_pool_queue_size

- 默认值: 2048
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 每个 BE 节点可处理的查询数量上限。
- 引入版本: -

##### fragment_pool_thread_num_max

- 默认值: 4096
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于查询的最大线程数。
- 引入版本: -

##### fragment_pool_thread_num_min

- 默认值: 64
- 类型: Int
- 单位: 分钟 -
- 是否可变: 否
- 描述: 用于查询的最小线程数。
- 引入版本: -

##### hdfs_client_enable_hedged_read

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 指定是否启用对冲读取功能。
- 引入版本: v3.0

##### hdfs_client_hedged_read_threadpool_size

- 默认值: 128
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 指定 HDFS 客户端上的对冲读取线程池大小。线程池大小限制了 HDFS 客户端中专用于运行对冲读取的线程数。它等同于 HDFS 集群 **hdfs-site.xml** 文件中的 `dfs.client.hedged.read.threadpool.size` 参数。
- 引入版本: v3.0

##### hdfs_client_hedged_read_threshold_millis

- 默认值: 2500
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: 指定在启动对冲读取之前等待的毫秒数。例如，您已将此参数设置为 `30`。在这种情况下，如果从块读取在 30 毫秒内未返回，HDFS 客户端会立即对不同的块副本启动新的读取。它等同于 HDFS 集群 **hdfs-site.xml** 文件中的 `dfs.client.hedged.read.threshold.millis` 参数。
- 引入版本: v3.0

##### io_coalesce_adaptive_lazy_active

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 基于谓词的选择性，自适应地确定是否合并谓词列和非谓词列的 I/O。
- 引入版本: v3.2

##### jit_lru_cache_size

- 默认值: 0
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: JIT 编译的 LRU 缓存大小。如果设置为大于 0，则表示缓存的实际大小。如果设置为小于或等于 0，系统将使用公式 `jit_lru_cache_size = min(mem_limit*0.01, 1GB)` 自适应地设置缓存（节点 `mem_limit` 必须大于或等于 16 GB）。
- 引入版本: -

##### json_flat_column_max

- 默认值: 100
- 类型: Int
- 单位:
- 是否可变: 是
- 描述: Flat JSON 可提取的最大子字段数量。此参数仅在 `enable_json_flat` 设置为 `true` 时生效。
- 引入版本: v3.3.0

##### json_flat_create_zonemap

- 默认值: true
- 类型: Boolean
- 单位:
- 是否可变: 是
- 描述: 在写入时是否为展平的 JSON 子列创建 ZoneMap。此参数仅在 `enable_json_flat` 设置为 `true` 时生效。
- 引入版本: -

##### json_flat_null_factor

- 默认值: 0.3
- 类型: Double
- 单位:
- 是否可变: 是
- 描述: Flat JSON 提取的列中 NULL 值的比例。如果列中 NULL 值的比例高于此阈值，则不进行提取。此参数仅在 `enable_json_flat` 设置为 `true` 时生效。
- 引入版本: v3.3.0

##### json_flat_sparsity_factor

- 默认值: 0.3
- 类型: Double
- 单位:
- 是否可变: 是
- 描述: Flat JSON 中同名列的比例。如果同名列的比例低于此值，则不进行提取。此参数仅在 `enable_json_flat` 设置为 `true` 时生效。
- 引入版本: v3.3.0

##### lake_tablet_ignore_invalid_delete_predicate

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 一个布尔值，控制是否忽略 Tablet RowSet 元数据中可能因逻辑删除导致的无效删除谓词，该谓词在列名重命名后引入到 Duplicate Key 表中。
- 引入版本: v4.0

##### late_materialization_ratio

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: SegmentIterator（向量查询引擎）中控制晚期物化使用的整数比例，范围 [0-1000]。值为 `0`（或 <= 0）禁用晚期物化；`1000`（或 >= 1000）强制所有读取使用晚期物化。值 > 0 且 < 1000 启用条件策略，其中晚期和早期物化上下文都已准备好，迭代器根据谓词过滤比例选择行为（值越高越倾向于晚期物化）。当 Segment 包含复杂指标类型时，StarRocks 改用 `metric_late_materialization_ratio`。如果 `lake_io_opts.cache_file_only` 设置为 true，则禁用晚期物化。
- 引入版本: v3.2.0

##### max_hdfs_file_handle

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 可打开的 HDFS 文件描述符的最大数量。
- 引入版本: -

##### max_memory_sink_batch_count

- 默认值: 20
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Scan Cache 批次的最大数量。
- 引入版本: -

##### max_pushdown_conditions_per_column

- 默认值: 1024
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每列允许下推的最大条件数。如果条件数超过此限制，谓词将不会下推到存储层。
- 引入版本: -

##### max_scan_key_num

- 默认值: 1024
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每个查询分割的最大扫描键数量。
- 引入版本: -

##### metric_late_materialization_ratio

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 控制包含复杂指标列的读取何时使用晚期物化行访问策略。有效范围：[0-1000]。`0` 禁用晚期物化；`1000` 强制所有适用的读取使用晚期物化。值 1-999 启用条件策略，其中晚期和早期物化上下文都已准备好，并根据谓词/选择性在运行时选择。当存在复杂指标类型时，`metric_late_materialization_ratio` 会覆盖通用的 `late_materialization_ratio`。注意：`cache_file_only` I/O 模式将导致禁用晚期物化，无论此设置如何。
- 引入版本: v3.2.0

##### min_file_descriptor_number

- 默认值: 60000
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE 进程中的最小文件描述符数量。
- 引入版本: -

##### object_storage_connect_timeout_ms

- 默认值: -1
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: 与对象存储建立 socket 连接的超时持续时间。`-1` 表示使用 SDK 配置的默认超时持续时间。
- 引入版本: v3.0.9

##### object_storage_request_timeout_ms

- 默认值: -1
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: 与对象存储建立 HTTP 连接的超时持续时间。`-1` 表示使用 SDK 配置的默认超时持续时间。
- 引入版本: v3.0.9

##### parquet_late_materialization_enable

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 一个布尔值，控制是否启用 Parquet 读取器的晚期物化以提高性能。`true` 表示启用晚期物化，`false` 表示禁用。
- 引入版本: -

##### parquet_page_index_enable

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 一个布尔值，控制是否启用 Parquet 文件的 pageindex 以提高性能。`true` 表示启用 pageindex，`false` 表示禁用。
- 引入版本: v3.3

##### parquet_reader_bloom_filter_enable

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 一个布尔值，控制是否启用 Parquet 文件的 Bloom Filter 以提高性能。`true` 表示启用 Bloom Filter，`false` 表示禁用。您也可以通过会话变量 `enable_parquet_reader_bloom_filter` 在会话级别控制此行为。Parquet 中的 Bloom Filter **在每个行组的列级别维护**。如果 Parquet 文件包含某些列的 Bloom Filter，查询可以使用这些列上的谓词高效地跳过行组。
- 引入版本: v3.5

##### path_gc_check_step

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每次可连续扫描的最大文件数。
- 引入版本: -

##### path_gc_check_step_interval_ms

- 默认值: 10
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 文件扫描之间的时间间隔。
- 引入版本: -

##### path_scan_interval_second

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: GC 清理过期数据的时间间隔。
- 引入版本: -

##### pipeline_connector_scan_thread_num_per_cpu

- 默认值: 8
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 每个 BE 节点中 Pipeline Connector 分配给每个 CPU 核心的扫描线程数。此配置项从 v3.1.7 开始更改为动态。
- 引入版本: -

##### pipeline_poller_timeout_guard_ms

- 默认值: -1
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 当此项设置为大于 `0` 时，如果一个 driver 在 poller 中单次调度耗时超过 `pipeline_poller_timeout_guard_ms`，则会打印该 driver 和 operator 的信息。
- 引入版本: -

##### pipeline_prepare_thread_pool_queue_size

- 默认值: 102400
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Pipeline 执行引擎的 PREPARE 片段线程池的最大队列长度。
- 引入版本: -

##### pipeline_prepare_thread_pool_thread_num

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Pipeline 执行引擎 PREPARE 片段线程池中的线程数。`0` 表示该值等于系统 VCPU 核心数。
- 引入版本: -

##### pipeline_prepare_timeout_guard_ms

- 默认值: -1
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 当此项设置为大于 `0` 时，如果一个计划片段在 PREPARE 过程中超过 `pipeline_prepare_timeout_guard_ms`，则会打印该计划片段的栈追踪。
- 引入版本: -

##### pipeline_scan_thread_pool_queue_size

- 默认值: 102400
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Pipeline 执行引擎的 SCAN 线程池的最大任务队列长度。
- 引入版本: -

##### pk_index_parallel_get_threadpool_size

- 默认值: 1048576
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 设置共享数据（云原生/lake）模式下 PK 索引并行获取操作使用的 "cloud_native_pk_index_get" 线程池的最大队列大小（挂起任务数）。该池的实际线程数由 `pk_index_parallel_get_threadpool_max_threads` 控制；此设置仅限制可能排队等待执行的任务数量。非常大的默认值 (2^20) 实际上使队列无界；降低它可防止排队任务导致过度内存增长，但可能在队列满时导致任务提交阻塞或失败。根据工作负载并发性和内存约束，与 `pk_index_parallel_get_threadpool_max_threads` 一起调整。
- 引入版本: -

##### priority_queue_remaining_tasks_increased_frequency

- 默认值: 512
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 控制 BlockingPriorityQueue 提高所有剩余任务优先级（“老化”）以避免饥饿的频率。每次成功 get/pop 都会增加内部 `_upgrade_counter`；当 `_upgrade_counter` 超过 `priority_queue_remaining_tasks_increased_frequency` 时，队列会增加每个元素的优先级，重建堆，并重置计数器。较小的值会导致更频繁的优先级老化（减少饥饿但增加迭代和重新堆化的 CPU 成本）；较大的值会减少该开销但延迟优先级调整。该值是简单的操作计数阈值，而不是时间持续时间。
- 引入版本: v3.2.0

##### query_cache_capacity

- 默认值: 536870912
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: BE 中查询缓存的大小。默认大小为 512 MB。大小不能小于 4 MB。如果 BE 的内存容量不足以提供预期的查询缓存大小，您可以增加 BE 的内存容量。
- 引入版本: -

##### query_pool_spill_mem_limit_threshold

- 默认值: 1.0
- 类型: Double
- 单位: -
- 是否可变: 否
- 描述: 如果启用自动溢出，当所有查询的内存使用量超过 `query_pool memory limit * query_pool_spill_mem_limit_threshold` 时，将触发中间结果溢出。
- 引入版本: v3.2.7

##### query_scratch_dirs

- 默认值: `${STARROCKS_HOME}`
- 类型: string
- 单位: -
- 是否可变: 否
- 描述: 以逗号分隔的 scratch 目录列表，由查询执行用于溢出中间数据（例如，外部排序、哈希连接和其他操作）。指定一个或多个以 `;` 分隔的路径（例如，`/mnt/ssd1/tmp;/mnt/ssd2/tmp`）。目录应可由 BE 进程访问和写入，并有足够的可用空间；StarRocks 将从中选择以分配溢出 I/O。更改需要重新启动才能生效。如果目录缺失、不可写入或已满，溢出可能会失败或降低查询性能。
- 引入版本: v3.2.0

##### result_buffer_cancelled_interval_time

- 默认值: 300
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: BufferControlBlock 释放数据前的等待时间。
- 引入版本: -

##### scan_context_gc_interval_min

- 默认值: 5
- 类型: Int
- 单位: 分钟
- 是否可变: 是
- 描述: 清理 Scan Context 的时间间隔。
- 引入版本: -

##### scanner_row_num

- 默认值: 16384
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每次扫描中每个扫描线程返回的最大行数。
- 引入版本: -

##### scanner_thread_pool_queue_size

- 默认值: 102400
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 存储引擎支持的扫描任务数量。
- 引入版本: -

##### scanner_thread_pool_thread_num

- 默认值: 48
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 存储引擎用于并发存储卷扫描的线程数。所有线程都在线程池中管理。
- 引入版本: -

##### string_prefix_zonemap_prefix_len

- 默认值: 16
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 当 `enable_string_prefix_zonemap` 启用时，用于字符串 ZoneMap Min/Max 的前缀长度。
- 引入版本: -

##### udf_thread_pool_size

- 默认值: 1
- 类型: Int
- 单位: 线程
- 是否可变: 否
- 描述: 设置 ExecEnv 中创建的 UDF 调用 PriorityThreadPool 的大小（用于执行用户定义函数/UDF 相关任务）。该值用作线程池的线程计数，也用作构建线程池（PriorityThreadPool("udf", thread_num, queue_size)）时的队列容量。增加此值以允许更多并发 UDF 执行；保持较小值以避免过多的 CPU 和内存争用。
- 引入版本: v3.2.0

##### update_memory_limit_percent

- 默认值: 60
- 类型: Int
- 单位: 百分比
- 是否可变: 否
- 描述: 预留给更新相关内存和缓存的 BE 进程内存的百分比。在启动期间，`GlobalEnv` 计算更新的 `MemTracker` 为 `process_mem_limit * clamp(update_memory_limit_percent, 0, 100) / 100`。`UpdateManager` 也使用此百分比来调整其主索引/索引缓存容量（索引缓存容量 = `GlobalEnv::process_mem_limit * update_memory_limit_percent / 100`）。HTTP 配置更新逻辑注册了一个回调，该回调在更新管理器上调用 `update_primary_index_memory_limit`，因此如果配置更改，更改将应用于更新子系统。增加此值会为更新/主索引路径提供更多内存（减少其他池可用的内存）；减少它会减少更新内存和缓存容量。值被限制在 0-100 范围内。
- 引入版本: v3.2.0

##### vector_chunk_size

- 默认值: 4096
- 类型: Int
- 单位: 行
- 是否可变: 否
- 描述: 在整个执行和存储代码路径中使用的每个向量化 Chunk（批次）的行数。此值控制 Chunk 和 RuntimeState 的 `batch_size` 创建，影响操作符吞吐量、每个操作符的内存占用、溢出和排序缓冲区大小，以及 I/O 启发式（例如，ORC 写入器自然写入大小）。增加它可以在宽/CPU 密集型工作负载中提高 CPU 和 I/O 效率，但会提高峰值内存使用，并可能增加小结果查询的延迟。仅当分析显示批次大小是瓶颈时才进行调整；否则保持默认值以平衡内存和性能。
- 引入版本: v3.2.0

### 加载

##### clear_transaction_task_worker_count

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于清除事务的线程数。
- 引入版本: -

##### column_mode_partial_update_insert_batch_size

- 默认值: 4096
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 列模式部分更新处理插入行时的批次大小。如果此项设置为 `0` 或负数，它将被限制为 `1` 以避免无限循环。此项控制每个批次处理的新插入行数。较大的值可以提高写入性能，但会消耗更多内存。
- 引入版本: v3.5.10, v4.0.2

##### enable_load_spill_parallel_merge

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 指定是否在单个 Tablet 中启用并行溢出合并。启用此功能可以提高数据加载期间溢出合并的性能。
- 引入版本: -

##### enable_stream_load_verbose_log

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 指定是否记录 Stream Load 作业的 HTTP 请求和响应。
- 引入版本: v2.5.17, v3.0.9, v3.1.6, v3.2.1

##### flush_thread_num_per_store

- 默认值: 2
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每个存储中用于刷新 MemTable 的线程数。
- 引入版本: -

##### lake_flush_thread_num_per_store

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中每个存储中用于刷新 MemTable 的线程数。
当此值设置为 `0` 时，系统将使用 CPU 核心数的两倍作为该值。
当此值设置为小于 `0` 时，系统将使用其绝对值与 CPU 核心数的乘积作为该值。
- 引入版本: v3.1.12, 3.2.7

##### load_data_reserve_hours

- 默认值: 4
- 类型: Int
- 单位: 小时
- 是否可变: 否
- 描述: 小型加载生成文件的保留时间。
- 引入版本: -

##### load_error_log_reserve_hours

- 默认值: 48
- 类型: Int
- 单位: 小时
- 是否可变: 是
- 描述: 数据加载日志的保留时间。
- 引入版本: -

##### load_process_max_memory_limit_bytes

- 默认值: 107374182400
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: BE 节点上所有加载进程可占用的内存资源的最大大小限制。
- 引入版本: -

##### load_spill_memory_usage_per_merge

- 默认值: 1073741824
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 溢出合并期间每个合并操作的最大内存使用量。默认值为 1 GB (1073741824 字节)。此参数控制数据加载溢出合并期间单个合并任务的内存消耗，以防止内存使用量过大。
- 引入版本: -

##### max_consumer_num_per_group

- 默认值: 3
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Routine Load 消费组中消费者的最大数量。
- 引入版本: -

##### max_runnings_transactions_per_txn_map

- 默认值: 100
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每个分区中可并发运行的最大事务数量。
- 引入版本: -

##### number_tablet_writer_threads

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 摄取（如 Stream Load、Broker Load 和 Insert）中使用的 Tablet 写入器线程数。当参数设置为小于或等于 0 时，系统使用 CPU 核心数的一半，最小值为 16。当参数设置为大于 0 时，系统使用该值。此配置项从 v3.1.7 开始更改为动态。
- 引入版本: -

##### push_worker_count_high_priority

- 默认值: 3
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于处理 HIGH 优先级加载任务的线程数。
- 引入版本: -

##### push_worker_count_normal_priority

- 默认值: 3
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于处理 NORMAL 优先级加载任务的线程数。
- 引入版本: -

##### streaming_load_max_batch_size_mb

- 默认值: 100
- 类型: Int
- 单位: MB
- 是否可变: 是
- 描述: 可流式传输到 StarRocks 的 JSON 文件的最大大小。
- 引入版本: -

##### streaming_load_max_mb

- 默认值: 102400
- 类型: Int
- 单位: MB
- 是否可变: 是
- 描述: 可流式传输到 StarRocks 的文件的最大大小。从 v3.0 开始，默认值已从 `10240` 更改为 `102400`。
- 引入版本: -

##### streaming_load_rpc_max_alive_time_sec

- 默认值: 1200
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: Stream Load 的 RPC 超时。
- 引入版本: -

##### transaction_publish_version_thread_pool_idle_time_ms

- 默认值: 60000
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: 线程被 Publish Version 线程池回收前的空闲时间。
- 引入版本: -

##### transaction_publish_version_worker_count

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于发布版本的最大线程数。当此值设置为小于或等于 `0` 时，系统将使用 CPU 核心数作为该值，以避免在高导入并发但仅使用固定线程数时出现线程资源不足的问题。从 v2.5 开始，默认值已从 `8` 更改为 `0`。
- 引入版本: -

##### write_buffer_size

- 默认值: 104857600
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 内存中 MemTable 的缓冲区大小。此配置项是触发刷新的阈值。
- 引入版本: -

### 加载和卸载

##### broker_write_timeout_seconds

- 默认值: 30
- 类型: int
- 单位: 秒
- 是否可变: 否
- 描述: 后端 Broker 操作用于写入/IO RPC 的超时（秒）。该值乘以 1000 以生成毫秒超时，并作为默认的 timeout_ms 传递给 BrokerFileSystem 和 BrokerServiceConnection 实例（例如，文件导出和快照上传/下载）。当 Broker 或网络缓慢或传输大文件时，增加此值以避免过早超时；减少此值可能会导致 Broker RPC 失败更早。此值在 common/config 中定义，并在进程启动时应用（不可动态重新加载）。
- 引入版本: v3.2.0

##### enable_load_channel_rpc_async

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 启用时，加载通道打开 RPC（例如，`PTabletWriterOpen`）的处理将从 BRPC Worker 卸载到专用线程池：请求处理程序创建一个 `ChannelOpenTask` 并将其提交到内部 `_async_rpc_pool`，而不是在行内运行 `LoadChannelMgr::_open`。这减少了 BRPC 线程中的工作和阻塞，并允许通过 `load_channel_rpc_thread_pool_num` 和 `load_channel_rpc_thread_pool_queue_size` 调整并发性。如果线程池提交失败（当池已满或已关闭时），请求将被取消并返回错误状态。池在 `LoadChannelMgr::close()` 时关闭，因此在启用此功能时请考虑容量和生命周期，以避免请求被拒绝或处理延迟。
- 引入版本: v3.5.0

##### enable_load_diagnose

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 启用时，StarRocks 会在 bRPC 超时匹配 "[E1008]Reached timeout" 后，尝试从 BE OlapTableSink/NodeChannel 进行自动化负载诊断。代码会创建一个 `PLoadDiagnoseRequest` 并向远程 LoadChannel 发送 RPC，以收集配置文件和/或栈追踪（由 `load_diagnose_rpc_timeout_profile_threshold_ms` 和 `load_diagnose_rpc_timeout_stack_trace_threshold_ms` 控制）。诊断 RPC 使用 `load_diagnose_send_rpc_timeout_ms` 作为其超时。如果诊断请求已在进行中，则跳过诊断。启用此功能会在目标节点上产生额外的 RPC 和分析工作；在敏感的生产工作负载上禁用此功能以避免额外开销。
- 引入版本: v3.5.0

##### enable_load_segment_parallel

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 启用时，RowSet Segment 加载和 RowSet 级别读取将使用 StarRocks 后台线程池（ExecEnv::load_segment_thread_pool 和 ExecEnv::load_rowset_thread_pool）并发执行。Rowset::load_segments 和 TabletReader::get_segment_iterators 将每个 Segment 或每个 RowSet 的任务提交到这些池中，如果提交失败，则回退到串行加载并记录警告。启用此功能可以降低大型 RowSet 的读取/加载延迟，但会增加 CPU/IO 并发性和内存压力。注意：并行加载可能会改变 Segment 的加载完成顺序，从而阻止部分 Compaction（代码会检查 `_parallel_load` 并在启用时禁用部分 Compaction）；请考虑依赖 Segment 顺序的操作的影响。
- 引入版本: v3.3.0, v3.4.0, v3.5.0

##### enable_streaming_load_thread_pool

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 控制 Streaming Load 扫描器是否提交到专用的 Streaming Load 线程池。当启用且查询是带有 `TLoadJobType::STREAM_LOAD` 的 LOAD 时，ConnectorScanNode 会将扫描器任务提交到 `streaming_load_thread_pool`（配置有 INT32_MAX 个线程和队列大小，即实际上无界）。禁用时，扫描器使用通用 `thread_pool` 及其 `PriorityThreadPool` 提交逻辑（优先级计算、try_offer/offer 行为）。启用此功能可将 Streaming Load 工作与常规查询执行隔离，以减少干扰；但是，由于专用池实际上是无界的，启用此功能可能会在重度 Streaming Load 流量下增加并发线程和资源使用。此选项默认开启，通常不需要修改。
- 引入版本: v3.2.0

##### es_http_timeout_ms

- 默认值: 5000
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: ESScanReader 中 ES 网络客户端用于 Elasticsearch 滚动请求的 HTTP 连接超时（毫秒）。此值通过 `network_client.set_timeout_ms()` 应用，然后发送后续的滚动 POST，并控制客户端在滚动期间等待 ES 响应的时间。对于慢速网络或大型查询，增加此值以避免过早超时；减少此值以更快地对无响应的 ES 节点失败。此设置补充了 `es_scroll_keepalive`，后者控制滚动上下文的保活持续时间。
- 引入版本: v3.2.0

##### es_index_max_result_window

- 默认值: 10000
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 限制 StarRocks 在单个批次中从 Elasticsearch 请求的最大文档数。StarRocks 在为 ES 读取器构建 `KEY_BATCH_SIZE` 时，将 ES 请求批次大小设置为 min(`es_index_max_result_window`, `chunk_size`)。如果 ES 请求超过 Elasticsearch 索引设置 `index.max_result_window`，Elasticsearch 将返回 HTTP 400 (Bad Request)。在扫描大型索引时调整此值，或在 Elasticsearch 端增加 ES `index.max_result_window` 以允许更大的单个请求。
- 引入版本: v3.2.0

##### ignore_load_tablet_failure

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 当此项设置为 `false` 时，系统将把任何 Tablet 头加载失败（非 NotFound 和非 AlreadyExist 错误）视为致命错误：代码会记录错误并调用 LOG(FATAL) 以停止 BE 进程。当设置为 `true` 时，BE 将在出现此类每个 Tablet 的加载错误时继续启动——失败的 Tablet ID 会被记录并跳过，而成功的 Tablet 仍然会被加载。请注意，此参数不会抑制 RocksDB 元扫描本身导致的致命错误，这些错误始终会导致进程退出。
- 引入版本: v3.2.0

##### load_channel_abort_clean_up_delay_seconds

- 默认值: 600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 控制系统在从 `_aborted_load_channels` 中移除中止的加载通道的加载 ID 之前保留多长时间（秒）。当加载作业被取消或失败时，加载 ID 会被记录下来，以便任何迟到的加载 RPC 可以立即被拒绝；一旦延迟过期，该条目将在定期后台扫描（最小扫描间隔为 60 秒）期间被清除。将延迟设置得过低可能会在中止后接受离散的 RPC，而设置得过高可能会保留状态并消耗资源超过必要的时间。调整此值以平衡迟到请求拒绝的正确性和中止加载的资源保留。
- 引入版本: v3.5.11, v4.0.4

##### load_channel_rpc_thread_pool_num

- 默认值: -1
- 类型: Int
- 单位: 线程
- 是否可变: 是
- 描述: 加载通道异步 RPC 线程池的最大线程数。当设置为小于或等于 0（默认 `-1`）时，池大小会自动设置为 CPU 核心数 (`CpuInfo::num_cores()`)。配置的值用作 ThreadPoolBuilder 的最大线程数，池的最小线程数设置为 min(5, max_threads)。池队列大小由 `load_channel_rpc_thread_pool_queue_size` 单独控制。引入此设置是为了使异步 RPC 池大小与 bRPC worker 的默认值 (`brpc_num_threads`) 对齐，以便在加载 RPC 处理从同步切换到异步后行为保持兼容。在运行时更改此配置会触发 `ExecEnv::GetInstance()->load_channel_mgr()->async_rpc_pool()->update_max_threads(...)`。
- 引入版本: v3.5.0

##### load_channel_rpc_thread_pool_queue_size

- 默认值: 1024000
- 类型: int
- 单位: 计数
- 是否可变: 否
- 描述: 设置由 LoadChannelMgr 创建的加载通道 RPC 线程池的最大挂起任务队列大小。当 `enable_load_channel_rpc_async` 启用时，此线程池执行异步 `open` 请求；池大小与 `load_channel_rpc_thread_pool_num` 配对。默认值较大 (1024000) 与 bRPC worker 的默认值对齐，以在从同步处理切换到异步处理后保持行为。如果队列已满，ThreadPool::submit() 将失败，并且传入的 open RPC 将被取消并返回错误，导致调用方收到拒绝。增加此值以缓冲更大批量的并发 `open` 请求；减少它会收紧反压，但可能会在负载下导致更多拒绝。
- 引入版本: v3.5.0

##### load_diagnose_rpc_timeout_profile_threshold_ms

- 默认值: 60000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 当加载 RPC 超时（错误包含 "[E1008]Reached timeout"）且 `enable_load_diagnose` 为 true 时，此阈值控制是否请求完整的分析诊断。如果请求级别的 RPC 超时 `_rpc_timeout_ms` 大于 `load_diagnose_rpc_timeout_profile_threshold_ms`，则该诊断启用分析。对于较小的 `_rpc_timeout_ms` 值，分析每 20 次超时采样一次，以避免对实时/短超时加载进行频繁的重诊断。此值影响发送的 `PLoadDiagnoseRequest` 中的 `profile` 标志；栈追踪行为由 `load_diagnose_rpc_timeout_stack_trace_threshold_ms` 单独控制，发送超时由 `load_diagnose_send_rpc_timeout_ms` 控制。
- 引入版本: v3.5.0

##### load_diagnose_rpc_timeout_stack_trace_threshold_ms

- 默认值: 600000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 用于决定何时请求远程栈追踪以用于长时间运行的加载 RPC 的阈值（毫秒）。当加载 RPC 因超时错误而超时，并且有效 RPC 超时 (`_rpc_timeout_ms`) 超过此值时，`OlapTableSink`/`NodeChannel` 将在 `load_diagnose` RPC 中包含 `stack_trace=true` 发送到目标 BE，以便 BE 可以返回栈追踪进行调试。`LocalTabletsChannel::SecondaryReplicasWaiter` 也会在等待次要副本超过此间隔时，触发主副本的最佳尝试栈追踪诊断。此行为需要 `enable_load_diagnose`，并使用 `load_diagnose_send_rpc_timeout_ms` 作为诊断 RPC 超时；分析由 `load_diagnose_rpc_timeout_profile_threshold_ms` 单独控制。降低此值会增加请求栈追踪的积极性。
- 引入版本: v3.5.0

##### load_diagnose_send_rpc_timeout_ms

- 默认值: 2000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 应用于 BE 加载路径启动的诊断相关 bRPC 调用的超时（毫秒）。它用于为 `load_diagnose` RPC（当 LoadChannel bRPC 调用超时时由 NodeChannel/OlapTableSink 发送）和副本状态查询（当 SecondaryReplicasWaiter / LocalTabletsChannel 检查主副本状态时使用）设置控制器超时。选择足够高的值，以允许远程端响应配置文件或栈追踪数据，但不要太高，以免延迟故障处理。此参数与 `enable_load_diagnose`、`load_diagnose_rpc_timeout_profile_threshold_ms` 和 `load_diagnose_rpc_timeout_stack_trace_threshold_ms` 协同工作，它们控制何时以及请求何种诊断信息。
- 引入版本: v3.5.0

##### load_fp_brpc_timeout_ms

- 默认值: -1
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 当 `node_channel_set_brpc_timeout` 故障点触发时，覆盖 OlapTableSink 使用的每个通道 bRPC RPC 超时。如果设置为正值，NodeChannel 将其内部 `_rpc_timeout_ms` 设置为该值（毫秒），导致 open/add-chunk/cancel RPC 使用较短的超时，并启用模拟产生 "[E1008]Reached timeout" 错误的 bRPC 超时。默认值 (`-1`) 禁用此覆盖。更改此值用于测试和故障注入；小值可能会产生虚假超时并触发加载诊断（参见 `enable_load_diagnose`、`load_diagnose_rpc_timeout_profile_threshold_ms`、`load_diagnose_rpc_timeout_stack_trace_threshold_ms` 和 `load_diagnose_send_rpc_timeout_ms`）。
- 引入版本: v3.5.0

##### load_fp_tablets_channel_add_chunk_block_ms

- 默认值: -1
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 启用时（设置为正毫秒值），此故障点配置会使 TabletsChannel::add_chunk 在加载处理期间休眠指定时间。它用于模拟 BRPC 超时错误（例如，"[E1008]Reached timeout"）并模拟耗时的 add_chunk 操作，从而增加加载延迟。小于或等于 0 的值（默认 `-1`）禁用注入。用于测试故障处理、超时和副本同步行为——请勿在正常生产工作负载中启用，因为它会延迟写入完成并可能触发上游超时或副本中止。
- 引入版本: v3.5.0

##### load_segment_thread_pool_num_max

- 默认值: 128
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 设置 BE 加载相关线程池的最大工作线程数。此值由 ThreadPoolBuilder 用于限制 `exec_env.cpp` 中的 `load_rowset_pool` 和 `load_segment_pool` 的线程，控制 Streaming 和批处理加载期间处理已加载 RowSet 和 Segment（例如，解码、索引、写入）的并发性。增加此值可提高并行性并可提高加载吞吐量，但也会增加 CPU、内存使用和潜在的争用；减少此值会限制并发加载处理并可能降低吞吐量。与 `load_segment_thread_pool_queue_size` 和 `streaming_load_thread_pool_idle_time_ms` 一起调整。更改需要 BE 重启。
- 引入版本: v3.3.0, v3.4.0, v3.5.0

##### load_segment_thread_pool_queue_size

- 默认值: 10240
- 类型: Int
- 单位: 任务
- 是否可变: 否
- 描述: 设置创建为 "load_rowset_pool" 和 "load_segment_pool" 的加载相关线程池的最大队列长度（挂起任务数）。这些池使用 `load_segment_thread_pool_num_max` 作为其最大线程数，此配置控制在 ThreadPool 的溢出策略生效之前可以缓冲多少加载 Segment/RowSet 任务（进一步的提交可能会根据 ThreadPool 的实现被拒绝或阻塞）。增加此值以允许更多挂起的加载工作（使用更多内存并可能增加延迟）；减少它以限制缓冲的加载并发性并减少内存使用。
- 引入版本: v3.3.0, v3.4.0, v3.5.0

##### max_pulsar_consumer_num_per_group

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 控制 BE 上 Routine Load 的单个数据消费组中可以创建的最大 Pulsar 消费者数量。由于多主题订阅不支持累积确认，每个消费者精确订阅一个主题/分区；如果 `pulsar_info->partitions` 中的分区数量超过此值，则组创建将失败，并提示增加 BE 上的 `max_pulsar_consumer_num_per_group` 或添加更多 BE。此限制在构建 PulsarDataConsumerGroup 时强制执行，并防止 BE 为一个 Routine Load 组托管超过此数量的消费者。对于 Kafka Routine Load，则使用 `max_consumer_num_per_group`。
- 引入版本: v3.2.0

##### pull_load_task_dir

- 默认值: `${STARROCKS_HOME}/var/pull_load`
- 类型: string
- 单位: -
- 是否可变: 否
- 描述: 文件系统路径，BE 在此存储“拉取加载”任务的数据和工作文件（下载的源文件、任务状态、临时输出等）。该目录必须可由 BE 进程写入，并有足够的磁盘空间用于传入加载。默认值相对于 STARROCKS_HOME；测试创建并期望此目录存在（参见测试配置）。
- 引入版本: v3.2.0

##### routine_load_kafka_timeout_second

- 默认值: 10
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: Kafka 相关 Routine Load 操作使用的超时（秒）。当客户端请求未指定超时时，`routine_load_kafka_timeout_second` 用作 `get_info` 的默认 RPC 超时（转换为毫秒）。它也用作 librdkafka 消费者的每次调用消费轮询超时（转换为毫秒并受限于剩余运行时）。注意：内部 `get_info` 路径在将其传递给 librdkafka 之前将此值减少 80%，以避免 FE 端超时竞争。将此值设置为平衡及时故障报告和网络/代理响应足够时间的值；更改需要重新启动，因为此设置为不可变。
- 引入版本: v3.2.0

##### routine_load_pulsar_timeout_second

- 默认值: 10
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: BE 在请求未提供明确超时时，用于 Pulsar 相关 Routine Load 操作的默认超时（秒）。具体来说，`PInternalServiceImplBase::get_pulsar_info` 将此值乘以 1000 以形成传递给获取 Pulsar 分区元数据和积压的 Routine Load 任务执行器方法的毫秒超时。增加此值以允许较慢的 Pulsar 响应，但会增加故障检测时间；减少此值以更快地对慢速 Broker 失败。类似于用于 Kafka 的 `routine_load_kafka_timeout_second`。
- 引入版本: v3.2.0

##### streaming_load_thread_pool_idle_time_ms

- 默认值: 2000
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: 设置 Streaming Load 相关线程池的线程空闲超时（毫秒）。该值用作传递给 ThreadPoolBuilder 的 `stream_load_io` 池以及 `load_rowset_pool` 和 `load_segment_pool` 的空闲超时。这些池中的线程在此持续时间内空闲时将被回收；较小的值可更快释放资源但增加线程创建开销，而较大值可保持线程在短时突发负载下存活。`stream_load_io` 池在 `enable_streaming_load_thread_pool` 启用时使用。
- 引入版本: v3.2.0

##### streaming_load_thread_pool_num_min

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: ExecEnv 初始化期间创建的 Streaming Load IO 线程池 ("stream_load_io") 的最小线程数。该池以 `set_max_threads(INT32_MAX)` 和 `set_max_queue_size(INT32_MAX)` 构建，因此它实际上是无界的，以避免并发 Streaming Load 时的死锁。值为 0 允许池在启动时没有线程并按需增长；设置正值会在启动时保留那么多线程。此池在 `enable_streaming_load_thread_pool` 为 true 时使用，其空闲超时由 `streaming_load_thread_pool_idle_time_ms` 控制。总体并发性仍受 `fragment_pool_thread_num_max` 和 `webserver_num_workers` 限制；更改此值很少有必要，如果设置过高可能会增加资源使用。
- 引入版本: v3.2.0

### 统计报告

##### enable_metric_calculator

- 默认值: true
- 类型: boolean
- 单位: -
- 是否可变: 否
- 描述: 当为 true 时，BE 进程会启动一个后台“metrics_daemon”线程（在非 Apple 平台上通过 Daemon::init 启动），该线程每约 15 秒运行一次，调用 `StarRocksMetrics::instance()->metrics()->trigger_hook()` 并计算派生/系统指标（例如，push/query 字节/秒、最大磁盘 I/O 利用率、最大网络发送/接收速率），记录内存分解并运行表指标清理。当为 false 时，这些 hook 在指标收集时在 `MetricRegistry::collect` 内部同步执行，这可能会增加指标抓取延迟。需要重新启动进程才能生效。
- 引入版本: v3.2.0

##### enable_system_metrics

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 当为 true 时，StarRocks 在启动期间初始化系统级监控：它从配置的存储路径发现磁盘设备并枚举网络接口，然后将此信息传递到指标子系统，以启用磁盘 I/O、网络流量和内存相关系统指标的收集。如果设备或接口发现失败，初始化会记录警告并中止系统指标设置。此标志仅控制是否初始化系统指标；周期性指标聚合线程由 `enable_metric_calculator` 单独控制，JVM 指标初始化由 `enable_jvm_metrics` 控制。更改此值需要重新启动。
- 引入版本: v3.2.0

##### profile_report_interval

- 默认值: 30
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: ProfileReportWorker 用于 (1) 决定何时报告 LOAD 查询的每个片段配置文件信息，以及 (2) 在报告周期之间睡眠的时间间隔（秒）。Worker 将当前时间与每个任务的 last_report_time 使用 (profile_report_interval * 1000) ms 进行比较，以确定是否应为非 Pipeline 和 Pipeline 加载任务重新报告配置文件。在每个循环中，Worker 读取当前值（运行时可变）；如果配置值小于或等于 0，Worker 会强制将其设置为 1 并发出警告。更改此值会影响下一次报告决策和睡眠持续时间。
- 引入版本: v3.2.0

##### report_disk_state_interval_seconds

- 默认值: 60
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 报告存储卷状态的时间间隔，包括卷内数据的大小。
- 引入版本: -

##### report_resource_usage_interval_ms

- 默认值: 1000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: BE 代理向 FE (master) 发送周期性资源使用报告的间隔（毫秒）。代理工作线程收集 TResourceUsage（运行中的查询数量、已用/限制内存、已用 CPU 千分比和资源组使用情况）并调用 report_task，然后在此配置的间隔内休眠（参见 task_worker_pool）。较小的值可提高报告及时性，但会增加 CPU、网络和 master 负载；较大的值可减少开销，但会使资源信息更新不及时。报告更新相关指标（report_resource_usage_requests_total、report_resource_usage_requests_failed）。根据集群规模和 FE 负载进行调整。
- 引入版本: v3.2.0

##### report_tablet_interval_seconds

- 默认值: 60
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 报告所有 Tablet 最新版本的时间间隔。
- 引入版本: -

##### report_task_interval_seconds

- 默认值: 10
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 报告任务状态的时间间隔。任务可以是创建表、删除表、加载数据或更改表模式。
- 引入版本: -

##### report_workgroup_interval_seconds

- 默认值: 5
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 报告所有工作组最新版本的时间间隔。
- 引入版本: -

### 存储

##### alter_tablet_worker_count

- 默认值: 3
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于 Schema Change 的线程数。
- 引入版本: -

##### avro_ignore_union_type_tag

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否从 Avro Union 数据类型序列化的 JSON 字符串中剥离类型标签。
- 引入版本: v3.3.7, v3.4

##### base_compaction_check_interval_seconds

- 默认值: 60
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: Base Compaction 的线程轮询时间间隔。
- 引入版本: -

##### base_compaction_interval_seconds_since_last_operation

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 上次 Base Compaction 发生以来的时间间隔。此配置项是触发 Base Compaction 的条件之一。
- 引入版本: -

##### base_compaction_num_threads_per_disk

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 每个存储卷上用于 Base Compaction 的线程数。
- 引入版本: -

##### base_cumulative_delta_ratio

- 默认值: 0.3
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 累积文件大小与 Base 文件大小之比。此比率达到此值是触发 Base Compaction 的条件之一。
- 引入版本: -

##### chaos_test_enable_random_compaction_strategy

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 当此项设置为 `true` 时，TabletUpdates::compaction() 使用为混沌工程测试设计的随机 Compaction 策略 (compaction_random)。此标志强制 Compaction 遵循非确定性/随机策略而不是正常策略（例如，size-tiered Compaction），并在 Tablet 的 Compaction 选择期间优先。它仅用于受控测试：启用它可能会产生不可预测的 Compaction 顺序、增加 I/O/CPU 和测试不稳定性。请勿在生产环境中启用；仅用于故障注入或混沌测试场景。
- 引入版本: v3.3.12, 3.4.2, 3.5.0, 4.0.0

##### check_consistency_worker_count

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于检查 Tablet 一致性的线程数。
- 引入版本: -

##### clear_expired_replication_snapshots_interval_seconds

- 默认值: 3600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 系统清除异常复制遗留的过期快照的时间间隔。
- 引入版本: v3.3.5

##### compact_threads

- 默认值: 4
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于并发 Compaction 任务的最大线程数。此配置项从 v3.1.7 和 v3.2.2 开始更改为动态。
- 引入版本: v3.0.0

##### compaction_max_memory_limit

- 默认值: -1
- 类型: Long
- 单位: 字节
- 是否可变: 否
- 描述: 此 BE 上 Compaction 任务可用内存的全局上限（字节）。在 BE 初始化期间，最终的 Compaction 内存限制计算为 min(`compaction_max_memory_limit`, process_mem_limit * `compaction_max_memory_limit_percent` / 100)。如果 `compaction_max_memory_limit` 为负数（默认 `-1`），则回退到从 `mem_limit` 派生的 BE 进程内存限制。百分比值被限制在 [0,100] 之间。如果进程内存限制未设置（负数），Compaction 内存保持无限制（`-1`）。此计算值用于初始化 `_compaction_mem_tracker`。另请参见 `compaction_max_memory_limit_percent` 和 `compaction_memory_limit_per_worker`。
- 引入版本: v3.2.0

##### compaction_max_memory_limit_percent

- 默认值: 100
- 类型: Int
- 单位: 百分比
- 是否可变: 否
- 描述: 可用于 Compaction 的 BE 进程内存的百分比。BE 将 Compaction 内存上限计算为 `compaction_max_memory_limit` 和 (进程内存限制 × 此百分比 / 100) 中的最小值。如果此值 < 0 或 > 100，则将其视为 100。如果 `compaction_max_memory_limit` < 0，则改用进程内存限制。该计算还考虑了从 `mem_limit` 派生的 BE 进程内存。结合 `compaction_memory_limit_per_worker`（每个 Worker 的上限），此设置控制可用的总 Compaction 内存，从而影响 Compaction 并发性和 OOM 风险。
- 引入版本: v3.2.0

##### compaction_memory_limit_per_worker

- 默认值: 2147483648
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 每个 Compaction 线程允许的最大内存大小。
- 引入版本: -

##### compaction_trace_threshold

- 默认值: 60
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 每次 Compaction 的时间阈值。如果 Compaction 耗时超过此阈值，StarRocks 将打印相应的追踪。
- 引入版本: -

##### create_tablet_worker_count

- 默认值: 3
- 类型: Int
- 单位: 线程
- 是否可变: 是
- 描述: 设置 AgentServer 线程池中处理 FE 提交的 `TTaskType::CREATE` (create-tablet) 任务的最大工作线程数。在 BE 启动时，此值用作线程池的最大值（池创建时最小线程数为 1，最大队列大小无限制），在运行时通过 `update-config` HTTP 操作更改此值会触发 `ExecEnv::agent_server()->get_thread_pool(TTaskType::CREATE)->update_max_threads(...)`。增加此值可提高并发 Tablet 创建吞吐量（在批量加载或分区创建期间很有用）；减少它会限制并发创建操作。提高此值会增加 CPU、内存和 I/O 并发性，并可能导致争用；线程池强制至少一个线程，因此小于 1 的值没有实际效果。
- 引入版本: v3.2.0

##### cumulative_compaction_check_interval_seconds

- 默认值: 1
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 累积 Compaction 的线程轮询时间间隔。
- 引入版本: -

##### cumulative_compaction_num_threads_per_disk

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 每块磁盘的累积 Compaction 线程数。
- 引入版本: -

##### data_page_size

- 默认值: 65536
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 构建列数据和索引页时使用的目标未压缩页大小（字节）。此值被复制到 ColumnWriterOptions.data_page_size 和 IndexedColumnWriterOptions.index_page_size，并由页构建器（例如 BinaryPlainPageBuilder::is_page_full 和缓冲区预留逻辑）查询，以决定何时完成页以及预留多少内存。值为 0 会禁用构建器中的页大小限制。更改此值会影响页计数、元数据开销、内存预留以及 I/O/压缩权衡（较小的页 → 更多页和元数据；较大的页 → 较少页，可能更好的压缩但更大的内存峰值）。
- 引入版本: v3.2.4

##### default_num_rows_per_column_file_block

- 默认值: 1024
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每个行块中可存储的最大行数。
- 引入版本: -

##### delete_worker_count_high_priority

- 默认值: 1
- 类型: Int
- 单位: 线程
- 是否可变: 否
- 描述: DeleteTaskWorkerPool 中被分配为高优先级删除线程的工作线程数。启动时 AgentServer 创建删除池，总线程数 = delete_worker_count_normal_priority + delete_worker_count_high_priority；前 `delete_worker_count_high_priority` 个线程被标记为专门尝试弹出 TPriority::HIGH 任务（它们轮询高优先级删除任务，如果没有可用则休眠/循环）。增加此值会增加高优先级删除请求的并发性；减少此值会降低专用容量，并可能增加高优先级删除的延迟。
- 引入版本: v3.2.0

##### dictionary_encoding_ratio

- 默认值: 0.7
- 类型: Double
- 单位: -
- 是否可变: 否
- 描述: StringColumnWriter 在编码推测阶段用于决定 Chunk 的字典（DICT_ENCODING）和普通（PLAIN_ENCODING）编码之间的分数（0.0–1.0）。代码计算 max_card = `row_count * dictionary_encoding_ratio` 并扫描 Chunk 的不同键计数；如果不同计数超过 max_card，写入器选择 PLAIN_ENCODING。仅当 Chunk 大小通过 `dictionary_speculate_min_chunk_size`（且 `row_count > dictionary_min_rowcount`）时才执行检查。设置较高的值有利于字典编码（容忍更多不同键）；设置较低的值会导致更早回退到普通编码。值为 1.0 实际上强制使用字典编码（不同计数永远不会超过行数）。
- 引入版本: v3.2.0

##### dictionary_encoding_ratio_for_non_string_column

- 默认值: 0
- 类型: double
- 单位: -
- 是否可变: 否
- 描述: 用于决定是否对非字符串列（数值、日期/时间、Decimal 类型）使用字典编码的比例阈值。启用时（值 > 0.0001），写入器计算 `max_card = row_count * dictionary_encoding_ratio_for_non_string_column`，对于 `row_count > dictionary_min_rowcount` 的样本，仅当 `distinct_count ≤ max_card` 时才选择 DICT_ENCODING；否则回退到 BIT_SHUFFLE。值为 `0`（默认）禁用非字符串字典编码。此参数类似于 `dictionary_encoding_ratio`，但适用于非字符串列。使用 (0,1] 范围内的值——较小的值将字典编码限制到基数较低的列，并减少字典内存/IO 开销。
- 引入版本: v3.3.0, v3.4.0, v3.5.0

##### dictionary_page_size

- 默认值: 1048576
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 构建 RowSet Segment 时使用的字典页大小（字节）。此值被读取到 BE RowSet 代码中的 `PageBuilderOptions::dict_page_size`，并控制单个字典页中可以存储的字典条目数。增加此值可以通过允许更大的字典来提高字典编码列的压缩比，但更大的页在写入/编码期间会消耗更多内存，并且在读取或物化页时可能会增加 I/O 和延迟。对于大内存、写入密集型工作负载保守设置，并避免过大的值以防止运行时性能下降。
- 引入版本: v3.3.0, v3.4.0, v3.5.0

##### disk_stat_monitor_interval

- 默认值: 5
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 监视磁盘健康状态的时间间隔。
- 引入版本: -

##### download_low_speed_limit_kbps

- 默认值: 50
- 类型: Int
- 单位: KB/秒
- 是否可变: 是
- 描述: 每个 HTTP 请求的下载速度下限。当 HTTP 请求在 `download_low_speed_time` 配置项指定的时间跨度内持续以低于此值的速度运行时，请求将中止。
- 引入版本: -

##### download_low_speed_time

- 默认值: 300
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: HTTP 请求以低于限制的下载速度运行的最大时间。当 HTTP 请求在此配置项指定的时间跨度内持续以低于 `download_low_speed_limit_kbps` 值指定的速度运行时，请求将中止。
- 引入版本: -

##### download_worker_count

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: BE 节点上恢复作业下载任务的最大线程数。`0` 表示将该值设置为 BE 所在机器的 CPU 核心数。
- 引入版本: -

##### drop_tablet_worker_count

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于删除 Tablet 的线程数。`0` 表示节点中 CPU 核心数的一半。
- 引入版本: -

##### enable_check_string_lengths

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 加载期间是否检查数据长度，以解决因 VARCHAR 数据超出范围导致的 Compaction 失败。
- 引入版本: -

##### enable_event_based_compaction_framework

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否启用基于事件的 Compaction 框架。`true` 表示启用基于事件的 Compaction 框架，`false` 表示禁用。在 Tablet 数量多或单个 Tablet 数据量大的场景中，启用基于事件的 Compaction 框架可以大大降低 Compaction 开销。
- 引入版本: -

##### enable_lazy_delta_column_compaction

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 启用时，Compaction 将优先对部分列更新产生的增量列采用“懒惰”策略：StarRocks 将避免急于将增量列文件合并回其主 Segment 文件以节省 Compaction I/O。实际上，Compaction 选择代码会检查部分列更新 RowSet 和多个候选；如果找到且此标志为 true，引擎将停止向 Compaction 添加更多输入，或者仅合并空 RowSet (level -1)，将增量列分开。这减少了 Compaction 期间的即时 I/O 和 CPU，但代价是延迟合并（可能更多 Segment 和临时存储开销）。正确性和查询语义不变。
- 引入版本: v3.2.3

##### enable_new_load_on_memory_limit_exceeded

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 当达到内存资源硬限制时，是否允许新的加载进程。`true` 表示允许新的加载进程，`false` 表示拒绝。
- 引入版本: v3.3.2

##### enable_pk_index_parallel_compaction

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否在共享数据集群中为主键索引启用并行 Compaction。
- 引入版本: -

##### enable_pk_index_parallel_execution

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否在共享数据集群中为主键索引操作启用并行执行。启用后，系统会使用线程池在发布操作期间并发处理 Segment，显著提高大型 Tablet 的性能。
- 引入版本: -

##### enable_pk_index_eager_build

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 在数据导入和 Compaction 阶段是否急切构建主键索引文件。启用后，系统会在数据写入期间立即生成持久化 PK 索引文件，从而提高后续查询性能。
- 引入版本: -

##### enable_pk_size_tiered_compaction_strategy

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否为主键表启用 Size-tiered Compaction 策略。`true` 表示启用 Size-tiered Compaction 策略，`false` 表示禁用。
- 引入版本: 此项从 v3.2.4 和 v3.1.10 开始对共享数据集群生效，从 v3.2.5 和 v3.1.10 开始对共享无数据集群生效。

##### enable_rowset_verify

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否验证生成的 RowSet 的正确性。启用后，将在 Compaction 和 Schema Change 后检查生成的 RowSet 的正确性。
- 引入版本: -

##### enable_size_tiered_compaction_strategy

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否启用 Size-tiered Compaction 策略（不包括主键表）。`true` 表示启用 Size-tiered Compaction 策略，`false` 表示禁用。
- 引入版本: -

##### enable_strict_delvec_crc_check

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 当 `enable_strict_delvec_crc_check` 设置为 true 时，我们将对 delete vector 执行严格的 CRC32 检查，如果检测到不匹配，将返回失败。
- 引入版本: -

##### enable_transparent_data_encryption

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 启用时，StarRocks 将为新写入的存储对象（Segment 文件、删除/更新文件、RowSet Segment、Lake SST、持久索引文件等）创建加密的磁盘制品。写入器（RowsetWriter/SegmentWriter、Lake UpdateManager/LakePersistentIndex 和相关代码路径）将从 KeyCache 请求加密信息，将 encryption_info 附加到可写入文件，并将 encryption_meta 持久化到 RowSet / Segment / SSTable 元数据（segment_encryption_metas、delete/update encryption metadata）。Frontend 和 Backend/CN 的加密标志必须匹配——不匹配会导致 BE 在心跳时中止 (LOG(FATAL))。此标志在运行时不可变；在部署之前启用它，并确保密钥管理 (KEK) 和 KeyCache 在整个集群中正确配置和同步。
- 引入版本: v3.3.1, 3.4.0, 3.5.0, 4.0.0

##### enable_zero_copy_from_page_cache

- 默认值: true
- 类型: boolean
- 单位: -
- 是否可变: 是
- 描述: 启用时，FixedLengthColumnBase 在追加来自 PageCache 支持的缓冲区的数据时，可能会避免复制字节。在 `append_numbers` 中，如果所有条件都满足，代码将获取传入的 ContainerResource 并设置列的内部资源指针（零拷贝）：配置为 true，传入资源已拥有，资源内存与列元素类型对齐，列为空，且资源长度是元素大小的倍数。启用此功能可减少 CPU 和内存复制开销，并可提高摄取/扫描吞吐量。缺点：它将列的生命周期与获取的缓冲区耦合，并依赖于正确的拥有权/对齐；禁用以强制安全复制。
- 引入版本: -

##### file_descriptor_cache_clean_interval

- 默认值: 3600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 清理一定时间内未使用的文件描述符的时间间隔。
- 引入版本: -

##### ignore_broken_disk

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 控制配置的存储路径在读写检查失败或解析失败时的启动行为。当 `false`（默认）时，BE 将 `storage_root_path` 或 `spill_local_storage_dir` 中的任何损坏条目视为致命错误，并将中止启动。当 `true` 时，StarRocks 将跳过（记录警告并移除）任何 `check_datapath_rw` 失败或解析失败的存储路径，以便 BE 可以继续使用剩余的健康路径启动。注意：如果所有配置的路径都被移除，BE 仍然会退出。启用此功能可能会掩盖配置错误或故障的磁盘，并导致被忽略路径上的数据不可用；相应地监控日志和磁盘健康状况。
- 引入版本: v3.2.0

##### inc_rowset_expired_sec

- 默认值: 1800
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 传入数据的过期时间。此配置项用于增量克隆。
- 引入版本: -

##### load_process_max_memory_hard_limit_ratio

- 默认值: 2
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: BE 节点上所有加载进程可占用的内存资源的硬限制（比例）。当 `enable_new_load_on_memory_limit_exceeded` 设置为 `false`，且所有加载进程的内存消耗超过 `load_process_max_memory_limit_percent * load_process_max_memory_hard_limit_ratio` 时，将拒绝新的加载进程。
- 引入版本: v3.3.2

##### load_process_max_memory_limit_percent

- 默认值: 30
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE 节点上所有加载进程可占用的内存资源的软限制（百分比）。
- 引入版本: -

##### lz4_acceleration

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 控制内置 LZ4 压缩器使用的 LZ4 “加速”参数（传递给 LZ4_compress_fast_continue）。较高的值优先考虑压缩速度，但会牺牲压缩比；较低的值（1）会产生更好的压缩，但速度较慢。有效范围：MIN=1，MAX=65537。此设置会影响 BlockCompression 中所有基于 LZ4 的编解码器（例如，LZ4 和 Hadoop-LZ4），并且只改变压缩的执行方式——它不改变 LZ4 格式或解压缩兼容性。向上调整（例如，4、8 等）适用于 CPU 密集型或低延迟工作负载，其中较大的输出是可以接受的；对于存储或 IO 敏感型工作负载，保持为 1。更改前请使用代表性数据进行测试，因为吞吐量与大小的权衡高度依赖于数据。
- 引入版本: v3.4.1, 3.5.0, 4.0.0

##### lz4_expected_compression_ratio

- 默认值: 2.1
- 类型: double
- 单位: 无量纲 (压缩比)
- 是否可变: 是
- 描述: 序列化压缩策略用于判断观察到的 LZ4 压缩是否“良好”的阈值（uncompressed_size / compressed_size）。在 compress_strategy.cpp 中，此值与 `lz4_expected_compression_speed_mbps` 一起用于计算奖励指标；如果组合奖励 > 1.0，策略会记录正反馈。增加此值会提高预期的压缩比（使条件更难满足），而降低此值会使观察到的压缩更容易被认为是令人满意的。调整以匹配典型数据可压缩性。有效范围：MIN=1，MAX=65537。
- 引入版本: v3.4.1, 3.5.0, 4.0.0

##### lz4_expected_compression_speed_mbps

- 默认值: 600
- 类型: double
- 单位: MB/s
- 是否可变: 是
- 描述: 自适应压缩策略 (CompressStrategy) 使用的预期 LZ4 压缩吞吐量（兆字节/秒）。反馈例程计算 reward_ratio = (observed_compression_ratio / lz4_expected_compression_ratio) * (observed_speed / lz4_expected_compression_speed_mbps)。如果 reward_ratio > 1.0，则正计数器 (alpha) 增加，否则负计数器 (beta) 增加；这会影响未来数据是否会被压缩。调整此值以反映您硬件上典型的 LZ4 吞吐量——提高它会使策略更难将运行分类为“良好”（需要更高的观察速度），降低它会使分类更容易。必须是正有限数。
- 引入版本: v3.4.1, 3.5.0, 4.0.0

##### make_snapshot_worker_count

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: BE 节点上创建快照任务的最大线程数。
- 引入版本: -

##### manual_compaction_threads

- 默认值: 4
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 手动 Compaction 的线程数。
- 引入版本: -

##### max_base_compaction_num_singleton_deltas

- 默认值: 100
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每次 Base Compaction 中可压缩的最大 Segment 数量。
- 引入版本: -

##### max_compaction_candidate_num

- 默认值: 40960
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 候选 Compaction Tablet 的最大数量。如果值太大，会导致高内存使用和高 CPU 负载。
- 引入版本: -

##### max_compaction_concurrency

- 默认值: -1
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Compaction（包括 Base Compaction 和 Cumulative Compaction）的最大并发数。值 `-1` 表示不对并发施加限制。`0` 表示禁用 Compaction。当启用基于事件的 Compaction 框架时，此参数是可变的。
- 引入版本: -

##### max_cumulative_compaction_num_singleton_deltas

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 单次累积 Compaction 中可合并的最大 Segment 数量。如果在 Compaction 期间发生 OOM，您可以减小此值。
- 引入版本: -

##### max_download_speed_kbps

- 默认值: 50000
- 类型: Int
- 单位: KB/秒
- 是否可变: 是
- 描述: 每个 HTTP 请求的最大下载速度。此值会影响 BE 节点之间数据副本同步的性能。
- 引入版本: -

##### max_garbage_sweep_interval

- 默认值: 3600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 存储卷垃圾回收的最大时间间隔。此配置项从 v3.0 开始更改为动态。
- 引入版本: -

##### max_percentage_of_error_disk

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 在相应的 BE 节点退出之前，存储卷中可容忍的最大错误百分比。
- 引入版本: -

##### max_queueing_memtable_per_tablet

- 默认值: 2
- 类型: Long
- 单位: 计数
- 是否可变: 是
- 描述: 控制写入路径的每个 Tablet 反压：当 Tablet 的排队（尚未刷新）MemTable 数量达到或超过 `max_queueing_memtable_per_tablet` 时，LocalTabletsChannel 和 LakeTabletsChannel 中的写入器将阻塞（休眠/重试），然后提交更多写入工作。这以增加重负载的延迟或 RPC 超时为代价，减少了同时 MemTable 刷新的并发性和峰值内存使用。设置较高的值以允许更多并发 MemTable（更多内存和 I/O 突发）；设置较低的值以限制内存压力并增加写入节流。
- 引入版本: v3.2.0

##### max_row_source_mask_memory_bytes

- 默认值: 209715200
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: 行源掩码缓冲区的最大内存大小。当缓冲区大于此值时，数据将持久化到磁盘上的临时文件。此值应设置低于 `compaction_memory_limit_per_worker` 的值。
- 引入版本: -

##### max_tablet_write_chunk_bytes

- 默认值: 536870912
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 当前内存中 Tablet 写入 Chunk 的最大允许内存（字节），在此之后它被视为已满并排队发送。增加此值可减少加载宽表（多列）时的 RPC 频率，这可以提高吞吐量，但会增加内存使用和 RPC 负载。调整以平衡更少的 RPC 与内存和序列化/BRPC 限制。
- 引入版本: v3.2.12

##### max_update_compaction_num_singleton_deltas

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键表单次 Compaction 中可合并的最大 RowSet 数量。
- 引入版本: -

##### memory_limitation_per_thread_for_schema_change

- 默认值: 2
- 类型: Int
- 单位: GB
- 是否可变: 是
- 描述: 每个模式更改任务允许的最大内存大小。
- 引入版本: -

##### memory_ratio_for_sorting_schema_change

- 默认值: 0.8
- 类型: Double
- 单位: - (无单位比例)
- 是否可变: 是
- 描述: 每个线程的 Schema Change 内存限制的百分比，用作排序 Schema Change 操作期间 MemTable 的最大缓冲区大小。该比例乘以 `memory_limitation_per_thread_for_schema_change`（以 GB 配置并转换为字节）以计算 `max_buffer_size`，结果上限为 4GB。由 SchemaChangeWithSorting 和 SortedSchemaChange 在创建 MemTable/DeltaWriter 时使用。增加此比例允许更大的内存缓冲区（更少的刷新/合并），但增加了内存压力风险；减少它会导致更频繁的刷新和更高的 I/O/合并开销。
- 引入版本: v3.2.0

##### min_base_compaction_num_singleton_deltas

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 触发 Base Compaction 的最小 Segment 数量。
- 引入版本: -

##### min_compaction_failure_interval_sec

- 默认值: 120
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 自上次 Compaction 失败以来，Tablet Compaction 可调度的最小时间间隔。
- 引入版本: -

##### min_cumulative_compaction_failure_interval_sec

- 默认值: 30
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 累积 Compaction 在失败后重试的最小时间间隔。
- 引入版本: -

##### min_cumulative_compaction_num_singleton_deltas

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 触发累积 Compaction 的最小 Segment 数量。
- 引入版本: -

##### min_garbage_sweep_interval

- 默认值: 180
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 存储卷垃圾回收的最小时间间隔。此配置项从 v3.0 开始更改为动态。
- 引入版本: -

##### parallel_clone_task_per_path

- 默认值: 8
- 类型: Int
- 单位: 线程
- 是否可变: 是
- 描述: BE 上每个存储路径分配的并行克隆工作线程数。在 BE 启动时，克隆线程池的最大线程数计算为 max(number_of_store_paths * parallel_clone_task_per_path, MIN_CLONE_TASK_THREADS_IN_POOL)。例如，对于 4 个存储路径和默认值 8，克隆池最大线程数为 32。此设置直接控制 BE 处理 CLONE 任务（Tablet 副本复制）的并发性：增加它会提高并行克隆吞吐量，但也会增加 CPU、磁盘和网络争用；减少它会限制同时克隆任务并可能限制 FE 调度的克隆操作。该值应用于动态克隆线程池，可以在运行时通过 update-config 路径更改（导致 `agent_server` 更新克隆池的最大线程数）。
- 引入版本: v3.2.0

##### partial_update_memory_limit_per_worker

- 默认值: 2147483648
- 类型: long
- 单位: 字节
- 是否可变: 是
- 描述: 在执行部分列更新（用于 Compaction / RowSet 更新处理）时，单个 Worker 用于组装源 Chunk 的最大内存（字节）。读取器估计每行更新内存 (`total_update_row_size / num_rows_upt`) 并乘以读取的行数；当该乘积超过此限制时，当前 Chunk 将被刷新和处理以避免额外的内存增长。将其设置为匹配每个更新 Worker 的可用内存——过低会增加 I/O/处理开销（许多小 Chunk）；过高会增加内存压力或 OOM 风险。如果每行估算值为零（旧版 RowSet），此配置不会施加基于字节的限制（仅适用 INT32_MAX 行数限制）。
- 引入版本: v3.2.10

##### path_gc_check

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 启用时，StorageEngine 会启动每个数据目录的后台线程，执行周期性路径扫描和垃圾回收。在启动时，`start_bg_threads()` 会生成 `_path_scan_thread_callback`（调用 `DataDir::perform_path_scan` 和 `perform_tmp_path_scan`）和 `_path_gc_thread_callback`（调用 `DataDir::perform_path_gc_by_tablet`、`DataDir::perform_path_gc_by_rowsetid`、`DataDir::perform_delta_column_files_gc` 和 `DataDir::perform_crm_gc`）。扫描和 GC 间隔由 `path_scan_interval_second` 和 `path_gc_check_interval_second` 控制；CRM 文件清理使用 `unused_crm_file_threshold_second`。禁用此功能可防止自动路径级清理（您必须手动管理孤立/临时文件）。更改此标志需要重新启动进程。
- 引入版本: v3.2.0

##### path_gc_check_interval_second

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: 存储引擎的路径垃圾回收后台线程运行间隔（秒）。每次唤醒都会触发 DataDir 按 Tablet、按 RowSet ID、增量列文件 GC 和 CRM GC 执行路径 GC（CRM GC 调用使用 `unused_crm_file_threshold_second`）。如果设置为非正值，代码会强制将间隔设置为 1800 秒（半小时）并发出警告。调整此值以控制扫描和移除磁盘上的临时或下载文件的频率。
- 引入版本: v3.2.0

##### pending_data_expire_time_sec

- 默认值: 1800
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 存储引擎中挂起数据的过期时间。
- 引入版本: -

##### pindex_major_compaction_limit_per_disk

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 每块磁盘的 Compaction 最大并发数。这解决了由于 Compaction 导致的磁盘 I/O 不均衡问题。此问题可能导致某些磁盘的 I/O 过高。
- 引入版本: v3.0.9

##### pk_index_compaction_score_ratio

- 默认值: 1.5
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中主键索引的 Compaction 分数比例。例如，如果有 N 个文件集，则 Compaction 分数将是 `N * pk_index_compaction_score_ratio`。
- 引入版本: -

##### pk_index_early_sst_compaction_threshold

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中主键索引的早期 SST Compaction 阈值。
- 引入版本: -

##### pk_index_map_shard_size

- 默认值: 4096
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Lake UpdateManager 中主键索引分片映射使用的分片数。UpdateManager 分配一个此大小的 `PkIndexShard` 向量，并通过位掩码将 Tablet ID 映射到分片。增加此值可减少 Tablet 之间因共享同一分片而导致的锁争用，但代价是增加互斥对象和略微增加内存使用。该值必须是 2 的幂，因为代码依赖于位掩码索引。有关大小调整指南，请参阅 `tablet_map_shard_size` 启发式：`total_num_of_tablets_in_BE / 512`。
- 引入版本: v3.2.0

##### pk_index_memtable_flush_threadpool_max_threads

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中主键索引 MemTable 刷新线程池的最大线程数。`0` 表示自动设置为 CPU 核心数的一半。
- 引入版本: -

##### pk_index_memtable_flush_threadpool_size

- 默认值: 1048576
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 控制共享数据（云原生/lake）模式下主键索引 MemTable 刷新线程池的最大队列大小（挂起任务数）。线程池在 ExecEnv 中创建为 "cloud_native_pk_index_flush"；其最大线程数由 `pk_index_memtable_flush_threadpool_max_threads` 控制。增加此值允许更多 MemTable 刷新任务在执行前缓冲，这可以减少即时反压，但会增加排队任务对象消耗的内存。减少它会限制缓冲任务，并可能根据线程池行为导致更早的反压或任务拒绝。根据可用内存和预期的并发刷新工作负载进行调整。
- 引入版本: -

##### pk_index_memtable_max_count

- 默认值: 2
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中主键索引 MemTable 的最大数量。
- 引入版本: -

##### pk_index_memtable_max_wait_flush_timeout_ms

- 默认值: 30000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 共享数据集群中等待主键索引 MemTable 刷新完成的最大超时。当同步刷新所有 MemTable（例如，在摄取 SST 操作之前）时，系统最多等待此超时。默认值为 30 秒。
- 引入版本: -

##### pk_index_parallel_compaction_task_split_threshold_bytes

- 默认值: 33554432
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 主键索引 Compaction 任务的拆分阈值。当任务中涉及文件的总大小小于此阈值时，任务将不会被拆分。
- 引入版本: -

##### pk_index_parallel_compaction_threadpool_max_threads

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中云原生主键索引并行 Compaction 线程池的最大线程数。`0` 表示自动设置为 CPU 核心数的一半。
- 引入版本: -

##### pk_index_parallel_compaction_threadpool_size

- 默认值: 1048576
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据模式下云原生主键索引并行 Compaction 使用的线程池的最大队列大小（挂起任务数）。此设置控制在线程池拒绝新提交之前，可以排队多少 Compaction 任务。有效并行性受 `pk_index_parallel_compaction_threadpool_max_threads` 限制；增加此值以避免在预期有许多并发 Compaction 任务时任务被拒绝，但请注意，较大的队列会增加内存和排队工作的延迟。
- 引入版本: -

##### pk_index_parallel_execution_min_rows

- 默认值: 16384
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中启用主键索引操作并行执行的最小行数阈值。
- 引入版本: -

##### pk_index_parallel_execution_threadpool_max_threads

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中主键索引并行执行线程池的最大线程数。`0` 表示自动设置为 CPU 核心数的一半。
- 引入版本: -

##### pk_index_size_tiered_level_multiplier

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键索引 Size-tiered Compaction 策略的级别乘数参数。
- 引入版本: -

##### pk_index_size_tiered_max_level

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键索引 Size-tiered Compaction 策略的最大级别。
- 引入版本: -

##### pk_index_size_tiered_min_level_size

- 默认值: 131072
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键索引 Size-tiered Compaction 策略的最小级别。
- 引入版本: -

##### pk_index_sstable_sample_interval_bytes

- 默认值: 16777216
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 共享数据集群中 SSTable 文件的采样间隔大小。当 SSTable 文件大小超过此阈值时，系统会以该间隔从 SSTable 中采样键，以优化 Compaction 任务的边界分区。对于小于此阈值的 SSTable，仅使用起始键作为边界键。默认值为 16 MB。
- 引入版本: -

##### pk_index_target_file_size

- 默认值: 67108864
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 共享数据集群中主键索引的目标文件大小。
- 引入版本: -

##### pk_index_eager_build_threshold_bytes

- 默认值: 104857600
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 当 `enable_pk_index_eager_build` 设置为 true 时，仅当导入或 Compaction 期间生成的数据超过此阈值时，系统才会急切构建 PK 索引文件。默认值为 100MB。
- 引入版本: -

##### primary_key_limit_size

- 默认值: 128
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 主键表中键列的最大大小。
- 引入版本: v2.5

##### release_snapshot_worker_count

- Default: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: BE 节点上释放快照任务的最大线程数。
- 引入版本: -

##### repair_compaction_interval_seconds

- 默认值: 600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 轮询修复 Compaction 线程的时间间隔。
- 引入版本: -

##### replication_max_speed_limit_kbps

- 默认值: 50000
- 类型: Int
- 单位: KB/s
- 是否可变: 是
- 描述: 每个复制线程的最大速度。
- 引入版本: v3.3.5

##### replication_min_speed_limit_kbps

- 默认值: 50
- 类型: Int
- 单位: KB/s
- 是否可变: 是
- 描述: 每个复制线程的最小速度。
- 引入版本: v3.3.5

##### replication_min_speed_time_seconds

- 默认值: 300
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 复制线程低于最小速度的允许持续时间。如果实际速度低于 `replication_min_speed_limit_kbps` 的时间超过此值，复制将失败。
- 引入版本: v3.3.5

##### replication_threads

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于复制的最大线程数。`0` 表示将线程数设置为 BE CPU 核心数的四倍。
- 引入版本: v3.3.5

##### size_tiered_level_multiple

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Size-tiered Compaction 策略中两个连续级别之间的数据大小倍数。
- 引入版本: -

##### size_tiered_level_multiple_dupkey

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 在 Size-tiered Compaction 策略中，Duplicate Key 表的两个相邻级别之间数据量差异的倍数。
- 引入版本: -

##### size_tiered_level_num

- 默认值: 7
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Size-tiered Compaction 策略的级别数。每个级别最多保留一个 RowSet。因此，在稳定条件下，RowSet 数量最多与此配置项中指定的级别数相同。
- 引入版本: -

##### size_tiered_max_compaction_level

- 默认值: 3
- 类型: Int
- 单位: 级别
- 是否可变: 是
- 描述: 限制可合并到单个主键实时 Compaction 任务中的 Size-tiered 级别数量。在 PK Size-tiered Compaction 选择期间，StarRocks 按大小构建有序的“级别”RowSet，并将连续级别添加到所选的 Compaction 输入中，直到达到此限制（代码使用 `compaction_level <= size_tiered_max_compaction_level`）。该值是包含性的，并计算合并的不同 Size 层数（顶层计为 1）。仅当 PK Size-tiered Compaction 策略启用时才有效；提高它允许 Compaction 任务包含更多级别（更大、I/O 和 CPU 密集型合并，潜在更高的写入放大），而降低它会限制合并并减少任务大小和资源使用。
- 引入版本: v4.0.0

##### size_tiered_min_level_size

- 默认值: 131072
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: Size-tiered Compaction 策略中最小级别的数据大小。小于此值的 RowSet 将立即触发数据 Compaction。
- 引入版本: -

##### small_dictionary_page_size

- 默认值: 4096
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: BinaryPlainPageDecoder 用于决定是否急切解析字典（二进制/纯文本）页的阈值（字节）。如果页的编码大小小于 `small_dictionary_page_size`，解码器会将所有字符串条目预解析到内存向量 (`_parsed_datas`) 中，以加速随机访问和批处理读取。增加此值会导致更多页被预解析（这可以减少每次访问的解码开销，并可能增加较大字典的有效压缩），但会增加内存使用和解析所花费的 CPU；过大的值可能会降低整体性能。仅在测量内存和访问延迟权衡后进行调整。
- 引入版本: v3.4.1, v3.5.0

##### snapshot_expire_time_sec

- 默认值: 172800
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 快照文件的过期时间。
- 引入版本: -

##### stale_memtable_flush_time_sec

- 默认值: 0
- 类型: long
- 单位: 秒
- 是否可变: 是
- 描述: 当发送作业的内存使用率较高时，超过 `stale_memtable_flush_time_sec` 秒未更新的 MemTable 将被刷新以减少内存压力。此行为仅在内存限制接近（`limit_exceeded_by_ratio(70)` 或更高）时考虑。在 LocalTabletsChannel 中，当内存使用率非常高（`limit_exceeded_by_ratio(95)`）时，可能会有额外的路径刷新大小超过 `write_buffer_size / 4` 的 MemTable。值为 `0` 会禁用此基于年龄的过期 MemTable 刷新（不可变分区 MemTable 在空闲或内存高时仍会立即刷新）。
- 引入版本: v3.2.0

##### storage_flood_stage_left_capacity_bytes

- 默认值: 107374182400
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 所有 BE 目录剩余存储空间的硬限制。如果 BE 存储目录的剩余存储空间小于此值，且存储使用率（百分比）超过 `storage_flood_stage_usage_percent`，则会拒绝 Load 和 Restore 作业。您需要将此项与 FE 配置项 `storage_usage_hard_limit_reserve_bytes` 一起设置，以使配置生效。
- 引入版本: -

##### storage_flood_stage_usage_percent

- 默认值: 95
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 所有 BE 目录存储使用率（百分比）的硬限制。如果 BE 存储目录的存储使用率（百分比）超过此值，且剩余存储空间小于 `storage_flood_stage_left_capacity_bytes`，则会拒绝 Load 和 Restore 作业。您需要将此项与 FE 配置项 `storage_usage_hard_limit_percent` 一起设置，以使配置生效。
- 引入版本: -

##### storage_high_usage_disk_protect_ratio

- 默认值: 0.1
- 类型: double
- 单位: -
- 是否可变: 是
- 描述: 在选择用于创建 Tablet 的存储根目录时，StorageEngine 按 `disk_usage(0)` 对候选磁盘进行排序并计算平均使用率。任何使用率大于（平均使用率 + `storage_high_usage_disk_protect_ratio`）的磁盘都将从优先选择池中排除（它将不参与随机优先选择，因此最初不会被选中）。设置为 0 可禁用此保护。值是小数（典型范围 0.0–1.0）；较大的值使调度程序对高于平均水平的磁盘更宽容。
- 引入版本: v3.2.0

##### storage_medium_migrate_count

- 默认值: 3
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 用于存储介质迁移（从 SATA 到 SSD）的线程数。
- 引入版本: -

##### storage_root_path

- 默认值: `${STARROCKS_HOME}/storage`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 存储卷的目录和介质。示例：`/data1,medium:hdd;/data2,medium:ssd`。
  - 多个卷以分号 (`;`) 分隔。
  - 如果存储介质是 SSD，请在目录末尾添加 `,medium:ssd`。
  - 如果存储介质是 HDD，请在目录末尾添加 `,medium:hdd`。
- 引入版本: -

##### sync_tablet_meta

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 一个布尔值，控制是否启用 Tablet 元数据的同步。`true` 表示启用同步，`false` 表示禁用。
- 引入版本: -

##### tablet_map_shard_size

- 默认值: 1024
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Tablet 映射分片大小。该值必须是 2 的幂。
- 引入版本: -

##### tablet_max_pending_versions

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键 Tablet 上可容忍的最大挂起版本数。挂起版本指的是已提交但尚未应用的版本。
- 引入版本: -

##### tablet_max_versions

- 默认值: 1000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Tablet 允许的最大版本数。如果版本数超过此值，新的写入请求将失败。
- 引入版本: -

##### tablet_meta_checkpoint_min_interval_secs

- 默认值: 600
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: TabletMeta Checkpoint 的线程轮询时间间隔。
- 引入版本: -

##### tablet_meta_checkpoint_min_new_rowsets_num

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 自上次 TabletMeta Checkpoint 以来创建的最小 RowSet 数量。
- 引入版本: -

##### tablet_rowset_stale_sweep_time_sec

- 默认值: 1800
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 清理 Tablet 中过期 RowSet 的时间间隔。
- 引入版本: -

##### tablet_stat_cache_update_interval_second

- 默认值: 300
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: Tablet 统计缓存更新的时间间隔。
- 引入版本: -

##### tablet_writer_open_rpc_timeout_sec

- 默认值: 300
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 打开远程 BE 上 Tablet 写入器的 RPC 超时（秒）。该值转换为毫秒，并应用于发出打开调用时的请求超时和 bRPC 控制超时。运行时使用 `tablet_writer_open_rpc_timeout_sec` 和总加载超时的一半中的最小值作为有效超时（即 min(`tablet_writer_open_rpc_timeout_sec`, `load_timeout_sec` / 2)）。设置此值以平衡及时故障检测（过小可能导致过早打开失败）和给予 BE 足够时间初始化写入器（过大延迟错误处理）。
- 引入版本: v3.2.0

##### transaction_apply_worker_count

- 默认值: 0
- 类型: Int
- 单位: 线程
- 是否可变: 是
- 描述: 控制 UpdateManager 的 "update_apply" 线程池使用的最大工作线程数——该线程池用于应用事务的 RowSet（特别是主键表）。值 `>0` 设置固定最大线程数；0（默认值）使池大小等于 CPU 核心数。配置的值在启动时应用（UpdateManager::init），并可在运行时通过 `update-config` HTTP 操作更改，该操作会更新池的最大线程数。调整此值以增加应用并发性（吞吐量）或限制 CPU/内存争用；最小线程数和空闲超时分别由 `transaction_apply_thread_pool_num_min` 和 `transaction_apply_worker_idle_time_ms` 控制。
- 引入版本: v3.2.0

##### transaction_apply_worker_idle_time_ms

- 默认值: 500
- 类型: int
- 单位: 毫秒
- 是否可变: 否
- 描述: 设置 UpdateManager 的 "update_apply" 线程池用于应用事务/更新的空闲超时（毫秒）。该值通过 MonoDelta::FromMilliseconds 传递给 ThreadPoolBuilder::set_idle_timeout，因此空闲时间超过此超时的 Worker 线程可能会被终止（受限于池配置的最小线程数和最大线程数）。较小的值可更快释放资源，但在突发负载下会增加线程创建/销毁开销；较大的值可使 Worker 在短时突发下保持活跃，但会增加基线资源使用。
- 引入版本: v3.2.11

##### trash_file_expire_time_sec

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 清理垃圾文件的时间间隔。从 v2.5.17, v3.0.9 和 v3.1.6 开始，默认值已从 259,200 更改为 86,400。
- 引入版本: -

##### unused_rowset_monitor_interval

- 默认值: 30
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 清理过期 RowSet 的时间间隔。
- 引入版本: -

##### update_cache_expire_sec

- 默认值: 360
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 更新缓存的过期时间。
- 引入版本: -

##### update_compaction_check_interval_seconds

- 默认值: 10
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 检查主键表 Compaction 的时间间隔。
- 引入版本: -

##### update_compaction_delvec_file_io_amp_ratio

- 默认值: 2
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 用于控制主键表中包含 Delvec 文件的 RowSet 的 Compaction 优先级。值越大，优先级越高。
- 引入版本: -

##### update_compaction_num_threads_per_disk

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键表每块磁盘的 Compaction 线程数。
- 引入版本: -

##### update_compaction_per_tablet_min_interval_seconds

- 默认值: 120
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: 主键表中每个 Tablet 触发 Compaction 的最小时间间隔。
- 引入版本: -

##### update_compaction_ratio_threshold

- 默认值: 0.5
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中 Compaction 可为主键表合并数据的最大比例。如果单个 Tablet 变得过大，建议缩小此值。
- 引入版本: v3.1.5

##### update_compaction_result_bytes

- 默认值: 1073741824
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 主键表单次 Compaction 的最大结果大小。
- 引入版本: -

##### update_compaction_size_threshold

- 默认值: 268435456
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 主键表的 Compaction Score 是根据文件大小计算的，这与其他表类型不同。此参数可用于使主键表的 Compaction Score 与其他表类型相似，从而使用户更容易理解。
- 引入版本: -

##### upload_worker_count

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: BE 节点上备份作业上传任务的最大线程数。`0` 表示将该值设置为 BE 所在机器的 CPU 核心数。
- 引入版本: -

##### vertical_compaction_max_columns_per_group

- 默认值: 5
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 垂直 Compaction 每组的最大列数。
- 引入版本: -

### 共享数据

##### download_buffer_size

- 默认值: 4194304
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 下载快照文件时使用的内存中复制缓冲区的大小（字节）。SnapshotLoader::download 将此值传递给 fs::copy 作为每次传输的块大小，用于从远程顺序文件读取到本地可写文件。较大的值可以通过减少系统调用/IO 开销来提高高带宽链接上的吞吐量；较小的值可减少每个活动传输的峰值内存使用。注意：此参数控制每个流的缓冲区大小，而不是下载线程数——总内存消耗 = `download_buffer_size` * 并发下载数。
- 引入版本: v3.2.13

##### graceful_exit_wait_for_frontend_heartbeat

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 确定是否在完成优雅退出之前等待至少一个前端心跳响应，指示 SHUTDOWN 状态。启用时，优雅关机过程保持活跃，直到通过心跳 RPC 响应 SHUTDOWN 确认，确保前端有足够的时间在两次常规心跳间隔之间检测终止状态。
- 引入版本: v3.4.5

##### lake_compaction_stream_buffer_size_bytes

- 默认值: 1048576
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 共享数据集群中云原生表 Compaction 的读取器远程 I/O 缓冲区大小。默认值为 1MB。您可以增加此值以加速 Compaction 进程。
- 引入版本: v3.2.3

##### lake_pk_compaction_max_input_rowsets

- 默认值: 500
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 共享数据集群中主键表 Compaction 任务允许的最大输入 RowSet 数量。从 v3.2.4 和 v3.1.10 开始，此参数的默认值从 `5` 更改为 `1000`，从 v3.3.1 和 v3.2.9 开始更改为 `500`。在为主键表启用 Size-tiered Compaction 策略（通过将 `enable_pk_size_tiered_compaction_strategy` 设置为 `true`）后，StarRocks 无需限制每次 Compaction 的 RowSet 数量以减少写入放大。因此，此参数的默认值增加。
- 引入版本: v3.1.8, v3.2.3

##### loop_count_wait_fragments_finish

- 默认值: 2
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: BE/CN 进程退出时要等待的循环次数。每个循环是固定的 10 秒间隔。您可以将其设置为 `0` 以禁用循环等待。从 v3.4 开始，此项更改为可变，其默认值从 `0` 更改为 `2`。
- 引入版本: v2.5

##### max_client_cache_size_per_host

- 默认值: 10
- 类型: Int
- 单位: 每个主机的条目数 (缓存的客户端实例)
- 是否可变: 否
- 描述: BE 全局客户端缓存为每个远程主机保留的最大缓存客户端实例数。此单个设置在 ExecEnv 初始化期间创建 BackendServiceClientCache、FrontendServiceClientCache 和 BrokerServiceClientCache 时使用，因此它限制了这些缓存中每个主机保留的客户端 stub/连接数。增加此值可减少重新连接和 stub 创建开销，但会增加内存和文件描述符使用；减少它可节省资源，但可能会增加连接流失。此值在启动时读取，不能在运行时更改。目前，一个共享设置控制所有客户端缓存类型；以后可能会引入每个缓存的单独配置。
- 引入版本: v3.2.0

##### starlet_filesystem_instance_cache_capacity

- 默认值: 10000
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Starlet 文件系统实例的缓存容量。
- 引入版本: v3.2.16, v3.3.11, v3.4.1

##### starlet_filesystem_instance_cache_ttl_sec

- 默认值: 86400
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: Starlet 文件系统实例的缓存过期时间。
- 引入版本: v3.3.15, 3.4.5

##### starlet_port

- 默认值: 9070
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: BE 和 CN 的额外代理服务端口。
- 引入版本: -

##### starlet_star_cache_disk_size_percent

- 默认值: 80
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 共享数据集群中 Data Cache 最多可使用的磁盘容量百分比。
- 引入版本: v3.1

##### starlet_use_star_cache

- 默认值: v3.1 中为 false，v3.2.3 中为 true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否在共享数据集群中启用 Data Cache。`true` 表示启用此功能，`false` 表示禁用。默认值从 v3.2.3 开始从 `false` 更改为 `true`。
- 引入版本: v3.1

##### starlet_write_file_with_tag

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 在共享数据集群中，是否使用对象存储标签标记写入对象存储的文件，以便进行便捷的自定义文件管理。
- 引入版本: v3.5.3

##### table_schema_service_max_retries

- 默认值: 3
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 表 Schema Service 请求的最大重试次数。
- 引入版本: v4.1

### Data Lake

##### datacache_block_buffer_enable

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否启用 Block Buffer 以优化 Data Cache 效率。启用 Block Buffer 后，系统会从 Data Cache 中读取 Block 数据并将其缓存到临时缓冲区中，从而减少频繁缓存读取带来的额外开销。
- 引入版本: v3.2.0

##### datacache_disk_adjust_interval_seconds

- 默认值: 10
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: Data Cache 自动容量伸缩的间隔。系统会定期检查缓存磁盘使用情况，并在必要时触发自动伸缩。
- 引入版本: v3.3.0

##### datacache_disk_idle_seconds_for_expansion

- 默认值: 7200
- 类型: Int
- 单位: 秒
- 是否可变: 是
- 描述: Data Cache 自动扩容的最小等待时间。仅当磁盘使用率在超过此持续时间后仍低于 `datacache_disk_low_level` 时，才会触发自动扩容。
- 引入版本: v3.3.0

##### datacache_disk_size

- 默认值: 0
- 类型: String
- 单位: -
- 是否可变: 是
- 描述: 单个磁盘上可缓存的最大数据量。您可以将其设置为百分比（例如，`80%`）或物理限制（例如，`2T`，`500G`）。例如，如果您使用两个磁盘并将 `datacache_disk_size` 参数的值设置为 `21474836480` (20 GB)，则这些磁盘上最多可缓存 40 GB 数据。默认值为 `0`，表示仅使用内存缓存数据。
- 引入版本: -

##### datacache_enable

- 默认值: v3.3 中为 true
- 类型: Boolean
- 单位: -
- 是否可变: 否
- 描述: 是否启用 Data Cache。`true` 表示启用 Data Cache，`false` 表示禁用 Data Cache。默认值从 v3.3 开始更改为 `true`。
- 引入版本: -

##### datacache_eviction_policy

- 默认值: slru
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: Data Cache 的驱逐策略。有效值：`lru`（最近最少使用）和 `slru`（分段 LRU）。
- 引入版本: v3.4.0

##### datacache_inline_item_count_limit

- 默认值: 130172
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Data Cache 中内联缓存项的最大数量。对于一些特别小的缓存块，Data Cache 以 `inline` 模式存储它们，这会将块数据和元数据一起缓存到内存中。
- 引入版本: v3.4.0

##### datacache_mem_size

- 默认值: 0
- 类型: String
- 单位: -
- 是否可变: 是
- 描述: 内存中可缓存的最大数据量。您可以将其设置为百分比（例如，`10%`）或物理限制（例如，`10G`，`21474836480`）。
- 引入版本: -

##### datacache_min_disk_quota_for_adjustment

- 默认值: 10737418240
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: Data Cache 自动伸缩的最小有效容量。如果系统尝试将缓存容量调整到小于此值，缓存容量将直接设置为 `0`，以防止因缓存容量不足导致频繁缓存填充和驱逐而造成的次优性能。
- 引入版本: v3.3.0

##### disk_high_level

- 默认值: 90
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 触发缓存容量自动扩容的磁盘使用率上限（百分比）。当磁盘使用率超过此值时，系统会自动从 Data Cache 中驱逐缓存数据。从 v3.4.0 开始，默认值从 `80` 更改为 `90`。此项从 v4.0 开始重命名为 `disk_high_level`。
- 引入版本: v3.3.0

##### disk_low_level

- 默认值: 60
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 触发缓存容量自动缩容的磁盘使用率下限（百分比）。当磁盘使用率在此值以下持续时间超过 `datacache_disk_idle_seconds_for_expansion` 指定的期限，并且 Data Cache 分配的空间已完全利用时，系统将通过增加上限自动扩容缓存容量。此项从 v4.0 开始重命名为 `disk_low_level`。
- 引入版本: v3.3.0

##### disk_safe_level

- 默认值: 80
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: Data Cache 的磁盘使用安全级别（百分比）。当 Data Cache 执行自动伸缩时，系统会调整缓存容量，目标是使磁盘使用率尽可能接近此值。从 v3.4.0 开始，默认值从 `70` 更改为 `80`。此项从 v4.0 开始重命名为 `disk_safe_level`。
- 引入版本: v3.3.0

##### enable_connector_sink_spill

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否为写入外部表启用溢出 (Spilling)。启用此功能可防止在内存不足时因写入外部表而生成大量小文件。目前，此功能仅支持写入 Iceberg 表。
- 引入版本: v4.0.0

##### enable_datacache_disk_auto_adjust

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否启用 Data Cache 磁盘容量的自动伸缩。启用后，系统会根据当前磁盘使用率动态调整缓存容量。此项从 v4.0 开始重命名为 `enable_datacache_disk_auto_adjust`。
- 引入版本: v3.3.0

##### jdbc_connection_idle_timeout_ms

- 默认值: 600000
- 类型: Int
- 单位: 毫秒
- 是否可变: 否
- 描述: JDBC 连接池中空闲连接过期的时间长度。如果 JDBC 连接池中的连接空闲时间超过此值，连接池将关闭超出 `jdbc_minimum_idle_connections` 配置项指定数量的空闲连接。
- 引入版本: -

##### jdbc_connection_pool_size

- 默认值: 8
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: JDBC 连接池大小。在每个 BE 节点上，访问具有相同 `jdbc_url` 的外部表的查询共享同一个连接池。
- 引入版本: -

##### jdbc_minimum_idle_connections

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: JDBC 连接池中最小空闲连接数。
- 引入版本: -

##### lake_clear_corrupted_cache_data

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否允许系统清除共享数据集群中损坏的数据缓存。
- 引入版本: v3.4

##### lake_clear_corrupted_cache_meta

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否允许系统清除共享数据集群中损坏的元数据缓存。
- 引入版本: v3.3

##### lake_enable_vertical_compaction_fill_data_cache

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 是否允许垂直 Compaction 任务在共享数据集群中将数据缓存到本地磁盘。
- 引入版本: v3.1.7, v3.2.3

##### lake_replication_read_buffer_size

- 默认值: 16777216
- 类型: Long
- 单位: 字节
- 是否可变: 是
- 描述: 在 Lake Replication 期间下载 Lake Segment 文件时使用的读取缓冲区大小。此值决定了读取远程文件的每次读取分配；实现使用此设置和 1 MB 最小值的较大者。较大的值可减少读取调用次数并提高吞吐量，但会增加每个并发下载使用的内存；较小的值可降低内存使用，但会增加 I/O 调用次数。根据网络带宽、存储 I/O 特性和并行复制线程数进行调整。
- 引入版本: -

##### lake_service_max_concurrency

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 共享数据集群中 RPC 请求的最大并发数。当达到此阈值时，传入请求将被拒绝。当此项设置为 `0` 时，不对并发施加限制。
- 引入版本: -

##### max_hdfs_scanner_num

- 默认值: 50
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: 限制 ConnectorScanNode 可拥有的并发运行连接器 (HDFS/远程) 扫描器的最大数量。在扫描启动期间，节点计算估计并发性（基于内存、块大小和 scanner_row_num），然后用此值限制它，以确定要保留多少扫描器和块以及要启动多少扫描器线程。在运行时调度挂起扫描器时也会查询此值（以避免超额订阅），并在考虑文件句柄限制时决定可以重新提交多少挂起扫描器。降低此值可减少线程、内存和打开文件压力，但可能会降低吞吐量；增加此值可提高并发性和资源使用。
- 引入版本: v3.2.0

##### query_max_memory_limit_percent

- 默认值: 90
- 类型: Int
- 单位: -
- 是否可变: 否
- 描述: Query Pool 可使用的最大内存。它表示为进程内存限制的百分比。
- 引入版本: v3.1.0

##### rocksdb_max_write_buffer_memory_bytes

- 默认值: 1073741824
- 类型: Int64
- 单位: -
- 是否可变: 否
- 描述: RocksDB 中元数据的写入缓冲区的最大大小。默认值为 1GB。
- 引入版本: v3.5.0

##### rocksdb_write_buffer_memory_percent

- 默认值: 5
- 类型: Int64
- 单位: -
- 是否可变: 否
- 描述: RocksDB 中元数据的写入缓冲区内存百分比。默认值为系统内存的 5%。但是，除此之外，写入缓冲区内存的最终计算大小不会小于 64MB 也不会超过 1G (`rocksdb_max_write_buffer_memory_bytes`)。
- 引入版本: v3.5.0

### 其他

##### default_mv_resource_group_concurrency_limit

- 默认值: 0
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 资源组 `default_mv_wg` 中物化视图刷新任务的最大并发数（每个 BE 节点）。默认值 `0` 表示没有限制。
- 引入版本: v3.1

##### default_mv_resource_group_cpu_limit

- 默认值: 1
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 资源组 `default_mv_wg` 中物化视图刷新任务可使用的最大 CPU 核心数（每个 BE 节点）。
- 引入版本: v3.1

##### default_mv_resource_group_memory_limit

- 默认值: 0.8
- 类型: Double
- 单位:
- 是否可变: 是
- 描述: 资源组 `default_mv_wg` 中物化视图刷新任务可使用的最大内存比例（每个 BE 节点）。默认值表示内存的 80%。
- 引入版本: v3.1

##### default_mv_resource_group_spill_mem_limit_threshold

- 默认值: 0.8
- 类型: Double
- 单位: -
- 是否可变: 是
- 描述: 资源组 `default_mv_wg` 中物化视图刷新任务触发中间结果溢出前的内存使用阈值。默认值表示内存的 80%。
- 引入版本: v3.1

##### enable_resolve_hostname_to_ip_in_load_error_url

- 默认值: false
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 对于 `error_urls` 调试，是否允许操作符根据其环境需求选择使用 FE 心跳中的原始主机名，或强制解析为 IP 地址。
  - `true`: 将主机名解析为 IP 地址。
  - `false` (默认): 在错误 URL 中保留原始主机名。
- 引入版本: v4.0.1

##### enable_retry_apply

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 启用时，被分类为可重试的 Tablet 应用失败（例如瞬态内存限制错误）将重新调度重试，而不是立即将 Tablet 标记为错误。TabletUpdates 中的重试路径使用 `retry_apply_interval_second` 乘以当前失败计数并限制在 600 秒最大值来调度下一次尝试，因此退避时间随连续失败而增长。明确不可重试的错误（例如损坏）会绕过重试，并导致应用进程立即进入错误状态。重试会持续进行，直到达到总体超时/终止条件，之后应用将进入错误状态。关闭此功能将禁用失败应用任务的自动重新调度，并导致失败的应用在不重试的情况下转换为错误状态。
- 引入版本: v3.2.9

##### enable_token_check

- 默认值: true
- 类型: Boolean
- 单位: -
- 是否可变: 是
- 描述: 一个布尔值，控制是否启用 token 检查。`true` 表示启用 token 检查，`false` 表示禁用。
- 引入版本: -

##### es_scroll_keepalive

- 默认值: 5m
- 类型: String
- 单位: 分钟 (带后缀的字符串，例如 "5m")
- 是否可变: 否
- 描述: 发送给 Elasticsearch 用于滚动搜索上下文的保活持续时间。该值在构建初始滚动 URL（`?scroll=<value>`）和发送后续滚动请求（通过 ESScrollQueryBuilder）时按原样使用（例如 "5m"）。这控制了 ES 搜索上下文在 ES 端垃圾回收之前保留多长时间；将其设置得更长会使滚动上下文保持活动更长时间，但会延长 ES 集群上的资源使用。该值在启动时由 ES 扫描读取器读取，不能在运行时更改。
- 引入版本: v3.2.0

##### load_replica_status_check_interval_ms_on_failure

- 默认值: 2000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 如果上次检查 RPC 失败，次要副本检查其在主要副本上的状态的时间间隔。
- 引入版本: v3.5.1

##### load_replica_status_check_interval_ms_on_success

- 默认值: 15000
- 类型: Int
- 单位: 毫秒
- 是否可变: 是
- 描述: 如果上次检查 RPC 成功，次要副本检查其在主要副本上的状态的时间间隔。
- 引入版本: v3.5.1

##### max_length_for_bitmap_function

- 默认值: 1000000
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: Bitmap 函数输入值的最大长度。
- 引入版本: -

##### max_length_for_to_base64

- 默认值: 200000
- 类型: Int
- 单位: 字节
- 是否可变: 否
- 描述: `to_base64()` 函数输入值的最大长度。
- 引入版本: -

##### memory_high_level

- 默认值: 75
- 类型: Long
- 单位: 百分比
- 是否可变: 是
- 描述: 高水位内存阈值，表示为进程内存限制的百分比。当总内存消耗超过此百分比时，BE 开始逐渐释放内存（目前通过逐出数据缓存和更新缓存）以缓解压力。监视器使用此值计算 `memory_high = mem_limit * memory_high_level / 100`，如果消耗 `>` memory_high，则执行由 GC Advisor 指导的受控逐出；如果消耗超过 `memory_urgent_level`（一个单独的配置），则会发生更激进的即时缩减。此值也会被查询，以在阈值超过时禁用某些内存密集型操作（例如主键预加载）。必须满足 `memory_urgent_level` 的验证（`memory_urgent_level` > `memory_high_level`，`memory_high_level` >= 1，`memory_urgent_level` <= 100）。
- 引入版本: v3.2.0

##### report_exec_rpc_request_retry_num

- 默认值: 10
- 类型: Int
- 单位: -
- 是否可变: 是
- 描述: 报告 exec RPC 请求到 FE 的 RPC 请求重试次数。默认值为 10，这意味着如果 RPC 请求失败，它将重试 10 次，仅当它是片段实例完成 RPC 时。报告 exec RPC 请求对于加载作业很重要，如果一个片段实例完成报告失败，加载作业将挂起直到超时。
- 引入版本: -

##### sleep_one_second

- 默认值: 1
- 类型: Int
- 单位: 秒
- 是否可变: 否
- 描述: BE 代理工作线程使用的全局小睡眠间隔（秒），用于在主地址/心跳尚不可用或需要短暂重试/退避时暂停一秒。在代码库中，它被多个报告工作池引用（例如 ReportDiskStateTaskWorkerPool、ReportOlapTableTaskWorkerPool、ReportWorkgroupTaskWorkerPool），以避免在重试时忙等待并减少 CPU 消耗。增加此值会减慢重试频率和对主节点可用性的响应速度；减少它会增加轮询速率和 CPU 使用率。仅在了解响应速度和资源使用权衡后进行调整。
- 引入版本: v3.2.0

##### small_file_dir

- 默认值: `${STARROCKS_HOME}/lib/small_file/`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 用于存储文件管理器下载的文件的目录。
- 引入版本: -

##### upload_buffer_size

- 默认值: 4194304
- 类型: Int
- 单位: 字节
- 是否可变: 是
- 描述: 文件复制操作在将快照文件上传到远程存储（Broker 或直接 FileSystem）时使用的缓冲区大小（字节）。在上传路径 (snapshot_loader.cpp) 中，此值作为每个上传流的读/写块大小传递给 fs::copy。默认值为 4 MiB。增加此值可以提高高延迟或高带宽链接上的吞吐量，但会增加每个并发上传的内存使用；减少它会降低每个流的内存，但可能会降低传输效率。与 `upload_worker_count` 和总可用内存一起调整。
- 引入版本: v3.2.13

##### user_function_dir

- 默认值: `${STARROCKS_HOME}/lib/udf`
- 类型: String
- 单位: -
- 是否可变: 否
- 描述: 用于存储用户定义函数 (UDF) 的目录。
- 引入版本: -

##### web_log_bytes

- 默认值: 1048576 (1 MB)
- 类型: long
- 单位: 字节
- 是否可变: 否
- 描述: 从 INFO 日志文件中读取并在 BE 调试 Web 服务器的日志页面上显示的最大字节数。处理程序使用此值计算查找偏移量（显示最后 N 个字节），以避免读取或提供非常大的日志文件。如果日志文件小于此值，则显示整个文件。注意：在当前的实现中，读取和提供 INFO 日志的代码被注释掉了，处理程序报告 INFO 日志文件无法打开，因此除非启用日志提供代码，否则此参数可能无效。
- 引入版本: v3.2.0

### 已移除参数

##### enable_bit_unpack_simd

- 状态: 已移除
- 描述: 此参数已被移除。Bit-unpack SIMD 选择现在在编译时处理 (AVX2/BMI2)，并自动回退到默认实现。
- 移除版本: -
