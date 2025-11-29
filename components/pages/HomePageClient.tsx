'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import LockedSearchBar from '@/components/common/LockedSearchBar';
import ServiceCard from '@/components/services/ServiceCard';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import type { ServiceWithUser } from '@/types/database';

interface HomePageClientProps {
    services: ServiceWithUser[];
}

export default function HomePageClient({ services: initialServices }: HomePageClientProps) {
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [services, setServices] = useState<ServiceWithUser[]>(
        initialServices.filter(s => (s as any).is_public !== false)
    );
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLoginRequired = () => {
        setShowLoginModal(true);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        // If query is empty, reset to initial services
        if (!query || query.trim().length === 0) {
            setServices(initialServices);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                setServices((data.services || []).filter((s: any) => s.is_public !== false));
            } else {
                console.error('Search error:', data.error);
                // Keep current services on error
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1">
                {/* Hero Section with Search */}
                <section className={`relative px-4 overflow-hidden transition-all duration-500 ${searchQuery ? 'py-8' : 'py-20'}`}>
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-gold/5 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="container-nexus relative z-10">
                        {/* Title & Description - Hide on search */}
                        <div className={`text-center mb-12 transition-all duration-500 ${searchQuery ? 'hidden opacity-0 h-0 mb-0' : 'opacity-100'}`}>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
                                <span className="text-neon-gold text-glow">Découvrez</span>
                                <br />
                                <span className="text-text-primary">Les Services IA</span>
                                <br />
                                <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                                    Du Futur
                                </span>
                            </h1>
                            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
                                La première plateforme dédiée aux services d'intelligence artificielle.
                                Trouvez, proposez et collaborez.
                            </p>
                        </div>

                        {/* Locked Search Bar */}
                        <LockedSearchBar
                            isAuthenticated={!!user}
                            onLoginRequired={handleLoginRequired}
                            onSearch={handleSearch}
                        />

                        {/* Stats - Hide on search */}
                        <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-500 ${searchQuery ? 'hidden opacity-0 h-0 mt-0' : 'opacity-100'}`}>
                            <div className="text-center">
                                <div className="text-4xl font-display font-bold text-neon-gold mb-2">
                                    500+
                                </div>
                                <div className="text-text-secondary">Services IA</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-display font-bold text-neon-cyan mb-2">
                                    1,200+
                                </div>
                                <div className="text-text-secondary">Utilisateurs Actifs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-display font-bold text-neon-purple mb-2">
                                    98%
                                </div>
                                <div className="text-text-secondary">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Services */}
                <section className="py-16 px-4 bg-bg-darker/50">
                    <div className="container-nexus">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-display font-bold text-text-primary">
                                {searchQuery ? `Résultats pour "${searchQuery}"` : 'Services en Vedette'}
                            </h2>
                            {!searchQuery && (
                                <button className="neon-button-secondary px-4 py-2 text-sm">
                                    Voir Tout
                                </button>
                            )}
                        </div>

                        {searching ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
                                <span className="ml-3 text-text-secondary">Recherche en cours...</span>
                            </div>
                        ) : services.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-text-secondary">
                                    {searchQuery
                                        ? `Aucun service trouvé pour "${searchQuery}"`
                                        : 'Aucun service disponible pour le moment.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4">
                    <div className="container-nexus">
                        <div className="neon-glow p-12 text-center relative overflow-hidden">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/10 via-neon-cyan/10 to-neon-purple/10 pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="text-4xl font-display font-bold text-text-primary mb-4">
                                    Prêt à Proposer Votre Service ?
                                </h2>
                                <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                                    Rejoignez notre communauté de créateurs et partagez vos innovations IA avec le monde.
                                </p>
                                <button
                                    onClick={() => {
                                        if (user) {
                                            window.location.href = '/proposer-service';
                                        } else {
                                            setShowLoginModal(true);
                                        }
                                    }}
                                    className="neon-button text-lg px-8 py-4"
                                >
                                    {user ? 'Créer un Service' : 'Commencer Gratuitement'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-bg-darker border-t border-border-subtle py-8 px-4">
                <div className="container-nexus">
                    <div className="text-center text-text-muted text-sm">
                        <p>&copy; 2025 Nexus226. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}
        </div>
    );
}
