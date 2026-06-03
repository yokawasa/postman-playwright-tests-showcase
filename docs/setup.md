# postman-playwright-tests-showcase

This repository is a sample project that demonstrates how to capture API requests from Playwright test code and save them as a Postman collection using Postman's new [postman-playwright](https://www.npmjs.com/package/postman-playwright) plugin.

## 1. Link this directory to a Postman workspace.

Link the Git repository directory containing your Playwright test code to a Postman workspace. Follow the steps below:

- Open your Postman workspace
- Connect the repository (if not already linked): In the Postman app sidebar, click Local Files > [Open folder] and select the Git directory

After this, results from running Playwright tests in this workspace will be sent to the Application Inventory.

## 2. Install required packages

Install the [postman-playwright](https://www.npmjs.com/package/postman-playwright) plugin. Also, if you haven't already, install the Postman CLI globally.

```sh
# Install Postman CLI globally
npm install -g postman-cli

# Add the Postman-Playwright plugin as a dev dependency
npm install -D postman-playwright
```

## 3. Integrate the plugin into your Playwright test code

Integrate the plugin into your existing test code as shown below to enable network capture.

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
// ---- Added code: start ----
import { attachNetworkCapture } from 'postman-playwright';
const test = attachNetworkCapture(baseTest);
// ---- Added code: end ----

// The tests themselves require no changes
test.describe('test description', () => {...});
...snip...

```

## 4. Initial Postman integration setup

```sh
postman app init
```

In the resulting `postman.config.cjs`, configure the collections of APIs the app depends on, the environment to use, and the UI command to run.


## 5. Run the tests

To try it locally (results shown only in the terminal):
This performs (1) traffic capture and (2) validates observed API calls against requests in your collections.

```sh
# Run the Playwright tests (local only)
postman app test

# The --verbose option allows you to see specifically which API test failed.
postman app test --verbose

# or specify a target defined in postman.config.cjs
postman app test --target beta
# or directly specify the command to run tests
postman app test --command "npm test"
postman app test --command "npx playwright test"

````
If you don't want to generate a v3 collection:

```sh
# only capture + skip validation
postman app test --capture-only
```

Sample output

```
[app:test] Starting command (primary task): npm test


> test
> playwright test


Running 4 tests using 4 workers
[chromium] › tests/ec-checkout.spec.ts:81:3 › E-commerce purchase flow › can add a product to the cart
[chromium] › tests/ec-checkout.spec.ts:106:3 › E-commerce purchase flow › can run end-to-end from cart to order completion
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

The captured endpoint information for each server URL is saved under `pm-results/captured` in v3 collection format.

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

Copy these into the Postman collections directory:

```
cp -pr pm-results/captured/api.practicesoftwaretesting.com postman/collections
```
After this, you'll see a collection named `api.practicesoftwaretesting.com` in the Postman app.



To send results to a CI environment / workspace:
```sh
# Log in (if not already)
postman login
# or with API key
postman login --apiKey <your_api_key>

# Run the tests. With CI=true, results are sent to the workspace's Application Inventory
CI=true postman app test

# or specify a target defined in postman.config.cjs
CI=true postman app test --command "npm test"
CI=true postman app test --command "npx playwright test"
```
With `CI=true`, tests run in non-interactive mode and results are sent to the workspace's Application Inventory.
// Run results were not uploaded to Postman. Tip: append `CI=true` to `postman app test` to publish results anyway

## 6. Filtering noise (optional)

To exclude unnecessary API requests such as fonts and analytics, add filter settings (`filters.urlPatterns`) to `postman.config.cjs`.

Why filter these requests at all?
- They are unnecessary to begin with
- During capture, request URLs for things like Google Analytics can be extremely long (with `tfd=...` query parameters), exceeding the OS (e.g. macOS) filename length limit of 255 characters and causing `ENAMETOOLONG` errors when writing to the temp directory


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
      'x-client': 'analytics', // analytics-related
    },
  },
};

```



## Agent Mode Prompts

### Organizing API requests in a collection

```
Review the list of API requests in this collection, remove duplicates, and organize them.
```

### Adding tests

```
Add tests to this collection that validate each API request.
```
