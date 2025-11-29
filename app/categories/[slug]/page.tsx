import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getServicesByCategory } from '@/lib/data';
import CategoryPageClient from '@/components/pages/CategoryPageClient';

interface CategoryPageProps {
    params: {
        slug: string;
    };
}

// Enable dynamic params (not pre-generated)
export const dynamicParams = true;

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = params;

    // Decode slug to handle special characters
    const decodedSlug = decodeURIComponent(slug);

    // Server-side data fetching
    const category = await getCategoryBySlug(decodedSlug);

    if (!category) {
        notFound();
    }

    const services = await getServicesByCategory(category.id);

    return <CategoryPageClient category={category} services={services} />;
}
