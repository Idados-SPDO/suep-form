import './index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Questionário – PPA (Pessoa Física)',
  description: 'Formulário PPA PF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
