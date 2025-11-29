'use client';

import React from 'react';
import Link from 'next/link';
import type { ServiceWithUser } from '@/types/database';

interface ServiceCardProps {
    service: ServiceWithUser;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    // Check if service is new (created within last 7 days)
    const isNew = () => {
        const createdDate = new Date(service.created_at);
        const now = new Date();
        const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
    };

    const handleExternalLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Link navigation is handled by the anchor tag, but we stop propagation to prevent card click
    };

    return (
        <article className="service-card group h-full flex flex-col relative overflow-hidden bg-surface-card border border-border-subtle hover:border-neon-cyan/50 rounded-xl transition-all duration-300 hover:shadow-neon-glow">

            {/* Main Content Area */}
            <div className="p-5 flex-1 flex flex-col">

                {/* Header: Image + Title + Link */}
                <div className="flex items-start gap-4 mb-3">
                    {/* Service Image/Icon */}
                    <div className="flex-shrink-0">
                        {service.image_url ? (
                            <img
                                src={service.image_url}
                                alt={service.title}
                                className="w-16 h-16 rounded-xl object-cover border border-border-subtle group-hover:border-neon-cyan/50 transition-colors"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-surface-hover border border-border-subtle flex items-center justify-center group-hover:border-neon-cyan/50 transition-colors">
                                <svg className="w-8 h-8 text-text-muted group-hover:text-neon-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Title & External Link */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-display font-semibold text-text-primary group-hover:text-neon-cyan transition-colors duration-300 line-clamp-2 leading-tight">
                                {/* Main Stretched Link */}
                                <Link href={`/services/${service.id}`} className="after:absolute after:inset-0 focus:outline-none">
                                    {service.title}
                                </Link>
                            </h3>

                            {service.link && (
                                <a
                                    href={service.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleExternalLinkClick}
                                    className="flex-shrink-0 text-text-muted hover:text-neon-gold transition-colors p-1 relative z-10"
                                    title="Visiter le site du service"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {isNew() && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                                    NOUVEAU
                                </span>
                            )}
                            {service.categories && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-text-secondary border border-border-subtle">
                                    {service.categories.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {service.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">

                    {/* Price Display */}
                    <div className="flex items-center">
                        {service.price === 0 || service.price === null ? (
                            <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-sm font-bold border border-green-500/20">
                                Gratuit
                            </span>
                        ) : (
                            <span className="text-lg font-bold text-neon-gold">
                                {service.price}€
                                <span className="text-xs font-normal text-text-muted ml-1">/mois</span>
                            </span>
                        )}
                    </div>

                    {/* User Avatar */}
                    {((service as any).proposer || service.users) && (
                        <div className="flex items-center gap-2" title={`Proposé par ${((service as any).proposer?.username || service.users?.username)}`}>
                            <span className="text-xs text-text-muted hidden sm:inline-block">
                                @{((service as any).proposer?.username || service.users?.username || 'Anonyme')}
                            </span>
                            {((service as any).proposer?.avatar_url || service.users?.avatar_url) ? (
                                <img
                                    src={(service as any).proposer?.avatar_url || service.users?.avatar_url}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full object-cover border border-border-subtle"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-surface-hover border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-secondary">
                                    {((service as any).proposer?.username || service.users?.username || 'A').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Status Overlay (if not active) */}
            {service.status !== 'active' && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                    <div className="px-4 py-2 rounded-lg bg-surface-card border border-border-subtle shadow-lg">
                        {service.status === 'pending' && (
                            <span className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                En attente
                            </span>
                        )}
                        {service.status === 'inactive' && (
                            <span className="text-sm font-medium text-text-muted flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-text-muted" />
                                Inactif
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Hover Gradient Line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-gold via-neon-cyan to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </article>
    );
}
