---
displayed_sidebar: docs
---

# AuditLoader を介した StarRocks 内での監査ログの管理

このトピックでは、AuditLoader プラグインを介して、テーブル内で StarRocks 監査ログを管理する方法について説明します。

StarRocks は、監査ログを内部データベースではなく、ローカルファイル **fe/log/fe.audit.log** に保存します。AuditLoader プラグインを使用すると、クラスター内で直接監査ログを管理できます。インストールされると、AuditLoader はファイルからログを読み取り、HTTP PUT を介して StarRocks にロードします。その後、SQL ステートメントを使用して StarRocks の監査ログをクエリできます。

## 監査ログを保存するテーブルの作成

StarRocks クラスターにデータベースとテーブルを作成し、監査ログを保存します。詳細な手順については、[CREATE DATABASE](../../sql-reference/sql-statements/Database/CREATE_DATABASE.md) および [CREATE TABLE](../../sql-reference/sql-statements/table_bucket_part_index/CREATE_TABLE.md) を参照してください。

StarRocks のバージョンによって監査ログのフィールドが異なるため、アップグレード時の互換性の問題を避けるために、以下の推奨事項に従うことが重要です。

> **CAUTION**
>
> - すべての新しいフィールドは `NULL` とマークする必要があります。
> - フィールドは、ユーザーが依存している可能性があるため、名前を変更してはなりません。
> - 挿入時のエラーを避けるために、フィールド型には下位互換性のある変更のみを適用する必要があります。例: `VARCHAR(32)` -> `VARCHAR(64)`。
> - `AuditEvent` フィールドは名前のみで解決されます。テーブル内のカラムの順序は重要ではなく、ユーザーはいつでも変更できます。
> - テーブルに存在しない `AuditEvent` フィールドは無視されるため、ユーザーは不要なカラムを削除できます。

```SQL
CREATE DATABASE starrocks_audit_db__;

CREATE TABLE starrocks_audit_db__.starrocks_audit_tbl__ (
  `queryId` VARCHAR(64) COMMENT "クエリの一意なID",
  `timestamp` DATETIME NOT NULL COMMENT "クエリ開始時間",
  `queryType` VARCHAR(12) COMMENT "クエリタイプ (query, slow_query, connection)",
  `clientIp` VARCHAR(32) COMMENT "クライアントIP",
  `user` VARCHAR(64) COMMENT "クエリユーザー名",
  `authorizedUser` VARCHAR(64) COMMENT "ユーザーの一意な識別子 (user_identity)",
  `resourceGroup` VARCHAR(64) COMMENT "リソースグループ名",
  `catalog` VARCHAR(32) COMMENT "カタログ名",
  `db` VARCHAR(96) COMMENT "クエリが実行されるデータベース",
  `state` VARCHAR(8) COMMENT "クエリ状態 (EOF, ERR, OK)",
  `errorCode` VARCHAR(512) COMMENT "エラーコード",
  `queryTime` BIGINT COMMENT "クエリ実行時間 (ミリ秒)",
  `scanBytes` BIGINT COMMENT "クエリによってスキャンされたバイト数",
  `scanRows` BIGINT COMMENT "クエリによってスキャンされた行数",
  `returnRows` BIGINT COMMENT "クエリによって返された行数",
  `cpuCostNs` BIGINT COMMENT "クエリによって消費されたCPU時間 (ナノ秒)",
  `memCostBytes` BIGINT COMMENT "クエリによって消費されたメモリ (バイト)",
  `stmtId` INT COMMENT "SQLステートメントのインクリメンタルID",
  `isQuery` TINYINT COMMENT "SQLがクエリであるかどうか (1または0)",
  `feIp` VARCHAR(128) COMMENT "ステートメントを実行したFE IP",
  `stmt` VARCHAR(1048576) COMMENT "元のSQLステートメント",
  `digest` VARCHAR(32) COMMENT "低速SQLのフィンガープリント",
  `planCpuCosts` DOUBLE COMMENT "クエリプランニング中のCPU使用率 (ナノ秒)",
  `planMemCosts` DOUBLE COMMENT "クエリプランニング中のメモリ使用率 (バイト)",
  `pendingTimeMs` BIGINT COMMENT "クエリがキューで待機した時間 (ミリ秒)",
  `candidateMVs` VARCHAR(65533) NULL COMMENT "候補のマテリアライズドビューのリスト",
  `hitMvs` VARCHAR(65533) NULL COMMENT "一致したマテリアライズドビューのリスト",
  `warehouse` VARCHAR(32) NULL COMMENT "ウェアハウス名"
) ENGINE = OLAP
DUPLICATE KEY (`queryId`, `timestamp`, `queryType`)
COMMENT "監査ログテーブル"
PARTITION BY date_trunc('day', `timestamp`)
PROPERTIES (
  "replication_num" = "1",
  "partition_live_number" = "30"
);
```

