# サンプル Markdown ドキュメント

カスタムカタログで設定項目を定義し、データをクエリする際にその設定項目を有効にしたい場合は、外部テーブルを作成するときに `PROPERTIES` パラメータにキーと値のペアとして設定項目を追加できます。たとえば、カスタムカタログで設定項目 `custom-catalog.properties` を定義した場合、次のコマンドを実行して外部テーブルを作成できます。

たとえば、データベース `iceberg_test` に `iceberg_tbl` という名前の Iceberg 外部テーブルを作成します。

たとえば、StarRocks に `iceberg_test` という名前のデータベースを作成します。

たとえば、`iceberg0` という名前のリソースを削除します。

StarRocks 2.3 以降のバージョンでは、Iceberg リソースの `hive.metastore.uris` および `iceberg.catalog-impl` を変更できます。詳細については、[ALTER RESOURCE](../sql-reference/sql-statements/Resource/ALTER_RESOURCE.md)。

たとえば、`iceberg1` という名前のリソースを作成し、カタログタイプを `CUSTOM` に設定します。

カスタムカタログは抽象クラス BaseMetastoreCatalog を継承する必要があり、IcebergCatalog インターフェースを実装する必要があります。また、カスタムカタログのクラス名は、StarRocks にすでに存在するクラスの名前と重複することはできません。カタログを作成したら、カタログとその関連ファイルをパッケージ化し、各フロントエンド（FE）の**fe/lib** パスに配置します。その後、各 FE を再起動します。上記の操作が完了したら、カタログがカスタムカタログであるリソースを作成できます。

| **パラメータ**          | **説明**                                              |
| ---------------------- | ------------------------------------------------------------ |
| type                   | リソースタイプ。値を `iceberg` に設定します。               |
| iceberg.catalog.type | リソースのカタログタイプ。Hive カタログとカスタムカタログの両方がサポートされています。Hive カタログを指定する場合は、値を `HIVE` に設定します。カスタムカタログを指定する場合は、値を `CUSTOM` に設定します。 |
| iceberg.catalog-impl   | カスタムカタログの完全修飾クラス名。FE はこの名前に基づいてカタログを検索します。カタログにカスタム設定項目が含まれている場合は、Iceberg 外部テーブルを作成するときに `PROPERTIES` パラメータにキーと値のペアとして追加する必要があります。 |

たとえば、`iceberg0` という名前のリソースを作成し、カタログタイプを `HIVE` に設定します。

- Iceberg テーブルのメタデータが Hive メタストアから取得される場合は、リソースを作成してカタログタイプを `HIVE` に設定できます。

- 地理空間関連クエリ

- `hive0` という名前の Hive リソースを作成します。

例：`hive0` リソースに対応する Hive クラスターの `rawdata` データベース配下に外部テーブル `profile_parquet_p7` を作成します。

**esquery 関数** はクエリをプッシュダウンするために使用されます **SQL では表現できない** （match や geoshape など）を Elasticsearch にフィルタリングのために送信します。esquery 関数の最初のパラメータはインデックスの関連付けに使用されます。2 番目のパラメータは基本的な Query DSL の JSON 式であり、括弧 {} で囲まれています。**JSON 式はルートキーを 1 つだけ持つ必要があります**（match、geo_shape、bool など）。

