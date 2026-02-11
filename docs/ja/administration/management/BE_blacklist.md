---
displayed_sidebar: docs
---

# BEおよびCNブラックリストの管理

v3.3.0以降、StarRocksはBEブラックリスト機能に対応しており、クエリ実行における特定のBEノードの使用を禁止することで、BEノードへの接続失敗に起因する頻繁なクエリ失敗やその他の予期せぬ動作を回避できます。1つまたは複数のBEへの接続を妨げるネットワークの問題は、ブラックリストを使用する例となるでしょう。

v4.0以降、StarRocksはCompute Nodes (CNs) をブラックリストに追加する機能に対応しています。

デフォルトでは、StarRocksはBEおよびCNブラックリストを自動的に管理し、接続が失われたBEまたはCNノードをブラックリストに追加し、接続が再確立されるとブラックリストから削除します。ただし、手動でブラックリストに追加されたノードは、StarRocksによってブラックリストから削除されません。

:::note

- SYSTEM-level BLACKLIST権限を持つユーザーのみがこの機能を使用できます。
- 各FEノードは独自のBEおよびCNブラックリストを保持し、他のFEノードと共有しません。

:::

## BE/CNをブラックリストに追加

[ADD BACKEND/COMPUTE NODE BLACKLIST](../../sql-reference/sql-statements/cluster-management/nodes_processes/ADD_BACKEND_BLACKLIST.md) を使用して、BE/CNノードを手動でブラックリストに追加できます。このステートメントでは、ブラックリストに追加するBE/CNノードのIDを指定する必要があります。[SHOW BACKENDS](../../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_BACKENDS.md) を実行してBE IDを、[SHOW COMPUTE NODES](../../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_COMPUTE_NODES.md) を実行してCN IDを取得できます。

例：

```SQL
-- BE IDを取得します。
SHOW BACKENDS\G
*************************** 1. row ***************************
            BackendId: 10001
                   IP: xxx.xx.xx.xxx
                   ...
-- BEをブラックリストに追加します。
ADD BACKEND BLACKLIST 10001;

-- CN IDを取得します。
SHOW COMPUTE NODES\G
*************************** 1. row ***************************
        ComputeNodeId: 10005
                   IP: xxx.xx.xx.xxx
                   ...
-- CNをブラックリストに追加します。
ADD COMPUTE NODE BLACKLIST 10005;
```

## ブラックリストからBE/CNを削除

[DELETE BACKEND/COMPUTE NODE BLACKLIST](../../sql-reference/sql-statements/cluster-management/nodes_processes/DELETE_BACKEND_BLACKLIST.md) を使用して、BE/CNノードを手動でブラックリストから削除できます。このステートメントでは、BE/CNノードのIDも指定する必要があります。

例：

```SQL
-- ブラックリストからBEを削除します。
DELETE BACKEND BLACKLIST 10001;

-- ブラックリストからCNを削除します。
DELETE COMPUTE NODE BLACKLIST 10005;
```

## BE/CNブラックリストを表示

[SHOW BACKEND/COMPUTE NODE BLACKLIST](../../sql-reference/sql-statements/cluster-management/nodes_processes/SHOW_BACKEND_BLACKLIST.md) を使用して、ブラックリスト内のBE/CNノードを表示できます。

例：

```SQL
-- BEブラックリストを表示します。
SHOW BACKEND BLACKLIST;
+-----------+------------------+---------------------+------------------------------+--------------------+
| BackendId | AddBlackListType | LostConnectionTime  | LostConnectionNumberInPeriod | CheckTimePeriod(s) |
+-----------+------------------+---------------------+------------------------------+--------------------+
| 10001     | MANUAL           | 2024-04-28 11:52:09 | 0                            | 5                  |
+-----------+------------------+---------------------+------------------------------+--------------------+

-- CNブラックリストを表示します。
SHOW COMPUTE NODE BLACKLIST;
+---------------+------------------+---------------------+------------------------------+--------------------+
| ComputeNodeId | AddBlackListType | LostConnectionTime  | LostConnectionNumberInPeriod | CheckTimePeriod(s) |
+---------------+------------------+---------------------+------------------------------+--------------------+
| 10005         | MANUAL           | 2025-08-18 10:47:51 | 0                            | 5                  |
+---------------+------------------+---------------------+------------------------------+--------------------+
```

以下のフィールドが返されます。

- `AddBlackListType`: BE/CNノードがブラックリストに追加された方法を示します。`MANUAL` はユーザーによって手動でブラックリストに追加されたことを示します。`AUTO` はStarRocksによって自動的にブラックリストに追加されたことを示します。
- `LostConnectionTime`:
  - `MANUAL` タイプの場合、BE/CNノードが手動でブラックリストに追加された時刻を示します。
  - `AUTO` タイプの場合、最後の接続が成功した時刻を示します。
- `LostConnectionNumberInPeriod`: `CheckTimePeriod(s)` の期間内に検出された切断の回数です。これは、StarRocksがブラックリスト内のBE/CNノードの接続状態をチェックする間隔です。
- `CheckTimePeriod(s)`: StarRocksがブラックリスト内のBE/CNノードの接続状態をチェックする間隔です。その値は、FE構成項目 `black_host_history_sec` に指定された値として評価されます。単位：秒。

## BE/CNブラックリストの自動管理を設定

BE/CNノードがFEノードへの接続を失うか、BE/CNノードでのタイムアウトによりクエリが失敗するたびに、FEノードはBE/CNノードをBEおよびCNブラックリストに追加します。FEノードは、一定期間内の接続失敗数をカウントすることで、ブラックリスト内のBE/CNノードの接続性を常に評価します。StarRocksは、接続失敗数が事前に指定されたしきい値を下回る場合にのみ、ブラックリスト内のBE/CNノードを削除します。

以下の[FE設定](./FE_configuration.md)を使用して、BEおよびCNブラックリストの自動管理を設定できます。

- `black_host_history_sec`: ブラックリスト内のBE/CNノードの接続失敗履歴を保持する期間です。
- `black_host_connect_failures_within_time`: ブラックリスト内のBE/CNノードに許容される接続失敗のしきい値です。

BE/CNノードが自動的にブラックリストに追加された場合、StarRocksはその接続性を評価し、ブラックリストから削除できるかどうかを判断します。`black_host_history_sec` の期間内に、ブラックリスト内のBE/CNノードの接続失敗が `black_host_connect_failures_within_time` で設定されたしきい値を下回る場合にのみ、ブラックリストから削除できます。
