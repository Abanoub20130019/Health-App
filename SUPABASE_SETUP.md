# 🗄️ Supabase Setup Guide

## Overview
This app now uses **Supabase** for:
- PostgreSQL Database
- Authentication
- Real-time subscriptions (future feature)
- Edge Functions (future feature)

## Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project name: `vitality-health-tracker`
6. Set database password (save this!)
7. Choose region closest to your users
8. Click "Create new project"

### 2. Get API Keys
1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy the **URL** and **anon/public** key
3. Create a `.env` file in the `health-tracker` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Tables
In the Supabase SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fasting sessions
CREATE TABLE fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  window_type VARCHAR(20) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  target_duration_hours INTEGER NOT NULL,
  actual_duration_hours DECIMAL(4,2),
  hunger_level INTEGER CHECK (hunger_level BETWEEN 1 AND 5),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  broken_early BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Avoidance entries
CREATE TABLE avoidance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avoidance_type VARCHAR(50) NOT NULL,
  custom_name VARCHAR(100),
  avoided BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date, avoidance_type)
);

-- Walking entries
CREATE TABLE walking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  step_count INTEGER DEFAULT 0,
  morning_walk_minutes INTEGER,
  morning_walk_distance_km DECIMAL(4,2),
  evening_walk_minutes INTEGER,
  evening_walk_distance_km DECIMAL(4,2),
  walking_meeting BOOLEAN DEFAULT FALSE,
  active_commute_minutes INTEGER,
  post_meal_walks INTEGER DEFAULT 0,
  total_distance_km DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Exercise sessions
CREATE TABLE exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  cardio_type VARCHAR(20),
  muscle_groups TEXT[],
  duration_minutes INTEGER NOT NULL,
  intensity VARCHAR(20) NOT NULL,
  calories_burned INTEGER,
  feeling_score INTEGER CHECK (feeling_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hydration entries
CREATE TABLE hydration_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_ml INTEGER DEFAULT 0,
  morning_water BOOLEAN DEFAULT FALSE,
  caffeine_after_2pm BOOLEAN DEFAULT FALSE,
  herbal_teas INTEGER DEFAULT 0,
  electrolytes INTEGER DEFAULT 0,
  entries JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Sleep entries
CREATE TABLE sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bedtime TIMESTAMP NOT NULL,
  wake_time TIMESTAMP NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  screen_curfew_complied BOOLEAN DEFAULT FALSE,
  morning_sunlight_minutes INTEGER,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Mindful eating entries
CREATE TABLE mindful_eating_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meals_count INTEGER DEFAULT 0,
  protein_prioritized_meals INTEGER DEFAULT 0,
  vegetable_servings INTEGER DEFAULT 0,
  distraction_free_meals INTEGER DEFAULT 0,
  eighty_percent_full_meals INTEGER DEFAULT 0,
  meal_prep_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Progress entries
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  weight_lb DECIMAL(5,2),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  mood VARCHAR(20),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  body_measurements JSONB,
  progress_photo_url TEXT,
  non_scale_victories TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Daily check-ins
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_habits TEXT[],
  missed_habits TEXT[],
  reflection_notes TEXT,
  tomorrow_intentions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Weekly reflections
CREATE TABLE weekly_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  what_worked TEXT,
  what_didnt TEXT,
  adjustments_for_next TEXT,
  wins TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start)
);

-- Monthly goals
CREATE TABLE monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  goals JSONB DEFAULT '[]',
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);
```

### 4. Enable Row Level Security (RLS)
Run this for each table to secure data:

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

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for all other tables (example for fasting_sessions)
CREATE POLICY "Users can view own fasting sessions" ON fasting_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fasting sessions" ON fasting_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting sessions" ON fasting_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasting sessions" ON fasting_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Repeat for other tables...
```

### 5. Test Connection
Run the app and check browser console for:
```
✅ Supabase connection successful
```

## Vercel Deployment

### Environment Variables
Add these to your Vercel project:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build Settings
Vercel should auto-detect the Vite app. If not:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Benefits of Supabase
✅ **No backend server needed** - Direct DB connection from frontend
✅ **Built-in Auth** - Email/password, OAuth, magic links
✅ **Row Level Security** - Secure data access
✅ **Real-time** - Live updates (future feature)
✅ **Free tier** - 500MB database, 2GB bandwidth
✅ **Vercel integration** - Easy deployment

## Troubleshooting

### Connection Issues
- Check URL and key are correct
- Ensure RLS policies are set up
- Check browser console for errors

### CORS Issues
In Supabase Settings → API → Configure CORS:
- Add your Vercel domain
- Add `http://localhost:5173` for local dev
