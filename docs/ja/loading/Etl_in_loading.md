---
displayed_sidebar: docs
---

# ロード時のデータ変換

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

StarRocks は、データロード時のデータ変換をサポートしています。

この機能は、[Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)、[Broker Load](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md)、および [Routine Load](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md) をサポートしますが、[Spark Load](../sql-reference/sql-statements/loading_unloading/SPARK_LOAD.md) はサポートしません。

<InsertPrivNote />

このトピックでは、CSV データを例に、ロード時にデータを抽出および変換する方法について説明します。サポートされるデータファイル形式は、選択するロード方法によって異なります。

:::note

CSV データの場合、カンマ (,)、タブ、パイプ (|) など、長さが 50 バイトを超えない UTF-8 文字列をテキスト区切り文字として使用できます。

:::

## シナリオ

データファイルを StarRocks テーブルにロードする際、データファイルのデータが StarRocks テーブルのデータに完全にマッピングされない場合があります。この状況では、データを StarRocks テーブルにロードする前にデータを抽出または変換する必要はありません。StarRocks は、ロード中にデータの抽出と変換を支援できます。

- ロードする必要のない列をスキップします。
  
  ロードする必要のない列をスキップできます。さらに、データファイルの列が StarRocks テーブルの列と異なる順序である場合、データファイルと StarRocks テーブルの間に列マッピングを作成できます。

- ロードしたくない行を除外します。
  
  StarRocks がロードしたくない行を除外するためのフィルター条件を指定できます。

- 元の列から新しい列を生成します。
  
  生成列は、データファイルの元の列から計算される特殊な列です。生成された列を StarRocks テーブルの列にマッピングできます。

- ファイルパスからパーティションフィールド値を抽出します。
  
  データファイルが Apache Hive™ から生成された場合、ファイルパスからパーティションフィールド値を抽出できます。

## データ例

1. ローカルファイルシステムにデータファイルを作成します。

   a. `file1.csv` という名前のデータファイルを作成します。このファイルは、ユーザー ID、ユーザーの性別、イベント日付、イベントタイプを順番に表す 4 つの列で構成されています。

      ```Plain
      354,female,2020-05-20,1
      465,male,2020-05-21,2
      576,female,2020-05-22,1
      687,male,2020-05-23,2
      ```

   b. `file2.csv` という名前のデータファイルを作成します。このファイルは、日付を表す 1 つの列のみで構成されています。

      ```Plain
      2020-05-20
      2020-05-21
      2020-05-22
      2020-05-23
      ```

2. StarRocks データベース `test_db` にテーブルを作成します。

   > **注**
   >
   > v2.5.7 以降、StarRocks はテーブルの作成時またはパーティションの追加時にバケット数 (BUCKETS) を自動的に設定できます。手動でバケット数を設定する必要はなくなりました。詳細については、[バケット数の設定](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets) を参照してください。

   a. `event_date`、`event_type`、および `user_id` の 3 つの列で構成される `table1` という名前のテーブルを作成します。

      ```SQL
      MySQL [test_db]> CREATE TABLE table1
      (
          `event_date` DATE COMMENT "event date",
          `event_type` TINYINT COMMENT "event type",
          `user_id` BIGINT COMMENT "user ID"
      )
      DISTRIBUTED BY HASH(user_id);
      ```

   b. `date`、`year`、`month`、および `day` の 4 つの列で構成される `table2` という名前のテーブルを作成します。

      ```SQL
      MySQL [test_db]> CREATE TABLE table2
      (
          `date` DATE COMMENT "date",
          `year` INT COMMENT "year",
          `month` TINYINT COMMENT "month",
          `day` TINYINT COMMENT "day"
      )
      DISTRIBUTED BY HASH(date);
      ```

3. `file1.csv` と `file2.csv` を HDFS クラスタの `/user/starrocks/data/input/` パスにアップロードし、`file1.csv` のデータを Kafka クラスタの `topic1` にパブリッシュし、`file2.csv` のデータを Kafka クラスタの `topic2` にパブリッシュします。

