'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
}

declare global {
    interface Window {
        turnstile?: {
            render: (element: HTMLElement | string, options: any) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
            getResponse: (widgetId: string) => string;
        };
        onTurnstileLoad?: () => void;
    }
}

export default function TurnstileWidget({
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'dark',
    size = 'normal',
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load Turnstile script
        const loadTurnstile = () => {
            if (window.turnstile) {
                setIsLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                setIsLoaded(true);
            };

            document.body.appendChild(script);
        };

        loadTurnstile();
    }, []);

    useEffect(() => {
        if (!isLoaded || !containerRef.current || !window.turnstile) {
            return;
        }

        // Render Turnstile widget
        try {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme,
                size,
                callback: (token: string) => {
                    onVerify(token);
                },
                'error-callback': () => {
                    if (onError) onError();
                },
                'expired-callback': () => {
                    if (onExpire) onExpire();
                },
            });
        } catch (error) {
            console.error('Error rendering Turnstile widget:', error);
        }

        // Cleanup
        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (error) {
                    console.error('Error removing Turnstile widget:', error);
                }
            }
        };
    }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire]);

    return (
        <div className="flex justify-center">
            <div ref={containerRef} />
        </div>
    );
}
