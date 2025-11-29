import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Neon Dark Theme Colors
                'neon-gold': '#FFD700',
                'neon-cyan': '#00FFFF',
                'neon-magenta': '#FF00FF',
                'neon-purple': '#9D4EDD',
                'neon-blue': '#00D9FF',
                'bg-dark': '#0a0e27',
                'bg-darker': '#060913',
                'bg-card': '#0f1429',
                'text-primary': '#E0E7FF',
                'text-secondary': '#9CA3AF',
                'text-muted': '#6B7280',
                'border-neon': '#FFD700',
                'border-subtle': '#1f2937',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Orbitron', 'sans-serif'],
            },
            boxShadow: {
                'neon-gold': '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
                'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)',
                'neon-purple': '0 0 10px rgba(157, 78, 221, 0.5), 0 0 20px rgba(157, 78, 221, 0.3)',
                'neon-glow': '0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5)' },
                },
            },
        },
    },
    plugins: [],
}
export default config
