'use client';

import React from 'react';

interface NexusService {
    id: string;
    title: string;
    description: string;
    icon_url: string | null;
    price: number | null;
    status: 'active' | 'inactive';
    display_order: number;
}

interface NexusServiceCardProps {
    service: NexusService;
    onContact: (service: NexusService) => void;
}

export default function NexusServiceCard({ service, onContact }: NexusServiceCardProps) {
    return (
        <div className="neon-glow group hover:shadow-neon-gold transition-all duration-300 cursor-pointer">
            <div className="p-6">
                {/* Icon */}
                <div className="mb-4 flex items-center justify-center">
                    {service.icon_url ? (
                        <img
                            src={service.icon_url}
                            alt={service.title}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-neon-gold to-neon-cyan flex items-center justify-center">
                            <span className="text-bg-dark font-display font-bold text-2xl">
                                {service.title.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-bold text-neon-gold mb-3 text-center">
                    {service.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4 text-center line-clamp-3">
                    {service.description}
                </p>

                {/* Price */}
                {service.price !== null && (
                    <div className="text-center mb-4">
                        <span className="text-2xl font-bold text-neon-cyan">
                            {service.price === 0 ? 'Gratuit' : `${service.price.toFixed(2)} €`}
                        </span>
                    </div>
                )}

                {/* CTA Button */}
                <button
                    onClick={() => onContact(service)}
                    className="neon-button w-full group-hover:shadow-neon-gold"
                >
                    Commander
                </button>
            </div>
        </div>
    );
}
