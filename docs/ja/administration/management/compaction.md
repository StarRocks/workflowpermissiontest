---
displayed_sidebar: docs
---

# 共有データクラスターのCompaction

このトピックでは、StarRocksの共有データクラスターでCompactionを管理する方法について説明します。

## 概要

StarRocksでの各データロード操作は、データファイルの新しいバージョンを生成します。Compactionは、異なるバージョンのデータファイルをより大きなファイルにマージし、小さなファイルの数を減らしてクエリ効率を向上させます。

## Compaction Score

### 概要

*Compaction Score* は、パーティション内のデータファイルのマージ状況を反映します。スコアが高いほどマージの進行度が低いことを示し、パーティションに未マージのデータファイルバージョンがより多く存在することを意味します。FEは、各パーティションのCompaction Score情報を維持しており、これにはMax Compaction Score（パーティション内のすべてのTabletで最も高いスコア）が含まれます。

パーティションのMax Compaction ScoreがFEパラメーター `lake_compaction_score_selector_min_score` (デフォルト: 10) を下回る場合、そのパーティションのCompactionは完了していると見なされます。Max Compaction Scoreが100を超える場合は、Compactionが不健全な状態であることを示します。スコアがFEパラメーター `lake_ingest_slowdown_threshold` (デフォルト: 100) を超えると、システムはそのパーティションのデータロードトランザクションコミットを減速させます。 `lake_compaction_score_upper_bound` (デフォルト: 2000) を超えた場合、システムはそのパーティションのインポートトランザクションを拒否します。

### 計算ルール

通常、各データファイルはCompaction Scoreに1貢献します。たとえば、パーティションに1つのTabletがあり、最初のロード操作で生成されたデータファイルが10個ある場合、パーティションのMax Compaction Scoreは10です。Tablet内でトランザクションによって生成されたすべてのデータファイルは、Rowsetとしてグループ化されます。

スコア計算中、TabletのRowsetはサイズ別にグループ化され、ファイル数が最も多いグループがTabletのCompaction Scoreを決定します。

たとえば、Tabletが7回のロード操作を経て、100 MB、100 MB、100 MB、10 MB、10 MB、10 MB、10 MBというサイズのRowsetを生成します。計算中、システムは3つの100 MBのRowsetを1つのグループにし、4つの10 MBのRowsetを別のグループにします。Compaction Scoreは、より多くのファイルを持つグループに基づいて計算されます。この場合、2番目のグループの方がCompaction Scoreが高くなります。Compactionはスコアが高いグループを優先するため、最初のCompaction後、Rowsetの分布は100 MB、100 MB、100 MB、および40 MBになります。

## Compactionワークフロー

共有データクラスターの場合、StarRocksはFEによって制御される新しいCompactionメカニズムを導入しています。

1.  **スコア計算**: Leader FEノードは、トランザクションの公開結果に基づいて、パーティションのCompaction Scoreを計算し保存します。
2.  **候補選択**: FEは、最も高いMax Compaction Scoreを持つパーティションをCompaction候補として選択します。
3.  **タスク生成**: FEは、選択されたパーティションに対してCompactionトランザクションを開始し、Tabletレベルのサブタスクを生成し、FEパラメーター `lake_compaction_max_tasks` で設定された制限に達するまでCompute Nodes (CNs) にディスパッチします。
4.  **サブタスク実行**: CNsはバックグラウンドでCompactionサブタスクを実行します。CNごとの同時サブタスクの数は、CNパラメーター `compact_threads` によって制御されます。
5.  **結果収集**: FEはサブタスクの結果を集計し、Compactionトランザクションをコミットします。
6.  **公開**: FEは、正常にコミットされたCompactionトランザクションを公開します。

## Compactionの管理

### Compaction Scoreの表示

