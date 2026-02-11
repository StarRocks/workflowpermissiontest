---
displayed_sidebar: docs
---

import BEConfigMethod from '../../_assets/commonMarkdown/BE_config_method.mdx'

import CNConfigMethod from '../../_assets/commonMarkdown/CN_config_method.mdx'

import PostBEConfig from '../../_assets/commonMarkdown/BE_dynamic_note.mdx'

import StaticBEConfigNote from '../../_assets/commonMarkdown/StaticBE_config_note.mdx'

# BE設定

<BEConfigMethod />

<CNConfigMethod />

## BE構成項目の表示

以下のコマンドを使用して、BE構成項目を表示できます。

```shell
curl http://<BE_IP>:<BE_HTTP_PORT>/varz
```

## BEパラメータの設定

<PostBEConfig />

<StaticBEConfigNote />

## BEパラメータの理解

### ロギング

##### diagnose_stack_trace_interval_ms

- Default: 1800000 (30 minutes)
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: `STACK_TRACE` リクエストに対してDiagnoseDaemonが実行する連続したスタックトレース診断の最小時間間隔を制御します。診断リクエストが到着すると、前回の収集から `diagnose_stack_trace_interval_ms` ミリ秒未満の場合、デーモンはスタックトレースの収集とロギングをスキップします。この値を増やすと、頻繁なスタックダンプによるCPUオーバーヘッドとログ量を減らすことができます。値を減らすと、一時的な問題（たとえば、長い `TabletsChannel::add_chunk` ブロッキングのロードフェイルポイントシミュレーションなど）をデバッグするためにより頻繁なトレースをキャプチャできます。
- Introduced in: v3.5.0

##### lake_replication_slow_log_ms

- Default: 30000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: Lakeレプリケーション中にスローログエントリを出力するための閾値。各ファイルコピーの後、コードは経過時間をマイクロ秒で測定し、経過時間が `lake_replication_slow_log_ms * 1000` 以上の場合、その操作をスローとマークします。トリガーされると、StarRocksはそのレプリケートされたファイルのファイルサイズ、コスト、およびトレースメトリクスを含むINFOログを書き込みます。この値を増やすと、大規模/低速転送によるノイズの多いスローログを減らすことができます。値を減らすと、より小さな低速コピーイベントをより早く検出して表面化させることができます。
- Introduced in: -

##### load_rpc_slow_log_frequency_threshold_seconds

- Default: 60
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 設定されたRPCタイムアウトを超えるロードRPCのスローログエントリをシステムがどのくらいの頻度で出力するかを制御します。スローログにはロードチャネルのランタイムプロファイルも含まれます。この値を0に設定すると、実際にはタイムアウトごとにログが記録されます。
- Introduced in: v3.4.3, v3.5.0

##### log_buffer_level

- Default: Empty string
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: ログをフラッシュする戦略。デフォルト値は、ログがメモリにバッファリングされることを示します。有効な値は `-1` と `0` です。`-1` は、ログがメモリにバッファリングされないことを示します。
- Introduced in: -

##### pprof_profile_dir

- Default: `${STARROCKS_HOME}/log`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: StarRocksがpprofアーティファクト（Jemallocヒープスナップショットおよびgperftools CPUプロファイル）を書き込むディレクトリパス。
- Introduced in: v3.2.0

##### sys_log_dir

- Default: `${STARROCKS_HOME}/log`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: システムログ（INFO、WARNING、ERROR、FATALを含む）を保存するディレクトリ。
- Introduced in: -

##### sys_log_level

- Default: INFO
- Type: String
- Unit: -
- Is mutable: はい (v3.3.0, v3.2.7, および v3.1.12から)
- Description: システムログエントリが分類される重大度レベル。有効な値：INFO、WARN、ERROR、FATAL。この項目はv3.3.0、v3.2.7、およびv3.1.12以降、動的構成に変更されました。
- Introduced in: -

##### sys_log_roll_mode

- Default: SIZE-MB-1024
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: システムログがログロールに分割されるモード。有効な値には `TIME-DAY`、`TIME-HOUR`、`SIZE-MB-`サイズ が含まれます。デフォルト値は、ログが1GBのロールに分割されることを示します。
- Introduced in: -

##### sys_log_roll_num

- Default: 10
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 保持するログロールの数。
- Introduced in: -

##### sys_log_timezone

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: ログプレフィックスにタイムゾーン情報を表示するかどうか。`true` はタイムゾーン情報を表示することを示し、`false` は表示しないことを示します。
- Introduced in: -

##### sys_log_verbose_level

- Default: 10
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 出力するログのレベル。この構成項目は、コード内のVLOGで開始されるログの出力を制御するために使用されます。
- Introduced in: -

##### sys_log_verbose_modules

- Default: 
- Type: Strings
- Unit: -
- Is mutable: いいえ
- Description: 出力するログのモジュール。たとえば、この構成項目をOLAPに設定すると、StarRocksはOLAPモジュールのログのみを出力します。有効な値はBEのネームスペースであり、`starrocks`、`starrocks::debug`、`starrocks::fs`、`starrocks::io`、`starrocks::lake`、`starrocks::pipeline`、`starrocks::query_cache`、`starrocks::stream`、および `starrocks::workgroup` が含まれます。
- Introduced in: -

### サーバー

##### abort_on_large_memory_allocation

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 単一の割り当てリクエストが設定された大規模割り当て閾値（`g_large_memory_alloc_failure_threshold` > 0 かつリクエストサイズ > 閾値）を超えた場合、このフラグがプロセス応答を制御します。trueの場合、このような大規模割り当てが検出されると、StarRocksは直ちに `std::abort()` を呼び出します（ハードクラッシュ）。falseの場合、割り当てはブロックされ、アロケータは失敗（nullptrまたはENOMEM）を返すため、呼び出し元はエラーを処理できます。このチェックは、TRY_CATCH_BAD_ALLOCパスでラップされていない割り当てにのみ適用されます（bad-allocがキャッチされている場合、memフックは異なるフローを使用します）。予期しない巨大な割り当ての迅速なデバッグのために有効にします。プロダクション環境では、過大な割り当て試行で即座にプロセスを停止させたい場合を除き、無効にしてください。
- Introduced in: v3.4.3, 3.5.0, 4.0.0

##### arrow_flight_port

- Default: -1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BE Arrow Flight SQLサーバーのTCPポート。`-1` はArrow Flightサービスを無効にすることを示します。macOS以外のビルドでは、BEはこのポートでArrow Flight SQL Serverを起動時に呼び出します。ポートが利用できない場合、サーバーの起動は失敗し、BEプロセスは終了します。設定されたポートは、ハートビートペイロードでFEに報告されます。
- Introduced in: v3.4.0, v3.5.0

##### be_exit_after_disk_write_hang_second

- Default: 60
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: ディスクがハングした後にBEが終了するまで待機する時間。
- Introduced in: -

##### be_http_num_workers

- Default: 48
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: HTTPサーバーが使用するスレッド数。
- Introduced in: -

##### be_http_port

- Default: 8040
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BE HTTPサーバーのポート。
- Introduced in: -

##### be_port

- Default: 9060
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: FEからのリクエストを受信するために使用されるBE Thriftサーバーのポート。
- Introduced in: -

##### be_service_threads

- Default: 64
- Type: Int
- Unit: スレッド
- Is mutable: いいえ
- Description: BE ThriftサーバーがバックエンドのRPC/実行リクエストを処理するために使用するワーカースレッドの数。この値はBackendServiceの作成時にThriftServerに渡され、利用可能な同時リクエストハンドラの数を制御します。すべてのワーカースレッドがビジーの場合、リクエストはキューに入れられます。予想される同時RPC負荷と利用可能なCPU/メモリに基づいて調整してください。値を増やすと同時実行性が向上しますが、スレッドごとのメモリとコンテキスト切り替えのコストが増加します。値を減らすと並列処理が制限され、リクエストのレイテンシが増加する可能性があります。
- Introduced in: v3.2.0

##### brpc_connection_type

- Default: `"single"`
- Type: string
- Unit: -
- Is mutable: いいえ
- Description: bRPCチャネルの接続モード。有効な値：
  - `"single"` (デフォルト)：各チャネルに1つの永続的なTCP接続。
  - `"pooled"`：より高い同時実行性のために永続的な接続のプールを使用しますが、ソケット/ファイルディスクリプタのコストが増加します。
  - `"short"`：永続的なリソース使用量を減らすためにRPCごとに作成される短寿命の接続ですが、レイテンシが高くなります。
  選択はソケットごとのバッファリング動作に影響し、未書き込みバイトがソケット制限を超える場合の `Socket.Write` の失敗（EOVERCROWDED）に影響を与える可能性があります。
- Introduced in: v3.2.5

##### brpc_max_body_size

- Default: 2147483648
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: bRPCの最大ボディサイズ。
- Introduced in: -

##### brpc_max_connections_per_server

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: クライアントが各リモートサーバーエンドポイントに対して保持する永続的なbRPC接続の最大数。各エンドポイントについて、`BrpcStubCache` は `StubPool` を作成し、その `_stubs` ベクトルはこのサイズに予約されます。最初のアクセスでは、制限に達するまで新しいスタブが作成されます。その後、既存のスタブはラウンドロビン方式で返されます。この値を増やすと、エンドポイントごとの同時実行性が向上しますが（単一チャネルでの競合が減少）、ファイルディスクリプタ、メモリ、およびチャネルのコストが増加します。
- Introduced in: v3.2.0

##### brpc_num_threads

- Default: -1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: bRPCのbthread数。値 `-1` はCPUスレッドと同じ数を示します。
- Introduced in: -

##### brpc_port

- Default: 8060
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: bRPCのネットワーク統計を表示するために使用されるBE bRPCポート。
- Introduced in: -

##### brpc_socket_max_unwritten_bytes

- Default: 1073741824
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: bRPCサーバーにおける未書き込みの送信バイトのソケットごとの制限を設定します。ソケットにバッファリングされ、まだ書き込まれていないデータの量がこの制限に達すると、後続の `Socket.Write` 呼び出しはEOVERCROWDEDで失敗します。これにより、接続ごとのメモリの無制限の増加が防止されますが、非常に大きなメッセージや低速なピアの場合にRPC送信の失敗を引き起こす可能性があります。単一メッセージのボディが許可される未書き込みバッファよりも大きくならないように、この値を `brpc_max_body_size` と一致させてください。値を増やすと、接続ごとのメモリ使用量が増加します。
- Introduced in: v3.2.0

##### brpc_stub_expire_s

- Default: 3600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: bRPCスタブキャッシュの有効期限。デフォルト値は60分です。
- Introduced in: -

##### compress_rowbatches

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: BE間のRPCでローバッチを圧縮するかどうかを制御するブール値。`true` はローバッチを圧縮することを示し、`false` は圧縮しないことを示します。
- Introduced in: -

##### consistency_max_memory_limit_percent

- Default: 20
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 一貫性関連タスクのメモリ予算を計算するために使用されるパーセンテージキャップ。BE起動時、最終的な一貫性制限は `consistency_max_memory_limit` (バイト) から解析された値と (`process_mem_limit * consistency_max_memory_limit_percent / 100`) の最小値として計算されます。`process_mem_limit` が未設定 (-1) の場合、一貫性メモリは無制限と見なされます。`consistency_max_memory_limit_percent` の場合、0未満または100より大きい値は100として扱われます。この値を調整すると、一貫性操作のために予約されるメモリが増減し、したがってクエリや他のサービスで利用可能なメモリに影響します。
- Introduced in: v3.2.0

##### delete_worker_count_normal_priority

- Default: 2
- Type: Int
- Unit: スレッド
- Is mutable: いいえ
- Description: BEエージェントで削除（REALTIME_PUSH with DELETE）タスクを処理するために割り当てられた通常優先度のワーカースレッドの数。起動時にこの値は `delete_worker_count_high_priority` に追加され、`DeleteTaskWorkerPool` のサイズが決定されます（`agent_server.cpp` を参照）。プールは最初の `delete_worker_count_high_priority` スレッドをHIGH優先度として割り当て、残りをNORMAL優先度として割り当てます。通常優先度のスレッドは標準の削除タスクを処理し、全体的な削除スループットに貢献します。並列削除容量を増やすには（CPU/IO使用量の増加）、この値を増やします。リソース競合を減らすには、この値を減らします。
- Introduced in: v3.2.0

##### disable_mem_pools

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: MemPoolを無効にするかどうか。この項目が `true` に設定されている場合、MemPoolのチャンクプーリングは無効になり、各割り当ては再利用またはプールされたチャンクを増やす代わりに独自のサイズのチャンクを取得します。プーリングを無効にすると、より頻繁な割り当て、チャンク数の増加、およびスキップされた整合性チェック（チャンク数が多いため回避される）のコストで、長期間保持されるバッファメモリが削減されます。割り当ての再利用とシステム呼び出しの減少の恩恵を受けるために、`disable_mem_pools` を `false`（デフォルト）のままにしてください。大規模なプールされたメモリ保持を避けなければならない場合（たとえば、メモリの少ない環境や診断実行の場合）にのみ `true` に設定してください。
- Introduced in: v3.2.0

##### enable_https

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: この項目が `true` に設定されている場合、BEのbRPCサーバーはTLSを使用するように構成されます。`ServerOptions.ssl_options` は、BE起動時に `ssl_certificate_path` と `ssl_private_key_path` で指定された証明書と秘密鍵で設定されます。これにより、着信bRPC接続に対してHTTPS/TLSが有効になります。クライアントはTLSを使用して接続する必要があります。証明書と鍵ファイルが存在し、BEプロセスからアクセス可能であり、bRPC/SSLの期待に合致していることを確認してください。
- Introduced in: v4.0.0

##### enable_jemalloc_memory_tracker

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: この項目が `true` に設定されている場合、BEはバックグラウンドスレッド（jemalloc_tracker_daemon）を起動し、jemalloc統計を（1秒に1回）ポーリングし、GlobalEnv jemallocメタデータMemTrackerをjemalloc "stats.metadata" 値で更新します。これにより、jemallocメタデータ消費がStarRocksプロセスメモリ会計に含まれ、jemalloc内部で使用されるメモリの過少報告が防止されます。トラッカーはmacOS以外のビルドでのみコンパイル/起動され（#ifndef __APPLE__）、"jemalloc_tracker_daemon" という名前のデーモンスレッドとして実行されます。この設定は起動動作とMemTrackerの状態を維持するスレッドに影響するため、変更には再起動が必要です。jemallocが使用されていない場合、またはjemallocトラッキングが意図的に異なる方法で管理されている場合にのみ無効にしてください。それ以外の場合は、正確なメモリ会計と割り当ての保護を維持するために有効にしておいてください。
- Introduced in: v3.2.12

##### enable_jvm_metrics

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: 起動時にJVM固有のメトリクスを初期化および登録するかどうかを制御します。有効にすると、メトリクスサブシステムはJVM関連のコレクタ（例：ヒープ、GC、スレッドメトリクス）をエクスポート用に作成し、無効にすると、それらのコレクタは初期化されません。このパラメータは将来の互換性のために意図されており、将来のリリースで削除される可能性があります。システムレベルのメトリクス収集を制御するには `enable_system_metrics` を使用してください。
- Introduced in: v4.0.0

##### get_pindex_worker_count

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: UpdateManagerの「get_pindex」スレッドプール（プライマリキーテーブルのrowsetを適用するときに使用される永続インデックスデータをロード/フェッチするために使用される）のワーカースレッド数を設定します。実行時には、設定更新によってプールの最大スレッドが調整されます。`>0` の場合、その値が適用されます。`0` の場合、ランタイムコールバックはCPUコア数（`CpuInfo::num_cores()`）を使用します。初期化時には、プールの最大スレッドはmax(`get_pindex_worker_count`, `max_apply_thread_cnt` * 2) として計算されます。ここで `max_apply_thread_cnt` はapply-threadプールの最大値です。pindexロードの並列性を高めるには値を増やし、同時実行性とメモリ/CPU使用量を減らすには値を減らします。
- Introduced in: v3.2.0

##### heartbeat_service_port

- Default: 9050
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: FEからのハートビートを受信するために使用されるBEハートビートサービスポート。
- Introduced in: -

##### heartbeat_service_thread_count

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BEハートビートサービスのスレッド数。
- Introduced in: -

##### local_library_dir

- Default: `${UDF_RUNTIME_DIR}`
- Type: string
- Unit: -
- Is mutable: いいえ
- Description: UDF（ユーザー定義関数）ライブラリがステージングされ、Python UDFワーカプロセスが動作するBE上のローカルディレクトリ。StarRocksはHDFSからこのパスにUDFライブラリをコピーし、`<local_library_dir>/pyworker_<pid>` にワーカごとのUnixドメインソケットを作成し、exec前にPythonワーカプロセスをこのディレクトリに変更します。ディレクトリは存在し、BEプロセスによって書き込み可能であり、Unixドメインソケットをサポートするファイルシステム（つまり、ローカルファイルシステム）上にある必要があります。この設定は実行時に変更できないため、起動前に設定し、各BEで適切な権限とディスクスペースを確保してください。
- Introduced in: v3.2.0

##### max_transmit_batched_bytes

- Default: 262144
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: 単一の送信リクエストで蓄積される、ネットワークにフラッシュされる前のシリアライズ済みバイトの最大数。送信側の実装は、シリアライズされたChunkPBペイロードをPTransmitChunkParamsリクエストに追加し、蓄積されたバイトが `max_transmit_batched_bytes` を超えるかEOSに達した場合にリクエストを送信します。この値を増やすと、RPCの頻度を減らし、スループットを向上させることができますが、リクエストごとのレイテンシとメモリ使用量が増加します。この値を減らすと、レイテンシとメモリを削減できますが、RPCレートが増加します。
- Introduced in: v3.2.0

##### mem_limit

- Default: 90%
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: BEプロセスのメモリ上限。パーセンテージ（"80%"）または物理的な制限（"100G"）として設定できます。デフォルトのハードリミットはサーバーのメモリサイズの90%で、ソフトリミットは80%です。StarRocksを他のメモリ集約的なサービスと同じサーバーにデプロイする場合、このパラメータを設定する必要があります。
- Introduced in: -

##### memory_max_alignment

- Default: 16
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: MemPoolが整列された割り当てに対して受け入れる最大バイトアラインメントを設定します。呼び出し元がより大きなアラインメント（SIMD、デバイスバッファ、またはABI制約のため）を必要とする場合にのみ、この値を増やしてください。大きな値は、割り当てごとのパディングと予約メモリの無駄を増やし、システムアロケータとプラットフォームがサポートする範囲内である必要があります。
- Introduced in: v3.2.0

##### memory_urgent_level

- Default: 85
- Type: long
- Unit: パーセンテージ (0-100)
- Is mutable: はい
- Description: プロセスメモリ制限のパーセンテージとして表される緊急メモリウォーターレベル。プロセスメモリ消費が `(limit * memory_urgent_level / 100)` を超えると、BEは即座にメモリ再利用をトリガーし、データキャッシュの縮小、更新キャッシュの削除、永続/lake MemTableの「満杯」扱いを強制し、それらがすぐにフラッシュ/圧縮されるようにします。コードは、この設定が `memory_high_level` より大きく、`memory_high_level` が1以上かつ100以下でなければならないことを検証します。値が低いと、より積極的で早期の再利用が発生し、キャッシュの削除とフラッシュが頻繁になります。値が高いと、再利用が遅延し、100に近すぎるとOOMのリスクがあります。この項目は `memory_high_level` とデータキャッシュ関連の自動調整設定と合わせて調整してください。
- Introduced in: v3.2.0

##### net_use_ipv6_when_priority_networks_empty

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: `priority_networks` が指定されていない場合にIPv6アドレスを優先的に使用するかどうかを制御するブール値。`true` は、ノードをホストするサーバーがIPv4とIPv6アドレスの両方を持っており、`priority_networks` が指定されていない場合に、システムがIPv6アドレスを優先的に使用することを許可することを示します。
- Introduced in: v3.3.0

##### num_cores

- Default: 0
- Type: Int
- Unit: コア
- Is mutable: いいえ
- Description: CPU認識の決定（例えば、スレッドプールサイジングやランタイムスケジューリング）にシステムが使用するCPUコア数を制御します。値が0の場合、自動検出が有効になります。システムは `/proc/cpuinfo` を読み取り、利用可能なすべてのコアを使用します。正の整数に設定された場合、その値は検出されたコア数を上書きし、実効コア数になります。コンテナ内で実行されている場合、cgroupのcpusetまたはcpuクォータ設定が使用可能なコアをさらに制限する可能性があります。`CpuInfo` もこれらのcgroup制限を尊重します。
- Introduced in: v3.2.0

