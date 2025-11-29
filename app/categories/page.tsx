import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { getCategoriesWithCounts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    const categories = await getCategoriesWithCounts();

    return (
        <div className="min-h-screen flex flex-col bg-bg-dark">
            <Header />

            <main className="flex-1 py-12 px-4">
                <div className="container-nexus">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-neon-gold mb-4">
                            Explorer par Catégorie
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            Découvrez tous les services disponibles classés par thématique.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.name.toLowerCase().replace(/ /g, '-')}`}
                                className="group relative bg-bg-card border border-border-subtle rounded-xl p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="text-6xl">📂</div>
                                </div>

                                <h2 className="text-2xl font-display font-bold text-text-primary mb-2 group-hover:text-neon-cyan transition-colors">
                                    {category.name}
                                </h2>

                                {category.description && (
                                    <p className="text-text-secondary mb-4 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-bg-darker text-text-muted group-hover:text-neon-cyan group-hover:bg-neon-cyan/10 transition-colors">
                                        {category.service_count} service{category.service_count !== 1 ? 's' : ''}
                                    </span>

                                    <span className="text-neon-cyan transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        Explorer →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {categories.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-text-secondary">Aucune catégorie disponible pour le moment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
