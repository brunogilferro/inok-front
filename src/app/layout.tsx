import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from '@/components/I18nProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INOK Admin Panel - Sistema de Gestão",
  description: "Painel administrativo para o sistema INOK - Gestão de identidades, conversas, agentes e muito mais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                duration: 4000,
              }}
            />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
} 