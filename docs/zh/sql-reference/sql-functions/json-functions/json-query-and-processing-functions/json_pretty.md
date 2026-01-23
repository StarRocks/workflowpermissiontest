---
displayed_sidebar: docs
---

# json_pretty

将 JSON 文档格式化为易于阅读的缩进字符串格式。此函数对于调试或以人类可读的结构显示 JSON 数据非常有用。

:::tip
所有 JSON 函数和运算符均在导航栏和概述页面中列出。
:::

## 语法

```SQL
json_pretty(json_object_expr)
```

## 参数
- `json_object_expr`: 表示 JSON 对象的表达式。该对象可以是 JSON 列、包含有效 JSON 的字符串或由 JSON 构造函数（如 PARSE_JSON）生成的 JSON 对象。

## 返回值
以字符串形式返回格式化的 JSON 文档。

> - 如果参数为 NULL，则返回 NULL。
> - 返回的字符串包括用于缩进的换行符和空格。
> - 对象键在输出中按字母顺序排序。

## 示例

示例 1：格式化一个简单的 JSON 对象。

```Plaintext
mysql> SELECT json_pretty('{"b": 2, "a": 1}');
       -> {
            "a": 1,
            "b": 2
          }
```

示例 2：格式化一个 JSON 数组。

```Plaintext
mysql> SELECT json_pretty('[1, 2, 3]');
       -> [
            1,
            2,
            3
          ]
```

示例 3：格式化一个嵌套的 JSON 结构。

```Plaintext
mysql> SELECT json_pretty('{"level1": {"level2": {"level3": "value"}}}');
       -> {
            "level1": {
              "level2": {
                "level3": "value"
              }
            }
          }
```

示例 4：与包含 JSON 数据的表列一起使用。

```Plaintext

mysql> CREATE TABLE json_test (id INT, data JSON);
mysql> INSERT INTO json_test VALUES (1, parse_json('{"name": "Alice", "details": {"age": 25, "city": "NYC"}}'));
mysql> SELECT json_pretty(data) FROM json_test;
       -> {
            "details": {
              "age": 25,
              "city": "NYC"
            },
            "name": "Alice"
          }
```

## 使用说明
- **缩进：** 该函数添加标准缩进（空格）和换行符，以使 JSON 结构可视化。
- **键排序：** JSON 对象键在输出字符串中按字母顺序排序。这是底层 JSON 处理库 (VelocyPack) 的标准行为。
- **NULL 处理：** 如果输入为 SQL NULL，则该函数返回 NULL。
- **数据类型：** 它支持格式化标准 JSON 类型，包括对象、数组、字符串、数字、布尔值和 Null。