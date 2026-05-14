# 示例 Markdown 文档

如果您在自定义 catalog 中定义了配置项，并希望在查询数据时使配置项生效，可以在创建外部表时将配置项作为键值对添加到 `PROPERTIES` 参数中。例如，如果您在自定义 catalog 中定义了配置项 `custom-catalog.properties`，可以运行以下命令创建外部表。

例如，在数据库 `iceberg_test` 中创建名为 `iceberg_tbl` 的 Iceberg 外部表。

例如，在 StarRocks 中创建名为 `iceberg_test` 的数据库。

例如，删除名为 `iceberg0` 的资源。

您可以在 StarRocks 2.3 及更高版本中修改 Iceberg 资源的 `hive.metastore.uris` 和 `iceberg.catalog-impl`。更多信息，请参见[ALTER RESOURCE](../sql-reference/sql-statements/Resource/ALTER_RESOURCE.md)。

例如，创建名为 `iceberg1` 的资源，并将 catalog 类型设置为 `CUSTOM`。

自定义 catalog 需要继承抽象类 BaseMetastoreCatalog，并且您需要实现 IcebergCatalog 接口。此外，自定义 catalog 的类名不能与 StarRocks 中已存在的类名重复。创建 catalog 后，将 catalog 及其相关文件打包，并放置在每个前端（FE）的**fe/lib** 路径下。然后重启每个 FE。完成上述操作后，您可以创建一个以自定义 catalog 为 catalog 的资源。

| **参数**          | **描述**                                              |
| ---------------------- | ------------------------------------------------------------ |
| type                   | 资源类型。将值设置为 `iceberg`。               |
| iceberg.catalog.type | 资源的 catalog 类型。支持 Hive catalog 和自定义 catalog。如果指定 Hive catalog，将值设置为 `HIVE`。如果指定自定义 catalog，将值设置为 `CUSTOM`。 |
| iceberg.catalog-impl   | 自定义 catalog 的完全限定类名。FE 根据此名称搜索 catalog。如果 catalog 包含自定义配置项，则在创建 Iceberg 外部表时必须将其作为键值对添加到 `PROPERTIES` 参数中。 |

例如，创建名为 `iceberg0` 的资源，并将 catalog 类型设置为 `HIVE`。

- 如果 Iceberg 表的元数据从 Hive metastore 获取，您可以创建一个资源并将 catalog 类型设置为 `HIVE`。

- 地理相关查询

- 创建名为 `hive0` 的 Hive 资源。

示例：在 `hive0` 资源对应的 Hive 集群中，在 `rawdata` 数据库下创建外部表 `profile_parquet_p7`。

**esquery 函数** 用于将查询下推**无法用 SQL 表达的** （如 match 和 geoshape）到 Elasticsearch 进行过滤。esquery 函数的第一个参数用于关联索引。第二个参数是基本 Query DSL 的 JSON 表达式，用括号{} 括起来。**JSON 表达式必须有且只有一个根键**，例如 match、geo_shape 或 bool。

