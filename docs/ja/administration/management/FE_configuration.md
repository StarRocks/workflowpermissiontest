---
displayed_sidebar: docs
---

import FEConfigMethod from '../../_assets/commonMarkdown/FE_config_method.mdx'

import AdminSetFrontendNote from '../../_assets/commonMarkdown/FE_config_note.mdx'

import StaticFEConfigNote from '../../_assets/commonMarkdown/StaticFE_config_note.mdx'

import EditionSpecificFEItem from '../../_assets/commonMarkdown/Edition_Specific_FE_Item.mdx'

# FE 設定

<FEConfigMethod />

## FE 設定項目を表示

FE の起動後、MySQL クライアントで ADMIN SHOW FRONTEND CONFIG コマンドを実行して、パラメーター設定を確認できます。特定のパラメーターの設定をクエリしたい場合は、次のコマンドを実行します。

```SQL
ADMIN SHOW FRONTEND CONFIG [LIKE "pattern"];
```

返されるフィールドの詳細な説明については、[`ADMIN SHOW CONFIG`](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SHOW_CONFIG.md) を参照してください。

:::note
クラスター管理関連のコマンドを実行するには、管理者権限が必要です。
:::

## FE パラメーターの設定

### FE 動的パラメーターの設定

[`ADMIN SET FRONTEND CONFIG`](../../sql-reference/sql-statements/cluster-management/config_vars/ADMIN_SET_CONFIG.md) を使用して、FE 動的パラメーターの設定を構成または変更できます。

```SQL
ADMIN SET FRONTEND CONFIG ("key" = "value");
```

<AdminSetFrontendNote />

### FE 静的パラメーターの設定

<StaticFEConfigNote />

## FE パラメーターについて理解する

### ロギング

##### `audit_log_delete_age`

- デフォルト: 30d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルの保持期間。デフォルト値 `30d` は、各監査ログファイルが 30 日間保持できることを指定します。StarRocks は各監査ログファイルをチェックし、30 日以上前に生成されたファイルを削除します。
- 導入バージョン: -

##### `audit_log_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/log"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 監査ログファイルが保存されるディレクトリ。
- 導入バージョン: -

##### `audit_log_enable_compress`

- デフォルト: false
- タイプ: Boolean
- 単位: N/A
- 変更可能: いいえ
- 説明: true の場合、生成された Log4j2 設定は、ローテーションされた監査ログファイル名 (fe.audit.log.*) に ".gz" 接尾辞を追加し、Log4j2 がロールオーバー時に圧縮された (.gz) アーカイブ監査ログファイルを生成するようにします。この設定は、FE 起動時に Log4jConfig.initLogging で読み込まれ、監査ログの RollingFile アペンダーに適用されます。アクティブな監査ログには影響せず、ローテーション/アーカイブされたファイルにのみ影響します。値は起動時に初期化されるため、変更を反映するには FE の再起動が必要です。監査ログのローテーション設定 (`audit_log_dir`、`audit_log_roll_interval`、`audit_roll_maxsize`、`audit_log_roll_num`) と組み合わせて使用します。
- 導入バージョン: 3.2.12

##### `audit_log_json_format`

- デフォルト: false
- タイプ: Boolean
- 単位: N/A
- 変更可能: はい
- 説明: true の場合、FE 監査イベントは、デフォルトのパイプ区切り "key=value" 文字列の代わりに、構造化された JSON (Jackson ObjectMapper が注釈付き AuditEvent フィールドの Map をシリアル化) として出力されます。この設定は、AuditLogBuilder が処理するすべての組み込み監査シンクに影響します。接続監査、クエリ監査、大規模クエリ監査 (イベントが条件を満たす場合、大規模クエリしきい値フィールドが JSON に追加されます)、および低速監査出力です。大規模クエリしきい値および "features" フィールドに注釈が付けられたフィールドは特別に扱われます (通常の監査エントリから除外され、適用される場合、大規模クエリまたは機能ログに含まれます)。ログコレクターまたは SIEM のためにログを機械解析可能にするには、これを有効にします。ログ形式が変更され、従来のパイプ区切り形式を期待する既存のパーサーの更新が必要になる場合があることに注意してください。
- 導入バージョン: 3.2.7

##### `audit_log_modules`

- デフォルト: `slow_query`, query
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks が監査ログエントリを生成するモジュール。デフォルトでは、StarRocks は `slow_query` モジュールと `query` モジュールの監査ログを生成します。`connection` モジュールは v3.0 からサポートされています。モジュール名をコンマ (,) とスペースで区切ります。
- 導入バージョン: -

##### `audit_log_roll_interval`

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks が監査ログエントリをローテーションする時間間隔。有効な値: `DAY` と `HOUR`。
  - このパラメーターが `DAY` に設定されている場合、監査ログファイル名に `yyyyMMdd` 形式のサフィックスが追加されます。
  - このパラメーターが `HOUR` に設定されている場合、監査ログファイル名に `yyyyMMddHH` 形式のサフィックスが追加されます。
- 導入バージョン: -

##### `audit_log_roll_num`

- デフォルト: 90
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: `audit_log_roll_interval` パラメーターで指定された保持期間内に保持できる監査ログファイルの最大数。
- 導入バージョン: -

##### `bdbje_log_level`

- デフォルト: INFO
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks で Berkeley DB Java Edition (BDB JE) が使用するロギングレベルを制御します。BDB 環境の初期化中に、BDBEnvironment.initConfigs() はこの値を `com.sleepycat.je` パッケージの Java ロガーと BDB JE 環境ファイルロギングレベル (`EnvironmentConfig.FILE_LOGGING_LEVEL`) に適用します。SEVERE、WARNING、INFO、CONFIG、FINE、FINER、FINEST、ALL、OFF などの標準的な java.util.logging.Level 名を受け入れます。ALL に設定すると、すべてのログメッセージが有効になります。冗長性を高めるとログのボリュームが増加し、ディスク I/O とパフォーマンスに影響を与える可能性があります。値は BDB 環境が初期化されるときに読み取られるため、環境の (再) 初期化後にのみ有効になります。
- 導入バージョン: v3.2.0

##### `big_query_log_delete_age`

- デフォルト: 7d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE の大規模クエリログファイル (`fe.big_query.log.*`) が自動削除されるまでの保持期間を制御します。この値は、Log4j の削除ポリシーに IfLastModified の期間として渡されます。最後に変更された時刻がこの値よりも古いローテーションされた大規模クエリログは削除されます。`d` (日)、`h` (時間)、`m` (分)、`s` (秒) などのサフィックスをサポートします。例: `7d` (7 日)、`10h` (10 時間)、`60m` (60 分)、`120s` (120 秒)。この項目は `big_query_log_roll_interval` および `big_query_log_roll_num` と連携して、どのファイルを保持または削除するかを決定します。
- 導入バージョン: v3.2.0

##### `big_query_log_dir`

- デフォルト: `Config.STARROCKS_HOME_DIR + "/log"`
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE が大規模クエリダンプログ (`fe.big_query.log.*`) を書き込むディレクトリ。Log4j 設定は、このパスを使用して `fe.big_query.log` およびそのローテーションされたファイルの RollingFile アペンダーを作成します。ローテーションと保持は、`big_query_log_roll_interval` (時間ベースのサフィックス)、`log_roll_size_mb` (サイズトリガー)、`big_query_log_roll_num` (最大ファイル数)、および `big_query_log_delete_age` (年齢ベースの削除) によって管理されます。大規模クエリレコードは、`big_query_log_cpu_second_threshold`、`big_query_log_scan_rows_threshold`、または `big_query_log_scan_bytes_threshold` などのユーザー定義のしきい値を超えるクエリに対してログに記録されます。どのモジュールがこのファイルにログを記録するかを制御するには、`big_query_log_modules` を使用します。
- 導入バージョン: v3.2.0

##### `big_query_log_modules`

- デフォルト: `{"query"}`
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: モジュールごとの大規模クエリロギングを有効にするモジュール名サフィックスのリスト。典型的な値は論理コンポーネント名です。たとえば、デフォルトの `query` は `big_query.query` を生成します。
- 導入バージョン: v3.2.0

##### `big_query_log_roll_interval`

- デフォルト: `"DAY"`
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: `big_query` ログアペンダーのローリングファイル名の日付部分を構築するために使用される時間間隔を指定します。有効な値 (大文字と小文字を区別しない) は `DAY` (デフォルト) と `HOUR` です。`DAY` は日次パターン (`"%d{yyyyMMdd}"`) を生成し、`HOUR` は時間次パターン (`"%d{yyyyMMddHH}"`) を生成します。この値は、サイズベースのロールオーバー (`big_query_roll_maxsize`) とインデックスベースのロールオーバー (`big_query_log_roll_num`) と組み合わされて、RollingFile の filePattern を形成します。無効な値はログ設定の生成を失敗させ (IOException)、ログの初期化または再設定を妨げる可能性があります。`big_query_log_dir`、`big_query_roll_maxsize`、`big_query_log_roll_num`、および `big_query_log_delete_age` と組み合わせて使用します。
- 導入バージョン: v3.2.0

##### `big_query_log_roll_num`

- デフォルト: 10
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: `big_query_log_roll_interval` ごとに保持するローテーションされた FE 大規模クエリログファイルの最大数。この値は、`fe.big_query.log` の RollingFile アペンダーの DefaultRolloverStrategy `max` 属性にバインドされます。ログが (時間または `log_roll_size_mb` によって) ロールする場合、StarRocks は最大 `big_query_log_roll_num` 個のインデックス付きファイル (filePattern は時間サフィックスとインデックスを使用) を保持します。この数よりも古いファイルはロールオーバーによって削除される可能性があり、`big_query_log_delete_age` はさらに最終変更日時に基づいてファイルを削除できます。
- 導入バージョン: v3.2.0

##### `dump_log_delete_age`

- デフォルト: 7d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: ダンプログファイルの保持期間。デフォルト値 `7d` は、各ダンプログファイルが 7 日間保持できることを指定します。StarRocks は各ダンプログファイルをチェックし、7 日以上前に生成されたファイルを削除します。
- 導入バージョン: -

##### `dump_log_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/log"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: ダンプログファイルが保存されるディレクトリ。
- 導入バージョン: -

##### `dump_log_modules`

- デフォルト: query
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks がダンプログエントリを生成するモジュール。デフォルトでは、StarRocks はクエリモジュールのダンプログを生成します。モジュール名をコンマ (,) とスペースで区切ります。
- 導入バージョン: -

##### `dump_log_roll_interval`

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks がダンプログエントリをローテーションする時間間隔。有効な値: `DAY` と `HOUR`。
  - このパラメーターが `DAY` に設定されている場合、ダンプログファイル名に `yyyyMMdd` 形式のサフィックスが追加されます。
  - このパラメーターが `HOUR` に設定されている場合、ダンプログファイル名に `yyyyMMddHH` 形式のサフィックスが追加されます。
- 導入バージョン: -

##### `dump_log_roll_num`

- デフォルト: 10
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: `dump_log_roll_interval` パラメーターで指定された保持期間内に保持できるダンプログファイルの最大数。
- 導入バージョン: -

##### `edit_log_write_slow_log_threshold_ms`

- デフォルト: 2000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: JournalWriter が低速な編集ログバッチ書き込みを検出してログに記録するために使用するしきい値 (ミリ秒単位)。バッチコミット後、バッチ期間がこの値を超えると、JournalWriter はバッチサイズ、期間、現在のジャーナルキューサイズを含む WARN を出力します (約 2 秒に 1 回にレート制限されます)。この設定は、FE リーダーでの潜在的な I/O またはレプリケーションの遅延に対するロギング/アラートのみを制御します。コミットまたはロールの動作は変更しません (`edit_log_roll_num` およびコミット関連の設定を参照)。メトリックの更新は、このしきい値に関係なく発生します。
- 導入バージョン: v3.2.3

##### `enable_audit_sql`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: この項目が `true` に設定されている場合、FE 監査サブシステムは、ConnectProcessor によって処理されたステートメントの SQL テキストを FE 監査ログ (`fe.audit.log`) に記録します。保存されるステートメントは、他の制御を尊重します。暗号化されたステートメントは編集され (`AuditEncryptionChecker`)、`enable_sql_desensitize_in_log` が設定されている場合、機密性の高い資格情報は編集または非機密化される場合があります。ダイジェスト記録は `enable_sql_digest` によって制御されます。`false` に設定されている場合、ConnectProcessor は監査イベントのステートメントテキストを "?" に置き換えます。他の監査フィールド (ユーザー、ホスト、期間、ステータス、`qe_slow_log_ms` による低速クエリ検出、およびメトリック) は引き続き記録されます。SQL 監査を有効にすると、フォレンジックとトラブルシューティングの可視性が向上しますが、機密性の高い SQL コンテンツが公開され、ログのボリュームと I/O が増加する可能性があります。無効にすると、監査ログでの完全なステートメントの可視性を失う代わりにプライバシーが向上します。
- 導入バージョン: -

##### `enable_profile_log`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: プロファイルロギングを有効にするかどうか。この機能が有効な場合、FE はクエリごとのプロファイルログ (`ProfileManager` によって生成されるシリアル化された `queryDetail` JSON) をプロファイルログシンクに書き込みます。このロギングは `enable_collect_query_detail_info` も有効な場合にのみ実行されます。`enable_profile_log_compress` が有効な場合、JSON はロギング前に gzip 圧縮される場合があります。プロファイルログファイルは `profile_log_dir`、`profile_log_roll_num`、`profile_log_roll_interval` によって管理され、`profile_log_delete_age` ( `7d`、`10h`、`60m`、`120s` のような形式をサポート) に従ってローテーション/削除されます。この機能を無効にすると、プロファイルログの書き込みが停止します (ディスク I/O、圧縮 CPU、ストレージの使用量が削減されます)。
- 導入バージョン: v3.2.5

##### `enable_qe_slow_log`

- デフォルト: true
- タイプ: Boolean
- 単位: N/A
- 変更可能: はい
- 説明: 有効にすると、FE 組み込み監査プラグイン (AuditLogBuilder) は、測定された実行時間 ("Time" フィールド) が `qe_slow_log_ms` で構成されたしきい値を超えるクエリイベントを低速クエリ監査ログ (AuditLog.getSlowAudit) に書き込みます。無効にすると、これらの低速クエリエントリは抑制されます (通常のクエリおよび接続監査ログは影響を受けません)。低速監査エントリは、グローバルな `audit_log_json_format` 設定 (JSON vs. プレーン文字列) に従います。このフラグを使用して、通常の監査ロギングとは独立して低速クエリ監査の生成量を制御します。これをオフにすると、`qe_slow_log_ms` が低い場合や、ワークロードが多数の長時間実行クエリを生成する場合に、ログ I/O を削減できます。
- 導入バージョン: 3.2.11

##### `enable_sql_desensitize_in_log`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: この項目が `true` に設定されている場合、システムはログおよびクエリ詳細レコードに書き込まれる前に、機密性の高い SQL コンテンツを置き換えたり隠したりします。この設定を尊重するコードパスには、ConnectProcessor.formatStmt (監査ログ)、StmtExecutor.addRunningQueryDetail (クエリ詳細)、および SimpleExecutor.formatSQL (内部エグゼキュータログ) が含まれます。この機能が有効になっている場合、無効な SQL は固定された非機密化メッセージに置き換えられることがあり、資格情報 (ユーザー/パスワード) は隠され、SQL フォーマッターはサニタイズされた表現を生成する必要があります (ダイジェストスタイルの出力も有効にできます)。これにより、監査/内部ログでの機密リテラルや資格情報の漏洩が減りますが、ログやクエリ詳細に元の完全な SQL テキストが含まれなくなることになります (これは再生やデバッグに影響を与える可能性があります)。
- 導入バージョン: -

##### `internal_log_delete_age`

- デフォルト: 7d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE 内部ログファイル (`internal_log_dir` に書き込まれる) の保持期間を指定します。値は期間文字列です。サポートされるサフィックス: `d` (日)、`h` (時間)、`m` (分)、`s` (秒)。例: `7d` (7 日)、`10h` (10 時間)、`60m` (60 分)、`120s` (120 秒)。この項目は、RollingFile Delete ポリシーで使用される `<IfLastModified age="..."/>` 述語として log4j 設定に代入されます。最終変更時刻がこの期間よりも前のファイルは、ログロールオーバー中に削除されます。ディスク領域をより早く解放するにはこの値を増やし、内部マテリアライズドビューまたは統計ログをより長く保持するにはこの値を減らします。
- 導入バージョン: v3.2.4

##### `internal_log_dir`

- デフォルト: `Config.STARROCKS_HOME_DIR` + "/log"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE ロギングサブシステムが内部ログ (`fe.internal.log`) を保存するために使用するディレクトリ。この設定は Log4j 設定に代入され、InternalFile アペンダーが内部/マテリアライズドビュー/統計ログを書き込む場所、および `internal.<module>` の下のモジュールごとのロガーがファイルを配置する場所を決定します。ディレクトリが存在し、書き込み可能であり、十分なディスク領域があることを確認してください。このディレクトリ内のファイルのログローテーションと保持は、`log_roll_size_mb`、`internal_log_roll_num`、`internal_log_delete_age`、および `internal_log_roll_interval` によって制御されます。`sys_log_to_console` が有効な場合、内部ログはこのディレクトリではなくコンソールに書き込まれる場合があります。
- 導入バージョン: v3.2.4

##### `internal_log_json_format`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、内部統計/監査エントリはコンパクトな JSON オブジェクトとして統計監査ロガーに書き込まれます。JSON には、"executeType" (InternalType: QUERY または DML)、"queryId"、"sql"、"time" (経過ミリ秒) のキーが含まれます。`false` に設定されている場合、同じ情報は 1 行のフォーマット済みテキストとしてログに記録されます ("statistic execute: ... | QueryId: [...] | SQL: ...")。JSON を有効にすると、機械解析とログプロセッサーとの統合が向上しますが、生の SQL テキストがログに含まれるため、機密情報が公開され、ログサイズが増加する可能性があります。
- 導入バージョン: -

##### `internal_log_modules`

- デフォルト: `{"base", "statistic"}`
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: 専用の内部ロギングを受け取るモジュール識別子のリスト。各エントリ X について、Log4j はレベル INFO で additivity="false" の `internal.<X>` という名前のロガーを作成します。これらのロガーは、内部アペンダー (`fe.internal.log` に書き込まれる) または `sys_log_to_console` が有効な場合はコンソールにルーティングされます。必要に応じて短い名前またはパッケージフラグメントを使用してください。正確なロガー名は `internal.` + 構成された文字列になります。内部ログファイルのローテーションと保持は、`internal_log_dir`、`internal_log_roll_num`、`internal_log_delete_age`、`internal_log_roll_interval`、および `log_roll_size_mb` に従います。モジュールを追加すると、その実行時メッセージが内部ロガーストリームに分離され、デバッグと監査が容易になります。
- 導入バージョン: v3.2.4

##### `internal_log_roll_interval`

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE 内部ログアペンダーの時間ベースのロール間隔を制御します。受け入れられる値 (大文字と小文字を区別しない) は `HOUR` と `DAY` です。`HOUR` は時間単位のファイルパターン (`"%d{yyyyMMddHH}"`) を生成し、`DAY` は日単位のファイルパターン (`"%d{yyyyMMdd}"`) を生成します。これらは RollingFile TimeBasedTriggeringPolicy によってローテーションされた `fe.internal.log` ファイルの名前を付けるために使用されます。無効な値は初期化を失敗させます (アクティブな Log4j 設定の構築時に IOException がスローされます)。ロール動作は、`internal_log_dir`、`internal_roll_maxsize`、`internal_log_roll_num`、および `internal_log_delete_age` などの関連設定にも依存します。
- 導入バージョン: v3.2.4

##### `internal_log_roll_num`

- デフォルト: 90
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: 内部アペンダー (`fe.internal.log`) に対して保持する、ローテーションされた内部 FE ログファイルの最大数。この値は Log4j DefaultRolloverStrategy の `max` 属性として使用されます。ロールオーバーが発生すると、StarRocks は最大 `internal_log_roll_num` 個のアーカイブファイルを保持し、古いファイルを削除します (これも `internal_log_delete_age` によって管理されます)。値を小さくするとディスク使用量が削減されますが、ログ履歴が短くなります。値を大きくすると、より多くの履歴内部ログが保持されます。この項目は `internal_log_dir`、`internal_log_roll_interval`、および `internal_roll_maxsize` と連携して機能します。
- 導入バージョン: v3.2.4

##### `log_cleaner_audit_log_min_retention_days`

- デフォルト: 3
- タイプ: Int
- 単位: 日
- 変更可能: はい
- 説明: 監査ログファイルの最小保持日数。この日数よりも新しい監査ログファイルは、ディスク使用量が多い場合でも削除されません。これにより、監査ログがコンプライアンスおよびトラブルシューティングの目的で保持されることが保証されます。
- 導入バージョン: -

##### `log_cleaner_check_interval_second`

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: ディスク使用量をチェックし、ログをクリーンアップする間隔 (秒単位)。クリーナーは、各ログディレクトリのディスク使用量を定期的にチェックし、必要に応じてクリーンアップをトリガーします。デフォルトは 300 秒 (5 分) です。
- 導入バージョン: -

##### `log_cleaner_disk_usage_target`

- デフォルト: 60
- タイプ: Int
- 単位: パーセンテージ
- 変更可能: はい
- 説明: ログクリーンアップ後の目標ディスク使用量 (パーセンテージ)。ログクリーンアップは、ディスク使用量がこのしきい値を下回るまで続行されます。クリーナーは、目標に到達するまで最も古いログファイルを 1 つずつ削除します。
- 導入バージョン: -

##### `log_cleaner_disk_usage_threshold`

- デフォルト: 80
- タイプ: Int
- 単位: パーセンテージ
- 変更可能: はい
- 説明: ログクリーンアップをトリガーするディスク使用量しきい値 (パーセンテージ)。ディスク使用量がこのしきい値を超えると、ログクリーンアップが開始されます。クリーナーは、構成された各ログディレクトリを独立してチェックし、このしきい値を超えるディレクトリを処理します。
- 導入バージョン: -

##### `log_cleaner_disk_util_based_enable`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: ディスク使用量に基づいた自動ログクリーンアップを有効にします。有効にすると、ディスク使用量がしきい値を超えたときにログがクリーンアップされます。ログクリーナーは FE ノードでバックグラウンドデーモンとして実行され、ログファイルの蓄積によるディスク領域の枯渇を防ぐのに役立ちます。
- 導入バージョン: -

##### `log_plan_cancelled_by_crash_be`

- デフォルト: true
- タイプ: boolean
- 単位: -
- 変更可能: はい
- 説明: BE クラッシュまたは RPC 例外によりクエリがキャンセルされた場合に、クエリ実行プランのロギングを有効にするかどうか。この機能が有効な場合、StarRocks は、BE クラッシュまたは `RpcException` によりクエリがキャンセルされた場合に、クエリ実行プラン (`TExplainLevel.COSTS` レベルで) を WARN エントリとしてログに記録します。ログエントリには QueryId、SQL、および COSTS プランが含まれます。ExecuteExceptionHandler パスでは、例外スタックトレースもログに記録されます。`enable_collect_query_detail_info` が有効な場合 (この場合、プランはクエリ詳細に保存されます) はロギングはスキップされます。コードパスでは、クエリ詳細が null であることを確認することでチェックが実行されます。ExecuteExceptionHandler では、プランは最初の再試行時 (`retryTime == 0`) にのみログに記録されることに注意してください。これを有効にすると、完全な COSTS プランが大きくなる可能性があるため、ログのボリュームが増加する可能性があります。
- 導入バージョン: v3.2.0

##### `log_register_and_unregister_query_id`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: FE が QeProcessorImpl からのクエリ登録および登録解除メッセージ (例: `"register query id = {}"` および `"deregister query id = {}"`) をログに記録することを許可するかどうか。ログは、クエリに null 以外の ConnectContext があり、かつコマンドが `COM_STMT_EXECUTE` でないか、またはセッション変数 `isAuditExecuteStmt()` が true の場合にのみ出力されます。これらのメッセージはすべてのクエリライフサイクルイベントに対して書き込まれるため、この機能を有効にすると、ログのボリュームが大きくなり、高並行環境ではスループットのボトルネックになる可能性があります。デバッグまたは監査のために有効にし、ロギングオーバーヘッドを削減しパフォーマンスを向上させるために無効にしてください。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0

##### `log_roll_size_mb`

- デフォルト: 1024
- タイプ: Int
- 単位: MB
- 変更可能: いいえ
- 説明: システムログファイルまたは監査ログファイルの最大サイズ。
- 導入バージョン: -

##### `proc_profile_file_retained_days`

- デフォルト: 1
- タイプ: Int
- 単位: 日
- 変更可能: はい
- 説明: `sys_log_dir/proc_profile` の下に生成されるプロセスプロファイリングファイル (CPU およびメモリ) を保持する日数。ProcProfileCollector は、現在の時刻から `proc_profile_file_retained_days` 日を引いたカットオフを計算し (yyyyMMdd-HHmmss 形式)、タイムスタンプ部分がそのカットオフよりも辞書順で早いプロファイルファイルを削除します (つまり、`timePart.compareTo(timeToDelete) < 0`)。ファイルの削除は、`proc_profile_file_retained_size_bytes` によって制御されるサイズベースのカットオフも尊重します。プロファイルファイルは `cpu-profile-` および `mem-profile-` のプレフィックスを使用し、収集後に圧縮されます。
- 導入バージョン: v3.2.12