## ロードする必要のない列をスキップする

StarRocks テーブルにロードしたいデータファイルには、StarRocks テーブルのどの列にもマッピングできない列が含まれている場合があります。このような状況では、StarRocks はデータファイルから StarRocks テーブルの列にマッピングできる列のみをロードすることをサポートします。

この機能は、以下のデータソースからのデータロードをサポートします。

- ローカルファイルシステム

- HDFS およびクラウドストレージ
  
  > **注**
  >
  > このセクションでは、HDFS を例として使用します。

- Kafka

ほとんどの場合、CSV ファイルの列には名前が付けられていません。一部の CSV ファイルでは、最初の行が列名で構成されていますが、StarRocks は最初の行の内容を列名ではなく通常のデータとして処理します。したがって、CSV ファイルをロードする際には、ジョブ作成ステートメントまたはコマンドで CSV ファイルの列に**順番に**一時的な名前を付ける必要があります。これらの一時的に名前が付けられた列は、StarRocks テーブルの列に**名前で**マッピングされます。データファイルの列に関する以下の点に注意してください。

- StarRocks テーブルの列名を使用してマッピングされ、一時的に名前が付けられた列のデータは直接ロードされます。

- StarRocks テーブルの列にマッピングできない列は無視され、これらの列のデータはロードされません。

- 一部の列が StarRocks テーブルの列にマッピングできるにもかかわらず、ジョブ作成ステートメントまたはコマンドで一時的に名前が付けられていない場合、ロードジョブはエラーを報告します。

このセクションでは、`file1.csv` と `table1` を例として使用します。`file1.csv` の 4 つの列には、順に `user_id`、`user_gender`、`event_date`、`event_type` という一時的な名前が付けられています。`file1.csv` の一時的に名前が付けられた列のうち、`user_id`、`event_date`、`event_type` は `table1` の特定の列にマッピングできますが、`user_gender` は `table1` のどの列にもマッピングできません。したがって、`user_id`、`event_date`、`event_type` は `table1` にロードされますが、`user_gender` はロードされません。

### データロード

#### ローカルファイルシステムからデータをロードする

`file1.csv` がローカルファイルシステムに保存されている場合、次のコマンドを実行して [Stream Load](../loading/StreamLoad.md) ジョブを作成します。

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: user_id, user_gender, event_date, event_type" \
    -T file1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table1/_stream_load
```

> **注**
>
> Stream Load を選択した場合、`columns` パラメータを使用してデータファイルの列に一時的な名前を付け、データファイルと StarRocks テーブルの間に列マッピングを作成する必要があります。

構文とパラメータの詳細については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を参照してください。

#### HDFS クラスタからデータをロードする

`file1.csv` が HDFS クラスタに保存されている場合、次のステートメントを実行して [Broker Load](../loading/hdfs_load.md) ジョブを作成します。

```SQL
LOAD LABEL test_db.label1
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/data/input/file1.csv")
    INTO TABLE `table1`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (user_id, user_gender, event_date, event_type)
)
WITH BROKER;
```

> **注**
>
> Broker Load を選択した場合、`column_list` パラメータを使用してデータファイルの列に一時的な名前を付け、データファイルと StarRocks テーブルの間に列マッピングを作成する必要があります。

構文とパラメータの詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

#### Kafka クラスタからデータをロードする

`file1.csv` のデータが Kafka クラスタの `topic1` にパブリッシュされている場合、次のステートメントを実行して [Routine Load](../loading/RoutineLoad.md) ジョブを作成します。

```SQL
CREATE ROUTINE LOAD test_db.table101 ON table1
    COLUMNS TERMINATED BY ",",
    COLUMNS(user_id, user_gender, event_date, event_type)
