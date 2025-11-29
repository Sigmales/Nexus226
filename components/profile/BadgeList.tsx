'use client';

import React from 'react';
import type { UserBadge } from '@/types/database';

interface BadgeListProps {
    badges: UserBadge[];
    className?: string;
}

const TIER_STYLES: Record<number, { color: string; bg: string; border: string; label: string }> = {
    1: { // Active Contributor
        color: 'text-bronze-500',
        bg: 'bg-bronze-500/10',
        border: 'border-bronze-500/20',
        label: 'Bronze'
    },
    2: { // Reliable Provider
        color: 'text-gray-300',
        bg: 'bg-gray-300/10',
        border: 'border-gray-300/20',
        label: 'Silver'
    },
    3: { // Certified Specialist
        color: 'text-neon-gold',
        bg: 'bg-neon-gold/10',
        border: 'border-neon-gold/20',
        label: 'Gold'
    },
    4: { // Elite Partner
        color: 'text-neon-cyan',
        bg: 'bg-neon-cyan/10',
        border: 'border-neon-cyan/20',
        label: 'Platinum'
    },
    5: { // Nexus Legend
        color: 'text-neon-purple',
        bg: 'bg-neon-purple/10',
        border: 'border-neon-purple/20',
        label: 'Legend'
    }
};

// Fallback style
const DEFAULT_STYLE = {
    color: 'text-text-primary',
    bg: 'bg-bg-card',
    border: 'border-border-subtle',
    label: 'Badge'
};

export default function BadgeList({ badges, className = '' }: BadgeListProps) {
    if (!badges || badges.length === 0) return null;

    // Sort by tier descending (highest first)
    const sortedBadges = [...badges].sort((a, b) =>
        (b.badges?.tier || 0) - (a.badges?.tier || 0)
    );

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {sortedBadges.map((userBadge) => {
                const badge = userBadge.badges;
                if (!badge) return null;

                const style = TIER_STYLES[badge.tier] || DEFAULT_STYLE;

                return (
                    <div
                        key={userBadge.id}
                        className={`
                            flex items-center gap-2 px-3 py-1 rounded-full border
                            ${style.bg} ${style.border} transition-transform hover:scale-105 cursor-help
                        `}
                        title={badge.description || badge.name}
                    >
                        {/* Icon based on tier/name could go here, for now using a generic star or the tier color */}
                        <span className={`text-sm font-bold ${style.color}`}>
                            {/* Simple icon mapping based on tier */}
                            {badge.tier === 5 && '👑'}
                            {badge.tier === 4 && '🏆'}
                            {badge.tier === 3 && '⭐'}
                            {badge.tier === 2 && '🛡️'}
                            {badge.tier === 1 && '✨'}
                        </span>
                        <span className={`text-xs font-semibold ${style.color}`}>
                            {badge.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
