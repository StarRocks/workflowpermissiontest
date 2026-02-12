displayed_sidebar: docs

# `dict_mapping`

Returns the value mapped to the specified key in the dictionary table.

This function is primarily used to simplify the application of global dictionary tables. During Data loading into the target table, StarRocks automatically retrieves the value mapped to the specified key from the dictionary table using the input parameters in this function, and then loads that value into the target table.

StarRocks supports this feature starting from v3.2.5. Also note that currently, StarRocks' shared-data mode does not support this feature.

## Syntax

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## Parameters

- Required parameters:
  - `<db_name>.]<dict_table>`: The name of the dictionary table, which must be a Primary Key table. The supported data type is VARCHAR.
  - `key_column_expr_list`: The expression list for the key columns in the dictionary table, including one or more `key_column_exprs`. A `key_column_expr` can be the name of a key column in the dictionary table, or a specific key or key expression.

    This expression list must include all Primary Key columns of the dictionary table, meaning the total number of expressions must match the total number of Primary Key columns in the dictionary table. Therefore, when the dictionary table uses a composite primary key, the expressions in this list must correspond to the Primary Key columns defined in the table schema in order. Multiple expressions in this list are separated by commas (`,`). If a `key_column_expr` is a specific key or key expression, its type must match the type of the corresponding Primary Key column in the dictionary table.

- Optional parameters:
  - `<value_column>`: The name of the value column, which is also the mapped column. If the value column is not specified, the default value column is the AUTO_INCREMENT column of the dictionary table. The value column can also be defined as any column in the dictionary table, excluding AUTO_INCREMENT columns and primary keys. There are no restrictions on the data type of this column.
  - `<null_if_not_exist>` (optional): Whether to return Null if the key does not exist in the dictionary table. Valid values:
    - `true`: Returns Null if the key does not exist.
    - `false` (default): Throws an exception if the key does not exist.

## Return value

The returned data type is consistent with the data type of the value column. If the value column is an AUTO_INCREMENT column of the dictionary table, the returned data type is BIGINT.

However, if no value mapped to the specified key is found, and the `<null_if_not_exist>` parameter is set to `true`, `NULL` is returned. If the parameter is set to `false` (default), the error `query failed if record not exist in dict table` is returned.

## Examples

**Example 1: Directly querying the value mapped to a key in a dictionary table.**

1. Create a dictionary table and load mock data.

      ```SQL
      CREATE TABLE dict (
          order_uuid STRING,
          order_id_int BIGINT AUTO_INCREMENT 
      )
      PRIMARY KEY (order_uuid)
      DISTRIBUTED BY HASH (order_uuid);
      Query OK, 0 rows affected (0.02 sec)
      
      INSERT INTO dict (order_uuid) VALUES ('a1'), ('a2'), ('a3');
      Query OK, 3 rows affected (0.12 sec)
      {'label':'insert_9e60b0e4-89fa-11ee-a41f-b22a2c00f66b', 'status':'VISIBLE', 'txnId':'15029'}
      
      SELECT * FROM dict;
      ```

      ```sql
      +------------+--------------+
      | order_uuid | order_id_int |
      +------------+--------------+
      | a1         |            1 |
      | a3         |            3 |
      | a2         |            2 |
      +------------+--------------+
      3 rows in set (0.01 sec)
      ```

      > **Note**
      >
      > Currently, `INSERT INTO` statements do not support partial update. Therefore, ensure that the values inserted into the key columns of `dict` are not duplicated. Otherwise, inserting the same key column values multiple times into the dictionary table will cause their mapped values in the value column to change.