##### `proc_profile_file_retained_size_bytes`

- デフォルト: 2L * 1024 * 1024 * 1024 (2147483648)
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: プロファイルディレクトリの下に保持する、収集された CPU およびメモリプロファイルファイル (プレフィックス `cpu-profile-` および `mem-profile-` の付いたファイル) の合計バイト数の最大値。有効なプロファイルファイルの合計が `proc_profile_file_retained_size_bytes` を超えると、コレクターは残りの合計サイズが `proc_profile_file_retained_size_bytes` 以下になるまで最も古いプロファイルファイルを削除します。`proc_profile_file_retained_days` よりも古いファイルもサイズに関係なく削除されます。この設定はプロファイルアーカイブのディスク使用量を制御し、`proc_profile_file_retained_days` と相互作用して削除順序と保持を決定します。
- 導入バージョン: v3.2.12

##### `profile_log_delete_age`

- デフォルト: 1d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE プロファイルログファイルが削除対象となるまでの保持期間を制御します。この値は Log4j の `<IfLastModified age="..."/>` ポリシー (`Log4jConfig` 経由) に挿入され、`profile_log_roll_interval` や `profile_log_roll_num` などのローテーション設定と組み合わせて適用されます。サポートされるサフィックス: `d` (日)、`h` (時間)、`m` (分)、`s` (秒)。例: `7d` (7 日)、`10h` (10 時間)、`60m` (60 分)、`120s` (120 秒)。
- 導入バージョン: v3.2.5

##### `profile_log_dir`

- デフォルト: `Config.STARROCKS_HOME_DIR` + "/log"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE プロファイルログが書き込まれるディレクトリ。Log4jConfig はこの値を使用してプロファイル関連のアペンダーを配置します (このディレクトリの下に `fe.profile.log` や `fe.features.log` などのファイルを作成します)。これらのファイルのローテーションと保持は、`profile_log_roll_size_mb`、`profile_log_roll_num`、および `profile_log_delete_age` によって管理されます。タイムスタンプサフィックス形式は `profile_log_roll_interval` (DAY または HOUR をサポート) によって制御されます。デフォルトディレクトリは `STARROCKS_HOME_DIR` の下にあるため、FE プロセスがこのディレクトリに対する書き込み権限とローテーション/削除権限を持っていることを確認してください。
- 導入バージョン: v3.2.5

##### `profile_log_roll_interval`

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: プロファイルログファイル名の日付部分を生成するために使用される時間粒度を制御します。有効な値 (大文字と小文字を区別しない) は `HOUR` と `DAY` です。`HOUR` は `"%d{yyyyMMddHH}"` (時間単位のタイムバケット) のパターンを生成し、`DAY` は `"%d{yyyyMMdd}"` (日単位のタイムバケット) を生成します。この値は Log4j 設定で `profile_file_pattern` を計算する際に使用され、ロールオーバーファイル名の時間ベースのコンポーネントにのみ影響します。サイズベースのロールオーバーは引き続き `profile_log_roll_size_mb` によって制御され、保持は `profile_log_roll_num` / `profile_log_delete_age` によって制御されます。無効な値はロギング初期化中に IOException を引き起こします (エラーメッセージ: `"profile_log_roll_interval config error: <value>"`)。高ボリュームプロファイリングではファイルごとのサイズを時間単位で制限するために `HOUR` を選択し、日単位の集計では `DAY` を選択します。
- 導入バージョン: v3.2.5

##### `profile_log_roll_num`

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: プロファイルロガーの Log4j DefaultRolloverStrategy によって保持される、ローテーションされたプロファイルログファイルの最大数を指定します。この値は、ロギング XML に `${profile_log_roll_num}` (例: `<DefaultRolloverStrategy max="${profile_log_roll_num}" fileIndex="min">`) として挿入されます。ローテーションは `profile_log_roll_size_mb` または `profile_log_roll_interval` によってトリガーされます。ローテーションが発生すると、Log4j は最大でこれらのインデックス付きファイルを保持し、古いインデックスファイルは削除対象となります。ディスク上の実際の保持は、`profile_log_delete_age` および `profile_log_dir` の場所にも影響されます。値を小さくするとディスク使用量が削減されますが、保持される履歴が制限されます。値を大きくすると、より多くの履歴プロファイルログが保持されます。
- 導入バージョン: v3.2.5

##### `profile_log_roll_size_mb`

- デフォルト: 1024
- タイプ: Int
- 単位: MB
- 変更可能: いいえ
- 説明: FE プロファイルログファイルのサイズベースのロールオーバーをトリガーするサイズしきい値 (メガバイト単位) を設定します。この値は `ProfileFile` アペンダーの Log4j RollingFile SizeBasedTriggeringPolicy によって使用されます。プロファイルログが `profile_log_roll_size_mb` を超えると、ローテーションされます。ローテーションは、`profile_log_roll_interval` に到達した場合にも時間によって発生する可能性があります。いずれかの条件がロールオーバーをトリガーします。`profile_log_roll_num` および `profile_log_delete_age` と組み合わせることで、この項目は、保持される履歴プロファイルファイルの数と、古いファイルが削除されるタイミングを制御します。ローテーションされたファイルの圧縮は `enable_profile_log_compress` によって制御されます。
- 導入バージョン: v3.2.5

##### `qe_slow_log_ms`

- デフォルト: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: クエリが遅いクエリであるかどうかを判断するために使用されるしきい値。クエリの応答時間がこのしきい値を超えると、**fe.audit.log** に遅いクエリとして記録されます。
- 導入バージョン: -

##### `slow_lock_log_every_ms`

- デフォルト: 3000L
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: 同じ SlowLockLogStats インスタンスに対して別の「低速ロック」警告を発行する前に待機する最小間隔 (ミリ秒)。LockUtils は、ロック待機が `slow_lock_threshold_ms` を超えた後にこの値をチェックし、最後にログに記録された低速ロックイベントから `slow_lock_log_every_ms` ミリ秒が経過するまで追加の警告を抑制します。長期的な競合中にログのボリュームを減らすにはより大きな値を、より頻繁な診断を取得するにはより小さな値を使用します。変更は、その後のチェックに対して実行時に有効になります。
- 導入バージョン: v3.2.0

##### `slow_lock_print_stack`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: LockManager が `logSlowLockTrace` によって発行される低速ロック警告の JSON ペイロードに、所有スレッドの完全なスタックトレースを含めることを許可するかどうか ("stack" 配列は `LogUtil.getStackTraceToJsonArray` を `start=0` および `max=Short.MAX_VALUE` で介して入力されます)。この設定は、ロック取得が `slow_lock_threshold_ms` で構成されたしきい値を超えたときに表示されるロック所有者に関する追加のスタック情報のみを制御します。この機能を有効にすると、正確なスレッドスタックを提供することでデバッグに役立ちますが、高並行環境でスタックトレースをキャプチャしてシリアル化することによって発生するログボリュームと CPU/メモリオーバーヘッドが増加します。
- 導入バージョン: v3.3.16, v3.4.5, v3.5.1

##### `slow_lock_threshold_ms`

- デフォルト: 3000L
- タイプ: long
- 単位: ミリ秒
- 変更可能: はい
- 説明: ロック操作または保持されているロックを「遅い」と分類するために使用されるしきい値 (ミリ秒単位)。ロックの経過待機時間または保持時間がこの値を超えると、StarRocks は (コンテキストに応じて) 診断ログを発行し、スタックトレースや待機者/所有者情報を含め、LockManager ではこの遅延後にデッドロック検出を開始します。これは LockUtils (低速ロックロギング)、QueryableReentrantReadWriteLock (低速リーダーのフィルタリング)、LockManager (デッドロック検出遅延および低速ロックトレース)、LockChecker (定期的な低速ロック検出)、およびその他の呼び出し元 (例: DiskAndTabletLoadReBalancer ロギング) によって使用されます。値を小さくすると感度が上がり、ロギング/診断のオーバーヘッドが増加します。0 または負の値を設定すると、初期の待機ベースのデッドロック検出遅延動作が無効になります。`slow_lock_log_every_ms`、`slow_lock_print_stack`、および `slow_lock_stack_trace_reserve_levels` と一緒に調整してください。
- 導入バージョン: 3.2.0

##### `sys_log_delete_age`

- デフォルト: 7d
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: システムログファイルの保持期間。デフォルト値 `7d` は、各システムログファイルが 7 日間保持できることを指定します。StarRocks は各システムログファイルをチェックし、7 日以上前に生成されたファイルを削除します。
- 導入バージョン: -

##### `sys_log_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/log"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: システムログファイルが保存されるディレクトリ。
- 導入バージョン: -

##### `sys_log_enable_compress`

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: いいえ
- 説明: この項目が `true` に設定されている場合、システムはローテーションされたシステムログファイル名に ".gz" 接尾辞を追加し、Log4j が gzip 圧縮されたローテーションされた FE システムログを生成するようにします (例: fe.log.*)。この値は Log4j 設定生成時 (Log4jConfig.initLogging / generateActiveLog4jXmlConfig) に読み取られ、RollingFile の filePattern で使用される `sys_file_postfix` プロパティを制御します。この機能を有効にすると、保持されるログのディスク使用量は削減されますが、ロールオーバー中の CPU と I/O が増加し、ログファイル名が変更されるため、ログを読み取るツールやスクリプトは .gz ファイルを処理できる必要があります。監査ログは圧縮に対して別の設定 (`audit_log_enable_compress`) を使用することに注意してください。
- 導入バージョン: v3.2.12

##### `sys_log_format`

- デフォルト: "plaintext"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE ログに使用される Log4j レイアウトを選択します。有効な値: `"plaintext"` (デフォルト) および `"json"`。値は大文字と小文字を区別しません。`"plaintext"` は、人間が読めるタイムスタンプ、レベル、スレッド、class.method:line、および WARN/ERROR のスタックトレースを持つ PatternLayout を構成します。`"json"` は JsonTemplateLayout を構成し、ログアグリゲーター (ELK, Splunk) に適した構造化された JSON イベント (UTC タイムスタンプ、レベル、スレッド ID/名前、ソースファイル/メソッド/行、メッセージ、例外スタックトレース) を出力します。JSON 出力は、最大文字列長の `sys_log_json_max_string_length` および `sys_log_json_profile_max_string_length` に従います。
- 導入バージョン: v3.2.10

##### `sys_log_json_max_string_length`

- デフォルト: 1048576
- タイプ: Int
- 単位: バイト
- 変更可能: いいえ
- 説明: JSON 形式のシステムログに使用される JsonTemplateLayout の "maxStringLength" 値を設定します。`sys_log_format` が `"json"` に設定されている場合、文字列値フィールド (例: "message" および文字列化された例外スタックトレース) は、長さがこの制限を超えると切り捨てられます。この値は、生成された Log4j XML (`Log4jConfig.generateActiveLog4jXmlConfig()`) に挿入され、デフォルト、警告、監査、ダンプ、およびビッグクエリのレイアウトに適用されます。プロファイルレイアウトは別の設定 (`sys_log_json_profile_max_string_length`) を使用します。この値を小さくするとログサイズが削減されますが、有用な情報が切り捨てられる可能性があります。
- 導入バージョン: 3.2.11

##### `sys_log_json_profile_max_string_length`

- デフォルト: 104857600 (100 MB)
- タイプ: Int
- 単位: バイト
- 変更可能: いいえ
- 説明: `sys_log_format` が "json" の場合、プロファイル (および関連機能) ログアペンダーの JsonTemplateLayout の maxStringLength を設定します。JSON 形式のプロファイルログ内の文字列フィールド値は、このバイト長に切り捨てられます。文字列以外のフィールドは影響を受けません。この項目は Log4jConfig `JsonTemplateLayout maxStringLength` で適用され、`plaintext` ロギングが使用されている場合は無視されます。必要な完全なメッセージに対して十分に大きな値を維持しますが、値が大きいほどログサイズと I/O が増加することに注意してください。
- 導入バージョン: v3.2.11

##### `sys_log_level`

- デフォルト: INFO
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: システムログエントリが分類される重要度レベル。有効な値: `INFO`、`WARN`、`ERROR`、`FATAL`。
- 導入バージョン: -

##### `sys_log_roll_interval`

- デフォルト: DAY
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks がシステムログエントリをローテーションする時間間隔。有効な値: `DAY` と `HOUR`。
  - このパラメーターが `DAY` に設定されている場合、システムログファイル名に `yyyyMMdd` 形式のサフィックスが追加されます。
  - このパラメーターが `HOUR` に設定されている場合、システムログファイル名に `yyyyMMddHH` 形式のサフィックスが追加されます。
- 導入バージョン: -

##### `sys_log_roll_num`

- デフォルト: 10
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: `sys_log_roll_interval` パラメーターで指定された保持期間内に保持できるシステムログファイルの最大数。
- 導入バージョン: -

##### `sys_log_to_console`

- デフォルト: false (ただし、環境変数 `SYS_LOG_TO_CONSOLE` が "1" に設定されている場合を除く)
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: この項目が `true` に設定されている場合、システムは Log4j を設定して、すべてのログをファイルベースのアペンダーではなくコンソール (ConsoleErr アペンダー) に送信します。この値は、アクティブな Log4j XML 設定を生成する際に読み取られ (ルートロガーとモジュールごとのロガーのアペンダー選択に影響します)、プロセス起動時に `SYS_LOG_TO_CONSOLE` 環境変数からキャプチャされます。実行時に変更しても効果はありません。この設定は、stdout/stderr ログ収集がログファイルの書き込みよりも優先されるコンテナ化された環境や CI 環境で一般的に使用されます。
- 導入バージョン: v3.2.0

##### `sys_log_verbose_modules`

- デフォルト: 空文字列
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks がシステムログを生成するモジュール。このパラメーターが `org.apache.starrocks.catalog` に設定されている場合、StarRocks はカタログモジュールに対してのみシステムログを生成します。モジュール名をコンマ (,) とスペースで区切ります。
- 導入バージョン: -

##### `sys_log_warn_modules`

- デフォルト: {}
- タイプ: String[]
- 単位: -
- 変更可能: いいえ
- 説明: システムが起動時に WARN レベルのロガーとして構成し、警告アペンダー (SysWF) — `fe.warn.log` ファイルにルーティングするロガー名またはパッケージプレフィックスのリスト。エントリは、生成された Log4j 設定 (org.apache.kafka、org.apache.hudi、org.apache.hadoop.io.compress などの組み込み警告モジュールとともに) に挿入され、`<Logger name="... " level="WARN"><AppenderRef ref="SysWF"/></Logger>` のようなロガー要素を生成します。通常のログへのノイズの多い INFO/DEBUG 出力を抑制し、警告を個別にキャプチャできるようにするために、完全修飾パッケージおよびクラスプレフィックス (例: "com.example.lib") を使用することをお勧めします。
- 導入バージョン: v3.2.13

### サーバー

##### `brpc_idle_wait_max_time`

- デフォルト: 10000
- タイプ: Int
- 単位: ms
- 変更可能: いいえ
- 説明: bRPC クライアントがアイドル状態で待機する最大時間。
- 導入バージョン: -

##### `brpc_inner_reuse_pool`

- デフォルト: true
- タイプ: boolean
- 単位: -
- 変更可能: いいえ
- 説明: 基盤となる BRPC クライアントが、接続/チャネルに内部共有再利用プールを使用するかどうかを制御します。StarRocks は BrpcProxy で `brpc_inner_reuse_pool` を読み込み、RpcClientOptions を構築する際に使用します ( `rpcOptions.setInnerResuePool(...)` 経由)。有効 (true) の場合、RPC クライアントは内部プールを再利用して、呼び出しごとの接続作成を減らし、FE-to-BE / LakeService RPC の接続チャーン、メモリ、ファイルディスクリプタの使用量を削減します。無効 (false) の場合、クライアントはより分離されたプールを作成する可能性があります (リソース使用量が増加する代わりに、並行性の分離を向上させます)。この値を変更するには、プロセスを再起動して変更を反映する必要があります。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0

##### `brpc_min_evictable_idle_time_ms`

- デフォルト: 120000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: いいえ
- 説明: アイドル状態の BRPC 接続が、接続プールで削除可能になる前に保持される必要のある時間 (ミリ秒)。`BrpcProxy` によって使用される RpcClientOptions に適用されます (RpcClientOptions.setMinEvictableIdleTime 経由)。アイドル接続を長く保持するにはこの値を増やし (再接続のチャーンを減らす)、未使用のソケットをより早く解放するにはこの値を減らします (リソース使用量を減らす)。接続の再利用、プールの成長、削除の動作のバランスをとるために、`brpc_connection_pool_size`、`brpc_idle_wait_max_time` とともに調整します。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0

##### `brpc_reuse_addr`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: true の場合、StarRocks は、brpc RpcClient によって作成されたクライアントソケットのローカルアドレス再利用を許可するようにソケットオプションを設定します (RpcClientOptions.setReuseAddress 経由)。これを有効にすると、バインドの失敗が減り、ソケットが閉じられた後のローカルポートの再バインドが高速化されます。これは、高い接続チャーンまたは高速な再起動に役立ちます。false の場合、アドレス/ポートの再利用が無効になり、意図しないポート共有の可能性を減らすことができますが、一時的なバインドエラーが増加する可能性があります。このオプションは、`brpc_connection_pool_size` と `brpc_short_connection` で構成された接続動作と相互作用します。これは、クライアントソケットをどれだけ迅速に再バインドして再利用できるかに影響するためです。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0

##### `cluster_name`

- デフォルト: StarRocks Cluster
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE が属する StarRocks クラスターの名前。クラスター名はウェブページの `Title` に表示されます。
- 導入バージョン: -

##### `dns_cache_ttl_seconds`

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: 正常な DNS ルックアップの DNS キャッシュ TTL (Time-To-Live) (秒単位)。これは、JVM が正常な DNS ルックアップをキャッシュする期間を制御する Java セキュリティプロパティ `networkaddress.cache.ttl` を設定します。システムが常に情報をキャッシュするように `-1` に設定するか、キャッシュを無効にするために `0` に設定します。これは、IP アドレスが頻繁に変更される環境 (Kubernetes デプロイメントや動的 DNS が使用される場合など) で特に役立ちます。
- 導入バージョン: v3.5.11, v4.0.4

##### `enable_http_async_handler`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: システムが HTTP リクエストを非同期で処理することを許可するかどうか。この機能が有効な場合、Netty ワーカー スレッドによって受信された HTTP リクエストは、HTTP サーバーのブロックを避けるために、サービスロジック処理のために別のスレッドプールに送信されます。無効になっている場合、Netty ワーカーがサービスロジックを処理します。
- 導入バージョン: 4.0.0

##### `enable_http_validate_headers`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: Netty の HttpServerCodec が厳密な HTTP ヘッダー検証を実行するかどうかを制御します。この値は、HttpServer で HTTP パイプラインが初期化されるときに HttpServerCodec に渡されます (UseLocations を参照)。新しい Netty バージョンはより厳密なヘッダー規則を適用するため (https://github.com/netty/netty/pull/12760)、下位互換性のためにデフォルトは false です。RFC 準拠のヘッダーチェックを強制するには true に設定します。そうすると、レガシークライアントまたはプロキシからの不正な形式または非準拠のリクエストが拒否される可能性があります。変更を有効にするには HTTP サーバーの再起動が必要です。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0

##### `frontend_address`

- デフォルト: 0.0.0.0
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの IP アドレス。
- 導入バージョン: -

##### `http_async_threads_num`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 非同期 HTTP リクエスト処理用のスレッドプールのサイズ。エイリアスは `max_http_sql_service_task_threads_num` です。
- 導入バージョン: 4.0.0

##### `http_backlog_num`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの HTTP サーバーが保持するバックログキューの長さ。
- 導入バージョン: -

##### `http_max_chunk_size`

- デフォルト: 8192
- タイプ: Int
- 単位: バイト
- 変更可能: いいえ
- 説明: FE HTTP サーバーの Netty の HttpServerCodec によって処理される単一の HTTP チャンクの最大許容サイズ (バイト単位) を設定します。これは HttpServerCodec に 3 番目の引数として渡され、チャンク転送またはストリーミングリクエスト/レスポンス中のチャンクの長さを制限します。受信チャンクがこの値を超えると、Netty はフレームが大きすぎるエラー (例: TooLongFrameException) を発生させ、リクエストが拒否される可能性があります。正当な大規模チャンクアップロードの場合はこれを増やし、メモリ圧力を減らし、DoS 攻撃の表面積を減らすために小さく保ちます。この設定は `http_max_initial_line_length`、`http_max_header_size`、および `enable_http_validate_headers` とともに使用されます。
- 導入バージョン: v3.2.0

##### `http_max_header_size`

- デフォルト: 32768
- タイプ: Int
- 単位: バイト
- 変更可能: いいえ
- 説明: Netty の `HttpServerCodec` によって解析される HTTP リクエストヘッダーブロックの最大許容サイズ (バイト単位)。StarRocks はこの値を `HttpServerCodec` に渡します (`Config.http_max_header_size` として)。受信リクエストのヘッダー (名前と値の組み合わせ) がこの制限を超えると、コーデックはリクエストを拒否し (デコーダー例外)、接続/リクエストは失敗します。クライアントが正当に非常に大きなヘッダー (大きなクッキーまたは多くのカスタムヘッダー) を送信する場合にのみ増やします。値が大きいほど、接続あたりのメモリ使用量が増加します。`http_max_initial_line_length` および `http_max_chunk_size` と組み合わせて調整します。変更には FE の再起動が必要です。
- 導入バージョン: v3.2.0

##### `http_max_initial_line_length`

- デフォルト: 4096
- タイプ: Int
- 単位: バイト
- 変更可能: いいえ
- 説明: HttpServer で使用される Netty `HttpServerCodec` によって受け入れられる HTTP 初期リクエストライン (メソッド + リクエストターゲット + HTTP バージョン) の最大許容長 (バイト単位) を設定します。この値は Netty のデコーダーに渡され、この値よりも長い初期ラインを持つリクエストは拒否されます (TooLongFrameException)。非常に長いリクエスト URI をサポートする必要がある場合にのみこれを増やします。値が大きいほどメモリ使用量が増加し、不正な形式/リクエスト乱用に対する露出が増加する可能性があります。`http_max_header_size` および `http_max_chunk_size` とともに調整します。
- 導入バージョン: v3.2.0

##### `http_port`

- デフォルト: 8030
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの HTTP サーバーがリッスンするポート。
- 導入バージョン: -

##### `http_web_page_display_hardware`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: true の場合、HTTP インデックスページ (/index) に oshi ライブラリ (CPU、メモリ、プロセス、ディスク、ファイルシステム、ネットワークなど) を介して入力されたハードウェア情報セクションが含まれます。oshi は、システムユーティリティを呼び出したり、システムファイルを間接的に読み取ったりする可能性があります (たとえば、`getent passwd` などのコマンドを実行できます)。これにより、機密性の高いシステムデータが表面化する可能性があります。より厳密なセキュリティを要求する場合や、ホスト上でそれらの間接コマンドの実行を避けたい場合は、この設定を false に設定して、Web UI でのハードウェア詳細の収集と表示を無効にします。
- 導入バージョン: v3.2.0

##### `http_worker_threads_num`

- デフォルト: 0
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: HTTP リクエストを処理する HTTP サーバーのワーカー スレッドの数。負の値または 0 の場合、スレッド数は CPU コア数の 2 倍になります。
- 導入バージョン: v2.5.18, v3.0.10, v3.1.7, v3.2.2

##### `max_mysql_service_task_threads_num`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの MySQL サーバーがタスクを処理するために実行できるスレッドの最大数。
- 導入バージョン: -

##### `max_task_runs_threads_num`

- デフォルト: 512
- タイプ: Int
- 単位: スレッド
- 変更可能: いいえ
- 説明: タスク実行エグゼキュータースレッドプールの最大スレッド数を制御します。この値は、同時タスク実行の上限です。増やすと並列処理が向上しますが、CPU、メモリ、ネットワークの使用量も増加します。減らすとタスク実行のバックログが増え、遅延が長くなる可能性があります。この値は、予想される同時スケジュールジョブと利用可能なシステムリソースに応じて調整してください。
- 導入バージョン: v3.2.0

##### `memory_tracker_enable`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: FE メモリトラッカーサブシステムを有効にします。`memory_tracker_enable` が `true` に設定されている場合、`MemoryUsageTracker` は定期的に登録されたメタデータモジュールをスキャンし、インメモリ `MemoryUsageTracker.MEMORY_USAGE` マップを更新し、合計をログに記録し、`MetricRepo` がメモリ使用量とオブジェクト数ゲージをメトリック出力に公開するようにします。サンプリング間隔を制御するには `memory_tracker_interval_seconds` を使用します。この機能を有効にすると、メモリ消費の監視とデバッグに役立ちますが、CPU と I/O のオーバーヘッド、および追加のメトリックカーディナリティが発生します。
- 導入バージョン: v3.2.4

##### `memory_tracker_interval_seconds`

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: FE `MemoryUsageTracker` デーモンが FE プロセスおよび登録された `MemoryTrackable` モジュールのメモリ使用量をポーリングおよび記録する間隔 (秒単位)。`memory_tracker_enable` が `true` に設定されている場合、トラッカーはこの頻度で実行され、`MEMORY_USAGE` を更新し、集約された JVM および追跡されたモジュールの使用状況をログに記録します。
- 導入バージョン: v3.2.4

##### `mysql_nio_backlog_num`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの MySQL サーバーが保持するバックログキューの長さ。
- 導入バージョン: -

##### `mysql_server_version`

