import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/data';
import AdminServicesClient from '@/components/pages/AdminServicesClient';

export default async function AdminServicesPage() {
    // Server-side route protection
    const userIsAdmin = await isAdmin();

    if (!userIsAdmin) {
        redirect('/');
    }

    return <AdminServicesClient />;
}

