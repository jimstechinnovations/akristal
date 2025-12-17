export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin'
export type PropertyType = 'residential' | 'commercial' | 'land' | 'rental'
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending' | 'suspended'
export type ListingStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'bank_transfer' | 'card' | 'mobile_money' | 'other'

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: UserRole
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          license_number: string | null
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          license_number?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          license_number?: string | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          seller_id: string
          agent_id: string | null
          title: string
          description: string | null
          property_type: PropertyType
          category_id: string | null
          status: PropertyStatus
          listing_status: ListingStatus
          address: string
          city: string
          district: string | null
          province: string | null
          country: string
          latitude: number | null
          longitude: number | null
          location_point: unknown | null
          price: number
          currency: string
          size_sqm: number | null
          bedrooms: number | null
          bathrooms: number | null
          parking_spaces: number | null
          year_built: number | null
          amenities: Json
          features: Json
          cover_image_url: string | null
          image_urls: string[]
          video_urls: string[]
          document_urls: string[]
          views_count: number
          favorites_count: number
          created_at: string
          updated_at: string
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          agent_id?: string | null
          title: string
          description?: string | null
          property_type: PropertyType
          category_id?: string | null
          status?: PropertyStatus
          listing_status?: ListingStatus
          address: string
          city: string
          district?: string | null
          province?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          location_point?: unknown | null
          price: number
          currency?: string
          size_sqm?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spaces?: number | null
          year_built?: number | null
          amenities?: Json
          features?: Json
          cover_image_url?: string | null
          image_urls?: string[]
          video_urls?: string[]
          document_urls?: string[]
          views_count?: number
          favorites_count?: number
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          agent_id?: string | null
          title?: string
          description?: string | null
          property_type?: PropertyType
          category_id?: string | null
          status?: PropertyStatus
          listing_status?: ListingStatus
          address?: string
          city?: string
          district?: string | null
          province?: string | null
          country?: string
          latitude?: number | null
          longitude?: number | null
          location_point?: unknown | null
          price?: number
          currency?: string
          size_sqm?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parking_spaces?: number | null
          year_built?: number | null
          amenities?: Json
          features?: Json
          cover_image_url?: string | null
          image_urls?: string[]
          video_urls?: string[]
          document_urls?: string[]
          views_count?: number
          favorites_count?: number
          created_at?: string
          updated_at?: string
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          meta_description: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          meta_description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          meta_description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          property_id: string | null
          buyer_id: string
          seller_id: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          buyer_id: string
          seller_id: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          buyer_id?: string
          seller_id?: string
          last_message_at?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          id: string
          property_id: string
          buyer_id: string
          seller_id: string
          message: string | null
          phone: string | null
          email: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          buyer_id: string
          seller_id: string
          message?: string | null
          phone?: string | null
          email?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          buyer_id?: string
          seller_id?: string
          message?: string | null
          phone?: string | null
          email?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          user_id: string
          property_id: string | null
          amount: number
          currency: string
          payment_method: PaymentMethod
          payment_status: PaymentStatus
          bank_name: string | null
          account_number: string | null
          account_holder_name: string | null
          bank_statement_url: string | null
          provider: string | null
          provider_transaction_id: string | null
          provider_response: Json | null
          description: string | null
          notes: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id?: string | null
          amount: number
          currency?: string
          payment_method: PaymentMethod
          payment_status?: PaymentStatus
          bank_name?: string | null
          account_number?: string | null
          account_holder_name?: string | null
          bank_statement_url?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          provider_response?: Json | null
          description?: string | null
          notes?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string | null
          amount?: number
          currency?: string
          payment_method?: PaymentMethod
          payment_status?: PaymentStatus
          bank_name?: string | null
          account_number?: string | null
          account_holder_name?: string | null
          bank_statement_url?: string | null
          provider?: string | null
          provider_transaction_id?: string | null
          provider_response?: Json | null
          description?: string | null
          notes?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<
      string,
      {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    >
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>
        Returns: unknown
      }
    > & {
      mark_conversation_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      set_user_active: {
        Args: { p_user_id: string; p_is_active: boolean }
        Returns: undefined
      }
    }
    Enums: {
      user_role: UserRole
      property_type: PropertyType
      property_status: PropertyStatus
      listing_status: ListingStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
    }
  }
}



