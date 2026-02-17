/**
 * Database Types for Supabase
 * Generado para coincidir con el schema real de producción
 * Última actualización: 2026-02-17
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
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          popup_title: string | null
          popup_message: string | null
          popup_image_url: string | null
          discount_code: string | null
          discount_percentage: number | null
          discount_amount: number | null
          active: boolean
          start_date: string
          end_date: string | null
          target_audience: 'new_customers' | 'all_users' | 'returning_customers' | 'newsletter_subscribers' | null
          show_popup: boolean
          popup_delay_ms: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          popup_title?: string | null
          popup_message?: string | null
          popup_image_url?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          discount_amount?: number | null
          active?: boolean
          start_date?: string
          end_date?: string | null
          target_audience?: 'new_customers' | 'all_users' | 'returning_customers' | 'newsletter_subscribers' | null
          show_popup?: boolean
          popup_delay_ms?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          popup_title?: string | null
          popup_message?: string | null
          popup_image_url?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          discount_amount?: number | null
          active?: boolean
          start_date?: string
          end_date?: string | null
          target_audience?: 'new_customers' | 'all_users' | 'returning_customers' | 'newsletter_subscribers' | null
          show_popup?: boolean
          popup_delay_ms?: number
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          customer_id: string | null
          session_id: string | null
          product_id: string
          variant_id: string
          quantity: number
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          session_id?: string | null
          product_id: string
          variant_id: string
          quantity?: number
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          session_id?: string | null
          product_id?: string
          variant_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
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
          display_order: number
          icon: string | null
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
          display_order?: number
          icon?: string | null
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
          display_order?: number
          icon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      configuracion: {
        Row: {
          id: string
          clave: string
          valor: string | null
          tipo: 'string' | 'number' | 'boolean' | 'json' | 'integer'
          descripcion: string | null
          categoria: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clave: string
          valor?: string | null
          tipo?: 'string' | 'number' | 'boolean' | 'json' | 'integer'
          descripcion?: string | null
          categoria?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clave?: string
          valor?: string | null
          tipo?: 'string' | 'number' | 'boolean' | 'json' | 'integer'
          descripcion?: string | null
          categoria?: string | null
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          id: string
          coupon_id: string
          customer_id: string
          order_id: string | null
          discount_applied: number
          used_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          customer_id: string
          order_id?: string | null
          discount_applied: number
          used_at?: string
        }
        Update: {
          id?: string
          coupon_id?: string
          customer_id?: string
          order_id?: string | null
          discount_applied?: number
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase: number
          max_discount: number | null
          max_uses: number | null
          max_uses_per_customer: number
          used_count: number
          applicable_categories: string[] | null
          applicable_products: string[] | null
          starts_at: string
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          customer_id: string | null
          scope: 'global' | 'user_specific' | 'single_use'
          stripe_promotion_code_id: string | null
          stripe_coupon_id: string | null
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase?: number
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number
          used_count?: number
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          starts_at?: string
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          customer_id?: string | null
          scope?: 'global' | 'user_specific' | 'single_use'
          stripe_promotion_code_id?: string | null
          stripe_coupon_id?: string | null
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_purchase?: number
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number
          used_count?: number
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          starts_at?: string
          expires_at?: string | null
          is_active?: boolean
          updated_at?: string
          customer_id?: string | null
          scope?: 'global' | 'user_specific' | 'single_use'
          stripe_promotion_code_id?: string | null
          stripe_coupon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      credit_notes: {
        Row: {
          id: string
          return_request_id: string
          original_order_id: string
          refund_amount: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          return_request_id: string
          original_order_id: string
          refund_amount: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          return_request_id?: string
          original_order_id?: string
          refund_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_original_order_id_fkey"
            columns: ["original_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
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
          is_active: boolean
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
          is_active?: boolean
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
          is_active?: boolean
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          discount_code: string | null
          subscribed_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          discount_code?: string | null
          subscribed_at?: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          discount_code?: string | null
          subscribed_at?: string
          used?: boolean
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          product_slug: string | null
          product_image: string | null
          product_sku: string | null
          size: string | null
          color: string | null
          quantity: number
          unit_price: number
          discount_percentage: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          product_slug?: string | null
          product_image?: string | null
          product_sku?: string | null
          size?: string | null
          color?: string | null
          quantity: number
          unit_price: number
          discount_percentage?: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          product_slug?: string | null
          product_image?: string | null
          product_sku?: string | null
          size?: string | null
          color?: string | null
          quantity?: number
          unit_price?: number
          discount_percentage?: number
          line_total?: number
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          shipping_address: Json
          billing_address: Json | null
          same_billing_address: boolean
          subtotal: number
          shipping_cost: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          coupon_id: string | null
          coupon_code: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
          payment_method: string | null
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          shipping_method: string | null
          tracking_number: string | null
          tracking_url: string | null
          estimated_delivery: string | null
          shipped_at: string | null
          delivered_at: string | null
          customer_notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          refunded_at: string | null
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          shipping_address: Json
          billing_address?: Json | null
          same_billing_address?: boolean
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          coupon_id?: string | null
          coupon_code?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          estimated_delivery?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          refunded_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          shipping_address?: Json
          billing_address?: Json | null
          same_billing_address?: boolean
          subtotal?: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          coupon_id?: string | null
          coupon_code?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          estimated_delivery?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          updated_at?: string
          cancelled_at?: string | null
          refunded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_methods: {
        Row: {
          id: string
          customer_id: string
          type: string
          brand: string | null
          last_four: string
          expiry_date: string | null
          holder_name: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          type: string
          brand?: string | null
          last_four: string
          expiry_date?: string | null
          holder_name?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          type?: string
          brand?: string | null
          last_four?: string
          expiry_date?: string | null
          holder_name?: string | null
          is_default?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      product_types: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          size_type: string
          available_sizes: string[]
          icon_name: string | null
          color_applicable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          size_type?: string
          available_sizes?: string[]
          icon_name?: string | null
          color_applicable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          size_type?: string
          available_sizes?: string[]
          icon_name?: string | null
          color_applicable?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          color_hex: string | null
          color_image: string | null
          stock: number
          reserved_stock: number
          sku: string | null
          barcode: string | null
          weight: number | null
          price_modifier: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color: string
          color_hex?: string | null
          color_image?: string | null
          stock?: number
          reserved_stock?: number
          sku?: string | null
          barcode?: string | null
          weight?: number | null
          price_modifier?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color?: string
          color_hex?: string | null
          color_image?: string | null
          stock?: number
          reserved_stock?: number
          sku?: string | null
          barcode?: string | null
          weight?: number | null
          price_modifier?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sku: string | null
          price: number
          compare_at_price: number | null
          discount_percentage: number
          cost_price: number | null
          image_url: string | null
          images: string[]
          category_id: string | null
          brand: string | null
          material: string | null
          care_instructions: string | null
          is_active: boolean
          is_featured: boolean
          is_new: boolean
          is_flash_offer: boolean
          flash_offer_ends: string | null
          meta_title: string | null
          meta_description: string | null
          tags: string[]
          views: number
          sales_count: number
          avg_rating: number
          review_count: number
          created_at: string
          updated_at: string
          stripe_product_id: string | null
          stripe_price_id: string | null
          product_type_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sku?: string | null
          price: number
          compare_at_price?: number | null
          discount_percentage?: number
          cost_price?: number | null
          image_url?: string | null
          images?: string[]
          category_id?: string | null
          brand?: string | null
          material?: string | null
          care_instructions?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_flash_offer?: boolean
          flash_offer_ends?: string | null
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[]
          views?: number
          sales_count?: number
          avg_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          product_type_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          discount_percentage?: number
          cost_price?: number | null
          image_url?: string | null
          images?: string[]
          category_id?: string | null
          brand?: string | null
          material?: string | null
          care_instructions?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_flash_offer?: boolean
          flash_offer_ends?: string | null
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[]
          views?: number
          sales_count?: number
          avg_rating?: number
          review_count?: number
          updated_at?: string
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          product_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          }
        ]
      }
      return_request_items: {
        Row: {
          id: string
          return_request_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
          reason: string | null
          condition: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          return_request_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          unit_price: number
          reason?: string | null
          condition?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          return_request_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
          reason?: string | null
          condition?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_request_items_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      return_requests: {
        Row: {
          id: string
          order_id: string
          customer_id: string
          status: 'pending' | 'label_sent' | 'in_return' | 'received' | 'refunded' | 'rejected'
          reason: string | null
          return_label_url: string | null
          return_tracking_number: string | null
          received_at: string | null
          refunded_at: string | null
          refund_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_id: string
          status?: 'pending' | 'label_sent' | 'in_return' | 'received' | 'refunded' | 'rejected'
          reason?: string | null
          return_label_url?: string | null
          return_tracking_number?: string | null
          received_at?: string | null
          refunded_at?: string | null
          refund_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          customer_id?: string
          status?: 'pending' | 'label_sent' | 'in_return' | 'received' | 'refunded' | 'rejected'
          reason?: string | null
          return_label_url?: string | null
          return_tracking_number?: string | null
          received_at?: string | null
          refunded_at?: string | null
          refund_amount?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          visitor_id: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          visitor_id: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string | null
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id?: string | null
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string | null
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      static_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          meta_title: string | null
          meta_description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      stock_change_log: {
        Row: {
          id: string
          product_id: string
          previous_stock: number
          new_stock: number
          reason: string | null
          changed_by: string | null
          changed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          previous_stock?: number
          new_stock: number
          reason?: string | null
          changed_by?: string | null
          changed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          previous_stock?: number
          new_stock?: number
          reason?: string | null
          changed_by?: string | null
          changed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_change_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      support_tickets: {
        Row: {
          id: string
          email: string
          subject: string
          message: string
          status: 'open' | 'in_progress' | 'closed'
          created_at: string
          updated_at: string
          responded_at: string | null
          admin_response: string | null
        }
        Insert: {
          id?: string
          email: string
          subject: string
          message: string
          status?: 'open' | 'in_progress' | 'closed'
          created_at?: string
          updated_at?: string
          responded_at?: string | null
          admin_response?: string | null
        }
        Update: {
          id?: string
          email?: string
          subject?: string
          message?: string
          status?: 'open' | 'in_progress' | 'closed'
          updated_at?: string
          responded_at?: string | null
          admin_response?: string | null
        }
        Relationships: []
      }
      variant_images: {
        Row: {
          id: string
          variant_id: string
          image_url: string
          alt_text: string | null
          is_primary: boolean
          sort_order: number
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          image_url: string
          alt_text?: string | null
          is_primary?: boolean
          sort_order?: number
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          variant_id?: string
          image_url?: string
          alt_text?: string | null
          is_primary?: boolean
          sort_order?: number
          uploaded_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      decrease_stock: {
        Args: {
          p_variant_id: string
          p_quantity: number
        }
        Returns: void
      }
      increase_stock: {
        Args: {
          p_variant_id: string
          p_quantity: number
        }
        Returns: void
      }
      increment_stock: {
        Args: {
          p_variant_id: string
          p_quantity: number
        }
        Returns: void
      }
      set_primary_variant_image: {
        Args: {
          p_variant_id: string
          p_image_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// Tipos exportados para uso en componentes
// ============================================================================

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CartItemDB = Database['public']['Tables']['cart_items']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Configuracion = Database['public']['Tables']['configuracion']['Row']
export type CouponUsage = Database['public']['Tables']['coupon_usages']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type CreditNote = Database['public']['Tables']['credit_notes']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type ProductType = Database['public']['Tables']['product_types']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Category | null
  variants?: ProductVariant[]
}
export type ReturnRequestItem = Database['public']['Tables']['return_request_items']['Row']
export type ReturnRequest = Database['public']['Tables']['return_requests']['Row']
export type ReviewVote = Database['public']['Tables']['review_votes']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type StaticPage = Database['public']['Tables']['static_pages']['Row']
export type StockChangeLog = Database['public']['Tables']['stock_change_log']['Row']
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row']
export type VariantImage = Database['public']['Tables']['variant_images']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']

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
