---
displayed_sidebar: docs
---

# json_remove

从 JSON 文档中删除一个或多个指定 JSON 路径的数据，并返回修改后的 JSON 文档。

:::tip
所有 JSON 函数和运算符均在导航栏和 [概述页面](../overview-of-json-functions-and-operators.md) 上列出。
:::

## 语法

```Haskell
json_remove(json_object_expr, json_path[, json_path] ...)
```

## 参数

- `json_object_expr`: 表示 JSON 对象的表达式。该对象可以是 JSON 列，也可以是由 JSON 构造函数（如 PARSE_JSON）生成的 JSON 对象。

- `json_path`: 一个或多个表达式，表示要删除的 JSON 对象中元素的路径。每个参数的值都是一个字符串。有关 StarRocks 支持的 JSON 路径语法的信息，请参见 [JSON 函数和运算符概述](../overview-of-json-functions-and-operators.md)。

## 返回值

返回删除了指定路径的 JSON 文档。

> - 如果路径在 JSON 文档中不存在，则忽略该路径。
> - 如果提供了无效路径，则忽略该路径。
> - 如果所有路径都无效或不存在，则返回原始 JSON 文档，不作任何更改。

## 示例

示例 1：从 JSON 对象中删除单个键。

```plaintext
mysql> SELECT json_remove('{"a": 1, "b": [10, 20, 30]}', '$.a');

       -> {"b": [10, 20, 30]}
```

示例 2：从 JSON 对象中删除多个键。

```plaintext
mysql> SELECT json_remove('{"a": 1, "b": [10, 20, 30], "c": "test"}', '$.a', '$.c');

       -> {"b": [10, 20, 30]}
```

示例 3：从 JSON 对象中删除数组元素。

```plaintext
mysql> SELECT json_remove('{"a": 1, "b": [10, 20, 30]}', '$.b[1]');

       -> {"a": 1, "b": [10, 30]}
```

示例 4：删除嵌套对象属性。

```plaintext
mysql> SELECT json_remove('{"a": {"x": 1, "y": 2}, "b": 3}', '$.a.x');

       -> {"a": {"y": 2}, "b": 3}
```

示例 5：尝试删除不存在的路径（已忽略）。

```plaintext
mysql> SELECT json_remove('{"a": 1, "b": 2}', '$.c', '$.d');

       -> {"a": 1, "b": 2}
```

示例 6：删除包括不存在路径的多个路径。

```plaintext
mysql> SELECT json_remove('{"a": 1, "b": 2, "c": 3}', '$.a', '$.nonexistent', '$.c');

       -> {"b": 2}
```

## 使用须知

- `json_remove` 函数遵循 MySQL 兼容的行为。
- 无效的 JSON 路径将被静默忽略，而不会导致错误。
- 该函数支持在单个操作中删除多个路径，这比多个单独的操作更有效。
- 目前，该函数支持简单的对象键删除（例如，`$.key`）。当前实现中对复杂嵌套路径和数组元素删除的支持可能有限。