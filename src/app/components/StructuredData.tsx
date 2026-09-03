import { siteConfig } from "@/lib/site";

export default function StructuredData() {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		applicationCategory: "EducationalApplication",
		operatingSystem: "Any",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "CAD",
		},
		featureList: [
			"Course search and selection",
			"Automatic conflict detection",
			"Multiple schedule generation",
			"Visual schedule display",
			"Section comparison",
		],
		audience: {
			"@type": "EducationalAudience",
			educationalRole: "student",
		},
		provider: {
			"@type": "Person",
			name: "Independent Developer",
		},
		about: {
			"@type": "Thing",
			name: "Vanier College Course Scheduling",
			description: "Unofficial scheduling tool for Vanier College students",
		},
	};

	return (
		<script
			dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			type="application/ld+json"
		/>
	);
}
