import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SHIP//PROOF | Release Verification Engine',
  description: 'Deterministic release verification via Sanity Content Lake and policy evaluation',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body>{children}</body>
    </html>
  )
}
