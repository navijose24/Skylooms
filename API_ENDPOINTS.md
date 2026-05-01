# Skylooms API Endpoints Mapping

This document maps out all the available API endpoints in the Skylooms backend based on `backend/config/urls.py`. These endpoints will be used for both manual testing (Postman) and automated testing (Playwright).

---

## 🔐 Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | `POST` | Register a new user |
| `/api/auth/login/` | `POST` | Login user, returns JWT tokens |
| `/api/auth/token/refresh/` | `POST` | Refresh expired JWT token |

---

## ✈️ Flights & Airports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/airports/` | `GET` | Retrieve a list of all airports |
| `/api/flights/search/` | `GET` | Filter flights by source, destination, and date |
| `/api/flights/seats/` | `GET` | Get live seat availability for given flight IDs |
| `/api/flights/status/` | `GET` | Retrieve simulated real-time flight status |

---

## 🏨 Recommendations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recommendations/` | `GET` | Get hotel and cab recommendations for a destination city |

---

## 🎫 Bookings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings/` | `POST` | Create a new booking |
| `/api/bookings/search/` | `GET` | Look up a booking by reference ID and last name |
| `/api/bookings/<int:pk>/` | `GET` | Retrieve booking details by ID |
| `/api/bookings/<int:pk>/cancel/` | `POST` | Cancel a booking (with time-based refund logic) |
| `/api/bookings/<int:pk>/ticket/` | `GET` | Download booking ticket as plain text |

---

## 🛠️ Admin (Requires Admin/Staff Privileges)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/` | `GET` | Get system analytics for the dashboard |
| `/api/admin/flights/` | `GET/POST/PUT/DELETE` | Manage flights |
| `/api/admin/hotels/` | `GET/POST/PUT/DELETE` | Manage hotels |
| `/api/admin/transport/` | `GET/POST/PUT/DELETE` | Manage transports (cabs) |
| `/api/admin/bookings/` | `GET/POST/PUT/DELETE` | Manage user bookings |
| `/api/admin/users/` | `GET/POST/PUT/DELETE` | Manage platform users |
