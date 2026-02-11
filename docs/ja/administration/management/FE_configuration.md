---
displayed_sidebar: docs
---

import FEConfigMethod from '../../_assets/commonMarkdown/FE_config_method.mdx'

import AdminSetFrontendNote from '../../_assets/commonMarkdown/FE_config_note.mdx'

import StaticFEConfigNote from '../../_assets/commonMarkdown/StaticFE_config_note.mdx'

import EditionSpecificFEItem from '../../_assets/commonMarkdown/Edition_Specific_FE_Item.mdx'

# FE Configuration
FE設定

<FEConfigMethod />

## View FE configuration items
FE構成項目の表示

After your FE is started, you can run the ADMIN SHOW FRONTEND CONFIG command on your MySQL client to check the parameter configurations. If you want to query the configuration of a specific parameter, run the following command:
FEが起動した後、MySQLクライアントで`ADMIN SHOW FRONTEND CONFIG`コマンドを実行して、パラメーター設定を確認できます。特定のパラメーターの設定をクエリしたい場合は、次のコマンドを実行します。

```SQL
ADMIN SHOW FRONTEND CONFIG [LIKE "pattern"];
```

For detailed description of the returned fields, see [ADMIN SHOW CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md).
返されるフィールドの詳細については、[ADMIN SHOW CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md)を参照してください。

:::note
You must have administrator privileges to run cluster administration-related commands.
:::
:::note
クラスター管理関連コマンドを実行するには、管理者権限が必要です。
:::

## Configure FE parameters
FEパラメーターの設定

### Configure FE dynamic parameters
FE動的パラメーターの設定

You can configure or modify the settings of FE dynamic parameters using [ADMIN SET FRONTEND CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md).
[ADMIN SET FRONTEND CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md)を使用して、FE動的パラメーターの設定を構成または変更できます。

```SQL
ADMIN SET FRONTEND CONFIG ("key" = "value");
```

<AdminSetFrontendNote />

### Configure FE static parameters
FE静的パラメーターの設定

<StaticFEConfigNote />

## Understand FE parameters
FEパラメーターの理解

### Logging
ログ記録

##### audit_log_delete_age
##### audit_log_delete_age

- Default: 30d
- Type: String
- Unit: -
- Is mutable: No
- Description: The retention period of audit log files. The default value `30d` specifies that each audit log file can be retained for 30 days. StarRocks checks each audit log file and deletes those that were generated 30 days ago.
- Introduced in: -
- デフォルト: 30d
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルの保持期間。デフォルト値`30d`は、各監査ログファイルが30日間保持できることを指定します。StarRocksは各監査ログファイルをチェックし、30日前に生成されたファイルを削除します。
- 導入バージョン: -

##### audit_log_dir
##### audit_log_dir

- Default: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- Type: String
- Unit: -
- Is mutable: No
- Description: The directory that stores audit log files.
- Introduced in: -
- デフォルト: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルを保存するディレクトリ。
- 導入バージョン: -

##### audit_log_enable_compress
##### audit_log_enable_compress

- Default: false
- Type: Boolean
- Unit: N/A
- Is mutable: No
- Description: When true, the generated Log4j2 configuration appends a ".gz" postfix to rotated audit log filenames (fe.audit.log.*) so that Log4j2 will produce compressed (.gz) archived audit log files on rollover. The setting is read during FE startup in Log4jConfig.initLogging and is applied to the RollingFile appender for audit logs; it only affects rotated/archived files, not the active audit log. Because the value is initialized at startup, changing it requires restarting the FE to take effect. Use alongside audit log rotation settings (audit_log_dir, audit_log_roll_interval, audit_roll_maxsize, audit_log_roll_num).
- Introduced in: 3.2.12
- デフォルト: false
- 型: Boolean
- 単位: N/A
- 変更可能: いいえ
- 説明: trueの場合、生成されたLog4j2設定は、ロールオーバー時にLog4j2が圧縮された(.gz)アーカイブ監査ログファイルを生成するように、ローテーションされた監査ログファイル名(fe.audit.log.*)に".gz"の接尾辞を追加します。この設定は、FE起動時にLog4jConfig.initLoggingで読み取られ、監査ログ用のRollingFileアペンダーに適用されます。アクティブな監査ログではなく、ローテーション/アーカイブされたファイルにのみ影響します。値は起動時に初期化されるため、変更を有効にするにはFEを再起動する必要があります。監査ログのローテーション設定(audit_log_dir, audit_log_roll_interval, audit_roll_maxsize, audit_log_roll_num)と併用してください。
- 導入バージョン: 3.2.12

##### audit_log_json_format
##### audit_log_json_format

