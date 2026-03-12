---
displayed_sidebar: docs
---

import FEConfigMethod from '../../_assets/commonMarkdown/FE_config_method.mdx'

import AdminSetFrontendNote from '../../_assets/commonMarkdown/FE_config_note.mdx'

import StaticFEConfigNote from '../../_assets/commonMarkdown/StaticFE_config_note.mdx'

import EditionSpecificFEItem from '../../_assets/commonMarkdown/Edition_Specific_FE_Item.mdx'

# FE構成

<FEConfigMethod />

## FE構成項目を表示する

FEが起動した後、MySQLクライアントで`ADMIN SHOW FRONTEND CONFIG`コマンドを実行して、パラメータ構成を確認できます。特定のパラメータの構成をクエリしたい場合は、次のコマンドを実行します。

```SQL
ADMIN SHOW FRONTEND CONFIG [LIKE "pattern"];
```

返されるフィールドの詳細については、[`ADMIN SHOW CONFIG`](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md)を参照してください。

:::note
クラスター管理関連コマンドを実行するには、管理者権限が必要です。
:::

## FEパラメータを構成する

### FE動的パラメータを構成する

[`ADMIN SET FRONTEND CONFIG`](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md)を使用して、FE動的パラメータの設定を構成または変更できます。

```SQL
ADMIN SET FRONTEND CONFIG ("key" = "value");
```

<AdminSetFrontendNote />

### FE静的パラメータを構成する

<StaticFEConfigNote />

## FEパラメータを理解する

### ロギング

##### `audit_log_delete_age`

- デフォルト: 30d
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルの保持期間。デフォルト値`30d`は、各監査ログファイルが30日間保持されることを指定します。StarRocksは各監査ログファイルをチェックし、30日前に生成されたファイルを削除します。
- 導入バージョン: -

##### `audit_log_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/log"
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルを格納するディレクトリ。
- 導入バージョン: -

##### `audit_log_enable_compress`

- デフォルト: false
- 型: Boolean
- 単位: N/A
- 変更可能: いいえ
- 説明: trueの場合、生成されたLog4j2構成は、ローテーションされた監査ログファイル名 (fe.audit.log.*) に".gz"接尾辞を追加し、Log4j2がロールオーバー時に圧縮された(.gz)アーカイブ監査ログファイルを生成するようにします。この設定は、FE起動時にLog4jConfig.initLoggingで読み取られ、監査ログ用のRollingFileアペンダーに適用されます。アクティブな監査ログではなく、ローテーション/アーカイブされたファイルのみに影響します。値は起動時に初期化されるため、変更を有効にするにはFEの再起動が必要です。監査ログのローテーション設定 (`audit_log_dir`、`audit_log_roll_interval`、`audit_roll_maxsize`、`audit_log_roll_num`) と一緒に使用します。
- 導入バージョン: 3.2.12

##### `audit_log_json_format`

- デフォルト: false
- 型: Boolean
- 単位: N/A
- 変更可能: はい
- 説明: trueの場合、FE監査イベントは、デフォルトのパイプ区切り「key=value」文字列ではなく、構造化されたJSON (AuditEventフィールドにアノテーションが付けられたMapをシリアル化するJackson ObjectMapper) として出力されます。この設定は、AuditLogBuilderが処理するすべての組み込み監査シンクに影響します。接続監査、クエリ監査、ビッグクエリ監査 (イベントが条件を満たすとビッグクエリしきい値フィールドがJSONに追加されます)、および低速監査出力です。ビッグクエリしきい値用にアノテーションが付けられたフィールドと「features」フィールドは特別に扱われます (通常の監査エントリから除外され、該当する場合はビッグクエリまたは機能ログに含まれます)。ログコレクタまたはSIEMがログを機械で解析できるようにするにはこれを有効にします。ログ形式が変更され、従来のパイプ区切り形式を想定している既存のパーサーを更新する必要がある場合があることに注意してください。
- 導入バージョン: 3.2.7

##### `audit_log_modules`

- デフォルト: `slow_query`, query
- 型: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocksが監査ログエントリを生成するモジュール。デフォルトでは、StarRocksは`slow_query`モジュールと`query`モジュールに対して監査ログを生成します。`connection`モジュールはv3.0からサポートされています。モジュール名はコンマ (`,`) とスペースで区切ります。
- 導入バージョン: -

##### `audit_log_roll_interval`

- デフォルト: DAY
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocksが監査ログエントリをローテーションする時間間隔。有効な値: `DAY`と`HOUR`。
  - このパラメータが`DAY`に設定されている場合、監査ログファイル名に`yyyyMMdd`形式のサフィックスが追加されます。
  - このパラメータが`HOUR`に設定されている場合、監査ログファイル名に`yyyyMMddHH`形式のサフィックスが追加されます。
- 導入バージョン: -

