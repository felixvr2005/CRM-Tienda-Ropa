/**
 * Database Types for Supabase
 * Actualizado para complete-schema.sql
 */

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
      admin_users: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          full_name: string | null
          role: 'admin' | 'super_admin' | 'editor'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'super_admin' | 'editor'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'super_admin' | 'editor'
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          birth_date: string | null
          avatar_url: string | null
          addresses: Json
          default_shipping_address: Json | null
          default_billing_address: Json | null
          newsletter_subscribed: boolean
          total_orders: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          addresses?: Json
          default_shipping_address?: Json | null
          default_billing_address?: Json | null
          newsletter_subscribed?: boolean
          total_orders?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          birth_date?: string | null
          avatar_url?: string | null
          addresses?: Json
          default_shipping_address?: Json | null
          default_billing_address?: Json | null
          newsletter_subscribed?: boolean
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          is_active: boolean
          sort_order: number
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          meta_title?: string | null
          meta_description?: string | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sku: string | null
          category_id: string | null
          images: string[]
          price: number
          original_price: number | null
          discount_percentage: number
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          tags: string[]
          materials: string | null
          care_instructions: string | null
          average_rating: number
          review_count: number
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sku?: string | null
          category_id?: string | null
          images?: string[]
          price: number
          original_price?: number | null
          discount_percentage?: number
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          tags?: string[]
          materials?: string | null
          care_instructions?: string | null
          average_rating?: number
          review_count?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sku?: string | null
          category_id?: string | null
          images?: string[]
          price?: number
          original_price?: number | null
          discount_percentage?: number
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          tags?: string[]
          materials?: string | null
          care_instructions?: string | null
          average_rating?: number
          review_count?: number
          meta_title?: string | null
          meta_description?: string | null
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          color: string
          color_hex: string | null
          size: string
          price: number | null
          original_price: number | null
          stock: number
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku?: string | null
          color: string
          color_hex?: string | null
          size: string
          price?: number | null
          original_price?: number | null
          stock?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string | null
          color?: string
          color_hex?: string | null
          size?: string
          price?: number | null
          original_price?: number | null
          stock?: number
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          customer_id: string | null
          session_id: string | null
          variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          session_id?: string | null
          variant_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          session_id?: string | null
          variant_id?: string
          quantity?: number
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          shipping_address: Json
          billing_address: Json | null
          subtotal: number
          shipping_cost: number
          discount: number
          total: number
          coupon_code: string | null
          tracking_number: string | null
          notes: string | null
          stripe_payment_intent: string | null
          stripe_checkout_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          shipping_address: Json
          billing_address?: Json | null
          subtotal: number
          shipping_cost?: number
          discount?: number
          total: number
          coupon_code?: string | null
          tracking_number?: string | null
          notes?: string | null
          stripe_payment_intent?: string | null
          stripe_checkout_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          shipping_address?: Json
          billing_address?: Json | null
          subtotal?: number
          shipping_cost?: number
          discount?: number
          total?: number
          coupon_code?: string | null
          tracking_number?: string | null
          notes?: string | null
          stripe_payment_intent?: string | null
          stripe_checkout_session_id?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string
          quantity: number
          price: number
          original_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          variant_id: string
          quantity: number
          price: number
          original_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string
          quantity?: number
          price?: number
          original_price?: number | null
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          customer_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: string[]
          is_verified_purchase: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variant_id?: string | null
          customer_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: string[]
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          variant_id?: string | null
          customer_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: string[]
          is_verified_purchase?: boolean
          is_approved?: boolean
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed' | 'shipping'
          discount_value: number
          min_purchase: number
          max_uses: number | null
          uses_count: number
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed' | 'shipping'
          discount_value: number
          min_purchase?: number
          max_uses?: number | null
          uses_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed' | 'shipping'
          discount_value?: number
          min_purchase?: number
          max_uses?: number | null
          uses_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      merge_guest_cart: {
        Args: {
          p_session_id: string
          p_customer_id: string
        }
        Returns: void
      }
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

// Tipos exportados para uso en componentes
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Category | null
  variants?: ProductVariant[]
}
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']

// Tipo de dirección
export interface Address {
  id: string
  name: string
  street: string
  street2?: string
  city: string
  province: string
  postal_code: string
  country: string
  phone?: string
  is_default?: boolean
}
