import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Saku Santri — Sistem Penagihan SPP & Iuran Sekolah',
  description: 'Sistem Informasi Penagihan SPP Bulanan & Iuran Sekolah Terintegrasi. Cocok untuk pesantren dan sekolah swasta.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
