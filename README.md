# German Net Salary Calculator (Angular)

[![Deploy](https://github.com/ffrostqs/ffrostqs-German-Net-Salary-Calculator/actions/workflows/deploy.yml/badge.svg)](https://github.com/ffrostqs/ffrostqs-German-Net-Salary-Calculator/actions/workflows/deploy.yml)

A static, offline-first German net salary calculator built with Angular 17+ (Angular 19 here), Signals, RxJS, and Chart.js. The app loads tax parameters from `src/assets/data/tax-config.json`, performs calculations in the browser, and supports an optional Live API mode. A GitHub Action updates tax parameters weekly.

## Highlights

- Static site, GitHub Pages ready
- Offline after first load (tax config cached in `localStorage`)
- Weekly tax data refresh via GitHub Actions
- Live API mode toggle with local fallback
- Signals-based state + reactive form input
- Chart.js breakdown visualization

## Architecture

```
/src/app
  /core
    /services
    /models
    /utils/calc
  /features
    /salary-form
    /results-panel
    /charts
  /shared
  /store
    /signals-store
  /assets/data
    tax-config.json
```

### Calculation Engine

Pure functions in `src/app/core/utils/calc`:

- `calculate-net-salary.ts`
- `calculate-taxes.ts`
- `calculate-insurance.ts`

The engine is configuration-driven. Replace the placeholder bracket logic with an official algorithm if you need exact, legally binding calculations.

## Local Tax Data

The runtime loads tax data from:

`src/assets/data/tax-config.json`

Example format:

```json
{
  "year": 2026,
  "taxClasses": {},
  "limits": {},
  "insuranceRates": {},
  "allowances": {},
  "lastUpdated": ""
}
```

The data is cached in `localStorage` for offline usage. Use the “Force refresh tax data” button to reload the local file.

## Live API Mode (Optional)

Enable Live API Mode to call an external API for results. Update the endpoint in:

`src/app/core/utils/runtime-config.ts`

```ts
export const LIVE_API_CONFIG = {
  url: '',
  apiKey: ''
};
```

When Live mode fails, the UI shows an error and falls back to the local calculation engine.

## Weekly Tax Data Update (GitHub Actions)

Workflow file:

`.github/workflows/update-tax-data.yml`

Required secrets:

- `TAX_API_URL` – external endpoint for tax parameters
- `TAX_API_TOKEN` – optional bearer token

The workflow downloads the new JSON, compares a hash with the current file, and only commits if the data changed.

## Development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## GitHub Pages Deployment

### Auto deploy (recommended)

This repo includes a workflow that builds and publishes on each push to `main`.
To trigger manually: Actions → “Deploy to GitHub Pages”.

Output URL:
`https://ffrostqs.github.io/ffrostqs-German-Net-Salary-Calculator/`

In GitHub → Settings → Pages, set Source to **GitHub Actions**.

### Manual deploy (local)

```bash
ng build --base-href=/ffrostqs-German-Net-Salary-Calculator/
./deploy
```

Then enable GitHub Pages on the `gh-pages` branch in repository settings.

## Notes

- This project is static-only. No backend server is required.
- External API usage is limited to the optional Live Mode and the scheduled GitHub Action.
