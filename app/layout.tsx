import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import '@/styles/globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const orbitron = Orbitron({
    subsets: ['latin'],
    variable: '--font-orbitron',
})

export const metadata: Metadata = {
    title: 'Nexus226 - Plateforme de Services IA',
    description: 'Découvrez et proposez des services IA innovants sur Nexus226',
    keywords: ['IA', 'Intelligence Artificielle', 'Services', 'Marketplace'],
    icons: {
        icon: '/icon.png?v=2',
        shortcut: '/icon.png?v=2',
        apple: '/icon.png?v=2',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className={`${inter.variable} ${orbitron.variable}`}>
            <body className="min-h-screen">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
