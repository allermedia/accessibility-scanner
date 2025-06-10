# Accessibility Scanner

Automated accessibility testing for websites using Playwright and axe-core. Generates combined HTML reports with violations grouped by rule and affected URLs.

---

## Features

- Automated accessibility scanning for all URLs found in a site's sitemap or CSV (temporary for AllerService).
- Supports environments: test, staging, production.
- Cookie consent auto-accept and login flow for protected pages (Prenumerera only).
- Grouped, detailed HTML report in `/artifacts`.
- Per-site and per-environment test scripts for granular control.

---

## Project Structure

```
.
├── artifacts/
│   └── combined-accessibility-report.html   # Output HTML report
├── node_modules/
├── src/
│   ├── types/
│   │   └── groupedViolation.d.ts
│   └── utils/
│       ├── createHtmlReport.ts
│       ├── getUrlsFromCsv.ts
│       ├── getUrlsFromSitemap.ts
│       └── groupNodes.ts
├── data/
│   └── allerservice-dk-urls.csv            # Temporary CSV for AllerService URLs
├── tests/
│   ├── prenumerera-accessibility-scanner.test.ts
│   └── allerservice-accessibility-scanner.test.ts
├── .env
├── .env.production
├── .env.staging
├── .env.test
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## URL Configuration

- **Prenumerera:** URLs are fetched from the sitemap of the site specified in the environment variable `PRENUMERERA_URL`.
- **AllerService:** URLs are currently fetched from a CSV file (`data/allerservice-dk-urls.csv`) as a temporary solution. This will be updated to use the sitemap (`ALLERSERVICE_URL`) in the future.

---

## Environment Variables

- Environment is chosen by `NODE_ENV` (`test`, `staging`, `production`).
- `.env.*` files are supported and gitignored.
- Example `.env.production`:
  ```
  NODE_ENV=test
  PRENUMERERA_URL=https://www.prenumerera.se/
  PRENUMERERA_LOGIN_EMAIL=test@test.se
  PRENUMERERA_LOGIN_PASSWORD=test123
  ALLERSERVICE_URL=https://www.allerservice.dk/
  PLING_DK_URL=https://www.pling.dk/
  PLING_SE_URL=https://www.pling.se/
  ```
- Axe rule tags are set in `.env`:
  ```
  AXE_TAGS=wcag2a,wcag2aa,wcag21,wcag21a,wcag21aa,en301549
  ```

---

## Usage

### 1. Install

```sh
npm install
```

### 2. Configure

- Edit `.env.*` files for your environment and base URLs.
### 3. Run

You can run all tests for an environment, or target a specific site and environment:

#### Run all tests for an environment

```sh
npm run test:test        # Uses .env.test
npm run test:staging     # Uses .env.staging
npm run test:prod        # Uses .env.production
```

#### Run only one test file

```sh
npm run test:test:allerservice
npm run test:staging:allerservice
npm run test:prod:allerservice

npm run test:test:prenumerera
npm run test:staging:prenumerera
npm run test:prod:prenumerera
```

You can also use Playwright's CLI directly:

```sh
npx playwright test tests/prenumerera-accessibility-scanner.test.ts
npx playwright test tests/allerservice-accessibility-scanner.test.ts
```

### 4. View Report

Open `artifacts/combined-accessibility-report.html` or the generated report for your run in your browser.

---

## Test Script Differences

- **Prenumerera:** Handles cookie consent and login before scanning. URLs are fetched from the sitemap.
- **AllerService:** No consent or login logic; scans all URLs from a CSV file (temporary). This will be updated to use the sitemap in the future.

---

## Adding Support for Another Site

1. Add a new `.env` variable for the site's base URL.
2. Add a new test file in `tests/` modeled after the existing ones.
3. Adjust login/consent logic as needed.
4. Add a script to `package.json` for each environment if you want easy CLI access.

---

**Summary:**  
This project scans all URLs found in a site's sitemap (or CSV, temporarily for AllerService) for accessibility issues using Playwright and axe-core, then generates a grouped HTML report. Each site can have its own test script and environment variable for configuration.