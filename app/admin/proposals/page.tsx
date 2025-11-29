import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/data';
import AdminProposalsClient from '@/components/pages/AdminProposalsClient';

export default async function AdminProposalsPage() {
    // Server-side route protection
    const userIsAdmin = await isAdmin();

    if (!userIsAdmin) {
        redirect('/');
    }

    return <AdminProposalsClient />;
}
