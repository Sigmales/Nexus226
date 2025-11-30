'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const supabase = createClient();

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
            .replace(/(^-|-$)+/g, '');       // Remove leading/trailing hyphens
    };

    // Fetch categories from database
    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .is('parent_id', null) // Only root categories for nav
            .neq('name', 'NexusHub') // Exclude NexusHub as it has its own link
            .eq('show_in_nav', true) // Only show categories marked for navigation
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
                    <nav className="hidden xl:flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`nav-link text-white hover:text-white/80 ${pathname === '/' ? 'font-bold' : ''}`}
                        >
                            Accueil
                        </Link>
                        <Link
                            href="/categories"
                            className={`nav-link text-orange-500 hover:text-orange-400 ${pathname === '/categories' ? 'font-bold' : ''}`}
                        >
                            Catégories
                        </Link>
                        <Link
                            href="/categories/nexushub"
                            className={`nav-link text-blue-500 hover:text-blue-400 ${pathname === '/categories/nexushub' ? 'font-bold' : ''}`}
                        >
                            NexusHub
                        </Link>
                        {loadingCategories ? (
                            <div className="w-32 h-8 bg-bg-card animate-pulse rounded" />
                        ) : categories.length > 0 ? (
                            categories.map((category) => {
                                const categoryPath = `/categories/${generateSlug(category.name)}`;
                                const isActive = pathname === categoryPath || pathname?.startsWith(`${categoryPath}/`);
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
                                        className="hidden xl:block text-sm text-neon-purple hover:text-neon-purple/80 transition-colors"
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
                            className="xl:hidden p-2 text-text-primary hover:text-neon-gold transition-colors z-50 relative"
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

                {/* Mobile/Tablet Sidebar Menu - Portalled to body to escape Header stacking context */}
                {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] xl:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Sidebar */}
                        <div className={`fixed top-0 right-0 h-full w-64 bg-bg-darker border-l border-border-subtle transform transition-transform duration-300 ease-in-out z-[70] xl:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="flex flex-col h-full overflow-y-auto pt-20 pb-6 px-6">
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-neon-gold transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <nav className="flex flex-col space-y-4">
                                    {user?.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="nav-link text-neon-purple font-bold text-lg"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link
                                        href="/"
                                        className={`nav-link text-lg text-white hover:text-white/80 ${pathname === '/' ? 'font-bold' : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Accueil
                                    </Link>
                                    <Link
                                        href="/categories"
                                        className={`nav-link text-lg text-orange-500 hover:text-orange-400 ${pathname === '/categories' ? 'font-bold' : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Catégories
                                    </Link>
                                    <Link
                                        href="/categories/nexushub"
                                        className={`nav-link text-lg text-blue-500 hover:text-blue-400 ${pathname === '/categories/nexushub' ? 'font-bold' : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        NexusHub
                                    </Link>

                                    <div className="h-px bg-border-subtle my-2" />

                                    {loadingCategories ? (
                                        <div className="space-y-2">
                                            <div className="h-8 bg-bg-card animate-pulse rounded w-3/4" />
                                            <div className="h-8 bg-bg-card animate-pulse rounded w-1/2" />
                                        </div>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => {
                                            const categoryPath = `/categories/${generateSlug(category.name)}`;
                                            const isActive = pathname === categoryPath || pathname?.startsWith(`${categoryPath}/`);
                                            return (
                                                <Link
                                                    key={category.id}
                                                    href={categoryPath}
                                                    className={`nav-link text-lg ${isActive ? 'text-neon-gold font-bold' : ''}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {category.name}
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <span className="text-text-muted text-sm">Aucune catégorie</span>
                                    )}
                                </nav>

                                {/* Logout Button - Fixed at bottom */}
                                {user && (
                                    <div className="mt-auto pt-6 border-t border-border-subtle">
                                        <button
                                            onClick={async () => {
                                                await logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="font-medium">Déconnexion</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </header>
    );
}