- デフォルト: 8.0.33
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: クライアントに返される MySQL サーバーバージョン。このパラメーターを変更すると、以下の状況でバージョン情報に影響します。
  1. `select version();`
  2. ハンドシェイクパケットバージョン
  3. グローバル変数 `version` の値 (`show variables like 'version';`)
- 導入バージョン: -

##### `mysql_service_io_threads_num`

- デフォルト: 4
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの MySQL サーバーが I/O イベントを処理するために実行できるスレッドの最大数。
- 導入バージョン: -

##### `mysql_service_kill_after_disconnect`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: MySQL TCP 接続が切断されたと検出された場合 (読み取りで EOF)、サーバーがセッションをどのように処理するかを制御します。`true` に設定されている場合、サーバーはその接続で実行中のクエリを直ちに強制終了し、即時クリーンアップを実行します。`false` の場合、サーバーは切断時に実行中のクエリを強制終了せず、保留中のリクエストタスクがない場合にのみクリーンアップを実行し、クライアントが切断された後も長時間実行されるクエリを続行できるようにします。注: TCP keep-alive を示唆する短いコメントにもかかわらず、このパラメーターは切断後の強制終了動作を具体的に管理し、孤立したクエリを終了させる必要があるか (信頼性の低い/ロードバランスされたクライアントの背後で推奨) または終了させることを許可するかによって設定する必要があります。
- 導入バージョン: -

##### `mysql_service_nio_enable_keep_alive`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: MySQL 接続の TCP Keep-Alive を有効にします。ロードバランサーの背後で長時間アイドル状態の接続に役立ちます。
- 導入バージョン: -

##### `net_use_ipv6_when_priority_networks_empty`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: `priority_networks` が指定されていない場合に、IPv6 アドレスを優先的に使用するかどうかを制御するブール値。`true` は、ノードをホストするサーバーが IPv4 と IPv6 の両方のアドレスを持ち、`priority_networks` が指定されていない場合に、システムが IPv6 アドレスを優先的に使用することを許可することを示します。
- 導入バージョン: v3.3.0

##### `priority_networks`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 複数の IP アドレスを持つサーバーの選択戦略を宣言します。このパラメーターで指定されたリストと一致する IP アドレスは最大で 1 つであることに注意してください。このパラメーターの値は、CIDR 表記でセミコロン (;) で区切られたエントリ (例: 10.10.10.0/24) で構成されるリストです。このリストのエントリと一致する IP アドレスがない場合、サーバーの利用可能な IP アドレスがランダムに選択されます。v3.3.0 以降、StarRocks は IPv6 に基づくデプロイメントをサポートします。サーバーが IPv4 と IPv6 の両方のアドレスを持ち、このパラメーターが指定されていない場合、システムはデフォルトで IPv4 アドレスを使用します。`net_use_ipv6_when_priority_networks_empty` を `true` に設定することで、この動作を変更できます。
- 導入バージョン: -

##### `proc_profile_cpu_enable`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、バックグラウンドの `ProcProfileCollector` は `AsyncProfiler` を使用して CPU プロファイルを収集し、`sys_log_dir/proc_profile` の下に HTML レポートを書き込みます。各収集実行では、`proc_profile_collect_time_s` で構成された期間の CPU スタックを記録し、Java スタックの深さには `proc_profile_jstack_depth` を使用します。生成されたプロファイルは圧縮され、`proc_profile_file_retained_days` および `proc_profile_file_retained_size_bytes` に従って古いファイルは削除されます。`AsyncProfiler` にはネイティブライブラリ (`libasyncProfiler.so`) が必要です。`/tmp` の noexec の問題を避けるために、`one.profiler.extractPath` は `STARROCKS_HOME_DIR/bin` に設定されます。
- 導入バージョン: v3.2.12

##### `qe_max_connection`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードにすべてのユーザーが確立できる接続の最大数。v3.1.12 および v3.2.7 以降、デフォルト値が `1024` から `4096` に変更されました。
- 導入バージョン: -

##### `query_port`

- デフォルト: 9030
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの MySQL サーバーがリッスンするポート。
- 導入バージョン: -

##### `rpc_port`

- デフォルト: 9020
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの Thrift サーバーがリッスンするポート。
- 導入バージョン: -

##### `slow_lock_stack_trace_reserve_levels`

- デフォルト: 15
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: StarRocks が遅いロックまたは保持されているロックのロックデバッグ情報をダンプする際に、キャプチャおよび出力されるスタックトレースフレームの数を制御します。この値は、排他的ロック所有者、現在のスレッド、および最も古い/共有リーダーの JSON を生成する際に `QueryableReentrantReadWriteLock` によって `LogUtil.getStackTraceToJsonArray` に渡されます。この値を増やすと、トレースの詳細が増え、出力サイズが大きくなり、スタックキャプチャのための CPU/メモリがわずかに増加しますが、診断に役立ちます。減らすとオーバーヘッドが減少します。注: リーダーエントリは、低速ロックのみをログに記録する場合、`slow_lock_threshold_ms` によってフィルター処理できます。
- 導入バージョン: v3.4.0, v3.5.0

##### `task_runs_concurrency`

- デフォルト: 4
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 同時に実行される TaskRun インスタンスのグローバル制限。`TaskRunScheduler` は、現在の実行数が `task_runs_concurrency` 以上の場合、新しい実行のスケジュールを停止するため、この値はスケジューラ全体で並列 TaskRun 実行を制限します。これは、`MVPCTRefreshPartitioner` によって TaskRun ごとのパーティションリフレッシュ粒度を計算するためにも使用されます。値を増やすと並列処理とリソース使用量が増加し、減らすと並列処理が減少し、パーティションリフレッシュが実行ごとに大きくなります。0 または負の値に設定しないでください (意図的にスケジューリングを無効にする場合を除く)。0 (または負の値) は、`TaskRunScheduler` による新しい TaskRun のスケジュールを実質的に防ぎます。
- 導入バージョン: v3.2.0

##### `task_runs_queue_length`

- デフォルト: 500
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 保留中のキューに保持される保留中の TaskRun 項目の最大数を制限します。`TaskRunManager` は現在の保留中の数をチェックし、有効な保留中の TaskRun の数が `task_runs_queue_length` 以上の場合、新しい送信を拒否します。マージ/承認された TaskRun が追加される前に同じ制限が再チェックされます。メモリとスケジューリングのバックログのバランスをとるためにこの値を調整してください。大量のバースト性のワークロードでは拒否を避けるために高く設定し、メモリを制限し、保留中のバックログを減らすために低く設定します。
- 導入バージョン: v3.2.0

##### `thrift_backlog_num`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE ノードの Thrift サーバーが保持するバックログキューの長さ。
- 導入バージョン: -

##### `thrift_client_timeout_ms`

- デフォルト: 5000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: いいえ
- 説明: アイドル状態のクライアント接続がタイムアウトするまでの時間。
- 導入バージョン: -

##### `thrift_rpc_max_body_size`

- デフォルト: -1
- タイプ: Int
- 単位: バイト
- 変更可能: いいえ
- 説明: サーバーの Thrift プロトコルを構築する際に使用される Thrift RPC メッセージ本文の最大許容サイズ (バイト単位) を制御します (TBinaryProtocol.Factory に `ThriftServer` で渡されます)。`-1` の値は制限を無効にします (無制限)。正の値を設定すると、メッセージがこの値よりも大きい場合、Thrift レイヤーによって拒否され、メモリ使用量を制限し、サイズ超過リクエストや DoS のリスクを軽減するのに役立ちます。正当なリクエストを拒否しないように、予想されるペイロード (大規模な構造体やバッチデータ) に対して十分に大きなサイズに設定します。
- 導入バージョン: v3.2.0

##### `thrift_server_max_worker_threads`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE ノードの Thrift サーバーがサポートするワーカー スレッドの最大数。
- 導入バージョン: -

##### `thrift_server_queue_size`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: リクエストが保留中のキューの長さ。Thrift サーバーで処理されているスレッドの数が `thrift_server_max_worker_threads` で指定された値を超えると、新しいリクエストが保留キューに追加されます。
- 導入バージョン: -

### メタデータとクラスター管理

##### `alter_max_worker_queue_size`

- デフォルト: 4096
- タイプ: Int
- 単位: タスク
- 変更可能: いいえ
- 説明: alter サブシステムで使用される内部ワーカー スレッド プール キューの容量を制御します。これは、`alter_max_worker_threads` とともに `AlterHandler` の `ThreadPoolManager.newDaemonCacheThreadPool` に渡されます。保留中の alter タスクの数が `alter_max_worker_queue_size` を超えると、新しい送信は拒否され、`RejectedExecutionException` がスローされる可能性があります (`AlterHandler.handleFinishAlterTask` を参照)。メモリ使用量と同時 alter タスクに対して許可するバックログの量のバランスをとるために、この値を調整します。
- 導入バージョン: v3.2.0

##### `alter_max_worker_threads`

- デフォルト: 4
- タイプ: Int
- 単位: スレッド
- 変更可能: いいえ
- 説明: AlterHandler のスレッドプールの最大ワーカー スレッド数を設定します。AlterHandler はこの値でエグゼキューターを構築し、alter 関連のタスク (例: handleFinishAlterTask 経由での `AlterReplicaTask` の送信) を実行および完了します。この値は alter 操作の同時実行を制限します。増やすと並列処理とリソース使用量が増加し、減らすと同時 alter が制限され、ボトルネックになる可能性があります。エグゼキューターは `alter_max_worker_queue_size` とともに作成され、ハンドラースケジューリングは `alter_scheduler_interval_millisecond` を使用します。
- 導入バージョン: v3.2.0

##### `automated_cluster_snapshot_interval_seconds`

- デフォルト: 600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 自動クラスター スナップショット タスクがトリガーされる間隔。
- 導入バージョン: v3.4.2

##### `background_refresh_metadata_interval_millis`

- デフォルト: 600000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: Hive メタデータキャッシュの連続する 2 つの更新間の間隔。
- 導入バージョン: v2.5.5

##### `background_refresh_metadata_time_secs_since_last_access_secs`

- デフォルト: 3600 * 24
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: Hive メタデータキャッシュ更新タスクの有効期限。アクセスされた Hive カタログの場合、指定された時間を超えてアクセスされていない場合、StarRocks はキャッシュされたメタデータの更新を停止します。アクセスされていない Hive カタログの場合、StarRocks はキャッシュされたメタデータを更新しません。
- 導入バージョン: v2.5.5

##### `bdbje_cleaner_threads`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks ジャーナルで使用される Berkeley DB Java Edition (JE) 環境のバックグラウンドクリーナースレッドの数。この値は `BDBEnvironment.initConfigs` で環境初期化中に読み取られ、`Config.bdbje_cleaner_threads` を使用して `EnvironmentConfig.CLEANER_THREADS` に適用されます。JE ログのクリーンアップと領域の再利用の並列処理を制御します。増やすとクリーンアップが高速化される可能性がありますが、追加の CPU とフォアグラウンド操作への I/O 干渉というコストがかかります。変更は BDB 環境が (再) 初期化された場合にのみ有効になるため、新しい値を適用するにはフロントエンドの再起動が必要です。
- 導入バージョン: v3.2.0

##### `bdbje_heartbeat_timeout_second`

- デフォルト: 30
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: StarRocks クラスターのリーダー、フォロワー、オブザーバー FE 間のハートビートがタイムアウトするまでの時間。
- 導入バージョン: -

##### `bdbje_lock_timeout_second`

- デフォルト: 1
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: BDB JE ベースの FE のロックがタイムアウトするまでの時間。
- 導入バージョン: -

##### `bdbje_replay_cost_percent`

- デフォルト: 150
- タイプ: Int
- 単位: パーセント
- 変更可能: いいえ
- 説明: BDB JE ログからトランザクションをリプレイする相対コスト (パーセンテージ) を、ネットワークリカバリを介して同じデータを取得するコストと比較して設定します。この値は基盤となる JE レプリケーションパラメーター `REPLAY_COST_PERCENT` に提供され、リプレイは通常ネットワークリカバリよりもコストがかかることを示すために通常 `>100` です。クリーンアップされたログファイルを潜在的なリプレイのために保持するかどうかを決定する際、システムはリプレイコストにログサイズを掛けたものとネットワークリカバリのコストを比較します。ネットワークリカバリの方が効率的と判断された場合、ファイルは削除されます。0 の値は、このコスト比較に基づいた保持を無効にします。`REP_STREAM_TIMEOUT` 内のレプリカ、またはアクティブなレプリケーションに必要なログファイルは常に保持されます。
- 導入バージョン: v3.2.0

##### `bdbje_replica_ack_timeout_second`

- デフォルト: 10
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: リーダー FE が特定の数のフォロワー FE から ACK メッセージを待機できる最大時間 (リーダー FE からフォロワー FE にメタデータを書き込むとき)。単位: 秒。大量のメタデータが書き込まれている場合、フォロワー FE がリーダー FE に ACK メッセージを返すまでに時間がかかり、ACK タイムアウトが発生します。この状況では、メタデータ書き込みが失敗し、FE プロセスが終了します。この状況を防ぐために、このパラメーターの値を増やすことをお勧めします。
- 導入バージョン: -

##### `bdbje_reserved_disk_size`

- デフォルト: 512 * 1024 * 1024 (536870912)
- タイプ: Long
- 単位: バイト
- 変更可能: いいえ
- 説明: Berkeley DB JE が「保護されていない」(削除可能) ログ/データファイルとして予約するバイト数を制限します。StarRocks はこの値を BDBEnvironment の `EnvironmentConfig.RESERVED_DISK` を介して JE に渡します。JE の組み込みのデフォルトは 0 (無制限) です。StarRocks のデフォルト (512 MiB) は、JE が保護されていないファイルに過剰なディスク領域を予約するのを防ぎながら、古いファイルを安全にクリーンアップできるようにします。ディスク容量が制約されているシステムでこの値を調整します。減らすと JE はより多くのファイルを早く解放でき、増やすと JE はより多くの予約領域を保持できます。変更を有効にするにはプロセスを再起動する必要があります。
- 導入バージョン: v3.2.0

##### `bdbje_reset_election_group`

- デフォルト: false
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: BDBJE レプリケーショングループをリセットするかどうか。このパラメーターが `TRUE` に設定されている場合、FE は BDBJE レプリケーショングループをリセットし (つまり、すべての選挙可能な FE ノードの情報を削除し)、リーダー FE として起動します。リセット後、この FE はクラスター内で唯一のメンバーになり、他の FE は `ALTER SYSTEM ADD/DROP FOLLOWER/OBSERVER 'xxx'` を使用してこのクラスターに再参加できます。この設定は、ほとんどのフォロワー FE のデータが破損しているため、リーダー FE を選出できない場合にのみ使用してください。`reset_election_group` は `metadata_failure_recovery` の代替として使用されます。
- 導入バージョン: -

##### `black_host_connect_failures_within_time`

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: ブラックリストに登録された BE ノードに許可される接続失敗のしきい値。BE ノードが自動的に BE ブラックリストに追加された場合、StarRocks はその接続性を評価し、BE ブラックリストから削除できるかどうかを判断します。`black_host_history_sec` 内で、ブラックリストに登録された BE ノードの接続失敗回数が `black_host_connect_failures_within_time` で設定されたしきい値よりも少ない場合にのみ、BE ブラックリストから削除できます。
- 導入バージョン: v3.3.0

##### `black_host_history_sec`

- デフォルト: 2 * 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: BE ブラックリスト内の BE ノードの過去の接続失敗を保持する期間。BE ノードが自動的に BE ブラックリストに追加された場合、StarRocks はその接続性を評価し、BE ブラックリストから削除できるかどうかを判断します。`black_host_history_sec` 内で、ブラックリストに登録された BE ノードの接続失敗回数が `black_host_connect_failures_within_time` で設定されたしきい値よりも少ない場合にのみ、BE ブラックリストから削除できます。
- 導入バージョン: v3.3.0

##### `brpc_connection_pool_size`

- デフォルト: 16
- タイプ: Int
- 単位: 接続
- 変更可能: いいえ
- 説明: FE の BrpcProxy によって使用されるエンドポイントごとのプールされた BRPC 接続の最大数。この値は `setMaxTotoal` と `setMaxIdleSize` を介して RpcClientOptions に適用されるため、各リクエストはプールから接続を借りる必要があるため、同時アウトバウンド BRPC リクエストを直接制限します。高並列シナリオでは、リクエストキューイングを避けるためにこれを増やします。増やすとソケットとメモリの使用量が増加し、リモートサーバーの負荷が増加する可能性があります。調整する際は、`brpc_idle_wait_max_time`、`brpc_short_connection`、`brpc_inner_reuse_pool`、`brpc_reuse_addr`、および `brpc_min_evictable_idle_time_ms` などの関連設定を考慮してください。この値の変更はホットリロード可能ではなく、再起動が必要です。
- 導入バージョン: v3.2.0

##### `brpc_short_connection`

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: いいえ
- 説明: 基盤となる brpc RpcClient が短命の接続を使用するかどうかを制御します。有効 ( `true` ) の場合、RpcClientOptions.setShortConnection が設定され、リクエスト完了後に接続が閉じられ、接続設定のオーバーヘッドと遅延が増加する代わりに、長寿命ソケットの数が減ります。無効 ( `false` 、デフォルト) の場合、永続接続と接続プールが使用されます。このオプションを有効にすると接続プールの動作に影響し、`brpc_connection_pool_size`、`brpc_idle_wait_max_time`、`brpc_min_evictable_idle_time_ms`、`brpc_reuse_addr`、および `brpc_inner_reuse_pool` と一緒に考慮する必要があります。通常の高スループットデプロイメントでは無効にしておき、ソケットの寿命を制限する必要がある場合や、ネットワークポリシーによって短命接続が必要な場合にのみ有効にしてください。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0

##### `catalog_try_lock_timeout_ms`

- デフォルト: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: グローバルロックを取得するためのタイムアウト期間。
- 導入バージョン: -

##### `checkpoint_only_on_leader`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: `true` の場合、CheckpointController はリーダー FE のみをチェックポイントワーカーとして選択します。`false` の場合、コントローラーは任意のフロントエンドを選択でき、ヒープ使用量が少ないノードを優先します。`false` の場合、ワーカーは最近の失敗時刻と `heapUsedPercent` でソートされます (リーダーは無限の使用量を持つものとして扱われ、選択を避けます)。クラスター スナップショット メタデータを必要とする操作の場合、コントローラーはすでにこのフラグに関係なくリーダー選択を強制します。`true` を有効にすると、チェックポイント作業がリーダーに集中します (単純ですが、リーダーの CPU/メモリとネットワーク負荷が増加します)。`false` のままにすると、負荷の少ない FE にチェックポイント負荷が分散されます。この設定は、ワーカー選択と、`checkpoint_timeout_seconds` のようなタイムアウト、および `thrift_rpc_timeout_ms` のような RPC 設定との相互作用に影響します。
- 導入バージョン: v3.4.0, v3.5.0

##### `checkpoint_timeout_seconds`

- デフォルト: 24 * 3600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: リーダーの CheckpointController がチェックポイントワーカーがチェックポイントを完了するのを待機する最大時間 (秒単位)。コントローラーはこの値をナノ秒に変換し、ワーカーの結果キューをポーリングします。このタイムアウト内に成功した完了が受信されない場合、チェックポイントは失敗として扱われ、createImage は失敗を返します。この値を増やすと、長時間実行されるチェックポイントに対応できますが、失敗検出とその後のイメージ伝播が遅れます。減らすと、より高速なフェイルオーバー/再試行が発生しますが、低速なワーカーに対して誤ったタイムアウトが発生する可能性があります。この設定は、チェックポイント作成中の `CheckpointController` での待機期間のみを制御し、ワーカーの内部チェックポイント動作は変更しません。
- 導入バージョン: v3.4.0, v3.5.0

##### `db_used_data_quota_update_interval_secs`

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: データベースの使用済みデータクォータが更新される間隔。StarRocks は、すべてのデータベースの使用済みデータクォータを定期的に更新して、ストレージ消費を追跡します。この値は、クォータの適用とメトリック収集に使用されます。許容される最小間隔は、過剰なシステム負荷を防ぐために 30 秒です。30 未満の値は拒否されます。
- 導入バージョン: -

##### `drop_backend_after_decommission`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: BE が廃止された後に BE を削除するかどうか。`TRUE` は、BE が廃止された直後に削除されることを示します。`FALSE` は、BE が廃止された後も削除されないことを示します。
- 導入バージョン: -

##### `edit_log_port`

- デフォルト: 9010
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: クラスター内のリーダー、フォロワー、オブザーバー FE 間で通信に使用されるポート。
- 導入バージョン: -

##### `edit_log_roll_num`

- デフォルト: 50000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: ログファイルが作成されるまでに書き込み可能なメタデータログエントリの最大数。このパラメーターはログファイルのサイズを制御するために使用されます。新しいログファイルは BDBJE データベースに書き込まれます。
- 導入バージョン: -

##### `edit_log_type`

- デフォルト: BDB
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 生成可能な編集ログのタイプ。値を `BDB` に設定します。
- 導入バージョン: -

##### `enable_background_refresh_connector_metadata`

- デフォルト: v3.0 以降では true、v2.5 では false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 定期的な Hive メタデータキャッシュ更新を有効にするかどうか。有効にすると、StarRocks は Hive クラスターのメタストア (Hive Metastore または AWS Glue) をポーリングし、頻繁にアクセスされる Hive カタログのキャッシュされたメタデータを更新して、データ変更を認識します。`true` は Hive メタデータキャッシュ更新を有効にすることを示し、`false` は無効にすることを示します。
- 導入バージョン: v2.5.5

##### `enable_collect_query_detail_info`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: クエリのプロファイルを収集するかどうか。このパラメーターが `TRUE` に設定されている場合、システムはクエリのプロファイルを収集します。このパラメーターが `FALSE` に設定されている場合、システムはクエリのプロファイルを収集しません。
- 導入バージョン: -

##### `enable_create_partial_partition_in_batch`

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `false` (デフォルト) に設定されている場合、StarRocks は、バッチ作成された範囲パーティションが標準の時間単位境界に揃うように強制します。ギャップの作成を避けるために、非アラインド範囲は拒否されます。この項目を `true` に設定すると、アラインメントチェックが無効になり、バッチで部分的な (非標準の) パーティションの作成が許可され、ギャップや不整合なパーティション範囲が生成される可能性があります。意図的に部分的なバッチパーティションが必要であり、関連するリスクを受け入れる場合にのみ、これを `true` に設定してください。
- 導入バージョン: v3.2.0

##### `enable_internal_sql`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: この項目が `true` に設定されている場合、内部コンポーネント (例: SimpleExecutor) によって実行される内部 SQL ステートメントは保持され、内部監査またはログメッセージに書き込まれます (`enable_sql_desensitize_in_log` が設定されている場合、さらに非機密化される可能性があります)。`false` に設定されている場合、内部 SQL テキストは抑制されます。フォーマットコード (SimpleExecutor.formatSQL) は "?" を返し、実際のステートメントは内部監査またはログメッセージに出力されません。この設定は、内部ステートメントの実行セマンティクスを変更しません。プライバシーまたはセキュリティのために内部 SQL のロギングと可視性のみを制御します。
- 導入バージョン: -

##### `enable_legacy_compatibility_for_replication`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: レプリケーションのレガシー互換性を有効にするかどうか。StarRocks は、古いバージョンと新しいバージョンで動作が異なる場合があり、クラスター間のデータ移行中に問題が発生することがあります。そのため、データ移行前にターゲットクラスターのレガシー互換性を有効にし、データ移行完了後に無効にする必要があります。`true` はこのモードを有効にすることを示します。
- 導入バージョン: v3.1.10, v3.2.6

##### `enable_show_materialized_views_include_all_task_runs`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: SHOW MATERIALIZED VIEWS コマンドに TaskRun がどのように返されるかを制御します。この項目が `false` に設定されている場合、StarRocks はタスクごとに最新の TaskRun のみを返します (互換性のためのレガシー動作)。`true` (デフォルト) に設定されている場合、`TaskManager` は、同じ開始 TaskRun ID を共有する場合にのみ (たとえば、同じジョブに属する場合)、同じタスクの追加の TaskRun を含めることができ、関連性のない重複実行が表示されるのを防ぎながら、1 つのジョブに関連する複数のステータスを表示できるようにします。単一実行出力を復元したり、デバッグと監視のために複数実行ジョブ履歴を表示したりするには、この項目を `false` に設定します。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0

##### `enable_statistics_collect_profile`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 統計クエリのプロファイルを生成するかどうか。この項目を `true` に設定すると、StarRocks がシステム統計に関するクエリのクエリプロファイルを生成できるようになります。
- 導入バージョン: v3.1.5

##### `enable_task_history_archive`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 有効にすると、完了したタスク実行レコードは永続的なタスク実行履歴テーブルにアーカイブされ、編集ログに記録されるため、ルックアップ (例: `lookupHistory`、`lookupHistoryByTaskNames`、`lookupLastJobOfTasks`) にアーカイブされた結果が含まれます。アーカイブは FE リーダーによって実行され、単体テスト中 (`FeConstants.runningUnitTest`) はスキップされます。有効にすると、インメモリ有効期限と強制 GC パスはバイパスされるため (コードは `removeExpiredRuns` と `forceGC` から早期にリターンします)、保持/削除は `task_runs_ttl_second` と `task_runs_max_history_number` ではなく永続アーカイブによって処理されます。無効にすると、履歴はメモリ内に残り、これらの設定によって削除されます。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0

