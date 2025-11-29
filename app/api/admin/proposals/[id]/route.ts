import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const proposalId = params.id;
        const body = await request.json();
        const { proposalType, ...formData } = body;

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
            .single();

        if (!userData || userData.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        if (proposalType === 'service') {
            // Update service proposal
            const { error: updateError } = await (supabase as any)
                .from('services')
                .update({
                    title: formData.title,
                    description: formData.description,
                    link: formData.link || null,
                    category_id: formData.category_id || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', proposalId);

            if (updateError) {
                console.error('Error updating service:', updateError);
                return NextResponse.json(
                    { error: 'Erreur lors de la mise à jour du service.' },
                    { status: 500 }
                );
            }
        } else if (proposalType === 'category') {
            // Update category proposal (stored as JSON in message field)
            // First, get the current proposal
            const { data: currentProposal, error: fetchError } = await (supabase as any)
                .from('service_proposals')
                .select('message')
                .eq('id', proposalId)
                .single();

            if (fetchError || !currentProposal) {
                return NextResponse.json(
                    { error: 'Proposition introuvable.' },
                    { status: 404 }
                );
            }

            try {
                // Parse existing JSON
                const existingData = JSON.parse(
                    currentProposal.message.replace('[CATEGORY_PROPOSAL] ', '')
                );

                // Update only the editable fields
                const updatedData = {
                    ...existingData,
                    name: formData.title,
                    description: formData.description || null,
                    type: formData.type,
                    parent_id: formData.type === 'subcategory' ? formData.parent_id : null,
                    justification: formData.justification,
                    link: formData.link || null,
                    updated_at: new Date().toISOString(),
                };

                // Save back as JSON
                const { error: updateError } = await (supabase as any)
                    .from('service_proposals')
                    .update({
                        message: `[CATEGORY_PROPOSAL] ${JSON.stringify(updatedData)}`,
                    })
                    .eq('id', proposalId);

                if (updateError) {
                    console.error('Error updating category proposal:', updateError);
                    return NextResponse.json(
                        { error: 'Erreur lors de la mise à jour de la proposition.' },
                        { status: 500 }
                    );
                }
            } catch (parseError) {
                console.error('Error parsing category proposal JSON:', parseError);
                return NextResponse.json(
                    { error: 'Erreur lors du traitement de la proposition.' },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Type de proposition invalide.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Proposition mise à jour avec succès.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in proposal update:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a category proposal
export async function DELETE(
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
            .single();

        if (!userData || userData.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        // Get proposal info before deletion for logging
        const { data: proposal, error: fetchError } = await (supabase as any)
            .from('service_proposals')
            .select('id, message, user_id, status')
            .eq('id', proposalId)
            .single();

        if (fetchError || !proposal) {
            console.error('❌ Error fetching category proposal:', fetchError);
            return NextResponse.json(
                { error: 'Proposition introuvable.' },
                { status: 404 }
            );
        }

        console.log('🗑️ Attempting to delete category proposal:', {
            id: proposal.id,
            status: proposal.status,
            user_id: proposal.user_id,
            admin_id: user.id
        });

        // Delete the proposal
        const { error: deleteError } = await (supabase as any)
            .from('service_proposals')
            .delete()
            .eq('id', proposalId);

        if (deleteError) {
            console.error('❌ Error deleting category proposal:', deleteError);
            console.error('Proposal ID:', proposalId);
            console.error('Admin ID:', user.id);
            return NextResponse.json(
                {
                    error: `Erreur lors de la suppression: ${deleteError.message || 'Erreur inconnue'}`,
                    details: deleteError
                },
                { status: 500 }
            );
        }

        console.log('✅ Category proposal deleted successfully:', {
            id: proposal.id
        });

        // Log admin action
        await (supabase as any).from('admin_logs').insert({
            admin_id: user.id,
            action: 'delete_category_proposal',
            target_user_id: proposal.user_id,
            details: {
                proposal_id: proposalId,
                action: 'deleted_permanently',
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Proposition de catégorie supprimée avec succès.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting category proposal:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}
