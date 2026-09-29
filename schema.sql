CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) CHECK (role IN ('learner', 'tutor')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tutor_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] NOT NULL,
  hourly_rate NUMERIC(10,2),
  is_free BOOLEAN DEFAULT FALSE,
  availability TEXT
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER REFERENCES users(id),
  tutor_id INTEGER REFERENCES users(id),
  subject VARCHAR(100) NOT NULL,
  requested_time TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending','accepted','declined','completed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  added_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
