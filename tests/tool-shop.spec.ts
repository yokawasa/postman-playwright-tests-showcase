import { test as baseTest, expect } from '@playwright/test';
import { attachNetworkCapture } from 'postman-playwright';

// この1行でPostmanのネットワークキャプチャが有効になる
const test = attachNetworkCapture(baseTest);

// playwright.config.ts の baseURL: 'https://practicesoftwaretesting.com' が効くので
// ここでは相対パスだけで書けるようになる

// テストで共通利用するログイン情報
// 注: customer@ は何度かログイン失敗するとロックされやすいため customer2 を使用
const TEST_USER = {
  email: 'customer2@practicesoftwaretesting.com',
  password: 'welcome01',
  displayName: 'Jack Howe',
};

// ログイン処理を共通関数として切り出し（各テストで再利用）
async function login(page) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('Your email').fill(TEST_USER.email);
  await page.getByPlaceholder('Your password').fill(TEST_USER.password);
  // → 裏で POST /auth/login が叩かれる ← Postmanがここをキャプチャ！
  await page.getByRole('button', { name: 'Login' }).click();
  // user ロールのログイン後は /account にリダイレクトされる
  await page.waitForURL('**/account');
}

test.describe('ECサイト購入フロー', () => {

  // ---------------------------------------------------
  // シナリオ1: ログイン
  // UIでフォームを入力 → 裏でPOST /auth/login が走る
  // ---------------------------------------------------
  test('ログインしてトップページに遷移できる', async ({ page }) => {
    // ① ログインページを開く（相対パスで書ける）
    await page.goto('/auth/login');

    // ② メールとパスワードをUIに入力
    await page.getByPlaceholder('Your email').fill(TEST_USER.email);
    await page.getByPlaceholder('Your password').fill(TEST_USER.password);

    // ③ ログインボタンをクリック
    //    → 裏で POST /auth/login が叩かれる ← Postmanがここをキャプチャ！
    await page.getByRole('button', { name: 'Login' }).click();

    // ④ ログイン成功後のUI確認（user ロールは /account に遷移する）
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText(TEST_USER.displayName)).toBeVisible();
  });

  // ---------------------------------------------------
  // シナリオ2: 商品検索 → 詳細ページへ
  // UIで検索 → 裏でGET /products?search=... が走る
  // ---------------------------------------------------
  test('商品を検索して詳細ページを確認できる', async ({ page }) => {
    await page.goto('/');

    // ① 検索ボックスにキーワードを入力
    //    → 裏で GET /products?search=hammer が叩かれる ← Postmanがキャプチャ！
    await page.getByPlaceholder('Search').fill('hammer');
    await page.getByRole('button', { name: 'Search' }).click();

    // ② 検索結果がUIに表示されることを確認
    await expect(page.getByTestId('product-name').first()).toBeVisible();

    // ③ 最初の商品をクリックして詳細へ
    //    → 裏で GET /products/:id が叩かれる ← Postmanがキャプチャ！
    await page.getByTestId('product-name').first().click();

    // ④ 商品詳細のUI確認
    await expect(page.getByTestId('product-name')).toBeVisible();
    await expect(page.getByTestId('unit-price')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  // ---------------------------------------------------
  // シナリオ3: 商品をカートに追加
  // UIでボタンをクリック → 裏でPOST /carts が走る
  // ---------------------------------------------------
  test('商品をカートに追加できる', async ({ page }) => {
    // 共通ログイン関数を使用
    await login(page);

    // ① トップページから最初の商品の詳細ページへ遷移
    //    （商品IDはシードデータの更新で変わるためハードコードしない）
    //    → 裏で GET /products と GET /products/:id が叩かれる ← Postmanがキャプチャ！
    await page.goto('/');
    await page.getByTestId('product-name').first().click();
    await expect(page.getByTestId('unit-price')).toBeVisible();

    // ② カートに追加ボタンをクリック
    //    → 裏で POST /carts が叩かれる ← Postmanがキャプチャ！
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // ③ カートのバッジが増えることをUI上で確認
    await expect(page.getByTestId('cart-quantity')).not.toHaveText('0');
  });

  // ---------------------------------------------------
  // シナリオ4: チェックアウト完了（フルE2Eフロー）
  // UIの全ステップを操作 → 複数のAPIが連続で走る
  // ---------------------------------------------------
  test('カートから注文完了まで通しで実行できる', async ({ page }) => {
    // ① 共通ログイン関数を使用（ログイン後は /account に遷移する）
    await login(page);

    // ② トップページ（商品一覧）へ移動
    await page.goto('/');

    // ③ 最初の商品をクリック
    //    → 裏で GET /products が走る ← Postmanがキャプチャ！
    await page.getByTestId('product-name').first().click();

    // ③ カートに追加
    //    → 裏で POST /carts が走る ← Postmanがキャプチャ！
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // ④ カートページへ移動
    //    → 裏で GET /carts/:id が走る ← Postmanがキャプチャ！
    await page.getByTestId('nav-cart').click();
    // カート内の商品行は `product-title` で識別される（`cart-item` は存在しない）
    await expect(page.getByTestId('product-title').first()).toBeVisible();

    // ⑤ チェックアウトはウィザード形式: Cart → Sign in → Billing Address → Payment
    //    Step1 → Step2 (サインイン): ログイン済みなので「Proceed to checkout」をクリック
    await page.getByTestId('proceed-1').click();
    await page.getByTestId('proceed-2').click();

    //    Step3 (請求先住所): フォームを入力して次へ
    //    必須フィールド: street / city / state / country / postal_code / house_number
    await page.getByTestId('street').fill('Test Street');
    await page.getByTestId('house_number').fill('1234');
    await page.getByTestId('city').fill('Tokyo');
    await page.getByTestId('state').fill('Tokyo');
    await page.getByTestId('country').selectOption('Japan');
    await page.getByTestId('postal_code').fill('100-0001');
    await page.getByTestId('proceed-3').click();

    // ⑥ 支払い情報を入力（Step4: Payment）
    //    cash-on-delivery は追加入力が不要で最もシンプル（他はカード番号等の必須項目あり）
    await expect(page.getByTestId('payment-method')).toBeVisible();
    await page.getByTestId('payment-method').selectOption('cash-on-delivery');

    // ⑦ 注文確定
    //    → 裏で POST /orders が走る ← Postmanがキャプチャ！
    await page.getByTestId('finish').click();

    // ⑧ 注文完了メッセージをUI上で確認
    await expect(page.getByText('Payment was successful')).toBeVisible();
  });

});
