---
displayed_sidebar: docs
---
import QSOverview from '../_assets/commonMarkdown/quickstart-overview-tip.mdx'

# 架构

StarRocks 拥有健壮的架构。整个系统只包含两种类型的组件：前端节点和后端节点。前端节点称为 **FE**。后端节点有两种类型：**BE** 和 **CN**（计算节点）。当使用本地存储数据时部署 BE；当数据存储在对象存储或 HDFS 上时部署 CN。StarRocks 不依赖任何外部组件，从而简化了部署和维护。节点可以水平扩展，且无需服务停机。此外，StarRocks 具有元数据和服务数据的副本机制，这增加了数据可靠性并有效防止了单点故障 (SPOFs)。

StarRocks 兼容 MySQL 协议并支持标准 SQL。用户可以使用 MySQL 客户端连接到 StarRocks，以获得即时且有价值的洞察。

## 架构选择

StarRocks 支持 Shared-nothing（每个 BE 在其本地存储上拥有部分数据）和 Shared-data（所有数据都在对象存储或 HDFS 上，每个 CN 只在本地存储上拥有缓存）。您可以根据需要决定数据存储位置。

![Architecture choices](../_assets/architecture_choices.png)

### Shared-nothing

本地存储为实时查询提供了更低的查询延迟。

作为典型的海量并行处理 (MPP) 数据库，StarRocks 支持 Shared-nothing 架构。在此架构中，BE 负责数据存储和计算。直接访问 BE 模式下的本地数据可以实现本地计算，避免数据传输和数据拷贝，提供超快的查询和分析性能。此架构支持多副本数据存储，增强了集群处理高并发查询的能力并确保数据可靠性。它非常适合追求最佳查询性能的场景。

![shared-data-arch](../_assets/shared-nothing.png)

#### 节点

在 Shared-nothing 架构中，StarRocks 由两种类型的节点组成：FE 和 BE。

-   FE 负责元数据管理和构建执行计划。
-   BE 执行查询计划并存储数据。BE 利用本地存储加速查询，并利用多副本机制确保数据高可用性。

##### FE

FE 负责元数据管理、客户端连接管理、查询规划和查询调度。每个 FE 使用 BDB JE (Berkeley DB Java Edition) 在其内存中存储和维护完整的元数据副本，确保所有 FE 之间提供一致的服务。FE 可以作为 Leader、Follower 和 Observer。如果 Leader 节点崩溃，Follower 将根据 Raft 协议选举出新的 Leader。

| **FE 角色** | **元数据管理**                                                                                                                                                                                                                                                                                                                                                                                                | **Leader 选举**                |
| ----------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------- |
| Leader      | Leader FE 负责读写元数据。Follower 和 Observer FE 只能读取元数据。它们将元数据写入请求路由到 Leader FE。Leader FE 更新元数据，然后使用 Raft 协议将元数据更改同步到 Follower 和 Observer FE。只有在元数据更改同步到半数以上的 Follower FE 后，数据写入才被认为是成功的。 | 从技术上讲，Leader FE 也是一个 Follower 节点，并从 Follower FE 中选举产生。要执行 Leader 选举，集群中必须有半数以上的 Follower FE 处于活跃状态。当 Leader FE 发生故障时，Follower FE 将开始新一轮的 Leader 选举。 |
| Follower    | Follower 只能读取元数据。它们从 Leader FE 同步和重放日志以更新元数据。                                                                                                                                                                                                                                                                                                              | Follower 参与 Leader 选举，这需要集群中半数以上的 Follower 处于活跃状态。 |
| Observer   | Observer 从 Leader FE 同步和重放日志以更新元数据。                                                                                                                                                                                                                                                                                                                                           | Observer 主要用于增加集群的查询并发度。Observer 不参与 Leader 选举，因此不会增加集群的 Leader 选择压力。|

##### BE

BE 负责数据存储和 SQL 执行。

-   数据存储：BE 具有同等的数据存储能力。FE 根据预定义规则将数据分发到 BE。BE 对摄取的数据进行转换，将数据写入所需的格式，并为数据生成索引。

-   SQL 执行：FE 根据查询的语义将每个 SQL 查询解析为逻辑执行计划，然后将逻辑计划转换为可在 BE 上执行的物理执行计划。存储目标数据的 BE 执行查询。这消除了数据传输和复制的需要，实现了高查询性能。

### Shared-data

对象存储和 HDFS 提供了成本、可靠性和可扩展性方面的优势。除了存储的可扩展性之外，由于存储和计算是分离的，因此可以在无需重新平衡数据的情况下添加和删除 CN 节点。

在 Shared-data 架构中，BE 被“计算节点（CN）”取代，CN 仅负责数据计算任务和缓存热数据。数据存储在 Amazon S3、Google Cloud Storage、Azure Blob Storage、MinIO 等低成本且可靠的远程存储系统中。当缓存命中时，查询性能可与 Shared-nothing 架构相媲美。CN 节点可以在几秒钟内按需添加或删除。这种架构降低了存储成本，确保了更好的资源隔离，并具有高弹性和可扩展性。

Shared-data 架构保持了与其 Shared-nothing 对应架构一样简单的架构。它只包含两种类型的节点：FE 和 CN。唯一的区别是用户必须配置后端对象存储。

![shared-data-arch](../_assets/shared-data.png)

#### 节点

Shared-data 架构中的 Coordinator 节点提供与 Shared-nothing 架构中 FE 相同的功能。

BE 被 CN（计算节点）取代，存储功能被卸载到对象存储或 HDFS。CN 是无状态的计算节点，执行 BE 的所有功能，除了数据存储。

#### 存储

StarRocks Shared-data 集群支持两种存储解决方案：对象存储（例如，AWS S3、Google GCS、Azure Blob Storage 或 MinIO）和 HDFS。

在 Shared-data 集群中，数据文件格式与 Shared-nothing 集群（具有耦合的存储和计算）保持一致。数据组织成段文件，并且在云原生表（专门用于 Shared-data 集群的表）中重用了各种索引技术。

#### 缓存

StarRocks Shared-data 集群解耦了数据存储和计算，允许它们独立扩展，从而降低成本并增强弹性。然而，这种架构可能会影响查询性能。

为了减轻这种影响，StarRocks 建立了一个多层次的数据访问系统，包括内存、本地磁盘和远程存储，以更好地满足各种业务需求。

针对热数据的查询直接扫描缓存，然后是本地磁盘；而冷数据需要从对象存储加载到本地缓存以加速后续查询。通过使热数据靠近计算单元，StarRocks 实现了真正的高性能计算和经济高效的存储。此外，对冷数据的访问已通过数据预取策略进行了优化，有效地消除了查询的性能限制。

创建表时可以启用缓存。如果启用缓存，数据将同时写入本地磁盘和后端对象存储。在查询期间，CN 节点首先从本地磁盘读取数据。如果未找到数据，它将从后端对象存储中检索，并同时缓存到本地磁盘。

<QSOverview />
