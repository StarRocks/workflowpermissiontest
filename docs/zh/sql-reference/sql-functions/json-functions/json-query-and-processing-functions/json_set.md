---
displayed_sidebar: docs
---

# json_set

在指定的 JSON 路径中插入或更新 JSON 文档中的数据，并返回修改后的 JSON 文档。

:::tip
所有 JSON 函数和运算符均在导航和概述页面中列出。
:::

## 语法

```SQL
json_set(json_object_expr, json_path, value[, json_path, value] ...)
```

## 参数
- `json_object_expr`: 表示 JSON 对象的表达式。该对象可以是 JSON 列，也可以是由 JSON 构造函数（如 **PARSE_JSON**）生成的 JSON 对象。

- `json_path`: 要插入或更新的 JSON 对象中元素的路径。该值必须是字符串。有关 StarRocks 支持的 JSON 路径语法的信息，请参阅 JSON 函数和运算符概述。

- `value`: 要在指定路径中插入或更新的值。它可以是字符串、数字、布尔值、null 或 JSON 对象。

## 返回值
返回修改后的 JSON 文档。

> - 如果任何参数为 *NULL*，则返回 *NULL*。
> - 如果路径存在于 JSON 文档中，则现有值将被更新（替换）。
> - 如果路径不存在，则会插入新值 (Upsert 行为)。
> - 参数从左到右进行评估。第一个路径-值对的结果将成为第二个对的输入。

## 示例

示例 1：将新键插入 JSON 对象。

```Plaintext
mysql> SELECT json_set('{"a": 1}', '$.b', 2);
       -> {"a": 1, "b": 2}
```

示例 2：更新 JSON 对象中的现有键。

```Plaintext
mysql> SELECT json_set('{"a": 1}', '$.a', 10);
       -> {"a": 10}
```

示例 3：执行多个操作（更新一个现有键，插入一个新键）。

```Plaintext
mysql> SELECT json_set('{"a": 1, "b": 2}', '$.a', 10, '$.c', 3);
       -> {"a": 10, "b": 2, "c": 3}
```

示例 4：更新嵌套 JSON 对象中的值。
```Plaintext

mysql> SELECT json_set('{"a": {"x": 1, "y": 2}}', '$.a.x', 100);
       -> {"a": {"x": 100, "y": 2}}
```

示例 5：按索引更新数组中的元素。

```Plaintext
mysql> SELECT json_set('{"arr": [10, 20, 30]}', '$.arr[1]', 99);
       -> {"arr": [10, 99, 30]}
```

示例 6：追加到数组（使用大于数组长度的索引）。

```Plaintext
mysql> SELECT json_set('{"arr": [10, 20]}', '$.arr[5]', 30);
       -> {"arr": [10, 20, 30]}
```

示例 7：插入不同的数据类型（布尔值和 JSON Null）。
要插入 JSON `null` 值，请使用 `parse_json('null')`。传递原始 SQL `NULL` 将为整个结果返回 `NULL`。

```plaintext
mysql> SELECT json_set('{"a": 1}', '$.b', true, '$.c', parse_json('null'));
       -> {"a": 1, "b": true, "c": null}
```

## 使用说明

- `json_set` 函数遵循 MySQL 兼容的行为。
- 它作为 **Upsert**（更新或插入）运行：
    - **INSERT:** 如果路径不存在，则将值添加到文档中。
    - **UPDATE:** 如果路径已存在，则旧值将替换为新值。
- 如果您专门想要*仅*插入（不更新现有值），请使用 `json_insert`。
- 如果您专门想要*仅*更新（不插入新值），请使用 `json_replace`。
- **Null 处理：** 要插入 JSON null 值，请使用 parse_json('null')。将原始 SQL NULL 作为参数传递将导致该函数返回 NULL。
- **注意：** 目前 `json_path` 中不支持通配符（例如 `*` 或 `**`）和数组切片（例如 `[1:3]`）进行修改。如果路径包含这些，则将忽略该路径的更新以确保安全。