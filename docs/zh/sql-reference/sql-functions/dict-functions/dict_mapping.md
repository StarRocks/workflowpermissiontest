displayed_sidebar: docs
---

# dict_mapping

将字典表中的指定键映射到值。

该函数主要用于简化全局字典表的应用。在数据导入目标表时，StarRocks 会使用该函数中的输入参数，自动从字典表中获取指定键映射到的值，然后将该值导入目标表。

StarRocks 自 v3.2.5 版本起支持该函数。另外请注意，StarRocks 当前的存算分离模式不支持该函数。

## 语法

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## 参数

- 必选参数：
  - `[<db_name>.]<dict_table>`: 字典表的名称，该表必须是主键表。支持的数据类型为 VARCHAR。
  - `key_column_expr_list`: 字典表中键列的表达式列表，包含一个或多个 `key_column_expr`。`key_column_expr` 可以是字典表中键列的名称，也可以是特定的键或键表达式。

    该表达式列表需要包含字典表的所有主键列，这意味着表达式的总数需要与字典表中的主键列总数匹配。因此，当字典表使用复合主键时，此列表中的表达式需要按顺序与表结构中定义的主键列对应。此列表中的多个表达式用逗号 (`,`) 分隔。如果 `key_column_expr` 是特定的键或键表达式，其类型必须与字典表中对应主键列的类型匹配。

- 可选参数：
  - `<value_column>`: 值列的名称，也是映射列。如果未指定值列，则默认值列为字典表的 AUTO_INCREMENT 列。值列也可以定义为字典表中除自增列和主键之外的任何列。该列的数据类型没有限制。
  - `<null_if_not_exist>`（可选）：当字典表中不存在键时，是否返回。可选值：
    - `true`：如果键不存在，则返回 NULL。
    - `false`（默认）：如果键不存在，则抛出异常。

## 返回值

返回值的 数据类型 与值列的数据类型保持一致。如果值列是字典表的自增列，则返回值的 数据类型 为 BIGINT。

但是，当未找到指定键映射到的值时，如果将 `<null_if_not_exist>` 参数设置为 `true`，则返回 `NULL`。如果将参数设置为 `false`（默认），则返回错误 `query failed if record not exist in dict table`。

## 示例

**示例 1：直接从字典表中查询键映射到的值。**

1. 创建字典表并导入模拟数据。

      ```SQL
      MySQL [test]> CREATE TABLE dict (
          order_uuid STRING,
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid)
      DISTRIBUTED BY HASH (order_uuid);
      Query OK, 0 rows affected (0.02 sec)
      
      MySQL [test]> INSERT INTO dict (order_uuid) VALUES ('a1'), ('a2'), ('a3');
      Query OK, 3 rows affected (0.12 sec)
      {'label':'insert_9e60b0e4-89fa-11ee-a41f-b22a2c00f66b', 'status':'VISIBLE', 'txnId':'15029'}
      
      MySQL [test]> SELECT * FROM dict;
      +------------+--------------+
      | order_uuid | order_id_int |
      +------------+--------------+
      | a1         |            1 |
      | a3         |            3 |
      | a2         |            2 |
      +------------+--------------+
      3 rows in set (0.01 sec)
      ```

      > **注意**
      >
      > 当前 `INSERT INTO` 语句不支持部分列更新。因此，请确保插入到 `dict` 键列中的值没有重复。否则，在字典表中多次插入相同的键列值会导致其在值列中映射的值发生更改。

2. 查询字典表中键 `a1` 映射到的值。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**示例 2：将表中的映射列配置为使用 `dict_mapping` 函数的生成列。这样，StarRocks 可以在 数据导入 到此表时自动获取键映射到的值。**