サポートされているデータ型および StarRocks とターゲットデータベース間のデータ型マッピングについては、[データ型マッピング](External_table.md#Data type mapping) を参照してください。

これは、翻訳ツールのテスト用にさまざまな Markdown 要素を示すサンプル Markdown ドキュメントです。

## はじめに

**Markdown トランスレーター** テストドキュメントへようこそ！このファイルには、翻訳がフォーマットを正しく保持することを確認するためのさまざまな Markdown 要素が含まれています。

### テストする機能

検証したい主な機能は次のとおりです：

1. **見出し** さまざまなレベルの
2. *イタリック* と **太字** テキスト書式設定
3. `Inline code` スニペット
4. リスト（順序付きおよび順序なし）
5. リンクと画像
6. コードブロック
7. テーブル
8. ブロック引用

## コード例

以下は翻訳されないままにすべきJavaScript関数です：

```javascript
function greetUser(name) {
    console.log(`Hello, ${name}! Welcome to the translator.`);
    return `Greeting sent to ${name}`;
}
```

以下はPythonコードです：

```python
def calculate_total(items):
    """Calculate the total price of items."""
    total = sum(item['price'] for item in items)
    return total
```

## リスト

### 順序なしリスト

- リストの最初の項目
- 2番目の項目（**太字テキスト**
- 3番目の項目（[リンク](https://example.com)
- 4番目の項目（`inline code`）

### 順序付きリスト

1. プロセスの最初のステップ
2. 2番目のステップ（*強調*
3. 重要な詳細を含む最終ステップ

## テーブル

| 機能 | 説明 | ステータス |
|---------|-------------|--------|
| 翻訳 | テキストをターゲット言語に変換 | ✅ 有効 |
| 書式設定 | Markdown構造を保持 | ✅ 有効 |
| コードブロック | コードを翻訳せずに保持 | ✅ 有効 |
| リンク | URLの整合性を維持 | ✅ 有効 |

## リンクと画像

詳細については、[ドキュメント](https://github.com/example/markdown-translator) をご覧ください。

![サンプル画像](https://via.placeholder.com/300x200?text=Sample+Image)

## Docusaurus admonitions

:::tip
MinIO Web UIにアクセスキーが表示されない場合は、`minio_mc` サービスのログを確認してください：

```bash
docker compose logs minio_mc
```

`minio_mc` ポッドを再実行してみてください：

```bash
docker compose run minio_mc
```

:::

## ブロック引用

> これはブロック引用の書式を保持しながら翻訳されるべき重要な引用です。
>
> 複数段落の引用も正しく機能するはずです。

### ネストされたブロック引用

> これはメインの引用です。
>
> > これはメインの引用内のネストされた引用です。
適切なネスト構造を維持する必要があります。

## 混合コンテンツ

同じ段落内で `inline code` と組み合わせることができます。**太字テキスト** と *斜体テキスト* を同じ段落内で使用できます。https://example.com のような URL は変更されず、contact@example.com のようなメールアドレスも同様です。

## 技術用語

技術ドキュメントを扱う場合、**API**、**JSON**、**HTTP**、および **URL** などの用語は、対象言語とコンテキストによって特別な処理が必要になる場合があります。

このサンプルには、翻訳してはならないプロジェクト固有の用語も意図的に含まれています: StarRocks、Hive、Leader、Follower、Raft、Docker、Kubernetes、MinIO。

中国語辞書の一般的な英語用語を使用した追加の例文:

- データのロードはパイプラインのインジェストフェーズ中に実行されます。
- データのアンロードは、ダウンストリーム処理のために外部システムに結果をエクスポートします。
- ネイティブテーブルはシステムの内部フォーマットを使用してデータを保存します。
- クラウドネイティブテーブルのデプロイメントは、スケーラビリティのためにストレージとコンピュートを分離します。
- 外部テーブルを使用すると、データベースの外部に存在するデータをクエリできます。
- Hive 外部テーブルを使用して、レガシーな Hive データセットにアクセスできます。
- ストレージの階層化は、ホットデータとコールドデータの配置を最適化するのに役立ちます。
- ストレージとコンピュートの分離により、柔軟なスケーリングが可能になります。
- 共有データモードでは、複数のコンピュートクラスターが同じストレージにアクセスします。
- ゼロマイグレーション戦略は、アップグレード中のダウンタイムを最小化します。
- ネイティブベクトル化エンジンは分析クエリを高速化します。
- クエリフェデレーションにより、異なるシステム間でテーブルを結合できます。
- カラム型ストレージは圧縮と分析パフォーマンスを向上させます。
- 行ストレージはトランザクションワークロードに役立ちます。
- マテリアライズドビューは、コストのかかる集計を事前に計算できます。
- 事前集計は、データを事前に集約することでクエリ時の処理を削減します。
- 集計クエリは、行のグループ全体の集計を計算します。
- スタースキーマは、分析のための一般的なディメンショナルモデリングパターンです。
- スノーフレークスキーマは、冗長性を削減するためにディメンションテーブルを正規化します。
- ポイントクエリは、キーによって単一の行または少数の行を取得します。

### 説明付きコード

次のコマンドはパッケージをインストールします：

```bash
npm install markdown-translator
```

このコマンドは記載されたとおりに保持する必要がありますが、この説明テキストは翻訳する必要があります。

## 結論

このサンプルドキュメントは、翻訳ツールが正しく機能することを確認するために、さまざまなマークダウン要素をテストします。目標は、以下を保持しながらすべての読み取り可能なテキストを翻訳することです：

- マークダウンの書式設定
- コードブロックとインラインコード
- URLとファイルパス
- 技術的な構文

***

*このドキュメントはテスト目的で作成されました。*

# 外部テーブル

次のステートメントを実行して、`jdbc0` という名前のJDBCリソースを作成します：

リソースの作成時に、FEは `driver_url` パラメータで指定されたURLを使用してJDBCドライバーJARパッケージをダウンロードし、チェックサムを生成して、BEがダウンロードしたJDBCドライバーの検証に使用します。

2.5以降、StarRocksはデータキャッシュ機能を提供しており、外部データソースのホットデータクエリを高速化します。詳細については、[データキャッシュ](data_cache.md)。

BEが初めてJDBC外部テーブルをクエリし、対応するJDBCドライバーJARパッケージがマシン上に存在しないことを確認した場合、BEは `driver_url` パラメータで指定されたURLを使用してJDBCドライバーJARパッケージをダウンロードし、すべてのJDBCドライバーJARパッケージは `${STARROCKS_HOME}/lib/jdbc_drivers` ディレクトリに保存されます。

> 注意：`ResourceType` 列は `jdbc` です。

次のステートメントを実行して、`jdbc0` という名前のJDBCリソースを削除します：

次のステートメントを実行して、StarRocksで `jdbc_test` という名前のデータベースを作成してアクセスします：

次のステートメントを実行して、データベース `jdbc_test` に `jdbc_tbl` という名前のJDBC外部テーブルを作成します：

`properties` の必須パラメータは以下のとおりです：

次のステートメントを実行して、`hudi0` という名前のHudiリソースを削除します：

次のステートメントを実行して、StarRocksクラスターに `hudi_test` という名前のHudiデータベースを作成して開きます：

次の表にパラメータを説明します。

| パラメータ | 説明                                                  |
| --------- | ------------------------------------------------------------ |
| ENGINE    | Hudi外部テーブルのクエリエンジン。値を `HUDI` に設定します。 |
| resource  | StarRocksクラスター内のHudiリソースの名前。     |
| database  | StarRocksクラスター内でHudi外部テーブルが属するHudiデータベースの名前。 |
| table     | Hudi外部テーブルが関連付けられているHudi管理テーブル。 |

| Hudiがサポートするデータ型   | StarRocksがサポートするデータ型 |
| ----------------------------   | --------------------------------- |
| BOOLEAN                        | BOOLEAN                           |
| INT                            | TINYINT/SMALLINT/INT              |
| DATE                           | DATE                              |
| TimeMillis/TimeMicros          | TIME                              |
| TimestampMillis/TimestampMicros| DATETIME                          |
| LONG                           | BIGINT                            |
| FLOAT                          | FLOAT                             |
| DOUBLE                         | DOUBLE                            |
| STRING                         | CHAR/VARCHAR                      |
| ARRAY                          | ARRAY                             |
| DECIMAL                        | DECIMAL                           |

:::note

StarRocksは、STRUCTまたはMAP型のデータのクエリをサポートしておらず、Merge On ReadテーブルでのARRAY型のデータのクエリもサポートしていません。

:::

> **注意**
>
> StarRocksは、STRUCTまたはMAP型のデータのクエリをサポートしておらず、Merge On ReadテーブルでのARRAY型のデータのクエリもサポートしていません。

:::note

外部テーブル機能は、特定のコーナーユースケースを除いて推奨されなくなり、将来のリリースで非推奨になる可能性があります。一般的なシナリオで外部データソースのデータを管理およびクエリするには、[外部カタログ](./catalog/catalog_overview.md)を推奨します。

:::

次の表にパラメータを説明します。

| **パラメーター**        | **必須** | **デフォルト値** | **説明**                                              |
| -------------------- | ------------ | ----------------- | ------------------------------------------------------------ |
| hosts                | Yes          | None              | Elasticsearchクラスターの接続アドレス。1つ以上のアドレスを指定できます。StarRocksはこのアドレスからElasticsearchのバージョンとインデックスシャードの割り当てを解析します。StarRocksは`GET /_nodes/http` API操作によって返されたアドレスに基づいてElasticsearchクラスターと通信します。そのため、`host`パラメーターの値は`GET /_nodes/http` API操作によって返されたアドレスと同じである必要があります。そうでない場合、BEがElasticsearchクラスターと通信できない可能性があります。 |
| index                | Yes          | None              | StarRocksのテーブルに作成されたElasticsearchインデックスの名前。エイリアスも使用できます。このパラメーターはワイルドカード（*）をサポートしています。たとえば、`index`を <code class="language-text">hello*</code>に設定すると、StarRocksは`hello`で始まる名前のすべてのインデックスを取得します。 |
| user                 | No           | Empty             | 基本認証が有効なElasticsearchクラスターへのログインに使用するユーザー名。`/*cluster/state/*nodes/http`およびインデックスへのアクセス権があることを確認してください。 |
| password             | No           | Empty             | Elasticsearchクラスターへのログインに使用するパスワード。 |
| type                 | No           | `_doc`            | インデックスのタイプ。デフォルト値：`_doc`。Elasticsearch 8以降のバージョンのデータをクエリする場合、マッピングタイプがElasticsearch 8以降で削除されているため、このパラメーターを設定する必要はありません。 |
| es.nodes.wan.only    | No           | `false`           | StarRocksが`hosts`で指定されたアドレスのみを使用してElasticsearchクラスターにアクセスしデータを取得するかどうかを指定します。<ul><li>`true`：StarRocksは`hosts`で指定されたアドレスのみを使用してElasticsearchクラスターにアクセスしデータを取得し、Elasticsearchインデックスのシャードが存在するデータノードをスニッフィングしません。StarRocksがElasticsearchクラスター内部のデータノードのアドレスにアクセスできない場合、このパラメーターを`true`に設定する必要があります。</li><li>`false`：StarRocksは`host`で指定されたアドレスを使用して、Elasticsearchクラスターインデックスのシャードが存在するデータノードをスニッフィングします。StarRocksがクエリ実行計画を生成した後、関連するBEはElasticsearchクラスター内部のデータノードに直接アクセスし、インデックスのシャードからデータを取得します。StarRocksがElasticsearchクラスター内部のデータノードのアドレスにアクセスできる場合、デフォルト値`false`を維持することをお勧めします。</li></ul> |
| es.net.ssl           | No           | `false`           | ElasticsearchクラスターへのアクセスにHTTPSプロトコルを使用できるかどうかを指定します。このパラメーターの設定はStarRocks 2.4以降のバージョンのみサポートされています。<ul><li>`true`：HTTPSおよびHTTPプロトコルの両方をElasticsearchクラスターへのアクセスに使用できます。</li><li>`false`：HTTPプロトコルのみをElasticsearchクラスターへのアクセスに使用できます。</li></ul> |
| enable_docvalue_scan | No           | `true`            | Elasticsearchのカラム型ストレージから対象フィールドの値を取得するかどうかを指定します。ほとんどの場合、カラム型ストレージからのデータ読み取りは行型ストレージからの読み取りよりも優れたパフォーマンスを発揮します。 |
| enable_keyword_sniff | No           | `true`            | KYEWORDタイプのフィールドに基づいてElasticsearchのTEXTタイプフィールドをスニッフィングするかどうかを指定します。このパラメーターが`false`に設定されている場合、StarRocksはトークン化後にマッチングを実行します。 |

|   SQL構文  |   ES構文  |
| :---: | :---: |
|  `=`   |  term query   |
|  `in`   |  terms query   |
|  `>=,  <=, >, <`   |  range   |
|  `and`   |  bool.filter   |
|  `or`   |  bool.should   |
|  `not`   |  bool.must_not   |
|  `not in`   |  bool.must_not + terms   |
|  `esquery`   |  ES Query DSL  |

> 注意：
>
> - 現在、サポートされているHiveストレージ形式はParquet、ORC、およびCSVです。
ストレージ形式がCSVの場合、引用符をエスケープ文字として使用することはできません。
> - SNAPPYおよびLZ4圧縮形式がサポートされています。
> - クエリ可能なHive文字列カラムの最大長は1 MBです。文字列カラムが1 MBを超える場合、nullカラムとして処理されます。

`k4`の最初のフィールドはTEXTであり、データ取り込み後に`k4`に設定されたアナライザー（`k4`にアナライザーが設定されていない場合は標準アナライザー）によってトークン化されます。その結果、最初のフィールドは`StarRocks`、`On`、`Elasticsearch`の3つのタームにトークン化されます。詳細は以下のとおりです：

- **user:** このパラメーターは、宛先StarRocksクラスターへのアクセスに使用するユーザー名を指定します。
- **password:** このパラメーターは、宛先StarRocksクラスターへのアクセスに使用するパスワードを指定します。
- **database:** このパラメーターは、宛先テーブルが属するデータベースを指定します。
- **table:** このパラメーターは、宛先テーブルの名前を指定します。

```SQL
# 宛先StarRocksクラスターに宛先テーブルを作成します。
CREATE TABLE t
(
    k1 DATE,
    k2 INT,
    k3 SMALLINT,
    k4 VARCHAR(2048),
    k5 DATETIME
)
ENGINE=olap
DISTRIBUTED BY HASH(k1);

# ソースStarRocksクラスターに外部テーブルを作成します。
CREATE EXTERNAL TABLE external_t
(
    k1 DATE,
    k2 INT,
    k3 SMALLINT,
    k4 VARCHAR(2048),
    k5 DATETIME
)
ENGINE=olap
DISTRIBUTED BY HASH(k1)
PROPERTIES
(
    "host" = "127.0.0.1",
    "port" = "9020",
    "user" = "user",
    "password" = "passwd",
    "database" = "db_test",
    "table" = "t"
);

# StarRocks外部テーブルにデータを書き込むことで、ソースクラスターから宛先クラスターにデータを書き込みます。本番環境では2番目のステートメントを推奨します。
insert into external_t values ('2020-10-11', 1, 1, 'hello', '2020-10-11 10:00:00');
insert into external_t select * from other_table;
```

## 参考資料

- [SHOW CREATE TABLE](SHOW_CREATE_TABLE.md)
- [SHOW TABLES](SHOW_TABLES.md)
- [USE](../Database/USE.md)
- [ALTER TABLE](ALTER_TABLE.md)
- [DROP TABLE](DROP_TABLE.md)
