import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import StructuredData from "./components/StructuredData";

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: siteConfig.name,
	description: siteConfig.description,
	keywords:
		"Vanier College, schedule builder, course planner, college schedule, schedule maker, Vanier courses, class schedule, academic planning",
	authors: [{ name: siteConfig.name }],
	creator: siteConfig.name,
	publisher: siteConfig.name,
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "en_CA",
		url: siteConfig.url,
		siteName: siteConfig.name,
		title: siteConfig.name,
		description: siteConfig.description,
	},
	twitter: {
		card: "summary",
		title: siteConfig.name,
		description: siteConfig.description,
	},
	viewport: {
		width: "device-width",
		initialScale: 1,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html:
							'try{const t=localStorage.getItem("theme");const d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}',
					}}
				/>
				<link rel="canonical" href={siteConfig.url} />
				<meta
					name="theme-color"
					content="#f8fafc"
					media="(prefers-color-scheme: light)"
				/>
				<meta
					name="theme-color"
					content="#18181b"
					media="(prefers-color-scheme: dark)"
				/>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="manifest" href="/manifest.json" />
				<meta name="format-detection" content="telephone=no" />
			</head>
			<body>
				<main id="main-content">{children}</main>
				<StructuredData />
				<Analytics />
			</body>
		</html>
	);
}
