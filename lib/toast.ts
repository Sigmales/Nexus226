'use client';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

class ToastManager {
    private container: HTMLDivElement | null = null;
    private toasts: Map<string, HTMLDivElement> = new Map();

    private ensureContainer() {
        if (typeof window === 'undefined') return;

        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(this.container);
        }
    }

    private show(message: string, type: ToastType, options: ToastOptions = {}) {
        if (typeof window === 'undefined') return;

        this.ensureContainer();
        if (!this.container) return;

        const id = `toast-${Date.now()}-${Math.random()}`;
        const duration = options.duration ?? 3000;

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `
            pointer-events-auto
            px-4 py-3 rounded-lg
            border backdrop-blur-sm
            transform transition-all duration-300
            translate-x-0 opacity-100
            max-w-md
            shadow-lg
            ${type === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' : ''}
            ${type === 'error' ? 'bg-red-500/20 border-red-500 text-red-400' : ''}
            ${type === 'info' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : ''}
            ${type === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : ''}
        `.trim().replace(/\s+/g, ' ');

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-lg font-bold">${icons[type]}</span>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;

        // Add to container
        this.container.appendChild(toast);
        this.toasts.set(id, toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto remove
        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    private remove(id: string) {
        const toast = this.toasts.get(id);
        if (!toast) return;

        // Animate out
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';

        setTimeout(() => {
            toast.remove();
            this.toasts.delete(id);
        }, 300);
    }

    success(message: string, options?: ToastOptions) {
        this.show(message, 'success', options);
    }

    error(message: string, options?: ToastOptions) {
        this.show(message, 'error', options);
    }

    info(message: string, options?: ToastOptions) {
        this.show(message, 'info', options);
    }

    warning(message: string, options?: ToastOptions) {
        this.show(message, 'warning', options);
    }
}

// Export singleton instance
export const toast = new ToastManager();
