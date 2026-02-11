---
displayed_sidebar: docs
---

# FQDNアクセスを有効にする

このトピックでは、完全修飾ドメイン名（FQDN）を使用してクラスターアクセスを有効にする方法について説明します。FQDNは、インターネット経由でアクセスできる特定のエンティティに対する**完全なドメイン名**です。FQDNは、ホスト名とドメイン名の2つの部分で構成されます。

2.4より前は、StarRocksはIPアドレスによるFEおよびBEへのアクセスのみをサポートしていました。FQDNを使用してノードをクラスターに追加した場合でも、最終的にはIPアドレスに変換されていました。これは、StarRocksクラスター内の特定のノードのIPアドレスを変更すると、ノードへのアクセス障害につながる可能性があるため、DBAにとって大きな不便を引き起こしていました。バージョン2.4では、StarRocksは各ノードをそのIPアドレスから分離しました。これにより、StarRocksのノードをFQDNのみで管理できるようになりました。

## 前提条件

StarRocksクラスターでFQDNアクセスを有効にするには、以下の要件が満たされていることを確認してください。

- クラスター内の各マシンにはホスト名が必要です。

- 各マシンのファイル **/etc/hosts** に、クラスター内の他のマシンの対応するIPアドレスとFQDNを指定する必要があります。

- **/etc/hosts** ファイル内のIPアドレスは一意である必要があります。

## FQDNアクセスで新しいクラスターをセットアップする

デフォルトでは、新しいクラスターのFEノードはIPアドレスアクセス経由で起動されます。FQDNアクセスで新しいクラスターを起動するには、**クラスターを初めて起動するとき**に、以下のコマンドを実行してFEノードを起動する必要があります。

```Shell
./bin/start_fe.sh --host_type FQDN --daemon
```

プロパティ `--host_type` は、ノードの起動に使用されるアクセス方法を指定します。有効な値には `FQDN` と `IP` が含まれます。このプロパティは、ノードを初めて起動するときに一度だけ指定する必要があります。

各BEノードは、FEメタデータで定義された `BE Address` で自身を識別します。そのため、BEノードを起動する際に `--host_type` を指定する必要はありません。`BE Address` がFQDNを持つBEノードを定義している場合、BEノードはこのFQDNで自身を識別します。

## 既存のクラスターでFQDNアクセスを有効にする

以前にIPアドレス経由で起動された既存のクラスターでFQDNアクセスを有効にするには、まずStarRocksをバージョン2.4.0以降に**アップグレード**する必要があります。

### FEノードのFQDNアクセスを有効にする

Leader FEノードのFQDNアクセスを有効にする前に、すべての非Leader Follower FEノードのFQDNアクセスを有効にする必要があります。

> **注意**
>
> FEノードのFQDNアクセスを有効にする前に、クラスターに少なくとも3つのFollower FEノードがあることを確認してください。

#### 非Leader Follower FEノードのFQDNアクセスを有効にする

1. FEノードのデプロイディレクトリに移動し、以下のコマンドを実行してFEノードを停止します。

    ```Shell
    ./bin/stop_fe.sh
    ```

2. MySQLクライアント経由で以下のステートメントを実行し、停止したFEノードの `Alive` ステータスを確認します。`Alive` ステータスが `false` になるまで待ちます。

    ```SQL
    SHOW PROC '/frontends'\G
    ```

3. 以下のステートメントを実行して、IPアドレスをFQDNに置き換えます。

    ```SQL
    ALTER SYSTEM MODIFY FRONTEND HOST "<fe_ip>" TO "<fe_hostname>";
    ```

4. 以下のコマンドを実行して、FQDNアクセスでFEノードを起動します。

    ```Shell
    ./bin/start_fe.sh --host_type FQDN --daemon
    ```

    プロパティ `--host_type` は、ノードの起動に使用されるアクセス方法を指定します。有効な値には `FQDN` と `IP` が含まれます。ノードを変更した後にノードを再起動するときに、このプロパティを一度だけ指定する必要があります。

