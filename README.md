# Tutor Marketplace

A platform connecting students who need help (exit exam prep, coding, English, and more) with tutors who can teach it — booking, ratings, and reviews included.

**Live API:** https://tutor-marketplace-backend-production.up.railway.app

## Why I built this

As a Computer Science graduate preparing for my own exit exam, I saw how hard it was for students around me to find the right person to help with a specific subject. This project solves that: a simple way to search for a tutor by subject, book a session, and leave a review afterward — the same loop I wished existed for myself and my classmates.

## Features

- **Auth** — signup/login for two roles: learner and tutor, with JWT-based sessions
- **Tutor profiles** — bio, subjects taught, hourly rate (or free), availability
- **Search** — find tutors by subject, sorted by rating
- **Booking flow** — request a session, tutor accepts/declines, either side marks it complete
- **Reviews** — learners rate and review after a completed session, feeding into the tutor's average rating

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt for password hashing
- **Hosting:** Railway (API + database)

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Create an account (learner or tutor) |
| POST | `/auth/login` | Log in, returns a JWT |
| GET | `/tutors?subject=X` | Search tutors by subject |
| GET | `/tutors/:id` | Get a tutor's public profile |
| PUT | `/tutors/me` | Create/update your own tutor profile (tutor only) |
| POST | `/bookings` | Request a session (learner only) |
| GET | `/bookings/mine` | List your bookings (either role) |
| PATCH | `/bookings/:id` | Accept/decline/complete a booking |
| POST | `/reviews` | Review a completed booking (learner only) |
| GET | `/tutors/:id/reviews` | List a tutor's reviews |

## Running Locally

```bash
npm install
cp .env.example .env   # then fill in your DATABASE_URL and JWT_SECRET
psql $DATABASE_URL -f schema.sql
npm run dev
```

Server runs on `http://localhost:5000` by default.

## What's Next

- React frontend
- Curated learning resources per subject, with link previews
- In-app messaging between learner and tutor

---

Built by [Biruk Girma (Bura)](https://github.com/Buravetran)