import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/nexhub/services/[id] - Update service (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Build update object (only include provided fields)
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (icon_url !== undefined) updateData.icon_url = icon_url;
        if (price !== undefined) updateData.price = price;
        if (status !== undefined) updateData.status = status;
        if (display_order !== undefined) updateData.display_order = display_order;

        // Update service
        const { data, error } = await supabase
            .from('nexhub_services')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating service:', error);
            return NextResponse.json(
                { error: 'Failed to update service' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({ service: data }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/nexhub/services/[id] - Delete service (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Delete service
        const { error } = await supabase
            .from('nexhub_services')
            .delete()
            .eq('id', params.id);

        if (error) {
            console.error('Error deleting service:', error);
            return NextResponse.json(
                { error: 'Failed to delete service' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });
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
