'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCategoryChat } from '@/hooks/useRealtime';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessageWithAuthor } from '@/types/database';

interface RealtimeChatBoxProps {
    categoryId: string;
    categoryName: string;
}

export default function RealtimeChatBox({ categoryId, categoryName }: RealtimeChatBoxProps) {
    const { user } = useAuth();
    const { messages, loading, sendMessage, deleteMessage } = useCategoryChat(categoryId);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastSentTime = useRef<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cooldown timer
    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setTimeout(() => {
                setCooldownRemaining(cooldownRemaining - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownRemaining]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Vous devez être connecté pour envoyer des messages');
            return;
        }

        if (!inputMessage.trim() && !selectedImage) {
            return;
        }

        // Check cooldown (3 seconds)
        const now = Date.now();
        const timeSinceLastSent = now - lastSentTime.current;
        const cooldownMs = 3000;

        if (timeSinceLastSent < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - timeSinceLastSent) / 1000);
            setCooldownRemaining(remaining);
            return;
        }

        setIsSending(true);

        const { success, error } = await sendMessage(inputMessage, user.id, selectedImage || undefined);

        if (success) {
            setInputMessage('');
            clearImage();
            lastSentTime.current = now;
            setCooldownRemaining(3);
        } else {
            console.error('Full error object:', error);
            const errorMessage = typeof error === 'object' && error !== null && 'message' in error
                ? (error as any).message
                : typeof error === 'string'
                    ? error
                    : 'Erreur inconnue lors de l\'envoi';

            alert(`Erreur: ${errorMessage}`);
        }

        setIsSending(false);
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

        const { success } = await deleteMessage(messageId);
        if (!success) {
            alert('Erreur lors de la suppression du message');
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isAdmin = user?.role === 'admin';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="neon-glow flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-border-subtle">
                    <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-neon-cyan"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        Chat - {categoryName}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-text-secondary">
                                Aucun message pour le moment. Soyez le premier à discuter !
                            </p>
                        </div>
                    ) : (
                        messages.map((msg: ChatMessageWithAuthor) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Avatar - Left side (other users) */}
                                {msg.sender_id !== user?.id && (
                                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center overflow-hidden">
                                        {msg.users?.avatar_url ? (
                                            <img
                                                src={msg.users.avatar_url}
                                                alt={msg.users.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-display font-bold text-bg-dark">
                                                {msg.users?.username?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${msg.sender_id === user?.id
                                        ? 'bg-neon-gold/20 border border-neon-gold'
                                        : 'bg-bg-darker border border-border-subtle'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link
                                            href={`/profile/${msg.users?.username || 'unknown'}`}
                                            className={`text-sm font-semibold hover:underline cursor-pointer ${msg.users?.role === 'admin'
                                                ? 'text-neon-purple'
                                                : msg.sender_id === user?.id
                                                    ? 'text-neon-gold'
                                                    : 'text-neon-cyan'
                                                }`}
                                        >
                                            @{msg.users?.username || 'Utilisateur'}
                                        </Link>
                                        {msg.users?.role === 'admin' && (
                                            <span className="badge badge-admin text-xs py-0 px-1.5">
                                                Admin
                                            </span>
                                        )}
                                        <span className="text-xs text-text-muted">
                                            {formatTime(msg.created_at)}
                                        </span>
                                        {msg.edited_at && (
                                            <span className="text-xs text-text-muted italic">
                                                (modifié)
                                            </span>
                                        )}
                                        {(isAdmin || msg.sender_id === user?.id) && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                                                title={isAdmin ? "Supprimer (Admin)" : "Supprimer"}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {msg.message && (
                                        <p className="text-text-primary text-sm break-words">
                                            {msg.message}
                                        </p>
                                    )}
                                    {msg.image_url && (
                                        <img
                                            src={msg.image_url}
                                            alt="Image partagée"
                                            className="mt-2 rounded-lg max-w-xs max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setLightboxImage(msg.image_url)}
                                        />
                                    )}
                                </div>

                                {/* Avatar - Right side (current user) */}
                                {msg.sender_id === user?.id && (
                                    <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-display font-bold text-bg-dark">
                                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border-subtle">
                    {user ? (
                        <>
                            {imagePreview && (
                                <div className="mb-3 relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border border-neon-cyan" />
                                    <button
                                        onClick={clearImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSending || cooldownRemaining > 0}
                                    className="p-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
                                    title="Joindre une image"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    disabled={isSending || cooldownRemaining > 0}
                                    className="input-neon flex-1"
                                    maxLength={500}
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || cooldownRemaining > 0 || (!inputMessage.trim() && !selectedImage)}
                                    className="neon-button px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cooldownRemaining > 0 ? (
                                        <span className="flex items-center gap-2">
                                            <svg
                                                className="w-4 h-4 animate-spin"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            {cooldownRemaining}s
                                        </span>
                                    ) : isSending ? (
                                        'Envoi...'
                                    ) : (
                                        'Envoyer'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-text-secondary text-sm">
                                Connectez-vous pour participer au chat
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox for images */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <img
                        src={lightboxImage}
                        alt="Image agrandie"
                        className="max-w-full max-h-full rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}
