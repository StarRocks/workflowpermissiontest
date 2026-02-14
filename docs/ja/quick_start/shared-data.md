---
displayed_sidebar: docs
sidebar_position: 2
description: コンピューティングとストレージの分離
---

# ストレージとコンピューティングの分離

import DDL from '../_assets/quick-start/_DDL.mdx'
import Clients from '../_assets/quick-start/_clientsCompose.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'
import Curl from '../_assets/quick-start/_curl.mdx'

ストレージとコンピューティングが分離されたシステムでは、データはAmazon S3、Google Cloud Storage、Azure Blob Storage、およびMinIOのようなS3互換ストレージなどの低コストで信頼性の高いリモートストレージシステムに保存されます。ホットデータはローカルにキャッシュされ、キャッシュがヒットした場合、クエリパフォーマンスはストレージ・コンピューティング結合アーキテクチャのものと同等になります。Computeノード（CN）は数秒でオンデマンドに追加または削除できます。このアーキテクチャにより、ストレージコストが削減され、より良いリソース分離が保証され、弾力性とスケーラビリティが提供されます。

このチュートリアルでは以下を扱います。

- DockerコンテナでStarRocksを実行する
- オブジェクトストレージにMinIOを使用する
- 共有データ用にStarRocksを設定する
- 2つの公開データセットをロードする
- SELECTとJOINでデータを分析する
- 基本的なデータ変換（ETLの**T**）

使用されるデータは、NYC OpenDataとNOAAの国立環境情報センターによって提供されています。

これらのデータセットはどちらも非常に大きく、このチュートリアルはStarRocksの操作に慣れることを目的としているため、過去120年間のデータをロードすることはありません。Dockerに4GBのRAMが割り当てられたマシンでDockerイメージを実行し、このデータをロードできます。より大規模な耐障害性のあるスケーラブルなデプロイについては、他のドキュメントがあり、後で提供します。

このドキュメントには多くの情報が含まれており、最初にはステップバイステップの内容、最後には技術的な詳細が提示されています。これは、以下の目的をこの順序で達成するために行われています。

1. 読者が共有データデプロイメントにデータをロードし、そのデータを分析できるようにする。
2. 共有データデプロイメントの構成詳細を提供する。
3. ロード中のデータ変換の基本を説明する。

---

## 前提条件

### Docker

