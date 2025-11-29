'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import LoginModal from '@/components/auth/LoginModal';

export default function TermsPage() {
    const [showLoginModal, setShowLoginModal] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                onLoginClick={() => setShowLoginModal(true)}
                onSignupClick={() => setShowLoginModal(true)}
            />

            <main className="flex-1 py-16 px-4">
                <div className="container-nexus max-w-4xl">
                    <div className="neon-glow p-8">
                        <h1 className="text-4xl font-display font-bold text-neon-gold mb-8">
                            Conditions d'Utilisation
                        </h1>

                        <div className="space-y-6 text-text-secondary">
                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    1. Acceptation des Conditions
                                </h2>
                                <p>
                                    En accédant et en utilisant Nexus226, vous acceptez d'être lié par les présentes
                                    conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas
                                    utiliser notre plateforme.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    2. Description du Service
                                </h2>
                                <p>
                                    Nexus226 est une plateforme communautaire dédiée au partage et à la découverte de
                                    services d'intelligence artificielle. Nous facilitons la connexion entre les
                                    créateurs de services IA et les utilisateurs intéressés.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    3. Compte Utilisateur
                                </h2>
                                <p className="mb-3">
                                    Pour soumettre des propositions ou participer au chat, vous devez créer un compte.
                                    Vous êtes responsable de :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Maintenir la confidentialité de vos identifiants</li>
                                    <li>Toutes les activités effectuées sous votre compte</li>
                                    <li>Notifier immédiatement toute utilisation non autorisée</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    4. Soumission de Contenu
                                </h2>
                                <p className="mb-3">
                                    En soumettant du contenu (propositions de services, messages de chat), vous garantissez que :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Vous détenez tous les droits nécessaires sur le contenu</li>
                                    <li>Le contenu ne viole aucune loi ou droit de tiers</li>
                                    <li>Le contenu est exact et non trompeur</li>
                                    <li>Le contenu respecte nos règles de modération</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    5. Modération et Validation
                                </h2>
                                <p>
                                    Toutes les propositions de services sont soumises à validation par notre équipe
                                    d'administrateurs. Nous nous réservons le droit de refuser, modifier ou supprimer
                                    tout contenu à notre discrétion.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    6. Limites d'Utilisation
                                </h2>
                                <p className="mb-3">
                                    Pour garantir la qualité du service, nous appliquons les limites suivantes :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>5 propositions de services par heure</li>
                                    <li>10 messages de chat par minute</li>
                                    <li>Protection anti-spam via Captcha</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    7. Propriété Intellectuelle
                                </h2>
                                <p>
                                    Le design, le code source, et tous les éléments de la plateforme Nexus226 sont
                                    protégés par les droits d'auteur. Vous ne pouvez pas copier, modifier ou
                                    distribuer ces éléments sans autorisation écrite.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    8. Limitation de Responsabilité
                                </h2>
                                <p>
                                    Nexus226 est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas
                                    responsables des dommages directs, indirects ou consécutifs résultant de
                                    l'utilisation de notre plateforme.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    9. Modifications des Conditions
                                </h2>
                                <p>
                                    Nous nous réservons le droit de modifier ces conditions à tout moment. Les
                                    modifications seront effectives dès leur publication sur cette page.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    10. Contact
                                </h2>
                                <p>
                                    Pour toute question concernant ces conditions, veuillez nous contacter via notre
                                    système de support.
                                </p>
                            </section>

                            <div className="mt-8 pt-6 border-t border-border-subtle text-sm text-text-muted">
                                <p>Dernière mise à jour : 28 novembre 2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}
        </div>
    );
}
