---
displayed_sidebar: docs
---

# スケールインとスケールアウト

このトピックでは、StarRocksのノードをスケールインおよびスケールアウトする方法について説明します。

## FEのスケールインとスケールアウト

StarRocksには、FollowerとObserverの2種類のFEノードがあります。Followerは選挙の投票と書き込みに関与します。Observerはログの同期と読み取りパフォーマンスの拡張にのみ使用されます。

> * Follower FEの数（リーダーを含む）は奇数でなければならず、高可用性（HA）モードを形成するために3つをデプロイすることが推奨されます。
> * FEが高可用性デプロイメント（リーダー1、Follower 2）である場合、読み取りパフォーマンスを向上させるためにObserver FEを追加することが推奨されます。

### FEのスケールアウト

FEノードをデプロイし、サービスを開始した後、以下のコマンドを実行してFEをスケールアウトします。

~~~sql
alter system add follower "fe_host:edit_log_port";
alter system add observer "fe_host:edit_log_port";
~~~

### FEのスケールイン

FEのスケールインはスケールアウトと似ています。以下のコマンドを実行してFEをスケールインします。

~~~sql
alter system drop follower "fe_host:edit_log_port";
alter system drop observer "fe_host:edit_log_port";
~~~

拡張と縮小の後、`show proc '/frontends';` を実行してノード情報を確認できます。

## BEのスケールインとスケールアウト

StarRocksは、BEがスケールインまたはスケールアウトされた後、全体のパフォーマンスに影響を与えることなく、自動的にロードバランシングを実行します。

新しいBEノードを追加すると、システムのTablet Schedulerが新しいノードとその低い負荷を検出し、高負荷のBEノードから新しい低負荷のBEノードへタブレットの移動を開始し、クラスター全体でのデータと負荷の均等な分散を保証します。

バランシングプロセスは、各BEに対して計算されるloadScoreに基づいており、ディスク使用率とレプリカ数の両方を考慮します。システムは、loadScoreが高いノードからloadScoreが低いノードへタブレットを移動させることを目指します。

FE構成パラメータ`tablet_sched_disable_balance`を確認して、自動バランシングが無効になっていないことを確認できます（このパラメータはデフォルトでfalseであり、タブレットバランシングがデフォルトで有効であることを意味します）。詳細については、[レプリカ管理ドキュメント](./resource_management/Replica.md)を参照してください。

### BEのスケールアウト

以下のコマンドを実行してBEをスケールアウトします。

~~~sql
alter system add backend 'be_host:be_heartbeat_service_port';
~~~

以下のコマンドを実行してBEのステータスを確認します。

~~~sql
show proc '/backends';
~~~

### BEのスケールイン

BEノードをスケールインする方法には、`DROP` と `DECOMMISSION` の2つがあります。

`DROP`はBEノードを即座に削除し、失われた複製はFEのスケジューリングによって補われます。`DECOMMISSION`はまず複製が補われることを確認してからBEノードを削除します。`DECOMMISSION`の方が少し扱いやすく、BEのスケールインには推奨されます。

両方のメソッドのコマンドは似ています:

* `alter system decommission backend "be_host:be_heartbeat_service_port";`
* `alter system drop backend "be_host:be_heartbeat_service_port";`

バックエンドのドロップは危険な操作であるため、実行する前に二重に確認する必要があります。

* `alter system drop backend "be_host:be_heartbeat_service_port";`

## CNのスケールインとスケールアウト

### CNのスケールアウト

以下のコマンドを実行してCNをスケールアウトします。

~~~sql
ALTER SYSTEM ADD COMPUTE NODE "cn_host:cn_heartbeat_service_port";
~~~

以下のコマンドを実行してCNのステータスを確認します。

~~~sql
SHOW PROC '/compute_nodes';
~~~

### CNのスケールイン

CNのスケールインはスケールアウトと似ています。以下のコマンドを実行してCNをスケールインします。

~~~sql
ALTER SYSTEM DROP COMPUTE NODE "cn_host:cn_heartbeat_service_port";
~~~

`SHOW PROC '/compute_nodes';` を実行してノード情報を確認できます。
