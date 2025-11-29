import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/nexhub/services - List services (public: active only, admin: all)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status');

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        const isAdmin = user ? await checkIsAdmin(supabase, user.id) : false;

        let query = supabase
            .from('nexhub_services')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        // Apply status filter
        if (statusFilter && isAdmin) {
            query = query.eq('status', statusFilter);
        } else if (!isAdmin) {
            // Non-admin users can only see active services
            query = query.eq('status', 'active');
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching nexhub services:', error);
            return NextResponse.json(
                { error: 'Failed to fetch services' },
                { status: 500 }
            );
        }

        return NextResponse.json({ services: data }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/nexhub/services - Create service (admin only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication and admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = await checkIsAdmin(supabase, user.id);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        // Parse request body
        const body = await request.json();
        const { title, description, icon_url, price, status, display_order } = body;

        // Validation
        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            );
        }

        // Insert service
        const { data, error } = await (supabase
            .from('nexhub_services') as any)
            .insert({
                title,
                description,
                icon_url: icon_url || null,
                price: price || null,
                status: status || 'active',
                display_order: display_order || 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating service:', error);
            return NextResponse.json(
                { error: 'Failed to create service' },
                { status: 500 }
            );
        }

        return NextResponse.json({ service: data }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to check if user is admin
async function checkIsAdmin(supabase: any, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    return data?.role === 'admin';
}
