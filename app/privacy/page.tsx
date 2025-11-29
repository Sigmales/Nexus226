'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import LoginModal from '@/components/auth/LoginModal';

export default function PrivacyPage() {
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
                            Politique de Confidentialité
                        </h1>

                        <div className="space-y-6 text-text-secondary">
                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    1. Introduction
                                </h2>
                                <p>
                                    Chez Nexus226, nous prenons la protection de vos données personnelles très au
                                    sérieux. Cette politique explique comment nous collectons, utilisons et protégeons
                                    vos informations.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    2. Données Collectées
                                </h2>
                                <p className="mb-3">
                                    Nous collectons les types de données suivants :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Données d'identification</strong> : Email, nom d'utilisateur</li>
                                    <li><strong>Données de contenu</strong> : Propositions de services, messages de chat</li>
                                    <li><strong>Données techniques</strong> : Adresse IP, type de navigateur, horodatage</li>
                                    <li><strong>Données d'utilisation</strong> : Pages visitées, actions effectuées</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    3. Utilisation des Données
                                </h2>
                                <p className="mb-3">
                                    Vos données sont utilisées pour :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Fournir et améliorer nos services</li>
                                    <li>Gérer votre compte utilisateur</li>
                                    <li>Modérer le contenu et prévenir les abus</li>
                                    <li>Communiquer avec vous concernant votre compte</li>
                                    <li>Analyser l'utilisation de la plateforme</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    4. Base Légale du Traitement
                                </h2>
                                <p className="mb-3">
                                    Nous traitons vos données sur les bases légales suivantes :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Consentement</strong> : Vous acceptez nos conditions lors de l'inscription</li>
                                    <li><strong>Exécution du contrat</strong> : Nécessaire pour fournir nos services</li>
                                    <li><strong>Intérêt légitime</strong> : Sécurité et amélioration de la plateforme</li>
                                    <li><strong>Obligation légale</strong> : Conformité aux lois applicables</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    5. Partage des Données
                                </h2>
                                <p className="mb-3">
                                    Nous ne vendons jamais vos données. Nous les partageons uniquement avec :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Supabase</strong> : Hébergement de la base de données</li>
                                    <li><strong>Vercel</strong> : Hébergement de l'application</li>
                                    <li><strong>Cloudflare</strong> : Protection anti-spam (Turnstile)</li>
                                    <li><strong>Upstash</strong> : Rate limiting (Redis)</li>
                                </ul>
                                <p className="mt-3">
                                    Ces prestataires sont conformes au RGPD et traitent vos données selon nos instructions.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    6. Sécurité des Données
                                </h2>
                                <p className="mb-3">
                                    Nous mettons en œuvre des mesures de sécurité robustes :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                                    <li>Authentification sécurisée via Supabase Auth</li>
                                    <li>Row Level Security (RLS) sur la base de données</li>
                                    <li>Protection anti-spam et rate limiting</li>
                                    <li>Logs d'audit pour les actions administratives</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    7. Conservation des Données
                                </h2>
                                <p>
                                    Nous conservons vos données tant que votre compte est actif. Après suppression de
                                    votre compte, vos données personnelles sont supprimées dans un délai de 30 jours,
                                    sauf obligation légale de conservation.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    8. Vos Droits
                                </h2>
                                <p className="mb-3">
                                    Conformément au RGPD, vous disposez des droits suivants :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Droit d'accès</strong> : Obtenir une copie de vos données</li>
                                    <li><strong>Droit de rectification</strong> : Corriger vos données inexactes</li>
                                    <li><strong>Droit à l'effacement</strong> : Supprimer vos données</li>
                                    <li><strong>Droit à la portabilité</strong> : Recevoir vos données dans un format structuré</li>
                                    <li><strong>Droit d'opposition</strong> : Vous opposer au traitement</li>
                                    <li><strong>Droit de limitation</strong> : Limiter le traitement de vos données</li>
                                </ul>
                                <p className="mt-3">
                                    Pour exercer ces droits, contactez-nous via notre système de support.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    9. Cookies et Technologies Similaires
                                </h2>
                                <p>
                                    Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme
                                    (authentification, préférences). Nous n'utilisons pas de cookies publicitaires ou
                                    de tracking tiers.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    10. Modifications de la Politique
                                </h2>
                                <p>
                                    Nous pouvons mettre à jour cette politique de confidentialité. Les modifications
                                    importantes vous seront notifiées par email ou via une notification sur la plateforme.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                                    11. Contact
                                </h2>
                                <p>
                                    Pour toute question concernant cette politique ou vos données personnelles,
                                    contactez notre délégué à la protection des données via notre système de support.
                                </p>
                            </section>

                            <div className="mt-8 pt-6 border-t border-border-subtle text-sm text-text-muted">
                                <p>Dernière mise à jour : 28 novembre 2025</p>
                                <p className="mt-2">Conformité RGPD (Règlement Général sur la Protection des Données)</p>
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
