// ==================== USER & AUTH ====================
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// ==================== INTERMITTENT FASTING ====================
export type FastingWindow = '16:8' | '18:6' | '20:4' | 'OMAD' | 'Custom';

export interface FastingSession {
  id: string;
  user_id: string;
  window_type: FastingWindow;
  start_time: string;
  end_time: string | null;
  target_duration_hours: number;
  actual_duration_hours: number | null;
  hunger_level: 1 | 2 | 3 | 4 | 5 | null; // 1=Very Low, 5=Very High
  energy_level: 1 | 2 | 3 | 4 | 5 | null; // 1=Very Low, 5=Very High
  broken_early: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FastingStats {
  weeklyConsistency: number;
  currentStreak: number;
  longestStreak: number;
  totalFastsCompleted: number;
  averageDuration: number;
}

// ==================== DIETARY AVOIDANCES ====================
export type AvoidanceType = 
  | 'processed_sugars'
  | 'refined_carbs'
  | 'ultra_processed_foods'
  | 'seed_oils'
  | 'alcohol'
  | 'late_night_eating'
  | 'custom';

export interface AvoidanceEntry {
  id: string;
  user_id: string;
  date: string;
  avoidance_type: AvoidanceType;
  custom_name: string | null;
  avoided: boolean;
  notes: string | null;
  created_at: string;
}

export interface AvoidanceStats {
  type: AvoidanceType;
  customName: string | null;
  currentStreak: number;
  longestStreak: number;
  successRate7Days: number;
  successRate30Days: number;
}

// ==================== MOVEMENT & WALKING ====================
export interface WalkingEntry {
  id: string;
  user_id: string;
  date: string;
  step_count: number;
  morning_walk_minutes: number | null;
  morning_walk_distance_km: number | null;
  evening_walk_minutes: number | null;
  evening_walk_distance_km: number | null;
  walking_meeting: boolean;
  active_commute_minutes: number | null;
  post_meal_walks: number; // count
  total_distance_km: number;
  created_at: string;
  updated_at: string;
}

export interface WalkingStats {
  dailyAverage: number;
  weeklyTotal: number;
  currentStreak: number;
  bestDay: { date: string; steps: number };
  weeklyMileage: number;
}

// ==================== STRUCTURED EXERCISE ====================
export type ExerciseType = 
  | 'resistance_training'
  | 'cardio'
  | 'flexibility_mobility'
  | 'active_recovery';

export type CardioType = 'running' | 'cycling' | 'swimming' | 'hiit' | 'other';
export type IntensityLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface ExerciseSession {
  id: string;
  user_id: string;
  date: string;
  exercise_type: ExerciseType;
  cardio_type: CardioType | null;
  muscle_groups: string[] | null; // for resistance training
  duration_minutes: number;
  intensity: IntensityLevel;
  calories_burned: number | null;
  feeling_score: 1 | 2 | 3 | 4 | 5 | null; // 1=Terrible, 5=Amazing
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseStats {
  weeklySessions: number;
  totalMinutesWeek: number;
  byType: Record<ExerciseType, { count: number; minutes: number }>;
  currentStreak: number;
}

// ==================== HYDRATION ====================
export interface HydrationEntry {
  id: string;
  user_id: string;
  date: string;
  total_ml: number;
  morning_water: boolean;
  caffeine_after_2pm: boolean;
  herbal_teas: number;
  electrolytes: number;
  entries: HydrationDetail[];
  created_at: string;
  updated_at: string;
}

export interface HydrationDetail {
  time: string;
  amount_ml: number;
  type: 'water' | 'tea' | 'coffee' | 'electrolyte' | 'other';
}

// ==================== SLEEP & RECOVERY ====================
export interface SleepEntry {
  id: string;
  user_id: string;
  date: string; // the date you wake up
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  screen_curfew_complied: boolean;
  morning_sunlight_minutes: number | null;
  sleep_quality: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  consistencyScore: number;
  currentStreak: number;
}

// ==================== MINDFUL EATING ====================
export interface MindfulEatingEntry {
  id: string;
  user_id: string;
  date: string;
  meals_count: number;
  protein_prioritized_meals: number;
  vegetable_servings: number;
  distraction_free_meals: number;
  eighty_percent_full_meals: number;
  meal_prep_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== PROGRESS METRICS ====================
export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  weight_lb: number | null;
  energy_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  mood: 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent';
  stress_level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  body_measurements: BodyMeasurements | null;
  progress_photo_url: string | null;
  non_scale_victories: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BodyMeasurements {
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  thighs_cm?: number;
  arms_cm?: number;
  shoulders_cm?: number;
}

// ==================== REFLECTION & ACCOUNTABILITY ====================
export interface DailyCheckIn {
  id: string;
  user_id: string;
  date: string;
  completed_habits: string[];
  missed_habits: string[];
  reflection_notes: string | null;
  tomorrow_intentions: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReflection {
  id: string;
  user_id: string;
  week_start: string;
  what_worked: string;
  what_didnt: string;
  adjustments_for_next: string;
  wins: string[];
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoal {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  goals: MonthlyGoalItem[];
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoalItem {
  id: string;
  category: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

// ==================== DASHBOARD ====================
export interface DailySummary {
  date: string;
  fastingActive: boolean;
  fastingProgress: number | null;
  avoidancesCompleted: number;
  avoidancesTotal: number;
  steps: number;
  exerciseMinutes: number;
  hydrationPercent: number;
  sleepHours: number | null;
  mindfulEatingScore: number;
  energyLevel: number | null;
  overallScore: number;
}

export interface WeeklySummary {
  weekStart: string;
  fastingConsistency: number;
  avoidanceSuccess: Record<AvoidanceType, number>;
  avgSteps: number;
  exerciseSessions: number;
  avgHydration: number;
  avgSleep: number;
  avgEnergy: number;
}
