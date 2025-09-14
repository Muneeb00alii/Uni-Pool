

# UniPool

## 🚗 Overview


UniPool is a modern ride-sharing platform designed for FCCU students. It enables users to offer and find rides, book seats, and manage ride history in a secure, verified community. The app features a polished UI, interactive map, location suggestions, and robust authentication.

---

## 🌟 Features

- **FCCU Authentication:** Only users with valid FCCU emails can register and log in.
- **Offer & Find Rides:** Post rides as a driver or search for available rides as a passenger.
- **Booking System:** Book seats in available rides, with real-time seat management.
- **Recurring Rides:** Drivers can offer rides on recurring days.
- **Ride History:** View rides you have offered and booked.
- **Profile & Ratings:** Manage your profile, view ratings, and ride stats.

- **Interactive Map:** Select pickup/dropoff locations using a live map (Leaflet).
- **Location Suggestions:** Context-aware suggestions for locations and routes.
- **Modern UI:** Built with Tailwind CSS, Radix UI, and custom glassmorphism/neumorphism effects.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI, Lucide Icons
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL (via Prisma)
- **Authentication:** JWT, bcryptjs
- **Map:** Leaflet.js

- **Suggestions:** Custom suggestion hooks

 - **Deployment:** Self-host or deploy to any supported hosting provider.

---

## 📦 Project Structure

```
app/
  components/         # UI components (map, ride card, modals, etc.)
  contexts/           # React context providers (auth, etc.)
  hooks/              # Custom React hooks (use-auth, use-rides, use-ai)
  api/                # Next.js API routes (auth, rides, booking, etc.)
  globals.css         # Global styles
  layout.tsx          # App layout
  page.tsx            # Main app page
components/           # Shared UI components (Radix UI wrappers)
lib/                  # Utility libraries (auth, prisma, etc.)
prisma/               # Prisma schema
public/               # Static assets
styles/               # Additional styles
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm/yarn
- PostgreSQL database

### Installation

1. **Clone the repository:**
	```sh
	git clone https://github.com/your-username/uni-pool.git
	cd uni-pool
	```
2. **Install dependencies:**
	```sh
	pnpm install
	# or
	npm install
	```
3. **Configure environment variables:**
	- Copy `.env.example` to `.env` and set your `DATABASE_URL` for PostgreSQL.

4. **Setup the database:**
	```sh
	pnpx prisma migrate dev
	pnpx prisma generate
	```

5. **Run the development server:**
	```sh
	pnpm dev
	# or
	npm run dev
	```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 🧑‍💻 Usage Guide

### Registration & Login
- Only FCCU emails (`@formanite.fccollege.edu.pk`) are accepted.
- Password must be at least 8 characters.
- Roll number format: `261XXXXXX`.

### Offering a Ride
- Fill pickup/dropoff, date, time, and available seats.
- Optionally set recurring days for regular rides.

### Finding & Booking a Ride
- Search by pickup, dropoff, date, and time.
- Book available seats in listed rides.

### Ride History & Profile
- View all rides you have offered and booked.
- Edit your profile and view your rating.

### Map & Suggestions
- Use the interactive map to select locations.
- Get context-aware suggestions for routes and locations.

---

## 🗄️ Database Models (Prisma)

### User
- id, email, password, name, rollNumber, avatar, rating, totalRides, isVerified

### Ride
- id, driverId, pickup, dropoff, departureTime, availableSeats, totalSeats, price, route, isRecurring, recurringDays

### Booking
- id, rideId, passengerId, status

---

## 🧩 API Endpoints

- `POST /api/users/register` — Register new user
- `POST /api/users/login` — Login user
- `POST /api/rides/create` — Offer a ride
- `POST /api/rides/search` — Search for rides
- `GET /api/rides/history` — Get ride history
- `POST /api/rides/book` — Book a ride (endpoint exists, see code)

---

## 🎨 UI & Styling

- Tailwind CSS custom themes (light/dark)
- Glassmorphism & neumorphism effects
- Responsive and accessible design

---

## 🏷️ Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT authentication

---

## 📝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---


---

## 🙏 Credits

- Developed by the Muneeb Ali for FCCU students.
- UI and design powered by Tailwind CSS and Radix UI.
