import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_MjLx3qZ9yuUW@ep-solitary-block-anevf7g8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

// Middleware
app.use(cors())
app.use(express.json())

// ==================== DATABASE INITIALIZATION ====================
app.post('/api/init', async (req, res) => {
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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

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
    `

    res.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization error:', error)
    res.status(500).json({ error: 'Failed to initialize database', details: error.message })
  }
})

// ==================== USER ROUTES ====================
app.post('/api/user', async (req, res) => {
  try {
    const { email, name } = req.body
    
    // Check if user exists
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`
    
    if (existing.length > 0) {
      return res.json(existing[0])
    }
    
    // Create new user
    const result = await sql`
      INSERT INTO users (email, name)
      VALUES (${email}, ${name})
      RETURNING *
    `
    res.json(result[0])
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await sql`SELECT * FROM users WHERE id = ${id}`
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(result[0])
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// ==================== FASTING ROUTES ====================
app.get('/api/fasting/active', async (req, res) => {
  try {
    const { userId } = req.query
    const result = await sql`
      SELECT * FROM fasting_sessions 
      WHERE user_id = ${userId} AND end_time IS NULL
      ORDER BY start_time DESC
      LIMIT 1
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching active fast:', error)
    res.status(500).json({ error: 'Failed to fetch active fast' })
  }
})

app.get('/api/fasting/history', async (req, res) => {
  try {
    const { userId, limit = 30 } = req.query
    const result = await sql`
      SELECT * FROM fasting_sessions 
      WHERE user_id = ${userId} AND end_time IS NOT NULL
      ORDER BY start_time DESC
      LIMIT ${limit}
    `
    res.json(result)
  } catch (error) {
    console.error('Error fetching fasting history:', error)
    res.status(500).json({ error: 'Failed to fetch fasting history' })
  }
})

app.post('/api/fasting/start', async (req, res) => {
  try {
    const { userId, windowType, targetHours } = req.body
    console.log('Starting fast:', { userId, windowType, targetHours })
    
    if (!userId || !windowType || !targetHours) {
      return res.status(400).json({ error: 'Missing required fields', received: { userId, windowType, targetHours } })
    }
    
    const result = await sql`
      INSERT INTO fasting_sessions (user_id, window_type, start_time, target_duration_hours)
      VALUES (${userId}, ${windowType}, NOW(), ${targetHours})
      RETURNING *
    `
    console.log('Fast started:', result[0])
    res.json(result[0])
  } catch (error) {
    console.error('Error starting fast:', error)
    res.status(500).json({ error: 'Failed to start fast', details: error.message })
  }
})

app.post('/api/fasting/end/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { hungerLevel, energyLevel, notes } = req.body
    
    // Calculate actual duration
    const fast = await sql`SELECT * FROM fasting_sessions WHERE id = ${id}`
    if (fast.length === 0) {
      return res.status(404).json({ error: 'Fast not found' })
    }
    
    const startTime = new Date(fast[0].start_time)
    const endTime = new Date()
    const durationHours = (endTime - startTime) / (1000 * 60 * 60)
    const brokenEarly = durationHours < fast[0].target_duration_hours
    
    const result = await sql`
      UPDATE fasting_sessions
      SET end_time = NOW(),
          actual_duration_hours = ${durationHours.toFixed(2)},
          hunger_level = ${hungerLevel || null},
          energy_level = ${energyLevel || null},
          broken_early = ${brokenEarly},
          notes = ${notes || null}
      WHERE id = ${id}
      RETURNING *
    `
    res.json(result[0])
  } catch (error) {
    console.error('Error ending fast:', error)
    res.status(500).json({ error: 'Failed to end fast' })
  }
})

app.get('/api/fasting/stats', async (req, res) => {
  try {
    const { userId } = req.query
    
    // Get last 7 days of fasting
    const weekData = await sql`
      SELECT * FROM fasting_sessions 
      WHERE user_id = ${userId} 
        AND start_time >= NOW() - INTERVAL '7 days'
        AND end_time IS NOT NULL
    `
    
    // Calculate stats
    const completedFasts = weekData.filter(f => !f.broken_early)
    const consistency = weekData.length > 0 
      ? Math.round((completedFasts.length / weekData.length) * 100) 
      : 0
    
    // Calculate streak (simplified)
    const streak = completedFasts.length
    
    res.json({
      weeklyConsistency: consistency,
      currentStreak: streak,
      longestStreak: streak,
      totalFastsCompleted: weekData.length,
      averageDuration: weekData.length > 0
        ? weekData.reduce((sum, f) => sum + parseFloat(f.actual_duration_hours), 0) / weekData.length
        : 0,
    })
  } catch (error) {
    console.error('Error fetching fasting stats:', error)
    res.status(500).json({ error: 'Failed to fetch fasting stats' })
  }
})

// ==================== AVOIDANCE ROUTES ====================
app.get('/api/avoidances', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM avoidance_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result)
  } catch (error) {
    console.error('Error fetching avoidances:', error)
    res.status(500).json({ error: 'Failed to fetch avoidances' })
  }
})

app.post('/api/avoidances/toggle', async (req, res) => {
  try {
    const { userId, date, type, avoided, customName } = req.body
    
    // Check if entry exists
    const existing = await sql`
      SELECT * FROM avoidance_entries 
      WHERE user_id = ${userId} AND date = ${date} AND avoidance_type = ${type}
    `
    
    if (existing.length > 0) {
      // Update existing
      const result = await sql`
        UPDATE avoidance_entries
        SET avoided = ${avoided}
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      res.json(result[0])
    } else {
      // Create new
      const result = await sql`
        INSERT INTO avoidance_entries (user_id, date, avoidance_type, custom_name, avoided)
        VALUES (${userId}, ${date}, ${type}, ${customName || null}, ${avoided})
        RETURNING *
      `
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error toggling avoidance:', error)
    res.status(500).json({ error: 'Failed to toggle avoidance' })
  }
})

app.get('/api/avoidances/stats', async (req, res) => {
  try {
    const { userId } = req.query
    
    const types = ['processed_sugars', 'refined_carbs', 'ultra_processed_foods', 'seed_oils', 'alcohol', 'late_night_eating']
    const stats = []
    
    for (const type of types) {
      const weekData = await sql`
        SELECT * FROM avoidance_entries 
        WHERE user_id = ${userId} 
          AND avoidance_type = ${type}
          AND date >= CURRENT_DATE - INTERVAL '7 days'
      `
      const monthData = await sql`
        SELECT * FROM avoidance_entries 
        WHERE user_id = ${userId} 
          AND avoidance_type = ${type}
          AND date >= CURRENT_DATE - INTERVAL '30 days'
      `
      
      const weekSuccess = weekData.filter(e => e.avoided).length
      const monthSuccess = monthData.filter(e => e.avoided).length
      
      stats.push({
        type,
        customName: null,
        currentStreak: weekSuccess,
        longestStreak: weekSuccess,
        successRate7Days: weekData.length > 0 ? Math.round((weekSuccess / weekData.length) * 100) : 0,
        successRate30Days: monthData.length > 0 ? Math.round((monthSuccess / monthData.length) * 100) : 0,
      })
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Error fetching avoidance stats:', error)
    res.status(500).json({ error: 'Failed to fetch avoidance stats' })
  }
})

// ==================== WALKING ROUTES ====================
app.get('/api/walking', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM walking_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching walking entry:', error)
    res.status(500).json({ error: 'Failed to fetch walking entry' })
  }
})

app.post('/api/walking', async (req, res) => {
  try {
    const { userId, date, ...updates } = req.body
    
    // Check if entry exists
    const existing = await sql`
      SELECT * FROM walking_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    
    if (existing.length > 0) {
      // Build dynamic update
      const fields = Object.keys(updates)
      const values = Object.values(updates)
      
      if (fields.length === 0) {
        return res.json(existing[0])
      }
      
      const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ')
      const query = `
        UPDATE walking_entries
        SET ${setClause}, updated_at = NOW()
        WHERE user_id = $1 AND date = $2
        RETURNING *
      `
      const result = await sql.query(query, [userId, date, ...values])
      res.json(result[0])
    } else {
      // Create new
      const columns = ['user_id', 'date', ...Object.keys(updates)].join(', ')
      const placeholders = ['$1', '$2', ...Object.keys(updates).map((_, i) => `$${i + 3}`)].join(', ')
      const query = `
        INSERT INTO walking_entries (${columns})
        VALUES (${placeholders})
        RETURNING *
      `
      const result = await sql.query(query, [userId, date, ...Object.values(updates)])
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error updating walking entry:', error)
    res.status(500).json({ error: 'Failed to update walking entry' })
  }
})

app.get('/api/walking/stats', async (req, res) => {
  try {
    const { userId } = req.query
    
    const weekData = await sql`
      SELECT * FROM walking_entries 
      WHERE user_id = ${userId} 
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    `
    
    const totalSteps = weekData.reduce((sum, d) => sum + (d.step_count || 0), 0)
    const avgSteps = weekData.length > 0 ? Math.round(totalSteps / weekData.length) : 0
    const totalDistance = weekData.reduce((sum, d) => sum + parseFloat(d.total_distance_km || 0), 0)
    
    // Find best day
    const bestDay = weekData.length > 0
      ? weekData.reduce((max, d) => (d.step_count > max.step_count ? d : max), weekData[0])
      : { date: getToday(), steps: 0 }
    
    res.json({
      dailyAverage: avgSteps,
      weeklyTotal: totalSteps,
      currentStreak: weekData.filter(d => d.step_count >= 10000).length,
      bestDay: { date: bestDay.date, steps: bestDay.step_count || 0 },
      weeklyMileage: totalDistance,
    })
  } catch (error) {
    console.error('Error fetching walking stats:', error)
    res.status(500).json({ error: 'Failed to fetch walking stats' })
  }
})

// ==================== EXERCISE ROUTES ====================
app.get('/api/exercise', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM exercise_sessions 
      WHERE user_id = ${userId} AND date = ${date}
      ORDER BY created_at DESC
    `
    res.json(result)
  } catch (error) {
    console.error('Error fetching exercise sessions:', error)
    res.status(500).json({ error: 'Failed to fetch exercise sessions' })
  }
})

app.post('/api/exercise', async (req, res) => {
  try {
    const { userId, ...data } = req.body
    const result = await sql`
      INSERT INTO exercise_sessions (
        user_id, date, exercise_type, cardio_type, muscle_groups,
        duration_minutes, intensity, calories_burned, feeling_score, notes
      ) VALUES (
        ${userId}, ${data.date}, ${data.exerciseType}, ${data.cardioType || null},
        ${data.muscleGroups || null}, ${data.durationMinutes}, ${data.intensity},
        ${data.caloriesBurned || null}, ${data.feelingScore || null}, ${data.notes || null}
      )
      RETURNING *
    `
    res.json(result[0])
  } catch (error) {
    console.error('Error adding exercise:', error)
    res.status(500).json({ error: 'Failed to add exercise' })
  }
})

app.delete('/api/exercise/:id', async (req, res) => {
  try {
    const { id } = req.params
    await sql`DELETE FROM exercise_sessions WHERE id = ${id}`
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting exercise:', error)
    res.status(500).json({ error: 'Failed to delete exercise' })
  }
})

app.get('/api/exercise/stats', async (req, res) => {
  try {
    const { userId } = req.query
    
    const weekData = await sql`
      SELECT * FROM exercise_sessions 
      WHERE user_id = ${userId} 
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    `
    
    const byType = {
      resistance_training: { count: 0, minutes: 0 },
      cardio: { count: 0, minutes: 0 },
      flexibility_mobility: { count: 0, minutes: 0 },
      active_recovery: { count: 0, minutes: 0 },
    }
    
    weekData.forEach(session => {
      if (byType[session.exercise_type]) {
        byType[session.exercise_type].count++
        byType[session.exercise_type].minutes += session.duration_minutes
      }
    })
    
    res.json({
      weeklySessions: weekData.length,
      totalMinutesWeek: weekData.reduce((sum, s) => sum + s.duration_minutes, 0),
      byType,
      currentStreak: weekData.length,
    })
  } catch (error) {
    console.error('Error fetching exercise stats:', error)
    res.status(500).json({ error: 'Failed to fetch exercise stats' })
  }
})

// ==================== HYDRATION ROUTES ====================
app.get('/api/hydration', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM hydration_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching hydration entry:', error)
    res.status(500).json({ error: 'Failed to fetch hydration entry' })
  }
})

