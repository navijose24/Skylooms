const fs = require('fs');
const path = require('path');

const structure = {
  'e2e/auth': [
    { name: 'login-valid.spec.js', title: 'TC_AUTH_001 — Login with valid credentials' },
    { name: 'login-invalid.spec.js', title: 'TC_AUTH_002 — Login with invalid credentials' },
    { name: 'login-empty.spec.js', title: 'TC_AUTH_003 — Login with empty fields' },
    { name: 'logout.spec.js', title: 'TC_AUTH_004 — Logout successfully' },
    { name: 'register.spec.js', title: 'TC_AUTH_005 — Register new user' }
  ],
  'e2e/flights': [
    { name: 'search-valid.spec.js', title: 'TC_FS_001 — Search flights with valid route and dates' },
    { name: 'search-no-results.spec.js', title: 'TC_FS_002 — Search flights with no matching results' },
    { name: 'dropdown-visibility.spec.js', title: 'TC_FS_003 — Verify autocomplete dropdown visibility' },
    { name: 'round-trip.spec.js', title: 'TC_FS_004 — Search round trip flights' }
  ],
  'e2e/booking': [
    { name: 'one-way-booking.spec.js', title: 'TC_BK_001 — Book a one-way flight' },
    { name: 'seat-count.spec.js', title: 'TC_BK_002 — Verify seat constraint when booking' },
    { name: 'booked-seats.spec.js', title: 'TC_BK_003 — Verify cannot select already booked seats' },
    { name: 'ticket-seat-number.spec.js', title: 'TC_BK_004 — Verify selected seat number is on generated ticket' },
    { name: 'download-ticket.spec.js', title: 'TC_BK_005 — Download PDF ticket' }
  ],
  'e2e/manage': [
    { name: 'retrieve-booking.spec.js', title: 'TC_MB_001 — Retrieve booking with valid PNR' },
    { name: 'retrieve-invalid.spec.js', title: 'TC_MB_002 — Retrieve booking with invalid PNR' },
    { name: 'cancel-booking.spec.js', title: 'TC_MB_003 — Cancel booking successfully' },
    { name: 'cancel-already-cancelled.spec.js', title: 'TC_MB_004 — Try to cancel an already cancelled booking' }
  ],
  'e2e/status': [
    { name: 'status-by-flight.spec.js', title: 'TC_ST_001 — Check status by flight number' },
    { name: 'status-by-route.spec.js', title: 'TC_ST_002 — Check status by route' }
  ],
  'e2e/admin': [
    { name: 'admin-login.spec.js', title: 'TC_ADM_001 — Admin login' },
    { name: 'add-flight.spec.js', title: 'TC_ADM_002 — Add new flight' },
    { name: 'view-bookings.spec.js', title: 'TC_ADM_003 — View all bookings' },
    { name: 'view-users.spec.js', title: 'TC_ADM_004 — View users list' }
  ],
  'helpers': [
    { name: 'jira-reporter.js', content: '// Jira Reporter implementation for Phase 5' },
    { name: 'test-data.js', content: 'module.exports = { validUser: { username: "joedoe123", password: "joedoe123" } };' }
  ]
};

const baseDir = __dirname;

for (const [dir, files] of Object.entries(structure)) {
  const fullDirPath = path.join(baseDir, dir);
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });
  }

  for (const file of files) {
    const filePath = path.join(fullDirPath, file.name);
    if (!fs.existsSync(filePath)) {
        let content = '';
        if (file.content) {
            content = file.content;
        } else {
            content = `const { test, expect } = require('@playwright/test');

test('${file.title}', async ({ page }) => {
    // TODO: Implement test steps
    await page.goto('/');
});
`;
        }
        fs.writeFileSync(filePath, content);
        console.log(`Created: ${filePath}`);
    } else {
        console.log(`Exists: ${filePath}`);
    }
  }
}
