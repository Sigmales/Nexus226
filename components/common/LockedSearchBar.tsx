'use client';

import React, { useState } from 'react';

interface LockedSearchBarProps {
    isAuthenticated: boolean;
    onLoginRequired?: () => void;
    onSearch?: (query: string) => void;
    placeholder?: string;
}

export default function LockedSearchBar({
    isAuthenticated,
    onLoginRequired,
    onSearch,
    placeholder = 'Rechercher des services IA...',
}: LockedSearchBarProps) {
    const [query, setQuery] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = () => {
        if (!isAuthenticated && onLoginRequired) {
            onLoginRequired();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAuthenticated && onSearch && query.trim()) {
            onSearch(query);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            if (onLoginRequired) {
                onLoginRequired();
            }
        }
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        className={`w-5 h-5 ${isAuthenticated ? 'text-neon-gold' : 'text-text-muted'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={handleClick}
                    onMouseEnter={() => !isAuthenticated && setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    placeholder={placeholder}
                    disabled={!isAuthenticated}
                    className={`input-neon pl-12 pr-12 py-4 text-lg ${!isAuthenticated
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-text'
                        }`}
                />

                {/* Lock Icon (when locked) */}
                {!isAuthenticated && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-neon-gold animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                )}

                {/* Search Button (when unlocked) */}
                {isAuthenticated && query.trim() && (
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 neon-button py-2 px-4 text-sm"
                    >
                        Rechercher
                    </button>
                )}
            </form>

            {/* Tooltip */}
            {showTooltip && !isAuthenticated && (
                <div className="tooltip -bottom-12 left-1/2 -translate-x-1/2 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-neon-gold"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        <span className="text-neon-gold font-medium">
                            Connexion requise pour la recherche IA
                        </span>
                    </div>
                </div>
            )}

            {/* Helper Text */}
            {!isAuthenticated && (
                <p className="mt-3 text-center text-sm text-text-muted">
                    Créez un compte gratuit pour accéder à la recherche intelligente
                </p>
            )}
        </div>
    );
}
