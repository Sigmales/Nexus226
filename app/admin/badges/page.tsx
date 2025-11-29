'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, Badge, UserBadge } from '@/types/database';

export default function AdminBadgesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const supabase = createClient();

    // Fetch all available badges on mount
    useEffect(() => {
        const fetchBadges = async () => {
            const { data } = await supabase.from('badges').select('*').order('tier');
            if (data) setAllBadges(data);
        };
        fetchBadges();
    }, [supabase]);

    // Search users
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        const { data } = await supabase
            .from('users')
            .select('*')
            .ilike('username', `%${searchTerm}%`)
            .limit(10);

        if (data) setUsers(data as UserProfile[]);
        setLoading(false);
    };

    // Select user and fetch their badges
    const handleSelectUser = async (user: UserProfile) => {
        setSelectedUser(user);
        const { data } = await supabase
            .from('user_badges')
            .select('*, badges(*)')
            .eq('user_id', user.id);

        if (data) setUserBadges(data as UserBadge[]);
    };

    // Assign badge
    const handleAssignBadge = async (badgeId: string) => {
        if (!selectedUser) return;
        setActionLoading(true);

        try {
            const response = await fetch('/api/admin/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.id, badgeId }),
            });

            if (response.ok) {
                // Refresh user badges
                handleSelectUser(selectedUser);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to assign badge');
            }
        } catch (error) {
            console.error('Error assigning badge:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Revoke badge
    const handleRevokeBadge = async (badgeId: string) => {
        if (!selectedUser) return;
        if (!confirm('Are you sure you want to revoke this badge?')) return;
        setActionLoading(true);

        try {
            const response = await fetch(`/api/admin/badges?userId=${selectedUser.id}&badgeId=${badgeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh user badges
                handleSelectUser(selectedUser);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to revoke badge');
            }
        } catch (error) {
            console.error('Error revoking badge:', error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-display font-bold text-text-primary mb-6">
                Gestion des Badges Utilisateurs
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Search */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-bg-card p-6 rounded-lg border border-border-subtle">
                        <h2 className="text-lg font-semibold mb-4">Rechercher un utilisateur</h2>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nom d'utilisateur..."
                                className="input-neon flex-1"
                            />
                            <button type="submit" className="neon-button px-4">
                                🔍
                            </button>
                        </form>

                        {loading ? (
                            <div className="text-center py-4">Chargement...</div>
                        ) : (
                            <div className="space-y-2">
                                {users.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full text-left p-3 rounded transition-colors flex items-center gap-3 ${selectedUser?.id === user.id
                                                ? 'bg-neon-cyan/20 border border-neon-cyan'
                                                : 'hover:bg-bg-darker border border-transparent'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user.username.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className="font-medium">{user.username}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Badge Management */}
                <div className="lg:col-span-2">
                    {selectedUser ? (
                        <div className="bg-bg-card p-6 rounded-lg border border-border-subtle">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center overflow-hidden">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold">{selectedUser.username.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                                    <p className="text-text-secondary text-sm">ID: {selectedUser.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Current Badges */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-neon-gold">Badges Actuels</h3>
                                    {userBadges.length === 0 ? (
                                        <p className="text-text-secondary italic">Aucun badge assigné.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {userBadges.map((ub) => (
                                                <div key={ub.id} className="flex items-center justify-between p-3 bg-bg-darker rounded border border-border-subtle">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">
                                                            {ub.badges?.tier === 5 && '👑'}
                                                            {ub.badges?.tier === 4 && '🏆'}
                                                            {ub.badges?.tier === 3 && '⭐'}
                                                            {ub.badges?.tier === 2 && '🛡️'}
                                                            {ub.badges?.tier === 1 && '✨'}
                                                        </span>
                                                        <div>
                                                            <div className="font-bold">{ub.badges?.name}</div>
                                                            <div className="text-xs text-text-secondary">Tier {ub.badges?.tier}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRevokeBadge(ub.badge_id)}
                                                        disabled={actionLoading}
                                                        className="text-red-400 hover:text-red-300 text-sm underline disabled:opacity-50"
                                                    >
                                                        Révoquer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Available Badges */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-neon-cyan">Assigner un Badge</h3>
                                    <div className="space-y-3">
                                        {allBadges.map((badge) => {
                                            const hasBadge = userBadges.some(ub => ub.badge_id === badge.id);
                                            return (
                                                <button
                                                    key={badge.id}
                                                    onClick={() => handleAssignBadge(badge.id)}
                                                    disabled={hasBadge || actionLoading}
                                                    className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-all ${hasBadge
                                                            ? 'bg-bg-darker border-border-subtle opacity-50 cursor-not-allowed'
                                                            : 'bg-bg-dark hover:bg-bg-darker border-border-subtle hover:border-neon-cyan'
                                                        }`}
                                                >
                                                    <span className="text-2xl">
                                                        {badge.tier === 5 && '👑'}
                                                        {badge.tier === 4 && '🏆'}
                                                        {badge.tier === 3 && '⭐'}
                                                        {badge.tier === 2 && '🛡️'}
                                                        {badge.tier === 1 && '✨'}
                                                    </span>
                                                    <div>
                                                        <div className="font-bold">{badge.name}</div>
                                                        <div className="text-xs text-text-secondary">{badge.description}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-bg-card rounded-lg border border-border-subtle p-12 text-text-secondary">
                            Sélectionnez un utilisateur pour gérer ses badges
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
