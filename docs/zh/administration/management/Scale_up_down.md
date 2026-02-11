---
displayed_sidebar: docs
---

# 扩缩容

本主题描述了如何对 StarRocks 节点进行扩缩容。

## FE 节点扩缩容

StarRocks 有两种类型的 FE 节点：Follower 和 Observer。Follower 参与选举投票和写入。Observer 仅用于同步日志和扩展读取性能。

> * Follower FE（包括 Leader）的数量必须是奇数，建议部署 3 个以形成高可用 (HA) 模式。
> * 当 FE 以高可用模式部署（1 个 Leader，2 个 Follower）时，建议添加 Observer FE 以获得更好的读取性能。

### FE 扩容

部署 FE 节点并启动服务后，运行以下命令进行 FE 扩容。

~~~sql
alter system add follower "fe_host:edit_log_port";
alter system add observer "fe_host:edit_log_port";
~~~

### FE 缩容

FE 缩容与扩容类似。运行以下命令进行 FE 缩容。

~~~sql
alter system drop follower "fe_host:edit_log_port";
alter system drop observer "fe_host:edit_log_port";
~~~

扩缩容完成后，可以通过运行 `show proc '/frontends';` 查看节点信息。

## BE 节点扩缩容

StarRocks 会在 BE 节点扩缩容后自动执行负载均衡，而不会影响整体性能。

当您添加新的 BE 节点时，系统的 Tablet Scheduler 会检测到新节点及其低负载。然后，它将开始把 Tablet 从高负载的 BE 节点移动到新的、低负载的 BE 节点，以确保数据和负载在整个集群中均匀分布。

负载均衡过程基于为每个 BE 计算的 loadScore，该 loadScore 考虑了磁盘利用率和副本数量。系统旨在将 Tablet 从具有较高 loadScore 的节点移动到具有较低 loadScore 的节点。

您可以检查 FE 配置参数 `tablet_sched_disable_balance` 以确保自动均衡未被禁用（该参数默认为 false，这意味着 Tablet 均衡默认是启用的）。更多详细信息请参阅 [manage replica docs](./resource_management/Replica.md)。

### BE 扩容

运行以下命令进行 BE 扩容。

~~~sql
alter system add backend 'be_host:be_heartbeat_service_port';
~~~

运行以下命令查看 BE 状态。

~~~sql
show proc '/backends';
~~~

### BE 缩容

缩容 BE 节点有两种方式：`DROP` 和 `DECOMMISSION`。

`DROP` 将立即删除 BE 节点，丢失的副本将由 FE 调度补齐。`DECOMMISSION` 将首先确保副本已补齐，然后再删除 BE 节点。`DECOMMISSION` 更加友好，推荐用于 BE 缩容。

两种方法的命令类似：

* `alter system decommission backend "be_host:be_heartbeat_service_port";`
* `alter system drop backend "be_host:be_heartbeat_service_port";`

DROP BE 是一种危险操作，执行前需要二次确认。

* `alter system drop backend "be_host:be_heartbeat_service_port";`

## CN 节点扩缩容

### CN 扩容

运行以下命令进行 CN 扩容。

~~~sql
ALTER SYSTEM ADD COMPUTE NODE "cn_host:cn_heartbeat_service_port";
~~~

运行以下命令查看 CN 状态。

~~~sql
SHOW PROC '/compute_nodes';
~~~

### CN 缩容

CN 缩容与扩容类似。运行以下命令进行 CN 缩容。

~~~sql
ALTER SYSTEM DROP COMPUTE NODE "cn_host:cn_heartbeat_service_port";
~~~

您可以通过运行 `SHOW PROC '/compute_nodes';` 查看节点信息。
