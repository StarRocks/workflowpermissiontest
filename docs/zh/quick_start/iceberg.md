---
displayed_sidebar: docs
sidebar_position: 3
description: 基于 Apache Iceberg 构建数据湖
toc_max_heading_level: 2
keywords: [ 'iceberg' ]
---

import DataLakeIntro from '../_assets/commonMarkdown/datalakeIntro.mdx'
import Clients from '../_assets/quick-start/_clientsCompose.mdx'

# Apache Iceberg 数据湖

本指南将介绍如何使用 StarRocks™ 快速部署和运行 Apache Iceberg™，并提供示例代码以展示其强大功能。

### Docker-Compose

快速入门的最佳方式是使用一个 Docker-Compose 文件，该文件利用 `starrocks/fe-ubuntu` 和 `starrocks/be-ubuntu` 镜像部署一个包含预配置 Iceberg catalog 的本地 StarRocks 集群。要使用此文件，您需要安装 Docker CLI。

安装 Docker 后，将以下 YAML 代码保存为 `docker-compose.yml` 文件：

```yml
services:

  starrocks-fe:
    image: starrocks/fe-ubuntu:4.0-latest
    hostname: starrocks-fe
    container_name: starrocks-fe
    user: root
    command: |
      bash /opt/starrocks/fe/bin/start_fe.sh --host_type FQDN
    ports:
      - 8030:8030
      - 9020:9020
      - 9030:9030
    networks:
      iceberg_net:
    environment:
      - AWS_ACCESS_KEY_ID=admin
      - AWS_SECRET_ACCESS_KEY=password
      - AWS_REGION=us-east-1
    healthcheck:
      test: 'mysql -u root -h starrocks-fe -P 9030 -e "SHOW FRONTENDS\G" |grep "Alive: true"'
      interval: 10s
      timeout: 5s
      retries: 3

  starrocks-be:
    image: starrocks/be-ubuntu:4.0-latest
    command:
      - /bin/bash
      - -c
      - |
        ulimit -n 65535;
        echo "# Enable data cache"  >> /opt/starrocks/be/conf/be.conf
        echo "block_cache_enable = true"  >> /opt/starrocks/be/conf/be.conf
        echo "block_cache_mem_size = 536870912" >> /opt/starrocks/be/conf/be.conf
        echo "block_cache_disk_size = 1073741824" >> /opt/starrocks/be/conf/be.conf
        sleep 15s
        mysql --connect-timeout 2 -h starrocks-fe -P 9030 -u root -e "ALTER SYSTEM ADD BACKEND \"starrocks-be:9050\";"
        bash /opt/starrocks/be/bin/start_be.sh
    ports:
      - 8040:8040
    hostname: starrocks-be
    container_name: starrocks-be
    user: root
    depends_on:
      starrocks-fe:
        condition: service_healthy
    healthcheck:
      test: 'mysql -u root -h starrocks-fe -P 9030 -e "SHOW BACKENDS\G" |grep "Alive: true"'
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      iceberg_net:
    environment:
      - HOST_TYPE=FQDN

  rest:
    image: apache/iceberg-rest-fixture
    container_name: iceberg-rest
    networks:
      iceberg_net:
        aliases:
          - iceberg-rest.minio
    ports:
      - 8181:8181
    environment:
      - AWS_ACCESS_KEY_ID=admin
      - AWS_SECRET_ACCESS_KEY=password
      - AWS_REGION=us-east-1
      - CATALOG_WAREHOUSE=s3://warehouse/
      - CATALOG_IO__IMPL=org.apache.iceberg.aws.s3.S3FileIO
      - CATALOG_S3_ENDPOINT=http://minio:9000

  minio:
    image: minio/minio:RELEASE.2024-10-29T16-01-48Z
    container_name: minio
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password
      - MINIO_DOMAIN=minio
    networks:
      iceberg_net:
        aliases:
          - warehouse.minio
    ports:
      - 9001:9001
      - 9000:9000
    command: ["server", "/data", "--console-address", ":9001"]
  mc:
    depends_on:
      - minio
    image: minio/mc:RELEASE.2024-10-29T15-34-59Z
    container_name: mc
    networks:
      iceberg_net:
    environment:
      - AWS_ACCESS_KEY_ID=admin
      - AWS_SECRET_ACCESS_KEY=password
      - AWS_REGION=us-east-1
    entrypoint: >
      /bin/sh -c "
      until (/usr/bin/mc config host add minio http://minio:9000 admin password) do echo '...waiting...' && sleep 1; done;
      /usr/bin/mc rm -r --force minio/warehouse;
      /usr/bin/mc mb minio/warehouse;
      /usr/bin/mc policy set public minio/warehouse;
      tail -f /dev/null
      "
networks:
  iceberg_net:
```

