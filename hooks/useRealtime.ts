'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
    channel: string;
    event: string;
    table?: string;
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
}

export function useRealtime({
    channel,
    event,
    table,
    onInsert,
    onUpdate,
    onDelete,
}: UseRealtimeOptions) {
    const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // Create channel
        const channelInstance = supabase.channel(channel);

        // Subscribe to database changes if table is provided
        if (table) {
            channelInstance.on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT' && onInsert) {
                        onInsert(payload.new);
                    } else if (payload.eventType === 'UPDATE' && onUpdate) {
                        onUpdate(payload.new);
                    } else if (payload.eventType === 'DELETE' && onDelete) {
                        onDelete(payload.old);
                    }
                }
            );
        }

        // Subscribe to broadcast events
        channelInstance.on('broadcast', { event }, (payload) => {
            if (onInsert) {
                onInsert(payload.payload);
            }
        });

        // Subscribe to the channel
        channelInstance.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log(`✅ Subscribed to channel: ${channel}`);
            }
        });

        setRealtimeChannel(channelInstance);

        // Cleanup on unmount
        return () => {
            channelInstance.unsubscribe();
            console.log(`🔌 Unsubscribed from channel: ${channel}`);
        };
    }, [channel, event, table]);

    return {
        channel: realtimeChannel,
        send: (payload: any) => {
            if (realtimeChannel) {
                realtimeChannel.send({
                    type: 'broadcast',
                    event,
                    payload,
                });
            }
        },
    };
}

/**
 * Hook specifically for chat messages in a category
 */
export function useCategoryChat(categoryId: string) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
          *,
          users:sender_id (id, username, role, created_at)
        `)
                .eq('category_id', categoryId)
                .order('created_at', { ascending: true })
                .limit(100);

            if (!error && data) {
                setMessages(data);
            }
            setLoading(false);
        };

        fetchMessages();
    }, [categoryId]);

    // Subscribe to new messages and updates
    useRealtime({
        channel: `chat:${categoryId}`,
        event: 'new_message',
        table: 'chat_messages',
        onInsert: async (newMessage) => {
            // Fetch user data for the new message
            const { data: userData } = await supabase
                .from('users')
                .select('id, username, role, created_at')
                .eq('id', newMessage.sender_id)
                .single();

            setMessages((prev) => [
                ...prev,
                {
                    ...newMessage,
                    users: userData,
                },
            ]);
        },
        onUpdate: (updatedMessage) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                )
            );
        },
        onDelete: (deletedMessage) => {
            setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
        },
    });

    // Upload image to Supabase Storage
    const uploadImage = async (file: File, userId: string) => {
        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            return { success: false, error: 'Image trop grande (max 5MB)' };
        }

        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Format non supporté (jpg, png, gif, webp uniquement)' };
        }

        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('chat-images')
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: 'Erreur lors de l\'upload' };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    };

    const sendMessage = async (message: string, userId: string, imageFile?: File) => {
        let imageUrl = null;

        // Upload image if provided
        if (imageFile) {
            const uploadResult = await uploadImage(imageFile, userId);
            if (!uploadResult.success) {
                return { success: false, error: uploadResult.error };
            }
            imageUrl = uploadResult.url;
        }

        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                category_id: categoryId,
                sender_id: userId,
                message: message || '',
                image_url: imageUrl,
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return { success: false, error };
        }

        return { success: true, data };
    };

    // Admin function: Delete any message
    const deleteMessage = async (messageId: string) => {
        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            console.error('Error deleting message:', error);
            return { success: false, error };
        }

        return { success: true };
    };

    // Admin function: Edit any message
    const editMessage = async (messageId: string, newMessage: string) => {
        const { error } = await (supabase
            .from('chat_messages') as any)
            .update({
                message: newMessage,
                edited_at: new Date().toISOString(),
            })
            .eq('id', messageId);

        if (error) {
            console.error('Error editing message:', error);
            return { success: false, error };
        }

        return { success: true };
    };

    return {
        messages,
        loading,
        sendMessage,
        deleteMessage,
        editMessage,
    };
}
