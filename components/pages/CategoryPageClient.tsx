'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import ServiceCard from '@/components/services/ServiceCard';
import RealtimeChatBox from '@/components/chat/RealtimeChatBox';
import LoginModal from '@/components/auth/LoginModal';
import type { Category, ServiceWithUser } from '@/types/database';

interface CategoryPageClientProps {
    category: Category;
    services: ServiceWithUser[];
}

type TabType = 'services' | 'forum' | 'chat';

export default function CategoryPageClient({ category, services }: CategoryPageClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('services');
    const [showLoginModal, setShowLoginModal] = useState(false);

    const tabs = [
        { id: 'services' as TabType, label: 'Services', count: services.length },
        { id: 'forum' as TabType, label: 'Forum', count: 0 },
        { id: 'chat' as TabType, label: 'Chat', count: 0 },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1">
                {/* Category Header */}
                <section
                    className="relative py-16 px-4 bg-gradient-to-b from-bg-darker to-bg-dark overflow-hidden"
                    style={category.background_image_url ? {
                        backgroundImage: `url(${category.background_image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : undefined}
                >
                    {/* Gradient overlay for text readability */}
                    {category.background_image_url && (
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-bg-dark" />
                    )}

                    <div className="container-nexus relative z-10">
                        <div className="text-center">
                            <h1 className="text-5xl font-display font-bold text-neon-gold mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                                {category.name}
                            </h1>
                            {category.description && (
                                <p className="text-xl text-text-secondary max-w-2xl mx-auto drop-shadow-lg">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Tabs Navigation */}
                <section className="sticky top-16 z-40 bg-bg-darker/95 backdrop-blur-sm border-b border-border-subtle">
                    <div className="container-nexus">
                        <div className="flex items-center space-x-1 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 font-semibold transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-neon-gold border-neon-gold'
                                        : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-subtle'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neon-gold/20 text-neon-gold">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tab Content */}
                <section className="py-12 px-4">
                    <div className="container-nexus">
                        {/* Services Tab */}
                        {activeTab === 'services' && (
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-display font-bold text-text-primary">
                                        Tous les Services
                                    </h2>
                                    <div className="text-sm text-text-secondary">
                                        {services.length} service{services.length !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {services.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {services.map((service) => (
                                            <ServiceCard key={service.id} service={service} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                                            Aucun service disponible
                                        </h3>
                                        <p className="text-text-secondary">
                                            Soyez le premier à proposer un service dans cette catégorie !
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Forum Tab - Placeholder */}
                        {activeTab === 'forum' && (
                            <div className="text-center py-16">
                                <div className="neon-glow p-12 max-w-2xl mx-auto">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h3 className="text-2xl font-display font-bold text-text-primary mb-4">
                                        Forum - Bientôt Disponible
                                    </h3>
                                    <p className="text-text-secondary mb-6">
                                        Le forum de discussion pour cette catégorie sera bientôt disponible.
                                        Vous pourrez échanger avec la communauté et poser vos questions.
                                    </p>
                                    <div className="inline-block px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg text-sm font-semibold">
                                        Phase 5 - En Développement
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chat Tab - Realtime Chat */}
                        {activeTab === 'chat' && (
                            <div>
                                <RealtimeChatBox
                                    categoryId={category.id}
                                    categoryName={category.name}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}
        </div>
    );
}
