import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // テストファイルの場所
  testDir: './tests',

  // 各テストのタイムアウト（30秒）
  timeout: 30_000,

  // テスト全体のタイムアウト（CI環境では長めに）
  globalTimeout: process.env.CI ? 600_000 : 300_000,

  // 失敗時に自動リトライ（CI環境では2回、ローカルは0回）
  retries: process.env.CI ? 2 : 0,

  // 並列実行（CI環境ではシングルスレッド）
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  // レポーター設定
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list']]  // CI: HTML + リスト表示
    : [['html', { open: 'on-failure' }]],       // ローカル: 失敗時だけブラウザで開く

  use: {
    // テスト対象のベースURL
    baseURL: 'https://practicesoftwaretesting.com',

    // このアプリは data-test 属性を使用しているため、testIdAttribute を上書き
    // （Playwrightのデフォルトは data-testid）
    testIdAttribute: 'data-test',

    // 失敗時にスクリーンショットを保存
    screenshot: 'only-on-failure',

    // 失敗時にトレースを保存（デバッグ用）
    trace: 'on-first-retry',

    // ブラウザの表示（CI環境ではheadless）
    headless: process.env.CI ? true : false,

    // 各アクションのタイムアウト
    actionTimeout: 10_000,

    // ナビゲーションのタイムアウト
    navigationTimeout: 15_000,
  },

  // テスト対象ブラウザ
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 必要に応じてコメントアウトを外して追加
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 出力ディレクトリ（スクリーンショット・トレース）
  outputDir: './test-results',
});