- [Docker](https://docs.docker.com/engine/install/)
- Dockerに割り当てられた4 GBのRAM
- Dockerに割り当てられた10 GBの空きディスク容量

### SQLクライアント

Docker環境で提供されるSQLクライアント、またはご自身のシステム上のクライアントを使用できます。多くのMySQL互換クライアントが動作し、このガイドではDBeaverとMySQL Workbenchの設定について説明します。

### curl

`curl`は、StarRocksへのデータロードジョブの発行と、データセットのダウンロードに使用されます。OSのプロンプトで`curl`または`curl.exe`を実行して、インストールされているか確認してください。curlがインストールされていない場合は、[こちらからcurlを入手してください](https://curl.se/dlwiz/?type=bin)。

### `/etc/hosts`

このガイドで使用されているインジェスト方法はStream Loadです。Stream LoadはFEサービスに接続してインジェストジョブを開始します。FEは次に、このガイドではCNであるバックエンドノードにジョブを割り当てます。インジェストジョブがCNに接続できるようにするには、CNの名前がオペレーティングシステムで利用可能である必要があります。この行を`/etc/hosts`に追加してください。

```bash
127.0.0.1 starrocks-cn
```

---

## 用語

### FE

フロントエンドノードは、メタデータ管理、クライアント接続管理、クエリ計画、およびクエリスケジューリングを担当します。各FEはメタデータの完全なコピーをそのメモリに保存および維持し、FE間の無差別なサービスを保証します。

### CN

Computeノードは、共有データデプロイメントでクエリプランを実行する責任があります。

### BE

バックエンドノードは、データストレージと共有ナッシングデプロイメントでのクエリプランの実行の両方を担当します。

:::note
このガイドではBEを使用しません。この情報は、BEとCNの違いを理解していただくためにここに含められています。
:::

---

## ホストファイルを編集する

このガイドで使用されているインジェスト方法はStream Loadです。Stream LoadはFEサービスに接続してインジェストジョブを開始します。FEは次に、このガイドではCNであるバックエンドノードにジョブを割り当てます。インジェストジョブがCNに接続できるようにするには、CNの名前がオペレーティングシステムで利用可能である必要があります。この行を`/etc/hosts`に追加してください。

```bash
127.0.0.1 starrocks-cn
```

## ラボファイルをダウンロードする

ダウンロードするファイルは3つあります。

- StarRocksとMinIO環境をデプロイするDocker Composeファイル
- ニューヨーク市の衝突事故データ
- 天気データ

このガイドでは、GNU Affero General Public Licenseの下で提供されるS3互換オブジェクトストレージであるMinIOを使用します。

### ラボファイルを保存するディレクトリを作成する

```bash
mkdir quickstart
cd quickstart
```

### Docker Composeファイルをダウンロードする

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/docker-compose.yml
```

### データをダウンロードする

以下の2つのデータセットをダウンロードしてください。

#### ニューヨーク市の衝突事故データ

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/NYPD_Crash_Data.csv
```

#### 天気データ

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/72505394728.csv
```

---

## StarRocksとMinIOをデプロイする

```bash
docker compose up --detach --wait --wait-timeout 120
```

FE、CN、およびMinIOサービスが正常になるまで約30秒かかります。`quickstart-minio_mc-1`コンテナは`Waiting`ステータスと終了コードを表示します。終了コード`0`は成功を示します。

```bash
[+] Running 4/5
 ✔ Network quickstart_default       Created    0.0s
 ✔ Container minio                  Healthy    6.8s
 ✔ Container starrocks-fe           Healthy    29.3s
 ⠼ Container quickstart-minio_mc-1  Waiting    29.3s
 ✔ Container starrocks-cn           Healthy    29.2s
container quickstart-minio_mc-1 exited (0)
```

---

## MinIO

このクイックスタートでは、共有ストレージにMinIOを使用します。

### MinIOの認証情報を確認する

StarRocksでオブジェクトストレージとしてMinIOを使用するには、StarRocksにMinIOのアクセスキーが必要です。アクセスキーはDockerサービスの起動時に生成されました。StarRocksがMinIOに接続する方法をよりよく理解するために、キーが存在することを確認する必要があります。

[http://localhost:9001/access-keys](http://localhost:9001/access-keys)にアクセスしてください。ユーザー名とパスワードはDocker composeファイルで指定されており、`miniouser`と`miniopassword`です。アクセスキーが1つ表示されるはずです。キーは`AAAAAAAAAAAAAAAAAAAA`であり、MinIOコンソールではシークレットを見ることはできませんが、Docker composeファイルには`BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`として記述されています。

![MinIOアクセスキーの表示](../_assets/quick-start/MinIO-view-key.png)

:::tip
MinIOのWeb UIにアクセスキーが表示されない場合は、`minio_mc`サービスのログを確認してください。

```bash
docker compose logs minio_mc
```

`minio_mc`ポッドを再実行してみてください。

```bash
docker compose run minio_mc
```
:::

### データ用のバケットを作成する

StarRocksでストレージボリュームを作成するときは、データの`LOCATION`を指定します。

```sh
    LOCATIONS = ("s3://my-starrocks-bucket/")
```

[http://localhost:9001/buckets](http://localhost:9001/buckets)を開き、ストレージボリューム用のバケットを追加します。バケットに`my-starrocks-bucket`という名前を付けます。リストされている3つのオプションはデフォルトのままにしてください。

---

## SQLクライアント

<Clients />

---

## 共有データ用のStarRocks構成

この時点で、StarRocksとMinIOが稼働しています。MinIOのアクセスキーはStarRocksとMinIOを接続するために使用されます。

これは、StarRocksデプロイメントが共有データを使用することを指定する`FE`構成の一部です。これはDocker Composeがデプロイを作成したときにファイル`fe.conf`に追加されました。

```sh
# enable the shared data run mode
run_mode = shared_data
cloud_native_storage_type = S3
```

:::info
これらの設定は、`quickstart`ディレクトリからこのコマンドを実行し、ファイルの最後を見ることで確認できます。
:::

```sh
docker compose exec starrocks-fe \
  cat /opt/starrocks/fe/conf/fe.conf
```
:::

### SQLクライアントでStarRocksに接続する

:::tip

`docker-compose.yml`ファイルが含まれるディレクトリからこのコマンドを実行してください。

MySQLコマンドラインクライアント以外のクライアントを使用している場合は、今すぐそれを開いてください。
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
ストレージボリュームは存在しないはずです。次に作成します。
:::

```sh
Empty set (0.04 sec)
```

#### 共有データストレージボリュームを作成する

以前にMinIOで`my-starrocks-volume`という名前のバケットを作成し、MinIOに`AAAAAAAAAAAAAAAAAAAA`というアクセスキーがあることを確認しました。以下のSQLは、アクセスキーとシークレットを使用してMinIOバケットにストレージボリュームを作成します。

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

これでストレージボリュームがリスト表示されるはずです。以前は空のセットでした。

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

ストレージボリュームの詳細を表示し、これがまだデフォルトボリュームではないこと、およびご自身のバケットを使用するように構成されていることに注意してください。

```
DESC STORAGE VOLUME s3_volume\G
```

:::tip
このドキュメントの一部のSQL、およびStarRocksドキュメントの他の多くのドキュメントでは、セミコロンの代わりに`\G`で終わります。`\G`はmysql CLIにクエリ結果を垂直に表示させます。

多くのSQLクライアントは垂直フォーマット出力を解釈しないため、`\G`を`;`に置き換える必要があります。
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

## データベースを作成する

```
CREATE DATABASE IF NOT EXISTS quickstart;
```

データベース`quickstart`がストレージボリューム`s3_volume`を使用していることを確認してください。

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

---

## テーブルを作成する

<DDL />

---

## 2つのデータセットをロードする

StarRocksにデータをロードする方法はたくさんあります。このチュートリアルでは、curlとStarRocks Stream Loadを使用するのが最も簡単な方法です。

:::tip

データセットをダウンロードしたディレクトリからこれらのcurlコマンドを実行してください。

パスワードの入力を求められます。MySQLの`root`ユーザーにパスワードを割り当てていない場合は、Enterキーを押すだけです。

:::

`curl`コマンドは複雑に見えますが、チュートリアルの最後に詳細が説明されています。今のところは、コマンドを実行し、SQLでデータを分析してから、最後にデータロードの詳細について読むことをお勧めします。

### ニューヨーク市の衝突事故データ - クラッシュ

```bash
curl --location-trusted -u root             \
    -T ./NYPD_Crash_Data.csv                \
    -H "label:crashdata-0"                  \
    -H "column_separator:,"                 \
    -H "skip_header:1"                      \
    -H "enclose:\""                         \
    -H "max_filter_ratio:1"                 \
    -H "columns:tmp_CRASH_DATE, tmp_CRASH_TIME, CRASH_DATE=str_to_date(concat_ws(' ', tmp_CRASH_DATE, tmp_CRASH_TIME), '%m/%d/%Y %H:%i'),BOROUGH,ZIP_CODE,LATITUDE,LONGITUDE,LOCATION,ON_STREET_NAME,CROSS_STREET_NAME,OFF_STREET_NAME,NUMBER_OF_PERSONS_INJURED,NUMBER_OF_PERSONS_KILLED,NUMBER_OF_PEDESTRIANS_INJURED,NUMBER_OF_PEDESTRIANS_KILLED,NUMBER_OF_CYCLIST_INJURED,NUMBER_OF_CYCLIST_KILLED,NUMBER_OF_MOTORIST_INJURED,NUMBER_OF_MOTORIST_KILLED,CONTRIBUTING_FACTOR_VEHICLE_1,CONTRIBUTING_FACTOR_VEHICLE_2,CONTRIBUTING_FACTOR_VEHICLE_3,CONTRIBUTING_FACTOR_VEHICLE_4,CONTRIBUTING_FACTOR_VEHICLE_5,COLLISION_ID,VEHICLE_TYPE_CODE_1,VEHICLE_TYPE_CODE_2,VEHICLE_TYPE_CODE_3,VEHICLE_TYPE_CODE_4,VEHICLE_TYPE_CODE_5" \
    -XPUT http://localhost:8030/api/quickstart/crashdata/_stream_load
```

上記のコマンドの出力です。最初のハイライトされたセクションは、期待される結果（OK、および1行を除くすべての行が挿入されたこと）を示しています。1行は列数が正しくないためフィルタリングされました。

```bash
Enter host password for user 'root':
{
    "TxnId": 2,
    "Label": "crashdata-0",
    "Status": "Success",
    # highlight-start
    "Message": "OK",
    "NumberTotalRows": 423726,
    "NumberLoadedRows": 423725,
    # highlight-end
    "NumberFilteredRows": 1,
    "NumberUnselectedRows": 0,
    "LoadBytes": 96227746,
    "LoadTimeMs": 1013,
    "BeginTxnTimeMs": 21,
    "StreamLoadPlanTimeMs": 63,
    "ReadDataTimeMs": 563,
    "WriteDataTimeMs": 870,
    "CommitAndPublishTimeMs": 57,
    # highlight-start
    "ErrorURL": "http://starrocks-cn:8040/api/_load_error_log?file=error_log_da41dd88276a7bfc_739087c94262ae9f"
    # highlight-end
}%
```

エラーが発生した場合、出力にはエラーメッセージを表示するためのURLが提供されます。エラーメッセージには、Stream Loadジョブが割り当てられたバックエンドノード（`starrocks-cn`）も含まれます。`/etc/hosts`ファイルに`starrocks-cn`のエントリを追加したため、それにナビゲートしてエラーメッセージを読むことができることができるはずです。

<details>

<summary>ブラウザでエラーメッセージを読む</summary>

```bash
Error: Value count does not match column count. Expect 29, but got 32.

Column delimiter: 44,Row delimiter: 10.. Row: 09/06/2015,14:15,,,40.6722269,-74.0110059,"(40.6722269, -74.0110059)",,,"R/O 1 BEARD ST. ( IKEA'S 
09/14/2015,5:30,BRONX,10473,40.814551,-73.8490955,"(40.814551, -73.8490955)",TORRY AVENUE                    ,NORTON AVENUE                   ,,0,0,0,0,0,0,0,0,Driver Inattention/Distraction,Unspecified,,,,3297457,PASSENGER VEHICLE,PASSENGER VEHICLE,,,
```

</details>

### 天気データ

クラッシュデータと同様の方法で天気データセットをロードします。

```bash
curl --location-trusted -u root             \
    -T ./72505394728.csv                    \
    -H "label:weather-0"                    \
    -H "column_separator:,"                 \
    -H "skip_header:1"                      \
    -H "enclose:\""                         \
    -H "max_filter_ratio:1"                 \
    -H "columns: STATION, DATE, LATITUDE, LONGITUDE, ELEVATION, NAME, REPORT_TYPE, SOURCE, HourlyAltimeterSetting, HourlyDewPointTemperature, HourlyDryBulbTemperature, HourlyPrecipitation, HourlyPresentWeatherType, HourlyPressureChange, HourlyPressureTendency, HourlyRelativeHumidity, HourlySkyConditions, HourlySeaLevelPressure, HourlyStationPressure, HourlyVisibility, HourlyWetBulbTemperature, HourlyWindDirection, HourlyWindGustSpeed, HourlyWindSpeed, Sunrise, Sunset, DailyAverageDewPointTemperature, DailyAverageDryBulbTemperature, DailyAverageRelativeHumidity, DailyAverageSeaLevelPressure, DailyAverageStationPressure, DailyAverageWetBulbTemperature, DailyAverageWindSpeed, DailyCoolingDegreeDays, DailyDepartureFromNormalAverageTemperature, DailyHeatingDegreeDays, DailyMaximumDryBulbTemperature, DailyMinimumDryBulbTemperature, DailyPeakWindDirection, DailyPeakWindSpeed, DailyPrecipitation, DailySnowDepth, DailySnowfall, DailySustainedWindDirection, DailySustainedWindSpeed, DailyWeather, MonthlyAverageRH, MonthlyDaysWithGT001Precip, MonthlyDaysWithGT010Precip, MonthlyDaysWithGT32Temp, MonthlyDaysWithGT90Temp, MonthlyDaysWithLT0Temp, MonthlyDaysWithLT32Temp, MonthlyDepartureFromNormalAverageTemperature, MonthlyDepartureFromNormalCoolingDegreeDays, MonthlyDepartureFromNormalHeatingDegreeDays, MonthlyDepartureFromNormalMaximumTemperature, MonthlyDepartureFromNormalMinimumTemperature, MonthlyDepartureFromNormalPrecipitation, MonthlyDewpointTemperature, MonthlyGreatestPrecip, MonthlyGreatestPrecipDate, MonthlyGreatestSnowDepth, MonthlyGreatestSnowDepthDate, MonthlyGreatestSnowfall, MonthlyGreatestSnowfallDate, MonthlyMaxSeaLevelPressureValue, MonthlyMaxSeaLevelPressureValueDate, MonthlyMaxSeaLevelPressureValueTime, MonthlyMaximumTemperature, MonthlyMeanTemperature, MonthlyMinSeaLevelPressureValue, MonthlyMinSeaLevelPressureValueDate, MonthlyMinSeaLevelPressureValueTime, MonthlyMinimumTemperature, MonthlySeaLevelPressure, MonthlyStationPressure, MonthlyTotalLiquidPrecipitation, MonthlyTotalSnowfall, MonthlyWetBulb, AWND, CDSD, CLDD, DSNW, HDSD, HTDD, NormalsCoolingDegreeDay, NormalsHeatingDegreeDay, ShortDurationEndDate005, ShortDurationEndDate010, ShortDurationEndDate015, ShortDurationEndDate020, ShortDurationEndDate030, ShortDurationEndDate045, ShortDurationEndDate060, ShortDurationEndDate080, ShortDurationEndDate100, ShortDurationEndDate120, ShortDurationEndDate150, ShortDurationEndDate180, ShortDurationPrecipitationValue005, ShortDurationPrecipitationValue010, ShortDurationPrecipitationValue015, ShortDurationPrecipitationValue020, ShortDurationPrecipitationValue030, ShortDurationPrecipitationValue045, ShortDurationPrecipitationValue060, ShortDurationPrecipitationValue080, ShortDurationPrecipitationValue100, ShortDurationPrecipitationValue120, ShortDurationPrecipitationValue150, ShortDurationPrecipitationValue180, REM, BackupDirection, BackupDistance, BackupDistanceUnit, BackupElements, BackupElevation, BackupEquipment, BackupLatitude, BackupLongitude, BackupName, WindEquipmentChangeDate" \
    -XPUT http://localhost:8030/api/quickstart/weatherdata/_stream_load
```

---

## データがMinIOに保存されていることを確認する

MinIO [http://localhost:9001/browser/my-starrocks-bucket](http://localhost:9001/browser/my-starrocks-bucket)を開き、`my-starrocks-bucket/`の下にエントリがあることを確認してください。

:::tip
`my-starrocks-bucket/`以下のフォルダ名は、データをロードするときに生成されます。`my-starrocks-bucket`の下に単一のディレクトリが表示され、そのさらに下に2つのディレクトリが表示されるはずです。これらのディレクトリには、データ、メタデータ、またはスキーマのエントリが見つかります。

![MinIOオブジェクトブラウザ](../_assets/quick-start/MinIO-data.png)
:::

---

## 質問に答える

<SQL />

---

## 共有データ用にStarRocksを構成する

StarRocksを共有データで使用する経験を積んだ今、その構成を理解することが重要です。

### CN構成

ここで使用されているCN構成はデフォルトであり、CNは共有データでの使用向けに設計されています。デフォルト構成を以下に示します。変更を加える必要はありません。

```bash
sys_log_level = INFO

# ports for admin, web, heartbeat service
be_port = 9060
be_http_port = 8040
heartbeat_service_port = 9050
brpc_port = 8060
starlet_port = 9070
```

### FE構成

FE構成はデフォルトとわずかに異なります。これは、FEがBEノードのローカルディスクではなく、オブジェクトストレージにデータが保存されることを想定するように構成する必要があるためです。

`docker-compose.yml`ファイルは、`command`内でFE構成を生成します。

```plaintext
# enable shared data, set storage type, set endpoint
run_mode = shared_data
cloud_native_storage_type = S3
```

:::note
この構成ファイルにはFEのデフォルトエントリは含まれておらず、共有データ構成のみが表示されています。
:::

デフォルト以外のFE構成設定：

:::note
多くの構成パラメーターには`s3_`というプレフィックスが付いています。このプレフィックスは、すべてのAmazon S3互換ストレージタイプ（例：S3、GCS、MinIO）に使用されます。Azure Blob Storageを使用する場合は、プレフィックスは`azure_`です。
:::

#### `run_mode=shared_data`

これにより、共有データ利用が有効になります。

#### `cloud_native_storage_type=S3`

これにより、S3互換ストレージまたはAzure Blob Storageのどちらが使用されるかが指定されます。MinIOの場合、これは常にS3です。

### `CREATE storage volume`の詳細

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

ポート番号を含むMinIOエンドポイント。

#### `aws_s3_path=starrocks`

バケット名。

#### `aws_s3_access_key=AAAAAAAAAAAAAAAAAAAA`

MinIOアクセスキー。

#### `aws_s3_secret_key=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`

MinIOアクセスキーシークレット。

#### `aws_s3_use_instance_profile=false`

MinIOを使用する場合、アクセスキーが使用されるため、MinIOではインスタンスプロファイルは使用されません。

#### `aws_s3_use_aws_sdk_default_behavior=false`

MinIOを使用する場合、このパラメーターは常にfalseに設定されます。

### FQDNモードの構成

FEを起動するコマンドも変更されます。Docker ComposeファイルのFEサービスコマンドには、`--host_type FQDN`オプションが追加されています。`host_type`を`FQDN`に設定することで、Stream LoadジョブはIPアドレスではなく、CNポッドの完全修飾ドメイン名に転送されます。これは、IPアドレスがDocker環境に割り当てられた範囲にあり、通常ホストマシンから利用できないためです。

これら3つの変更により、ホストネットワークとCN間のトラフィックが許可されます。

- `--host_type`を`FQDN`に設定する
- CNのポート8040をホストネットワークに公開する
- `starrocks-cn`を`127.0.0.1`に指すエントリをhostsファイルに追加する

---

## まとめ

このチュートリアルでは、以下のことを行いました。

- DockerにStarRocksとMinioをデプロイしました
- MinIOアクセスキーを作成しました
- MinIOを使用するStarRocksストレージボリュームを設定しました
- ニューヨーク市が提供する衝突事故データとNOAAが提供する天気データをロードしました
- SQL JOINを使用してデータを分析し、視界の悪い場所や凍結した道路での運転は危険であることを発見しました

学ぶべきことはまだたくさんあります。Stream Load中に行われるデータ変換については意図的に省略しました。その詳細は、以下のcurlコマンドに関する注記にあります。

## curlコマンドに関する注記

<Curl />

## 詳細情報

[StarRocksテーブル設計](../table_design/StarRocks_table_design.md)

[Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)

[自動車衝突事故 - クラッシュ](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95)データセットは、ニューヨーク市によって、[利用規約](https://www.nyc.gov/home/terms-of-use.page)および[プライバシーポリシー](https://www.nyc.gov/home/privacy-policy.page)に従って提供されています。

[地域気象データ](https://www.ncdc.noaa.gov/cdo-web/datatools/lcd)(LCD)は、NOAAによって、この[免責事項](https://www.noaa.gov/disclaimer)およびこの[プライバシーポリシー](https://www.noaa.gov/protecting-your-privacy)と共に提供されています。
