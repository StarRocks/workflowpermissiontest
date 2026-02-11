---
displayed_sidebar: docs
---

import FEConfigMethod from '../../_assets/commonMarkdown/FE_config_method.mdx'

import AdminSetFrontendNote from '../../_assets/commonMarkdown/FE_config_note.mdx'

import StaticFEConfigNote from '../../_assets/commonMarkdown/StaticFE_config_note.mdx'

import EditionSpecificFEItem from '../../_assets/commonMarkdown/Edition_Specific_FE_Item.mdx'

# FE 設定

<FEConfigMethod />

## FE 設定項目の表示

FE の起動後、MySQL クライアントで `ADMIN SHOW FRONTEND CONFIG` コマンドを実行して、パラメーター設定を確認できます。特定のパラメーターの設定をクエリするには、次のコマンドを実行します。

```SQL
ADMIN SHOW FRONTEND CONFIG [LIKE "pattern"];
```

返されるフィールドの詳細については、[ADMIN SHOW CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md) を参照してください。

:::note
クラスター管理関連コマンドを実行するには、管理者権限が必要です。
:::

## FE パラメーターの設定

### FE 動的パラメーターの設定

[ADMIN SET FRONTEND CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md) を使用して、FE 動的パラメーターの設定を構成または変更できます。

```SQL
ADMIN SET FRONTEND CONFIG ("key" = "value");
```

<AdminSetFrontendNote />

### FE 静的パラメーターの設定

<StaticFEConfigNote />

## FE パラメーターについて

### ロギング

##### audit_log_delete_age

- デフォルト: 30d
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルの保持期間。デフォルト値の `30d` は、各監査ログファイルが 30 日間保持されることを指定します。StarRocks は各監査ログファイルをチェックし、30 日以上前に生成されたものを削除します。
- 導入バージョン: -

##### audit_log_dir

- デフォルト: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルが保存されるディレクトリ。
- 導入バージョン: -

##### audit_log_enable_compress

- デフォルト: false
- 型: Boolean
- 単位: N/A
- 変更可能: いいえ
- 説明: true の場合、生成された Log4j2 設定は、ローテーションされた監査ログファイル名 (fe.audit.log.*) に ".gz" 接尾辞を追加し、Log4j2 がロールオーバー時に圧縮された (.gz) アーカイブ監査ログファイルを生成するようにします。この設定は、FE 起動時に Log4jConfig.initLogging で読み込まれ、監査ログ用の RollingFile アペンダーに適用されます。アクティブな監査ログには影響せず、ローテーション/アーカイブされたファイルにのみ影響します。値は起動時に初期化されるため、変更を有効にするには FE の再起動が必要です。監査ログのローテーション設定 (audit_log_dir, audit_log_roll_interval, audit_roll_maxsize, audit_log_roll_num) とともに使用します。
- 導入バージョン: 3.2.12

##### audit_log_json_format

- デフォルト: false
- 型: Boolean
- 単位: N/A
- 変更可能: はい
- 説明: true の場合、FE 監査イベントは、デフォルトのパイプ区切り「key=value」文字列ではなく、構造化された JSON (AuditEvent フィールドの Map をシリアル化する Jackson ObjectMapper) として出力されます。この設定は、AuditLogBuilder で処理されるすべての組み込み監査シンクに影響します。接続監査、クエリ監査、大規模クエリ監査 (イベントが条件を満たす場合、大規模クエリのしきい値フィールドが JSON に追加されます)、および低速監査出力です。大規模クエリのしきい値と「features」フィールドの注釈が付けられたフィールドは特別に扱われます (通常の監査エントリから除外され、適用可能な場合は大規模クエリまたは機能ログに含まれます)。ログコレクターまたは SIEM のためにログを機械で解析できるようにするには、これを有効にします。ただし、ログ形式が変更され、従来のパイプ区切り形式を想定する既存のパーサーを更新する必要がある場合があります。
- 導入バージョン: 3.2.7

##### audit_log_modules

- デフォルト: slow_query, query
- 型: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks が監査ログエントリを生成するモジュール。デフォルトでは、StarRocks は `slow_query` モジュールと `query` モジュールの監査ログを生成します。`connection` モジュールは v3.0 からサポートされています。モジュール名をコンマ (,) とスペースで区切ります。
- 導入バージョン: -

##### audit_log_roll_interval

- デフォルト: DAY
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks が監査ログエントリをローテーションする時間間隔。有効な値: `DAY` と `HOUR`。
  - このパラメーターを `DAY` に設定すると、監査ログファイル名に `yyyyMMdd` 形式のサフィックスが追加されます。
  - このパラメーターを `HOUR` に設定すると、監査ログファイル名に `yyyyMMddHH` 形式のサフィックスが追加されます。
- 導入バージョン: -

##### audit_log_roll_num

