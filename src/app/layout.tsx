import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: 'Vanier Schedule Builder',
  description: 'A schedule builder for Vanier College, with an interface like Omnivox',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
