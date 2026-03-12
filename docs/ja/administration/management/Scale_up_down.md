---
displayed_sidebar: docs
---

# スケールイン・アウト

このトピックでは、StarRocksのノードをスケールイン・アウトする方法について説明します。

## FEのスケールイン・アウト

StarRocksには、FollowerとObserverの2種類のFEノードがあります。Followerは選挙の投票と書き込みに関与します。Observerはログの同期と読み取りパフォーマンスの拡張にのみ使用されます。

> * フォロワーFE（リーダーを含む）の数は奇数である必要があり、高可用性（HA）モードを形成するために3つデプロイすることが推奨されます。
> * FEが高可用性デプロイメント（1リーダー、2フォロワー）の場合、読み取りパフォーマンスを向上させるためにObserver FEを追加することが推奨されます。

### FEのスケールアウト

FEノードをデプロイし、サービスを開始した後、FEをスケールアウトするために以下のコマンドを実行します。

~~~sql
alter system add follower "fe_host:edit_log_port";
alter system add observer "fe_host:edit_log_port";
~~~

### FEのスケールイン

FEのスケールインはスケールアウトと似ています。FEをスケールインするために以下のコマンドを実行します。

~~~sql
alter system drop follower "fe_host:edit_log_port";
alter system drop observer "fe_host:edit_log_port";
~~~

拡張および縮小後、`show proc '/frontends';`を実行してノード情報を確認できます。

## BEのスケールイン・アウト

StarRocksは、BEのスケールイン・アウト後も、全体のパフォーマンスに影響を与えることなく、自動的にロードバランシングを実行します。

新しいBEノードを追加すると、システムのTablet Schedulerが新しいノードとその低い負荷を検出し、高負荷のBEノードから新しい低負荷のBEノードへタブレットの移動を開始し、クラスター全体でデータと負荷が均等に分散されるようにします。

バランシングプロセスは、各BEに対して計算されるloadScoreに基づいており、ディスク使用率とレプリカ数の両方を考慮します。システムは、loadScoreが高いノードからloadScoreが低いノードへタブレットを移動させることを目指します。

FE設定パラメータ`tablet_sched_disable_balance`を確認して、自動バランシングが無効になっていないことを確認できます（このパラメータはデフォルトでfalseであり、タブレットバランシングがデフォルトで有効であることを意味します）。詳細については、[レプリカ管理ドキュメント](./resource_management/Replica.md)を参照してください。

### BEのスケールアウト

BEをスケールアウトするために以下のコマンドを実行します。

~~~sql
alter system add backend 'be_host:be_heartbeat_service_port';
~~~

BEのステータスを確認するために以下のコマンドを実行します。

~~~sql
show proc '/backends';
~~~

### BEのスケールイン

BEノードをスケールインする方法には、`DROP`と`DECOMMISSION`の2つがあります。

`DROP`はBEノードを直ちに削除し、失われた複製はFEスケジューリングによって補充されます。`DECOMMISSION`は、まず複製が補充されていることを確認してからBEノードを削除します。`DECOMMISSION`の方がより安全であり、BEのスケールインには推奨されます。

両方の方法のコマンドは似ています：

* `alter system decommission backend "be_host:be_heartbeat_service_port";`
* `alter system drop backend "be_host:be_heartbeat_service_port";`

バックエンドのドロップは危険な操作であるため、実行する前に二度確認する必要があります。

* `alter system drop backend "be_host:be_heartbeat_service_port";`

## CNのスケールイン・アウト

### CNのスケールアウト

CNをスケールアウトするために以下のコマンドを実行します。

~~~sql
ALTER SYSTEM ADD COMPUTE NODE "cn_host:cn_heartbeat_service_port";
~~~

CNのステータスを確認するために以下のコマンドを実行します。

~~~sql
SHOW PROC '/compute_nodes';
~~~

### CNのスケールイン

CNのスケールインはスケールアウトと似ています。CNをスケールインするために以下のコマンドを実行します。

~~~sql
ALTER SYSTEM DROP COMPUTE NODE "cn_host:cn_heartbeat_service_port";
~~~

`SHOW PROC '/compute_nodes';`を実行してノード情報を確認できます。
