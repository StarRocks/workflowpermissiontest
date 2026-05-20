---
displayed_sidebar: docs
description: 使用 Helm 部署 StarRocks
toc_max_heading_level: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import OperatorPrereqs from '../_assets/deployment/_OperatorPrereqs.mdx'
import DDL from '../_assets/quick-start/_DDL.mdx'
import Clients from '../_assets/quick-start/_clientsAllin1.mdx'
import SQL from '../_assets/quick-start/_SQL.mdx'
import Curl from '../_assets/quick-start/_curl.mdx'

# 使用 Helm 部署 StarRocks

## 目标

- 使用 Helm 部署 StarRocks Kubernetes Operator 和 StarRocks 集群
- 为 StarRocks 数据库用户 `root` 配置密码
- 通过三个 FEs 和三个 BEs 提供高可用性
- 将元数据存储在持久化存储中
- 将数据存储在持久化存储中
- 允许 MySQL 客户端从 Kubernetes 集群外部连接
- 允许使用 Stream Load 从 Kubernetes 集群外部加载数据
- 加载一些公共数据集
- 查询数据

:::tip
数据集和查询与 Basic Quick Start 中使用的相同。主要区别在于这里使用 Helm 和 StarRocks Operator 进行部署。
:::

所使用的数据由 NYC OpenData 和 National Centers for Environmental Information 提供。

这两个数据集都很大，由于本教程旨在帮助您接触 StarRocks 的使用，我们不会加载过去 120 年的数据。您可以在基于三台 e2-standard-4 机器（或类似配置）的 GKE Kubernetes 集群上运行此教程，配备 80GB 磁盘。对于更大的部署，我们有其他文档，稍后会提供。

本文档包含大量信息，开头以分步内容呈现，技术细节放在末尾。这样做的目的是按以下顺序服务于这些目的：

1.  使用 Helm 部署系统。
2.  允许读者在 StarRocks 中加载数据并分析数据。
3.  解释加载过程中数据转换的基础知识。

---

## 前提条件

<OperatorPrereqs />

### SQL 客户端

您可以使用 Kubernetes 环境中提供的 SQL 客户端，也可以使用您系统上的客户端。本指南使用 `mysql CLI`。许多 MySQL 兼容客户端都适用。

### curl

