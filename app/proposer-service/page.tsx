'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import LoginModal from '@/components/auth/LoginModal';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types/database';
import ProposeCategoryModal from '@/components/proposals/ProposeCategoryModal';

export default function ProposerServicePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        category_id: '',
        message: '',
    });

    // Fetch categories
    const fetchCategories = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        if (data) setCategories(data);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            setShowLoginModal(true);
        }
    }, [user, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/proposals/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la soumission');
            }

            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                url: '',
                category_id: '',
                message: '',
            });

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                router.push('/profile');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-dark">
                <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-bg-dark">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1 py-12 px-4">
                <div className="container-nexus max-w-3xl mx-auto">
                    <div className="neon-glow p-8">
                        <h1 className="text-3xl font-display font-bold text-neon-gold mb-2">
                            Proposer un Service IA
                        </h1>
                        <p className="text-text-secondary mb-8">
                            Partagez votre service d'intelligence artificielle avec la communauté Nexus226.
                        </p>

                        {success && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400">
                                ✅ Votre service a été soumis avec succès ! Redirection vers votre profil...
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Titre du Service *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-neon"
                                    placeholder="Ex: Assistant IA pour la rédaction"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-text-primary">
                                        Catégorie
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(true)}
                                        className="text-xs text-neon-cyan hover:text-neon-gold transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Proposer une catégorie
                                    </button>
                                </div>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {/* Root categories */}
                                    {categories
                                        .filter(cat => !cat.parent_id)
                                        .map((cat) => (
                                            <React.Fragment key={cat.id}>
                                                <option value={cat.id}>
                                                    {cat.name}
                                                </option>
                                                {/* Subcategories */}
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
                                <p className="text-xs text-text-muted mt-1">
                                    Si aucune catégorie ne convient, proposez-en une nouvelle ci-dessus
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Description * (min. 50 caractères)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-32 resize-none"
                                    placeholder="Décrivez votre service en détail..."
                                    required
                                    minLength={50}
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    {formData.description.length} / 50 caractères minimum
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    URL du Service
                                </label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="input-neon"
                                    placeholder="https://exemple.com/mon-service"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Message pour l'équipe * (min. 50 caractères)
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-4 py-3 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-32 resize-none"
                                    placeholder="Expliquez pourquoi ce service devrait être ajouté à Nexus226..."
                                    required
                                    minLength={50}
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    {formData.message.length} / 50 caractères minimum
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 px-6 py-3 border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-neon-gold transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 neon-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Envoi en cours...' : 'Soumettre le Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {showLoginModal && (
                <LoginModal onClose={() => {
                    setShowLoginModal(false);
                    router.push('/');
                }} />
            )}

            {showCategoryModal && (
                <ProposeCategoryModal
                    onClose={() => setShowCategoryModal(false)}
                    onSuccess={() => {
                        setShowCategoryModal(false);
                        alert('Votre proposition de catégorie a été soumise avec succès ! Elle sera examinée par notre équipe.');
                    }}
                />
            )}
        </div>
    );
}
