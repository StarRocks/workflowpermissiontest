---
displayed_sidebar: docs
---

import FEConfigMethod from '../../_assets/commonMarkdown/FE_config_method.mdx'

import AdminSetFrontendNote from '../../_assets/commonMarkdown/FE_config_note.mdx'

import StaticFEConfigNote from '../../_assets/commonMarkdown/StaticFE_config_note.mdx'

import EditionSpecificFEItem from '../../_assets/commonMarkdown/Edition_Specific_FE_Item.mdx'

# FE の設定

<FEConfigMethod />
## FE の設定項目の表示

FE の起動後、MySQL クライアントで `ADMIN SHOW FRONTEND CONFIG` コマンドを実行して、パラメータ設定を確認できます。特定の設定の構成を照会する場合は、次のコマンドを実行します。

```SQL
ADMIN SHOW FRONTEND CONFIG [LIKE "pattern"];
```

返されるフィールドの詳細については、[ADMIN SHOW CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md) を参照してください。

:::note
クラスタ管理関連のコマンドを実行するには、管理者権限が必要です。
:::
## FE のパラメータを設定する
### FE の動的パラメータを設定する

[ADMIN SET FRONTEND CONFIG](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md) を使用して、FE の動的パラメータの設定や変更ができます。

```SQL
ADMIN SET FRONTEND CONFIG ("key" = "value");
```

<AdminSetFrontendNote />
### FE の静的パラメータを設定する

<StaticFEConfigNote />
## FE パラメータについて
### ロギング
##### audit_log_delete_age

- デフォルト値: 30d
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: 監査ログファイルの保持期間。 デフォルト値 `30d` は、各監査ログファイルを30日間保持できることを指定します。 StarRocks は各監査ログファイルをチェックし、30日前に生成されたファイルを削除します。
- 導入バージョン: -
##### audit_log_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: 監査ログファイルを保存するディレクトリ。
- 導入バージョン: -
##### audit_log_enable_compress

- デフォルト値: false
- タイプ: Boolean
- 単位: N/A
- 変更可能か: No
- 説明: trueの場合、生成されたLog4j2設定は、ローテーションされた監査ログのファイル名（fe.audit.log.*）に".gz"の接尾辞を追加し、Log4j2がロールオーバー時に圧縮された（.gz）アーカイブ監査ログファイルを生成するようにします。この設定は、FEの起動時にLog4jConfig.initLoggingで読み込まれ、監査ログのRollingFileアペンダーに適用されます。アクティブな監査ログではなく、ローテーション/アーカイブされたファイルにのみ影響します。値は起動時に初期化されるため、変更を有効にするにはFEの再起動が必要です。audit logのローテーション設定（audit_log_dir、audit_log_roll_interval、audit_roll_maxsize、audit_log_roll_num）と組み合わせて使用​​します。
- 導入バージョン: 3.2.12
##### audit_log_json_format

- デフォルト: false
- タイプ: Boolean
- 単位: N/A
- 変更可能: Yes
- 説明: trueの場合、FE の監査イベントは、デフォルトのパイプで区切られた「key=value」文字列の代わりに、構造化された JSON（アノテーション付きの AuditEvent フィールドの Map をシリアライズする Jackson ObjectMapper）として出力されます。この設定は、AuditLogBuilder によって処理されるすべての組み込み監査シンクに影響します。接続監査、クエリ監査、big-query 監査（イベントが条件を満たす場合、big-query のしきい値フィールドが JSON に追加されます）、および slow-audit の出力です。big-query のしきい値用にアノテーションが付けられたフィールドと「features」フィールドは、特別に扱われます（通常の監査エントリからは除外されます。big-query または機能ログに該当するものとして含まれます）。これを有効にすると、ログコレクターまたは SIEM 用にログを機械で解析できるようになります。ログ形式が変更され、従来のパイプで区切られた形式を想定する既存のパーサーの更新が必要になる場合があることに注意してください。
- 導入バージョン: 3.2.7
##### audit_log_modules

- デフォルト値: slow_query, query
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks が監査ログエントリを生成するモジュール。 デフォルトでは、StarRocks は `slow_query` モジュールと `query` モジュールの監査ログを生成します。 `connection` モジュールは v3.0 以降でサポートされています。 モジュール名はカンマ (,) とスペースで区切ります。
- 導入: -
##### audit_log_roll_interval

- デフォルト値: DAY
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: StarRocks が監査ログのエントリをローテーションする時間間隔。 有効な値: `DAY` および `HOUR`。
  - このパラメータが `DAY` に設定されている場合、`yyyyMMdd` 形式のサフィックスが監査ログファイルの名前に追加されます。
  - このパラメータが `HOUR` に設定されている場合、`yyyyMMddHH` 形式のサフィックスが監査ログファイルの名前に追加されます。
- 導入: -
##### audit_log_roll_num

- デフォルト値: 90
- タイプ: Int
- 単位: -
- 変更可能: No
- 説明: `audit_log_roll_interval` パラメータで指定された各保持期間内に保持できる監査ログファイルの最大数。
- 導入: -
##### bdbje_log_level

- デフォルト: INFO
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: StarRocks で Berkeley DB Java Edition (BDB JE) が使用するログレベルを制御します。BDB 環境の初期化中に、BDBEnvironment.initConfigs() はこの値を `com.sleepycat.je` パッケージの Java ロガーと BDB JE 環境ファイルログレベル (EnvironmentConfig.FILE_LOGGING_LEVEL) に適用します。SEVERE、WARNING、INFO、CONFIG、FINE、FINER、FINEST、ALL、OFF などの標準の java.util.logging.Level 名を受け入れます。ALL に設定すると、すべてのログメッセージが有効になります。冗長性を高めると、ログ量が増加し、ディスク I/O とパフォーマンスに影響を与える可能性があります。この値は BDB 環境の初期化時に読み取られるため、環境の (再) 初期化後にのみ有効になります。
- 導入バージョン: v3.2.0
##### big_query_log_delete_age

- デフォルト値: 7d
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: FE の大規模クエリログファイル (`fe.big_query.log.*`) が自動削除されるまでの保持期間を制御します。この値は、Log4j の削除ポリシーに IfLastModified の経過時間として渡されます。つまり、最後に変更された時刻がこの値よりも古いローテーションされた大規模クエリログは削除されます。サフィックスとして `d` (日)、`h` (時間)、`m` (分)、`s` (秒) がサポートされています。例: `7d` (7 日)、`10h` (10 時間)、`60m` (60 分)、`120s` (120 秒)。この項目は、`big_query_log_roll_interval` および `big_query_log_roll_num` と連携して、どのファイルを保持または削除するかを決定します。
- 導入バージョン: v3.2.0
##### big_query_log_dir

- デフォルト値: `Config.STARROCKS_HOME_DIR + "/log"`
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: FE が大規模クエリダンプログ（`fe.big_query.log.*`）を書き込むディレクトリ。Log4j の設定は、このパスを使用して `fe.big_query.log` とそのローテーションされたファイル用の RollingFile appender を作成します。ローテーションと保持は、`big_query_log_roll_interval`（時間ベースのサフィックス）、`log_roll_size_mb`（サイズトリガー）、`big_query_log_roll_num`（最大ファイル数）、および `big_query_log_delete_age`（経過時間ベースの削除）によって管理されます。大規模クエリの記録は、`big_query_log_cpu_second_threshold`、`big_query_log_scan_rows_threshold`、または `big_query_log_scan_bytes_threshold` などのユーザー定義のしきい値を超えるクエリに対して記録されます。どのモジュールがこのファイルにログを記録するかを制御するには、`big_query_log_modules` を使用します。
- 導入バージョン: v3.2.0
##### big_query_log_modules

- デフォルト値: `{"query"}`
- タイプ: String[]
- 単位: -
- 変更可能か: いいえ
- 説明: モジュールごとの大規模クエリのログ記録を有効にするモジュール名のサフィックスのリスト。一般的な値は、論理コンポーネント名です。たとえば、デフォルトの `query` は `big_query.query` を生成します。
- 導入バージョン: v3.2.0
##### big_query_log_roll_interval

- デフォルト: `"DAY"`
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: `big_query` ログアペンダーのローリングファイル名のdateコンポーネントを構築するために使用される時間間隔を指定します。有効な値（大文字と小文字を区別しない）は、`DAY`（デフォルト）と`HOUR`です。`DAY`は日単位のパターン（`"%d{yyyyMMdd}"`）を生成し、`HOUR`は時間単位のパターン（`"%d{yyyyMMddHH}"`）を生成します。この値は、サイズベースのロールオーバー（`big_query_roll_maxsize`）およびインデックスベースのロールオーバー（`big_query_log_roll_num`）と組み合わされて、RollingFile filePatternを形成します。無効な値を指定すると、ログ構成の生成が失敗し（IOException）、ログの初期化または再構成が妨げられる可能性があります。`big_query_log_dir`、`big_query_roll_maxsize`、`big_query_log_roll_num`、および`big_query_log_delete_age`と一緒に使用します。
- 導入バージョン: v3.2.0
##### big_query_log_roll_num

- デフォルト値: 10
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: `big_query_log_roll_interval` ごとに保持する、ローテーションされた FE big query ログファイルの最大数。この値は、`fe.big_query.log` の RollingFile appender の DefaultRolloverStrategy `max` 属性にバインドされています。ログがローテーションされると (時間または `log_roll_size_mb` によって)、StarRocks は最大 `big_query_log_roll_num` 個のインデックス付きファイル (filePattern はタイムサフィックスとインデックスを使用) を保持します。この数よりも古いファイルは、ローリングによって削除される可能性があり、`big_query_log_delete_age` は最終更新日時の経過時間によってファイルを追加で削除できます。
- 導入バージョン: v3.2.0
##### dump_log_delete_age

- デフォルト値: 7d
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: ダンプログファイルの保持期間。デフォルト値 `7d` は、各ダンプログファイルを7日間保持できることを指定します。 StarRocks は各ダンプログファイルをチェックし、7日前に生成されたファイルを削除します。
- 導入: -
##### dump_log_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: ダンプログファイルを保存するディレクトリ。
- 導入バージョン: -
##### dump_log_modules

- デフォルト: query
- タイプ: String[]
- 単位: -
- 変更可能: No
- 説明: StarRocks がダンプログエントリを生成するモジュール。 デフォルトでは、StarRocks は query モジュールのダンプログを生成します。 モジュール名はカンマ (,) とスペースで区切ります。
- 導入: -
##### dump_log_roll_interval

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: StarRocks がダンプログエントリをローテーションする時間間隔。有効な値: `DAY` と `HOUR`。
  - このパラメータが `DAY` に設定されている場合、`yyyyMMdd` 形式のサフィックスがダンプログファイルの名前に追加されます。
  - このパラメータが `HOUR` に設定されている場合、`yyyyMMddHH` 形式のサフィックスがダンプログファイルの名前に追加されます。
- 導入: -
##### dump_log_roll_num

- デフォルト: 10
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: `dump_log_roll_interval` パラメータで指定された各保持期間内に保持できるダンプログファイルの最大数。
- 導入: -
##### edit_log_write_slow_log_threshold_ms

- デフォルト値: 2000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: JournalWriter が遅い edit-log バッチ書き込みを検出し、ログに記録するために使用する閾値（ミリ秒単位）。バッチコミット後、バッチの実行時間がこの値を超えると、JournalWriter はバッチサイズ、実行時間、現在のジャーナルキューサイズとともに WARN を出力します（レート制限は約2秒に1回）。この設定は、FE の leader における潜在的な IO またはレプリケーションの遅延に関するログ/アラートのみを制御します。コミットやロールの動作は変更しません（`edit_log_roll_num` およびコミット関連の設定を参照）。この閾値に関係なく、メトリックの更新は引き続き行われます。
- 導入バージョン: v3.2.3
##### enable_audit_sql

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: No
- 説明: この項目が `true` に設定されている場合、FE監査サブシステムは、ConnectProcessorによって処理されたステートメントのSQLテキストをFE監査ログ ( `fe.audit.log` ) に記録します。保存されるステートメントは、他の制御に従います。暗号化されたステートメントは編集され ( `AuditEncryptionChecker` ) 、 `enable_sql_desensitize_in_log` が設定されている場合は、機密性の高い認証情報が編集または非表示になる可能性があり、ダイジェストの記録は `enable_sql_digest` によって制御されます。 `false` に設定すると、ConnectProcessorは監査イベント内のステートメントテキストを "?" に置き換えます。他の監査フィールド (ユーザー、ホスト、期間、ステータス、 `qe_slow_log_ms` によるスロークエリの検出、およびメトリクス) は引き続き記録されます。SQL監査を有効にすると、フォレンジックとトラブルシューティングの可視性が向上しますが、機密性の高いSQLコンテンツが公開され、ログの量とI/Oが増加する可能性があります。無効にすると、監査ログでステートメント全体の可視性が失われる代わりに、プライバシーが向上します。
- 導入: -
##### enable_profile_log

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: No
- 説明: プロファイルログを有効にするかどうか。この機能を有効にすると、FE はクエリごとのプロファイルログ（`ProfileManager` によって生成されたシリアライズされた `queryDetail` JSON）をプロファイルログシンクに書き込みます。このロギングは、`enable_collect_query_detail_info` も有効になっている場合にのみ実行されます。`enable_profile_log_compress` が有効になっている場合、JSON はロギング前に gzip 圧縮されることがあります。プロファイルログファイルは、`profile_log_dir`、`profile_log_roll_num`、`profile_log_roll_interval` によって管理され、`profile_log_delete_age`（`7d`、`10h`、`60m`、`120s` などの形式をサポート）に従ってローテーション/削除されます。この機能を無効にすると、プロファイルログの書き込みが停止します（ディスク I/O、圧縮 CPU、およびストレージの使用量が削減されます）。
- 導入バージョン: v3.2.5
##### enable_qe_slow_log

- デフォルト値: true
- タイプ: Boolean
- 単位: N/A
- 変更可能: Yes
- 説明: 有効にすると、FE 組み込みの監査プラグイン (AuditLogBuilder) は、測定された実行時間 ("Time" フィールド) が qe_slow_log_ms で設定されたしきい値を超えるクエリイベントを、スロークエリ監査ログ (AuditLog.getSlowAudit) に書き込みます。無効にすると、これらのスロークエリのエントリは抑制されます (通常のクエリと接続の監査ログは影響を受けません)。スロー監査エントリは、グローバルな audit_log_json_format 設定 (JSON 対プレーン文字列) に従います。このフラグを使用して、通常監査ログとは独立してスロークエリ監査ボリュームの生成を制御します。qe_slow_log_ms が低い場合、またはワークロードが多数の長時間実行クエリを生成する場合、オフにするとログ I/O が削減される可能性があります。
- 導入バージョン: 3.2.11
##### enable_sql_desensitize_in_log

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: この項目が `true` に設定されている場合、システムは機密性の高い SQL コンテンツを、ログおよびクエリ詳細レコードに書き込まれる前に、置換または非表示にします。この構成を尊重するコードパスには、ConnectProcessor.formatStmt (監査ログ)、StmtExecutor.addRunningQueryDetail (クエリ詳細)、および SimpleExecutor.formatSQL (内部 executor ログ) が含まれます。この機能を有効にすると、無効な SQL は固定の非機密化されたメッセージに置き換えられ、認証情報 (ユーザー/パスワード) は非表示になり、SQL フォーマッタはサニタイズされた表現を生成する必要があります (ダイジェストスタイルの出力を有効にすることもできます)。これにより、監査/内部ログにおける機密性の高いリテラルおよび認証情報の漏洩が軽減されますが、ログおよびクエリ詳細には元の完全な SQL テキストが含まれなくなります (再生またはデバッグに影響を与える可能性があります)。
- 導入: -
##### internal_log_delete_age

- デフォルト値: 7d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE の内部ログファイル ( `internal_log_dir` に書き込まれる) の保持期間を指定します。値は期間文字列です。サポートされているサフィックス: `d` (日)、 `h` (時間)、 `m` (分)、 `s` (秒)。例: `7d` (7 日)、 `10h` (10 時間)、 `60m` (60 分)、 `120s` (120 秒)。この項目は、ローリングファイル削除ポリシーで使用される `<IfLastModified age="..."/>` 述語として log4j 構成に代入されます。最終更新時刻がこの期間より前のファイルは、ログのローリング中に削除されます。この値を大きくすると、ディスク容量をより早く解放できます。小さくすると、内部マテリアライズドビューまたは統計ログをより長く保持できます。
- 導入バージョン: v3.2.4
##### internal_log_dir

- デフォルト値: `Config.STARROCKS_HOME_DIR + "/log"`
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: FE ロギングサブシステムが内部ログ (`fe.internal.log`) の保存に使用するディレクトリ。この構成は Log4j の構成に組み込まれ、InternalFile appender が内部ログ/マテリアライズドビュー/統計ログを書き込む場所、および `internal.<module>` の下のモジュールごとのロガーがファイルを配置する場所を決定します。ディレクトリが存在し、書き込み可能であり、十分なディスク容量があることを確認してください。このディレクトリ内のファイルのログローテーションと保持は、`log_roll_size_mb`、`internal_log_roll_num`、`internal_log_delete_age`、および `internal_log_roll_interval` によって制御されます。`sys_log_to_console` が有効になっている場合、内部ログはこのディレクトリではなくコンソールに書き込まれることがあります。
- 導入バージョン: v3.2.4
##### internal_log_json_format

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: この項目が `true` に設定されている場合、内部統計/監査エントリは、コンパクトな JSON オブジェクトとして統計監査ロガーに書き込まれます。 JSON には、キー "executeType" (InternalType: QUERY または DML)、"queryId"、"sql"、および "time" (経過ミリ秒) が含まれています。 `false` に設定されている場合、同じ情報がフォーマットされた1行のテキストとしてログに記録されます ("statistic execute: ... | QueryId: [...] | SQL: ...")。 JSON を有効にすると、機械での解析とログプロセッサとの統合が向上しますが、生の SQL テキストがログに含まれるため、機密情報が公開されたり、ログサイズが大きくなる可能性があります。
- 導入: -
##### internal_log_modules

- デフォルト: `{"base", "statistic"}`
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: 専用の内部ログを受け取るモジュール識別子のリスト。エントリXごとに、Log4jはレベルINFOおよびadditivity="false"で`internal.&lt;X&gt;`という名前のロガーを作成します。これらのロガーは、内部アペンダー（`fe.internal.log`に書き込まれる）または`sys_log_to_console`が有効になっている場合はコンソールにルーティングされます。必要に応じて短い名前またはパッケージフラグメントを使用してください。正確なロガー名は`internal.` + 設定された文字列になります。内部ログファイルのローテーションと保持は、`internal_log_dir`、`internal_log_roll_num`、`internal_log_delete_age`、`internal_log_roll_interval`、および`log_roll_size_mb`に従います。モジュールを追加すると、そのランタイムメッセージが内部ロガーストリームに分離され、デバッグと監査が容易になります。
- 導入バージョン: v3.2.4
##### internal_log_roll_interval

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: FE 内部ログアペンダーの時間ベースのロール間隔を制御します。使用できる値（大文字と小文字は区別されません）は、`HOUR` と `DAY` です。`HOUR` は時間単位のファイルパターン（`"%d{yyyyMMddHH}"`）を生成し、`DAY` は日単位のファイルパターン（`"%d{yyyyMMdd}"`）を生成します。これらは、ローテーションされた `fe.internal.log` ファイルに名前を付けるために RollingFile TimeBasedTriggeringPolicy によって使用されます。無効な値を指定すると、初期化が失敗します（アクティブな Log4j 構成を構築する際に IOException がスローされます）。ロールの動作は、`internal_log_dir`、`internal_roll_maxsize`、`internal_log_roll_num`、`internal_log_delete_age` などの関連設定にも依存します。
- 導入バージョン: v3.2.4
##### internal_log_roll_num

- デフォルト値: 90
- タイプ: Int
- 単位: -
- 変更可能か: No
- 説明: 内部アペンダー (`fe.internal.log`) 用に保持する、ローリングされた内部 FE ログファイルの最大数。この値は、Log4j の DefaultRolloverStrategy の `max` 属性として使用されます。ローリングが発生すると、StarRocks は最大 `internal_log_roll_num` 個のアーカイブファイルを保持し、古いファイルを削除します (これは `internal_log_delete_age` にも左右されます)。値を小さくするとディスク使用量が削減されますが、ログの履歴が短くなります。値を大きくすると、より多くの履歴内部ログが保持されます。この項目は、`internal_log_dir`、`internal_log_roll_interval`、および `internal_roll_maxsize` と連携して動作します。
- 導入バージョン: v3.2.4
##### log_cleaner_audit_log_min_retention_days

- デフォルト値: 3
- タイプ: Int
- 単位: 日
- 変更可能: はい
- 説明: 監査ログファイルの最小保持日数。 これより新しい監査ログファイルは、ディスク使用量が多くても削除されません。 これは、コンプライアンスおよびトラブルシューティングの目的で監査ログが確実に保持されるようにするためです。
- 導入: -
##### log_cleaner_check_interval_second

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: ディスク使用量を確認し、ログをクリーンアップする間隔（秒単位）。 クリーナーは、各ログディレクトリのディスク使用量を定期的に確認し、必要に応じてクリーンアップをトリガーします。 デフォルトは300秒（5分）です。
- 導入: -
##### log_cleaner_disk_usage_target

- デフォルト値: 60
- タイプ: Int
- 単位: パーセント
- 変更可能: はい
- 説明: ログクリーンアップ後の目標ディスク使用量（パーセント）。 ディスク使用量がこのしきい値を下回るまで、ログのクリーンアップが継続されます。 クリーナーは、目標に達するまで最も古いログファイルを1つずつ削除します。
- 導入バージョン: -
##### log_cleaner_disk_usage_threshold

- デフォルト: 80
- タイプ: Int
- 単位: パーセンテージ
- 変更可能: はい
- 説明: ログのクリーンアップをトリガーするディスク使用率のしきい値（パーセンテージ）。 ディスク使用率がこのしきい値を超えると、ログのクリーンアップが開始されます。 クリーナーは、設定された各ログディレクトリを個別にチェックし、このしきい値を超えるディレクトリを処理します。
- 導入バージョン: -
##### log_cleaner_disk_util_based_enable

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: ディスク使用量に基づいて自動ログクリーンを有効にします。 有効にすると、ディスク使用量がしきい値を超えた場合にログがクリーンされます。 ログクリーナーは FE ノード上でバックグラウンドデーモンとして実行され、ログファイルの蓄積によるディスク容量の枯渇を防ぎます。
- 導入バージョン: -
##### log_plan_cancelled_by_crash_be

- デフォルト値: true
- タイプ: boolean
- 単位: -
- 変更可能: Yes
- 説明: BE のクラッシュまたは RPC 例外が原因でクエリがキャンセルされた場合に、クエリ実行プランのログ記録を有効にするかどうかを指定します。この機能を有効にすると、BE のクラッシュまたは `RpcException` が原因でクエリがキャンセルされた場合、StarRocks はクエリ実行プラン（`TExplainLevel.COSTS`）を WARN エントリとしてログに記録します。ログエントリには、QueryId、SQL、および COSTS プランが含まれます。ExecuteExceptionHandler パスでは、例外スタックトレースもログに記録されます。`enable_collect_query_detail_info` が有効になっている場合（プランはクエリ詳細に保存されます）、ログ記録はスキップされます。コードパスでは、クエリ詳細が null であることを確認することでチェックが実行されます。ExecuteExceptionHandler では、プランは最初のリトライでのみログに記録されることに注意してください（`retryTime == 0`）。これを有効にすると、完全な COSTS プランが大きくなる可能性があるため、ログの量が増加する可能性があります。
- 導入バージョン: v3.2.0
##### log_register_and_unregister_query_id

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: FE が QeProcessorImpl からのクエリ登録および登録解除メッセージ (例: `"register query id = {}"` および `"deregister query id = {}"`) をログに記録することを許可するかどうか。ログは、クエリが非 null の ConnectContext を持ち、コマンドが `COM_STMT_EXECUTE` でないか、セッション変数 `isAuditExecuteStmt()` が true の場合にのみ出力されます。これらのメッセージはすべてのクエリライフサイクルイベントに対して書き込まれるため、この機能を有効にすると、ログの量が多くなり、高い同時実行環境ではスループットのボトルネックになる可能性があります。デバッグまたは監査のために有効にし、ログのオーバーヘッドを削減してパフォーマンスを向上させるために無効にします。
- 導入: v3.3.0, v3.4.0, v3.5.0
##### log_roll_size_mb

- デフォルト値: 1024
- タイプ: Int
- 単位: MB
- 変更可能か: いいえ
- 説明: システムログファイルまたは監査ログファイルの最大サイズ。
- 導入バージョン: -
##### proc_profile_file_retained_days

- デフォルト: 1
- タイプ: Int
- 単位: 日
- 変更可能: Yes
- 説明: `sys_log_dir/proc_profile` に生成されたプロセスプロファイリングファイル（CPUとメモリ）を保持する日数。 ProcProfileCollector は、現在の時刻から `proc_profile_file_retained_days` 日を引いたカットオフを計算し (yyyyMMdd-HHmmss の形式)、タイムスタンプ部分がそのカットオフよりも辞書式順序で早いプロファイルファイルを削除します (つまり、timePart.compareTo(timeToDelete) &lt; 0)。ファイルの削除は、`proc_profile_file_retained_size_bytes` によって制御されるサイズベースのカットオフも考慮します。プロファイルファイルは、プレフィックス `cpu-profile-` および `mem-profile-` を使用し、収集後に圧縮されます。
- 導入バージョン: v3.2.12
##### proc_profile_file_retained_size_bytes

- デフォルト値: 2L * 1024 * 1024 * 1024 (2147483648)
- タイプ: Long
- 単位: Bytes
- 変更可能: Yes
- 説明: CPUとメモリのプロファイルファイル（`cpu-profile-` と `mem-profile-` のプレフィックスが付いたファイル）の、プロファイルディレクトリに保持する最大合計バイト数。 有効なプロファイルファイルの合計が `proc_profile_file_retained_size_bytes` を超えると、コレクターは残りの合計サイズが `proc_profile_file_retained_size_bytes` 以下になるまで、最も古いプロファイルファイルを削除します。 `proc_profile_file_retained_days` より古いファイルも、サイズに関係なく削除されます。 この設定は、プロファイルアーカイブのディスク使用量を制御し、`proc_profile_file_retained_days` と連携して削除順序と保持期間を決定します。
- 導入バージョン: v3.2.12
##### profile_log_delete_age

- デフォルト: 1d
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: FE プロファイルログファイルの削除対象となるまでの保持期間を制御します。この値は、Log4j の `&lt;IfLastModified age="..."/&gt;` ポリシーに（`Log4jConfig` 経由で）挿入され、`profile_log_roll_interval` や `profile_log_roll_num` などのローテーション設定とともに適用されます。サポートされているサフィックス: `d` (日)、`h` (時間)、`m` (分)、`s` (秒)。例: `7d` (7 日)、`10h` (10 時間)、`60m` (60 分)、`120s` (120 秒)。
- 導入バージョン: v3.2.5
##### profile_log_dir

