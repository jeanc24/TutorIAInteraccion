import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SignTutor — Aprende el abecedario en lengua de señas',
  description:
    'Plataforma educativa para aprender el abecedario en lengua de señas con retroalimentación en tiempo real mediante visión por computadora.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