FROM KAFKA
(
    "kafka_broker_list" = "<kafka_broker_host>:<kafka_broker_port>",
    "kafka_topic" = "topic1",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```

> **注**
>
> Routine Load を選択した場合、`COLUMNS` パラメータを使用してデータファイルの列に一時的な名前を付け、データファイルと StarRocks テーブルの間に列マッピングを作成する必要があります。

構文とパラメータの詳細については、[CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md) を参照してください。

### データ照会

ローカルファイルシステム、HDFS クラスタ、または Kafka クラスタからのデータロードが完了したら、`table1` のデータを照会してロードが成功したことを確認します。

```SQL
MySQL [test_db]> SELECT * FROM table1;
+------------+------------+---------+
| event_date | event_type | user_id |
+------------+------------+---------+
| 2020-05-22 |          1 |     576 |
| 2020-05-20 |          1 |     354 |
| 2020-05-21 |          2 |     465 |
| 2020-05-23 |          2 |     687 |
+------------+------------+---------+
4 rows in set (0.01 sec)
```

## ロードしたくない行を除外する

StarRocks テーブルにデータファイルをロードする際、特定のデータファイルの行をロードしたくない場合があります。この状況では、WHERE 句を使用してロードしたい行を指定できます。StarRocks は、WHERE 句で指定されたフィルター条件を満たさないすべての行を除外します。

この機能は、以下のデータソースからのデータロードをサポートします。

- ローカルファイルシステム

- HDFS およびクラウドストレージ
  > **注**
  >
  > このセクションでは、HDFS を例として使用します。

- Kafka

このセクションでは、`file1.csv` と `table1` を例として使用します。`file1.csv` からイベントタイプが `1` の行のみを `table1` にロードしたい場合、WHERE 句を使用してフィルター条件 `event_type = 1` を指定できます。

### データロード

#### ローカルファイルシステムからデータをロードする

`file1.csv` がローカルファイルシステムに保存されている場合、次のコマンドを実行して [Stream Load](../loading/StreamLoad.md) ジョブを作成します。

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: user_id, user_gender, event_date, event_type" \
    -H "where: event_type=1" \
    -T file1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table1/_stream_load
```

構文とパラメータの詳細については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を参照してください。

#### HDFS クラスタからデータをロードする

`file1.csv` が HDFS クラスタに保存されている場合、次のステートメントを実行して [Broker Load](../loading/hdfs_load.md) ジョブを作成します。

```SQL
LOAD LABEL test_db.label2
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/data/input/file1.csv")
    INTO TABLE `table1`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (user_id, user_gender, event_date, event_type)
    WHERE event_type = 1
)
WITH BROKER;
```

構文とパラメータの詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

#### Kafka クラスタからデータをロードする

`file1.csv` のデータが Kafka クラスタの `topic1` にパブリッシュされている場合、次のステートメントを実行して [Routine Load](../loading/RoutineLoad.md) ジョブを作成します。

```SQL
CREATE ROUTINE LOAD test_db.table102 ON table1
COLUMNS TERMINATED BY ",",
COLUMNS (user_id, user_gender, event_date, event_type),
WHERE event_type = 1
FROM KAFKA
(
    "kafka_broker_list" = "<kafka_broker_host>:<kafka_broker_port>",
    "kafka_topic" = "topic1",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```

構文とパラメータの詳細については、[CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md) を参照してください。

### データ照会

ローカルファイルシステム、HDFS クラスタ、または Kafka クラスタからのデータロードが完了したら、`table1` のデータを照会してロードが成功したことを確認します。

```SQL
MySQL [test_db]> SELECT * FROM table1;
+------------+------------+---------+
| event_date | event_type | user_id |
+------------+------------+---------+
| 2020-05-20 |          1 |     354 |
| 2020-05-22 |          1 |     576 |
+------------+------------+---------+
2 rows in set (0.01 sec)
```

## 元の列から新しい列を生成する

StarRocks テーブルにデータファイルをロードする際、データファイルの一部のデータは、StarRocks テーブルにロードされる前に変換を必要とする場合があります。この状況では、ジョブ作成コマンドまたはステートメントで関数または式を使用してデータ変換を実装できます。

この機能は、以下のデータソースからのデータロードをサポートします。

- ローカルファイルシステム

- HDFS およびクラウドストレージ
  > **注**
  >
  > このセクションでは、HDFS を例として使用します。

- Kafka

このセクションでは、`file2.csv` と `table2` を例として使用します。`file2.csv` は日付を表す 1 つの列のみで構成されています。`file2.csv` から各日付の年、月、日を抽出するために、[year](../sql-reference/sql-functions/date-time-functions/year.md)、[month](../sql-reference/sql-functions/date-time-functions/month.md)、および [day](../sql-reference/sql-functions/date-time-functions/day.md) 関数を使用し、抽出されたデータを `table2` の `year`、`month`、`day` 列にロードできます。

### データロード

#### ローカルファイルシステムからデータをロードする

`file2.csv` がローカルファイルシステムに保存されている場合、次のコマンドを実行して [Stream Load](../loading/StreamLoad.md) ジョブを作成します。

```Bash
curl --location-trusted -u <username>:<password> \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns:date,year=year(date),month=month(date),day=day(date)" \
    -T file2.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/test_db/table2/_stream_load
```

> **注**
>
> - `columns` パラメータでは、まずデータファイルの**すべての列**に一時的な名前を付け、次にデータファイルの元の列から生成したい新しい列に一時的な名前を付ける必要があります。上記の例に示すように、`file2.csv` の唯一の列は一時的に `date` と命名され、次に `year=year(date)`、`month=month(date)`、`day=day(date)` 関数が呼び出されて、一時的に `year`、`month`、`day` と命名された 3 つの新しい列が生成されます。
>
> - Stream Load は `column_name = function(column_name)` をサポートしませんが、`column_name = function(column_name)` をサポートします。

構文とパラメータの詳細については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を参照してください。

#### HDFS クラスタからデータをロードする

`file2.csv` が HDFS クラスタに保存されている場合、次のステートメントを実行して [Broker Load](../loading/hdfs_load.md) ジョブを作成します。

```SQL
LOAD LABEL test_db.label3
(
    DATA INFILE("hdfs://<hdfs_host>:<hdfs_port>/user/starrocks/data/input/file2.csv")
    INTO TABLE `table2`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (date)
    SET(year=year(date), month=month(date), day=day(date))
)
WITH BROKER;
```

> **注**
>
> まず、`column_list` パラメータを使用してデータファイルの**すべての列**に一時的な名前を付け、次に SET 句を使用してデータファイルの元の列から生成したい新しい列に一時的な名前を付ける必要があります。上記の例に示すように、`file2.csv` の唯一の列は `column_list` パラメータで一時的に `date` と命名され、次に SET 句で `year=year(date)`、`month=month(date)`、`day=day(date)` 関数が呼び出されて、一時的に `year`、`month`、`day` と命名された 3 つの新しい列が生成されます。

構文とパラメータの詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

#### Kafka クラスタからデータをロードする

`file2.csv` のデータが Kafka クラスタの `topic2` にパブリッシュされている場合、次のステートメントを実行して [Routine Load](../loading/RoutineLoad.md) ジョブを作成します。

```SQL
CREATE ROUTINE LOAD test_db.table201 ON table2
    COLUMNS TERMINATED BY ",",
    COLUMNS(date,year=year(date),month=month(date),day=day(date))
FROM KAFKA
(
    "kafka_broker_list" = "<kafka_broker_host>:<kafka_broker_port>",
    "kafka_topic" = "topic2",
    "property.kafka_default_offsets" = "OFFSET_BEGINNING"
);
```

> **注**
>
> `COLUMNS` パラメータでは、まずデータファイルの**すべての列**に一時的な名前を付け、次にデータファイルの元の列から生成したい新しい列に一時的な名前を付ける必要があります。上記の例に示すように、`file2.csv` の唯一の列は一時的に `date` と命名され、次に `year=year(date)`、`month=month(date)`、`day=day(date)` 関数が呼び出されて、一時的に `year`、`month`、`day` と命名された 3 つの新しい列が生成されます。

構文とパラメータの詳細については、[CREATE ROUTINE LOAD](../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md) を参照してください。

### データ照会

ローカルファイルシステム、HDFS クラスタ、または Kafka クラスタからのデータロードが完了したら、`table2` のデータを照会してロードが成功したことを確認します。

```SQL
MySQL [test_db]> SELECT * FROM table2;
+------------+------+-------+------+
| date       | year | month | day  |
+------------+------+-------+------+
| 2020-05-20 | 2020 |  5    | 20   |
| 2020-05-21 | 2020 |  5    | 21   |
| 2020-05-22 | 2020 |  5    | 22   |
| 2020-05-23 | 2020 |  5    | 23   |
+------------+------+-------+------+
4 rows in set (0.01 sec)
```

## ファイルパスからパーティションフィールド値を抽出する

指定したファイルパスにパーティションフィールドが含まれている場合、`COLUMNS FROM PATH AS` パラメータを使用して、ファイルパスから抽出したいパーティションフィールドを指定できます。ファイルパス内のパーティションフィールドは、データファイル内の列と同等です。`COLUMNS FROM PATH AS` パラメータは、HDFS クラスタからデータをロードする場合にのみサポートされます。

例えば、Hive から生成された以下の 4 つのデータファイルをロードしたいとします。

```Plain
/user/starrocks/data/input/date=2020-05-20/data
1,354
/user/starrocks/data/input/date=2020-05-21/data
2,465
/user/starrocks/data/input/date=2020-05-22/data
1,576
/user/starrocks/data/input/date=2020-05-23/data
2,687
```

これら 4 つのデータファイルは、HDFS クラスタの `/user/starrocks/data/input/` パスに保存されています。これらの各データファイルは、パーティションフィールド `date` でパーティション化されており、イベントタイプとユーザー ID を順に表す 2 つの列で構成されています。

### HDFS クラスタからデータをロードする

`/user/starrocks/data/input/` ファイルパスから `date` パーティションフィールド値を抽出し、ワイルドカード (*) を使用してファイルパス内のすべてのデータファイルを `table1` にロードするように指定できる、次のステートメントを実行して [Broker Load](../loading/hdfs_load.md) ジョブを作成します。

```SQL
LOAD LABEL test_db.label4
(
    DATA INFILE("hdfs://<fe_host>:<fe_http_port>/user/starrocks/data/input/date=*/*")
    INTO TABLE `table1`
    FORMAT AS "csv"
    COLUMNS TERMINATED BY ","
    (event_type, user_id)
    COLUMNS FROM PATH AS (date)
    SET(event_date = date)
)
WITH BROKER;
```

> **注**
>
> 上記の例では、指定されたファイルパス内の `date` パーティションフィールドは `table1` の `event_date` 列と同等です。したがって、SET 句を使用して `date` パーティションフィールドを `event_date` 列にマッピングする必要があります。指定されたファイルパス内のパーティションフィールドが StarRocks テーブルの列と同じ名前である場合、SET 句を使用してマッピングを作成する必要はありません。

構文とパラメータの詳細については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

### データ照会

HDFS クラスタからのデータロードが完了したら、`table1` のデータを照会してロードが成功したことを確認します。

```SQL
MySQL [test_db]> SELECT * FROM table1;
+------------+------------+---------+
| event_date | event_type | user_id |
+------------+------------+---------+
| 2020-05-22 |          1 |     576 |
| 2020-05-20 |          1 |     354 |
| 2020-05-21 |          2 |     465 |
| 2020-05-23 |          2 |     687 |
+------------+------------+---------+
4 rows in set (0.01 sec)
```
