---
displayed_sidebar: docs
---

# dict_mapping

指定されたキーにマッピングされた値をディクショナリテーブルから返します。

この関数は、グローバルディクショナリテーブルの適用を簡素化するために主に使用されます。データをターゲットテーブルにロードする際、StarRocks はこの関数の入力パラメータを使用して、ディクショナリテーブルから指定されたキーにマッピングされた値を自動的に取得し、その値をターゲットテーブルにロードします。

v3.2.5 以降、StarRocks はこの関数をサポートしています。また、現在 StarRocks のストレージとコンピュートの分離モードでは、この機能はサポートされていません。

## 構文

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## パラメータ

- 必須パラメータ：
  - `[<db_name>.]<dict_table>`：ディクショナリテーブルの名前。主キーテーブルである必要があります。サポートされているデータ型は VARCHAR です。
  - `key_column_expr_list`：ディクショナリテーブルのキー列の式リスト。1 つ以上の `key_column_exprs` が含まれます。`key_column_expr` は、ディクショナリテーブルのキー列の名前、または特定のキーもしくはキー式にすることができます。

    この式リストには、ディクショナリテーブルのすべての主キー列を含める必要があります。つまり、式の合計数はディクショナリテーブルの主キー列の合計数と一致する必要があります。したがって、ディクショナリテーブルが複合主キーを使用する場合、このリストの式は、テーブルスキーマで定義された主キー列に順番に対応する必要があります。このリストの複数の式は、カンマ (`,`) で区切られます。また、`key_column_expr` が特定のキーまたはキー式である場合、その型はディクショナリテーブルの対応する主キー列の型と一致する必要があります。

- オプションのパラメータ：
  - `<value_column>`：値列の名前。つまり、マッピング列です。値列が指定されていない場合、デフォルトの値列はディクショナリテーブルの AUTO_INCREMENT 列です。値列は、自動インクリメント列と主キーを除く、ディクショナリテーブルの任意の列として定義することもできます。この列のデータ型に制限はありません。
  - `<null_if_not_exist>`（オプション）：ディクショナリテーブルにキーが存在しない場合に null を返すかどうか。有効な値：
    - `true`：キーが存在しない場合、Null を返します。
    - `false`（デフォルト）：キーが存在しない場合、例外をスローします。

## 戻り値

戻り値の型は、値列のデータ型と一致します。値列がディクショナリテーブルの自動インクリメント列である場合、戻り値の型は BIGINT です。

ただし、指定されたキーにマッピングされた値が見つからない場合、`<null_if_not_exist>` パラメータが `true` に設定されていると、`NULL` が返されます。パラメータが `false`（デフォルト）に設定されている場合、エラー `query failed if record not exist in dict table` が返されます。

## 例

**例 1：ディクショナリテーブルからキーにマッピングされた値を直接クエリします。**

1. ディクショナリテーブルを作成し、サンプルデータをロードします。

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
      > 現在、`INSERT INTO` ステートメントは部分更新をサポートしていません。したがって、`dict` のキー列に挿入される値が重複しないようにしてください。そうしないと、同じキー列の値をディクショナリテーブルに複数回挿入すると、値列にマッピングされた値が変更される可能性があります。

2. ディクショナリテーブルでキー `a1` にマッピングされた値をクエリします。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**例 2：テーブル内のマッピング列は、`dict_mapping` 関数で生成された列を使用するように構成されています。したがって、StarRocks はこのテーブルにデータをロードする際に、キーにマッピングされた値を自動的に取得できます。**

1. データテーブルを作成し、`dict_mapping('dict', order_uuid)` を使用してマッピング列を生成列として構成します。

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

2. このテーブルにサンプルデータをロードすると、`order_id_int` 列は `dict_mapping('dict', 'order_uuid')` で構成されているため、StarRocks は `dict` テーブルのキーと値の間のマッピングに基づいて、値を `order_id_int` 列に自動的にロードします。

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

    この例で `dict_mapping` を使用すると、[重複排除計算と JOIN クエリ](../../../using_starrocks/query_acceleration_with_auto_increment.md) を高速化できます。正確な重複排除を高速化するためにグローバルディクショナリを構築する以前のソリューションと比較して、`dict_mapping` を使用するソリューションはより柔軟でユーザーフレンドリーです。マッピング値は、「キーと値の間のマッピング関係をテーブルにロードする」段階でディクショナリテーブルから直接取得されるためです。マッピング値を取得するためにディクショナリテーブルを結合するステートメントを作成する必要はありません。さらに、このソリューションはさまざまなデータインポート方法をサポートしています。 <!--For detailed usage, please refer to xxx.-->

**例 3：テーブル内のマッピング列が生成列として構成されていない場合、テーブルにデータをロードする際に、マッピング列に `dict_mapping` 関数を明示的に構成して、キーにマッピングされた値を取得する必要があります。**

> **注意**
>
> 例 3 と例 2 の違いは、データテーブルへのインポート時に、マッピング列に `dict_mapping` 式を明示的に構成するために、インポートコマンドを変更する必要があることです。

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

2. このテーブルにサンプルデータをロードすると、`dict_mapping` を構成して、ディクショナリテーブルからマッピングされた値を取得できます。

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

**例 4：null_if_not_exist モードを有効にする**

`<null_if_not_exist>` モードが無効になっており、ディクショナリテーブルに存在しないキーにマッピングされた値をクエリすると、`NULL` ではなくエラーが返されます。これにより、データ行のキーが最初にディクショナリテーブルにロードされ、そのデータ行がターゲットテーブルにロードされる前に、そのマッピングされた値（ディクショナリ ID）が生成されることが保証されます。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**例 5：ディクショナリテーブルが複合主キーを使用する場合、クエリ時にすべての主キーを指定する必要があります。**

1. 複合主キーを持つディクショナリテーブルを作成し、サンプルデータをロードします。

      ```SQL
      MySQL [test]> CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE, 
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- Composite Primary Key
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

2. ディクショナリテーブルでキーにマッピングされた値をクエリします。ディクショナリテーブルには複合主キーがあるため、`dict_mapping` ですべての主キーを指定する必要があります。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   主キーを 1 つだけ指定すると、エラーが発生することに注意してください。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```