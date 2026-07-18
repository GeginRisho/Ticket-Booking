# TicketShow - Online Movie & Event Ticket Booking Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62B)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

TicketShow is a premium, high-performance, and scalable online movie and event ticket booking platform inspired by BookMyShow. The project contains a fully optimized PostgreSQL database design, secure session authentication, role-based access control, and a modern light theme frontend with responsive interfaces.

---

## 🔗 Project Links
*   **⭐ GitHub Repository**: [https://github.com/GeginRisho/Ticket-Booking](https://github.com/GeginRisho/Ticket-Booking)
*   **🐞 Report Issue**: [https://github.com/GeginRisho/Ticket-Booking/issues](https://github.com/GeginRisho/Ticket-Booking/issues)
*   **📄 Documentation**: [https://github.com/GeginRisho/Ticket-Booking#readme](https://github.com/GeginRisho/Ticket-Booking#readme)

---

## 📸 Screenshots

| Landing Page | Seat Map Booking |
| :--- | :--- |
| ![Landing Page](./docs/screenshots/landing_page.png) | ![Seat Map Selection](./docs/screenshots/seat_booking.png) |

---

## 🚀 Key Features

*   **Premium Light Theme UI**: Material 3/Apple/Stripe inspired visual design with an amber-yellow aesthetic, rounded 24px cards, custom shadows, and glassmorphism.
*   **Home Page Sections**: Sliced sections for Recommended, Now Showing, Coming Soon, Trending, Popular, Top Rated, and Latest Releases. Includes event groups (Concerts, Sports, Comedy, Theatre, Workshops).
*   **Interactive Seat Selection**: Live screen seating maps supporting VIP, Premium, Normal, Couple, and Accessible seat categories case-insensitively with legends and responsive sizing.
*   **Billing & Checkout**: Convenience charge, discount validation, flat/percentage coupons, dynamic invoices, and Stripe simulated checkouts.
*   **Dashboard Panels**:
    *   **Customer**: QR-code tickets generator, history tracking, favorites wishlist, reviews, notification hub.
    *   **Theatre Owner**: Create theatres, screens layouts creator, assign show timings (Morning, Afternoon, Evening, Night), and Recharts charts.
    *   **Event Organizer**: Custom event banner uploads, coordinate maps, ticket inventory logs, and revenue charts.
    *   **Admin**: Total portal manager (approve theatres/events, toggle coupons, analytics).

---

## 💻 Tech Stack

*   **Frontend**: React (v18), Vite, Tailwind CSS, Framer Motion, Swiper, Recharts, Lucide/Fi Icons.
*   **Backend**: Node.js, Express.js, JWT, bcrypt, Express Validator, Helmet, CORS.
*   **Database**: PostgreSQL (v17), Sequelize ORM.
*   **Orchestration**: Docker, Docker Compose.

---

## 📁 Repository Structure

```
Ticket-Booking/
│
├── backend/            # Node.js + Express API Backend service
│   ├── config/         # Sequelize database connections
│   ├── controllers/    # API endpoint request controllers
│   ├── models/         # 3NF Database Models (PostgreSQL)
│   ├── migrations/     # Database migration scripts
│   ├── routes/         # Express endpoint routing
│   ├── scripts/        # Massive database seeder scripts
│   └── services/       # Decoupled business logic layers
│
├── frontend/           # React + Vite + Tailwind CSS Frontend client
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # JWT Authentication contexts
│   │   ├── dashboard/  # Role-specific dashboard layouts
│   │   ├── layouts/    # Global layout frameworks (Header, Footer, Sidebar)
│   │   ├── pages/      # Lazy loaded views (MovieDetails, SeatBooking, Payment)
│   │   └── services/   # Backend integration service handlers
│   └── vite.config.js  # Vite settings
│
├── docs/               # Screenshots, architecture diagrams, and DB schema
│   └── screenshots/    # Place mock landing page captures here
│
├── README.md
├── LICENSE             # MIT License
├── .gitignore          # Production cleanups and secret ignores
└── docker-compose.yml  # Multi-container local orchestration script
```

---

## ⚙️ Environment Variables

### Backend Configuration (`/backend/.env`)
```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=ticket_booking
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
BCRYPT_SALT_ROUNDS=12
```

### Frontend Configuration (`/frontend/.env`)
```env
VITE_API_URL=http://127.0.0.1:5000/api
```

---

## 🛠️ Installation & Setup Guide

### Option 1: Docker Compose (Recommended)
Launch the database, backend services, and frontend app in one command:
```bash
docker-compose up --build
```
This runs the client on `http://127.0.0.1:3000` and the backend on `http://127.0.0.1:5000`.

### Option 2: Local Manual Setup

#### Step 1: PostgreSQL Database Configuration
Create a database in PostgreSQL named `ticket_booking`.

#### Step 2: Backend Setup
1.  Navigate into `/backend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Apply DB migrations:
    ```bash
    npx sequelize-cli db:migrate
    ```
4.  Run massive seeder (populates 40 movies, 30 events, 25 theatres, 200 shows, 180 bookings, and reviews):
    ```bash
    node scripts/seed_demo_data.js
    ```
5.  Start backend server:
    ```bash
    npm run dev
    ```

#### Step 3: Frontend Setup
1.  Navigate into `/frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch Vite client:
    ```bash
    npm run dev
    ```
4.  To compile a production-ready optimized build:
    ```bash
    npm run build
    ```

---

## 🔑 Demo Account Credentials

Use these seeded email accounts to log in as different roles (all share password: `Password123!`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@ticketshow.com` | `Password123!` |
| **Customer** | `customer@ticketshow.com` | `Password123!` |
| **Theatre Owner** | `owner@ticketshow.com` | `Password123!` |
| **Event Organizer** | `organizer@ticketshow.com` | `Password123!` |

---

## 📡 API Endpoints Overview

*   **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh-token`, `/api/auth/profile`
*   **Movies**: `/api/movies` (Filter, Search), `/api/movies/:id`
*   **Shows**: `/api/shows/:showId/seats` (Aisle gap layout & seat structures)
*   **Bookings**: `/api/bookings/movie` (Lock seats), `/api/bookings/event` (Create ticket), `/api/bookings/my-bookings`, `/api/bookings/:id/cancel`
*   **Payments**: `/api/payments/process`
*   **Coupons**: `/api/coupons/validate`

---

## 🔮 Future Improvements

1.  **Real-Time Seat Locks**: Integrate Socket.io on the seat selection grid to show live seat locks.
2.  **Notification Hub**: Push notifications using web sockets.
3.  **Analytics Panels**: Export owner revenue sheets to PDF and Excel spreadsheets.
4.  **Google/Apple Single Sign-On (SSO)**: Add OAuth2 social logins.

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
