---
displayed_sidebar: docs
---

# dict_mapping

ディクショナリテーブル内で指定されたキーにマップされた値を返します。

この関数は主に、グローバルディクショナリテーブルの適用を簡素化するために使用されます。ターゲットテーブルへのデータロード中、StarRocksは、この関数の入力パラメータを使用して、ディクショナリテーブルから指定されたキーにマップされた値を自動的に取得し、その値をターゲットテーブルにロードします。

v3.2.5以降、StarRocksはこの関数をサポートしています。また、現在StarRocksのshared-dataモードではこの関数がサポートされていないことに注意してください。

## 構文

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## パラメータ

- 必須パラメータ:
  - `[<db_name>.]<dict_table>`: ディクショナリテーブルの名前。Primary Keyテーブルである必要があります。サポートされるデータ型はVARCHARです。
  - `key_column_expr_list`: ディクショナリテーブルのキー列の式リスト。1つ以上の`key_column_expr`を含みます。`key_column_expr`は、ディクショナリテーブルのキー列の名前、または特定のキー、あるいはキー式であることができます。

    この式リストには、ディクショナリテーブルのすべてのPrimary Key列を含める必要があります。つまり、式の総数はディクショナリテーブルのPrimary Key列の総数と一致する必要があります。したがって、ディクショナリテーブルが複合プライマリキーを使用する場合、このリストの式は、テーブルスキーマで定義されているPrimary Key列に順番に対応する必要があります。このリストの複数の式はカンマ (`,`) で区切られます。また、`key_column_expr`が特定のキーまたはキー式である場合、その型はディクショナリテーブルの対応するPrimary Key列の型と一致する必要があります。

- オプションパラメータ:
  - `<value_column>`: 値列の名前で、マッピング列でもあります。値列が指定されていない場合、デフォルトの値列はディクショナリテーブルのAUTO_INCREMENT列です。値列は、オートインクリメント列とプライマリキーを除くディクショナリテーブル内の任意の列として定義することもできます。列のデータ型に制限はありません。
  - `<null_if_not_exist>` (オプション): キーがディクショナリテーブルに存在しない場合にNULLを返すかどうか。有効な値:
    - `true`: キーが存在しない場合、NULLが返されます。
    - `false` (デフォルト): キーが存在しない場合、例外がスローされます。

## 戻り値

戻り値のデータ型は、値列のデータ型と一致します。値列がディクショナリテーブルのオートインクリメント列である場合、戻り値のデータ型はBIGINTです。

ただし、指定されたキーにマップされた値が見つからない場合、`<null_if_not_exist>`パラメータが`true`に設定されていると`NULL`が返されます。パラメータが`false`(デフォルト)に設定されていると、`query failed if record not exist in dict table`というエラーが返されます。

## 例

**例1: ディクショナリテーブルからキーにマップされた値を直接クエリする。**

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

      > **注意**
      >
      > 現在、`INSERT INTO`文は部分更新をサポートしていません。したがって、`dict`のキー列に挿入される値が重複しないようにしてください。重複するキー列の値をディクショナリテーブルに複数回挿入すると、値列内のマップされた値が変更される可能性があります。

2. ディクショナリテーブルでキー`a1`にマップされた値をクエリします。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**例2: テーブル内のマッピング列が`dict_mapping`関数を使用して生成列として構成されている場合。StarRocksは、このテーブルにデータをロードする際に、キーにマップされた値を自動的に取得できます。**

1. データテーブルを作成し、`dict_mapping('dict', order_uuid)`を使用してマッピング列を生成列として構成します。

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- この列は、例1のdictテーブルのorder_uuid列に対応するSTRING型注文番号を記録します。
        order_uuid STRING, 
        batch int comment '異なるバッチロードを区別するために使用されます',
        -- この列は、order_uuid列にマップされたBIGINT型注文番号を記録します。
        -- この列はdict_mappingで構成された生成列であるため、データロード中に例1のdictテーブルから値が自動的に取得されます。
        -- その後、この列は重複排除やJOINクエリに直接使用できます。
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. `order_id_int`列が`dict_mapping('dict', 'order_uuid')`として構成されたこのテーブルにシミュレートされたデータをロードすると、StarRocksは`dict`テーブルのキーと値のマッピング関係に基づいて`order_id_int`列に値を自動的にロードします。

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

    この例での`dict_mapping`の使用は、[重複排除計算とJOINクエリ](../../../using_starrocks/query_acceleration_with_auto_increment.md)を高速化できます。正確な重複排除を高速化するためのグローバルディクショナリを構築する以前のソリューションと比較して、`dict_mapping`を使用するソリューションはより柔軟でユーザーフレンドリーです。なぜなら、マッピング値は「キーと値のマッピング関係をテーブルにロードする」段階でディクショナリテーブルから直接取得されるためです。マッピング値を取得するためにディクショナリテーブルを結合するステートメントを記述する必要はありません。さらに、このソリューションは様々なデータロード方法をサポートしています。<!--詳細な使用法については、xxxを参照してください。-->

**例3: テーブル内のマッピング列が生成列として構成されていない場合、テーブルにデータをロードするときに、マッピング列に対して`dict_mapping`関数を明示的に構成して、キーにマップされた値を取得する必要があります。**

> **注意**
>
> 例3と例2の違いは、データテーブルにインポートする際に、インポートコマンドを変更して、マッピング列の`dict_mapping`式を明示的に構成する必要があることです。

1. テーブルを作成します。

    ```SQL
    CREATE TABLE dest_table2 (
        id BIGINT,
        order_uuid STRING,
        order_id_int BIGINT NULL,
        batch int comment '異なるバッチロードを区別するために使用されます'
    )
    DUPLICATE KEY (id, order_uuid, order_id_int)
    DISTRIBUTED BY HASH(id);
    ```

2. シミュレートされたデータをこのテーブルにロードする際に、`dict_mapping`を構成してディクショナリテーブルからマップされた値を取得します。

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

**例4: null_if_not_existモードを有効にする**

`<null_if_not_exist>`モードが無効で、ディクショナリテーブルに存在しないキーにマップされた値がクエリされた場合、`NULL`の代わりにエラーが返されます。これにより、データ行のキーが最初にディクショナリテーブルにロードされ、そのマップされた値 (ディクショナリID) が、そのデータ行がターゲットテーブルにロードされる前に生成されることが保証されます。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**例5: ディクショナリテーブルが複合プライマリキーを使用する場合、クエリ時にはすべてのプライマリキーを指定する必要があります。**

1. 複合プライマリキーを持つディクショナリテーブルを作成し、シミュレートされたデータをロードします。

      ```SQL
      MySQL [test]> CREATE TABLE dict2 (
          order_uuid STRING,
          order_date DATE, 
          order_id_int BIGINT AUTO_INCREMENT
      )
      PRIMARY KEY (order_uuid,order_date)  -- 複合プライマリキー
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

2. ディクショナリテーブル内のキーにマップされた値をクエリします。ディクショナリテーブルが複合プライマリキーを持つため、`dict_mapping`ですべてのプライマリキーを指定する必要があります。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   プライマリキーが1つだけ指定されている場合、エラーが発生することに注意してください。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```
