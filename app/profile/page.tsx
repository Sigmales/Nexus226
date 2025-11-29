'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ServiceCard from '@/components/services/ServiceCard';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { ServiceWithUser, UserBadge } from '@/types/database';
import BadgeList from '@/components/profile/BadgeList';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [userServices, setUserServices] = useState<ServiceWithUser[]>([]);
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!loading && !user) {
            setShowLoginModal(true);
        }
    }, [user, loading]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    useEffect(() => {
        const fetchUserServices = async () => {
            if (!user) return;

            try {
                // Fetch services where user is either the proposer OR the owner
                // This handles both pending services (proposer_id) and active services (user_id)
                const { data, error } = await supabase
                    .from('services')
                    .select('*, categories(*)')
                    .or(`proposer_id.eq.${user.id},user_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    // Transform data to match ServiceWithUser type
                    const servicesWithUser = data.map(service => ({
                        ...(service as any),
                        users: user // Attach current user profile
                    })) as ServiceWithUser[];

                    setUserServices(servicesWithUser);
                }
            } catch (error) {
                console.error('Error fetching user services:', error);
            } finally {
                setLoadingServices(false);
            }
        };

        const fetchUserBadges = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('user_badges')
                    .select('*, badges(*)')
                    .eq('user_id', user.id);

                if (error) throw error;
                if (data) setUserBadges(data as UserBadge[]);
            } catch (error) {
                console.error('Error fetching badges:', error);
            }
        };

        fetchUserServices();
        fetchUserBadges();
    }, [user, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-dark">
                <div className="w-12 h-12 border-4 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header
                    onLoginClick={() => setShowLoginModal(true)}
                    onSignupClick={() => setShowLoginModal(true)}
                />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-display font-bold text-text-primary mb-4">
                            Connexion Requise
                        </h1>
                        <p className="text-text-secondary mb-8">
                            Veuillez vous connecter pour accéder à votre profil.
                        </p>
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="neon-button"
                        >
                            Se Connecter
                        </button>
                    </div>
                </main>
                {showLoginModal && (
                    <LoginModal onClose={() => {
                        setShowLoginModal(false);
                        if (!user) router.push('/');
                    }} />
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1 py-12 px-4">
                <div className="container-nexus">
                    {/* Profile Header */}
                    <div className="neon-glow p-8 mb-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan overflow-hidden">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-display font-bold text-bg-dark">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
                                    {user.username}
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                    </span>
                                    <span className="text-text-muted text-sm">
                                        Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <BadgeList badges={userBadges} className="justify-center md:justify-start" />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/profile/settings')}
                                    className="neon-button-secondary flex items-center gap-2"
                                    title="Paramètres du profil"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Paramètres
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="neon-button-secondary border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-red-500"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* User Services */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-display font-bold text-text-primary">
                                Mes Services ({userServices.length})
                            </h2>
                        </div>

                        {loadingServices ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : userServices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userServices.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-bg-card/50 rounded-lg border border-border-subtle border-dashed">
                                <p className="text-text-secondary mb-4">
                                    Vous n'avez pas encore proposé de services.
                                </p>
                                <button
                                    onClick={() => router.push('/proposer-service')}
                                    className="neon-button text-sm"
                                >
                                    Créer mon premier service
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}
        </div>
    );
}
