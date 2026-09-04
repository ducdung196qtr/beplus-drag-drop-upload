import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Upload Files to Project Alpha - Drag & Drop UI',
  description: 'Modal file upload with Drag and Drop, progress tracking, validation, and previews (MemberFun Challenge #65)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
