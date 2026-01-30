---
displayed_sidebar: docs
sidebar_position: 2
toc_max_heading_level: 2
description: 共有データストレージを使用した Kafka routine load
---

# 共有データストレージを使用した StarRocks の Kafka routine load

import Clients from '../_assets/quick-start/_clientsCompose.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'

Routine Load は、Apache Kafka（またはこのラボでは Redpanda）を使用して、データを継続的に StarRocks にストリーミングする手法です。データは Kafka トピックにストリーミングされ、Routine Load ジョブがそのデータを StarRocks に取り込みます。Routine Load の詳細については、ラボの最後に記載されています。
## 共有データについて

ストレージとコンピュートを分離するシステムでは、データは Amazon S3、Google Cloud Storage、Azure Blob Storage、および MinIO のような他の S3 互換ストレージなどの低コストで信頼性の高いリモートストレージシステムに保存されます。ホットデータはローカルにキャッシュされ、キャッシュがヒットすると、クエリパフォーマンスはストレージとコンピュートが結合されたアーキテクチャと同等になります。コンピュートノード（CN）は、数秒以内にオンデマンドで追加または削除できます。このアーキテクチャは、ストレージコストを削減し、より優れたリソース分離を保証し、伸縮性と拡張性を提供します。

このチュートリアルでは、以下について説明します。

- Docker Compose を使用した StarRocks、Redpanda、および MinIO の実行
- MinIO を StarRocks のストレージレイヤーとして使用
- 共有データ用に StarRocks を構成
- Redpanda からデータを取り込むための Routine Load ジョブの追加

使用されるデータは合成データです。

このドキュメントには多くの情報が含まれており、最初にステップごとのコンテンツが提示され、最後に技術的な詳細が記載されています。これは、次の目的をこの順序で果たすために行われます。

1. Routine Load を構成します。
2. 読者が共有データデプロイメントでデータをロードし、そのデータを分析できるようにします。
3. 共有データデプロイメントの構成の詳細を提供します。

---
## 前提条件
### Docker

