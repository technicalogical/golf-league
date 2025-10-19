export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          auth0_id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth0_id: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth0_id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          location: string | null
          total_holes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          total_holes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          total_holes?: number
          created_at?: string
          updated_at?: string
        }
      }
      holes: {
        Row: {
          id: string
          course_id: string
          hole_number: number
          par: number
          handicap_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          hole_number: number
          par: number
          handicap_index: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          hole_number?: number
          par?: number
          handicap_index?: number
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          profile_id: string
          team_id: string | null
          handicap: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          team_id?: string | null
          handicap?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          team_id?: string | null
          handicap?: number
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          course_id: string | null
          team1_id: string
          team2_id: string
          match_date: string
          status: 'scheduled' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id?: string | null
          team1_id: string
          team2_id: string
          match_date: string
          status?: 'scheduled' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          team1_id?: string
          team2_id?: string
          match_date?: string
          status?: 'scheduled' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      scorecards: {
        Row: {
          id: string
          match_id: string
          player_id: string
          handicap_at_time: number
          total_score: number | null
          points_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          handicap_at_time: number
          total_score?: number | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          handicap_at_time?: number
          total_score?: number | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      hole_scores: {
        Row: {
          id: string
          scorecard_id: string
          hole_id: string
          strokes: number
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          scorecard_id: string
          hole_id: string
          strokes: number
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          scorecard_id?: string
          hole_id?: string
          strokes?: number
          points_earned?: number
          created_at?: string
        }
      }
    }
  }
}
