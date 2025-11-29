'use client';

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category } from '@/types/database';

interface CategoryOrderManagerProps {
    categories: Category[];
    onClose: () => void;
    onSuccess: () => void;
}

interface SortableItemProps {
    category: Category;
}

function SortableItem({ category }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex items-center gap-3 p-4 mb-2 
                bg-bg-card border border-border-subtle rounded-lg
                ${isDragging ? 'opacity-50 shadow-lg shadow-neon-cyan/20' : ''}
                hover:border-neon-cyan transition-all cursor-move
            `}
            {...attributes}
            {...listeners}
        >
            {/* Drag Handle Icon */}
            <svg
                className="w-5 h-5 text-text-muted flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                />
            </svg>

            {/* Category Name */}
            <span className="text-text-primary font-medium flex-1">
                {category.name}
            </span>

            {/* Badge */}
            <span className="px-2 py-1 text-xs bg-neon-purple/10 text-neon-purple rounded">
                Catégorie
            </span>
        </div>
    );
}

export default function CategoryOrderManager({
    categories,
    onClose,
    onSuccess,
}: CategoryOrderManagerProps) {
    const [items, setItems] = useState<Category[]>(categories);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                setHasChanges(true);
                return newItems;
            });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const ordered_ids = items.map((item) => item.id);

            const response = await fetch('/api/admin/categories/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ordered_ids }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la sauvegarde');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-dark border border-border-subtle rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border-subtle">
                    <h2 className="text-2xl font-display font-bold text-neon-gold mb-2">
                        Réorganiser les Catégories
                    </h2>
                    <p className="text-text-secondary text-sm">
                        Glissez-déposez les catégories pour modifier leur ordre d'affichage dans la navigation et sur la page des catégories.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* Sortable List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((category) => (
                                <SortableItem key={category.id} category={category} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle flex gap-4">
                    <button
                        onClick={handleCancel}
                        className="flex-1 px-6 py-3 border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-neon-gold transition-colors"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !hasChanges}
                        className="flex-1 neon-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer l\'Ordre'}
                    </button>
                </div>
            </div>
        </div>
    );
}
