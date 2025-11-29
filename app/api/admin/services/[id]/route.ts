import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase-generated';

// GET: Fetch a single service for editing
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

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
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null, error: any };

        if (profileError || userProfile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        // Fetch service with proposer info
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select(`
                *,
                proposer:proposer_id (id, username),
                category:category_id (id, name)
            `)
            .eq('id', id)
            .single() as { data: any; error: any };

        if (serviceError || !service) {
            return NextResponse.json(
                { error: 'Service non trouvé.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ service }, { status: 200 });
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}

// PUT: Update a service
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { title, description, link, image_url, category_id, price, status } = body;

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
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null, error: any };

        if (profileError || userProfile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        // Prepare update data with partial updates support
        const updateData: Database['public']['Tables']['services']['Update'] = {
            updated_at: new Date().toISOString(),
        };

        // Validation and data population for partial updates
        if (title !== undefined) {
            if (!title || title.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Le titre est requis.' },
                    { status: 400 }
                );
            }
            updateData.title = title.trim();
        }

        if (description !== undefined) {
            if (!description || description.trim().length < 50) {
                return NextResponse.json(
                    { error: 'La description doit contenir au moins 50 caractères.' },
                    { status: 400 }
                );
            }
            updateData.description = description.trim();
        }

        if (link !== undefined) {
            if (link) {
                try {
                    new URL(link);
                } catch {
                    return NextResponse.json(
                        { error: 'Format d\'URL invalide.' },
                        { status: 400 }
                    );
                }
            }
            updateData.link = link || null;
        }

        if (image_url !== undefined) {
            if (image_url) {
                try {
                    new URL(image_url);
                } catch {
                    return NextResponse.json(
                        { error: 'Format d\'URL d\'image invalide.' },
                        { status: 400 }
                    );
                }
            }
            updateData.image_url = image_url || null;
        }

        if (category_id !== undefined) {
            updateData.category_id = category_id || null;
        }

        if (price !== undefined) {
            updateData.price = price ? parseFloat(price) : null;
        }

        // If status is being set to 'active', set user_id to admin and keep proposer_id
        if (status === 'active') {
            // Get the current service to preserve proposer_id
            const { data: currentService } = await supabase
                .from('services')
                .select('proposer_id')
                .eq('id', id)
                .single() as { data: any; error: any };

            updateData.status = 'active';
            updateData.user_id = user.id; // Admin who validates
            // proposer_id is preserved from the original service
        } else if (status) {
            updateData.status = status;
        }

        const { data: service, error: updateError } = await supabase
            .from('services')
            .update(updateData)
            .eq('id', id)
            .select()
            .single() as { data: any; error: any };

        if (updateError) {
            console.error('❌ Error updating service:', updateError);
            console.error('Update data:', updateData);
            console.error('Service ID:', id);
            return NextResponse.json(
                {
                    error: `Erreur lors de la mise à jour du service: ${updateError.message || 'Erreur inconnue'}`,
                    details: updateError
                },
                { status: 500 }
            );
        }

        if (!service) {
            console.error('❌ Service update returned no data');
            return NextResponse.json(
                { error: 'La mise à jour a échoué - aucune donnée retournée.' },
                { status: 500 }
            );
        }

        console.log('✅ Service updated successfully:', {
            id: service.id,
            status: service.status,
            title: service.title
        });

        // Log admin action
        await supabase.from('admin_logs').insert({
            admin_id: user.id,
            action: status === 'active' ? 'validate_service' : 'update_service',
            target_user_id: service.proposer_id || service.user_id,
            details: {
                service_id: id,
                service_title: service.title,
                action: status === 'active' ? 'validated' : 'updated',
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: status === 'active'
                    ? 'Service validé et publié avec succès.'
                    : 'Service modifié avec succès.',
                service,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a service permanently
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

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
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single() as { data: { role: string } | null, error: any };

        if (profileError || userProfile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Droits administrateur requis.' },
                { status: 403 }
            );
        }

        // Get service info before deletion for logging
        const { data: service, error: fetchError } = await supabase
            .from('services')
            .select('id, title, proposer_id, user_id, status')
            .eq('id', id)
            .single() as { data: any; error: any };

        if (fetchError) {
            console.error('❌ Error fetching service before deletion:', fetchError);
            return NextResponse.json(
                { error: 'Service introuvable.' },
                { status: 404 }
            );
        }

        console.log('🗑️ Attempting to delete service:', {
            id: service.id,
            title: service.title,
            status: service.status,
            proposer_id: service.proposer_id,
            user_id: service.user_id,
            admin_id: user.id
        });

        // Delete service
        const { error: deleteError } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('❌ Error deleting service:', deleteError);
            console.error('Service ID:', id);
            console.error('Admin ID:', user.id);
            return NextResponse.json(
                {
                    error: `Erreur lors de la suppression: ${deleteError.message || 'Erreur inconnue'}`,
                    details: deleteError
                },
                { status: 500 }
            );
        }

        console.log('✅ Service deleted successfully:', {
            id: service.id,
            title: service.title
        });

        // Log admin action
        if (service) {
            await supabase.from('admin_logs').insert({
                admin_id: user.id,
                action: 'delete_service',
                target_user_id: service.proposer_id || service.user_id,
                details: {
                    service_id: id,
                    service_title: service.title,
                    action: 'deleted_permanently',
                },
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Service supprimé définitivement avec succès.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}

