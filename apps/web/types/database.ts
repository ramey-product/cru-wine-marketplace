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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      curated_collection_items: {
        Row: {
          id: string
          org_id: string
          collection_id: string
          wine_id: string
          position: number
          curator_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          collection_id: string
          wine_id: string
          position?: number
          curator_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          collection_id?: string
          wine_id?: string
          position?: number
          curator_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_collection_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "curated_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_collection_items_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_collections: {
        Row: {
          id: string
          org_id: string
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          curator_id: string
          display_order: number
          is_active: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          curator_id: string
          display_order?: number
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          curator_id?: string
          display_order?: number
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_collections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_holds: {
        Row: {
          id: string
          wine_id: string
          retailer_org_id: string
          user_id: string
          quantity: number
          expires_at: string
          status: string
          stripe_checkout_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wine_id: string
          retailer_org_id: string
          user_id: string
          quantity: number
          expires_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wine_id?: string
          retailer_org_id?: string
          user_id?: string
          quantity?: number
          expires_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_holds_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_holds_retailer_org_id_fkey"
            columns: ["retailer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_holds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          id: string
          org_id: string
          email: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["invite_status"]
          invited_by: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          invited_by: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          invited_by?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id: string
          role?: Database["public"]["Enums"]["member_role"]
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          invited_by?: string | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          wine_id: string
          quantity: number
          unit_price: number
          subtotal: number
          medusa_line_item_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          wine_id: string
          quantity?: number
          unit_price: number
          subtotal: number
          medusa_line_item_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          wine_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          medusa_line_item_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          org_id: string
          user_id: string
          status: string
          fulfillment_type: string
          delivery_address: Json | null
          delivery_fee: number
          subtotal: number
          tax: number
          total: number
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          medusa_cart_id: string | null
          medusa_order_id: string | null
          estimated_ready_at: string | null
          notes: string | null
          age_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          status?: string
          fulfillment_type: string
          delivery_address?: Json | null
          delivery_fee?: number
          subtotal: number
          tax?: number
          total: number
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          medusa_cart_id?: string | null
          medusa_order_id?: string | null
          estimated_ready_at?: string | null
          notes?: string | null
          age_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          status?: string
          fulfillment_type?: string
          delivery_address?: Json | null
          delivery_fee?: number
          subtotal?: number
          tax?: number
          total?: number
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          medusa_cart_id?: string | null
          medusa_order_id?: string | null
          estimated_ready_at?: string | null
          notes?: string | null
          age_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          sso_provider_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          sso_provider_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          sso_provider_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      producer_photos: {
        Row: {
          id: string
          org_id: string
          producer_id: string
          image_url: string
          caption: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          producer_id: string
          image_url: string
          caption?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          producer_id?: string
          image_url?: string
          caption?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_photos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producer_photos_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          id: string
          org_id: string
          name: string
          slug: string
          region: string | null
          country: string | null
          tagline: string | null
          story_content: string | null
          farming_practices: Json | null
          vineyard_size: string | null
          year_established: number | null
          annual_production: string | null
          hero_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          slug: string
          region?: string | null
          country?: string | null
          tagline?: string | null
          story_content?: string | null
          farming_practices?: Json | null
          vineyard_size?: string | null
          year_established?: number | null
          annual_production?: string | null
          hero_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          slug?: string
          region?: string | null
          country?: string | null
          tagline?: string | null
          story_content?: string | null
          farming_practices?: Json | null
          vineyard_size?: string | null
          year_established?: number | null
          annual_production?: string | null
          hero_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          age_confirmed_at: string | null
          deletion_requested_at: string | null
          deletion_scheduled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          age_confirmed_at?: string | null
          deletion_requested_at?: string | null
          deletion_scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          age_confirmed_at?: string | null
          deletion_requested_at?: string | null
          deletion_scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          id: string
          user_id: string
          query: string
          searched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          searched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          searched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_inventory: {
        Row: {
          id: string
          org_id: string
          retailer_id: string
          wine_id: string
          sku: string | null
          price: number
          quantity: number
          stock_status: string
          sync_source: string
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          retailer_id: string
          wine_id: string
          sku?: string | null
          price: number
          quantity?: number
          stock_status?: string
          sync_source?: string
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          retailer_id?: string
          wine_id?: string
          sku?: string | null
          price?: number
          quantity?: number
          stock_status?: string
          sync_source?: string
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_inventory_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_inventory_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_inventory_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_sync_logs: {
        Row: {
          id: string
          org_id: string
          retailer_id: string
          sync_type: string
          sync_source: string
          status: string
          records_processed: number
          records_created: number
          records_updated: number
          records_failed: number
          error_details: Json | null
          started_at: string
          completed_at: string | null
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          retailer_id: string
          sync_type: string
          sync_source: string
          status: string
          records_processed?: number
          records_created?: number
          records_updated?: number
          records_failed?: number
          error_details?: Json | null
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          retailer_id?: string
          sync_type?: string
          sync_source?: string
          status?: string
          records_processed?: number
          records_created?: number
          records_updated?: number
          records_failed?: number
          error_details?: Json | null
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_sync_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_sync_logs_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          id: string
          org_id: string
          name: string
          slug: string
          address: string
          city: string
          state: string
          zip: string
          location: unknown
          phone: string | null
          email: string | null
          website: string | null
          pos_type: string | null
          pos_credentials: Json | null
          fulfillment_capabilities: Json
          delivery_radius_miles: number | null
          commission_rate: number | null
          is_active: boolean
          onboarded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          slug: string
          address: string
          city: string
          state?: string
          zip: string
          location: unknown
          phone?: string | null
          email?: string | null
          website?: string | null
          pos_type?: string | null
          pos_credentials?: Json | null
          fulfillment_capabilities?: Json
          delivery_radius_miles?: number | null
          commission_rate?: number | null
          is_active?: boolean
          onboarded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          slug?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          location?: unknown
          phone?: string | null
          email?: string | null
          website?: string | null
          pos_type?: string | null
          pos_credentials?: Json | null
          fulfillment_capabilities?: Json
          delivery_radius_miles?: number | null
          commission_rate?: number | null
          is_active?: boolean
          onboarded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      taste_profile_wines: {
        Row: {
          id: string
          user_id: string
          wine_id: string
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wine_id: string
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wine_id?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taste_profile_wines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taste_profile_wines_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      taste_profiles: {
        Row: {
          id: string
          user_id: string
          flavor_affinities: Json
          flavor_aversions: Json
          drinking_contexts: Json
          adventurousness_score: number
          profile_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          flavor_affinities?: Json
          flavor_aversions?: Json
          drinking_contexts?: Json
          adventurousness_score?: number
          profile_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          flavor_affinities?: Json
          flavor_aversions?: Json
          drinking_contexts?: Json
          adventurousness_score?: number
          profile_version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taste_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          location_zip: string | null
          location_lat: number | null
          location_lng: number | null
          price_range_min: number | null
          price_range_max: number | null
          occasion_tags: Json | null
          notification_email_frequency: Database["public"]["Enums"]["notification_frequency"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_zip?: string | null
          location_lat?: number | null
          location_lng?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          occasion_tags?: Json | null
          notification_email_frequency?: Database["public"]["Enums"]["notification_frequency"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location_zip?: string | null
          location_lat?: number | null
          location_lng?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          occasion_tags?: Json | null
          notification_email_frequency?: Database["public"]["Enums"]["notification_frequency"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_match_queue: {
        Row: {
          id: string
          org_id: string
          retailer_id: string
          raw_wine_name: string
          raw_producer: string | null
          raw_vintage: string | null
          raw_varietal: string | null
          raw_sku: string | null
          raw_price: number | null
          raw_quantity: number | null
          matched_wine_id: string | null
          match_confidence: number | null
          match_status: string
          reviewed_by: string | null
          reviewed_at: string | null
          sync_log_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          retailer_id: string
          raw_wine_name: string
          raw_producer?: string | null
          raw_vintage?: string | null
          raw_varietal?: string | null
          raw_sku?: string | null
          raw_price?: number | null
          raw_quantity?: number | null
          matched_wine_id?: string | null
          match_confidence?: number | null
          match_status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          sync_log_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          retailer_id?: string
          raw_wine_name?: string
          raw_producer?: string | null
          raw_vintage?: string | null
          raw_varietal?: string | null
          raw_sku?: string | null
          raw_price?: number | null
          raw_quantity?: number | null
          matched_wine_id?: string | null
          match_confidence?: number | null
          match_status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          sync_log_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_match_queue_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_match_queue_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_match_queue_matched_wine_id_fkey"
            columns: ["matched_wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_match_queue_sync_log_id_fkey"
            columns: ["sync_log_id"]
            isOneToOne: false
            referencedRelation: "retailer_sync_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_occasions: {
        Row: {
          id: string
          org_id: string
          wine_id: string
          occasion_name: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          wine_id: string
          occasion_name: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          wine_id?: string
          occasion_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_occasions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_occasions_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      wine_tags: {
        Row: {
          id: string
          org_id: string
          wine_id: string
          tag_name: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          wine_id: string
          tag_name: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          wine_id?: string
          tag_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_tags_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      wines: {
        Row: {
          id: string
          org_id: string
          producer_id: string
          name: string
          slug: string
          varietal: string | null
          region: string | null
          sub_region: string | null
          appellation: string | null
          country: string | null
          vintage: number | null
          description: string | null
          tasting_description: string | null
          food_pairings: Json | null
          flavor_profile: Json | null
          story_hook: string | null
          image_url: string | null
          price_min: number | null
          price_max: number | null
          medusa_product_id: string | null
          is_active: boolean
          search_vector: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          producer_id: string
          name: string
          slug: string
          varietal?: string | null
          region?: string | null
          sub_region?: string | null
          appellation?: string | null
          country?: string | null
          vintage?: number | null
          description?: string | null
          tasting_description?: string | null
          food_pairings?: Json | null
          flavor_profile?: Json | null
          story_hook?: string | null
          image_url?: string | null
          price_min?: number | null
          price_max?: number | null
          medusa_product_id?: string | null
          is_active?: boolean
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          producer_id?: string
          name?: string
          slug?: string
          varietal?: string | null
          region?: string | null
          sub_region?: string | null
          appellation?: string | null
          country?: string | null
          vintage?: number | null
          description?: string | null
          tasting_description?: string | null
          food_pairings?: Json | null
          flavor_profile?: Json | null
          story_hook?: string | null
          image_url?: string | null
          price_min?: number | null
          price_max?: number | null
          medusa_product_id?: string | null
          is_active?: boolean
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wines_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          wishlist_id: string
          wine_id: string
          notes: string | null
          added_at: string
        }
        Insert: {
          id?: string
          wishlist_id: string
          wine_id: string
          notes?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          wishlist_id?: string
          wine_id?: string
          notes?: string | null
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wine_dismissals: {
        Row: {
          id: string
          user_id: string
          wine_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wine_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wine_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wine_dismissals_wine_id_fkey"
            columns: ["wine_id"]
            isOneToOne: false
            referencedRelation: "wines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_stock: {
        Args: {
          p_wine_id: string
          p_retailer_org_id: string
        }
        Returns: number
      }
      match_wine_candidates: {
        Args: {
          p_search_name: string
          p_search_producer?: string
          p_search_vintage?: number
          p_search_varietal?: string
          p_org_id?: string
          p_limit?: number
        }
        Returns: {
          wine_id: string
          wine_name: string
          wine_slug: string
          wine_vintage: number
          wine_varietal: string
          wine_region: string
          wine_country: string
          producer_id: string
          producer_name: string
          producer_slug: string
          name_score: number
          producer_score: number
          vintage_score: number
          varietal_score: number
          composite_score: number
        }[]
      }
    }
    Enums: {
      invite_status: "pending" | "accepted" | "expired" | "revoked"
      member_role: "owner" | "admin" | "member" | "viewer"
      notification_frequency: "daily" | "weekly" | "off"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

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
    Enums: {
      invite_status: ["pending", "accepted", "expired", "revoked"] as const,
      member_role: ["owner", "admin", "member", "viewer"] as const,
      notification_frequency: ["daily", "weekly", "off"] as const,
    },
  },
} as const
