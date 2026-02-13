```md
displayed_sidebar: docs
import QSOverview from '../_assets/commonMarkdown/quickstart-overview-tip.mdx'

# Architecture

StarRocks has a powerful architecture. The entire system consists of only two types of components: "frontend" and "backend". Frontend nodes are called **FE**s. Backend nodes are divided into two types: **BE**s and **CN**s (compute nodes). When data uses local storage, BEs are deployed; when data is stored on object storage or HDFS, CNs are deployed. StarRocks does not rely on any external components, which simplifies deployment and maintenance. Nodes can be horizontally scaled without downtime. In addition, StarRocks has a replica mechanism for metadata and service data, which improves data reliability and effectively prevents single points of failure (SPOFs).

StarRocks is compatible with the MySQL communication protocol and supports standard SQL. Users can connect to StarRocks via a MySQL client to gain immediate and valuable insights.

## Architecture Choices

StarRocks supports shared-nothing mode (where each BE owns a portion of the data on its local storage) and shared-data mode (where all data is stored on object storage or HDFS, and each CN only has a cache on its local storage). You can decide where to store your data based on your needs.

![Architecture Choices](../_assets/architecture_choices.png)

### Shared-nothing Mode
Local storage provides better query latency for real-time queries.

As a typical Massively Parallel Processing (MPP) database, StarRocks supports the shared-nothing architecture. In this architecture, BEs are responsible for data storage and compute. Directly accessing local data on BEs allows for local computation, avoiding data transfer and data copying, and delivering ultra-fast query performance and data analytics performance. This architecture supports multi-replica data storage, which enhances the cluster's ability to handle high-concurrency queries and ensures data reliability. It is ideal for scenarios that require optimal query performance.

![Shared-nothing Architecture](../_assets/shared-nothing.png)

#### Nodes

In the shared-nothing architecture, StarRocks consists of two types of nodes: FE and BE.

- FE is responsible for metadata management and building execution plans.
- BEs execute query plans and store data. BEs leverage local storage to accelerate queries and use a multi-replica mechanism to ensure data high availability.

##### FE

FE is responsible for metadata management, client connection management, query planning, and query scheduling. Each FE uses BDB JE (Berkeley DB Java Edition) to store and maintain a complete replica of metadata in its memory, ensuring service consistency among all FEs. FEs can function as a Leader, Follower, and Observer. If the Leader node crashes, Followers will elect a Leader according to the Raft protocol.

| **FE Role** | **Metadata Management**                                                                                                                                                                                                                                                                                                                                                                                              | **Leader Election**                |
| ----------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------- |
| Leader      | The Leader FE reads and writes metadata. Follower and Observer FEs can only read metadata. They route metadata write requests to the Leader FE. The Leader FE updates metadata and then uses the Raft protocol to synchronize metadata changes to Follower and Observer FEs. Data writes are considered successful only after metadata changes are synchronized to more than half of the Follower FEs. | The Leader FE, technically, is also a Follower node and is elected by Follower FEs. To perform a Leader election, more than half of the Follower FEs in the cluster must be active. When the Leader FE fails, Follower FEs will initiate a new round of Leader election. |
| Follower    | Followers can only read metadata. They synchronize and replay logs from the Leader FE to update metadata.                                                                                                                                                                                                                                                                                                            | Followers participate in Leader election, which requires more than half of the Followers in the cluster to be active. |
| Observer   | Synchronizes and replays logs from the Leader FE to update metadata.                                                                                                                                                                                                                                                                                                                                           | Observers are mainly used to improve the cluster's query concurrency. Observers do not participate in Leader election, thus they do not increase the Leader election pressure on the cluster. |

##### BE

BEs are responsible for data storage and SQL execution.

- Data storage: BEs have equivalent data storage capabilities. FEs distribute data to BEs according to predefined rules. BEs transform the ingested data, write data in the required format, and generate indexes for the data.

- SQL execution: FEs parse each SQL query into a logical execution plan based on the query's semantics, and then transform the logical plan into a physical execution plan that can be executed on BEs. BEs that store the target data execute the queries. This eliminates the need for data transfer and copying, thus achieving high query performance.

### Shared-data Mode

Object storage and HDFS offer advantages in terms of cost, reliability, and scalability. In addition to storage scalability, due to the separation of storage and compute, CN nodes can be added and removed on demand without re-balancing data.

In a shared-data architecture, BEs are replaced by 'compute nodes (CNs)', which are only responsible for data compute tasks and caching hot data. Data is stored in low-cost, reliable remote storage systems, such as Amazon S3, Google Cloud Storage, Azure Blob Storage, MinIO, etc. When the cache is hit, query performance is comparable to that of the shared-nothing architecture. CN nodes can be added or removed on demand within seconds. This architecture reduces storage costs, ensures better resource isolation, and offers high elasticity and scalability.

The shared-data architecture, like the shared-nothing architecture, maintains a simple architecture. It consists of only two types of nodes: FE and CN. The only difference is that users need to provision backend object storage.

![Shared-data Architecture](../_assets/shared-data.png)

#### Nodes

The coordinator nodes in a shared-data architecture provide the same functionality as FEs in a shared-nothing architecture.

BEs are replaced by CNs (compute nodes), and storage functionality is offloaded to object storage or HDFS. CNs are stateless compute nodes, performing all functions of BEs, except for data storage.

#### Storage

StarRocks shared-data clusters support two storage solutions: object storage (such as AWS S3, Google GCS, Azure Blob Storage, or MinIO) and HDFS.

In shared-data clusters, the data file format remains consistent with shared-nothing clusters (which feature coupled storage and compute). Data is organized into Segment files, and various indexing techniques are reused in shared-data tables, which are tables specifically used in shared-data clusters.

#### Cache

StarRocks shared-data clusters decouple data storage and compute, allowing both to scale independently, thereby reducing costs and enhancing elasticity. However, this architecture may impact query performance.

To mitigate the impact, StarRocks establishes a multi-tiered data access system covering memory, local disk, and remote storage to better meet diverse business requirements.

Hot data queries directly scan the cache and then local disk; while cold data needs to be loaded from object storage into the local cache to accelerate subsequent queries. By keeping hot data close to the compute units, StarRocks achieves truly high-performance compute and cost-effective storage. Additionally, cold data access has been optimized through data prefetching strategies, effectively eliminating query performance limitations.

Caching can be enabled when creating tables. If caching is enabled, data will be written to both local disk and backend object storage simultaneously. During queries, CN nodes first read data from local disk. If data is not found, it will be retrieved from backend object storage and simultaneously cached to local disk.

<QSOverview />
```
