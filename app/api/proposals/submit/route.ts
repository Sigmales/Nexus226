import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { handleSupabaseError } from '@/lib/error';

export async function POST(request: NextRequest) {
    try {
        // Parse request body first
        const body = await request.json();
        const { service_id, message, category_id, title, description, url } = body;

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

        // Rate limiting: 5 proposals per hour per user
        const rateLimit = checkRateLimit(`proposals:${user.id}`, {
            maxRequests: 5,
            windowMs: 60 * 60 * 1000, // 1 hour
        });

        if (!rateLimit.allowed) {
            const resetIn = Math.ceil((rateLimit.resetTime - Date.now()) / 1000 / 60);
            return NextResponse.json(
                {
                    error: `Limite de propositions atteinte. Réessayez dans ${resetIn} minutes.`,
                    resetTime: rateLimit.resetTime,
                },
                { status: 429 }
            );
        }

        // Validation
        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Le titre est requis.' },
                { status: 400 }
            );
        }

        if (!message || message.trim().length < 50) {
            return NextResponse.json(
                { error: 'Le message doit contenir au moins 50 caractères.' },
                { status: 400 }
            );
        }

        if (url) {
            // Validate URL format
            try {
                new URL(url);
            } catch {
                return NextResponse.json(
                    { error: 'Format d\'URL invalide.' },
                    { status: 400 }
                );
            }
        }

        if (!description || description.trim().length < 50) {
            return NextResponse.json(
                { error: 'La description doit contenir au moins 50 caractères.' },
                { status: 400 }
            );
        }

        // Insert service with pending status (for admin moderation)
        // Note: The form provides title, description, url, category_id, and message
        const { data: service, error: insertError } = await supabase
            .from('services')
            .insert({
                user_id: user.id,
                proposer_id: user.id, // Set proposer_id to the submitting user
                category_id: category_id || null,
                title: title || null,
                description: description || null,
                link: url || null,
                price: null, // Price not provided in proposal form
                status: 'pending',
            } as any)
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting service:', insertError);
            const appError = handleSupabaseError(insertError);
            return NextResponse.json(
                { error: appError.message },
                { status: appError.type === 'duplicate' || appError.type === 'constraint' ? 409 : 500 }
            );
        }

        // Optionally, also create a service_proposal entry for the message/context
        // This allows tracking the proposal message separately if needed
        if (message && service) {
            await supabase
                .from('service_proposals')
                .insert({
                    service_id: (service as any).id,
                    user_id: user.id,
                    message,
                    status: 'pending',
                } as any);
        }

        return NextResponse.json(
            {
                success: true,
                service,
                remaining: rateLimit.remaining,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in proposal submission:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne.' },
            { status: 500 }
        );
    }
}
