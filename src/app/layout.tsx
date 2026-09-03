import { Analytics } from "@vercel/analytics/react";
import StructuredData from "./components/StructuredData";

export const metadata = {
	metadataBase: new URL("https://vanier-schedule-maker-2.vercel.app"),
	title: "Vanier Schedule Builder",
	description:
		"Build and visualize your perfect Vanier College schedule with our free, unofficial schedule maker. Easy course planning with conflict detection and multiple schedule combinations.",
	keywords:
		"Vanier College, schedule builder, course planner, college schedule, schedule maker, Vanier courses, class schedule, academic planning",
	authors: [{ name: "Vanier Schedule Builder Team" }],
	creator: "Vanier Schedule Builder",
	publisher: "Vanier Schedule Builder",
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
		url: "https://vanier-schedule-maker-2.vercel.app",
		siteName: "Vanier Schedule Builder",
		title: "Vanier Schedule Builder",
		description:
			"Build and visualize your perfect Vanier College schedule with our free, unofficial schedule maker. Easy course planning with conflict detection.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Vanier Schedule Builder",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Vanier Schedule Builder",
		description:
			"Build and visualize your perfect Vanier College schedule with our free, unofficial schedule maker.",
		images: ["/og-image.png"],
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
				<link
					rel="canonical"
					href="https://vanier-schedule-maker-2.vercel.app"
				/>
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
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
