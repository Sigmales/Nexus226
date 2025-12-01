'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
    onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await login(email, password);
                if (error) throw error;
                onClose();
            } else {
                const { error } = await signup(email, password, username);
                if (error) throw error;
                // If signup is successful, we can close the modal
                // Or show a message if email confirmation is required
                // For now, assuming auto-login or immediate success
                onClose();
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message === 'Failed to fetch') {
                setError('Problème de connexion au serveur. Vérifiez votre connexion internet ou si le service est accessible.');
            } else {
                setError(err.message || 'Une erreur est survenue');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-text-secondary hover:text-neon-gold transition-colors"
                    aria-label="Fermer"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal Content */}
                <div className="neon-glow p-8 relative overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-gold/5 via-transparent to-neon-cyan/5 pointer-events-none" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-display font-bold text-neon-gold mb-2">
                                {isLogin ? 'Connexion' : 'Inscription'}
                            </h2>
                            <p className="text-text-secondary">
                                {isLogin
                                    ? 'Accédez à votre compte Nexus226'
                                    : 'Créez votre compte gratuitement'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input-neon"
                                        placeholder="@votrenom"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-neon"
                                    placeholder="vous@exemple.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-neon"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full neon-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Chargement...
                                    </span>
                                ) : (
                                    <span>{isLogin ? 'Se Connecter' : 'S\'inscrire'}</span>
                                )}
                            </button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-sm text-text-secondary hover:text-neon-cyan transition-colors"
                            >
                                {isLogin ? (
                                    <>
                                        Pas encore de compte ?{' '}
                                        <span className="text-neon-cyan font-semibold">S'inscrire</span>
                                    </>
                                ) : (
                                    <>
                                        Déjà un compte ?{' '}
                                        <span className="text-neon-cyan font-semibold">Se connecter</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