##### `audit_log_roll_num`

- デフォルト: 90
- 型: Int
- 単位: -
- 変更可能: いいえ
- 説明: `audit_log_roll_interval`パラメータで指定された各保持期間内に保持できる監査ログファイルの最大数。
- 導入バージョン: -

##### `bdbje_log_level`

- デフォルト: INFO
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocksのBerkeley DB Java Edition (BDB JE) が使用するロギングレベルを制御します。BDB環境の初期化中、BDBEnvironment.initConfigs() はこの値を`com.sleepycat.je`パッケージのJavaロガーとBDB JE環境ファイルロギングレベル (`EnvironmentConfig.FILE_LOGGING_LEVEL`) に適用します。SEVERE、WARNING、INFO、CONFIG、FINE、FINER、FINEST、ALL、OFFなどの標準的なjava.util.logging.Level名を受け入れます。ALLに設定すると、すべてのログメッセージが有効になります。詳細度を上げるとログ量が増加し、ディスクI/Oとパフォーマンスに影響を与える可能性があります。この値はBDB環境が初期化されるときに読み取られるため、環境 (再) 初期化後にのみ有効になります。
- 導入バージョン: v3.2.0

##### `big_query_log_delete_age`

- デフォルト: 7d
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: FEビッグクエリログファイル (`fe.big_query.log.*`) が自動削除されるまでに保持される期間を制御します。この値は、Log4jの削除ポリシーにIfLastModifiedの期間として渡されます。最終更新時間がこの値より古いローテーションされたビッグクエリログはすべて削除されます。`d` (日)、`h` (時間)、`m` (分)、`s` (秒) の接尾辞をサポートします。例: `7d` (7日)、`10h` (10時間)、`60m` (60分)、`120s` (120秒)。この項目は、`big_query_log_roll_interval`および`big_query_log_roll_num`と連携して、保持またはパージされるファイルを決定します。
- 導入バージョン: v3.2.0

##### `big_query_log_dir`

- デフォルト: `Config.STARROCKS_HOME_DIR + "/log"`
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: FEがビッグクエリダンプログ (`fe.big_query.log.*`) を書き込むディレクトリ。Log4j構成はこのパスを使用して、`fe.big_query.log`とそのローテーションされたファイル用のRollingFileアペンダーを作成します。ローテーションと保持は、`big_query_log_roll_interval` (時間ベースのサフィックス)、`log_roll_size_mb` (サイズトリガー)、`big_query_log_roll_num` (最大ファイル数)、および`big_query_log_delete_age` (期間ベースの削除) によって管理されます。ビッグクエリレコードは、`big_query_log_cpu_second_threshold`、`big_query_log_scan_rows_threshold`、または`big_query_log_scan_bytes_threshold`などのユーザー定義のしきい値を超えるクエリに対してログに記録されます。`big_query_log_modules`を使用して、どのモジュールがこのファイルにログを記録するかを制御します。
- 導入バージョン: v3.2.0

##### `big_query_log_modules`

- デフォルト: `{"query"}`
- 型: String[]
- 単位: -
- 変更可能: いいえ
- 説明: モジュールごとのビッグクエリロギングを有効にするモジュール名サフィックスのリスト。一般的な値は論理コンポーネント名です。たとえば、デフォルトの`query`は`big_query.query`を生成します。
- 導入バージョン: v3.2.0

##### `big_query_log_roll_interval`

- デフォルト: `"DAY"`
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: `big_query`ログアペンダーのローリングファイル名の日付部分を構築するために使用される時間間隔を指定します。有効な値 (大文字と小文字を区別しない) は`DAY` (デフォルト) と`HOUR`です。`DAY`は日次パターン (`"%d{yyyyMMdd}"`) を生成し、`HOUR`は時間パターン (`"%d{yyyyMMddHH}"`) を生成します。この値は、サイズベースのロールオーバー (`big_query_roll_maxsize`) とインデックスベースのロールオーバー (`big_query_log_roll_num`) と組み合わせてRollingFileのfilePatternを形成します。無効な値は、ログ構成の生成に失敗し (IOException)、ログの初期化または再構成を妨げる可能性があります。`big_query_log_dir`、`big_query_roll_maxsize`、`big_query_log_roll_num`、および`big_query_log_delete_age`と組み合わせて使用します。
- 導入バージョン: v3.2.0

##### `big_query_log_roll_num`

- デフォルト: 10
- 型: Int
- 単位: -
- 変更可能: いいえ
- 説明: `big_query_log_roll_interval`ごとに保持するローテーションされたFEビッグクエリログファイルの最大数。この値は`fe.big_query.log`のRollingFileアペンダーのDefaultRolloverStrategy `max`属性にバインドされます。ログがロール (時間または`log_roll_size_mb`による) すると、StarRocksは`big_query_log_roll_num`までのインデックス付きファイル (filePattern
