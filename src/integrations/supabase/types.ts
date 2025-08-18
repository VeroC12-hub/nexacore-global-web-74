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
      event_analytics: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          priority: string | null
          project_id: string | null
          status: string | null
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
          priority?: string | null
          project_id?: string | null
          status?: string | null
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
          priority?: string | null
          project_id?: string | null
          status?: string | null
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
          budget: number | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          estimated_completion: string | null
          id: string
          metadata: Json | null
          priority: string | null
          project_manager_id: string | null
          service_type: string
          spent_amount: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_completion?: string | null
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_completion?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          project_manager_id?: string | null
          service_type: string
          spent_amount?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_completion?: string | null
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_completion?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          project_manager_id?: string | null
          service_type?: string
          spent_amount?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
    }
    Views: {
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
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_storage_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          supabase_files: number
          supabase_size: number
          total_files: number
          total_size: number
          usage_percentage: number
        }[]
      }
      get_user_profile: {
        Args: { user_email: string } | { user_id: string }
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
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
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
