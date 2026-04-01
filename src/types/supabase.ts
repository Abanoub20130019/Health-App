export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      fasting_sessions: {
        Row: {
          id: string
          user_id: string
          window_type: string
          start_time: string
          end_time: string | null
          target_duration_hours: number
          actual_duration_hours: number | null
          hunger_level: number | null
          energy_level: number | null
          broken_early: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          window_type: string
          start_time?: string
          end_time?: string | null
          target_duration_hours: number
          actual_duration_hours?: number | null
          hunger_level?: number | null
          energy_level?: number | null
          broken_early?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          window_type?: string
          start_time?: string
          end_time?: string | null
          target_duration_hours?: number
          actual_duration_hours?: number | null
          hunger_level?: number | null
          energy_level?: number | null
          broken_early?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      avoidance_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          avoidance_type: string
          custom_name: string | null
          avoided: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          avoidance_type: string
          custom_name?: string | null
          avoided?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          avoidance_type?: string
          custom_name?: string | null
          avoided?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      walking_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          step_count: number
          morning_walk_minutes: number | null
          morning_walk_distance_km: number | null
          evening_walk_minutes: number | null
          evening_walk_distance_km: number | null
          walking_meeting: boolean
          active_commute_minutes: number | null
          post_meal_walks: number
          total_distance_km: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          step_count?: number
          morning_walk_minutes?: number | null
          morning_walk_distance_km?: number | null
          evening_walk_minutes?: number | null
          evening_walk_distance_km?: number | null
          walking_meeting?: boolean
          active_commute_minutes?: number | null
          post_meal_walks?: number
          total_distance_km?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          step_count?: number
          morning_walk_minutes?: number | null
          morning_walk_distance_km?: number | null
          evening_walk_minutes?: number | null
          evening_walk_distance_km?: number | null
          walking_meeting?: boolean
          active_commute_minutes?: number | null
          post_meal_walks?: number
          total_distance_km?: number
          created_at?: string
          updated_at?: string
        }
      }
      exercise_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          exercise_type: string
          cardio_type: string | null
          muscle_groups: string[] | null
          duration_minutes: number
          intensity: string
          calories_burned: number | null
          feeling_score: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          exercise_type: string
          cardio_type?: string | null
          muscle_groups?: string[] | null
          duration_minutes: number
          intensity: string
          calories_burned?: number | null
          feeling_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exercise_type?: string
          cardio_type?: string | null
          muscle_groups?: string[] | null
          duration_minutes?: number
          intensity?: string
          calories_burned?: number | null
          feeling_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hydration_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          total_ml: number
          morning_water: boolean
          caffeine_after_2pm: boolean
          herbal_teas: number
          electrolytes: number
          entries: Array<{
            time: string
            amount_ml: number
            type: string
          }>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_ml?: number
          morning_water?: boolean
          caffeine_after_2pm?: boolean
          herbal_teas?: number
          electrolytes?: number
          entries?: Array<{
            time: string
            amount_ml: number
            type: string
          }>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_ml?: number
          morning_water?: boolean
          caffeine_after_2pm?: boolean
          herbal_teas?: number
          electrolytes?: number
          entries?: Array<{
            time: string
            amount_ml: number
            type: string
          }>
          created_at?: string
          updated_at?: string
        }
      }
      sleep_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          bedtime: string
          wake_time: string
          duration_hours: number
          screen_curfew_complied: boolean
          morning_sunlight_minutes: number | null
          sleep_quality: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          bedtime: string
          wake_time: string
          duration_hours: number
          screen_curfew_complied?: boolean
          morning_sunlight_minutes?: number | null
          sleep_quality?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          bedtime?: string
          wake_time?: string
          duration_hours?: number
          screen_curfew_complied?: boolean
          morning_sunlight_minutes?: number | null
          sleep_quality?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mindful_eating_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          meals_count: number
          protein_prioritized_meals: number
          vegetable_servings: number
          distraction_free_meals: number
          eighty_percent_full_meals: number
          meal_prep_completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meals_count?: number
          protein_prioritized_meals?: number
          vegetable_servings?: number
          distraction_free_meals?: number
          eighty_percent_full_meals?: number
          meal_prep_completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meals_count?: number
          protein_prioritized_meals?: number
          vegetable_servings?: number
          distraction_free_meals?: number
          eighty_percent_full_meals?: number
          meal_prep_completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          weight_kg: number | null
          weight_lb: number | null
          energy_level: number | null
          mood: string | null
          stress_level: number | null
          body_measurements: object | null
          progress_photo_url: string | null
          non_scale_victories: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight_kg?: number | null
          weight_lb?: number | null
          energy_level?: number | null
          mood?: string | null
          stress_level?: number | null
          body_measurements?: object | null
          progress_photo_url?: string | null
          non_scale_victories?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight_kg?: number | null
          weight_lb?: number | null
          energy_level?: number | null
          mood?: string | null
          stress_level?: number | null
          body_measurements?: object | null
          progress_photo_url?: string | null
          non_scale_victories?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          completed_habits: string[] | null
          missed_habits: string[] | null
          reflection_notes: string | null
          tomorrow_intentions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          completed_habits?: string[] | null
          missed_habits?: string[] | null
          reflection_notes?: string | null
          tomorrow_intentions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          completed_habits?: string[] | null
          missed_habits?: string[] | null
          reflection_notes?: string | null
          tomorrow_intentions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
