export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contract_rules: {
        Row: {
          author: string
          created_at: string
          description: string
          id: string
          state: string
          title: string
        }
        Insert: {
          author: string
          created_at?: string
          description: string
          id?: string
          state?: string
          title: string
        }
        Update: {
          author?: string
          created_at?: string
          description?: string
          id?: string
          state?: string
          title?: string
        }
        Relationships: []
      }
      contract_rules_votes: {
        Row: {
          id: string
          rule_id: string
          user_id: string
          vote: boolean
        }
        Insert: {
          id?: string
          rule_id: string
          user_id: string
          vote: boolean
        }
        Update: {
          id?: string
          rule_id?: string
          user_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contract_rules_votes_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "contract_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_increases: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          giver_id: string
          id: string
          receiver_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          giver_id: string
          id?: string
          receiver_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          giver_id?: string
          id?: string
          receiver_id?: string
        }
        Relationships: []
      }
      partner_pseudos: {
        Row: {
          id: string
          owner_id: string | null
          partner_id: string | null
          pseudo: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          partner_id?: string | null
          pseudo?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          partner_id?: string | null
          pseudo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          credit: number
          firstname: string | null
          id: string
          lastname: string | null
          seen: number | null
          streak: number
          violation: number
        }
        Insert: {
          credit?: number
          firstname?: string | null
          id?: string
          lastname?: string | null
          seen?: number | null
          streak?: number
          violation?: number
        }
        Update: {
          credit?: number
          firstname?: string | null
          id?: string
          lastname?: string | null
          seen?: number | null
          streak?: number
          violation?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          endpoint: string
          expiration_time: string | null
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          endpoint: string
          expiration_time?: string | null
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          endpoint?: string
          expiration_time?: string | null
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          actor_id: string
          amount: number | null
          balance: number | null
          created_at: string | null
          event_type: string
          id: string
          target_id: string
        }
        Insert: {
          actor_id: string
          amount?: number | null
          balance?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          target_id: string
        }
        Update: {
          actor_id?: string
          amount?: number | null
          balance?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      give_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_receiver_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
