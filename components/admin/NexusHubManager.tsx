'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NexusService {
    id: string;
    title: string;
    description: string;
    icon_url: string | null;
    price: number | null;
    status: 'active' | 'inactive';
    display_order: number;
    created_at: string;
    updated_at: string;
}

export default function NexusHubManager() {
    const [services, setServices] = useState<NexusService[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState<NexusService | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const supabase = createClient();

    useEffect(() => {
        fetchServices();
    }, [filterStatus]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
            const response = await fetch(`/api/nexhub/services${statusParam}`);
            const data = await response.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

        try {
            const response = await fetch(`/api/nexhub/services/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchServices();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleToggleStatus = async (service: NexusService) => {
        const newStatus = service.status === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch(`/api/nexhub/services/${service.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchServices();
            } else {
                alert('Erreur lors de la mise à jour du statut');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold text-neon-gold">
                        Gestion NexusHub
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">
                        Gérez les services officiels proposés par l'équipe
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="neon-button"
                >
                    + Ajouter un service
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all'
                            ? 'bg-neon-gold text-bg-dark font-semibold'
                            : 'bg-bg-card text-text-secondary hover:bg-bg-darker'
                        }`}
                >
                    Tous ({services.length})
                </button>
                <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'active'
                            ? 'bg-green-500 text-bg-dark font-semibold'
                            : 'bg-bg-card text-text-secondary hover:bg-bg-darker'
                        }`}
                >
                    Actifs
                </button>
                <button
                    onClick={() => setFilterStatus('inactive')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'inactive'
                            ? 'bg-red-500 text-bg-dark font-semibold'
                            : 'bg-bg-card text-text-secondary hover:bg-bg-darker'
                        }`}
                >
                    Inactifs
                </button>
            </div>

            {/* Services Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-neon-gold border-t-transparent rounded-full animate-spin" />
                </div>
            ) : services.length > 0 ? (
                <div className="neon-glow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-bg-darker">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neon-gold">Titre</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neon-gold">Prix</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neon-gold">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neon-gold">Ordre</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-neon-gold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-bg-darker transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {service.icon_url ? (
                                                <img
                                                    src={service.icon_url}
                                                    alt={service.title}
                                                    className="w-10 h-10 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-gradient-to-br from-neon-gold to-neon-cyan flex items-center justify-center">
                                                    <span className="text-bg-dark font-bold">
                                                        {service.title.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-text-primary">{service.title}</div>
                                                <div className="text-sm text-text-secondary line-clamp-1">
                                                    {service.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-text-primary">
                                        {service.price !== null
                                            ? service.price === 0
                                                ? 'Gratuit'
                                                : `${service.price.toFixed(2)} €`
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleStatus(service)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${service.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                        >
                                            {service.status === 'active' ? 'Actif' : 'Inactif'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-text-primary">{service.display_order}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingService(service)}
                                                className="p-2 text-neon-cyan hover:bg-neon-cyan/20 rounded transition-colors"
                                                title="Modifier"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                title="Supprimer"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="neon-glow p-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-display font-bold text-text-primary mb-2">
                        Aucun service
                    </h3>
                    <p className="text-text-secondary mb-4">
                        Commencez par ajouter votre premier service NexusHub
                    </p>
                    <button onClick={() => setShowAddModal(true)} className="neon-button">
                        + Ajouter un service
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingService) && (
                <ServiceModal
                    service={editingService}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingService(null);
                    }}
                    onSuccess={() => {
                        fetchServices();
                        setShowAddModal(false);
                        setEditingService(null);
                    }}
                />
            )}
        </div>
    );
}

// Service Modal Component
interface ServiceModalProps {
    service: NexusService | null;
    onClose: () => void;
    onSuccess: () => void;
}

function ServiceModal({ service, onClose, onSuccess }: ServiceModalProps) {
    const [formData, setFormData] = useState({
        title: service?.title || '',
        description: service?.description || '',
        icon_url: service?.icon_url || '',
        price: service?.price?.toString() || '',
        status: service?.status || 'active',
        display_order: service?.display_order?.toString() || '0',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                icon_url: formData.icon_url || null,
                price: formData.price ? parseFloat(formData.price) : null,
                status: formData.status,
                display_order: parseInt(formData.display_order) || 0,
            };

            const url = service
                ? `/api/nexhub/services/${service.id}`
                : '/api/nexhub/services';
            const method = service ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onSuccess();
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Erreur lors de la sauvegarde');
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
                className="neon-glow max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-neon-gold">
                        {service ? 'Modifier le service' : 'Ajouter un service'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-neon-gold transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Titre *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-neon w-full"
                            placeholder="Formation Next.js"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-neon w-full resize-none"
                            placeholder="Description détaillée du service..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                URL de l'icône
                            </label>
                            <input
                                type="url"
                                value={formData.icon_url}
                                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                                className="input-neon w-full"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Prix (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="input-neon w-full"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Statut
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                className="input-neon w-full"
                            >
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Ordre d'affichage
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                className="input-neon w-full"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 neon-button-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 neon-button disabled:opacity-50"
                        >
                            {isSubmitting ? 'Enregistrement...' : service ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
