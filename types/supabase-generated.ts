/**
 * Auto-generated Supabase types
 * This file would normally be generated using: supabase gen types typescript --project-id <project-id>
 * 
 * For development purposes, this file contains the schema types based on the Nexus226 database structure
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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          is_public: boolean
          display_order: number
          background_image_url: string | null
          show_in_nav: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          is_public?: boolean
          display_order?: number
          background_image_url?: string | null
          show_in_nav?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          is_public?: boolean
          display_order?: number
          background_image_url?: string | null
          show_in_nav?: boolean
          created_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string
          price: number | null
          image_url: string | null
          link: string | null
          status: 'active' | 'inactive' | 'pending'
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description: string
          price?: number | null
          image_url?: string | null
          link?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          description?: string
          price?: number | null
          image_url?: string | null
          link?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      nexhub_services: {
        Row: {
          id: string
          title: string
          description: string
          icon_url: string | null
          price: number | null
          status: 'active' | 'inactive'
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon_url?: string | null
          price?: number | null
          status?: 'active' | 'inactive'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon_url?: string | null
          price?: number | null
          status?: 'active' | 'inactive'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            referencedRelation: "badges"
            referencedColumns: ["id"]
          }
        ]
      }
      service_proposals: {
        Row: {
          id: string
          service_id: string
          user_id: string
          message: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          user_id: string
          message: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          user_id?: string
          message?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_proposals_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_proposals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          proposal_id: string
          sender_id: string
          message: string
          created_at: string
          image_url: string | null
          edited_at: string | null
        }
        Insert: {
          id?: string
          proposal_id: string
          sender_id: string
          message: string
          created_at?: string
          image_url?: string | null
          edited_at?: string | null
        }
        Update: {
          id?: string
          proposal_id?: string
          sender_id?: string
          message?: string
          created_at?: string
          image_url?: string | null
          edited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_proposal_id_fkey"
            columns: ["proposal_id"]
            referencedRelation: "service_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_user_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_user_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_user_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: 'user' | 'admin' | 'banned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          role?: 'user' | 'admin' | 'banned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'user' | 'admin' | 'banned'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin' | 'banned'
      service_status: 'active' | 'inactive' | 'pending'
      proposal_status: 'pending' | 'accepted' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