- [Docker](https://docs.docker.com/engine/install/)
- Docker に割り当てられた 4 GB の RAM
- Docker に割り当てられた 10 GB の空きディスク容量
### SQL クライアント

Docker 環境で提供されている SQL クライアントを使用するか、ご自身のシステム上のクライアントを使用できます。多くの MySQL 互換クライアントが動作し、このガイドでは DBeaver と MySQL Workbench の構成について説明します。
### curl

`curl` は、Compose ファイルとデータを生成するスクリプトをダウンロードするために使用されます。OS のプロンプトで `curl` または `curl.exe` を実行して、インストールされているかどうかを確認してください。`curl` がインストールされていない場合は、[こちらから curl を入手してください](https://curl.se/dlwiz/?type=bin) 。
### Python

Python 3 と Apache Kafka 用の Python クライアントである `kafka-python` が必要です。

- [Python](https://www.python.org/)
- [`kafka-python`](https://pypi.org/project/kafka-python/)

---
## 用語
### FE

FE （Frontend nodes）は、メタデータ管理、クライアント接続管理、クエリプラン、およびクエリスケジューリングを担当します。各 FE は、メタデータの完全なコピーをメモリに保存および保持し、FE 間で差別なくサービスを提供することを保証します。
コンピュートノードは、共有データモードでのクエリプランの実行を担当します。
### BE

BE は、共有なしデプロイメントにおいて、データストレージとクエリプランの実行の両方を担うバックエンドノードです。

:::note
このガイドでは BE を使用しません。この情報は、BE と CN の違いを理解していただくために含まれています。
:::

---
## StarRocks の起動

オブジェクトストレージを使用して共有データで StarRocks を実行するには、以下が必要です。

- フロントエンドエンジン (FE)
- コンピュートノード (CN)
- オブジェクトストレージ

このガイドでは、S3 互換のオブジェクトストレージプロバイダーである MinIO を使用します。MinIO は GNU Affero General Public License の下で提供されています。
### ラボファイルをダウンロードする
#### `docker-compose.yml`

```bash
mkdir routineload
cd routineload
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/docker-compose.yml
```
#### `gen.py`

`gen.py` は、Apache Kafka 用の Python クライアントを使用して、Kafka トピックにデータをパブリッシュ（生成）するスクリプトです。このスクリプトは、Redpanda コンテナのアドレスとポートを使用して記述されています。

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/gen.py
```
## StarRocks、MinIO、および Redpanda の起動

```bash
docker compose up --detach --wait --wait-timeout 120
```

サービスの進捗状況を確認します。コンテナが正常になるまでには、30秒以上かかるはずです。`routineload-minio_mc-1` コンテナはヘルスインジケータを表示せず、StarRocks が使用するアクセスキーで MinIO を構成すると終了します。`routineload-minio_mc-1` がコード `0` で終了し、残りのサービスが `Healthy` になるまで待ちます。

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
## MinIO の認証情報を確認する

StarRocks でオブジェクトストレージに MinIO を使用するには、StarRocks に MinIO のアクセスキーが必要です。このアクセスキーは、Docker サービスの起動時に生成されました。StarRocks が MinIO に接続する方法をより良く理解するために、キーが存在することを確認する必要があります。
### MinIO ウェブ UI を開く

http://localhost:9001/access-keys を参照します。ユーザー名とパスワードは Docker compose ファイルで指定されており、`miniouser` と `miniopassword` です。アクセスキーが1つあることがわかります。キーは `AAAAAAAAAAAAAAAAAAAA` です。MinIO コンソールではシークレットを表示できませんが、Docker compose ファイルにあり、`BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` です。

![MinIO アクセスキーの表示](../_assets/quick-start/MinIO-view-key.png)

---
### データのバケットを作成する

StarRocks でストレージボリュームを作成する際、データの `LOCATION` を指定します。

```sh
    LOCATIONS = ("s3://my-starrocks-bucket/")
```

[http://localhost:9001/buckets](http://localhost:9001/buckets) を開き、ストレージボリュームのバケットを追加します。バケットに `my-starrocks-bucket` という名前を付けます。リストされている3つのオプションのデフォルトを受け入れます。
## SQL クライアント

<Clients />

---
## 共有データのためのStarRocksの設定

この時点で、StarRocksが実行されており、MinIOも実行されています。MinIOのアクセスキーは、StarRocksとMinIOを接続するために使用されます。

これは、StarRocksのデプロイメントが共有データを使用することを指定する`FE`構成の部分です。これは、Docker Composeがデプロイメントを作成したときにファイル`fe.conf`に追加されました。

```sh
# enable the shared data run mode
run_mode = shared_data
cloud_native_storage_type = S3
```

:::info
`quickstart`ディレクトリからこのコマンドを実行し、ファイルの末尾を見ることで、これらの設定を確認できます。
:::

```sh
docker compose exec starrocks-fe \
  cat /opt/starrocks/fe/conf/fe.conf
```
:::
### SQLクライアントでStarRocksに接続する

:::tip

このコマンドは、`docker-compose.yml`ファイルが含まれるディレクトリから実行してください。

mysql CLI以外のクライアントを使用している場合は、ここで開いてください。
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
ストレージボリュームは存在しないはずです。次はストレージボリュームを作成します。
:::

```sh
Empty set (0.04 sec)
```
#### 共有データストレージボリュームの作成

先ほど、`my-starrocks-volume` という名前のバケットを MinIO に作成し、MinIO に `AAAAAAAAAAAAAAAAAAAA` という名前のアクセスキーがあることを確認しました。次の SQL は、アクセスキーとシークレットを使用して、MionIO バケットにストレージボリュームを作成します。

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

これで、ストレージボリュームがリストに表示されるはずです。以前は空のセットでした。

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

ストレージボリュームの詳細を表示し、これがまだ default catalogボリュームではなく、バケットを使用するように構成されていることに注意してください。

```
DESC STORAGE VOLUME s3_volume\G
```

:::tip
このドキュメント、および StarRocks ドキュメントの他の多くのドキュメントにある SQL の一部は、セミコロンの代わりに `\G` が使用されています。`\G` を使用すると、mysql CLI がクエリ結果を垂直方向にレンダリングします。

多くの SQL クライアントは垂直方向のフォーマット出力を解釈しないため、`\G` を `;` に置き換える必要があります。
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
## デフォルトのストレージボリュームを設定する

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
## テーブルを作成する

これらのSQLコマンドは、SQLクライアントで実行します。

```SQL
CREATE DATABASE IF NOT EXISTS quickstart;
```

データベース`quickstart`がストレージボリューム`s3_volume`を使用していることを確認します。

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
    `uid` bigint NOT NULL COMMENT "uid",
    `site` string NOT NULL COMMENT "site url",
    `vtime` bigint NOT NULL COMMENT "vtime"
)
DISTRIBUTED BY HASH(`uid`)
PROPERTIES("replication_num"="1");
```
### Redpanda Consoleを開く

まだトピックはありません。トピックは次のステップで作成します。

http://localhost:8080/overview
### Redpandaトピックへのデータ公開

`routineload/` フォルダーのコマンドシェルから、次のコマンドを実行してデータを生成します。

```python
python gen.py 5
```

:::tip

システムによっては、コマンドで `python` の代わりに `python3` を使用する必要がある場合があります。

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
### Redpanda Console での確認

Redpanda Console (http://localhost:8080/topics ) に移動すると、`test2` という名前のトピックが1つ表示されます。そのトピックを選択し、**Messages** タブを選択すると、`gen.py` の出力と一致する5つのメッセージが表示されます。
## メッセージの消費

StarRocks で、以下の手順で Routine Load ジョブを作成します。

1. Redpanda トピック `test2` からメッセージを消費します。
2. それらのメッセージをテーブル `site_clicks` にロードします。

StarRocks はストレージに MinIO を使用するように構成されているため、`site_clicks` テーブルに挿入されたデータは MinIO に保存されます。
### Routine Load ジョブの作成

SQL クライアントで次のコマンドを実行して、Routine Load ジョブを作成します。コマンドの詳細については、ラボの最後で説明します。

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
### Routine Load ジョブの確認

```SQL
SHOW ROUTINE LOAD\G
```

ハイライトされている3つの行を確認します。

1.  状態が `RUNNING` であること
2.  トピックが `test2` で、ブローカーが `redpanda:2092` であること
3.  統計には、`SHOW ROUTINE LOAD` コマンドをいつ実行したかに応じて、ロードされた行数が0または5のいずれかで表示されるはずです。ロードされた行数が0の場合は、もう一度実行してください。

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
## MinIO にデータが保存されていることを確認する

MinIO [http://localhost:9001/browser/](http://localhost:9001/browser/) を開き、`my-starrocks-bucket` にオブジェクトが保存されていることを確認します。
## StarRocks からのデータクエリ

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
## 追加のデータをパブリッシュする

`gen.py` を再度実行すると、さらに5つのレコードが Redpanda にパブリッシュされます。

```bash
python gen.py 5
```
### データが追加されたことの確認

Routine Loadジョブはスケジュールに基づいて実行されるため (デフォルトでは10秒ごと) 、データは数秒以内にロードされます。

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

共有データで StarRocks を使用した経験を踏まえ、構成を理解することが重要です。
### CN configuration

ここで使用されるCN構成はデフォルトです。CNは共有データでの使用を想定して設計されているためです。デフォルトの構成を以下に示します。変更を加える必要はありません。

```bash
sys_log_level = INFO

# ports for admin, web, heartbeat service
be_port = 9060
be_http_port = 8040
heartbeat_service_port = 9050
brpc_port = 8060
starlet_port = 9070
```
### FE configuration

FE の設定は、FE がデータを BE ノードのローカルディスクではなく、オブジェクトストレージに保存することを想定するように設定する必要があるため、デフォルトとは若干異なります。

`docker-compose.yml` ファイルは、`command` で FE の設定を生成します。

```plaintext
# enable shared data, set storage type, set endpoint
run_mode = shared_data
cloud_native_storage_type = S3
```

:::note
この設定ファイルには、FE のデフォルトエントリは含まれていません。共有データの設定のみが表示されています。
:::

デフォルト以外の FE 設定：

:::note
多くの設定パラメータには、`s3_` というプレフィックスが付いています。このプレフィックスは、Amazon S3 互換のすべてのストレージタイプ（例：S3、GCS、および MinIO）で使用されます。Azure Blob Storage を使用する場合、プレフィックスは `azure_` になります。
:::
#### `run_mode=shared_data`

これは、共有データモードの使用を有効にします。
#### `cloud_native_storage_type=S3`

これは、S3 互換ストレージまたは Azure Blob Storage のどちらを使用するかを指定します。 MinIO の場合、これは常に S3 です。
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

ポート番号を含む、MinIO のエンドポイント。
#### `aws_s3_path=starrocks`

バケット名。
#### `aws_s3_access_key=AAAAAAAAAAAAAAAAAAAA`

MinIO のアクセスキーです。
#### `aws_s3_secret_key=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`

MinIO のアクセスキーシークレットです。
#### `aws_s3_use_instance_profile=false`

MinIO を使用する場合、アクセスキーが使用されるため、インスタンスプロファイルは MinIO では使用されません。
#### `aws_s3_use_aws_sdk_default_behavior=false`

MinIO を使用する場合、このパラメータは常に false に設定されます。
## Routine Load コマンドに関する注意点

StarRocks の Routine Load は多くの引数を取ります。このチュートリアルで使用されているものだけをここで説明し、残りは詳細情報のセクションにリンクします。

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
### パラメータ

```
CREATE ROUTINE LOAD quickstart.clicks ON site_clicks
```

`CREATE ROUTINE LOAD ON` のパラメータは次のとおりです。
- database_name.job_name
- table_name

`database_name` はオプションです。このラボでは、`quickstart` であり、指定されています。

`job_name` は必須で、`clicks` です。

`table_name` は必須で、`site_clicks` です。
### ジョブのプロパティ
#### プロパティ `format`

```
"format" = "JSON",
```

この場合、データは JSON 形式であるため、プロパティは `JSON` に設定されます。その他の有効な形式は、`CSV`、`JSON`、および `Avro` です。`CSV` がデフォルトです。
#### プロパティ `jsonpaths`

```
"jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
```

JSON形式のデータからロードするフィールドの名前。このパラメータの値は、有効な JsonPath 式です。詳細については、このページの最後に記載されています。
### データソースのプロパティ
#### `kafka_broker_list`

```
"kafka_broker_list" = "redpanda:29092",
```

Kafka の broker 接続情報です。形式は `<kafka_broker_name_or_ip>:<broker_ port>` です。複数の broker はカンマで区切られます。
#### `kafka_topic`

```
"kafka_topic" = "test2",
```

消費元の Kafka トピック。
#### `kafka_partitions` と `kafka_offsets`

```
"kafka_partitions" = "0",
"kafka_offsets" = "OFFSET_BEGINNING"
```

これらのプロパティは、`kafka_partitions` のエントリごとに1つの `kafka_offset` が必要であるため、一緒に提示されます。

`kafka_partitions` は、消費する1つ以上のパーティションのリストです。このプロパティが設定されていない場合、すべてのパーティションが消費されます。

`kafka_offsets` は、`kafka_partitions` にリストされている各パーティションに対して1つずつ、オフセットのリストです。この場合、値は `OFFSET_BEGINNING` であり、すべてのデータが消費されます。デフォルトでは、新しいデータのみが消費されます。

---
## 概要

このチュートリアルでは、以下のことを行いました。

- StarRocks、Reedpanda、および MinIO を Docker にデプロイしました。
- Kafka トピックからデータを取り込むための Routine Load ジョブを作成しました。
- MinIO を使用する StarRocks ストレージボリュームを構成する方法を学びました。
## 詳細情報

[StarRocksのアーキテクチャ](../introduction/Architecture.md)

このラボで使用されているサンプルは非常に単純です。Routine Load には、さらに多くのオプションと機能があります。[詳細はこちら](../loading/RoutineLoad.md) をご覧ください。

[JSONPath](https://goessner.net/articles/JsonPath/)