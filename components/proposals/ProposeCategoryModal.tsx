'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types/database';

interface ProposeCategoryModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProposeCategoryModal({ onClose, onSuccess }: ProposeCategoryModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [proposalType, setProposalType] = useState<'category' | 'subcategory'>('category');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_id: '',
        justification: '',
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
            const response = await fetch('/api/proposals/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: proposalType,
                    name: formData.name,
                    description: formData.description,
                    parent_id: proposalType === 'subcategory' ? formData.parent_id : null,
                    justification: formData.justification,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show detailed error if available
                const errorMsg = data.details ? `${data.error}\nDétails: ${data.details}` : data.error;
                throw new Error(errorMsg || 'Erreur lors de la soumission');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Category proposal error:', err);
            setError(err.message || 'Erreur lors de la soumission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-bg-card border border-neon-gold rounded-lg w-full max-w-2xl p-8 shadow-neon-gold max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-neon-gold mb-2">
                            Proposer une Nouvelle Catégorie
                        </h2>
                        <p className="text-text-secondary text-sm">
                            Suggérez une nouvelle catégorie ou sous-catégorie pour enrichir la plateforme
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
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                            Type de Proposition *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setProposalType('category');
                                    setFormData({ ...formData, parent_id: '' });
                                }}
                                className={`p-4 rounded-lg border-2 transition-all ${proposalType === 'category'
                                    ? 'border-neon-gold bg-neon-gold/10 text-neon-gold'
                                    : 'border-border-subtle text-text-secondary hover:border-neon-gold/50'
                                    }`}
                            >
                                <div className="font-semibold mb-1">Catégorie Mère</div>
                                <div className="text-xs">Nouvelle catégorie principale</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setProposalType('subcategory')}
                                className={`p-4 rounded-lg border-2 transition-all ${proposalType === 'subcategory'
                                    ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                                    : 'border-border-subtle text-text-secondary hover:border-neon-cyan/50'
                                    }`}
                            >
                                <div className="font-semibold mb-1">Sous-Catégorie</div>
                                <div className="text-xs">Sous une catégorie existante</div>
                            </button>
                        </div>
                    </div>

                    {proposalType === 'subcategory' && (
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Catégorie Parente *
                            </label>
                            <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                required
                            >
                                <option value="">Sélectionner une catégorie parente</option>
                                {categories
                                    .filter(cat => !cat.parent_id) // Only root categories
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
                            Nom de la {proposalType === 'category' ? 'Catégorie' : 'Sous-Catégorie'} *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                            placeholder="Ex: Intelligence Artificielle Générative"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-24 resize-none"
                            placeholder="Décrivez brièvement cette catégorie..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Justification * (min. 30 caractères)
                        </label>
                        <textarea
                            value={formData.justification}
                            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                            className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-32 resize-none"
                            placeholder="Expliquez pourquoi cette catégorie devrait être ajoutée..."
                            required
                            minLength={30}
                        />
                        <p className="text-xs text-text-muted mt-1">
                            {formData.justification.length} / 30 caractères minimum
                        </p>
                    </div>

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
                            {loading ? 'Envoi en cours...' : 'Soumettre la Proposition'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
