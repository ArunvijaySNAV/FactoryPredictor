CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'boss'))
);

CREATE TABLE machines (
  id TEXT PRIMARY KEY,
  machine_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE telemetry (
  id TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL REFERENCES machines(id),
  timestamp TIMESTAMP NOT NULL,
  temperature NUMERIC NOT NULL,
  vibration NUMERIC NOT NULL,
  power NUMERIC NOT NULL,
  rpm NUMERIC NOT NULL,
  wear_score NUMERIC NOT NULL
);

CREATE TABLE predictions (
  id TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL REFERENCES machines(id),
  timestamp TIMESTAMP NOT NULL,
  failure_risk NUMERIC NOT NULL,
  remaining_life_hours NUMERIC NOT NULL,
  next_hour_power NUMERIC NOT NULL
);

CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL REFERENCES machines(id),
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  summary_json JSONB NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id),
  receiver_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('operator', 'boss')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

