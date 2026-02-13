```md
displayed_sidebar: docs
import QSOverview from '../_assets/commonMarkdown/quickstart-overview-tip.mdx'

# Architecture

StarRocks features a powerful architecture. The entire system consists of only two types of components: "frontend" and "backend". Frontend nodes are called **FE**s. Backend nodes are divided into two types: **BE**s and **CN**s (compute nodes). BEs are deployed when data uses local storage; CNs are deployed when data is stored on object storage or HDFS. StarRocks does not rely on any external components, which simplifies deployment and maintenance. Nodes can be horizontally scaled without downtime. In addition, StarRocks has a replica mechanism for metadata and service data, which improves data reliability and effectively prevents single points of failure (SPOFs).

StarRocks is compatible with the MySQL communication protocol and supports standard SQL. Users can connect to StarRocks via MySQL clients to gain immediate and valuable insights.

## Architectural Choices

StarRocks supports the shared-nothing mode (where each BE owns a portion of the data on its local storage) and the shared-data mode (where all data is stored on object storage or HDFS, and each CN only has a cache on its local storage). You can decide where to store data based on your requirements.

![Architectural Choices](../_assets/architecture_choices.png)

### Shared-nothing mode
Local storage provides better query latency for real-time queries.

As a typical Massively Parallel Processing (MPP) database, StarRocks supports a shared-nothing architecture. In this architecture, BEs are responsible for data storage and compute. Directly accessing local data on BEs allows for local computation, avoiding data transfer and copying, and providing ultra-fast query and data analytics performance. This architecture supports multi-replica data storage, enhancing the cluster's ability to handle high-concurrency queries and ensuring data reliability. It is ideal for scenarios that demand optimal query performance.

![Shared-nothing Architecture](../_assets/shared-nothing.png)

#### Nodes

In a shared-nothing architecture, StarRocks consists of two types of nodes: FEs and BEs.

- FEs are responsible for metadata management and building execution plans.
- BEs execute query plans and store data. BEs utilize local storage to accelerate queries and use a multi-replica mechanism to ensure data high availability.


##### FE

FEs are responsible for metadata management, client connection management, query planning, and query scheduling. Each FE uses BDB JE (Berkeley DB Java Edition) to store and maintain a complete replica of metadata in its memory, ensuring service consistency among all FEs. FEs can operate as a Leader, Follower, and Observer. If the Leader node crashes, Follower FEs will elect a Leader according to the Raft protocol.

| **FE Role** | **Metadata Management**                                                                                                                                                                                                                                                                                                                                                                                                | **Leader Election**                |
| ----------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------- |
| Leader      | Leader FEs read and write metadata. Follower and Observer FEs can only read metadata. They route metadata write requests to the Leader FE. The Leader FE updates metadata, and then uses the Raft protocol to synchronize metadata changes to Follower and Observer FEs. Data writes are considered successful only after metadata changes are synchronized to more than half of the Follower FEs. | The Leader FE is, technically speaking, also a Follower node, elected by Follower FEs. To perform a Leader election, more than half of the Follower FEs in the cluster must be active. When a Leader FE fails, Follower FEs will initiate a new round of Leader election. |
| Follower    | Follower FEs can only read metadata. They synchronize and replay logs from the Leader FE to update metadata.                                                                                                                                                                                                                                                                                                              | Follower FEs participate in Leader elections, which requires more than half of the Follower FEs in the cluster to be active. |
| Observer   | Synchronize and replay logs from the Leader FE to update metadata.                                                                                                                                                                                                                                                                                                                                           | Observer FEs are mainly used to improve the query concurrency of the cluster. Observer FEs do not participate in Leader elections, thus they do not increase the pressure on the cluster's Leader election process. |

##### BE

BEs are responsible for data storage and SQL execution.

- Data Storage: BEs have equivalent data storage capabilities. FEs distribute data to BEs according to predefined rules. BEs transform ingested data, write data into the required format, and generate indexes for the data.

- SQL Execution: FEs parse each SQL query into a logical execution plan based on the query's semantics, then convert the logical plan into a physical execution plan that can be executed on BEs. BEs storing the target data execute the query. This eliminates the need for data transfer and copying, thus achieving high query performance.


### Shared-data mode

Object storage and HDFS offer advantages in terms of cost, reliability, and scalability. In addition to storage scalability, CN nodes can be added and removed on demand without data re-distribution, thanks to the separation of storage and compute.

In a shared-data architecture, BEs are replaced by "compute nodes (CNs)," which are solely responsible for data compute tasks and caching hot data. Data is stored in low-cost, reliable remote storage systems, such as Amazon S3, Google Cloud Storage, Azure Blob Storage, MinIO, etc. When the cache is hit, query performance is comparable to that of a shared-nothing architecture. CN nodes can be added or removed on demand within seconds. This architecture reduces storage costs, ensures better resource isolation, and offers high elasticity and scalability.

The shared-data architecture, like the shared-nothing architecture, maintains a simple structure. It consists of only two types of nodes: FEs and CNs. The only difference is that users need to provision backend object storage.

![Shared-data Architecture](../_assets/shared-data.png)

#### Nodes

The coordination nodes in a shared-data architecture provide the same functionality as FEs in a shared-nothing architecture.

BEs are replaced by CNs (compute nodes), and storage functionality is offloaded to object storage or HDFS. CNs are stateless compute nodes that perform all functions of BEs, except for data storage.

#### Storage

StarRocks shared-data clusters support two storage solutions: object storage (such as AWS S3, Google GCS, Azure Blob Storage, or MinIO) and HDFS.

In a shared-data cluster, the data file format remains consistent with that of a shared-nothing cluster (which features coupled storage and compute). Data is organized into segment files, and various indexing techniques are reused in shared-data tables, which are tables specifically used in shared-data clusters.

#### Cache

StarRocks shared-data clusters decouple data storage and compute, allowing them to scale independently, which reduces costs and enhances elasticity. However, this architecture might affect query performance.

To mitigate this impact, StarRocks has established a multi-tiered data access system covering memory, local disk, and remote storage to better meet various business needs.

Hot data queries directly scan the cache, then scan the local disk; while cold data needs to be loaded from object storage into the local cache to accelerate subsequent queries. By keeping hot data close to the compute units, StarRocks achieves truly high-performance compute and cost-effective storage. Additionally, cold data access has been optimized through data prefetching strategies, effectively eliminating query performance limitations.

Caching can be enabled when creating a table. If caching is enabled, data will be written simultaneously to local disk and backend object storage. During a query, the CN node first reads data from the local disk. If the data is not found, it retrieves it from backend object storage and simultaneously caches it to the local disk.

<QSOverview />
```
