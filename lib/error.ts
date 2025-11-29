export type ErrorType = 'duplicate' | 'constraint' | 'auth' | 'unknown';

export interface AppError {
    type: ErrorType;
    message: string;
    originalError?: any;
}

export function handleSupabaseError(error: any): AppError {
    // Code 23505: Unique violation
    if (error?.code === '23505') {
        return {
            type: 'duplicate',
            message: 'Cette entrée existe déjà.',
            originalError: error
        };
    }

    // Code 23503: Foreign key violation
    if (error?.code === '23503') {
        return {
            type: 'constraint',
            message: 'Opération impossible car liée à d\'autres données.',
            originalError: error
        };
    }

    return {
        type: 'unknown',
        message: error?.message || 'Une erreur inattendue est survenue.',
        originalError: error
    };
}