`starrocks_audit_tbl__` は動的パーティションで作成されます。デフォルトでは、最初の動的パーティションはテーブル作成後10分で作成されます。その後、監査ログをテーブルにロードできます。次のステートメントを使用して、テーブル内のパーティションを確認できます。

```SQL
SHOW PARTITIONS FROM starrocks_audit_db__.starrocks_audit_tbl__;
```

パーティションが作成されたら、次のステップに進むことができます。

## AuditLoader のダウンロードと設定

1.  [AuditLoader インストールパッケージ](https://releases.starrocks.io/resources/auditloader.zip) をダウンロードします。このパッケージは、利用可能なすべての StarRocks バージョンと互換性があります。

2.  インストールパッケージを解凍します。

    ```shell
    unzip auditloader.zip
    ```

    以下のファイルが展開されます。

    -   **auditloader.jar**: AuditLoader の JAR ファイル。
    -   **plugin.properties**: AuditLoader のプロパティファイル。このファイルを変更する必要はありません。
    -   **plugin.conf**: AuditLoader の設定ファイル。ほとんどの場合、このファイルの `user` および `password` フィールドのみを変更する必要があります。

3.  AuditLoader を設定するために **plugin.conf** を変更します。AuditLoader が正しく動作するために、以下の項目を設定する必要があります。

    -   `frontend_host_port`: FE の IP アドレスと HTTP ポート。形式は `<fe_ip>:<fe_http_port>` です。デフォルト値 `127.0.0.1:8030` に設定することをお勧めします。StarRocks の各 FE は独自の監査ログを独立して管理しており、プラグインをインストールすると、各 FE は独自のバックグラウンドスレッドを開始して監査ログをフェッチおよび保存し、Stream Load を介して書き込みます。`frontend_host_port` 設定項目は、プラグインのバックグラウンド Stream Load タスクの HTTP プロトコルの IP とポートを提供するために使用され、このパラメータは複数の値をサポートしません。パラメータの IP 部分はクラスター内の任意の FE の IP を使用できますが、対応する FE がクラッシュした場合、通信の失敗により他の FE のバックグラウンドでの監査ログ書き込みタスクも失敗するため、お勧めしません。デフォルト値 `127.0.0.1:8030` に設定することをお勧めします。これにより、各 FE は独自の HTTP ポートを使用して通信し、他の FE の例外が発生した場合の通信への影響を回避できます（すべての書き込みタスクは最終的に FE Leader ノードに転送されて実行されます）。
    -   `database`: 監査ログをホストするために作成したデータベースの名前。
    -   `table`: 監査ログをホストするために作成したテーブルの名前。
    -   `user`: クラスターのユーザー名。テーブルにデータをロードする権限 (LOAD_PRIV) を持っている必要があります。
    -   `password`: ユーザーのパスワード。
    -   `secret_key`: パスワードの暗号化に使用されるキー（文字列、16バイト以下である必要があります）。このパラメータが設定されていない場合、**plugin.conf** のパスワードは暗号化されず、`password` に平文のパスワードを指定するだけでよいことを示します。このパラメータが指定されている場合、パスワードはこのキーによって暗号化されており、`password` に暗号化された文字列を指定する必要があることを示します。暗号化されたパスワードは、StarRocks で `AES_ENCRYPT` 関数を使用して生成できます: `SELECT TO_BASE64(AES_ENCRYPT('password','secret_key'));`。
    -   `filter`: 監査ログロードのフィルター条件。このパラメータは、Stream Load の [WHERE パラメータ](../../sql-reference/sql-statements/loading_unloading/STREAM_LOAD.md#opt_properties) に基づいており、`-H “where: <condition>”` と同義で、デフォルトは空の文字列です。例: `filter=isQuery=1 and clientIp like '127.0.0.1%' and user='root'`。

4.  ファイルをパッケージに再圧縮します。

    ```shell
    zip -q -m -r auditloader.zip auditloader.jar plugin.conf plugin.properties
    ```

5.  パッケージを FE ノードをホストするすべてのマシンに配布します。すべてのパッケージが同一のパスに保存されていることを確認してください。そうでない場合、インストールは失敗します。パッケージを配布した後、パッケージへの絶対パスをコピーすることを忘れないでください。

    > **NOTE**
    >
    > **auditloader.zip** をすべての FE がアクセスできる HTTP サービス (例えば、`httpd` や `nginx`) に配布し、ネットワーク経由でインストールすることもできます。どちらの場合も、インストールが実行された後、**auditloader.zip** はパスに永続化され、インストール後にソースファイルを削除してはならないことに注意してください。

## AuditLoader のインストール

コピーしたパスとともに次のステートメントを実行して、AuditLoader を StarRocks のプラグインとしてインストールします。

```SQL
INSTALL PLUGIN FROM "<absolute_path_to_package>";
```

ローカルパッケージからのインストールの例:

```SQL
INSTALL PLUGIN FROM "<absolute_path_to_package>";
```

ネットワークパスを介してプラグインをインストールする場合は、INSTALL ステートメントのプロパティでパッケージの md5 を提供する必要があります。

例：

```sql
INSTALL PLUGIN FROM "http://xx.xx.xxx.xxx/extra/auditloader.zip" PROPERTIES("md5sum" = "3975F7B880C9490FE95F42E2B2A28E2D");
```

詳細な手順については、[INSTALL PLUGIN](../../sql-reference/sql-statements/cluster-management/plugin/INSTALL_PLUGIN.md) を参照してください。

## インストールの検証と監査ログのクエリ

1.  [SHOW PLUGINS](../../sql-reference/sql-statements/cluster-management/plugin/SHOW_PLUGINS.md) を介して、インストールが成功したかどうかを確認できます。

    以下の例では、プラグイン `AuditLoader` の `Status` が `INSTALLED` であり、インストールが成功したことを意味します。

    ```Plain
    mysql> SHOW PLUGINS\G
    *************************** 1. row ***************************
        Name: __builtin_AuditLogBuilder
        Type: AUDIT
    Description: builtin audit logger
        Version: 0.12.0
    JavaVersion: 1.8.31
    ClassName: com.starrocks.qe.AuditLogBuilder
        SoName: NULL
        Sources: Builtin
        Status: INSTALLED
    Properties: {}
    *************************** 2. row ***************************
        Name: AuditLoader
        Type: AUDIT
    Description: Available for versions 3.3.11+. Load audit log to starrocks, and user can view the statistic of queries
        Version: 5.0.0
    JavaVersion: 11
    ClassName: com.starrocks.plugin.audit.AuditLoaderPlugin
        SoName: NULL
        Sources: /x/xx/xxx/xxxxx/auditloader.zip
        Status: INSTALLED
    Properties: {}
    2 rows in set (0.01 sec)
    ```

2.  いくつかのランダムな SQL を実行して監査ログを生成し、60 秒（または AuditLoader を設定したときに `max_batch_interval_sec` 項目で指定した時間）待って、AuditLoader が監査ログを StarRocks にロードできるようにします。

3.  テーブルをクエリして監査ログを確認します。

    ```SQL
    SELECT * FROM starrocks_audit_db__.starrocks_audit_tbl__;
    ```

    以下の例は、監査ログがテーブルに正常にロードされたことを示しています。

    ```Plain
    mysql> SELECT * FROM starrocks_audit_db__.starrocks_audit_tbl__\G
    *************************** 1. row ***************************
           queryId: 01975a33-4129-7520-97a2-05e641cec6c9
         timestamp: 2025-06-10 14:16:37
         queryType: query
          clientIp: xxx.xx.xxx.xx:65283
              user: root
    authorizedUser: 'root'@'%'
     resourceGroup: default_wg
           catalog: default_catalog
                db: 
             state: EOF
         errorCode:
         queryTime: 3
         scanBytes: 0
          scanRows: 0
        returnRows: 1
         cpuCostNs: 33711
      memCostBytes: 4200
            stmtId: 102
           isQuery: 1
              feIp: xxx.xx.xxx.xx
              stmt: SELECT * FROM starrocks_audit_db__.starrocks_audit_tbl__
            digest:
      planCpuCosts: 908
      planMemCosts: 0
     pendingTimeMs: -1
      candidateMvs: null
            hitMVs: null
    …………
    ```

## トラブルシューティング

動的パーティションが作成され、プラグインがインストールされた後も監査ログがテーブルにロードされない場合は、**plugin.conf** が適切に設定されているかどうかを確認できます。変更するには、まずプラグインをアンインストールする必要があります。

```SQL
UNINSTALL PLUGIN AuditLoader;
```

AuditLoader のログは **fe.log** に出力されます。**fe.log** でキーワード `audit` を検索することで取得できます。すべての設定が正しく行われた後、上記の手順に従って AuditLoader を再度インストールできます。
