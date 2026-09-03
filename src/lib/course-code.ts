export function normalizeCourseCode(value: string): string {
	return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function formatSection(section: number): string {
	return section.toString().padStart(5, "0");
}
