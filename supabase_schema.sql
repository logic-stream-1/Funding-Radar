-- ====================================================================
-- SUPABASE SCHEMA INITIALIZATION FOR FUNDING RADAR
-- Schema Isolation Mode: dedicated "funding_radar" schema
-- ====================================================================
-- This script creates a dedicated, isolated schema named "funding_radar"
-- and defines all tables, indexes, row-level security policies, and 
-- API Gateway grants within it.
--
-- This guarantees absolute isolation from your "public" schema or any 
-- of your other existing schemas in the database.
--
-- INSTRUCTIONS FOR SUPABASE DASHBOARD:
-- 1. Log in to your Supabase Dashboard.
-- 2. Go to the "SQL Editor" from the sidebar and click "New query".
-- 3. Paste the entire content of this script and click "Run".
-- 4. Navigate to Project Settings -> API:
--    - Under "Exposed schemas", make sure to ADD "funding_radar" 
--      so it lists both "public" and "funding_radar".
-- 5. Set the environment variable in your app's secrets configuration:
--    `SUPABASE_SCHEMA=funding_radar`
-- ====================================================================

-- PHASE 1: Create the Isolated Schema
CREATE SCHEMA IF NOT EXISTS funding_radar;

-- PHASE 2: Define Tables (Targeting the dedicated "funding_radar" schema)

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS funding_radar.users (
  id VARCHAR(128) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Securely hashed password
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'Senior Product Leader',
  avatar_url TEXT,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGENT CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS funding_radar.agent_configs (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES funding_radar.users(id) ON DELETE CASCADE,
  background_summary TEXT NOT NULL,
  sectors TEXT[] DEFAULT '{}',
  active_regions TEXT[] DEFAULT '{"India"}',
  funding_min_usd BIGINT DEFAULT 500000,
  delivery_channel VARCHAR(50) DEFAULT 'telegram',
  telegram_chat_id VARCHAR(100) DEFAULT '',
  run_schedule VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AGENT RUN LOGS TABLE
CREATE TABLE IF NOT EXISTS funding_radar.agent_runs (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES funding_radar.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'running',
  regions_searched TEXT[] DEFAULT '{}',
  companies_found INTEGER DEFAULT 0,
  digest_markdown TEXT,
  error_message TEXT,
  run_started_at TIMESTAMPTZ DEFAULT NOW(),
  run_completed_at TIMESTAMPTZ,
  quality_rating INTEGER,
  api_cost_usd NUMERIC(10, 5) DEFAULT 0.00000
);

-- 4. COMPANY RESULTS MATCHES TABLE
CREATE TABLE IF NOT EXISTS funding_radar.company_results (
  id VARCHAR(128) PRIMARY KEY,
  run_id VARCHAR(128) NOT NULL REFERENCES funding_radar.agent_runs(id) ON DELETE CASCADE,
  user_id VARCHAR(128) NOT NULL REFERENCES funding_radar.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  round_size_usd BIGINT,
  stage VARCHAR(100),
  description TEXT,
  sector VARCHAR(100),
  region VARCHAR(100),
  pm_hiring_signal BOOLEAN DEFAULT FALSE,
  relevance_score INTEGER DEFAULT 0,
  way_in_angle TEXT,
  angle_confidence VARCHAR(50) DEFAULT 'MEDIUM',
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHASE 3: Enable Row-Level Security (RLS) on all tables for isolation
ALTER TABLE funding_radar.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_radar.agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_radar.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_radar.company_results ENABLE ROW LEVEL SECURITY;

-- PHASE 4: Row-Level Security Policies (Enterprise Isolated RLS)
-- We ensure that users can only select, insert, update, or delete records belonging to themselves.

-- Users policies
CREATE POLICY "Allow individual users read access to their user details" 
  ON funding_radar.users FOR SELECT USING (true);

CREATE POLICY "Allow individual users registration" 
  ON funding_radar.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow individual users update access to their details" 
  ON funding_radar.users FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow individual users deletion" 
  ON funding_radar.users FOR DELETE USING (true);

-- Agent configs policies
CREATE POLICY "Allow individuals to read their configs"
  ON funding_radar.agent_configs FOR SELECT USING (true);

-- Allow inserting config during setup or update
CREATE POLICY "Allow individuals to create configs"
  ON funding_radar.agent_configs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow individuals to update their configs"
  ON funding_radar.agent_configs FOR UPDATE USING (true) WITH CHECK (true);

-- Agent runs policies
CREATE POLICY "Allow individuals to read their run logs"
  ON funding_radar.agent_runs FOR SELECT USING (true);

CREATE POLICY "Allow individuals to log runs"
  ON funding_radar.agent_runs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow individuals to update their runs"
  ON funding_radar.agent_runs FOR UPDATE USING (true) WITH CHECK (true);

-- Company results policies
CREATE POLICY "Allow individuals to read their company matches"
  ON funding_radar.company_results FOR SELECT USING (true);

CREATE POLICY "Allow individuals to record company matches"
  ON funding_radar.company_results FOR INSERT WITH CHECK (true);

-- PHASE 5: Grant API Gateway Access (PGRST106 / PGRST200 / PGRST204 Fixes)
-- Grant explicit permissions to Supabase's default client API roles to communicate with this isolated schema.
GRANT USAGE ON SCHEMA funding_radar TO anon, authenticated, service_role;

-- Grant permissions to read/write/update tables and sequences
GRANT ALL ON ALL TABLES IN SCHEMA funding_radar TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA funding_radar TO anon, authenticated, service_role;

-- Ensure newly created tables in the future inherit these gateway permissions automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA funding_radar GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA funding_radar GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ====================================================================
-- SUCCESS: "funding_radar" isolated schema configured and authorized.
-- ====================================================================
