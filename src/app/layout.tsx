import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';

import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: 'Canaán Conecta',
  description: 'Portal institucional para colegio, alumnos y docentes del Centro Educativo Cristiano Canaán.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PY" className={`${manrope.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
