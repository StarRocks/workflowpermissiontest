---
displayed_sidebar: docs
---

# dict_mapping

dictionary テーブルで、指定されたキーにマッピングされた値を返します。

この関数は主に、グローバル dictionary テーブルの適用を簡素化するために使用されます。 StarRocks は、ターゲットテーブルへのデータロード中に、この関数の入力パラメータを使用して、dictionary テーブルから指定されたキーにマッピングされた値を自動的に取得し、その値をターゲットテーブルにロードします。

v3.2.5 以降、StarRocks はこの関数をサポートしています。また、現在の StarRocks の shared-data mode はこの関数をサポートしていないことに注意してください。

## 構文

```SQL
dict_mapping("[<db_name>.]<dict_table>", key_column_expr_list [, <value_column> ] [, <null_if_not_exist>] )

key_column_expr_list ::= key_column_expr [, key_column_expr ... ]

key_column_expr ::= <column_name> | <expr>
```

## パラメータ

- 必須パラメータ:
  - `[<db_name>.]<dict_table>`: dictionary テーブルの名前。Primary Key table である必要があります。サポートされているデータ型は VARCHAR です。
  - `key_column_expr_list`: dictionary テーブルのキーカラムの式リスト。1 つまたは複数の `key_column_exprs` が含まれます。 `key_column_expr` は、dictionary テーブルのキーカラムの名前、または特定のキーまたはキー式にすることができます。

    この式リストには、dictionary テーブルのすべての主キーカラムを含める必要があります。つまり、式の総数は、dictionary テーブルの主キーカラムの総数と一致する必要があります。したがって、dictionary テーブルが Composite Primary Key を使用する場合、このリストの式は、テーブルスキーマで定義された主キーカラムに対応する必要があります（順番に）。このリストの複数の式は、カンマ (`,`) で区切られます。また、`key_column_expr` が特定のキーまたはキー式である場合、その型は、dictionary テーブルの対応する主キーカラムの型と一致する必要があります。

- オプションのパラメータ:
  - `<value_column>`: 値カラムの名前。これはマッピングカラムでもあります。値カラムが指定されていない場合、デフォルトの値カラムは dictionary テーブルの AUTO_INCREMENT カラムです。値カラムは、自動インクリメントカラムと主キーを除く、dictionary テーブルの任意のカラムとして定義することもできます。カラムのデータ型に制限はありません。
  - `<null_if_not_exist>` (オプション): キーが dictionary テーブルに存在しない場合に返すかどうか。有効な値:
    - `true`: キーが存在しない場合、Null が返されます。
    - `false` (デフォルト): キーが存在しない場合、例外がスローされます。

## 戻り値

戻り値のデータ型は、値カラムのデータ型と一致します。値カラムが dictionary テーブルの自動インクリメントカラムである場合、戻り値のデータ型は BIGINT です。

ただし、指定されたキーにマッピングされた値が見つからない場合、`<null_if_not_exist>` パラメータが `true` に設定されていると、`NULL` が返されます。パラメータが `false` (デフォルト) に設定されている場合、エラー `query failed if record not exist in dict table` が返されます。

## 例

**例 1: キーにマッピングされた値を dictionary テーブルから直接クエリします。**

1. dictionary テーブルを作成し、シミュレートされたデータをロードします。

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
      > 現在、`INSERT INTO` ステートメントは部分的な更新をサポートしていません。したがって、`dict` のキーカラムに挿入される値が重複していないことを確認してください。そうしないと、dictionary テーブルで同じキーカラム値を複数回挿入すると、値カラムのマッピングされた値が変更されます。

2. dictionary テーブルのキー `a1` にマッピングされた値をクエリします。

    ```SQL
    MySQL [test]> SELECT dict_mapping('dict', 'a1');
    +----------------------------+
    | dict_mapping('dict', 'a1') |
    +----------------------------+
    |                          1 |
    +----------------------------+
    1 row in set (0.01 sec)
    ```

**例 2: テーブルのマッピングカラムは、`dict_mapping` 関数を使用して生成されたカラムとして構成されています。したがって、StarRocks は、このテーブルにデータをロードするときに、キーにマッピングされた値を自動的に取得できます。**

