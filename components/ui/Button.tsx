'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    loading = false,
    disabled,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variantClasses = {
        primary: 'neon-button',
        secondary: 'neon-button-secondary'
    };

    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            disabled={isDisabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}