-   `SHOW PROC` ステートメントを使用して、特定のテーブルのパーティションのCompaction Scoreを表示できます。通常、`MaxCS` フィールドにのみ注目すれば十分です。`MaxCS` が10未満の場合、Compactionは完了していると見なされます。`MaxCS` が100を超える場合、Compaction Scoreは比較的高くなります。`MaxCS` が500を超える場合、Compaction Scoreは非常に高く、手動での介入が必要になる場合があります。

    ```Plain
    SHOW PARTITIONS FROM <table_name>
    SHOW PROC '/dbs/<database_name>/<table_name>/partitions'
    ```

    例:

    ```Plain
    mysql> SHOW PROC '/dbs/load_benchmark/store_sales/partitions';
    +-------------+---------------+----------------+----------------+-------------+--------+--------------+-------+------------------------------+---------+----------+-----------+----------+------------+-------+-------+-------+
    | PartitionId | PartitionName | CompactVersion | VisibleVersion | NextVersion | State  | PartitionKey | Range | DistributionKey              | Buckets | DataSize | RowCount  | CacheTTL | AsyncWrite | AvgCS | P50CS | MaxCS |
    +-------------+---------------+----------------+----------------+-------------+--------+--------------+-------+------------------------------+---------+----------+-----------+----------+------------+-------+-------+-------+
    | 38028       | store_sales   | 913            | 921            | 923         | NORMAL |              |       | ss_item_sk, ss_ticket_number | 64      | 15.6GB   | 273857126 | 2592000  | false      | 10.00 | 10.00 | 10.00 |
    +-------------+---------------+----------------+----------------+-------------+--------+--------------+-------+------------------------------+---------+----------+-----------+----------+------------+-------+-------+-------+
    1 row in set (0.20 sec)
    ```

-   システム定義ビュー `information_schema.partitions_meta` をクエリして、パーティションのCompaction Scoreを表示することもできます。

    例:

    ```Plain
    mysql> SELECT * FROM information_schema.partitions_meta ORDER BY Max_CS LIMIT 10;
    +--------------+----------------------------+----------------------------+--------------+-----------------+-----------------+----------------------+--------------+---------------+-----------------+-----------------------------------------+---------+-----------------+----------------+---------------------+-----------------------------+--------------+---------+-----------+------------+------------------+----------+--------+--------+-------------------------------------------------------------------+
    | DB_NAME      | TABLE_NAME                 | PARTITION_NAME             | PARTITION_ID | COMPACT_VERSION | VISIBLE_VERSION | VISIBLE_VERSION_TIME | NEXT_VERSION | PARTITION_KEY | PARTITION_VALUE | DISTRIBUTION_KEY                        | BUCKETS | REPLICATION_NUM | STORAGE_MEDIUM | COOLDOWN_TIME       | LAST_CONSISTENCY_CHECK_TIME | IS_IN_MEMORY | IS_TEMP | DATA_SIZE | ROW_COUNT  | ENABLE_DATACACHE | AVG_CS   | P50_CS | MAX_CS | STORAGE_PATH                                                      |
    +--------------+----------------------------+----------------------------+--------------+-----------------+-----------------+----------------------+--------------+---------------+-----------------+-----------------------------------------+---------+-----------------+----------------+---------------------+-----------------------------+--------------+---------+-----------+------------+------------------+----------+--------+--------+-------------------------------------------------------------------+
    | tpcds_1t     | call_center                | call_center                |        11905 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | cc_call_center_sk                       |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 12.3KB    |         42 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11906/11905 |
    | tpcds_1t     | web_returns                | web_returns                |        12030 |               3 |               3 | 2024-03-17 08:40:48  |            4 |               |                 | wr_item_sk, wr_order_number             |      16 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 3.5GB     |   71997522 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/12031/12030 |
    | tpcds_1t     | warehouse                  | warehouse                  |        11847 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | w_warehouse_sk                          |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 4.2KB     |         20 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11848/11847 |
    | tpcds_1t     | ship_mode                  | ship_mode                  |        11851 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | sm_ship_mode_sk                         |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 1.7KB     |         20 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11852/11851 |
    | tpcds_1t     | customer_address           | customer_address           |        11790 |               0 |               2 | 2024-03-17 08:32:19  |            3 |               |                 | ca_address_sk                           |      16 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 120.9MB   |    6000000 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11791/11790 |
    | tpcds_1t     | time_dim                   | time_dim                   |        11855 |               0 |               2 | 2024-03-17 08:30:48  |            3 |               |                 | t_time_sk                               |      16 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 864.7KB   |      86400 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11856/11855 |
    | tpcds_1t     | web_sales                  | web_sales                  |        12049 |               3 |               3 | 2024-03-17 10:14:20  |            4 |               |                 | ws_item_sk, ws_order_number             |     128 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 47.7GB    |  720000376 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/12050/12049 |
    | tpcds_1t     | store                      | store                      |        11901 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | s_store_sk                              |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 95.6KB    |       1002 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11902/11901 |
    | tpcds_1t     | web_site                   | web_site                   |        11928 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | web_site_sk                             |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 13.4KB    |         54 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11929/11928 |
    | tpcds_1t     | household_demographics     | household_demographics     |        11932 |               0 |               2 | 2024-03-17 08:30:47  |            3 |               |                 | hd_demo_sk                              |       1 |               1 | HDD            | 9999-12-31 23:59:59 | NULL                        |            0 |       0 | 2.1KB     |       7200 |                0 |        0 |      0 |      0 | s3://XXX/536a3c77-52c3-485a-8217-781734a970b1/db10328/11933/11932 |
    +--------------+----------------------------+----------------------------+--------------+-----------------+-----------------+----------------------+--------------+---------------+-----------------+-----------------------------------------+---------+-----------------+----------------+---------------------+-----------------------------+--------------+---------+-----------+------------+------------------+----------+--------+--------+-------------------------------------------------------------------+
    ```

