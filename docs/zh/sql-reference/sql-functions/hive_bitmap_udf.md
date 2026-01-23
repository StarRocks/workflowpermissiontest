displayed_sidebar: docs
sidebar_position: 0.9
```

# Hive Bitmap UDF

Hive Bitmap UDF 提供了一系列可以直接在 Hive 中使用的 UDF。 这些 UDF 可以用于生成 Bitmap 数据以及执行 Bitmap 相关的计算。

Hive Bitmap UDF 定义的 Bitmap 格式与 StarRocks 中的格式一致，可以直接用于将 Bitmap 数据导入到 StarRocks 中，以及将 Bitmap 数据从 StarRocks 导出到 Hive。

适用场景：

- 原始数据量大，直接将这些数据导入到 StarRocks 进行计算，会对 StarRocks 集群造成巨大的压力。 期望的解决方案是在 Hive 中生成 Bitmap 数据，然后将 Bitmap 导入到 StarRocks 中。
- 将在 StarRocks 中生成的 Bitmap 数据导出到 Hive，以供其他系统使用。

支持的源和目标数据类型：

- v3.1 及更高版本支持加载和卸载以下类型的数据：String、Base64 和 Binary。
- v2.5 和 v3.0 仅支持加载和卸载 String 和 Base64 数据。

## 可以生成的 Hive Bitmap UDF

- com.starrocks.hive.udf.UDAFBitmapAgg

  将一列中的多行非空值合并为一行 Bitmap 值，等效于 StarRocks 的内置聚合函数 [bitmap_agg](bitmap-functions/bitmap_agg.md)。

- com.starrocks.hive.udf.UDAFBitmapUnion

  计算一组 Bitmap 的并集，等效于 StarRocks 的内置聚合函数 [bitmap_union](bitmap-functions/bitmap_union.md)。

- com.starrocks.hive.udf.UDFBase64ToBitmap

  将 base64 编码的字符串转换为 Bitmap，等效于 StarRocks 的内置函数 [base64_to_bitmap](bitmap-functions/base64_to_bitmap.md)。

- com.starrocks.hive.udf.UDFBitmapAnd

  计算两个 Bitmap 的交集，等效于 StarRocks 的内置函数 [bitmap_and](bitmap-functions/bitmap_and.md)。

- com.starrocks.hive.udf.UDFBitmapCount

  计算 Bitmap 中的值的数量，等效于 StarRocks 的内置函数 [bitmap_count](bitmap-functions/bitmap_count.md)。

- com.starrocks.hive.udf.UDFBitmapFromString

  将逗号分隔的字符串转换为 Bitmap，等效于 StarRocks 的内置函数 [bitmap_from_string](bitmap-functions/bitmap_from_string.md)。

- com.starrocks.hive.udf.UDFBitmapOr

  计算两个 Bitmap 的并集，等效于 StarRocks 的内置函数 [bitmap_or](bitmap-functions/bitmap_or.md)。

- com.starrocks.hive.udf.UDFBitmapToBase64

  将 Bitmap 转换为 Base64 字符串，等效于 StarRocks 的内置函数 [bitmap_to_base64](bitmap-functions/bitmap_to_base64.md)。

- com.starrocks.hive.udf.UDFBitmapToString

  将 Bitmap 转换为逗号分隔的字符串，等效于 StarRocks 的内置函数 [bitmap_to_string](bitmap-functions/bitmap_to_string.md)。

- com.starrocks.hive.udf.UDFBitmapXor

  计算两个 Bitmap 中唯一元素的集合，等效于 StarRocks 的内置函数 [bitmap_xor](bitmap-functions/bitmap_xor.md)。

## 如何使用

1. 在 FE 上编译并生成 Hive UDF。

   ```bash
   ./build.sh --hive-udf
   ```

   JAR 包 `hive-udf-*.jar` 将在 `fe/hive-udf/` 目录中生成。

2. 将 JAR 包上传到 HDFS。

   ```bash
   hadoop  fs -put -f ./hive-udf-*.jar hdfs://<hdfs_ip>:<hdfs_port>/hive-udf-*.jar
   ```

3. 将 JAR 包加载到 Hive。

   ```sql
   hive> add jar hdfs://<hdfs_ip>:<hdfs_port>/hive-udf-*.jar;
   ```

4. 加载 UDF 函数。

   ```sql
   hive> create temporary function bitmap_agg as 'com.starrocks.hive.udf.UDAFBitmapAgg';
   hive> create temporary function bitmap_union as 'com.starrocks.hive.udf.UDAFBitmapUnion';
   hive> create temporary function base64_to_bitmap as 'com.starrocks.hive.udf.UDFBase64ToBitmap';
   hive> create temporary function bitmap_and as 'com.starrocks.hive.udf.UDFBitmapAnd';
   hive> create temporary function bitmap_count as 'com.starrocks.hive.udf.UDFBitmapCount';
   hive> create temporary function bitmap_from_string as 'com.starrocks.hive.udf.UDFBitmapFromString';
   hive> create temporary function bitmap_or as 'com.starrocks.hive.udf.UDFBitmapOr';
   hive> create temporary function bitmap_to_base64 as 'com.starrocks.hive.udf.UDFBitmapToBase64';
   hive> create temporary function bitmap_to_string as 'com.starrocks.hive.udf.UDFBitmapToString';
   hive> create temporary function bitmap_xor as 'com.starrocks.hive.udf.UDFBitmapXor';
   ```

## 使用示例

### 在 Hive 中生成 Bitmap 并以 Binary 格式加载到 StarRocks 中

1. 创建一个 Hive 源表。

   ```sql
   hive> create table t_src(c1 bigint, c2 bigint) stored as parquet;

   hive> insert into t_src values (1,1), (1,2), (1,3), (2,4), (2,5);

   hive> select * from t_src;
   1       1
   1       2
   1       3
   2       4
   2       5
   ```

2. 创建一个 Hive Bitmap 表。

   ```sql
   hive> create table t_bitmap(c1 bigint, c2 binary) stored as parquet;
   ```

   Hive 通过 UDFBitmapAgg 生成 Bitmap 并将其写入 Bitmap 表。

   ```sql
   hive> insert into t_bitmap select c1, bitmap_agg(c2) from t_src group by c1;
   ```

3. 创建一个 StarRocks Bitmap 表。

   ```sql
   mysql> create table t1(c1 int, c2 bitmap bitmap_union) aggregate key(c1)  distributed by hash(c1);
   ```

4. 以不同的方式将 Bitmap 数据加载到 StarRocks 中。

   - 通过 [files](table-functions/files.md) 函数加载数据。

   ```sql
   mysql> insert into t1 select c1, bitmap_from_binary(c2) from files (
       "path" = "hdfs://<hdfs_ip>:<hdfs_port>/<hdfs_db>/t_bitmap/*",
       "format"="parquet",
       "compression" = "uncompressed"
       );
   ```

   - 通过 [Hive Catalog] (../../data_source/catalog/hive_catalog.md) 加载数据。

   ```sql
   mysql> insert into t1 select c1, bitmap_from_binary(c2) from hive_catalog_hms.xxx_db.t_bitmap;
   ```

5. 查看结果。

   ```sql
   mysql> select c1, bitmap_to_string(c2) from t1;                                                                                                                                                                                                                                   
   +------+----------------------+                                                                                                                                                                                                                                                   
   | c1   | bitmap_to_string(c2) |
   +------+----------------------+
   |    1 | 1,2,3                |
   |    2 | 4,5                  |
   +------+----------------------+
   ```

### 将 Bitmap 从 StarRocks 导出到 Hive

1. 在 StarRocks 中创建一个 Bitmap 表，并将数据写入该表。

   ```sql
   mysql> create table t1(c1 int, c2 bitmap bitmap_union) aggregate key(c1) buckets 3 distributed by hash(c1);

   mysql> select c1, bitmap_to_string(c2) from t1;                                                                                                                                                                                                                                   
   +------+----------------------+                                                                                                                                                                                                                                                   
   | c1   | bitmap_to_string(c2) |
   +------+----------------------+
   |    1 | 1,2,3                |
   |    2 | 4,5                  |
   +------+----------------------+
   ```

2. 在 Hive 中创建一个 Bitmap 表。

   ```sql
   hive> create table t_bitmap(c1 bigint, c2 binary) stored as parquet;
   ```

3. 以不同的方式导出数据。

   - 通过 INSERT INTO FILES 导出数据（Binary 格式）。

   ```sql
   mysql> insert into files (
       "path" = "hdfs://<hdfs_ip>:<hdfs_port>/<hdfs_db>/t_bitmap/",
       "format"="parquet",
       "compression" = "uncompressed"
   ) select c1, bitmap_to_binary(c2) as c2 from t1;
   ```

   - 通过 [Hive Catalog] (../../data_source/catalog/hive_catalog.md) 导出数据（Binary 格式）。

   ```sql
   mysql> insert into hive_catalog_hms.<hdfs_db>.t_bitmap select c1, bitmap_to_binary(c2) from t1;
   ```

4. 在 Hive 中查看结果。

   ```plain
   hive> select c1, bitmap_to_string(c2) from t_bitmap;
   1       1,2,3
   2       4,5
   ```