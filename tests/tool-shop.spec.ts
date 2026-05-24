import { test as baseTest, expect } from '@playwright/test';
import { attachNetworkCapture } from 'postman-playwright';

// This single line enables Postman network capture
const test = attachNetworkCapture(baseTest);

// Since playwright.config.ts sets baseURL: 'https://practicesoftwaretesting.com',
// we can use relative paths here.

// Shared login credentials used across tests
// Set of sample email and password can be found in the following page:
// https://github.com/testsmith-io/practice-software-testing
const TEST_USER = {
  email: 'customer3@practicesoftwaretesting.com',
  password: 'pass123',
  displayName: 'Bob Smith',
};

// Login flow extracted as a shared helper (reused across tests)
async function login(page) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('Your email').fill(TEST_USER.email);
  await page.getByPlaceholder('Your password').fill(TEST_USER.password);
  // → POST /auth/login fires behind the scenes ← Postman captures it here!
  await page.getByRole('button', { name: 'Login' }).click();
  // After login as a user role, redirect goes to /account
  await page.waitForURL('**/account');
}

test.describe('E-commerce purchase flow', () => {

  // ---------------------------------------------------
  // Scenario 1: Login
  // Fill the UI form → POST /auth/login fires behind the scenes
  // ---------------------------------------------------
  test('can log in and navigate to the top page', async ({ page }) => {
    // 1. Open the login page (relative path works)
    await page.goto('/auth/login');

    // 2. Fill email and password in the UI
    await page.getByPlaceholder('Your email').fill(TEST_USER.email);
    await page.getByPlaceholder('Your password').fill(TEST_USER.password);

    // 3. Click the login button
    //    → POST /auth/login fires behind the scenes ← Postman captures it here!
    await page.getByRole('button', { name: 'Login' }).click();

    // 4. Verify the UI after a successful login (user role lands on /account)
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText(TEST_USER.displayName)).toBeVisible();
  });

  // ---------------------------------------------------
  // Scenario 2: Search for a product → go to the detail page
  // Search via UI → GET /products?search=... fires behind the scenes
  // ---------------------------------------------------
  test('can search for a product and view its detail page', async ({ page }) => {
    await page.goto('/');

    // 1. Enter a keyword into the search box
    //    → GET /products?search=hammer fires behind the scenes ← Postman captures it!
    await page.getByPlaceholder('Search').fill('hammer');
    await page.getByRole('button', { name: 'Search' }).click();

    // 2. Verify search results appear in the UI
    await expect(page.getByTestId('product-name').first()).toBeVisible();

    // 3. Click the first product to open its detail page
    //    → GET /products/:id fires behind the scenes ← Postman captures it!
    await page.getByTestId('product-name').first().click();

    // 4. Verify the product detail UI
    await expect(page.getByTestId('product-name')).toBeVisible();
    await expect(page.getByTestId('unit-price')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  // ---------------------------------------------------
  // Scenario 3: Add a product to the cart
  // Click button in UI → POST /carts fires behind the scenes
  // ---------------------------------------------------
  test('can add a product to the cart', async ({ page }) => {
    // Use the shared login helper
    await login(page);

    // 1. From the top page, navigate to the first product's detail page
    //    (product IDs change with seed data, so don't hardcode them)
    //    → GET /products and GET /products/:id fire behind the scenes ← Postman captures them!
    await page.goto('/');
    await page.getByTestId('product-name').first().click();
    await expect(page.getByTestId('unit-price')).toBeVisible();

    // 2. Click the "Add to cart" button
    //    → POST /carts fires behind the scenes ← Postman captures it!
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // 3. Verify the cart badge increments in the UI
    await expect(page.getByTestId('cart-quantity')).not.toHaveText('0');
  });

  // ---------------------------------------------------
  // Scenario 4: Complete checkout (full E2E flow)
  // Walk through every UI step → multiple APIs fire in sequence
  // ---------------------------------------------------
  test('can run end-to-end from cart to order completion', async ({ page }) => {
    // 1. Use the shared login helper (lands on /account after login)
    await login(page);

    // 2. Navigate to the top page (product listing)
    await page.goto('/');

    // 3. Click the first product
    //    → GET /products fires behind the scenes ← Postman captures it!
    await page.getByTestId('product-name').first().click();

    // 3. Add to cart
    //    → POST /carts fires behind the scenes ← Postman captures it!
    await page.getByRole('button', { name: 'Add to cart' }).click();

    // 4. Navigate to the cart page
    //    → GET /carts/:id fires behind the scenes ← Postman captures it!
    await page.getByTestId('nav-cart').click();
    // Cart rows are identified by `product-title` (no `cart-item` exists)
    await expect(page.getByTestId('product-title').first()).toBeVisible();

    // 5. Checkout is a wizard: Cart → Sign in → Billing Address → Payment
    //    Step1 → Step2 (sign-in): already logged in, so just click "Proceed to checkout"
    await page.getByTestId('proceed-1').click();
    await page.getByTestId('proceed-2').click();

    //    Step3 (billing address): fill the form and proceed
    //    Required fields: street / city / state / country / postal_code / house_number
    await page.getByTestId('street').fill('Test Street');
    await page.getByTestId('house_number').fill('1234');
    await page.getByTestId('city').fill('Tokyo');
    await page.getByTestId('state').fill('Tokyo');
    await page.getByTestId('country').selectOption('Japan');
    await page.getByTestId('postal_code').fill('100-0001');
    await page.getByTestId('proceed-3').click();

    // 6. Enter payment details (Step4: Payment)
    //    cash-on-delivery is the simplest option (others require card number, etc.)
    await expect(page.getByTestId('payment-method')).toBeVisible();
    await page.getByTestId('payment-method').selectOption('cash-on-delivery');

    // 7. Confirm the order
    //    → POST /orders fires behind the scenes ← Postman captures it!
    await page.getByTestId('finish').click();

    // 8. Verify the order completion message in the UI
    await expect(page.getByText('Payment was successful')).toBeVisible();
  });

});
