# postman-playwright-tests-showcase


## 1. Link this directory to a Postman workspace.

```sh
postman workspace prepare
```

## 2. 必要なパッケージをインストール

```sh
# Postman CLIをグローバルインストール
npm install -g postman-cli

# Playwrightプロジェクトに開発依存として追加
npm install -D postman-playwright
```


## 3. Playwright テストコードにプラグインを組み込む

プラグインをテストのfixtureにアタッチすることで、ネットワークキャプチャが有効になる

既存のテストコードを次のように書き換える

```ts
// 変更前
import { test, expect } from '@playwright/test';

// 変更後
import { test as baseTest, expect } from '@playwright/test';
import { attachNetworkCapture } from 'postman-playwright';

const test = attachNetworkCapture(baseTest);

// テスト自体は変更不要！
test('homepage has the expected title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

```

## 4. Postmanとの初期連携設定

```sh
postman app init
```
これにより作成される`postman.config.cjs`で、アプリが依存しているAPIのコレクションの選択・使用するEnvironment・実行するUIコマンドを設定する


## 5. テスト実行

ローカルで試す場合（結果はターミナルのみ）：
これで、(1)トラフィックキャプチャ、(2)Validate observed API calls against requests in your collections.

```sh
postman app test
postman app test --target local
postman app test --command "npx playwright test"

````
もし v3 collectionを生成しないならば、

```sh
# only capture + skip validation
postman app test --capture-only
```
出力output
```
[app:test] Starting command (primary task): npm test


> test
> playwright test


Running 4 tests using 4 workers
[chromium] › tests/ec-checkout.spec.ts:81:3 › ECサイト購入フロー › 商品をカートに追加できる
✅ カートへの追加をUIとAPIの両方で確認！
[chromium] › tests/ec-checkout.spec.ts:106:3 › ECサイト購入フロー › カートから注文完了まで通しで実行できる
✅ 注文完了！UIとAPIを同時にPostmanが検証！
  4 passed (20.3s)

To open last HTML report run:

  npx playwright show-report


[app:test] Command finished. Running test tasks...

[capture] Filters applied: 39 request(s) excluded, 341 remaining

Captured API traffic from 2 hosts (62 endpoints, 341 requests):

┌──────────────────────────────────┬───────────────┬──────────────┬───────────────┐
│  api.practicesoftwaretesting.com │  15 endpoints │  (GET, POST) │   57 requests │
├──────────────────────────────────┼───────────────┼──────────────┼───────────────┤
│  practicesoftwaretesting.com     │  47 endpoints │  (GET, POST) │  284 requests │
└──────────────────────────────────┴───────────────┴──────────────┴───────────────┘

✓ Collection saved to: /Users/yoichi.kawasaki/dev/ghq/github.com/yokawasa-sandbox/postman-playwright-test/pm-results/captured
```

これで、pm-results/captured 配下にキャプチャされたサーバーURLのエンドポイントの情報がv3 collection形式で保存される

```
ls -1 pm-results/captured/api.practicesoftwaretesting.com

GET -brands.request.yaml
GET -carts-01krqj1xh64fpkbkqvjn8sng86.request.yaml
GET -categories-tree.request.yaml
GET -postcode-lookup.request.yaml
GET -product-specs-names.request.yaml
GET -products-01KRQF2CXF4Z5T0YR4AQY5Y5EH-related.request.yaml
GET -products-01KRQF2CXF4Z5T0YR4AQY5Y5EH.request.yaml
GET -products-search.request.yaml
GET -products.request.yaml
GET -users-me.request.yaml
POST -carts-01krqj1xh64fpkbkqvjn8sng86.request.yaml
POST -carts-01krqj1yvcvy6hjzg8hggdgmys.request.yaml
POST -carts.request.yaml
POST -payment-check.request.yaml
POST -users-login.request.yaml
```

これをpostman collectionのディレクトリにコピーする

```
cp -pr pm-results/captured/api.practicesoftwaretesting.com postman/collections
```
これで、Postman app で確認するとapi.practicesoftwaretesting.comという名前のコレクションが作成されている



CI環境 / ワークスペースに結果を送る場合：
```sh
CI=true postman app test
CI=true postman app test --command "npx playwright test"
```
CI=true にすると非対話モードで実行され、結果がワークスペースのApplication Inventoryに送信されます。
// Run results were not uploaded to Postman. Tip: append `CI=true` to `postman app test` to publish results anyway

## 6. ノイズのフィルタリング (optional)

フォントやアナリティクスなどの不要なAPIリクエストを除外するには、postman.config.cjs にフィルター設定 (filters.urlPatterns)を追加する

なぜ、そもそもこの手のリクエストをフィルターするのか？
- そもそも不要だから
- キャプチャするときに、内部で Google Analytics のリクエストURL などは長すぎて (tfd=... クエリパラメータ) OS (macOSなど)
  のファイル名長制限 255 文字を超え、ENAMETOOLONG エラーで一時ディレクトリへの書き込みが失敗することがある


```js
// postman.config.cjs
module.exports = {
  filters: {
    urlPatterns: [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'localhost:3007',        // ホットリロード等
    ],
    methods: ['OPTIONS'],
    headers: {
      'x-client': 'analytics', // アナリティクス系
    },
  },
};

```



## Agent Mode プロンプト

### コレクションのAPIリクエストの整理

```
このコレクションのAPIリクエスト一覧を確認して、重複をなくて、整理してください
```

### テストの追加

```
このコレクションに各APIリクエストを検証するテストを追加して
```
