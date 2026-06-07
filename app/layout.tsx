import ConvexClientProvider from '@/components/providers/ConvexClientProvider';
import { OrgBootstrap } from '@/components/providers/OrgBootstrap';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { UserBootstrap } from '@/components/providers/UserBootstrap';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ClerkProvider } from '@clerk/nextjs';
import { ui } from '@clerk/ui';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SuryaERP',
  description: 'PM Surya Ghar solar dealership ERP/CRM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider ui={ui}>
          <ConvexClientProvider>
            <UserBootstrap />
            <OrgBootstrap />
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