##### plugin_path

- Default: `${STARROCKS_HOME}/plugin`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: StarRocksが外部プラグイン（動的ライブラリ、コネクタアーティファクト、UDFバイナリなど）をロードするファイルシステムディレクトリ。`plugin_path` はBEプロセスからアクセス可能なディレクトリ（読み取りおよび実行権限）を指し、プラグインがロードされる前に存在する必要があります。正しい所有権と、プラグインファイルがプラットフォームのネイティブバイナリ拡張子（例：Linuxでは.so）を使用していることを確認してください。
- Introduced in: v3.2.0

##### priority_networks

- Default: An empty string
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: 複数のIPアドレスを持つサーバーの選択戦略を宣言します。このパラメータで指定されたリストに最大1つのIPアドレスが一致する必要があることに注意してください。このパラメータの値は、CIDR表記でセミコロン（;）で区切られたエントリのリストです（例：`10.10.10.0/24`）。このリストのエントリにIPアドレスが一致しない場合、サーバーの利用可能なIPアドレスがランダムに選択されます。v3.3.0以降、StarRocksはIPv6ベースのデプロイメントをサポートします。サーバーがIPv4とIPv6の両方のアドレスを持ち、このパラメータが指定されていない場合、システムはデフォルトでIPv4アドレスを使用します。この動作は `net_use_ipv6_when_priority_networks_empty` を `true` に設定することで変更できます。
- Introduced in: -

##### rpc_compress_ratio_threshold

- Default: 1.1
- Type: Double
- Unit: -
- Is mutable: はい
- Description: 圧縮形式でネットワーク経由でシリアライズされたローバッチを送信するかどうかを決定する際に使用される閾値 (uncompressed_size / compressed_size)。圧縮が試行されるとき (例: DataStreamSender、交換シンク、タブレットシンクインデックスチャネル、辞書キャッシュライター)、StarRocksはcompress_ratio = uncompressed_size / compressed_size を計算します。compress_ratioが `rpc_compress_ratio_threshold` より大きい場合にのみ圧縮ペイロードを使用します。デフォルトの1.1では、圧縮データは非圧縮データよりも少なくとも約9.1%小さくなければ使用されません。圧縮を優先するには値を下げます (帯域幅の節約が小さくてもCPU使用量が増加)。より大きなサイズ削減が得られない限り圧縮オーバーヘッドを避けるには値を上げます。注意: これはRPC/シャッフルシリアライズに適用され、ローバッチ圧縮が有効な場合 (compress_rowbatches) にのみ有効です。
- Introduced in: v3.2.0

##### ssl_private_key_path

- Default: An empty string
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: BEのbRPCサーバーがデフォルト証明書の秘密鍵として使用するTLS/SSL秘密鍵（PEM）へのファイルシステムパス。`enable_https` が `true` に設定されている場合、システムはプロセス開始時に `brpc::ServerOptions::ssl_options().default_cert.private_key` をこのパスに設定します。ファイルはBEプロセスからアクセス可能であり、`ssl_certificate_path` で提供される証明書と一致する必要があります。この値が設定されていない場合、またはファイルが存在しないかアクセスできない場合、HTTPSは設定されず、bRPCサーバーの起動に失敗する可能性があります。このファイルを制限的なファイルシステム権限（例：600）で保護してください。
- Introduced in: v4.0.0

##### thrift_client_retry_interval_ms

- Default: 100
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: Thriftクライアントが再試行する時間間隔。
- Introduced in: -

##### thrift_connect_timeout_seconds

- Default: 3
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: Thriftクライアント作成時に使用される接続タイムアウト（秒単位）。`ClientCacheHelper::_create_client` はこの値を1000倍し、`ThriftClientImpl::set_conn_timeout()` に渡すため、BEクライアントキャッシュによって開かれる新しいThrift接続のTCP/接続ハンドシェイクタイムアウトを制御します。この設定は接続確立のみに影響します。送信/受信タイムアウトは別途設定されます。非常に小さい値は、高遅延ネットワークで偽の接続障害を引き起こす可能性があり、大きい値は到達不能なピアの検出を遅らせます。
- Introduced in: v3.2.0

##### thrift_port

- Default: 0
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 内部のThriftベースのBackendServiceをエクスポートするために使用されるポート。プロセスがCompute Nodeとして実行され、この項目が0以外の値に設定されている場合、`be_port` を上書きし、Thriftサーバーはこの値にバインドします。それ以外の場合は `be_port` が使用されます。この設定は非推奨です。0以外の `thrift_port` を設定すると、`be_port` を使用するように助言する警告がログに記録されます。
- Introduced in: v3.2.0

##### thrift_rpc_connection_max_valid_time_ms

- Default: 5000
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: Thrift RPC接続の最大有効時間。この値よりも長く接続プールに存在した接続は閉じられます。FE構成 `thrift_client_timeout_ms` と一致するように設定する必要があります。
- Introduced in: -

##### thrift_rpc_max_body_size

- Default: 0
- Type: Int
- Unit:
- Is mutable: いいえ
- Description: RPCの最大文字列ボディサイズ。`0` はサイズが無制限であることを示します。
- Introduced in: -

