# API Testing Guide: Postman & Playwright for Skylooms

This guide explains how to perform API testing for the Skylooms project, covering both manual testing with Postman and automated testing with Playwright.

---

## 1. What is API Testing?

API (Application Programming Interface) testing involves verifying that the "brain" of the application (the backend) works correctly before the "face" (the frontend/UI) is involved.

- **Manual Testing (Postman)**: Using a tool to send requests manually and check responses. Best for exploration, quick debugging, and initial development.
- **Automated Testing (Playwright)**: Writing code to send requests and verify responses automatically. Best for regression testing (making sure new changes don't break old features).

---

## 2. Why API Testing?

1.  **Earlier Testing**: You can test the backend before the UI is finished.
2.  **Faster Execution**: API tests run in milliseconds, whereas UI tests (opening a browser) take seconds or minutes.
3.  **Better Coverage**: You can easily test "edge cases" (like sending a negative price) that might be hard to do through the UI.
4.  **Isolation**: If a test fails, you know if the bug is in the data/logic (API) or the display (UI).

---

## 3. The Basics You Need to Know

### A. HTTP Methods (The "Verbs")
- **GET**: Retrieve data (e.g., Get list of flights).
- **POST**: Create data (e.g., Book a flight or Login).
- **PUT/PATCH**: Update data (e.g., Update profile).
- **DELETE**: Remove data (e.g., Cancel a booking).

### B. Status Codes (The "Check-in")
- **200 OK**: Request succeeded.
- **201 Created**: Successful creation (POST).
- **400 Bad Request**: Your request is wrong (missing data).
- **401 Unauthorized**: You need to login.
- **403 Forbidden**: You don't have permission.
- **404 Not Found**: The endpoint doesn't exist.
- **500 Internal Server Error**: The server crashed!

### C. Authentication (JWT)
Skylooms uses **JWT (JSON Web Tokens)**. 
1. You login via `/api/auth/login/`.
2. You get an `access` token.
3. Every subsequent request must include this token in the header:
   `Authorization: Bearer <your_token>`

---

## 4. Manual Testing with Postman

### Step-by-Step for Skylooms:
1.  **Open Postman** and create a new **Collection** named "Skylooms".
2.  **Set a Variable**: Go to Collection -> Variables and add `base_url` with value `http://localhost:8000`.
3.  **Create a Request**:
    - Method: `GET`
    - URL: `{{base_url}}/api/airports/`
    - Click **Send**.
4.  **Add Assertions** (The "Test"): Click the "Tests" tab and add:
    ```javascript
    pm.test("Status is 200", () => pm.response.to.have.status(200));
    pm.test("Content-Type is JSON", () => pm.response.to.be.json);
    ```

---

## 5. API Automation with Playwright

Playwright is not just for browsers! It can send HTTP requests directly.

### Example Spec (`tests/api/search.spec.js`):
```javascript
const { test, expect } = require('@playwright/test');

test('verify flight search API returns data', async ({ request }) => {
  // 1. Send GET request
  const response = await request.get('/api/flights/search/', {
    params: {
      source: 'DEL',
      destination: 'BOM',
      date: '2024-05-25'
    }
  });

  // 2. Validate status
  expect(response.status()).toBe(200);
  
  // 3. Validate body
  const body = await response.json();
  expect(body.length).toBeGreaterThan(0);
});
```

---

## 6. How to prepare for the Task

To ace this task, follow this workflow:

1.  **Map the Endpoints**: Look at `backend/config/urls.py`.
2.  **Manual Check**: Use Postman to trigger a search, a login, and a booking.
3.  **Automate**: Create a new folder `tests/api/` and write one test for each core feature.
4.  **Negative Testing**: Try to search for a flight from "Nowhere" to "Somewhere" and ensure the API handles it gracefully (e.g., returns 400 or an empty list).

---

### Key Takeaway
Manual testing is for **understanding**; Automation is for **confidence**.
Ready to dive in? Let me know which part you want to try first!
