// types/database.ts

// En production, ce fichier serait généré par `supabase gen types typescript --project-id...`

import { Database as DB } from './supabase-generated'; // Assuming auto-generated file exists

// Exposer les types de tables simplifiés
export type Category = DB['public']['Tables']['categories']['Row'];
export type Service = DB['public']['Tables']['services']['Row'] & { link?: string | null };
export type ServiceProposal = DB['public']['Tables']['service_proposals']['Row'];
export type ChatMessage = DB['public']['Tables']['chat_messages']['Row'];
export type AdminLog = DB['public']['Tables']['admin_logs']['Row'];
export type Badge = {
    id: string;
    name: string;
    tier: number;
    description: string | null;
    icon: string | null;
    created_at: string;
};
export type UserBadge = {
    id: string;
    user_id: string;
    badge_id: string;
    created_at: string;
    badges?: Badge; // For joined queries
};

// Types pour les jointures
export interface UserProfile {
    id: string; // UUID
    username: string;
    role: 'user' | 'admin' | 'banned';
    created_at: string;
    avatar_url?: string | null;
    bio?: string | null;
    title?: string | null;
    social_links?: {
        twitter?: string;
        github?: string;
        linkedin?: string;
        website?: string;
    } | null;
}

export interface ServiceWithUser extends Service {
    users?: UserProfile | null; // Profile du proposant
    categories?: Category;
}

export interface ChatMessageWithAuthor extends ChatMessage {
    users?: UserProfile;
}

// Types spécifiques pour l'Auth
export interface AuthContextType {
    user: UserProfile | null;
    session: any | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (email: string, password: string, username: string) => Promise<any>;
    logout: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}
