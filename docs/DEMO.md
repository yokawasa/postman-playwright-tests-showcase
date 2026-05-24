# How to run the demo

## Demo environment information

UI-tested e-commerce service - Tool Shop
- Frontend (UI): https://practicesoftwaretesting.com/
- API: https://api.practicesoftwaretesting.com
- GitHub repo: https://github.com/testsmith-io/practice-software-testing


Postman environment
- Postman team: https://field-services-v12-demo.postman.co/
- Workspace: [playwright-tests-showcase](https://field-services-v12-demo.postman.co/workspace/02f51066-635f-4008-8385-79e818fe03f9/overview)
- Collection: [api.practicesoftwaretesting.com](https://field-services-v12-demo.postman.co/workspace/02f51066-635f-4008-8385-79e818fe03f9/collection/54691230-438a2cfb-4058-47db-926d-352d16f45d81)
- Application Inventory: [Tool Shop (Playwright Tests)](https://field-services-v12-demo.postman.co/application-inventory?workspaceId=02f51066-635f-4008-8385-79e818fe03f9)
- GitHub repository for Playwright tests: https://github.com/postman-eng/postman-playwright-tests-showcase


## How to run


1. Clone the related GitHub repository

```sh
git clone git@github.com:postman-eng/postman-playwright-tests-showcase.git
```

2. Install dependencies

```sh
cd postman-playwright-tests-showcase
npm install
```

3. Install the Postman CLI (if not already installed)

```sh
npm install -g postman-cli
```

4. Run the Playwright tests

```sh
# Log in (initial setup for sending test results to the Application Inventory)
postman login


# Run the Playwright tests (local only)
postman app test

# Run the Playwright tests in CI mode (results are sent to the Application Inventory)
CI=true postman app test
```

5. View the test results in Postman's Application Inventory

Go to HOME > Application Inventory > Tool Shop (Playwright Tests) to view the test execution results. You can see API test results for each test case.

- Application Inventory: [Tool Shop (Playwright Tests)](https://field-services-v12-demo.postman.co/application-inventory?workspaceId=02f51066-635f-4008-8385-79e818fe03f9)