- デフォルト値: `Config.STARROCKS_HOME_DIR + "/log"`
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: FE プロファイルログが書き込まれるディレクトリ。 Log4jConfig はこの値を使用して、プロファイル関連のアペンダーを配置します (このディレクトリに `fe.profile.log` や `fe.features.log` などのファイルを作成します)。これらのファイルのローテーションと保持は、`profile_log_roll_size_mb` 、 `profile_log_roll_num` 、および `profile_log_delete_age` によって管理されます。タイムスタンプのサフィックス形式は `profile_log_roll_interval` によって制御されます (DAY または HOUR をサポート)。デフォルトのディレクトリは `STARROCKS_HOME_DIR` の下にあるため、FE プロセスがこのディレクトリに対する書き込みおよびローテーション/削除の権限を持っていることを確認してください。
- 導入バージョン: v3.2.5
##### profile_log_roll_interval

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: プロファイルログのファイル名のdate部分を生成するために使用される時間の粒度を制御します。有効な値（大文字と小文字を区別しない）は、`HOUR` と `DAY` です。`HOUR` は `"%d{yyyyMMddHH}"` （毎時の時間バケット）のパターンを生成し、`DAY` は `"%d{yyyyMMdd}"` （毎日の時間バケット）を生成します。この値は、Log4j構成の `profile_file_pattern` を計算するときに使用され、ロールオーバーファイル名の時間ベースのコンポーネントにのみ影響します。サイズベースのロールオーバーは `profile_log_roll_size_mb` によって、保持は `profile_log_roll_num` / `profile_log_delete_age` によって制御されます。無効な値を指定すると、ログ初期化中に IOException が発生します（エラーメッセージ: `"profile_log_roll_interval config error: <value>"`）。高ボリュームのプロファイリングの場合は、1時間あたりのファイルサイズを制限するために `HOUR` を選択し、毎日の集計の場合は `DAY` を選択します。
- 導入バージョン: v3.2.5
##### profile_log_roll_num

- デフォルト値: 5
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: プロファイルロガーのために、Log4j の DefaultRolloverStrategy によって保持される、ローテーションされたプロファイルログファイルの最大数を指定します。この値は、`${profile_log_roll_num}` としてロギング XML に挿入されます (例: `&lt;DefaultRolloverStrategy max="${profile_log_roll_num}" fileIndex="min"&gt;`)。ローテーションは `profile_log_roll_size_mb` または `profile_log_roll_interval` によってトリガーされます。ローテーションが発生すると、Log4j は最大でこれらのインデックス付きファイルを保持し、古いインデックスファイルは削除対象となります。ディスク上の実際の保持期間は、`profile_log_delete_age` と `profile_log_dir` の場所にも影響されます。値を小さくするとディスク使用量が削減されますが、保持される履歴が制限されます。値を大きくすると、より多くの履歴プロファイルログが保持されます。
- 導入バージョン: v3.2.5
##### profile_log_roll_size_mb

- デフォルト値: 1024
- タイプ: Int
- 単位: MB
- 変更可能: いいえ
- 説明: FE のプロファイルログファイルのサイズに基づいたロールオーバーをトリガーするサイズ閾値（メガバイト単位）を設定します。この値は、`ProfileFile` appender の Log4j RollingFile SizeBasedTriggeringPolicy によって使用されます。プロファイルログが `profile_log_roll_size_mb` を超えると、ローテーションされます。ローテーションは、`profile_log_roll_interval` に達したときにも時間によって発生する可能性があります。いずれかの条件がロールオーバーをトリガーします。`profile_log_roll_num` および `profile_log_delete_age` と組み合わせることで、この項目は保持される過去のプロファイルファイルの数と、古いファイルが削除されるタイミングを制御します。ローテーションされたファイルの圧縮は、`enable_profile_log_compress` によって制御されます。
- 導入バージョン: v3.2.5
##### qe_slow_log_ms

- デフォルト値: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: クエリが遅いかどうかを判断するために使用される閾値。クエリの応答時間がこの閾値を超えると、**fe.audit.log** に遅いクエリとして記録されます。
- 導入バージョン: -
##### slow_lock_log_every_ms

- デフォルト値: 3000L
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: 同じ SlowLockLogStats インスタンスに対して、次の「slow lock」警告を発するまでの最小間隔（ミリ秒単位）。 LockUtils は、ロックの待機時間が slow_lock_threshold_ms を超えた後にこの値をチェックし、最後に記録された slow-lock イベントから slow_lock_log_every_ms ミリ秒が経過するまで、追加の警告を抑制します。 競合が長引く場合は値を大きくしてログ量を減らし、より頻繁な診断が必要な場合は値を小さくします。 変更は、後続のチェックのために実行時に有効になります。
- 導入バージョン: v3.2.0
##### slow_lock_print_stack

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: `logSlowLockTrace` によって出力される slow-lock 警告の JSON ペイロードに、LockManager が所有スレッドの完全なスタックトレースを含めることを許可するかどうか (`start=0` および `max=Short.MAX_VALUE` で `LogUtil.getStackTraceToJsonArray` を使用して "stack" 配列が作成されます)。この構成は、ロックの取得が `slow_lock_threshold_ms` で構成されたしきい値を超えた場合に表示されるロック所有者の追加のスタック情報のみを制御します。この機能を有効にすると、ロックを保持している正確なスレッドスタックが得られるため、デバッグに役立ちます。無効にすると、ログの量と、同時実行性の高い環境でスタックトレースをキャプチャしてシリアライズすることによって発生する CPU/メモリのオーバーヘッドが削減されます。
- 導入バージョン: v3.3.16, v3.4.5, v3.5.1
##### slow_lock_threshold_ms

- デフォルト値: 3000L
- タイプ: long
- 単位: ミリ秒
- 変更可能: はい
- 説明: ロック操作または保持されているロックを「遅い」と分類するために使用される閾値（ミリ秒単位）。ロックの経過待機時間または保持時間がこの値を超えると、StarRocks は（コンテキストに応じて）診断ログを発行し、スタックトレースまたは待機者/所有者情報を含み、LockManager ではこの遅延後にデッドロック検出を開始します。LockUtils（遅いロックのロギング）、QueryableReentrantReadWriteLock（遅いリーダーのフィルタリング）、LockManager（デッドロック検出の遅延と遅いロックのトレース）、LockChecker（定期的な遅いロックの検出）、およびその他の呼び出し元（DiskAndTabletLoadReBalancer のロギングなど）で使用されます。値を小さくすると、感度とロギング/診断のオーバーヘッドが増加します。0 または負に設定すると、初期の待機ベースのデッドロック検出遅延の動作が無効になります。slow_lock_log_every_ms、slow_lock_print_stack、および slow_lock_stack_trace_reserve_levels と共に調整してください。
- 導入バージョン: 3.2.0
##### sys_log_delete_age

- デフォルト: 7d
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: システムログファイルの保持期間。デフォルト値 `7d` は、各システムログファイルを7日間保持できることを指定します。 StarRocks は各システムログファイルをチェックし、7日前に生成されたものを削除します。
- 導入: -
##### sys_log_dir

- デフォルト: StarRocksFE.STARROCKS_HOME_DIR + "/log"
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: システムログファイルを格納するディレクトリ。
- 導入: -
##### sys_log_enable_compress

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: No
- 説明: この項目が `true` に設定されている場合、システムはローテーションされたシステムログのファイル名に ".gz" の接尾辞を追加します。これにより、Log4j は gzip 圧縮されたローテーションされた FE システムログを生成します (例: fe.log.*)。この値は、Log4j の構成生成 (Log4jConfig.initLogging / generateActiveLog4jXmlConfig) 中に読み取られ、RollingFile filePattern で使用される `sys_file_postfix` プロパティを制御します。この機能を有効にすると、保持されるログのディスク使用量が削減されますが、ロールオーバー中の CPU および I/O が増加し、ログを読み取るツールまたはスクリプトが .gz ファイルを処理できるように、ログのファイル名が変更されます。監査ログは圧縮に別の構成を使用することに注意してください。つまり、`audit_log_enable_compress` です。
- 導入バージョン: v3.2.12
##### sys_log_format

- デフォルト: "plaintext"
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: FE ログに使用される Log4j レイアウトを選択します。有効な値: `"plaintext"` (デフォルト) および `"json"`。値は大文字と小文字を区別しません。`"plaintext"` は、人間が判読できるタイムスタンプ、レベル、スレッド、class.method:line、および WARN/ERROR のスタックトレースで PatternLayout を構成します。`"json"` は JsonTemplateLayout を構成し、ログアグリゲーター (ELK、Splunk) に適した構造化 JSON イベント (UTC タイムスタンプ、レベル、スレッド ID/名前、ソースファイル/メソッド/行、メッセージ、例外 stackTrace) を出力します。JSON 出力は、最大文字列長に関して `sys_log_json_max_string_length` および `sys_log_json_profile_max_string_length` に準拠します。
- 導入バージョン: v3.2.10
##### sys_log_json_max_string_length

- デフォルト: 1048576
- タイプ: Int
- 単位: Bytes
- 変更可能: いいえ
- 説明: JSON形式のシステムログに使用される JsonTemplateLayout の "maxStringLength" の値を設定します。 `sys_log_format` が `"json"` に設定されている場合、文字列値のフィールド（例えば "message" や文字列化された例外スタックトレース）の長さがこの制限を超えると切り捨てられます。この値は、`Log4jConfig.generateActiveLog4jXmlConfig()` で生成された Log4j XML に挿入され、default、warning、audit、dump、bigquery のレイアウトに適用されます。 profile レイアウトは別の構成 (`sys_log_json_profile_max_string_length`) を使用します。この値を下げるとログサイズは小さくなりますが、有用な情報が切り捨てられる可能性があります。
- 導入バージョン: 3.2.11
##### sys_log_json_profile_max_string_length

- デフォルト値: 104857600 (100 MB)
- タイプ: Int
- 単位: バイト
- 変更可能か: いいえ
- 説明: `sys_log_format` が "json" の場合、プロファイル（および関連機能）ログアペンダーの JsonTemplateLayout の maxStringLength を設定します。JSON 形式のプロファイルログの文字列フィールド値は、このバイト長に切り捨てられます。文字列以外のフィールドは影響を受けません。この項目は Log4jConfig `JsonTemplateLayout maxStringLength` で適用され、`plaintext` ロギングが使用されている場合は無視されます。必要なメッセージ全体を格納できる十分な大きさの値を維持してください。ただし、値を大きくするとログサイズと I/O が増加することに注意してください。
- 導入バージョン: v3.2.11
##### sys_log_level

- デフォルト値: INFO
- 型: String
- 単位: -
- 変更可能か: いいえ
- 説明: システムログのエントリが分類される重要度レベル。有効な値: `INFO`、`WARN`、`ERROR`、および `FATAL`。
- 導入バージョン: -
##### sys_log_roll_interval

- デフォルト値: DAY
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: StarRocks がシステムログのエントリをローテーションする時間間隔。 有効な値: `DAY` および `HOUR`。
  - このパラメータが `DAY` に設定されている場合、`yyyyMMdd` 形式のサフィックスがシステムログファイルの名前に追加されます。
  - このパラメータが `HOUR` に設定されている場合、`yyyyMMddHH` 形式のサフィックスがシステムログファイルの名前に追加されます。
- 導入: -
##### sys_log_roll_num

- デフォルト値: 10
- タイプ: Int
- 単位: -
- 変更可能か: No
- 説明: `sys_log_roll_interval` パラメータで指定された各保持期間内に保持できるシステムログファイルの最大数。
- 導入: -
##### sys_log_to_console

- デフォルト値: false (環境変数 `SYS_LOG_TO_CONSOLE` が "1" に設定されていない限り)
- タイプ: Boolean
- 単位: -
- 変更可能か: いいえ
- 説明: この項目が `true` に設定されている場合、システムは Log4j がすべてのログをファイルベースのアペンダーではなく、コンソール (ConsoleErr appender) に送信するように設定します。この値は、アクティブな Log4j XML 構成を生成する際に読み取られます (これは、ルートロガーとモジュールごとのロガーアペンダーの選択に影響します)。その値は、プロセス起動時に `SYS_LOG_TO_CONSOLE` 環境変数から取得されます。実行時に変更しても効果はありません。この構成は、stdout/stderr ログ収集がログファイルの書き込みよりも優先されるコンテナ化された環境または CI 環境で一般的に使用されます。
- 導入バージョン: v3.2.0
##### sys_log_verbose_modules

- デフォルト: 空文字列
- タイプ: String[]
- 単位: -
- 変更可能か: いいえ
- 説明: StarRocks がシステムログを生成するモジュール。このパラメータが `org.apache.starrocks.catalog` に設定されている場合、StarRocks は catalog モジュールに対してのみシステムログを生成します。モジュール名はカンマ (,) とスペースで区切ります。
- 導入: -
##### sys_log_warn_modules

- デフォルト値: {}
- 型: String[]
- 単位: -
- 変更可能: いいえ
- 説明: システムが起動時に WARN レベルのロガーとして構成し、警告アペンダー (SysWF) (`fe.warn.log` ファイル) にルーティングする、ロガー名またはパッケージプレフィックスのリスト。エントリは、生成された Log4j 構成 (org.apache.kafka、org.apache.hudi、org.apache.hadoop.io.compress などの組み込みの警告モジュールと並んで) に挿入され、`<Logger name="... " level="WARN"><AppenderRef ref="SysWF"/></Logger>` のようなロガー要素を生成します。ノイズの多い INFO/DEBUG 出力を通常のログに抑制し、警告を個別にキャプチャできるように、完全修飾されたパッケージおよびクラスのプレフィックス (たとえば、"com.example.lib") を推奨します。
- 導入バージョン: v3.2.13
### サーバー
##### brpc_idle_wait_max_time

- デフォルト値: 10000
- タイプ: Int
- 単位: ms
- 変更可能か: いいえ
- 説明: アイドル状態の際に、bRPC クライアントが待機する最大時間。
- 導入バージョン: -
##### brpc_inner_reuse_pool

- デフォルト値: true
- 型: boolean
- 単位: -
- 変更可能か: No
- 説明: 基盤となるBRPCクライアントが、接続/チャネルのために内部の共有再利用プールを使用するかどうかを制御します。 StarRocks は、RpcClientOptions を構築する際に（`rpcOptions.setInnerResuePool(...)` を介して）BrpcProxy で `brpc_inner_reuse_pool` を読み取ります。有効（true）にすると、RPCクライアントは内部プールを再利用して、呼び出しごとの接続作成を減らし、FE と BE 間、または LakeService RPC の接続のチャーン、メモリ、およびファイル記述子の使用量を削減します。無効（false）にすると、クライアントはより分離されたプールを作成する可能性があります（リソース使用量の増加を犠牲にして、同時実行の分離を高めます）。この値を変更するには、プロセスを再起動して有効にする必要があります。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0
##### brpc_min_evictable_idle_time_ms

- デフォルト値: 120000
- タイプ: Int
- 単位: ミリ秒
- 変更可能か: いいえ
- 説明: アイドル状態のBRPC接続が、接続プール内で削除対象となるまでの最小待機時間（ミリ秒）。 `BrpcProxy` が使用する RpcClientOptions に適用されます (RpcClientOptions.setMinEvictableIdleTime 経由)。この値を大きくすると、アイドル状態の接続がより長く維持され（再接続のチャーンを削減）、小さくすると、未使用のソケットがより早く解放されます（リソース使用量を削減）。接続の再利用、プールの増加、および削除の動作のバランスを取るために、 `brpc_connection_pool_size` および `brpc_idle_wait_max_time` と共に調整してください。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0
##### brpc_reuse_addr

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: trueの場合、StarRocks はソケットオプションを設定して、brpc RpcClient (RpcClientOptions.setReuseAddress 経由) によって作成されたクライアントソケットのローカルアドレスの再利用を許可します。 これを有効にすると、バインドの失敗が減少し、ソケットが閉じられた後、ローカルポートの再バインドが高速化されます。これは、高レートの接続チャーンや迅速な再起動に役立ちます。 falseの場合、アドレス/ポートの再利用は無効になり、意図しないポート共有の可能性を減らすことができますが、一時的なバインドエラーが増加する可能性があります。 このオプションは、クライアントソケットの再バインドと再利用の速度に影響するため、`brpc_connection_pool_size` および `brpc_short_connection` によって構成された接続動作と相互作用します。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0
##### cluster_name

