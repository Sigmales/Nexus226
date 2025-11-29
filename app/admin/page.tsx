'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import AdminTabs from '@/components/admin/AdminTabs';
import ProposalsTable from '@/components/admin/ProposalsTable';
import ActiveServicesTable from '@/components/admin/ActiveServicesTable';
import CategoriesManager from '@/components/admin/CategoriesManager';
import AdminBadgesManager from './badges/page';
import NexusHubManager from '@/components/admin/NexusHubManager';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('proposals');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-dark">
                <div className="w-12 h-12 border-4 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'proposals', label: 'Propositions' },
        { id: 'active-services', label: 'Services Actifs' },
        { id: 'categories', label: 'Catégories' },
        { id: 'badges', label: 'Gestion des Badges' },
        { id: 'nexushub', label: 'NexusHub' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-bg-dark">
            <Header />

            <main className="flex-1 py-8 px-4">
                <div className="container-nexus">
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                            Dashboard Administrateur
                        </h1>
                        <p className="text-text-secondary">
                            Gérez les services, les propositions et les catégories de la plateforme.
                        </p>
                    </div>

                    <div className="bg-bg-darker rounded-lg border border-border-subtle overflow-hidden">
                        <AdminTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        <div className="p-6">
                            {activeTab === 'proposals' && <ProposalsTable />}
                            {activeTab === 'active-services' && <ActiveServicesTable />}
                            {activeTab === 'categories' && <CategoriesManager />}
                            {activeTab === 'badges' && <AdminBadgesManager />}
                            {activeTab === 'nexushub' && <NexusHubManager />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
