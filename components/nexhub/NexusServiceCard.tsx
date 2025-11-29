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
        <div className="neon-glow group hover:shadow-neon-gold transition-all duration-300 cursor-pointer h-full flex flex-col">
            <div className="p-4 md:p-6 flex flex-col flex-1">
                {/* Icon */}
                <div className="mb-3 md:mb-4 flex items-center justify-center">
                    {service.icon_url ? (
                        <img src={service.icon_url} alt={service.title} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover" />
                    ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-br from-neon-gold to-neon-cyan flex items-center justify-center">
                            <span className="text-bg-dark font-display font-bold text-xl md:text-2xl">{service.title.charAt(0)}</span>
                        </div>
                    )}
                </div>
                {/* Title */}
                <h3 className="text-responsive-lg md:text-responsive-xl font-display font-bold text-neon-gold mb-2 md:mb-3 text-center">{service.title}</h3>
                {/* Description */}
                <p className="text-text-secondary text-responsive-sm md:text-responsive-base mb-3 md:mb-4 text-center line-clamp-2 md:line-clamp-3 group-hover:line-clamp-none transition-all flex-1">
                    {service.description}
                </p>
                {/* Price */}
                {service.price !== null && (
                    <div className="text-center mb-3 md:mb-4">
                        <span className="text-responsive-xl md:text-responsive-2xl font-bold text-neon-cyan">
                            {service.price === 0 ? 'Gratuit' : `${service.price.toFixed(2)} €`}
                        </span>
                    </div>
                )}
                {/* CTA Button */}
                <button onClick={() => onContact(service)} className="neon-button w-full group-hover:shadow-neon-gold tap-target" data-testid="nexushub-contact-button" aria-label={`Commander ${service.title}`}>
                    Commander
                </button>
            </div>
        </div>
    );
}
