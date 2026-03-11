---
displayed_sidebar: docs
sidebar_position: 2
toc_max_heading_level: 2
description: Kafka shared-data ストレージによるルーチンロード
---

# 共有データストレージを使用した Kafka ルーチンロード StarRocks

import Clients from '../_assets/quick-start/_clientsCompose.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'

## ルーチンロードについて

ルーチンロードは、Apache Kafka、またはこのラボでは Redpanda を使用して、StarRocks にデータを継続的にストリーミングします。データは Kafka トピックにストリーミングされ、ルーチンロードジョブがデータを StarRocks に取り込みます。ルーチンロードに関する詳細は、ラボの最後で提供されます。

## 共有データについて

ストレージとコンピューティングを分離するシステムでは、データは Amazon S3、Google Cloud Storage、Azure Blob Storage、および MinIO のような他の S3 互換ストレージなど、低コストで信頼性の高いリモートストレージシステムに保存されます。ホットデータはローカルにキャッシュされ、キャッシュがヒットすると、クエリパフォーマンスはストレージとコンピューティングが結合されたアーキテクチャのものと同等になります。コンピュートノード (CN) は、数秒でオンデマンドで追加または削除できます。このアーキテクチャは、ストレージコストを削減し、より優れたリソース分離を保証し、弾力性とスケーラビリティを提供します。

このチュートリアルでは、以下を説明します。

- Docker Compose を使用した StarRocks、Redpanda、MinIO の実行
- MinIO を StarRocks ストレージレイヤーとして使用する
- 共有データ向け StarRocks の構成
- Redpanda からデータを取り込むためのルーチンロードジョブの追加

使用されるデータは合成データです。

このドキュメントには多くの情報が含まれており、冒頭でステップバイステップの内容を、最後に技術的な詳細を提示しています。これは、以下の目的をこの順序で達成するために行われます。

1. ルーチンロードを構成する。
2. 読者が共有データデプロイメントでデータをロードし、そのデータを分析できるようにする。
3. 共有データデプロイメントの構成詳細を提供する。

---

## 前提条件

### Docker

