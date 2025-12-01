'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import LoginModal from '@/components/auth/LoginModal';
import NexusServiceCard from '@/components/nexhub/NexusServiceCard';
import ContactModal from '@/components/nexhub/ContactModal';

interface NexusService {
    id: string;
    title: string;
    description: string;
    icon_url: string | null;
    price: number | null;
    status: 'active' | 'inactive';
    display_order: number;
}

export default function NexusHubPage() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [services, setServices] = useState<NexusService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<NexusService | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/nexhub/services');
            const data = await response.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark flex flex-col">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-grow container-responsive py-8 md:py-12">
                {/* Hero Section */}
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-block mb-4 p-3 rounded-2xl bg-gradient-to-br from-neon-gold/20 to-neon-cyan/20 border border-neon-gold/30">
                        <span className="text-4xl md:text-5xl">🚀</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-gold via-white to-neon-cyan mb-4 md:mb-6 drop-shadow-neon">
                        NexusHub
                    </h1>
                    <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto px-4">
                        Découvrez nos services exclusifs propulsés par l'IA et accélérez votre transformation numérique.
                    </p>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-96 bg-bg-card animate-pulse rounded-xl border border-border-subtle" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8" data-testid="nexushub-grid">
                        {services.map((service) => (
                            <NexusServiceCard
                                key={service.id}
                                service={service}
                                onContact={setSelectedService}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                />
            )}

            <ContactModal
                service={selectedService}
                onClose={() => setSelectedService(null)}
            />
        </div>
    );
}

