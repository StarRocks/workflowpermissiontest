---
displayed_sidebar: docs
sidebar_position: 2
toc_max_heading_level: 2
description: Kafka routine load with shared-data storage
---

# Kafkaルーチンロードが共有データストレージを使用してStarRocksをロードする

import Clients from '../_assets/quick-start/_clientsCompose.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'

## ルーチンロードについて

ルーチンロードジョブは、Apache Kafka、またはこのラボではRedpandaを使用して、StarRocksにデータを継続的にストリーミングします。データはKafkaトピックにストリーミングされ、ルーチンロードジョブがそのデータをStarRocksに取り込みます。ルーチンロードの詳細については、ラボの最後に記載されています。

## 共有データについて

ストレージとコンピューティングを分離するシステムでは、データはAmazon S3、Google Cloud Storage、Azure Blob Storage、MinIOなどのS3互換ストレージといった低コストで信頼性の高いリモートストレージシステムに保存されます。ホットデータはローカルにキャッシュされ、キャッシュヒット時には、クエリパフォーマンスはストレージとコンピューティングが結合されたアーキテクチャと同等になります。コンピューティングノード（CN）は数秒でオンデマンドで追加または削除できます。このアーキテクチャは、ストレージコストを削減し、より良いリソース分離を保証し、弾力性とスケーラビリティを提供します。

このチュートリアルでは以下を扱います。

- Docker ComposeでStarRocks、Redpanda、MinIOを実行する
- MinIOをStarRocksのストレージ層として使用する
- 共有データ用にStarRocksを構成する
- Redpandaからデータを取り込むルーチンロードジョブを追加する

使用されるデータは合成データです。

このドキュメントには多くの情報が含まれており、冒頭にはステップバイステップの内容が、最後には技術的な詳細が提示されています。これは、以下の目的をこの順序で達成するために行われます。

1. ルーチンロードを構成する。
2. 読者が共有データデプロイメントでデータをロードし、そのデータを分析できるようにする。
3. 共有データデプロイメントの構成詳細を提供する。

***

## 前提条件

### Docker