1. 创建数据表，并将映射列配置为使用 `dict_mapping('dict', order_uuid)` 的生成列。

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- This column records the STRING type order number, corresponding to the order_uuid column in the dict table in Example 1.
        order_uuid STRING,
        batch int comment 'used to distinguish different batch loading',
        -- This column records the BIGINT type order number which mapped with the order_uuid column.
        -- Because this column is a generated column configured with dict_mapping, the values in this column are automatically obtained from the dict table in Example 1 during data loading.
        -- Subsequently, this column can be directly used for deduplication and JOIN queries.
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. 当向此表导入模拟数据，且 `order_id_int` 列配置为 `dict_mapping('dict', 'order_uuid')` 时，StarRocks 会根据 `dict` 表中键与值之间的映射关系，自动将值导入到 `order_id_int` 列。

      ```SQL
      MySQL [test]> INSERT INTO dest_table1(id, order_uuid, batch) VALUES (1, 'a1', 1), (2, 'a1', 1), (3, 'a3', 1), (4, 'a3', 1);
      Query OK, 4 rows affected (0.05 sec)
      {'label':'insert_e191b9e4-8a98-11ee-b29c-00163e03897d', 'status':'VISIBLE', 'txnId':'72'}
      
      MySQL [test]> SELECT * FROM dest_table1;
      +------+------------+-------+--------------+
      | id   | order_uuid | batch | order_id_int |
      +------+------------+-------+--------------+
      |    1 | a1         |     1 |            1 |
      |    4 | a3         |     1 |            3 |
      |    2 | a1         |     1 |            1 |
      |    3 | a3         |     1 |            3 |
      +------+------------+-------+--------------+
      4 rows in set (0.02 sec)
      ```

    此示例中 `dict_mapping` 的使用可以加速[去重计算和 JOIN 查询](../../../using_starrocks/query_acceleration_with_auto_increment.md)。与之前通过构建全局字典来加速精准去重的解决方案相比，使用 `dict_mapping` 的解决方案更灵活、更易用。因为在“将键和值之间的映射关系导入表中”的阶段，映射值是直接从字典表中获取的。您无需编写语句来 JOIN 字典表以获取映射值。此外，此解决方案支持各种数据导入方法。<!--For detailed usage, please refer to xxx.-->

**示例 3：如果表中的映射列未配置为生成列，则在导入数据到表时，需要为映射列显式配置 `dict_mapping` 函数，以获取键映射到的值。**

> **注意**
>
> 示例 3 和示例 2 的区别在于，向数据表导入数据时，您需要修改导入命令，为映射列显式配置 `dict_mapping` 表达式。

1. 创建表。

    ```SQL
    CREATE TABLE dest_table2 (
        id BIGINT,
        order_uuid STRING,
        order_id_int BIGINT NULL,
        batch int comment 'used to distinguish different batch loading'
    )
    DUPLICATE KEY (id, order_uuid, order_id_int)
    DISTRIBUTED BY HASH(id);
    ```

2. 当模拟数据导入到此表时，通过配置 `dict_mapping` 从字典表获取映射值。

    ```SQL
    MySQL [test]> INSERT INTO dest_table2 VALUES (1, 'a1', dict_mapping('dict', 'a1'), 1);
    Query OK, 1 row affected (0.35 sec)
    {'label':'insert_19872ab6-8a96-11ee-b29c-00163e03897d', 'status':'VISIBLE', 'txnId':'42'}

    MySQL [test]> SELECT * FROM dest_table2;
    +------+------------+--------------+-------+
    | id   | order_uuid | order_id_int | batch |
    +------+------------+--------------+-------+
    |    1 | a1         |            1 |     1 |
    +------+------------+--------------+-------+
    1 row in set (0.02 sec)
    ```

**示例 4：启用 `null_if_not_exist` 模式**

当禁用 `<null_if_not_exist>` 模式时，如果查询字典表中不存在的键所映射的值，将返回错误而不是 `NULL`。这确保了数据行的键首先导入到字典表，并在数据行导入到目标表之前生成其映射值（字典 ID）。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**示例 5：如果字典表使用复合主键，则在查询时必须指定所有主键。**

1. 创建具有复合主键的字典表并导入模拟数据。

      ```SQL
      MySQL [test]> CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE,
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- composite primary Key
      DISTRIBUTED BY HASH (order_uuid,order_date)
      ;
      Query OK, 0 rows affected (0.02 sec)
      
      MySQL [test]> INSERT INTO dict2 VALUES ('a1','2023-11-22',default), ('a2','2023-11-22',default), ('a3','2023-11-22',default);
      Query OK, 3 rows affected (0.12 sec)
      {'label':'insert_9e60b0e4-89fa-11ee-a41f-b22a2c00f66b', 'status':'VISIBLE', 'txnId':'15029'}
      
      
      MySQL [test]> select * from dict2;
      +------------+------------+--------------+
      | order_uuid | order_date | order_id_int |
      +------------+------------+--------------+
      | a1         | 2023-11-22 |            1 |
      | a3         | 2023-11-22 |            3 |
      | a2         | 2023-11-22 |            2 |
      +------------+------------+--------------+
      3 rows in set (0.01 sec)
      ```

2. 查询字典表中键映射到的值。因为字典表具有复合主键，所以需要在 `dict_mapping` 中指定所有主键。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   请注意，当仅指定一个主键时，会发生错误。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```
