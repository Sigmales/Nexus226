'use client';

import React, { useState } from 'react';
import TurnstileWidget from '@/components/security/TurnstileWidget';

interface ProposalFormModalProps {
    onClose: () => void;
    categoryId?: string;
}

export default function ProposalFormModal({ onClose, categoryId }: ProposalFormModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        message: '',
    });
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate Captcha
        if (!captchaToken) {
            setError('Veuillez compléter le Captcha');
            return;
        }

        // Validate form
        if (formData.description.length < 50) {
            setError('La description doit contenir au moins 50 caractères');
            return;
        }

        if (formData.url) {
            try {
                new URL(formData.url);
            } catch {
                setError('Format d\'URL invalide');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/proposals/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    category_id: categoryId,
                    captcha_token: captchaToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la soumission');
            }

            alert('✅ Proposition soumise avec succès ! Elle sera examinée par un administrateur.');
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="neon-glow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-neon-gold">
                            Proposer un Service
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-muted hover:text-text-primary transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Titre du Service *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="input-neon w-full"
                                placeholder="Ex: Assistant IA pour la rédaction"
                            />
                        </div>

                        {/* URL */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                URL du Service
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="input-neon w-full"
                                placeholder="https://example.com"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Description * (min. 50 caractères)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={4}
                                className="input-neon w-full resize-none"
                                placeholder="Décrivez votre service en détail..."
                            />
                            <div className="text-xs text-text-muted mt-1">
                                {formData.description.length}/50 caractères minimum
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Message pour l'administrateur *
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                rows={3}
                                className="input-neon w-full resize-none"
                                placeholder="Pourquoi ce service devrait-il être ajouté ?"
                            />
                        </div>

                        {/* Captcha */}
                        <div className="py-4">
                            <TurnstileWidget
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                onVerify={(token) => setCaptchaToken(token)}
                                onExpire={() => setCaptchaToken(null)}
                                onError={() => setError('Erreur Captcha. Veuillez réessayer.')}
                                theme="dark"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="neon-button-secondary flex-1 px-6 py-3"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !captchaToken}
                                className="neon-button flex-1 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Envoi...' : 'Soumettre'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
