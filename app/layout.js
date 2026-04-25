import { Fredoka } from 'next/font/google'
import "./globals.css";

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
})

export const metadata = {
  title: "Mini Minds",
  description: "A calm, structured learning app for kids aged 3–7",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} h-full`} style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
