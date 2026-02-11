---
displayed_sidebar: docs
---

# dict_mapping

辞書テーブル内の指定されたキーにマッピングされた値を返します。

:wq
この関数は、主にグローバル辞書テーブルの適用を簡素化するために使用されます。ターゲットテーブルへのデータロード中に、StarRocksはこの関数の入力パラメーターを使用して辞書テーブルから指定されたキーにマッピングされた値を自動的に取得し、その値をターゲットテーブルにロードします。

v3.2.5以降、StarRocksはこの機能をサポートしています。また、現在StarRocksの共有データモードではこの機能がサポートされていないことに注意してください。

## 構文

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## パラメーター

- 必須パラメーター:
  - `[<db_name>.]<dict_table>`: 辞書テーブルの名前。Primary Keyテーブルである必要があります。サポートされるデータ型はVARCHARです。
  - `key_column_expr_list`: 辞書テーブル内のキー列の式リスト。1つまたは複数の`key_column_expr`を含みます。`key_column_expr`は、辞書テーブル内のキー列の名前、または特定のキー、もしくはキー式であることができます。

    この式リストには、辞書テーブルのすべてのPrimary Key列を含める必要があります。つまり、式の合計数は辞書テーブルのPrimary Key列の合計数と一致する必要があります。したがって、辞書テーブルが複合Primary Keyを使用する場合、このリストの式は、テーブルスキーマで定義されたPrimary Key列に順番に対応する必要があります。このリスト内の複数の式はコンマ(`,`)で区切られます。そして、`key_column_expr`が特定のキーまたはキー式である場合、その型は辞書テーブル内の対応するPrimary Key列の型と一致する必要があります。

- オプションパラメーター:
  - `<value_column>`: 値列の名前。これはマッピング列でもあります。値列が指定されていない場合、デフォルトの値列は辞書テーブルのAUTO_INCREMENT列です。値列は、AUTO_INCREMENT列およびPrimary Keyを除く辞書テーブル内の任意の列として定義することもできます。列のデータ型に制限はありません。
  - `<null_if_not_exist>` (オプション): キーが辞書テーブルに存在しない場合に、何を返すか。有効な値:
    - `true`: キーが存在しない場合、NULLが返されます。
    - `false` (デフォルト): キーが存在しない場合、例外がスローされます。

## 戻り値

戻り値のデータ型は、値列のデータ型と一貫しています。値列が辞書テーブルのAUTO_INCREMENT列である場合、戻り値のデータ型はBIGINTです。

ただし、指定されたキーにマッピングされた値が見つからない場合、`<null_if_not_exist>`パラメーターが`true`に設定されていると、`NULL`が返されます。パラメーターが`false`(デフォルト)に設定されていると、`query failed if record not exist in dict table`というエラーが返されます。

## 例

**例 1: 辞書テーブルからキーにマッピングされた値を直接クエリします。**

1. 辞書テーブルを作成し、シミュレーションデータをロードします。

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
      > 現在、`INSERT INTO`ステートメントは部分更新をサポートしていません。したがって、`dict`のキー列に挿入される値が重複しないようにしてください。そうしないと、辞書テーブルに同じキー列値を複数回挿入すると、値列内のマッピングされた値が変更されます。

2. 辞書テーブルでキー`a1`にマッピングされた値をクエリします。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**例 2: テーブル内のマッピング列が`dict_mapping`関数を使用して生成列として構成されている場合、StarRocksはデータロード時にキーにマッピングされた値を自動的に取得できます。**

1. データテーブルを作成し、`dict_mapping('dict', order_uuid)`を使用してマッピング列を生成列として構成します。

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- この列はSTRING型の注文番号を記録し、例1のdictテーブルのorder_uuid列に対応します。
        order_uuid STRING, 
        batch int comment 'used to distinguish different batch loading',
        -- この列はorder_uuid列にマッピングされたBIGINT型の注文番号を記録します。
        -- この列はdict_mappingで構成された生成列であるため、データロード中に例1のdictテーブルから自動的に値が取得されます。
        -- その後、この列は重複排除やJOINクエリに直接使用できます。
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. `order_id_int`列が`dict_mapping('dict', 'order_uuid')`として構成されているこのテーブルにシミュレーションデータをロードすると、StarRocksは`dict`テーブル内のキーと値のマッピング関係に基づいて`order_id_int`列に値を自動的にロードします。

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

    この例での`dict_mapping`の使用は、[重複排除計算とJOINクエリ](../../../using_starrocks/query_acceleration_with_auto_increment.md)を高速化できます。正確な重複排除を高速化するためにグローバル辞書を構築する以前のソリューションと比較して、`dict_mapping`を使用するソリューションはより柔軟でユーザーフレンドリーです。これは、キーと値のマッピング関係をテーブルにロードする段階で、マッピング値が辞書テーブルから直接取得されるためです。マッピング値を取得するために辞書テーブルをJOINするステートメントを記述する必要はありません。さらに、このソリューションはさまざまなデータロード方法をサポートしています。<!--詳細な使用法については、xxxを参照してください。-->

**例 3: テーブル内のマッピング列が生成列として構成されていない場合、テーブルにデータをロードするときに、マッピング列に対して`dict_mapping`関数を明示的に構成して、キーにマッピングされた値を取得する必要があります。**

> **注意**
>
> 例3と例2の違いは、データテーブルにインポートするときに、インポートコマンドを変更して、マッピング列に`dict_mapping`式を明示的に構成する必要があることです。

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

2. このテーブルにシミュレーションデータをロードするときに、`dict_mapping`を構成して辞書テーブルからマッピングされた値を取得します。

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

**例 4: null_if_not_existモードを有効にする**

`<null_if_not_exist>`モードが無効で、辞書テーブルに存在しないキーにマッピングされた値がクエリされた場合、`NULL`ではなくエラーが返されます。これにより、データ行のキーが最初に辞書テーブルにロードされ、そのマッピング値(辞書ID)がターゲットテーブルにデータ行がロードされる前に生成されることが保証されます。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**例 5: 辞書テーブルが複合Primary Keyを使用する場合、クエリ時にはすべてのPrimary Keyを指定する必要があります。**

1. 複合Primary Keyを持つ辞書テーブルを作成し、シミュレーションデータをロードします。

      ```SQL
      MySQL [test]> CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE, 
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- 複合Primary Key
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

2. 辞書テーブルでキーにマッピングされた値をクエリします。辞書テーブルには複合Primary Keyがあるため、`dict_mapping`ですべてのPrimary Keyを指定する必要があります。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   Primary Keyを1つだけ指定するとエラーが発生することに注意してください。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```
