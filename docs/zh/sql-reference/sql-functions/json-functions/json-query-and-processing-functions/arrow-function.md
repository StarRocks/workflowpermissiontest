---
displayed_sidebar: docs
---

# Arrow function

查询 JSON 对象中可以通过 `json_path` 表达式定位的元素，并返回 JSON 值。 箭头函数 `->` 比 [json_query](json_query.md) 函数更简洁且易于使用。

:::tip
所有 JSON 函数和 `Operator` 都列在导航栏和 [概述页面](../overview-of-json-functions-and-operators.md) 上。

通过 [generated columns](../../../sql-statements/generated_columns.md) 加速查询
:::

## Syntax

```Haskell
json_object_expr -> json_path
```

## Parameters

- `json_object_expr`: 表示 JSON 对象的表达式。 该对象可以是 JSON 列，也可以是由 JSON 构造函数（如 PARSE_JSON）生成的 JSON 对象。

- `json_path`: 表示 JSON 对象中元素路径的表达式。 此参数的值是一个字符串。 有关 StarRocks 支持的 JSON 路径语法的信息，请参见 [JSON 函数和 `Operator` 概述](../overview-of-json-functions-and-operators.md)。

## Return value

返回一个 JSON 值。

> 如果该元素不存在，则箭头函数返回一个 `NULL` 的 SQL 值。

## Examples

示例 1：查询指定 JSON 对象中可以通过 `'$.a.b'` 表达式定位的元素。

```plaintext
mysql> SELECT parse_json('{"a": {"b": 1}}') -> '$.a.b';

       -> 1
```

示例 2：使用嵌套的箭头函数来查询元素。 嵌套另一个箭头函数的箭头函数基于嵌套箭头函数返回的结果查询元素。

> 在此示例中，根元素 $ 从 `json_path` 表达式中省略。

```plaintext
mysql> SELECT parse_json('{"a": {"b": 1}}')->'a'->'b';

       -> 1
```

示例 3：查询指定 JSON 对象中可以通过 `'a'` 表达式定位的元素。

> 在此示例中，根元素 $ 从 `json_path` 表达式中省略。

```plaintext
mysql> SELECT parse_json('{"a": "b"}') -> 'a';

       -> "b"
```