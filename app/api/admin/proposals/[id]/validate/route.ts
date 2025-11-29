import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const proposalId = params.id;

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

        // Verify admin role
        const { data: userData } = await (supabase as any)
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null, error: any };

        if (!userData || userData.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        // Fetch the proposal
        const { data: proposal, error: fetchError } = await (supabase as any)
            .from('service_proposals')
            .select('*')
            .eq('id', proposalId)
            .single();

        if (fetchError || !proposal) {
            return NextResponse.json(
                { error: 'Proposition introuvable.' },
                { status: 404 }
            );
        }

        // Parse proposal data
        let proposalData;
        try {
            proposalData = JSON.parse(proposal.message.replace('[CATEGORY_PROPOSAL] ', ''));
        } catch (e) {
            return NextResponse.json(
                { error: 'Données de proposition invalides.' },
                { status: 400 }
            );
        }

        // Create the category
        const { data: newCategory, error: createError } = await (supabase as any)
            .from('categories')
            .insert({
                name: proposalData.name,
                description: proposalData.description,
                parent_id: proposalData.parent_id || null,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating category:', createError);
            // Handle duplicate slug or other errors gracefully if possible
            return NextResponse.json(
                { error: `Erreur lors de la création de la catégorie: ${createError.message}` },
                { status: 500 }
            );
        }

        // Update proposal status
        const { error: updateError } = await (supabase as any)
            .from('service_proposals')
            .update({
                status: 'active',
                updated_at: new Date().toISOString(),
            })
            .eq('id', proposalId);

        if (updateError) {
            console.error('Error updating proposal status:', updateError);
            // We created the category but failed to update status - this is a partial failure
            // Ideally we would use a transaction but Supabase JS client doesn't support them easily yet
        }

        // Log admin action
        await supabase.from('admin_logs').insert({
            admin_id: user.id,
            action: 'validate_category_proposal',
            target_user_id: proposal.user_id,
            details: {
                proposal_id: proposalId,
                category_id: newCategory.id,
                category_name: newCategory.name,
            },
        } as any);

        return NextResponse.json(
            {
                success: true,
                message: 'Catégorie créée et proposition validée avec succès.',
                category: newCategory,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error validating category proposal:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}