`curl` 用于向 StarRocks 发送数据加载作业，并下载数据集。在您的操作系统提示符下运行 `curl` 或 `curl.exe` 来检查是否已安装。如果未安装 curl，请[在此处获取 curl](https://curl.se/dlwiz/?type=bin)。

---

## 术语

### FE

Frontend 节点负责元数据管理、客户端连接管理、查询规划和查询调度。每个 FE 在其内存中存储并维护一份完整的元数据副本，这保证了 FEs 之间的无差别服务。

### BE

Backend 节点负责数据存储和执行查询计划。

---

## 添加 StarRocks Helm Chart 仓库

Helm Chart 包含 StarRocks Operator 和自定义资源 StarRocksCluster 的定义。
1.  添加 Helm Chart 仓库。

    ```Bash
    helm repo add starrocks https://starrocks.github.io/starrocks-kubernetes-operator
    ```

2.  更新 Helm Chart 仓库到最新版本。

      ```Bash
      helm repo update
      ```

3.  查看您添加的 Helm Chart 仓库。

      ```Bash
      helm search repo starrocks
      ```

      ```
      NAME                              	CHART VERSION	APP VERSION	DESCRIPTION
      starrocks/kube-starrocks	1.9.7        	3.2-latest 	kube-starrocks includes two subcharts, operator...
      starrocks/operator      	1.9.7        	1.9.7      	A Helm chart for StarRocks operator
      starrocks/starrocks     	1.9.7        	3.2-latest 	A Helm chart for StarRocks cluster
      starrocks/warehouse     	1.9.7        	3.2-latest 	Warehouse is currently a feature of the StarRoc...
      ```

---

## 下载数据

将这两个数据集下载到您的机器上。

### 纽约市交通事故数据

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/NYPD_Crash_Data.csv
```

### 天气数据

```bash
curl -O https://raw.githubusercontent.com/StarRocks/demo/master/documentation-samples/quickstart/datasets/72505394728.csv
```

---

## 创建 Helm values 文件

此快速启动的目标是：

1.  为 StarRocks 数据库用户 `root` 配置密码
2.  通过三个 FEs 和三个 BEs 提供高可用性
3.  将元数据存储在持久化存储中
4.  将数据存储在持久化存储中
5.  允许 MySQL 客户端从 Kubernetes 集群外部连接
6.  允许使用 Stream Load 从 Kubernetes 集群外部加载数据

Helm Chart 提供了满足所有这些目标的选项，但默认情况下并未配置。本节的其余部分介绍了满足所有这些目标所需的配置。将提供完整的 values 规范，但首先阅读六个部分的每个详细信息，然后复制完整的规范。

### 1. 数据库用户密码

这段 YAML 指示 StarRocks Operator 将数据库用户 `root` 的密码设置为 Kubernetes secret `starrocks-root-pass` 的 `password` 键的值。

```yaml
starrocks:
    initPassword:
        enabled: true
        # 设置一个密码 secret，例如：
        # kubectl create secret generic starrocks-root-pass --from-literal=password='g()()dpa$$word'
        passwordSecret: starrocks-root-pass
```

- 任务：创建 Kubernetes secret

    ```bash
    kubectl create secret generic starrocks-root-pass --from-literal=password='g()()dpa$$word'
    ```

### 2. 三个 FEs 和三个 BEs 的高可用性

通过将 `starrocks.starrockFESpec.replicas` 设置为 3，并将 `starrocks.starrockBeSpec.replicas` 设置为 3，您将拥有足够多的 FEs 和 BEs 来实现高可用性。将 CPU 和内存请求设置得较低，允许在小型 Kubernetes 环境中创建 pods。

```yaml
starrocks:
    starrocksFESpec:
        replicas: 3
        resources:
            requests:
                cpu: 1
                memory: 1Gi

    starrocksBeSpec:
        replicas: 3
        resources:
            requests:
                cpu: 1
                memory: 2Gi
```

### 3. 将元数据存储在持久化存储中

将 `starrocks.starrocksFESpec.storageSpec.name` 的值设置为 `""` 以外的任何值会导致：
- 使用持久化存储
- `starrocks.starrocksFESpec.storageSpec.name` 的值将用作服务所有存储卷的前缀。

通过将值设置为 `fe`，将为 FE 0 创建这些 PVs：

- `fe-meta-kube-starrocks-fe-0`
- `fe-log-kube-starrocks-fe-0`

```yaml
starrocks:
    starrocksFESpec:
        storageSpec:
            name: fe
```

### 4. 将数据存储在持久化存储中

将 `starrocks.starrocksBeSpec.storageSpec.name` 的值设置为 `""` 以外的任何值会导致：
- 使用持久化存储
- `starrocks.starrocksBeSpec.storageSpec.name` 的值将用作服务所有存储卷的前缀。

通过将值设置为 `be`，将为 BE 0 创建这些 PVs：

- `be-data-kube-starrocks-be-0`
- `be-log-kube-starrocks-be-0`

将 `storageSize` 设置为 15Gi 可将存储从默认的 1Ti 减少以适应较小的存储配额。

```yaml
starrocks:
    starrocksBeSpec:
        storageSpec:
            name: be
            storageSize: 15Gi
```

### 5. 用于 MySQL 客户端的 LoadBalancer

默认情况下，对 FE 服务的访问通过 Cluster IP。为了允许外部访问，`service.type` 被设置为 `LoadBalancer`。

```yaml
starrocks:
    starrocksFESpec:
        service:
            type: LoadBalancer
```

### 6. 用于外部数据加载的 LoadBalancer

Stream Load 需要外部访问 FEs 和 BEs。请求发送到 FE，然后 FE 分配一个 BE 来处理上传。为了允许 `curl` 命令重定向到 BE，`starroclFeProxySpec` 需要被启用并设置为 `LoadBalancer` 类型。

```yaml
starrocks:
    starrocksFeProxySpec:
        enabled: true
        service:
            type: LoadBalancer
```

### 完整的 values 文件

上述片段组合起来提供了一个完整的 values 文件。将其保存到 `my-values.yaml`：

```yaml
starrocks:
    initPassword:
        enabled: true
        # 设置一个密码 secret，例如：
        # kubectl create secret generic starrocks-root-pass --from-literal=password='g()()dpa$$word'
        passwordSecret: starrocks-root-pass

    starrocksFESpec:
        replicas: 3
        service:
            type: LoadBalancer
        resources:
            requests:
                cpu: 1
                memory: 1Gi
        storageSpec:
            name: fe

    starrocksBeSpec:
        replicas: 3
        resources:
            requests:
                cpu: 1
                memory: 2Gi
        storageSpec:
            name: be
            storageSize: 15Gi

    starrocksFeProxySpec:
        enabled: true
        service:
            type: LoadBalancer
```

## 设置 StarRocks root 数据库用户密码

为了从 Kubernetes 集群外部加载数据，StarRocks 数据库将对外暴露。您应该为 StarRocks 数据库用户 `root` 设置密码。Operator 将密码应用于 FE 和 BE 节点。

```bash
kubectl create secret generic starrocks-root-pass --from-literal=password='g()()dpa$$word'
```

```
secret/starrocks-root-pass created
```
---

## 部署 Operator 和 StarRocks 集群

```bash
helm install -f my-values.yaml starrocks starrocks/kube-starrocks
```

```
NAME: starrocks
LAST DEPLOYED: Wed Jun 26 20:25:09 2024
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Thank you for installing kube-starrocks-1.9.7 kube-starrocks chart.
It will install both operator and starrocks cluster, please wait for a few minutes for the cluster to be ready.

Please see the values.yaml for more operation information: https://github.com/StarRocks/starrocks-kubernetes-operator/blob/main/helm-charts/charts/kube-starrocks/values.yaml
```

## 检查 StarRocks 集群状态

您可以使用以下命令检查进度：

```bash
kubectl --namespace default get starrockscluster -l "cluster=kube-starrocks"
```

```
NAME             PHASE         FESTATUS      BESTATUS      CNSTATUS   FEPROXYSTATUS
kube-starrocks   reconciling   reconciling   reconciling              reconciling
```

```bash
kubectl get pods
```

:::note
`kube-starrocks-initpwd` pod 在尝试连接 FE 和 BE pods 以设置 StarRocks root 密码时会经历 `error` 和 `CrashLoopBackOff` 状态。您应该忽略这些错误，并等待此 pod 状态变为 `Completed`。
:::

```
NAME                                       READY   STATUS             RESTARTS      AGE
kube-starrocks-be-0                        0/1     Running            0             20s
kube-starrocks-be-1                        0/1     Running            0             20s
kube-starrocks-be-2                        0/1     Running            0             20s
kube-starrocks-fe-0                        1/1     Running            0             66s
kube-starrocks-fe-1                        0/1     Running            0             65s
kube-starrocks-fe-2                        0/1     Running            0             66s
kube-starrocks-fe-proxy-56f8998799-d4qmt   1/1     Running            0             20s
kube-starrocks-initpwd-m84br               0/1     CrashLoopBackOff   3 (50s ago)   92s
kube-starrocks-operator-54ffcf8c5c-xsjc8   1/1     Running            0             92s
```

```bash
kubectl get pvc
```

```
NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
be-data-kube-starrocks-be-0   Bound    pvc-4ae0c9d8-7f9a-4147-ad74-b22569165448   15Gi       RWO            standard-rwo   <unset>                 82s
be-data-kube-starrocks-be-1   Bound    pvc-28b4dbd1-0c8f-4b06-87e8-edec616cabbc   15Gi       RWO            standard-rwo   <unset>                 82s
be-data-kube-starrocks-be-2   Bound    pvc-c7232ea6-d3d9-42f1-bfc1-024205a17656   15Gi       RWO            standard-rwo   <unset>                 82s
be-log-kube-starrocks-be-0    Bound    pvc-6193c43d-c74f-4d12-afcc-c41ace3d5408   1Gi        RWO            standard-rwo   <unset>                 82s
be-log-kube-starrocks-be-1    Bound    pvc-c01f124a-014a-439a-99a6-6afe95215bf0   1Gi        RWO            standard-rwo   <unset>                 82s
be-log-kube-starrocks-be-2    Bound    pvc-136df15f-4d2e-43bc-a1c0-17227ce3fe6b   1Gi        RWO            standard-rwo   <unset>                 82s
fe-log-kube-starrocks-fe-0    Bound    pvc-7eac524e-d286-4760-b21c-d9b6261d976f   5Gi        RWO            standard-rwo   <unset>                 2m23s
fe-log-kube-starrocks-fe-1    Bound    pvc-38076b78-71e8-4659-b8e7-6751bec663f6   5Gi        RWO            standard-rwo   <unset>                 2m23s
fe-log-kube-starrocks-fe-2    Bound    pvc-4ccfee60-02b7-40ba-a22e-861ea29dac74   5Gi        RWO            standard-rwo   <unset>                 2m23s
fe-meta-kube-starrocks-fe-0   Bound    pvc-5130c9ff-b797-4f79-a1d2-4214af860d70   10Gi       RWO            standard-rwo   <unset>                 2m23s
fe-meta-kube-starrocks-fe-1   Bound    pvc-13545330-63be-42cf-b1ca-3ed6f96a8c98   10Gi       RWO            standard-rwo   <unset>                 2m23s
fe-meta-kube-starrocks-fe-2   Bound    pvc-609cadd4-c7b7-4cf9-84b0-a75678bb3c4d   10Gi       RWO            standard-rwo   <unset>                 2m23s
```
### 验证集群健康状况

:::tip
这些命令与上面相同，但显示了期望状态。
:::

```bash
kubectl --namespace default get starrockscluster -l "cluster=kube-starrocks"
```

```
NAME             PHASE     FESTATUS   BESTATUS   CNSTATUS   FEPROXYSTATUS
kube-starrocks   running   running    running               running
```

```bash
kubectl get pods
```

:::tip
当除 `kube-starrocks-initpwd` 之外的所有 pods 在 `READY` 列显示 `1/1` 时，系统就绪。`kube-starrocks-initpwd` pod 应该显示 `0/1` 且 `STATUS` 为 `Completed`。
:::

```
NAME                                       READY   STATUS      RESTARTS   AGE
kube-starrocks-be-0                        1/1     Running     0          57s
kube-starrocks-be-1                        1/1     Running     0          57s
kube-starrocks-be-2                        1/1     Running     0          57s
kube-starrocks-fe-0                        1/1     Running     0          103s
kube-starrocks-fe-1                        1/1     Running     0          102s
kube-starrocks-fe-2                        1/1     Running     0          103s
kube-starrocks-fe-proxy-56f8998799-d4qmt   1/1     Running     0          57s
kube-starrocks-initpwd-m84br               0/1     Completed   4          2m9s
kube-starrocks-operator-54ffcf8c5c-xsjc8   1/1     Running     0          2m9s
```

高亮行中的 `EXTERNAL-IP` 地址将用于从 Kubernetes 集群外部提供 SQL 客户端和 Stream Load 访问。

```bash
kubectl get services
```

```bash
NAME                              TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                                                       AGE
kube-starrocks-be-search          ClusterIP      None             <none>          9050/TCP                                                      78s
kube-starrocks-be-service         ClusterIP      34.118.228.231   <none>          9060/TCP,8040/TCP,9050/TCP,8060/TCP                           78s
# highlight-next-line
kube-starrocks-fe-proxy-service   LoadBalancer   34.118.230.176   34.176.12.205   8080:30241/TCP                                                78s
kube-starrocks-fe-search          ClusterIP      None             <none>          9030/TCP                                                      2m4s
# highlight-next-line
kube-starrocks-fe-service         LoadBalancer   34.118.226.82    34.176.215.97   8030:30620/TCP,9020:32461/TCP,9030:32749/TCP,9010:30911/TCP   2m4s
kubernetes                        ClusterIP      34.118.224.1     <none>          443/TCP                                                       8h
```

:::tip
将高亮行中的 `EXTERNAL-IP` 地址存储在环境变量中，以便随时取用：

```
export MYSQL_IP=`kubectl get services kube-starrocks-fe-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}'`
```
```
export FE_PROXY=`kubectl get services kube-starrocks-fe-proxy-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}'`:8080
```
:::



---

### 使用 SQL 客户端连接到 StarRocks

:::tip

如果您使用的是除 mysql CLI 之外的客户端，请立即打开它。
:::

此命令将在 Kubernetes pod 中运行 `mysql` 命令：

```sql
kubectl exec --stdin --tty kube-starrocks-fe-0 -- \
  mysql -P9030 -h127.0.0.1 -u root --prompt="StarRocks > "
```

如果您的本地安装了 mysql CLI，您可以使用它而不是 Kubernetes 集群中的那个：

```sql
mysql -P9030 -h $MYSQL_IP -u root --prompt="StarRocks > " -p
```

---
## 创建一些表

```bash
mysql -P9030 -h $MYSQL_IP -u root --prompt="StarRocks > " -p
```


<DDL />

退出 MySQL 客户端，或者打开一个新的 shell 在命令行运行命令来上传数据。

```sql
exit
```



## 上传数据

有多种方法可以将数据加载到 StarRocks 中。对于本教程，最简单的方法是使用 curl 和 StarRocks Stream Load。

上传您之前下载的两个数据集。

:::tip
打开一个新的 shell，因为这些 curl 命令是在操作系统提示符下运行的，而不是在 `mysql` 客户端中。这些命令引用您下载的数据集，因此请从下载文件的目录运行它们。

由于这是一个新的 shell，请再次运行 export 命令：

```bash

export MYSQL_IP=`kubectl get services kube-starrocks-fe-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}'`

export FE_PROXY=`kubectl get services kube-starrocks-fe-proxy-service --output jsonpath='{.status.loadBalancer.ingress[0].ip}'`:8080
```

系统会提示您输入密码。使用您添加到 Kubernetes secret `starrocks-root-pass` 的密码。如果您使用了提供的命令，密码是 `g()()dpa$$word`。
:::

`curl` 命令看起来很复杂，但它们在本教程的末尾有详细解释。现在，我们建议您运行这些命令并运行一些 SQL 来分析数据，然后阅读末尾关于数据加载细节的部分。


```bash
curl --location-trusted -u root             \
    -T ./NYPD_Crash_Data.csv                \
    -H "label:crashdata-0"                  \
    -H "column_separator:,"                 \
    -H "skip_header:1"                      \
    -H "enclose:\""                         \
    -H "max_filter_ratio:1"                 \
    -H "columns:tmp_CRASH_DATE, tmp_CRASH_TIME, CRASH_DATE=str_to_date(concat_ws(' ', tmp_CRASH_DATE, tmp_CRASH_TIME), '%m/%d/%Y %H:%i'),BOROUGH,ZIP_CODE,LATITUDE,LONGITUDE,LOCATION,ON_STREET_NAME,CROSS_STREET_NAME,OFF_STREET_NAME,NUMBER_OF_PERSONS_INJURED,NUMBER_OF_PERSONS_KILLED,NUMBER_OF_PEDESTRIANS_INJURED,NUMBER_OF_PEDESTRIANS_KILLED,NUMBER_OF_CYCLIST_INJURED,NUMBER_OF_CYCLIST_KILLED,NUMBER_OF_MOTORIST_INJURED,NUMBER_OF_MOTORIST_KILLED,CONTRIBUTING_FACTOR_VEHICLE_1,CONTRIBUTING_FACTOR_VEHICLE_2,CONTRIBUTING_FACTOR_VEHICLE_3,CONTRIBUTING_FACTOR_VEHICLE_4,CONTRIBUTING_FACTOR_VEHICLE_5,COLLISION_ID,VEHICLE_TYPE_CODE_1,VEHICLE_TYPE_CODE_2,VEHICLE_TYPE_CODE_3,VEHICLE_TYPE_CODE_4,VEHICLE_TYPE_CODE_5" \
    # highlight-next-line
    -XPUT http://$FE_PROXY/api/quickstart/crashdata/_stream_load
```

```
Enter host password for user 'root':
{
    "TxnId": 2,
    "Label": "crashdata-0",
    "Status": "Success",
    "Message": "OK",
    "NumberTotalRows": 423726,
    "NumberLoadedRows": 423725,
    "NumberFilteredRows": 1,
    "NumberUnselectedRows": 0,
    "LoadBytes": 96227746,
    "LoadTimeMs": 2483,
    "BeginTxnTimeMs": 42,
    "StreamLoadPlanTimeMs": 122,
    "ReadDataTimeMs": 1610,
    "WriteDataTimeMs": 2253,
    "CommitAndPublishTimeMs": 65,
    "ErrorURL": "http://kube-starrocks-be-2.kube-starrocks-be-search.default.svc.cluster.local:8040/api/_load_error_log?file=error_log_5149e6f80de42bcb_eab2ea77276de4ba"
}
```

```bash
curl --location-trusted -u root             \
    -T ./72505394728.csv                    \
    -H "label:weather-0"                    \
    -H "column_separator:,"                 \
    -H "skip_header:1"                      \
    -H "enclose:\""                         \
    -H "max_filter_ratio:1"                 \
    -H "columns: STATION, DATE, LATITUDE, LONGITUDE, ELEVATION, NAME, REPORT_TYPE, SOURCE, HourlyAltimeterSetting, HourlyDewPointTemperature, HourlyDryBulbTemperature, HourlyPrecipitation, HourlyPresentWeatherType, HourlyPressureChange, HourlyPressureTendency, HourlyRelativeHumidity, HourlySkyConditions, HourlySeaLevelPressure, HourlyStationPressure, HourlyVisibility, HourlyWetBulbTemperature, HourlyWindDirection, HourlyWindGustSpeed, HourlyWindSpeed, Sunrise, Sunset, DailyAverageDewPointTemperature, DailyAverageDryBulbTemperature, DailyAverageRelativeHumidity, DailyAverageSeaLevelPressure, DailyAverageStationPressure, DailyAverageWetBulbTemperature, DailyAverageWindSpeed, DailyCoolingDegreeDays, DailyDepartureFromNormalAverageTemperature, DailyHeatingDegreeDays, DailyMaximumDryBulbTemperature, DailyMinimumDryBulbTemperature, DailyPeakWindDirection, DailyPeakWindSpeed, DailyPrecipitation, DailySnowDepth, DailySnowfall, DailySustainedWindDirection, DailySustainedWindSpeed, DailyWeather, MonthlyAverageRH, MonthlyDaysWithGT001Precip, MonthlyDaysWithGT010Precip, MonthlyDaysWithGT32Temp, MonthlyDaysWithGT90Temp, MonthlyDaysWithLT0Temp, MonthlyDaysWithLT32Temp, MonthlyDepartureFromNormalAverageTemperature, MonthlyDepartureFromNormalCoolingDegreeDays, MonthlyDepartureFromNormalHeatingDegreeDays, MonthlyDepartureFromNormalMaximumTemperature, MonthlyDepartureFromNormalMinimumTemperature, MonthlyDepartureFromNormalPrecipitation, MonthlyDewpointTemperature, MonthlyGreatestPrecip, MonthlyGreatestPrecipDate, MonthlyGreatestSnowDepth, MonthlyGreatestSnowDepthDate, MonthlyGreatestSnowfall, MonthlyGreatestSnowfallDate, MonthlyMaxSeaLevelPressureValue, MonthlyMaxSeaLevelPressureValueDate, MonthlyMaxSeaLevelPressureValueTime, MonthlyMaximumTemperature, MonthlyMeanTemperature, MonthlyMinSeaLevelPressureValue, MonthlyMinSeaLevelPressureValueDate, MonthlyMinSeaLevelPressureValueTime, MonthlyMinimumTemperature, MonthlySeaLevelPressure, MonthlyStationPressure, MonthlyTotalLiquidPrecipitation, MonthlyTotalSnowfall, MonthlyWetBulb, AWND, CDSD, CLDD, DSNW, HDSD, HTDD, NormalsCoolingDegreeDay, NormalsHeatingDegreeDay, ShortDurationEndDate005, ShortDurationEndDate010, ShortDurationEndDate015, ShortDurationEndDate020, ShortDurationEndDate030, ShortDurationEndDate045, ShortDurationEndDate060, ShortDurationEndDate080, ShortDurationEndDate100, ShortDurationEndDate120, ShortDurationEndDate150, ShortDurationEndDate180, ShortDurationPrecipitationValue005, ShortDurationPrecipitationValue010, ShortDurationPrecipitationValue015, ShortDurationPrecipitationValue020, ShortDurationPrecipitationValue030, ShortDurationPrecipitationValue045, ShortDurationPrecipitationValue060, ShortDurationPrecipitationValue080, ShortDurationPrecipitationValue100, ShortDurationPrecipitationValue120, ShortDurationPrecipitationValue150, ShortDurationPrecipitationValue180, REM, BackupDirection, BackupDistance, BackupDistanceUnit, BackupElements, BackupElevation, BackupEquipment, BackupLatitude, BackupLongitude, BackupName, WindEquipmentChangeDate" \
    # highlight-next-line
    -XPUT http://$FE_PROXY/api/quickstart/weatherdata/_stream_load
```

```
Enter host password for user 'root':
{
    "TxnId": 4,
    "Label": "weather-0",
    "Status": "Success",
    "Message": "OK",
    "NumberTotalRows": 22931,
    "NumberLoadedRows": 22931,
    "NumberFilteredRows": 0,
    "NumberUnselectedRows": 0,
    "LoadBytes": 15558550,
    "LoadTimeMs": 404,
    "BeginTxnTimeMs": 1,
    "StreamLoadPlanTimeMs": 7,
    "ReadDataTimeMs": 157,
    "WriteDataTimeMs": 372,
    "CommitAndPublishTimeMs": 23
}
```

## 使用 MySQL 客户端连接

如果未连接，请使用 MySQL 客户端连接。请记住使用 `kube-starrocks-fe-service` 服务的外部 IP 地址以及您在 Kubernetes secret `starrocks-root-pass` 中配置的密码。

```bash
mysql -P9030 -h $MYSQL_IP -u root --prompt="StarRocks > " -p
```

## 回答一些问题

<SQL />

```sql
exit
```

## 清理

如果您已完成并希望删除 StarRocks 集群和 StarRocks Operator，请运行此命令。

```bash
helm delete starrocks
```


---

## 总结

在本教程中您：

- 使用 Helm 和 StarRocks Operator 部署了 StarRocks
- 加载了纽约市提供的交通事故数据和 NOAA 提供的天气数据
- 使用 SQL JOINs 分析数据，发现能见度低或冰雪路面驾驶是个坏主意

还有更多内容需要学习；我们特意略过了 Stream Load 期间完成的数据转换。有关这些的详细信息在下面 curl 命令的注释中。

---

## 关于 curl 命令的注意事项

<Curl />

---

## 更多信息

默认 [`values.yaml`](https://github.com/StarRocks/starrocks-kubernetes-operator/blob/main/helm-charts/charts/kube-starrocks/values.yaml)

[Stream Load](../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md)

[Motor Vehicle Collisions - Crashes](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95) 数据集由纽约市提供，受这些[使用条款](https://www.nyc.gov/home/terms-of-use.page)和[隐私政策](https://www.nyc.gov/home/privacy-policy.page)约束。

[Local Climatological Data](https://www.ncdc.noaa.gov/cdo-web/datatools/lcd)(LCD) 由 NOAA 提供，附带此[免责声明](https://www.noaa.gov/disclaimer)和此[隐私政策](https://www.noaa.gov/protecting-your-privacy)。

[Helm](https://helm.sh/) 是 Kubernetes 的包管理器。[Helm Chart](https://helm.sh/docs/topics/charts/) 是 Helm 包，包含在 Kubernetes 集群上运行应用程序所需的所有资源定义。

[`starrocks-kubernetes-operator` 和 `kube-starrocks` Helm Chart](https://github.com/StarRocks/starrocks-kubernetes-operator)。