5. FEノードの `Alive` ステータスを確認します。`Alive` ステータスが `true` になるまで待ちます。

    ```SQL
    SHOW PROC '/frontends'\G
    ```

6. 現在のFEノードの `Alive` ステータスが `true` になった後、上記の手順を繰り返して、他の非Leader Follower FEノードのFQDNアクセスを順次有効にします。

#### Leader FEノードのFQDNアクセスを有効にする

すべての非Leader FEノードが正常に変更され再起動された後、Leader FEノードのFQDNアクセスを有効にできます。

> **注記**
>
> Leader FEノードがFQDNアクセスで有効になる前は、ノードをクラスターに追加するために使用されるFQDNは、対応するIPアドレスに変換されます。FQDNアクセスが有効になったLeader FEノードがクラスターのために選出された後、FQDNはIPアドレスに変換されなくなります。

1. Leader FEノードのデプロイディレクトリに移動し、以下のコマンドを実行してLeader FEノードを停止します。

    ```Shell
    ./bin/stop_fe.sh
    ```

2. MySQLクライアント経由で以下のステートメントを実行し、新しいLeader FEノードがクラスターのために選出されたかどうかを確認します。

    ```SQL
    SHOW PROC '/frontends'\G
    ```

    `Alive` ステータスが `true` で、`isMaster` が `true` のFEノードは、実行中のLeader FEです。

3. 以下のステートメントを実行して、IPアドレスをFQDNに置き換えます。

    ```SQL
    ALTER SYSTEM MODIFY FRONTEND HOST "<fe_ip>" TO "<fe_hostname>";
    ```

4. 以下のコマンドを実行して、FQDNアクセスでFEノードを起動します。

    ```Shell
    ./bin/start_fe.sh --host_type FQDN --daemon
    ```

    プロパティ `--host_type` は、ノードの起動に使用されるアクセス方法を指定します。有効な値には `FQDN` と `IP` が含まれます。ノードを変更した後にノードを再起動するときに、このプロパティを一度だけ指定する必要があります。

5. FEノードの `Alive` ステータスを確認します。

    ```Plain
    SHOW PROC '/frontends'\G
    ```

  `Alive` ステータスが `true` になると、FEノードは正常に変更され、Follower FEノードとしてクラスターに追加されます。

### BEノードのFQDNアクセスを有効にする

MySQLクライアント経由で以下のステートメントを実行し、IPアドレスをFQDNに置き換えて、BEノードのFQDNアクセスを有効にします。

```SQL
ALTER SYSTEM MODIFY BACKEND HOST "<be_ip>" TO "<be_hostname>";
```

> **注記**
>
> FQDNアクセスが有効になった後も、BEノードを再起動する必要はありません。

## ロールバック

FQDNアクセスが有効になったStarRocksクラスターを、FQDNアクセスをサポートしない以前のバージョンにロールバックするには、まずクラスター内のすべてのノードのIPアドレスアクセスを有効にする必要があります。[既存のクラスターでFQDNアクセスを有効にする](#enable-fqdn-access-in-an-existing-cluster) を一般的なガイダンスとして参照できますが、SQLコマンドを以下のように変更する必要があります。

- FEノードのIPアドレスアクセスを有効にする：

```SQL
ALTER SYSTEM MODIFY FRONTEND HOST "<fe_hostname>" TO "<fe_ip>";
```

- BEノードのIPアドレスアクセスを有効にする：

```SQL
ALTER SYSTEM MODIFY BACKEND HOST "<be_hostname>" TO "<be_ip>";
```

変更は、クラスターが正常に再起動された後に有効になります。

## FAQ

**Q: FEノードのFQDNアクセスを有効にする際に「required 1 replica. But none were active with this master」というエラーが発生します。どうすればよいですか？**

A: FEノードのFQDNアクセスを有効にする前に、クラスターに少なくとも3つのFollower FEノードがあることを確認してください。

**Q: FQDNアクセスが有効なクラスターにIPアドレスを使用して新しいノードを追加できますか？**

A: はい、できます。
