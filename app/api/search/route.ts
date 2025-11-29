import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ services: [] });
        }

        const supabase = await createClient();

        // Search in services with subcategory support
        // Using ILIKE for case-insensitive search in title and description
        const { data: services, error } = await supabase
            .from('services')
            .select(`
                *,
                users:user_id (id, username, role, created_at),
                categories:category_id (*)
            `)
            .eq('status', 'active')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Search error:', error);
            return NextResponse.json(
                { error: 'Erreur lors de la recherche' },
                { status: 500 }
            );
        }

        return NextResponse.json({ services: services || [] });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
