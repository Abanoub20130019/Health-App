import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_MjLx3qZ9yuUW@ep-solitary-block-anevf7g8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(DATABASE_URL);

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Fasting sessions
    await sql`
      CREATE TABLE IF NOT EXISTS fasting_sessions (
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
      )
    `;

    // Avoidance entries
    await sql`
      CREATE TABLE IF NOT EXISTS avoidance_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        avoidance_type VARCHAR(50) NOT NULL,
        custom_name VARCHAR(100),
        avoided BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date, avoidance_type)
      )
    `;

    // Walking entries
    await sql`
      CREATE TABLE IF NOT EXISTS walking_entries (
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
      )
    `;

    // Exercise sessions
    await sql`
      CREATE TABLE IF NOT EXISTS exercise_sessions (
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
      )
    `;

    // Hydration entries
    await sql`
      CREATE TABLE IF NOT EXISTS hydration_entries (
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
      )
    `;

    // Sleep entries
    await sql`
      CREATE TABLE IF NOT EXISTS sleep_entries (
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
      )
    `;

    // Mindful eating entries
    await sql`
      CREATE TABLE IF NOT EXISTS mindful_eating_entries (
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
      )
    `;

    // Progress entries
    await sql`
      CREATE TABLE IF NOT EXISTS progress_entries (
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
      )
    `;

    // Daily check-ins
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
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
      )
    `;

    // Weekly reflections
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_reflections (
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
      )
    `;

    // Monthly goals
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        month VARCHAR(7) NOT NULL,
        goals JSONB DEFAULT '[]',
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, month)
      )
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

// Helper function to test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected:', result[0]);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
