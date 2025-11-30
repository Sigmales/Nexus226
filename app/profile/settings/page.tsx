'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
    const { user, loading, refreshUserProfile } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Avatar State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Profile Info State
    const [bio, setBio] = useState('');
    const [title, setTitle] = useState('');
    const [socialLinks, setSocialLinks] = useState({
        twitter: '',
        github: '',
        linkedin: '',
        website: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Account Management State
    const [newEmail, setNewEmail] = useState('');
    const [changingEmail, setChangingEmail] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Load user data
    useEffect(() => {
        if (user) {
            setBio(user.bio || '');
            setTitle(user.title || '');
            setSocialLinks({
                twitter: user.social_links?.twitter || '',
                github: user.social_links?.github || '',
                linkedin: user.social_links?.linkedin || '',
                website: user.social_links?.website || ''
            });
            setNewEmail(user.email || '');
        }
    }, [user]);

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-images')
                .upload(fileName, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-images')
                .getPublicUrl(fileName);

            const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

            const { error: updateError } = await (supabase as any)
                .from('users')
                .update({ avatar_url: avatarUrlWithTimestamp })
                .eq('id', user.id);

            if (updateError) throw updateError;

            await refreshUserProfile();
            alert('✅ Avatar mis à jour avec succès !');
            setAvatarFile(null);
            setAvatarPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert(`❌ Erreur: ${error.message || 'Une erreur est survenue'}`);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSavingProfile(true);

        try {
            const { error } = await (supabase as any)
                .from('users')
                .update({
                    bio,
                    title,
                    social_links: socialLinks
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshUserProfile();
            alert('✅ Profil mis à jour avec succès !');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(`❌ Erreur: ${error.message}`);
        } finally {
            setSavingProfile(false);
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
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            alert('✅ Mot de passe changé avec succès !');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert(`❌ Erreur: ${error.message}`);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || newEmail === user.email) return;
        setChangingEmail(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;
            alert('✅ Un email de confirmation a été envoyé à votre nouvelle adresse.');
        } catch (error: any) {
            console.error('Error changing email:', error);
            alert(`❌ Erreur: ${error.message}`);
        } finally {
            setChangingEmail(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
        if (!confirm('⚠️ Vraiment sûr ? Toutes vos données seront perdues.')) return;

        setDeletingAccount(true);
        try {
            // Note: Usually requires a cloud function or admin rights to fully delete user from auth + db
            // Here we'll try calling the RPC or standard delete if enabled
            const { error } = await supabase.rpc('delete_user'); // Assuming an RPC exists or we use client delete if policy allows

            // Fallback if RPC doesn't exist: try deleting from public.users (trigger should handle auth)
            if (error) {
                const { error: dbError } = await (supabase as any).from('users').delete().eq('id', user?.id);
                if (dbError) throw dbError;
            }

            await supabase.auth.signOut();
            router.push('/');
        } catch (error: any) {
            console.error('Error deleting account:', error);
            alert('❌ Erreur lors de la suppression du compte. Contactez le support.');
        } finally {
            setDeletingAccount(false);
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
                <div className="container-nexus max-w-4xl space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-bg-card rounded-lg transition-colors">
                            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-display font-bold text-text-primary">Paramètres du Profil</h1>
                    </div>

                    {/* Avatar Section */}
                    <section className="neon-glow p-8">
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Photo de Profil</h2>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan overflow-hidden">
                                {avatarPreview || user.avatar_url ? (
                                    <img src={avatarPreview || user.avatar_url || ''} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-display font-bold text-bg-dark">{user.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/jpeg,image/png,image/webp" className="hidden" />
                                <div className="flex gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="neon-button-secondary">Choisir une image</button>
                                    {avatarFile && (
                                        <button onClick={handleAvatarUpload} disabled={uploadingAvatar} className="neon-button disabled:opacity-50">
                                            {uploadingAvatar ? 'Upload...' : 'Enregistrer'}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-text-muted mt-2">JPG, PNG ou WEBP. Max 2MB.</p>
                            </div>
                        </div>
                    </section>

                    {/* Public Info Section */}
                    <section className="neon-glow p-8">
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Informations Publiques</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Titre / Rôle</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="input-neon w-full"
                                    placeholder="Ex: Développeur Fullstack, Artiste 3D..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="input-neon w-full h-32 resize-none"
                                    placeholder="Parlez-nous un peu de vous..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Twitter / X</label>
                                    <input
                                        type="url"
                                        value={socialLinks.twitter}
                                        onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                        className="input-neon w-full"
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">GitHub</label>
                                    <input
                                        type="url"
                                        value={socialLinks.github}
                                        onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                                        className="input-neon w-full"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={socialLinks.linkedin}
                                        onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                        className="input-neon w-full"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Site Web</label>
                                    <input
                                        type="url"
                                        value={socialLinks.website}
                                        onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                                        className="input-neon w-full"
                                        placeholder="https://mon-site.com"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={savingProfile} className="neon-button disabled:opacity-50">
                                {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </form>
                    </section>

                    {/* Password Section */}
                    <section className="neon-glow p-8">
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Sécurité</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Nouveau Mot de Passe</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-neon w-full"
                                    placeholder="Minimum 6 caractères"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Confirmer le Mot de Passe</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-neon w-full"
                                    placeholder="Retapez le mot de passe"
                                />
                            </div>
                            <button type="submit" disabled={changingPassword || !newPassword} className="neon-button disabled:opacity-50">
                                {changingPassword ? 'Changement...' : 'Changer le Mot de Passe'}
                            </button>
                        </form>
                    </section>

                    {/* Account Management Section */}
                    <section className="neon-glow p-8 border border-red-500/30">
                        <h2 className="text-2xl font-display font-bold text-red-400 mb-6">Gestion du Compte</h2>

                        <div className="space-y-8">
                            <form onSubmit={handleEmailChange} className="max-w-md">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Adresse Email</label>
                                <div className="flex gap-4">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="input-neon w-full"
                                    />
                                    <button type="submit" disabled={changingEmail || newEmail === user.email} className="neon-button-secondary whitespace-nowrap disabled:opacity-50">
                                        {changingEmail ? '...' : 'Changer'}
                                    </button>
                                </div>
                            </form>

                            <div className="pt-6 border-t border-border-subtle">
                                <h3 className="text-lg font-bold text-red-400 mb-2">Zone de Danger</h3>
                                <p className="text-text-muted mb-4">La suppression de votre compte est définitive. Toutes vos données seront effacées.</p>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deletingAccount}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg transition-colors font-bold disabled:opacity-50"
                                >
                                    {deletingAccount ? 'Suppression...' : 'Supprimer mon compte'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
