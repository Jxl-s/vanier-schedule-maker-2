export const metadata = {
  title: 'Vanier course selector',
  description: 'A simple schedule maker for courses at Vanier College',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
