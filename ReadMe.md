# Accessibility Check

Automated accessibility testing for websites using Playwright and axe-core. Generates combined HTML reports with violations grouped by rule and affected URLs.

---

## Status

**Early Version:**
This project currently supports a single website/configuration (`prenumerera`). To support more sites (e.g. `allerservice`), duplicate the pattern (scanner test file + URLs file) and adjust imports as needed. Multi-site support will be streamlined in future versions.

---

## Features

* Automated accessibility scanning for all URLs in the environment file.
* Environments: test, staging, production.
* Cookie consent auto-accept.
* Grouped, detailed HTML report in `/artifacts`.

---

## Project Structure

```
.
├── artifacts/
│   └── combined-accessibility-report.html   # Output HTML report
├── node_modules/
├── src/
│   ├── config/
│   │   ├── prenumerera.production.urls.ts
│   │   ├── prenumerera.staging.urls.ts
│   │   └── prenumerera.test.urls.ts
│   ├── types/
│   │   └── groupedViolation.d.ts
│   └── reporter.ts
├── tests/
│   └── prenumerera-accessinility-scanner.test.ts
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

* URLs are in TypeScript arrays, one file per environment, under `src/config/`.
* Example: `prenumerera.test.urls.ts`

  ```typescript
  export default [
    "https://prenumerera.se/",
    // ...
  ];
  ```
* To add support for another site (e.g. allerservice):

  1. Add `src/config/allerservice.test.urls.ts` etc.
  2. Add `tests/allerservice-accessinility-scanner.test.ts` with matching imports.

---

## Environment Variables

* Environment chosen by `NODE_ENV` (`test`, `staging`, `production`).
* `.env.*` files are supported and gitignored.
* Sensitive config should go in the relevant `.env.[env]` file.

---

## Usage

### 1. Install

```sh
npm install
```

### 2. Edit URLs

Add/edit URLs in the config files.

### 3. Run

```sh
npm run test:test        # .env.test + prenumerera.test.urls.ts
npm run test:staging     # .env.staging + prenumerera.staging.urls.ts
npm run test:prod        # .env.production + prenumerera.production.urls.ts
```

### 4. View Report

Open `artifacts/combined-accessibility-report.html` in your browser.

---

## Roadmap

* [ ] Extract active pages from CMS per site
* [ ] Add scripts for AllerService and Pling SE/DK
* [ ] Per-site and per-env reporting

---

## License

MIT

---

**Summary:**
Early version, supports one config/site at a time. Add more by copying the pattern (URLs + scanner test). Edit `src/config/`, set `NODE_ENV`, run tests, read `/artifacts/combined-accessibility-report.html`. Environment files control any secrets or config.
