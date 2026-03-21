# ✈️ SkyLooms - Smart Airline Ticket Booking System

SkyLooms is a premium, modern airline booking platform designed to provide a seamless travel experience. With a stunning glassmorphic UI and a robust Django backend, it offers everything from flight searching to accommodation and cab bookings.


## 🌟 Key Features

-   **🔍 Smart Search**: Advanced flight search with support for multi-city, round trips, and flexible dates.
-   **🏨 Integrated Accommodations**: Book luxury stays alongside your flights.
-   **🚕 Cab Services**: seamless airport transfers and local cab rentals.
-   **📊 Real-time Status**: Track your flight status in real-time with live updates.
-   **📁 Booking Management**: Easily view, manage, and cancel your upcoming trips.
-   **💡 Personalized Recommendations**: AI-driven suggestions based on your travel preferences.
-   **🤖 Travel Assistant**: Integrated chatbot to help with queries and bookings.

## 🚀 Tech Stack

### Frontend
-   **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Routing**: [React Router 7](https://reactrouter.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Styling**: Premium Vanilla CSS with Glassmorphism & Micro-animations
-   **API Client**: [Axios](https://axios-http.com/)

### Backend
-   **Framework**: [Django](https://www.djangoproject.com/)
-   **API**: [Django REST Framework](https://www.django-rest-framework.org/)
-   **Database**: SQLite (Development) / PostgreSQL (Production ready)
-   **Architecture**: Modular (Flights, Bookings, Accommodations, Cabs)

## 🛠️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   Git

### 1. Clone the Repository
```bash
git clone https://github.com/navijose24/skylooms.git
cd skylooms
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python seed.py  # Populate initial data
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application should now be running at `http://localhost:5173`.

## 🎨 Design Philosophy
SkyLooms follows a **Premium Dark Aesthetic** inspired by modern airline portals like FlyAirlink. Key design elements include:
-   **Glassmorphism**: Translucent panels with background blur.
-   **Rich Gradients**: Deep navy and sky blue tones.
-   **Micro-animations**: Smooth transitions and hover effects for a responsive feel.
-   **Typography**: Clean and bold 'Outfit' font for high readability.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
