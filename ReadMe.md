# Accessibility Scanner

Automated accessibility testing for websites using Playwright and axe-core. Generates combined HTML reports with violations grouped by rule and affected URLs.

---

## Features

- Automated accessibility scanning for all URLs found in a site's sitemap.
- Supports environments: test, staging, production.
- Cookie consent auto-accept and login flow for protected pages (Prenumerera only).
- Grouped, detailed HTML report in `/artifacts`.

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
│       ├── getSitemapUrls.ts
│       └── groupNodes.ts
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

- URLs are fetched from the sitemap of the site specified in the environment variable:
  - `PRENUMERERA_URL` for Prenumerera
  - `ALLERSERVICE_URL` for AllerService

---

## Environment Variables

- Environment is chosen by `NODE_ENV` (`test`, `staging`, `production`).
- `.env.*` files are supported and gitignored.
- Example `.env.test`:
  ```
  NODE_ENV=test
  PRENUMERERA_URL=https://www.prenumerera.se/
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

```sh
npm run test:test        # Uses .env.test
npm run test:staging     # Uses .env.staging
npm run test:prod        # Uses .env.production
```

By default, both test scripts will run. To run only one, use Playwright's CLI:

```sh
npx playwright test tests/prenumerera-accessibility-scanner.test.ts
npx playwright test tests/allerservice-accessibility-scanner.test.ts
```

### 4. View Report

Open `artifacts/combined-accessibility-report.html` in your browser.

---

## Test Script Differences

- **Prenumerera:** Handles cookie consent and login before scanning.
- **AllerService:** No consent or login logic; scans all sitemap URLs directly.

---

## Adding Support for Another Site

1. Add a new `.env` variable for the site's base URL.
2. Add a new test file in `tests/` modeled after the existing ones.
3. Adjust login/consent logic as needed.

---

**Summary:**  
This project scans all URLs found in a site's sitemap for accessibility issues using Playwright and axe-core, then generates a grouped HTML report. Each site can have its own test script and environment variable for configuration.