---
displayed_sidebar: docs
---

# 什么是 StarRocks？

StarRocks 是一款新一代极速全并行处理（MPP）数据库，旨在让企业可以轻松进行实时分析。它的设计目标是以极高的速度支持亚秒级的查询。

StarRocks 的设计非常出色。它包含了一系列丰富的功能，包括全向量化引擎、全新设计的基于成本的优化器（CBO）和智能物化视图。因此，StarRocks 的查询速度远远超过同类数据库产品，尤其是在多表关联查询方面。

StarRocks 非常适合对最新数据进行实时分析。数据可以高速摄取，并进行实时更新和删除。StarRocks 允许用户创建使用各种模式的表，例如扁平模式、星形模式和雪花模式。

StarRocks 兼容 MySQL 协议和标准 SQL，开箱即用地支持所有主流的商业智能（BI）工具，如 Tableau 和 Power BI。StarRocks 不依赖任何外部组件。它是一个集成的 数据分析 平台，具有高可扩展性、高可用性和简化的管理和维护。

[StarRocks](https://github.com/StarRocks/starrocks/tree/main) 采用 Apache 2.0 协议，可在 StarRocks GitHub 存储库中获取（参见 [StarRocks license](https://github.com/StarRocks/starrocks/blob/main/LICENSE.txt)）。StarRocks (i) 链接或调用第三方软件库中的函数，这些库的许可证可在 [licenses-binary](https://github.com/StarRocks/starrocks/tree/main/licenses-binary) 文件夹中找到；(ii) 包含第三方软件代码，这些代码的许可证可在 [licenses](https://github.com/StarRocks/starrocks/tree/main/licenses) 文件夹中找到。

## 适用场景

StarRocks 满足各种企业分析需求，包括 OLAP（联机分析处理）多维分析、实时分析、高并发分析、自定义报表、即席查询和统一分析。

### OLAP 多维分析

MPP 框架和向量化执行引擎使用户可以选择各种模式来开发多维分析报告。适用场景：

- 用户行为分析

- 用户画像、标签分析、用户标签

- 高维指标报告

- 自助式仪表盘

- 服务异常探测和分析

- 跨主题分析

- 金融数据分析

- 系统监控分析

### 实时分析

StarRocks 使用 Primary Key table 实现实时更新。TP（事务处理）数据库中的数据更改可以在几秒钟内同步到 StarRocks，以构建实时数仓。

适用场景：

- 在线促销分析

- 仓储物流跟踪和分析

- 金融行业的绩效分析和指标计算

- 直播质量分析

- 广告投放分析

- 驾驶舱管理

- 应用程序性能管理（APM）

### 高并发分析

StarRocks 利用高性能的数据分发、灵活的索引和智能物化视图来促进面向用户的高并发分析：

- 广告商报告分析

- 零售业渠道分析

- 面向 SaaS 的用户分析

- 多标签仪表盘分析

### 统一分析

StarRocks 提供统一的数据分析体验。

- 一个系统可以支持各种分析场景，从而降低系统复杂性并降低总体拥有成本（TCO）。

- StarRocks 统一了数据湖和数据仓库。湖仓一体的数据可以在 StarRocks 中进行统一管理。对延迟敏感且需要高并发的查询可以在 StarRocks 上运行。可以使用 StarRocks 提供的 external catalog 或 external table 访问数据湖中的数据。