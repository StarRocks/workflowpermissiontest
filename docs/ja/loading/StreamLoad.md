---
displayed_sidebar: docs
keywords: ['Stream Load']
---

# ローカルファイルシステムからデータをロードする

import InsertPrivNote from '../_assets/commonMarkdown/insertPrivNote.mdx'

StarRocks は、ローカルファイルシステムからデータをロードするための2つの方法を提供します。

- [Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を使用した同期インポート
- [Broker Load](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を使用した非同期インポート

それぞれの方法には利点があります。

- Stream Load は CSV および JSON ファイル形式をサポートしています。少量のファイル（各ファイルサイズが10 GB以下）からデータをロードしたい場合は、この方法の使用をお勧めします。
- Broker Load は Parquet、ORC、CSV、および JSON ファイル形式（v3.2.3 から JSON ファイル形式をサポート）をサポートしています。大量のファイル（各ファイルサイズが10 GBを超える）からデータをロードしたい場合、またはファイルがネットワークアタッチトストレージ (NAS) デバイスに保存されている場合は、この方法の使用をお勧めします。**v2.5 から、Broker Load を使用してローカルファイルシステムからデータをロードすることがサポートされました。**

CSV データの場合、以下の点に注意してください。

- UTF-8 文字列（カンマ (,)、タブ、パイプ (|) など）を、長さ50バイト以内のテキスト区切り文字として使用できます。
- NULL 値は `\N` で表されます。たとえば、3列のデータファイルがあり、そのデータファイルの1つのレコードが1列目と3列目にはデータを含み、2列目にはデータを含まない場合、2列目には `\N` を使用して NULL 値を表す必要があります。これは、レコードが `a,\N,b` としてコンパイルされる必要があり、`a,,b` ではないことを意味します。`a,,b` は、レコードの2列目に空文字列が含まれていることを意味します。

Stream Load と Broker Load はどちらも、データインポート時のデータ変換をサポートし、データインポート中に UPSERT および DELETE 操作によるデータ変更をサポートしています。詳細については、[インポート時のデータ変換](../loading/Etl_in_loading.md) および [インポートによるデータの変更](../loading/Load_to_Primary_Key_tables.md) を参照してください。

## 前提条件

### 権限の確認

<InsertPrivNote />

#### ネットワーク設定の確認

ロードするデータが配置されているマシンが、[`http_port`](../administration/management/FE_configuration.md#http_port) (デフォルト値: `8030`) および [`be_http_port`](../administration/management/BE_configuration.md#be_http_port) (デフォルト値: `8040`) を介して StarRocks クラスターの FE ノードと BE ノードにアクセスできることを確認してください。

## Stream Load を使用してローカルファイルシステムからロードする

Stream Load は、HTTP PUT ベースの同期インポート方法です。インポートジョブを送信すると、StarRocks はそのジョブを同期的に実行し、ジョブが完了すると結果を返します。ジョブの結果に基づいて、ジョブが成功したかどうかを判断できます。

> **注意**
>
> Stream Load を使用して StarRocks テーブルにデータがインポートされると、そのテーブルに基づいて作成されたマテリアライズドビューのデータも更新されます。

### 原理

クライアント上で HTTP プロトコルに基づいて FE にインポートリクエストを送信できます。すると FE は HTTP リダイレクトを使用してインポートリクエストを特定の BE または CN に転送します。また、クライアント上で選択した BE または CN に直接インポートリクエストを送信することもできます。

:::note

FE にインポートリクエストを送信する場合、FE はポーリングメカニズムを使用して、どの BE または CN がコーディネーターとしてインポートリクエストを受け取り処理するかを決定します。ポーリングメカニズムは StarRocks クラスターの負荷分散に役立ちます。したがって、インポートリクエストは FE に送信することをお勧めします。

:::

インポートリクエストを受け取った BE または CN は、コーディネーター BE または CN として動作し、使用されているスキーマに基づいてデータを複数の部分に分割し、各部分のデータを他の関連する BE または CN に割り当てます。インポートが完了すると、コーディネーター BE または CN はインポートジョブの結果をクライアントに返します。インポート中にコーディネーター BE または CN が停止した場合、インポートジョブは失敗することに注意してください。

次の図は Stream Load ジョブのワークフローを示しています。

![Stream Load ワークフロー](../_assets/4.2-1.png)

### 制限事項

Stream Load は、JSON 形式の列を含む CSV ファイルのデータのロードをサポートしていません。

### 典型的な例

このセクションでは、curl を例にとって、ローカルファイルシステムから StarRocks に CSV または JSON ファイルのデータをロードする方法について説明します。詳細な構文とパラメータの説明については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を参照してください。

StarRocks では、一部のリテラルが SQL 言語で予約語として使用されることに注意してください。SQL ステートメントでこれらのキーワードを直接使用しないでください。SQL ステートメントでそのようなキーワードを使用したい場合は、一対のバッククォート (`) で囲んでください。[キーワード](../sql-reference/sql-statements/keywords.md) を参照してください。

#### CSV データのロード

##### データセットの準備

ローカルファイルシステムに `example1.csv` という名前の CSV ファイルを作成します。このファイルには、ユーザーID、ユーザー名、ユーザーポイントを順に表す3つの列が含まれています。

```Plain
1,Lily,23
2,Rose,23
3,Alice,24
4,Julia,25
```

##### データベースとテーブルの作成

データベースを作成し、そのデータベースに切り替えます。

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

`table1` という名前のプライマリキーテーブルを作成します。このテーブルには、`id`、`name`、`score` の3つの列が含まれており、`id` がプライマリキーです。

```SQL
CREATE TABLE `table1`
(
    `id` int(11) NOT NULL COMMENT "user ID",
    `name` varchar(65533) NULL COMMENT "user name",
    `score` int(11) NOT NULL COMMENT "user score"
)
ENGINE=OLAP
PRIMARY KEY(`id`)
DISTRIBUTED BY HASH(`id`);
```

:::note

v2.5.7 以降、StarRocks はテーブルを作成したりパーティションを追加したりする際に、バケット数 (BUCKETS) を自動的に設定できます。手動でバケット数を設定する必要はなくなりました。詳細については、[バケット数の設定](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets) を参照してください。

:::

##### Stream Load の開始

`example1.csv` のデータを `table1` にロードするために、以下のコマンドを実行します。

```Bash
curl --location-trusted -u <username>:<password> -H "label:123" \
    -H "Expect:100-continue" \
    -H "column_separator:," \
    -H "columns: id, name, score" \
    -T example1.csv -XPUT \
    http://<fe_host>:<fe_http_port>/api/mydatabase/table1/_stream_load
```

:::note

- 使用しているアカウントにパスワードが設定されていない場合は、`<username>:` のみを入力してください。
- [SHOW FRONTENDS](../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_FRONTENDS.md) を使用して、FE ノードの IP アドレスと HTTP ポートを表示できます。

:::

`example1.csv` はカンマ (,) で区切られた3つの列を含み、これらは `table1` の `id`、`name`、`score` 列に順番にマッピングできます。したがって、`column_separator` パラメータを使用してカンマ (,) を列区切り文字として指定する必要があります。また、`columns` パラメータを使用して `example1.csv` の3つの列を一時的に `id`、`name`、`score` と命名し、これらを `table1` の3つの列に順番にマッピングする必要があります。

インポートが完了したら、`table1` をクエリしてインポートが成功したかどうかを確認できます。

```SQL
SELECT * FROM table1;
+------+-------+-------+
| id   | name  | score |
+------+-------+-------+
|    1 | Lily  |    23 |
|    2 | Rose  |    23 |
|    3 | Alice |    24 |
|    4 | Julia |    25 |
+------+-------+-------+
4 rows in set (0.00 sec)
```

#### JSON データのロード

v3.2.7 以降、Stream Load は転送中の JSON データの圧縮をサポートし、ネットワーク帯域幅のオーバーヘッドを削減します。ユーザーは `compression` および `Content-Encoding` パラメータを使用して異なる圧縮アルゴリズムを指定できます。サポートされている圧縮アルゴリズムには、GZIP、BZIP2、LZ4_FRAME、ZSTD が含まれます。構文については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を参照してください。

##### データセットの準備

ローカルファイルシステムに `example2.json` という名前の JSON ファイルを作成します。このファイルには、都市 ID と都市名を順に表す2つの列が含まれています。

```JSON
{"name": "Beijing", "code": 2}
```

##### データベースとテーブルの作成

データベースを作成し、そのデータベースに切り替えます。

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

`table2` という名前のプライマリキーテーブルを作成します。このテーブルには、`id` と `city` の2つの列が含まれており、`id` がプライマリキーです。

```SQL
CREATE TABLE `table2`
(
    `id` int(11) NOT NULL COMMENT "city ID",
    `city` varchar(65533) NULL COMMENT "city name"
)
ENGINE=OLAP
PRIMARY KEY(`id`)
DISTRIBUTED BY HASH(`id`);
```

:::note

v2.5.7 以降、StarRocks はテーブルを作成したりパーティションを追加したりする際に、バケット数 (BUCKETS) を自動的に設定できます。手動でバケット数を設定する必要はなくなりました。詳細については、[バケット数の設定](../table_design/data_distribution/Data_distribution.md#set-the-number-of-buckets) を参照してください。

:::

##### Stream Load の開始

`example2.json` のデータを `table2` にロードするために、以下のコマンドを実行します。

```Bash
curl -v --location-trusted -u <username>:<password> -H "strict_mode: true" \
    -H "Expect:100-continue" \
    -H "format: json" -H "jsonpaths: [\"$.name\", \"$.code\"]" \
    -H "columns: city,tmp_id, id = tmp_id * 100" \
    -T example2.json -XPUT \
    http://<fe_host>:<fe_http_port>/api/mydatabase/table2/_stream_load
```

:::note

- 使用しているアカウントにパスワードが設定されていない場合は、`<username>:` のみを入力してください。
- [SHOW FRONTENDS](../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_FRONTENDS.md) を使用して、FE ノードの IP アドレスと HTTP ポートを表示できます。

:::

`example2.json` には、図に示すように `table2` の `id` と `city` 列にマッピングされる `name` と `code` の2つのキーが含まれています。

![JSON - 列マッピング](../_assets/4.2-2.png)

上記の図に示されているマッピングは次のように記述されます。

- StarRocks は `example2.json` の `name` と `code` キーを抽出し、それらを `jsonpaths` パラメータで宣言された `name` と `code` フィールドにマッピングします。
- StarRocks は `jsonpaths` パラメータで宣言された `name` と `code` フィールドを抽出し、それらを `columns` パラメータで宣言された `city` と `tmp_id` フィールドに**順番にマッピング**します。
- StarRocks は `columns` パラメータで宣言された `city` と `tmp_id` フィールドを抽出し、それらを `table2` の `city` と `id` 列に**名前でマッピング**します。

:::note

上記の例では、`example2.json` 内の `code` の値は、`table2` の `id` 列にロードされる前に 100 倍されています。

:::

`jsonpaths`、`columns`、および StarRocks テーブルの列間の詳細なマッピングについては、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) の「列マッピング」セクションを参照してください。

インポートが完了したら、`table2` をクエリしてインポートが成功したかどうかを確認できます。

```SQL
SELECT * FROM table2;
+------+--------+
| id   | city   |
+------+--------+
| 200  | Beijing|
+------+--------+
4 rows in set (0.01 sec)
```

import Beta from '../_assets/commonMarkdown/_beta.mdx'

#### Stream Load リクエストの結合

<Beta />

v3.4.0 以降、システムは複数の Stream Load リクエストの結合をサポートしています。

:::warning

Merge Commit の最適化は、単一テーブルに対して**同時実行**される Stream Load ジョブがあるシナリオに適用されることに注意してください。同時実行数が 1 の場合は、この最適化を使用することはお勧めしません。また、`merge_commit_async` を `false` に設定し、`merge_commit_interval_ms` を大きな値に設定する前に、慎重に検討してください。これらはインポートパフォーマンスの低下を招く可能性があります。

:::

Merge Commit は、Stream Load 向けに最適化された機能で、高並列性、小バッチ（KB から数十 MB）のリアルタイムインポートシナリオ向けに設計されています。以前のバージョンでは、各 Stream Load リクエストが1つのトランザクションと1つのデータバージョンを生成するため、高並列インポートシナリオで以下の問題が発生していました。

- データバージョンが多すぎるとクエリパフォーマンスに影響を与え、バージョン数の制限によって `too many versions` エラーが発生する可能性があります。
- コンパクションによるデータバージョンのマージは、リソース消費を増加させます。
- 小さなファイルが生成され、IOPS と I/O レイテンシーが増加します。ストレージとコンピューティングが分離されたクラスターでは、これはクラウドオブジェクトストレージのコストも増加させます。
- トランザクションマネージャーであるリーダー FE ノードが単一障害点になる可能性があります。

Merge Commit は、時間ウィンドウ内の複数の並行 Stream Load リクエストを単一のトランザクションに結合することで、これらの問題を軽減します。これにより、高並列リクエストによって生成されるトランザクションとバージョン数が減少し、インポートパフォーマンスが向上します。

Merge Commit は同期モードと非同期モードをサポートしています。それぞれのモードには長所と短所があります。ユースケースに応じて選択できます。

- **同期モード**

  サーバーは結合されたトランザクションがコミットされた後にのみ応答を返すため、インポートの成功と可視性が保証されます。

- **非同期モード**

  サーバーはデータを受信するとすぐに応答を返します。このモードではインポートの成功は保証されません。

| **モード** | **利点**                                                     | **欠点**                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 同期     | <ul><li>リクエストが戻った時点でのデータの永続性と可視性を保証します。</li><li>同じクライアントからの複数の連続したインポートリクエストが順番に実行されることを保証します。</li></ul> | クライアントからの各インポートリクエストは、サーバーが結合ウィンドウを閉じるまでブロックされます。ウィンドウが大きすぎると、単一クライアントのデータ処理能力が低下する可能性があります。 |
| 非同期     | 単一クライアントが、サーバーが結合ウィンドウを閉じるのを待たずに、後続のインポートリクエストを送信することを許可し、インポートのスループットを向上させます。 | <ul><li>応答時にデータの永続性や可視性は保証されません。クライアントは後でトランザクションの状態を確認する必要があります。</li><li>同じクライアントからの複数の連続したインポートリクエストが順番に実行されることは保証されません。</li></ul> |

##### Stream Load の開始

- Merge Commit を有効にした Stream Load ジョブ（同期モード）を開始し、結合ウィンドウを `5000` ミリ秒、並列度を `2` に設定するために、以下のコマンドを実行します。

  ```Bash
  curl --location-trusted -u <username>:<password> \
      -H "Expect:100-continue" \
      -H "column_separator:," \
      -H "columns: id, name, score" \
      -H "enable_merge_commit:true" \
      -H "merge_commit_interval_ms:5000" \
      -H "merge_commit_parallel:2" \
      -T example1.csv -XPUT \
      http://<fe_host>:<fe_http_port>/api/mydatabase/table1/_stream_load
  ```

- Merge Commit を有効にした Stream Load ジョブ（非同期モード）を開始し、結合ウィンドウを `60000` ミリ秒、並列度を `2` に設定するために、以下のコマンドを実行します。

  ```Bash
  curl --location-trusted -u <username>:<password> \
      -H "Expect:100-continue" \
      -H "column_separator:," \
      -H "columns: id, name, score" \
      -H "enable_merge_commit:true" \
      -H "merge_commit_async:true" \
      -H "merge_commit_interval_ms:60000" \
      -H "merge_commit_parallel:2" \
      -T example1.csv -XPUT \
      http://<fe_host>:<fe_http_port>/api/mydatabase/table1/_stream_load
  ```

:::note

- Merge Commit は、**同種**のインポートリクエストのみを単一のデータベースおよびテーブルに結合することをサポートします。「同種」とは、Stream Load パラメータが同じであることを意味し、これには：共通パラメータ、JSON 形式パラメータ、CSV 形式パラメータ、`opt_properties`、および Merge Commit パラメータが含まれます。
- CSV 形式のデータをロードする場合、各行が行区切り文字で終わることを確認する必要があります。`skip_header` はサポートされていません。
- サーバーはトランザクションのラベルを自動的に生成します。ラベルが指定されている場合、それは無視されます。
- Merge Commit は複数のインポートリクエストを単一のトランザクションに結合します。いずれかのリクエストにデータ品質の問題が含まれている場合、トランザクション内のすべてのリクエストは失敗します。

:::

#### Stream Load の進捗状況の確認

インポートジョブが完了すると、StarRocks はジョブの結果を JSON 形式で返します。詳細については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) の「戻り値」セクションを参照してください。

Stream Load では、SHOW LOAD ステートメントを使用してインポートジョブの結果をクエリすることはできません。

#### Stream Load ジョブのキャンセル

Stream Load では、インポートジョブをキャンセルすることはできません。インポートジョブがタイムアウトしたりエラーが発生したりした場合、StarRocks はそのジョブを自動的にキャンセルします。

### パラメータ設定

このセクションでは、インポート方法として Stream Load を選択した場合に設定する必要があるいくつかのシステムパラメータについて説明します。これらのパラメータ設定は、すべての Stream Load ジョブに適用されます。

- `streaming_load_max_mb`: ロードする各データファイルの最大サイズ。デフォルトの最大サイズは 10 GB です。詳細については、[BE または CN の動的パラメータの設定](../administration/management/BE_configuration.md) を参照してください。

  一度に 10 GB を超えるデータをロードしないことをお勧めします。データファイルのサイズが 10 GB を超える場合は、データファイルをそれぞれ 10 GB 未満の小さなファイルに分割し、それらを個別にロードすることをお勧めします。10 GB を超えるデータファイルを分割できない場合は、ファイルサイズに応じてこのパラメータの値を増やすことができます。

  このパラメータの値を増やした後、StarRocks クラスターの BE または CN を再起動しないと新しい値は有効になりません。また、システムパフォーマンスが低下する可能性があり、インポートが失敗した場合の再試行コストも増加します。

  :::note

  JSON ファイルのデータをロードする際は、以下の点に注意してください。

  - ファイル内の各 JSON オブジェクトのサイズは 4 GB を超えることはできません。ファイル内の JSON オブジェクトのいずれかが 4 GB を超える場合、StarRocks は「This parser can't support a document that big.」というエラーをスローします。

  - デフォルトでは、HTTP リクエストの JSON ボディは 100 MB を超えることはできません。JSON ボディが 100 MB を超える場合、StarRocks は「The size of this batch exceed the max size [104857600] of json type data data [8617627793]. Set ignore_json_size to skip check, although it may lead huge memory consuming.」というエラーをスローします。このエラーを防ぐには、HTTP リクエストヘッダーに `"ignore_json_size:true"` を追加して、JSON ボディのサイズチェックを無視することができます。

  :::

- `stream_load_default_timeout_second`: 各インポートジョブのタイムアウト時間。デフォルトのタイムアウト時間は 600 秒です。詳細については、[FE 動的パラメータの設定](../administration/management/FE_configuration.md#configure-fe-dynamic-parameters) を参照してください。

  作成した多くのインポートジョブがタイムアウトする場合は、以下の式から得られる計算結果に基づいてこのパラメータの値を増やすことができます。

  **各インポートジョブのタイムアウト時間 > ロードするデータ量 / 平均ロード速度**

  たとえば、ロードするデータファイルのサイズが 10 GB で、StarRocks クラスターの平均ロード速度が 100 MB/s の場合、タイムアウト時間を 100 秒より大きく設定します。

  :::note

  上記の式における**平均ロード速度**は、StarRocks クラスターの平均ロード速度です。これはディスク I/O と StarRocks クラスター内の BE または CN の数によって異なります。

  :::

  Stream Load は `timeout` パラメータも提供しており、個々のインポートジョブのタイムアウト時間を指定できます。詳細については、[STREAM LOAD](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md) を参照してください。

### 使用上の注意

ロードするデータファイル内の特定のレコードのフィールドが欠落しており、StarRocks テーブルでそのフィールドにマッピングされる列が `NOT NULL` と定義されている場合、StarRocks はそのレコードのロード中に StarRocks テーブルのマッピング列に自動的に `NULL` 値を埋めます。また、`ifnull()` 関数を使用して、埋めるデフォルト値を指定することもできます。

たとえば、上記の `example2.json` ファイルで都市 ID を表すフィールドが欠落しており、`table2` のマッピング列に `x` の値を埋めたい場合は、`"columns: city, tmp_id, id = ifnull(tmp_id, 'x')"` と指定できます。

## Broker Load を使用してローカルファイルシステムからロードする

Stream Load に加えて、Broker Load を使用してローカルファイルシステムからデータをロードすることもできます。この機能は v2.5 以降でサポートされています。

Broker Load は非同期インポート方法です。インポートジョブを送信すると、StarRocks はそのジョブを非同期で実行し、ジョブの結果をすぐに返しません。ジョブの結果を手動でクエリする必要があります。[Broker Load の進捗状況の確認](#check-broker-load-progress) を参照してください。

### 制限事項

- 現在、Broker Load は v2.5 以降のバージョンの単一の Broker を介してローカルファイルシステムからのみロードをサポートしています。
- 単一の Broker に対する高並列クエリは、タイムアウトや OOM などの問題を引き起こす可能性があります。影響を軽減するために、`pipeline_dop` 変数（[システム変数](../sql-reference/System_variable.md#pipeline_dop) を参照）を使用して Broker Load のクエリ並列度を設定できます。単一の Broker に対するクエリの場合、`pipeline_dop` を `16` 未満の値に設定することをお勧めします。

### 典型的な例

Broker Load は、単一のデータファイルから単一のテーブルへのロード、複数のデータファイルから単一のテーブルへのロード、および複数のデータファイルから複数のテーブルへのロードをサポートしています。このセクションでは、複数のデータファイルから単一のテーブルへのロードを例にとります。

StarRocks では、一部のリテラルが SQL 言語で予約語として使用されることに注意してください。SQL ステートメントでこれらのキーワードを直接使用しないでください。SQL ステートメントでそのようなキーワードを使用したい場合は、一対のバッククォート (`) で囲んでください。[キーワード](../sql-reference/sql-statements/keywords.md) を参照してください。

#### データセットの準備

CSV ファイル形式を例にとります。ローカルファイルシステムにログインし、特定の保存場所（例: `/home/disk1/business/`）に `file1.csv` と `file2.csv` という2つの CSV ファイルを作成します。これら2つのファイルはどちらも、ユーザーID、ユーザー名、ユーザーポイントを順に表す3つの列を含んでいます。

- `file1.csv`

  ```Plain
  1,Lily,21
  2,Rose,22
  3,Alice,23
  4,Julia,24
  ```

- `file2.csv`

  ```Plain
  5,Tony,25
  6,Adam,26
  7,Allen,27
  8,Jacky,28
  ```

#### データベースとテーブルの作成

データベースを作成し、そのデータベースに切り替えます。

```SQL
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;
```

`mytable` という名前のプライマリキーテーブルを作成します。このテーブルには、`id`、`name`、`score` の3つの列が含まれており、`id` がプライマリキーです。

```SQL
CREATE TABLE `mytable`
(
    `id` int(11) NOT NULL COMMENT "User ID",
    `name` varchar(65533) NULL DEFAULT "" COMMENT "User name",
    `score` int(11) NOT NULL DEFAULT "0" COMMENT "User score"
)
ENGINE=OLAP
PRIMARY KEY(`id`)
DISTRIBUTED BY HASH(`id`)
PROPERTIES("replication_num"="1");
```

#### Broker Load の開始

以下のコマンドを実行して Broker Load ジョブを開始します。このジョブは、ローカルファイルシステムの `/home/disk1/business/` パスに保存されているすべてのデータファイル（`file1.csv` および `file2.csv`）のデータを StarRocks テーブル `mytable` にロードします。

```SQL
LOAD LABEL mydatabase.label_local
(
    DATA INFILE("file:///home/disk1/business/csv/*")
    INTO TABLE mytable
    COLUMNS TERMINATED BY ","
    (id, name, score)
)
WITH BROKER "sole_broker"
PROPERTIES
(
    "timeout" = "3600"
);
```

このジョブには4つの主要な部分があります。

- `LABEL`: インポートジョブの状態をクエリするための文字列。
- `LOAD` 宣言: ソース URI、ソースデータ形式、およびターゲットテーブル名。
- `PROPERTIES`: タイムアウト値およびインポートジョブに適用するその他のプロパティ。

詳細な構文とパラメータの説明については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

#### Broker Load の進捗状況の確認

v3.0 以前のバージョンでは、[SHOW LOAD](../sql-reference/sql-statements/loading_unloading/SHOW_LOAD.md) ステートメントまたは curl コマンドを使用して Broker Load ジョブの進捗状況を確認します。

v3.1 以降のバージョンでは、[`information_schema.loads`](../sql-reference/information_schema/loads.md) ビューから Broker Load ジョブの進捗状況を確認できます。

```SQL
SELECT * FROM information_schema.loads;
```

複数のインポートジョブを送信した場合は、そのジョブに関連付けられている `LABEL` でフィルタリングできます。例:

```SQL
SELECT * FROM information_schema.loads WHERE LABEL = 'label_local';
```

インポートジョブが完了したことを確認したら、テーブルをクエリしてデータが正常にロードされたかどうかを確認できます。例:

```SQL
SELECT * FROM mytable;
+------+-------+-------+
| id   | name  | score |
+------+-------+-------+
|    3 | Alice |    23 |
|    5 | Tony  |    25 |
|    6 | Adam  |    26 |
|    1 | Lily  |    21 |
|    2 | Rose  |    22 |
|    4 | Julia |    24 |
|    7 | Allen |    27 |
|    8 | Jacky |    28 |
+------+-------+-------+
8 rows in set (0.07 sec)
```

#### Broker Load ジョブのキャンセル

インポートジョブが **CANCELLED** または **FINISHED** 状態でない場合、[CANCEL LOAD](../sql-reference/sql-statements/loading_unloading/CANCEL_LOAD.md) ステートメントを使用してそのジョブをキャンセルできます。

たとえば、データベース `mydatabase` 内の `label_local` というラベルのインポートジョブをキャンセルするには、以下のステートメントを実行します。

```SQL
CANCEL LOAD
FROM mydatabase
WHERE LABEL = "label_local";
```

## Broker Load を使用して NAS からロードする

Broker Load を使用して NAS からデータをロードする方法は2つあります。

- NAS をローカルファイルシステムとみなし、Broker を使用してインポートジョブを実行します。前のセクション「[Broker Load を使用してローカルファイルシステムからロードする](#loading-from-a-local-file-system-via-broker-load)」を参照してください。
- （推奨）NAS をクラウドストレージシステムとみなし、Broker なしでインポートジョブを実行します。

このセクションでは2番目の方法について説明します。詳細な操作は次のとおりです。

1. NAS デバイスを StarRocks クラスターのすべての BE ノードまたは CN ノードと FE ノード上の同じパスにマウントします。これにより、すべての BE または CN は、自身のローカルストレージにあるファイルにアクセスするのと同じように NAS デバイスにアクセスできます。

2. Broker Load を使用して、NAS デバイスからターゲット StarRocks テーブルにデータをロードします。例:

   ```SQL
   LOAD LABEL test_db.label_nas
   (
       DATA INFILE("file:///home/disk1/sr/*")
       INTO TABLE mytable
       COLUMNS TERMINATED BY ","
   )
   WITH BROKER
   PROPERTIES
   (
       "timeout" = "3600"
   );
   ```

   このジョブには4つの主要な部分があります。

   - `LABEL`: インポートジョブの状態をクエリするための文字列。
   - `LOAD` 宣言: ソース URI、ソースデータ形式、およびターゲットテーブル名。宣言内の `DATA INFILE` は NAS デバイスのマウントポイントフォルダパスを指定するために使用されることに注意してください。上記の例では、`file:///` がプレフィックスで、`/home/disk1/sr` がマウントポイントフォルダパスです。
   - `BROKER`: Broker 名を指定する必要はありません。
   - `PROPERTIES`: タイムアウト値およびインポートジョブに適用するその他のプロパティ。

   詳細な構文とパラメータの説明については、[BROKER LOAD](../sql-reference/sql-statements/loading_unloading/BROKER_LOAD.md) を参照してください。

ジョブを送信した後、必要に応じてインポートの進捗状況を確認したり、ジョブをキャンセルしたりできます。詳細な操作については、このトピックの「[Broker Load の進捗状況の確認](#check-broker-load-progress)」と「[Broker Load ジョブのキャンセル](#cancel-a-broker-load-job)」を参照してください。
