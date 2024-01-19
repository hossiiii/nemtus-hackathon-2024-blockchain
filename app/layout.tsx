import './globals.css';

export const metadata = {
  title: '個人間取引システム',
  description: '個人間で直接取引をするためのシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="jp">
      <body>{children}</body>
    </html>
  )
}