- デフォルト: 90
- 型: Int
- 単位: -
- 変更可能: いいえ
- 説明: `audit_log_roll_interval` パラメーターで指定された各保持期間内に保持できる監査ログファイルの最大数。
- 導入バージョン: -

##### bdbje_log_level

- デフォルト: INFO
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks で Berkeley DB Java Edition (BDB JE) が使用するログレベルを制御します。BDB 環境初期化 BDBEnvironment.initConfigs() 中に、この値を `com.sleepycat.je` パッケージの Java ロガーと BDB JE 環境ファイルロギングレベル (EnvironmentConfig.FILE_LOGGING_LEVEL) に適用します。SEVERE、WARNING、INFO、CONFIG、FINE、FINER、FINEST、ALL、OFF などの標準的な java.util.logging.Level 名を受け入れます。ALL に設定すると、すべてのログメッセージが有効になります。詳細度を上げるとログ量が増加し、ディスク I/O とパフォーマンスに影響を与える可能性があります。値は BDB 環境が初期化されるときに読み取られるため、環境の (再) 初期化後にのみ有効になります。
- 導入バージョン: v3.2.0

##### big_query_log_delete_age

- デフォルト: 7d
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: FE 大規模クエリログファイル (`fe.big_query.log.*`) が自動削除されるまでの保持期間を制御します。この値は、Log4j の削除ポリシーに IfLastModified の age として渡されます。最終更新時刻がこの値よりも古いローテーションされた大規模クエリログは削除されます。`d` (日)、`h` (時間)、`m` (分)、`s` (秒) のサフィックスをサポートします。例: `7d` (7 日間)、`10h` (10 時間)、`60m` (60 分)、`120s` (120 秒)。この項目は、`big_query_log_roll_interval` および `big_query_log_roll_num` と連携して、どのファイルを保持またはパージするかを決定します。
- 導入バージョン: v3.2.0

##### big_query_log_dir

- デフォルト: `Config.STARROCKS_HOME_DIR + "/log"`
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: FE が大規模クエリダンプログ (`fe.big_query.log.*`) を書き込むディレクトリ。Log4j 設定は、このパスを使用して `fe.big_query.log` およびそのローテーションされたファイル用の RollingFile アペンダーを作成します。ローテーションと保持は、`big_query_log_roll_interval` (時間ベースのサフィックス)、`log_roll_size_mb` (サイズトリガー)、`big_query_log_roll_num` (最大ファイル数)、および `big_query_log_delete_age` (時間ベースの削除) によって管理されます。大規模クエリレコードは、`big_query_log_cpu_second_threshold`、`big_query_log_scan_rows_threshold`、または `big_query_log_scan_bytes_threshold` などのユーザー定義のしきい値を超えるクエリに対してログに記録されます。`big_query_log_modules` を使用して、どのモジュールがこのファイルにログを記録するかを制御します。
- 導入バージョン: v3.2.0

##### big_query_log_modules

- デフォルト: `{"query"}`
- 型: String[]
- 単位: -
- 変更可能: いいえ
- 説明: モジュールごとの大規模クエリロギングを有効にするモジュール名サフィックスのリスト。一般的な値は論理コンポーネント名です。例えば、デフォルトの `query` は `big_query.query` を生成します。
- 導入バージョン: v3.2.0

##### big_query_log_roll_interval

- デフォルト: `"DAY"`
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: `big_query` ログアペンダーのローリングファイル名の日付コンポーネントを構築するために使用される時間間隔を指定します。有効な値 (大文字と小文字を区別しない) は `DAY` (デフォルト) と `HOUR` です。`DAY` は日次パターン (`"%d{yyyyMMdd}"`) を生成し、`HOUR` は時間パターン (`"%d{yyyyMMddHH}"`) を生成します。この値は、サイズベースのロールオーバー (`big_query_roll_maxsize`) とインデックスベースのロールオーバー (`big_query_log_roll_num`) と組み合わされて、RollingFile の filePattern を形成します。無効な値は、ログ設定の生成を失敗させ (IOException)、ログの初期化または再設定を妨げる可能性があります。`big_query_log_dir`、`big_query_roll_maxsize`、`big_query_log_roll_num`、および `big_query_log_delete_age` とともに使用します。
- 導入バージョン: v3.2.0

##### big_query_log_roll_num

- デフォルト: 10
- 型: Int
- 単位: -
- 変更可能: いいえ
- 説明: `big_query_log_roll_interval` ごとに保持するローテーションされた FE 大規模クエリログファイルの最大数。この値は、`fe.big_query.log` の RollingFile アペンダーの DefaultRolloverStrategy `max` 属性にバインドされます。ログが (時間または `log_roll_size_mb` によって) ロールオーバーされると、StarRocks は最大 `big_query_log_roll_num` 個のインデックス付きファイル