2. Query the value mapped to key `a1` in the dictionary table.

    ```SQL
    SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**Example 2: A mapped column in the table is configured as a generated column using the `dict_mapping` function. Therefore, when Data loading into this table, StarRocks can automatically retrieve the value mapped to the key.**

1. Create a data table and configure the mapped column as a generated column by using `dict_mapping('dict', order_uuid)`.

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- This column records order numbers of STRING type, corresponding to the order_uuid column in the `dict` table in Example 1.
        order_uuid STRING, 
        batch int comment 'used to distinguish different batch loading',
        -- This column records order numbers of BIGINT type mapped to the order_uuid column.
        -- Since this column is a generated column configured using `dict_mapping`, the values in this column are automatically retrieved from the `dict` table in Example 1 during Data loading.
        -- Subsequently, this column can be directly used for distinct count and JOIN queries.
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. When mock data is loaded into this table, where the `order_id_int` column is configured as `dict_mapping('dict', 'order_uuid')`, StarRocks automatically loads values into the `order_id_int` column based on the mapping relationship between keys and values in the `dict` table.

      ```SQL
      INSERT INTO dest_table1(id, order_uuid, batch) VALUES (1, 'a1', 1), (2, 'a1', 1), (3, 'a3', 1), (4, 'a3', 1);
      Query OK, 4 rows affected (0.05 sec) 
      {'label':'insert_e191b9e4-8a98-11ee-b29c-00163e03897d', 'status':'VISIBLE', 'txnId':'72'}
      
      SELECT * FROM dest_table1;
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

    Using `dict_mapping` in this example can accelerate [distinct count and JOIN queries](../../../using_starrocks/query_acceleration_with_auto_increment.md). Compared to previous solutions that built global dictionaries to accelerate exact distinct count, the `dict_mapping` solution is more flexible and user-friendly. This is because mapped values are directly retrieved from the dictionary table during the stage of "loading the mapping relationship between keys and values into the table." You do not need to write statements to join the dictionary table to obtain mapped values. Additionally, this solution supports various Data loading methods.<!--For detailed usage, please refer to xxx.-->

**Example 3: If a mapped column in the table is not configured as a generated column, you need to explicitly configure the `dict_mapping` function for the mapped column during Data loading into the table to obtain the value mapped to the key.**

> **Note**
>
> The difference between Example 3 and Example 2 is that when importing into the data table, you need to modify the import command to explicitly configure the `dict_mapping` expression for the mapped column.

1. Create a table.

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

2. When mock data is loaded into this table, you can obtain the mapped values from the dictionary table by configuring `dict_mapping`.

    ```SQL
    INSERT INTO dest_table2 VALUES (1, 'a1', dict_mapping('dict', 'a1'), 1);
    Query OK, 1 row affected (0.35 sec)
    {'label':'insert_19872ab6-8a96-11ee-b29c-00163e03897d', 'status':'VISIBLE', 'txnId':'42'}

    SELECT * FROM dest_table2;
    +------+------------+--------------+-------+
    | id   | order_uuid | order_id_int | batch |
    +------+------------+--------------+-------+
    |    1 | a1         |            1 |     1 |
    +------+------------+--------------+-------+
    1 row in set (0.02 sec)
    ```

**Example 4: Enable null_if_not_exist mode**

When the `<null_if_not_exist>` mode is disabled, and the value mapped to a non-existent key in the dictionary table is queried, an error is returned instead of `NULL`. This ensures that the key for a data row is first loaded into the dictionary table, and its mapped value (dictionary ID) is generated before that data row is loaded into the target table.

```SQL
SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**Example 5: If the dictionary table uses a composite primary key, all primary keys must be specified in the query.**

1. Create a dictionary table with a composite primary key and load mock data into it.

      ```SQL
      CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE, 
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- Composite primary key
      DISTRIBUTED BY HASH (order_uuid,order_date)
      ;
      Query OK, 0 rows affected (0.02 sec)
      
      INSERT INTO dict2 VALUES ('a1','2023-11-22',default), ('a2','2023-11-22',default), ('a3','2023-11-22',default);
      Query OK, 3 rows affected (0.12 sec)
      {'label':'insert_9e60b0e4-89fa-11ee-a41f-b22a2c00f66b', 'status':'VISIBLE', 'txnId':'15029'}
      
      
      select * from dict2;
      +------------+------------+--------------+
      | order_uuid | order_date | order_id_int |
      +------------+------------+--------------+
      | a1         | 2023-11-22 |            1 |
      | a3         | 2023-11-22 |            3 |
      | a2         | 2023-11-22 |            2 |
      +------------+------------+--------------+
      3 rows in set (0.01 sec)
      ```

2. Query the value mapped to the key in the dictionary table. Since the dictionary table has a composite primary key, all primary keys must be specified in `dict_mapping`.

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   Note that if only one primary key is specified, an error will occur.

      ```SQL
      SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```
