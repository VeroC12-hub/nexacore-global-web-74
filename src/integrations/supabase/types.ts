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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_assistant_analytics: {
        Row: {
          created_at: string | null
          date: string
          dimension_1: string | null
          dimension_1_value: string | null
          dimension_2: string | null
          dimension_2_value: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          date?: string
          dimension_1?: string | null
          dimension_1_value?: string | null
          dimension_2?: string | null
          dimension_2_value?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          dimension_1?: string | null
          dimension_1_value?: string | null
          dimension_2?: string | null
          dimension_2_value?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      ai_common_questions: {
        Row: {
          avg_satisfaction: number | null
          best_answer: string | null
          best_answer_source: string | null
          category: string | null
          created_at: string | null
          frequency: number | null
          id: string
          last_asked_at: string | null
          normalized_question: string
          question: string
          successful_answers: number | null
          total_asks: number | null
          updated_at: string | null
        }
        Insert: {
          avg_satisfaction?: number | null
          best_answer?: string | null
          best_answer_source?: string | null
          category?: string | null
          created_at?: string | null
          frequency?: number | null
          id?: string
          last_asked_at?: string | null
          normalized_question: string
          question: string
          successful_answers?: number | null
          total_asks?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_satisfaction?: number | null
          best_answer?: string | null
          best_answer_source?: string | null
          category?: string | null
          created_at?: string | null
          frequency?: number | null
          id?: string
          last_asked_at?: string | null
          normalized_question?: string
          question?: string
          successful_answers?: number | null
          total_asks?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_common_questions_best_answer_source_fkey"
            columns: ["best_answer_source"]
            isOneToOne: false
            referencedRelation: "ai_knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          ended_at: string | null
          feedback: string | null
          id: string
          is_resolved: boolean | null
          last_message_at: string | null
          metadata: Json | null
          resolution_type: string | null
          sentiment: string | null
          session_id: string
          started_at: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          total_messages: number | null
          user_id: string | null
          user_satisfaction: number | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          ended_at?: string | null
          feedback?: string | null
          id?: string
          is_resolved?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          resolution_type?: string | null
          sentiment?: string | null
          session_id: string
          started_at?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          total_messages?: number | null
          user_id?: string | null
          user_satisfaction?: number | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          ended_at?: string | null
          feedback?: string | null
          id?: string
          is_resolved?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          resolution_type?: string | null
          sentiment?: string | null
          session_id?: string
          started_at?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          total_messages?: number | null
          user_id?: string | null
          user_satisfaction?: number | null
        }
        Relationships: []
      }
      ai_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          search_count: number | null
          source_id: string | null
          source_type: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          usefulness_score: number | null
          version: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          search_count?: number | null
          source_id?: string | null
          source_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          usefulness_score?: number | null
          version?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          search_count?: number | null
          source_id?: string | null
          source_type?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          usefulness_score?: number | null
          version?: number | null
        }
        Relationships: []
      }
      ai_learning_feedback: {
        Row: {
          applied_at: string | null
          applied_to_knowledge: boolean | null
          conversation_id: string | null
          corrected_response: string | null
          created_at: string | null
          created_by: string | null
          feedback_type: string
          id: string
          impact_category: string | null
          message_id: string | null
          original_response: string | null
          priority: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_comment: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_to_knowledge?: boolean | null
          conversation_id?: string | null
          corrected_response?: string | null
          created_at?: string | null
          created_by?: string | null
          feedback_type: string
          id?: string
          impact_category?: string | null
          message_id?: string | null
          original_response?: string | null
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_comment?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_to_knowledge?: boolean | null
          conversation_id?: string | null
          corrected_response?: string | null
          created_at?: string | null
          created_by?: string | null
          feedback_type?: string
          id?: string
          impact_category?: string | null
          message_id?: string | null
          original_response?: string | null
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          confidence_score: number | null
          content: string
          content_type: string | null
          conversation_id: string
          created_at: string | null
          feedback_comment: string | null
          id: string
          metadata: Json | null
          model_used: string | null
          response_time_ms: number | null
          retrieved_knowledge: string[] | null
          role: string
          tokens_used: number | null
          was_helpful: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          content: string
          content_type?: string | null
          conversation_id: string
          created_at?: string | null
          feedback_comment?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          response_time_ms?: number | null
          retrieved_knowledge?: string[] | null
          role: string
          tokens_used?: number | null
          was_helpful?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          content?: string
          content_type?: string | null
          conversation_id?: string
          created_at?: string | null
          feedback_comment?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          response_time_ms?: number | null
          retrieved_knowledge?: string[] | null
          role?: string
          tokens_used?: number | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_data: {
        Row: {
          category: string
          chunk_count: number | null
          content: string
          created_at: string | null
          data_type: string
          embedding_status: string | null
          format: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          priority: number | null
          processing_status: string | null
          source_file_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category: string
          chunk_count?: number | null
          content: string
          created_at?: string | null
          data_type: string
          embedding_status?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          priority?: number | null
          processing_status?: string | null
          source_file_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          chunk_count?: number | null
          content?: string
          created_at?: string | null
          data_type?: string
          embedding_status?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          priority?: number | null
          processing_status?: string | null
          source_file_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      approval_queue: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          request_data: Json | null
          request_type: string
          requester_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          request_data?: Json | null
          request_type: string
          requester_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          request_data?: Json | null
          request_type?: string
          requester_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_queue_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string | null
          booking_status: string | null
          created_at: string | null
          event_id: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          quantity: number
          special_requests: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_number?: string | null
          booking_status?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number
          special_requests?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_number?: string | null
          booking_status?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number
          special_requests?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_event_id"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_portal_settings: {
        Row: {
          client_id: string | null
          created_at: string | null
          dashboard_layout: Json | null
          id: string
          language: string | null
          notification_preferences: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          language?: string | null
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          language?: string | null
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      erp_companies: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          name: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          name: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          name?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      erp_permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      erp_project_teams: {
        Row: {
          can_approve_time: boolean | null
          can_approve_timesheets: boolean | null
          can_assign_tasks: boolean | null
          can_edit_project: boolean | null
          can_view_budget: boolean | null
          erp_project_id: string | null
          id: string
          is_active: boolean | null
          joined_date: string | null
          role_in_project: string | null
          role_type: string | null
          user_id: string | null
        }
        Insert: {
          can_approve_time?: boolean | null
          can_approve_timesheets?: boolean | null
          can_assign_tasks?: boolean | null
          can_edit_project?: boolean | null
          can_view_budget?: boolean | null
          erp_project_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          role_in_project?: string | null
          role_type?: string | null
          user_id?: string | null
        }
        Update: {
          can_approve_time?: boolean | null
          can_approve_timesheets?: boolean | null
          can_assign_tasks?: boolean | null
          can_edit_project?: boolean | null
          can_view_budget?: boolean | null
          erp_project_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          role_in_project?: string | null
          role_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_project_teams_erp_project_id_fkey"
            columns: ["erp_project_id"]
            isOneToOne: false
            referencedRelation: "erp_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_projects: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_manager: string | null
          billing_type: string | null
          budget: number | null
          client_id: string | null
          company_id: string | null
          created_at: string | null
          department: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          hourly_rate: number | null
          id: string
          priority: string | null
          profit_margin: number | null
          progress: number | null
          project_code: string | null
          project_type: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_manager?: string | null
          billing_type?: string | null
          budget?: number | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          priority?: string | null
          profit_margin?: number | null
          progress?: number | null
          project_code?: string | null
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_manager?: string | null
          billing_type?: string | null
          budget?: number | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          priority?: string | null
          profit_margin?: number | null
          progress?: number | null
          project_code?: string | null
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "erp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "erp_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_staff_roles: {
        Row: {
          created_at: string | null
          department: string | null
          end_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          position: string | null
          role: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          position?: string | null
          role: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          position?: string | null
          role?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      erp_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          erp_project_id: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          progress: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          erp_project_id?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          erp_project_id?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_tasks_erp_project_id_fkey"
            columns: ["erp_project_id"]
            isOneToOne: false
            referencedRelation: "erp_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billable: boolean | null
          created_at: string | null
          date: string
          description: string | null
          erp_project_id: string | null
          erp_task_id: string | null
          hourly_rate: number | null
          hours: number
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billable?: boolean | null
          created_at?: string | null
          date: string
          description?: string | null
          erp_project_id?: string | null
          erp_task_id?: string | null
          hourly_rate?: number | null
          hours: number
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billable?: boolean | null
          created_at?: string | null
          date?: string
          description?: string | null
          erp_project_id?: string | null
          erp_task_id?: string | null
          hourly_rate?: number | null
          hours?: number
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_time_entries_erp_project_id_fkey"
            columns: ["erp_project_id"]
            isOneToOne: false
            referencedRelation: "erp_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_time_entries_erp_task_id_fkey"
            columns: ["erp_task_id"]
            isOneToOne: false
            referencedRelation: "erp_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_user_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "erp_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_user_roles: {
        Row: {
          company_id: string | null
          created_at: string | null
          department: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "erp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      event_analytics: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          metric_type: string
          metric_value: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          event_id: string | null
          id: string
          is_featured: boolean | null
          media_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          media_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          media_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_media_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          banner_url: string | null
          booked: number | null
          capacity: number
          category: string
          city: string | null
          co_organizers: string[] | null
          country: string | null
          created_at: string | null
          currency: string | null
          current_attendees: number | null
          description: string
          end_date: string | null
          end_time: string | null
          event_date: string
          event_time: string
          featured: boolean | null
          gallery_images: string[] | null
          id: string
          image_url: string | null
          is_private: boolean | null
          location: string | null
          max_attendees: number
          metadata: Json | null
          organizer_id: string | null
          price: number
          published_at: string | null
          requires_approval: boolean | null
          short_description: string | null
          status: string | null
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string | null
          venue: string
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          booked?: number | null
          capacity?: number
          category: string
          city?: string | null
          co_organizers?: string[] | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          current_attendees?: number | null
          description: string
          end_date?: string | null
          end_time?: string | null
          event_date: string
          event_time: string
          featured?: boolean | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          is_private?: boolean | null
          location?: string | null
          max_attendees?: number
          metadata?: Json | null
          organizer_id?: string | null
          price?: number
          published_at?: string | null
          requires_approval?: boolean | null
          short_description?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          venue: string
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          booked?: number | null
          capacity?: number
          category?: string
          city?: string | null
          co_organizers?: string[] | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          current_attendees?: number | null
          description?: string
          end_date?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string
          featured?: boolean | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          is_private?: boolean | null
          location?: string | null
          max_attendees?: number
          metadata?: Json | null
          organizer_id?: string | null
          price?: number
          published_at?: string | null
          requires_approval?: boolean | null
          short_description?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_id: string | null
          folder_name: string
          folder_type: string | null
          google_drive_folder_id: string
          id: string
          parent_folder_id: string | null
          updated_at: string | null
          web_view_link: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          folder_name: string
          folder_type?: string | null
          google_drive_folder_id: string
          id?: string
          parent_folder_id?: string | null
          updated_at?: string | null
          web_view_link?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          folder_name?: string
          folder_type?: string | null
          google_drive_folder_id?: string
          id?: string
          parent_folder_id?: string | null
          updated_at?: string | null
          web_view_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_drive_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_drive_folders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_drive_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_media: {
        Row: {
          button_text: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          link_url: string | null
          media_file_id: string
          media_type: string
          section: string | null
          start_date: string | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          media_file_id: string
          media_type: string
          section?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          media_file_id?: string
          media_type?: string
          section?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_media_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_method_id: string | null
          project_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          title: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          backup_url_1: string | null
          backup_url_2: string | null
          backup_url_3: string | null
          created_at: string | null
          download_url: string | null
          file_size: number | null
          file_type: string | null
          google_drive_file_id: string
          google_drive_folder_id: string | null
          id: string
          is_archived: boolean | null
          is_public: boolean | null
          last_accessed_at: string | null
          mime_type: string
          name: string
          original_name: string
          storage_strategy: string | null
          supabase_storage_bucket: string | null
          supabase_storage_path: string | null
          thumbnail_url: string | null
          transfer_status: string | null
          updated_at: string | null
          uploaded_by: string | null
          web_view_link: string | null
        }
        Insert: {
          backup_url_1?: string | null
          backup_url_2?: string | null
          backup_url_3?: string | null
          created_at?: string | null
          download_url?: string | null
          file_size?: number | null
          file_type?: string | null
          google_drive_file_id: string
          google_drive_folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          last_accessed_at?: string | null
          mime_type: string
          name: string
          original_name: string
          storage_strategy?: string | null
          supabase_storage_bucket?: string | null
          supabase_storage_path?: string | null
          thumbnail_url?: string | null
          transfer_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          web_view_link?: string | null
        }
        Update: {
          backup_url_1?: string | null
          backup_url_2?: string | null
          backup_url_3?: string | null
          created_at?: string | null
          download_url?: string | null
          file_size?: number | null
          file_type?: string | null
          google_drive_file_id?: string
          google_drive_folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          last_accessed_at?: string | null
          mime_type?: string
          name?: string
          original_name?: string
          storage_strategy?: string | null
          supabase_storage_bucket?: string | null
          supabase_storage_path?: string | null
          thumbnail_url?: string | null
          transfer_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          web_view_link?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          project_id: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          project_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          project_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          configuration: Json
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string
          processed_at: string | null
          provider_response: Json | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method: string
          processed_at?: string | null
          provider_response?: Json | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string
          processed_at?: string | null
          provider_response?: Json | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pm_invitation_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          quote_request_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          quote_request_id?: string | null
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          quote_request_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_invitation_tokens_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_files: {
        Row: {
          description: string | null
          display_order: number | null
          download_count: number | null
          file_category: string | null
          file_path: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          filename: string
          id: string
          is_downloadable: boolean | null
          is_public: boolean | null
          original_filename: string
          portfolio_project_id: string | null
          software_used: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          description?: string | null
          display_order?: number | null
          download_count?: number | null
          file_category?: string | null
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          filename: string
          id?: string
          is_downloadable?: boolean | null
          is_public?: boolean | null
          original_filename: string
          portfolio_project_id?: string | null
          software_used?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          description?: string | null
          display_order?: number | null
          download_count?: number | null
          file_category?: string | null
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          is_downloadable?: boolean | null
          is_public?: boolean | null
          original_filename?: string
          portfolio_project_id?: string | null
          software_used?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_files_portfolio_project_id_fkey"
            columns: ["portfolio_project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          challenge: string | null
          client_name: string | null
          client_testimonial: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          erp_project_id: string | null
          featured_image_url: string | null
          gallery_images: Json | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          project_metrics: Json | null
          results: string | null
          seo_keywords: string[] | null
          service_category_id: string | null
          service_id: string
          short_description: string | null
          show_client_name: boolean | null
          solution: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          challenge?: string | null
          client_name?: string | null
          client_testimonial?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          erp_project_id?: string | null
          featured_image_url?: string | null
          gallery_images?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          project_metrics?: Json | null
          results?: string | null
          seo_keywords?: string[] | null
          service_category_id?: string | null
          service_id: string
          short_description?: string | null
          show_client_name?: boolean | null
          solution?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          challenge?: string | null
          client_name?: string | null
          client_testimonial?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          erp_project_id?: string | null
          featured_image_url?: string | null
          gallery_images?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          project_metrics?: Json | null
          results?: string | null
          seo_keywords?: string[] | null
          service_category_id?: string | null
          service_id?: string
          short_description?: string | null
          show_client_name?: boolean | null
          solution?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "erp_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_erp_project_id_fkey"
            columns: ["erp_project_id"]
            isOneToOne: false
            referencedRelation: "erp_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_service_categories: {
        Row: {
          allowed_file_types: string[] | null
          color_theme: string | null
          created_at: string | null
          departments: string[] | null
          description: string | null
          display_order: number | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          service_id: string
          service_name: string
          updated_at: string | null
        }
        Insert: {
          allowed_file_types?: string[] | null
          color_theme?: string | null
          created_at?: string | null
          departments?: string[] | null
          description?: string | null
          display_order?: number | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          service_id: string
          service_name: string
          updated_at?: string | null
        }
        Update: {
          allowed_file_types?: string[] | null
          color_theme?: string | null
          created_at?: string | null
          departments?: string[] | null
          description?: string | null
          display_order?: number | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          service_id?: string
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      portfolio_settings: {
        Row: {
          allowed_file_types: string[] | null
          auto_publish_completed_projects: boolean | null
          company_id: string | null
          id: string
          max_file_size_mb: number | null
          projects_per_page: number | null
          require_approval_before_publish: boolean | null
          show_client_names_by_default: boolean | null
          show_project_budgets: boolean | null
          show_team_members: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          allowed_file_types?: string[] | null
          auto_publish_completed_projects?: boolean | null
          company_id?: string | null
          id?: string
          max_file_size_mb?: number | null
          projects_per_page?: number | null
          require_approval_before_publish?: boolean | null
          show_client_names_by_default?: boolean | null
          show_project_budgets?: boolean | null
          show_team_members?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          allowed_file_types?: string[] | null
          auto_publish_completed_projects?: boolean | null
          company_id?: string | null
          id?: string
          max_file_size_mb?: number | null
          projects_per_page?: number | null
          require_approval_before_publish?: boolean | null
          show_client_names_by_default?: boolean | null
          show_project_budgets?: boolean | null
          show_team_members?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "erp_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          last_sign_in_at: string | null
          location: string | null
          phone: string | null
          preferences: Json | null
          role: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_sign_in_at?: string | null
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_sign_in_at?: string | null
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          access_level: string | null
          category: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_latest: boolean | null
          project_id: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          access_level?: string | null
          category?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_latest?: boolean | null
          project_id?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          access_level?: string | null
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_latest?: boolean | null
          project_id?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          project_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_members_profiles_assigned_by"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_members_profiles_assigned_by"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_members_profiles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_members_profiles_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_members_projects"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "erp_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          message_type: string | null
          parent_message_id: string | null
          project_id: string | null
          read_at: string | null
          read_by: Json | null
          sender_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          message_type?: string | null
          parent_message_id?: string | null
          project_id?: string | null
          read_at?: string | null
          read_by?: Json | null
          sender_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          message_type?: string | null
          parent_message_id?: string | null
          project_id?: string | null
          read_at?: string | null
          read_by?: Json | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "project_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          project_id: string | null
          recipient_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          project_id?: string | null
          recipient_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          project_id?: string | null
          recipient_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          order_index: number | null
          priority: string | null
          project_id: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          order_index?: number | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          order_index?: number | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_completion: string | null
          actual_hours: number | null
          budget: number | null
          client_id: string | null
          completion_percentage: number | null
          created_at: string | null
          deadline: string | null
          deliverables: Json | null
          description: string | null
          end_date: string | null
          estimated_completion: string | null
          estimated_hours: number | null
          id: string
          metadata: Json | null
          priority: string | null
          progress: number | null
          project_manager_id: string | null
          project_type: string | null
          service_category: string | null
          service_type: string
          spent_amount: number | null
          start_date: string | null
          status: string | null
          team_members: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_completion?: string | null
          actual_hours?: number | null
          budget?: number | null
          client_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          deadline?: string | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string | null
          estimated_completion?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          progress?: number | null
          project_manager_id?: string | null
          project_type?: string | null
          service_category?: string | null
          service_type: string
          spent_amount?: number | null
          start_date?: string | null
          status?: string | null
          team_members?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_completion?: string | null
          actual_hours?: number | null
          budget?: number | null
          client_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          deadline?: string | null
          deliverables?: Json | null
          description?: string | null
          end_date?: string | null
          estimated_completion?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          progress?: number | null
          project_manager_id?: string | null
          project_type?: string | null
          service_category?: string | null
          service_type?: string
          spent_amount?: number | null
          start_date?: string | null
          status?: string | null
          team_members?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_activities: {
        Row: {
          activity_type: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          proposal_id: string
        }
        Insert: {
          activity_type: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          proposal_id: string
        }
        Update: {
          activity_type?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_activities_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          service_type: string | null
          template_sections: Json
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          service_type?: string | null
          template_sections?: Json
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          service_type?: string | null
          template_sections?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_versions: {
        Row: {
          changed_fields: Json | null
          changes_summary: string | null
          content_snapshot: Json
          created_at: string | null
          created_by: string | null
          id: string
          proposal_id: string
          version_number: string
        }
        Insert: {
          changed_fields?: Json | null
          changes_summary?: string | null
          content_snapshot: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          proposal_id: string
          version_number: string
        }
        Update: {
          changed_fields?: Json | null
          changes_summary?: string | null
          content_snapshot?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          proposal_id?: string
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          branding_config: Json | null
          client_company: string | null
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          client_response: string | null
          created_at: string | null
          created_by: string
          currency: string
          custom_sections: Json | null
          deliverables: Json | null
          estimated_end_date: string | null
          estimated_start_date: string | null
          executive_summary: Json | null
          id: string
          internal_notes: string | null
          is_latest_version: boolean | null
          methodology: Json | null
          parent_proposal_id: string | null
          project_created: boolean | null
          project_id: string | null
          proposal_number: string
          quote_id: string | null
          quote_request_id: string | null
          rejected_at: string | null
          risk_analysis: Json | null
          scope_of_work: Json | null
          sent_at: string | null
          service_type: string
          status: string
          success_metrics: Json | null
          team_bios: Json | null
          terms_and_conditions: string | null
          timeline: string | null
          title: string
          total_price: number
          updated_at: string | null
          use_custom_branding: boolean | null
          valid_until: string | null
          version_number: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          branding_config?: Json | null
          client_company?: string | null
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          client_response?: string | null
          created_at?: string | null
          created_by: string
          currency?: string
          custom_sections?: Json | null
          deliverables?: Json | null
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          executive_summary?: Json | null
          id?: string
          internal_notes?: string | null
          is_latest_version?: boolean | null
          methodology?: Json | null
          parent_proposal_id?: string | null
          project_created?: boolean | null
          project_id?: string | null
          proposal_number: string
          quote_id?: string | null
          quote_request_id?: string | null
          rejected_at?: string | null
          risk_analysis?: Json | null
          scope_of_work?: Json | null
          sent_at?: string | null
          service_type: string
          status?: string
          success_metrics?: Json | null
          team_bios?: Json | null
          terms_and_conditions?: string | null
          timeline?: string | null
          title: string
          total_price?: number
          updated_at?: string | null
          use_custom_branding?: boolean | null
          valid_until?: string | null
          version_number?: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          branding_config?: Json | null
          client_company?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          client_response?: string | null
          created_at?: string | null
          created_by?: string
          currency?: string
          custom_sections?: Json | null
          deliverables?: Json | null
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          executive_summary?: Json | null
          id?: string
          internal_notes?: string | null
          is_latest_version?: boolean | null
          methodology?: Json | null
          parent_proposal_id?: string | null
          project_created?: boolean | null
          project_id?: string | null
          proposal_number?: string
          quote_id?: string | null
          quote_request_id?: string | null
          rejected_at?: string | null
          risk_analysis?: Json | null
          scope_of_work?: Json | null
          sent_at?: string | null
          service_type?: string
          status?: string
          success_metrics?: Json | null
          team_bios?: Json | null
          terms_and_conditions?: string | null
          timeline?: string | null
          title?: string
          total_price?: number
          updated_at?: string | null
          use_custom_branding?: boolean | null
          valid_until?: string | null
          version_number?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_parent_proposal_id_fkey"
            columns: ["parent_proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          performed_by: string | null
          quote_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          performed_by?: string | null
          quote_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          performed_by?: string | null
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_actions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_actions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_actions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget_estimate: number | null
          company: string | null
          country: string | null
          created_at: string
          description: string
          email: string
          email_sent_at: string | null
          email_thread_id: string | null
          full_name: string
          id: string
          phone: string | null
          pm_token_id: string | null
          service_type: string
          status: string | null
          tier: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget_estimate?: number | null
          company?: string | null
          country?: string | null
          created_at?: string
          description: string
          email: string
          email_sent_at?: string | null
          email_thread_id?: string | null
          full_name: string
          id?: string
          phone?: string | null
          pm_token_id?: string | null
          service_type: string
          status?: string | null
          tier?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget_estimate?: number | null
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string
          email?: string
          email_sent_at?: string | null
          email_thread_id?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          pm_token_id?: string | null
          service_type?: string
          status?: string | null
          tier?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_pm_token_id_fkey"
            columns: ["pm_token_id"]
            isOneToOne: false
            referencedRelation: "pm_invitation_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          quote_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          quote_id?: string | null
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          quote_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_tokens_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approved_at: string | null
          client_email: string
          client_message: string | null
          client_viewed_at: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          deliverables: Json | null
          email_thread_id: string | null
          expires_at: string | null
          id: string
          last_email_sent_at: string | null
          original_quote_id: string | null
          price: number
          project_manager_email: string | null
          quote_request_id: string | null
          revision_count: number | null
          scope: string
          sent_at: string | null
          service_type: string
          status: string | null
          terms: string | null
          timeline: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          client_email: string
          client_message?: string | null
          client_viewed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deliverables?: Json | null
          email_thread_id?: string | null
          expires_at?: string | null
          id?: string
          last_email_sent_at?: string | null
          original_quote_id?: string | null
          price: number
          project_manager_email?: string | null
          quote_request_id?: string | null
          revision_count?: number | null
          scope: string
          sent_at?: string | null
          service_type: string
          status?: string | null
          terms?: string | null
          timeline: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          client_email?: string
          client_message?: string | null
          client_viewed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deliverables?: Json | null
          email_thread_id?: string | null
          expires_at?: string | null
          id?: string
          last_email_sent_at?: string | null
          original_quote_id?: string | null
          price?: number
          project_manager_email?: string | null
          quote_request_id?: string | null
          revision_count?: number | null
          scope?: string
          sent_at?: string | null
          service_type?: string
          status?: string | null
          terms?: string | null
          timeline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_original_quote_id_fkey"
            columns: ["original_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          event_id: string
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          event_id: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          event_id?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          budget_estimate: number | null
          client_id: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          priority: string | null
          request_type: string
          requested_completion: string | null
          response_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_estimate?: number | null
          client_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          request_type: string
          requested_completion?: string | null
          response_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_estimate?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          request_type?: string
          requested_completion?: string | null
          response_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          notes: string | null
          permission_type: string
          revoked: boolean | null
          revoked_at: string | null
          revoked_by: string | null
          staff_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          notes?: string | null
          permission_type: string
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          staff_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          notes?: string | null
          permission_type?: string
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          staff_user_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string
          full_name: string
          id: string
          invitation_token: string
          invited_at: string
          invited_by: string | null
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string
          full_name: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string | null
          role: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          marketing_emails: boolean | null
          sms_notifications: boolean | null
          theme_preference: string | null
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          sms_notifications?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          sms_notifications?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          events_attended: number | null
          events_created: number | null
          full_name: string | null
          id: string
          is_vip: boolean | null
          last_login: string | null
          loyalty_points: number | null
          loyalty_tier: string | null
          metadata: Json | null
          phone: string | null
          preferences: Json | null
          role: string | null
          social_profiles: Json | null
          status: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          events_attended?: number | null
          events_created?: number | null
          full_name?: string | null
          id: string
          is_vip?: boolean | null
          last_login?: string | null
          loyalty_points?: number | null
          loyalty_tier?: string | null
          metadata?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          social_profiles?: Json | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          events_attended?: number | null
          events_created?: number | null
          full_name?: string | null
          id?: string
          is_vip?: boolean | null
          last_login?: string | null
          loyalty_points?: number | null
          loyalty_tier?: string | null
          metadata?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          social_profiles?: Json | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          amenities: string[] | null
          capacity: number | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          postal_code: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          capacity?: number | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          postal_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          capacity?: number | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          postal_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      vip_packages: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          currency: string | null
          current_bookings: number | null
          description: string | null
          event_id: string | null
          id: string
          is_active: boolean | null
          max_capacity: number | null
          name: string
          price: number
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          currency?: string | null
          current_bookings?: number | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          name: string
          price: number
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          currency?: string | null
          current_bookings?: number | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      workflow_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string | null
          id: string
          status: string
          workflow_step_instance_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          status?: string
          workflow_step_instance_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          status?: string
          workflow_step_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_workflow_step_instance_id_fkey"
            columns: ["workflow_step_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_step_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          trigger_condition: Json
          trigger_type: string
          workflow_template_id: string | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          trigger_condition?: Json
          trigger_type: string
          workflow_template_id?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          trigger_condition?: Json
          trigger_type?: string
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_automation_rules_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          initiated_by: string | null
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string | null
          workflow_template_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiated_by?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
          workflow_template_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          initiated_by?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_step_instances: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: string
          workflow_instance_id: string | null
          workflow_step_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          workflow_instance_id?: string | null
          workflow_step_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          workflow_instance_id?: string | null
          workflow_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_instances_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_instances_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_instances_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_instances_workflow_step_id_fkey"
            columns: ["workflow_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          auto_assign_to: string | null
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          id: string
          is_parallel: boolean | null
          name: string
          requires_approval: boolean | null
          step_order: number
          step_type: string
          workflow_template_id: string | null
        }
        Insert: {
          auto_assign_to?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          id?: string
          is_parallel?: boolean | null
          name: string
          requires_approval?: boolean | null
          step_order: number
          step_type?: string
          workflow_template_id?: string | null
        }
        Update: {
          auto_assign_to?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          id?: string
          is_parallel?: boolean | null
          name?: string
          requires_approval?: boolean | null
          step_order?: number
          step_type?: string
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      storage_analytics: {
        Row: {
          drive_files: number | null
          file_count: number | null
          storage_strategy: string | null
          supabase_files: number | null
          total_size: number | null
          transfer_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_project_from_proposal: {
        Args: { proposal_uuid: string }
        Returns: string
      }
      create_project_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_notification_type: string
          p_project_id: string
          p_title: string
        }
        Returns: string
      }
      current_user_role: { Args: never; Returns: string }
      exec_sql: { Args: { query: string }; Returns: Json }
      generate_proposal_number: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_portfolio_projects_by_service: {
        Args: {
          include_unpublished?: boolean
          limit_count?: number
          service_category: string
        }
        Returns: {
          client_name: string
          description: string
          file_count: number
          id: string
          is_featured: boolean
          service_id: string
          thumbnail_url: string
          title: string
        }[]
      }
      get_storage_usage: {
        Args: never
        Returns: {
          supabase_files: number
          supabase_size: number
          total_files: number
          total_size: number
          usage_percentage: number
        }[]
      }
      get_unread_notification_count: {
        Args: { user_id: string }
        Returns: number
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: {
          expires_at: string
          granted_at: string
          granted_by: string
          permission_type: string
        }[]
      }
      get_user_profile:
        | {
            Args: { user_email: string }
            Returns: {
              email: string
              full_name: string
              id: string
              role: string
              status: string
            }[]
          }
        | {
            Args: { user_id: string }
            Returns: {
              avatar_url: string
              bio: string
              created_at: string
              email: string
              full_name: string
              id: string
              phone: string
              role: string
              status: string
              updated_at: string
            }[]
          }
      get_user_role: { Args: { user_id: string }; Returns: string }
      has_staff_permission: {
        Args: { permission: string; user_id: string }
        Returns: boolean
      }
      increment_common_question: {
        Args: { q_category: string; q_text: string }
        Returns: string
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      search_knowledge_base: {
        Args: {
          filter_category?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      user_has_permission: {
        Args: { permission_name: string }
        Returns: boolean
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
