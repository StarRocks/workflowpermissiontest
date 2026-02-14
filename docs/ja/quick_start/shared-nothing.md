```md
---
displayed_sidebar: docs
sidebar_position: 1
description: "Docker での StarRocks: JOIN を使用して実データをクエリする"
---
import DDL from '../_assets/quick-start/_DDL.mdx'
import Clients from '../_assets/quick-start/_clientsAllin1.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'
import Curl from '../_assets/quick-start/_curl.mdx'

# Docker を使用した StarRocks のデプロイ

このチュートリアルでは以下を説明します。

- 単一の Docker コンテナで StarRocks を実行する
- 基本的なデータ変換を含む 2 つの公開データセットを ロード する
- SELECT と ジョイン を使用してデータを分析する
- 基本的なデータ変換（ETL の **T**）

## よろしければ動画をご覧ください

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/h7F4U6xEA5M"
  title="StarRocks in 5 - Getting Started With StarRocks on Docker"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>

使用されているデータは、NYC OpenData と National Centers for Environmental Information によって提供されています。

両方のデータセットは大規模であり、このチュートリアルは StarRocks の操作に慣れていただくことを目的としているため、過去 120 年分のデータを ロード するわけではありません。Docker に 4 GB の RAM が割り当てられたマシンで Docker イメージを実行し、このデータを ロード できます。より大規模な耐障害性のある 高拡張性 のデプロイについては、他のドキュメントがあり、後で提供します。

このドキュメントには多くの情報が含まれており、最初にステップバイステップの内容が提示され、最後に技術的な詳細が説明されています。これは、以下の目的をこの順序で達成するために行われています。

1. 読者が StarRocks にデータを ロード し、そのデータを分析できるようにする。
2. ロード 中のデータ変換の基本を説明する。

---

## 前提条件

### Docker

- [Docker](https://docs.docker.com/engine/install/)
- Docker に 4 GB の RAM を割り当て
- Docker に 10 GB の空きディスク容量を割り当て

### SQL クライアント

Docker 環境で提供される SQL クライアントを使用することも、お使いのシステム上のクライアントを使用することもできます。多くの MySQL 互換クライアントが機能し、このガイドでは DBeaver と MySQL Workbench の設定について説明します。

### curl

`curl` は StarRocks への データロード ジョブの発行と、データセットのダウンロードに使用されます。OS のプロンプトで `curl` または `curl.exe` を実行して、インストールされているかどうかを確認してください。curl がインストールされていない場合は、[こちらから curl を入手](https://curl.se/dlwiz/?type=bin) してください。

---

## 用語

### FE

FE は、メタデータ管理、クライアント接続管理、 クエリプランニング 、および クエリスケジューリング を担当します。各 FE は、完全なメタデータコピーをメモリに保存・維持し、 FE 間での無差別なサービスを保証します。

### BE

BE は、データストレージと クエリプラン の実行の両方を担当します。

---

## StarRocks の起動

```bash
docker pull starrocks/allin1-ubuntu
docker run -p 9030:9030 -p 8030:8030 -p 8040:8040 -itd \
--name quickstart starrocks/allin1-ubuntu
```

---

## SQL クライアント

<Clients />

---

## データのダウンロード

これら 2 つのデータセットをマシンにダウンロードします。Docker を実行しているホストマシンにダウンロードできます。コンテナ内にダウンロードする必要はありません。

### ニューヨーク市衝突データ

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/NYPD_Crash_Data.csv
```

### 気象データ

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/72505394728.csv
```

---

### SQL クライアントで StarRocks に接続する

:::tip

mysql CLI 以外のクライアントを使用している場合は、今すぐ開いてください。
:::

このコマンドは、Docker コンテナ内で `mysql` コマンドを実行します。

```sql
docker exec -it quickstart \
mysql -P 9030 -h 127.0.0.1 -u root --prompt="StarRocks > "
```

---

## テーブルの作成

<DDL />

---

## 2 つのデータセットを ロード する

StarRocks にデータを ロード する方法はたくさんあります。このチュートリアルでは、最も簡単な方法は curl と StarRocks Stream Load を使用することです。

:::tip
これらの curl コマンドは `mysql` クライアントではなく、オペレーティングシステムのプロンプトで実行されるため、新しいシェルを開いてください。コマンドはダウンロードしたデータセットを参照するため、ファイルをダウンロードしたディレクトリから実行してください。

パスワードの入力を求められます。MySQL の `root` ユーザーにパスワードを割り当てていない場合は、そのまま Enter キーを押してください。
:::

curl コマンドは複雑に見えますが、チュートリアルの最後に詳細が説明されています。今のところ、コマンドを実行して SQL でデータを分析し、その後、 データロード の詳細について最後で読むことをお勧めします。

### ニューヨーク市衝突データ - 事故

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

以下は、前述のコマンドの出力です。最初のハイライトされたセクションは、期待される出力（OK と 1 行を除くすべての行が挿入されたこと）を示しています。1 行は、正しい列数を含んでいなかったためフィルタリングされました。

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
    "ErrorURL": "http://127.0.0.1:8040/api/_load_error_log?file=error_log_da41dd88276a7bfc_739087c94262ae9f"
    # highlight-end
}%
```

エラーがあった場合、出力にはエラーメッセージを確認するための URL が表示されます。ブラウザでこれを開いて、何が起こったかを確認してください。詳細を展開して、サンプルエラーメッセージを表示します。

<details>

<summary>ブラウザでのエラーメッセージの読み取り</summary>

```bash
Error: Target column count: 29 doesn't match source value column count: 32. Column separator: ',', Row delimiter: '\n'. Row: 09/06/2015,14:15,,,40.6722269,-74.0110059,"(40.6722269, -74.0110059)",,,"R/O 1 BEARD ST. ( IKEA'S 
09/14/2015,5:30,BRONX,10473,40.814551,-73.8490955,"(40.814551, -73.8490955)",TORRY AVENUE                    ,NORTON AVENUE                   ,,0,0,0,0,0,0,0,0,Driver Inattention/Distraction,Unspecified,,,,3297457,PASSENGER VEHICLE,PASSENGER VEHICLE,,,
```

</details>

### 気象データ

クラッシュデータを ロード したのと同じ方法で、気象データセットを ロード します。

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

## いくつかの質問に答える

<SQL />

---

## まとめ

このチュートリアルでは、以下を行いました。

- Docker に StarRocks をデプロイした
- ニューヨーク市が提供するクラッシュデータと NOAA が提供する気象データを ロード した
- SQL ジョイン を使用してデータを分析し、視界の悪い場所や凍結した道路での運転は危険であることを見出した

学ぶべきことはまだたくさんあります。Stream Load 中に行われたデータ変換については意図的に詳しく説明しませんでした。その詳細については、以下の curl コマンドに関するメモに記載されています。

---

## curl コマンドに関する注意事項

<Curl />

---

## 詳細情報

[StarRocks テーブル設計](../table_design/StarRocks_table_design.md)

[Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)

[Motor Vehicle Collisions - Crashes](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95) データセットは、ニューヨーク市によって提供されており、[利用規約](https://www.nyc.gov/home/terms-of-use.page) および [プライバシーポリシー](https://www.nyc.gov/home/privacy-policy.page) に従います。

[Local Climatological Data](https://www.ncdc.noaa.gov/cdo-web/datatools/lcd)（LCD）は、NOAA によって提供されており、[免責事項](https://www.noaa.gov/disclaimer) および [プライバシーポリシー](https://www.noaa.gov/protecting-your-privacy) が適用されます。
```