- Default: false
- Type: Boolean
- Unit: N/A
- Is mutable: Yes
- Description: When true, FE audit events are emitted as structured JSON (Jackson ObjectMapper serializing a Map of annotated AuditEvent fields) instead of the default pipe-separated "key=value" string. The setting affects all built-in audit sinks handled by AuditLogBuilder: connection audit, query audit, big-query audit (big-query threshold fields are added to the JSON when the event qualifies), and slow-audit output. Fields annotated for big-query thresholds and the "features" field are treated specially (excluded from normal audit entries; included in big-query or feature logs as applicable). Enable this to make logs machine-parsable for log collectors or SIEMs; note it changes the log format and may require updating any existing parsers that expect the legacy pipe-separated format.
- Introduced in: 3.2.7
- デフォルト: false
- 型: Boolean
- 単位: N/A
- 変更可能: はい
- 説明: trueの場合、FE監査イベントは、デフォルトのパイプ区切り「key=value」文字列ではなく、構造化されたJSON（Jackson ObjectMapperがアノテーション付きAuditEventフィールドのMapをシリアル化）として出力されます。この設定は、AuditLogBuilderによって処理されるすべての組み込み監査シンクに影響します。接続監査、クエリ監査、ビッグクエリ監査（イベントが条件を満たす場合、ビッグクエリしきい値フィールドがJSONに追加されます）、およびスロー監査出力です。ビッグクエリしきい値と「features」フィールドにアノテーションが付けられたフィールドは特別に処理されます（通常の監査エントリから除外され、該当する場合にビッグクエリまたは機能ログに含まれます）。ログをログコレクタまたはSIEMが機械的に解析できるようにするには、これを有効にします。ログ形式が変更され、従来のパイプ区切り形式を想定する既存のパーサーを更新する必要がある場合があることに注意してください。
- 導入バージョン: 3.2.7

##### audit_log_modules
##### audit_log_modules

- Default: slow_query, query
- Type: String[]
- Unit: -
- Is mutable: No
- Description: The modules for which StarRocks generates audit log entries. By default, StarRocks generates audit logs for the `slow_query` module and the `query` module. The `connection` module is supported from v3.0. Separate the module names with a comma (,) and a space.
- Introduced in: -
- デフォルト: slow_query, query
- 型: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocksが監査ログエントリを生成するモジュール。デフォルトでは、StarRocksは`slow_query`モジュールと`query`モジュールの監査ログを生成します。`connection`モジュールはv3.0以降でサポートされています。モジュール名をコンマ(,)とスペースで区切ります。
- 導入バージョン: -

##### audit_log_roll_interval
##### audit_log_roll_interval

- Default: DAY
- Type: String
- Unit: -
- Is mutable: No
- Description: The time interval at which StarRocks rotates audit log entries. Valid values: `DAY` and `HOUR`.
  - If this parameter is set to `DAY`, a suffix in the `yyyyMMdd` format is added to the names of audit log files.
  - If this parameter is set to `HOUR`, a suffix in the `yyyyMMddHH` format is added to the names of audit log files.
- Introduced in: -
- デフォルト: DAY
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocksが監査ログエントリをローテーションする時間間隔。有効な値:`DAY`と`HOUR`。
  - このパラメーターが`DAY`に設定されている場合、監査ログファイル名に`yyyyMMdd`形式のサフィックスが追加されます。
  - このパラメーターが`HOUR`に設定されている場合、監査ログファイル名に`yyyyMMddHH`形式のサフィックスが追加されます。
- 導入バージョン: -

##### audit_log_roll_num
##### audit_log_roll_num

- Default: 90
- Type: Int
- Unit: -
- Is mutable: No
- Description: The maximum number of audit log files that can be retained within each retention period specified by the `audit_log_roll_interval` parameter.
- Introduced in: -
- デフォルト: 90
- 型: Int
- 単位: -
- 変更可能: いいえ
- 説明: `audit_log_roll_interval`パラメーターで指定された各保持期間内に保持できる監査ログファイルの最大数。
- 導入バージョン: -

##### bdbje_log_level
##### bdbje_log_level

- Default: INFO
- Type: String
- Unit: -
- Is mutable: No
- Description: Controls the logging level used by Berkeley DB Java Edition (BDB JE) in StarRocks. During BDB environment initialization BDBEnvironment.initConfigs() applies this value to the Java logger for the `com.sleepycat.je` package and to the BDB JE environment file logging level (EnvironmentConfig.FILE_LOGGING_LEVEL). Accepts standard java.util.logging.Level names such as SEVERE, WARNING, INFO, CONFIG, FINE, FINER, FINEST, ALL, OFF. Setting to ALL enables all log messages. Increasing verbosity will raise log volume and may impact disk I/O and performance; the value is read when the BDB environment is initialized, so it takes effect only after environment (re)initialization.
- Introduced in: v3.2.0
- デフォルト: INFO
- 型: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocksにおけるBerkeley DB Java Edition (BDB JE) が使用するログレベルを制御します。BDB環境の初期化中、`BDBEnvironment.initConfigs()`は、この値を`