接下来，使用以下命令启动 Docker 容器：

```Plain
docker compose up --detach --wait --wait-timeout 400
```

然后，您可以运行以下任何命令来启动 StarRocks 会话。

```bash
docker exec -it starrocks-fe \
mysql -P 9030 -h 127.0.0.1 -u root --prompt="StarRocks > "
```

### 添加和使用 Catalog

```SQL
CREATE EXTERNAL CATALOG 'demo'
COMMENT "External catalog to Apache Iceberg on MinIO"
PROPERTIES
(
  "type"="iceberg",
  "iceberg.catalog.type"="rest",
  "iceberg.catalog.uri"="http://iceberg-rest:8181",
  "iceberg.catalog.warehouse"="warehouse",
  "aws.s3.access_key"="admin",
  "aws.s3.secret_key"="password",
  "aws.s3.endpoint"="http://minio:9000",
  "aws.s3.enable_path_style_access"="true"
);
```

```SQL
SHOW CATALOGS\G
```

```SQL
*************************** 1. row ***************************
Catalog: default_catalog
   Type: Internal
Comment: 一个内部 catalog，包含此集群的自管理表。
*************************** 2. row ***************************
Catalog: demo
   Type: Iceberg
Comment: 连接到 MinIO 上的 Apache Iceberg 的外部 catalog。
2 rows in set (0.00 sec)
```

```SQL
SET CATALOG demo;
```

### 创建和使用数据库

```SQL
CREATE DATABASE nyc;
```

```SQL
USE nyc;
```

### 创建表

```SQL
CREATE TABLE demo.nyc.taxis
(
    trip_id            bigint,
    trip_distance      float,
    fare_amount double,
    store_and_fwd_flag string,
    vendor_id          bigint
) PARTITION BY (vendor_id);
```

### 向表中写入数据

```SQL
INSERT INTO demo.nyc.taxis
VALUES (1000371, 1.8, 15.32, 'N', 1),
       (1000372, 2.5, 22.15, 'N', 2),
       (1000373, 0.9, 9.01, 'N', 2),
       (1000374, 8.4, 42.13, 'Y', 1);
```

### 从表中读取数据

```SQL
SELECT *
FROM demo.nyc.taxis;
```

### 验证数据是否存储在对象存储中

当您添加和使用 external catalog 后，StarRocks 开始使用 MinIO 作为 `demo.nyc.taxis` 表的对象存储。如果您访问 http://localhost:9001，然后通过 Object Browser 菜单导航到 `warehouse/nyc/taxis/`，即可确认 StarRocks 正在使用 MinIO 进行存储。

:::tip

MinIO 的用户名和密码位于 `docker-compose.yml` 文件中。您会被提示将密码更改为更安全的密码，但在本教程中请忽略此建议。

![img](../_assets/quick-start/MinIO-Iceberg-data.png)
:::

### 后续步骤

#### 将 Iceberg 添加到 StarRocks

如果您已经拥有 StarRocks 3.2.0 或更高版本的环境，它已内置 Iceberg 1.6.0。无需额外下载或添加 JAR 包。

#### 了解更多

现在您已经成功部署并运行了 Iceberg 和 StarRocks，请查阅 [StarRocks-Iceberg 文档](../data_source/catalog/iceberg/iceberg_catalog.md) 以了解更多信息！
