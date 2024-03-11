import './globals.css';

export const metadata = {
  title: 'BRIDGE PAY',
  description: 'ブロックチェーンを活用した個人間で直接取引をするためのアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      {/* headタグとその中にアイコンやテーマカラー、manifestを記述する */}
      <head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/icon.png'></link>
        <meta name='theme-color' content='#b8e986' />
      </head>
      <body>{children}</body>
    </html>
  );
}