##### `enable_task_run_fe_evaluation`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 有効にすると、FE はシステムテーブル `task_runs` の `TaskRunsSystemTable.supportFeEvaluation` でローカル評価を実行します。FE 側の評価は、列を定数と比較する結合等価述語に対してのみ許可され、列 `QUERY_ID` と `TASK_NAME` に限定されます。これを有効にすると、より広範なスキャンや追加のリモート処理を避けることで、対象となるルックアップのパフォーマンスが向上します。無効にすると、プランナーは `task_runs` の FE 評価をスキップすることを強制され、述語のプルーニングが減少し、これらのフィルターのクエリ待機時間に影響を与える可能性があります。
- 導入バージョン: v3.3.13, v3.4.3, v3.5.0

##### `heartbeat_mgr_blocking_queue_size`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: ハートビートマネージャーによって実行されるハートビートタスクを格納するブロックキューのサイズ。
- 導入バージョン: -

##### `heartbeat_mgr_threads_num`

- デフォルト: 8
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: ハートビートマネージャーがハートビートタスクを実行するために実行できるスレッドの数。
- 導入バージョン: -

##### `ignore_materialized_view_error`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューエラーによって引き起こされるメタデータ例外を FE が無視するかどうか。マテリアライズドビューエラーによって引き起こされるメタデータ例外のために FE が起動に失敗した場合、このパラメーターを `true` に設定することで FE が例外を無視できるようにできます。
- 導入バージョン: v2.5.10

##### `ignore_meta_check`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 非リーダー FE がリーダー FE からのメタデータギャップを無視するかどうか。値が TRUE の場合、非リーダー FE はリーダー FE からのメタデータギャップを無視し、データ読み取りサービスを提供し続けます。このパラメーターは、リーダー FE を長期間停止した場合でも継続的なデータ読み取りサービスを保証します。値が FALSE の場合、非リーダー FE はリーダー FE からのメタデータギャップを無視せず、データ読み取りサービスを停止します。
- 導入バージョン: -

##### `ignore_task_run_history_replay_error`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: StarRocks が `information_schema.task_runs` の TaskRun 履歴行を逆シリアル化する際、破損または無効な JSON 行は通常、逆シリアル化が警告をログに記録し、RuntimeException をスローします。この項目が `true` に設定されている場合、システムは逆シリアル化エラーをキャッチし、不正な形式のレコードをスキップし、クエリを失敗させるのではなく、残りの行の処理を続行します。これにより、`information_schema.task_runs` クエリが `_statistics_.task_run_history` テーブルの不正なエントリを許容できるようになります。ただし、これを有効にすると、破損した履歴レコードは明示的なエラーを表示する代わりにサイレントにドロップされる可能性があることに注意してください (潜在的なデータ損失)。
- 導入バージョン: v3.3.3, v3.4.0, v3.5.0

##### `lock_checker_interval_second`

- デフォルト: 30
- タイプ: long
- 単位: 秒
- 変更可能: はい
- 説明: LockChecker フロントエンドデーモン ("deadlock-checker" という名前) の実行間隔 (秒単位)。デーモンはデッドロック検出と低速ロックのスキャンを実行します。構成された値はミリ秒単位でタイマーを設定するために 1000 倍されます。この値を減らすと検出遅延が減少しますが、スケジューリングと CPU オーバーヘッドが増加します。増やすとオーバーヘッドが減少しますが、検出と低速ロックレポートが遅れます。変更は、デーモンが実行ごとに間隔をリセットするため、実行時に有効になります。この設定は `lock_checker_enable_deadlock_check` (デッドロックチェックを有効にする) および `slow_lock_threshold_ms` (低速ロックを構成するものを定義する) と相互作用します。
- 導入バージョン: v3.2.0

##### `master_sync_policy`

- デフォルト: SYNC
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: リーダー FE がログをディスクにフラッシュする際のポリシー。このパラメーターは、現在の FE がリーダー FE である場合にのみ有効です。有効な値:
  - `SYNC`: トランザクションがコミットされると、ログエントリが生成され、同時にディスクにフラッシュされます。
  - `NO_SYNC`: トランザクションがコミットされるときに、ログエントリの生成とフラッシュが同時に行われません。
  - `WRITE_NO_SYNC`: トランザクションがコミットされると、ログエントリが同時に生成されますが、ディスクにはフラッシュされません。

  フォロワー FE を 1 つだけデプロイしている場合は、このパラメーターを `SYNC` に設定することをお勧めします。フォロワー FE を 3 つ以上デプロイしている場合は、このパラメーターと `replica_sync_policy` の両方を `WRITE_NO_SYNC` に設定することをお勧めします。

- 導入バージョン: -

##### `max_bdbje_clock_delta_ms`

- デフォルト: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: いいえ
- 説明: StarRocks クラスターのリーダー FE とフォロワーまたはオブザーバー FE の間で許容される最大クロックオフセット。
- 導入バージョン: -

##### `meta_delay_toleration_second`

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: フォロワー FE およびオブザーバー FE のメタデータがリーダー FE のメタデータよりも遅延できる最大期間。単位: 秒。この期間を超過すると、非リーダー FE はサービスの提供を停止します。
- 導入バージョン: -

##### `meta_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/meta"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: メタデータが保存されるディレクトリ。
- 導入バージョン: -

##### `metadata_ignore_unknown_operation_type`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 不明なログ ID を無視するかどうか。FE がロールバックされると、以前のバージョンの FE は一部のログ ID を認識できない場合があります。値が `TRUE` の場合、FE は不明なログ ID を無視します。値が `FALSE` の場合、FE は終了します。
- 導入バージョン: -

##### `profile_info_format`

- デフォルト: default
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: システムが出力するプロファイルの形式。有効な値: `default` と `json`。`default` に設定すると、プロファイルはデフォルトの形式になります。`json` に設定すると、システムは JSON 形式でプロファイルを出力します。
- 導入バージョン: v2.5

##### `replica_ack_policy`

- デフォルト: `SIMPLE_MAJORITY`
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: ログエントリが有効と見なされるポリシー。デフォルト値 `SIMPLE_MAJORITY` は、フォロワー FE の過半数が ACK メッセージを返した場合に、ログエントリが有効と見なされることを指定します。
- 導入バージョン: -

##### `replica_sync_policy`

- デフォルト: SYNC
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: フォロワー FE がログをディスクにフラッシュするポリシー。このパラメーターは、現在の FE がフォロワー FE である場合にのみ有効です。有効な値:
  - `SYNC`: トランザクションがコミットされると、ログエントリが生成され、同時にディスクにフラッシュされます。
  - `NO_SYNC`: トランザクションがコミットされるときに、ログエントリの生成とフラッシュが同時に行われません。
  - `WRITE_NO_SYNC`: トランザクションがコミットされると、ログエントリが同時に生成されますが、ディスクにはフラッシュされません。
- 導入バージョン: -

##### `start_with_incomplete_meta`

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: いいえ
- 説明: true の場合、FE はイメージデータは存在するが Berkeley DB JE (BDB) ログファイルが見つからないか破損している場合に起動を許可します。`MetaHelper.checkMetaDir()` はこのフラグを使用して、対応する BDB ログのないイメージからの起動を通常防止する安全チェックをバイパスします。この方法で起動すると、古いまたは一貫性のないメタデータが生成される可能性があり、緊急リカバリにのみ使用すべきです。`RestoreClusterSnapshotMgr` はクラスター スナップショットの復元中にこのフラグを一時的に true に設定し、その後元に戻します。このコンポーネントは、復元中に `bdbje_reset_election_group` も切り替えます。通常の操作では有効にしないでください。破損した BDB データから復旧する場合、またはイメージベースのスナップショットを明示的に復元する場合にのみ有効にしてください。
- 導入バージョン: v3.2.0

##### `table_keeper_interval_second`

- デフォルト: 30
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: TableKeeper デーモンの実行間隔 (秒単位)。TableKeeperDaemon はこの値 (1000 倍) を使用して内部タイマーを設定し、履歴テーブルが存在すること、テーブルプロパティ (レプリケーション数) が正しいこと、パーティション TTL を更新することを確認するキーパータスクを定期的に実行します。デーモンはリーダーノードでのみ作業を実行し、`table_keeper_interval_second` が変更されると `setInterval` を介して実行時間隔を更新します。スケジューリング頻度と負荷を減らすには増やし、欠落または古い履歴テーブルへの反応を高速化するには減らします。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0

##### `task_runs_ttl_second`

- デフォルト: 7 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タスク実行履歴の Time-To-Live (TTL) を制御します。この値を減らすと、履歴の保持期間が短くなり、メモリ/ディスク使用量が削減されます。増やすと、履歴が長く保持されますが、リソース使用量が増加します。予測可能な保持とストレージ動作のために、`task_runs_max_history_number` および `enable_task_history_archive` とともに調整します。
- 導入バージョン: v3.2.0

##### `task_ttl_second`

- デフォルト: 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タスクの Time-To-Live (TTL)。手動タスク (スケジュールが設定されていない場合) の場合、TaskBuilder はこの値を使用してタスクの `expireTime` を計算します (`expireTime = now + task_ttl_second * 1000L`)。TaskRun もこの値を実行タイムアウトの最大値として使用します。有効な実行タイムアウトは `min(task_runs_timeout_second, task_runs_ttl_second, task_ttl_second)` です。この値を調整すると、手動で作成されたタスクが有効なままになる期間が変更され、タスク実行の最大許容実行時間が間接的に制限される可能性があります。
- 導入バージョン: v3.2.0

##### `thrift_rpc_retry_times`

- デフォルト: 3
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: Thrift RPC 呼び出しが行う試行の合計回数を制御します。この値は `ThriftRPCRequestExecutor` (および `NodeMgr` や `VariableMgr` などの呼び出し元) によって再試行のループカウントとして使用されます。つまり、値 3 は初期試行を含めて最大 3 回の試行を許可します。`TTransportException` の場合、エグゼキューターは接続を再開してこの回数まで再試行します。`SocketTimeoutException` が原因の場合や再開が失敗した場合は再試行しません。各試行は `thrift_rpc_timeout_ms` で構成された試行ごとのタイムアウトの対象となります。この値を増やすと、一時的な接続失敗に対する回復力が向上しますが、RPC 全体の遅延とリソース使用量が増加する可能性があります。
- 導入バージョン: v3.2.0

##### `thrift_rpc_strict_mode`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: Thrift サーバーで使用される TBinaryProtocol の「厳密な読み取り」モードを制御します。この値は、Thrift サーバー スタック内の org.apache.thrift.protocol.TBinaryProtocol.Factory に最初の引数として渡され、受信 Thrift メッセージがどのように解析および検証されるかに影響します。`true` (デフォルト) の場合、サーバーは厳密な Thrift エンコーディング/バージョン チェックを強制し、構成された `thrift_rpc_max_body_size` 制限を尊重します。`false` の場合、サーバーは非厳密 (レガシー/寛容) メッセージ形式を受け入れます。これにより、古いクライアントとの互換性が向上する可能性がありますが、一部のプロトコル検証がバイパスされる可能性があります。この値は変更可能ではなく、相互運用性と解析の安全性に影響するため、実行中のクラスターでこれを変更する場合は注意してください。
- 導入バージョン: v3.2.0

##### `thrift_rpc_timeout_ms`

- デフォルト: 10000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: Thrift RPC 呼び出しのデフォルトのネットワーク/ソケットタイムアウトとして使用されるタイムアウト (ミリ秒単位)。`ThriftConnectionPool` (フロントエンドおよびバックエンドプールで使用される) で Thrift クライアントを作成する際に TSocket に渡され、`ConfigBase`、`LeaderOpExecutor`、`GlobalStateMgr`、`NodeMgr`、`VariableMgr`、`CheckpointWorker` などの場所で RPC 呼び出しタイムアウトを計算する際に、操作の実行タイムアウト (例: ExecTimeout*1000 + `thrift_rpc_timeout_ms`) にも追加されます。この値を増やすと、RPC 呼び出しは長いネットワークまたはリモート処理の遅延を許容できます。減らすと、低速なネットワークでのフェイルオーバーが高速になります。この値を変更すると、Thrift RPC を実行する FE コードパス全体の接続作成とリクエストの期限に影響します。
- 導入バージョン: v3.2.0

##### `txn_rollback_limit`

- デフォルト: 100
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: ロールバック可能なトランザクションの最大数。
- 導入バージョン: -

### ユーザー、ロール、および権限

##### `enable_task_info_mask_credential`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: true の場合、StarRocks は `information_schema.tasks` および `information_schema.task_runs` でタスク SQL 定義から資格情報を削除し、DEFINITION 列に SqlCredentialRedactor.redact を適用することで返します。`information_schema.task_runs` では、定義がタスク実行ステータスから来ている場合でも、空の場合はタスク定義ルックアップから来ている場合でも、同じ編集が適用されます。false の場合、生のタスク定義が返されます (資格情報が公開される可能性があります)。マスキングは CPU/文字列処理作業であり、タスクまたは `task_runs` の数が多い場合は時間がかかる場合があります。編集されていない定義が必要で、セキュリティリスクを受け入れる場合にのみ無効にしてください。
- 導入バージョン: v3.5.6

##### `privilege_max_role_depth`

- デフォルト: 16
- タイプ: Int
- 単位:
- 変更可能: はい
- 説明: ロールの最大ロール深度 (継承レベル)。
- 導入バージョン: v3.0.0

##### `privilege_max_total_roles_per_user`

- デフォルト: 64
- タイプ: Int
- 単位:
- 変更可能: はい
- 説明: ユーザーが持つことができるロールの最大数。
- 導入バージョン: v3.0.0

### クエリエンジン

##### `brpc_send_plan_fragment_timeout_ms`

- デフォルト: 60000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: プランフラグメントを送信する前に BRPC TalkTimeoutController に適用されるタイムアウト (ミリ秒単位)。`BackendServiceClient.sendPlanFragmentAsync` は、バックエンド `execPlanFragmentAsync` を呼び出す前にこの値を設定します。これは、BRPC がアイドル接続を接続プールから借りる際に、および送信を実行する際にどれだけ待機するかを制御します。超過すると、RPC は失敗し、メソッドの再試行ロジックをトリガーする可能性があります。競合時に高速に失敗するにはこれを小さく設定し、一時的なプール枯渇や低速ネットワークを許容するには高く設定します。注意: 非常に大きな値は障害検出を遅らせ、リクエストスレッドをブロックする可能性があります。
- 導入バージョン: v3.3.11, v3.4.1, v3.5.0

##### `connector_table_query_trigger_analyze_large_table_interval`

- デフォルト: 12 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 大規模テーブルのクエリトリガー ANALYZE タスクの間隔。
- 導入バージョン: v3.4.0

##### `connector_table_query_trigger_analyze_max_pending_task_num`

- デフォルト: 100
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE で保留状態にあるクエリトリガー ANALYZE タスクの最大数。
- 導入バージョン: v3.4.0

##### `connector_table_query_trigger_analyze_max_running_task_num`

- デフォルト: 2
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE で実行状態にあるクエリトリガー ANALYZE タスクの最大数。
- 導入バージョン: v3.4.0

##### `connector_table_query_trigger_analyze_small_table_interval`

- デフォルト: 2 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 小規模テーブルのクエリトリガー ANALYZE タスクの間隔。
- 導入バージョン: v3.4.0

##### `connector_table_query_trigger_analyze_small_table_rows`

- デフォルト: 10000000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: クエリトリガー ANALYZE タスクのためにテーブルが小規模テーブルであるかどうかを決定するためのしきい値。
- 導入バージョン: v3.4.0

##### `connector_table_query_trigger_task_schedule_interval`

- デフォルト: 30
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: スケジューラスレッドがクエリトリガーバックグラウンドタスクをスケジュールする間隔。この項目は、v3.4 で導入された `connector_table_query_trigger_analyze_schedule_interval` を置き換えるものです。ここで、バックグラウンドタスクとは、v3.4 の `ANALYZE` タスクと、v3.4 以降のバージョンの低カーディナリティ列の辞書収集タスクを指します。
- 導入バージョン: v3.4.2

##### `create_table_max_serial_replicas`

- デフォルト: 128
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: シリアルに作成するレプリカの最大数。実際のレプリカ数がこの値を超える場合、レプリカは並行して作成されます。テーブル作成に時間がかかっている場合は、この値を減らしてみてください。
- 導入バージョン: -

##### `default_mv_partition_refresh_number`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの更新が複数のパーティションを含む場合、このパラメーターはデフォルトで単一バッチで更新されるパーティションの数を制御します。
バージョン 3.3.0 以降、システムはデフォルトで一度に 1 つのパーティションを更新することで、潜在的なメモリ不足 (OOM) の問題を回避します。以前のバージョンでは、デフォルトですべてのパーティションが一度に更新され、メモリ枯渇やタスク失敗につながる可能性がありました。ただし、マテリアライズドビューの更新が多数のパーティションを含む場合、一度に 1 つのパーティションしか更新しないと、過剰なスケジューリングオーバーヘッド、全体的な更新時間の延長、および多数の更新レコードにつながる可能性があることに注意してください。そのような場合、更新効率を改善し、スケジューリングコストを削減するために、このパラメーターを適切に調整することをお勧めします。
- 導入バージョン: v3.3.0

##### `default_mv_refresh_immediate`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 非同期マテリアライズドビュー作成後すぐに更新するかどうか。この項目が `true` に設定されている場合、新しく作成されたマテリアライズドビューはすぐに更新されます。
- 導入バージョン: v3.2.3

##### `dynamic_partition_check_interval_seconds`

- デフォルト: 600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 新しいデータのチェック間隔。新しいデータが検出された場合、StarRocks は自動的にデータのパーティションを作成します。
- 導入バージョン: -

##### `dynamic_partition_enable`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 動的パーティショニング機能を有効にするかどうか。この機能が有効な場合、StarRocks は新しいデータのパーティションを動的に作成し、期限切れのパーティションを自動的に削除して、データの鮮度を保証します。
- 導入バージョン: -

##### `enable_active_materialized_view_schema_strict_check`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 非アクティブなマテリアライズドビューをアクティブ化する際に、データ型の長さの一貫性を厳密にチェックするかどうか。この項目が `false` に設定されている場合、データ型の長さが基底テーブルで変更されても、マテリアライズドビューのアクティブ化は影響を受けません。
- 導入バージョン: v3.3.4

##### `enable_backup_materialized_view`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 特定のデータベースをバックアップまたは復元する際に、非同期マテリアライズドビューの BACKUP および RESTORE を有効にするかどうか。この項目が `false` に設定されている場合、StarRocks は非同期マテリアライズドビューのバックアップをスキップします。
- 導入バージョン: v3.2.0

##### `enable_collect_full_statistic`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 自動完全統計収集を有効にするかどうか。この機能はデフォルトで有効です。
- 導入バージョン: -

##### `enable_colocate_mv_index`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 同期マテリアライズドビューを作成する際に、同期マテリアライズドビューインデックスを基底テーブルとコロケートすることをサポートするかどうか。この項目が `true` に設定されている場合、タブレットシンクは同期マテリアライズドビューの書き込みパフォーマンスを高速化します。
- 導入バージョン: v3.2.0

##### `enable_decimal_v3`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: DECIMAL V3 データ型をサポートするかどうか。
- 導入バージョン: -

##### `enable_experimental_mv`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 非同期マテリアライズドビュー機能を有効にするかどうか。TRUE はこの機能が有効であることを示します。v2.5.2 以降、この機能はデフォルトで有効になっています。v2.5.2 以前のバージョンでは、この機能はデフォルトで無効になっています。
- 導入バージョン: v2.4

##### `enable_local_replica_selection`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: クエリのためにローカルレプリカを選択するかどうか。ローカルレプリカはネットワーク転送コストを削減します。このパラメーターが TRUE に設定されている場合、CBO は現在の FE と同じ IP アドレスを持つ BE 上のタブレットレプリカを優先的に選択します。このパラメーターが `FALSE` に設定されている場合、ローカルレプリカと非ローカルレプリカの両方を選択できます。
- 導入バージョン: -

##### `enable_materialized_view`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの作成を有効にするかどうか。
- 導入バージョン: -

##### `enable_materialized_view_external_table_precise_refresh`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目を `true` に設定すると、基底テーブルが外部 (クラウドネイティブではない) テーブルである場合に、マテリアライズドビューの更新に対して内部最適化が有効になります。有効にすると、マテリアライズドビューの更新プロセッサは候補パーティションを計算し、すべてのパーティションではなく、影響を受ける基底テーブルパーティションのみを更新し、I/O と更新コストを削減します。外部テーブルの完全パーティション更新を強制するには `false` に設定します。
- 導入バージョン: v3.2.9

##### `enable_materialized_view_metrics_collect`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: デフォルトで非同期マテリアライズドビューの監視メトリックを収集するかどうか。
- 導入バージョン: v3.1.11, v3.2.5

##### `enable_materialized_view_spill`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの更新タスクに対する中間結果スピルを有効にするかどうか。
- 導入バージョン: v3.1.1

##### `enable_materialized_view_text_based_rewrite`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: デフォルトでテキストベースのクエリ書き換えを有効にするかどうか。この項目が `true` に設定されている場合、システムは非同期マテリアライズドビューの作成中に抽象構文ツリーを構築します。
- 導入バージョン: v3.2.5

##### `enable_mv_automatic_active_check`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: スキーマ変更、または基底テーブル (ビュー) の削除と再作成により非アクティブになった非同期マテリアライズドビューをシステムが自動的にチェックし、再アクティブ化することを有効にするかどうか。この機能は、ユーザーが手動で非アクティブに設定したマテリアライズドビューを再アクティブ化しないことに注意してください。
- 導入バージョン: v3.1.6

##### `enable_mv_automatic_repairing_for_broken_base_tables`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、StarRocks は、基底の外部テーブルが削除されて再作成されたり、テーブル識別子が変更されたりした場合に、マテリアライズドビューの基底テーブルメタデータを自動的に修復しようとします。修復フローは、マテリアライズドビューの基底テーブル情報を更新し、外部テーブルパーティションのパーティションレベルの修復情報を収集し、`autoRefreshPartitionsLimit` を尊重しながら非同期自動更新マテリアライズドビューのパーティション更新決定を駆動することができます。現在、自動修復は Hive 外部テーブルをサポートしています。サポートされていないテーブルタイプは、マテリアライズドビューを非アクティブにし、修復例外を引き起こします。パーティション情報収集は非ブロッキングであり、失敗はログに記録されます。
- 導入バージョン: v3.3.19, v3.4.8, v3.5.6

##### `enable_predicate_columns_collection`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 述語列の収集を有効にするかどうか。無効にすると、クエリ最適化中に述語列は記録されません。
- 導入バージョン: -

##### `enable_query_queue_v2`

- デフォルト: true
- タイプ: boolean
- 単位: -
- 変更可能: いいえ
- 説明: true の場合、FE のスロットベースクエリスケジューラを Query Queue V2 に切り替えます。このフラグは、スロットマネージャーとトラッカー (例: `BaseSlotManager.isEnableQueryQueueV2` および `SlotTracker#createSlotSelectionStrategy`) によって読み取られ、従来の戦略ではなく `SlotSelectionStrategyV2` を選択します。`query_queue_v2_xxx` 構成オプションと `QueryQueueOptions` は、このフラグが有効な場合にのみ有効になります。v4.1 以降、デフォルト値は `false` から `true` に変更されました。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0

##### `enable_sql_blacklist`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: SQL クエリのブラックリストチェックを有効にするかどうか。この機能が有効な場合、ブラックリスト内のクエリは実行できません。
- 導入バージョン: -

##### `enable_statistic_collect`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: CBO の統計を収集するかどうか。この機能はデフォルトで有効です。
- 導入バージョン: -

##### `enable_statistic_collect_on_first_load`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: データロード操作によってトリガーされる自動統計収集とメンテナンスを制御します。これには以下が含まれます。
  - データがパーティションに初めてロードされたとき (パーティションバージョンが 2 の場合) の統計収集。
  - 複数パーティションテーブルの空のパーティションにデータがロードされたときの統計収集。
  - INSERT OVERWRITE 操作の統計コピーと更新。

  **統計収集タイプの決定ポリシー:**
  
  - INSERT OVERWRITE の場合: `deltaRatio = |targetRows - sourceRows| / (sourceRows + 1)`
    - `deltaRatio < statistic_sample_collect_ratio_threshold_of_first_load` (デフォルト: 0.1) の場合、統計収集は実行されません。既存の統計のみがコピーされます。
    - それ以外の場合、`targetRows > statistic_sample_collect_rows` (デフォルト: 200000) の場合、SAMPLE 統計収集が使用されます。
    - それ以外の場合、FULL 統計収集が使用されます。
  
  - 初回ロードの場合: `deltaRatio = loadRows / (totalRows + 1)`
    - `deltaRatio < statistic_sample_collect_ratio_threshold_of_first_load` (デフォルト: 0.1) の場合、統計収集は実行されません。
    - それ以外の場合、`loadRows > statistic_sample_collect_rows` (デフォルト: 200000) の場合、SAMPLE 統計収集が使用されます。
    - それ以外の場合、FULL 統計収集が使用されます。
  
  **同期動作:**
  
  - DML ステートメント (INSERT INTO/INSERT OVERWRITE) の場合: テーブルロックを使用した同期モード。ロード操作は統計収集が完了するまで待機します (最大 `semi_sync_collect_statistic_await_seconds` まで)。
  - Stream Load および Broker Load の場合: ロックなしの非同期モード。統計収集はバックグラウンドで実行され、ロード操作をブロックしません。
  
  :::note
  この設定を無効にすると、ロードによってトリガーされるすべての統計操作 (INSERT OVERWRITE の統計メンテナンスを含む) が防止され、テーブルに統計が不足する可能性があります。新しいテーブルが頻繁に作成され、データが頻繁にロードされる場合、この機能を有効にするとメモリと CPU のオーバーヘッドが増加します。
  :::