有关支持的数据类型以及 StarRocks 与目标数据库之间的数据类型映射，请参见 [数据类型映射](External_table.md#Data type mapping)。

这是一个示例 Markdown 文档，用于演示各种 Markdown 元素，以测试翻译工具。

## 简介

欢迎使用**Markdown 翻译器** 测试文档！该文件包含各种 Markdown 元素，以确保翻译能够正确保留格式。

### 待测试功能

以下是我们希望验证的关键功能：

1. **标题** 不同级别的
2. *斜体* 和 **粗体** 文本格式
3. `Inline code` 代码片段
4. 列表（有序和无序）
5. 链接和图片
6. 代码块
7. 表格
8. 块引用

## 代码示例

这是一个不应被翻译的 JavaScript 函数：

```javascript
function greetUser(name) {
    console.log(`Hello, ${name}! Welcome to the translator.`);
    return `Greeting sent to ${name}`;
}
```

这是一些 Python 代码：

```python
def calculate_total(items):
    """Calculate the total price of items."""
    total = sum(item['price'] for item in items)
    return total
```

## 列表

### 无序列表

- 列表中的第一项
- 第二项，包含**粗体文本**
- 第三项，包含[一个链接](https://example.com)
- 第四项，包含 `inline code`

### 有序列表

1. 流程中的第一步
2. 第二步，包含*强调*
3. 最后一步，包含重要细节

## 表格

| 功能 | 描述 | 状态 |
|---------|-------------|--------|
| 翻译 | 将文本转换为目标语言 | ✅ 启用 |
| 格式化 | 保留 Markdown 结构 | ✅ 启用 |
| 代码块 | 保持代码不被翻译 | ✅ 启用 |
| 链接 | 维护 URL 完整性 | ✅ 启用 |

## 链接和图片

访问我们的[文档](https://github.com/example/markdown-translator) 以获取更多信息。

![示例图片](https://via.placeholder.com/300x200?text=Sample+Image)

## Docusaurus 提示框

:::tip
如果 MinIO Web UI 中没有显示访问密钥，请检查 `minio_mc` 服务的日志：

```bash
docker compose logs minio_mc
```

尝试重新运行 `minio_mc` Pod：

```bash
docker compose run minio_mc
```

:::

## 块引用

> 这是一段重要的引用，应在保留块引用格式的同时进行翻译。
>
> 多段落引用也应能正常工作。

### 嵌套块引用

> 这是一段主要引用。
>
> > 这是主要引用中的嵌套引用。
它应保持正确的嵌套结构。

## 混合内容

您可以将 `inline code` 与 **粗体文本** 和 *斜体文本* 组合在同一段落中。URL（如 https://example.com）应保持不变，电子邮件地址（如 contact@example.com）也应保持不变。

## 技术术语

在处理技术文档时，诸如 **API**、**JSON**、**HTTP** 和 **URL** 等术语可能需要根据目标语言和上下文进行特殊处理。

本示例还特意包含了几个不得翻译的项目专有术语：StarRocks、Hive、Leader、Follower、Raft、Docker、Kubernetes、MinIO。

使用中文词典中常见英文术语的附加示例句子：

- 数据加载在管道的摄取阶段执行。
- 数据卸载将结果导出到外部系统以供下游处理。
- 原生表使用系统内部格式存储数据。
- 云原生表部署将存储与计算分离以实现可扩展性。
- 外部表允许查询存储在数据库之外的数据。
- Hive 外部表可用于访问旧版 Hive 数据集。
- 存储分层有助于优化冷热数据的存放位置。
- 存储与计算的分离实现了灵活的扩展能力。
- 在共享数据模式下，多个计算集群访问同一存储。
- 零迁移策略可在升级期间最大限度地减少停机时间。
- 原生向量化引擎加速分析查询。
- 查询联邦允许跨不同系统连接表。
- 列式存储提高了压缩率和分析性能。
- 行式存储适用于事务性工作负载。
- 物化视图可以预计算开销较大的聚合操作。
- 预聚合通过提前汇总数据来减少查询时的计算量。
- 聚合查询对多组行计算汇总结果。
- 星型模式是一种常见的用于分析的维度建模模式。
- 雪花模式对维度表进行规范化以减少冗余。
- 点查询通过键检索单行或少量行。

### 带解释的代码

以下命令用于安装该软件包：

```bash
npm install markdown-translator
```

此命令应保持原样不变，但此说明文字应被翻译。

## 结论

本示例文档测试各种 Markdown 元素，以确保翻译工具正常运行。目标是翻译所有可读文本，同时保留：

- Markdown 格式
- 代码块和内联代码
- URL 和文件路径
- 技术语法

***

*本文档是为测试目的而创建的。*

# 外部表

执行以下语句以创建名为 `jdbc0` 的 JDBC 资源：

在创建资源时，FE 使用 `driver_url` 参数中指定的 URL 下载 JDBC 驱动程序 JAR 包，生成校验和，并使用该校验和验证 BE 下载的 JDBC 驱动程序。

从 2.5 版本开始，StarRocks 提供数据缓存功能，可加速对外部数据源的热数据查询。更多信息，请参见 [数据缓存](data_cache.md)。

当 BE 首次查询 JDBC 外部表，发现其机器上不存在对应的 JDBC 驱动程序 JAR 包时，BE 会使用 `driver_url` 参数中指定的 URL 下载 JDBC 驱动程序 JAR 包，所有 JDBC 驱动程序 JAR 包均保存在 `${STARROCKS_HOME}/lib/jdbc_drivers` 目录中。

> 注意：`ResourceType` 列为 `jdbc`。

执行以下语句以删除名为 `jdbc0` 的 JDBC 资源：

执行以下语句以在 StarRocks 中创建并访问名为 `jdbc_test` 的数据库：

执行以下语句以在数据库 `jdbc_test` 中创建名为 `jdbc_tbl` 的 JDBC 外部表：

`properties` 中的必填参数如下：

执行以下语句以删除名为 `hudi0` 的 Hudi 资源：

执行以下语句以在您的 StarRocks 集群中创建并打开名为 `hudi_test` 的 Hudi 数据库：

下表描述了各参数。

| 参数 | 描述                                                  |
| --------- | ------------------------------------------------------------ |
| ENGINE    | Hudi 外部表的查询引擎。将值设置为 `HUDI`。 |
| resource  | StarRocks 集群中 Hudi 资源的名称。     |
| database  | Hudi 外部表在 StarRocks 集群中所属的 Hudi 数据库名称。 |
| table     | 与 Hudi 外部表关联的 Hudi 托管表。 |

| Hudi 支持的数据类型   | StarRocks 支持的数据类型 |
| ----------------------------   | --------------------------------- |
| BOOLEAN                        | BOOLEAN                           |
| INT                            | TINYINT/SMALLINT/INT              |
| DATE                           | DATE                              |
| TimeMillis/TimeMicros          | TIME                              |
| TimestampMillis/TimestampMicros| DATETIME                          |
| LONG                           | BIGINT                            |
| FLOAT                          | FLOAT                             |
| DOUBLE                         | DOUBLE                            |
| STRING                         | CHAR/VARCHAR                      |
| ARRAY                          | ARRAY                             |
| DECIMAL                        | DECIMAL                           |

:::note

StarRocks 不支持查询 STRUCT 或 MAP 类型的数据，也不支持查询 Merge On Read 表中 ARRAY 类型的数据。

:::

> **注意**
>
> StarRocks 不支持查询 STRUCT 或 MAP 类型的数据，也不支持查询 Merge On Read 表中 ARRAY 类型的数据。

:::note

外部表功能除某些特殊使用场景外不再推荐使用，未来版本中可能会被弃用。在一般场景下，若需管理和查询外部数据源的数据，[外部目录](./catalog/catalog_overview.md) 是推荐的方式。

:::

下表描述了各参数。

| **参数**        | **是否必填** | **默认值** | **描述**                                              |
| -------------------- | ------------ | ----------------- | ------------------------------------------------------------ |
| hosts                | 是          | 无              | Elasticsearch 集群的连接地址。您可以指定一个或多个地址。StarRocks 可以从该地址解析 Elasticsearch 版本和索引分片分配。StarRocks 根据 `GET /_nodes/http` API 操作返回的地址与您的 Elasticsearch 集群通信。因此，`host` 参数的值必须与 `GET /_nodes/http` API 操作返回的地址相同。否则，BE 可能无法与您的 Elasticsearch 集群通信。 |
| index                | 是          | 无              | 在 StarRocks 表上创建的 Elasticsearch 索引名称。名称可以是别名。此参数支持通配符 (*)。例如，如果将 `index` 设置为 <code class="language-text">hello*</code>，StarRocks 将检索所有名称以 `hello` 开头的索引。 |
| user                 | 否           | 空             | 在启用基本身份验证的情况下登录 Elasticsearch 集群所使用的用户名。请确保您具有访问 `/*cluster/state/*nodes/http` 和索引的权限。 |
| password             | 否           | 空             | 登录 Elasticsearch 集群所使用的密码。 |
| type                 | 否           | `_doc`            | 索引的类型。默认值：`_doc`。如果您要查询 Elasticsearch 8 及更高版本中的数据，则无需配置此参数，因为 Elasticsearch 8 及更高版本中已移除映射类型。 |
| es.nodes.wan.only    | 否           | `false`           | 指定 StarRocks 是否仅使用 `hosts` 指定的地址访问 Elasticsearch 集群并获取数据。<ul><li>`true`：StarRocks 仅使用 `hosts` 指定的地址访问 Elasticsearch 集群并获取数据，不会探测 Elasticsearch 索引分片所在的数据节点。如果 StarRocks 无法访问 Elasticsearch 集群内部数据节点的地址，则需要将此参数设置为 `true`。</li><li>`false`：StarRocks 使用 `host` 指定的地址探测 Elasticsearch 集群索引分片所在的数据节点。StarRocks 生成查询执行计划后，相关 BE 直接访问 Elasticsearch 集群内部的数据节点，从索引分片中获取数据。如果 StarRocks 可以访问 Elasticsearch 集群内部数据节点的地址，建议保留默认值 `false`。</li></ul> |
| es.net.ssl           | 否           | `false`           | 指定是否可以使用 HTTPS 协议访问您的 Elasticsearch 集群。仅 StarRocks 2.4 及更高版本支持配置此参数。<ul><li>`true`：可以使用 HTTPS 和 HTTP 协议访问您的 Elasticsearch 集群。</li><li>`false`：只能使用 HTTP 协议访问您的 Elasticsearch 集群。</li></ul> |
| enable_docvalue_scan | 否           | `true`            | 指定是否从 Elasticsearch 列式存储中获取目标字段的值。在大多数情况下，从列式存储读取数据的性能优于从行式存储读取数据。 |
| enable_keyword_sniff | 否           | `true`            | 指定是否根据 KEYWORD 类型字段对 Elasticsearch 中的 TEXT 类型字段进行探测。如果此参数设置为 `false`，StarRocks 将在分词后执行匹配。 |

|   SQL 语法  |   ES 语法  |
| :---: | :---: |
|  `=`   |  term query   |
|  `in`   |  terms query   |
|  `>=,  <=, >, <`   |  range   |
|  `and`   |  bool.filter   |
|  `or`   |  bool.should   |
|  `not`   |  bool.must_not   |
|  `not in`   |  bool.must_not + terms   |
|  `esquery`   |  ES Query DSL  |

> 注意：
>
> - 目前，支持的 Hive 存储格式为 Parquet、ORC 和 CSV。
如果存储格式为 CSV，则不能使用引号作为转义字符。
> - 支持 SNAPPY 和 LZ4 压缩格式。
> - 可查询的 Hive 字符串列的最大长度为 1 MB。如果字符串列超过 1 MB，将作为空列处理。

`k4` 的第一个字段为 TEXT 类型，数据写入后将由为 `k4` 配置的分析器（如果未为 `k4` 配置分析器，则使用标准分析器）进行分词。因此，第一个字段将被分词为三个词项：`StarRocks`、`On` 和 `Elasticsearch`。详细信息如下：

- **user:** 此参数指定用于访问目标 StarRocks 集群的用户名。
- **password:** 此参数指定用于访问目标 StarRocks 集群的密码。
- **database:** 此参数指定目标表所属的数据库。
- **table:** 此参数指定目标表的名称。

```SQL
# 在目标 StarRocks 集群中创建目标表。
CREATE TABLE t
(
    k1 DATE,
    k2 INT,
    k3 SMALLINT,
    k4 VARCHAR(2048),
    k5 DATETIME
)
ENGINE=olap
DISTRIBUTED BY HASH(k1);

# 在源 StarRocks 集群中创建外部表。
CREATE EXTERNAL TABLE external_t
(
    k1 DATE,
    k2 INT,
    k3 SMALLINT,
    k4 VARCHAR(2048),
    k5 DATETIME
)
ENGINE=olap
DISTRIBUTED BY HASH(k1)
PROPERTIES
(
    "host" = "127.0.0.1",
    "port" = "9020",
    "user" = "user",
    "password" = "passwd",
    "database" = "db_test",
    "table" = "t"
);

# 通过向 StarRocks 外部表写入数据，将数据从源集群写入目标集群。建议在生产环境中使用第二条语句。
insert into external_t values ('2020-10-11', 1, 1, 'hello', '2020-10-11 10:00:00');
insert into external_t select * from other_table;
```

## 参考资料

- [SHOW CREATE TABLE](SHOW_CREATE_TABLE.md)
- [SHOW TABLES](SHOW_TABLES.md)
- [USE](../Database/USE.md)
- [ALTER TABLE](ALTER_TABLE.md)
- [DROP TABLE](DROP_TABLE.md)
