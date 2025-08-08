'use client';

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Vanier Schedule Builder",
    "description": "Build and visualize your perfect Vanier College schedule with our free schedule maker. Easy course planning with conflict detection and multiple schedule combinations.",
    "url": "https://vanier-schedule-maker-2.vercel.app",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CAD"
    },
    "featureList": [
      "Course search and selection",
      "Automatic conflict detection",
      "Multiple schedule generation",
      "Visual schedule display",
      "Section comparison"
    ],
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    },
    "provider": {
      "@type": "Person",
      "name": "Independent Developer"
    },
    "about": {
      "@type": "Thing",
      "name": "Vanier College Course Scheduling",
      "description": "Unofficial scheduling tool for Vanier College students"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
