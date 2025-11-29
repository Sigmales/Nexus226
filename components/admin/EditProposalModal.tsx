'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EditProposalModalProps {
    proposal: {
        id: string;
        title: string;
        description?: string;
        link?: string | null;
        proposalType: 'service' | 'category';
        category_id?: string;
        rawData?: any;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditProposalModal({ proposal, onClose, onSuccess }: EditProposalModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: proposal.proposalType === 'category'
            ? (proposal.rawData?.name || proposal.title.replace('[CATÉGORIE] ', ''))
            : proposal.title,
        description: proposal.proposalType === 'category'
            ? (proposal.rawData?.description || '')
            : (proposal.description || ''),
        link: proposal.link || '',
        category_id: proposal.category_id || '',
        justification: proposal.rawData?.justification || '',
        type: proposal.rawData?.type || 'category',
        parent_id: proposal.rawData?.parent_id || '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/proposals/${proposal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalType: proposal.proposalType,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-bg-card border border-neon-gold rounded-lg w-full max-w-3xl p-8 shadow-neon-gold max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-neon-gold mb-2">
                            Éditer la Proposition
                        </h2>
                        <p className="text-text-secondary text-sm">
                            {proposal.proposalType === 'category' ? 'Proposition de Catégorie' : 'Proposition de Service'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-neon-gold transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title/Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            {proposal.proposalType === 'category' ? 'Nom de la Catégorie' : 'Titre'} *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-32 resize-none"
                            placeholder="Description détaillée..."
                        />
                    </div>

                    {/* URL Field */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            URL
                        </label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                            placeholder="https://..."
                        />
                    </div>

                    {/* Service-specific fields */}
                    {proposal.proposalType === 'service' && (
                        <>


                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Catégorie
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories
                                        .filter(cat => !cat.parent_id)
                                        .map((cat) => (
                                            <React.Fragment key={cat.id}>
                                                <option value={cat.id}>{cat.name}</option>
                                                {categories
                                                    .filter(subcat => subcat.parent_id === cat.id)
                                                    .map((subcat) => (
                                                        <option key={subcat.id} value={subcat.id}>
                                                            &nbsp;&nbsp;↳ {subcat.name}
                                                        </option>
                                                    ))}
                                            </React.Fragment>
                                        ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Category-specific fields */}
                    {proposal.proposalType === 'category' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Type
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'category', parent_id: '' })}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'category'
                                            ? 'border-neon-gold bg-neon-gold/10 text-neon-gold'
                                            : 'border-border-subtle text-text-secondary hover:border-neon-gold/50'
                                            }`}
                                    >
                                        <div className="font-semibold">Catégorie Mère</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'subcategory' })}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'subcategory'
                                            ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                                            : 'border-border-subtle text-text-secondary hover:border-neon-cyan/50'
                                            }`}
                                    >
                                        <div className="font-semibold">Sous-Catégorie</div>
                                    </button>
                                </div>
                            </div>

                            {formData.type === 'subcategory' && (
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Catégorie Parente
                                    </label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                        className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                    >
                                        <option value="">Sélectionner une catégorie parente</option>
                                        {categories
                                            .filter(cat => !cat.parent_id)
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Justification *
                                </label>
                                <textarea
                                    value={formData.justification}
                                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-32 resize-none"
                                    placeholder="Justification de la proposition..."
                                    required
                                    minLength={30}
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    {formData.justification.length} / 30 caractères minimum
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-neon-gold transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 neon-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