app.post('/api/hydration/entry', async (req, res) => {
  try {
    const { userId, date, amount, type, time } = req.body
    
    // Get or create entry
    let entry = await sql`
      SELECT * FROM hydration_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    
    let entryId
    if (entry.length === 0) {
      const newEntry = await sql`
        INSERT INTO hydration_entries (user_id, date, total_ml, entries)
        VALUES (${userId}, ${date}, 0, '[]')
        RETURNING id
      `
      entryId = newEntry[0].id
    } else {
      entryId = entry[0].id
    }
    
    // Add entry to entries array and update total
    const currentEntries = entry.length > 0 ? entry[0].entries : []
    const newEntries = [...currentEntries, { time, amount_ml: amount, type }]
    const newTotal = newEntries.reduce((sum, e) => sum + e.amount_ml, 0)
    
    const result = await sql`
      UPDATE hydration_entries
      SET total_ml = ${newTotal},
          entries = ${JSON.stringify(newEntries)},
          updated_at = NOW()
      WHERE id = ${entryId}
      RETURNING *
    `
    res.json(result[0])
  } catch (error) {
    console.error('Error adding hydration entry:', error)
    res.status(500).json({ error: 'Failed to add hydration entry' })
  }
})

app.post('/api/hydration', async (req, res) => {
  try {
    const { userId, date, ...updates } = req.body
    
    const existing = await sql`
      SELECT * FROM hydration_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    
    if (existing.length > 0) {
      const setClause = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`).join(', ')
      const query = `
        UPDATE hydration_entries
        SET ${setClause}, updated_at = NOW()
        WHERE user_id = $1 AND date = $2
        RETURNING *
      `
      const result = await sql.query(query, [userId, date, ...Object.values(updates)])
      res.json(result[0])
    } else {
      const columns = ['user_id', 'date', ...Object.keys(updates)].join(', ')
      const placeholders = ['$1', '$2', ...Object.keys(updates).map((_, i) => `$${i + 3}`)].join(', ')
      const query = `
        INSERT INTO hydration_entries (${columns})
        VALUES (${placeholders})
        RETURNING *
      `
      const result = await sql.query(query, [userId, date, ...Object.values(updates)])
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error updating hydration:', error)
    res.status(500).json({ error: 'Failed to update hydration' })
  }
})

// ==================== SLEEP ROUTES ====================
app.get('/api/sleep', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM sleep_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching sleep entry:', error)
    res.status(500).json({ error: 'Failed to fetch sleep entry' })
  }
})

app.post('/api/sleep', async (req, res) => {
  try {
    const { userId, ...data } = req.body
    
    const existing = await sql`
      SELECT * FROM sleep_entries 
      WHERE user_id = ${userId} AND date = ${data.date}
    `
    
    if (existing.length > 0) {
      const result = await sql`
        UPDATE sleep_entries
        SET bedtime = ${data.bedtime},
            wake_time = ${data.wakeTime},
            duration_hours = ${data.durationHours},
            screen_curfew_complied = ${data.screenCurfewComplied},
            morning_sunlight_minutes = ${data.morningSunlightMinutes},
            sleep_quality = ${data.sleepQuality},
            updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      res.json(result[0])
    } else {
      const result = await sql`
        INSERT INTO sleep_entries (
          user_id, date, bedtime, wake_time, duration_hours,
          screen_curfew_complied, morning_sunlight_minutes, sleep_quality
        ) VALUES (
          ${userId}, ${data.date}, ${data.bedtime}, ${data.wakeTime},
          ${data.durationHours}, ${data.screenCurfewComplied},
          ${data.morningSunlightMinutes}, ${data.sleepQuality}
        )
        RETURNING *
      `
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error saving sleep:', error)
    res.status(500).json({ error: 'Failed to save sleep' })
  }
})

app.get('/api/sleep/stats', async (req, res) => {
  try {
    const { userId } = req.query
    
    const weekData = await sql`
      SELECT * FROM sleep_entries 
      WHERE user_id = ${userId} 
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    `
    
    const avgDuration = weekData.length > 0
      ? weekData.reduce((sum, d) => sum + parseFloat(d.duration_hours), 0) / weekData.length
      : 0
    
    const avgQuality = weekData.length > 0
      ? weekData.reduce((sum, d) => sum + (d.sleep_quality || 0), 0) / weekData.length
      : 0
    
    res.json({
      averageDuration: avgDuration,
      averageQuality: avgQuality,
      consistencyScore: weekData.length > 0 ? Math.min((weekData.length / 7) * 100, 100) : 0,
      currentStreak: weekData.length,
    })
  } catch (error) {
    console.error('Error fetching sleep stats:', error)
    res.status(500).json({ error: 'Failed to fetch sleep stats' })
  }
})

// ==================== MINDFUL EATING ROUTES ====================
app.get('/api/mindful-eating', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM mindful_eating_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching mindful eating entry:', error)
    res.status(500).json({ error: 'Failed to fetch mindful eating entry' })
  }
})