- デフォルト値: StarRocks Cluster
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: FE が属する StarRocks クラスタの名前。クラスタ名は、Web ページの `Title` に表示されます。
- 導入: -
##### dns_cache_ttl_seconds

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: DNSルックアップが成功した場合のDNSキャッシュのTTL（Time-To-Live、生存時間）を秒単位で指定します。これは、JVMがDNSルックアップの結果をキャッシュする時間を制御するJavaのセキュリティプロパティ `networkaddress.cache.ttl` を設定します。この項目を `-1` に設定すると、システムは常に情報をキャッシュし、 `0` に設定するとキャッシュを無効にします。これは、Kubernetes デプロイメントや動的DNSの使用など、IPアドレスが頻繁に変更される環境で特に役立ちます。
- 導入バージョン: v3.5.11, v4.0.4
##### enable_http_async_handler

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: システムがHTTPリクエストを非同期で処理できるようにするかどうかを指定します。 この機能を有効にすると、Netty workerスレッドが受信したHTTPリクエストは、HTTPサーバーのブロックを回避するために、サービスロジック処理用の別のスレッドプールに送信されます。 無効にすると、Netty workerがサービスロジックを処理します。
- 導入バージョン: 4.0.0
##### enable_http_validate_headers

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: No
- 説明: Netty の HttpServerCodec が厳密な HTTP ヘッダーの検証を実行するかどうかを制御します。この値は、`HttpServer` で HTTP パイプラインが初期化される際に HttpServerCodec に渡されます (UseLocations を参照)。新しい Netty バージョンでは、より厳密なヘッダー規則が適用されるため (https://github.com/netty/netty/pull/12760 )、下位互換性のためにデフォルトは false です。RFC 準拠のヘッダーチェックを適用するには、true に設定します。これにより、レガシークライアントまたはプロキシからの不正なリクエストや非準拠のリクエストが拒否される可能性があります。変更を有効にするには、HTTP サーバーの再起動が必要です。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0
##### enable_https

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: FE ノードで HTTP サーバーと並行して HTTPS サーバーを有効にするかどうか。
- 導入バージョン: v4.0
##### frontend_address

- デフォルト値: 0.0.0.0
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: FE ノードの IP アドレス。
- 導入: -
##### http_async_threads_num

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能か: はい
- 説明: 非同期HTTPリクエスト処理用のスレッドプールのサイズ。エイリアスは `max_http_sql_service_task_threads_num` です。
- 導入バージョン: 4.0.0
##### http_backlog_num

- デフォルト値: 1024
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: FE ノードの HTTP サーバーによって保持されるバックログキューの長さ。
- 導入: -
##### http_max_chunk_size

- デフォルト値: 8192
- タイプ: Int
- 単位: バイト
- 変更可能か: いいえ
- 説明: FE HTTPサーバー内のNettyのHttpServerCodecによって処理される、単一のHTTPチャンクの最大許容サイズ（バイト単位）を設定します。これはHttpServerCodecへの3番目の引数として渡され、チャンク転送またはストリーミングのリクエスト/レスポンス中のチャンクの長さを制限します。受信チャンクがこの値を超えると、Nettyはフレームサイズ超過エラー（例：TooLongFrameException）を発生させ、リクエストが拒否される可能性があります。正当な大きなチャンクのアップロードのためにこの値を大きくしてください。メモリ負荷とDoS攻撃の表面積を減らすために、小さく保ってください。この設定は、`http_max_initial_line_length`、`http_max_header_size`、および`enable_http_validate_headers`とともに使用されます。
- 導入バージョン: v3.2.0
##### http_max_header_size

- デフォルト: 32768
- タイプ: Int
- 単位: バイト
- 変更可能か: いいえ
- 説明: Netty の `HttpServerCodec` によって解析される HTTP リクエストヘッダーブロックで許可される最大サイズ（バイト単位）。 StarRocks はこの値を `HttpServerCodec` に（`Config.http_max_header_size` として）渡します。受信リクエストのヘッダー（名前と値の組み合わせ）がこの制限を超えると、コーデックはリクエストを拒否し（デコーダー例外）、接続/リクエストは失敗します。クライアントが正当に非常に大きなヘッダー（大きな Cookie または多数のカスタムヘッダー）を送信する場合にのみ増やしてください。値を大きくすると、接続ごとのメモリ使用量が増加します。 `http_max_initial_line_length` および `http_max_chunk_size` と組み合わせて調整してください。変更には FE の再起動が必要です。
- 導入バージョン: v3.2.0
##### http_max_initial_line_length

- デフォルト値: 4096
- タイプ: Int
- 単位: バイト
- 変更可能か: いいえ
- 説明: HttpServer で使用される Netty の `HttpServerCodec` によって受け入れられる、HTTP 初期リクエスト行（メソッド + リクエストターゲット + HTTP バージョン）の最大許容長（バイト単位）を設定します。この値は Netty のデコーダーに渡され、初期行がこれより長いリクエストは拒否されます (TooLongFrameException)。非常に長いリクエスト URI をサポートする必要がある場合にのみ、この値を大きくしてください。値を大きくすると、メモリ使用量が増加し、不正な形式のリクエストやリクエストの悪用に対する脆弱性が高まる可能性があります。`http_max_header_size` および `http_max_chunk_size` と合わせて調整してください。
- 導入バージョン: v3.2.0
##### http_port

- デフォルト値: 8030
- タイプ: Int
- 単位: -
- 変更可能かどうか: いいえ
- 説明: FE ノード内の HTTP サーバーがリッスンするポート。
- 導入: -
##### http_web_page_display_hardware

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: trueの場合、HTTPインデックスページ（/index）に、oshiライブラリを介して入力されたハードウェア情報セクション（CPU、メモリ、プロセス、ディスク、ファイルシステム、ネットワークなど）が含まれます。oshiは、システムユーティリティを呼び出したり、システムファイルを間接的に読み取ったりする場合があります（たとえば、`getent passwd`などのコマンドを実行できます）。これにより、機密性の高いシステムデータが表面化する可能性があります。より厳格なセキュリティが必要な場合、またはホスト上でこれらの間接的なコマンドの実行を回避したい場合は、この構成をfalseに設定して、Web UIでのハードウェア詳細の収集と表示を無効にします。
- 導入バージョン: v3.2.0
##### http_worker_threads_num

- デフォルト: 0
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: HTTPリクエストを処理するために、HTTPサーバーが使用するワーカースレッドの数。 負の値または0の場合、スレッド数はCPUコア数の2倍になります。
- 導入バージョン: v2.5.18, v3.0.10, v3.1.7, v3.2.2
##### https_port

- デフォルト値: 8443
- タイプ: Int
- 単位: -
- 変更可能かどうか: いいえ
- 説明: FE ノードの HTTPS サーバーがリッスンするポート。
- 導入バージョン: v4.0
##### max_mysql_service_task_threads_num

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: FE ノード内の MySQL サーバーがタスクを処理するために実行できるスレッドの最大数。
- 導入バージョン: -
##### max_task_runs_threads_num

- デフォルト値: 512
- タイプ: Int
- 単位: スレッド
- 変更可能か: いいえ
- 説明: タスク実行executorスレッドプール内の最大スレッド数を制御します。この値は、同時タスク実行の上限です。この値を大きくすると並行性が向上しますが、CPU、メモリ、ネットワークの使用量も増加します。一方、この値を小さくすると、タスクのバックログが発生し、レイテンシが高くなる可能性があります。予想される同時実行スケジュールジョブと利用可能なシステムリソースに応じて、この値を調整してください。
- 導入バージョン: v3.2.0
##### memory_tracker_enable

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: FE のメモリトラッカーサブシステムを有効にします。 `memory_tracker_enable` が `true` に設定されている場合、 `MemoryUsageTracker` は登録されたメタデータモジュールを定期的にスキャンし、インメモリの `MemoryUsageTracker.MEMORY_USAGE` マップを更新し、合計をログに記録し、 `MetricRepo` がメトリクス出力でメモリ使用量とオブジェクト数のゲージを公開するようにします。サンプリング間隔を制御するには、 `memory_tracker_interval_seconds` を使用します。この機能を有効にすると、メモリ消費の監視とデバッグに役立ちますが、CPU と I/O のオーバーヘッド、および追加のメトリックカーディナリティが発生します。
- 導入バージョン: v3.2.4
##### memory_tracker_interval_seconds

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: FE の `MemoryUsageTracker` デーモンが FE プロセスと登録された `MemoryTrackable` モジュールのメモリ使用量をポーリングして記録する間隔（秒単位）。 `memory_tracker_enable` が `true` に設定されている場合、トラッカーはこの間隔で実行され、 `MEMORY_USAGE` を更新し、集計された JVM と追跡対象モジュールの使用状況をログに記録します。
- 導入バージョン: v3.2.4
##### mysql_nio_backlog_num

- デフォルト値: 1024
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: FE ノード内の MySQL サーバーによって保持されるバックログキューの長さ。
- 導入: -
##### mysql_server_version

- デフォルト値: 8.0.33
- タイプ: String
- 単位: -
- 変更可能か: Yes
- 説明: クライアントに返される MySQL サーバーのバージョンです。このパラメータを変更すると、以下の状況におけるバージョン情報に影響します。
  1. `select version();`
  2. ハンドシェイクパケットのバージョン
  3. グローバル変数 `version` の値 (`show variables like 'version';`)
- 導入バージョン: -
##### mysql_service_io_threads_num

- デフォルト値: 4
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノード内の MySQL サーバーが I/O イベントを処理するために実行できるスレッドの最大数。
- 導入: -
##### mysql_service_kill_after_disconnect

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能: No
- 説明: MySQL の TCP 接続が閉じられた（読み取り時に EOF）ことを検出した際に、サーバーがセッションをどのように処理するかを制御します。 `true` に設定すると、サーバーはその接続で実行中のクエリを直ちに強制終了し、即座にクリーンアップを実行します。 `false` の場合、サーバーは切断時に実行中のクエリを強制終了せず、保留中のリクエストタスクがない場合にのみクリーンアップを実行し、クライアントが切断された後も長時間実行されるクエリが続行できるようにします。 注: TCP keep-alive を示唆する短いコメントがありますが、このパラメータは特に切断後の強制終了動作を制御し、孤立したクエリを終了させるか（信頼性の低い/ロードバランシングされたクライアントの背後で推奨）、完了させるかを決定して設定する必要があります。
- 導入: -
##### mysql_service_nio_enable_keep_alive

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: MySQL接続に対してTCP Keep-Aliveを有効にします。ロードバランサーの背後にある長時間アイドル状態の接続に役立ちます。
- 導入バージョン: -
##### net_use_ipv6_when_priority_networks_empty

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: No
- 説明: `priority_networks` が指定されていない場合に、IPv6 アドレスを優先的に使用するかどうかを制御するブール値です。 `true` は、ノードをホストするサーバーが IPv4 と IPv6 の両方のアドレスを持ち、`priority_networks` が指定されていない場合に、システムが IPv6 アドレスを優先的に使用することを許可することを示します。
- 導入バージョン: v3.3.0
##### priority_networks

- デフォルト値: 空の文字列
- 型: String
- 単位: -
- 変更可能か: いいえ
- 説明: 複数のIPアドレスを持つサーバーの選択戦略を宣言します。 このパラメータで指定されたリストに一致するIPアドレスは、最大で1つでなければならないことに注意してください。 このパラメータの値は、10.10.10.0/24のように、CIDR表記でセミコロン（;）で区切られたエントリで構成されるリストです。 このリストのエントリに一致するIPアドレスがない場合、サーバーの利用可能なIPアドレスがランダムに選択されます。 v3.3.0以降、StarRocks は IPv6 に基づくデプロイをサポートしています。 サーバーが IPv4 と IPv6 の両方のアドレスを持ち、このパラメータが指定されていない場合、システムはデフォルトで IPv4 アドレスを使用します。 `net_use_ipv6_when_priority_networks_empty` を `true` に設定することで、この動作を変更できます。
- 導入バージョン: -
##### proc_profile_cpu_enable

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: この項目が `true` に設定されている場合、バックグラウンドの `ProcProfileCollector` は `AsyncProfiler` を使用して CPU プロファイルを収集し、HTML レポートを `sys_log_dir/proc_profile` に書き込みます。各収集の実行では、`proc_profile_collect_time_s` で設定された期間 CPU スタックを記録し、Java スタックの深さには `proc_profile_jstack_depth` を使用します。生成されたプロファイルは圧縮され、古いファイルは `proc_profile_file_retained_days` および `proc_profile_file_retained_size_bytes` に従って削除されます。`AsyncProfiler` にはネイティブライブラリ（`libasyncProfiler.so`）が必要です。`one.profiler.extractPath` は `/tmp` での noexec の問題を回避するために `STARROCKS_HOME_DIR/bin` に設定されています。
- 導入バージョン: v3.2.12
##### qe_max_connection

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: すべてのユーザーが FE ノードに確立できる接続の最大数。v3.1.12 および v3.2.7 以降、デフォルト値は `1024` から `4096` に変更されました。
- 導入バージョン: -
##### query_port

- デフォルト値: 9030
- タイプ: Int
- 単位: -
- 変更可能かどうか: いいえ
- 説明: FE ノード内の MySQL サーバーがリッスンするポート。
- 導入: -
##### rpc_port

- デフォルト: 9020
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノード内の Thrift サーバーがリッスンするポート。
- 導入: -
##### slow_lock_stack_trace_reserve_levels

- デフォルト値: 15
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: StarRocks が低速または保留中のロックに関するロックデバッグ情報をダンプする際に、キャプチャおよび出力されるスタックトレースフレームの数を制御します。この値は、排他ロックの所有者、現在のスレッド、および最古/共有のリーダーに対してJSONを生成する際に、`QueryableReentrantReadWriteLock` によって `LogUtil.getStackTraceToJsonArray` に渡されます。この値を大きくすると、JSONペイロードが大きくなり、スタックキャプチャのCPU/メモリがわずかに増加しますが、低速ロックまたはデッドロックの問題を診断するためのコンテキストが増えます。値を小さくすると、オーバーヘッドが軽減されます。注: リーダーエントリは、低速ロックのみをログに記録する場合、`slow_lock_threshold_ms` でフィルタリングできます。
- 導入バージョン: v3.4.0, v3.5.0
##### ssl_cipher_blacklist

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: カンマ区切りのリスト。IANA名でSSL暗号スイートをブラックリストに登録するための正規表現をサポートします。ホワイトリストとブラックリストの両方が設定されている場合、ブラックリストが優先されます。
- 導入バージョン: v4.0
##### ssl_cipher_whitelist

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: カンマ区切りのリスト。IANA名でSSL暗号スイートをホワイトリストに登録するための正規表現をサポートします。ホワイトリストとブラックリストの両方が設定されている場合、ブラックリストが優先されます。
- 導入: v4.0
##### task_runs_concurrency

- デフォルト値: 4
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 同時実行される TaskRun インスタンスのグローバル制限です。 `TaskRunScheduler` は、現在の実行数が `task_runs_concurrency` 以上の場合、新しい実行のスケジュールを停止します。したがって、この値はスケジューラ全体での TaskRun の並列実行を制限します。また、TaskRun ごとのパーティションリフレッシュの粒度を計算するために `MVPCTRefreshPartitioner` によっても使用されます。値を大きくすると、並列性とリソース使用量が増加します。値を小さくすると、同時実行性が低下し、実行ごとのパーティションリフレッシュが大きくなります。スケジューリングを意図的に無効にしない限り、0 または負に設定しないでください。0（または負）にすると、`TaskRunScheduler` による新しい TaskRun のスケジュールが効果的に防止されます。
- 導入バージョン: v3.2.0
##### task_runs_queue_length

- デフォルト値: 500
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 保留キューに保持される、保留中の TaskRun アイテムの最大数を制限します。`TaskRunManager` は現在の保留数をチェックし、有効な保留中の TaskRun 数が `task_runs_queue_length` 以上の場合、新しいサブミッションを拒否します。マージ/承認された TaskRun が追加される前にも、同じ制限が再チェックされます。この値を調整して、メモリとスケジューリングのバックログのバランスを取ります。拒否を避けるために、大規模なバースト的なワークロードの場合は高く設定し、メモリを制限して保留中のバックログを減らすには低く設定します。
- 導入バージョン: v3.2.0
##### thrift_backlog_num

- デフォルト値: 1024
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: FE ノード内の Thrift サーバーによって保持されるバックログキューの長さ。
- 導入: -
##### thrift_client_timeout_ms

- デフォルト値: 5000
- タイプ: Int
- 単位: ミリ秒
- 変更可能か: いいえ
- 説明: アイドル状態のクライアント接続がタイムアウトするまでの時間。
- 導入: -
##### thrift_rpc_max_body_size

- デフォルト値: -1
- タイプ: Int
- 単位: Bytes
- 変更可能か: No
- 説明: サーバーのThriftプロトコルを構築する際に使用される、許可されるThrift RPCメッセージボディの最大サイズ（バイト単位）を制御します（`ThriftServer` で `TBinaryProtocol.Factory` に渡されます）。 `-1` の値は制限を無効にします（無制限）。正の値を設定すると上限が適用され、これより大きいメッセージはThriftレイヤーによって拒否されます。これにより、メモリ使用量を制限し、サイズの大きいリクエストやDoSのリスクを軽減できます。正当なリクエストが拒否されないように、予想されるペイロード（大きな構造体やバッチデータ）に対して十分に大きなサイズに設定してください。
- 導入バージョン: v3.2.0
##### thrift_server_max_worker_threads

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE ノードの Thrift サーバーでサポートされるワーカースレッドの最大数。
- 導入バージョン: -
##### thrift_server_queue_size

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: リクエストが保留されているキューの長さ。 thrift サーバーで処理されているスレッド数が `thrift_server_max_worker_threads` で指定された値を超えると、新しいリクエストが保留キューに追加されます。
- 導入バージョン: -
### メタデータとクラスタ管理
##### alter_max_worker_queue_size

- デフォルト値: 4096
- タイプ: Int
- 単位: Tasks
- 変更可能か: No
- 説明: alterサブシステムで使用される内部ワーカースレッドプールキューの容量を制御します。これは、`AlterHandler`の`ThreadPoolManager.newDaemonCacheThreadPool`に`alter_max_worker_threads`とともに渡されます。保留中のalterタスクの数が`alter_max_worker_queue_size`を超えると、新しいサブミッションは拒否され、`RejectedExecutionException`がスローされる可能性があります（`AlterHandler.handleFinishAlterTask`を参照）。この値を調整して、メモリ使用量と、同時実行alterタスクに許可するバックログの量を調整します。
- 導入バージョン: v3.2.0
##### alter_max_worker_threads

- デフォルト値: 4
- タイプ: Int
- 単位: スレッド
- 変更可能か: No
- 説明: AlterHandler のスレッドプールにおけるワーカースレッドの最大数を設定します。AlterHandler は、この値で executor を構築し、alter 関連のタスク（例えば、`AlterReplicaTask` を handleFinishAlterTask 経由で送信するなど）を実行および完了します。この値は、alter 操作の同時実行数を制限します。値を上げると並行性とリソース使用量が増加し、下げると同時実行される alter の数が制限され、ボトルネックになる可能性があります。executor は `alter_max_worker_queue_size` と共に作成され、ハンドラースケジューリングは `alter_scheduler_interval_millisecond` を使用します。
- 導入バージョン: v3.2.0
##### automated_cluster_snapshot_interval_seconds

- デフォルト値: 600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 自動クラスタースナップショットタスクがトリガーされる間隔。
- 導入バージョン: v3.4.2
##### background_refresh_metadata_interval_millis

- デフォルト値: 600000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: 連続する2回の Hive メタデータキャッシュのリフレッシュ間隔。
- 導入バージョン: v2.5.5
##### background_refresh_metadata_time_secs_since_last_access_secs

- デフォルト値: 3600 * 24
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: Hive メタデータキャッシュのリフレッシュタスクの有効期限です。アクセスされた Hive catalog について、指定された時間以上アクセスされない場合、StarRocks はキャッシュされたメタデータのリフレッシュを停止します。アクセスされていない Hive catalog については、StarRocks はキャッシュされたメタデータのリフレッシュを行いません。
- 導入バージョン: v2.5.5
##### bdbje_cleaner_threads

- デフォルト値: 1
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: StarRocks ジャーナルで使用される Berkeley DB Java Edition (JE) 環境のバックグラウンドクリーナースレッドの数。この値は、`BDBEnvironment.initConfigs` の環境初期化中に読み取られ、`Config.bdbje_cleaner_threads` を使用して `EnvironmentConfig.CLEANER_THREADS` に適用されます。これは、JE ログのクリーンアップと領域再利用の並行性を制御します。値を大きくすると、フォアグラウンド操作との CPU および I/O 干渉が増加しますが、クリーンアップを高速化できます。変更は、BDB 環境が（再）初期化された場合にのみ有効になるため、新しい値を適用するには frontend の再起動が必要です。
- 導入バージョン: v3.2.0
##### bdbje_heartbeat_timeout_second

- デフォルト値: 30
- タイプ: Int
- 単位: 秒
- 変更可能か: いいえ
- 説明: StarRocks クラスタ内の leader 、 follower 、 observer FE 間のハートビートがタイムアウトするまでの時間。
- 導入: -
##### bdbje_lock_timeout_second

- デフォルト: 1
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: BDB JEベースのFEにおけるロックがタイムアウトするまでの時間。
- 導入: -
##### bdbje_replay_cost_percent

- デフォルト: 150
- タイプ: Int
- 単位: パーセント
- 変更可能: いいえ
- 説明: BDB JE ログからトランザクションをリプレイするコストを、（パーセントで）ネットワーク経由でのリストアと比較して設定します。この値は、基盤となる JE レプリケーションパラメータ `REPLAY_COST_PERCENT` に提供され、通常は 100 より大きく、リプレイの方がネットワークリストアよりもコストがかかることを示します。潜在的なリプレイのためにクリーンアップされたログファイルを保持するかどうかを決定する際、システムはリプレイコストにログサイズを掛けたものと、ネットワークリストアのコストを比較します。ネットワークリストアの方が効率的であると判断された場合、ファイルは削除されます。値が 0 の場合、このコスト比較に基づく保持は無効になります。`REP_STREAM_TIMEOUT` 内のレプリカに必要なログファイル、またはアクティブなレプリケーションに必要なログファイルは常に保持されます。
- 導入バージョン: v3.2.0
##### bdbje_replica_ack_timeout_second

- デフォルト値: 10
- タイプ: Int
- 単位: 秒
- 変更可能か: いいえ
- 説明: メタデータが leader FE から follower FE に書き込まれる際に、指定された数の follower FE からの ACK メッセージを leader FE が待機できる最大時間。単位は秒です。大量のメタデータが書き込まれる場合、follower FE が ACK メッセージを leader FE に返すまでに長い時間がかかり、ACK タイムアウトが発生します。この状況では、メタデータの書き込みが失敗し、FE プロセスが終了します。この状況を防ぐために、このパラメータの値を大きくすることをお勧めします。
- 導入バージョン: -
##### bdbje_reserved_disk_size

- デフォルト値: 512 * 1024 * 1024 (536870912)
- タイプ: Long
- 単位: バイト
- 変更可否: 不可
- 説明: Berkeley DB JE が「保護されていない」（削除可能な）ログ/データファイルとして予約するバイト数を制限します。 StarRocks はこの値を `BDBEnvironment` の `EnvironmentConfig.RESERVED_DISK` を介して JE に渡します。 JE の組み込みのデフォルトは 0 (無制限) です。 StarRocks のデフォルト (512 MiB) は、JE が保護されていないファイルのために過剰なディスク容量を予約するのを防ぎ、古いファイルの安全なクリーンアップを可能にします。 ディスク容量が限られているシステムでは、この値を調整してください。値を小さくすると、JE はより多くのファイルをより早く解放でき、値を大きくすると、JE はより多くの予約領域を保持できます。変更を有効にするには、プロセスを再起動する必要があります。
- 導入バージョン: v3.2.0
##### bdbje_reset_election_group

- デフォルト値: false
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: BDBJEレプリケーション グループをリセットするかどうか。このパラメータが `TRUE` に設定されている場合、FEはBDBJEレプリケーション グループをリセットし (つまり、選択可能なすべてのFEノードの情報を削除し)、leader FEとして起動します。リセット後、このFEはクラスタ内の唯一のメンバーとなり、他のFEは `ALTER SYSTEM ADD/DROP FOLLOWER/OBSERVER 'xxx'` を使用してこのクラスタに再参加できます。この設定は、ほとんどのfollower FEのデータが破損したためにleader FEを選出できない場合にのみ使用してください。`reset_election_group` は `metadata_failure_recovery` の代わりに使用されます。
- 導入: -
##### black_host_connect_failures_within_time

- デフォルト値: 5
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: ブラックリストに登録されたBEノードで許可される接続失敗の閾値。 BEノードがBEブラックリストに自動的に追加された場合、StarRocks はその接続性を評価し、BEブラックリストから削除できるかどうかを判断します。 `black_host_history_sec` 内で、ブラックリストに登録されたBEノードの接続失敗回数が `black_host_connect_failures_within_time` で設定された閾値よりも少ない場合にのみ、BEブラックリストから削除できます。
- 導入バージョン: v3.3.0
##### black_host_history_sec

- デフォルト値: 2 * 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: BE ブラックリスト内の BE ノードの過去の接続失敗を保持する時間。 BE ノードが BE ブラックリストに自動的に追加された場合、StarRocks はその接続性を評価し、BE ブラックリストから削除できるかどうかを判断します。 `black_host_history_sec` 内で、ブラックリストに登録された BE ノードの接続失敗回数が `black_host_connect_failures_within_time` で設定されたしきい値よりも少ない場合にのみ、BE ブラックリストから削除できます。
- 導入バージョン: v3.3.0
##### brpc_connection_pool_size

- デフォルト値: 16
- タイプ: Int
- 単位: コネクション数
- 変更可能か: いいえ
- 説明: FE の BrpcProxy が使用する、エンドポイントごとのプールされた BRPC コネクションの最大数。この値は `setMaxTotoal` および `setMaxIdleSize` を介して RpcClientOptions に適用されるため、各リクエストはプールからコネクションを借りる必要があるため、同時発信 BRPC リクエストを直接制限します。同時実行性の高いシナリオでは、リクエストのキューイングを避けるためにこの値を増やしてください。値を増やすと、ソケットとメモリの使用量が増加し、リモートサーバーの負荷が増加する可能性があります。チューニングする際は、`brpc_idle_wait_max_time`、`brpc_short_connection`、`brpc_inner_reuse_pool`、`brpc_reuse_addr`、`brpc_min_evictable_idle_time_ms` などの関連設定を検討してください。この値を変更してもホットリロードはできず、再起動が必要です。
- 導入バージョン: v3.2.0
##### brpc_short_connection

- デフォルト値: false
- タイプ: boolean
- 単位: -
- 変更可能か: いいえ
- 説明: 基盤となるbrpcのRpcClientが短命な接続を使用するかどうかを制御します。有効 (`true`) にすると、RpcClientOptions.setShortConnectionが設定され、リクエスト完了後に接続が閉じられます。これにより、接続設定のオーバーヘッドが増加し、レイテンシーが増加する代わりに、長寿命のソケットの数が削減されます。無効 (`false`、デフォルト) にすると、永続的な接続と接続プーリングが使用されます。このオプションを有効にすると、接続プール動作に影響するため、`brpc_connection_pool_size`、`brpc_idle_wait_max_time`、`brpc_min_evictable_idle_time_ms`、`brpc_reuse_addr`、および`brpc_inner_reuse_pool`と合わせて検討する必要があります。一般的な高スループットのデプロイメントでは無効のままにしておきます。ソケットの寿命を制限する場合、またはネットワークポリシーで短期間の接続が必要な場合にのみ有効にします。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0
##### catalog_try_lock_timeout_ms

- デフォルト値: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能か: はい
- 説明: グローバルロックを取得するためのタイムアウト時間。
- 導入バージョン: -
##### checkpoint_only_on_leader

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: `true` の場合、CheckpointController は leader FE のみをチェックポイントワーカーとして選択します。`false` の場合、コントローラーは任意の frontend を選択でき、ヒープ使用率が低いノードを優先します。`false` の場合、ワーカーは最近の失敗時間と `heapUsedPercent` (leader は選択を避けるために無限の使用量として扱われます) でソートされます。クラスタースナップショットメタデータを必要とする操作の場合、コントローラーはこのフラグに関係なく、すでに leader の選択を強制しています。`true` を有効にすると、チェックポイントの作業が leader に集中します (よりシンプルですが、leader の CPU/メモリとネットワーク負荷が増加します)。`false` のままにすると、チェックポイントの負荷が負荷の少ない FE に分散されます。この設定は、ワーカーの選択と、`checkpoint_timeout_seconds` などのタイムアウトや、`thrift_rpc_timeout_ms` などの RPC 設定との相互作用に影響します。
- 導入バージョン: v3.4.0, v3.5.0
##### checkpoint_timeout_seconds

- デフォルト値: 24 * 3600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: leader の CheckpointController がチェックポイントワーカーがチェックポイントを完了するのを待つ最大時間（秒単位）。コントローラはこの値をナノ秒に変換し、ワーカーの結果キューをポーリングします。このタイムアウト内に正常な完了が受信されない場合、チェックポイントは失敗として扱われ、createImage は失敗を返します。この値を大きくすると、実行時間の長いチェックポイントに対応できますが、障害検出とそれに続くイメージの伝播が遅れます。値を小さくすると、より迅速なフェイルオーバー/再試行が可能になりますが、低速なワーカーに対して誤ったタイムアウトが発生する可能性があります。この設定は、チェックポイントの作成中の `CheckpointController` での待機期間のみを制御し、ワーカーの内部チェックポイントの動作は変更しません。
- 導入バージョン: v3.4.0, v3.5.0
##### db_used_data_quota_update_interval_secs

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: データベースの使用済みデータクォータが更新される間隔。 StarRocks は、ストレージ消費量を追跡するために、すべてのデータベースの使用済みデータクォータを定期的に更新します。この値は、クォータの適用とメトリクスの収集に使用されます。システム負荷の過剰を防ぐため、許可される最小間隔は 30 秒です。 30 未満の値は拒否されます。
- 導入: -
##### drop_backend_after_decommission

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: BE の廃止後に BE を削除するかどうか。 `TRUE` は、BE が廃止された直後に削除されることを示します。 `FALSE` は、BE が廃止された後に削除されないことを示します。
- 導入: -
##### edit_log_port

- デフォルト値: 9010
- タイプ: Int
- 単位: -
- 変更可能かどうか: いいえ
- 説明: クラスタ内の Leader 、 Follower 、 Observer FE 間の通信に使用されるポートです。
- 導入バージョン: -
##### edit_log_roll_num

- デフォルト値: 50000
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: メタデータログエントリがログファイルに書き込まれる前に書き込むことができる、メタデータログエントリの最大数。このパラメータは、ログファイルのサイズを制御するために使用されます。新しいログファイルはBDBJEデータベースに書き込まれます。
- 導入バージョン: -
##### edit_log_type

- デフォルト: BDB
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: 生成できるエディットログのタイプ。値を `BDB` に設定します。
- 導入: -
##### enable_background_refresh_connector_metadata

- デフォルト値: v3.0 以降では true 、v2.5 では false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: Hive メタデータキャッシュの定期的なリフレッシュを有効にするかどうか。 有効にすると、StarRocks は Hive クラスタのメタストア (Hive Metastore または AWS Glue) をポーリングし、頻繁にアクセスされる Hive catalog のキャッシュされたメタデータをリフレッシュして、データの変更を認識します。 `true` は Hive メタデータキャッシュのリフレッシュを有効にすることを示し、 `false` は無効にすることを示します。
- 導入バージョン: v2.5.5
##### enable_collect_query_detail_info

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: クエリのプロファイルを収集するかどうか。このパラメータが `TRUE` に設定されている場合、システムはクエリのプロファイルを収集します。このパラメータが `FALSE` に設定されている場合、システムはクエリのプロファイルを収集しません。
- 導入: -
##### enable_create_partial_partition_in_batch

- デフォルト値: false
- 型: boolean
- 単位: -
- 変更可能か: Yes
- 説明: この項目が `false` (デフォルト) に設定されている場合、StarRocks は、バッチで作成されたレンジパーティションが標準の時間単位の境界に揃うように強制します。ギャップの作成を避けるために、非整列の範囲は拒否されます。この項目を `true` に設定すると、その整列チェックが無効になり、部分的な (非標準の) パーティションをバッチで作成できるようになります。これにより、ギャップや誤ったパーティション範囲が生じる可能性があります。部分的なバッチパーティションが意図的に必要な場合、および関連するリスクを受け入れる場合にのみ、`true` に設定する必要があります。
- 導入バージョン: v3.2.0
##### enable_internal_sql

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: この項目が `true` に設定されている場合、内部コンポーネント (例えば、SimpleExecutor) によって実行される内部 SQL ステートメントは保持され、内部監査またはログメッセージに書き込まれます (また、`enable_sql_desensitize_in_log` が設定されている場合は、さらに非公開化できます)。`false` に設定されている場合、内部 SQL テキストは抑制されます。フォーマットコード (SimpleExecutor.formatSQL) は "?" を返し、実際のステートメントは内部監査またはログメッセージに出力されません。この構成は、内部ステートメントの実行セマンティクスを変更するものではなく、プライバシーまたはセキュリティのために内部 SQL のロギングと可視性を制御するだけです。
- 導入バージョン: -
##### enable_legacy_compatibility_for_replication

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: レプリケーションのために Legacy Compatibility を有効にするかどうかを指定します。 StarRocks は古いバージョンと新しいバージョンで動作が異なる場合があり、クロス クラスタ間でのデータ移行時に問題が発生する可能性があります。したがって、データ移行を行う前にターゲット クラスタで Legacy Compatibility を有効にし、データ移行が完了したら無効にする必要があります。 `true` は、このモードを有効にすることを示します。
- 導入バージョン: v3.1.10, v3.2.6
##### enable_show_materialized_views_include_all_task_runs

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: `SHOW MATERIALIZED VIEWS` コマンドに TaskRun がどのように返されるかを制御します。この項目が `false` に設定されている場合、StarRocks はタスクごとに最新の TaskRun のみを返します (互換性のためのレガシーな動作)。`true` (デフォルト) に設定されている場合、`TaskManager` は、同じ開始 TaskRun ID を共有する場合 (例えば、同じジョブに属する場合) にのみ、同じタスクの追加の TaskRun を含めることがあります。これにより、無関係な重複実行が表示されるのを防ぎながら、1 つのジョブに関連付けられた複数のステータスを表示できます。この項目を `false` に設定すると、単一の実行出力を復元したり、デバッグと監視のために複数実行ジョブの履歴を表示したりできます。
- 導入: v3.3.0, v3.4.0, v3.5.0
##### enable_statistics_collect_profile

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 統計クエリのプロファイルを生成するかどうか。この項目を `true` に設定すると、StarRocks がシステム統計に関するクエリのクエリプロファイルを生成できるようになります。
- 導入: v3.1.5
##### enable_table_name_case_insensitive

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: catalog 名、データベース名、テーブル名、ビュー名、およびマテリアライズドビュー名の大文字と小文字を区別しない処理を有効にするかどうか。現在、テーブル名は大文字と小文字が区別されるのがデフォルトです。
  - この機能を有効にすると、関連するすべての名前が小文字で保存され、これらの名前を含むすべての SQL コマンドは自動的に小文字に変換されます。
  - この機能は、クラスタの作成時にのみ有効にできます。**クラスタの起動後、この構成の値は、いかなる手段によっても変更できません**。変更しようとするとエラーが発生します。FE は、この構成項目の値がクラスタの初回起動時と一致しないことを検出すると、起動に失敗します。
  - 現在、この機能は JDBC catalog およびテーブル名をサポートしていません。JDBC または ODBC データソースで大文字と小文字を区別しない処理を実行する場合は、この機能を有効にしないでください。
- 導入: v4.0
##### enable_task_history_archive

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 有効にすると、完了したタスク実行レコードは永続的なタスク実行履歴テーブルにアーカイブされ、編集ログに記録されるため、（`lookupHistory`、`lookupHistoryByTaskNames`、`lookupLastJobOfTasks`などの）検索にはアーカイブされた結果が含まれます。アーカイブは FE leader によって実行され、単体テスト中（`FeConstants.runningUnitTest`）はスキップされます。有効にすると、インメモリの有効期限と強制 GC パスはバイパスされるため（コードは `removeExpiredRuns` および `forceGC` から早期に返されます）、保持/削除は `task_runs_ttl_second` および `task_runs_max_history_number` の代わりに永続的なアーカイブによって処理されます。無効にすると、履歴はメモリに残り、これらの構成によってプルーニングされます。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0
##### enable_task_run_fe_evaluation

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 有効にすると、FE はシステムテーブル `task_runs` に対して、`TaskRunsSystemTable.supportFeEvaluation` 内でローカル評価を実行します。 FE 側の評価は、カラムと定数を比較する連言等価述語に対してのみ許可され、カラム `QUERY_ID` と `TASK_NAME` に限定されます。これを有効にすると、広範なスキャンや追加のリモート処理を回避することで、対象を絞ったルックアップのパフォーマンスが向上します。無効にすると、プランナーは `task_runs` の FE 評価をスキップするため、述語のプルーニングが減少し、それらのフィルターのクエリレイテンシーに影響を与える可能性があります。
- 導入バージョン: v3.3.13, v3.4.3, v3.5.0
##### heartbeat_mgr_blocking_queue_size

- デフォルト値: 1024
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: Heartbeat Managerによって実行されるハートビートタスクを格納するブロッキングキューのサイズ。
- 導入: -
##### heartbeat_mgr_threads_num

- デフォルト値: 8
- タイプ: Int
- 単位: -
- 変更可能か: No
- 説明: Heartbeat Manager が heartbeat タスクを実行するために実行できるスレッド数。
- 導入バージョン: -
##### ignore_materialized_view_error

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: マテリアライズドビューのエラーによって発生するメタデータ例外を FE が無視するかどうか。マテリアライズドビューのエラーによって FE の起動に失敗する場合、このパラメータを `true` に設定すると、FE は例外を無視できます。
- 導入バージョン: v2.5.10
##### ignore_meta_check

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: Leader FE 以外の FE が、Leader FE からのメタデータのギャップを無視するかどうか。 値が TRUE の場合、Leader FE 以外の FE は Leader FE からのメタデータのギャップを無視し、データ読み取りサービスを提供し続けます。 このパラメータは、Leader FE を長期間停止した場合でも、継続的なデータ読み取りサービスを保証します。 値が FALSE の場合、Leader FE 以外の FE は Leader FE からのメタデータのギャップを無視せず、データ読み取りサービスの提供を停止します。
- 導入: -
##### ignore_task_run_history_replay_error

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: StarRocks が `information_schema.task_runs` の TaskRun の履歴行をデシリアライズする際、破損または無効な JSON 行があると、通常、デシリアライズは警告をログに記録し、RuntimeException をスローします。この項目が `true` に設定されている場合、システムはデシリアライズエラーをキャッチし、不正な形式のレコードをスキップし、クエリを失敗させる代わりに残りの行の処理を続行します。これにより、`information_schema.task_runs` クエリは `_statistics_.task_run_history` テーブル内の不正なエントリを許容できるようになります。有効にすると、明示的なエラーを表示する代わりに、破損した履歴レコードがサイレントに削除される（潜在的なデータ損失）ことに注意してください。
- 導入バージョン: v3.3.3, v3.4.0, v3.5.0
##### lock_checker_interval_second

- デフォルト値: 30
- タイプ: long
- 単位: 秒
- 変更可能: はい
- 説明: LockChecker FE デーモン（"deadlock-checker"という名前）の実行間隔（秒単位）。このデーモンは、デッドロックの検出と低速ロックのスキャンを実行します。設定された値に1000を掛けて、タイマーをミリ秒単位で設定します。この値を小さくすると、検出の遅延は減少しますが、スケジューリングとCPUのオーバーヘッドが増加します。大きくすると、オーバーヘッドは減少しますが、検出と低速ロックのレポートが遅れます。デーモンは実行ごとに間隔をリセットするため、変更は実行時に有効になります。この設定は、`lock_checker_enable_deadlock_check`（デッドロックチェックを有効にする）および `slow_lock_threshold_ms`（低速ロックの定義）と連携します。
- 導入バージョン: v3.2.0
##### master_sync_policy

- デフォルト: SYNC
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: leader FE がログをディスクにフラッシュする際のポリシー。このパラメータは、現在の FE が leader FE である場合にのみ有効です。有効な値は次のとおりです。
  - `SYNC`: トランザクションがコミットされると、ログエントリが生成され、同時にディスクにフラッシュされます。
  - `NO_SYNC`: トランザクションがコミットされる際に、ログエントリの生成とフラッシュが同時に行われません。
  - `WRITE_NO_SYNC`: トランザクションがコミットされると、ログエントリは同時に生成されますが、ディスクにはフラッシュされません。

  フォロワーFEを1つだけデプロイしている場合は、このパラメータを `SYNC` に設定することをお勧めします。3つ以上のフォロワーFEをデプロイしている場合は、このパラメータと `replica_sync_policy` の両方を `WRITE_NO_SYNC` に設定することをお勧めします。

- 導入: -
##### max_bdbje_clock_delta_ms

- デフォルト値: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能か: いいえ
- 説明: StarRocks クラスタ内の leader FE と follower FE または observer FE 間で許容される最大のクロックオフセットです。
- 導入バージョン: -
##### meta_delay_toleration_second

- デフォルト値: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: follower FE および observer FE 上のメタデータが、 leader FE 上のメタデータから遅れることのできる最大時間。単位は秒です。この時間を超えると、 leader でない FE はサービスの提供を停止します。
- 導入: -
##### meta_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/meta"
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: メタデータを格納するディレクトリ。
- 導入: -
##### metadata_ignore_unknown_operation_type

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 不明なログIDを無視するかどうか。 FEがロールバックされると、以前のバージョンのFEは一部のログIDを認識できない場合があります。 値が `TRUE` の場合、FEは不明なログIDを無視します。 値が `FALSE` の場合、FEは終了します。
- 導入バージョン: -
##### profile_info_format

- デフォルト値: default
- 型: String
- 単位: -
- 変更可能: Yes
- 説明: システムによって出力される Profile の形式です。有効な値は、`default` と `json` です。`default` に設定すると、Profile はデフォルトの形式になります。`json` に設定すると、システムは Profile を JSON 形式で出力します。
- 導入: v2.5
##### replica_ack_policy

- デフォルト: SIMPLE_MAJORITY
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: ログエントリが有効と見なされるためのポリシー。デフォルト値の `SIMPLE_MAJORITY` は、過半数の follower FE が ACK メッセージを返した場合に、ログエントリが有効と見なされることを指定します。
- 導入: -
##### replica_sync_policy

- デフォルト: SYNC
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: follower FE がログをディスクにフラッシュする際のポリシー。このパラメータは、現在の FE が follower FE である場合にのみ有効です。有効な値:
  - `SYNC`: トランザクションがコミットされると、ログエントリが生成され、同時にディスクにフラッシュされます。
  - `NO_SYNC`: トランザクションがコミットされる際に、ログエントリの生成とフラッシュが同時に行われません。
  - `WRITE_NO_SYNC`: トランザクションがコミットされると、ログエントリは同時に生成されますが、ディスクにはフラッシュされません。
- 導入: -
##### start_with_incomplete_meta

- デフォルト値: false
- タイプ: boolean
- 単位: -
- 変更可能: いいえ
- 説明: trueの場合、イメージデータは存在するが、Berkeley DB JE (BDB) ログファイルがないか破損している場合に、FE は起動を許可します。 `MetaHelper.checkMetaDir()` は、このフラグを使用して、対応する BDB ログなしでイメージから起動するのを防ぐ安全チェックをバイパスします。この方法で起動すると、古いまたは一貫性のないメタデータが生成される可能性があり、緊急リカバリにのみ使用する必要があります。 `RestoreClusterSnapshotMgr` は、クラスタースナップショットを復元する際に、このフラグを一時的に true に設定し、ロールバックします。また、このコンポーネントは、復元中に `bdbje_reset_election_group` を切り替えます。通常操作では有効にしないでください。破損した BDB データからリカバリする場合、またはイメージベースのスナップショットを明示的に復元する場合にのみ有効にしてください。
- 導入バージョン: v3.2.0
##### table_keeper_interval_second

- デフォルト値: 30
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: TableKeeper デーモンの実行間隔（秒単位）。TableKeeperDaemon はこの値（1000倍）を使用して内部タイマーを設定し、履歴テーブルの存在、正しいテーブルプロパティ（レプリケーション数）、およびパーティション TTL の更新を保証する keeper タスクを定期的に実行します。このデーモンは leader ノードでのみ動作し、`table_keeper_interval_second` が変更されると setInterval を介してランタイム間隔を更新します。スケジュール頻度と負荷を減らすには値を大きくし、欠落または古い履歴テーブルへの対応を速めるには値を小さくします。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0
##### task_runs_ttl_second

- デフォルト値: 7 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タスク実行履歴の Time-To-Live (TTL) を制御します。この値を小さくすると、履歴の保持期間が短くなり、メモリ/ディスクの使用量が削減されます。大きくすると、履歴の保持期間が長くなりますが、リソースの使用量が増加します。予測可能な保持とストレージの動作のために、`task_runs_max_history_number` および `enable_task_history_archive` と共に調整してください。
- 導入バージョン: v3.2.0
##### task_ttl_second

- デフォルト: 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タスクのTime-to-live (TTL)。手動タスク（スケジュールが設定されていない場合）、TaskBuilderはこの値を使用してタスクの `expireTime` を計算します（`expireTime = now + task_ttl_second * 1000L`）。TaskRunは、実行のタイムアウトを計算する際に、この値を上限としても使用します。有効な実行タイムアウトは `min(task_runs_timeout_second, task_runs_ttl_second, task_ttl_second)` です。この値を調整すると、手動で作成されたタスクが有効な状態を維持する期間が変わり、タスク実行の最大許容実行時間を間接的に制限できます。
- 導入バージョン: v3.2.0
##### thrift_rpc_retry_times

- デフォルト: 3
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: Thrift RPC コールが試行する合計回数を制御します。この値は、`ThriftRPCRequestExecutor` (および `NodeMgr` や `VariableMgr` などの呼び出し元) によって、再試行のループ回数として使用されます。つまり、値が 3 の場合、最初の試行を含めて最大 3 回の試行が可能です。`TTransportException` が発生した場合、executor は接続を再開し、この回数まで再試行します。原因が `SocketTimeoutException` である場合、または再開に失敗した場合は再試行しません。各試行は、`thrift_rpc_timeout_ms` で設定された試行ごとのタイムアウトに従います。この値を大きくすると、一時的な接続障害に対する耐性が向上しますが、全体的な RPC レイテンシとリソース使用量が増加する可能性があります。
- 導入バージョン: v3.2.0
##### thrift_rpc_strict_mode

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: No
- 説明: Thriftサーバーで使用される TBinaryProtocol の "strict read" モードを制御します。この値は、Thrift サーバースタックの org.apache.thrift.protocol.TBinaryProtocol.Factory への最初の引数として渡され、受信する Thrift メッセージの解析および検証方法に影響します。`true` (デフォルト) の場合、サーバーは厳密な Thrift エンコーディング/バージョンチェックを実施し、設定された `thrift_rpc_max_body_size` の制限を適用します。`false` の場合、サーバーは非 strict (レガシー/寛容) なメッセージ形式を受け入れます。これにより、古いクライアントとの互換性が向上する可能性がありますが、一部のプロトコル検証をバイパスする可能性があります。これは変更不可能であり、相互運用性と解析の安全性に影響するため、実行中のクラスタでこれを変更する場合は注意が必要です。
- 導入バージョン: v3.2.0
##### thrift_rpc_timeout_ms

- デフォルト値: 10000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: Thrift RPC呼び出しのデフォルトネットワーク/ソケットタイムアウトとして使用されるタイムアウト（ミリ秒単位）。これは、フロントエンドおよびバックエンドプールで使用される `ThriftConnectionPool` でThriftクライアントを作成する際にTSocketに渡され、`ConfigBase` 、`LeaderOpExecutor` 、`GlobalStateMgr` 、`NodeMgr` 、`VariableMgr` 、および `CheckpointWorker` などの場所でRPC呼び出しタイムアウトを計算する際に、操作の実行タイムアウトに追加されます（例：ExecTimeout*1000 + `thrift_rpc_timeout_ms`）。この値を大きくすると、RPC呼び出しはより長いネットワークまたはリモート処理の遅延を許容できます。値を小さくすると、低速なネットワークでのフェイルオーバーが速くなります。この値を変更すると、Thrift RPCを実行するFEコードパス全体で、接続の作成とリクエストの締め切りに影響します。
- 導入バージョン: v3.2.0
##### txn_latency_metric_report_groups

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: レポートするトランザクションレイテンシーメトリックグループのカンマ区切りリスト。 ロードタイプは、監視のために論理グループに分類されます。 グループが有効になっている場合、その名前は「type」ラベルとしてトランザクションメトリックに追加されます。 有効な値: `stream_load` 、 `routine_load` 、 `broker_load` 、 `insert` 、および `compaction` (共有データクラスタでのみ利用可能)。 例: `"stream_load,routine_load"` 。
- 導入バージョン: v4.0
##### txn_rollback_limit

- デフォルト値: 100
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: ロールバックできるトランザクションの最大数。
- 導入バージョン: -
### ユーザー、ロール、および権限
##### enable_task_info_mask_credential

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: trueの場合、StarRocks は、`information_schema.tasks` および `information_schema.task_runs` でタスク SQL 定義から認証情報を削除します。これは、`SqlCredentialRedactor.redact` を `DEFINITION` 列に適用することによって行われます。`information_schema.task_runs` では、定義がタスク実行ステータスから取得されたか、または空の場合にタスク定義ルックアップから取得されたかに関係なく、同じ編集が適用されます。falseの場合、生のタスク定義が返されます（認証情報が公開される可能性があります）。マスキングは CPU/文字列処理の作業であり、タスクまたは task_runs の数が多い場合は時間がかかる可能性があります。編集されていない定義が必要で、セキュリティリスクを受け入れる場合にのみ無効にしてください。
- 導入バージョン: v3.5.6
##### privilege_max_role_depth

- デフォルト値: 16
- タイプ: Int
- 単位:
- 変更可能: はい
- 説明: ロールの最大のロール深度（継承レベル）です。
- 導入バージョン: v3.0.0
##### privilege_max_total_roles_per_user

- デフォルト値: 64
- タイプ: Int
- 単位:
- 変更可能: はい
- 説明: ユーザーが持つことができるロールの最大数。
- 導入バージョン: v3.0.0
### クエリエンジン
##### brpc_send_plan_fragment_timeout_ms

- デフォルト値: 60000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: プランフラグメントを送信する前に BRPC TalkTimeoutController に適用されるタイムアウト（ミリ秒単位）。 `BackendServiceClient.sendPlanFragmentAsync` は、バックエンドの `execPlanFragmentAsync` を呼び出す前にこの値を設定します。これは、アイドル状態の接続を接続プールから借りる際、および送信を実行中に BRPC が待機する時間を制御します。これを超過すると、RPC は失敗し、メソッドの再試行ロジックがトリガーされる可能性があります。競合下で迅速に失敗させるにはこの値を小さくし、一時的なプール枯渇や低速ネットワークを許容するには大きくします。ただし、非常に大きな値は障害検出を遅らせ、リクエストスレッドをブロックする可能性があるため、注意が必要です。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0
##### connector_table_query_trigger_analyze_large_table_interval

- デフォルト値: 12 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 大規模テーブルのクエリトリガーANALYZEタスクの間隔。
- 初出バージョン: v3.4.0
##### connector_table_query_trigger_analyze_max_pending_task_num

- デフォルト値: 100
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE 上で Pending 状態になっている、クエリトリガーの ANALYZE タスクの最大数。
- 導入バージョン: v3.4.0
##### connector_table_query_trigger_analyze_max_running_task_num

- デフォルト値: 2
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: FE 上で Running 状態にある、クエリトリガーの ANALYZE タスクの最大数。
- 導入バージョン: v3.4.0
##### connector_table_query_trigger_analyze_small_table_interval

- デフォルト値: 2 * 3600
- タイプ: Int
- 単位: Second
- 変更可能: はい
- 説明: 小さいテーブルのクエリトリガーANALYZEタスクの間隔。
- 導入バージョン: v3.4.0
##### connector_table_query_trigger_analyze_small_table_rows

- デフォルト値: 10000000
- タイプ: Int
- 単位: -
- 変更可能か: はい
- 説明: クエリトリガーANALYZEタスクにおいて、テーブルが小さいテーブルであるかどうかを判断するための閾値。
- 導入バージョン: v3.4.0
##### connector_table_query_trigger_task_schedule_interval

- デフォルト値: 30
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: スケジューラースレッドがクエリトリガーのバックグラウンドタスクをスケジュールする間隔。この項目は、v3.4.0 で導入された `connector_table_query_trigger_analyze_schedule_interval` を置き換えるためのものです。ここで、バックグラウンドタスクとは、v3.4 の `ANALYZE` タスク、および v3.4 以降のバージョンの低基数カラムの辞書の収集タスクを指します。
- 導入バージョン: v3.4.2
##### create_table_max_serial_replicas

- デフォルト値: 128
- タイプ: Int
- 単位: -
- 変更可能か: はい
- 説明: シリアルに作成するレプリカの最大数。実際のレプリカ数がこの値を超えると、レプリカは同時に作成されます。テーブルの作成に時間がかかる場合は、この値を小さくしてみてください。
- 導入バージョン: -
##### default_mv_partition_refresh_number

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューのリフレッシュが複数のパーティションに及ぶ場合、このパラメータは、デフォルトで1つのバッチでリフレッシュされるパーティションの数を制御します。
バージョン3.3.0以降、メモリ不足（OOM）の問題を回避するために、システムはデフォルトで一度に1つのパーティションをリフレッシュします。以前のバージョンでは、デフォルトですべてのパーティションが一度にリフレッシュされていたため、メモリの枯渇やタスクの失敗につながる可能性がありました。ただし、マテリアライズドビューのリフレッシュが多数のパーティションに及ぶ場合、一度に1つのパーティションのみをリフレッシュすると、スケジューリングのオーバーヘッドが過剰になり、全体的なリフレッシュ時間が長くなり、多数のリフレッシュレコードが発生する可能性があることに注意してください。このような場合は、このパラメータを適切に調整して、リフレッシュ効率を向上させ、スケジューリングコストを削減することをお勧めします。
- 導入: v3.3.0
##### default_mv_refresh_immediate

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 非同期マテリアライズドビューの作成直後にリフレッシュするかどうか。この項目が `true` に設定されている場合、新しく作成されたマテリアライズドビューはすぐにリフレッシュされます。
- 導入バージョン: v3.2.3
##### dynamic_partition_check_interval_seconds

- デフォルト値: 600
- タイプ: Long
- 単位: 秒
- 変更可能か: はい
- 説明: 新しいデータがチェックされる間隔。新しいデータが検出されると、StarRocks は自動的にそのデータのパーティションを作成します。
- 導入: -
##### dynamic_partition_enable

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: 動的パーティション化機能を有効にするかどうか。この機能を有効にすると、StarRocks は新しいデータのパーティションを動的に作成し、期限切れのパーティションを自動的に削除して、データの鮮度を確保します。
- 導入バージョン: -
##### enable_active_materialized_view_schema_strict_check

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能: はい
- 説明: 非アクティブなマテリアライズドビューをアクティブ化する際に、データ型の長さの一貫性を厳密にチェックするかどうか。この項目が `false` に設定されている場合、ベーステーブルでデータ型の長さが変更されていても、マテリアライズドビューのアクティブ化には影響しません。
- 導入バージョン: v3.3.4
##### enable_auto_collect_array_ndv

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: ARRAY 型の NDV 情報を自動的に収集するかどうかを指定します。
- 導入バージョン: v4.0
##### enable_backup_materialized_view

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: 特定のデータベースをバックアップまたはリストアする際に、非同期マテリアライズドビューの BACKUP および RESTORE を有効にするかどうか。この項目が `false` に設定されている場合、StarRocks は非同期マテリアライズドビューのバックアップをスキップします。
- 初出: v3.2.0
##### enable_collect_full_statistic

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 自動的な完全統計収集を有効にするかどうか。この機能はデフォルトで有効になっています。
- 導入バージョン: -
##### enable_colocate_mv_index

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: はい
- 説明: 同期マテリアライズドビューを作成する際に、同期マテリアライズドビューのインデックスをベーステーブルと同一場所に配置するかどうかを設定します。この項目を `true` に設定すると、tablet sink が同期マテリアライズドビューの書き込みパフォーマンスを向上させます。
- 導入バージョン: v3.2.0
##### enable_decimal_v3

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: DECIMAL V3データ型をサポートするかどうか。
- 導入バージョン: -
##### enable_experimental_mv

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 非同期マテリアライズドビュー機能を有効にするかどうか。 TRUE は、この機能が有効になっていることを示します。 v2.5.2 以降、この機能はデフォルトで有効になっています。 v2.5.2 より前のバージョンでは、この機能はデフォルトで無効になっています。
- 導入バージョン: v2.4
##### enable_local_replica_selection

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: クエリのためにローカルレプリカを選択するかどうかを指定します。 ローカルレプリカは、ネットワーク転送コストを削減します。 このパラメータがTRUEに設定されている場合、CBO は現在のFEと同じIPアドレスを持つBE上のtabletレプリカを優先的に選択します。 このパラメータが`FALSE`に設定されている場合、ローカルレプリカと非ローカルレプリカの両方を選択できます。
- 導入: -
##### enable_manual_collect_array_ndv

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: ARRAY 型の NDV 情報を手動で収集するかどうかを指定します。
- 導入バージョン: v4.0
##### enable_materialized_view

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能かどうか: Yes
- 説明: マテリアライズドビューの作成を有効にするかどうか。
- 導入バージョン: -
##### enable_materialized_view_external_table_precise_refresh

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: ベーステーブルが外部テーブル（クラウドネイティブではないテーブル）の場合に、マテリアライズドビューのリフレッシュに対する内部最適化を有効にするには、この項目を `true` に設定します。有効にすると、マテリアライズドビューのリフレッシュプロセッサは候補パーティションを計算し、すべてのパーティションではなく、影響を受けるベーステーブルのパーティションのみをリフレッシュするため、I/O とリフレッシュのコストが削減されます。外部テーブルのフルパーティションリフレッシュを強制するには、`false` に設定します。
- 初出: v3.2.9
##### enable_materialized_view_metrics_collect

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: デフォルトで非同期マテリアライズドビューの監視メトリクスを収集するかどうかを指定します。
- 導入バージョン: v3.1.11, v3.2.5
##### enable_materialized_view_spill

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: マテリアライズドビューのリフレッシュタスクで、中間結果のディスクへのスピルを有効にするかどうかを指定します。
- 導入バージョン: v3.1.1
##### enable_materialized_view_text_based_rewrite

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: テキストベースのクエリの書き換えをデフォルトで有効にするかどうか。この項目が `true` に設定されている場合、システムは非同期マテリアライズドビューの作成中に抽象構文ツリーを構築します。
- 導入バージョン: v3.2.5
##### enable_mv_automatic_active_check

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: ベーステーブル（ビュー）が Schema Change を行ったか、削除されて再作成されたために非アクティブに設定された非同期マテリアライズドビューを、システムが自動的にチェックして再アクティブ化するかどうかを設定します。この機能は、ユーザーが手動で非アクティブに設定したマテリアライズドビューを再アクティブ化しないことに注意してください。
- 導入バージョン: v3.1.6
##### enable_mv_automatic_repairing_for_broken_base_tables

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: この項目が `true` に設定されている場合、ベースの外部テーブルが削除されて再作成されたり、テーブル識別子が変更されたりすると、StarRocks はマテリアライズドビューのベーステーブルのメタデータを自動的に修復しようとします。修復フローは、マテリアライズドビューのベーステーブル情報を更新し、外部テーブルのパーティションのパーティションレベルの修復情報を収集し、`autoRefreshPartitionsLimit` を尊重しながら、非同期自動リフレッシュマテリアライズドビューのパーティションリフレッシュの決定を促進できます。現在、自動修復は Hive 外部テーブルをサポートしています。サポートされていないテーブルタイプの場合、マテリアライズドビューは非アクティブに設定され、修復例外が発生します。パーティション情報の収集はノンブロッキングであり、エラーはログに記録されます。
- 導入バージョン: v3.3.19, v3.4.8, v3.5.6
##### enable_predicate_columns_collection

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能かどうか: はい
- 説明: 述語列の収集を有効にするかどうか。無効にすると、クエリ最適化中に述語列は記録されません。
- 導入: -
##### enable_query_queue_v2

- デフォルト値: true
- タイプ: boolean
- 単位: -
- 変更可能: No
- 説明: trueの場合、FE のスロットベースのクエリスケジューラを Query Queue V2 に切り替えます。このフラグは、スロットマネージャーとトラッカー (例: `BaseSlotManager.isEnableQueryQueueV2` および `SlotTracker#createSlotSelectionStrategy`) によって読み取られ、従来の戦略の代わりに `SlotSelectionStrategyV2` を選択します。`query_queue_v2_xxx` の構成オプションと `QueryQueueOptions` は、このフラグが有効になっている場合にのみ有効になります。v4.1 以降、デフォルト値は `false` から `true` に変更されました。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0
##### enable_sql_blacklist

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: SQLクエリのブラックリストチェックを有効にするかどうか。この機能を有効にすると、ブラックリストにあるクエリは実行できません。
- 導入バージョン: -
##### enable_statistic_collect

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: CBO のための統計情報を収集するかどうか。この機能はデフォルトで有効になっています。
- 導入バージョン: -
##### enable_statistic_collect_on_first_load

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: データロード操作によってトリガーされる、自動統計収集とメンテナンスを制御します。これには以下が含まれます。
  - データが最初にパーティションにロードされる際の統計収集（パーティションのバージョンが2の場合）。
  - 複数パーティションテーブルの空のパーティションにデータがロードされる際の統計収集。
  - INSERT OVERWRITE 操作における統計のコピーと更新。

  **統計収集タイプの決定ポリシー:**
  
  - INSERT OVERWRITEの場合: `deltaRatio = |targetRows - sourceRows| / (sourceRows + 1)`
    - `deltaRatio < statistic_sample_collect_ratio_threshold_of_first_load` (デフォルト: 0.1) の場合、統計収集は実行されません。既存の統計のみがコピーされます。
    - それ以外の場合、`targetRows > statistic_sample_collect_rows` (デフォルト: 200000) であれば、SAMPLE 統計収集が使用されます。
    - それ以外の場合は、FULL 統計収集が使用されます。
  
  - 最初のロードの場合: `deltaRatio = loadRows / (totalRows + 1)`
    - `deltaRatio < statistic_sample_collect_ratio_threshold_of_first_load` (デフォルト: 0.1) の場合、統計収集は実行されません。
    - それ以外の場合、`loadRows > statistic_sample_collect_rows` (デフォルト: 200000) であれば、SAMPLE 統計収集が使用されます。
    - それ以外の場合は、FULL 統計収集が使用されます。
  
  **同期の振る舞い:**
  
  - DMLステートメント (INSERT INTO/INSERT OVERWRITE) の場合: テーブルロックを伴う同期モード。ロード操作は、統計収集が完了するまで待機します (最大 `semi_sync_collect_statistic_await_seconds`)。
  - Stream Load および Broker Load の場合: ロックなしの非同期モード。統計収集は、ロード操作をブロックせずにバックグラウンドで実行されます。
  
  :::note
  この構成を無効にすると、INSERT OVERWRITE の統計メンテナンスを含む、ロードによってトリガーされるすべての統計操作が防止され、テーブルに統計がなくなる可能性があります。新しいテーブルが頻繁に作成され、データが頻繁にロードされる場合、この機能を有効にすると、メモリと CPU のオーバーヘッドが増加します。
  :::

- 初出: v3.1
##### enable_statistic_collect_on_update

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: UPDATEステートメントが自動統計収集をトリガーするかどうかを制御します。 有効にすると、テーブルデータを変更するUPDATE操作は、`enable_statistic_collect_on_first_load`によって制御されるのと同じデータ取り込みベースの統計フレームワークを介して、統計収集をスケジュールできます。 この構成を無効にすると、UPDATEステートメントの統計収集はスキップされますが、ロードによってトリガーされる統計収集の動作は変更されません。
- 導入バージョン: v3.5.11, v4.0.4
##### enable_udf

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: No
- 説明: UDF を有効にするかどうか。
- 導入: -
##### expr_children_limit

- デフォルト値: 10000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 式に許可される子式の最大数。
- 導入: -
##### histogram_buckets_size

- デフォルト値: 64
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムのデフォルトのバケット数。
- 導入バージョン: -
##### histogram_max_sample_row_count

- デフォルト値: 10000000
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムのために収集する行の最大数。
- 導入バージョン: -
##### histogram_mcv_size

- デフォルト値: 100
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムの最頻値 (MCV) の数。
- 導入: -
##### histogram_sample_ratio

- デフォルト: 0.1
- タイプ: Double
- 単位: -
- 変更可能: Yes
- 説明: ヒストグラムのサンプリング比率。
- 導入: -
##### http_slow_request_threshold_ms

- デフォルト値: 5000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: HTTPリクエストの応答時間が、このパラメータで指定された値を超えた場合、このリクエストを追跡するためのログが生成されます。
- 導入バージョン: v2.5.15, v3.1.5
##### lock_checker_enable_deadlock_check

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 有効にすると、LockChecker スレッドは ThreadMXBean.findDeadlockedThreads() を使用して JVM レベルのデッドロック検出を実行し、問題のあるスレッドのスタックトレースをログに記録します。このチェックは LockChecker デーモン (頻度は `lock_checker_interval_second` で制御) 内で実行され、詳細なスタック情報をログに書き込みます。これは CPU および I/O を大量に消費する可能性があります。このオプションは、ライブまたは再現可能なデッドロックの問題のトラブルシューティングでのみ有効にしてください。通常の操作で有効にしておくと、オーバーヘッドとログ量が増加する可能性があります。
- 導入: v3.2.0
##### low_cardinality_threshold

- デフォルト値: 255
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: 低基数辞書の閾値。
- 導入バージョン: v3.5.0
##### materialized_view_min_refresh_interval

- デフォルト値: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 非同期マテリアライズドビューのスケジュールで許可される最小リフレッシュ間隔（秒単位）。時間ベースの間隔でマテリアライズドビューを作成する場合、間隔は秒に変換され、この値よりも小さくすることはできません。そうでない場合、CREATE/ALTER 操作は DDL エラーで失敗します。この値が 0 より大きい場合、チェックが適用されます。制限を無効にするには、0 または負の値に設定します。これにより、過度に頻繁なリフレッシュによる過剰な TaskManager のスケジューリングや FE のメモリ/CPU 使用率の増加を防ぎます。この項目は EVENT_TRIGGERED リフレッシュには適用されません。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0
##### materialized_view_refresh_ascending

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、マテリアライズドビューのパーティションリフレッシュは、パーティションキーの昇順（最も古いものから最も新しいものへ）でパーティションを反復処理します。`false` （デフォルト）に設定されている場合、システムは降順（最も新しいものから最も古いものへ）で反復処理します。StarRocks は、パーティションリフレッシュの制限が適用される場合に処理するパーティションを選択し、後続の TaskRun 実行のために次の開始/終了パーティション境界を計算するために、リストおよびレンジパーティション化されたマテリアライズドビューリフレッシュロジックの両方でこの項目を使用します。この項目を変更すると、最初にリフレッシュされるパーティションと、次のパーティション範囲の導出方法が変わります。レンジパーティション化されたマテリアライズドビューの場合、スケジューラは新しい開始/終了を検証し、変更によって境界が繰り返される（デッドループ）場合はエラーを発生させるため、この項目は慎重に設定してください。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0
##### max_allowed_in_element_num_of_delete

- デフォルト値: 10000
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: DELETE ステートメントの IN 述語で許可される要素の最大数。
- 導入バージョン: -
##### max_create_table_timeout_second

- デフォルト値: 600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: テーブル作成の最大タイムアウト時間。
- 導入: -
##### max_distribution_pruner_recursion_depth

- デフォルト値: 100
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: パーティションプルーナーで許可される再帰の最大深度。再帰深度を大きくすると、より多くの要素をプルーニングできますが、CPU 消費量も増加します。
- 導入: -
##### max_partitions_in_one_batch

- デフォルト値: 4096
- タイプ: Long
- 単位: -
- 変更可能か: Yes
- 説明: パーティションを一括作成する際に作成できるパーティションの最大数。
- 導入バージョン: -
##### max_planner_scalar_rewrite_num

- デフォルト値: 100000
- タイプ: Long
- 単位: -
- 変更可能か: Yes
- 説明: オプティマイザがスカラー演算子を書き換えることができる最大回数。
- 導入: -
##### max_query_queue_history_slots_number

- デフォルト: 0
- タイプ: Int
- 単位: Slots
- 変更可能: Yes
- 説明: 監視と可観測性のために、クエリキューごとに保持される最近リリースされた（履歴）割り当て済みスロットの数を制御します。`max_query_queue_history_slots_number` が 0 より大きい値に設定されている場合、BaseSlotTracker は、上限を超えた場合に最も古いものを削除しながら、最大でその数の最新にリリースされた LogicalSlot エントリをインメモリキューに保持します。これを有効にすると、getSlots() にこれらの履歴エントリ（最新のものから順）が含まれるようになり、BaseSlotTracker がより豊富な ExtraMessage データのために ConnectContext にスロットを登録しようとし、LogicalSlot.ConnectContextListener がクエリ終了メタデータを履歴スロットにアタッチできるようになります。`max_query_queue_history_slots_number` が 0 以下の場合、履歴メカニズムは無効になります（余分なメモリは使用されません）。可観測性とメモリオーバーヘッドのバランスを取るために、適切な値を使用してください。
- 導入バージョン: v3.5.0
##### max_query_retry_time

- デフォルト値: 2
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: FE でのクエリ再試行の最大回数。
- 導入バージョン: -
##### max_running_rollup_job_num_per_table

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: 1つのテーブルに対して並行して実行できるrollupジョブの最大数。
- 導入: -
##### max_scalar_operator_flat_children

- デフォルト値：10000
- タイプ：Int
- 単位：-
- 変更可能かどうか：はい
- 説明：ScalarOperator のフラットな子の最大数。この制限を設定することで、オプティマイザが過剰なメモリを使用するのを防ぐことができます。
- 導入バージョン：-
##### max_scalar_operator_optimize_depth

- デフォルト値：256
- タイプ：Int
- 単位：-
- 変更可能かどうか：はい
- 説明：ScalarOperator の最適化が適用できる最大の深さです。
- 導入バージョン：-
##### mv_active_checker_interval_seconds

- デフォルト値: 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: バックグラウンドの active_checker スレッドが有効になっている場合、システムはスキーマ変更やベーステーブル (またはビュー) の再構築によって Inactive になったマテリアライズドビューを定期的に検出し、自動的に再アクティブ化します。このパラメータは、チェッカースレッドのスケジュール間隔を秒単位で制御します。デフォルト値はシステム定義です。
- 導入バージョン: v3.1.6
##### mv_rewrite_consider_data_layout_mode

- デフォルト: `enable`
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: マテリアライズドビューの書き換えにおいて、最適なマテリアライズドビューを選択する際に、ベーステーブルのデータレイアウトを考慮するかどうかを制御します。有効な値は以下のとおりです。
  - `disable`: 候補となるマテリアライズドビューを選択する際に、データレイアウトの基準を一切使用しません。
  - `enable`: クエリがレイアウトに依存すると認識された場合にのみ、データレイアウトの基準を使用します。
  - `force`: 最適なマテリアライズドビューを選択する際に、常にデータレイアウトの基準を適用します。
  この項目を変更すると、`BestMvSelector` の動作に影響し、物理レイアウトがプランの正確性またはパフォーマンスに影響するかどうかに応じて、書き換えの適用性を向上または拡大できます。
- 導入: -
##### publish_version_interval_ms

- デフォルト値: 10
- タイプ: Int
- 単位: ミリ秒
- 変更可能か: いいえ
- 説明: リリース検証タスクが発行される時間間隔。
- 導入バージョン: -
##### query_queue_slots_estimator_strategy

- デフォルト値: MAX
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: `enable_query_queue_v2` が true の場合に、キューベースのクエリに使用されるスロット見積もり戦略を選択します。有効な値は、MBE (memory-based)、PBE (parallelism-based)、MAX (MBE と PBE の最大値を使用)、MIN (MBE と PBE の最小値を使用) です。MBE は、予測されるメモリまたはプランコストを、スロットあたりのメモリターゲットで割った値からスロットを見積もり、`totalSlots` によって上限が設定されます。PBE は、フラグメントの並行性 (スキャン範囲のカウントまたはカーディナリティ / rows-per-slot) と CPU コストベースの計算 (スロットあたりの CPU コストを使用) からスロットを導き出し、結果を [numSlots/2, numSlots] の範囲内に制限します。MAX と MIN は、それぞれ最大値または最小値を取ることによって、MBE と PBE を組み合わせます。設定された値が無効な場合、デフォルト値 (`MAX`) が使用されます。
- 導入バージョン: v3.5.0
##### query_queue_v2_concurrency_level

- デフォルト値: 4
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: システムの総クエリスロットを計算する際に使用される論理的な並行性「レイヤー」の数を制御します。共有なしモードでは、総スロット数 = `query_queue_v2_concurrency_level` * BE の数 * BE あたりのコア数 (BackendResourceStat から算出) となります。マルチウェアハウスモードでは、実効並行性は max(1, `query_queue_v2_concurrency_level` / 4) にスケールダウンされます。設定値が正でない場合は、`4` として扱われます。この値を変更すると、totalSlots (したがって同時クエリ容量) が増減し、スロットごとのリソースに影響します。memBytesPerSlot は、ワーカーごとのメモリを (ワーカーごとのコア数 * 並行性) で割ることによって算出され、CPU アカウンティングでは `query_queue_v2_cpu_costs_per_slot` が使用されます。クラスタサイズに比例して設定してください。非常に大きな値を設定すると、スロットごとのメモリが減少し、リソースの断片化が発生する可能性があります。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0
##### query_queue_v2_cpu_costs_per_slot

- デフォルト値: 1000000000
- タイプ: Long
- 単位: planner CPU cost units
- 変更可能: Yes
- 説明: クエリがプランナのCPUコストから必要とするスロット数を推定するために使用される、スロットあたりのCPUコストの閾値。スケジューラは、スロットをinteger(plan_cpu_costs / `query_queue_v2_cpu_costs_per_slot`)として計算し、その結果を[1, totalSlots]の範囲にクランプします（totalSlotsはクエリキューV2 `V2` パラメータから導出されます）。V2コードは、非正の設定を1に正規化するため（Math.max(1, value)）、非正の値は事実上 `1` になります。この値を大きくすると、クエリごとに割り当てられるスロットが減り（より少ない、大きなスロットのクエリが優先されます）、小さくすると、クエリごとのスロットが増えます。並列処理とリソースの粒度を制御するために、`query_queue_v2_num_rows_per_slot` および同時実行設定とともに調整してください。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0
##### query_queue_v2_num_rows_per_slot

- デフォルト値: 4096
- タイプ: Int
- 単位: 行
- 変更可能か: はい
- 説明: クエリごとのスロット数を推定する際に、単一のスケジューリングスロットに割り当てるソース行レコードの目標数。StarRocks は、estimated_slots = (Source Node のカーディナリティ) / `query_queue_v2_num_rows_per_slot` を計算し、その結果を [1, totalSlots] の範囲にクランプし、計算値が非正の場合は最小値 1 を適用します。totalSlots は、利用可能なリソース (おおよそ DOP * `query_queue_v2_concurrency_level` * number_of_workers/BE) から導出されるため、クラスタ/コア数に依存します。この値を大きくすると、スロット数 (各スロットが処理する行数) が減少し、スケジューリングのオーバーヘッドが軽減されます。小さくすると、リソース制限まで並列処理が増加します (より多くの、より小さなスロット)。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0
##### query_queue_v2_schedule_strategy

- デフォルト: SWRR
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: Query Queue V2 が保留中のクエリを順序付けるために使用するスケジューリングポリシーを選択します。サポートされている値（大文字と小文字を区別しない）は、`SWRR`（Smooth Weighted Round Robin）です。これはデフォルトであり、公平な重み付け共有を必要とする混合/ハイブリッドワークロードに適しています。もう一つは `SJF`（Short Job First + Aging）です。これは、短期ジョブを優先し、エージングを使用して starvation を回避します。値は大文字と小文字を区別しない enum ルックアップで解析されます。認識されない値はエラーとしてログに記録され、デフォルトのポリシーが使用されます。この構成は、Query Queue V2 が有効になっている場合にのみ動作に影響し、`query_queue_v2_concurrency_level` などの V2 サイズ設定と相互作用します。
- 導入バージョン: v3.3.12, v3.4.2, v3.5.0
##### semi_sync_collect_statistic_await_seconds

- デフォルト値: 30
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: DML操作 (INSERT INTO および INSERT OVERWRITE ステートメント) 中の準同期統計収集の最大待機時間。 Stream Load および Broker Load は非同期モードを使用するため、この構成の影響を受けません。統計収集時間がこの値を超えると、ロード操作は収集の完了を待たずに続行されます。この構成は、`enable_statistic_collect_on_first_load` と連携して動作します。
- 導入バージョン: v3.1
##### slow_query_analyze_threshold

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: クエリフィードバックの分析をトリガーするクエリの実行時間のしきい値。
- 導入: v3.4.0
##### statistic_analyze_status_keep_second

- デフォルト値: 3 * 24 * 3600
- タイプ: Long
- 単位: 秒
- 変更可能か: はい
- 説明: 収集タスクの履歴を保持する期間。デフォルト値は3日間です。
- 導入: -
##### statistic_auto_analyze_end_time

- デフォルト値: 23:59:59
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: 自動収集の終了時刻。有効な値の範囲: `00:00:00` - `23:59:59`。
- 導入バージョン: -
##### statistic_auto_analyze_start_time

- デフォルト値: 00:00:00
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: 自動収集の開始時間。有効な値の範囲: `00:00:00` - `23:59:59`。
- 導入バージョン: -
##### statistic_auto_collect_ratio

- デフォルト値: 0.8
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: 自動収集の統計が健全かどうかを判断するための閾値です。統計の健全性がこの閾値を下回ると、自動収集がトリガーされます。
- 導入バージョン: -
##### statistic_auto_collect_small_table_rows

- デフォルト値: 10000000
- タイプ: Long
- 単位: -
- 変更可能か: Yes
- 説明: 自動収集時に、外部データソース (Hive、Iceberg、Hudi) のテーブルが小さいテーブルであるかどうかを判断するための閾値。テーブルの行数がこの値より少ない場合、テーブルは小さいテーブルと見なされます。
- 導入バージョン: v3.2
##### statistic_cache_columns

- デフォルト値: 100000
- タイプ: Long
- 単位: -
- 変更可能か: いいえ
- 説明: 統計テーブルにキャッシュできる行数。
- 導入バージョン: -
##### statistic_cache_thread_pool_size

- デフォルト値: 10
- タイプ: Int
- 単位: -
- 変更可能か: No
- 説明: 統計キャッシュのリフレッシュに使用されるスレッドプールのサイズ。
- 導入バージョン: -
##### statistic_collect_interval_sec

- デフォルト値: 5 * 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 自動収集中のデータ更新をチェックする間隔。
- 導入: -
##### statistic_max_full_collect_data_size

- デフォルト値: 100 * 1024 * 1024 * 1024
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: 統計の自動収集のためのデータサイズ閾値。合計サイズがこの値を超えると、完全な収集の代わりにサンプル収集が実行されます。
- 導入バージョン: -
##### statistic_sample_collect_rows

- デフォルト値: 200000
- タイプ: Long
- 単位: -
- 変更可能: Yes
- 説明: データロード時に統計情報を収集する際、SAMPLE 統計情報の収集と FULL 統計情報の収集を切り替えるための行数しきい値です。ロードまたは変更された行数がこのしきい値 (デフォルト 200,000) を超える場合、SAMPLE 統計情報の収集が使用されます。それ以外の場合は、FULL 統計情報の収集が使用されます。この設定は、`enable_statistic_collect_on_first_load` および `statistic_sample_collect_ratio_threshold_of_first_load` と組み合わせて使用します。
- 導入バージョン: -
##### statistic_update_interval_sec

- デフォルト値: 24 * 60 * 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 統計情報のキャッシュが更新される間隔。
- 導入バージョン: -
##### task_check_interval_second

- デフォルト値: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タスクのバックグラウンドジョブの実行間隔。GlobalStateMgr はこの値を使用して TaskCleaner FrontendDaemon をスケジュールし、`doTaskBackgroundJob()` を呼び出します。この値に 1000 を掛けて、デーモンの間隔をミリ秒単位で設定します。値を小さくすると、バックグラウンドメンテナンス（タスクのクリーンアップ、チェック）の実行頻度が高まり、反応が速くなりますが、CPU/IO のオーバーヘッドが増加します。値を大きくすると、オーバーヘッドは減少しますが、クリーンアップと古いタスクの検出が遅れます。メンテナンスの応答性とリソース使用率のバランスを取るために、この値を調整してください。
- 導入バージョン: v3.2.0
##### task_min_schedule_interval_s

- デフォルト値: 10
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: SQLレイヤーによってチェックされるタスクスケジュールの、許可される最小スケジュール間隔（秒単位）。タスクが送信されると、TaskAnalyzer はスケジュール期間を秒に変換し、期間が `task_min_schedule_interval_s` より小さい場合、ERR_INVALID_PARAMETER で送信を拒否します。これにより、実行頻度が高すぎるタスクの作成を防ぎ、スケジューラを高頻度タスクから保護します。スケジュールに明示的な開始時間がない場合、TaskAnalyzer は開始時間を現在のエポック秒に設定します。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0
##### task_runs_timeout_second

- デフォルト値: 4 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: TaskRun のデフォルトの実行タイムアウト（秒単位）。 この項目は、TaskRun の実行時にベースラインのタイムアウトとして使用されます。 タスク実行のプロパティに、正の整数値を持つセッション変数 `query_timeout` または `insert_timeout` が含まれている場合、ランタイムはそのセッションタイムアウトと `task_runs_timeout_second` のうち大きい方の値を使用します。 その後、有効なタイムアウトは、設定された `task_runs_ttl_second` および `task_ttl_second` を超えないように制限されます。 この項目を設定して、タスクの実行時間を制限します。 非常に大きな値は、タスク/タスク実行の TTL 設定によってクリップされる場合があります。
- 導入: -
### ロードとアンロード
##### broker_load_default_timeout_second

- デフォルト値: 14400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: Broker Load ジョブのタイムアウト期間。
- 導入: -
##### desired_max_waiting_jobs

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: FE における保留中のジョブの最大数。この数は、テーブル作成、データロード、スキーマ変更ジョブなど、すべてのジョブを指します。FE 内の保留中のジョブ数がこの値に達すると、FE は新しいロードリクエストを拒否します。このパラメータは、非同期ロードにのみ適用されます。v2.5 以降、デフォルト値は 100 から 1024 に変更されました。
- 導入バージョン: -
##### disable_load_job

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: クラスタでエラーが発生した場合に、ロードを無効にするかどうか。これにより、クラスタエラーによる損失を防ぎます。デフォルト値は `FALSE` で、ロードが無効にならないことを示します。`TRUE` は、ロードが無効になり、クラスタが読み取り専用状態になることを示します。
- 導入: -
##### empty_load_as_error

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: データがロードされない場合に、エラーメッセージ「all partitions have no load data」を返すかどうか。有効な値は次のとおりです。
  - `true`: データがロードされない場合、システムは失敗メッセージを表示し、エラー「all partitions have no load data」を返します。
  - `false`: データがロードされない場合、システムはエラーではなく、成功メッセージを表示し、OKを返します。
- 導入: -
##### enable_file_bundling

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: クラウドネイティブテーブルに対して File Bundling 最適化を有効にするかどうかを指定します。この機能を有効にする（`true` に設定する）と、ロード、Compaction、または Publish 操作によって生成されたデータファイルが自動的にバンドルされ、外部ストレージシステムへの高頻度アクセスによって発生する API コストが削減されます。CREATE TABLE プロパティ `file_bundling` を使用して、テーブルレベルでこの動作を制御することもできます。詳細な手順については、[CREATE TABLE](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md) を参照してください。
- 導入バージョン: v4.0
##### enable_routine_load_lag_metrics

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: Routine Load Kafka パーティションオフセットのラグメトリクスを収集するかどうかを指定します。この項目を `true` に設定すると、Kafka API を呼び出してパーティションの最新のオフセットを取得することに注意してください。
- 導入バージョン: -
##### enable_sync_publish

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: ロードトランザクションのパブリッシュフェーズで、applyタスクを同期的に実行するかどうかを指定します。このパラメータは、主キーテーブルにのみ適用されます。有効な値は次のとおりです。
  - `TRUE` (デフォルト): applyタスクは、ロードトランザクションのパブリッシュフェーズで同期的に実行されます。これは、applyタスクが完了した後にのみロードトランザクションが成功として報告され、ロードされたデータを実際にクエリできることを意味します。タスクが一度に大量のデータをロードする場合、または頻繁にデータをロードする場合、このパラメータを `true` に設定すると、クエリパフォーマンスと安定性が向上しますが、ロードのレイテンシが増加する可能性があります。
  - `FALSE`: applyタスクは、ロードトランザクションのパブリッシュフェーズで非同期的に実行されます。これは、applyタスクが送信された後、ロードトランザクションが成功として報告されることを意味しますが、ロードされたデータをすぐにクエリすることはできません。この場合、同時実行クエリは、applyタスクが完了するか、タイムアウトになるまで待機する必要があります。タスクが一度に大量のデータをロードする場合、または頻繁にデータをロードする場合、このパラメータを `false` に設定すると、クエリパフォーマンスと安定性に影響を与える可能性があります。
- 導入バージョン: v3.2.0
##### export_checker_interval_second

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能か: いいえ
- 説明: データロードジョブがスケジュールされる時間間隔。
- 導入: -
##### export_max_bytes_per_be_per_task

- デフォルト値: 268435456
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: 単一のデータアンロードタスクによって、単一の BE からエクスポートできるデータの最大量。
- 導入: -
##### export_running_job_num_limit

- デフォルト値: 5
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 並行して実行できるデータエクスポートタスクの最大数。
- 導入バージョン: -
##### export_task_default_timeout_second

- デフォルト値: 2 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能か: はい
- 説明: データエクスポートタスクのタイムアウト時間。
- 導入: -
##### export_task_pool_size

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能か: No
- 説明: データアンロードタスクのスレッドプールのサイズ。
- 導入: -
##### external_table_commit_timeout_ms

- デフォルト値: 10000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: StarRocks の外部テーブルへの書き込みトランザクションのコミット（公開）のタイムアウト時間。デフォルト値 `10000` は、10 秒のタイムアウト時間を示します。
- 導入: -
##### finish_transaction_default_lock_timeout_ms

- デフォルト値: 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能か: はい
- 説明: トランザクションの完了時に、DB とテーブルのロックを取得する際のデフォルトのタイムアウトです。
- 導入バージョン: v4.0.0, v3.5.8
##### history_job_keep_max_second

- デフォルト値: 7 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能か: はい
- 説明: スキーマ変更ジョブなど、履歴ジョブを保持できる最大期間。
- 導入バージョン: -
##### insert_load_default_timeout_second

- デフォルト値: 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: データのロードに使用される INSERT INTO ステートメントのタイムアウト時間。
- 導入バージョン: -
##### label_clean_interval_second

- デフォルト値: 4 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: ラベルがクリーンアップされる時間間隔。単位は秒です。履歴ラベルがタイムリーにクリーンアップされるように、短い時間間隔を指定することをお勧めします。
- 導入: -
##### label_keep_max_num

- デフォルト値: 1000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 一定期間内に保持できるロードジョブの最大数。この数を超えると、過去のジョブの情報は削除されます。
- 導入: -
##### label_keep_max_second

- デフォルト値: 3 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能か: Yes
- 説明: 完了し、FINISHED または CANCELLED 状態にあるロードジョブのラベルを保持する最大期間（秒単位）。デフォルト値は3日間です。この期間が過ぎると、ラベルは削除されます。このパラメータは、すべてのタイプのロードジョブに適用されます。値が大きすぎると、大量のメモリを消費します。
- 導入: -
##### load_checker_interval_second

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能か: いいえ
- 説明: ロードジョブがローリング方式で処理される時間間隔。
- 導入: -
##### load_parallel_instance_num

- デフォルト値: 1
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: broker load および stream load 用に、単一ホスト上に作成される並列ロードフラグメントインスタンスの数を制御します。 LoadPlanner は、セッションがアダプティブシンク DOP を有効にしない限り、この値をホストごとの並列処理の次数として使用します。セッション変数 `enable_adaptive_sink_dop` が true の場合、セッションの `sink_degree_of_parallelism` がこの構成をオーバーライドします。シャッフルが必要な場合、この値はフラグメント並列実行（スキャンフラグメントとシンクフラグメントの並列実行インスタンス）に適用されます。シャッフルが不要な場合は、シンクパイプラインの DOP として使用されます。注: ローカルファイルからのロードは、ローカルディスクの競合を避けるために、単一のインスタンス（パイプライン DOP = 1、並列実行 = 1）に強制されます。この数値を増やすと、ホストごとの同時実行性とスループットが向上しますが、CPU、メモリ、I/O の競合が増加する可能性があります。
- 導入バージョン: v3.2.0
##### load_straggler_wait_second

- デフォルト値: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: BE レプリカで許容できる最大のデータロードの遅延時間です。この値を超えると、他のレプリカからデータをクローンするためにクローンが実行されます。
- 導入バージョン: -
##### loads_history_retained_days

- デフォルト値: 30
- タイプ: Int
- 単位: 日
- 変更可能か: はい
- 説明: 内部テーブル `_statistics_.loads_history` にロード履歴を保持する日数。この値は、テーブル作成時にテーブルプロパティ `partition_live_number` を設定するために使用され、`TableKeeper` に渡されて（最小1にクランプされます）、保持する日次パーティションの数を決定します。この値を増減すると、完了したロードジョブが日次パーティションに保持される期間が調整されます。これは、新しいテーブルの作成とキーパーのプルーニング動作に影響しますが、過去のパーティションを自動的に再作成することはありません。`LoadsHistorySyncer` は、ロード履歴のライフサイクルを管理する際にこの保持に依存します。その同期頻度は、`loads_history_sync_interval_second` によって制御されます。
- 導入バージョン: v3.3.6, v3.4.0, v3.5.0
##### loads_history_sync_interval_second

- デフォルト値: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: `information_schema.loads` から完了したロードジョブの定期的な同期を内部の `_statistics_.loads_history` テーブルにスケジュールするために LoadsHistorySyncer が使用する間隔（秒単位）。この値はコンストラクタで 1000 倍され、FrontendDaemon の間隔を設定します。シンカーは最初の実行をスキップし（テーブル作成を可能にするため）、1 分以上前に完了したロードのみをインポートします。小さい値は DML と executor の負荷を増加させ、大きい値は履歴ロードレコードの利用可能性を遅らせます。ターゲットテーブルのリテンション/パーティション化の動作については、`loads_history_retained_days` を参照してください。
- 導入バージョン: v3.3.6, v3.4.0, v3.5.0
##### max_broker_load_job_concurrency

- デフォルト値: 5
- エイリアス: async_load_task_pool_size
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: StarRocks クラスタ内で許可される、同時に実行可能な Broker Load ジョブの最大数。このパラメータは Broker Load に対してのみ有効です。このパラメータの値は、`max_running_txn_num_per_db` の値よりも小さくなければなりません。v2.5 以降、デフォルト値は `10` から `5` に変更されました。
- 導入バージョン: -
##### max_load_timeout_second

- デフォルト値: 259200
- タイプ: Int
- 単位: 秒
- 変更可能か: はい
- 説明: ロードジョブに許可される最大タイムアウト時間。この制限を超えると、ロードジョブは失敗します。この制限は、すべてのタイプのロードジョブに適用されます。
- 導入バージョン: -
##### max_routine_load_batch_size

- デフォルト値: 4294967296
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: Routine Load タスクでロードできるデータの最大量。
- 導入バージョン: -
##### max_routine_load_task_concurrent_num

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 各 Routine Load ジョブの同時実行タスクの最大数。
- 導入: -
##### max_routine_load_task_num_per_be

- デフォルト値: 16
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: 各BEにおける同時実行可能な Routine Load タスクの最大数。 v3.1.0以降、このパラメータのデフォルト値は5から16に増加し、BEの静的パラメータ `routine_load_thread_pool_size` (非推奨) の値以下である必要はなくなりました。
- 導入バージョン: -
##### max_running_txn_num_per_db

- デフォルト値: 1000
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: StarRocks クラスタ内の各データベースで実行できるデータロードトランザクションの最大数。デフォルト値は `1000` です。v3.1 以降、デフォルト値は `100` から `1000` に変更されました。データベースで実行されているデータロードトランザクションの実際の数がこのパラメータの値を超えると、新しいデータロードリクエストは処理されません。同期データロードジョブの新しいリクエストは拒否され、非同期データロードジョブの新しいリクエストはキューに入れられます。このパラメータの値を大きくするとシステム負荷が増加するため、推奨しません。
- 導入バージョン: -
##### max_stream_load_timeout_second

- デフォルト値: 259200
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: Stream Load ジョブに許可される最大タイムアウト時間。
- 導入バージョン: -
##### max_tolerable_backend_down_num

- デフォルト: 0
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: 許容される障害のある BE ノードの最大数。この数を超えると、Routine Load ジョブは自動的に回復できません。
- 導入: -
##### min_bytes_per_broker_scanner

- デフォルト: 67108864
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: 1つの Broker Load インスタンスで処理できる最小データ量。
- 導入: -
##### min_load_timeout_second

- デフォルト値: 1
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: ロードジョブに許可される最小タイムアウト時間。この制限は、すべてのタイプのロードジョブに適用されます。
- 導入バージョン: -
##### min_routine_load_lag_for_metrics

- デフォルト値: 10000
- タイプ: INT
- 単位: -
- 変更可能: はい
- 説明: モニタリングメトリクスに表示される Routine Load ジョブの最小オフセットラグ。オフセットラグがこの値より大きい Routine Load ジョブがメトリクスに表示されます。
- 導入バージョン: -
##### period_of_auto_resume_min

- デフォルト: 5
- タイプ: Int
- 単位: 分
- 変更可能: はい
- 説明: Routine Load ジョブが自動的に復旧する間隔。
- 導入: -
##### prepared_transaction_default_timeout_second

- デフォルト値: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: プリペアドトランザクションのデフォルトのタイムアウト期間。
- 導入: -
##### routine_load_task_consume_second

- デフォルト値: 15
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: クラスタ内の各 Routine Load タスクがデータを消費する最大時間。 v3.1.0 以降、Routine Load ジョブは、[job_properties](../../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md#job_properties) に新しいパラメータ `task_consume_second` をサポートしています。このパラメータは、Routine Load ジョブ内の個々のロードタスクに適用され、より柔軟です。
- 導入バージョン: -
##### routine_load_task_timeout_second

- デフォルト値: 60
- タイプ: Long
- 単位: 秒
- 変更可能: Yes
- 説明: クラスタ内の各 Routine Load タスクのタイムアウト時間。v3.1.0 以降、Routine Load ジョブは、[job_properties](../../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md#job_properties) に新しいパラメータ `task_timeout_second` をサポートしています。このパラメータは、Routine Load ジョブ内の個々のロードタスクに適用され、より柔軟です。
- 導入バージョン: -
##### routine_load_unstable_threshold_second

- デフォルト値: 3600
- タイプ: Long
- 単位: 秒
- 変更可能: Yes
- 説明: Routine Loadジョブ内のタスクに遅延が発生した場合、そのRoutine LoadジョブはUNSTABLE状態に設定されます。具体的には、消費されているメッセージのタイムスタンプと現在の時刻の差がこの閾値を超え、かつデータソース内に未消費のメッセージが存在する場合に、UNSTABLE状態となります。
- 導入バージョン: -
##### spark_dpp_version

- デフォルト: 1.0.0
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: 使用される Spark Dynamic Partition Pruning (DPP) のバージョン。
- 導入: -
##### spark_home_default_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/lib/spark2x"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Sparkクライアントのルートディレクトリ。
- 導入バージョン: -
##### spark_launcher_log_dir

- デフォルト値: sys_log_dir + "/spark_launcher_log"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Spark のログファイルを保存するディレクトリです。
- 導入バージョン: -
##### spark_load_default_timeout_second

- デフォルト値: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 各 Spark Load ジョブのタイムアウト時間。
- 導入バージョン: -
##### spark_load_submit_timeout_second

- デフォルト値: 300
- タイプ: long
- 単位: 秒
- 変更可能か: いいえ
- 説明: Sparkアプリケーションの送信後、YARNの応答を待つ最大時間（秒単位）。 `SparkLauncherMonitor.LogMonitor` はこの値をミリ秒に変換し、ジョブがUNKNOWN/CONNECTED/SUBMITTED状態のままこのタイムアウトを超えると、監視を停止し、Spark launcherプロセスを強制的に停止します。 `SparkLoadJob` はこの構成をデフォルトとして読み取り、 `LoadStmt.SPARK_LOAD_SUBMIT_TIMEOUT` プロパティを介してロードごとにオーバーライドできます。 YARNのキューイング遅延に対応できる十分に高い値を設定してください。低すぎると正当にキューイングされたジョブが中断される可能性があり、高すぎると障害処理とリソースのクリーンアップが遅れる可能性があります。
- 導入バージョン: v3.2.0
##### spark_resource_path

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: Spark の依存関係パッケージのルートディレクトリ。
- 導入: -
##### stream_load_default_timeout_second

- デフォルト値: 600
- タイプ: Int
- 単位: 秒
- 変更可能か: はい
- 説明: 各 Stream Load ジョブのデフォルトのタイムアウト時間。
- 導入バージョン: -
##### stream_load_max_txn_num_per_be

- デフォルト値: -1
- タイプ: Int
- 単位: Transactions
- 変更可能: Yes
- 説明: 単一の BE (バックエンド) ホストから受け入れる同時 stream load トランザクションの数を制限します。負でない整数に設定すると、FrontendServiceImpl は BE の現在のトランザクション数 (クライアント IP 別) をチェックし、カウントがこの制限以上の場合、新しい stream load の開始リクエストを拒否します。`<` 0 の値は制限を無効にします (無制限)。このチェックは stream load の開始時に行われ、超過すると `streamload txn num per be exceeds limit` エラーが発生する可能性があります。関連するランタイムの動作では、リクエストのタイムアウトのフォールバックに `stream_load_default_timeout_second` が使用されます。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0
##### stream_load_task_keep_max_num

- デフォルト値: 1000
- タイプ: Int
- 単位: -
- 変更可能か: はい
- 説明: StreamLoadMgr がメモリに保持する Stream Load タスクの最大数（すべてのデータベースでグローバル）。追跡対象タスク数 (`idToStreamLoadTask`) がこの閾値を超えると、StreamLoadMgr は最初に `cleanSyncStreamLoadTasks()` を呼び出して完了した同期ストリームロードタスクを削除します。それでもサイズがこの閾値の半分を超えている場合は、`cleanOldStreamLoadTasks(true)` を呼び出して、古いタスクまたは完了したタスクを強制的に削除します。この値を大きくすると、より多くのタスク履歴をメモリに保持できます。小さくすると、メモリ使用量を削減し、クリーンアップをより積極的に行うことができます。この値は、メモリ内の保持のみを制御し、永続化/再生されたタスクには影響しません。
- 導入バージョン: v3.2.0
##### stream_load_task_keep_max_second

- デフォルト値: 3 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能か: はい
- 説明: 完了またはキャンセルされた Stream Load タスクの保持期間。タスクが最終状態に達し、その終了タイムスタンプがこの閾値よりも早い場合 ( `currentMs - endTimeMs > stream_load_task_keep_max_second * 1000` ) 、 `StreamLoadMgr.cleanOldStreamLoadTasks` による削除対象となり、永続化された状態のロード時に破棄されます。 `StreamLoadTask` と `StreamLoadMultiStmtTask` の両方に適用されます。タスクの合計数が `stream_load_task_keep_max_num` を超える場合、クリーンアップがより早くトリガーされる可能性があります (同期タスクは `cleanSyncStreamLoadTasks` によって優先されます) 。履歴/デバッグの容易さとメモリ使用量のバランスを取るために設定します。
- 導入バージョン: v3.2.0
##### transaction_clean_interval_second

- デフォルト値: 30
- タイプ: Int
- 単位: 秒
- 変更可能か: いいえ
- 説明: 完了したトランザクションがクリーンアップされる時間間隔。単位は秒です。完了したトランザクションがタイムリーにクリーンアップされるように、短い時間間隔を指定することをお勧めします。
- 導入バージョン: -
##### transaction_stream_load_coordinator_cache_capacity

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: トランザクションラベルからコーディネーターノードへのマッピングを格納するキャッシュの容量。
- 導入バージョン: -
##### transaction_stream_load_coordinator_cache_expire_seconds

- デフォルト: 900
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: キャッシュ内のコーディネータマッピングを保持する時間（TTL）。この時間を過ぎると削除されます。
- 導入: -
##### yarn_client_path

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/lib/yarn-client/hadoop/bin/yarn"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Yarn クライアントパッケージのルートディレクトリ。
- 導入: -
##### yarn_config_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/lib/yarn-config"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Yarn の構成ファイルを格納するディレクトリ。
- 導入: -
### 統計レポート
##### enable_collect_warehouse_metrics

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: この項目が `true` に設定されている場合、システムはウェアハウスごとのメトリクスを収集してエクスポートします。 有効にすると、ウェアハウスレベルのメトリクス (スロット/使用量/可用性) がメトリクス出力に追加され、メトリクスのカーディナリティと収集のオーバーヘッドが増加します。 無効にすると、ウェアハウス固有のメトリクスが省略され、CPU/ネットワークと監視ストレージのコストが削減されます。
- 導入バージョン: v3.5.0
##### enable_http_detail_metrics

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: Yes
- 説明: trueの場合、HTTPサーバーは詳細なHTTPワーカーメトリクス (特に `HTTP_WORKER_PENDING_TASKS_NUM` ゲージ) を計算して公開します。 これを有効にすると、サーバーはNettyワーカーエグゼキューターを反復処理し、各 `NioEventLoop` で `pendingTasks()` を呼び出して、保留中のタスク数を合計します。無効にすると、そのコストを回避するために、ゲージは0を返します。 この追加の収集は、CPUとレイテンシーに影響を与える可能性があります。デバッグまたは詳細な調査の場合にのみ有効にしてください。
- 導入バージョン: v3.2.3
##### proc_profile_collect_time_s

- デフォルト値: 120
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 単一のプロセスプロファイル収集の期間（秒単位）。 `proc_profile_cpu_enable` または `proc_profile_mem_enable` が `true` に設定されている場合、AsyncProfiler が開始され、コレクタスレッドはこの期間スリープし、その後プロファイラが停止され、プロファイルが書き込まれます。 値が大きいほど、サンプルカバレッジとファイルサイズが増加しますが、プロファイラのランタイムが長くなり、後続の収集が遅延します。 値が小さいほど、オーバーヘッドは減少しますが、十分なサンプルが生成されない可能性があります。 この値が、`proc_profile_file_retained_days` や `proc_profile_file_retained_size_bytes` などの保持設定と一致していることを確認してください。
- 導入バージョン: v3.2.12
### ストレージ
##### alter_table_timeout_second

- デフォルト値: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: スキーマ変更 (ALTER TABLE) 操作のタイムアウト時間。
- 導入バージョン: -
##### capacity_used_percent_high_water

- デフォルト値: 0.75
- タイプ: double
- 単位: Fraction (0.0–1.0)
- 変更可能: はい
- 説明: バックエンドのロードスコアを計算する際に使用される、ディスク容量使用率（総容量に対する割合）のhigh-waterしきい値。 `BackendLoadStatistic.calcSore` は `capacity_used_percent_high_water` を使用して `LoadScore.capacityCoefficient` を設定します。バックエンドの使用率が0.5未満の場合、係数は0.5に等しくなります。使用率が `capacity_used_percent_high_water` を超える場合、係数は1.0になります。それ以外の場合、係数は (2 * usedPercent - 0.5) を介して使用率とともに線形に変化します。係数が1.0の場合、ロードスコアは容量の割合によって完全に決定されます。値が低いほど、レプリカ数の重みが増加します。この値を調整すると、バランサーが高ディスク使用率のバックエンドをどの程度積極的にペナルティを科すかが変わります。
- 導入バージョン: v3.2.0
##### catalog_trash_expire_second

- デフォルト値: 86400
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: データベース、テーブル、またはパーティションが削除された後、メタデータを保持できる最長期間。この期間が過ぎると、データは削除され、[RECOVER](../../sql-reference/sql-statements/backup_restore/RECOVER.md) コマンドを使用しても復元できなくなります。
- 導入バージョン: -
##### check_consistency_default_timeout_second

- デフォルト値: 600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: レプリカの整合性チェックのタイムアウト時間。 tablet のサイズに基づいて、このパラメータを設定できます。
- 導入: -
##### consistency_check_cooldown_time_second

- デフォルト値: 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 同一tabletの整合性チェック間の最小間隔（秒単位）を制御します。 tabletを選択する際、`tablet.getLastCheckTime()` が `(currentTimeMillis - consistency_check_cooldown_time_second * 1000)` より小さい場合にのみ、tabletは適格と見なされます。 デフォルト値 (24 * 3600) は、バックエンドディスクのI/Oを削減するために、1日に1tabletあたり約1回のチェックを強制します。 この値を下げると、チェックの頻度とリソース使用量が増加します。上げると、I/Oは削減されますが、不整合の検出が遅くなります。 この値は、インデックスのtabletリストからクールダウンしたtabletをフィルタリングする際に、グローバルに適用されます。
- 導入バージョン: v3.5.5
##### consistency_check_end_time

- デフォルト: "4"
- タイプ: String
- 単位: 時 (0-23)
- 変更可能: いいえ
- 説明: ConsistencyChecker の作業ウィンドウの終了時間（1日のうちの何時か）を指定します。値はシステムタイムゾーンで SimpleDateFormat("HH") を使用して解析され、0〜23（1桁または2桁）として受け入れられます。 StarRocks は、`consistency_check_start_time` と組み合わせて、整合性チェックジョブをいつスケジュールして追加するかを決定します。 `consistency_check_start_time` が `consistency_check_end_time` より大きい場合、ウィンドウは真夜中をまたぎます（たとえば、デフォルトは `consistency_check_start_time` = "23" から `consistency_check_end_time` = "4"）。 `consistency_check_start_time` が `consistency_check_end_time` と等しい場合、チェッカーは実行されません。解析に失敗すると、FE の起動時にエラーがログに記録され、終了するため、有効な時間文字列を指定してください。
- 導入バージョン: v3.2.0
##### consistency_check_start_time

- デフォルト値: "23"
- タイプ: String
- 単位: 時 (00-23)
- 変更可能か: No
- 説明: ConsistencyChecker の作業ウィンドウの開始時間（1日のうちの何時か）を指定します。値はシステムタイムゾーンで SimpleDateFormat("HH") を使用して解析され、0〜23（1桁または2桁）として受け入れられます。 StarRocks は、これを `consistency_check_end_time` と組み合わせて、整合性チェックジョブをいつスケジュールして追加するかを決定します。 `consistency_check_start_time` が `consistency_check_end_time` より大きい場合、ウィンドウは真夜中をまたぎます（たとえば、デフォルトは `consistency_check_start_time` = "23" から `consistency_check_end_time` = "4"）。 `consistency_check_start_time` が `consistency_check_end_time` と等しい場合、チェッカーは実行されません。解析に失敗すると、FE の起動時にエラーがログに記録され、終了するため、有効な時間の文字列を指定してください。
- 導入バージョン: v3.2.0
##### consistency_tablet_meta_check_interval_ms

- デフォルト値: 2 * 3600 * 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能か: はい
- 説明: `TabletInvertedIndex` と `LocalMetastore` 間で完全な tablet-meta の整合性スキャンを実行するために、ConsistencyChecker が使用する間隔。 `runAfterCatalogReady` のデーモンは、`現在の時刻 - lastTabletMetaCheckTime` がこの値を超えると、checkTabletMetaConsistency をトリガーします。無効な tablet が最初に検出されると、その `toBeCleanedTime` は `現在時刻 + (consistency_tablet_meta_check_interval_ms / 2)` に設定されるため、実際の削除は後続のスキャンまで遅延します。この値を大きくすると、スキャンの頻度と負荷が軽減されます (クリーンアップが遅くなります)。小さくすると、古い tablet をより迅速に検出して削除できます (オーバーヘッドが高くなります)。
- 導入バージョン: v3.2.0
##### default_replication_num

- デフォルト値: 3
- タイプ: Short
- 単位: -
- 変更可能: Yes
- 説明: StarRocks でテーブルを作成する際に、各データパーティションのデフォルトのレプリカ数を設定します。この設定は、CREATE TABLE DDL で `replication_num=x` を指定することにより、テーブル作成時に上書きできます。
- 導入: -
##### enable_auto_tablet_distribution

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: バケット数を自動的に設定するかどうか。
  - このパラメータが `TRUE` に設定されている場合、テーブルの作成時またはパーティションの追加時にバケット数を指定する必要はありません。StarRocks がバケット数を自動的に決定します。
  - このパラメータが `FALSE` に設定されている場合、テーブルの作成時またはパーティションの追加時にバケットを手動で指定する必要があります。テーブルに新しいパーティションを追加するときにバケット数を指定しない場合、新しいパーティションはテーブルの作成時に設定されたバケット数を継承します。ただし、新しいパーティションのバケット数を手動で指定することもできます。
- 導入バージョン: v2.5.7
##### enable_experimental_rowstore

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: [行と列のハイブリッドストレージ](../../table_design/hybrid_table.md) 機能を有効にするかどうかを指定します。
- 導入バージョン: v3.2.3
##### enable_fast_schema_evolution

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: StarRocks クラスタ内のすべてのテーブルに対して、高速スキーマ進化を有効にするかどうかを指定します。有効な値は、`TRUE` および `FALSE` (デフォルト) です。高速スキーマ進化を有効にすると、カラムの追加または削除時のスキーマ変更の速度が向上し、リソースの使用量を削減できます。
- 導入バージョン: v3.2.0

> **NOTE**
>
> - StarRocks 共有データクラスタは、v3.3.0 以降でこのパラメータをサポートしています。
> - 特定のテーブルに対して高速スキーマ進化を設定する必要がある場合 (特定のテーブルに対して高速スキーマ進化を無効にするなど) は、テーブル作成時にテーブルプロパティ [`fast_schema_evolution`](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md#set-fast-schema-evolution) を設定できます。
##### enable_online_optimize_table

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: StarRocks が最適化ジョブの作成時に、ノンブロッキングのオンライン最適化パスを使用するかどうかを制御します。`enable_online_optimize_table` が true であり、対象テーブルが互換性チェック（パーティション/キー/ソートの指定がない、分散が `RandomDistributionDesc` ではない、ストレージタイプが `COLUMN_WITH_ROW` ではない、レプリケートされたストレージが有効、テーブルがクラウドネイティブテーブルまたはマテリアライズドビューではない）を満たす場合、プランナーは書き込みをブロックせずに最適化を実行するために `OnlineOptimizeJobV2` を作成します。false の場合、または互換性の条件が失敗した場合、StarRocks は `OptimizeJobV2` にフォールバックし、最適化中に書き込み操作をブロックする可能性があります。
- 導入バージョン: v3.3.3, v3.4.0, v3.5.0
##### enable_strict_storage_medium_check

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: ユーザーがテーブルを作成する際に、FE が BE の記憶媒体を厳密にチェックするかどうか。このパラメータが `TRUE` に設定されている場合、FE はユーザーがテーブルを作成する際に BE の記憶媒体をチェックし、BE の記憶媒体が CREATE TABLE ステートメントで指定された `storage_medium` パラメータと異なる場合、エラーを返します。たとえば、CREATE TABLE ステートメントで指定された記憶媒体が SSD であるにもかかわらず、BE の実際の記憶媒体が HDD である場合などです。その結果、テーブルの作成は失敗します。このパラメータが `FALSE` の場合、FE はテーブルを作成する際に BE の記憶媒体をチェックしません。
- 導入: -
##### max_bucket_number_per_partition

- デフォルト値: 1024
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: パーティション内に作成できるバケットの最大数。
- 導入バージョン: v3.3.2
##### max_column_number_per_table

- デフォルト値: 10000
- タイプ: Int
- 単位: -
- 変更可能か: はい
- 説明: テーブルに作成できるカラムの最大数。
- 導入バージョン: v3.3.2
##### max_dynamic_partition_num

- デフォルト値: 500
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 動的パーティションテーブルの分析または作成時に、一度に作成できるパーティションの最大数を制限します。動的パーティションのproperty enforcement（プロパティ適用）の検証中、systemtask_runs_max_history_number は予想されるパーティション（終了オフセット + 履歴パーティション数）を計算し、その合計が `max_dynamic_partition_num` を超える場合、DDLエラーをスローします。正当に大きなパーティション範囲が予想される場合にのみ、この値を大きくしてください。値を大きくすると、より多くのパーティションを作成できますが、メタデータのサイズ、スケジューリングの作業、および運用上の複雑さが増加する可能性があります。
- 導入バージョン: v3.2.0
##### max_partition_number_per_table

- デフォルト値: 100000
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: テーブルに作成できるパーティションの最大数。
- 導入バージョン: v3.3.2
##### max_task_consecutive_fail_count

- デフォルト値: 10
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: スケジューラがタスクを自動的に中断するまでに、タスクが連続して失敗できる最大回数。 `TaskSource.MV.equals(task.getSource())` であり、かつ `max_task_consecutive_fail_count` が0より大きい場合、タスクの連続失敗カウンターが `max_task_consecutive_fail_count` に達するか超えると、タスクは TaskManager を介して中断され、マテリアライズドビュータスクの場合、マテリアライズドビューは非アクティブ化されます。中断を示す例外と、再アクティブ化する方法（例：`ALTER MATERIALIZED VIEW <mv_name> ACTIVE`）がスローされます。自動中断を無効にするには、この項目を0または負の値に設定します。
- 導入バージョン: -
##### partition_recycle_retention_period_secs

- デフォルト値: 1800
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: INSERT OVERWRITE またはマテリアライズドビューのリフレッシュ操作によって削除されたパーティションのメタデータ保持時間。 このようなメタデータは、[RECOVER](../../sql-reference/sql-statements/backup_restore/RECOVER.md) を実行しても復元できないことに注意してください。
- 導入バージョン: v3.5.9
##### recover_with_empty_tablet

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 紛失または破損したtablet レプリカを空のレプリカで置き換えるかどうか。 tablet レプリカが紛失または破損した場合、このtablet または他の正常なtablet に対するデータクエリが失敗する可能性があります。紛失または破損したtablet レプリカを空のtablet で置き換えることで、クエリを確実に実行できます。ただし、データが失われるため、結果が正しくない可能性があります。デフォルト値は `FALSE` です。これは、紛失または破損したtablet レプリカが空のレプリカで置き換えられず、クエリが失敗することを意味します。
- 導入: -
##### storage_usage_hard_limit_percent

- デフォルト値: 95
- エイリアス: storage_flood_stage_usage_percent
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: BE ディレクトリにおけるストレージ使用率のハードリミット（パーセンテージ）。BE のストレージディレクトリの使用率（パーセンテージ）がこの値を超え、かつ残りのストレージ容量が `storage_usage_hard_limit_reserve_bytes` 未満の場合、ロード およびリストアジョブは拒否されます。この項目は、BE の構成項目 `storage_flood_stage_usage_percent` と共に設定して、構成が有効になるようにする必要があります。
- 導入バージョン: -
##### storage_usage_hard_limit_reserve_bytes

- デフォルト値: 100 * 1024 * 1024 * 1024
- エイリアス: storage_flood_stage_left_capacity_bytes
- タイプ: Long
- 単位: バイト
- 変更可能: Yes
- 説明: BE ディレクトリに残しておくストレージ容量のハードリミットです。BE のストレージディレクトリの残りのストレージ容量がこの値を下回り、ストレージ使用率（パーセンテージ）が `storage_usage_hard_limit_percent` を超える場合、Load および Restore ジョブは拒否されます。この項目は、BE の構成項目 `storage_flood_stage_left_capacity_bytes` と合わせて設定することで、構成が有効になります。
- 導入バージョン: -
##### storage_usage_soft_limit_percent

- デフォルト値: 90
- エイリアス: storage_high_watermark_usage_percent
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: BE ディレクトリにおけるストレージ使用率のソフトリミットです。BE のストレージディレクトリの使用率（パーセンテージ）がこの値を超え、かつ残りのストレージ容量が `storage_usage_soft_limit_reserve_bytes` より少ない場合、tablet をこのディレクトリにクローンできません。
- 導入バージョン: -
##### storage_usage_soft_limit_reserve_bytes

- デフォルト値: 200 * 1024 * 1024 * 1024
- エイリアス: storage_min_left_capacity_bytes
- タイプ: Long
- 単位: Bytes
- 変更可能: Yes
- 説明: BE ディレクトリ内の残りのストレージ容量のソフトリミット。 BE ストレージディレクトリ内の残りのストレージ容量がこの値より少なく、ストレージ使用率（パーセンテージ）が `storage_usage_soft_limit_percent` を超える場合、tablet をこのディレクトリにクローンできません。
- 導入バージョン: -
##### tablet_checker_lock_time_per_cycle_ms

- デフォルト値: 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: tablet checker がテーブルロックを解放して再取得するまでの、サイクルごとの最大ロック保持時間。100 未満の値は 100 として扱われます。
- 導入バージョン: v3.5.9, v4.0.2
##### tablet_create_timeout_second

- デフォルト: 10
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: tablet の作成タイムアウト時間。デフォルト値は v3.1 以降、1 から 10 に変更されました。
- 導入: -
##### tablet_delete_timeout_second

- デフォルト値: 2
- タイプ: Int
- 単位: 秒
- 変更可能か: Yes
- 説明: tablet の削除のタイムアウト時間。
- 導入バージョン: -
##### tablet_sched_balance_load_disk_safe_threshold

- デフォルト: 0.5
- エイリアス: balance_load_disk_safe_threshold
- タイプ: Double
- 単位: -
- 変更可能: Yes
- 説明: BE のディスク使用量のバランスが取れているかどうかを判断するためのパーセンテージの閾値。 すべての BE のディスク使用量がこの値より低い場合、バランスが取れていると見なされます。 ディスク使用量がこの値より大きく、最高と最低の BE のディスク使用量の差が 10% より大きい場合、ディスク使用量のバランスが取れていないと見なされ、tablet のリバランスがトリガーされます。
- 導入: -
##### tablet_sched_balance_load_score_threshold

- デフォルト値: 0.1
- エイリアス: balance_load_score_threshold
- タイプ: Double
- 単位: -
- 変更可能: Yes
- 説明: BE の負荷がバランスされているかどうかを判断するためのパーセンテージの閾値。ある BE の負荷がすべての BE の平均負荷よりも低く、その差がこの値よりも大きい場合、その BE は低負荷状態です。逆に、ある BE の負荷が平均負荷よりも高く、その差がこの値よりも大きい場合、その BE は高負荷状態です。
- 導入バージョン: -
##### tablet_sched_be_down_tolerate_time_s

- デフォルト値: 900
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: スケジューラが BE ノードが非アクティブのままでいることを許可する最大時間。時間しきい値に達すると、その BE ノード上の tablet は他のアクティブな BE ノードに移行されます。
- 導入バージョン: v2.5.7
##### tablet_sched_disable_balance

- デフォルト: false
- エイリアス: disable_balance
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: tablet のバランス調整を無効にするかどうか。 `TRUE` は tablet のバランス調整が無効になっていることを示します。 `FALSE` は tablet のバランス調整が有効になっていることを示します。
- 導入: -
##### tablet_sched_disable_colocate_balance

- デフォルト値: false
- エイリアス: disable_colocate_balance
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: Colocate Table のレプリカのバランス調整を無効にするかどうか。 `TRUE` はレプリカのバランス調整が無効になっていることを示します。 `FALSE` はレプリカのバランス調整が有効になっていることを示します。
- 導入: -
##### tablet_sched_max_balancing_tablets

- デフォルト値: 500
- エイリアス: max_balancing_tablets
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 同時にバランスできるtabletの最大数。 この値を超えると、tabletのリバランスはスキップされます。
- 導入バージョン: -
##### tablet_sched_max_clone_task_timeout_sec

- デフォルト: 2 * 60 * 60
- エイリアス: max_clone_task_timeout_sec
- タイプ: Long
- 単位: 秒
- 変更可能: Yes
- 説明: tablet のクローン作成における最大タイムアウト時間。
- 導入: -
##### tablet_sched_max_not_being_scheduled_interval_ms

- デフォルト値: 15 * 60 * 1000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: tablet のクローンタスクがスケジュールされている際に、このパラメータで指定された時間内に tablet がスケジュールされていない場合、StarRocks はできるだけ早くスケジュールするために、より高い優先度を与えます。
- 導入バージョン: -
##### tablet_sched_max_scheduling_tablets

- デフォルト値: 10000
- エイリアス: max_scheduling_tablets
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: 同時にスケジュールできる tablet の最大数。この値を超えると、tablet のバランス調整と修復チェックがスキップされます。
- 導入バージョン: -
##### tablet_sched_min_clone_task_timeout_sec

- デフォルト値: 3 * 60
- エイリアス: min_clone_task_timeout_sec
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: tablet のクローン作成における最小タイムアウト時間。
- 導入: -
##### tablet_sched_num_based_balance_threshold_ratio

- デフォルト値: 0.5
- エイリアス: -
- タイプ: Double
- 単位: -
- 変更可能か: Yes
- 説明: 数に基づいたバランス調整を行うと、ディスクサイズのバランスが崩れる可能性がありますが、ディスク間の最大ギャップは tablet_sched_num_based_balance_threshold_ratio * tablet_sched_balance_load_score_threshold を超えることはありません。クラスタ内に A から B へ、B から A へと常にバランス調整を行っている tablet がある場合は、この値を小さくしてください。tablet の分散をよりバランス良くしたい場合は、この値を大きくしてください。
- 導入バージョン: - 3.1
##### tablet_sched_repair_delay_factor_second

- デフォルト値: 60
- エイリアス: tablet_repair_delay_factor_second
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: レプリカが修復される間隔（秒単位）。
- 導入バージョン: -
##### tablet_sched_slot_num_per_path

- デフォルト値: 8
- エイリアス: schedule_slot_num_per_path
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: BE のストレージディレクトリで同時に実行できる tablet 関連タスクの最大数。 v2.5 以降、このパラメータのデフォルト値は `4` から `8` に変更されました。
- 導入バージョン: -
##### tablet_sched_storage_cooldown_second

- デフォルト値：-1
- エイリアス：storage_cooldown_second
- タイプ：Long
- 単位：秒
- 変更可能：はい
- 説明：テーブル作成時から自動クールダウンを開始するまでのレイテンシー。デフォルト値の「`-1`」は、自動クールダウンが無効になっていることを指定します。自動クールダウンを有効にする場合は、このパラメータを「`-1`」より大きい値に設定してください。
- 導入：-
##### tablet_stat_update_interval_second

- デフォルト値: 300
- タイプ: Int
- 単位: 秒
- 変更可能か: いいえ
- 説明: FE が各 BE から tablet の統計情報を取得する時間間隔。
- 導入: -
### 共有データ
##### aws_s3_access_key

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: S3バケットへのアクセスに使用するアクセスキーID。
- 導入バージョン: v3.0
##### aws_s3_endpoint

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: S3バケットへのアクセスに使用するエンドポイントです。例えば、`https://s3.us-west-2.amazonaws.com` のように指定します。
- 導入バージョン: v3.0
##### aws_s3_external_id

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: S3バケットへのクロスアカウントアクセスに使用される、AWSアカウントの外部ID。
- 導入バージョン: v3.0
##### aws_s3_iam_role_arn

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: データファイルが格納されている S3 バケットに対する権限を持つ IAM ロールの ARN。
- 導入バージョン: v3.0
##### aws_s3_path

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: データの保存に使用される S3 パス。これは、S3 バケットの名前とその下のサブパス (存在する場合) で構成されます。たとえば、`testbucket/subpath` のようになります。
- 導入バージョン: v3.0
##### aws_s3_region

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: S3バケットが存在するリージョン。 例: `us-west-2`。
- 導入バージョン: v3.0
##### aws_s3_secret_key

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: S3バケットへのアクセスに使用するシークレットアクセスキー。
- 導入バージョン: v3.0
##### aws_s3_use_aws_sdk_default_behavior

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: No
- 説明: AWS SDK のデフォルトの認証情報を使用するかどうか。有効な値: true および false (デフォルト)。
- 導入バージョン: v3.0
##### aws_s3_use_instance_profile

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: No
- 説明: S3へのアクセスに、Instance ProfileとAssumed Roleを認証方法として使用するかどうか。有効な値: true および false (デフォルト)。
  - IAMユーザーベースの認証情報 (Access Key と Secret Key) を使用してS3にアクセスする場合は、この項目を `false` に指定し、`aws_s3_access_key` と `aws_s3_secret_key` を指定する必要があります。
  - Instance Profileを使用してS3にアクセスする場合は、この項目を `true` に指定する必要があります。
  - Assumed Roleを使用してS3にアクセスする場合は、この項目を `true` に指定し、`aws_s3_iam_role_arn` を指定する必要があります。
  - また、外部のAWSアカウントを使用する場合は、`aws_s3_external_id` も指定する必要があります。
- 導入バージョン: v3.0
##### azure_adls2_endpoint

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Azure Data Lake Storage Gen2アカウントのエンドポイント。例：`https://test.dfs.core.windows.net`。
- 導入バージョン: v3.4.1
##### azure_adls2_oauth2_client_id

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: Azure Data Lake Storage Gen2 のリクエストを認証するために使用される、マネージドIDのクライアントID。
- 導入バージョン: v3.4.4
##### azure_adls2_oauth2_tenant_id

- デフォルト: 空の文字列
- タイプ: 文字列
- 単位: -
- 変更可能か: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを承認するために使用される、マネージドIDのテナントID。
- 導入バージョン: v3.4.4
##### azure_adls2_oauth2_use_managed_identity

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: No
- 説明: Managed Identity を使用して Azure Data Lake Storage Gen2 へのリクエストを認証するかどうかを指定します。
- 導入バージョン: v3.4.4
##### azure_adls2_path

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: データの保存に使用される Azure Data Lake Storage Gen2 パス。ファイルシステム名とディレクトリ名で構成されます。例：`testfilesystem/starrocks`。
- 導入バージョン: v3.4.1
##### azure_adls2_sas_token

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Azure Data Lake Storage Gen2 のリクエストを認証するために使用される Shared Access Signatures (SAS)。
- 導入バージョン: v3.4.1
##### azure_adls2_shared_key

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを認証するために使用される Shared Key です。
- 導入バージョン: v3.4.1
##### azure_blob_endpoint

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Azure Blob Storageアカウントのエンドポイント。例えば、`https://test.blob.core.windows.net` のように指定します。
- 導入バージョン: v3.1
##### azure_blob_path

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: データの保存に使用される Azure Blob Storage のパス。ストレージアカウント内のコンテナの名前と、コンテナの下のサブパス（存在する場合）で構成されます。例：`testcontainer/subpath`。
- 導入バージョン: v3.1
##### azure_blob_sas_token

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Azure Blob Storageへのリクエストを認証するために使用される、共有アクセス署名（SAS）。
- 導入バージョン: v3.1
##### azure_blob_shared_key

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: Azure Blob Storageへのリクエストを認証するために使用されるShared Keyです。
- 導入バージョン: v3.1
##### azure_use_native_sdk

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: Azure Blob StorageへのアクセスにネイティブSDKを使用するかどうか。これにより、マネージドIDとサービスプリンシパルによる認証が可能になります。この項目が `false` に設定されている場合、共有キーとSASトークンによる認証のみが許可されます。
- 導入バージョン: v3.4.4
##### cloud_native_hdfs_url

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: HDFS ストレージの URL。例：`hdfs://127.0.0.1:9000/user/xxx/starrocks/`。
- 導入バージョン: -
##### cloud_native_meta_port

- デフォルト値: 6090
- タイプ: Int
- 単位: -
- 変更可能かどうか: No
- 説明: FE クラウドネイティブメタデータサーバーのRPCリッスンポート。
- 導入バージョン: -
##### cloud_native_storage_type

- デフォルト値: S3
- データ型: String
- 単位: -
- 変更可否: 不可
- 説明: 使用するオブジェクトストレージのタイプ。 共有データモードでは、StarRocks は HDFS、Azure Blob (v3.1.1 以降でサポート)、Azure Data Lake Storage Gen2 (v3.4.1 以降でサポート)、Google Storage (ネイティブ SDK 付き、v3.5.1 以降でサポート)、および S3 プロトコルと互換性のあるオブジェクトストレージシステム (AWS S3、 MinIO など) へのデータ保存をサポートします。 有効な値: `S3` (デフォルト)、`HDFS`、`AZBLOB`、`ADLS2`、および `GS`。 このパラメータを `S3` として指定する場合は、`aws_s3` が前に付いたパラメータを追加する必要があります。 このパラメータを `AZBLOB` として指定する場合は、`azure_blob` が前に付いたパラメータを追加する必要があります。 このパラメータを `ADLS2` として指定する場合は、`azure_adls2` が前に付いたパラメータを追加する必要があります。 このパラメータを `GS` として指定する場合は、`gcp_gcs` が前に付いたパラメータを追加する必要があります。 このパラメータを `HDFS` として指定する場合は、`cloud_native_hdfs_url` のみを指定する必要があります。
- 導入バージョン: -
##### enable_load_volume_from_conf

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: StarRocks が FE 設定ファイルで指定されたオブジェクトストレージ関連のプロパティを使用して、組み込みのストレージボリュームを作成することを許可するかどうか。 デフォルト値は、v3.4.1 以降、`true` から `false` に変更されました。
- 導入バージョン: v3.1.0
##### gcp_gcs_impersonation_service_account

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: Google Storage にアクセスするために、インパーソネーションベースの認証を使用する場合に、インパーソネートする Service Account。
- 導入バージョン: v3.5.1
##### gcp_gcs_path

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: データの保存に使用される Google Cloud パス。これは、Google Cloud バケットの名前と、その下のサブパス（存在する場合）で構成されます。たとえば、`testbucket/subpath` のようになります。
- 導入バージョン: v3.5.1
##### gcp_gcs_service_account_email

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: サービスアカウントの作成時に生成されたJSONファイル内のメールアドレス。例えば、`user@hello.iam.gserviceaccount.com` のようになります。
- 導入バージョン: v3.5.1
##### gcp_gcs_service_account_private_key

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: サービスアカウントの作成時に生成されたJSONファイル内のプライベートキー。例えば、`-----BEGIN PRIVATE KEY----xxxx-----END PRIVATE KEY-----\n` のようになります。
- 導入バージョン: v3.5.1
##### gcp_gcs_service_account_private_key_id

- デフォルト: 空の文字列
- タイプ: 文字列
- 単位: -
- 変更可能: いいえ
- 説明: サービスアカウントの作成時に生成されたJSONファイル内のプライベートキーID。
- 導入バージョン: v3.5.1
##### gcp_gcs_use_compute_engine_service_account

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: No
- 説明: Compute Engine にバインドされているサービスアカウントを使用するかどうか。
- 導入バージョン: v3.5.1
##### hdfs_file_system_expire_seconds

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: HdfsFsManagerによって管理される、未使用のキャッシュされたHDFS/ObjectStore FileSystemのTime-to-live（秒単位）。FileSystemExpirationChecker（60秒ごとに実行）は、この値を使用して各HdfsFs.isExpired(...)を呼び出します。期限切れになると、マネージャーは基になるFileSystemを閉じて、キャッシュから削除します。アクセサーメソッド（例えば、`HdfsFs.getDFSFileSystem`、`getUserName`、`getConfiguration`）は最終アクセス時のタイムスタンプを更新するため、有効期限は非アクティブ状態に基づきます。値を小さくすると、アイドル状態のリソース保持が削減されますが、再開のオーバーヘッドが増加します。値を大きくすると、ハンドルがより長く保持され、より多くのリソースを消費する可能性があります。
- 導入バージョン: v3.2.0
##### lake_autovacuum_grace_period_minutes

- デフォルト値: 30
- タイプ: Long
- 単位: 分
- 変更可能: はい
- 説明: 共有データクラスタで、過去のデータバージョンを保持する時間範囲です。この時間範囲内の過去のデータバージョンは、Compaction 後に AutoVacuum によって自動的にクリーンアップされません。実行中のクエリがアクセスするデータが、クエリの完了前に削除されるのを防ぐために、この値を最大のクエリ時間よりも大きく設定する必要があります。デフォルト値は、v3.3.0、v3.2.5、および v3.1.10 以降、`5` から `30` に変更されました。
- 導入バージョン: v3.1.0
##### lake_autovacuum_parallel_partitions

- デフォルト値: 8
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: 共有データクラスタ内で、同時にAutoVacuumを実行できるパーティションの最大数。AutoVacuumは、Compaction後のガーベジコレクションです。
- 導入バージョン: v3.1.0
##### lake_autovacuum_partition_naptime_seconds

- デフォルト値: 180
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 共有データクラスタ内の同じパーティションに対する AutoVacuum 操作間の最小間隔。
- 導入バージョン: v3.1.0
##### lake_autovacuum_stale_partition_threshold

- デフォルト値: 12
- タイプ: Long
- 単位: 時間
- 変更可能: はい
- 説明: あるパーティションがこの時間範囲内に更新 (データロード、DELETE、または Compaction) がない場合、システムはこのパーティションに対して AutoVacuum を実行しません。
- 導入バージョン: v3.1.0
##### lake_compaction_allow_partial_success

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能か: はい
- 説明: この項目が `true` に設定されている場合、共有データクラスタ内の Compaction 操作において、いずれかのサブタスクが成功した場合に、システムは Compaction 操作を成功とみなします。
- 導入バージョン: v3.5.2
##### lake_compaction_disable_ids

- デフォルト値: ""
- 型: String
- 単位: -
- 変更可能: Yes
- 説明: 共有データモードで compaction が無効になっているテーブルまたはパーティションのリスト。形式は `tableId1;partitionId2` で、セミコロンで区切られます。例えば、`12345;98765` のようになります。
- 導入バージョン: v3.4.4
##### lake_compaction_history_size

- デフォルト値: 20
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 共有データクラスタ内の Leader FE ノードのメモリに保持する、最近成功した Compaction タスクレコードの数。 `SHOW PROC '/compactions'` コマンドを使用すると、最近成功した Compaction タスクレコードを表示できます。 Compaction の履歴は FE プロセスのメモリに保存され、FE プロセスが再起動されると失われることに注意してください。
- 導入バージョン: v3.1.0
##### lake_compaction_max_tasks

- デフォルト: -1
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: 共有データクラスタで許可される同時 `Compaction` タスクの最大数。この項目を `-1` に設定すると、同時タスク数が適応的に計算されます。この値を `0` に設定すると、`compaction` は無効になります。
- 導入バージョン: v3.1.0
##### lake_compaction_score_selector_min_score

- デフォルト値: 10.0
- タイプ: Double
- 単位: -
- 変更可能か: はい
- 説明: 共有データクラスタ で、Compaction をトリガーする Compaction Score の閾値です。パーティションの Compaction Score がこの値以上の場合、システムはそのパーティションに対して Compaction を実行します。
- 導入バージョン: v3.1.0
##### lake_compaction_score_upper_bound

- デフォルト値: 2000
- タイプ: Long
- 単位: -
- 変更可能: Yes
- 説明: 共有データクラスタ内のパーティションの Compaction Score の上限。 `0` は上限がないことを示します。この項目は、`lake_enable_ingest_slowdown` が `true` に設定されている場合にのみ有効になります。パーティションの Compaction Score がこの上限に達するか超えると、受信するデータロードタスクは拒否されます。 v3.3.6 以降、デフォルト値は `0` から `2000` に変更されました。
- 導入バージョン: v3.2.0
##### lake_enable_balance_tablets_between_workers

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: はい
- 説明: 共有データクラスタ内のクラウドネイティブテーブルの tablet の移行中に、コンピュートノード間で tablet の数を分散させるかどうかを指定します。 `true` はコンピュートノード間で tablet のバランスを取ることを示し、 `false` はこの機能を無効にすることを示します。
- 導入バージョン: v3.3.4
##### lake_enable_ingest_slowdown

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 共有データクラスタでデータ取り込みのスローダウンを有効にするかどうか。データ取り込みのスローダウンが有効になっている場合、パーティションのCompaction Scoreが `lake_ingest_slowdown_threshold` を超えると、そのパーティションでのロードタスクは抑制されます。この構成は、 `run_mode` が `shared_data` に設定されている場合にのみ有効です。 v3.3.6以降、デフォルト値は `false` から `true` に変更されました。
- 導入バージョン: v3.2.0
##### lake_ingest_slowdown_threshold

- デフォルト値: 100
- タイプ: Long
- 単位: -
- 変更可能か: Yes
- 説明: 共有データクラスタにおいて、データロードの速度低下をトリガーする Compaction のスコアの閾値です。この設定は、`lake_enable_ingest_slowdown` が `true` に設定されている場合にのみ有効になります。
- 導入バージョン: v3.2.0
##### lake_publish_version_max_threads

- デフォルト値: 512
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: 共有データクラスタにおける Version Publish タスクの最大スレッド数。
- 初出バージョン: v3.2.0
##### meta_sync_force_delete_shard_meta

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: リモートストレージファイルをクリーンせずに、共有データクラスタのメタデータを直接削除できるようにするかどうか。 クリーンするシャードが過剰に多く、FE JVMに極端なメモリ負荷がかかる場合にのみ、この項目を `true` に設定することをお勧めします。 この機能を有効にした後、シャードまたは tablet に属するデータファイルは自動的にクリーンされないことに注意してください。
- 導入バージョン: v3.2.10, v3.3.3
##### run_mode

- デフォルト値: shared_nothing
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: StarRocks クラスタの実行モード。有効な値は、`shared_data` および `shared_nothing` (デフォルト) です。
  - `shared_data` は、共有データモードで StarRocks を実行することを示します。
  - `shared_nothing` は、共有なしモードで StarRocks を実行することを示します。

  > **注意**
  >
  > - StarRocks クラスタに対して、`shared_data` モードと `shared_nothing` モードを同時に採用することはできません。混合デプロイメントはサポートされていません。
  > - クラスタのデプロイ後に `run_mode` を変更しないでください。変更すると、クラスタが再起動に失敗します。共有なしクラスタから共有データクラスタへの変換、またはその逆はサポートされていません。

- 導入: -
##### shard_group_clean_threshold_sec

- デフォルト値: 3600
- タイプ: Long
- 単位: 秒
- 変更可能か: はい
- 説明: FE が 共有データクラスタ 内の未使用の tablet と shard group をクリーンアップするまでの時間です。このしきい値内で作成された tablet と shard group はクリーンアップされません。
- 導入バージョン: -
##### star_mgr_meta_sync_interval_sec

- デフォルト値: 600
- タイプ: Long
- 単位: 秒
- 変更可能か: いいえ
- 説明: 共有データクラスタにおいて、FE が StarMgr と定期的なメタデータ同期を実行する間隔。
- 導入: -
##### starmgr_grpc_server_max_worker_threads

- デフォルト値: 1024
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE starmgr モジュール内の gRPC サーバーで使用されるワーカースレッドの最大数。
- 導入バージョン: v4.0.0, v3.5.8
##### starmgr_grpc_timeout_seconds

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明:
- 導入: -
### データレイク
##### files_enable_insert_push_down_schema

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 有効にすると、アナライザは `INSERT ... FROM files()` 操作のために、ターゲットテーブルスキーマを `files()` テーブル関数にプッシュしようとします。これは、ソースが FileTableFunctionRelation で、ターゲットが 内部テーブル であり、SELECT リストに対応するスロット参照列（または *）が含まれている場合にのみ適用されます。アナライザは、select 列をターゲット列に一致させ（カウントは一致する必要があります）、ターゲットテーブルを短時間ロックし、ファイル列のタイプを、非複合型に対してディープコピーされたターゲット列のタイプに置き換えます（parquet json -> array&lt;varchar&gt; などの複合型はスキップされます）。元の files テーブルの列名は保持されます。これにより、データ取り込み 中のファイルベースの型推論による型の不一致と緩さが軽減されます。
- 導入バージョン: v3.4.0, v3.5.0
##### hdfs_read_buffer_size_kb

- デフォルト値: 8192
- タイプ: Int
- 単位: キロバイト
- 変更可能: はい
- 説明: HDFS の読み取りバッファのサイズ（キロバイト単位）。 StarRocks はこの値をバイトに変換し（`<< 10`）、`HdfsFsManager` で HDFS 読み取りバッファを初期化し、broker アクセスが使用されていない場合に BE タスクに送信される thrift フィールド `hdfs_read_buffer_size_kb` （例：`TBrokerScanRangeParams`、`TDownloadReq`）にデータを投入するために使用します。 `hdfs_read_buffer_size_kb` を大きくすると、ストリームあたりのメモリ使用量が増加する代わりに、シーケンシャルな読み取りスループットが向上し、syscall のオーバーヘッドが削減されます。小さくすると、メモリフットプリントは削減されますが、IO 効率が低下する可能性があります。チューニングする際は、ワークロード（多数の小さなストリーム対少数の大きなシーケンシャル読み取り）を考慮してください。
- 導入: v3.2.0
##### hdfs_write_buffer_size_kb

- デフォルト: 1024
- タイプ: Int
- 単位: キロバイト
- 変更可能: はい
- 説明: broker を使用しない場合に、HDFS またはオブジェクトストレージに直接書き込むために使用される HDFS 書き込みバッファサイズ（KB単位）を設定します。FE はこの値をバイトに変換し（`<< 10`）、HdfsFsManager でローカル書き込みバッファを初期化し、Thrift リクエスト（例：TUploadReq、TExportSink、シンクオプション）で伝播されるため、バックエンド/エージェントは同じバッファサイズを使用します。この値を大きくすると、ライターあたりのメモリコストは増加しますが、大規模なシーケンシャル書き込みのスループットが向上する可能性があります。小さくすると、ストリームごとのメモリ使用量が減少し、小さな書き込みのレイテンシが低下する可能性があります。`hdfs_read_buffer_size_kb` とともに調整し、利用可能なメモリと同時ライターを考慮してください。
- 導入バージョン: v3.2.0
##### lake_batch_publish_max_version_num

- デフォルト値: 10
- タイプ: Int
- 単位: Count
- 変更可能: Yes
- 説明: lake (クラウドネイティブ) テーブルのパブリッシュバッチを構築する際に、グループ化できる連続したトランザクションバージョンの上限を設定します。この値は、トランザクショングラフのバッチ処理ルーチン (getReadyToPublishTxnListBatch を参照) に渡され、`lake_batch_publish_min_version_num` と連携して TransactionStateBatch の候補範囲サイズを決定します。値を大きくすると、より多くのコミットをバッチ処理することでパブリッシュのスループットを向上させることができますが、アトミックなパブリッシュの範囲が拡大し (可視化のレイテンシーが長くなり、ロールバックの対象範囲が広くなります)、バージョンが連続していない場合は、実行時に制限される可能性があります。ワークロードと可視性/レイテンシーの要件に応じて調整してください。
- 導入バージョン: v3.2.0
##### lake_batch_publish_min_version_num

- デフォルト値: 1
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: レイクテーブルのパブリッシュバッチを形成するために必要な、連続したトランザクションバージョンの最小数を設定します。 DatabaseTransactionMgr.getReadyToPublishTxnListBatch は、この値を `lake_batch_publish_max_version_num` とともに transactionGraph.getTxnsWithTxnDependencyBatch に渡し、依存するトランザクションを選択します。 値 `1` は、単一トランザクションのパブリッシュを許可します（バッチ処理なし）。 1 より大きい値は、少なくともそれだけの数の連続したバージョンの、単一テーブル、非レプリケーショントランザクションが利用可能であることを必要とします。バージョンが連続していない場合、レプリケーショントランザクションが出現した場合、またはスキーマ変更がバージョンを消費した場合、バッチ処理は中止されます。 この値を大きくすると、コミットをグループ化することでパブリッシュのスループットを向上させることができますが、十分な連続したトランザクションを待機している間、パブリッシュが遅れる可能性があります。
- 導入バージョン: v3.2.0
##### lake_enable_batch_publish_version

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: 有効にすると、PublishVersionDaemon は同じ Lake (共有データ) テーブル/パーティションの準備完了したトランザクションをバッチ処理し、トランザクションごとに発行するのではなく、それらのバージョンをまとめて発行します。RunMode 共有データでは、デーモンは getReadyPublishTransactionsBatch() を呼び出し、publishVersionForLakeTableBatch(...) を使用してグループ化された発行操作を実行します (RPC を削減し、スループットを向上させます)。無効にすると、デーモンは publishVersionForLakeTable(...) を介してトランザクションごとの発行に戻ります。この実装は、切り替えが切り替わったときに重複した発行を回避するために内部セットを使用して実行中の作業を調整し、`lake_publish_version_max_threads` を介してスレッドプールのサイズ設定の影響を受けます。
- 導入バージョン: v3.2.0
##### lake_enable_tablet_creation_optimization

- デフォルト値: false
- タイプ: boolean
- 単位: -
- 変更可能か: Yes
- 説明: 有効にすると、StarRocks は共有データモードのクラウドネイティブテーブルとマテリアライズドビューの tablet 作成を最適化します。具体的には、tablet ごとに個別のメタデータを作成する代わりに、物理パーティション下のすべての tablet に対して単一の共有 tablet メタデータを作成します。これにより、テーブル作成、rollup、および schema change ジョブ中に生成される tablet 作成タスクとメタデータ/ファイルの数が削減されます。この最適化は、クラウドネイティブテーブル/マテリアライズドビューにのみ適用され、`file_bundling` と組み合わせて使用されます (後者は同じ最適化ロジックを再利用します)。注意: schema change および rollup ジョブは、同一の名前のファイルの上書きを避けるために、`file_bundling` を使用するテーブルに対しては、この最適化を明示的に無効にします。有効にする場合は注意してください。作成される tablet メタデータの粒度が変わり、レプリカの作成とファイル命名の動作に影響を与える可能性があります。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0
##### lake_use_combined_txn_log

- デフォルト値: false
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: この項目が `true` に設定されている場合、システムは Lake テーブル が関連するトランザクションに結合されたトランザクションログパスを使用することを許可します。共有データクラスタでのみ利用可能です。
- 導入: v3.3.7, v3.4.0, v3.5.0
##### enable_iceberg_commit_queue

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: Icebergテーブルでコミットキューを有効にして、同時コミットの競合を回避するかどうかを指定します。 Icebergは、メタデータコミットに楽観的並行性制御 (OCC) を使用します。複数のスレッドが同じテーブルに同時にコミットすると、「コミットできません: ベースメタデータの場所が現在のテーブルメタデータの場所と同じではありません」のようなエラーが発生して競合が発生する可能性があります。有効にすると、各Icebergテーブルはコミット操作専用のシングルスレッドexecutorを持つため、同じテーブルへのコミットがシリアル化され、OCCの競合が防止されます。異なるテーブルは同時にコミットできるため、全体的なスループットが維持されます。これは信頼性を向上させるためのシステムレベルの最適化であり、デフォルトで有効にする必要があります。無効にすると、楽観ロックの競合により、同時コミットが失敗する可能性があります。
- 導入バージョン: v4.1.0
##### iceberg_commit_queue_timeout_seconds

- デフォルト値: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: Iceberg のコミット操作が完了するまでの待ち時間のタイムアウト（秒単位）。コミットキュー (`enable_iceberg_commit_queue=true`) を使用する場合、各コミット操作はこのタイムアウト内に完了する必要があります。コミットがこのタイムアウトより長くかかると、キャンセルされ、エラーが発生します。コミット時間に影響を与える要因には、コミットされるデータファイルの数、テーブルのメタデータのサイズ、基盤となるストレージ (例: S3、HDFS) のパフォーマンスなどがあります。
- 導入バージョン: v4.1.0
##### iceberg_commit_queue_max_size

- デフォルト値: 1000
- タイプ: Int
- 単位: Count
- 変更可能か: No
- 説明: Icebergテーブルごとの保留中のコミット操作の最大数。コミットキュー (`enable_iceberg_commit_queue=true`) を使用する場合、これは単一のテーブルに対してキューに入れることができるコミット操作の数を制限します。制限に達すると、追加のコミット操作は呼び出し元スレッドで実行されます (容量が利用可能になるまでブロックされます)。この構成はFEの起動時に読み取られ、新しく作成されたテーブルexecutorに適用されます。有効にするにはFEの再起動が必要です。同じテーブルへの同時コミットが多い場合は、この値を大きくしてください。この値が低すぎると、同時実行性が高い場合にコミットが呼び出し元スレッドでブロックされる可能性があります。
- 導入バージョン: v4.1.0
### その他
##### agent_task_resend_wait_time_ms

- デフォルト値: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能か: はい
- 説明: FE がエージェントタスクを再送信するまでに待機する必要がある時間。エージェントタスクは、タスクの作成時刻と現在の時刻の差がこのパラメータの値を超えた場合にのみ、再送信できます。このパラメータは、エージェントタスクの反復送信を防ぐために使用されます。
- 導入バージョン: -
##### allow_system_reserved_names

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: `__op` および `__row` で始まる名前の列をユーザーが作成できるようにするかどうかを指定します。この機能を有効にするには、このパラメータを `TRUE` に設定します。これらの名前の形式は StarRocks で特別な目的のために予約されており、このような列を作成すると未定義の動作が発生する可能性があることに注意してください。したがって、この機能はデフォルトで無効になっています。
- 導入: v3.2.0
##### auth_token

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: FE が属する StarRocks クラスタ内での ID 認証に使用されるトークン。このパラメータが指定されていない場合、StarRocks はクラスタの leader FE が最初に起動されたときに、クラスタのランダムなトークンを生成します。
- 導入: -
##### authentication_ldap_simple_bind_base_dn

- デフォルト値: 空文字列
- タイプ: String
- 単位: -
- 変更可能か: Yes
- 説明: ベースDN。これは、LDAPサーバーがユーザーの認証情報の検索を開始するポイントです。
- 導入バージョン: -
##### authentication_ldap_simple_bind_root_dn

- デフォルト値: 空文字列
- タイプ: String
- 単位: -
- 変更可能か: Yes
- 説明: ユーザーの認証情報を検索するために使用される管理者 DN 。
- 導入: -
##### authentication_ldap_simple_bind_root_pwd

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: ユーザーの認証情報を検索するために使用される、管理者パスワード。
- 導入: -
##### authentication_ldap_simple_server_host

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: Yes
- 説明: LDAP サーバーが実行されているホスト。
- 導入: -
##### authentication_ldap_simple_server_port

- デフォルト値: 389
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: LDAPサーバーのポート。
- 導入バージョン: -
##### authentication_ldap_simple_user_search_attr

- デフォルト値: uid
- 型: String
- 単位: -
- 変更可能: Yes
- 説明: LDAPオブジェクト内のユーザーを識別する属性の名前。
- 導入バージョン: -
##### backup_job_default_timeout_ms

- デフォルト: 86400 * 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: バックアップジョブのタイムアウト時間。この値を超えると、バックアップジョブは失敗します。
- 導入: -
##### enable_collect_tablet_num_in_show_proc_backend_disk_path

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: `SHOW PROC /BACKENDS/{id}` コマンドで、各ディスクの tablet 数を収集するかどうか。
- 導入バージョン: v4.0.1, v3.5.8
##### enable_colocate_restore

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: Colocate Table のバックアップとリストアを有効にするかどうかを指定します。 `true` は Colocate Table のバックアップとリストアを有効にすることを意味し、 `false` は無効にすることを意味します。
- 導入バージョン: v3.2.10, v3.3.3
##### enable_materialized_view_concurrent_prepare

- デフォルト値: true
- タイプ: Boolean
- 単位:
- 変更可能: Yes
- 説明: マテリアライズドビューの準備を並行して行い、パフォーマンスを向上させるかどうか。
- 導入バージョン: v3.4.4
##### enable_metric_calculator

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能かどうか: No
- 説明: 定期的にメトリクスを収集するために使用される機能を有効にするかどうかを指定します。有効な値: `TRUE` および `FALSE` 。 `TRUE` はこの機能を有効にすることを指定し、 `FALSE` はこの機能を無効にすることを指定します。
- 導入バージョン: -
##### enable_mv_post_image_reload_cache

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: FE がイメージをロードした後、リロードフラグのチェックを実行するかどうかを指定します。ベースマテリアライズドビューに対してチェックが実行された場合、それに関連する他のマテリアライズドビューでは不要になります。
- 導入バージョン: v3.5.0
##### enable_mv_query_context_cache

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: クエリ書き換えのパフォーマンスを向上させるために、クエリレベルのマテリアライズドビュー書き換えキャッシュを有効にするかどうかを指定します。
- 導入バージョン: v3.3
##### enable_mv_refresh_collect_profile

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: すべてのマテリアライズドビューにおいて、マテリアライズドビューのリフレッシュ時にデフォルトでプロファイルを収集するかどうかを設定します。
- 導入バージョン: v3.3.0
##### enable_mv_refresh_extra_prefix_logging

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: デバッグを容易にするために、マテリアライズドビュー名を持つプレフィックスをログに含めるかどうかを指定します。
- 導入バージョン: v3.4.0
##### enable_mv_refresh_query_rewrite

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: マテリアライズドビューのリフレッシュ中にクエリの書き換えを有効にするかどうか。クエリがベーステーブルではなく、書き換えられた mv を直接使用してクエリパフォーマンスを向上させることができるようにします。
- 導入バージョン: v3.3
##### enable_trace_historical_node

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: システムが履歴ノードを追跡できるようにするかどうかを指定します。この項目を `true` に設定すると、 Cache Sharing 機能を有効にして、伸縮自在なスケーリング中にシステムが適切なキャッシュノードを選択できるようになります。
- 導入: v3.5.1
##### es_state_sync_interval_second

- デフォルト値: 10
- タイプ: Long
- 単位: 秒
- 変更可能: いいえ
- 説明: FE が Elasticsearch インデックスを取得し、StarRocks 外部テーブルのメタデータを同期する時間間隔。
- 導入: -
##### hive_meta_cache_refresh_interval_s

- デフォルト値: 3600 * 2
- タイプ: Long
- 単位: 秒
- 変更可能: いいえ
- 説明: Hive 外部テーブルのキャッシュされたメタデータが更新される時間間隔。
- 導入バージョン: -
##### hive_meta_store_timeout_s

- デフォルト値: 10
- タイプ: Long
- 単位: 秒
- 変更可能か: いいえ
- 説明: Hive メタストアへの接続がタイムアウトするまでの時間。
- 導入: -
##### jdbc_connection_idle_timeout_ms

- デフォルト値: 600000
- タイプ: Int
- 単位: ミリ秒
- 変更可能か: いいえ
- 説明: JDBC catalog へのアクセスに使用される接続がタイムアウトするまでの最大時間。タイムアウトした接続はアイドル状態とみなされます。
- 導入バージョン: -
##### jdbc_connection_timeout_ms

- デフォルト: 10000
- タイプ: Long
- 単位: ミリ秒
- 変更可能か: いいえ
- 説明: HikariCP接続プールが接続を取得する際のタイムアウト（ミリ秒単位）。この時間内にプールから接続を取得できない場合、操作は失敗します。
- 導入バージョン: v3.5.13
##### jdbc_query_timeout_ms

- デフォルト: 30000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: JDBCステートメントのクエリ実行のタイムアウト（ミリ秒単位）。 このタイムアウトは、JDBC catalog （例えば、パーティションメタデータのクエリ）を通して実行される全てのSQLクエリに適用されます。 この値はJDBCドライバに渡される際に秒に変換されます。
- 導入バージョン: v3.5.13
##### jdbc_network_timeout_ms

- デフォルト: 30000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: JDBCネットワーク操作（ソケット読み取り）のタイムアウト（ミリ秒単位）。このタイムアウトは、外部データベースが応答しない場合に無期限のブロックを防ぐため、データベースのメタデータ呼び出し（例：getSchemas()、getTables()、getColumns()）に適用されます。
- 導入バージョン: v3.5.13
##### jdbc_connection_pool_size

- デフォルト: 8
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: JDBC catalog にアクセスするための JDBC コネクションプールの最大容量。
- 導入: -
##### jdbc_meta_default_cache_enable

- デフォルト値: false
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: JDBC Catalog のメタデータキャッシュを有効にするかどうかのデフォルト値です。True に設定すると、新しく作成された JDBC Catalog はデフォルトでメタデータキャッシュが有効になります。
- 導入バージョン: -
##### jdbc_meta_default_cache_expire_sec

- デフォルト値: 600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: JDBC Catalog のメタデータキャッシュのデフォルトの有効期限です。 `jdbc_meta_default_cache_enable` が true に設定されている場合、新しく作成された JDBC Catalog はデフォルトでメタデータキャッシュの有効期限を設定します。
- 導入バージョン: -
##### jdbc_minimum_idle_connections

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: JDBC catalog へのアクセスに使用する JDBC コネクションプールのアイドル接続の最小数。
- 導入バージョン: -
##### jwt_jwks_url

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: JSON Web Key Set (JWKS) サービスへのURL、または `fe/conf` ディレクトリ下の公開鍵ローカルファイルへのパス。
- 導入バージョン: v3.5.0
##### jwt_principal_field

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: JWT 内のサブジェクト (`sub`) を示すフィールドを識別するために使用される文字列。 デフォルト値は `sub` です。 このフィールドの値は、 StarRocks へのログインに使用するユーザー名と同一である必要があります。
- 導入: v3.5.0
##### jwt_required_audience

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: JWT 内のオーディエンス (`aud`) を識別するために使用される文字列のリスト。リスト内のいずれかの値が JWT オーディエンスと一致する場合にのみ、JWT は有効と見なされます。
- 導入バージョン: v3.5.0
##### jwt_required_issuer

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能かどうか: いいえ
- 説明: JWT 内の発行者 (`iss`) を識別するために使用される文字列のリスト。リスト内のいずれかの値が JWT の発行者と一致する場合にのみ、JWT は有効と見なされます。
- 導入バージョン: v3.5.0
##### locale

- デフォルト値: zh_CN.UTF-8
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE で使用される文字セットです。
- 導入: -
##### max_agent_task_threads_num

- デフォルト値: 4096
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: エージェントタスクスレッドプールで許可されるスレッドの最大数。
- 導入バージョン: -
##### max_download_task_per_be

- デフォルト値: 0
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 各RESTORE操作において、StarRocks が BE ノードに割り当てるダウンロードタスクの最大数。この項目が 0 以下に設定されている場合、タスク数に制限はありません。
- 導入バージョン: v3.1.0
##### max_mv_check_base_table_change_retry_times

- デフォルト値: 10
- タイプ: -
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューをリフレッシュする際に、ベーステーブルの変更を検出するための最大再試行回数。
- 導入バージョン: v3.3.0
##### max_mv_refresh_failure_retry_times

- デフォルト値: 1
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: マテリアライズドビューのリフレッシュが失敗した場合の最大リトライ回数。
- 導入バージョン: v3.3.0
##### max_mv_refresh_try_lock_failure_retry_times

- デフォルト値: 3
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビュー のリフレッシュに失敗した場合の、ロック試行の最大リトライ回数。
- 導入バージョン: v3.3.0
##### max_small_file_number

- デフォルト値: 100
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: FE ディレクトリに保存できる小さなファイルの最大数。
- 導入バージョン: -
##### max_small_file_size_bytes

- デフォルト値: 1024 * 1024
- タイプ: Int
- 単位: Bytes
- 変更可能: はい
- 説明: 小さいファイルの最大サイズ。
- 導入バージョン: -
##### max_upload_task_per_be

- デフォルト値: 0
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 各BACKUP操作において、StarRocks が BE ノードに割り当てるアップロードタスクの最大数。この項目が0以下に設定されている場合、タスク数に制限はありません。
- 導入バージョン: v3.1.0
##### mv_create_partition_batch_interval_ms

- デフォルト値: 1000
- タイプ: Int
- 単位: ms
- 変更可能: はい
- 説明: マテリアライズドビューのリフレッシュ中に、複数のパーティションを一括で作成する必要がある場合、システムはそれらを64個のパーティションずつのバッチに分割します。パーティションの頻繁な作成による障害のリスクを軽減するために、各バッチ間にデフォルトの間隔（ミリ秒単位）を設定して、作成頻度を制御します。
- 導入バージョン: v3.3
##### mv_plan_cache_max_size

- デフォルト値: 1000
- タイプ: Long
- 単位:
- 変更可能: はい
- 説明: マテリアライズドビューのプランキャッシュの最大サイズ（マテリアライズドビューの書き換えに使用されます）。透過的なクエリの書き換えに使用されるマテリアライズドビューが多い場合は、この値を大きくすることができます。
- 導入バージョン: v3.2
##### mv_plan_cache_thread_pool_size

- デフォルト値: 3
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューのプランキャッシュ (マテリアライズドビューのクエリの書き換えに使用) のデフォルトのスレッドプールサイズ。
- 導入バージョン: v3.2
##### mv_refresh_default_planner_optimize_timeout

- デフォルト値: 30000
- タイプ: -
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューをリフレッシュする際の、オプティマイザのプランニングフェーズにおけるデフォルトのタイムアウト時間です。
- 初出バージョン: v3.3.0
##### mv_refresh_fail_on_filter_data

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能か: Yes
- 説明: リフレッシュ中にフィルタリングされたデータがある場合、マテリアライズドビューのリフレッシュが失敗するかどうか。デフォルトでは true です。false の場合、フィルタリングされたデータを無視して成功を返します。
- 導入バージョン: -
##### mv_refresh_try_lock_timeout_ms

- デフォルト値: 30000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: マテリアライズドビューのリフレッシュが、ベーステーブル/マテリアライズドビューのDBロックを試行する際の、デフォルトのtry lockタイムアウトです。
- 導入バージョン: v3.3.0
##### oauth2_auth_server_url

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: 認証URL。OAuth 2.0 認証プロセスを開始するために、ユーザーのブラウザがリダイレクトされるURLです。
- 導入バージョン: v3.5.0
##### oauth2_client_id

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: StarRocks クライアントの公開識別子。
- 導入バージョン: v3.5.0
##### oauth2_client_secret

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: StarRocks クライアントを認証サーバーで認証するために使用されるシークレットです。
- 導入バージョン: v3.5.0
##### oauth2_jwks_url

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: JSON Web Key Set (JWKS) サービスへのURL、または `conf` ディレクトリ下のローカルファイルへのパス。
- 導入バージョン: v3.5.0
##### oauth2_principal_field

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT 内のサブジェクト (`sub`) を示すフィールドを識別するために使用される文字列。デフォルト値は `sub` です。このフィールドの値は、 StarRocks へのログインに使用するユーザー名と同一である必要があります。
- 導入: v3.5.0
##### oauth2_redirect_url

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: No
- 説明: OAuth 2.0認証が成功した後、ユーザーのブラウザがリダイレクトされるURL。 認証コードはこのURLに送信されます。 ほとんどの場合、`http://<starrocks_fe_url>:<fe_http_port>/api/oauth2`として構成する必要があります。
- 導入バージョン: v3.5.0
##### oauth2_required_audience

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT 内のオーディエンス (`aud`) を識別するために使用される文字列のリスト。リスト内のいずれかの値が JWT オーディエンスと一致する場合にのみ、JWT は有効と見なされます。
- 導入バージョン: v3.5.0
##### oauth2_required_issuer

- デフォルト: 空の文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT 内の発行者 (`iss`) を識別するために使用される文字列のリスト。リスト内のいずれかの値が JWT の発行者と一致する場合にのみ、JWT は有効と見なされます。
- 導入バージョン: v3.5.0
##### oauth2_token_server_url

- デフォルト値: 空の文字列
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: StarRocks がアクセス トークンを取得する、認証サーバー上のエンドポイントの URL。
- 導入バージョン: v3.5.0
##### plugin_dir

- デフォルト値: System.getenv("STARROCKS_HOME") + "/plugins"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: プラグインインストールパッケージを格納するディレクトリ。
- 導入: -
##### plugin_enable

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: プラグインを FE にインストールできるかどうか。プラグインは Leader FE でのみインストールまたはアンインストールできます。
- 導入: -
##### proc_profile_jstack_depth

- デフォルト値: 128
- タイプ: Int
- 単位: -
- 変更可能: Yes
- 説明: システムがCPUとメモリのプロファイルを収集する際の、Javaスタックの最大の深さ。この値は、サンプリングされた各スタックに対してキャプチャされるJavaスタックフレームの数を制御します。値を大きくすると、トレースの詳細と出力サイズが増加し、プロファイリングのオーバーヘッドが増える可能性があります。値を小さくすると、詳細が減少します。この設定は、CPUとメモリのプロファイリングの両方でプロファイラが開始されるときに使用されるため、診断のニーズとパフォーマンスへの影響のバランスを取るように調整してください。
- 導入バージョン: -
##### proc_profile_mem_enable

- デフォルト値: true
- 型: Boolean
- 単位: -
- 変更可能: Yes
- 説明: プロセスのメモリ割り当てプロファイルを収集するかどうか。この項目を `true` に設定すると、システムは `sys_log_dir/proc_profile` の下に `mem-profile-<timestamp>.html` という名前の HTML プロファイルを生成し、サンプリング中に `proc_profile_collect_time_s` 秒間スリープし、Java スタックの深さに `proc_profile_jstack_depth` を使用します。生成されたファイルは、`proc_profile_file_retained_days` と `proc_profile_file_retained_size_bytes` に従って圧縮およびパージされます。ネイティブ抽出パスは、`/tmp` の noexec の問題を回避するために `STARROCKS_HOME_DIR` を使用します。この項目は、メモリ割り当てのホットスポットのトラブルシューティングを目的としています。有効にすると、CPU、I/O、およびディスクの使用量が増加し、大きなファイルが生成される可能性があります。
- 導入バージョン: v3.2.12
##### query_detail_explain_level

- デフォルト値: COSTS
- タイプ: String
- 単位: -
- 変更可能: true
- 説明: EXPLAIN ステートメントによって返されるクエリプランの詳細レベル。有効な値: COSTS、NORMAL、VERBOSE。
- 導入バージョン: v3.2.12、v3.3.5
##### replication_interval_ms

- デフォルト値: 100
- タイプ: Int
- 単位: -
- 変更可能か: いいえ
- 説明: レプリケーションタスクがスケジュールされる最小時間間隔。
- 導入バージョン: v3.3.5
##### replication_max_parallel_data_size_mb

- デフォルト値: 1048576
- タイプ: Int
- 単位: MB
- 変更可能: はい
- 説明: 並行同期が許可されるデータの最大サイズ。
- 導入バージョン: v3.3.5
##### replication_max_parallel_replica_count

- デフォルト値: 10240
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 同時同期が許可される tablet レプリカの最大数。
- 導入バージョン: v3.3.5
##### replication_max_parallel_table_count

- デフォルト値: 100
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: 許可される同時データ同期タスクの最大数。 StarRocks は、テーブルごとに1つの同期タスクを作成します。
- 導入バージョン: v3.3.5
##### replication_transaction_timeout_sec

- デフォルト値: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 同期タスクのタイムアウト期間。
- 導入バージョン: v3.3.5
##### skip_whole_phase_lock_mv_limit

- デフォルト値: 5
- タイプ: Int
- 単位: -
- 変更可能か: Yes
- 説明: StarRocks が、関連するマテリアライズドビューを持つテーブルに対して「ロックなし」最適化を適用するタイミングを制御します。この項目が 0 未満に設定されている場合、システムは常にロックなし最適化を適用し、クエリのために関連するマテリアライズドビューをコピーしません (FE のメモリ使用量とメタデータのコピー/ロック競合は削減されますが、メタデータの同時実行性の問題のリスクが増加する可能性があります)。0 に設定されている場合、ロックなし最適化は無効になります (システムは常に安全なコピーアンドロックパスを使用します)。0 より大きい値に設定されている場合、ロックなし最適化は、関連するマテリアライズドビューの数が、設定されたしきい値以下のテーブルに対してのみ適用されます。さらに、値が 0 以上の場合、プランナーはクエリ OLAP テーブルをオプティマイザコンテキストに記録し、マテリアライズドビュー関連の書き換えパスを有効にします。0 未満の場合、このステップはスキップされます。
- 導入バージョン: v3.2.1
##### small_file_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/small_files"
- タイプ: String
- 単位: -
- 変更可能か: いいえ
- 説明: スモールファイルのルートディレクトリ。
- 導入バージョン: -
##### task_runs_max_history_number

- デフォルト: 10000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: メモリに保持するタスク実行レコードの最大数。アーカイブされたタスク実行履歴をクエリする際のデフォルトの LIMIT として使用されます。`enable_task_history_archive` が false の場合、この値はインメモリ履歴の範囲を制限します。強制的に GC は古いエントリを削除し、最新の `task_runs_max_history_number` のみが残ります。アーカイブ履歴がクエリされる場合（明示的な LIMIT が指定されていない場合）、この値が 0 より大きい場合、`TaskRunHistoryTable.lookup` は `"ORDER BY create_time DESC LIMIT <value>"` を使用します。注意: これを 0 に設定すると、クエリ側の LIMIT は無効になります（上限なし）。ただし、アーカイブが有効になっていない限り、インメモリ履歴は 0 に切り捨てられます。
- 導入バージョン: v3.2.0
##### tmp_dir

- デフォルト値: StarRocksFE.STARROCKS_HOME_DIR + "/temp_dir"
- タイプ: String
- 単位: -
- 変更可能か: No
- 説明: バックアップやリストアの手順中に生成されるファイルなど、一時ファイルを保存するディレクトリ。これらの手順が完了すると、生成された一時ファイルは削除されます。
- 導入バージョン: -
##### transform_type_prefer_string_for_varchar

- デフォルト値: true
- タイプ: Boolean
- 単位: -
- 変更可能: Yes
- 説明: マテリアライズドビューの作成およびCTAS操作において、固定長のvarcharカラムに対してstring型を優先するかどうかを指定します。
- 導入バージョン: v4.0.0

<EditionSpecificFEItem />