# Tutor Marketplace — Backend (Week 1: Setup + Auth)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Postgres database, then copy `.env.example` to `.env` and fill in your real values:
   ```
   cp .env.example .env
   ```

3. Run the schema to create tables:
   ```
   psql $DATABASE_URL -f schema.sql
   ```

4. Start the server:
   ```
   npm run dev
   ```

Server runs on `http://localhost:5000` by default.

## Test the auth endpoints

**Signup**
```
POST /auth/signup
{
  "name": "Bura",
  "email": "bura@example.com",
  "password": "test1234",
  "role": "learner"
}
```

**Login**
```
POST /auth/login
{
  "email": "bura@example.com",
  "password": "test1234"
}
```

Both return `{ user, token }`. Use the token as `Authorization: Bearer <token>` on any protected route later.

## What's next

- Week 2: tutor profile routes + subject search (`/tutors`)
- Week 3: booking routes (`/bookings`)
- Week 4: reviews + resources

Ask Claude to build the next piece whenever you're ready.
