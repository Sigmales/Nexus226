import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase-generated';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null };

    if (userProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { userId, badgeId } = await request.json();

        if (!userId || !badgeId) {
            return NextResponse.json({ error: 'Missing userId or badgeId' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_badges')
            .insert({ user_id: userId, badge_id: badgeId } as any)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'User already has this badge' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error assigning badge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null };

    if (userProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const badgeId = searchParams.get('badgeId');

        if (!userId || !badgeId) {
            return NextResponse.json({ error: 'Missing userId or badgeId' }, { status: 400 });
        }

        const { error } = await supabase
            .from('user_badges')
            .delete()
            .match({ user_id: userId, badge_id: badgeId });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error revoking badge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
