'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthContextType, UserProfile } from '@/types/database';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, role, created_at, avatar_url')
                .eq('id', userId)
                .single();

            if (error) throw error;

            setUser(data as UserProfile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUserProfile = async () => {
        if (session?.user) {
            await fetchUserProfile(session.user.id);
        }
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signup = async (email: string, password: string, username: string) => {
        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) return { data, error };

        // 2. Create user profile in public.users if user was created
        if (data.user) {
            const { error: profileError } = await (supabase as any)
                .from('users')
                .insert([
                    {
                        id: data.user.id,
                        username,
                        email,
                        role: 'user',
                    },
                ]);

            if (profileError) {
                // If profile creation fails, we might want to clean up the auth user
                // But for now, just return the error
                console.error('Error creating user profile:', profileError);
                return { data, error: profileError };
            }
        }

        return { data, error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, login, signup, logout, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
