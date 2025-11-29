'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/lib/toast';
import Button from '@/components/ui/Button';
import type { Category, Service } from '@/types/database';

interface EditServiceModalProps {
    serviceId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface ServiceWithProposer extends Service {
    proposer?: { id: string; username: string } | null;
    category?: { id: string; name: string } | null;
}

export default function EditServiceModal({ serviceId, onClose, onSuccess }: EditServiceModalProps) {
    const [service, setService] = useState<ServiceWithProposer | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('0');
    const [publishOnSave, setPublishOnSave] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    // Validation state
    const [validationErrors, setValidationErrors] = useState<{
        title?: string;
        description?: string;
        link?: string;
        imageUrl?: string;
    }>({});

    const supabase = createClient();

    // Fetch service and categories
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch service
                const serviceResponse = await fetch(`/api/admin/services/${serviceId}`);
                if (!serviceResponse.ok) {
                    throw new Error('Erreur lors du chargement du service');
                }
                const { service: serviceData } = await serviceResponse.json();
                setService(serviceData);

                // Pre-fill form
                const initialTitle = serviceData.title || '';
                const initialDescription = serviceData.description || '';
                const initialLink = serviceData.link || '';
                const initialImageUrl = serviceData.image_url || '';

                setTitle(initialTitle);
                setDescription(initialDescription);
                setLink(initialLink);
                setImageUrl(initialImageUrl);
                setCategoryId(serviceData.category_id || '');
                setPrice(serviceData.price ? serviceData.price.toString() : '0');
                setIsPublic((serviceData as any).is_public ?? true);

                console.log('[EditServiceModal] Form initialized:', {
                    title: initialTitle,
                    descriptionLength: initialDescription.length,
                    link: initialLink,
                    imageUrl: initialImageUrl
                });

                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (!categoriesError && categoriesData) {
                    setCategories(categoriesData);
                }
            } catch (err: any) {
                setError(err.message || 'Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [serviceId, supabase]);

    // Build hierarchical category display
    const buildCategoryTree = () => {
        const rootCategories = categories.filter(c => !c.parent_id);
        const result: { value: string; label: string; level: number }[] = [];

        const addCategory = (cat: Category, level: number, prefix: string) => {
            result.push({
                value: cat.id,
                label: `${prefix}${cat.name}`,
                level
            });

            const children = categories.filter(c => c.parent_id === cat.id);
            children.forEach(child => {
                addCategory(child, level + 1, prefix + '  ');
            });
        };

        rootCategories.forEach(cat => addCategory(cat, 0, ''));
        return result;
    };

    // Validation function
    const validateForm = () => {
        const errors: { title?: string; description?: string; link?: string; imageUrl?: string } = {};

        if (!title || title.trim().length === 0) {
            errors.title = 'Le titre est requis';
        }

        if (!description || description.trim().length < 50) {
            errors.description = `La description doit contenir au moins 50 caractères (actuellement: ${description.trim().length})`;
        }

        if (link && link.trim().length > 0) {
            try {
                new URL(link.trim());
            } catch {
                errors.link = 'Format d\'URL invalide';
            }
        }

        if (imageUrl && imageUrl.trim().length > 0) {
            try {
                new URL(imageUrl.trim());
            } catch {
                errors.imageUrl = 'Format d\'URL d\'image invalide';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate on field changes
    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (validationErrors.title) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (value.trim().length > 0) {
                    delete newErrors.title;
                }
                return newErrors;
            });
        }
    };

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        const trimmedLength = value.trim().length;

        // Force immediate validation update
        if (validationErrors.description && trimmedLength >= 50) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        }
    };

    const handleLinkChange = (value: string) => {
        setLink(value);
        if (validationErrors.link) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (!value || value.trim().length === 0) {
                    delete newErrors.link;
                } else {
                    try {
                        new URL(value);
                        delete newErrors.link;
                    } catch {
                        // Keep error if URL is invalid
                    }
                }
                return newErrors;
            });
        }
    };

    const handleImageUrlChange = (value: string) => {
        setImageUrl(value);
        if (validationErrors.imageUrl) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (!value || value.trim().length === 0) {
                    delete newErrors.imageUrl;
                } else {
                    try {
                        new URL(value);
                        delete newErrors.imageUrl;
                    } catch {
                        // Keep error if URL is invalid
                    }
                }
                return newErrors;
            });
        }
    };

    // Calculate if form is valid - use useMemo to ensure it updates
    const isFormValid = useMemo(() => {
        const titleValid = title.trim().length > 0;
        const descriptionValid = description.trim().length >= 50;
        const linkValid = !link || link.trim().length === 0 || (() => {
            try {
                new URL(link.trim());
                return true;
            } catch {
                return false;
            }
        })();
        const imageUrlValid = !imageUrl || imageUrl.trim().length === 0 || (() => {
            try {
                new URL(imageUrl.trim());
                return true;
            } catch {
                return false;
            }
        })();

        return titleValid && descriptionValid && linkValid && imageUrlValid;
    }, [title, description, link, imageUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setError(null);

        // Validate before submitting
        const isValid = validateForm();

        if (!isValid) {
            setError('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        if (!isFormValid) {
            setError('Le formulaire n\'est pas valide. Vérifiez les champs requis.');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(`/api/admin/services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    link,
                    image_url: imageUrl,
                    category_id: categoryId || null,
                    price: parseFloat(price) || 0,
                    status: publishOnSave ? 'active' : 'pending',
                    is_public: isPublic,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la sauvegarde');
            }

            toast.success(publishOnSave
                ? 'Service modifié et publié avec succès !'
                : 'Service modifié avec succès !');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const categoryOptions = buildCategoryTree();

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" style={{ pointerEvents: 'auto' }}>
                <div className="neon-glow p-8 relative z-[101]" style={{ pointerEvents: 'auto' }}>
                    <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => {
                // Close modal when clicking on backdrop
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            style={{ pointerEvents: 'auto' }}
        >
            <div
                className="neon-glow max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-[101]"
                onClick={(e) => {
                    // Only stop propagation for clicks on the container itself, not on children
                    if (e.target === e.currentTarget) {
                        e.stopPropagation();
                    }
                }}
                style={{ pointerEvents: 'auto' }}
            >
                <div className="p-6" style={{ pointerEvents: 'auto' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-neon-gold">
                                Modifier le Service
                            </h2>
                            {service?.proposer && (
                                <p className="text-sm text-text-secondary mt-1">
                                    Proposé par <span className="text-neon-purple">@{service.proposer.username}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            type="button"
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" style={{ pointerEvents: 'auto' }}>
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Titre du Service *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                required
                                className={`input-neon w-full ${validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder="Ex: Assistant IA pour la rédaction"
                            />
                            {validationErrors.title && (
                                <p className="text-xs text-red-400 mt-1">{validationErrors.title}</p>
                            )}
                        </div>

                        {/* URL */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                URL du Service (Lien externe)
                            </label>
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => handleLinkChange(e.target.value)}
                                className={`input-neon w-full ${validationErrors.link ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder="https://example.com"
                            />
                            {validationErrors.link && (
                                <p className="text-xs text-red-400 mt-1">{validationErrors.link}</p>
                            )}
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                URL de l'Image/Icône
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => handleImageUrlChange(e.target.value)}
                                        className={`input-neon w-full ${validationErrors.imageUrl ? 'border-red-500 focus:border-red-500' : ''}`}
                                        placeholder="https://example.com/image.png"
                                    />
                                    {validationErrors.imageUrl && (
                                        <p className="text-xs text-red-400 mt-1">{validationErrors.imageUrl}</p>
                                    )}
                                </div>
                                {imageUrl && !validationErrors.imageUrl && (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-subtle flex-shrink-0">
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Description * (min. 50 caractères)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                required
                                rows={4}
                                className={`input-neon w-full resize-none ${validationErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder="Décrivez le service en détail..."
                            />
                            <div className={`text-xs mt-1 font-medium ${description.trim().length >= 50 ? 'text-green-400' : validationErrors.description ? 'text-red-400' : 'text-text-muted'}`}>
                                {description.trim().length}/50 caractères minimum
                                {description.trim().length >= 50 && ' ✓'}
                            </div>
                            {validationErrors.description && (
                                <p className="text-xs text-red-400 mt-1 font-semibold">{validationErrors.description}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Catégorie
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="input-neon w-full"
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Prix (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="input-neon w-full"
                            />
                            <p className="text-xs text-text-muted mt-1">
                                Laissez 0 si le service est gratuit
                            </p>
                        </div>

                        {/* Publish on save checkbox */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="publishOnSave"
                                    checked={publishOnSave}
                                    onChange={(e) => setPublishOnSave(e.target.checked)}
                                    className="w-4 h-4 rounded border-border-subtle bg-bg-dark text-neon-purple focus:ring-neon-purple"
                                />
                                <label htmlFor="publishOnSave" className="text-sm text-text-primary">
                                    Statut Actif (Service opérationnel)
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 rounded border-border-subtle bg-bg-dark text-neon-gold focus:ring-neon-gold"
                                />
                                <label htmlFor="isPublic" className="text-sm text-text-primary">
                                    Visible publiquement (Affiché sur le site)
                                </label>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!isFormValid}
                                loading={saving}
                                className="flex-1"
                            >
                                {publishOnSave ? 'Modifier et Publier' : 'Enregistrer les Modifications'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

