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
		maximumScale: 1,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link
					rel="canonical"
					href="https://vanier-schedule-maker-2.vercel.app"
				/>
				<meta name="theme-color" content="#18181b" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />
				<meta name="format-detection" content="telephone=no" />
			</head>
			<body>
				<header>
					<nav aria-label="Main navigation" className="sr-only">
						<h1>Vanier Schedule Builder</h1>
					</nav>
				</header>
				<main id="main-content">{children}</main>
				<StructuredData />
				<Analytics />
			</body>
		</html>
	);
}
