/**
 * Dashboard Layout - Interne tool ALLEEN voor localhost
 * 
 * GEBLOKKEERD IN PRODUCTIE - Dit is een interne lead generation tool
 * en mag niet toegankelijk zijn voor websitebezoekers.
 */

import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lead Dashboard | Ro-Tech Internal',
  description: 'Interne lead management dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

// Check of we op localhost draaien
async function isLocalhost(): Promise<boolean> {
  // In development mode altijd toestaan
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check host header
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const localhostPatterns = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
  ];
  
  return localhostPatterns.some(pattern => host.includes(pattern));
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Blokkeer toegang in productie
  const isLocal = await isLocalhost();
  
  if (!isLocal) {
    // Toon 404 pagina - alsof de route niet bestaat
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