- [Docker](https://docs.docker.com/engine/install/)
- Dockerに割り当てられた4 GBのRAM
- Dockerに割り当てられた10 GBの空きディスク容量

### SQLクライアント

Docker環境で提供されるSQLクライアントを使用することも、ご自身のシステム上のものを使用することもできます。多くのMySQL互換クライアントが動作し、このガイドではDBeaverとMySQL Workbenchの構成について説明します。

### curl

`curl`は、Composeファイルとデータ生成スクリプトをダウンロードするために使用されます。インストールされているか確認するには、`curl`または`curl.exe`をOSプロンプトで実行してください。curlがインストールされていない場合は、[こちらからcurlを入手してください](https://curl.se/dlwiz/?type=bin)。

### Python

Python 3とApache Kafka用のPythonクライアントである`kafka-python`が必要です。

- [Python](https://www.python.org/)
- [`kafka-python`](https://pypi.org/project/kafka-python/)

***

## 用語

### FE

フロントエンドノードは、メタデータ管理、クライアント接続管理、クエリ計画、およびクエリスケジューリングを担当します。各FEは、メモリ内にメタデータの完全なコピーを保存および維持し、FE間での無差別なサービスを保証します。

### CN

コンピューティングノードは、共有データデプロイメントにおけるクエリ計画の実行を担当します。

### BE

バックエンドノードは、共有なしデプロイメントにおけるデータストレージとクエリ計画の実行の両方を担当します。

:::note
このガイドではBEを使用しませんが、BEとCNの違いを理解していただくためにこの情報を含めています。
:::

***

## StarRocksを起動する

オブジェクトストレージを使用して共有データでStarRocksを実行するには、以下が必要です。

- フロントエンドエンジン (FE)
- コンピュートノード (CN)
- オブジェクトストレージ

このガイドでは、S3互換のオブジェクトストレージプロバイダーであるMinIOを使用します。MinIOはGNU Affero General Public Licenseの下で提供されています。

### ラボファイルをダウンロードする

#### `docker-compose.yml`

```bash
mkdir routineload
cd routineload
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/docker-compose.yml
```

#### `gen.py`

`gen.py` は、Apache Kafka用のPythonクライアントを使用してデータをKafkaトピックに公開（生成）するスクリプトです。このスクリプトは、Redpandaコンテナのアドレスとポートで記述されています。

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/routine-load-shared-data/gen.py
```

## StarRocks、MinIO、Redpandaを起動する

```bash
docker compose up --detach --wait --wait-timeout 120
```

サービスの進行状況を確認します。コンテナが正常な状態になるまで30秒以上かかるはずです。`routineload-minio_mc-1` コンテナはヘルスインジケーターを表示せず、StarRocksが使用するアクセスキーでMinIOの設定が完了すると終了します。以下を待ちます。`routineload-minio_mc-1` が `0` コードで終了し、残りのサービスが `Healthy`。

 を実行します。`docker compose ps` サービスが正常になるまで：

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

***

## MinIOの認証情報を確認する

StarRocksでオブジェクトストレージとしてMinIOを使用するには、StarRocksにMinIOアクセスキーが必要です。アクセスキーはDockerサービスの起動時に生成されました。StarRocksがMinIOに接続する方法をよりよく理解するために、キーが存在することを確認する必要があります。

### MinIOウェブUIを開く

http://localhost:9001/access-keys にアクセスします。ユーザー名とパスワードはDocker composeファイルで指定されており、`miniouser` と `miniopassword` です。アクセスキーが1つあることを確認してください。キーは `AAAAAAAAAAAAAAAAAAAA` です。MinIOコンソールではシークレットを見ることはできませんが、Docker composeファイルにあり、`BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` です：

![MinIOアクセスキーを表示](../_assets/quick-start/MinIO-view-key.png)

***

### データ用のバケットを作成する

StarRocksでストレージボリュームを作成する際、`LOCATION` をデータに指定します：

```sh
    LOCATIONS = ("s3://my-starrocks-bucket/")
```

 を開いて、[http://localhost:9001/buckets](http://localhost:9001/buckets) ストレージボリューム用のバケットを追加します。バケット名を `my-starrocks-bucket` とします。リストされている3つのオプションはデフォルトを受け入れます。

***

## SQLクライアント

<Clients />

***

## 共有データのためのStarRocks設定

この時点で、StarRocksとMinIOが稼働しています。MinIOアクセスキーはStarRocksとMinIOを接続するために使用されます。

これは `FE` 設定の一部で、StarRocksデプロイメントが共有データを使用することを指定しています。これはDocker Composeがデプロイメントを作成した際にファイル `fe.conf` に追加されました。

```sh
# enable the shared data run mode
run_mode = shared_data
cloud_native_storage_type = S3
```

:::info
これらの設定は、`quickstart` ディレクトリからこのコマンドを実行し、ファイルの末尾を見ることで確認できます。
:::

```sh
docker compose exec starrocks-fe \
  cat /opt/starrocks/fe/conf/fe.conf
```

:::

### SQLクライアントでStarRocksに接続する

:::tip

このコマンドを、以下のファイルを含むディレクトリから実行します。`docker-compose.yml`ファイル。

mysql CLI以外のクライアントを使用している場合は、今すぐ開いてください。
:::

```sql
docker compose exec starrocks-fe \
mysql -P9030 -h127.0.0.1 -uroot --prompt="StarRocks > "
```

#### ストレージボリュームを調べる

```sql
SHOW STORAGE VOLUMES;
```

:::tip
ストレージボリュームはまだありません。次に作成します。
:::

```sh
Empty set (0.04 sec)
```

#### 共有データストレージボリュームを作成する

以前、MinIOに「」という名前のバケットを作成しました。`my-starrocks-volume`、そしてMinIOに「」という名前のアクセスキーがあることを確認しました。`AAAAAAAAAAAAAAAAAAAA`。以下のSQLは、アクセスキーとシークレットを使用してMinIOバケットにストレージボリュームを作成します。

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

ストレージボリュームの詳細を表示し、これがまだデフォルトボリュームではなく、あなたのバケットを使用するように構成されていることに注意してください。

```
DESC STORAGE VOLUME s3_volume\G
```

:::tip
このドキュメント、およびStarRocksドキュメントの他の多くのドキュメントにあるSQLの一部は、「」で終わっています。`\G`セミコロンの代わりに。この「」は`\G`mysql CLIがクエリ結果を垂直に表示するようにします。

多くのSQLクライアントは垂直フォーマットの出力を解釈しないため、「」を`\G`「」に置き換える必要があります。`;`。
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

***

## テーブルを作成する

これらのSQLコマンドは、SQLクライアントで実行されます。

```SQL
CREATE DATABASE IF NOT EXISTS quickstart;
```

データベース「」が`quickstart`ストレージボリューム「」を使用していることを確認します。`s3_volume`：

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

***

### Redpandaコンソールを開く

まだトピックはありませんが、次のステップでトピックが作成されます。

http://localhost:8080/overview

### Redpandaトピックにデータを公開する

「」フォルダーのコマンドシェルから、`routineload/`このコマンドを実行してデータを生成します。

```python
python gen.py 5
```

:::tip

お使いのシステムでは、「」を`python3`「」の代わりに`python`コマンドで使用する必要があるかもしれません。

「」が不足している場合は、`kafka-python`次を試してください。

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

### Redpandaコンソールで確認する

Redpanda Consoleでhttp://localhost:8080/topicsに移動すると、という名前のトピックが1つ表示されます。`test2`。そのトピックを選択し、次に**メッセージ**タブを選択すると、の出力に一致する5つのメッセージが表示されます。`gen.py`。

## メッセージを消費する

StarRocksでは、以下のためのルーチンロードジョブを作成します。

1. Redpandaトピックからメッセージを消費する`test2`
2. それらのメッセージをテーブルにロードする`site_clicks`

StarRocksはストレージにMinIOを使用するように構成されているため、に挿入されたデータは`site_clicks`テーブルはMinIOに保存されます。

### ルーチンロードジョブを作成する

SQLクライアントでこのコマンドを実行してルーチンロードジョブを作成します。このコマンドはラボの最後に詳しく説明されます。

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

### ルーチンロードジョブを確認する

```SQL
SHOW ROUTINE LOAD\G
```

強調表示された3行を確認します。

1. 状態は`RUNNING`
2. トピックは`test2`で、ブローカーは`redpanda:2092`
3. 統計には、を実行した時期に応じて、ロードされた行が0または5と表示されるはずです。`SHOW ROUTINE LOAD`コマンド。ロードされた行が0の場合は、もう一度実行してください。

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

***

## データがMinIOに保存されていることを確認する

MinIOを開く[http://localhost:9001/browser/](http://localhost:9001/browser/)を開き、の下にオブジェクトが保存されていることを確認します。`my-starrocks-bucket`。

***

## StarRocksからデータをクエリする

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

## 追加データを公開する

を再度実行すると、`gen.py`Redpandaにさらに5つのレコードが公開されます。

```bash
python gen.py 5
```

### データが追加されたことを確認する

ルーチンロードジョブはスケジュール（デフォルトでは10秒ごと）で実行されるため、データは数秒以内にロードされます。

```SQL
SELECT * FROM site_clicks;
```

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

***

## 設定の詳細

StarRocksを共有データで使用する経験をした今、その設定を理解することが重要です。

### CN設定

ここで使用されているCN設定はデフォルトです。CNは共有データでの使用を想定して設計されているためです。デフォルト設定を以下に示します。変更を加える必要はありません。

```bash
sys_log_level = INFO

# ports for admin, web, heartbeat service
be_port = 9060
be_http_port = 8040
heartbeat_service_port = 9050
brpc_port = 8060
starlet_port = 9070
```

### FE設定

FE設定はデフォルトとは若干異なります。FEは、データがBEノードのローカルディスクではなくオブジェクトストレージに保存されることを想定して構成する必要があるためです。

`docker-compose.yml`ファイルは、のFE設定を生成します。`command`。

```plaintext
# enable shared data, set storage type, set endpoint
run_mode = shared_data
cloud_native_storage_type = S3
```

:::note
この設定ファイルには、FE のデフォルトエントリは含まれておらず、共有データの設定のみが表示されています。
:::

デフォルト以外の FE 設定:

:::note
多くの設定パラメータには、`s3_`というプレフィックスが付いています。このプレフィックスは、すべての Amazon S3 互換ストレージタイプ (例: S3、GCS、MinIO) で使用されます。Azure Blob Storage を使用する場合のプレフィックスは `azure_`です。
:::

#### `run_mode=shared_data`

これにより、共有データの使用が可能になります。

#### `cloud_native_storage_type=S3`

これは、S3 互換ストレージまたは Azure Blob Storage のどちらが使用されるかを指定します。MinIO の場合は常に S3 です。

### の詳細`CREATE storage volume`

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

MinIO を使用する場合、アクセスキーが使用されるため、インスタンスプロファイルは MinIO では使用されません。

#### `aws_s3_use_aws_sdk_default_behavior=false`

MinIO を使用する場合、このパラメータは常に false に設定されます。

***

## Routine Load コマンドに関する注意点

StarRocks の Routine Load は多くの引数を取ります。ここではこのチュートリアルで使用されるもののみを説明し、残りは詳細情報セクションでリンクされます。

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

のパラメータは次のとおりです。`CREATE ROUTINE LOAD ON`

- database_name.job_name
- table_name

`database_name`はオプションです。このラボでは、`quickstart`であり、指定されています。

`job_name`は必須であり、`clicks`

`table_name`は必須であり、`site_clicks`

### ジョブプロパティ

#### プロパティ `format`

```
"format" = "JSON",
```

この場合、データは JSON 形式であるため、プロパティは `JSON`に設定されます。その他の有効な形式は次のとおりです。`CSV`、`JSON`、および`Avro`です。`CSV`がデフォルトです。

#### プロパティ `jsonpaths`

```
"jsonpaths" ="[\"$.uid\",\"$.site\",\"$.vtime\"]"
```

JSON 形式のデータからロードしたいフィールドの名前。このパラメータの値は有効な JsonPath 式です。詳細はこのページの最後にあります。

### データソースプロパティ

#### `kafka_broker_list`

```
"kafka_broker_list" = "redpanda:29092",
```

Kafka のブローカー接続情報。形式は `<kafka_broker_name_or_ip>:<broker_ port>`です。複数のブローカーはコンマで区切られます。

#### `kafka_topic`

```
"kafka_topic" = "test2",
```

消費する Kafka トピック。

#### `kafka_partitions`と`kafka_offsets`

```
"kafka_partitions" = "0",
"kafka_offsets" = "OFFSET_BEGINNING"
```

これらのプロパティは、1つの「」があるため、まとめて提示されます。`kafka_offset`」が各「」に必要です。`kafka_partitions`」エントリ。

`kafka_partitions`は、消費する1つ以上のパーティションのリストです。このプロパティが設定されていない場合、すべてのパーティションが消費されます。

`kafka_offsets`は、にリストされている各パーティションに対応するオフセットのリストです。`kafka_partitions`。この場合、値は「`OFFSET_BEGINNING`」であり、すべてのデータが消費されます。デフォルトでは、新しいデータのみが消費されます。

***

## 概要

このチュートリアルでは、次のことを行いました。

- DockerにStarRocks、Reedpanda、Minioをデプロイしました
- Kafkaトピックからデータを消費するルーチンロードジョブを作成しました
- MinIOを使用するStarRocksストレージボリュームを構成する方法を学びました

## 詳細情報

[StarRocksアーキテクチャ](../introduction/Architecture.md)

このラボで使用されているサンプルは非常にシンプルです。ルーチンロードには、さらに多くのオプションと機能があります。[詳細はこちら](../loading/RoutineLoad.md)。

[JSONPath](https://goessner.net/articles/JsonPath/)