app.post('/api/mindful-eating', async (req, res) => {
  try {
    const { userId, date, ...updates } = req.body
    
    const existing = await sql`
      SELECT * FROM mindful_eating_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    
    if (existing.length > 0) {
      const setClause = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`).join(', ')
      const query = `
        UPDATE mindful_eating_entries
        SET ${setClause}, updated_at = NOW()
        WHERE user_id = $1 AND date = $2
        RETURNING *
      `
      const result = await sql.query(query, [userId, date, ...Object.values(updates)])
      res.json(result[0])
    } else {
      const columns = ['user_id', 'date', ...Object.keys(updates)].join(', ')
      const placeholders = ['$1', '$2', ...Object.keys(updates).map((_, i) => `$${i + 3}`)].join(', ')
      const query = `
        INSERT INTO mindful_eating_entries (${columns})
        VALUES (${placeholders})
        RETURNING *
      `
      const result = await sql.query(query, [userId, date, ...Object.values(updates)])
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error updating mindful eating:', error)
    res.status(500).json({ error: 'Failed to update mindful eating' })
  }
})

// ==================== PROGRESS ROUTES ====================
app.get('/api/progress', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM progress_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching progress entry:', error)
    res.status(500).json({ error: 'Failed to fetch progress entry' })
  }
})

