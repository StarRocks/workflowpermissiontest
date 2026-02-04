---
displayed_sidebar: docs
---

# dict_mapping

返回字典表中与指定键映射的值。

此函数简化了全局字典表的应用。在将数据导入到目标表期间，StarRocks 会通过使用此函数中的输入参数，自动从字典表中获取与指定键映射的值，然后将该值加载到目标表中。

自 v3.2.5 起，StarRocks 支持此函数。另请注意，目前 StarRocks 的存算分离模式不支持此函数。
## 语法

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```
## 参数

- 必选参数：
  - `[<db_name>.]<dict_table>`：字典表的名称，必须是主键表。支持的数据类型为 VARCHAR。
  - `key_column_expr_list`：字典表中键列的表达式列表，包括一个或多个 `key_column_expr`。`key_column_expr` 可以是字典表中键列的名称，也可以是特定的键或键表达式。

    此表达式列表需要包含字典表的所有主键列，这意味着表达式的总数需要与字典表中的主键列总数相匹配。因此，当字典表使用组合主键时，此列表中的表达式需要按顺序与表结构中定义的主键列相对应。此列表中的多个表达式用逗号 (`,`) 分隔。并且如果 `key_column_expr` 是特定的键或键表达式，则其类型必须与字典表中相应主键列的类型相匹配。

- 可选参数：
  - `<value_column>`：值列的名称，也就是映射列。如果未指定值列，则默认值列是字典表的自增列。值列也可以定义为字典表中的任何列，但自增列和主键除外。该列的数据类型没有限制。
  - `<null_if_not_exist>`（可选）：如果字典表中不存在键，是否返回 NULL。有效值：
    - `true`：如果键不存在，则返回 NULL。
    - `false`（默认）：如果键不存在，则抛出异常。
## 返回值

返回值的数据类型与值列的数据类型保持一致。如果值列是字典表的自增列，则返回的数据类型为 BIGINT。

但是，当找不到指定 key 映射的值时，如果将 `<null_if_not_exist>` 参数设置为 `true`，则返回 `NULL`。如果该参数设置为 `false`（默认），则返回错误 `query failed if record not exist in dict table`。
## 示例

**示例 1：直接从字典表中查询 key 映射的值。**

1. 创建一个字典表并加载模拟数据。

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
      > 目前 `INSERT INTO` 语句不支持部分更新。因此，请确保插入到 `dict` 的 key 列中的值不重复。否则，在字典表中多次插入相同的 key 列值会导致其在 value 列中的映射值发生变化。

2. 查询字典表中 key `a1` 映射的值。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**示例 2：表中的映射列配置为使用 `dict_mapping` 函数的生成列。因此，在将数据加载到此表中时，StarRocks 可以自动获取 key 映射的值。**

1. 创建一个数据表，并通过使用 `dict_mapping('dict', order_uuid)` 将映射列配置为生成列。

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- 此列记录 STRING 类型的订单号，对应于示例 1 中 dict 表中的 order_uuid 列。
        order_uuid STRING, 
        batch int comment '用于区分不同的批量加载',
        -- 此列记录与 order_uuid 列映射的 BIGINT 类型的订单号。
        -- 因为此列是使用 dict_mapping 配置的生成列，所以此列中的值在数据加载期间自动从示例 1 中的 dict 表中获取。
        -- 随后，此列可以直接用于去重和 JOIN 查询。
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. 当将模拟数据加载到此表中（其中 `order_id_int` 列配置为 `dict_mapping('dict', 'order_uuid')`）时，StarRocks 会根据 `dict` 表中 key 和值之间的映射关系自动将值加载到 `order_id_int` 列中。

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

    本示例中 `dict_mapping` 的使用可以加速 [去重计算和 JOIN 查询](../../../using_starrocks/query_acceleration_with_auto_increment.md)。与之前构建全局字典来加速精准去重的解决方案相比，使用 `dict_mapping` 的解决方案更加灵活和用户友好。因为映射值是在“将 key 和值之间的映射关系加载到表”的阶段直接从字典表中获取的。您无需编写语句来连接字典表以获取映射值。此外，此解决方案支持各种数据导入方法。<!--For detailed usage, please refer to xxx.-->

**示例 3：如果表中的映射列未配置为生成列，则在将数据加载到表中时，您需要为映射列显式配置 `dict_mapping` 函数，以获取 key 映射的值。**

> **注意**
>
> 示例 3 和示例 2 之间的区别在于，导入到数据表时，您需要修改导入命令，以便为映射列显式配置 `dict_mapping` 表达式。

1. 创建表。

    ```SQL
    CREATE TABLE dest_table2 (
        id BIGINT,
        order_uuid STRING,
        order_id_int BIGINT NULL,
        batch int comment '用于区分不同的批量加载'
    )
    DUPLICATE KEY (id, order_uuid, order_id_int)
    DISTRIBUTED BY HASH(id);
    ```

2. 当模拟数据加载到此表中时，您可以通过配置 `dict_mapping` 从字典表中获取映射的值。

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

**示例 4：启用 null_if_not_exist 模式**

当禁用 `<null_if_not_exist>` 模式并且查询在字典表中不存在的 key 映射的值时，将返回错误而不是 `NULL`。它确保数据行的 key 首先加载到字典表中，并且在将该数据行加载到目标表之前生成其映射的值（字典 ID）。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**示例 5：如果字典表使用复合主键，则查询时必须指定所有主键。**

1. 创建一个具有复合主键的字典表，并将模拟数据加载到其中。

      ```SQL
      MySQL [test]> CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE, 
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- 复合主键
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

2. 查询字典表中 key 映射的值。由于字典表具有复合主键，因此需要在 `dict_mapping` 中指定所有主键。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   请注意，如果仅指定一个主键，则会发生错误。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```