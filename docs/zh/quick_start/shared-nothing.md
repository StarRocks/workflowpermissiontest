displayed_sidebar: docs
sidebar_position: 1
description: "StarRocks in Docker: Query real data with JOINs"
---

import DDL from '../_assets/quick-start/_DDL.mdx'
import Clients from '../_assets/quick-start/_clientsAllin1.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'
import Curl from '../_assets/quick-start/_curl.mdx'

# 使用 Docker 部署 StarRocks

本教程涵盖：

- 在单个 Docker 容器中运行 StarRocks
- 导入两个公共数据集，包括数据的基本转换
- 使用 SELECT 和 JOIN 分析数据
- 基本数据转换（ETL 中的 **T**）

## 如果您愿意，可以观看视频

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/h7F4U6xEA5M"
  title="StarRocks in 5 - Getting Started With StarRocks on Docker"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>

所使用的数据由 NYC OpenData 和 National Centers for Environmental Information 提供。

这两个数据集都非常大，并且由于本教程旨在帮助您了解如何使用 StarRocks，因此我们不会导入过去 120 年的数据。您可以在分配给 Docker 的 4 GB RAM 的机器上运行 Docker 镜像并导入此数据。对于更大、容错和可扩展的部署，我们有其他文档，稍后会提供。

本文档包含大量信息，并且以逐步内容的形式在开头呈现，技术细节在结尾呈现。这样做是为了按以下顺序实现这些目的：

1. 允许读者在 StarRocks 中导入数据并分析该数据。
2. 解释导入期间数据转换的基础知识。

---

## 前提条件

### Docker

- [Docker](https://docs.docker.com/engine/install/)
- 分配给 Docker 的 4 GB RAM
- 分配给 Docker 的 10 GB 可用磁盘空间

### SQL 客户端

您可以使用 Docker 环境中提供的 SQL 客户端，也可以使用系统上的 SQL 客户端。许多与 MySQL 兼容的客户端都可以工作，本指南涵盖了 DBeaver 和 MySQL Workbench 的配置。

### curl

`curl` 用于向 StarRocks 发出数据导入作业，并下载数据集。通过在操作系统提示符下运行 `curl` 或 `curl.exe` 来检查是否已安装。如果未安装 curl，请[在此处获取 curl](https://curl.se/dlwiz/?type=bin)。

---

## 术语

### FE

FE 节点负责元数据管理、客户端连接管理、查询计划和查询调度。每个 FE 在其内存中存储和维护元数据的完整副本，这保证了 FE 之间的无差别服务。

### BE

BE 节点负责数据存储和执行查询计划。

---

## 启动 StarRocks

```bash
docker pull starrocks/allin1-ubuntu
docker run -p 9030:9030 -p 8030:8030 -p 8040:8040 -itd \
--name quickstart starrocks/allin1-ubuntu
```

---

## SQL 客户端

<Clients />

---

## 下载数据

将这两个数据集下载到您的机器。您可以将它们下载到运行 Docker 的主机上，不需要在容器内下载。

### 纽约市碰撞数据

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/NYPD_Crash_Data.csv
```

### 天气数据

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/72505394728.csv
```

---

### 使用 SQL 客户端连接到 StarRocks

:::tip

如果您使用的客户端不是 mysql CLI，请立即打开它。
:::

此命令将在 Docker 容器中运行 `mysql` 命令：

```sql
docker exec -it quickstart \
mysql -P 9030 -h 127.0.0.1 -u root --prompt="StarRocks > "
```

---

## 创建一些表

<DDL />

---

## 导入两个数据集

有很多方法可以将数据导入到 StarRocks 中。对于本教程，最简单的方法是使用 curl 和 StarRocks Stream Load。

:::tip
打开一个新的 shell，因为这些 curl 命令是在操作系统提示符下运行的，而不是在 `mysql` 客户端中运行的。这些命令引用您下载的数据集，因此请从下载文件的目录中运行它们。

系统将提示您输入密码。您可能尚未为 MySQL `root` 用户分配密码，因此只需按 Enter 键即可。
:::

`curl` 命令看起来很复杂，但本教程的最后会详细解释它们。现在，我们建议运行这些命令并运行一些 SQL 来分析数据，然后在最后阅读有关数据导入详细信息的说明。

### 纽约市碰撞数据 - 碰撞事故

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

以下是上述命令的输出。第一个突出显示的部分显示了您应该看到的内容（OK 和除一行之外的所有行都已插入）。有一行被过滤掉，因为它不包含正确的列数。

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

如果出现错误，输出会提供一个 URL 来查看错误消息。在浏览器中打开此 URL 以找出发生了什么。展开详细信息以查看示例错误消息：

<details>

<summary>在浏览器中读取错误消息</summary>

```bash
Error: Target column count: 29 doesn't match source value column count: 32. Column separator: ',', Row delimiter: '\n'. Row: 09/06/2015,14:15,,,40.6722269,-74.0110059,"(40.6722269, -74.0110059)",,,"R/O 1 BEARD ST. ( IKEA'S 
09/14/2015,5:30,BRONX,10473,40.814551,-73.8490955,"(40.814551, -73.8490955)",TORRY AVENUE                    ,NORTON AVENUE                   ,,0,0,0,0,0,0,0,0,Driver Inattention/Distraction,Unspecified,,,,3297457,PASSENGER VEHICLE,PASSENGER VEHICLE,,,
```

</details>

### 天气数据

以与导入碰撞数据相同的方式导入天气数据集。

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

## 回答一些问题

<SQL />

---

## 总结

在本教程中，您：

- 在 Docker 中部署了 StarRocks
- 导入了纽约市提供的碰撞数据和 NOAA 提供的天气数据
- 使用 SQL JOIN 分析了数据，发现低能见度或冰雪路面行车不是一个好主意

还有更多内容需要学习；我们有意忽略了在 Stream Load 期间完成的数据转换。有关详细信息，请参见下面的 curl 命令注释。

---

## 关于 curl 命令的说明

<Curl />

---

## 更多信息

[StarRocks 表设计 ](../table_design/StarRocks_table_design.md)

[Stream Load ](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)

[机动车辆碰撞 - 碰撞事故](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95) 数据集由纽约市提供，受以下 [使用条款](https://www.nyc.gov/home/terms-of-use.page) 和 [隐私政策](https://www.nyc.gov/home/privacy-policy.page) 的约束。

[本地气候数据](https://www.ncdc.noaa.gov/cdo-web/datatools/lcd)(LCD) 由 NOAA 提供，带有此 [免责声明](https://www.noaa.gov/disclaimer) 和此 [隐私政策](https://www.noaa.gov/protecting-your-privacy)。