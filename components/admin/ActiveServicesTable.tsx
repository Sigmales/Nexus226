'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ServiceWithUser } from '@/types/database';
import EditServiceModal from './EditServiceModal';

export default function ActiveServicesTable() {
    const [services, setServices] = useState<ServiceWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select(`
        *,
        proposer:proposer_id (id, username, role),
        users:user_id (id, username, role),
        categories:category_id (id, name)
      `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setServices(data as ServiceWithUser[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleEditSuccess = () => {
        fetchServices(); // Refresh the list
    };

    const handleArchive = async (serviceId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir archiver/dépublier ce service ? Il ne sera plus visible publiquement.')) {
            return;
        }

        setProcessingId(serviceId);

        try {
            const response = await fetch(`/api/admin/services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'inactive',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Service archivé avec succès !');
                // Remove from list
                setServices((prev) => prev.filter((s) => s.id !== serviceId));
            } else {
                alert(`❌ Erreur: ${data.error}`);
            }
        } catch (error) {
            console.error('Error archiving service:', error);
            alert('❌ Erreur lors de l\'archivage');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (serviceId: string) => {
        if (!confirm('⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement ce service ? Cette action est irréversible.')) {
            return;
        }

        if (!confirm('⚠️ Dernière confirmation : Cette action supprimera définitivement le service. Continuer ?')) {
            return;
        }

        setProcessingId(serviceId);

        try {
            // Use direct Supabase client for deletion to match CategoriesManager pattern
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', serviceId);

            if (!error) {
                alert('✅ Service supprimé avec succès !');
                // Remove from list
                setServices((prev) => prev.filter((s) => s.id !== serviceId));
            } else {
                throw error;
            }
        } catch (error: any) {
            console.error('Error deleting service:', error);
            alert(`❌ Erreur lors de la suppression : ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Aucun service actif
                </h3>
                <p className="text-text-secondary">
                    Aucun service n'est actuellement publié.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-subtle">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-text-primary">
                            Titre
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-text-primary">
                            Catégorie
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-text-primary">
                            Prix
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-text-primary">
                            Proposé par
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-text-primary">
                            Publié le
                        </th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr
                            key={service.id}
                            className="border-b border-border-subtle hover:bg-bg-darker/50 transition-colors"
                        >
                            <td className="py-4 px-4">
                                <div className="min-w-0">
                                    <div className="font-medium text-text-primary line-clamp-1 overflow-hidden text-ellipsis">
                                        {service.title}
                                    </div>
                                    <div className="text-sm text-text-secondary mt-1 line-clamp-2 overflow-hidden">
                                        {service.description}
                                    </div>
                                    {service.link && (
                                        <a
                                            href={service.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-neon-cyan hover:text-neon-cyan/80 mt-1 inline-block truncate max-w-full"
                                            title={service.link}
                                        >
                                            🔗 {service.link}
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                {service.categories ? (
                                    <span className="badge badge-user text-xs">
                                        {service.categories.name}
                                    </span>
                                ) : (
                                    <span className="text-xs text-text-muted">Aucune</span>
                                )}
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-neon-gold font-mono">
                                    {service.price ? `${service.price} €` : 'Gratuit'}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <span className="badge badge-user text-xs">
                                    @{((service as any).proposer?.username || service.users?.username || 'Inconnu')}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <span className="text-sm text-text-secondary">
                                    {formatDate(service.created_at)}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setEditingServiceId(service.id)}
                                        disabled={processingId === service.id}
                                        className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Modifier le service"
                                    >
                                        ✏️ Modifier
                                    </button>
                                    <button
                                        onClick={() => handleArchive(service.id)}
                                        disabled={processingId === service.id}
                                        className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Archiver/Dépublier le service"
                                    >
                                        📦 Archiver
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        disabled={processingId === service.id}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Supprimer définitivement le service"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            {editingServiceId && (
                <EditServiceModal
                    serviceId={editingServiceId}
                    onClose={() => setEditingServiceId(null)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}

