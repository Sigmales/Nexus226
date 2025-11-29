import React from 'react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark px-4">
            <div className="text-center">
                <div className="text-9xl font-display font-bold text-neon-gold mb-4">
                    404
                </div>
                <h1 className="text-4xl font-display font-bold text-text-primary mb-4">
                    Page Non Trouvée
                </h1>
                <p className="text-xl text-text-secondary mb-8 max-w-md mx-auto">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <a
                    href="/"
                    className="neon-button inline-block px-8 py-3"
                >
                    Retour à l'Accueil
                </a>
            </div>
        </div>
    );
}