- [Docker](https://docs.docker.com/engine/install/)
- Docker に割り当てられた 4 GB の RAM
- Docker に割り当てられた 10 GB の空きディスクスペース

### SQL クライアント

Docker 環境で提供される SQL クライアントを使用することも、お使いのシステムのものを使用することもできます。多くの MySQL 互換クライアントが動作し、このガイドでは DBeaver と MySQL Workbench の構成について説明します。

### curl

`curl` は、Compose ファイルとデータ生成スクリプトをダウンロードするために使用されます。OS プロンプトで `curl` または `curl.exe` を実行して、インストールされているか確認してください。curl がインストールされていない場合は、[こちらから curl を入手してください](https://curl.se/dlwiz/?type=bin)。

### Python

Python 3 と Apache Kafka 用の Python クライアント `kafka-python` が必要です。

- [Python](https://www.python.org/)
- [`kafka-python`](https://pypi.org/project/kafka-python/)

---

## 用語

### FE

フロントエンドノードは、メタデータ管理、クライアント接続管理、クエリ計画、およびクエリスケジューリングを担当します。各 FE は、完全なメタデータコピーをメモリに保存および維持し、FE 間で区別のないサービスを保証します。

### CN

コンピュートノードは、共有データデプロイメントにおけるクエリ計画の実行を担当します。

### BE

バックエンドノードは、データストレージと共有なしデプロイメントにおけるクエリ計画の実行の両方を担当します。

:::note
このガイドでは BE は使用しません。この情報は、BE と CN の違いを理解していただくために含まれています。
:::

---

## StarRocks の起動

オブジェクトストレージを使用して共有データで StarRocks を実行するには、以下が必要です。

- フロントエンドエンジン (FE)
- コンピュートノード (CN)
- オブジェクトストレージ

このガイドでは、S3 互換のオブジェクトストレージプロバイダーである MinIO を使用します。MinIO は GNU Affero General Public License の下で提供されています。

### ラボファイルのダウンロード

#### `docker-compose.yml`

```bash
mkdir routineload
cd routineload
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/docker-compose.yml
```

#### `gen.py`

`gen.py` は、Apache Kafka 用の Python クライアントを使用してデータを Kafka トピックにパブリッシュ (生成) するスクリプトです。このスクリプトは、Redpanda コンテナのアドレスとポートで記述されています。

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/gen.py
```

## StarRocks、MinIO、Redpanda の起動

```bash
docker compose up --detach --wait --wait-timeout 120
```

サービスの進行状況を確認してください。コンテナが正常な状態になるまで 30 秒以上かかるはずです。`routineload-minio_mc-1` コンテナは正常性インジケータを表示せず、StarRocks が使用するアクセスキーで MinIO の構成が完了すると終了します。`routineload-minio_mc-1` が `0` コードで終了し、他のサービスが `Healthy` になるまで待ってください。

サービスが正常になるまで `docker compose ps` を実行します。

```bash
docker compose ps
```

```plaintext
WARN[0000] /Users/droscign/routineload/docker-compose.yml: `version` is obsolete
[+] Running 6/7
 ✔ Network routineload_default       Crea...          0.0s
 ✔ Container minio                   Healthy          5.6s
 ✔ Container redpanda                Healthy          3.6s
 ✔ Container redpanda-console        Healt...         1.1s
 ⠧ Container routineload-minio_mc-1  Waiting          23.1s
 ✔ Container starrocks-fe            Healthy          11.1s
 ✔ Container starrocks-cn            Healthy          23.0s
container routineload-minio_mc-1 exited (0)
```

---

## MinIO 認証情報の確認

StarRocks でオブジェクトストレージとして MinIO を使用するには、StarRocks に MinIO アクセスキーが必要です。アクセスキーは Docker サービスの起動時に生成されました。StarRocks が MinIO に接続する方法をよりよく理解するために、キーが存在することを確認する必要があります。

### MinIO Web UI を開く

http://localhost:9001/access-keys にアクセスしてください。ユーザー名とパスワードは Docker compose ファイルで指定されており、`miniouser` と `miniopassword` です。アクセスキーが 1 つあることが確認できるはずです。キーは `AAAAAAAAAAAAAAAAAAAA` であり、MinIO コンソールではシークレットを見ることはできませんが、Docker compose ファイルにあり、`BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` です。

![View the MinIO access key](../_assets/quick-start/MinIO-view-key.png)

---

### データ用のバケットを作成する

StarRocks でストレージボリュームを作成する際に、データの `LOCATION` を指定します。

```sh
    LOCATIONS = ("s3://my-starrocks-bucket/")
```

[http://localhost:9001/buckets](http://localhost:9001/buckets) を開き、ストレージボリューム用のバケットを追加します。バケット名を `my-starrocks-bucket` にします。リストされている 3 つのオプションはデフォルトのままにします。

---

## SQL クライアント

<Clients />

---

## 共有データ向け StarRocks 構成

この時点で StarRocks が稼働しており、MinIO も稼働しています。MinIO アクセスキーは StarRocks と MinIO を接続するために使用されます。

これは、StarRocks デプロイメントが共有データを使用することを指定する `FE` 構成の一部です。これは、Docker Compose がデプロイメントを作成したときに `fe.conf` ファイルに追加されました。

```sh
# 共有データ実行モードを有効にする
run_mode = shared_data
cloud_native_storage_type = S3
```

:::info
これらの設定は、`quickstart` ディレクトリからこのコマンドを実行し、ファイルの最後を確認することで検証できます。
:::

```sh
docker compose exec starrocks-fe \
  cat /opt/starrocks/fe/conf/fe.conf
```
:::

### SQL クライアントで StarRocks に接続する

:::tip

`docker-compose.yml` ファイルを含むディレクトリからこのコマンドを実行してください。

mysql CLI 以外のクライアントを使用している場合は、今すぐ開いてください。
:::

```sql
docker compose exec starrocks-fe \
mysql -P9030 -h127.0.0.1 -uroot --prompt="StarRocks > "
```

#### ストレージボリュームの確認

```sql
SHOW STORAGE VOLUMES;
```

:::tip
ストレージボリュームは存在しないはずです。次に作成します。
:::

```sh
Empty set (0.04 sec)
```

#### 共有データストレージボリュームの作成

以前、MinIO に `my-starrocks-volume` という名前のバケットを作成し、MinIO に `AAAAAAAAAAAAAAAAAAAA` という名前のアクセスキーがあることを確認しました。以下の SQL は、アクセスキーとシークレットを使用して MinIO バケットにストレージボリュームを作成します。

```sql
CREATE STORAGE VOLUME s3_volume
    TYPE = S3
    LOCATIONS = ("s3://my-starrocks-bucket/")
    PROPERTIES
    (
         "enabled" = "true",
         "aws.s3.endpoint" = "minio:9000",
         "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
         "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
         "aws.s3.use_instance_profile" = "false",
         "aws.s3.use_aws_sdk_default_behavior" = "false"
     );
```

これでストレージボリュームが一覧表示されるはずです。以前は空のセットでした。

```
SHOW STORAGE VOLUMES;
```

```
+----------------+
| Storage Volume |
+----------------+
| s3_volume      |
+----------------+
1 row in set (0.02 sec)
```

ストレージボリュームの詳細を表示し、これがまだデフォルトボリュームではないこと、およびバケットを使用するように構成されていることに注意してください。

```
DESC STORAGE VOLUME s3_volume\G
```

:::tip
このドキュメントの一部の SQL、および StarRocks ドキュメントの他の多くのドキュメントでは、セミコロンの代わりに `\G` を使用しています。`\G` は、mysql CLI がクエリ結果を垂直に表示するようにします。

多くの SQL クライアントは垂直フォーマット出力interprtしないため、`\G` を `;` に置き換える必要があります。
:::

```sh
*************************** 1. row ***************************
     Name: s3_volume
     Type: S3
# highlight-start
IsDefault: false
 Location: s3://my-starrocks-bucket/
# highlight-end
   Params: {"aws.s3.access_key":"******","aws.s3.secret_key":"******","aws.s3.endpoint":"minio:9000","aws.s3.region":"us-east-1","aws.s3.use_instance_profile":"false","aws.s3.use_web_identity_token_file":"false","aws.s3.use_aws_sdk_default_behavior":"false"}
  Enabled: true
  Comment:
1 row in set (0.02 sec)
```

## デフォルトストレージボリュームの設定

```
SET s3_volume AS DEFAULT STORAGE VOLUME;
```

```
DESC STORAGE VOLUME s3_volume\G
```

```sh
*************************** 1. row ***************************
     Name: s3_volume
     Type: S3
# highlight-next-line
IsDefault: true
 Location: s3://my-starrocks-bucket/
   Params: {"aws.s3.access_key":"******","aws.s3.secret_key":"******","aws.s3.endpoint":"minio:9000","aws.s3.region":"us-east-1","aws.s3.use_instance_profile":"false","aws.s3.use_web_identity_token_file":"false","aws.s3.use_aws_sdk_default_behavior":"false"}
  Enabled: true
  Comment:
1 row in set (0.02 sec)
```

---

## テーブルの作成

これらの SQL コマンドは、SQL クライアントで実行されます。

```SQL
CREATE DATABASE IF NOT EXISTS quickstart;
```

データベース `quickstart` がストレージボリューム `s3_volume` を使用していることを確認します。

```
SHOW CREATE DATABASE quickstart \G
```

```sh
*************************** 1. row ***************************
       Database: quickstart
Create Database: CREATE DATABASE `quickstart`
# highlight-next-line
PROPERTIES ("storage_volume" = "s3_volume")
```

```SQL
USE quickstart;
```

```SQL
CREATE TABLE site_clicks (
    `uid` bigint NOT NULL COMMENT "ユーザーID",
    `site` string NOT NULL COMMENT "サイトURL",
    `vtime` bigint NOT NULL COMMENT "訪問時間"
)
DISTRIBUTED BY HASH(`uid`)
PROPERTIES("replication_num"="1");
```

---

### Redpanda Console を開く

まだトピックはありませんが、次のステップでトピックが作成されます。

http://localhost:8080/overview

### Redpanda トピックにデータをパブリッシュする

`routineload/` フォルダー内のコマンドシェルから、このコマンドを実行してデータを生成します。

```python
python gen.py 5
```

:::tip

お使いのシステムでは、コマンドの `python` の代わりに `python3` を使用する必要がある場合があります。

`kafka-python` が見つからない場合は、以下を試してください。

```
pip install kafka-python
```
または

```
pip3 install kafka-python
```

:::

```plaintext
b'{ "uid": 6926, "site": "https://docs.starrocks.io/", "vtime": 1718034793 } '
b'{ "uid": 3303, "site": "https://www.starrocks.io/product/community", "vtime": 1718034793 } '
b'{ "uid": 227, "site": "https://docs.starrocks.io/", "vtime": 1718034243 } '
b'{ "uid": 7273, "site": "https://docs.starrocks.io/", "vtime": 1718034794 } '
b'{ "uid": 4666, "site": "https://www.starrocks.io/", "vtime": 1718034794 } '
```

### Redpanda Console で確認する

Redpanda Console の http://localhost:8080/topics に移動すると、`test2` という名前のトピックが 1 つ表示されます。そのトピックを選択し、次に **Messages** タブを選択すると、`gen.py` の出力と一致する 5 つのメッセージが表示されます。

## メッセージの取り込み

StarRocks では、ルーチンロードジョブを作成して以下を実行します。

1. Redpanda トピック `test2` からメッセージを取り込む
2. それらのメッセージを `site_clicks` テーブルにロードする

StarRocks はストレージに MinIO を使用するように構成されているため、`site_clicks` テーブルに挿入されたデータは MinIO に保存されます。

### ルーチンロードジョブの作成

SQL クライアントでこのコマンドを実行してルーチンロードジョブを作成します。このコマンドはラボの最後で詳細に説明されます。

```SQL
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
PROPERTIES
(
    "format" = "JSON",
    "jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
)
FROM KAFKA
(     
    "kafka_broker_list" = "redpanda:29092",
    "kafka_topic" = "test2",
    "kafka_partitions" = "0",
    "kafka_offsets" = "OFFSET_BEGINNING"
);
```

### ルーチンロードジョブの確認

```SQL
SHOW ROUTINE LOAD\G
```

以下の 3 つのハイライトされた行を確認します。

1. 状態が `RUNNING` であること
2. トピックが `test2` で、ブローカーが `redpanda:2092` であること
3. `SHOW ROUTINE LOAD` コマンドを実行したタイミングに応じて、統計情報がロードされた行数 0 または 5 を示すこと。ロードされた行数が 0 の場合は、再度実行してください。

```SQL
*************************** 1. row ***************************
                  Id: 10078
                Name: clicks
          CreateTime: 2024-06-12 15:51:12
           PauseTime: NULL
             EndTime: NULL
              DbName: quickstart
           TableName: site_clicks
           -- highlight-next-line
               State: RUNNING
      DataSourceType: KAFKA
      CurrentTaskNum: 1
       JobProperties: {"partitions":"*","partial_update":"false","columnToColumnExpr":"*","maxBatchIntervalS":"10","partial_update_mode":"null","whereExpr":"*","dataFormat":"json","timezone":"Etc/UTC","format":"json","log_rejected_record_num":"0","taskTimeoutSecond":"60","json_root":"","maxFilterRatio":"1.0","strict_mode":"false","jsonpaths":"[\"$.uid\",\"$.site\",\"$.vtime\"]","taskConsumeSecond":"15","desireTaskConcurrentNum":"5","maxErrorNum":"0","strip_outer_array":"false","currentTaskConcurrentNum":"1","maxBatchRows":"200000"}
       -- highlight-next-line
DataSourceProperties: {"topic":"test2","currentKafkaPartitions":"0","brokerList":"redpanda:29092"}
    CustomProperties: {"group.id":"clicks_ea38a713-5a0f-4abe-9b11-ff4a241ccbbd"}
    -- highlight-next-line
           Statistic: {"receivedBytes":0,"errorRows":0,"committedTaskNum":0,"loadedRows":0,"loadRowsRate":0,"abortedTaskNum":0,"totalRows":0,"unselectedRows":0,"receivedBytesRate":0,"taskExecuteTimeMs":1}
            Progress: {"0":"OFFSET_ZERO"}
   TimestampProgress: {}
ReasonOfStateChanged:
        ErrorLogUrls:
         TrackingSQL:
            OtherMsg:
LatestSourcePosition: {}
1 row in set (0.00 sec)
```

```SQL
SHOW ROUTINE LOAD\G
```

```SQL
*************************** 1. row ***************************
                  Id: 10076
                Name: clicks
          CreateTime: 2024-06-12 18:40:53
           PauseTime: NULL
             EndTime: NULL
              DbName: quickstart
           TableName: site_clicks
               State: RUNNING
      DataSourceType: KAFKA
      CurrentTaskNum: 1
       JobProperties: {"partitions":"*","partial_update":"false","columnToColumnExpr":"*","maxBatchIntervalS":"10","partial_update_mode":"null","whereExpr":"*","dataFormat":"json","timezone":"Etc/UTC","format":"json","log_rejected_record_num":"0","taskTimeoutSecond":"60","json_root":"","maxFilterRatio":"1.0","strict_mode":"false","jsonpaths":"[\"$.uid\",\"$.site\",\"$.vtime\"]","taskConsumeSecond":"15","desireTaskConcurrentNum":"5","maxErrorNum":"0","strip_outer_array":"false","currentTaskConcurrentNum":"1","maxBatchRows":"200000"}
DataSourceProperties: {"topic":"test2","currentKafkaPartitions":"0","brokerList":"redpanda:29092"}
    CustomProperties: {"group.id":"clicks_a9426fee-45bb-403a-a1a3-b3bc6c7aa685"}
               -- highlight-next-line
           Statistic: {"receivedBytes":372,"errorRows":0,"committedTaskNum":1,"loadedRows":5,"loadRowsRate":0,"abortedTaskNum":0,"totalRows":5,"unselectedRows":0,"receivedBytesRate":0,"taskExecuteTimeMs":519}
            Progress: {"0":"4"}
   TimestampProgress: {"0":"1718217035111"}
ReasonOfStateChanged:
        ErrorLogUrls:
         TrackingSQL:
            OtherMsg:
                       -- highlight-next-line
LatestSourcePosition: {"0":"5"}
1 row in set (0.00 sec)
```

---

## データが MinIO に保存されていることを確認する

MinIO [http://localhost:9001/browser/](http://localhost:9001/browser/) を開き、`my-starrocks-bucket` の下にオブジェクトが保存されていることを確認します。

---

## StarRocks からデータをクエリする

```SQL
USE quickstart;
SELECT * FROM site_clicks;
```

```SQL
+------+--------------------------------------------+------------+
| uid  | site                                       | vtime      |
+------+--------------------------------------------+------------+
| 4607 | https://www.starrocks.io/blog              | 1718031441 |
| 1575 | https://www.starrocks.io/                  | 1718031523 |
| 2398 | https://docs.starrocks.io/                 | 1718033630 |
| 3741 | https://www.starrocks.io/product/community | 1718030845 |
| 4792 | https://www.starrocks.io/                  | 1718033413 |
+------+--------------------------------------------+------------+
5 rows in set (0.07 sec)
```

## 追加データのパブリッシュ

`gen.py` を再度実行すると、さらに 5 つのレコードが Redpanda にパブリッシュされます。

```bash
python gen.py 5
```

### データが追加されたことを確認する

ルーチンロードジョブはスケジュールに基づいて実行されるため (デフォルトでは 10 秒ごと)、データは数秒以内にロードされます。

```SQL
SELECT * FROM site_clicks;
````

```
+------+--------------------------------------------+------------+
| uid  | site                                       | vtime      |
+------+--------------------------------------------+------------+
| 6648 | https://www.starrocks.io/blog              | 1718205970 |
| 7914 | https://www.starrocks.io/                  | 1718206760 |
| 9854 | https://www.starrocks.io/blog              | 1718205676 |
| 1186 | https://www.starrocks.io/                  | 1718209083 |
| 3305 | https://docs.starrocks.io/                 | 1718209083 |
| 2288 | https://www.starrocks.io/blog              | 1718206759 |
| 7879 | https://www.starrocks.io/product/community | 1718204280 |
| 2666 | https://www.starrocks.io/                  | 1718208842 |
| 5801 | https://www.starrocks.io/                  | 1718208783 |
| 8409 | https://www.starrocks.io/                  | 1718206889 |
+------+--------------------------------------------+------------+
10 rows in set (0.02 sec)
```

---

## 構成の詳細

StarRocks を共有データで使用する経験を積んだ今、その構成を理解することが重要です。

### CN の構成

ここで使用されている CN 構成はデフォルトのものであり、CN は共有データ使用のために設計されています。デフォルト構成を以下に示します。変更する必要はありません。

```bash
sys_log_level = INFO

# 管理、Web、ハートビートサービス用のポート
be_port = 9060
be_http_port = 8040
heartbeat_service_port = 9050
brpc_port = 8060
starlet_port = 9070
```

### FE の構成

FE は、データが BE ノードのローカルディスクではなくオブジェクトストレージに保存されることを想定して構成する必要があるため、FE 構成はデフォルトとは少し異なります。

`docker-compose.yml` ファイルは、`command` で FE 構成を生成します。

```plaintext
# 共有データを有効にし、ストレージタイプとエンドポイントを設定する
run_mode = shared_data
cloud_native_storage_type = S3
```

:::note
この構成ファイルには FE のデフォルトエントリは含まれておらず、共有データ構成のみが表示されています。
:::

デフォルト以外の FE 構成設定：

:::note
多くの構成パラメーターには `s3_` というプレフィックスが付いています。このプレフィックスは、すべての Amazon S3 互換ストレージタイプ (例: S3、GCS、MinIO) で使用されます。Azure Blob Storage を使用する場合、プレフィックスは `azure_` です。
:::

#### `run_mode=shared_data`

これにより共有データの使用が有効になります。

#### `cloud_native_storage_type=S3`

これは、S3 互換ストレージまたは Azure Blob Storage のどちらが使用されるかを指定します。MinIO の場合、これは常に S3 です。

### `CREATE storage volume` の詳細

```sql
CREATE STORAGE VOLUME s3_volume
    TYPE = S3
    LOCATIONS = ("s3://my-starrocks-bucket/")
    PROPERTIES
    (
         "enabled" = "true",
         "aws.s3.endpoint" = "minio:9000",
         "aws.s3.access_key" = "AAAAAAAAAAAAAAAAAAAA",
         "aws.s3.secret_key" = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
         "aws.s3.use_instance_profile" = "false",
         "aws.s3.use_aws_sdk_default_behavior" = "false"
     );
```

#### `aws_s3_endpoint=minio:9000`

ポート番号を含む MinIO エンドポイント。

#### `aws_s3_path=starrocks`

バケット名。

#### `aws_s3_access_key=AAAAAAAAAAAAAAAAAAAA`

MinIO アクセスキー。

#### `aws_s3_secret_key=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`

MinIO アクセスキーシークレット。

#### `aws_s3_use_instance_profile=false`

MinIO を使用する場合、アクセスキーが使用されるため、インスタンスプロファイルは MinIO と共に使用されません。

#### `aws_s3_use_aws_sdk_default_behavior=false`

MinIO を使用する場合、このパラメーターは常に false に設定されます。

---

## ルーチンロードコマンドに関する注意事項

StarRocks ルーチンロードは多くの引数を取ります。ここではこのチュートリアルで使用されるもののみを説明し、残りは詳細情報セクションでリンクします。

```SQL
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
PROPERTIES
(
    "format" = "JSON",
    "jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
)
FROM KAFKA
(     
    "kafka_broker_list" = "redpanda:29092",
    "kafka_topic" = "test2",
    "kafka_partitions" = "0",
    "kafka_offsets" = "OFFSET_BEGINNING"
);
```

### パラメーター

```
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
```

`CREATE ROUTINE LOAD ON` のパラメーターは次のとおりです。
- database_name.job_name
- table_name

`database_name` はオプションです。このラボでは `quickstart` が指定されています。

`job_name` は必須であり、`clicks` です。

`table_name` は必須であり、`site_clicks` です。

### ジョブプロパティ

#### プロパティ `format`

```
"format" = "JSON",
```

この場合、データは JSON 形式であるため、プロパティは `JSON` に設定されます。その他の有効な形式は、`CSV`、`JSON`、`Avro` です。`CSV` がデフォルトです。

#### プロパティ `jsonpaths`

```
"jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
```

JSON 形式のデータからロードしたいフィールドの名前。このパラメーターの値は、有効な JsonPath 式です。詳細については、このページの最後で確認できます。

### データソースプロパティ

#### `kafka_broker_list`

```
"kafka_broker_list" = "redpanda:29092",
```

Kafka のブローカー接続情報。フォーマットは `<kafka_broker_name_or_ip>:<broker_ port>` です。複数のブローカーはコンマで区切られます。

#### `kafka_topic`

```
"kafka_topic" = "test2",
```

データを取り込む Kafka トピック。

#### `kafka_partitions` と `kafka_offsets`

```
"kafka_partitions" = "0",
"kafka_offsets" = "OFFSET_BEGINNING"
```

これらのプロパティは、各 `kafka_partitions` エントリに対して 1 つの `kafka_offset` が必要であるため、一緒に提示されます。

`kafka_partitions` は、取り込む 1 つ以上のパーティションのリストです。このプロパティが設定されていない場合、すべてのパーティションが取り込まれます。

`kafka_offsets` は、`kafka_partitions` にリストされている各パーティションに対するオフセットのリストです。この場合、値は `OFFSET_BEGINNING` であり、すべてのデータが取り込まれます。デフォルトでは、新しいデータのみを取り込みます。

---

## まとめ

このチュートリアルでは、以下を実行しました。

- StarRocks、Redpanda、MinIO を Docker にデプロイしました。
- Kafka トピックからデータを取り込むルーチンロードジョブを作成しました。
- MinIO を使用する StarRocks ストレージボリュームを構成する方法を学びました。

## 詳細情報

[StarRocks Architecture](../introduction/Architecture.md)

このラボで使用されたサンプルは非常に単純です。ルーチンロードには、さらに多くのオプションと機能があります。[詳細はこちら](../loading/RoutineLoad.md)。

[JSONPath](https://goessner.net/articles/JsonPath/)
