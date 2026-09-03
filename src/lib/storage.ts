import type {
	CourseSelection,
	SavedSchedule,
	SavedScheduleCollection,
} from "@/types/schedule";

export const STORAGE_KEYS = {
	selections: "currentCourses",
	saved: "savedSchedules",
	legacyCatalog: "courseData",
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

function isCourseSelection(value: unknown): value is CourseSelection {
	return (
		isObject(value) &&
		typeof value.course === "string" &&
		value.course.length > 0 &&
		Number.isInteger(value.section)
	);
}

function parseSavedSchedule(value: unknown): SavedSchedule | null {
	if (!isObject(value) || !Array.isArray(value.courses)) return null;
	if (!value.courses.every(isCourseSelection)) return null;
	return { courses: value.courses };
}

export function loadSelections(): CourseSelection[] {
	const value = readJson(STORAGE_KEYS.selections);
	return Array.isArray(value) ? value.filter(isCourseSelection) : [];
}

export function loadSavedSchedules(): SavedScheduleCollection {
	const value = readJson(STORAGE_KEYS.saved);
	if (!isObject(value)) return {};

	const schedules: SavedScheduleCollection = {};
	for (const [name, savedValue] of Object.entries(value)) {
		const schedule = parseSavedSchedule(savedValue);
		if (name.length > 0 && schedule) schedules[name] = schedule;
	}

	return schedules;
}

export function saveSelections(selections: CourseSelection[]): void {
	writeJson(STORAGE_KEYS.selections, selections);
}

export function saveSavedSchedules(schedules: SavedScheduleCollection): void {
	writeJson(STORAGE_KEYS.saved, schedules);
}

export function purgeLegacyCatalog(): void {
	try {
		window.localStorage.removeItem(STORAGE_KEYS.legacyCatalog);
	} catch {
		// ignore
	}
}
