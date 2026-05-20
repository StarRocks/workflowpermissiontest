---
displayed_sidebar: docs
---

# dict_mapping

ディクショナリテーブル内の指定されたキーにマップされた値。

この関数は、主にグローバル辞書テーブルの適用を簡素化するために使用されます。ターゲットテーブルへの データロード 中に、StarRocks はこの関数の入力パラメータを使用して、ディクショナリテーブルから指定されたキーにマップされた値を自動的に取得し、その値をターゲットテーブルに ロード します。

StarRocks は v3.2.5 以降、この関数をサポートしています。また、現在 StarRocks の 共有データモード はこの関数をサポートしていないことに注意してください。

## 構文

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## パラメータ

- 必須パラメータ:
  - `[<db_name>.]<dict_table>`: ディクショナリテーブルの名前。 主キーテーブル である必要があります。サポートされる データ型 は VARCHAR です。
  - `key_column_expr_list`: ディクショナリテーブル内のキー列の式リストで、1つ以上の `key_column_expr` を含みます。`key_column_expr` は、ディクショナリテーブル内の キー列 の名前、または特定のキーや キー式 のいずれかになります。

    この式リストには、ディクショナリテーブルのすべての 主キー列 を含める必要があります。つまり、式の総数がディクショナリテーブルの 主キー列 の総数と一致する必要があります。したがって、ディクショナリテーブルが 複合主キー を使用する場合、このリスト内の式は、テーブルスキーマ で定義された 主キー列 にシーケンスで対応する必要があります。このリスト内の複数の式はコンマ (`,`) で区切られます。そして、`key_column_expr` が特定のキーまたはキー式である場合、その型はディクショナリテーブル内の対応する 主キー列 の型と一致する必要があります。

- オプションパラメータ:
  - `<value_column>`: 値列の名前。これはマッピング列でもあります。値列が指定されていない場合、デフォルトの値列はディクショナリテーブルの AUTO_INCREMENT 列です。値列は、自動増分列と 主キー を除くディクショナリテーブル内の任意の列として定義することもできます。列の データ型 に制限はありません。
  - `<null_if_not_exist>` (オプション): キーがディクショナリテーブルに存在しない場合に `NULL` を返すかどうか。有効な値:
    - `true`: キーが存在しない場合、`NULL` が返されます。
    - `false` (デフォルト): キーが存在しない場合、例外がスローされます。

## 戻り値

戻り値の データ型 は、値列の データ型 と一貫しています。値列がディクショナリテーブルの 自動増分列 である場合、戻り値の データ型 は BIGINT です。

ただし、指定されたキーにマップされた値が見つからない場合、`<null_if_not_exist>` パラメータが `true` に設定されていると `NULL` が返されます。パラメータが `false` (デフォルト) に設定されている場合、`query failed if record not exist in dict table` というエラーが返されます。

## 例

**例 1: ディクショナリテーブルからキーにマップされた値を直接クエリします。**

1. ディクショナリテーブルを作成し、模擬データを ロード します。

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
      > 現在、`INSERT INTO` ステートメント は 部分更新 をサポートしていません。したがって、`dict` の キー列 に挿入される値が重複しないようにしてください。そうしないと、ディクショナリテーブルに同じ キー列 の値が複数回挿入されると、そのマッピングされた値が値列で変更されます。

2. ディクショナリテーブルでキー `a1` にマップされた値をクエリします。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**例 2: テーブル内のマッピング列が `dict_mapping` 関数を使用して 生成列 として設定されています。これにより、StarRocks はこのテーブルにデータを ロード する際に、キーにマップされた値を自動的に取得できます。**

1. データテーブルを作成し、`dict_mapping('dict', order_uuid)` を使用してマッピング列を 生成列 として設定します。

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- この列は、文字列型の注文番号を記録し、例 1 の dict テーブルの order_uuid 列に対応します。
        order_uuid STRING, 
        batch int comment 'used to distinguish different batch loading',
        -- この列は、order_uuid 列にマッピングされた BIGINT 型の注文番号を記録します。
        -- この列は dict_mapping で設定された生成列であるため、データロード中に例 1 の dict テーブルから値が自動的に取得されます。
        -- その後、この列は重複排除や JOIN クエリに直接使用できます。
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. `order_id_int` 列が `dict_mapping('dict', 'order_uuid')` として設定されたこのテーブルに模擬データを ロード する際、StarRocks は `dict` テーブル内のキーと値のマッピング関係に基づいて、`order_id_int` 列に値を自動的に ロード します。

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

    この例における `dict_mapping` の使用は、[重複排除計算とジョインクエリ](../../../using_starrocks/query_acceleration_with_auto_increment.md) を高速化できます。正確な重複排除を高速化するために グローバル辞書 を構築する以前のソリューションと比較して、`dict_mapping` を使用するソリューションはより柔軟でユーザーフレンドリーです。なぜなら、マッピング値は「キーと値のマッピング関係をテーブルに ロード する」段階でディクショナリテーブルから直接取得されるからです。マッピング値を取得するためにディクショナリテーブルを ジョイン するステートメントを記述する必要はありません。さらに、このソリューションはさまざまな データロード方法 をサポートしています。

**例 3: テーブル内のマッピング列が 生成列 として設定されていない場合、テーブルにデータを ロード する際に、マッピング列に対して `dict_mapping` 関数を明示的に設定し、キーにマップされた値を取得する必要があります。**

> **注意**
>
> 例 3 と例 2 の違いは、データテーブルにインポートする際に、インポートコマンドを修正して、マッピング列に対して `dict_mapping` 式を明示的に設定する必要があることです。

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

2. このテーブルに模擬データが ロード される際、`dict_mapping` を設定することでディクショナリテーブルからマッピングされた値を取得します。

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

**例 4: null_if_not_exist モードを有効にする**

`<null_if_not_exist>` モードが無効で、ディクショナリテーブルに存在しないキーにマップされた値がクエリされた場合、`NULL` ではなくエラーが返されます。これにより、データ行のキーが最初にディクショナリテーブルに ロード され、そのマッピングされた値 (ディクショナリ ID) が生成されてから、そのデータ行がターゲットテーブルに ロード されることが保証されます。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**例 5: ディクショナリテーブルが複合主キーを使用する場合、クエリ時にはすべての主キーを指定する必要があります。**

1. 複合主キーを持つディクショナリテーブルを作成し、模擬データを ロード します。

      ```SQL
      MySQL [test]> CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE, 
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- 複合主キー
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

2. ディクショナリテーブルでキーにマップされた値をクエリします。ディクショナリテーブルには複合主キーがあるため、`dict_mapping` ですべての主キーを指定する必要があります。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   主キー が1つしか指定されていない場合、エラーが発生することに注意してください。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```
