---
displayed_sidebar: docs
---

# json_each

将 JSON 对象的外部元素展开为两列中保存的键值对集合，并返回一个表，该表由每个元素的一行组成。

:::tip
所有 JSON 函数和运算符均在导航栏和 [概述页面](../overview-of-json-functions-and-operators.md) 上列出。

使用 [generated columns](../../../sql-statements/generated_columns.md) 加速查询
:::

## 语法

```Haskell
json_each(json_object_expr)
```

## 参数

`json_object_expr`: 表示 JSON 对象的表达式。 该对象可以是 JSON 列，也可以是由 JSON 构造函数（如 PARSE_JSON）生成的 JSON 对象。

## 返回值

返回两列：一列名为 key，另一列名为 value。 key 列存储 VARCHAR 值，value 列存储 JSON 值。

## 使用说明

json_each 函数是一个表函数，返回一个表。 返回的表是由多行组成的结果集。 因此，必须在 FROM 子句中使用 lateral join 将返回的表连接到原始表。 lateral join 是强制性的，但 LATERAL 关键字是可选的。 json_each 函数不能在 SELECT 子句中使用。

## 示例

```plaintext
-- 一个名为 tj 的表用作示例。 在 tj 表中，j 列是一个 JSON 对象。
mysql> SELECT * FROM tj;
+------+------------------+
| id   | j                |
+------+------------------+
|    1 | {"a": 1, "b": 2} |
|    3 | {"a": 3}         |
+------+------------------+

-- 通过键和值将 tj 表的 j 列展开为两列，以获得由多行组成的结果集。 在此示例中，LATERAL 关键字用于将结果集连接到 tj 表。

mysql> SELECT * FROM tj, LATERAL json_each(j);
+------+------------------+------+-------+
| id   | j                | key  | value |
+------+------------------+------+-------+
|    1 | {"a": 1, "b": 2} | a    | 1     |
|    1 | {"a": 1, "b": 2} | b    | 2     |
|    3 | {"a": 3}         | a    | 3     |
+------+------------------+------+-------+
```