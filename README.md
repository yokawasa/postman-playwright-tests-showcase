# postman-playwright-tests-showcase


This repository contains a showcase of the Postman's integration with Playwright UI tests, demonstrating how it capabilities and how it validate APIs during your Playwright tests with Postman.


## 1. Link this directory to a Postman workspace.

Link the directory of the Git repository that contains your Playwright test code to a Postman workspace. Follow these steps:

- Open your Postman workspace
- Connect the repository if it is not already linked: in the Postman app sidebar, click `Local Files > Open folder`, then select the Git repository directory

After this, the results of Playwright test runs for this workspace can be sent to Application Inventory.

## 2. Install the required packages

Install the [postman-playwright](https://www.npmjs.com/package/postman-playwright) plugin. If you have not installed Postman CLI yet, install it globally as well.

```sh
# Install Postman CLI globally
npm install -g postman-cli

# Add the Postman Playwright plugin as a dev dependency
npm install -D postman-playwright
```

## 3. Integrate the plugin into your Playwright tests

Update your existing test code as shown below to enable network capture.

> Before

```ts
import { test, expect } from '@playwright/test';

// Test code
test.describe('test description', () => {...});
...snip...
```

> After

```ts
import { test as baseTest, expect } from '@playwright/test';
// ---- added code starts here ----
import { attachNetworkCapture } from 'postman-playwright';
const test = attachNetworkCapture(baseTest);
// ---- added code ends here ----

// No other changes to the tests are required
test.describe('test description', () => {...});
...snip...

```

## 4. Initialize Postman integration

```sh
postman app init
```

In the generated `postman.config.cjs`, configure the API collections the app depends on, the environment to use, and the UI command to run.


## 5. Run tests

For local testing where results are shown only in the terminal:
This performs both (1) traffic capture and (2) validation of observed API calls against requests in your collections.

```sh
postman app test
# or specify a target defined in postman.config.cjs
postman app test --target beta
# or directly specify the command to run tests
postman app test --command "npm test"
postman app test --command "npx playwright test"

````
If you do not want to generate a v3 collection:

```sh
# only capture + skip validation
postman app test --capture-only
```

Example output:
```
[app:test] Starting command (primary task): npm test


> test
> playwright test


Running 4 tests using 4 workers
[chromium] › tests/ec-checkout.spec.ts:81:3 › ECサイト購入フロー › 商品をカートに追加できる
[chromium] › tests/ec-checkout.spec.ts:106:3 › ECサイト購入フロー › カートから注文完了まで通しで実行できる
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

The captured endpoint information for each server URL is then saved under `pm-results/captured` in v3 collection format.

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

Copy the generated files into your Postman collections directory:

```
cp -pr pm-results/captured/api.practicesoftwaretesting.com postman/collections
```
After that, you should see a collection named `api.practicesoftwaretesting.com` in the Postman app.



To send results from CI or publish them to the workspace:
```sh
# Log in if needed
postman login
# or with API key
postman login --apiKey <your_api_key>

# Run tests. With CI=true, results are published to the workspace's Application Inventory
CI=true postman app test

# or specify a target defined in postman.config.cjs
CI=true postman app test --command "npm test"
CI=true postman app test --command "npx playwright test"
```
With `CI=true`, the command runs in non-interactive mode and sends results to the workspace's Application Inventory.
// Run results were not uploaded to Postman. Tip: append `CI=true` to `postman app test` to publish results anyway

## 6. Filter noisy requests (optional)

To exclude unnecessary API requests such as fonts or analytics traffic, add filter settings such as `filters.urlPatterns` to `postman.config.cjs`.

Why filter these requests in the first place?
- They are usually not needed
- During capture, some requests such as Google Analytics can contain very long URLs with query parameters like `tfd=...`, which may exceed the OS filename length limit (255 characters on macOS, for example) and cause `ENAMETOOLONG` errors when writing to a temporary directory


```js
// postman.config.cjs
module.exports = {
  filters: {
    urlPatterns: [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'localhost:3007',        // hot reload, etc.
    ],
    methods: ['OPTIONS'],
    headers: {
      'x-client': 'analytics', // analytics-related traffic
    },
  },
};

```



## Agent Mode prompts

### Organize API requests in the collection

```
Review the API requests in this collection, remove duplicates, and organize them.
```

### Add tests

```
Add tests to this collection to validate each API request.
```