1. データテーブルを作成し、`dict_mapping('dict', order_uuid)` を使用してマッピングカラムを生成されたカラムとして構成します。

    ```SQL
    CREATE TABLE dest_table1 (
        id BIGINT,
        -- このカラムは、STRING 型の注文番号を記録します。これは、例 1 の dict テーブルの order_uuid カラムに対応します。
        order_uuid STRING, 
        batch int comment 'used to distinguish different batch loading',
        -- このカラムは、order_uuid カラムにマッピングされた BIGINT 型の注文番号を記録します。
        -- このカラムは dict_mapping で構成された生成されたカラムであるため、このカラムの値は、データロード中に例 1 の dict テーブルから自動的に取得されます。
        -- その後、このカラムは、重複排除および JOIN クエリに直接使用できます。
        order_id_int BIGINT AS dict_mapping('dict', order_uuid)
    )
    DUPLICATE KEY (id, order_uuid)
    DISTRIBUTED BY HASH(id);
    ```

2. `order_id_int` カラムが `dict_mapping('dict', 'order_uuid')` として構成されているこのテーブルにシミュレートされたデータをロードすると、StarRocks は `dict` テーブルのキーと値のマッピング関係に基づいて、`order_id_int` カラムに値を自動的にロードします。

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

    この例での `dict_mapping` の使用は、[重複排除の計算と JOIN クエリ](../../../using_starrocks/query_acceleration_with_auto_increment.md) を高速化できます。正確な重複排除を高速化するためにグローバル dictionary を構築するための以前のソリューションと比較して、`dict_mapping` を使用したソリューションは、より柔軟でユーザーフレンドリーです。マッピング値は、「キーと値の間のマッピング関係をテーブルにロードする」段階で dictionary テーブルから直接取得されるためです。マッピング値を取得するために dictionary テーブルを join するステートメントを作成する必要はありません。さらに、このソリューションはさまざまなデータロード方法をサポートしています。<!--詳細な使用法については、xxx を参照してください。-->

**例 3: テーブルのマッピングカラムが生成されたカラムとして構成されていない場合は、テーブルにデータをロードするときに、マッピングカラムの `dict_mapping` 関数を明示的に構成し、キーにマッピングされた値を取得する必要があります。**

> **注意**
>
> 例 3 と例 2 の違いは、データテーブルにインポートするときに、インポートコマンドを変更して、マッピングカラムの `dict_mapping` 式を明示的に構成する必要があることです。

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

2. シミュレートされたデータがこのテーブルにロードされると、`dict_mapping` を構成して dictionary テーブルからマッピングされた値を取得します。

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

`<null_if_not_exist>` モードが無効になっていて、dictionary テーブルに存在しないキーにマッピングされた値がクエリされると、`NULL` ではなくエラーが返されます。これにより、データ行のキーが最初に dictionary テーブルにロードされ、そのマッピングされた値 (dictionary ID) が生成されてから、そのデータ行がターゲットテーブルにロードされるようになります。

```SQL
MySQL [test]>  SELECT dict_mapping('dict', 'b1', true);
ERROR 1064 (HY000): Query failed if record not exist in dict table.
```

**例 5: dictionary テーブルが複合主キーを使用している場合、クエリ時にすべての主キーを指定する必要があります。**

1. 複合主キーを持つ dictionary テーブルを作成し、シミュレートされたデータをロードします。

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

2. dictionary テーブルのキーにマッピングされた値をクエリします。 dictionary テーブルには複合主キーがあるため、`dict_mapping` ですべての主キーを指定する必要があります。

      ```SQL
      SELECT dict_mapping('dict2', 'a1', cast('2023-11-22' as DATE));
      ```

   主キーが 1 つだけ指定されている場合、エラーが発生することに注意してください。

      ```SQL
      MySQL [test]> SELECT dict_mapping('dict2', 'a1');
      ERROR 1064 (HY000): Getting analyzing error. Detail message: dict_mapping function param size should be 3 - 5.
      ```