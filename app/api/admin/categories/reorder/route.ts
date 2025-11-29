import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PUT /api/admin/categories/reorder
 * 
 * Reorder root categories by updating their display_order
 * Admin-only endpoint
 */
export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non autorisé. Veuillez vous connecter.' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || !userData || userData.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { ordered_ids } = body;

        // Validation
        if (!ordered_ids || !Array.isArray(ordered_ids) || ordered_ids.length === 0) {
            return NextResponse.json(
                { error: 'Le tableau ordered_ids est requis et ne peut pas être vide.' },
                { status: 400 }
            );
        }

        // Verify all IDs are valid UUIDs and exist as root categories
        const { data: existingCategories, error: fetchError } = await supabase
            .from('categories')
            .select('id')
            .in('id', ordered_ids)
            .is('parent_id', null);

        if (fetchError) {
            console.error('Error fetching categories:', fetchError);
            return NextResponse.json(
                { error: 'Erreur lors de la vérification des catégories.' },
                { status: 500 }
            );
        }

        if (!existingCategories || existingCategories.length !== ordered_ids.length) {
            return NextResponse.json(
                { error: 'Certains IDs de catégories sont invalides ou ne sont pas des catégories racines.' },
                { status: 400 }
            );
        }

        // Update display_order for each category
        // Use a transaction-like approach by updating all at once
        let updateCount = 0;
        const updatePromises = ordered_ids.map((categoryId, index) => {
            return supabase
                .from('categories')
                .update({ display_order: index + 1 })
                .eq('id', categoryId)
                .then(({ error }) => {
                    if (!error) updateCount++;
                    return { error };
                });
        });

        const results = await Promise.all(updatePromises);
        const errors = results.filter(r => r.error);

        if (errors.length > 0) {
            console.error('Errors updating categories:', errors);
            return NextResponse.json(
                {
                    error: 'Erreur lors de la mise à jour de certaines catégories.',
                    updated: updateCount,
                    failed: errors.length
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                updated: updateCount,
                message: `${updateCount} catégories réorganisées avec succès.`
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in category reorder:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}
