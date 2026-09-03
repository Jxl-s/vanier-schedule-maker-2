export const COURSE_COLOR_COUNT = 8;

export function courseColorIndex(index: number): number {
	return index % COURSE_COLOR_COUNT;
}