- 導入バージョン: v3.1

##### `enable_statistic_collect_on_update`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: UPDATE ステートメントが自動統計収集をトリガーできるかどうかを制御します。有効にすると、テーブルデータを変更する UPDATE 操作は、`enable_statistic_collect_on_first_load` によって制御される同じインジェストベースの統計フレームワークを通じて統計収集をスケジュールする可能性があります。この設定を無効にすると、UPDATE ステートメントの統計収集はスキップされ、ロードによってトリガーされる統計収集動作は変更されません。
- 導入バージョン: v3.5.11, v4.0.4

##### `enable_udf`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: UDF を有効にするかどうか。
- 導入バージョン: -

##### `expr_children_limit`

- デフォルト: 10000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 式で許可される子式の最大数。
- 導入バージョン: -

##### `histogram_buckets_size`

- デフォルト: 64
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムのデフォルトのバケット数。
- 導入バージョン: -

##### `histogram_max_sample_row_count`

- デフォルト: 10000000
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムのために収集する最大行数。
- 導入バージョン: -

##### `histogram_mcv_size`

- デフォルト: 100
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムの最頻値 (MCV) の数。
- 導入バージョン: -

##### `histogram_sample_ratio`

- デフォルト: 0.1
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: ヒストグラムのサンプリング比率。
- 導入バージョン: -

##### `http_slow_request_threshold_ms`

- デフォルト: 5000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: HTTP リクエストの応答時間がこのパラメーターで指定された値を超えた場合、このリクエストを追跡するためのログが生成されます。
- 導入バージョン: v2.5.15, v3.1.5

##### `lock_checker_enable_deadlock_check`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 有効にすると、LockChecker スレッドは ThreadMXBean.findDeadlockedThreads() を使用して JVM レベルのデッドロック検出を実行し、問題のあるスレッドのスタックトレースをログに記録します。このチェックは LockChecker デーモン (その頻度は `lock_checker_interval_second` によって制御されます) の内部で実行され、詳細なスタック情報をログに書き込みます。これは CPU および I/O 集中型になる可能性があります。このオプションは、ライブまたは再現可能なデッドロックの問題のトラブルシューティングのためにのみ有効にしてください。通常の操作で有効のままにしておくと、オーバーヘッドとログのボリュームが増加する可能性があります。
- 導入バージョン: v3.2.0

##### `low_cardinality_threshold`

- デフォルト: 255
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: 低カーディナリティ辞書のしきい値。
- 導入バージョン: v3.5.0

##### `materialized_view_min_refresh_interval`

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: ASYNC マテリアライズドビュー スケジュールの最小許容更新間隔 (秒単位)。マテリアライズドビューが時間ベースの間隔で作成された場合、その間隔は秒に変換され、この値よりも小さくすることはできません。そうでない場合、CREATE/ALTER 操作は DDL エラーで失敗します。この値が 0 より大きい場合、チェックが強制されます。制限を無効にするには 0 または負の値に設定します。これにより、過剰な TaskManager スケジューリングと、過度に頻繁な更新による FE のメモリ/CPU 使用量が高くなるのを防ぎます。この項目は `EVENT_TRIGGERED` 更新には適用されません。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0

##### `materialized_view_refresh_ascending`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、マテリアライズドビューパーティションの更新は、パーティションキーの昇順 (最も古いものから新しいものへ) でパーティションを反復します。`false` (デフォルト) に設定されている場合、システムは降順 (最も新しいものから古いものへ) で反復します。StarRocks は、パーティション更新制限が適用される場合にどのパーティションを処理するかを選択し、後続の TaskRun 実行のために次の開始/終了パーティション境界を計算するために、リストパーティション化されたマテリアライズドビューと範囲パーティション化されたマテリアライズドビューの両方の更新ロジックでこの項目を使用します。この項目を変更すると、どのパーティションが最初に更新されるか、および次のパーティション範囲がどのように導出されるかが変更されます。範囲パーティション化されたマテリアライズドビューの場合、スケジューラは新しい開始/終了を検証し、変更によって繰り返される境界 (デッドループ) が作成される場合、エラーを発生させるため、この項目を慎重に設定してください。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0

##### `max_allowed_in_element_num_of_delete`

- デフォルト: 10000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: DELETE ステートメントの IN 述語で許可される要素の最大数。
- 導入バージョン: -

##### `max_create_table_timeout_second`

- デフォルト: 600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: テーブル作成の最大タイムアウト期間。
- 導入バージョン: -

##### `max_distribution_pruner_recursion_depth`

- デフォルト: 100
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: パーティションプルーナーが許可する最大再帰深度。再帰深度を増やすと、より多くの要素をプルーニングできますが、CPU 消費も増加します。
- 導入バージョン: -

##### `max_partitions_in_one_batch`

- デフォルト: 4096
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: パーティションを一括作成するときに作成できるパーティションの最大数。
- 導入バージョン: -

##### `max_planner_scalar_rewrite_num`

- デフォルト: 100000
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: オプティマイザーがスカラー演算子を書き換えることができる最大回数。
- 導入バージョン: -

##### `max_query_queue_history_slots_number`

- デフォルト: 0
- タイプ: Int
- 単位: スロット
- 変更可能: はい
- 説明: 監視と可観測性のために、クエリキューごとに保持される最近解放された (履歴) 割り当てスロットの数を制御します。`max_query_queue_history_slots_number` が `> 0` の値に設定されている場合、BaseSlotTracker は、インメモリキューにその数の最も最近解放された LogicalSlot エントリを保持し、制限を超えると最も古いものを削除します。これを有効にすると、getSlots() にこれらの履歴エントリ (最新のものが最初) が含まれるようになり、BaseSlotTracker は ConnectContext にスロットを登録して、より豊富な ExtraMessage データを提供できるようになり、LogicalSlot.ConnectContextListener はクエリ完了メタデータを履歴スロットに添付できるようになります。`max_query_queue_history_slots_number` が `<= 0` の場合、履歴メカニズムは無効になります (追加のメモリは使用されません)。可観測性とメモリオーバーヘッドのバランスをとるために、適切な値を使用してください。
- 導入バージョン: v3.5.0

##### `max_query_retry_time`

- デフォルト: 2
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE でのクエリ再試行の最大数。
- 導入バージョン: -

##### `max_running_rollup_job_num_per_table`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: テーブルで並行して実行できるロールアップジョブの最大数。
- 導入バージョン: -

##### `max_scalar_operator_flat_children`

- デフォルト：10000
- タイプ：Int
- 単位：-
- 変更可能: はい
- 説明：ScalarOperator のフラットな子の最大数。オプティマイザーが過剰なメモリを使用するのを防ぐために、この制限を設定できます。
- 導入バージョン: -

##### `max_scalar_operator_optimize_depth`

- デフォルト：256
- タイプ：Int
- 単位：-
- 変更可能: はい
- 説明: ScalarOperator 最適化を適用できる最大深度。
- 導入バージョン: -

##### `mv_active_checker_interval_seconds`

- デフォルト: 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: バックグラウンドの `active_checker` スレッドが有効な場合、システムはスキーマ変更または基底テーブル (またはビュー) の再構築により非アクティブになったマテリアライズドビューを定期的に検出し、自動的に再アクティブ化します。このパラメーターは、チェッカースレッドのスケジューリング間隔を秒単位で制御します。デフォルト値はシステム定義です。
- 導入バージョン: v3.1.6

##### `mv_rewrite_consider_data_layout_mode`

- デフォルト: `enable`
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの書き換えが、最適なマテリアライズドビューを選択する際に、基底テーブルのデータレイアウトを考慮するかどうかを制御します。有効な値:
  - `disable`: 候補となるマテリアライズドビューを選択する際に、データレイアウト基準を一切使用しません。
  - `enable`: クエリがレイアウトを意識していると認識された場合にのみ、データレイアウト基準を使用します。
  - `force`: 最適なマテリアライズドビューを選択する際に、常にデータレイアウト基準を適用します。
  この項目を変更すると、`BestMvSelector` の動作が影響され、物理レイアウトがプランの正しさやパフォーマンスに影響するかどうかに応じて、書き換えの適用性が向上または拡大する可能性があります。
- 導入バージョン: -

##### `publish_version_interval_ms`

- デフォルト: 10
- タイプ: Int
- 単位: ミリ秒
- 変更可能: いいえ
- 説明: リリース検証タスクが発行される時間間隔。
- 導入バージョン: -

##### `query_queue_slots_estimator_strategy`

- デフォルト: MAX
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: `enable_query_queue_v2` が true の場合に、キューベースクエリに使用されるスロット推定戦略を選択します。有効な値: MBE (メモリベース)、PBE (並列処理ベース)、MAX (MBE と PBE の最大値を取る)、MIN (MBE と PBE の最小値を取る)。MBE は、予測されたメモリまたはプランコストをスロットあたりのメモリターゲットで割った値からスロットを推定し、`totalSlots` で上限が設定されます。PBE は、フラグメント並列処理 (スキャン範囲数またはカーディナリティ/スロットあたりの行数) と CPU コストベースの計算 (スロットあたりの CPU コストを使用) からスロットを導出し、その結果を [numSlots/2, numSlots] の範囲にクランプします。MAX と MIN は、それぞれ最大値または最小値を取ることで MBE と PBE を結合します。構成された値が無効な場合、デフォルト (`MAX`) が使用されます。
- 導入バージョン: v3.5.0

##### `query_queue_v2_concurrency_level`

- デフォルト: 4
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: システムの合計クエリスロットを計算する際に使用される論理的な並行性「レイヤー」の数を制御します。Shared-nothing モードでは、合計スロット = `query_queue_v2_concurrency_level` * BE の数 * BE あたりのコア数 (BackendResourceStat から派生)。マルチウェアハウスモードでは、有効な並行性は max(1, `query_queue_v2_concurrency_level` / 4) にスケールダウンされます。構成された値が非正の場合、`4` として扱われます。この値を変更すると totalSlots (および同時クエリ容量) が増減し、スロットごとのリソースに影響します。memBytesPerSlot は、ワーカーごとのメモリを (ワーカーごとのコア数 * 並行性) で割って導出され、CPU 課金は `query_queue_v2_cpu_costs_per_slot` を使用します。クラスターサイズに比例して設定します。非常に大きな値はスロットごとのメモリを減らし、リソースの断片化を引き起こす可能性があります。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0

##### `query_queue_v2_cpu_costs_per_slot`

- デフォルト: 1000000000
- タイプ: Long
- 単位: プランナー CPU コスト単位
- 変更可能: はい
- 説明: クエリがプランナー CPU コストから必要とするスロット数を推定するために使用されるスロットあたりの CPU コストしきい値。スケジューラはスロットを整数 (`plan_cpu_costs` / `query_queue_v2_cpu_costs_per_slot`) として計算し、その結果を範囲 [1, totalSlots] にクランプし、計算された値が非正の場合は最低 1 を強制します (totalSlots はクエリキュー V2 の `V2` パラメーターから導出されます)。V2 コードは非正の設定を 1 (Math.max(1, value)) に正規化するため、非正の値は実質的に `1` になります。この値を増やすと、クエリごとに割り当てられるスロットが減り (より少ない、より大きなスロットのクエリを優先)、減らすとクエリごとのスロットが増加します。並列処理とリソースの粒度を制御するために、`query_queue_v2_num_rows_per_slot` および並行性設定と組み合わせて調整します。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0

##### `query_queue_v2_num_rows_per_slot`

- デフォルト: 4096
- タイプ: Int
- 単位: 行
- 変更可能: はい
- 説明: クエリごとのスロット数を推定する際に、単一のスケジューリングスロットに割り当てられるソース行レコードの目標数。StarRocks は、`estimated_slots` = (ソースノードのカーディナリティ) / `query_queue_v2_num_rows_per_slot` を計算し、その結果を範囲 [1, totalSlots] にクランプし、計算された値が非正の場合は最低 1 を強制します。totalSlots は利用可能なリソース (おおよそ DOP * `query_queue_v2_concurrency_level` * ワーカー/BE の数) から導出されるため、クラスター/コア数に依存します。この値を増やすと、スロット数が減り (各スロットがより多くの行を処理)、スケジューリングオーバーヘッドが削減されます。減らすと、リソース制限まで並列処理が増加します (より多くの、より小さなスロット)。
- 導入バージョン: v3.3.4, v3.4.0, v3.5.0

##### `query_queue_v2_schedule_strategy`

- デフォルト: SWRR
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: Query Queue V2 が保留中のクエリを並べ替えるために使用するスケジューリングポリシーを選択します。サポートされる値 (大文字と小文字を区別しない) は `SWRR` (Smooth Weighted Round Robin) — デフォルトで、公平な重み付き共有を必要とする混合/ハイブリッドワークロードに適しています — および `SJF` (Short Job First + Aging) — エイジングを使用して飢餓を回避しながら短いジョブを優先します。この値は、大文字と小文字を区別しない enum ルックアップで解析されます。認識されない値はエラーとしてログに記録され、デフォルトのポリシーが使用されます。この設定は、Query Queue V2 が有効な場合にのみ動作に影響し、`query_queue_v2_concurrency_level` のような V2 サイジング設定と相互作用します。
- 導入バージョン: v3.3.12, v3.4.2, v3.5.0

##### `semi_sync_collect_statistic_await_seconds`

- デフォルト: 30
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: DML 操作 (INSERT INTO および INSERT OVERWRITE ステートメント) 中の半同期統計収集の最大待機時間。Stream Load および Broker Load は非同期モードを使用し、この設定の影響を受けません。統計収集時間がこの値を超過した場合、ロード操作は収集が完了するのを待たずに続行されます。この設定は `enable_statistic_collect_on_first_load` と連携して機能します。
- 導入バージョン: v3.1

##### `slow_query_analyze_threshold`

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: クエリフィードバックの分析をトリガーするクエリの実行時間しきい値。
- 導入バージョン: v3.4.0

##### `statistic_analyze_status_keep_second`

- デフォルト: 3 * 24 * 3600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 収集タスクの履歴を保持する期間。デフォルト値は 3 日です。
- 導入バージョン: -

##### `statistic_auto_analyze_end_time`

- デフォルト: 23:59:59
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: 自動収集の終了時刻。値の範囲: `00:00:00` - `23:59:59`。
- 導入バージョン: -

##### `statistic_auto_analyze_start_time`

- デフォルト: 00:00:00
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: 自動収集の開始時刻。値の範囲: `00:00:00` - `23:59:59`。
- 導入バージョン: -

##### `statistic_auto_collect_ratio`

- デフォルト: 0.8
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: 自動収集の統計が正常であるかどうかを判断するためのしきい値。統計の健全性がこのしきい値よりも低い場合、自動収集がトリガーされます。
- 導入バージョン: -

##### `statistic_auto_collect_small_table_rows`

- デフォルト: 10000000
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: 自動収集中に、外部データソース (Hive、Iceberg、Hudi) のテーブルが小規模テーブルであるかどうかを判断するためのしきい値。テーブルの行数がこの値より少ない場合、そのテーブルは小規模テーブルと見なされます。
- 導入バージョン: v3.2

##### `statistic_cache_columns`

- デフォルト: 100000
- タイプ: Long
- 単位: -
- 変更可能: いいえ
- 説明: 統計テーブルのためにキャッシュできる行数。
- 導入バージョン: -

##### `statistic_cache_thread_pool_size`

- デフォルト: 10
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: 統計キャッシュを更新するために使用されるスレッドプールのサイズ。
- 導入バージョン: -

##### `statistic_collect_interval_sec`

- デフォルト: 5 * 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 自動収集中にデータ更新をチェックする間隔。
- 導入バージョン: -

##### `statistic_max_full_collect_data_size`

- デフォルト: 100 * 1024 * 1024 * 1024
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: 統計の自動収集のためのデータサイズしきい値。合計サイズがこの値を超えると、完全収集の代わりにサンプリング収集が実行されます。
- 導入バージョン: -

##### `statistic_sample_collect_rows`

- デフォルト: 200000
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: ロードトリガー統計操作中に、SAMPLE と FULL 統計収集のどちらを選択するかを決定するための行数しきい値。ロードまたは変更された行数がこのしきい値 (デフォルト 200,000) を超える場合、SAMPLE 統計収集が使用されます。それ以外の場合、FULL 統計収集が使用されます。この設定は、`enable_statistic_collect_on_first_load` および `statistic_sample_collect_ratio_threshold_of_first_load` と連携して機能します。
- 導入バージョン: -

##### `statistic_update_interval_sec`

- デフォルト: 24 * 60 * 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: 統計情報のキャッシュが更新される間隔。
- 導入バージョン: -

##### `task_check_interval_second`

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タスクバックグラウンドジョブの実行間隔。GlobalStateMgr はこの値を使用して `doTaskBackgroundJob()` を呼び出す TaskCleaner FrontendDaemon をスケジュールします。この値はデーモン間隔をミリ秒単位で設定するために 1000 倍されます。値を減らすと、バックグラウンドメンテナンス (タスククリーンアップ、チェック) がより頻繁に実行され、より迅速に反応しますが、CPU/IO オーバーヘッドが増加します。増やすとオーバーヘッドが減少しますが、クリーンアップと古いタスクの検出が遅れます。この値を調整して、メンテナンスの応答性とリソース使用量のバランスをとってください。
- 導入バージョン: v3.2.0

##### `task_min_schedule_interval_s`

- デフォルト: 10
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: SQL レイヤーによってチェックされるタスクスケジュールの最小許容スケジュール間隔 (秒単位)。タスクが送信されると、TaskAnalyzer はスケジュール期間を秒に変換し、期間が `task_min_schedule_interval_s` よりも小さい場合、`ERR_INVALID_PARAMETER` で送信を拒否します。これにより、頻繁すぎるタスクの作成が防止され、スケジューラーが高頻度タスクから保護されます。スケジュールに明示的な開始時刻がない場合、TaskAnalyzer は開始時刻を現在のエポック秒に設定します。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0

##### `task_runs_timeout_second`

- デフォルト: 4 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: TaskRun のデフォルト実行タイムアウト (秒単位)。この項目は、TaskRun 実行でベースラインタイムアウトとして使用されます。タスク実行のプロパティに、正の整数値を持つセッション変数 `query_timeout` または `insert_timeout` が含まれている場合、ランタイムは、そのセッションタイムアウトと `task_runs_timeout_second` のうち大きい方の値を使用します。有効なタイムアウトは、構成された `task_runs_ttl_second` と `task_ttl_second` を超えないように制限されます。タスク実行の最大実行時間を制限するには、この項目を設定します。非常に大きな値は、タスク/タスク実行の TTL 設定によってクリップされる可能性があります。
- 導入バージョン: -

### ロードとアンロード

##### `broker_load_default_timeout_second`

- デフォルト: 14400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: Broker Load ジョブのタイムアウト期間。
- 導入バージョン: -

##### `desired_max_waiting_jobs`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE での保留中のジョブの最大数。この数は、テーブル作成、ロード、スキーマ変更ジョブなど、すべてのジョブを指します。FE での保留中のジョブの数がこの値に達した場合、FE は新しいロードリクエストを拒否します。このパラメーターは、非同期ロードにのみ有効です。v2.5 以降、デフォルト値は 100 から 1024 に変更されました。
- 導入バージョン: -

##### `disable_load_job`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: クラスターがエラーに遭遇した場合にロードを無効にするかどうか。これにより、クラスターエラーによるデータの損失が防止されます。デフォルト値は `FALSE` であり、ロードが無効になっていないことを示します。`TRUE` はロードが無効になり、クラスターが読み取り専用状態になることを示します。
- 導入バージョン: -

##### `empty_load_as_error`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: データがロードされていない場合に、エラーメッセージ「すべてのパーティションにロードデータがありません」を返すかどうか。有効な値:
  - `true`: データがロードされていない場合、システムは失敗メッセージを表示し、「すべてのパーティションにロードデータがありません」というエラーを返します。
  - `false`: データがロードされていない場合、システムは成功メッセージを表示し、エラーではなく OK を返します。
- 導入バージョン: -

##### `enable_routine_load_lag_metrics`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: ルーチンロード Kafka パーティションオフセットラグメトリックを収集するかどうか。この項目を `true` に設定すると、Kafka API を呼び出してパーティションの最新オフセットを取得することに注意してください。
- 導入バージョン: -

##### `enable_sync_publish`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: ロードトランザクションのパブリッシュフェーズで apply タスクを同期的に実行するかどうか。このパラメーターはプライマリキーテーブルにのみ適用されます。有効な値:
  - `TRUE` (デフォルト): ロードトランザクションのパブリッシュフェーズで apply タスクが同期的に実行されます。これは、apply タスクが完了し、ロードされたデータが実際にクエリ可能になった後にのみ、ロードトランザクションが成功として報告されることを意味します。タスクが一度に大量のデータをロードしたり、データを頻繁にロードしたりする場合、このパラメーターを `true` に設定すると、クエリパフォーマンスと安定性を向上させることができますが、ロード遅延が増加する可能性があります。
  - `FALSE`: ロードトランザクションのパブリッシュフェーズで apply タスクが非同期的に実行されます。これは、apply タスクが送信された後にロードトランザクションが成功として報告されますが、ロードされたデータはすぐにクエリできないことを意味します。この場合、同時クエリは apply タスクが完了するかタイムアウトするまで待機する必要があります。タスクが一度に大量のデータをロードしたり、データを頻繁にロードしたりする場合、このパラメーターを `false` に設定すると、クエリパフォーマンスと安定性に影響を与える可能性があります。
- 導入バージョン: v3.2.0

##### `export_checker_interval_second`

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: ロードジョブがスケジュールされる時間間隔。
- 導入バージョン: -

##### `export_max_bytes_per_be_per_task`

- デフォルト: 268435456
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: 単一の BE から単一のデータアンロードタスクでエクスポートできる最大データ量。
- 導入バージョン: -

##### `export_running_job_num_limit`

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 並行して実行できるデータエクスポートタスクの最大数。
- 導入バージョン: -

##### `export_task_default_timeout_second`

- デフォルト: 2 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: データエクスポートタスクのタイムアウト期間。
- 導入バージョン: -

##### `export_task_pool_size`

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: アンロードタスクスレッドプールのサイズ。
- 導入バージョン: -

##### `external_table_commit_timeout_ms`

- デフォルト: 10000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: StarRocks 外部テーブルへの書き込みトランザクションをコミット (発行) するためのタイムアウト期間。デフォルト値 `10000` は 10 秒のタイムアウト期間を示します。
- 導入バージョン: -

##### `finish_transaction_default_lock_timeout_ms`

- デフォルト: 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: トランザクション完了時に db およびテーブルロックを取得するためのデフォルトのタイムアウト。
- 導入バージョン: v4.0.0, v3.5.8

##### `history_job_keep_max_second`

- デフォルト: 7 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: スキーマ変更ジョブなど、過去のジョブを保持できる最大期間。
- 導入バージョン: -

##### `insert_load_default_timeout_second`

- デフォルト: 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: データをロードするために使用される INSERT INTO ステートメントのタイムアウト期間。
- 導入バージョン: -

##### `label_clean_interval_second`

- デフォルト: 4 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: ラベルがクリーンアップされる時間間隔。単位: 秒。履歴ラベルがタイムリーにクリーンアップされるように、短い時間間隔を指定することをお勧めします。
- 導入バージョン: -

##### `label_keep_max_num`

- デフォルト: 1000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 一定期間内に保持できるロードジョブの最大数。この数を超えると、履歴ジョブの情報は削除されます。
- 導入バージョン: -

##### `label_keep_max_second`

- デフォルト: 3 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 完了し、FINISHED または CANCELLED 状態にあるロードジョブのラベルを保持する最大期間 (秒単位)。デフォルト値は 3 日です。この期間が経過すると、ラベルは削除されます。このパラメーターは、すべての種類のロードジョブに適用されます。値が大きすぎると、大量のメモリを消費します。
- 導入バージョン: -

##### `load_checker_interval_second`

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: ロードジョブがローリングベースで処理される時間間隔。
- 導入バージョン: -

##### `load_parallel_instance_num`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: Broker Load と Stream Load の単一ホスト上に作成される並列ロードフラグメントインスタンスの数を制御します。LoadPlanner は、セッションがアダプティブシンク DOP を有効にしない限り、この値をホストあたりの並列度として使用します。セッション変数 `enable_adaptive_sink_dop` が true の場合、セッションの `sink_degree_of_parallelism` がこの設定を上書きします。シャッフルが必要な場合、この値はフラグメントの並列実行 (スキャンフラグメントとシンクフラグメントの並列実行インスタンス) に適用されます。シャッフルが不要な場合、シンクパイプライン DOP として使用されます。注: ローカルファイルからのロードは、ローカルディスクの競合を避けるために、単一インスタンス (パイプライン DOP = 1、並列実行 = 1) に強制されます。この値を増やすと、ホストあたりの並行性とスループットが向上しますが、CPU、メモリ、および I/O の競合が増加する可能性があります。
- 導入バージョン: v3.2.0

##### `load_straggler_wait_second`

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: BE レプリカが許容できる最大ロード遅延。この値を超過すると、他のレプリカからデータをクローンするためにクローニングが実行されます。
- 導入バージョン: -

