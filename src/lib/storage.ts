import type {
	CourseCatalog,
	CourseSelection,
	SavedScheduleCollection,
} from "@/types/schedule";

export const STORAGE_KEYS = {
	catalog: "courseData",
	selections: "currentCourses",
	saved: "savedSchedules",
} as const;

function readJson(key: string): unknown {
	try {
		const value = window.localStorage.getItem(key);
		return value ? JSON.parse(value) : undefined;
	} catch {
		return undefined;
	}
}

function writeJson(key: string, value: unknown): void {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage can be unavailable or full. The in-memory builder still works.
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadCatalog(): CourseCatalog {
	const value = readJson(STORAGE_KEYS.catalog);
	return isObject(value) ? (value as CourseCatalog) : {};
}

export function loadSelections(): CourseSelection[] {
	const value = readJson(STORAGE_KEYS.selections);
	if (!Array.isArray(value)) return [];

	return value.filter(
		(item): item is CourseSelection =>
			isObject(item) &&
			typeof item.course === "string" &&
			typeof item.section === "number",
	);
}

export function loadSavedSchedules(): SavedScheduleCollection {
	const value = readJson(STORAGE_KEYS.saved);
	return isObject(value) ? (value as SavedScheduleCollection) : {};
}

export function saveCatalog(catalog: CourseCatalog): void {
	writeJson(STORAGE_KEYS.catalog, catalog);
}

export function saveSelections(selections: CourseSelection[]): void {
	writeJson(STORAGE_KEYS.selections, selections);
}

export function saveSavedSchedules(schedules: SavedScheduleCollection): void {
	writeJson(STORAGE_KEYS.saved, schedules);
}
