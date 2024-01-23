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
    <html lang="en">
      {/* headタグとその中にアイコンやテーマカラー、manifestを記述する */}
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png"></link>
        <meta name="theme-color" content="#b8e986" />
      </head>
      <body>{children}</body>
    </html>
  )
}
