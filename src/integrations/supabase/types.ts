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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_name: string
          phone: string
          service: string
          status: string
          time: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_name: string
          phone: string
          service: string
          status?: string
          time: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_name?: string
          phone?: string
          service?: string
          status?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          description_ru: string | null
          description_uz: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          name_ru: string | null
          name_uz: string | null
          parent_id: string | null
          slug: string | null
          sort_order: number
          type: string
          type_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ru?: string | null
          description_uz?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          name_ru?: string | null
          name_uz?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number
          type?: string
          type_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ru?: string | null
          description_uz?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          name_ru?: string | null
          name_uz?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number
          type?: string
          type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "category_types"
            referencedColumns: ["id"]
          },
        ]
      }
      category_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          name_ru: string | null
          name_uz: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          name_ru?: string | null
          name_uz?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          name_ru?: string | null
          name_uz?: string | null
          slug?: string
        }
        Relationships: []
      }
      clinic_settings: {
        Row: {
          address: string | null
          clinic_name: string
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          phone: string | null
          telegram: string | null
          updated_at: string
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          clinic_name?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          phone?: string | null
          telegram?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          clinic_name?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          phone?: string | null
          telegram?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          bio_ru: string | null
          bio_uz: string | null
          branch: string | null
          consultation_price: number | null
          created_at: string
          experience_years: number | null
          id: string
          image_url: string | null
          is_active: boolean
          languages: string[] | null
          name: string
          name_ru: string | null
          name_uz: string | null
          online_available: boolean
          phone: string | null
          schedule: string | null
          services_offered: string[] | null
          slug: string | null
          specialization: string
          specialization_ru: string | null
          specialization_uz: string | null
        }
        Insert: {
          bio?: string | null
          bio_ru?: string | null
          bio_uz?: string | null
          branch?: string | null
          consultation_price?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          languages?: string[] | null
          name: string
          name_ru?: string | null
          name_uz?: string | null
          online_available?: boolean
          phone?: string | null
          schedule?: string | null
          services_offered?: string[] | null
          slug?: string | null
          specialization: string
          specialization_ru?: string | null
          specialization_uz?: string | null
        }
        Update: {
          bio?: string | null
          bio_ru?: string | null
          bio_uz?: string | null
          branch?: string | null
          consultation_price?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          languages?: string[] | null
          name?: string
          name_ru?: string | null
          name_uz?: string | null
          online_available?: boolean
          phone?: string | null
          schedule?: string | null
          services_offered?: string[] | null
          slug?: string | null
          specialization?: string
          specialization_ru?: string | null
          specialization_uz?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          description_ru: string | null
          description_uz: string | null
          doctor_ids: string[] | null
          duration: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_online: boolean
          location_type: string | null
          name: string
          name_ru: string | null
          name_uz: string | null
          preparation_requirements: string | null
          preparation_requirements_ru: string | null
          preparation_requirements_uz: string | null
          price: number | null
          result_info: string | null
          result_info_ru: string | null
          result_info_uz: string | null
          slug: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ru?: string | null
          description_uz?: string | null
          doctor_ids?: string[] | null
          duration?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_online?: boolean
          location_type?: string | null
          name: string
          name_ru?: string | null
          name_uz?: string | null
          preparation_requirements?: string | null
          preparation_requirements_ru?: string | null
          preparation_requirements_uz?: string | null
          price?: number | null
          result_info?: string | null
          result_info_ru?: string | null
          result_info_uz?: string | null
          slug?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ru?: string | null
          description_uz?: string | null
          doctor_ids?: string[] | null
          duration?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_online?: boolean
          location_type?: string | null
          name?: string
          name_ru?: string | null
          name_uz?: string | null
          preparation_requirements?: string | null
          preparation_requirements_ru?: string | null
          preparation_requirements_uz?: string | null
          price?: number | null
          result_info?: string | null
          result_info_ru?: string | null
          result_info_uz?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value_ru: string | null
          value_type: string
          value_uz: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value_ru?: string | null
          value_type?: string
          value_uz?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value_ru?: string | null
          value_type?: string
          value_uz?: string | null
        }
        Relationships: []
      }
      tests: {
        Row: {
          biomaterial_type: string | null
          category_id: string | null
          created_at: string
          description: string | null
          description_ru: string | null
          description_uz: string | null
          id: string
          is_active: boolean
          is_recommended: boolean
          is_urgent: boolean
          name: string
          name_ru: string | null
          name_uz: string | null
          preparation_requirements: string | null
          preparation_requirements_ru: string | null
          preparation_requirements_uz: string | null
          price: number
          result_time: string | null
          slug: string | null
        }
        Insert: {
          biomaterial_type?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          is_urgent?: boolean
          name: string
          name_ru?: string | null
          name_uz?: string | null
          preparation_requirements?: string | null
          preparation_requirements_ru?: string | null
          preparation_requirements_uz?: string | null
          price?: number
          result_time?: string | null
          slug?: string | null
        }
        Update: {
          biomaterial_type?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ru?: string | null
          description_uz?: string | null
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          is_urgent?: boolean
          name?: string
          name_ru?: string | null
          name_uz?: string | null
          preparation_requirements?: string | null
          preparation_requirements_ru?: string | null
          preparation_requirements_uz?: string | null
          price?: number
          result_time?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_doctors: {
        Args: never
        Returns: {
          bio: string | null
          bio_ru: string | null
          bio_uz: string | null
          branch: string | null
          consultation_price: number | null
          created_at: string
          experience_years: number | null
          id: string
          image_url: string | null
          is_active: boolean
          languages: string[] | null
          name: string
          name_ru: string | null
          name_uz: string | null
          online_available: boolean
          phone: string | null
          schedule: string | null
          services_offered: string[] | null
          slug: string | null
          specialization: string
          specialization_ru: string | null
          specialization_uz: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "doctors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
