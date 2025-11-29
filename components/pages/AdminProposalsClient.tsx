'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import ProposalsTable from '@/components/admin/ProposalsTable';
import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';

export default function AdminProposalsClient() {
    const [showLoginModal, setShowLoginModal] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1">
                {/* Admin Header */}
                <section className="relative py-16 px-4 bg-gradient-to-b from-neon-purple/10 to-bg-dark border-b border-neon-purple/30">
                    <div className="container-nexus">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-neon-purple/20 border border-neon-purple flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-neon-purple"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-display font-bold text-neon-purple">
                                    Dashboard Admin
                                </h1>
                                <p className="text-text-secondary">
                                    Gestion des propositions de services
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 px-4">
                    <div className="container-nexus">
                        <div className="neon-glow p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-display font-bold text-text-primary">
                                    Propositions en Attente
                                </h2>
                                <span className="badge badge-admin">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Admin
                                </span>
                            </div>

                            {/* Proposals Table */}
                            <ProposalsTable />
                        </div>
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
