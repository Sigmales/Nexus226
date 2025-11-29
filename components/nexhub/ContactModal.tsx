'use client';

import React, { useState } from 'react';

interface NexusService {
    id: string;
    title: string;
    description: string;
}

interface ContactModalProps {
    service: NexusService | null;
    onClose: () => void;
}

export default function ContactModal({ service, onClose }: ContactModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!service) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Simulate API call (replace with actual implementation)
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Contact request:', {
                service_id: service.id,
                service_title: service.title,
                ...formData,
            });

            setSubmitStatus('success');
            setTimeout(() => {
                onClose();
                setFormData({ name: '', email: '', message: '' });
                setSubmitStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="neon-glow max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-neon-gold">
                        Commander : {service.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-neon-gold transition-colors"
                        aria-label="Fermer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-neon w-full"
                            placeholder="Votre nom"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-neon w-full"
                            placeholder="votre@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            required
                            rows={4}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="input-neon w-full resize-none"
                            placeholder="Décrivez votre besoin..."
                        />
                    </div>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                        <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                            ✅ Demande envoyée avec succès !
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                            ❌ Erreur lors de l'envoi. Réessayez.
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="neon-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                    </button>
                </form>
            </div>
        </div>
    );
}
