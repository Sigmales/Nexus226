'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import EditProposalModal from './EditProposalModal';

interface Proposal {
    id: string;
    title: string;
    description?: string;
    link?: string | null;
    users?: { username: string } | null;
    created_at: string;
    proposalType: 'service' | 'category';
    category_id?: string;
    rawData?: any;
}

export default function ProposalsTable() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const supabase = createClient();

    const fetchProposals = async () => {
        setLoading(true);
        const allProposals: Proposal[] = [];

        // Fetch service proposals
        const { data: servicesData } = await supabase
            .from('services')
            .select('*, users:user_id(username)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (servicesData) {
            allProposals.push(...servicesData.map((s: any) => ({
                id: s.id,
                title: s.title || 'Sans titre',
                description: s.description,
                link: s.link,
                users: s.users,
                created_at: s.created_at,
                proposalType: 'service' as const,
                category_id: s.category_id,
            })));
        }

        // Fetch category proposals
        const { data: categoryData } = await supabase
            .from('service_proposals')
            .select('*, users:user_id(username)')
            .eq('status', 'pending')
            .like('message', '[CATEGORY_PROPOSAL]%')
            .order('created_at', { ascending: false });

        if (categoryData) {
            categoryData.forEach((cp: any) => {
                try {
                    const messageData = JSON.parse(cp.message.replace('[CATEGORY_PROPOSAL] ', ''));
                    allProposals.push({
                        id: cp.id,
                        title: `[CATÉGORIE] ${messageData.name}`,
                        description: `Type: ${messageData.type === 'category' ? 'Catégorie Mère' : 'Sous-Catégorie'}\nJustification: ${messageData.justification}`,
                        link: cp.link || messageData.link || 'https://nexus-category.com/preview',
                        users: cp.users,
                        created_at: cp.created_at,
                        proposalType: 'category',
                        rawData: messageData,
                    });
                } catch (e) {
                    console.error('Error parsing category proposal:', e);
                }
            });
        }

        allProposals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setProposals(allProposals);
        setLoading(false);
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    const handleValidate = async (proposalId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir valider cette proposition ?')) return;
        setProcessingId(proposalId);
        try {
            const proposal = proposals.find(p => p.id === proposalId);
            if (!proposal) return;

            let url = `/api/admin/services/${proposalId}`;
            let method = 'PUT';
            let body = { status: 'active' };

            if (proposal.proposalType === 'category') {
                url = `/api/admin/proposals/${proposalId}/validate`;
                method = 'POST';
                // No body needed for category validation as it uses existing data
                body = {} as any;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                alert('Proposition validée avec succès !');
                setProposals(prev => prev.filter(p => p.id !== proposalId));
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la validation');
            }
        } catch (error) {
            console.error('Error validating proposal:', error);
            alert('❌ Erreur lors de la validation');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (proposalId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir rejeter cette proposition ?')) return;
        setProcessingId(proposalId);
        try {
            const proposal = proposals.find(p => p.id === proposalId);
            if (!proposal) return;

            let url = `/api/admin/services/${proposalId}`;

            // Category proposals are stored in service_proposals table
            if (proposal.proposalType === 'category') {
                url = `/api/admin/proposals/${proposalId}`;
            }

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Proposition rejetée avec succès !');
                setProposals(prev => prev.filter(p => p.id !== proposalId));
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors du rejet');
            }
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            alert('❌ Erreur lors du rejet');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Always show URL column as requested
    const showUrlColumn = true;

    // Define grid columns based on content
    const gridColsClass = 'grid-cols-[2fr_1.5fr_1fr_1fr_1fr]';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (proposals.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Aucune proposition en attente
                </h3>
                <p className="text-text-secondary">
                    Toutes les propositions ont été traitées !
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className={`grid ${gridColsClass} divide-x divide-border-subtle border-b border-border-subtle py-4 px-4 bg-bg-dark/50 font-semibold text-sm text-text-primary`}>
                <div className="px-4">Titre</div>
                {showUrlColumn && <div className="px-4">URL</div>}
                <div className="px-4">Proposé par</div>
                <div className="px-4">Date</div>
                <div className="text-right px-4">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border-subtle">
                {proposals.map((proposal) => (
                    <div key={proposal.id} className={`grid ${gridColsClass} divide-x divide-border-subtle border-b border-border-subtle py-4 px-4 hover:bg-bg-darker/50 transition-colors items-center`}>
                        {/* Title Column */}
                        <div className="min-w-0 px-4">
                            <div className="font-medium text-text-primary truncate" title={proposal.title}>{proposal.title}</div>
                            {proposal.description && (
                                <div className="text-sm text-text-secondary mt-1 whitespace-pre-line line-clamp-2">
                                    {proposal.description}
                                </div>
                            )}
                        </div>

                        {/* URL Column (Conditional) */}
                        {showUrlColumn && (
                            <div className="min-w-0 overflow-hidden px-4">
                                {proposal.link ? (
                                    <a href={proposal.link} target="_blank" rel="noopener noreferrer"
                                        className="text-neon-cyan hover:text-neon-cyan/80 text-sm flex items-center gap-1 truncate">
                                        <span className="truncate">{proposal.link}</span>
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ) : (
                                    <span className="text-text-muted text-sm">-</span>
                                )}
                            </div>
                        )}

                        {/* User Column */}
                        <div className="truncate px-4">
                            <span className="badge badge-user text-xs">
                                @{proposal.users?.username || 'Inconnu'}
                            </span>
                        </div>

                        {/* Date Column */}
                        <div className="text-sm text-text-secondary truncate px-4">
                            {formatDate(proposal.created_at)}
                        </div>

                        {/* Actions Column */}
                        <div className="flex items-center justify-end gap-2 px-4">
                            <button
                                onClick={() => setEditingProposal(proposal)}
                                disabled={processingId === proposal.id}
                                className="p-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
                                title="Éditer"
                            >
                                ✏️
                            </button>
                            <button onClick={() => handleValidate(proposal.id)}
                                disabled={processingId === proposal.id}
                                className="p-2 bg-green-500/20 text-green-400 border border-green-500 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                title="Valider"
                            >
                                ✓
                            </button>
                            <button onClick={() => handleReject(proposal.id)}
                                disabled={processingId === proposal.id}
                                className="p-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                title="Rejeter"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingProposal && (
                <EditProposalModal
                    proposal={editingProposal}
                    onClose={() => setEditingProposal(null)}
                    onSuccess={() => {
                        setEditingProposal(null);
                        fetchProposals();
                        alert('✅ Proposition mise à jour avec succès !');
                    }}
                />
            )}
        </div>
    );
}
