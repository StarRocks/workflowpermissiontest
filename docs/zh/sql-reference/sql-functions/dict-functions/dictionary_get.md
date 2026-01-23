---
displayed_sidebar: docs
---

# dictionary_get

查询字典对象中 key 映射的值。

## 语法

```SQL
dictionary_get('dictionary_object_name', key_expression_list, [NULL_IF_NOT_EXIST])

key_expression_list ::=
    key_expression [, ...]

key_expression ::=
    column_name | const_value
```

## 参数

- `dictionary_name`: 字典对象的名称。
- `key_expression_list`: 所有 key 列的表达式列表。 它可以是列名列表或值列表。
- `NULL_IF_NOT_EXIST` (可选): 如果字典缓存中不存在 key，是否返回 Null。有效值：
  - `true`: 如果 key 不存在，则返回 Null。
  - `false` (默认): 如果 key 不存在，则抛出异常。

## 返回值

返回 STRUCT 类型的 value 列的值。 因此，您可以使用 `[N]` 或 `.<column_name>` 来指定特定列的值。 `N` 表示列的位置，从 1 开始。

## 示例

以下示例使用 [dict_mapping](dict_mapping.md) 中的数据集。

- 示例 1：查询字典对象 `dict_obj` 中 key 列 `order_uuid` 映射的 value 列的值。

    ```Plain
    MySQL > SELECT dictionary_get('dict_obj', order_uuid) FROM dict;
    +--------------------+
    | DICTIONARY_GET     |
    +--------------------+
    | {"order_id_int":1} |
    | {"order_id_int":3} |
    | {"order_id_int":2} |
    +--------------------+
    3 rows in set (0.02 sec)
    ```

- 示例 2：查询字典对象 `dict_obj` 中 key `a1` 映射的 value 列的值。

    ```Plain
    MySQL > SELECT dictionary_get("dict_obj", "a1");
    +--------------------+
    | DICTIONARY_GET     |
    +--------------------+
    | {"order_id_int":1} |
    +--------------------+
    1 row in set (0.01 sec)
    ```

- 示例 3：查询字典对象 `dimension_obj` 中 key `1` 映射的 value 列的值。

    ```Plain
    MySQL > SELECT dictionary_get("dimension_obj", 1);
    +-----------------------------------------------------------------------------------------------------------------+
    | DICTIONARY_GET                                                                                                  |
    +-----------------------------------------------------------------------------------------------------------------+
    | {"ProductName":"T-Shirt","Category":"Apparel","SubCategory":"Shirts","Brand":"BrandA","Color":"Red","Size":"M"} |
    +-----------------------------------------------------------------------------------------------------------------+
    1 row in set (0.01 sec)
    ```

- 示例 4：查询字典对象 `dimension_obj` 中 key `1` 映射的第一个 value 列的值。

    ```Plain
    MySQL > SELECT dictionary_get("dimension_obj", 1)[1];
    +-------------------+
    | DICTIONARY_GET[1] |
    +-------------------+
    | T-Shirt           |
    +-------------------+
    1 row in set (0.01 sec)
    ```

- 示例 5：查询字典对象 `dimension_obj` 中 key `1` 映射的第二个 value 列的值。

    ```Plain
    MySQL > SELECT dictionary_get("dimension_obj", 1)[2];
    +-------------------+
    | DICTIONARY_GET[2] |
    +-------------------+
    | Apparel           |
    +-------------------+
    1 row in set (0.01 sec)
    ```

- 示例 6：查询字典对象 `dimension_obj` 中 key `1` 映射的 `ProductName` value 列的值。

    ```Plain
    MySQL > SELECT dictionary_get("dimension_obj", 1).ProductName;
    +----------------------------+
    | DICTIONARY_GET.ProductName |
    +----------------------------+
    | T-Shirt                    |
    +----------------------------+
    1 row in set (0.01 sec)
    ```