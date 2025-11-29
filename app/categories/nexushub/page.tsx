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
        <div className="min-h-screen flex flex-col bg-bg-dark">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1 container-nexus py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-neon-gold to-neon-cyan rounded-2xl flex items-center justify-center mb-6 shadow-neon-gold">
                        <span className="text-bg-dark font-display font-bold text-5xl">N</span>
                    </div>
                    <h1 className="text-5xl font-display font-bold text-neon-gold mb-4">
                        NexusHub
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Services officiels proposés par l'équipe Nexus226 : formations, création de sites web, consulting, et autres prestations professionnelles.
                    </p>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-neon-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <NexusServiceCard
                                key={service.id}
                                service={service}
                                onContact={setSelectedService}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="neon-glow p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">
                            Aucun service disponible
                        </h2>
                        <p className="text-text-secondary">
                            Les services seront bientôt ajoutés par notre équipe.
                        </p>
                    </div>
                )}
            </main>

            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}

            {selectedService && (
                <ContactModal
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </div>
    );
}