### Compactionタスクの表示

システムに新しいデータがロードされると、FEは異なるCNノードで実行されるCompactionタスクを常にスケジューリングします。最初にFEでCompactionタスクの一般的なステータスを表示し、次にCNで各タスクの実行詳細を表示できます。

#### Compactionタスクの一般的なステータスを表示する

`SHOW PROC` ステートメントを使用して、Compactionタスクの一般的なステータスを表示できます。

```SQL
SHOW PROC '/compactions';
```

例:

```Plain
mysql> SHOW PROC '/compactions';
+---------------------+-------+---------------------+---------------------+---------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Partition           | TxnID | StartTime           | CommitTime          | FinishTime          | Error | Profile                                                                                                                                                                                                              |
+---------------------+-------+---------------------+---------------------+---------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ssb.lineorder.10081 | 15    | 2026-01-10 03:29:07 | 2026-01-10 03:29:11 | 2026-01-10 03:29:12 | NULL  | {"sub_task_count":12,"read_local_sec":0,"read_local_mb":218,"read_remote_sec":0,"read_remote_mb":0,"read_segment_count":120,"write_segment_count":12,"write_segment_mb":219,"write_remote_sec":4,"in_queue_sec":18} |
| ssb.lineorder.10068 | 16    | 2026-01-10 03:29:07 | 2026-01-10 03:29:13 | 2026-01-10 03:29:14 | NULL  | {"sub_task_count":12,"read_local_sec":0,"read_local_mb":218,"read_remote_sec":0,"read_remote_mb":0,"read_segment_count":120,"write_segment_count":12,"write_segment_mb":218,"write_remote_sec":4,"in_queue_sec":38} |
| ssb.lineorder.10055 | 20    | 2026-01-10 03:29:11 | 2026-01-10 03:29:15 | 2026-01-10 03:29:17 | NULL  | {"sub_task_count":12,"read_local_sec":0,"read_local_mb":218,"read_remote_sec":0,"read_remote_mb":0,"read_segment_count":120,"write_segment_count":12,"write_segment_mb":218,"write_remote_sec":4,"in_queue_sec":23} |
+---------------------+-------+---------------------+---------------------+---------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

以下のフィールドが返されます。

-   `Partition`: Compactionタスクが属するパーティション。
-   `TxnID`: Compactionタスクに割り当てられたトランザクションID。
-   `StartTime`: Compactionタスクが開始された時刻。`NULL` は、タスクがまだ開始されていないことを示します。
-   `CommitTime`: Compactionタスクがデータをコミットした時刻。`NULL` は、データがまだコミットされていないことを示します。
-   `FinishTime`: Compactionタスクがデータを公開した時刻。`NULL` は、データがまだ公開されていないことを示します。
-   `Error`: Compactionタスクのエラーメッセージ（もしあれば）。
-   `Profile`: (v3.2.12およびv3.3.4以降でサポート) 完了後のCompactionタスクのProfile。
    -   `sub_task_count`: パーティション内のサブタスク（Tabletに相当）の数。
    -   `read_local_sec`: すべてのサブタスクがローカルキャッシュからデータを読み取るのにかかった合計時間。単位: 秒。
    -   `read_local_mb`: すべてのサブタスクがローカルキャッシュから読み取ったデータの合計サイズ。単位: MB。
    -   `read_remote_sec`: すべてのサブタスクがリモートストレージからデータを読み取るのにかかった合計時間。単位: 秒。
    -   `read_remote_mb`: すべてのサブタスクがリモートストレージから読み取ったデータの合計サイズ。単位: MB。
    -   `read_segment_count`: すべてのサブタスクによって読み取られたファイルの総数。
    -   `write_segment_count`: すべてのサブタスクによって生成された新しいファイルの総数。
    -   `write_segment_mb`: すべてのサブタスクによって生成された新しいファイルの合計サイズ。単位: MB。
    -   `write_remote_sec`: すべてのサブタスクがリモートストレージにデータを書き込むのにかかった合計時間。単位: 秒。
    -   `in_queue_sec`: すべてのサブタスクがキューに滞留した合計時間。単位: 秒。

#### Compactionタスクの実行詳細を表示する

各Compactionタスクは複数のサブタスクに分割され、それぞれがTabletに対応します。システム定義ビュー `information_schema.be_cloud_native_compactions` をクエリして、各サブタスクの実行詳細を表示できます。

例:

```Plain
mysql> SELECT * FROM information_schema.be_cloud_native_compactions;
+-------+--------+-----------+---------+---------+------+---------------------+-------------+----------+--------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| BE_ID | TXN_ID | TABLET_ID | VERSION | SKIPPED | RUNS | START_TIME          | FINISH_TIME | PROGRESS | STATUS | PROFILE                                                                                                                                                                                         |
+-------+--------+-----------+---------+---------+------+---------------------+-------------+----------+--------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 10001 |  51047 |     43034 |      12 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       82 |        | {"read_local_sec":0,"read_local_mb":31,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
| 10001 |  51048 |     43032 |      12 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       82 |        | {"read_local_sec":0,"read_local_mb":32,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
| 10001 |  51049 |     43033 |      12 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       82 |        | {"read_local_sec":0,"read_local_mb":31,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
| 10001 |  51051 |     43038 |       9 |       0 |    1 | 2024-09-24 19:15:15 | NULL        |       84 |        | {"read_local_sec":0,"read_local_mb":31,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":1900,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0} |
| 10001 |  51052 |     43036 |      12 |       0 |    0 | NULL                | NULL        |        0 |        |                                                                                                                                                                                                 |
| 10001 |  51053 |     43035 |      12 |       0 |    1 | 2024-09-24 19:15:16 | NULL        |        2 |        | {"read_local_sec":0,"read_local_mb":1,"read_remote_sec":0,"read_remote_mb":0,"read_remote_count":0,"read_local_count":100,"segment_init_sec":0,"column_iterator_init_sec":0,"in_queue_sec":0}   |
+-------+--------+-----------+---------+---------+------+---------------------+-------------+----------+--------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

以下のフィールドが返されます。

-   `BE_ID`: CNのID。
-   `TXN_ID`: サブタスクが属するトランザクションのID。
-   `TABLET_ID`: サブタスクが属するTabletのID。
-   `VERSION`: Tabletのバージョン。
-   `RUNS`: サブタスクが実行された回数。
-   `START_TIME`: サブタスクが開始された時刻。
-   `FINISH_TIME`: サブタスクが完了した時刻。
-   `PROGRESS`: TabletのCompaction進捗状況（パーセンテージ）。
-   `STATUS`: サブタスクのステータス。エラーがある場合は、このフィールドにエラーメッセージが返されます。
-   `PROFILE`: (v3.2.12およびv3.3.4以降でサポート) サブタスクのランタイムプロファイル。
    -   `read_local_sec`: サブタスクがローカルキャッシュからデータを読み取るのにかかった時間。単位: 秒。
    -   `read_local_mb`: サブタスクがローカルキャッシュから読み取ったデータのサイズ。単位: MB。
    -   `read_remote_sec`: サブタスクがリモートストレージからデータを読み取るのにかかった時間。単位: 秒。
    -   `read_remote_mb`: サブタスクがリモートストレージから読み取ったデータのサイズ。単位: MB。
    -   `read_local_count`: サブタスクがローカルキャッシュからデータを読み取った回数。
    -   `read_remote_count`: サブタスクがリモートストレージからデータを読み取った回数。
    -   `in_queue_sec`: サブタスクがキューに滞留した時間。単位: 秒。

### Compactionタスクの設定

これらのFEおよびCN (BE) パラメーターを使用してCompactionタスクを設定できます。

#### FEパラメーター

以下のFEパラメーターは動的に設定できます。

```SQL
ADMIN SET FRONTEND CONFIG ("lake_compaction_max_tasks" = "-1");
```

##### lake_compaction_max_tasks

-   デフォルト: -1
-   タイプ: Int
-   単位: -
-   変更可能: はい
-   説明: 共有データクラスターで許可される同時Compactionタスクの最大数。この項目を`-1`に設定すると、生存しているCNノードの数に16を掛けた値として、同時タスク数を適応的に計算することを示します。この値を`0`に設定すると、Compactionが無効になります。
-   導入バージョン: v3.1.0

```SQL
ADMIN SET FRONTEND CONFIG ("lake_compaction_disable_tables" = "11111;22222");
```

##### lake_compaction_disable_tables

-   デフォルト: ""
-   タイプ: String
-   単位: -
-   変更可能: はい
-   説明: 特定のテーブルのCompactionを無効にします。これは開始済みのCompactionには影響しません。この項目の値はテーブルIDです。複数の値は`;`で区切られます。
-   導入バージョン: v3.2.7

#### CNパラメーター

以下のCNパラメーターは動的に設定できます。

```SQL
UPDATE information_schema.be_configs SET VALUE = 8 
WHERE name = "compact_threads";
```

##### compact_threads

-   デフォルト: 4
-   タイプ: Int
-   単位: -
-   変更可能: はい
-   説明: 同時Compactionタスクに使用されるスレッドの最大数。この設定は、v3.1.7およびv3.2.2以降で動的に変更可能になりました。
-   導入バージョン: v3.0.0

> **注記**
>
> 本番環境では、`compact_threads` をBE/CNのCPUコア数の25%に設定することをお勧めします。

##### max_cumulative_compaction_num_singleton_deltas

-   デフォルト: 500
-   タイプ: Int
-   単位: -
-   変更可能: はい
-   説明: 単一のCumulative Compactionでマージできるセグメントの最大数。Compaction中にOOMが発生する場合、この値を減らすことができます。
-   導入バージョン: -

> **注記**
>
> 本番環境では、Compactionタスクを高速化し、リソース消費を削減するために、`max_cumulative_compaction_num_singleton_deltas` を `100` に設定することをお勧めします。

##### lake_pk_compaction_max_input_rowsets

-   デフォルト: 500
-   タイプ: Int
-   単位: -
-   変更可能: はい
-   説明: 共有データクラスターのPrimary KeyテーブルのCompactionタスクで許可される入力Rowsetの最大数。このパラメーターのデフォルト値は、v3.2.4およびv3.1.10以降で`5`から`1000`に、v3.3.1およびv3.2.9以降で`500`に変更されました。Primary Keyテーブルでサイズ階層型Compactionポリシーが有効化された後 (`enable_pk_size_tiered_compaction_strategy` を `true` に設定することで)、StarRocksは書き込み増幅を減らすために各CompactionのRowset数を制限する必要がなくなりました。したがって、このパラメーターのデフォルト値は増加しています。
-   導入バージョン: v3.1.8, v3.2.3

> **注記**
>
> 本番環境では、Compactionタスクを高速化し、リソース消費を削減するために、`max_cumulative_compaction_num_singleton_deltas` を `100` に設定することをお勧めします。

### 手動でCompactionタスクをトリガーする

```SQL
-- テーブル全体に対してCompactionをトリガーします。
ALTER TABLE <table_name> COMPACT;
-- 特定のパーティションに対してCompactionをトリガーします。
ALTER TABLE <table_name> COMPACT <partition_name>;
-- 複数のパーティションに対してCompactionをトリガーします。
ALTER TABLE <table_name> COMPACT (<partition_name>, <partition_name>, ...);
```

### Compactionタスクのキャンセル

タスクのトランザクションIDを使用して、Compactionタスクを手動でキャンセルできます。

```SQL
CANCEL COMPACTION WHERE TXN_ID = <TXN_ID>;
```

> **注記**
>
> -   `CANCEL COMPACTION` ステートメントはLeader FEノードから送信する必要があります。
> -   `CANCEL COMPACTION` ステートメントは、まだコミットされていないトランザクション、つまり `SHOW PROC '/compactions'` の戻り値で `CommitTime` がNULLであるトランザクションにのみ適用されます。
> -   `CANCEL COMPACTION` は非同期プロセスです。タスクがキャンセルされたかどうかは、`SHOW PROC '/compactions'` を実行して確認できます。

## ベストプラクティス

Compactionはクエリパフォーマンスにとって非常に重要であるため、テーブルとパーティションのデータマージ状況を定期的に監視することをお勧めします。以下にいくつかのベストプラクティスとガイドラインを示します。

-   ロード間の時間間隔を長くし（10秒未満の間隔のシナリオは避ける）、ロードあたりのバッチサイズを大きくするよう努めます（100行未満のデータバッチは避ける）。
-   CN上の並列Compactionワーカー スレッドの数を調整して、タスクの実行を高速化します。本番環境では、`compact_threads` をBE/CNのCPUコア数の25%に設定することをお勧めします。
-   `show proc '/compactions'` および `select * from information_schema.be_cloud_native_compactions;` を使用してCompactionタスクのステータスを監視します。
-   Compaction Scoreを監視し、それに基づいてアラートを設定します。StarRocksの組み込みGrafana監視テンプレートには、このメトリックが含まれています。
-   Compaction中のリソース消費、特にメモリ使用量に注意してください。Grafana監視テンプレートには、このメトリックも含まれています。

## トラブルシューティング

### 遅いクエリ

適時でないCompactionによって引き起こされる遅いクエリを特定するには、SQL Profileで、単一のFragment内の `SegmentsReadCount` を `TabletCount` で割った値を確認できます。その値が数十以上のような大きな値である場合、Compactionが適時でないことが遅いクエリの原因である可能性があります。

### クラスター内の高いMax Compaction Score

1.  `ADMIN SHOW FRONTEND CONFIG LIKE "%lake_compaction%"` および `SELECT * FROM information_schema.be_configs WHERE name = "compact_threads"` を使用して、Compaction関連のパラメーターが適切な範囲内にあるかどうかを確認します。
2.  `SHOW PROC '/compactions'` を使用してCompactionがスタックしているかどうかを確認します。
    -   `CommitTime` がNULLのままである場合、システムビュー `information_schema.be_cloud_native_compactions` を調べてCompactionがスタックしている理由を確認します。
    -   `FinishTime` がNULLのままである場合、Leader FEログで `TxnID` を使用して公開失敗の理由を検索します。
3.  `SHOW PROC '/compactions'` を使用してCompactionが遅く実行されているかどうかを確認します。
    -   `sub_task_count` が大きすぎる場合（`SHOW PARTITIONS` を使用してこのパーティション内の各Tabletのサイズを確認）、テーブルが不適切に作成されている可能性があります。
    -   `read_remote_mb` が大きすぎる場合（読み取りデータの合計の30%を超える場合）、サーバーのディスクサイズを確認し、`SHOW BACKENDS` で `DataCacheMetrics` フィールドを通じてキャッシュクォータも確認します。
    -   `write_remote_sec` が大きすぎる場合（Compactionの合計時間の90%を超える場合）、リモートストレージへの書き込みが遅すぎる可能性があります。これは、キーワード `single upload latency` および `multi upload latency` を含む共有データ固有の監視メトリックを確認することで検証できます。
    -   `in_queue_sec` が大きすぎる場合（Tabletあたりの平均待機時間が60秒を超える場合）、パラメーター設定が不適切であるか、他の実行中のCompactionが遅すぎる可能性があります。
---
