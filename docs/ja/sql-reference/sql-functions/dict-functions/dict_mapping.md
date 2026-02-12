---
displayed_sidebar: docs
---

# dict_mapping

ディクショナリテーブル内の指定されたキーにマップされた値。

この関数は主に、グローバル辞書テーブルの適用を簡素化するために使用されます。ターゲットテーブルへのデータロード中に、StarRocks はこの関数の入力パラメータを使用してディクショナリテーブルから指定されたキーにマップされた値を自動的に取得し、その値をターゲットテーブルにロードします。

v3.2.5 以降、StarRocks はこの関数をサポートしています。また、現在 StarRocks の共有データモードはこの関数をサポートしていません。

## 構文

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## パラメータ

- 必須パラメータ:
  - `[<db_name>.]<dict_table>`: ディクショナリテーブルの名前。これは主キーテーブルである必要があります。サポートされているデータ型は VARCHAR です。
  - `key_column_expr_list`: ディクショナリテーブル内のキー列の式リスト。1 つまたは複数の `key_column_expr` を含みます。`key_column_expr` は、ディクショナリテーブルのキー列の名前、または特定のキーやキー式にすることができます。

    この式リストには、ディクショナリテーブルのすべての主キー列を含める必要があります。つまり、式の総数はディクショナリテーブルの主キー列の総数と一致する必要があります。そのため、ディクショナリテーブルが複合主キーを使用する場合、このリストの式は、テーブルスキーマで定義された主キー列に順序どおりに対応する必要があります。このリストの複数の式はカンマ (`,`) で区切られます。また、`key_column_expr` が特定のキーまたはキー式である場合、その型はディクショナリテーブル内の対応する主キー列の型と一致する必要があります。

- オプションパラメータ:
  - `<value_column>`: 値列の名前。これはマッピング列でもあります。値列が指定されていない場合、デフォルトの値列はディクショナリテーブルの自動増分列になります。値列は、自動増分列と主キーを除く、ディクショナリテーブル内の任意の列として定義することもできます。列のデータ型に制限はありません。
  - `<null_if_not_exist>` (オプション): キーがディクショナリテーブルに存在しない場合に返されるかどうか。有効な値:
    - `true`: キーが存在しない場合、`Null` が返されます。
    - `false` (デフォルト): キーが存在しない場合、例外がスローされます。

## 戻り値

返される値のデータ型は、値列のデータ型と一致します。値列がディクショナリテーブルの自動増分列である場合、返される値のデータ型は BIGINT です。

ただし、指定されたキーにマップされた値が見つからない場合、`<null_if_not_exist>` パラメータが `true` に設定されていると `NULL` が返されます。パラメータが `false` (デフォルト) に設定されていると、エラー `query failed if record not exist in dict table` が返されます。

## 例

**例 1: ディクショナリテーブルからキーにマップされた値を直接クエリする。**

1. ディクショナリテーブルを作成し、シミュレートされたデータをロードします。

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

      > **NOTICE**
      >
      > 現在、`INSERT INTO` ステートメントは部分更新をサポートしていません。したがって、`dict` のキー列に挿入される値が重複しないようにしてください。重複するキー列の値をディクショナリテーブルに複数回挿入すると、値列内のマップされた値が変更される可能性があります。

2. ディクショナリテーブル内のキー `a1` にマップされた値をクエリします。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**例 2: テーブル内のマッピング列が `dict_mapping` 関数を使用して生成列として構成されている。これにより、StarRocks はこのテーブルにデータをロードする際に、キーにマップされた値を自動的に取得できます。**

1. データテーブルを作成し、マッピング列を `dict_mapping('dict', order_uuid)` を使用して生成列として構成します。

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

2. `order_id_int` 列が `dict_mapping('dict', 'order_uuid')` として構成されたこのテーブルにシミュレートされたデータをロードすると、StarRocks は `dict` テーブル内のキーと値のマッピング関係に基づいて `order_id_int` 列に値を自動的にロードします。

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

    この例での `dict_mapping` の使用は、[重複排除計算とジョインクエリ](../../../using_starrocks/query_acceleration_with_auto_increment.md) を高速化できます。正確な重複排除を高速化するためのグローバル辞書を構築する以前のソリューションと比較して、`dict_mapping` を使用するソリューションは、より柔軟でユーザーフレンドリーです。なぜなら、マッピング値は「キーと値のマッピング関係をテーブルにロードする」段階でディクショナリテーブルから直接取得されるからです。マッピング値を取得するためにディクショナリテーブルをジョインするステートメントを記述する必要はありません。さらに、このソリューションはさまざまなデータロード方法をサポートしています。<!--For detailed usage, please refer to xxx.-->

**例 3: テーブル内のマッピング列が生成列として構成されていない場合、テーブルにデータをロードする際に、マッピング列に対して `dict_mapping` 関数を明示的に構成して、キーにマップされた値を取得する必要があります。**

> **NOTICE**
>
> 例 3 と例 2 の違いは、データテーブルにインポートする際に、インポートコマンドを修正して、マッピング列に対して `dict_mapping` 式を明示的に構成する必要があることです。

1. テーブルを作成します。

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

2. このテーブルにシミュレートされたデータをロードする際、`dict_mapping` を構成することで、ディクショナリテーブルからマップされた値を取得します。

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

**例 4: `null_if_not_exist` モードを有効にする**

`<null_if_not_exist>` モードが無効な状態で、ディクショナリテーブルに存在しないキーにマップされた値をクエリすると、`NULL` ではなくエラーが返されます。これにより、データ行のキーが最初にディクショナリテーブルにロードされ、そのマップされた値 (ディクショナリ ID) が生成されてから、そのデータ行がターゲットテーブルにロードされることが保証されます。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**例 5: ディクショナリテーブルが複合主キーを使用する場合、クエリ時にはすべての主キーを指定する必要があります。**

1. 複合主キーを持つディクショナリテーブルを作成し、シミュレートされたデータをロードします。

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

2. ディクショナリテーブル内のキーにマップされた値をクエリします。ディクショナリテーブルには複合主キーがあるため、`dict_mapping` ですべての主キーを指定する必要があります。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   主キーが 1 つだけ指定されている場合、エラーが発生することに注意してください。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```
