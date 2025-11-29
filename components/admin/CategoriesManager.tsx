'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Category, Service } from '@/types/database';
import type { Database } from '@/types/supabase-generated';
import CategoryOrderManager from './CategoryOrderManager';

type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export default function CategoriesManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_id: '',
        background_image_url: ''
    });
    const supabase = createClient() as any;

    const fetchData = async () => {
        setLoading(true);

        // Fetch categories sorted by display_order
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })
            .order('name');

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .order('title');

        if (!categoriesError && categoriesData) {
            setCategories(categoriesData);
        }

        if (!servicesError && servicesData) {
            setServices(servicesData);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
            .replace(/(^-|-$)+/g, '');       // Remove leading/trailing hyphens
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const basePayload = {
            name: formData.name,
            description: formData.description || null,
            parent_id: formData.parent_id || null,
            background_image_url: formData.background_image_url || null
        };

        try {
            if (editingCategory) {
                // Update
                const { error } = await supabase
                    .from('categories')
                    .update(basePayload)
                    .eq('id', editingCategory.id);

                if (error) throw error;

                fetchData();
                handleCloseModal();
            } else {
                // Create new category
                const { error } = await supabase
                    .from('categories')
                    .insert([basePayload]);

                if (error) throw error;

                fetchData();
                handleCloseModal();
            }
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(`Erreur lors de l'enregistrement : ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        // Find category and its children
        const categoryToDelete = categories.find(c => c.id === id);
        if (!categoryToDelete) return;

        const subCategories = categories.filter(c => c.parent_id === id);
        const linkedServices = services.filter(s => s.category_id === id);

        let message = `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete.name}" ?`;

        if (subCategories.length > 0 || linkedServices.length > 0) {
            message += `\n\nATTENTION : Cette action supprimera également :`;
            if (subCategories.length > 0) message += `\n- ${subCategories.length} sous-catégorie(s)`;
            if (linkedServices.length > 0) message += `\n- ${linkedServices.length} service(s)`;
            message += `\n\nCette action est irréversible.`;
        }

        if (!confirm(message)) return;

        setLoading(true);

        try {
            // 1. Delete linked services
            if (linkedServices.length > 0) {
                const { error: servicesError } = await supabase
                    .from('services')
                    .delete()
                    .in('id', linkedServices.map(s => s.id));

                if (servicesError) throw servicesError;
            }

            // 2. Recursively delete subcategories
            // Note: This simple implementation only handles 1 level of depth for subcategories as per current UI
            // For deeper nesting, we would need a recursive function
            if (subCategories.length > 0) {
                // First delete services of subcategories
                for (const subCat of subCategories) {
                    const subCatServices = services.filter(s => s.category_id === subCat.id);
                    if (subCatServices.length > 0) {
                        const { error: subServicesError } = await supabase
                            .from('services')
                            .delete()
                            .in('id', subCatServices.map(s => s.id));
                        if (subServicesError) throw subServicesError;
                    }
                }

                // Then delete subcategories
                const { error: subCatError } = await supabase
                    .from('categories')
                    .delete()
                    .in('id', subCategories.map(c => c.id));

                if (subCatError) throw subCatError;
            }

            // 3. Delete the category itself
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Refresh data
            await fetchData();

        } catch (error: any) {
            console.error('Error deleting category:', error);
            alert(`Erreur lors de la suppression : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                parent_id: category.parent_id || '',
                background_image_url: category.background_image_url || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                parent_id: '',
                background_image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', parent_id: '', background_image_url: '' });
    };

    // Helper to build hierarchy options
    const getParentOptions = () => {
        return categories.filter(c => c.id !== editingCategory?.id);
    };

    // Helper to get badge
    const getBadge = (type: 'category' | 'subcategory' | 'service') => {
        switch (type) {
            case 'category':
                return <span className="text-xs font-bold px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/50">Catégorie</span>;
            case 'subcategory':
                return <span className="text-xs font-bold px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50">Sous-catégorie</span>;
            case 'service':
                return <span className="text-xs font-bold px-2 py-0.5 rounded bg-neon-gold/20 text-neon-gold border border-neon-gold/50">Service</span>;
        }
    };

    // Recursive render for tree view
    const renderCategoryRow = (category: Category, level: number = 0) => {
        const paddingLeft = level * 24;
        const isSubCategory = !!category.parent_id;

        // Find services belonging to this category
        const categoryServices = services.filter(s => s.category_id === category.id);

        return (
            <React.Fragment key={category.id}>
                <div
                    className="bg-bg-card border border-border-subtle rounded-lg p-4 flex items-center justify-between group hover:border-neon-cyan transition-colors mb-2"
                    style={{ marginLeft: `${paddingLeft}px` }}
                >
                    <div className="flex items-center gap-3">
                        {/* Status indicator removed as is_public does not exist */}
                        <div>
                            <h3 className="font-semibold text-text-primary mb-1 flex items-center gap-2">
                                {category.name}
                                {getBadge(isSubCategory ? 'subcategory' : 'category')}
                            </h3>
                            {category.description && (
                                <p className="text-sm text-text-secondary">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleOpenModal(category)}
                            className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded transition-colors"
                            title="Modifier"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Supprimer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Render Services for this category */}
                {categoryServices.map(service => (
                    <div
                        key={service.id}
                        className="bg-bg-dark border border-border-subtle/50 rounded-lg p-3 flex items-center justify-between group hover:border-neon-gold transition-colors mb-2 ml-8"
                        style={{ marginLeft: `${paddingLeft + 24}px` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${(service as any).is_public !== false ? 'bg-green-500' : 'bg-red-500'}`} title={(service as any).is_public !== false ? 'Visible' : 'Masqué'} />
                            <div>
                                <h4 className="font-medium text-text-primary text-sm flex items-center gap-2">
                                    {service.title}
                                    {getBadge('service')}
                                </h4>
                                <p className="text-xs text-text-muted truncate max-w-md">
                                    {service.description}
                                </p>
                            </div>
                        </div>
                        {/* Services are managed in the Services tab, so we don't add edit/delete buttons here to avoid confusion/duplication, or we could add a link to edit */}
                        <div className="text-xs text-text-muted italic px-2">
                            Géré dans l'onglet Services
                        </div>
                    </div>
                ))}

                {/* Render children categories */}
                {categories
                    .filter(c => c.parent_id === category.id)
                    .map(child => renderCategoryRow(child, level + 1))
                }
            </React.Fragment>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-display font-bold text-text-primary">
                    Gestion des Catégories et Services
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsReorderModalOpen(true)}
                        className="neon-button-secondary px-4 py-2 text-sm flex items-center gap-2"
                        title="Réorganiser l'ordre des catégories racines"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        Réorganiser
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="neon-button px-4 py-2 text-sm"
                    >
                        Nouvelle Catégorie
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* Render root categories first */}
                    {categories
                        .filter(c => !c.parent_id)
                        .map(category => renderCategoryRow(category))
                    }
                    {/* Fallback for orphaned categories */}
                    {categories.filter(c => c.parent_id && !categories.find(p => p.id === c.parent_id)).length > 0 && (
                        <div className="mt-8 pt-8 border-t border-border-subtle">
                            <h3 className="text-lg font-bold text-red-400 mb-4">Catégories orphelines (Erreur de hiérarchie)</h3>
                            {categories
                                .filter(c => c.parent_id && !categories.find(p => p.id === c.parent_id))
                                .map(category => renderCategoryRow(category))
                            }
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-bg-card border border-neon-gold rounded-lg w-full max-w-md p-6 shadow-neon-gold">
                        <h3 className="text-xl font-display font-bold text-text-primary mb-6">
                            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-3 py-2 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-3 py-2 text-text-primary focus:border-neon-gold focus:outline-none transition-colors h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Catégorie Parente (Optionnel)
                                </label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-3 py-2 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                >
                                    <option value="">Aucune (Racine)</option>
                                    {getParentOptions().map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Image de fond (URL)
                                </label>
                                <input
                                    type="url"
                                    value={formData.background_image_url}
                                    onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                                    className="w-full bg-bg-dark border border-border-subtle rounded px-3 py-2 text-text-primary focus:border-neon-gold focus:outline-none transition-colors"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-text-muted mt-1">URL de l'image à afficher en arrière-plan du header de la catégorie</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="neon-button px-6 py-2"
                                >
                                    {editingCategory ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Order Manager Modal */}
            {isReorderModalOpen && (
                <CategoryOrderManager
                    categories={categories.filter(c => !c.parent_id)}
                    onClose={() => setIsReorderModalOpen(false)}
                    onSuccess={() => {
                        setIsReorderModalOpen(false);
                        fetchData(); // Refresh to show new order
                    }}
                />
            )}
        </div>
    );
}
