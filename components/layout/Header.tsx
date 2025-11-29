'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types/database';

interface HeaderProps {
    onLoginClick?: () => void;
    onSignupClick?: () => void;
}

export default function Header({ onLoginClick, onSignupClick }: HeaderProps) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const supabase = createClient();

    // Fetch categories from database
    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .is('parent_id', null) // Only root categories for nav
            .order('display_order', { ascending: true }) // Manual ordering
            .order('name'); // Secondary sort by name

        if (!error && data) {
            setCategories(data);
        }
        setLoadingCategories(false);
    };

    useEffect(() => {
        fetchCategories();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('categories-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'categories'
            }, () => {
                // Refetch categories when any change occurs
                fetchCategories();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-bg-darker/95 backdrop-blur-sm border-b border-border-subtle">
            <div className="container-nexus">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-neon-gold to-neon-cyan rounded-lg flex items-center justify-center group-hover:shadow-neon-gold transition-all duration-300">
                            <span className="text-bg-dark font-display font-bold text-xl">N</span>
                        </div>
                        <span className="font-display text-xl font-bold text-neon-gold group-hover:text-glow transition-all duration-300">
                            NEXUS<span className="text-neon-cyan">226</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - Categories */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <Link
                            href="/"
                            className={`nav-link ${pathname === '/' ? 'text-neon-gold font-bold' : ''}`}
                        >
                            Accueil
                        </Link>
                        <Link
                            href="/categories"
                            className={`nav-link ${pathname === '/categories' ? 'text-neon-gold font-bold' : ''}`}
                        >
                            Catégories
                        </Link>
                        {loadingCategories ? (
                            <div className="w-32 h-8 bg-bg-card animate-pulse rounded" />
                        ) : categories.length > 0 ? (
                            categories.map((category) => {
                                const categoryPath = `/categories/${category.name.toLowerCase().replace(/ /g, '-')}`;
                                const isActive = pathname === categoryPath;
                                return (
                                    <Link
                                        key={category.id}
                                        href={categoryPath}
                                        className={`nav-link ${isActive ? 'text-neon-gold font-bold' : ''}`}
                                    >
                                        {category.name}
                                    </Link>
                                );
                            })
                        ) : (
                            <span className="text-text-muted text-sm">Aucune catégorie</span>
                        )}
                    </nav>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                {/* Admin Dashboard Link */}
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="text-sm text-neon-purple hover:text-neon-purple/80 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                {/* User Profile */}
                                <Link href="/profile" className="flex items-center space-x-2 group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center group-hover:shadow-neon-cyan transition-all duration-300 overflow-hidden">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-bg-dark font-semibold text-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors">
                                        @{user.username}
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={onLoginClick}
                                    className="neon-button-secondary px-4 py-2 text-sm"
                                >
                                    Se Connecter
                                </button>
                                <button
                                    onClick={onSignupClick}
                                    className="neon-button px-4 py-2 text-sm"
                                >
                                    S'inscrire
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-text-primary hover:text-neon-gold transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {mobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border-subtle">
                        <nav className="flex flex-col space-y-2">
                            <Link
                                href="/"
                                className={`nav-link ${pathname === '/' ? 'text-neon-gold font-bold' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Accueil
                            </Link>
                            <Link
                                href="/categories"
                                className={`nav-link ${pathname === '/categories' ? 'text-neon-gold font-bold' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Catégories
                            </Link>
                            {loadingCategories ? (
                                <div className="px-4 py-2 bg-bg-card animate-pulse rounded" />
                            ) : categories.length > 0 ? (
                                categories.map((category) => {
                                    const categoryPath = `/categories/${category.name.toLowerCase().replace(/ /g, '-')}`;
                                    const isActive = pathname === categoryPath;
                                    return (
                                        <Link
                                            key={category.id}
                                            href={categoryPath}
                                            className={`nav-link ${isActive ? 'text-neon-gold font-bold' : ''}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                    );
                                })
                            ) : (
                                <span className="px-4 py-2 text-text-muted text-sm">Aucune catégorie</span>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
