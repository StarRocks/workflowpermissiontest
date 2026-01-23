---
displayed_sidebar: docs
---

# parse_json

将字符串转换为 JSON 值。

:::tip
所有 JSON 函数和运算符均在导航栏和 [概述页面](../overview-of-json-functions-and-operators.md) 中列出。

通过 [生成列](../../../sql-statements/generated_columns.md) 加速查询
:::

## 语法

```Haskell
parse_json(string_expr)
```

## 参数

`string_expr`: 表示字符串的表达式。仅支持 STRING、VARCHAR 和 CHAR 数据类型。

## 返回值

返回 JSON 值。

> 注意：如果字符串无法解析为标准 JSON 值，则 PARSE_JSON 函数返回 `NULL`（参见示例 5）。有关 JSON 规范的信息，请参见 [RFC 7159](https://tools.ietf.org/html/rfc7159?spm=a2c63.p38356.0.0.14d26b9fcp7fcf#page-4)。

## 示例

示例 1：将 `1` 的 STRING 值转换为 `1` 的 JSON 值。

```plaintext
mysql> SELECT parse_json('1');
+-----------------+
| parse_json('1') |
+-----------------+
| "1"             |
+-----------------+
```

示例 2：将 STRING 数据类型的数组转换为 JSON 数组。

```plaintext
mysql> SELECT parse_json('[1,2,3]');
+-----------------------+
| parse_json('[1,2,3]') |
+-----------------------+
| [1, 2, 3]             |
+-----------------------+ 
```

示例 3：将 STRING 数据类型的对象转换为 JSON 对象。

```plaintext
mysql> SELECT parse_json('{"star": "rocks"}');
+---------------------------------+
| parse_json('{"star": "rocks"}') |
+---------------------------------+
| {"star": "rocks"}               |
+---------------------------------+
```

示例 4：构造一个 `NULL` 的 JSON 值。

```plaintext
mysql> SELECT parse_json('null');
+--------------------+
| parse_json('null') |
+--------------------+
| "null"             |
+--------------------+
```

示例 5：如果字符串无法解析为标准 JSON 值，则 PARSE_JSON 函数返回 `NULL`。在此示例中，`star` 未用双引号 (") 括起来。因此，PARSE_JSON 函数返回 `NULL`。

```plaintext
mysql> SELECT parse_json('{star: "rocks"}');
+-------------------------------+
| parse_json('{star: "rocks"}') |
+-------------------------------+
| NULL                          |
+-------------------------------+
```

示例 6：如果 JSON 键包含“.”，例如“a.1”，则必须使用“\\”对其进行转义，或者需要将整个键值以及双引号括在单引号中。

```plaintext
mysql> select parse_json('{"b":4, "a.1": "1"}')->"a\\.1";
+--------------------------------------------+
| parse_json('{"b":4, "a.1": "1"}')->'a\\.1' |
+--------------------------------------------+
| "1"                                        |
+--------------------------------------------+
mysql> select parse_json('{"b":4, "a.1": "1"}')->'"a.1"';
+--------------------------------------------+
| parse_json('{"b":4, "a.1": "1"}')->'"a.1"' |
+--------------------------------------------+
| "1"                                        |
+--------------------------------------------+
```

## Keywords

parse_json, parse json