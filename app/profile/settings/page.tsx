'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
    const { user, loading, refreshUserProfile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file
            const maxSize = 2 * 1024 * 1024; // 2MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

            if (file.size > maxSize) {
                alert('Image trop grande (max 2MB)');
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                alert('Format non supporté (jpg, png, webp uniquement)');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile || !user) return;

        setUploadingAvatar(true);

        try {
            // Upload to storage
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-images')
                .upload(fileName, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL with cache-busting timestamp
            const { data: { publicUrl } } = supabase.storage
                .from('chat-images')
                .getPublicUrl(fileName);

            const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

            // Update user profile
            const { error: updateError } = await (supabase as any)
                .from('users')
                .update({ avatar_url: avatarUrlWithTimestamp })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Refresh user profile in context to update globally
            await refreshUserProfile();

            alert('✅ Avatar mis à jour avec succès !');
            setAvatarFile(null);
            setAvatarPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('❌ Erreur lors de la mise à jour de l\'avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setChangingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('✅ Mot de passe changé avec succès !');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert('❌ Erreur lors du changement de mot de passe');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-dark">
                <div className="w-12 h-12 border-4 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        router.push('/profile');
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header onLoginClick={() => { }} onSignupClick={() => { }} />

            <main className="flex-1 py-12 px-4">
                <div className="container-nexus max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-bg-card rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-display font-bold text-text-primary">
                            Paramètres du Profil
                        </h1>
                    </div>

                    {/* Avatar Section */}
                    <section className="neon-glow p-8 mb-8">
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                            Photo de Profil
                        </h2>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan overflow-hidden">
                                {avatarPreview || user.avatar_url ? (
                                    <img
                                        src={avatarPreview || user.avatar_url || ''}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-display font-bold text-bg-dark">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarSelect}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="neon-button-secondary"
                                    >
                                        Choisir une image
                                    </button>
                                    {avatarFile && (
                                        <button
                                            onClick={handleAvatarUpload}
                                            disabled={uploadingAvatar}
                                            className="neon-button disabled:opacity-50"
                                        >
                                            {uploadingAvatar ? 'Upload...' : 'Enregistrer'}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-text-muted mt-2">
                                    JPG, PNG ou WEBP. Max 2MB.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Password Section */}
                    <section className="neon-glow p-8">
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                            Changer le Mot de Passe
                        </h2>

                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Nouveau Mot de Passe
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-neon w-full"
                                    placeholder="Minimum 6 caractères"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Confirmer le Mot de Passe
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-neon w-full"
                                    placeholder="Retapez le mot de passe"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={changingPassword || !newPassword || !confirmPassword}
                                className="neon-button disabled:opacity-50"
                            >
                                {changingPassword ? 'Changement...' : 'Changer le Mot de Passe'}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
