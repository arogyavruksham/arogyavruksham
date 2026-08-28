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
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          category: 'Plants' | 'Banarasi' | 'Cotton' | 'Georgette'
          image_url: string | null
          stock_count: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          category: 'Plants' | 'Banarasi' | 'Cotton' | 'Georgette'
          image_url?: string | null
          stock_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          category?: 'Plants' | 'Herbs' | 'Seeds' | 'Pots'
          image_url?: string | null
          stock_count?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: 'pending' | 'paid' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_method?: string | null
          created_at: string
          shipping_address?: Json | null
          admin_viewed?: boolean | null
          tracking_number?: string | null
          shipping_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          expected_delivery_date?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: 'pending' | 'paid' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_method?: string | null
          created_at?: string
          shipping_address?: Json | null
          admin_viewed?: boolean | null
          tracking_number?: string | null
          shipping_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          expected_delivery_date?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: 'pending' | 'paid' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_method?: string | null
          created_at?: string
          shipping_address?: Json | null
          admin_viewed?: boolean | null
          tracking_number?: string | null
          shipping_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          expected_delivery_date?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_time?: number
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
