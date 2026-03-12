---
displayed_sidebar: docs
---

# BEおよびCNブラックリストの管理

v3.3.0以降、StarRocksはBEブラックリスト機能をサポートしており、クエリ実行における特定のBEノードの使用を禁止することで、BEノードへの接続失敗によって引き起こされる頻繁なクエリ失敗やその他の予期せぬ動作を回避できます。1つ以上のBEへの接続を妨げるネットワーク問題が、ブラックリストを使用する例となるでしょう。

v4.0以降、StarRocksはCompute Node（CN）をブラックリストに追加することをサポートしています。

デフォルトでは、StarRocksはBEおよびCNブラックリストを自動的に管理し、接続が失われたBEまたはCNノードをブラックリストに追加し、接続が再確立されたときにブラックリストから削除します。ただし、手動でブラックリストに追加されたノードは、StarRocksによってブラックリストから削除されることはありません。

:::note

- SYSTEMレベルのBLACKLIST権限を持つユーザーのみがこの機能を使用できます。
- 各FEノードは独自のBEおよびCNブラックリストを保持し、他のFEノードとは共有しません。

:::

## BE/CNをブラックリストに追加する

[ADD BACKEND/COMPUTE NODE BLACKLIST](../../sql-reference/sql-statements/cluster-management/nodes_processes/ADD_BACKEND_BLACKLIST.md)を使用して、BE/CNノードを手動でブラックリストに追加できます。このステートメントでは、ブラックリストに追加するBE/CNノードのIDを指定する必要があります。[SHOW BACKENDS](../../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_BACKENDS.md)を実行してBE IDを、[SHOW COMPUTE NODES](../../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_COMPUTE_NODES.md)を実行してCN IDを取得できます。

例:

```SQL
-- BE IDを取得する。
SHOW BACKENDS\G
*************************** 1. row ***************************
            BackendId: 10001
                   IP: xxx.xx.xx.xxx
                   ...
-- BEをブラックリストに追加する。
ADD BACKEND BLACKLIST 10001;

-- CN IDを取得する。
SHOW COMPUTE NODES\G
*************************** 1. row ***************************
        ComputeNodeId: 10005
                   IP: xxx.xx.xx.xxx
                   ...
-- CNをブラックリストに追加する。
ADD COMPUTE NODE BLACKLIST 10005;
```

## ブラックリストからBE/CNを削除する

[DELETE BACKEND/COMPUTE NODE BLACKLIST](../../sql-reference/sql-statements/cluster-management/nodes_processes/DELETE_BACKEND_BLACKLIST.md)を使用して、BE/CNノードを手動でブラックリストから削除できます。このステートメントでは、BE/CNノードのIDも指定する必要があります。

例:

```SQL
-- ブラックリストからBEを削除する。
DELETE BACKEND BLACKLIST 10001;

-- ブラックリストからCNを削除する。
DELETE COMPUTE NODE BLACKLIST 10005;
```

## BE/CNブラックリストを表示する

[SHOW BACKEND/COMPUTE NODE BLACKLIST](../../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_BACKEND_BLACKLIST.md)を使用して、ブラックリスト内のBE/CNノードを表示できます。

例:

```SQL
-- BEブラックリストを表示する。
SHOW BACKEND BLACKLIST;
+-----------+------------------+---------------------+------------------------------+--------------------+
| BackendId | AddBlackListType | LostConnectionTime  | LostConnectionNumberInPeriod | CheckTimePeriod(s) |
+-----------+------------------+---------------------+------------------------------+--------------------+
| 10001     | MANUAL           | 2024-04-28 11:52:09 | 0                            | 5                  |
+-----------+------------------+---------------------+------------------------------+--------------------+

-- CNブラックリストを表示する。
SHOW COMPUTE NODE BLACKLIST;
+---------------+------------------+---------------------+------------------------------+--------------------+
| ComputeNodeId | AddBlackListType | LostConnectionTime  | LostConnectionNumberInPeriod | CheckTimePeriod(s) |
+---------------+------------------+---------------------+------------------------------+--------------------+
| 10005         | MANUAL           | 2025-08-18 10:47:51 | 0                            | 5                  |
+---------------+------------------+---------------------+------------------------------+--------------------+
```

以下のフィールドが返されます:

- `AddBlackListType`: BE/CNノードがブラックリストに追加された方法。`MANUAL`はユーザーによって手動でブラックリストに追加されたことを示します。`AUTO`はStarRocksによって自動的にブラックリストに追加されたことを示します。
- `LostConnectionTime`:
  - `MANUAL`タイプの場合、BE/CNノードが手動でブラックリストに追加された時間を示します。
  - `AUTO`タイプの場合、最後に正常な接続が確立された時間を示します。
- `LostConnectionNumberInPeriod`: `CheckTimePeriod(s)`内に検出された切断の数。これは、StarRocksがブラックリスト内のBE/CNノードの接続状態をチェックする間隔です。
- `CheckTimePeriod(s)`: StarRocksがブラックリストに登録されたBE/CNノードの接続状態をチェックする間隔。その値は、FE構成項目`black_host_history_sec`に指定した値に評価されます。単位: 秒。

## BE/CNブラックリストの自動管理を設定する

BE/CNノードがFEノードとの接続を失うたび、またはBE/CNノードでのタイムアウトによりクエリが失敗するたびに、FEノードはそのBE/CNノードを独自のBEおよびCNブラックリストに追加します。FEノードは、一定期間内の接続失敗数を数えることにより、ブラックリスト内のBE/CNノードの接続性を常に評価します。StarRocksは、接続失敗数が事前に指定されたしきい値を下回る場合にのみ、ブラックリストに登録されたBE/CNノードを削除します。

以下の[FE構成](./FE_configuration.md)を使用して、BEおよびCNブラックリストの自動管理を設定できます。

- `black_host_history_sec`: ブラックリスト内のBE/CNノードの過去の接続失敗を保持する期間。
- `black_host_connect_failures_within_time`: ブラックリストに登録されたBE/CNノードに許容される接続失敗のしきい値。

BE/CNノードが自動的にブラックリストに追加された場合、StarRocksはその接続性を評価し、ブラックリストから削除できるかどうかを判断します。`black_host_history_sec`の期間内で、ブラックリストに登録されたBE/CNノードの接続失敗数が`black_host_connect_failures_within_time`で設定されたしきい値よりも少ない場合にのみ、ブラックリストから削除できます。
