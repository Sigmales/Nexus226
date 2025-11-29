import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, name, description, parent_id, justification } = body;

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

        // Validation
        if (!type || !['category', 'subcategory'].includes(type)) {
            return NextResponse.json(
                { error: 'Type de proposition invalide.' },
                { status: 400 }
            );
        }

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Le nom est requis.' },
                { status: 400 }
            );
        }

        if (!justification || justification.trim().length < 30) {
            return NextResponse.json(
                { error: 'La justification doit contenir au moins 30 caractères.' },
                { status: 400 }
            );
        }

        if (type === 'subcategory' && !parent_id) {
            return NextResponse.json(
                { error: 'La catégorie parente est requise pour une sous-catégorie.' },
                { status: 400 }
            );
        }

        // Store the proposal in service_proposals table with a special marker
        // This is a temporary solution - ideally you'd create a dedicated category_proposals table
        const { error: insertError } = await (supabase as any)
            .from('service_proposals')
            .insert({
                user_id: user.id,
                service_id: null, // No service associated
                message: `[CATEGORY_PROPOSAL] ${JSON.stringify({
                    type,
                    name,
                    description: description || null,
                    parent_id: type === 'subcategory' ? parent_id : null,
                    justification,
                    submitted_at: new Date().toISOString(),
                })}`,
                status: 'pending',
            });

        if (insertError) {
            console.error('Error inserting category proposal:', insertError);
            console.error('Error details:', {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
            });

            // Return more specific error message
            let errorMessage = 'Erreur lors de la sauvegarde de la proposition.';
            if (insertError.code === '23502') {
                errorMessage = 'Champ obligatoire manquant dans la base de données.';
            } else if (insertError.code === '23503') {
                errorMessage = 'Référence invalide (vérifiez la catégorie parente).';
            } else if (insertError.message) {
                errorMessage = `Erreur: ${insertError.message}`;
            }

            return NextResponse.json(
                { error: errorMessage, details: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Votre proposition a été soumise avec succès.',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error in category proposal:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json(
            { error: 'Erreur serveur interne.', details: error.message },
            { status: 500 }
        );
    }
}
