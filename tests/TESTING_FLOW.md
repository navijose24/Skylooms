# Skylooms Test Automation Framework

This documentation provides a comprehensive overview of the Skylooms testing ecosystem, built with **Playwright** and integrated with **Jira (Xray)** for automated defect tracking.

## 📂 Folder Structure Overview

The `tests/` directory is organized into logical modules that mirror the application's core functionality.

```text
tests/
├── .env                    # Jira API credentials & environment config
├── playwright.config.js    # Global Playwright settings & reporter setup
├── create-tests.js         # Script to scaffold the test directory structure
├── populate-tests.js       # Script to inject test logic into spec files
├── e2e/                    # Main End-to-End test suites
│   ├── admin/              # Admin dashboard & flight management tests
│   ├── auth/               # Login, Register, and Session tests
│   ├── booking/            # Flight reservation & ticket generation tests
│   ├── flights/            # Flight search & discovery tests
│   ├── manage/             # PNR retrieval & cancellation tests
│   └── status/             # Real-time flight status tests
├── helpers/                # Reusable utilities
│   ├── jira-reporter.js    # Custom reporter for Jira automation
│   └── test-data.js        # Shared constants (users, URLs, etc.)
└── reports/                # (Generated) Screenshots, videos, and HTML reports
```

---

## 🛠️ Core Configuration Files

### 1. `playwright.config.js`
The central hub for all test settings. It defines:
- **Base URL**: Set to `http://localhost:5173` for local development.
- **Artifacts**: Automatically records video for every test and captures screenshots on failure.
- **Reporters**: Configured to use both the built-in HTML reporter and the custom `./helpers/jira-reporter.js`.
- **Browsers**: Runs tests across Chromium, Firefox, and Webkit for maximum coverage.

### 2. `.env`
Stores sensitive Jira integration data:
- `JIRA_API_TOKEN`: Personal access token for API authentication.
- `JIRA_PROJECT_KEY`: The target project (e.g., `SQ`).
- `JIRA_URL`: The workspace endpoint.

---

## 🏗️ Test Infrastructure & Helpers

### 1. `helpers/jira-reporter.js`
Our custom-built integration. On every test completion:
- It checks the test status (`passed`, `failed`, or `timedOut`).
- If a test fails, it automatically creates a new **Bug** in Jira.
- It attaches the **Error Stack Trace** to the issue description.
- It uploads **Screenshots** and **Videos** directly to the Jira ticket as evidence.

### 2. `helpers/test-data.js`
A centralized repository for test constants (e.g., valid user credentials, mock PNRs) used across multiple suites to prevent hardcoding.

---

## 🧪 E2E Modules Breakdown

| Folder | Description | Key Test Cases |
| :--- | :--- | :--- |
| **`auth/`** | Validates identity management. | Valid/Invalid login, account registration, logout flow. |
| **`flights/`** | Tests the search engine. | Route searching, autocomplete dropdowns, round-trip logic. |
| **`booking/`** | Tests the reservation engine. | Ticket booking, seat selection constraints, PDF generation. |
| **`manage/`** | Tests post-booking actions. | PNR retrieval, cancellation policies, already-cancelled checks. |
| **`status/`** | Tests informational services. | Checking status by flight number vs. route logic. |
| **`admin/`** | Tests internal workflows. | Flight inventory management, viewing user databases. |

---

## 🔄 Actual Workflow

### 1. Initialization (One-time)
We use automation scripts to keep the test suite consistent:
- `node create-tests.js`: Creates the folder structure and empty spec files.
- `node populate-tests.js`: Injects the actual Playwright code into those files.

### 2. Execution
To run the full suite:
```bash
npx playwright test
```
To run a specific module (e.g., auth):
```bash
npx playwright test auth
```

### 3. Reporting & Feedback Loop
1. **Local View**: After execution, use `npx playwright show-report` to see a detailed visual breakdown of the run.
2. **Jira Automation**: 
   - If `TC_BK_001` fails, the **Jira Reporter** checks if it's a known issue.
   - If not, it creates a ticket with the title: `[Automation Failure] TC_BK_001 — Book a one-way flight`.
   - The developer opens Jira, sees the attached video of the failure, and fixes the bug.
   - On the next run, if the test passes, the cycle is complete.

---

## 📈 Summary Table

| Script/File | Purpose | Frequency |
| :--- | :--- | :--- |
| `create-tests.js` | Structure Setup | Only when adding new modules |
| `populate-tests.js` | Code Sync | When updating test logic globally |
| `npx playwright test` | Execution | On every code change / PR |
| `jira-reporter.js` | Syncing | Automatic during test runs |
