import type {
	CourseCatalog,
	CoursePeriod,
	CourseSection,
	CourseSelection,
	SavedSchedule,
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

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function isCoursePeriod(value: unknown): value is CoursePeriod {
	return (
		isObject(value) &&
		typeof value.day === "string" &&
		typeof value.room === "string" &&
		isFiniteNumber(value.start_hour) &&
		isFiniteNumber(value.start_minute) &&
		isFiniteNumber(value.end_hour) &&
		isFiniteNumber(value.end_minute)
	);
}

function isCourseSection(value: unknown): value is CourseSection {
	return (
		isObject(value) &&
		typeof value.title === "string" &&
		Number.isInteger(value.section) &&
		typeof value.teacher === "string" &&
		typeof value.id === "string" &&
		Array.isArray(value.periods) &&
		value.periods.every(isCoursePeriod)
	);
}

function isCourseSelection(value: unknown): value is CourseSelection {
	return (
		isObject(value) &&
		typeof value.course === "string" &&
		value.course.length > 0 &&
		Number.isInteger(value.section)
	);
}

function parseCatalog(value: unknown): CourseCatalog {
	if (!isObject(value)) return {};

	const catalog: CourseCatalog = {};
	for (const [courseCode, sections] of Object.entries(value)) {
		if (
			courseCode.length > 0 &&
			Array.isArray(sections) &&
			sections.every(isCourseSection)
		) {
			catalog[courseCode] = sections;
		}
	}

	return catalog;
}

function parseSelections(value: unknown): CourseSelection[] {
	return Array.isArray(value) ? value.filter(isCourseSelection) : [];
}

function parseSavedSchedule(value: unknown): SavedSchedule | null {
	if (!isObject(value) || !Array.isArray(value.courses)) return null;
	if (!value.courses.every(isCourseSelection) || !isObject(value.data)) {
		return null;
	}

	return {
		courses: value.courses,
		data: parseCatalog(value.data),
	};
}

export function loadCatalog(): CourseCatalog {
	return parseCatalog(readJson(STORAGE_KEYS.catalog));
}

export function loadSelections(): CourseSelection[] {
	return parseSelections(readJson(STORAGE_KEYS.selections));
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

export function saveCatalog(catalog: CourseCatalog): void {
	writeJson(STORAGE_KEYS.catalog, catalog);
}

export function saveSelections(selections: CourseSelection[]): void {
	writeJson(STORAGE_KEYS.selections, selections);
}

export function saveSavedSchedules(schedules: SavedScheduleCollection): void {
	writeJson(STORAGE_KEYS.saved, schedules);
}