##### `loads_history_retained_days`

- デフォルト: 30
- タイプ: Int
- 単位: 日
- 変更可能: はい
- 説明: 内部 `_statistics_.loads_history` テーブルにロード履歴を保持する日数。この値は、テーブル作成時に `partition_live_number` テーブルプロパティを設定するために使用され、`TableKeeper` に渡され (最小 1 にクランプされます)、保持する日次パーティションの数を決定します。この値を増減すると、完了したロードジョブが日次パーティションに保持される期間が調整されます。新しいテーブルの作成とキーパーの削除動作に影響しますが、過去のパーティションを自動的に再作成することはありません。`LoadsHistorySyncer` は、ロード履歴のライフサイクルを管理する際にこの保持に依存します。その同期頻度は `loads_history_sync_interval_second` によって制御されます。
- 導入バージョン: v3.3.6, v3.4.0, v3.5.0

##### `loads_history_sync_interval_second`

- デフォルト: 60
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: LoadsHistorySyncer が `information_schema.loads` から内部 `_statistics_.loads_history` テーブルに完了したロードジョブの定期的な同期をスケジュールするために使用する間隔 (秒単位)。値はコンストラクタで 1000 倍され、FrontendDaemon 間隔を設定します。シンクロナイザーは最初の実行をスキップし (テーブル作成を許可するため)、1 分以上前に完了したロードのみをインポートします。小さい値は DML とエグゼキュータの負荷を増加させ、大きい値は履歴ロードレコードの可用性を遅らせます。ターゲットテーブルの保持/パーティション分割動作については `loads_history_retained_days` を参照してください。
- 導入バージョン: v3.3.6, v3.4.0, v3.5.0

##### `max_broker_load_job_concurrency`

- デフォルト: 5
- エイリアス: `async_load_task_pool_size`
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: StarRocks クラスター内で許可される Broker Load ジョブの最大同時実行数。このパラメーターは Broker Load にのみ有効です。このパラメーターの値は、`max_running_txn_num_per_db` の値よりも小さくなければなりません。v2.5 以降、デフォルト値は `10` から `5` に変更されました。
- 導入バージョン: -

##### `max_load_timeout_second`

- デフォルト: 259200
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: ロードジョブに許可される最大タイムアウト期間。この制限を超過すると、ロードジョブは失敗します。この制限は、すべての種類のロードジョブに適用されます。
- 導入バージョン: -

##### `max_routine_load_batch_size`

- デフォルト: 4294967296
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: Routine Load タスクでロードできる最大データ量。
- 導入バージョン: -

##### `max_routine_load_task_concurrent_num`

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 各 Routine Load ジョブの最大同時タスク数。
- 導入バージョン: -

##### `max_routine_load_task_num_per_be`

- デフォルト: 16
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 各 BE での最大同時 Routine Load タスク数。v3.1.0 以降、このパラメーターのデフォルト値は 5 から 16 に増加し、BE 静的パラメーター `routine_load_thread_pool_size` (非推奨) の値以下である必要がなくなりました。
- 導入バージョン: -

##### `max_running_txn_num_per_db`

- デフォルト: 1000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: StarRocks クラスター内の各データベースで実行が許可されるロードトランザクションの最大数。デフォルト値は `1000` です。v3.1 以降、デフォルト値は `100` から `1000` に変更されました。データベースで実行中のロードトランザクションの実際の数がこのパラメーターの値を超過すると、新しいロードリクエストは処理されません。同期ロードジョブの新しいリクエストは拒否され、非同期ロードジョブの新しいリクエストはキューに入れられます。このパラメーターの値を増やすことは、システム負荷を増加させるため、推奨しません。
- 導入バージョン: -

##### `max_stream_load_timeout_second`

- デフォルト: 259200
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: Stream Load ジョブに許可される最大タイムアウト期間。
- 導入バージョン: -

##### `max_tolerable_backend_down_num`

- デフォルト: 0
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 許容される障害 BE ノードの最大数。この数を超過すると、Routine Load ジョブは自動的に復旧できません。
- 導入バージョン: -

##### `min_bytes_per_broker_scanner`

- デフォルト: 67108864
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: Broker Load インスタンスで処理できる最小データ量。
- 導入バージョン: -

##### `min_load_timeout_second`

- デフォルト: 1
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: ロードジョブに許可される最小タイムアウト期間。この制限は、すべての種類のロードジョブに適用されます。
- 導入バージョン: -

##### `min_routine_load_lag_for_metrics`

- デフォルト: 10000
- タイプ: INT
- 単位: -
- 変更可能: はい
- 説明: モニタリングメトリックに表示される Routine Load ジョブの最小オフセット遅延。オフセット遅延がこの値よりも大きい Routine Load ジョブはメトリックに表示されます。
- 導入バージョン: -

##### `period_of_auto_resume_min`

- デフォルト: 5
- タイプ: Int
- 単位: 分
- 変更可能: はい
- 説明: Routine Load ジョブが自動的に復旧される間隔。
- 導入バージョン: -

##### `prepared_transaction_default_timeout_second`

- デフォルト: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 準備されたトランザクションのデフォルトのタイムアウト期間。
- 導入バージョン: -

##### `routine_load_task_consume_second`

