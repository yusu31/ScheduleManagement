import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { UserPreferenceProvider } from '@/contexts/UserPreferenceContext'
import ClientLayout from '@/components/layout/ClientLayout'
import ThemePickerModal from '@/components/theme/ThemePickerModal'
import ChatWidget from '@/components/chat/ChatWidget'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Roami',
  description: '福島のおでかけ・予定をまるっと管理。郡山・いわき・福島市など地域のイベントを検索・カレンダーで管理できます。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <UserPreferenceProvider>
            <FavoritesProvider>
              <ClientLayout>{children}</ClientLayout>
              <ThemePickerModal />
              <ChatWidget />
              <Toaster position="bottom-center" toastOptions={{ duration: 2000 }} />
            </FavoritesProvider>
            </UserPreferenceProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
