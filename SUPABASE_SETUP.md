# Supabase Database Setup Guide

## ⚠️ IMPORTANT: Run These SQL Scripts in Your Supabase Dashboard

The "Maximum call stack size exceeded" and "Failed to load fasting data" errors occur because your database tables don't exist yet or RLS policies are not configured.

## Step 1: Create All Database Tables

Go to your Supabase Dashboard → SQL Editor and run this entire script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fasting sessions table
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  window_type TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  target_duration_hours NUMERIC NOT NULL,
  actual_duration_hours NUMERIC,
  hunger_level INTEGER,
  energy_level INTEGER,
  broken_early BOOLEAN DEFAULT FALSE,
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
  avoided BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, avoidance_type)
);

-- Walking entries table
CREATE TABLE IF NOT EXISTS walking_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  step_count INTEGER DEFAULT 0,
  morning_walk_minutes INTEGER,
  morning_walk_distance_km NUMERIC,
  evening_walk_minutes INTEGER,
  evening_walk_distance_km NUMERIC,
  walking_meeting BOOLEAN DEFAULT FALSE,
  active_commute_minutes INTEGER,
  post_meal_walks INTEGER DEFAULT 0,
  total_distance_km NUMERIC DEFAULT 0,
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
  cardio_type TEXT,
  muscle_groups TEXT[],
  duration_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL,
  calories_burned INTEGER,
  feeling_score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hydration entries table
CREATE TABLE IF NOT EXISTS hydration_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_ml INTEGER DEFAULT 0,
  morning_water BOOLEAN DEFAULT FALSE,
  caffeine_after_2pm BOOLEAN DEFAULT FALSE,
  herbal_teas INTEGER DEFAULT 0,
  electrolytes INTEGER DEFAULT 0,
  entries JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Sleep entries table
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  duration_hours NUMERIC NOT NULL,
  screen_curfew_complied BOOLEAN DEFAULT FALSE,
  morning_sunlight_minutes INTEGER,
  sleep_quality INTEGER,
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
  meals_count INTEGER DEFAULT 0,
  protein_prioritized_meals INTEGER DEFAULT 0,
  vegetable_servings INTEGER DEFAULT 0,
  distraction_free_meals INTEGER DEFAULT 0,
  eighty_percent_full_meals INTEGER DEFAULT 0,
  meal_prep_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Progress entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight_kg NUMERIC,
  weight_lb NUMERIC,
  energy_level INTEGER,
  mood TEXT,
  stress_level INTEGER,
  body_measurements JSONB,
  progress_photo_url TEXT,
  non_scale_victories TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed_habits TEXT[],
  missed_habits TEXT[],
  reflection_notes TEXT,
  tomorrow_intentions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weekly reflections table
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  what_worked TEXT,
  what_didnt TEXT,
  adjustments_for_next TEXT,
  wins TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Monthly goals table
CREATE TABLE IF NOT EXISTS monthly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  goals JSONB,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
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
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(date);
CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_id ON weekly_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_user_id ON monthly_goals(user_id);
```

## Step 2: Enable Row Level Security (RLS) and Create Policies

Run this second script to enable RLS and create security policies:

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
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Fasting sessions policies
CREATE POLICY "Users can view own fasting sessions" ON fasting_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fasting sessions" ON fasting_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting sessions" ON fasting_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasting sessions" ON fasting_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Avoidance entries policies
CREATE POLICY "Users can view own avoidance entries" ON avoidance_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avoidance entries" ON avoidance_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avoidance entries" ON avoidance_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own avoidance entries" ON avoidance_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Walking entries policies
CREATE POLICY "Users can view own walking entries" ON walking_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own walking entries" ON walking_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walking entries" ON walking_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own walking entries" ON walking_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise sessions policies
CREATE POLICY "Users can view own exercise sessions" ON exercise_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise sessions" ON exercise_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise sessions" ON exercise_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise sessions" ON exercise_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Hydration entries policies
CREATE POLICY "Users can view own hydration entries" ON hydration_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration entries" ON hydration_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration entries" ON hydration_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration entries" ON hydration_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Sleep entries policies
CREATE POLICY "Users can view own sleep entries" ON sleep_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep entries" ON sleep_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep entries" ON sleep_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep entries" ON sleep_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Mindful eating entries policies
CREATE POLICY "Users can view own mindful eating entries" ON mindful_eating_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mindful eating entries" ON mindful_eating_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mindful eating entries" ON mindful_eating_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mindful eating entries" ON mindful_eating_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Progress entries policies
CREATE POLICY "Users can view own progress entries" ON progress_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress entries" ON progress_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress entries" ON progress_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress entries" ON progress_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Daily check-ins policies
CREATE POLICY "Users can view own daily check-ins" ON daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily check-ins" ON daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily check-ins" ON daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily check-ins" ON daily_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Weekly reflections policies
CREATE POLICY "Users can view own weekly reflections" ON weekly_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reflections" ON weekly_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reflections" ON weekly_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reflections" ON weekly_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- Monthly goals policies
CREATE POLICY "Users can view own monthly goals" ON monthly_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly goals" ON monthly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly goals" ON monthly_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly goals" ON monthly_goals
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 3: Verify Environment Variables in Vercel

Make sure these environment variables are set in your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key

## Step 4: Redeploy

After completing steps 1-3, trigger a new deployment in Vercel:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click "Redeploy" on the latest deployment

## Troubleshooting

### Still getting "Failed to load fasting data"?

1. **Check browser console** for specific error messages
2. **Verify tables exist**: In Supabase Dashboard → Table Editor, you should see all the tables listed
3. **Check RLS policies**: In Supabase Dashboard → Authentication → Policies, verify policies are created
4. **Test authentication**: Try signing up/logging in to ensure auth is working

### Getting "Maximum call stack size exceeded"?

This was caused by recursive calls in the connection test. The code has been fixed to prevent this. Make sure you've deployed the latest code.

### Need help?

1. Check Supabase logs: Dashboard → Logs
2. Check Vercel function logs: Dashboard → Functions
3. Enable debug mode in browser console
