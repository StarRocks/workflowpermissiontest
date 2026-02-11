---
displayed_sidebar: docs
---
import QSOverview from '../_assets/commonMarkdown/quickstart-overview-tip.mdx'

# 架构

StarRocks 拥有强大的架构。该系统仅由两种类型的组件组成：前端节点和后端节点。前端节点称为 **FE**。后端节点分为两种：**BE** 和 **CN**（计算节点）。当数据使用本地存储时，部署 BE；当数据存储在对象存储或 HDFS 上时，部署 CN。StarRocks 不依赖任何外部组件，从而简化了部署和维护。节点可以在不中断服务的情况下进行水平扩展。此外，StarRocks 具有元数据和服务数据的副本机制，这提高了数据可靠性并有效防止了单点故障 (SPOF)。

StarRocks 兼容 MySQL 协议并支持标准 SQL。用户可以轻松地从 MySQL 客户端连接到 StarRocks，从而获得即时且有价值的洞察。

## 架构选择

StarRocks 支持 shared-nothing 架构（每个 BE 在其本地存储上拥有一部分数据）和 shared-data 架构（所有数据存储在对象存储或 HDFS 上，每个 CN 仅在本地存储上拥有缓存）。您可以根据需要决定数据存储位置。

![Architecture choices](../_assets/architecture_choices.png)

### Shared-nothing 架构

本地存储为实时查询提供了更低的查询延迟。

作为典型的海量并行处理 (MPP) 数据库，StarRocks 支持 shared-nothing 架构。在这种架构中，BE 负责数据存储和计算。直接访问 BE 节点上的本地数据可以实现本地计算，避免数据传输和数据复制，提供超快的查询和分析性能。该架构支持多副本数据存储，增强了集群处理高并发查询的能力，并确保了数据可靠性。它非常适合追求最佳查询性能的场景。

![shared-data-arch](../_assets/shared-nothing.png)

#### 节点

在 shared-nothing 架构中，StarRocks 由两种类型的节点组成：FE 和 BE。

- FE 负责元数据管理和构建执行计划。
- BE 执行查询计划并存储数据。BE 利用本地存储加速查询，并使用多副本机制确保数据高可用性。

##### FE

FE 负责元数据管理、客户端连接管理、查询规划和查询调度。每个 FE 使用 BDB JE (Berkeley DB Java Edition) 在其内存中存储和维护一份完整的元数据副本，确保所有 FE 之间服务的一致性。FE 可以作为 Leader、Follower 和 Observer 工作。如果 Leader 节点崩溃，Follower 会根据 Raft 协议选举出新的 Leader。

| **FE 角色** | **元数据管理**                                                                                                                                                                                                                                                                                                                                                                                                | **Leader 选举**                |
| ----------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------- |
| Leader      | Leader FE 负责元数据读写。Follower 和 Observer FE 只能读取元数据。它们将元数据写入请求路由到 Leader FE。Leader FE 更新元数据，然后使用 Raft 协议将元数据更改同步到 Follower 和 Observer FE。只有在元数据更改同步到超过半数的 Follower FE 后，数据写入才被认为是成功的。 | 从技术上讲，Leader FE 也是一个 Follower 节点，由 Follower FE 选举产生。要执行 Leader 选举，集群中必须有超过半数的 Follower FE 处于活跃状态。当 Leader FE 发生故障时，Follower FE 将开始新一轮的 Leader 选举。 |
| Follower    | Follower 只能读取元数据。它们从 Leader FE 同步和重放日志以更新元数据。 | Follower 参与 Leader 选举，这要求集群中超过半数的 Follower 处于活跃状态。 |
| Observer    | Observer 从 Leader FE 同步和重放日志以更新元数据。 | Observer 主要用于增加集群的查询并发性。Observer 不参与 Leader 选举，因此不会给集群增加 Leader 选举压力。 |

##### BE

BE 负责数据存储和 SQL 执行。

- 数据存储：BE 具有同等的数据存储能力。FE 根据预定义规则将数据分发到 BE。BE 对摄入的数据进行转换，将数据写入所需格式，并为数据生成索引。

- SQL 执行：FE 根据查询语义将每个 SQL 查询解析为逻辑执行计划，然后将逻辑计划转换为可在 BE 上执行的物理执行计划。存储目标数据的 BE 执行查询。这消除了数据传输和复制的需求，实现了高查询性能。

### Shared-data 架构

对象存储和 HDFS 提供了成本、可靠性和可扩展性优势。除了存储的可扩展性之外，由于存储和计算是分离的，CN 节点可以在无需重新平衡数据的情况下添加和移除。

在 shared-data 架构中，BE 被“计算节点（CN）”取代，CN 仅负责数据计算任务和热数据缓存。数据存储在低成本、可靠的远程存储系统（如 Amazon S3、Google Cloud Storage、Azure Blob Storage、MinIO 等）中。当缓存命中时，查询性能可与 shared-nothing 架构相媲美。CN 节点可以在几秒钟内按需添加或移除。这种架构降低了存储成本，确保了更好的资源隔离，并具有高弹性和可扩展性。

shared-data 架构与其 shared-nothing 架构一样保持了简洁的架构。它仅由两种类型的节点组成：FE 和 CN。唯一的区别是用户必须配置后端对象存储。

![shared-data-arch](../_assets/shared-data.png)

#### 节点

shared-data 架构中的 Coordinator 节点提供与 shared-nothing 架构中 FE 相同的功能。

BE 被 CN（计算节点）取代，存储功能被卸载到对象存储或 HDFS。CN 是无状态的计算节点，除了数据存储外，它们执行 BE 的所有功能。

#### 存储

StarRocks shared-data 集群支持两种存储解决方案：对象存储（例如 AWS S3、Google GCS、Azure Blob Storage 或 MinIO）和 HDFS。

在 shared-data 集群中，数据文件格式与 shared-nothing 集群（具有耦合存储和计算）保持一致。数据被组织成段文件，并且各种索引技术在云原生表（专门用于 shared-data 集群的表）中得到重用。

#### 缓存

StarRocks shared-data 集群解耦了数据存储和计算，使它们能够独立扩展，从而降低成本并增强弹性。然而，这种架构可能会影响查询性能。

为了减轻这种影响，StarRocks 建立了一个包含内存、本地磁盘和远程存储的多层数据访问系统，以更好地满足各种业务需求。

对热数据的查询直接扫描缓存，然后扫描本地磁盘；而冷数据需要从对象存储加载到本地缓存以加速后续查询。通过将热数据保持在靠近计算单元的位置，StarRocks 实现了真正的高性能计算和经济高效的存储。此外，对冷数据的访问已通过数据预取策略进行了优化，有效消除了查询的性能限制。

在创建表时可以启用缓存。如果启用缓存，数据将同时写入本地磁盘和后端对象存储。在查询期间，CN 节点首先从本地磁盘读取数据。如果未找到数据，则会从后端对象存储中检索，并同时缓存到本地磁盘。

<QSOverview />
