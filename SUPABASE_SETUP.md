# Supabase Database Setup Instructions

## Step 1: Create Tables in Supabase SQL Editor

Run this SQL script in your Supabase project's SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fasting sessions table
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  window_type TEXT NOT NULL,
  target_duration_hours NUMERIC NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  actual_duration_hours NUMERIC,
  hunger_level INTEGER,
  energy_level INTEGER,
  broken_early BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avoidance entries table
CREATE TABLE IF NOT EXISTS avoidance_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  avoidance_type TEXT NOT NULL,
  custom_name TEXT,
  avoided BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, avoidance_type)
);

-- Walking entries table
CREATE TABLE IF NOT EXISTS walking_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  step_count INTEGER DEFAULT 0,
  total_distance_km NUMERIC DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  goal_steps INTEGER DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Exercise sessions table
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT,
  notes TEXT,
  calories_burned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hydration entries table
CREATE TABLE IF NOT EXISTS hydration_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_ml INTEGER DEFAULT 0,
  goal_ml INTEGER DEFAULT 2500,
  entries JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Sleep entries table
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hours_slept NUMERIC,
  sleep_quality INTEGER,
  wake_up_time TIME,
  bedtime TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Mindful eating entries table
CREATE TABLE IF NOT EXISTS mindful_eating_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  mindfulness_score INTEGER,
  hunger_before INTEGER,
  fullness_after INTEGER,
  emotions TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC,
  body_fat_percentage NUMERIC,
  waist_cm NUMERIC,
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood_score INTEGER,
  energy_level INTEGER,
  stress_level INTEGER,
  water_intake_ml INTEGER,
  steps_count INTEGER,
  exercise_minutes INTEGER,
  sleep_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_id ON fasting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_start_time ON fasting_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_avoidance_entries_user_id ON avoidance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_avoidance_entries_date ON avoidance_entries(date);
CREATE INDEX IF NOT EXISTS idx_walking_entries_user_id ON walking_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_walking_entries_date ON walking_entries(date);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_id ON exercise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_date ON exercise_sessions(date);
CREATE INDEX IF NOT EXISTS idx_hydration_entries_user_id ON hydration_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_entries_date ON hydration_entries(date);
CREATE INDEX IF NOT EXISTS idx_sleep_entries_user_id ON sleep_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_entries_date ON sleep_entries(date);
CREATE INDEX IF NOT EXISTS idx_mindful_eating_entries_user_id ON mindful_eating_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mindful_eating_entries_date ON mindful_eating_entries(date);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON progress_entries(date);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_user_id ON daily_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_date ON daily_check_ins(date);
```

## Step 2: Set Up Row Level Security (RLS) Policies

Run this SQL script to enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE avoidance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE walking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindful_eating_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Fasting sessions policies
CREATE POLICY "Users can view their own fasting sessions"
  ON fasting_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fasting sessions"
  ON fasting_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting sessions"
  ON fasting_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fasting sessions"
  ON fasting_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Avoidance entries policies
CREATE POLICY "Users can view their own avoidance entries"
  ON avoidance_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own avoidance entries"
  ON avoidance_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avoidance entries"
  ON avoidance_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avoidance entries"
  ON avoidance_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Walking entries policies
CREATE POLICY "Users can view their own walking entries"
  ON walking_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own walking entries"
  ON walking_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own walking entries"
  ON walking_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own walking entries"
  ON walking_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Exercise sessions policies
CREATE POLICY "Users can view their own exercise sessions"
  ON exercise_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise sessions"
  ON exercise_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise sessions"
  ON exercise_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise sessions"
  ON exercise_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Hydration entries policies
CREATE POLICY "Users can view their own hydration entries"
  ON hydration_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration entries"
  ON hydration_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration entries"
  ON hydration_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydration entries"
  ON hydration_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Sleep entries policies
CREATE POLICY "Users can view their own sleep entries"
  ON sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries"
  ON sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON sleep_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Mindful eating entries policies
CREATE POLICY "Users can view their own mindful eating entries"
  ON mindful_eating_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindful eating entries"
  ON mindful_eating_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindful eating entries"
  ON mindful_eating_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindful eating entries"
  ON mindful_eating_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Progress entries policies
CREATE POLICY "Users can view their own progress entries"
  ON progress_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress entries"
  ON progress_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress entries"
  ON progress_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress entries"
  ON progress_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Daily check-ins policies
CREATE POLICY "Users can view their own daily check-ins"
  ON daily_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily check-ins"
  ON daily_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily check-ins"
  ON daily_check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily check-ins"
  ON daily_check_ins FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 3: Configure Environment Variables on Vercel

In your Vercel project settings, add these environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Step 4: Verify Database Connection

After setting up the tables and policies, test the connection by:

1. Opening your app in the browser
2. Opening browser console (F12)
3. Looking for "✅ Supabase connection successful" message
4. If you see errors, check the error details in the console

## Common Issues and Solutions

### Issue: "permission denied for table users"
**Solution**: Make sure RLS policies are correctly set up (Step 2 above)

### Issue: "relation does not exist"
**Solution**: Run the table creation SQL (Step 1 above)

### Issue: "Invalid API key"
**Solution**: Double-check your VITE_SUPABASE_ANON_KEY in Vercel environment variables

### Issue: White screen after deploy
**Solution**: 
1. Check browser console for errors
2. Verify environment variables are set in Vercel
3. Make sure tables exist in Supabase
4. Ensure RLS policies are enabled
