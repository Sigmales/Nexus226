import React from 'react';
import { getRandomServices } from '@/lib/data';
import HomePageClient from '@/components/pages/HomePageClient';

export default async function HomePage() {
    // Server-side data fetching
    const services = await getRandomServices(12);

    return <HomePageClient services={services} />;
}
