-- ============================================
-- VITALITY HEALTH TRACKER - SUPABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,  -- Must match auth.users.id
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users - allow insert for new users
CREATE POLICY "Users can access own data" ON users
  FOR ALL
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. FASTING SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  window_type TEXT NOT NULL,
  target_duration_hours NUMERIC NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_duration_hours NUMERIC,
  hunger_level INTEGER,
  energy_level INTEGER,
  broken_early BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fasting_sessions
CREATE INDEX IF NOT EXISTS idx_fasting_user_id ON fasting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_start_time ON fasting_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_fasting_active ON fasting_sessions(user_id, end_time) WHERE end_time IS NULL;

-- Enable RLS
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own fasting data" ON fasting_sessions
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 3. AVOIDANCE ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS avoidance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  avoidance_type TEXT NOT NULL,
  custom_name TEXT,
  avoided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, avoidance_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_avoidance_user_id ON avoidance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_avoidance_date ON avoidance_entries(date);

-- Enable RLS
ALTER TABLE avoidance_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own avoidance data" ON avoidance_entries
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 4. WALKING ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS walking_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  step_count INTEGER DEFAULT 0,
  total_distance_km NUMERIC DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_walking_user_id ON walking_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_walking_date ON walking_entries(date);

-- Enable RLS
ALTER TABLE walking_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own walking data" ON walking_entries
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 5. EXERCISE SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT,
  cardio_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_user_id ON exercise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_date ON exercise_sessions(date);
CREATE INDEX IF NOT EXISTS idx_exercise_type ON exercise_sessions(exercise_type);

-- Enable RLS
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own exercise data" ON exercise_sessions
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 6. HYDRATION ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hydration_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  total_ml INTEGER DEFAULT 0,
  entries JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hydration_user_id ON hydration_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_date ON hydration_entries(date);

-- Enable RLS
ALTER TABLE hydration_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own hydration data" ON hydration_entries
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 7. SLEEP ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  bedtime TEXT,
  wake_time TEXT,
  duration_hours NUMERIC,
  sleep_quality INTEGER,
  screen_time_before_bed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sleep_user_id ON sleep_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_date ON sleep_entries(date);

-- Enable RLS
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own sleep data" ON sleep_entries
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 8. MINDFUL EATING ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mindful_eating_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  meals_count INTEGER DEFAULT 0,
  protein_prioritized_meals INTEGER DEFAULT 0,
  vegetable_servings INTEGER DEFAULT 0,
  distraction_free_meals INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mindful_user_id ON mindful_eating_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mindful_date ON mindful_eating_entries(date);

-- Enable RLS
ALTER TABLE mindful_eating_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own mindful eating data" ON mindful_eating_entries
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 9. PROGRESS ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  weight_kg NUMERIC,
  energy_level INTEGER,
  mood TEXT,
  stress_level INTEGER,
  waist_cm NUMERIC,
  photos TEXT[],
  non_scale_victories TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON progress_entries(date);

-- Enable RLS
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own progress data" ON progress_entries
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 10. DAILY CHECK-INS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  completed_habits TEXT[],
  missed_habits TEXT[],
  reflection_notes TEXT,
  energy_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkin_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_date ON daily_checkins(date);

-- Enable RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own check-in data" ON daily_checkins
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 11. WEEKLY REFLECTIONS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  wins TEXT[],
  challenges TEXT[],
  improvements TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own weekly reflections" ON weekly_reflections
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- 12. MONTHLY GOALS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  goals JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Enable RLS
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own monthly goals" ON monthly_goals
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