##### thrift_rpc_strict_mode

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: Thriftの厳密な実行モードが有効になっているかどうか。Thriftの厳密なモードの詳細については、[Thrift Binary protocol encoding](https://github.com/apache/thrift/blob/master/doc/specs/thrift-binary-protocol.md) を参照してください。
- Introduced in: -

##### thrift_rpc_timeout_ms

- Default: 5000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: Thrift RPCのタイムアウト。
- Introduced in: -

##### transaction_apply_thread_pool_num_min

- Default: 0
- Type: Int
- Unit: スレッド
- Is mutable: はい
- Description: BEのUpdateManager内の「update_apply」スレッドプール（プライマリキーテーブルのrowsetを適用するプール）の最小スレッド数を設定します。値が0の場合、固定された最小値は無効になります（下限は強制されません）。`transaction_apply_worker_count` も0の場合、プールの最大スレッドはCPUコア数にデフォルト設定されるため、実効ワーカ容量はCPUコア数に等しくなります。これを増やすと、トランザクション適用に対するベースラインの同時実行性を保証できます。高すぎるとCPUの競合が増加する可能性があります。変更は、update_config HTTPハンドラを介して実行時に適用されます（applyスレッドプールで `update_min_threads` を呼び出します）。
- Introduced in: v3.2.11

##### transaction_publish_version_thread_pool_num_min

- Default: 0
- Type: Int
- Unit: スレッド
- Is mutable: はい
- Description: AgentServerの「publish_version」動的スレッドプール（トランザクションバージョンを公開する/ TTaskType::PUBLISH_VERSIONタスクを処理するために使用される）で予約される最小スレッド数を設定します。起動時にプールはmin = max(設定値, MIN_TRANSACTION_PUBLISH_WORKER_COUNT) (MIN_TRANSACTION_PUBLISH_WORKER_COUNT = 1) で作成されるため、デフォルトの0は最小1スレッドになります。実行時にこの値を変更すると、updateコールバックがThreadPool::update_min_threadsを呼び出し、プールの保証された最小値が増減します（ただし、強制された最小値の1を下回ることはありません）。`transaction_publish_version_worker_count` (最大スレッド) と `transaction_publish_version_thread_pool_idle_time_ms` (アイドルタイムアウト) と連携して調整してください。
- Introduced in: v3.2.11

##### use_mmap_allocate_chunk

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: この項目が `true` に設定されている場合、システムは匿名プライベートmmapマッピング（MAP_ANONYMOUS | MAP_PRIVATE）を使用してチャンクを割り当て、munmapで解放します。これを有効にすると、多数の仮想メモリマッピングが作成される可能性があるため、カーネル制限（rootユーザーとして `sysctl -w vm.max_map_count=262144` または `echo 262144 > /proc/sys/vm/max_map_count` を実行）を上げ、`chunk_reserved_bytes_limit` を比較的に大きな値に設定する必要があります。そうしないと、mmapを有効にすると、頻繁なマッピング/アンマッピングにより非常に低いパフォーマンスになる可能性があります。
- Introduced in: v3.2.0

### メタデータとクラスター管理

##### cluster_id

- Default: -1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: このStarRocksバックエンドのグローバルクラスター識別子。起動時にStorageEngineは `config::cluster_id` を実効クラスターIDに読み込み、すべてのデータルートパスが同じクラスターIDを含んでいることを確認します（`StorageEngine::_check_all_root_path_cluster_id` を参照）。値 `-1` は「未設定」を意味します。エンジンは既存のデータディレクトリまたはマスターハートビートから実効IDを導出する可能性があります。非負のIDが構成されている場合、構成されたIDとデータディレクトリに保存されているIDとの不一致により、起動検証が失敗します（`Status::Corruption`）。一部のルートにIDがなく、エンジンがIDの書き込みを許可されている場合（`options.need_write_cluster_id`）、実効IDをそれらのルートに永続化します。
- Introduced in: v3.2.0

##### consistency_max_memory_limit

- Default: 10G
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: CONSISTENCYメモリトラッカーのメモリサイズ指定。
- Introduced in: v3.2.0

##### make_snapshot_rpc_timeout_ms

- Default: 20000
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: リモートBEでスナップショットを作成する際に使用されるThrift RPCタイムアウトをミリ秒単位で設定します。リモートスナップショットの作成がデフォルトのタイムアウトを定期的に超える場合はこの値を増やし、応答しないBEでより早く失敗するにはこの値を減らします。他のタイムアウトがエンドツーエンド操作に影響を与える可能性があることに注意してください（例えば、実効的なタブレットライターオープンタイムアウトは `tablet_writer_open_rpc_timeout_sec` や `load_timeout_sec` に関連する可能性があります）。
- Introduced in: v3.2.0

##### metadata_cache_memory_limit_percent

- Default: 30
- Type: Int
- Unit: パーセント
- Is mutable: はい
- Description: メタデータLRUキャッシュサイズをプロセスメモリ制限のパーセンテージとして設定します。起動時にStarRocksはキャッシュバイト数を (process_mem_limit * metadata_cache_memory_limit_percent / 100) として計算し、それをメタデータキャッシュアロケータに渡します。キャッシュは非PRIMARY_KEYS rowsets（PKテーブルはサポートされていません）にのみ使用され、`metadata_cache_memory_limit_percent` > 0 の場合にのみ有効になります。メタデータキャッシュを無効にするには &le; 0 に設定します。この値を増やすとメタデータキャッシュ容量が増加しますが、他のコンポーネントで利用可能なメモリが減少します。ワークロードとシステムメモリに基づいて調整してください。BE_TESTビルドではアクティブではありません。
- Introduced in: v3.2.10

##### retry_apply_interval_second

- Default: 30
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 失敗したタブレット適用操作の再試行をスケジューリングする際に使用されるベース間隔（秒単位）。これは、送信失敗後の再試行のスケジューリングに直接使用され、バックオフのベース乗数としても使用されます。次の再試行遅延はmin(600, `retry_apply_interval_second` * failed_attempts)として計算されます。コードはまた、`retry_apply_interval_second` を使用して累積再試行期間（等差数列の合計）を計算し、`retry_apply_timeout_second` と比較して再試行を続けるかどうかを決定します。`enable_retry_apply` がtrueの場合にのみ有効です。この値を増やすと、個々の再試行遅延と再試行に費やされる累積時間の両方が長くなります。減らすと、再試行がより頻繁になり、`retry_apply_timeout_second` に達するまでの試行回数が増加する可能性があります。
- Introduced in: v3.2.9

##### retry_apply_timeout_second

- Default: 7200
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 適用プロセスがあきらめ、タブレットがエラー状態に入る前に、保留中のバージョンの適用に許容される最大累積再試行時間（秒単位）。適用ロジックは、`retry_apply_interval_second` に基づいて指数関数的/バックオフ間隔を累積し、合計期間を `retry_apply_timeout_second` と比較します。`enable_retry_apply` がtrueであり、エラーが再試行可能と見なされる場合、累積バックオフが `retry_apply_timeout_second` を超えるまで適用試行は再スケジュールされます。その後、適用は停止し、タブレットはエラーに移行します。明示的に再試行不能なエラー（例：`Corruption`）は、この設定に関係なく再試行されません。この値を調整して、StarRocksが適用操作を再試行し続ける期間（デフォルト7200秒 = 2時間）を制御します。
- Introduced in: v3.3.13, v3.4.3, v3.5.0

##### txn_commit_rpc_timeout_ms

- Default: 60000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: BEストリームロードおよびトランザクションコミット呼び出しで使用されるThrift RPC接続の最大許容存続時間（ミリ秒単位）。StarRocksはこの値をFEに送信されるリクエスト（stream_load計画、loadTxnBegin/loadTxnPrepare/loadTxnCommit、getLoadTxnStatusで使用）の `thrift_rpc_timeout_ms` として設定します。接続がこの値よりも長くプールされている場合、接続は閉じられます。リクエストごとのタイムアウト（`ctx->timeout_second`）が提供されている場合、BEはRPCタイムアウトをrpc_timeout_ms = max(ctx*1000/4, min(ctx*1000/2, txn_commit_rpc_timeout_ms)) として計算するため、実効的なRPCタイムアウトはコンテキストとこの設定によって制限されます。不一致のタイムアウトを避けるために、これをFEの `thrift_client_timeout_ms` と一致させてください。
- Introduced in: v3.2.0

##### txn_map_shard_size

- Default: 128
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: トランザクションマネージャーがトランザクションロックを分割し、競合を減らすために使用するロックマップシャードの数。その値は2の累乗（2^n）であるべきです。値を増やすと、追加のメモリとわずかな簿記のオーバーヘッドのコストで、同時実行性が向上し、ロック競合が減少します。予想される同時トランザクションと利用可能なメモリに合わせてシャード数を設定してください。
- Introduced in: v3.2.0

##### txn_shard_size

- Default: 1024
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: トランザクションマネージャーが使用するロックシャードの数を制御します。この値はtxnロックのシャードサイズを決定します。2の累乗である必要があります。より大きな値に設定すると、ロックの競合が減少し、同時COMMIT/PUBLISHのスループットが向上しますが、追加のメモリとより詳細な内部的な簿記のコストが増加します。
- Introduced in: v3.2.0

##### update_schema_worker_count

- Default: 3
- Type: Int
- Unit: スレッド
- Is mutable: いいえ
- Description: TTaskType::UPDATE_SCHEMAタスクを処理するバックエンドの「update_schema」動的ThreadPool内のワーカースレッドの最大数を設定します。ThreadPoolは起動時にagent_serverで最小0スレッド（アイドル時には0にスケールダウン可能）とこの設定に等しい最大値（プールはデフォルトのアイドルタイムアウトと実質的に無制限のキューを使用）で作成されます。この値を増やすと、より多くの同時スキーマ更新タスクを許可できます（CPUとメモリ使用量が増加）。値を減らすと、並列スキーマ操作が制限されます。
- Introduced in: v3.2.3

##### update_tablet_meta_info_worker_count

- Default: 1
- Type: Int
- Unit: -
- Is mutable: はい
- Description: タブレットメタデータ更新タスクを処理するバックエンドスレッドプールの最大ワーカースレッド数を設定します。スレッドプールはバックエンドの起動中に作成され、最小0スレッド（アイドル時には0にスケールダウン可能）とこの設定に等しい最大値（少なくとも1に制限される）を持ちます。実行時にこの値を更新すると、プールの最大スレッドが調整されます。同時メタデータ更新タスクを増やすには値を増やし、同時実行性を制限するには値を減らします。
- Introduced in: v4.1.0, v4.0.6, v3.5.13

### ユーザー、ロール、および権限

##### ssl_certificate_path

- Default: 
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: `enable_https` がtrueの場合にBEのbRPCサーバーが使用するTLS/SSL証明書ファイル（PEM）への絶対パス。BE起動時にこの値は `brpc::ServerOptions::ssl_options().default_cert.certificate` にコピーされます。一致する秘密鍵も `ssl_private_key_path` に設定する必要があります。CAで必要とされる場合、サーバー証明書とすべての中間証明書をPEM形式（証明書チェーン）で提供してください。ファイルはStarRocks BEプロセスから読み取り可能であり、起動時にのみ適用されます。`enable_https` が有効なときに設定されていないか無効な場合、bRPC TLSのセットアップが失敗し、サーバーが正しく起動できない可能性があります。
- Introduced in: v4.0.0

### クエリエンジン

##### clear_udf_cache_when_start

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: 有効にすると、BEのUserFunctionCacheは起動時にローカルにキャッシュされているすべてのユーザー関数ライブラリをクリアします。`UserFunctionCache::init` 中に、コードは `_reset_cache_dir()` を呼び出し、設定されたUDFライブラリディレクトリ（`kLibShardNum` サブディレクトリに整理されている）からUDFファイルを削除し、Java/Python UDFのサフィックス（.jar/.py）を持つファイルを削除します。無効にすると（デフォルト）、BEは既存のキャッシュされたUDFファイルを削除する代わりにロードします。これを有効にすると、再起動後の最初の使用時にUDFバイナリが再ダウンロードされることになります（ネットワークトラフィックと初回使用のレイテンシが増加します）。
- Introduced in: v4.0.0

##### dictionary_speculate_min_chunk_size

- Default: 10000
- Type: Int
- Unit: 行
- Is mutable: いいえ
- Description: `StringColumnWriter` および `DictColumnWriter` が辞書エンコーディング推測をトリガーするために使用する最小行数（チャンクサイズ）。入力列（または蓄積されたバッファと入力行）のサイズが `dictionary_speculate_min_chunk_size` 以上の場合、ライターは直ちに推測を実行し、より多くの行をバッファリングする代わりにエンコーディング（DICT、PLAINまたはBIT_SHUFFLE）を設定します。推測は文字列列の場合は `dictionary_encoding_ratio` を、数値/非文字列列の場合は `dictionary_encoding_ratio_for_non_string_column` を使用して、辞書エンコーディングが有益かどうかを決定します。また、大きな列の `byte_size`（UINT32_MAX以上）は、`BinaryColumn<uint32_t>` のオーバーフローを避けるために即座の推測を強制します。
- Introduced in: v3.2.0

##### disable_storage_page_cache

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: PageCacheを無効にするかどうかを制御するブール値。
  - PageCacheが有効になっている場合、StarRocksは最近スキャンされたデータをキャッシュします。
  - PageCacheは、類似のクエリが頻繁に繰り返される場合にクエリパフォーマンスを大幅に向上させることができます。
  - `true` はPageCacheを無効にすることを示します。
  - StarRocks v2.4以降、この項目のデフォルト値は `true` から `false` に変更されました。
- Introduced in: -

##### enable_bitmap_index_memory_page_cache

- Default: true 
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: Bitmapインデックスのメモリキャッシュを有効にするかどうか。ポイントクエリを高速化するためにBitmapインデックスを使用する場合は、メモリキャッシュを推奨します。
- Introduced in: v3.1

##### enable_compaction_flat_json

- Default: True
- Type: Boolean
- Unit:
- Is mutable: はい
- Description: Flat JSONデータのコンパクションを有効にするかどうか。
- Introduced in: v3.3.3

##### enable_json_flat

- Default: false
- Type: Boolean
- Unit:
- Is mutable: はい
- Description: Flat JSON機能を有効にするかどうか。この機能が有効になった後、新しくロードされたJSONデータは自動的にフラット化され、JSONクエリのパフォーマンスが向上します。
- Introduced in: v3.3.0

##### enable_lazy_dynamic_flat_json

- Default: True
- Type: Boolean
- Unit:
- Is mutable: はい
- Description: 読み込みプロセスでFlat JSONスキーマが見つからない場合に、Lazy Dyamic Flat JSONを有効にするかどうか。この項目が `true` に設定されている場合、StarRocksはFlat JSON操作を読み込みプロセスではなく計算プロセスに延期します。
- Introduced in: v3.3.3

##### enable_ordinal_index_memory_page_cache

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 順序インデックスのメモリキャッシュを有効にするかどうか。順序インデックスは行IDからデータページ位置へのマッピングであり、スキャンを高速化するために使用できます。
- Introduced in: -

##### enable_string_prefix_zonemap

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: プレフィックスベースの最小/最大値を使用して、文字列（CHAR/VARCHAR）列のZoneMapを有効にするかどうか。非キー文字列列の場合、最小/最大値は `string_prefix_zonemap_prefix_len` で設定された固定プレフィックス長に切り捨てられます。
- Introduced in: -

##### enable_zonemap_index_memory_page_cache

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: zonemapインデックスのメモリキャッシュを有効にするかどうか。zonemapインデックスを使用してスキャンを高速化する場合は、メモリキャッシュを推奨します。
- Introduced in: -

##### exchg_node_buffer_size_bytes

- Default: 10485760
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: 各クエリの交換ノードのレシーバー側の最大バッファサイズ。この構成項目はソフトリミットです。データが過剰な速度でレシーバー側に送信されたときにバックプレッシャがトリガーされます。
- Introduced in: -

##### file_descriptor_cache_capacity

- Default: 16384
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: キャッシュできるファイルディスクリプタの数。
- Introduced in: -

##### flamegraph_tool_dir

- Default: `${STARROCKS_HOME}/bin/flamegraph`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: flamegraphツールのディレクトリ。プロファイルデータからフレームグラフを生成するためのpprof、stackcollapse-go.pl、およびflamegraph.plスクリプトが含まれている必要があります。
- Introduced in: -

##### fragment_pool_queue_size

- Default: 2048
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 各BEノードで処理できるクエリ数の上限。
- Introduced in: -

##### fragment_pool_thread_num_max

- Default: 4096
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: クエリに使用される最大スレッド数。
- Introduced in: -

##### fragment_pool_thread_num_min

- Default: 64
- Type: Int
- Unit: 分 -
- Is mutable: いいえ
- Description: クエリに使用される最小スレッド数。
- Introduced in: -

##### hdfs_client_enable_hedged_read

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: ヘッジリード機能を有効にするかどうかを指定します。
- Introduced in: v3.0

##### hdfs_client_hedged_read_threadpool_size

- Default: 128
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: HDFSクライアントのヘッジリードスレッドプールのサイズを指定します。スレッドプールサイズは、HDFSクライアントでヘッジリードを実行するために割り当てるスレッド数を制限します。HDFSクラスターの **hdfs-site.xml** ファイルにある `dfs.client.hedged.read.threadpool.size` パラメータと同等です。
- Introduced in: v3.0

##### hdfs_client_hedged_read_threshold_millis

- Default: 2500
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: ヘッジリードを開始する前に待機するミリ秒数を指定します。たとえば、このパラメータを `30` に設定した場合、この状況で、ブロックからの読み取りが30ミリ秒以内に返されない場合、HDFSクライアントは直ちに異なるブロックレプリカに対して新しい読み取りを開始します。HDFSクラスターの **hdfs-site.xml** ファイルにある `dfs.client.hedged.read.threshold.millis` パラメータと同等です。
- Introduced in: v3.0

##### io_coalesce_adaptive_lazy_active

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 述語の選択性に基づいて、述語列と非述語列のI/Oを結合するかどうかを適応的に決定します。
- Introduced in: v3.2

##### jit_lru_cache_size

- Default: 0
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: JITコンパイル用のLRUキャッシュサイズ。0より大きい値に設定された場合、キャッシュの実際のサイズを表します。0以下に設定された場合、システムは式 `jit_lru_cache_size = min(mem_limit*0.01, 1GB)` を使用してキャッシュを適応的に設定します（ノードの `mem_limit` は16GB以上である必要があります）。
- Introduced in: -

##### json_flat_column_max

- Default: 100
- Type: Int
- Unit:
- Is mutable: はい
- Description: Flat JSONで抽出できるサブフィールドの最大数。このパラメータは、`enable_json_flat` が `true` に設定されている場合にのみ有効です。
- Introduced in: v3.3.0

##### json_flat_create_zonemap

- Default: true
- Type: Boolean
- Unit:
- Is mutable: はい
- Description: 書き込み中にフラット化されたJSONサブ列のZoneMapを作成するかどうか。このパラメータは、`enable_json_flat` が `true` に設定されている場合にのみ有効です。
- Introduced in: -

##### json_flat_null_factor

- Default: 0.3
- Type: Double
- Unit:
- Is mutable: はい
- Description: Flat JSONで抽出する列のNULL値の割合。NULL値の割合がこの閾値よりも高い場合、列は抽出されません。このパラメータは、`enable_json_flat` が `true` に設定されている場合にのみ有効です。
- Introduced in: v3.3.0

##### json_flat_sparsity_factor

- Default: 0.3
- Type: Double
- Unit:
- Is mutable: はい
- Description: Flat JSONの同じ名前を持つ列の割合。同じ名前を持つ列の割合がこの値よりも低い場合、抽出は実行されません。このパラメータは、`enable_json_flat` が `true` に設定されている場合にのみ有効です。
- Introduced in: v3.3.0

##### lake_tablet_ignore_invalid_delete_predicate

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 列名が変更された後、重複キーテーブルへの論理削除によって導入された可能性のあるタブレットのrowsetメタデータ内の無効な削除述語を無視するかどうかを制御するブール値。
- Introduced in: v4.0

##### late_materialization_ratio

- Default: 10
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: SegmentIterator（ベクトルクエリエンジン）での遅延マテリアライズの使用を制御する範囲[0-1000]の整数比。値 `0`（または &le; 0）は遅延マテリアライズを無効にします。`1000`（または &ge; 1000）はすべての読み取りに対して遅延マテリアライズを強制します。0より大きく1000未満の値は、述語フィルタ比率に基づいて動作を選択する条件付き戦略を有効にします（値が大きいほど遅延マテリアライズが優先されます）。セグメントに複雑なメトリックタイプが含まれている場合、StarRocksは代わりに `metric_late_materialization_ratio` を使用します。`lake_io_opts.cache_file_only` が設定されている場合、遅延マテリアライズは無効になります。
- Introduced in: v3.2.0

##### max_hdfs_file_handle

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 開くことができるHDFSファイルディスクリプタの最大数。
- Introduced in: -

##### max_memory_sink_batch_count

- Default: 20
- Type: Int
- Unit: -
- Is mutable: はい
- Description: スキャンキャッシュバッチの最大数。
- Introduced in: -

##### max_pushdown_conditions_per_column

- Default: 1024
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 各列でプッシュダウンを許可する条件の最大数。条件数がこの制限を超えると、述語はストレージ層にプッシュダウンされません。
- Introduced in: -

##### max_scan_key_num

- Default: 1024
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 各クエリでセグメント化されるスキャンキーの最大数。
- Introduced in: -

##### metric_late_materialization_ratio

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 複雑なメトリック列を含む読み取りに対して、遅延マテリアライズ行アクセス戦略がいつ使用されるかを制御します。有効範囲：[0-1000]。`0` は遅延マテリアライズを無効にします。`1000` はすべての適用可能な読み取りに対して遅延マテリアライズを強制します。1〜999の値は、遅延マテリアライズと早期マテリアライズの両方のコンテキストが準備され、述語/選択性に基づいて実行時に選択される条件付き戦略を有効にします。複雑なメトリックタイプが存在する場合、`metric_late_materialization_ratio` は一般的な `late_materialization_ratio` を上書きします。注：`cache_file_only` I/Oモードでは、この設定に関係なく遅延マテリアライズが無効になります。
- Introduced in: v3.2.0

##### min_file_descriptor_number

- Default: 60000
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BEプロセスのファイルディスクリプタの最小数。
- Introduced in: -

##### object_storage_connect_timeout_ms

- Default: -1
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: オブジェクトストレージとのソケット接続を確立するためのタイムアウト期間。`-1` はSDK構成のデフォルトのタイムアウト期間を使用することを示します。
- Introduced in: v3.0.9

##### object_storage_request_timeout_ms

- Default: -1
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: オブジェクトストレージとのHTTP接続を確立するためのタイムアウト期間。`-1` はSDK構成のデフォルトのタイムアウト期間を使用することを示します。
- Introduced in: v3.0.9

##### parquet_late_materialization_enable

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: パフォーマンス向上のためにParquetリーダーの遅延マテリアライズを有効にするかどうかを制御するブール値。`true` は遅延マテリアライズを有効にすることを示し、`false` は無効にすることを示します。
- Introduced in: -

##### parquet_page_index_enable

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: パフォーマンス向上のためにParquetファイルのページインデックスを有効にするかどうかを制御するブール値。`true` はページインデックスを有効にすることを示し、`false` は無効にすることを示します。
- Introduced in: v3.3

##### parquet_reader_bloom_filter_enable

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: パフォーマンス向上のためにParquetファイルのブルームフィルタを有効にするかどうかを制御するブール値。`true` はブルームフィルタを有効にすることを示し、`false` は無効にすることを示します。セッションレベルでシステム変数 `enable_parquet_reader_bloom_filter` を使用してこの動作を制御することもできます。Parquetのブルームフィルタは、**各行グループ内の列レベルで**維持されます。Parquetファイルが特定の列のブルームフィルタを含む場合、クエリはそれらの列の述語を使用して効率的に行グループをスキップできます。
- Introduced in: v3.5

##### path_gc_check_step

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 毎回連続してスキャンできるファイルの最大数。
- Introduced in: -

##### path_gc_check_step_interval_ms

- Default: 10
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: ファイルスキャン間の時間間隔。
- Introduced in: -

##### path_scan_interval_second

- Default: 86400
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: GCが期限切れデータをクリーンアップする時間間隔。
- Introduced in: -

##### pipeline_connector_scan_thread_num_per_cpu

- Default: 8
- Type: Double
- Unit: -
- Is mutable: はい
- Description: BEノードのPipeline ConnectorにCPUコアごとに割り当てられるスキャンスレッド数。この設定はv3.1.7以降、動的に変更可能になりました。
- Introduced in: -

##### pipeline_poller_timeout_guard_ms

- Default: -1
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: この項目が `0` より大きく設定されている場合、pollerでドライバーが単一のディスパッチに `pipeline_poller_timeout_guard_ms` よりも長くかかると、ドライバーとオペレーターの情報が出力されます。
- Introduced in: -

##### pipeline_prepare_thread_pool_queue_size

- Default: 102400
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: Pipeline実行エンジンのPREPAREフラグメントスレッドプールの最大キュー長。
- Introduced in: -

##### pipeline_prepare_thread_pool_thread_num

- Default: 0
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: パイプライン実行エンジンのPREPAREフラグメントスレッドプールのスレッド数。`0` はシステムVCPUコア数に等しいことを示します。
- Introduced in: -

##### pipeline_prepare_timeout_guard_ms

- Default: -1
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: この項目が `0` より大きく設定されている場合、PREPAREプロセス中にプランフラグメントが `pipeline_prepare_timeout_guard_ms` を超えると、プランフラグメントのスタックトレースが出力されます。
- Introduced in: -

##### pipeline_scan_thread_pool_queue_size

- Default: 102400
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: Pipeline実行エンジンのSCANスレッドプールの最大タスクキュー長。
- Introduced in: -

##### pk_index_parallel_get_threadpool_size

- Default: 1048576
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データ（クラウドネイティブ/lake）モードでのPKインデックス並列取得操作で使用される「cloud_native_pk_index_get」スレッドプールの最大キューサイズ（保留中のタスク数）を設定します。このプールの実際のスレッド数は `pk_index_parallel_get_threadpool_max_threads` によって制御されます。この設定は、実行を待機しているタスクがどれだけキューに入れられるかを制限するだけです。非常に大きいデフォルト値（2^20）は、キューを事実上無制限にします。これを減らすと、キューに入れられたタスクによる過剰なメモリ増加を防ぎますが、キューがいっぱいになるとタスクの送信がブロックされたり失敗したりする可能性があります。ワークロードの同時実行性とメモリ制約に基づいて `pk_index_parallel_get_threadpool_max_threads` と一緒に調整してください。
- Introduced in: -

##### priority_queue_remaining_tasks_increased_frequency

- Default: 512
- Type: Int
- Unit: -
- Is mutable: はい
- Description: `BlockingPriorityQueue` がすべての残りのタスクの優先度を増加（「エージング」）させて飢餓を防ぐ頻度を制御します。正常なget/popごとに内部 `_upgrade_counter` がインクリメントされます。`_upgrade_counter` が `priority_queue_remaining_tasks_increased_frequency` を超えると、キューはすべての要素の優先度をインクリメントし、ヒープを再構築し、カウンターをリセットします。値が低いほど優先度エージングが頻繁になります（飢餓は減少しますが、イテレーションと再ヒープ化によるCPUコストが増加します）。値が高いほどオーバーヘッドは減少しますが、優先度調整が遅れます。この値は単純な操作数閾値であり、時間 duration ではありません。
- Introduced in: v3.2.0

##### query_cache_capacity

- Default: 536870912
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: BEのクエリキャッシュのサイズ。デフォルトサイズは512MBです。サイズは4MB未満にすることはできません。BEのメモリ容量が予想されるクエリキャッシュサイズをプロビジョニングするのに不十分な場合、BEのメモリ容量を増やすことができます。
- Introduced in: -

##### query_pool_spill_mem_limit_threshold

- Default: 1.0
- Type: Double
- Unit: -
- Is mutable: いいえ
- Description: 自動スピリングが有効になっている場合、すべてのクエリのメモリ使用量が `query_pool memory limit * query_pool_spill_mem_limit_threshold` を超えると、中間結果のスピリングがトリガーされます。
- Introduced in: v3.2.7

##### query_scratch_dirs

- Default: `${STARROCKS_HOME}`
- Type: string
- Unit: -
- Is mutable: いいえ
- Description: クエリ実行が中間データ（例えば、外部ソート、ハッシュ結合、その他のオペレーター）をスピルするために使用する書き込み可能なスクラッチディレクトリのカンマ区切りリスト。セミコロン（;）で区切られた1つ以上のパスを指定します（例：`/mnt/ssd1/tmp;/mnt/ssd2/tmp`）。ディレクトリはBEプロセスからアクセスおよび書き込み可能であり、十分な空きスペースが必要です。StarRocksはそれらの中から選択してスピルI/Oを分散させます。変更を有効にするには再起動が必要です。ディレクトリが見つからない、書き込みできない、または満杯の場合、スピルが失敗したり、クエリパフォーマンスが低下したりする可能性があります。
- Introduced in: v3.2.0

##### result_buffer_cancelled_interval_time

- Default: 300
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: BufferControlBlockがデータを解放するまでの待機時間。
- Introduced in: -

##### scan_context_gc_interval_min

- Default: 5
- Type: Int
- Unit: 分
- Is mutable: はい
- Description: スキャンコンテキストをクリーンアップする時間間隔。
- Introduced in: -

##### scanner_row_num

- Default: 16384
- Type: Int
- Unit: -
- Is mutable: はい
- Description: スキャンで各スキャンスレッドが返す最大行数。
- Introduced in: -

##### scanner_thread_pool_queue_size

- Default: 102400
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: ストレージエンジンがサポートするスキャンタスクの数。
- Introduced in: -

##### scanner_thread_pool_thread_num

- Default: 48
- Type: Int
- Unit: -
- Is mutable: はい
- Description: ストレージエンジンが同時ストレージボリュームスキャンに使用するスレッド数。すべてのスレッドはスレッドプールで管理されます。
- Introduced in: -

##### string_prefix_zonemap_prefix_len

- Default: 16
- Type: Int
- Unit: -
- Is mutable: はい
- Description: `enable_string_prefix_zonemap` が有効な場合、文字列ZoneMapの最小/最大値に使用されるプレフィックス長。
- Introduced in: -

##### udf_thread_pool_size

- Default: 1
- Type: Int
- Unit: スレッド
- Is mutable: いいえ
- Description: ExecEnvで作成されるUDF呼び出しPriorityThreadPool（ユーザー定義関数/UDF関連タスクの実行に使用）のサイズを設定します。この値はスレッドプール（PriorityThreadPool("udf", thread_num, queue_size)）を構築する際にプールのスレッド数とキュー容量として使用されます。同時UDF実行を増やすにはこの値を増やし、過度なCPUとメモリの競合を避けるために小さく保ちます。
- Introduced in: v3.2.0

##### update_memory_limit_percent

- Default: 60
- Type: Int
- Unit: パーセント
- Is mutable: いいえ
- Description: 更新関連のメモリとキャッシュのために予約されるBEプロセスメモリの割合。起動中に `GlobalEnv` は更新用の `MemTracker` を `process_mem_limit` * clamp(`update_memory_limit_percent`, 0, 100) / 100 として計算します。`UpdateManager` もこのパーセンテージを使用して、プライマリインデックス/インデックスキャッシュ容量（インデックスキャッシュ容量 = `GlobalEnv::process_mem_limit` * `update_memory_limit_percent` / 100）をサイズ設定します。HTTP設定更新ロジックは、設定が変更された場合に更新サブシステムに適用される `update_primary_index_memory_limit` を更新マネージャーで呼び出すコールバックを登録します。この値を増やすと、更新/プライマリインデックスパスにより多くのメモリが割り当てられ（他のプールで利用可能なメモリが減少）、減らすと更新メモリとキャッシュ容量が減少します。値は0〜100の範囲にクランプされます。
- Introduced in: v3.2.0

##### vector_chunk_size

- Default: 4096
- Type: Int
- Unit: 行
- Is mutable: いいえ
- Description: 実行およびストレージコードパス全体で使用されるベクトル化されたチャンク（バッチ）ごとの行数。この値は `Chunk` および `RuntimeState` の `batch_size` の作成を制御し、オペレーターのスループット、オペレーターごとのメモリフットプリント、スピルおよびソートバッファのサイジング、I/Oヒューリスティックス（例：ORCライターの自然な書き込みサイズ）に影響します。これを増やすと、ワイド/CPUバウンドのワークロードでCPUおよびI/O効率が向上する可能性がありますが、ピークメモリ使用量が増加し、小規模な結果のクエリでレイテンシが増加する可能性があります。プロファイリングでバッチサイズがボトルネックであることが示された場合にのみ調整してください。それ以外の場合は、バランスの取れたメモリとパフォーマンスのためにデフォルトを維持してください。
- Introduced in: v3.2.0

### ロード

##### clear_transaction_task_worker_count

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: トランザクションをクリアするために使用されるスレッド数。
- Introduced in: -

##### column_mode_partial_update_insert_batch_size

- Default: 4096
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 挿入された行を処理する際の列モード部分更新のバッチサイズ。この項目が `0` 以下に設定されている場合、無限ループを避けるために `1` に制限されます。この項目は、各バッチで処理される新しく挿入された行の数を制御します。値を大きくすると書き込みパフォーマンスが向上しますが、より多くのメモリを消費します。
- Introduced in: v3.5.10, v4.0.2

##### enable_load_spill_parallel_merge

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 単一タブレット内での並列スピルマージを有効にするかどうかを指定します。これを有効にすると、データロード中のスピルマージのパフォーマンスを向上させることができます。
- Introduced in: -

##### enable_stream_load_verbose_log

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: Stream LoadジョブのHTTPリクエストとレスポンスをログに記録するかどうかを指定します。
- Introduced in: v2.5.17, v3.0.9, v3.1.6, v3.2.1

##### flush_thread_num_per_store

- Default: 2
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 各ストアでMemTableをフラッシュするために使用されるスレッド数。
- Introduced in: -

##### lake_flush_thread_num_per_store

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターの各ストアでMemTableをフラッシュするために使用されるスレッド数。
この値が `0` に設定されている場合、システムはCPUコア数の2倍の値を自動的に使用します。
この値が `0` 未満に設定されている場合、システムはその絶対値とCPUコア数の積を値として使用します。
- Introduced in: v3.1.12, 3.2.7

##### load_data_reserve_hours

- Default: 4
- Type: Int
- Unit: 時間
- Is mutable: いいえ
- Description: 小規模なロードによって生成されるファイルの予約時間。
- Introduced in: -

##### load_error_log_reserve_hours

- Default: 48
- Type: Int
- Unit: 時間
- Is mutable: はい
- Description: データロードログが予約される時間。
- Introduced in: -

##### load_process_max_memory_limit_bytes

- Default: 107374182400
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: BEノード上のすべてのロードプロセスが占有できるメモリリソースの最大サイズ制限。
- Introduced in: -

##### load_spill_memory_usage_per_merge

- Default: 1073741824
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: スピルマージ中のマージ操作ごとの最大メモリ使用量。デフォルトは1GB（1073741824バイト）。このパラメータは、データロードスピルマージ中の個々のマージタスクのメモリ消費を制御し、過剰なメモリ使用量を防止します。
- Introduced in: -

##### max_consumer_num_per_group

- Default: 3
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Routine Loadのコンシューマグループ内の最大コンシューマ数。
- Introduced in: -

##### max_runnings_transactions_per_txn_map

- Default: 100
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 各パーティションで同時に実行できるトランザクションの最大数。
- Introduced in: -

##### number_tablet_writer_threads

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Stream Load、Broker Load、Insertなどの取り込みで使用されるタブレットライタースレッドの数。パラメータが0以下に設定されている場合、システムはCPUコア数の半分（最小16）を使用します。パラメータが0より大きい場合、システムはその値を使用します。この設定はv3.1.7以降、動的に変更可能になりました。
- Introduced in: -

##### push_worker_count_high_priority

- Default: 3
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: HIGH優先度のロードタスクを処理するために使用されるスレッド数。
- Introduced in: -

##### push_worker_count_normal_priority

- Default: 3
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: NORMAL優先度のロードタスクを処理するために使用されるスレッド数。
- Introduced in: -

##### streaming_load_max_batch_size_mb

- Default: 100
- Type: Int
- Unit: MB
- Is mutable: はい
- Description: StarRocksにストリーミングできるJSONファイルの最大サイズ。
- Introduced in: -

##### streaming_load_max_mb

- Default: 102400
- Type: Int
- Unit: MB
- Is mutable: はい
- Description: StarRocksにストリーミングできるファイルの最大サイズ。v3.0以降、デフォルト値は `10240` から `102400` に変更されました。
- Introduced in: -

##### streaming_load_rpc_max_alive_time_sec

- Default: 1200
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: Stream LoadのRPCタイムアウト。
- Introduced in: -

##### transaction_publish_version_thread_pool_idle_time_ms

- Default: 60000
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: Publish Versionスレッドプールによってスレッドが再利用されるまでのアイドル時間。
- Introduced in: -

##### transaction_publish_version_worker_count

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: バージョンを公開するために使用されるスレッドの最大数。この値が `0` 以下に設定されている場合、インポートの同時実行性が高いのに固定スレッド数しか使用されない場合にスレッドリソースが不足するのを避けるため、システムはCPUコア数を値として使用します。v2.5以降、デフォルト値は `8` から `0` に変更されました。
- Introduced in: -

##### write_buffer_size

- Default: 104857600
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: メモリ内のMemTableのバッファサイズ。この構成項目はフラッシュをトリガーする閾値です。
- Introduced in: -

### ロードとアンロード

##### broker_write_timeout_seconds

- Default: 30
- Type: int
- Unit: 秒
- Is mutable: いいえ
- Description: バックエンドブローカー操作が書き込み/I/O RPCに使用するタイムアウト（秒単位）。この値は1000倍されてミリ秒単位のタイムアウトが生成され、`BrokerFileSystem` および `BrokerServiceConnection` インスタンス（例：ファイルエクスポートおよびスナップショットのアップロード/ダウンロード）へのデフォルトの `timeout_ms` として渡されます。ブローカーまたはネットワークが遅い場合、または大きなファイルを転送する場合に、この値を増やして早期タイムアウトを回避してください。値を減らすと、ブローカーRPCがより早く失敗する可能性があります。この値は `common/config` で定義されており、プロセス起動時に適用されます（動的にリロードできません）。
- Introduced in: v3.2.0

##### enable_load_channel_rpc_async

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 有効にすると、ロードチャネルオープンRPC（例：`PTabletWriterOpen`）の処理は、BRPCワーカーから専用のスレッドプールにオフロードされます。リクエストハンドラは `ChannelOpenTask` を作成し、`LoadChannelMgr::_open` をインラインで実行する代わりに、内部 `_async_rpc_pool` に送信します。これにより、BRPCスレッド内の作業とブロックが減少し、`load_channel_rpc_thread_pool_num` と `load_channel_rpc_thread_pool_queue_size` を介した同時実行性の調整が可能になります。スレッドプールへの送信が失敗した場合（プールがいっぱいであるかシャットダウンされた場合）、リクエストはキャンセルされ、エラー状態が返されます。プールは `LoadChannelMgr::close()` でシャットダウンされるため、リクエストの拒否や処理の遅延を避けるために、この機能を有効にする際の容量とライフサイクルを考慮してください。
- Introduced in: v3.5.0

##### enable_load_diagnose

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 有効にすると、StarRocksは、"[E1008]Reached timeout" と一致するbrpcタイムアウトの後、BE OlapTableSink/NodeChannelから自動ロード診断を試行します。コードは `PLoadDiagnoseRequest` を作成し、リモートのLoadChannelにRPCを送信してプロファイルおよび/またはスタックトレースを収集します（`load_diagnose_rpc_timeout_profile_threshold_ms` および `load_diagnose_rpc_timeout_stack_trace_threshold_ms` によって制御）。診断RPCは `load_diagnose_send_rpc_timeout_ms` をタイムアウトとして使用します。診断リクエストがすでに進行中の場合、診断はスキップされます。これを有効にすると、ターゲットノードで追加のRPCとプロファイリング作業が発生します。高感度のプロダクションワークロードでは、余分なオーバーヘッドを避けるために無効にしてください。
- Introduced in: v3.5.0

##### enable_load_segment_parallel

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: 有効にすると、rowsetセグメントのロードとrowsetレベルの読み取りは、StarRocksバックグラウンドスレッドプール（ExecEnv::load_segment_thread_poolとExecEnv::load_rowset_thread_pool）を使用して同時に実行されます。Rowset::load_segmentsとTabletReader::get_segment_iteratorsは、これらのプールにセグメントごとまたはrowsetごとのタスクを送信し、送信が失敗した場合はシリアルロードにフォールバックして警告をログに記録します。これを有効にすると、大規模なrowsetの読み取り/ロードレイテンシを削減できますが、CPU/IOの同時実行性とメモリ負荷が増加します。注：並列ロードはセグメントのロード完了順序を変更する可能性があるため、部分的な圧縮を妨げます（コードは `_parallel_load` をチェックし、有効な場合は部分圧縮を無効にします）。セグメント順序に依存する操作への影響を考慮してください。
- Introduced in: v3.3.0, v3.4.0, v3.5.0

##### enable_streaming_load_thread_pool

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: ストリーミングロードスキャナーが専用のストリーミングロードスレッドプールに送信されるかどうかを制御します。有効で、クエリが `TLoadJobType::STREAM_LOAD` のLOADである場合、ConnectorScanNodeはスキャナータスクを `streaming_load_thread_pool`（INT32_MAXスレッドとキューサイズで構成され、事実上無制限）に送信します。無効の場合、スキャナーは一般的な `thread_pool` とその `PriorityThreadPool` 送信ロジック（優先度計算、try_offer/offer動作）を使用します。これを有効にすると、ストリーミングロードの作業を通常のクエリ実行から隔離して干渉を減らすことができます。ただし、専用プールは事実上無制限であるため、有効にすると、大量のストリーミングロードトラフィックの下で同時スレッドとリソース使用量が増加する可能性があります。このオプションはデフォルトでオンになっており、通常は変更する必要はありません。
- Introduced in: v3.2.0

##### es_http_timeout_ms

- Default: 5000
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: ElasticsearchスクロールリクエストのためにESScanReaderのESネットワーククライアントが使用するHTTP接続タイムアウト（ミリ秒）。この値は `network_client.set_timeout_ms()` 経由で適用され、その後のスクロールPOSTを送信する前に適用され、クライアントがスクロール中にES応答を待機する時間を制御します。低速ネットワークまたは大規模なクエリの場合、早期タイムアウトを避けるためにこの値を増やしてください。応答しないESノードでより早く失敗するには、この値を減らしてください。この設定は `es_scroll_keepalive` を補完し、スクロールコンテキストのキープアライブ期間を制御します。
- Introduced in: v3.2.0

##### es_index_max_result_window

- Default: 10000
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: StarRocksがElasticsearchから単一バッチで要求するドキュメントの最大数を制限します。StarRocksは、ESリーダーの `KEY_BATCH_SIZE` を構築する際に、ESリクエストのバッチサイズを min(`es_index_max_result_window`, `chunk_size`) に設定します。ESリクエストがElasticsearchインデックス設定 `index.max_result_window` を超えると、ElasticsearchはHTTP 400（Bad Request）を返します。大規模なインデックスをスキャンする場合、この値を調整するか、Elasticsearch側でES `index.max_result_window` を増やして、より大きな単一リクエストを許可してください。
- Introduced in: v3.2.0

##### ignore_load_tablet_failure

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: この項目が `false`（デフォルト）に設定されている場合、システムはタブレットヘッダーのロード失敗（NotFoundおよびAlreadyExist以外のエラー）を致命的と見なします。コードはエラーをログに記録し、BEプロセスを停止するために `LOG(FATAL)` を呼び出します。`true` に設定されている場合、BEはこのようなタブレットごとのロードエラーにもかかわらず起動を続行します。失敗したタブレットIDは記録されスキップされ、成功したタブレットはロードされます。このパラメータは、RocksDBメタスキャン自体からの致命的なエラーを抑制しないことに注意してください。これは常にプロセスを終了させます。
- Introduced in: v3.2.0

##### load_channel_abort_clean_up_delay_seconds

- Default: 600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 中止されたロードチャネルのロードIDをシステムが `_aborted_load_channels` から削除するまでどれくらいの時間（秒単位）保持するかを制御します。ロードジョブがキャンセルまたは失敗した場合、ロードIDは記録されたままになるため、遅れて到着するロードRPCはすぐに拒否できます。遅延が期限切れになると、定期的なバックグラウンドスイープ中（最小スイープ間隔は60秒）にエントリはクリーンアップされます。遅延が低すぎると、中止後に迷子RPCを受け入れるリスクがあり、高すぎると、必要以上に状態を保持し、リソースを消費する可能性があります。中止されたロードの遅延リクエスト拒否の正確性とリソース保持のバランスを取るためにこれを調整してください。
- Introduced in: v3.5.11, v4.0.4

##### load_channel_rpc_thread_pool_num

- Default: -1
- Type: Int
- Unit: スレッド
- Is mutable: はい
- Description: ロードチャネルの非同期RPCスレッドプールの最大スレッド数。0以下（デフォルト `-1`）に設定されている場合、プールのサイズはCPUコア数（`CpuInfo::num_cores()`）に自動設定されます。設定された値はThreadPoolBuilderの最大スレッドとして使用され、プールの最小スレッドはmin(5, max_threads)に設定されます。プールキューサイズは `load_channel_rpc_thread_pool_queue_size` によって個別に制御されます。この設定は、非同期RPCプールサイズをbrpcワーカーのデフォルト（`brpc_num_threads`）と揃えるために導入され、ロードRPC処理を同期から非同期に切り替えた後も動作の互換性を維持します。実行時にこの設定を変更すると、`ExecEnv::GetInstance()->load_channel_mgr()->async_rpc_pool()->update_max_threads(...)` がトリガーされます。
- Introduced in: v3.5.0

##### load_channel_rpc_thread_pool_queue_size

- Default: 1024000
- Type: int
- Unit: 個
- Is mutable: いいえ
- Description: LoadChannelMgrによって作成されるロードチャネルRPCスレッドプールの保留中タスクの最大キューサイズを設定します。このスレッドプールは、`enable_load_channel_rpc_async` が有効な場合、非同期 `open` リクエストを実行します。プールのサイズは `load_channel_rpc_thread_pool_num` と対になります。大きなデフォルト値（1024000）は、同期処理から非同期処理への切り替え後も動作を維持するためにbrpcワーカーのデフォルトと一致しています。キューがいっぱいの場合、ThreadPool::submit() は失敗し、着信 `open` RPCはエラーでキャンセルされ、呼び出し元は拒否を受け取ります。この値を増やすと、より大きな同時 `open` リクエストのバーストをバッファリングできます。減らすと、バックプレッシャが厳しくなりますが、負荷がかかるとより多くの拒否が発生する可能性があります。
- Introduced in: v3.5.0

##### load_diagnose_rpc_timeout_profile_threshold_ms

- Default: 60000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: ロードRPCがタイムアウトし（エラーに "[E1008]Reached timeout" が含まれる）、`enable_load_diagnose` がtrueの場合、この閾値は完全なプロファイリング診断が要求されるかどうかを制御します。リクエストレベルのRPCタイムアウト `_rpc_timeout_ms` が `load_diagnose_rpc_timeout_profile_threshold_ms` より大きい場合、その診断に対してプロファイリングが有効になります。`_rpc_timeout_ms` が小さい値の場合、リアルタイム/短時間タイムアウトのロードに対して頻繁な重い診断を避けるため、プロファイリングは20タイムアウトごとに1回サンプリングされます。この値は送信される `PLoadDiagnoseRequest` の `profile` フラグに影響します。スタックトレースの動作は `load_diagnose_rpc_timeout_stack_trace_threshold_ms` によって個別に制御され、送信タイムアウトは `load_diagnose_send_rpc_timeout_ms` によって制御されます。
- Introduced in: v3.5.0

##### load_diagnose_rpc_timeout_stack_trace_threshold_ms

- Default: 600000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: 長時間実行されるロードRPCのリモートスタックトレースをいつ要求するかを決定するために使用される閾値（ミリ秒単位）。ロードRPCがタイムアウトエラーでタイムアウトし、実効RPCタイムアウト（_rpc_timeout_ms）がこの値を超えた場合、`OlapTableSink`/`NodeChannel` はターゲットBEに `load_diagnose` RPCを送信する際に `stack_trace=true` を含めます。これにより、BEはデバッグ用にスタックトレースを返すことができます。`LocalTabletsChannel::SecondaryReplicasWaiter` も、セカンダリレプリカの待機がこの間隔を超えた場合、プライマリからベストエフォートのスタックトレース診断をトリガーします。この動作には `enable_load_diagnose` が必要であり、診断RPCタイムアウトには `load_diagnose_send_rpc_timeout_ms` が使用されます。プロファイリングは `load_diagnose_rpc_timeout_profile_threshold_ms` によって個別に制御されます。この値を下げると、スタックトレースがより積極的に要求されるようになります。
- Introduced in: v3.5.0

##### load_diagnose_send_rpc_timeout_ms

- Default: 2000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: BEロードパスによって開始される診断関連のbrpc呼び出しに適用されるタイムアウト（ミリ秒単位）。`load_diagnose` RPC（LoadChannel brpc呼び出しがタイムアウトしたときにNodeChannel/OlapTableSinkによって送信される）およびレプリカステータスクエリ（SecondaryReplicasWaiter / LocalTabletsChannelがプライマリレプリカの状態をチェックするときに使用される）のコントローラタイムアウトを設定するために使用されます。リモート側がプロファイルまたはスタックトレースデータで応答するのに十分な高い値を選択しますが、障害処理が遅延しないように高すぎないようにしてください。このパラメータは `enable_load_diagnose`、`load_diagnose_rpc_timeout_profile_threshold_ms`、および `load_diagnose_rpc_timeout_stack_trace_threshold_ms` と連携して機能し、診断情報がいつ、何が要求されるかを制御します。
- Introduced in: v3.5.0

##### load_fp_brpc_timeout_ms

- Default: -1
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: `node_channel_set_brpc_timeout` フェイルポイントがトリガーされたときにOlapTableSinkによって使用されるチャネルごとのbrpc RPCタイムアウトを上書きします。正の値に設定されている場合、NodeChannelはその内部 `_rpc_timeout_ms` をこの値（ミリ秒単位）に設定し、open/add-chunk/cancel RPCがより短いタイムアウトを使用するようにします。これにより、"[E1008]Reached timeout" エラーを生成するbrpcタイムアウトのシミュレーションが可能になります。デフォルト（`-1`）は上書きを無効にします。この値の変更はテストおよび障害注入を目的としています。小さい値は偽のタイムアウトを生成し、ロード診断をトリガーする可能性があります（`enable_load_diagnose`、`load_diagnose_rpc_timeout_profile_threshold_ms`、`load_diagnose_rpc_timeout_stack_trace_threshold_ms`、および `load_diagnose_send_rpc_timeout_ms` を参照）。
- Introduced in: v3.5.0

##### load_fp_tablets_channel_add_chunk_block_ms

- Default: -1
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: 有効にすると（正のミリ秒値に設定すると）、このフェイルポイント設定により、`TabletsChannel::add_chunk` がロード処理中に指定された時間だけスリープします。これは、BRPCタイムアウトエラー（例："[E1008]Reached timeout"）をシミュレートし、ロードレイテンシを増加させるコストの高い `add_chunk` 操作をエミュレートするために使用されます。0以下の値（デフォルト `-1`）はインジェクションを無効にします。これは障害処理、タイムアウト、レプリカ同期動作のテストを目的としています。通常のプロダクションワークロードでは有効にしないでください。書き込み完了が遅延し、アップストリームのタイムアウトやレプリカの中止をトリガーする可能性があります。
- Introduced in: v3.5.0

##### load_segment_thread_pool_num_max

- Default: 128
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BEロード関連スレッドプールの最大ワーカースレッド数を設定します。この値はThreadPoolBuilderによって `exec_env.cpp` の `load_rowset_pool` と `load_segment_pool` の両方のスレッドを制限するために使用され、ストリーミングおよびバッチロード中のロードされたrowsetとセグメントの処理（例：デコード、インデックス作成、書き込み）の同時実行性を制御します。この値を増やすと並列処理が向上し、ロードスループットが向上する可能性がありますが、CPU、メモリ使用量、および潜在的な競合も増加します。減らすと同時ロード処理が制限され、スループットが低下する可能性があります。`load_segment_thread_pool_queue_size` と `streaming_load_thread_pool_idle_time_ms` と一緒に調整してください。変更にはBEの再起動が必要です。
- Introduced in: v3.3.0, v3.4.0, v3.5.0

##### load_segment_thread_pool_queue_size

- Default: 10240
- Type: Int
- Unit: タスク
- Is mutable: いいえ
- Description: 「load_rowset_pool」および「load_segment_pool」として作成されるロード関連スレッドプールの最大キュー長（保留中のタスク数）を設定します。これらのプールは `load_segment_thread_pool_num_max` を最大スレッド数として使用し、この設定はThreadPoolのオーバーフローポリシーが有効になる前にバッファリングできるロードセグメント/rowsetタスクの数を制御します（ThreadPoolの実装に応じて、その後の送信が拒否またはブロックされる可能性があります）。保留中のロード作業を増やすにはこの値を増やします（メモリ使用量が増加し、レイテンシが上昇する可能性があります）。バッファリングされたロードの同時実行性を制限し、メモリ使用量を減らすにはこの値を減らします。
- Introduced in: v3.3.0, v3.4.0, v3.5.0

##### max_pulsar_consumer_num_per_group

- Default: 10
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BEのルーチンロード用の単一データコンシューマグループで作成できるPulsarコンシューマの最大数を制御します。複数のトピックサブスクリプションでは累積的な確認応答がサポートされていないため、各コンシューマは正確に1つのトピック/パーティションをサブスクライブします。`pulsar_info->partitions` のパーティション数がこの値を超えると、グループ作成は失敗し、BEで `max_pulsar_consumer_num_per_group` を増やすか、BEを追加するようにエラーが通知されます。この制限は `PulsarDataConsumerGroup` の構築時に強制され、BEが1つのルーチンロードグループに対してこの数を超えるコンシューマをホストすることを防止します。Kafkaルーチンロードの場合、代わりに `max_consumer_num_per_group` が使用されます。
- Introduced in: v3.2.0

##### pull_load_task_dir

- Default: `${STARROCKS_HOME}/var/pull_load`
- Type: string
- Unit: -
- Is mutable: いいえ
- Description: BEが「プルロード」タスク（ダウンロードされたソースファイル、タスク状態、一時出力など）のデータと作業ファイルを保存するファイルシステムパス。ディレクトリはBEプロセスによって書き込み可能であり、着信ロードのための十分なディスクスペースが必要です。デフォルトはSTARROCKS_HOMEからの相対パスです。テストはこのディレクトリが存在することを期待して作成します（テスト構成を参照）。
- Introduced in: v3.2.0

##### routine_load_kafka_timeout_second

- Default: 10
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: Kafka関連のルーチンロード操作に使用されるタイムアウト（秒単位）。クライアントリクエストがタイムアウトを指定しない場合、`routine_load_kafka_timeout_second` が `get_info` のデフォルトRPCタイムアウト（ミリ秒に変換される）として使用されます。また、`librdkafka` コンシューマの呼び出しごとのコンシューマポーリングタイムアウトとしても使用されます（ミリ秒に変換され、残りのランタイムで上限が設定されます）。注：内部 `get_info` パスは、FE側のタイムアウト競合を避けるために、`librdkafka` に渡す前にこの値を80%に減らします。この値を、タイムリーな障害報告とネットワーク/ブローカー応答に十分な時間のバランスが取れるように設定してください。設定は変更できないため、変更には再起動が必要です。
- Introduced in: v3.2.0

##### routine_load_pulsar_timeout_second

- Default: 10
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: リクエストが明示的なタイムアウトを提供しない場合に、BEがPulsar関連のルーチンロード操作に使用するデフォルトのタイムアウト（秒単位）。具体的には、`PInternalServiceImplBase::get_pulsar_info` はこの値を1000倍して、Pulsarパーティションメタデータとバックログをフェッチするルーチンロードタスク実行メソッドに渡されるミリ秒単位のタイムアウトを形成します。応答の遅いPulsar応答を許可するために値を増やしますが、障害検出が長くなります。応答の遅いブローカーでより早く失敗するには値を減らします。Kafkaに使用される `routine_load_kafka_timeout_second` に類似しています。
- Introduced in: v3.2.0

##### streaming_load_thread_pool_idle_time_ms

- Default: 2000
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: ストリーミングロード関連スレッドプールのスレッドアイドルタイムアウト（ミリ秒単位）を設定します。この値は、`stream_load_io` プール、および `load_rowset_pool` と `load_segment_pool` のThreadPoolBuilderにアイドルタイムアウトとして渡されます。これらのプールのスレッドは、この期間アイドル状態が続くと再利用されます。値が低いほどアイドルリソースの使用量は減少しますが、スレッド作成のオーバーヘッドが増加します。値が高いほど、短時間のバーストの間はスレッドをアクティブに保ちますが、ベースラインのリソース使用量が増加します。`stream_load_io` プールは `enable_streaming_load_thread_pool` が有効な場合に使用されます。
- Introduced in: v3.2.0

##### streaming_load_thread_pool_num_min

- Default: 0
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: ExecEnv初期化中に作成されるストリーミングロードIOスレッドプール（"stream_load_io"）の最小スレッド数。プールは `set_max_threads(INT32_MAX)` と `set_max_queue_size(INT32_MAX)` で構築されるため、同時ストリーミングロードでのデッドロックを避けるために実質的に無制限です。値が0の場合、プールはスレッドなしで開始され、オンデマンドで増加します。正の値を設定すると、起動時にその数のスレッドが予約されます。このプールは `enable_streaming_load_thread_pool` がtrueの場合に使用され、そのアイドルタイムアウトは `streaming_load_thread_pool_idle_time_ms` によって制御されます。全体的な同時実行性は `fragment_pool_thread_num_max` と `webserver_num_workers` によって依然として制約されます。この値を変更する必要はめったになく、高すぎるとリソース使用量が増加する可能性があります。
- Introduced in: v3.2.0

### 統計レポート

##### enable_metric_calculator

- Default: true
- Type: boolean
- Unit: -
- Is mutable: いいえ
- Description: trueの場合、BEプロセスはバックグラウンドの「metrics_daemon」スレッド（非AppleプラットフォームでDaemon::initで開始）を起動し、約15秒ごとに `StarRocksMetrics::instance()->metrics()->trigger_hook()` を呼び出して、派生/システムメトリクス（例：push/queryバイト/秒、最大ディスクI/O使用率、最大ネットワーク送信/受信レート）を計算し、メモリ内訳をログに記録し、テーブルメトリクスのクリーンアップを実行します。falseの場合、これらのフックはメトリクス収集時に `MetricRegistry::collect` 内で同期的に実行され、メトリクススクレイプのレイテンシが増加する可能性があります。変更を有効にするにはプロセスの再起動が必要です。
- Introduced in: v3.2.0

##### enable_system_metrics

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: trueの場合、StarRocksは起動時にシステムレベルの監視を初期化します。設定されたストアパスからディスクデバイスを検出し、ネットワークインターフェースを列挙し、この情報をメトリクスサブシステムに渡してディスクI/O、ネットワークトラフィック、メモリ関連のシステムメトリクスの収集を有効にします。デバイスまたはインターフェースの検出に失敗した場合、初期化は警告をログに記録し、システムメトリクス設定を中止します。このフラグはシステムメトリクスが初期化されるかどうかのみを制御します。定期的なメトリクス集約スレッドは `enable_metric_calculator` によって個別に制御され、JVMメトリクス初期化は `enable_jvm_metrics` によって制御されます。この値を変更するには再起動が必要です。
- Introduced in: v3.2.0

##### profile_report_interval

- Default: 30
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ProfileReportWorkerが（1）LOADクエリのフラグメントごとのプロファイル情報をいつ報告するかを決定し、（2）報告サイクルの間にスリープする秒単位の間隔。ワーカーは、現在の時刻と各タスクの `last_report_time` を `(profile_report_interval * 1000) ms` を使用して比較し、非パイプラインおよびパイプラインのロードタスクの両方でプロファイルを再報告する必要があるかどうかを判断します。各ループでワーカーは現在の値（実行時に変更可能）を読み取ります。設定された値が0以下の場合、ワーカーは強制的に1に設定し、警告を出力します。この値を変更すると、次の報告決定とスリープ期間に影響します。
- Introduced in: v3.2.0

##### report_disk_state_interval_seconds

- Default: 60
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ストレージボリュームの状態（ボリューム内のデータのサイズを含む）を報告する時間間隔。
- Introduced in: -

##### report_resource_usage_interval_ms

- Default: 1000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: BEエージェントからFE（マスター）に送信される定期的なリソース使用量レポート間の間隔（ミリ秒単位）。エージェントのワーカースレッドはTResourceUsage（実行中のクエリ数、使用済み/制限メモリ、CPU使用率、リソースグループの使用量）を収集し、`report_task` を呼び出して、この設定された間隔（`task_worker_pool` を参照）だけスリープします。値が低いほど報告の適時性は向上しますが、CPU、ネットワーク、およびマスター負荷が増加します。値が高いほどオーバーヘッドは減少しますが、リソース情報が古くなります。報告は関連メトリクス（report_resource_usage_requests_total、report_resource_usage_requests_failed）を更新します。クラスターの規模とFE負荷に応じて調整してください。
- Introduced in: v3.2.0

##### report_tablet_interval_seconds

- Default: 60
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: すべてのタブレットの最新バージョンを報告する時間間隔。
- Introduced in: -

##### report_task_interval_seconds

- Default: 10
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: タスクの状態を報告する時間間隔。タスクには、テーブルの作成、テーブルの削除、データのロード、テーブルスキーマの変更などがあります。
- Introduced in: -

##### report_workgroup_interval_seconds

- Default: 5
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: すべてのワークグループの最新バージョンを報告する時間間隔。
- Introduced in: -

### ストレージ

##### alter_tablet_worker_count

- Default: 3
- Type: Int
- Unit: -
- Is mutable: はい
- Description: スキーマ変更に使用されるスレッド数。
- Introduced in: -

##### avro_ignore_union_type_tag

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: Avro Unionデータ型からシリアライズされたJSON文字列からタイプタグを削除するかどうか。
- Introduced in: v3.3.7, v3.4

##### base_compaction_check_interval_seconds

- Default: 60
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Base Compactionのスレッドポーリングの時間間隔。
- Introduced in: -

##### base_compaction_interval_seconds_since_last_operation

- Default: 86400
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 前回のBase Compactionからの時間間隔。この構成項目は、Base Compactionをトリガーする条件の1つです。
- Introduced in: -

##### base_compaction_num_threads_per_disk

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 各ストレージボリュームでBase Compactionに使用されるスレッド数。
- Introduced in: -

##### base_cumulative_delta_ratio

- Default: 0.3
- Type: Double
- Unit: -
- Is mutable: はい
- Description: 累積ファイルサイズとベースファイルサイズの比率。この比率に達することは、Base Compactionをトリガーする条件の1つです。
- Introduced in: -

##### chaos_test_enable_random_compaction_strategy

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: この項目が `true` に設定されている場合、`TabletUpdates::compaction()` はカオスエンジニアリングテストを目的としたランダムなコンパクション戦略（`compaction_random`）を使用します。このフラグは、タブレットのコンパクション選択中に通常の戦略（例：サイズ階層型コンパクション）の代わりに非決定論的/ランダムなポリシーに従うようにコンパクションを強制し、優先されます。これは制御されたテストのみを目的としており、有効にすると予測できないコンパクション順序、I/O/CPUの増加、およびテストの不安定性を引き起こす可能性があります。プロダクション環境では有効にしないでください。障害注入またはカオスエンジニアリングテストのシナリオでのみ使用してください。
- Introduced in: v3.3.12, 3.4.2, 3.5.0, 4.0.0

##### check_consistency_worker_count

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: タブレットの一貫性をチェックするために使用されるスレッド数。
- Introduced in: -

##### clear_expired_replication_snapshots_interval_seconds

- Default: 3600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: システムが異常なレプリケーションによって残された期限切れのスナップショットをクリアする時間間隔。
- Introduced in: v3.3.5

##### compact_threads

- Default: 4
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 同時コンパクションタスクに使用される最大スレッド数。この設定はv3.1.7およびv3.2.2以降、動的に変更可能になりました。
- Introduced in: v3.0.0

##### compaction_max_memory_limit

- Default: -1
- Type: Long
- Unit: バイト
- Is mutable: いいえ
- Description: このBE上のコンパクションタスクで利用可能なメモリのグローバルな上限（バイト単位）。BEの初期化中、最終的なコンパクションメモリ制限はmin(`compaction_max_memory_limit`, process_mem_limit * `compaction_max_memory_limit_percent` / 100) として計算されます。`compaction_max_memory_limit` が負の場合（デフォルト `-1`）、`mem_limit` から導出されたBEプロセスメモリ制限にフォールバックします。パーセント値は [0,100] にクランプされます。プロセスメモリ制限が設定されていない場合（負の場合）、コンパクションメモリは無制限のままです（`-1`）。この計算された値は `_compaction_mem_tracker` の初期化に使用されます。`compaction_max_memory_limit_percent` および `compaction_memory_limit_per_worker` も参照してください。
- Introduced in: v3.2.0

##### compaction_max_memory_limit_percent

- Default: 100
- Type: Int
- Unit: パーセント
- Is mutable: いいえ
- Description: コンパクションに使用できるBEプロセスメモリの割合。BEは、`compaction_max_memory_limit` と (プロセスメモリ制限 × このパーセンテージ / 100) の最小値としてコンパクションメモリ上限を計算します。この値が0未満または100より大きい場合、100として扱われます。`compaction_max_memory_limit` < 0 の場合、代わりにプロセスメモリ制限が使用されます。計算では、`mem_limit` から導出されたBEプロセスメモリも考慮されます。`compaction_memory_limit_per_worker` (ワーカごとの上限) と組み合わせて、この設定は利用可能な合計コンパクションメモリを制御し、したがってコンパクションの同時実行性とOOMリスクに影響します。
- Introduced in: v3.2.0

##### compaction_memory_limit_per_worker

- Default: 2147483648
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: 各コンパクションスレッドに許可される最大メモリサイズ。
- Introduced in: -

##### compaction_trace_threshold

- Default: 60
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 各コンパクションのタイム閾値。コンパクションがこのタイム閾値よりも長くかかった場合、StarRocksは対応するトレースを出力します。
- Introduced in: -

##### create_tablet_worker_count

- Default: 3
- Type: Int
- Unit: スレッド
- Is mutable: はい
- Description: FEによって送信されたTTaskType::CREATE（タブレット作成）タスクを処理するAgentServerスレッドプール内のワーカースレッドの最大数を設定します。BE起動時、この値はスレッドプールの最大値として使用され（プールは最小スレッド数=1、最大キューサイズ=無制限で作成されます）、実行時に変更すると、`ExecEnv::agent_server()->get_thread_pool(TTaskType::CREATE)->update_max_threads(...)` がトリガーされます。同時タブレット作成スループットを向上させるには（大量ロードやパーティション作成時に便利）この値を増やし、同時作成操作を抑制するにはこの値を減らします。値を上げるとCPU、メモリ、I/Oの同時実行性が増加し、競合を引き起こす可能性があります。スレッドプールは少なくとも1つのスレッドを強制するため、1未満の値は実質的な効果はありません。
- Introduced in: v3.2.0

##### cumulative_compaction_check_interval_seconds

- Default: 1
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Cumulative Compactionのスレッドポーリングの時間間隔。
- Introduced in: -

##### cumulative_compaction_num_threads_per_disk

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: ディスクごとのCumulative Compactionスレッド数。
- Introduced in: -

##### data_page_size

- Default: 65536
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: 列データとインデックスページを構築する際に使用されるターゲットの非圧縮ページサイズ（バイト単位）。この値は `ColumnWriterOptions.data_page_size` と `IndexedColumnWriterOptions.index_page_size` にコピーされ、ページビルダー（例：`BinaryPlainPageBuilder::is_page_full` とバッファ予約ロジック）によって、ページの完了時期と予約するメモリ量を決定するために参照されます。値が0の場合、ビルダーのページサイズ制限が無効になります。この値を変更すると、ページ数、メタデータオーバーヘッド、メモリ予約、I/O/圧縮のトレードオフ（ページが小さいほどページとメタデータが増加し、ページが大きいほどページは減少し、圧縮は向上する可能性がありますが、メモリの急増が発生する可能性があります）に影響します。
- Introduced in: v3.2.4

##### default_num_rows_per_column_file_block

- Default: 1024
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 各行ブロックに格納できる最大行数。
- Introduced in: -

##### delete_worker_count_high_priority

- Default: 1
- Type: Int
- Unit: スレッド
- Is mutable: いいえ
- Description: DeleteTaskWorkerPool内のワーカースレッドのうち、HIGH優先度削除スレッドとして割り当てられるスレッド数。起動時にAgentServerは、`total threads = delete_worker_count_normal_priority + delete_worker_count_high_priority` で削除プールを作成します。最初の `delete_worker_count_high_priority` スレッドは、`TPriority::HIGH` タスクを排他的にポップしようとするようにマークされます（高優先度削除タスクをポーリングし、利用可能なものがない場合はスリープ/ループします）。この値を増やすと、高優先度削除リクエストの同時実行性が向上します。減らすと、専用容量が減少し、高優先度削除のレイテンシが増加する可能性があります。
- Introduced in: v3.2.0

##### dictionary_encoding_ratio

- Default: 0.7
- Type: Double
- Unit: -
- Is mutable: いいえ
- Description: `StringColumnWriter` がチャンクの辞書（DICT_ENCODING）とプレーン（PLAIN_ENCODING）エンコーディングを決定するエンコード推測フェーズで使用する割合（0.0〜1.0）。コードは `max_card = row_count * dictionary_encoding_ratio` を計算し、チャンクの異なるキー数をスキャンします。異なるキー数が `max_card` を超える場合、ライターは `PLAIN_ENCODING` を選択します。このチェックは、チャンクサイズが `dictionary_speculate_min_chunk_size` を超えた場合（および `row_count > dictionary_min_rowcount` の場合）にのみ実行されます。値を高く設定すると辞書エンコーディングが優先されます（より多くの異なるキーを許容します）。値を低く設定すると、より早くプレーンエンコーディングにフォールバックします。値1.0は事実上辞書エンコーディングを強制します（異なるキー数が `row_count` を超えることはありません）。
- Introduced in: v3.2.0

##### dictionary_encoding_ratio_for_non_string_column

- Default: 0
- Type: double
- Unit: -
- Is mutable: いいえ
- Description: 非文字列列（数値、日付/時刻、DECIMAL型）に辞書エンコーディングを使用するかどうかを決定する比率閾値。有効な場合（値 > 0.0001）、ライターは `max_card = row_count * dictionary_encoding_ratio_for_non_string_column` を計算し、`row_count > dictionary_min_rowcount` のサンプルでは、`distinct_count ≤ max_card` の場合にのみ `DICT_ENCODING` を選択します。それ以外の場合は `BIT_SHUFFLE` にフォールバックします。値 `0`（デフォルト）は非文字列の辞書エンコーディングを無効にします。このパラメータは `dictionary_encoding_ratio` と類似していますが、非文字列列に適用されます。(0,1] の値を使用してください。値が小さいほど辞書エンコーディングはカーディナリティの低い列に制限され、辞書メモリ/I/Oオーバーヘッドが減少します。
- Introduced in: v3.3.0, v3.4.0, v3.5.0

##### dictionary_page_size

- Default: 1048576
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: rowsetセグメントを構築する際に使用される辞書ページのバイト単位のサイズ。この値はBE rowsetコードの `PageBuilderOptions::dict_page_size` に読み込まれ、単一の辞書ページに格納できる辞書エントリの数を制御します。この値を増やすと、より大きな辞書を許可することで辞書エンコードされた列の圧縮率が向上する可能性がありますが、ページが大きくなると書き込み/エンコード中に消費されるメモリが増加し、ページの読み取りやマテリアライズ時にI/Oとレイテンシが増加する可能性があります。大規模メモリ、書き込み頻度の高いワークロードの場合、保守的に設定し、実行時パフォーマンスの低下を防ぐために過度に大きな値を避けてください。
- Introduced in: v3.3.0, v3.4.0, v3.5.0

##### disk_stat_monitor_interval

- Default: 5
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ディスクの健全性ステータスを監視する時間間隔。
- Introduced in: -

##### download_low_speed_limit_kbps

- Default: 50
- Type: Int
- Unit: KB/秒
- Is mutable: はい
- Description: 各HTTPリクエストのダウンロード速度の下限。HTTPリクエストは、`download_low_speed_time` で指定された時間内にこの値よりも低い速度で継続的に実行された場合、中断されます。
- Introduced in: -

##### download_low_speed_time

- Default: 300
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: HTTPリクエストが制限よりも低いダウンロード速度で実行できる最大時間。HTTPリクエストは、この構成項目で指定された時間内に `download_low_speed_limit_kbps` の値よりも低い速度で継続的に実行された場合、中断されます。
- Introduced in: -

##### download_worker_count

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BEノード上のリストアジョブのダウンロードタスクの最大スレッド数。`0` は、BEが稼働しているマシンのCPUコア数に値を設定することを示します。
- Introduced in: -

##### drop_tablet_worker_count

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: タブレットを削除するために使用されるスレッド数。`0` はノード内のCPUコアの半分を示します。
- Introduced in: -

##### enable_check_string_lengths

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: ロード中にデータ長をチェックして、VARCHARデータが範囲外であることによる圧縮失敗を解決するかどうか。
- Introduced in: -

##### enable_event_based_compaction_framework

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: イベントベースのコンパクションフレームワークを有効にするかどうか。`true` はイベントベースのコンパクションフレームワークが有効であることを示し、`false` は無効であることを示します。イベントベースのコンパクションフレームワークを有効にすると、多くのタブレットがあるシナリオや単一タブレットが大量のデータを持つシナリオで、コンパクションのオーバーヘッドを大幅に削減できます。
- Introduced in: -

##### enable_lazy_delta_column_compaction

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 有効にすると、コンパクションは部分列更新によって生成されたデルタ列に対して「遅延」戦略を優先します。StarRocksは、コンパクションI/Oを節約するために、デルタ列ファイルをメインセグメントファイルに積極的にマージすることを避けます。実際には、コンパクション選択コードは部分列更新rowsetと複数の候補をチェックします。これらが見つかり、このフラグがtrueの場合、エンジンはコンパクションへの追加入力を停止するか、空のrowset（レベル-1）のみをマージし、デルタ列を分離したままにします。これにより、コンパクション中の即時I/OとCPUが削減されますが、統合が遅延する（セグメントと一時ストレージオーバーヘッドが増加する可能性）コストがかかります。正確性とクエリのセマンティクスは変更されません。
- Introduced in: v3.2.3

##### enable_new_load_on_memory_limit_exceeded

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: ハードメモリリソース制限に達したときに新しいロードプロセスを許可するかどうか。`true` は新しいロードプロセスが許可されることを示し、`false` は拒否されることを示します。
- Introduced in: v3.3.2

##### enable_pk_index_parallel_compaction

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターでプライマリキーインデックスの並列コンパクションを有効にするかどうか。
- Introduced in: -

##### enable_pk_index_parallel_execution

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターでプライマリキーインデックス操作の並列実行を有効にするかどうか。有効にすると、システムはスレッドプールを使用して公開操作中にセグメントを並行して処理し、大規模なタブレットのパフォーマンスを大幅に向上させます。
- Introduced in: -

##### enable_pk_index_eager_build

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: データインポートおよびコンパクションフェーズ中にプライマリキーインデックスファイルを積極的に構築するかどうか。有効にすると、システムはデータ書き込み中に永続PKインデックスファイルを即座に生成し、その後のクエリパフォーマンスを向上させます。
- Introduced in: -

##### enable_pk_size_tiered_compaction_strategy

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: プライマリキーテーブルのサイズ階層型コンパクションポリシーを有効にするかどうか。`true` はサイズ階層型コンパクション戦略が有効であることを示し、`false` は無効であることを示します。
- Introduced in: この項目はv3.2.4およびv3.1.10以降の共有データクラスター、およびv3.2.5およびv3.1.10以降の共有なしクラスターで有効になります。

##### enable_rowset_verify

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 生成されたrowsetの正しさを検証するかどうか。有効にすると、コンパクションとスキーマ変更後に生成されたrowsetの正しさがチェックされます。
- Introduced in: -

##### enable_size_tiered_compaction_strategy

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: サイズ階層型コンパクションポリシー（プライマリキーテーブルを除く）を有効にするかどうか。`true` はサイズ階層型コンパクション戦略が有効であることを示し、`false` は無効であることを示します。
- Introduced in: -

##### enable_strict_delvec_crc_check

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: `enable_strict_delvec_crc_check` がtrueに設定されている場合、削除ベクターに対して厳密なCRC32チェックを実行し、不一致が検出された場合は失敗を返します。
- Introduced in: -

##### enable_transparent_data_encryption

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: 有効にすると、StarRocksは新しく書き込まれたストレージオブジェクト（セグメントファイル、削除/更新ファイル、rowsetセグメント、lake SSTs、永続インデックスファイルなど）に対して暗号化されたディスク上のアーティファクトを作成します。ライター（RowsetWriter/SegmentWriter、lake UpdateManager/LakePersistentIndexおよび関連コードパス）はKeyCacheから暗号化情報を要求し、`encryption_info` を書き込み可能ファイルにアタッチし、`encryption_meta` をrowset / セグメント / sstableメタデータ（`segment_encryption_metas`、削除/更新暗号化メタデータ）に永続化します。フロントエンドとバックエンド/CNの暗号化フラグは一致している必要があります。不一致の場合、BEはハートビートで中止します（`LOG(FATAL)`）。このフラグは実行時に変更できません。デプロイ前に有効にし、キー管理（KEK）とKeyCacheがクラスター全体で適切に構成され、同期されていることを確認してください。
- Introduced in: v3.3.1, 3.4.0, 3.5.0, 4.0.0

##### enable_zero_copy_from_page_cache

- Default: true
- Type: boolean
- Unit: -
- Is mutable: はい
- Description: 有効にすると、`FixedLengthColumnBase` はページキャッシュによってサポートされるバッファから発生するデータを追加する際にバイトコピーを避けることができます。`append_numbers` では、すべての条件が満たされている場合（設定がtrueである、入力リソースが所有されている、リソースメモリが列の要素タイプにアラインされている、列が空である、リソース長が要素サイズの倍数である）、コードは入力 `ContainerResource` を取得し、列の内部リソースポインタ（ゼロコピー）を設定します。これを有効にすると、CPUとメモリコピーのオーバーヘッドが削減され、取り込み/スループットが向上する可能性があります。欠点としては、列の寿命が取得されたバッファと結合され、正しい所有権/アラインメントに依存することです。安全なコピーを強制するには無効にしてください。
- Introduced in: -

##### file_descriptor_cache_clean_interval

- Default: 3600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 一定期間使用されていないファイルディスクリプタをクリーンアップする時間間隔。
- Introduced in: -

##### ignore_broken_disk

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: 設定されたストレージパスが読み取り/書き込みチェックに失敗したり、解析に失敗したりした場合の起動動作を制御します。`false`（デフォルト）の場合、BEは `storage_root_path` または `spill_local_storage_dir` 内の破損したエントリを致命的と見なし、起動を中止します。`true` の場合、StarRocksは `check_datapath_rw` に失敗したり、解析に失敗したりしたストレージパスをスキップ（警告をログに記録して削除）し、BEは残りの健全なパスで起動を続行できます。注：設定されたすべてのパスが削除された場合でも、BEは終了します。これを有効にすると、構成ミスまたは故障したディスクを隠蔽し、無視されたパス上のデータが利用できなくなる可能性があります。ログとディスクの状態を適切に監視してください。
- Introduced in: v3.2.0

##### inc_rowset_expired_sec

- Default: 1800
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 着信データの有効期限。この構成項目は増分クローンで使用されます。
- Introduced in: -

##### load_process_max_memory_hard_limit_ratio

- Default: 2
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BEノード上のすべてのロードプロセスが占有できるメモリリソースのハードリミット（比率）。`enable_new_load_on_memory_limit_exceeded` が `false` に設定されており、すべてのロードプロセスのメモリ消費が `load_process_max_memory_limit_percent * load_process_max_memory_hard_limit_ratio` を超えた場合、新しいロードプロセスは拒否されます。
- Introduced in: v3.3.2

##### load_process_max_memory_limit_percent

- Default: 30
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BEノード上のすべてのロードプロセスが占有できるメモリリソースのソフトリミット（パーセンテージ）。
- Introduced in: -

##### lz4_acceleration

- Default: 1
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 内蔵LZ4コンプレッサによって使用されるLZ4「アクセラレーション」パラメータを制御します（`LZ4_compress_fast_continue` に渡されます）。値が高いほど圧縮速度が優先され、圧縮率が犠牲になります。値が低いほど（1）より良い圧縮を生成しますが、遅くなります。有効範囲：MIN=1、MAX=65537。この設定は、BlockCompression内のすべてのLZ4ベースのコーデック（例：LZ4およびHadoop-LZ4）に影響し、圧縮方法のみを変更します。LZ4形式や解凍の互換性は変更しません。CPUバウンドまたは低遅延のワークロードで、より大きな出力が許容できる場合は上向きに（例：4、8など）調整してください。ストレージまたはI/Oに敏感なワークロードの場合は1に保ってください。スループット対サイズのトレードオフはデータに大きく依存するため、変更する前に代表的なデータでテストしてください。
- Introduced in: v3.4.1, 3.5.0, 4.0.0

##### lz4_expected_compression_ratio

- Default: 2.1
- Type: double
- Unit: 無次元 (圧縮率)
- Is mutable: はい
- Description: シリアライゼーション圧縮戦略が観測されたLZ4圧縮が「良好」であるかどうかを判断する際に使用する閾値。`compress_strategy.cpp` では、この値が `lz4_expected_compression_speed_mbps` と共に報酬メトリクスを計算する際に観測された `compress_ratio` を分割します。結合された報酬が1.0より大きい場合、戦略は肯定的なフィードバックを記録します。この値を増やすと、期待される圧縮率が高くなり（条件を満たすのが難しくなる）、減らすと、観測された圧縮が満足できると見なされやすくなります。典型的なデータの圧縮率に合わせるように調整してください。有効範囲：MIN=1、MAX=65537。
- Introduced in: v3.4.1, 3.5.0, 4.0.0

##### lz4_expected_compression_speed_mbps

- Default: 600
- Type: double
- Unit: MB/秒
- Is mutable: はい
- Description: 適応圧縮ポリシー (CompressStrategy) で使用されるメガバイト/秒単位の期待されるLZ4圧縮スループット。フィードバックルーチンは `reward_ratio = (observed_compression_ratio / lz4_expected_compression_ratio) * (observed_speed / lz4_expected_compression_speed_mbps)` を計算します。`reward_ratio` が1.0より大きい場合、正のカウンタ (alpha) がインクリメントされ、そうでない場合は負のカウンタ (beta) がインクリメントされます。これは、将来のデータが圧縮されるかどうかに影響します。この値をハードウェアでの典型的なLZ4スループットを反映するように調整してください。値を上げると、ポリシーが実行を「良好」と分類するのが難しくなり (より高い観測速度が必要)、下げると分類が容易になります。正の有限数である必要があります。
- Introduced in: v3.4.1, 3.5.0, 4.0.0

##### make_snapshot_worker_count

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BEノード上のスナップショット作成タスクの最大スレッド数。
- Introduced in: -

##### manual_compaction_threads

- Default: 4
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: Manual Compactionのスレッド数。
- Introduced in: -

##### max_base_compaction_num_singleton_deltas

- Default: 100
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 各Base Compactionで圧縮できるセグメントの最大数。
- Introduced in: -

##### max_compaction_candidate_num

- Default: 40960
- Type: Int
- Unit: -
- Is mutable: はい
- Description: コンパクションの候補タブレットの最大数。値が大きすぎると、高いメモリ使用量と高いCPU負荷を引き起こします。
- Introduced in: -

##### max_compaction_concurrency

- Default: -1
- Type: Int
- Unit: -
- Is mutable: はい
- Description: コンパクション（Base CompactionとCumulative Compactionの両方を含む）の最大同時実行性。値 `-1` は同時実行性に制限がないことを示します。`0` はコンパクションを無効にすることを示します。イベントベースのコンパクションフレームワークが有効な場合、このパラメータは変更可能です。
- Introduced in: -

##### max_cumulative_compaction_num_singleton_deltas

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 単一のCumulative Compactionでマージできるセグメントの最大数。コンパクション中にOOMが発生した場合、この値を減らすことができます。
- Introduced in: -

##### max_download_speed_kbps

- Default: 50000
- Type: Int
- Unit: KB/秒
- Is mutable: はい
- Description: 各HTTPリクエストの最大ダウンロード速度。この値はBEノード間のデータレプリカ同期のパフォーマンスに影響します。
- Introduced in: -

##### max_garbage_sweep_interval

- Default: 3600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ストレージボリュームのガベージコレクションの最大時間間隔。この設定はv3.0以降、動的に変更可能になりました。
- Introduced in: -

##### max_percentage_of_error_disk

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 対応するBEノードが終了する前に、ストレージボリュームで許容できるエラーディスクの最大割合。
- Introduced in: -

##### max_queueing_memtable_per_tablet

- Default: 2
- Type: Long
- Unit: 個
- Is mutable: はい
- Description: 書き込みパスのタブレットごとのバックプレッシャを制御します。タブレットのキューイング（まだフラッシュされていない）memtableの数が `max_queueing_memtable_per_tablet` に達するかそれを超えると、`LocalTabletsChannel` および `LakeTabletsChannel` のライターは、より多くの書き込み作業を送信する前にブロック（スリープ/再試行）します。これにより、同時memtableフラッシュの同時実行性とピークメモリ使用量が減少しますが、大量の負荷がかかるとレイテンシやRPCタイムアウトが増加するコストがかかります。より多くの同時memtableを許可するには（メモリとI/Oバーストが増加）、この値を高く設定します。メモリ負荷を制限し、書き込みスロットリングを増やすには、この値を低く設定します。
- Introduced in: v3.2.0

##### max_row_source_mask_memory_bytes

- Default: 209715200
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: 行ソースマスクバッファの最大メモリサイズ。バッファがこの値より大きい場合、データはディスク上の一時ファイルに永続化されます。この値は `compaction_memory_limit_per_worker` の値よりも低く設定する必要があります。
- Introduced in: -

##### max_tablet_write_chunk_bytes

- Default: 536870912
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: 現在のインメモリタブレット書き込みチャンクの最大許容メモリ（バイト単位）。この値を超えると、チャンクは満杯と見なされ、送信キューに入れられます。この値を増やすと、ワイドテーブル（多くの列）をロードする際のRPCの頻度を減らすことができ、これによりスループットが向上する可能性がありますが、メモリ使用量とRPCペイロードが大きくなります。RPCの削減とメモリおよびシリアライズ/BRPCの制限のバランスをとるように調整してください。
- Introduced in: v3.2.12

##### max_update_compaction_num_singleton_deltas

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーテーブルの単一のコンパクションでマージできるrowsetの最大数。
- Introduced in: -

##### memory_limitation_per_thread_for_schema_change

- Default: 2
- Type: Int
- Unit: GB
- Is mutable: はい
- Description: 各スキーマ変更タスクに許可される最大メモリサイズ。
- Introduced in: -

##### memory_ratio_for_sorting_schema_change

- Default: 0.8
- Type: Double
- Unit: - (単位なし比率)
- Is mutable: はい
- Description: スキーマ変更ソート操作中のメンテーブルの最大バッファサイズとして使用されるスレッドごとのスキーマ変更メモリ制限の割合。この比率は `memory_limitation_per_thread_for_schema_change` (GBで設定され、バイトに変換される) に乗算されて `max_buffer_size` が計算され、その結果は4GBで上限が設定されます。`SchemaChangeWithSorting` および `SortedSchemaChange` が `MemTable/DeltaWriter` を作成するときに使用されます。この比率を上げると、より大きなインメモリバッファが許可されます（フラッシュ/マージが減少）が、メモリ負荷のリスクが高まります。減らすと、より頻繁なフラッシュとより高いI/O/マージオーバーヘッドが発生します。
- Introduced in: v3.2.0

##### min_base_compaction_num_singleton_deltas

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Base Compactionをトリガーする最小セグメント数。
- Introduced in: -

##### min_compaction_failure_interval_sec

- Default: 120
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 以前のコンパクション失敗からタブレットコンパクションをスケジュールできる最小時間間隔。
- Introduced in: -

##### min_cumulative_compaction_failure_interval_sec

- Default: 30
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 失敗時にCumulative Compactionが再試行する最小時間間隔。
- Introduced in: -

##### min_cumulative_compaction_num_singleton_deltas

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Cumulative Compactionをトリガーする最小セグメント数。
- Introduced in: -

##### min_garbage_sweep_interval

- Default: 180
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ストレージボリュームのガベージコレクションの最小時間間隔。この設定はv3.0以降、動的に変更可能になりました。
- Introduced in: -

##### parallel_clone_task_per_path

- Default: 8
- Type: Int
- Unit: スレッド
- Is mutable: はい
- Description: BE上のストレージパスごとに割り当てられる並列クローンワーカースレッドの数。BE起動時、クローンスレッドプールの最大スレッド数はmax(`number_of_store_paths` * `parallel_clone_task_per_path`, MIN_CLONE_TASK_THREADS_IN_POOL) として計算されます。例えば、4つのストレージパスとデフォルト=8の場合、クローンプール最大値は32です。この設定は、BEによって処理されるCLONEタスク（タブレットレプリカコピー）の同時実行性を直接制御します。これを増やすと、並列クローンのスループットが向上しますが、CPU、ディスク、ネットワークの競合も増加します。減らすと、同時クローンタスクが制限され、FEスケジュールされたクローン操作が抑制される可能性があります。この値は動的クローンスレッドプールに適用され、update-config HTTPアクションを介して実行時に変更できます（agent_serverがクローンプールの最大スレッドを更新するようにします）。
- Introduced in: v3.2.0

##### partial_update_memory_limit_per_worker

- Default: 2147483648
- Type: long
- Unit: バイト
- Is mutable: はい
- Description: 部分列更新（コンパクション/rowset更新処理で使用）を実行する際に、単一のワーカーがソースチャンクを組み立てるために使用できる最大メモリ（バイト単位）。リーダーは行ごとの更新メモリ（total_update_row_size / num_rows_upt）を推定し、それを読み取られた行数に乗算します。その積がこの制限を超えると、現在のチャンクはフラッシュされ、追加のメモリ増加を避けるために処理されます。これを、更新ワーカーごとに利用可能なメモリに合わせて設定してください。低すぎるとI/O/処理オーバーヘッドが増加し（多くの小さなチャンク）、高すぎるとメモリ負荷やOOMのリスクが高まります。行ごとの推定値がゼロの場合（レガシーrowset）、この設定はバイトベースの制限を課しません（INT32_MAX行数制限のみが適用されます）。
- Introduced in: v3.2.10

##### path_gc_check

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: 有効にすると、StorageEngineはデータディレクトリごとのバックグラウンドスレッドを起動し、定期的なパススキャンとガベージコレクションを実行します。起動時に `start_bg_threads()` は `_path_scan_thread_callback`（`DataDir::perform_path_scan` と `perform_tmp_path_scan` を呼び出す）と `_path_gc_thread_callback`（`DataDir::perform_path_gc_by_tablet`、`DataDir::perform_path_gc_by_rowsetid`、`DataDir::perform_delta_column_files_gc`、および `DataDir::perform_crm_gc` を呼び出す）を生成します。スキャンとGCの間隔は `path_scan_interval_second` と `path_gc_check_interval_second` によって制御されます。CRMファイルのクリーンアップは `unused_crm_file_threshold_second` を使用します。自動パスレベルのクリーンアップを防ぐにはこれを無効にしてください（その場合、孤立した/一時ファイルを手動で管理する必要があります）。このフラグを変更するにはプロセスの再起動が必要です。
- Introduced in: v3.2.0

##### path_gc_check_interval_second

- Default: 86400
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: ストレージエンジンのパスガベージコレクションバックグラウンドスレッドの実行間隔（秒単位）。各ウェイクアップは、DataDirがタブレットごと、rowset IDごと、デルタ列ファイルGC、およびCRM GCによってパスGCを実行することをトリガーします（CRM GC呼び出しは `unused_crm_file_threshold_second` を使用します）。非正の値に設定されている場合、コードは強制的に間隔を1800秒（30分）に設定し、警告を出力します。オンディスクの一時ファイルまたはダウンロードされたファイルがスキャンおよび削除される頻度を制御するためにこれを調整してください。
- Introduced in: v3.2.0

##### pending_data_expire_time_sec

- Default: 1800
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ストレージエンジン内の保留データの有効期限。
- Introduced in: -

##### pindex_major_compaction_limit_per_disk

- Default: 1
- Type: Int
- Unit: -
- Is mutable: はい
- Description: ディスクごとのコンパクションの最大同時実行性。これにより、コンパクションによるディスク間のI/Oの不均一性の問題に対処します。この問題は、特定のディスクでI/Oが過度に高くなる原因となる可能性があります。
- Introduced in: v3.0.9

##### pk_index_compaction_score_ratio

- Default: 1.5
- Type: Double
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックスのコンパクションスコア比率。例えば、N個のファイルセットがある場合、コンパクションスコアは `N * pk_index_compaction_score_ratio` となります。
- Introduced in: -

##### pk_index_early_sst_compaction_threshold

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックスの早期SSTコンパクション閾値。
- Introduced in: -

##### pk_index_map_shard_size

- Default: 4096
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: lake UpdateManagerのプライマリキーインデックスシャードマップで使用されるシャード数。UpdateManagerは、このサイズの `PkIndexShard` ベクトルを割り当て、ビットマスクを介してタブレットIDをシャードにマップします。この値を増やすと、そうでなければ同じシャードを共有するタブレット間のロック競合が減少しますが、その代償としてより多くのミューテックスオブジェクトとわずかに高いメモリ使用量が発生します。コードがビットマスクインデックスに依存しているため、値は2の累乗である必要があります。サイジングのガイダンスについては、`tablet_map_shard_size` ヒューリスティック `total_num_of_tablets_in_BE / 512` を参照してください。
- Introduced in: v3.2.0

##### pk_index_memtable_flush_threadpool_max_threads

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックスMemTableフラッシュ用スレッドプールの最大スレッド数。`0` はCPUコア数の半分に自動設定されることを意味します。
- Introduced in: -

##### pk_index_memtable_flush_threadpool_size

- Default: 1048576
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データ（クラウドネイティブ/lake）モードで使用されるプライマリキーインデックスmemtableフラッシュスレッドプールの最大キューサイズ（保留中のタスク数）を制御します。スレッドプールはExecEnvで「cloud_native_pk_index_flush」として作成されます。その最大スレッド数は `pk_index_memtable_flush_threadpool_max_threads` によって制御されます。この値を増やすと、実行前にmemtableフラッシュタスクをより多くバッファリングできます。これにより、即時のバックプレッシャは減少しますが、キューに入れられたタスクオブジェクトによって消費されるメモリが増加します。減らすと、バッファリングされたタスクが制限され、スレッドプール動作に応じて、より早いバックプレッシャまたはタスク拒否が発生する可能性があります。利用可能なメモリと予想される同時フラッシュワークロードに応じて調整してください。
- Introduced in: -

##### pk_index_memtable_max_count

- Default: 2
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックスのMemTablesの最大数。
- Introduced in: -

##### pk_index_memtable_max_wait_flush_timeout_ms

- Default: 30000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックスMemTableフラッシュ完了待機時間の上限。すべてのMemTablesを同期的にフラッシュする場合（例えば、SST操作の取り込み前）、システムはこのタイムアウトまで待機します。デフォルトは30秒です。
- Introduced in: -

##### pk_index_parallel_compaction_task_split_threshold_bytes

- Default: 33554432
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: プライマリキーインデックスコンパクションタスクの分割閾値。タスクに関与するファイルの合計サイズがこの閾値よりも小さい場合、タスクは分割されません。
- Introduced in: -

##### pk_index_parallel_compaction_threadpool_max_threads

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのクラウドネイティブプライマリキーインデックス並列コンパクション用スレッドプールの最大スレッド数。`0` はCPUコア数の半分に自動設定されることを意味します。
- Introduced in: -

##### pk_index_parallel_compaction_threadpool_size

- Default: 1048576
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データモードのクラウドネイティブプライマリキーインデックス並列コンパクションで使用されるスレッドプールの最大キューサイズ（保留中のタスク数）。この設定は、スレッドプールが新しい送信を拒否するまでにキューに入れることができるコンパクションタスクの数を制御します。実効的な並列処理は `pk_index_parallel_compaction_threadpool_max_threads` によって制限されます。多くの同時コンパクションタスクが予想される場合にタスクの拒否を避けるにはこの値を増やしますが、キューが大きくなると、キューに入っている作業のメモリとレイテンシが増加することに注意してください。
- Introduced in: -

##### pk_index_parallel_execution_min_rows

- Default: 16384
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックス操作で並列実行を有効にするための最小行閾値。
- Introduced in: -

##### pk_index_parallel_execution_threadpool_max_threads

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックス並列実行用スレッドプールの最大スレッド数。`0` はCPUコア数の半分に自動設定されることを意味します。
- Introduced in: -

##### pk_index_size_tiered_level_multiplier

- Default: 10
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーインデックスのサイズ階層型コンパクション戦略のレベル乗数パラメータ。
- Introduced in: -

##### pk_index_size_tiered_max_level

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーインデックスのサイズ階層型コンパクション戦略の最大レベル。
- Introduced in: -

##### pk_index_size_tiered_min_level_size

- Default: 131072
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーインデックスのサイズ階層型コンパクション戦略の最小レベル。
- Introduced in: -

##### pk_index_sstable_sample_interval_bytes

- Default: 16777216
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: 共有データクラスターのSSTableファイルのサンプリング間隔サイズ。SSTableファイルのサイズがこの閾値を超えると、システムはこの間隔でSSTableからキーをサンプリングして、コンパクションタスクの境界パーティションを最適化します。この閾値よりも小さいSSTableの場合、開始キーのみが境界キーとして使用されます。デフォルトは16MBです。
- Introduced in: -

##### pk_index_target_file_size

- Default: 67108864
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーインデックスのターゲットファイルサイズ。
- Introduced in: -

##### pk_index_eager_build_threshold_bytes

- Default: 104857600
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: `enable_pk_index_eager_build` がtrueに設定されている場合、インポートまたはコンパクション中に生成されたデータがこの閾値を超えた場合にのみ、システムはPKインデックスファイルを積極的に構築します。デフォルトは100MBです。
- Introduced in: -

##### primary_key_limit_size

- Default: 128
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: プライマリキーテーブルのキー列の最大サイズ。
- Introduced in: v2.5

##### release_snapshot_worker_count

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BEノード上のスナップショット解放タスクの最大スレッド数。
- Introduced in: -

##### repair_compaction_interval_seconds

- Default: 600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Repair Compactionスレッドのポーリング時間間隔。
- Introduced in: -

##### replication_max_speed_limit_kbps

- Default: 50000
- Type: Int
- Unit: KB/秒
- Is mutable: はい
- Description: 各レプリケーションスレッドの最大速度。
- Introduced in: v3.3.5

##### replication_min_speed_limit_kbps

- Default: 50
- Type: Int
- Unit: KB/秒
- Is mutable: はい
- Description: 各レプリケーションスレッドの最小速度。
- Introduced in: v3.3.5

##### replication_min_speed_time_seconds

- Default: 300
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: レプリケーションスレッドが最小速度を下回ることを許容される時間。実際の速度が `replication_min_speed_limit_kbps` より低い時間がこの値を超えると、レプリケーションは失敗します。
- Introduced in: v3.3.5

##### replication_threads

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: レプリケーションに使用される最大スレッド数。`0` はスレッド数をBE CPUコア数の4倍に設定することを示します。
- Introduced in: v3.3.5

##### size_tiered_level_multiple

- Default: 5
- Type: Int
- Unit: -
- Is mutable: はい
- Description: サイズ階層型コンパクションポリシーにおける2つの連続するレベル間のデータサイズの倍数。
- Introduced in: -

##### size_tiered_level_multiple_dupkey

- Default: 10
- Type: Int
- Unit: -
- Is mutable: はい
- Description: サイズ階層型コンパクションポリシーにおける、Duplicate Keyテーブルの2つの隣接するレベル間のデータ量の差の倍数。
- Introduced in: -

##### size_tiered_level_num

- Default: 7
- Type: Int
- Unit: -
- Is mutable: はい
- Description: サイズ階層型コンパクションポリシーのレベル数。各レベルには最大1つのrowsetが予約されます。したがって、安定した状態では、この構成項目で指定されたレベル数と同じ数のrowsetが最大で存在します。
- Introduced in: -

##### size_tiered_max_compaction_level

- Default: 3
- Type: Int
- Unit: レベル
- Is mutable: はい
- Description: 単一のプライマリキーリアルタイムコンパクションタスクにマージできるサイズ階層レベルの数を制限します。PKサイズ階層型コンパクションの選択中、StarRocksはサイズによってrowsetの順序付けられた「レベル」を構築し、この制限に達するまで連続するレベルを選択されたコンパクション入力に追加します（コードは `compaction_level <= size_tiered_max_compaction_level` を使用します）。この値は含まれ、マージされた異なるサイズ階層の数をカウントします（最上位レベルは1としてカウントされます）。PKサイズ階層型コンパクション戦略が有効な場合にのみ有効です。これを上げると、コンパクションタスクにさらに多くのレベルを含めることができます（より大きく、I/OとCPUを多用するマージ、潜在的により高い書き込み増幅）。一方、下げるとマージが制限され、タスクサイズとリソース使用量が削減されます。
- Introduced in: v4.0.0

##### size_tiered_min_level_size

- Default: 131072
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: サイズ階層型コンパクションポリシーにおける最小レベルのデータサイズ。この値よりも小さいrowsetは、直ちにデータコンパクションをトリガーします。
- Introduced in: -

##### small_dictionary_page_size

- Default: 4096
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: `BinaryPlainPageDecoder` が辞書（バイナリ/プレーン）ページを積極的に解析するかどうかを決定する閾値（バイト単位）。ページのエンコードサイズが `small_dictionary_page_size` 未満の場合、デコーダーはすべての文字列エントリをインメモリベクトル（`_parsed_datas`）に事前に解析し、ランダムアクセスとバッチ読み取りを高速化します。この値を上げると、より多くのページが事前に解析されます（アクセスごとのデコードオーバーヘッドを削減し、より大きな辞書の実効圧縮率を向上させる可能性があります）が、メモリ使用量と解析に費やされるCPUが増加します。過度に大きな値は全体的なパフォーマンスを低下させる可能性があります。メモリとアクセスレイテンシのトレードオフを測定した後でのみ調整してください。
- Introduced in: v3.4.1, v3.5.0

##### snapshot_expire_time_sec

- Default: 172800
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: スナップショットファイルの有効期限。
- Introduced in: -

##### stale_memtable_flush_time_sec

- Default: 0
- Type: long
- Unit: 秒
- Is mutable: はい
- Description: 送信ジョブのメモリ使用量が高い場合、`stale_memtable_flush_time_sec` 秒よりも長く更新されていないメンテーブルは、メモリ負荷を軽減するためにフラッシュされます。この動作は、メモリ制限が近づいている場合（`limit_exceeded_by_ratio(70)` 以上）にのみ考慮されます。`LocalTabletsChannel` では、非常に高いメモリ使用量（`limit_exceeded_by_ratio(95)`）の場合、追加パスでサイズが `write_buffer_size / 4` を超えるメンテーブルをフラッシュする可能性があります。値 `0` は、この年齢ベースの古いメンテーブルフラッシングを無効にします（不変パーティションのメンテーブルは、アイドル状態または高メモリ時にすぐにフラッシュされます）。
- Introduced in: v3.2.0

##### storage_flood_stage_left_capacity_bytes

- Default: 107374182400
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: すべてのBEディレクトリに残っているストレージスペースのハードリミット。BEストレージディレクトリの残りのストレージスペースがこの値よりも少なく、ストレージ使用量（パーセンテージ）が `storage_flood_stage_usage_percent` を超えている場合、ロードジョブとリストアジョブは拒否されます。構成を有効にするには、FE構成項目 `storage_usage_hard_limit_reserve_bytes` と一緒にこの項目を設定する必要があります。
- Introduced in: -

##### storage_flood_stage_usage_percent

- Default: 95
- Type: Int
- Unit: -
- Is mutable: はい
- Description: すべてのBEディレクトリのストレージ使用率（パーセンテージ）のハードリミット。BEストレージディレクトリのストレージ使用率（パーセンテージ）がこの値を超え、残りのストレージスペースが `storage_flood_stage_left_capacity_bytes` 未満の場合、ロードジョブとリストアジョブは拒否されます。構成を有効にするには、FE構成項目 `storage_usage_hard_limit_percent` と一緒にこの項目を設定する必要があります。
- Introduced in: -

##### storage_high_usage_disk_protect_ratio

- Default: 0.1
- Type: double
- Unit: -
- Is mutable: はい
- Description: タブレット作成のストレージルートを選択する際、`StorageEngine` は候補ディスクを `disk_usage(0)` でソートし、平均使用量を計算します。使用量が (平均使用量 + `storage_high_usage_disk_protect_ratio`) より大きいディスクは、優先選択プールから除外されます（ランダム化された優先シャッフルには参加せず、したがって初期選択から延期されます）。この保護を無効にするには0に設定します。値は分数です（一般的な範囲は0.0〜1.0）。値が大きいほど、スケジューラは平均よりも高いディスクに対して寛容になります。
- Introduced in: v3.2.0

##### storage_medium_migrate_count

- Default: 3
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: ストレージメディアの移行（SATAからSSDへ）に使用されるスレッド数。
- Introduced in: -

##### storage_root_path

- Default: `${STARROCKS_HOME}/storage`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: ストレージボリュームのディレクトリとメディア。例：`/data1,medium:hdd;/data2,medium:ssd`。
  - 複数のボリュームはセミコロン（`;`）で区切られます。
  - ストレージメディアがSSDの場合、ディレクトリの最後に `,medium:ssd` を追加します。
  - ストレージメディアがHDDの場合、ディレクトリの最後に `,medium:hdd` を追加します。
- Introduced in: -

##### sync_tablet_meta

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: タブレットメタデータの同期を有効にするかどうかを制御するブール値。`true` は同期を有効にすることを示し、`false` は無効にすることを示します。
- Introduced in: -

##### tablet_map_shard_size

- Default: 1024
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: タブレットマップのシャードサイズ。値は2の累乗である必要があります。
- Introduced in: -

##### tablet_max_pending_versions

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキータブレットで許容される保留バージョンの最大数。保留バージョンとは、コミットされたがまだ適用されていないバージョンを指します。
- Introduced in: -

##### tablet_max_versions

- Default: 1000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: タブレットに許可される最大バージョン数。バージョン数がこの値を超えると、新しい書き込みリクエストは失敗します。
- Introduced in: -

##### tablet_meta_checkpoint_min_interval_secs

- Default: 600
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: TabletMetaチェックポイントのスレッドポーリング時間間隔。
- Introduced in: -

##### tablet_meta_checkpoint_min_new_rowsets_num

- Default: 10
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 最後のTabletMetaチェックポイント以降に作成する最小rowset数。
- Introduced in: -

##### tablet_rowset_stale_sweep_time_sec

- Default: 1800
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: タブレット内の古いrowsetをスイープする時間間隔。
- Introduced in: -

##### tablet_stat_cache_update_interval_second

- Default: 300
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Tablet Stat Cacheが更新される時間間隔。
- Introduced in: -

##### tablet_writer_open_rpc_timeout_sec

- Default: 300
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: リモートBEでタブレットライターを開くRPCのタイムアウト（秒単位）。値はミリ秒に変換され、オープン呼び出しを発行する際のリクエストタイムアウトとbrpcコントロールタイムアウトの両方に適用されます。ランタイムは、実効タイムアウトを `tablet_writer_open_rpc_timeout_sec` と全体的なロードタイムアウトの半分（つまり、min(`tablet_writer_open_rpc_timeout_sec`, `load_timeout_sec` / 2)）の最小値として使用します。この値を、タイムリーな障害検出（小さすぎると早期のオープン失敗を引き起こす可能性あり）とBEがライターを初期化するのに十分な時間を与える（大きすぎるとエラー処理が遅れる）バランスをとるように設定してください。
- Introduced in: v3.2.0

##### transaction_apply_worker_count

- Default: 0
- Type: Int
- Unit: スレッド
- Is mutable: はい
- Description: UpdateManagerの「update_apply」スレッドプール（トランザクションのrowsetを適用するプール、特にプライマリキーテーブルの場合）が使用するワーカースレッドの最大数を制御します。`>0` の値は固定された最大スレッド数を設定します。`0`（デフォルト）はプールのサイズがCPUコア数に等しいことを意味します。設定された値は起動時（`UpdateManager::init`）に適用され、`update-config` HTTPアクションを介して実行時に変更でき、プールの最大スレッドを更新します。これを調整して、適用同時実行性（スループット）を向上させるか、CPU/メモリの競合を制限してください。最小スレッド数とアイドルタイムアウトはそれぞれ `transaction_apply_thread_pool_num_min` と `transaction_apply_worker_idle_time_ms` によって制御されます。
- Introduced in: v3.2.0

##### transaction_apply_worker_idle_time_ms

- Default: 500
- Type: int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: トランザクション/更新を適用するために使用されるUpdateManagerの「update_apply」スレッドプールのアイドルタイムアウト（ミリ秒単位）を設定します。この値は `MonoDelta::FromMilliseconds` を介して `ThreadPoolBuilder::set_idle_timeout` に渡されるため、このタイムアウトよりも長くアイドル状態が続くワーカースレッドは終了する可能性があります（プールの設定された最小スレッド数と最大スレッド数に従います）。値が低いほどリソースを早く解放しますが、バースト負荷の下ではスレッド作成/破棄のオーバーヘッドが増加します。値が高いほど、ベースラインのリソース使用量が増加するコストで、短時間のバーストの間はワーカーをウォームに保ちます。
- Introduced in: v3.2.11

##### trash_file_expire_time_sec

- Default: 86400
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: ゴミファイルをクリーンアップする時間間隔。v2.5.17、v3.0.9、v3.1.6以降、デフォルト値は259,200から86,400に変更されました。
- Introduced in: -

##### unused_rowset_monitor_interval

- Default: 30
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: 期限切れのrowsetをクリーンアップする時間間隔。
- Introduced in: -

##### update_cache_expire_sec

- Default: 360
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Update Cacheの有効期限。
- Introduced in: -

##### update_compaction_check_interval_seconds

- Default: 10
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: プライマリキーテーブルのコンパクションをチェックする時間間隔。
- Introduced in: -

##### update_compaction_delvec_file_io_amp_ratio

- Default: 2
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーテーブルのDelvecファイルを含むrowsetのコンパクション優先度を制御するために使用されます。値が大きいほど優先度が高くなります。
- Introduced in: -

##### update_compaction_num_threads_per_disk

- Default: 1
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーテーブルのディスクごとのコンパクションスレッド数。
- Introduced in: -

##### update_compaction_per_tablet_min_interval_seconds

- Default: 120
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: プライマリキーテーブルの各タブレットでコンパクションがトリガーされる最小時間間隔。
- Introduced in: -

##### update_compaction_ratio_threshold

- Default: 0.5
- Type: Double
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーテーブルのコンパクションがマージできるデータの最大割合。単一のタブレットが過度に大きくなる場合、この値を縮小することを推奨します。
- Introduced in: v3.1.5

##### update_compaction_result_bytes

- Default: 1073741824
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: プライマリキーテーブルの単一コンパクションの最大結果サイズ。
- Introduced in: -

##### update_compaction_size_threshold

- Default: 268435456
- Type: Int
- Unit: -
- Is mutable: はい
- Description: プライマリキーテーブルのコンパクションスコアはファイルサイズに基づいて計算され、他のテーブルタイプとは異なります。このパラメータは、プライマリキーテーブルのコンパクションスコアを他のテーブルタイプと同様にし、ユーザーが理解しやすくするために使用できます。
- Introduced in: -

##### upload_worker_count

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BEノード上のバックアップジョブのアップロードタスクの最大スレッド数。`0` は、BEが稼働しているマシンのCPUコア数に値を設定することを示します。
- Introduced in: -

##### vertical_compaction_max_columns_per_group

- Default: 5
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 垂直コンパクションのグループあたりの最大列数。
- Introduced in: -

### 共有データ

##### download_buffer_size

- Default: 4194304
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: スナップショットファイルをダウンロードする際に使用されるインメモリコピーバッファのサイズ（バイト単位）。`SnapshotLoader::download` はこの値を `fs::copy` に転送ごとのチャンクサイズとして渡し、リモートのシーケンシャルファイルからローカルの書き込み可能ファイルに読み込む際に使用します。値が大きいほど、システムコール/I/Oオーバーヘッドが減少するため、高帯域幅リンクでのスループットが向上する可能性があります。値が小さいほど、アクティブな転送ごとのピークメモリ使用量が減少します。注：このパラメータはストリームごとのバッファサイズを制御し、ダウンロードスレッドの数は制御しません。総メモリ消費量 = `download_buffer_size` * `number_of_concurrent_downloads`。
- Introduced in: v3.2.13

##### graceful_exit_wait_for_frontend_heartbeat

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: グレースフルシャットダウンを完了する前に、SHUTDOWNステータスを示すフロントエンドハートビート応答を少なくとも1つ待機するかどうかを決定します。有効にすると、グレースフルシャットダウンプロセスは、ハートビートRPCを介してSHUTDOWN確認が応答されるまでアクティブなままになり、フロントエンドが2つの通常のハートビート間隔の間で終了状態を検出するのに十分な時間を確保します。
- Introduced in: v3.4.5

##### lake_compaction_stream_buffer_size_bytes

- Default: 1048576
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: 共有データクラスターのクラウドネイティブテーブルコンパクション用のリーダーのリモートI/Oバッファサイズ。デフォルト値は1MBです。この値を増やすとコンパクションプロセスを高速化できます。
- Introduced in: v3.2.3

##### lake_pk_compaction_max_input_rowsets

- Default: 500
- Type: Int
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターのプライマリキーテーブルのコンパクションタスクで許可される入力rowsetの最大数。このパラメータのデフォルト値は、v3.2.4およびv3.1.10以降 `5` から `1000` に、v3.3.1およびv3.2.9以降 `500` に変更されました。プライマリキーテーブルのサイズ階層型コンパクションポリシーが有効になった後（`enable_pk_size_tiered_compaction_strategy` を `true` に設定することで）、StarRocksは書き込み増幅を減らすために各コンパクションのrowset数を制限する必要がありません。したがって、このパラメータのデフォルト値は増加しています。
- Introduced in: v3.1.8, v3.2.3

##### loop_count_wait_fragments_finish

- Default: 2
- Type: Int
- Unit: -
- Is mutable: はい
- Description: BE/CNプロセスが終了する際に待機するループの数。各ループは固定された10秒間隔です。ループ待機を無効にするには `0` に設定できます。v3.4以降、この項目は変更可能になり、デフォルト値は `0` から `2` に変更されました。
- Introduced in: v2.5

##### max_client_cache_size_per_host

- Default: 10
- Type: Int
- Unit: エントリ (キャッシュされたクライアントインスタンス)/ホスト
- Is mutable: いいえ
- Description: BE全体のクライアントキャッシュによって各リモートホストに対して保持されるキャッシュされたクライアントインスタンスの最大数。この単一の設定は、ExecEnv初期化中にBackendServiceClientCache、FrontendServiceClientCache、およびBrokerServiceClientCacheを作成する際に使用されるため、これらのキャッシュ全体でホストごとに保持されるクライアントスタブ/接続の数を制限します。この値を上げると、再接続とスタブ作成のオーバーヘッドが減少しますが、メモリとファイルディスクリプタの使用量が増加します。減らすとリソースは節約されますが、接続のチャーンが増加する可能性があります。値は起動時に読み取られ、実行時に変更することはできません。現在、1つの共有設定ですべてのクライアントキャッシュタイプを制御しています。後でキャッシュごとの個別の設定が導入される可能性があります。
- Introduced in: v3.2.0

##### starlet_filesystem_instance_cache_capacity

- Default: 10000
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Starletファイルシステムインスタンスのキャッシュ容量。
- Introduced in: v3.2.16, v3.3.11, v3.4.1

##### starlet_filesystem_instance_cache_ttl_sec

- Default: 86400
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Starletファイルシステムインスタンスのキャッシュ有効期限。
- Introduced in: v3.3.15, 3.4.5

##### starlet_port

- Default: 9070
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: BEおよびCN用の追加のエージェントサービスポート。
- Introduced in: -

##### starlet_star_cache_disk_size_percent

- Default: 80
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 共有データクラスターでData Cacheが使用できるディスク容量の最大割合。
- Introduced in: v3.1

##### starlet_use_star_cache

- Default: false in v3.1 and true from v3.2.3
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターでData Cacheを有効にするかどうか。`true` はこの機能を有効にし、`false` は無効にすることを示します。v3.2.3以降、デフォルト値は `false` から `true` に変更されました。
- Introduced in: v3.1

##### starlet_write_file_with_tag

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターにおいて、オブジェクトストレージに書き込まれるファイルにオブジェクトストレージタグを付けて、カスタムファイル管理を便利にするかどうか。
- Introduced in: v3.5.3

##### table_schema_service_max_retries

- Default: 3
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Table Schema Serviceリクエストの最大再試行回数。
- Introduced in: v4.1

### データレイク

##### datacache_block_buffer_enable

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: Data Cache効率を最適化するためにBlock Bufferを有効にするかどうか。Block Bufferが有効になっている場合、システムはData CacheからBlockデータを読み取り、一時バッファにキャッシュします。これにより、頻繁なキャッシュ読み取りによって引き起こされる余分なオーバーヘッドが削減されます。
- Introduced in: v3.2.0

##### datacache_disk_adjust_interval_seconds

- Default: 10
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Data Cacheの自動容量スケーリングの間隔。定期的に、システムはキャッシュディスク使用量をチェックし、必要に応じて自動スケーリングをトリガーします。
- Introduced in: v3.3.0

##### datacache_disk_idle_seconds_for_expansion

- Default: 7200
- Type: Int
- Unit: 秒
- Is mutable: はい
- Description: Data Cacheの自動拡張の最小待機時間。ディスク使用量が `datacache_disk_low_level` をこの期間よりも長く下回っている場合にのみ、自動スケーリングアップがトリガーされます。
- Introduced in: v3.3.0

##### datacache_disk_size

- Default: 0
- Type: String
- Unit: -
- Is mutable: はい
- Description: 単一ディスクにキャッシュできるデータの最大量。パーセンテージ（例：`80%`）または物理的な制限（例：`2T`、`500G`）として設定できます。たとえば、2つのディスクを使用し、`datacache_disk_size` パラメータの値を `21474836480`（20 GB）に設定した場合、これら2つのディスクに最大40 GBのデータをキャッシュできます。デフォルト値は `0` で、メモリのみを使用してデータをキャッシュすることを示します。
- Introduced in: -

##### datacache_enable

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: いいえ
- Description: Data Cacheを有効にするかどうか。`true` はData Cacheが有効であることを示し、`false` はData Cacheが無効であることを示します。v3.3以降、デフォルト値は `true` に変更されました。
- Introduced in: -

##### datacache_eviction_policy

- Default: slru
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: Data Cacheの退去ポリシー。有効な値：`lru`（最小最近使用）および `slru`（セグメント化LRU）。
- Introduced in: v3.4.0

##### datacache_inline_item_count_limit

- Default: 130172
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: Data Cacheのインラインキャッシュ項目の最大数。特に小さなキャッシュブロックの場合、Data Cacheはそれらを `inline` モードで格納し、ブロックデータとメタデータを一緒にメモリにキャッシュします。
- Introduced in: v3.4.0

##### datacache_mem_size

- Default: 0
- Type: String
- Unit: -
- Is mutable: はい
- Description: メモリにキャッシュできるデータの最大量。パーセンテージ（例：`10%`）または物理的な制限（例：`10G`、`21474836480`）として設定できます。
- Introduced in: -

##### datacache_min_disk_quota_for_adjustment

- Default: 10737418240
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: Data Cacheの自動スケーリングのための最小有効容量。システムがキャッシュ容量をこの値よりも小さく調整しようとすると、キャッシュ容量は直接 `0` に設定され、キャッシュ容量が不足することによる頻繁なキャッシュの満杯と退去による最適ではないパフォーマンスが防止されます。
- Introduced in: v3.3.0

##### disk_high_level

- Default: 90
- Type: Int
- Unit: -
- Is mutable: はい
- Description: キャッシュ容量の自動スケーリングアップをトリガーするディスク使用率の上限（パーセンテージ）。ディスク使用率がこの値を超えると、システムは自動的にData Cacheからキャッシュデータを削除します。v3.4.0以降、デフォルト値は `80` から `90` に変更されました。この項目はv4.0以降、`datacache_disk_high_level` から `disk_high_level` に名称変更されました。
- Introduced in: v3.3.0

##### disk_low_level

- Default: 60
- Type: Int
- Unit: -
- Is mutable: はい
- Description: キャッシュ容量の自動スケーリングダウンをトリガーするディスク使用率の下限（パーセンテージ）。ディスク使用率が `datacache_disk_idle_seconds_for_expansion` で指定された期間、この値を下回ったままになり、Data Cacheに割り当てられたスペースが完全に利用されている場合、システムは自動的に上限を増やすことでキャッシュ容量を拡張します。この項目はv4.0以降、`datacache_disk_low_level` から `disk_low_level` に名称変更されました。
- Introduced in: v3.3.0

##### disk_safe_level

- Default: 80
- Type: Int
- Unit: -
- Is mutable: はい
- Description: Data Cacheのディスク使用率の安全レベル（パーセンテージ）。Data Cacheが自動スケーリングを実行する際、システムはディスク使用率がこの値にできるだけ近づくようにキャッシュ容量を調整します。v3.4.0以降、デフォルト値は `70` から `80` に変更されました。この項目はv4.0以降、`datacache_disk_safe_level` から `disk_safe_level` に名称変更されました。
- Introduced in: v3.3.0

##### enable_connector_sink_spill

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 外部テーブルへの書き込みでスピリングを有効にするかどうか。この機能を有効にすると、メモリ不足時に外部テーブルへの書き込みによって多数の小さなファイルが生成されるのを防ぐことができます。現在、この機能はIcebergテーブルへの書き込みのみをサポートしています。
- Introduced in: v4.0.0

##### enable_datacache_disk_auto_adjust

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: Data Cacheディスク容量の自動スケーリングを有効にするかどうか。有効にすると、システムは現在のディスク使用率に基づいてキャッシュ容量を動的に調整します。この項目はv4.0以降、`datacache_auto_adjust_enable` から `enable_datacache_disk_auto_adjust` に名称変更されました。
- Introduced in: v3.3.0

##### jdbc_connection_idle_timeout_ms

- Default: 600000
- Type: Int
- Unit: ミリ秒
- Is mutable: いいえ
- Description: JDBC接続プールでアイドル状態の接続が期限切れになるまでの時間。JDBC接続プールで接続のアイドル時間がこの値を超えると、接続プールは構成項目 `jdbc_minimum_idle_connections` で指定された数を超えるアイドル接続を閉じます。
- Introduced in: -

##### jdbc_connection_pool_size

- Default: 8
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: JDBC接続プールのサイズ。各BEノードでは、同じ `jdbc_url` を持つ外部テーブルにアクセスするクエリは同じ接続プールを共有します。
- Introduced in: -

##### jdbc_minimum_idle_connections

- Default: 1
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: JDBC接続プール内のアイドル接続の最小数。
- Introduced in: -

##### lake_clear_corrupted_cache_data

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターで破損したデータキャッシュをシステムがクリアすることを許可するかどうか。
- Introduced in: v3.4

##### lake_clear_corrupted_cache_meta

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 共有データクラスターで破損したメタデータキャッシュをシステムがクリアすることを許可するかどうか。
- Introduced in: v3.3

##### lake_enable_vertical_compaction_fill_data_cache

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 垂直コンパクションタスクが共有データクラスターのローカルディスクにデータをキャッシュすることを許可するかどうか。
- Introduced in: v3.1.7, v3.2.3

##### lake_replication_read_buffer_size

- Default: 16777216
- Type: Long
- Unit: バイト
- Is mutable: はい
- Description: Lakeレプリケーション中にlakeセグメントファイルをダウンロードする際に使用される読み取りバッファサイズ。この値はリモートファイルを読み取るための読み取りごとの割り当てを決定します。実装では、この設定と1MBの最小値のうち大きい方が使用されます。値が大きいほど読み取り呼び出しの回数が減り、スループットが向上する可能性がありますが、同時ダウンロードごとに使用されるメモリが増加します。値が小さいほどメモリ使用量は減少しますが、I/O呼び出しのコストが増加します。ネットワーク帯域幅、ストレージI/O特性、および並列レプリケーションスレッド数に応じて調整してください。
- Introduced in: -

##### lake_service_max_concurrency

- Default: 0
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: 共有データクラスターのRPCリクエストの最大同時実行性。この閾値に達すると、着信リクエストは拒否されます。この項目が `0` に設定されている場合、同時実行性に制限はありません。
- Introduced in: -

##### max_hdfs_scanner_num

- Default: 50
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: `ConnectorScanNode` が持つことができる同時実行コネクタ（HDFS/リモート）スキャナーの最大数を制限します。スキャンの起動中、ノードは推定同時実行性（メモリ、チャンクサイズ、`scanner_row_num` に基づく）を計算し、この値で上限を設定して、予約するスキャナーとチャンクの数、および起動するスキャナースレッドの数を決定します。また、実行時に保留中のスキャナーをスケジュールする際（過剰なサブスクリプションを避けるため）、およびファイルハンドル制限を考慮して再送信できる保留中のスキャナーの数を決定する際にも参照されます。これを減らすと、スレッド、メモリ、およびオープンファイルの負荷が減少しますが、スループットが低下する可能性があります。増やすと、同時実行性とリソース使用量が増加します。
- Introduced in: v3.2.0

##### query_max_memory_limit_percent

- Default: 90
- Type: Int
- Unit: -
- Is mutable: いいえ
- Description: Query Poolが使用できる最大メモリ。Processメモリ制限のパーセンテージとして表されます。
- Introduced in: v3.1.0

##### rocksdb_max_write_buffer_memory_bytes

- Default: 1073741824
- Type: Int64
- Unit: -
- Is mutable: いいえ
- Description: RocksDBのメタの書き込みバッファの最大サイズです。デフォルトは1GBです。
- Introduced in: v3.5.0

##### rocksdb_write_buffer_memory_percent

- Default: 5
- Type: Int64
- Unit: -
- Is mutable: いいえ
- Description: RocksDBのメタの書き込みバッファのメモリ割合です。デフォルトはシステムメモリの5%です。ただし、これとは別に、書き込みバッファメモリの最終的な計算サイズは64MB未満でも1GB（`rocksdb_max_write_buffer_memory_bytes`）を超過することもありません。
- Introduced in: v3.5.0

### その他

##### default_mv_resource_group_concurrency_limit

- Default: 0
- Type: Int
- Unit: -
- Is mutable: はい
- Description: リソースグループ `default_mv_wg` 内のマテリアライズドビューの更新タスクの最大同時実行性（BEノードごと）。デフォルト値 `0` は制限がないことを示します。
- Introduced in: v3.1

##### default_mv_resource_group_cpu_limit

- Default: 1
- Type: Int
- Unit: -
- Is mutable: はい
- Description: リソースグループ `default_mv_wg` 内のマテリアライズドビューの更新タスクが使用できる最大CPUコア数（BEノードごと）。
- Introduced in: v3.1

##### default_mv_resource_group_memory_limit

- Default: 0.8
- Type: Double
- Unit:
- Is mutable: はい
- Description: リソースグループ `default_mv_wg` 内のマテリアライズドビューの更新タスクが使用できる最大メモリ割合（BEノードごと）。デフォルト値はメモリの80%を示します。
- Introduced in: v3.1

##### default_mv_resource_group_spill_mem_limit_threshold

- Default: 0.8
- Type: Double
- Unit: -
- Is mutable: はい
- Description: リソースグループ `default_mv_wg` 内のマテリアライズドビューの更新タスクが中間結果のスピリングをトリガーする前のメモリ使用量閾値。デフォルト値はメモリの80%を示します。
- Introduced in: v3.1

##### enable_resolve_hostname_to_ip_in_load_error_url

- Default: false
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: `error_urls` のデバッグのために、オペレーターがFEハートビートから元のホスト名を使用するか、環境のニーズに基づいてIPアドレスへの解決を強制するかを選択できるかどうか。
  - `true`: ホスト名をIPに解決します。
  - `false` (デフォルト): エラーURLに元のホスト名を保持します。
- Introduced in: v4.0.1

##### enable_retry_apply

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: 有効にすると、再試行可能に分類されたタブレット適用失敗（例えば、一時的なメモリ制限エラー）は、タブレットを即座にエラーとマークする代わりに再試行のために再スケジュールされます。`TabletUpdates` の再試行パスは、現在の失敗回数に乗算し、600秒の最大値にクランプされた `retry_apply_interval_second` を使用して次の試行をスケジュールするため、バックオフは連続する失敗とともに増加します。明示的に再試行不能なエラー（例えば、破損）は再試行を迂回し、適用プロセスを即座にエラー状態に移行させます。再試行は、全体的なタイムアウト/最終条件に達するまで続き、その後、適用はエラー状態に入ります。これをオフにすると、失敗した適用タスクの自動再スケジュールが無効になり、失敗した適用は再試行なしでエラー状態に移行します。
- Introduced in: v3.2.9

##### enable_token_check

- Default: true
- Type: Boolean
- Unit: -
- Is mutable: はい
- Description: トークンチェックを有効にするかどうかを制御するブール値。`true` はトークンチェックを有効にすることを示し、`false` は無効にすることを示します。
- Introduced in: -

##### es_scroll_keepalive

- Default: 5m
- Type: String
- Unit: 分 (サフィックス付き文字列、例: "5m")
- Is mutable: いいえ
- Description: スクロール検索コンテキストのためにElasticsearchに送信されるキープアライブ期間。この値は、初期スクロールURL（`?scroll=<value>`）の構築時および後続のスクロールリクエストの送信時（`ESScrollQueryBuilder` 経由）にそのまま使用されます（例：「5m」）。これは、ES側でES検索コンテキストがガベージコレクションされるまでの時間を制御します。長く設定するとスクロールコンテキストがより長くアクティブに保たれますが、ESクラスターのリソース使用期間が長くなります。この値はESスキャンリーダーによって起動時に読み取られ、実行時に変更することはできません。
- Introduced in: v3.2.0

##### load_replica_status_check_interval_ms_on_failure

- Default: 2000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: 以前のチェックRPCが失敗した場合に、セカンダリレプリカがプライマリレプリカのステータスをチェックする間隔。
- Introduced in: v3.5.1

##### load_replica_status_check_interval_ms_on_success

- Default: 15000
- Type: Int
- Unit: ミリ秒
- Is mutable: はい
- Description: 以前のチェックRPCが成功した場合に、セカンダリレプリカがプライマリレプリカのステータスをチェックする間隔。
- Introduced in: v3.5.1

##### max_length_for_bitmap_function

- Default: 1000000
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: ビットマップ関数の入力値の最大長。
- Introduced in: -

##### max_length_for_to_base64

- Default: 200000
- Type: Int
- Unit: バイト
- Is mutable: いいえ
- Description: to_base64() 関数の入力値の最大長。
- Introduced in: -

##### memory_high_level

- Default: 75
- Type: Long
- Unit: パーセント
- Is mutable: はい
- Description: プロセスメモリ制限のパーセンテージとして表される高水域メモリ閾値。総メモリ消費がこのパーセンテージを超えると、BEは徐々にメモリを解放し始め（現在はデータキャッシュと更新キャッシュを削除することで）、負荷を軽減します。モニターはこの値を使用して `memory_high = mem_limit * memory_high_level / 100` を計算し、消費が `memory_high` を超えた場合、GCアドバイザによってガイドされた制御された削除を実行します。消費が `memory_urgent_level`（別の設定）を超えた場合、より積極的な即時削減が行われます。この値は、閾値を超えた場合に特定のメモリ集約型操作（例えば、プライマリキーのプリロード）を無効にするためにも参照されます。`memory_urgent_level` との検証（`memory_urgent_level` > `memory_high_level`、`memory_high_level` >= 1、`memory_urgent_level` <= 100）を満たす必要があります。
- Introduced in: v3.2.0

##### report_exec_rpc_request_retry_num

- Default: 10
- Type: Int
- Unit: -
- Is mutable: はい
- Description: FEに実行RPCリクエストを報告するためのRPCリクエストの再試行回数。デフォルト値は10で、これはRPCリクエストが失敗した場合、そのフラグメントインスタンスがRPCを完了する限り、10回再試行されることを意味します。実行RPCリクエストの報告はロードジョブにとって重要であり、あるフラグメントインスタンスの完了報告が失敗した場合、ロードジョブはタイムアウトするまでハングします。
- Introduced in: -

##### sleep_one_second

- Default: 1
- Type: Int
- Unit: 秒
- Is mutable: いいえ
- Description: BEエージェントワーカースレッドが、マスターアドレス/ハートビートがまだ利用できない場合や、短時間の再試行/バックオフが必要な場合に、1秒間の一時停止として使用する小さなグローバルスリープ間隔（秒単位）。コードベースでは、複数のレポートワーカープール（例：ReportDiskStateTaskWorkerPool、ReportOlapTableTaskWorkerPool、ReportWorkgroupTaskWorkerPool）によって参照され、ビジーウェイトを回避し、再試行中のCPU消費を削減します。この値を増やすと、再試行頻度とマスター可用性への応答性が低下します。減らすと、ポーリングレートとCPU使用量が増加します。応答性とリソース使用量のトレードオフを意識してのみ調整してください。
- Introduced in: v3.2.0

##### small_file_dir

- Default: `${STARROCKS_HOME}/lib/small_file/`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: ファイルマネージャーによってダウンロードされたファイルを保存するために使用されるディレクトリ。
- Introduced in: -

##### upload_buffer_size

- Default: 4194304
- Type: Int
- Unit: バイト
- Is mutable: はい
- Description: スナップショットファイルをリモートストレージ（ブローカーまたは直接FileSystem）にアップロードする際のファイルコピー操作で使用されるバッファサイズ（バイト単位）。アップロードパス（`snapshot_loader.cpp`）では、この値が `fs::copy` に各アップロードストリームの読み取り/書き込みチャンクサイズとして渡されます。デフォルトは4MiBです。この値を増やすと、高遅延または高帯域幅リンクでのスループットが向上する可能性がありますが、同時アップロードごとのメモリ使用量が増加します。減らすと、ストリームごとのメモリは減少しますが、転送効率が低下する可能性があります。`upload_worker_count` および利用可能な総メモリと合わせて調整してください。
- Introduced in: v3.2.13

##### user_function_dir

- Default: `${STARROCKS_HOME}/lib/udf`
- Type: String
- Unit: -
- Is mutable: いいえ
- Description: ユーザー定義関数（UDF）を保存するために使用されるディレクトリ。
- Introduced in: -

##### web_log_bytes

- Default: 1048576 (1 MB)
- Type: long
- Unit: バイト
- Is mutable: いいえ
- Description: INFOログファイルから読み取り、BEデバッグウェブサーバーのログページに表示する最大バイト数。ハンドラはこの値を使用してシークオフセットを計算し（最後のNバイトを表示）、非常に大きなログファイルの読み取りまたは提供を回避します。ログファイルがこの値よりも小さい場合、ファイル全体が表示されます。注：現在の実装では、INFOログを読み取って提供するコードはコメントアウトされており、ハンドラはINFOログファイルを開けないと報告するため、ログ提供コードが有効になっていない限り、このパラメータは効果がない可能性があります。
- Introduced in: v3.2.0

### 削除されたパラメータ

##### enable_bit_unpack_simd

- Status: 削除済み
- Description: このパラメータは削除されました。ビットアンパックSIMD選択は、現在コンパイル時（AVX2/BMI2）に処理され、デフォルトの実装に自動的にフォールバックします。
- Removed in: -