- デフォルト: 15
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: クラスター内の各 Routine Load タスクがデータを消費する最大時間。v3.1.0 以降、Routine Load ジョブは [`job_properties`](../../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md#job_properties) で新しいパラメーター `task_consume_second` をサポートしています。このパラメーターは Routine Load ジョブ内の個々のロードタスクに適用され、より柔軟性があります。
- 導入バージョン: -

##### `routine_load_task_timeout_second`

- デフォルト: 60
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: クラスター内の各 Routine Load タスクのタイムアウト期間。v3.1.0 以降、Routine Load ジョブは [`job_properties`](../../sql-reference/sql-statements/loading_unloading/routine_load/CREATE_ROUTINE_LOAD.md#job_properties) で新しいパラメーター `task_timeout_second` をサポートしています。このパラメーターは Routine Load ジョブ内の個々のロードタスクに適用され、より柔軟性があります。
- 導入バージョン: -

##### `routine_load_unstable_threshold_second`

- デフォルト: 3600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: Routine Load ジョブ内のいずれかのタスクが遅延した場合、Routine Load ジョブは UNSTABLE 状態に設定されます。具体的には、消費されているメッセージのタイムスタンプと現在の時刻の差がこのしきい値を超え、データソースに消費されていないメッセージが存在する場合です。
- 導入バージョン: -

##### `spark_dpp_version`

- デフォルト: 1.0.0
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 使用される Spark Dynamic Partition Pruning (DPP) のバージョン。
- 導入バージョン: -

##### `spark_home_default_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/lib/spark2x"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Spark クライアントのルートディレクトリ。
- 導入バージョン: -

##### `spark_launcher_log_dir`

- デフォルト: `sys_log_dir` + "/spark_launcher_log"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Spark ログファイルを格納するディレクトリ。
- 導入バージョン: -

##### `spark_load_default_timeout_second`

- デフォルト: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 各 Spark Load ジョブのタイムアウト期間。
- 導入バージョン: -

##### `spark_load_submit_timeout_second`

- デフォルト: 300
- タイプ: long
- 単位: 秒
- 変更可能: いいえ
- 説明: Spark アプリケーションの送信後、YARN の応答を待機する最大時間 (秒単位)。`SparkLauncherMonitor.LogMonitor` はこの値をミリ秒に変換し、ジョブが UNKNOWN/CONNECTED/SUBMITTED 状態でこのタイムアウトよりも長く維持された場合、監視を停止し、スパークランチャープロセスを強制終了します。`SparkLoadJob` はこの設定をデフォルトとして読み込み、`LoadStmt.SPARK_LOAD_SUBMIT_TIMEOUT` プロパティを介してロードごとの上書きを許可します。YARN キューイングの遅延に対応するのに十分な高さに設定してください。低すぎると正当にキューに入れられたジョブが中断される可能性があり、高すぎると障害処理とリソースクリーンアップが遅れる可能性があります。
- 導入バージョン: v3.2.0

##### `spark_resource_path`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Spark 依存関係パッケージのルートディレクトリ。
- 導入バージョン: -

##### `stream_load_default_timeout_second`

- デフォルト: 600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 各 Stream Load ジョブのデフォルトのタイムアウト期間。
- 導入バージョン: -

##### `stream_load_max_txn_num_per_be`

- デフォルト: -1
- タイプ: Int
- 単位: トランザクション
- 変更可能: はい
- 説明: 単一の BE (バックエンド) ホストから受け入れられる同時ストリームロードトランザクションの数を制限します。非負の整数に設定されている場合、FrontendServiceImpl は BE (クライアント IP 別) の現在のトランザクション数をチェックし、カウントが `>=` この制限である場合、新しいストリームロード開始リクエストを拒否します。`< 0` の値は制限を無効にします (無制限)。このチェックはストリームロード開始時に発生し、超過すると `streamload txn num per be exceeds limit` エラーが発生する可能性があります。関連する実行時動作は、リクエストタイムアウトフォールバックに `stream_load_default_timeout_second` を使用します。
- 導入バージョン: v3.3.0, v3.4.0, v3.5.0

##### `stream_load_task_keep_max_num`

- デフォルト: 1000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: StreamLoadMgr がメモリに保持する Stream Load タスクの最大数 (すべてのデータベースにわたるグローバル)。追跡されているタスク数 (`idToStreamLoadTask`) がこのしきい値を超過すると、StreamLoadMgr はまず `cleanSyncStreamLoadTasks()` を呼び出して完了した同期ストリームロードタスクを削除します。サイズがこのしきい値の半分を超過したままの場合、`cleanOldStreamLoadTasks(true)` を呼び出して、古いタスクまたは完了したタスクの強制削除を実行します。メモリに多くのタスク履歴を保持するにはこの値を増やし、メモリ使用量を減らし、クリーンアップをより積極的に行うには減らします。この値はインメモリ保持のみを制御し、永続化/再生されたタスクには影響しません。
- 導入バージョン: v3.2.0

##### `stream_load_task_keep_max_second`

- デフォルト: 3 * 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 完了またはキャンセルされた Stream Load タスクの保持ウィンドウ。タスクが最終状態に到達し、その終了タイムスタンプがこのしきい値 (`currentMs - endTimeMs > stream_load_task_keep_max_second * 1000`) より古い場合、`StreamLoadMgr.cleanOldStreamLoadTasks` によって削除対象となり、永続化された状態をロードする際に破棄されます。`StreamLoadTask` と `StreamLoadMultiStmtTask` の両方に適用されます。合計タスク数が `stream_load_task_keep_max_num` を超える場合、クリーンアップが早期にトリガーされる可能性があります (同期タスクは `cleanSyncStreamLoadTasks` によって優先されます)。履歴/デバッグ可能性とメモリ使用量のバランスをとるためにこれを設定します。
- 導入バージョン: v3.2.0

##### `transaction_clean_interval_second`

- デフォルト: 30
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: 完了したトランザクションがクリーンアップされる時間間隔。単位: 秒。完了したトランザクションがタイムリーにクリーンアップされるように、短い時間間隔を指定することをお勧めします。
- 導入バージョン: -

##### `transaction_stream_load_coordinator_cache_capacity`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: トランザクションラベルからコーディネーターノードへのマッピングを格納するキャッシュの容量。
- 導入バージョン: -

##### `transaction_stream_load_coordinator_cache_expire_seconds`

- デフォルト: 900
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: コーディネーターマッピングがキャッシュから削除されるまでの時間 (TTL)。
- 導入バージョン: -

##### `yarn_client_path`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/lib/yarn-client/hadoop/bin/yarn"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Yarn クライアントパッケージのルートディレクトリ。
- 導入バージョン: -

##### `yarn_config_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/lib/yarn-config"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Yarn 設定ファイルを格納するディレクトリ。
- 導入バージョン: -

### 統計レポート

##### `enable_collect_warehouse_metrics`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、システムはウェアハウスごとのメトリックを収集してエクスポートします。これを有効にすると、ウェアハウスレベルのメトリック (スロット/使用量/可用性) がメトリック出力に追加され、メトリックのカーディナリティと収集オーバーヘッドが増加します。ウェアハウス固有のメトリックを省略し、CPU/ネットワークと監視ストレージのコストを削減するには無効にします。
- 導入バージョン: v3.5.0

##### `enable_http_detail_metrics`

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: はい
- 説明: true の場合、HTTP サーバーは詳細な HTTP ワーカーメトリック (特に `HTTP_WORKER_PENDING_TASKS_NUM` ゲージ) を計算して公開します。これを有効にすると、サーバーは Netty ワーカーエグゼキュータを反復処理し、各 `NioEventLoop` で `pendingTasks()` を呼び出して保留中のタスクカウントを合計します。無効にすると、そのコストを避けるためにゲージは 0 を返します。この追加の収集は CPU および遅延に敏感である可能性があります。デバッグまたは詳細な調査のためにのみ有効にしてください。
- 導入バージョン: v3.2.3

##### `proc_profile_collect_time_s`

- デフォルト: 120
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 単一のプロセスプロファイル収集の期間 (秒単位)。`proc_profile_cpu_enable` または `proc_profile_mem_enable` が `true` に設定されている場合、AsyncProfiler が起動され、コレクタースレッドはこの期間スリープし、その後プロファイラーが停止され、プロファイルが書き込まれます。値が大きいほどサンプルカバレッジとファイルサイズが増加しますが、プロファイラーの実行時間が長くなり、その後の収集が遅れます。値が小さいほどオーバーヘッドが減少しますが、不十分なサンプルが生成される可能性があります。この値が `proc_profile_file_retained_days` や `proc_profile_file_retained_size_bytes` などの保持設定と一致していることを確認してください。
- 導入バージョン: v3.2.12

### ストレージ

##### `alter_table_timeout_second`

- デフォルト: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: スキーマ変更操作 (ALTER TABLE) のタイムアウト期間。
- 導入バージョン: -

##### `capacity_used_percent_high_water`

- デフォルト: 0.75
- タイプ: double
- 単位: 小数 (0.0–1.0)
- 変更可能: はい
- 説明: バックエンド負荷スコアを計算する際に使用される、ディスク使用率のハイウォーターしきい値 (総容量の割合)。`BackendLoadStatistic.calcSore` は `capacity_used_percent_high_water` を使用して `LoadScore.capacityCoefficient` を設定します。バックエンドの使用率が 0.5 未満の場合、係数は 0.5 に等しくなります。使用率が `capacity_used_percent_high_water` より大きい場合、係数は 1.0 に等しくなります。それ以外の場合、係数は使用率に比例して線形に遷移します (2 * usedPercent - 0.5)。係数が 1.0 の場合、負荷スコアは容量の割合のみによって決定されます。値が低いほど、レプリカ数の重みが増加します。この値を調整すると、高ディスク使用率のバックエンドに対するバランサーのペナルティがどれだけ厳しくなるかが変わります。
- 導入バージョン: v3.2.0

##### `catalog_trash_expire_second`

- デフォルト: 86400
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: データベース、テーブル、またはパーティションが削除された後、メタデータを保持できる最長期間。この期間が経過すると、データは削除され、[RECOVER](../../sql-reference/sql-statements/backup_restore/RECOVER.md) コマンドで復元することはできません。
- 導入バージョン: -

##### `check_consistency_default_timeout_second`

- デフォルト: 600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: レプリカの一貫性チェックのタイムアウト期間。タブレットのサイズに基づいてこのパラメーターを設定できます。
- 導入バージョン: -

##### `consistency_check_cooldown_time_second`

- デフォルト: 24 * 3600
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 同じタブレットの一貫性チェックの間隔 (秒単位) を制御します。タブレット選択中、タブレットが適格と見なされるのは、`tablet.getLastCheckTime()` が `(currentTimeMillis - consistency_check_cooldown_time_second * 1000)` より小さい場合のみです。デフォルト値 (24 * 3600) は、バックエンドディスク I/O を削減するために、タブレットあたり約 1 日に 1 回のチェックを強制します。この値を減らすとチェック頻度とリソース使用量が増加し、増やすと不整合検出が遅くなる代わりに I/O が減少します。この値は、インデックスのタブレットリストから冷却されたタブレットをフィルタリングする際にグローバルに適用されます。
- 導入バージョン: v3.5.5

##### `consistency_check_end_time`

- デフォルト: "4"
- タイプ: String
- 単位: 時 (0-23)
- 変更可能: いいえ
- 説明: ConsistencyChecker の作業ウィンドウの終了時間 (時単位) を指定します。値はシステムタイムゾーンで SimpleDateFormat("HH") で解析され、0 から 23 (1 桁または 2 桁) として受け入れられます。StarRocks は `consistency_check_start_time` とともにこれを使用して、一貫性チェックジョブをスケジュールおよび追加するタイミングを決定します。`consistency_check_start_time` が `consistency_check_end_time` より大きい場合、ウィンドウは深夜をまたぎます (たとえば、デフォルトは `consistency_check_start_time` = "23" から `consistency_check_end_time` = "4")。`consistency_check_start_time` が `consistency_check_end_time` と等しい場合、チェッカーは実行されません。解析に失敗すると FE の起動がエラーをログに記録して終了するため、有効な時文字列を指定してください。
- 導入バージョン: v3.2.0

##### `consistency_check_start_time`

- デフォルト: "23"
- タイプ: String
- 単位: 時 (00-23)
- 変更可能: いいえ
- 説明: ConsistencyChecker の作業ウィンドウの開始時間 (時単位) を指定します。値はシステムタイムゾーンで SimpleDateFormat("HH") で解析され、0 から 23 (1 桁または 2 桁) として受け入れられます。StarRocks は `consistency_check_end_time` とともにこれを使用して、一貫性チェックジョブをスケジュールおよび追加するタイミングを決定します。`consistency_check_start_time` が `consistency_check_end_time` より大きい場合、ウィンドウは深夜をまたぎます (たとえば、デフォルトは `consistency_check_start_time` = "23" から `consistency_check_end_time` = "4")。`consistency_check_start_time` が `consistency_check_end_time` と等しい場合、チェッカーは実行されません。解析に失敗すると FE の起動がエラーをログに記録して終了するため、有効な時文字列を指定してください。
- 導入バージョン: v3.2.0

##### `consistency_tablet_meta_check_interval_ms`

- デフォルト: 2 * 3600 * 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: ConsistencyChecker が `TabletInvertedIndex` と `LocalMetastore` の間で完全なタブレットメタ一貫性スキャンを実行する間隔。`runAfterCatalogReady` のデーモンは、`current time - lastTabletMetaCheckTime` がこの値を超過したときに checkTabletMetaConsistency をトリガーします。無効なタブレットが最初に検出されると、その `toBeCleanedTime` は `now + (consistency_tablet_meta_check_interval_ms / 2)` に設定されるため、実際の削除はその後のスキャンまで遅延されます。スキャン頻度と負荷を減らすにはこの値を増やし (クリーンアップが遅れる)、古いタブレットをより迅速に検出して削除するにはこの値を減らします (オーバーヘッドが増加します)。
- 導入バージョン: v3.2.0

##### `default_replication_num`

- デフォルト: 3
- タイプ: Short
- 単位: -
- 変更可能: はい
- 説明: StarRocks でテーブルを作成する際に、各データパーティションのレプリカのデフォルト数を設定します。この設定は、CREATE TABLE DDL で `replication_num=x` を指定することで、テーブル作成時に上書きできます。
- 導入バージョン: -

##### `enable_auto_tablet_distribution`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: バケットの数を自動的に設定するかどうか。
  - このパラメーターが `TRUE` に設定されている場合、テーブルを作成したりパーティションを追加したりするときにバケットの数を指定する必要はありません。StarRocks は自動的にバケットの数を決定します。
  - このパラメーターが `FALSE` に設定されている場合、テーブルを作成したりパーティションを追加したりするときにバケットの数を手動で指定する必要があります。テーブルに新しいパーティションを追加するときにバケット数を指定しない場合、新しいパーティションはテーブル作成時に設定されたバケット数を継承します。ただし、新しいパーティションのバケット数を手動で指定することもできます。
- 導入バージョン: v2.5.7

##### `enable_experimental_rowstore`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: [ハイブリッド行/列ストレージ](../../table_design/hybrid_table.md) 機能を有効にするかどうか。
- 導入バージョン: v3.2.3

##### `enable_fast_schema_evolution`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: StarRocks クラスター内のすべてのテーブルで高速スキーマ進化を有効にするかどうか。有効な値は `TRUE` と `FALSE` (デフォルト) です。高速スキーマ進化を有効にすると、スキーマ変更の速度が向上し、列の追加または削除時のリソース使用量が削減されます。
- 導入バージョン: v3.2.0

> **注意**
>
> - StarRocks Shared-data クラスターは v3.3.0 以降このパラメーターをサポートします。
> - 特定のテーブルの高速スキーマ進化を設定する必要がある場合 (特定のテーブルの高速スキーマ進化を無効にするなど) は、テーブル作成時にテーブルプロパティ [`fast_schema_evolution`](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md#set-fast-schema-evolution) を設定できます。

##### `enable_online_optimize_table`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: StarRocks が最適化ジョブを作成する際に、非ブロッキングオンライン最適化パスを使用するかどうかを制御します。`enable_online_optimize_table` が true で、ターゲットテーブルが互換性チェック (パーティション/キー/ソート指定なし、分散が `RandomDistributionDesc` でない、ストレージタイプが `COLUMN_WITH_ROW` でない、レプリケートされたストレージが有効、テーブルがクラウドネイティブテーブルまたはマテリアライズドビューではない) を満たす場合、プランナーは `OnlineOptimizeJobV2` を作成して、書き込みをブロックせずに最適化を実行します。false の場合、または互換性条件が失敗した場合、StarRocks は `OptimizeJobV2` にフォールバックします。これは、最適化中に書き込み操作をブロックする可能性があります。
- 導入バージョン: v3.3.3, v3.4.0, v3.5.0

##### `enable_strict_storage_medium_check`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: ユーザーがテーブルを作成する際に、FE が BE のストレージメディアを厳密にチェックするかどうか。このパラメーターが `TRUE` に設定されている場合、FE はユーザーがテーブルを作成する際に BE のストレージメディアをチェックし、BE のストレージメディアが CREATE TABLE ステートメントで指定された `storage_medium` パラメーターと異なる場合、エラーを返します。例えば、CREATE TABLE ステートメントで指定されたストレージメディアが SSD であるが、BE の実際のストレージメディアが HDD である場合などです。結果として、テーブル作成は失敗します。このパラメーターが `FALSE` の場合、FE はユーザーがテーブルを作成する際に BE のストレージメディアをチェックしません。
- 導入バージョン: -

##### `max_bucket_number_per_partition`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: パーティションで作成できるバケットの最大数。
- 導入バージョン: v3.3.2

##### `max_column_number_per_table`

- デフォルト: 10000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: テーブルで作成できる列の最大数。
- 導入バージョン: v3.3.2

##### `max_dynamic_partition_num`

- デフォルト: 500
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 動的パーティションテーブルを分析または作成する際に、一度に作成できるパーティションの最大数を制限します。動的パーティションプロパティの検証中に、`systemtask_runs_max_history_number` は予想されるパーティション (終了オフセット + 履歴パーティション数) を計算し、その合計が `max_dynamic_partition_num` を超える場合、DDL エラーをスローします。正当に大きなパーティション範囲を期待する場合にのみこの値を増やしてください。増やすと、より多くのパーティションを作成できますが、メタデータサイズ、スケジューリング作業、および運用上の複雑さが増加する可能性があります。
- 導入バージョン: v3.2.0

##### `max_partition_number_per_table`

- デフォルト: 100000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: テーブルで作成できるパーティションの最大数。
- 導入バージョン: v3.3.2

##### `max_task_consecutive_fail_count`

- デフォルト: 10
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: スケジューラがタスクを自動的に一時停止するまでに、タスクが連続して失敗できる最大回数。`TaskSource.MV.equals(task.getSource())` と `max_task_consecutive_fail_count` が 0 より大きい場合、タスクの連続失敗カウンターが `max_task_consecutive_fail_count` に達するか超えると、タスクは TaskManager を介して一時停止され、マテリアライズドビュータスクの場合、マテリアライズドビューは非アクティブ化されます。一時停止と再アクティブ化の方法を示す例外がスローされます (例: `ALTER MATERIALIZED VIEW <mv_name> ACTIVE`)。自動一時停止を無効にするには、この項目を 0 または負の値に設定します。
- 導入バージョン: -

##### `partition_recycle_retention_period_secs`

- デフォルト: 1800
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: INSERT OVERWRITE またはマテリアライズドビュー更新操作によって削除されたパーティションのメタデータ保持時間。このメタデータは [RECOVER](../../sql-reference/sql-statements/backup_restore/RECOVER.md) を実行しても復元できないことに注意してください。
- 導入バージョン: v3.5.9

##### `recover_with_empty_tablet`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 紛失または破損したタブレットレプリカを空のレプリカで置き換えるかどうか。タブレットレプリカが紛失または破損した場合、このタブレットまたは他の健全なタブレットのデータクエリは失敗する可能性があります。紛失または破損したタブレットレプリカを空のタブレットで置き換えることで、クエリは引き続き実行できます。ただし、データが失われるため、結果が不正確になる可能性があります。デフォルト値は `FALSE` であり、紛失または破損したタブレットレプリカは空のレプリカで置き換えられず、クエリは失敗します。
- 導入バージョン: -

##### `storage_usage_hard_limit_percent`

- デフォルト: 95
- エイリアス: `storage_flood_stage_usage_percent`
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: BE ディレクトリのストレージ使用率のハードリミット。BE ストレージディレクトリのストレージ使用率 (パーセンテージ) がこの値を超え、残りのストレージスペースが `storage_usage_hard_limit_reserve_bytes` 未満の場合、ロードおよびリカバリジョブは拒否されます。設定を有効にするには、BE 設定項目 `storage_flood_stage_usage_percent` とともにこの項目を設定する必要があります。
- 導入バージョン: -

##### `storage_usage_hard_limit_reserve_bytes`

- デフォルト: 100 * 1024 * 1024 * 1024
- エイリアス: `storage_flood_stage_left_capacity_bytes`
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: BE ディレクトリの残りのストレージスペースのハードリミット。BE ストレージディレクトリの残りのストレージスペースがこの値未満で、ストレージ使用率 (パーセンテージ) が `storage_usage_hard_limit_percent` を超える場合、ロードおよびリカバリジョブは拒否されます。設定を有効にするには、BE 設定項目 `storage_flood_stage_left_capacity_bytes` とともにこの項目を設定する必要があります。
- 導入バージョン: -

##### `storage_usage_soft_limit_percent`

- デフォルト: 90
- エイリアス: `storage_high_watermark_usage_percent`
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: BE ディレクトリのストレージ使用率のソフトリミット。BE ストレージディレクトリのストレージ使用率 (パーセンテージ) がこの値を超え、残りのストレージスペースが `storage_usage_soft_limit_reserve_bytes` 未満の場合、タブレットはこのディレクトリにクローンできません。
- 導入バージョン: -

##### `storage_usage_soft_limit_reserve_bytes`

- デフォルト: 200 * 1024 * 1024 * 1024
- エイリアス: `storage_min_left_capacity_bytes`
- タイプ: Long
- 単位: バイト
- 変更可能: はい
- 説明: BE ディレクトリの残りのストレージスペースのソフトリミット。BE ストレージディレクトリの残りのストレージスペースがこの値未満で、ストレージ使用率 (パーセンテージ) が `storage_usage_soft_limit_percent` を超える場合、タブレットはこのディレクトリにクローンできません。
- 導入バージョン: -

##### `tablet_checker_lock_time_per_cycle_ms`

- デフォルト: 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: タブレットチェッカーがテーブルロックを解放して再取得する前に、サイクルごとに保持するロックの最大時間。100 未満の値は 100 として扱われます。
- 導入バージョン: v3.5.9, v4.0.2

##### `tablet_create_timeout_second`

- デフォルト: 10
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タブレット作成のタイムアウト期間。v3.1 以降、デフォルト値は 1 から 10 に変更されました。
- 導入バージョン: -

##### `tablet_delete_timeout_second`

- デフォルト: 2
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: タブレット削除のタイムアウト期間。
- 導入バージョン: -

##### `tablet_sched_balance_load_disk_safe_threshold`

- デフォルト: 0.5
- エイリアス: `balance_load_disk_safe_threshold`
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: BE のディスク使用量がバランスしているかどうかを判断するためのパーセンテージしきい値。すべての BE のディスク使用量がこの値より低い場合、バランスしていると見なされます。ディスク使用量がこの値より大きく、最高の BE ディスク使用量と最低の BE ディスク使用量の差が 10% より大きい場合、ディスク使用量はバランスが取れていないと見なされ、タブレットの再バランシングがトリガーされます。
- 導入バージョン: -

##### `tablet_sched_balance_load_score_threshold`

- デフォルト: 0.1
- エイリアス: `balance_load_score_threshold`
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: BE の負荷がバランスしているかどうかを判断するためのパーセンテージしきい値。BE の負荷がすべての BE の平均負荷よりも低く、その差がこの値より大きい場合、この BE は低負荷状態にあります。逆に、BE の負荷が平均負荷よりも高く、その差がこの値より大きい場合、この BE は高負荷状態にあります。
- 導入バージョン: -

##### `tablet_sched_be_down_tolerate_time_s`

- デフォルト: 900
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: スケジューラが BE ノードが非アクティブな状態を許容する最大期間。この時間しきい値に達すると、その BE ノード上のタブレットは他のアクティブな BE ノードに移行されます。
- 導入バージョン: v2.5.7

##### `tablet_sched_disable_balance`

- デフォルト: false
- エイリアス: `disable_balance`
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: タブレットのバランシングを無効にするかどうか。`TRUE` はタブレットのバランシングが無効になっていることを示します。`FALSE` はタブレットのバランシングが有効になっていることを示します。
- 導入バージョン: -

##### `tablet_sched_disable_colocate_balance`

- デフォルト: false
- エイリアス: `disable_colocate_balance`
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: Colocate Table のレプリカバランシングを無効にするかどうか。`TRUE` はレプリカバランシングが無効になっていることを示します。`FALSE` はレプリカバランシングが有効になっていることを示します。
- 導入バージョン: -

##### `tablet_sched_max_balancing_tablets`

- デフォルト: 500
- エイリアス: `max_balancing_tablets`
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 同時にバランスできるタブレットの最大数。この値を超過すると、タブレットの再バランシングはスキップされます。
- 導入バージョン: -

##### `tablet_sched_max_clone_task_timeout_sec`

- デフォルト: 2 * 60 * 60
- エイリアス: `max_clone_task_timeout_sec`
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: タブレットのクローニングの最大タイムアウト期間。
- 導入バージョン: -

##### `tablet_sched_max_not_being_scheduled_interval_ms`

- デフォルト: 15 * 60 * 1000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: タブレットクローンタスクがスケジュールされているときに、タブレットがこのパラメーターで指定された時間スケジュールされていない場合、StarRocks はそれをできるだけ早くスケジュールするために高い優先度を与えます。
- 導入バージョン: -

##### `tablet_sched_max_scheduling_tablets`

- デフォルト: 10000
- エイリアス: `max_scheduling_tablets`
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 同時にスケジュールできるタブレットの最大数。この値を超過すると、タブレットのバランシングと修復チェックはスキップされます。
- 導入バージョン: -

##### `tablet_sched_min_clone_task_timeout_sec`

- デフォルト: 3 * 60
- エイリアス: `min_clone_task_timeout_sec`
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: タブレットのクローニングの最小タイムアウト期間。
- 導入バージョン: -

##### `tablet_sched_num_based_balance_threshold_ratio`

- デフォルト: 0.5
- エイリアス: -
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: 数値ベースのバランシングはディスクサイズバランスを崩す可能性がありますが、ディスク間の最大ギャップは `tablet_sched_num_based_balance_threshold_ratio` * `tablet_sched_balance_load_score_threshold` を超えることはできません。クラスター内でタブレットが常に A から B、B から A へとバランスされている場合、この値を減らします。タブレットの分散をよりバランスさせたい場合は、この値を増やします。
- 導入バージョン: - 3.1

##### `tablet_sched_repair_delay_factor_second`

- デフォルト: 60
- エイリアス: `tablet_repair_delay_factor_second`
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: レプリカが修復される間隔 (秒単位)。
- 導入バージョン: -

##### `tablet_sched_slot_num_per_path`

- デフォルト: 8
- エイリアス: `schedule_slot_num_per_path`
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: BE ストレージディレクトリで同時に実行できるタブレット関連タスクの最大数。v2.5 以降、このパラメーターのデフォルト値は `4` から `8` に変更されました。
- 導入バージョン: -

##### `tablet_sched_storage_cooldown_second`

- デフォルト: -1
- エイリアス: `storage_cooldown_second`
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: テーブル作成時からの自動クールダウンのレイテンシー。デフォルト値 `-1` は自動クールダウンが無効になっていることを指定します。自動クールダウンを有効にする場合は、このパラメーターを `-1` より大きい値に設定してください。
- 導入バージョン: -

##### `tablet_stat_update_interval_second`

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: いいえ
- 説明: FE が各 BE からタブレット統計を取得する時間間隔。
- 導入バージョン: -

### Shared-data

##### `aws_s3_access_key`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: S3 バケットにアクセスするために使用するアクセスキー ID。
- 導入バージョン: v3.0

##### `aws_s3_endpoint`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: S3 バケットにアクセスするために使用するエンドポイント。例: `https://s3.us-west-2.amazonaws.com`。
- 導入バージョン: v3.0

##### `aws_s3_external_id`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: S3 バケットへのクロスアカウントアクセスに使用される AWS アカウントの外部 ID。
- 導入バージョン: v3.0

##### `aws_s3_iam_role_arn`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: データファイルが保存されている S3 バケットに対する権限を持つ IAM ロールの ARN。
- 導入バージョン: v3.0

##### `aws_s3_path`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: データを保存するために使用される S3 パス。S3 バケットの名前と、その下にあるサブパス (存在する場合) で構成されます。例: `testbucket/subpath`。
- 導入バージョン: v3.0

##### `aws_s3_region`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: S3 バケットが存在するリージョン。例: `us-west-2`。
- 導入バージョン: v3.0

##### `aws_s3_secret_key`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: S3 バケットにアクセスするために使用するシークレットアクセスキー。
- 導入バージョン: v3.0

##### `aws_s3_use_aws_sdk_default_behavior`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: AWS SDK のデフォルトの認証資格情報を使用するかどうか。有効な値: true および false (デフォルト)。
- 導入バージョン: v3.0

##### `aws_s3_use_instance_profile`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: S3 にアクセスするための認証方法としてインスタンスプロファイルと引き受けロールを使用するかどうか。有効な値: true および false (デフォルト)。
  - IAM ユーザーベースの資格情報 (アクセスキーとシークレットキー) を使用して S3 にアクセスする場合、この項目を `false` に指定し、`aws_s3_access_key` と `aws_s3_secret_key` を指定する必要があります。
  - インスタンスプロファイルを使用して S3 にアクセスする場合、この項目を `true` に指定する必要があります。
  - 引き受けロールを使用して S3 にアクセスする場合、この項目を `true` に指定し、`aws_s3_iam_role_arn` を指定する必要があります。
  - 外部 AWS アカウントを使用する場合、`aws_s3_external_id` も指定する必要があります。
- 導入バージョン: v3.0

##### `azure_adls2_endpoint`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 アカウントのエンドポイント。例: `https://test.dfs.core.windows.net`。
- 導入バージョン: v3.4.1

##### `azure_adls2_oauth2_client_id`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを承認するために使用されるマネージド ID のクライアント ID。
- 導入バージョン: v3.4.4

##### `azure_adls2_oauth2_tenant_id`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを承認するために使用されるマネージド ID のテナント ID。
- 導入バージョン: v3.4.4

##### `azure_adls2_oauth2_use_managed_identity`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを承認するためにマネージド ID を使用するかどうか。
- 導入バージョン: v3.4.4

##### `azure_adls2_path`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: データを保存するために使用される Azure Data Lake Storage Gen2 パス。ファイルシステム名とディレクトリ名で構成されます。例: `testfilesystem/starrocks`。
- 導入バージョン: v3.4.1

##### `azure_adls2_sas_token`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを承認するために使用される共有アクセス署名 (SAS)。
- 導入バージョン: v3.4.1

##### `azure_adls2_shared_key`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Data Lake Storage Gen2 のリクエストを承認するために使用される共有キー。
- 導入バージョン: v3.4.1

##### `azure_blob_endpoint`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Blob Storage アカウントのエンドポイント。例: `https://test.blob.core.windows.net`。
- 導入バージョン: v3.1

##### `azure_blob_path`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: データを保存するために使用される Azure Blob Storage パス。ストレージアカウント内のコンテナ名と、コンテナの下にあるサブパス (存在する場合) で構成されます。例: `testcontainer/subpath`。
- 導入バージョン: v3.1

##### `azure_blob_sas_token`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Blob Storage のリクエストを承認するために使用される共有アクセス署名 (SAS)。
- 導入バージョン: v3.1

##### `azure_blob_shared_key`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Azure Blob Storage のリクエストを承認するために使用される共有キー。
- 導入バージョン: v3.1

##### `azure_use_native_sdk`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: Azure Blob Storage にアクセスするためにネイティブ SDK を使用し、Managed Identity と Service Principal で認証を許可するかどうか。この項目が `false` に設定されている場合、Shared Key と SAS Token による認証のみが許可されます。
- 導入バージョン: v3.4.4

##### `cloud_native_hdfs_url`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: HDFS ストレージの URL。例: `hdfs://127.0.0.1:9000/user/xxx/starrocks/`。
- 導入バージョン: -

##### `cloud_native_meta_port`

- デフォルト: 6090
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: FE クラウドネイティブメタデータサーバー RPC リッスンポート。
- 導入バージョン: -

##### `cloud_native_storage_type`

- デフォルト: S3
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 使用するオブジェクトストレージのタイプ。Shared-data モードでは、StarRocks は HDFS、Azure Blob (v3.1.1 以降サポート)、Azure Data Lake Storage Gen2 (v3.4.1 以降サポート)、Google Storage (ネイティブ SDK を使用、v3.5.1 以降サポート)、および S3 プロトコルと互換性のあるオブジェクトストレージシステム (AWS S3、MinIO など) にデータを保存することをサポートします。有効な値: `S3` (デフォルト)、`HDFS`、`AZBLOB`、`ADLS2`、`GS`。このパラメーターを `S3` に指定する場合、`aws_s3` で始まるパラメーターを追加する必要があります。このパラメーターを `AZBLOB` に指定する場合、`azure_blob` で始まるパラメーターを追加する必要があります。このパラメーターを `ADLS2` に指定する場合、`azure_adls2` で始まるパラメーターを追加する必要があります。このパラメーターを `GS` に指定する場合、`gcp_gcs` で始まるパラメーターを追加する必要があります。このパラメーターを `HDFS` に指定する場合、`cloud_native_hdfs_url` のみを指定する必要があります。
- 導入バージョン: -

##### `enable_load_volume_from_conf`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks が FE 設定ファイルで指定されたオブジェクトストレージ関連プロパティを使用して組み込みストレージボリュームを作成することを許可するかどうか。v3.4.1 以降、デフォルト値は `true` から `false` に変更されました。
- 導入バージョン: v3.1.0

##### `gcp_gcs_impersonation_service_account`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: Google Storage にアクセスするためになりすましベースの認証を使用する場合に、なりすましたいサービスアカウント。
- 導入バージョン: v3.5.1

##### `gcp_gcs_path`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: データを保存するために使用される Google Cloud パス。Google Cloud バケットの名前と、その下にあるサブパス (存在する場合) で構成されます。例: `testbucket/subpath`。
- 導入バージョン: v3.5.1

##### `gcp_gcs_service_account_email`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: サービスアカウント作成時に生成された JSON ファイル内のメールアドレス。例: `user@hello.iam.gserviceaccount.com`。
- 導入バージョン: v3.5.1

##### `gcp_gcs_service_account_private_key`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: サービスアカウント作成時に生成された JSON ファイル内の秘密鍵。例: `-----BEGIN PRIVATE KEY----xxxx-----END PRIVATE KEY-----\n`。
- 導入バージョン: v3.5.1

##### `gcp_gcs_service_account_private_key_id`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: サービスアカウント作成時に生成された JSON ファイル内の秘密鍵 ID。
- 導入バージョン: v3.5.1

##### `gcp_gcs_use_compute_engine_service_account`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: Compute Engine にバインドされているサービスアカウントを使用するかどうか。
- 導入バージョン: v3.5.1

##### `hdfs_file_system_expire_seconds`

- デフォルト: 300
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: HdfsFsManager によって管理される、未使用のキャッシュされた HDFS/ObjectStore FileSystem の生存期間 (秒単位)。FileSystemExpirationChecker (60 秒ごとに実行) は、この値を使用して各 HdfsFs.isExpired(...) を呼び出します。期限切れになると、マネージャーは基盤となる FileSystem を閉じ、キャッシュから削除します。アクセサーメソッド (例: `HdfsFs.getDFSFileSystem`、`getUserName`、`getConfiguration`) は最終アクセス時刻を更新するため、有効期限は非アクティブに基づいています。値が小さいほどアイドル状態のリソース保持が減りますが、再オープンオーバーヘッドが増加します。値が大きいほどハンドルを長く保持し、より多くのリソースを消費する可能性があります。
- 導入バージョン: v3.2.0

##### `lake_autovacuum_grace_period_minutes`

- デフォルト: 30
- タイプ: Long
- 単位: 分
- 変更可能: はい
- 説明: Shared-data クラスターで履歴データバージョンを保持する時間範囲。この時間範囲内の履歴データバージョンは、コンパクション後に AutoVacuum によって自動的にクリーンアップされません。実行中のクエリが終了する前にアクセスされたデータが削除されるのを避けるために、この値を最大クエリ時間よりも大きく設定する必要があります。v3.3.0、v3.2.5、および v3.1.10 以降、デフォルト値は `5` から `30` に変更されました。
- 導入バージョン: v3.1.0

##### `lake_autovacuum_parallel_partitions`

- デフォルト: 8
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: Shared-data クラスターで AutoVacuum を同時に実行できるパーティションの最大数。AutoVacuum はコンパクション後のガベージコレクションです。
- 導入バージョン: v3.1.0

##### `lake_autovacuum_partition_naptime_seconds`

- デフォルト: 180
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: Shared-data クラスターで同じパーティションに対する AutoVacuum 操作間の最小間隔。
- 導入バージョン: v3.1.0

##### `lake_autovacuum_stale_partition_threshold`

- デフォルト: 12
- タイプ: Long
- 単位: 時間
- 変更可能: はい
- 説明: この時間範囲内にパーティションの更新 (ロード、DELETE、またはコンパクション) がない場合、システムはこのパーティションに対して AutoVacuum を実行しません。
- 導入バージョン: v3.1.0

##### `lake_compaction_allow_partial_success`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、Shared-data クラスターでの Compaction 操作は、サブタスクの 1 つが成功した場合に成功と見なされます。
- 導入バージョン: v3.5.2

##### `lake_compaction_disable_ids`

- デフォルト: ""
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: Shared-data モードでコンパクションが無効になっているテーブルまたはパーティションのリスト。形式はセミコロンで区切られた `tableId1;partitionId2` です。例: `12345;98765`。
- 導入バージョン: v3.4.4

##### `lake_compaction_history_size`

- デフォルト: 20
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターのリーダー FE ノードのメモリに保持する最近の成功した Compaction タスクレコードの数。`SHOW PROC '/compactions'` コマンドを使用して、最近の成功した Compaction タスクレコードを表示できます。Compaction 履歴は FE プロセスメモリに保存されるため、FE プロセスが再起動されると失われることに注意してください。
- 導入バージョン: v3.1.0

##### `lake_compaction_max_tasks`

- デフォルト: -1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターで許可される同時 Compaction タスクの最大数。この項目を `-1` に設定すると、同時タスク数が適応的に計算されることを示します。この値を `0` に設定すると、コンパクションが無効になります。
- 導入バージョン: v3.1.0

##### `lake_compaction_score_selector_min_score`

- デフォルト: 10.0
- タイプ: Double
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターで Compaction 操作をトリガーする Compaction Score のしきい値。パーティションの Compaction Score がこの値以上の場合、システムはそのパーティションに対して Compaction を実行します。
- 導入バージョン: v3.1.0

##### `lake_compaction_score_upper_bound`

- デフォルト: 2000
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターのパーティションの Compaction Score の上限。`0` は上限がないことを示します。この項目は `lake_enable_ingest_slowdown` が `true` に設定されている場合にのみ有効です。パーティションの Compaction Score がこの上限に達するか超えると、受信ロードタスクは拒否されます。v3.3.6 以降、デフォルト値は `0` から `2000` に変更されました。
- 導入バージョン: v3.2.0

##### `lake_enable_balance_tablets_between_workers`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターのクラウドネイティブテーブルのタブレット移行中に、Compute ノード間でタブレット数をバランスさせるかどうか。`true` は Compute ノード間でタブレットをバランスさせることを示し、`false` はこの機能を無効にすることを示します。
- 導入バージョン: v3.3.4

##### `lake_enable_ingest_slowdown`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターでデータ取り込みの減速を有効にするかどうか。データ取り込みの減速が有効な場合、パーティションの Compaction Score が `lake_ingest_slowdown_threshold` を超えると、そのパーティション上のロードタスクはスロットルされます。この設定は、`run_mode` が `shared_data` に設定されている場合にのみ有効です。v3.3.6 以降、デフォルト値は `false` から `true` に変更されました。
- 導入バージョン: v3.2.0

##### `lake_ingest_slowdown_threshold`

- デフォルト: 100
- タイプ: Long
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターでデータ取り込みの減速をトリガーする Compaction Score のしきい値。この設定は `lake_enable_ingest_slowdown` が `true` に設定されている場合にのみ有効です。
- 導入バージョン: v3.2.0

##### `lake_publish_version_max_threads`

- デフォルト: 512
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: Shared-data クラスターにおけるバージョンパブリッシュタスクの最大スレッド数。
- 導入バージョン: v3.2.0

##### `meta_sync_force_delete_shard_meta`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: リモートストレージファイルのクリーンアップをバイパスして、Shared-data クラスターのメタデータを直接削除することを許可するかどうか。この項目を `true` に設定することは、クリーンアップすべきシャードの数が過剰であり、それが FE JVM の極端なメモリプレッシャーにつながる場合にのみ推奨されます。この機能を有効にすると、シャードまたはタブレットに属するデータファイルが自動的にクリーンアップされないことに注意してください。
- 導入バージョン: v3.2.10, v3.3.3

##### `run_mode`

- デフォルト: `shared_nothing`
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks クラスターの実行モード。有効な値: `shared_data` と `shared_nothing` (デフォルト)。
  - `shared_data` は StarRocks を Shared-data モードで実行することを示します。
  - `shared_nothing` は StarRocks を Shared-nothing モードで実行することを示します。

  > **注意**
  >
  > - StarRocks クラスターで `shared_data` モードと `shared_nothing` モードを同時に採用することはできません。混合デプロイメントはサポートされていません。
  > - クラスターのデプロイ後に `run_mode` を変更しないでください。変更すると、クラスターの再起動に失敗します。Shared-nothing クラスターから Shared-data クラスターへの変換、またはその逆はサポートされていません。

- 導入バージョン: -

##### `shard_group_clean_threshold_sec`

- デフォルト: 3600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: Shared-data クラスターで未使用のタブレットとシャードグループを FE がクリーンアップするまでの時間。このしきい値内に作成されたタブレットとシャードグループはクリーンアップされません。
- 導入バージョン: -

##### `star_mgr_meta_sync_interval_sec`

- デフォルト: 600
- タイプ: Long
- 単位: 秒
- 変更可能: いいえ
- 説明: Shared-data クラスターで FE が StarMgr と定期的なメタデータ同期を実行する間隔。
- 導入バージョン: -

##### `starmgr_grpc_server_max_worker_threads`

- デフォルト: 1024
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE starmgr モジュールの grpc サーバーが使用するワーカー スレッドの最大数。
- 導入バージョン: v4.0.0, v3.5.8

##### `starmgr_grpc_timeout_seconds`

- デフォルト: 5
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明:
- 導入バージョン: -

### データレイク

##### `files_enable_insert_push_down_schema`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 有効な場合、アナライザーは INSERT ... FROM files() 操作のためにターゲットテーブルスキーマを `files()` テーブル関数にプッシュしようとします。これは、ソースが FileTableFunctionRelation であり、ターゲットがネイティブテーブルであり、SELECT リストに対応するスロット参照列 (または *) が含まれている場合にのみ適用されます。アナライザーは、選択された列をターゲット列と照合し (カウントは一致する必要がある)、ターゲットテーブルを一時的にロックし、ファイル列のタイプを非複合型についてはディープコピーされたターゲット列のタイプに置き換えます (Parquet JSON -> `array<varchar>` のような複合型はスキップされます)。元のファイルテーブルからの列名は保持されます。これにより、取り込み中のファイルベースの型推論による型不一致や緩さが減少します。
- 導入バージョン: v3.4.0, v3.5.0

##### `hdfs_read_buffer_size_kb`

- デフォルト: 8192
- タイプ: Int
- 単位: キロバイト
- 変更可能: はい
- 説明: HDFS 読み取りバッファのサイズ (キロバイト単位)。StarRocks はこの値をバイト (`<< 10`) に変換し、`HdfsFsManager` で HDFS 読み取りバッファを初期化したり、ブローカーアクセスが使用されていない場合にバックエンドタスク (例: `TBrokerScanRangeParams`、`TDownloadReq`) に送信される thrift フィールド `hdfs_read_buffer_size_kb` を入力したりするために使用します。`hdfs_read_buffer_size_kb` を増やすと、シーケンシャル読み取りスループットが向上し、システムコールオーバーヘッドが削減されますが、ストリームあたりのメモリ使用量が増加します。減らすとメモリフットプリントが削減されますが、IO 効率が低下する可能性があります。調整する際にはワークロード (多数の小さなストリーム vs. 少数の大きなシーケンシャル読み取り) を考慮してください。
- 導入バージョン: v3.2.0

##### `hdfs_write_buffer_size_kb`

- デフォルト: 1024
- タイプ: Int
- 単位: キロバイト
- 変更可能: はい
- 説明: ブローカーを使用しない HDFS またはオブジェクトストレージへの直接書き込みに使用される HDFS 書き込みバッファサイズ (KB 単位) を設定します。FE はこの値をバイト (`<< 10`) に変換し、HdfsFsManager でローカル書き込みバッファを初期化します。また、Thrift リクエスト (例: TUploadReq, TExportSink, シンクオプション) に伝播されるため、バックエンド/エージェントは同じバッファサイズを使用します。この値を増やすと、大規模なシーケンシャル書き込みのスループットが向上しますが、ライターあたりのメモリが増加します。減らすと、ストリームあたりのメモリ使用量が減少し、小規模な書き込みの遅延が短縮される可能性があります。`hdfs_read_buffer_size_kb` と並行して、利用可能なメモリと同時ライター数を考慮して調整してください。
- 導入バージョン: v3.2.0

##### `lake_batch_publish_max_version_num`

- デフォルト: 10
- タイプ: Int
- 単位: カウント
- 変更可能: はい
- 説明: レイク (クラウドネイティブ) テーブルのパブリッシュバッチを構築する際に、グループ化できる連続するトランザクションバージョンの上限を設定します。この値はトランザクショングラフのバッチ処理ルーチン (getReadyToPublishTxnListBatch を参照) に渡され、`lake_batch_publish_min_version_num` と連携して TransactionStateBatch の候補範囲サイズを決定します。値が大きいほど、より多くのコミットをバッチ処理することでパブリッシュスループットを向上させることができますが、アトミックなパブリッシュのスコープが広がり (可視性遅延が長くなり、ロールバックの表面積が大きくなる)、バージョンが連続していない場合は実行時に制限される可能性があります。ワークロードと可視性/遅延要件に従って調整してください。
- 導入バージョン: v3.2.0

##### `lake_batch_publish_min_version_num`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: レイクテーブルのパブリッシュバッチを形成するために必要な連続するトランザクションバージョンの最小数を設定します。DatabaseTransactionMgr.getReadyToPublishTxnListBatch は、`lake_batch_publish_max_version_num` とともにこの値を transactionGraph.getTxnsWithTxnDependencyBatch に渡して、依存するトランザクションを選択します。`1` の値は単一トランザクションのパブリッシュを許可します (バッチ処理なし)。`>1` の値は、少なくともその数の連続したバージョンを持つ単一テーブルの非レプリケーショントランザクションが利用可能であることを要求します。バージョンが連続していない場合、レプリケーショントランザクションが出現した場合、またはスキーマ変更がバージョンを消費した場合、バッチ処理は中止されます。この値を増やすと、コミットをグループ化することでパブリッシュスループットを向上させることができますが、十分な連続トランザクションを待機している間、パブリッシュが遅延する可能性があります。
- 導入バージョン: v3.2.0

##### `lake_enable_batch_publish_version`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: 有効な場合、PublishVersionDaemon は同じレイク (Shared-data) テーブル/パーティションの準備完了トランザクションをバッチ処理し、トランザクションごとのパブリッシュを発行する代わりに、それらのバージョンをまとめてパブリッシュします。RunMode Shared-data では、デーモンは getReadyPublishTransactionsBatch() を呼び出し、publishVersionForLakeTableBatch(...) を使用してグループ化されたパブリッシュ操作を実行します (RPC を減らし、スループットを向上させます)。無効な場合、デーモンは publishVersionForLakeTable(...) を介してトランザクションごとのパブリッシュにフォールバックします。実装は、スイッチが切り替えられたときの重複パブリッシュを避けるために内部セットを使用して進行中の作業を調整し、`lake_publish_version_max_threads` を介したスレッドプールサイジングの影響を受けます。
- 導入バージョン: v3.2.0

##### `lake_enable_tablet_creation_optimization`

- デフォルト: false
- タイプ: boolean
- 単位: -
- 変更可能: はい
- 説明: 有効にすると、StarRocks は Shared-data モードのクラウドネイティブテーブルとマテリアライズドビューのタブレット作成を最適化し、タブレットごとに異なるメタデータではなく、物理パーティション下のすべてのタブレットに単一の共有タブレットメタデータを作成します。これにより、テーブル作成、ロールアップ、およびスキーマ変更ジョブ中に生成されるタブレット作成タスクとメタデータ/ファイルの数が削減されます。この最適化はクラウドネイティブテーブル/マテリアライズドビューにのみ適用され、`file_bundling` と組み合わされます (後者は同じ最適化ロジックを再利用します)。注: スキーマ変更およびロールアップジョブは、同じ名前のファイルを上書きするのを避けるために、`file_bundling` を使用するテーブルの最適化を明示的に無効にします。慎重に有効にしてください。作成されるタブレットメタデータの粒度が変更され、レプリカ作成とファイル命名の動作に影響する可能性があります。
- 導入バージョン: v3.3.1, v3.4.0, v3.5.0

##### `lake_use_combined_txn_log`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: この項目が `true` に設定されている場合、システムは Lake テーブルが関連トランザクションの結合されたトランザクションログパスを使用することを許可します。Shared-data クラスターでのみ利用可能です。
- 導入バージョン: v3.3.7, v3.4.0, v3.5.0

### その他

##### `agent_task_resend_wait_time_ms`

- デフォルト: 5000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: FE がエージェントタスクを再送するまでに待機する必要がある期間。エージェントタスクは、タスク作成時間と現在の時間の差がこのパラメーターの値を超過した場合にのみ再送できます。このパラメーターは、エージェントタスクの繰り返し送信を防ぐために使用されます。
- 導入バージョン: -

##### `allow_system_reserved_names`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: ユーザーが `__op` および `__row` で始まる名前の列を作成することを許可するかどうか。この機能を有効にするには、このパラメーターを `TRUE` に設定します。これらの名前形式は StarRocks で特別な目的のために予約されており、そのような列を作成すると未定義の動作が発生する可能性があるため、この機能はデフォルトで無効になっています。
- 導入バージョン: v3.2.0

##### `auth_token`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE が属する StarRocks クラスター内で ID 認証に使用されるトークン。このパラメーターが指定されていない場合、StarRocks はクラスターのリーダー FE が初めて起動したときにクラスターのランダムなトークンを生成します。
- 導入バージョン: -

##### `authentication_ldap_simple_bind_base_dn`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: LDAP サーバーがユーザーの認証情報を検索し始めるポイントであるベース DN。
- 導入バージョン: -

##### `authentication_ldap_simple_bind_root_dn`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: ユーザーの認証情報を検索するために使用される管理者 DN。
- 導入バージョン: -

##### `authentication_ldap_simple_bind_root_pwd`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: ユーザーの認証情報を検索するために使用される管理者のパスワード。
- 導入バージョン: -

##### `authentication_ldap_simple_server_host`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: LDAP サーバーが実行されているホスト。
- 導入バージョン: -

##### `authentication_ldap_simple_server_port`

- デフォルト: 389
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: LDAP サーバーのポート。
- 導入バージョン: -

##### `authentication_ldap_simple_user_search_attr`

- デフォルト: uid
- タイプ: String
- 単位: -
- 変更可能: はい
- 説明: LDAP オブジェクトでユーザーを識別する属性の名前。
- 導入バージョン: -

##### `backup_job_default_timeout_ms`

- デフォルト: 86400 * 1000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: バックアップジョブのタイムアウト期間。この値を超過すると、バックアップジョブは失敗します。
- 導入バージョン: -

##### `enable_collect_tablet_num_in_show_proc_backend_disk_path`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: `SHOW PROC /BACKENDS/{id}` コマンドで、各ディスクのタブレット数を収集することを有効にするかどうか。
- 導入バージョン: v4.0.1, v3.5.8

##### `enable_colocate_restore`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: Colocate Table のバックアップと復元を有効にするかどうか。`true` は Colocate Table のバックアップと復元を有効にすることを示し、`false` は無効にすることを示します。
- 導入バージョン: v3.2.10, v3.3.3

##### `enable_materialized_view_concurrent_prepare`

- デフォルト: true
- タイプ: Boolean
- 単位:
- 変更可能: はい
- 説明: マテリアライズドビューを並行して準備してパフォーマンスを向上させるかどうか。
- 導入バージョン: v3.4.4

##### `enable_metric_calculator`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: いいえ
- 説明: メトリックを定期的に収集する機能を有効にするかどうかを指定します。有効な値: `TRUE` および `FALSE`。`TRUE` はこの機能を有効にすることを示し、`FALSE` はこの機能を無効にすることを示します。
- 導入バージョン: -

##### `enable_table_metrics_collect`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: FE でテーブルレベルのメトリックをエクスポートするかどうか。無効の場合、FE はテーブルメトリック (テーブルスキャン/ロードカウンター、テーブルサイズメトリックなど) のエクスポートをスキップしますが、カウンターはメモリに記録されます。
- 導入バージョン: -

##### `enable_mv_post_image_reload_cache`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: FE がイメージをロードした後でリロードフラグチェックを実行するかどうか。基底マテリアライズドビューでチェックが実行された場合、それに関連する他のマテリアライズドビューでは必要ありません。
- 導入バージョン: v3.5.0

##### `enable_mv_query_context_cache`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: クエリ書き換えパフォーマンスを向上させるために、クエリレベルのマテリアライズドビュー書き換えキャッシュを有効にするかどうか。
- 導入バージョン: v3.3

##### `enable_mv_refresh_collect_profile`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: すべてのマテリアライズドビューについて、マテリアライズドビューの更新でプロファイルをデフォルトで有効にするかどうか。
- 導入バージョン: v3.3.0

##### `enable_mv_refresh_extra_prefix_logging`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: デバッグを容易にするために、ログにマテリアライズドビュー名のプレフィックスを付けることを有効にするかどうか。
- 導入バージョン: v3.4.0

##### `enable_mv_refresh_query_rewrite`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの更新中にクエリ書き換えを有効にして、クエリが基底テーブルではなく書き換えられた mv を直接使用してクエリパフォーマンスを向上させるかどうか。
- 導入バージョン: v3.3

##### `enable_trace_historical_node`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: システムが履歴ノードをトレースすることを許可するかどうか。この項目を `true` に設定すると、キャッシュ共有機能を有効にし、弾力的なスケーリング中にシステムが適切なキャッシュノードを選択できるようにします。
- 導入バージョン: v3.5.1

##### `es_state_sync_interval_second`

- デフォルト: 10
- タイプ: Long
- 単位: 秒
- 変更可能: いいえ
- 説明: FE が Elasticsearch インデックスを取得し、StarRocks 外部テーブルのメタデータを同期する時間間隔。
- 導入バージョン: -

##### `hive_meta_cache_refresh_interval_s`

- デフォルト: 3600 * 2
- タイプ: Long
- 単位: 秒
- 変更可能: いいえ
- 説明: Hive 外部テーブルのキャッシュされたメタデータが更新される時間間隔。
- 導入バージョン: -

##### `hive_meta_store_timeout_s`

- デフォルト: 10
- タイプ: Long
- 単位: 秒
- 変更可能: いいえ
- 説明: Hive メタストアへの接続がタイムアウトするまでの時間。
- 導入バージョン: -

##### `jdbc_connection_idle_timeout_ms`

- デフォルト: 600000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: いいえ
- 説明: JDBC カタログにアクセスするための接続がタイムアウトする最大時間。タイムアウトした接続はアイドル状態と見なされます。
- 導入バージョン: -

##### `jdbc_connection_timeout_ms`

- デフォルト: 10000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: いいえ
- 説明: HikariCP 接続プールが接続を取得するためのタイムアウト (ミリ秒単位)。この時間内にプールから接続を取得できない場合、操作は失敗します。
- 導入バージョン: v3.5.13

##### `jdbc_query_timeout_ms`

- デフォルト: 30000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: JDBC ステートメントクエリ実行のタイムアウト (ミリ秒単位)。このタイムアウトは、JDBC カタログを通じて実行されるすべての SQL クエリ (パーティションメタデータクエリなど) に適用されます。値は JDBC ドライバーに渡されるときに秒に変換されます。
- 導入バージョン: v3.5.13

##### `jdbc_network_timeout_ms`

- デフォルト: 30000
- タイプ: Long
- 単位: ミリ秒
- 変更可能: はい
- 説明: JDBC ネットワーク操作 (ソケット読み取り) のタイムアウト (ミリ秒単位)。このタイムアウトは、外部データベースが応答しない場合に無期限のブロックを防ぐために、データベースメタデータ呼び出し (例: getSchemas()、getTables()、getColumns()) に適用されます。
- 導入バージョン: v3.5.13

##### `jdbc_connection_pool_size`

- デフォルト: 8
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: JDBC カタログにアクセスするための JDBC 接続プールの最大容量。
- 導入バージョン: -

##### `jdbc_meta_default_cache_enable`

- デフォルト: false
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: JDBC カタログメタデータキャッシュが有効になっているかどうかのデフォルト値。True に設定すると、新しく作成された JDBC カタログはデフォルトでメタデータキャッシュが有効になります。
- 導入バージョン: -

##### `jdbc_meta_default_cache_expire_sec`

- デフォルト: 600
- タイプ: Long
- 単位: 秒
- 変更可能: はい
- 説明: JDBC カタログメタデータキャッシュのデフォルトの有効期限。`jdbc_meta_default_cache_enable` が true に設定されている場合、新しく作成された JDBC カタログはデフォルトでメタデータキャッシュの有効期限を設定します。
- 導入バージョン: -

##### `jdbc_minimum_idle_connections`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: JDBC カタログにアクセスするための JDBC 接続プール内のアイドル接続の最小数。
- 導入バージョン: -

##### `jwt_jwks_url`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JSON Web Key Set (JWKS) サービスへの URL、または `fe/conf` ディレクトリ下の公開鍵ローカルファイルへのパス。
- 導入バージョン: v3.5.0

##### `jwt_principal_field`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT の subject (`sub`) を示すフィールドを識別するために使用される文字列。デフォルト値は `sub` です。このフィールドの値は、StarRocks にログインするためのユーザー名と同一である必要があります。
- 導入バージョン: v3.5.0

##### `jwt_required_audience`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT の audience (`aud`) を識別するために使用される文字列のリスト。JWT は、リスト内の値のいずれかが JWT audience と一致する場合にのみ有効と見なされます。
- 導入バージョン: v3.5.0

##### `jwt_required_issuer`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT の issuer (`iss`) を識別するために使用される文字列のリスト。JWT は、リスト内の値のいずれかが JWT issuer と一致する場合にのみ有効と見なされます。
- 導入バージョン: v3.5.0

##### locale

- デフォルト: `zh_CN.UTF-8`
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: FE が使用する文字セット。
- 導入バージョン: -

##### `max_agent_task_threads_num`

- デフォルト: 4096
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: エージェントタスクスレッドプールで許可されるスレッドの最大数。
- 導入バージョン: -

##### `max_download_task_per_be`

- デフォルト: 0
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 各 RESTORE 操作で、StarRocks が BE ノードに割り当てるダウンロードタスクの最大数。この項目が 0 以下に設定されている場合、タスク数に制限はありません。
- 導入バージョン: v3.1.0

##### `max_mv_check_base_table_change_retry_times`

- デフォルト: 10
- タイプ: -
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの更新時に基底テーブルの変更を検出するための最大再試行回数。
- 導入バージョン: v3.3.0

##### `max_mv_refresh_failure_retry_times`

- デフォルト: 1
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの更新に失敗した場合の最大再試行回数。
- 導入バージョン: v3.3.0

##### `max_mv_refresh_try_lock_failure_retry_times`

- デフォルト: 3
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビューの更新に失敗した場合の try lock の最大再試行回数。
- 導入バージョン: v3.3.0

##### `max_small_file_number`

- デフォルト: 100
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: FE ディレクトリに保存できる小さなファイルの最大数。
- 導入バージョン: -

##### `max_small_file_size_bytes`

- デフォルト: 1024 * 1024
- タイプ: Int
- 単位: バイト
- 変更可能: はい
- 説明: 小さなファイルの最大サイズ。
- 導入バージョン: -

##### `max_upload_task_per_be`

- デフォルト: 0
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 各 BACKUP 操作で、StarRocks が BE ノードに割り当てるアップロードタスクの最大数。この項目が 0 以下に設定されている場合、タスク数に制限はありません。
- 導入バージョン: v3.1.0

##### `mv_create_partition_batch_interval_ms`

- デフォルト: 1000
- タイプ: Int
- 単位: ms
- 変更可能: はい
- 説明: マテリアライズドビューの更新中、複数のパーティションを一括作成する必要がある場合、システムはそれらをそれぞれ 64 パーティションのバッチに分割します。頻繁なパーティション作成による障害のリスクを減らすため、各バッチ間にデフォルトの間隔 (ミリ秒単位) が設定され、作成頻度を制御します。
- 導入バージョン: v3.3

##### `mv_plan_cache_max_size`

- デフォルト: 1000
- タイプ: Long
- 単位:
- 変更可能: はい
- 説明: マテリアライズドビュープランキャッシュ (マテリアライズドビューの書き換えに使用される) の最大サイズ。透過的なクエリ書き換えに使用されるマテリアライズドビューが多い場合、この値を増やすことができます。
- 導入バージョン: v3.2

##### `mv_plan_cache_thread_pool_size`

- デフォルト: 3
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビュープランキャッシュ (マテリアライズドビューの書き換えに使用される) のデフォルトスレッドプールサイズ。
- 導入バージョン: v3.2

##### `mv_refresh_default_planner_optimize_timeout`

- デフォルト: 30000
- タイプ: -
- 単位: -
- 変更可能: はい
- 説明: マテリアライズドビュー更新時のオプティマイザのプランニングフェーズのデフォルトのタイムアウト。
- 導入バージョン: v3.3.0

##### `mv_refresh_fail_on_filter_data`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: フィルタリングされたデータがある場合、MV 更新は失敗します (デフォルトは true)。そうでない場合、フィルタリングされたデータを無視して成功を返します。
- 導入バージョン: -

##### `mv_refresh_try_lock_timeout_ms`

- デフォルト: 30000
- タイプ: Int
- 単位: ミリ秒
- 変更可能: はい
- 説明: マテリアライズドビュー更新がその基底テーブル/マテリアライズドビューの DB ロックを試みるデフォルトの try lock タイムアウト。
- 導入バージョン: v3.3.0

##### `oauth2_auth_server_url`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 認証 URL。OAuth 2.0 認証プロセスを開始するためにユーザーのブラウザがリダイレクトされる URL。
- 導入バージョン: v3.5.0

##### `oauth2_client_id`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks クライアントの公開識別子。
- 導入バージョン: v3.5.0

##### `oauth2_client_secret`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 認可サーバーで StarRocks クライアントを認証するために使用されるシークレット。
- 導入バージョン: v3.5.0

##### `oauth2_jwks_url`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JSON Web Key Set (JWKS) サービスへの URL、または `conf` ディレクトリ下のローカルファイルへのパス。
- 導入バージョン: v3.5.0

##### `oauth2_principal_field`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT の subject (`sub`) を示すフィールドを識別するために使用される文字列。デフォルト値は `sub` です。このフィールドの値は、StarRocks にログインするためのユーザー名と同一である必要があります。
- 導入バージョン: v3.5.0

##### `oauth2_redirect_url`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: OAuth 2.0 認証が成功した後にユーザーのブラウザがリダイレクトされる URL。認証コードはこの URL に送信されます。ほとんどの場合、`http://<starrocks_fe_url>:<fe_http_port>/api/oauth2` として構成する必要があります。
- 導入バージョン: v3.5.0

##### `oauth2_required_audience`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT の audience (`aud`) を識別するために使用される文字列のリスト。JWT は、リスト内の値のいずれかが JWT audience と一致する場合にのみ有効と見なされます。
- 導入バージョン: v3.5.0

##### `oauth2_required_issuer`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: JWT の issuer (`iss`) を識別するために使用される文字列のリスト。JWT は、リスト内の値のいずれかが JWT issuer と一致する場合にのみ有効と見なされます。
- 導入バージョン: v3.5.0

##### `oauth2_token_server_url`

- デフォルト: 空文字列
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: StarRocks がアクセストークンを取得する認可サーバーのエンドポイントの URL。
- 導入バージョン: v3.5.0

##### `plugin_dir`

- デフォルト: `System.getenv("STARROCKS_HOME")` + "/plugins"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: プラグインインストールパッケージを格納するディレクトリ。
- 導入バージョン: -

##### `plugin_enable`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: FE にプラグインをインストールできるかどうか。プラグインはリーダー FE にのみインストールまたはアンインストールできます。
- 導入バージョン: -

##### `proc_profile_jstack_depth`

- デフォルト: 128
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: システムが CPU およびメモリプロファイルを収集する際の最大 Java スタック深度。この値は、サンプリングされた各スタックについてキャプチャされる Java スタックフレームの数を制御します。値が大きいほどトレースの詳細と出力サイズが増加し、プロファイリングオーバーヘッドが増加する可能性があります。値が小さいほど詳細が削減されます。この設定は、CPU プロファイリングとメモリプロファイリングの両方でプロファイラーが開始されるときに使用されるため、診断のニーズとパフォーマンスへの影響のバランスをとるために調整してください。
- 導入バージョン: -

##### `proc_profile_mem_enable`

- デフォルト: true
- タイプ: Boolean
- 単位: -
- 変更可能: はい
- 説明: プロセスメモリ割り当てプロファイルの収集を有効にするかどうか。この項目が `true` に設定されている場合、システムは `sys_log_dir/proc_profile` の下に `mem-profile-<timestamp>.html` という名前の HTML プロファイルを生成し、`proc_profile_collect_time_s` 秒間サンプリングしながらスリープし、Java スタックの深さには `proc_profile_jstack_depth` を使用します。生成されたファイルは圧縮され、`proc_profile_file_retained_days` および `proc_profile_file_retained_size_bytes` に従って削除されます。ネイティブ抽出パスは、`/tmp` の noexec の問題を避けるために `STARROCKS_HOME_DIR` を使用します。この項目は、メモリ割り当てのホットスポットのトラブルシューティングを目的としています。有効にすると、CPU、I/O、ディスク使用量が増加し、大きなファイルが生成される可能性があります。
- 導入バージョン: v3.2.12

##### `query_detail_explain_level`

- デフォルト: COSTS
- タイプ: String
- 単位: -
- 変更可能: true
- 説明: EXPLAIN ステートメントによって返されるクエリプランの詳細レベル。有効な値: COSTS, NORMAL, VERBOSE。
- 導入バージョン: v3.2.12, v3.3.5

##### `replication_interval_ms`

- デフォルト: 100
- タイプ: Int
- 単位: -
- 変更可能: いいえ
- 説明: レプリケーションタスクがスケジュールされる最小時間間隔。
- 導入バージョン: v3.3.5

##### `replication_max_parallel_data_size_mb`

- デフォルト: 1048576
- タイプ: Int
- 単位: MB
- 変更可能: はい
- 説明: 同時同期に許可されるデータの最大サイズ。
- 導入バージョン: v3.3.5

##### `replication_max_parallel_replica_count`

- デフォルト: 10240
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 同時同期に許可されるタブレットレプリカの最大数。
- 導入バージョン: v3.3.5

##### `replication_max_parallel_table_count`

- デフォルト: 100
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: 許可される同時データ同期タスクの最大数。StarRocks はテーブルごとに 1 つの同期タスクを作成します。
- 導入バージョン: v3.3.5

##### `replication_transaction_timeout_sec`

- デフォルト: 86400
- タイプ: Int
- 単位: 秒
- 変更可能: はい
- 説明: 同期タスクのタイムアウト期間。
- 導入バージョン: v3.3.5

##### `skip_whole_phase_lock_mv_limit`

- デフォルト: 5
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: StarRocks が関連するマテリアライズドビューを持つテーブルに対して「非ロック」最適化をいつ適用するかを制御します。この項目が 0 未満に設定されている場合、システムは常に非ロック最適化を適用し、クエリのために関連するマテリアライズドビューをコピーしません (FE メモリ使用量とメタデータコピー/ロック競合は削減されますが、メタデータ並行性問題のリスクが増加する可能性があります)。0 に設定されている場合、非ロック最適化は無効になります (システムは常に安全なコピーアンドロックパスを使用します)。0 より大きい値に設定されている場合、非ロック最適化は、関連するマテリアライズドビューの数が構成されたしきい値以下であるテーブルにのみ適用されます。さらに、値が 0 以上の場合、プランナーはクエリ OLAP テーブルをオプティマイザコンテキストに記録して、マテリアライズドビュー関連の書き換えパスを有効にします。0 未満の場合、このステップはスキップされます。
- 導入バージョン: v3.2.1

##### `small_file_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/small_files"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: 小さなファイルのルートディレクトリ。
- 導入バージョン: -

##### `task_runs_max_history_number`

- デフォルト: 10000
- タイプ: Int
- 単位: -
- 変更可能: はい
- 説明: メモリに保持され、アーカイブされたタスク実行履歴をクエリする際のデフォルトの LIMIT として使用されるタスク実行レコードの最大数。`enable_task_history_archive` が false の場合、この値はインメモリ履歴を制限します。強制 GC は古いエントリを削除し、最新の `task_runs_max_history_number` のみが残ります。アーカイブ履歴がクエリされた場合 (明示的な LIMIT が提供されない場合)、`TaskRunHistoryTable.lookup` は、この値が 0 より大きい場合に `"ORDER BY create_time DESC LIMIT <value>"` を使用します。注: これを 0 に設定すると、クエリ側の LIMIT が無効になります (上限なし) が、インメモリ履歴はゼロに切り捨てられます (アーカイブが有効でない限り)。
- 導入バージョン: v3.2.0

##### `tmp_dir`

- デフォルト: `StarRocksFE.STARROCKS_HOME_DIR` + "/temp_dir"
- タイプ: String
- 単位: -
- 変更可能: いいえ
- 説明: バックアップや復元手順中に生成されるファイルなど、一時ファイルを格納するディレクトリ。これらの手順が完了すると、生成された一時ファイルは削除されます。
- 導入バージョン: -

<EditionSpecificFEItem />
