---
displayed_sidebar: docs
---

# hll_hash

将一个值转换为 HLL 类型。通常在数据导入期间使用，以将源数据中的值映射到 StarRocks 表中的 HLL 列类型。

## 语法

```Haskell
HLL_HASH(column_name)
```

## 参数

`column_name`: 生成的 HLL 列的名称。

## 返回值

返回 HLL 类型的值。

## 示例

```plain text
mysql> select hll_cardinality(hll_hash("a"));
+--------------------------------+
| hll_cardinality(hll_hash('a')) |
+--------------------------------+
|                              1 |
+--------------------------------+