app.get('/api/progress/history', async (req, res) => {
  try {
    const { userId, limit = 90 } = req.query
    const result = await sql`
      SELECT * FROM progress_entries 
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT ${limit}
    `
    res.json(result)
  } catch (error) {
    console.error('Error fetching progress history:', error)
    res.status(500).json({ error: 'Failed to fetch progress history' })
  }
})

app.post('/api/progress', async (req, res) => {
  try {
    const { userId, date, ...data } = req.body
    
    const existing = await sql`
      SELECT * FROM progress_entries 
      WHERE user_id = ${userId} AND date = ${date}
    `
    
    if (existing.length > 0) {
      const result = await sql`
        UPDATE progress_entries
        SET weight_kg = ${data.weightKg || null},
            energy_level = ${data.energyLevel},
            mood = ${data.mood},
            stress_level = ${data.stressLevel},
            non_scale_victories = ${data.nonScaleVictories || []},
            updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      res.json(result[0])
    } else {
      const result = await sql`
        INSERT INTO progress_entries (
          user_id, date, weight_kg, energy_level, mood, stress_level, non_scale_victories
        ) VALUES (
          ${userId}, ${date}, ${data.weightKg || null}, ${data.energyLevel},
          ${data.mood}, ${data.stressLevel}, ${data.nonScaleVictories || []}
        )
        RETURNING *
      `
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error saving progress:', error)
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

// ==================== CHECK-IN ROUTES ====================
app.get('/api/checkin', async (req, res) => {
  try {
    const { userId, date } = req.query
    const result = await sql`
      SELECT * FROM daily_checkins 
      WHERE user_id = ${userId} AND date = ${date}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching check-in:', error)
    res.status(500).json({ error: 'Failed to fetch check-in' })
  }
})

app.post('/api/checkin', async (req, res) => {
  try {
    const { userId, date, ...data } = req.body
    
    const existing = await sql`
      SELECT * FROM daily_checkins 
      WHERE user_id = ${userId} AND date = ${date}
    `
    
    if (existing.length > 0) {
      const result = await sql`
        UPDATE daily_checkins
        SET completed_habits = ${data.completedHabits || []},
            missed_habits = ${data.missedHabits || []},
            reflection_notes = ${data.reflectionNotes || null},
            tomorrow_intentions = ${data.tomorrowIntentions || null},
            updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      res.json(result[0])
    } else {
      const result = await sql`
        INSERT INTO daily_checkins (
          user_id, date, completed_habits, missed_habits,
          reflection_notes, tomorrow_intentions
        ) VALUES (
          ${userId}, ${date}, ${data.completedHabits || []}, ${data.missedHabits || []},
          ${data.reflectionNotes || null}, ${data.tomorrowIntentions || null}
        )
        RETURNING *
      `
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error saving check-in:', error)
    res.status(500).json({ error: 'Failed to save check-in' })
  }
})

app.get('/api/checkin/weekly', async (req, res) => {
  try {
    const { userId, weekStart } = req.query
    const result = await sql`
      SELECT * FROM weekly_reflections 
      WHERE user_id = ${userId} AND week_start = ${weekStart}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching weekly reflection:', error)
    res.status(500).json({ error: 'Failed to fetch weekly reflection' })
  }
})

app.get('/api/checkin/goals', async (req, res) => {
  try {
    const { userId, month } = req.query
    const result = await sql`
      SELECT * FROM monthly_goals 
      WHERE user_id = ${userId} AND month = ${month}
    `
    res.json(result[0] || null)
  } catch (error) {
    console.error('Error fetching monthly goals:', error)
    res.status(500).json({ error: 'Failed to fetch monthly goals' })
  }
})

app.post('/api/checkin/goals', async (req, res) => {
  try {
    const { userId, month, goals } = req.body
    
    const existing = await sql`
      SELECT * FROM monthly_goals 
      WHERE user_id = ${userId} AND month = ${month}
    `
    
    if (existing.length > 0) {
      const result = await sql`
        UPDATE monthly_goals
        SET goals = ${JSON.stringify(goals)},
            updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      res.json(result[0])
    } else {
      const result = await sql`
        INSERT INTO monthly_goals (user_id, month, goals)
        VALUES (${userId}, ${month}, ${JSON.stringify(goals)})
        RETURNING *
      `
      res.json(result[0])
    }
  } catch (error) {
    console.error('Error saving goals:', error)
    res.status(500).json({ error: 'Failed to save goals' })
  }
})

// ==================== DASHBOARD ROUTES ====================
app.get('/api/dashboard/daily', async (req, res) => {
  try {
    const { userId, date } = req.query
    
    // Fetch all daily data
    const [fasting, avoidances, walking, exercise, hydration, sleep, mindful, progress] = await Promise.all([
      sql`SELECT * FROM fasting_sessions WHERE user_id = ${userId} AND DATE(start_time) = ${date} LIMIT 1`,
      sql`SELECT * FROM avoidance_entries WHERE user_id = ${userId} AND date = ${date}`,
      sql`SELECT * FROM walking_entries WHERE user_id = ${userId} AND date = ${date} LIMIT 1`,
      sql`SELECT * FROM exercise_sessions WHERE user_id = ${userId} AND date = ${date}`,
      sql`SELECT * FROM hydration_entries WHERE user_id = ${userId} AND date = ${date} LIMIT 1`,
      sql`SELECT * FROM sleep_entries WHERE user_id = ${userId} AND date = ${date} LIMIT 1`,
      sql`SELECT * FROM mindful_eating_entries WHERE user_id = ${userId} AND date = ${date} LIMIT 1`,
      sql`SELECT * FROM progress_entries WHERE user_id = ${userId} AND date = ${date} LIMIT 1`,
    ])
    
    // Calculate overall score
    let score = 0
    const categories = []
    
    // Fasting (15%)
    const fastingActive = fasting.length > 0 && !fasting[0].end_time
    if (fastingActive || (fasting.length > 0 && !fasting[0].broken_early)) score += 15
    
    // Avoidances (15%)
    const avoidancesCompleted = avoidances.filter(a => a.avoided).length
    const avoidancesScore = avoidances.length > 0 ? (avoidancesCompleted / avoidances.length) * 15 : 0
    score += avoidancesScore
    
    // Steps (15%)
    const steps = walking[0]?.step_count || 0
    const stepsScore = Math.min((steps / 10000) * 15, 15)
    score += stepsScore
    
    // Exercise (10%)
    if (exercise.length > 0) score += 10
    
    // Hydration (15%)
    const hydrationAmount = hydration[0]?.total_ml || 0
    const hydrationScore = Math.min((hydrationAmount / 2500) * 15, 15)
    score += hydrationScore
    
    // Sleep (15%)
    const sleepHours = sleep[0]?.duration_hours || 0
    const sleepScore = sleepHours >= 7 ? 15 : Math.min((sleepHours / 7) * 15, 15)
    score += sleepScore
    
    // Mindful Eating (15%)
    const mindfulScore = mindful[0] ? Math.min(
      ((mindful[0].protein_prioritized_meals || 0) / (mindful[0].meals_count || 1)) * 5 +
      Math.min((mindful[0].vegetable_servings || 0) / 5, 1) * 5 +
      ((mindful[0].distraction_free_meals || 0) / (mindful[0].meals_count || 1)) * 5,
      15
    ) : 0
    score += mindfulScore
    
    res.json({
      date,
      fastingActive: fastingActive || false,
      fastingProgress: fasting[0] ? (fasting[0].actual_duration_hours || 0) / fasting[0].target_duration_hours * 100 : null,
      avoidancesCompleted,
      avoidancesTotal: avoidances.length || 7,
      steps,
      exerciseMinutes: exercise.reduce((sum, e) => sum + e.duration_minutes, 0),
      hydrationPercent: Math.round((hydrationAmount / 2500) * 100),
      sleepHours,
      mindfulEatingScore: Math.round(mindfulScore),
      energyLevel: progress[0]?.energy_level || null,
      overallScore: Math.round(score),
    })
  } catch (error) {
    console.error('Error fetching daily summary:', error)
    res.status(500).json({ error: 'Failed to fetch daily summary' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
