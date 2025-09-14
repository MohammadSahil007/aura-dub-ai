-- jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  platform TEXT, -- 'youtube'|'upload'
  source_url TEXT,
  status TEXT DEFAULT 'pending', -- pending|processing|done|failed|flagged
  minutes_requested INT DEFAULT 5,
  minutes_processed INT DEFAULT 0,
  result_url TEXT,
  oauth_channel_id TEXT,
  consent_record_id INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- user quotas
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id INT PRIMARY KEY REFERENCES users(id),
  minutes_used INT DEFAULT 0,
  free_lifetime_limit INT DEFAULT 30
);

-- credits
CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  balance INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  change_amount INT,
  reason TEXT,
  job_id INT,
  provider TEXT,
  provider_payment_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- dmca notices
CREATE TABLE IF NOT EXISTS dmca_notices (
  id SERIAL PRIMARY KEY,
  claimant_name TEXT,
  claimant_email TEXT,
  claimant_address TEXT,
  infringing_url TEXT,
  description TEXT,
  job_id INT,
  status TEXT DEFAULT 'received', -- received|actioned|rejected
  created_at TIMESTAMP DEFAULT now()
);

-- consent logs
CREATE TABLE IF NOT EXISTS consent_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  job_id INT,
  statement TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);
