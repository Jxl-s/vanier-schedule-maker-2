import dump from "../../dump-courses.json";
import teacherRatings from "../../dump-teachers.json";
import { normalizeCourseCode } from "./course-code";
import type {
	CoursePeriod,
	CourseSection,
	CourseSuggestion,
	TeacherRating,
} from "@/types/schedule";

interface RawClass {
	teacher?: string;
	day: string;
	time: string;
	room?: string;
}

interface RawCourse {
	section: string;
	title: string;
	courseId: string;
	classes: RawClass[];
}

type RawCatalog = Record<string, RawCourse[]>;

function parsePeriod(rawPeriod: RawClass): CoursePeriod | null {
	const match = rawPeriod.time.match(
		/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/,
	);
	if (!match) return null;

	return {
		day: rawPeriod.day,
		room: rawPeriod.room || "Room TBA",
		teachers: rawPeriod.teacher ? [rawPeriod.teacher.trim()] : [],
		start_hour: Number(match[1]),
		start_minute: Number(match[2]),
		end_hour: Number(match[3]),
		end_minute: Number(match[4]),
	};
}

function normalizeTeacherName(name: string): string {
	const [lastName, firstNames] = name.split(",", 2).map((part) => part.trim());
	const orderedName = firstNames ? `${firstNames} ${lastName}` : name;
	return orderedName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function editDistance(left: string, right: string): number {
	const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
	for (let row = 1; row <= left.length; row += 1) {
		const current = [row];
		for (let column = 1; column <= right.length; column += 1) {
			current[column] = Math.min(
				current[column - 1] + 1,
				previous[column] + 1,
				previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
			);
		}
		for (let column = 0; column <= right.length; column += 1) previous[column] = current[column];
	}
	return previous[right.length];
}

function similarity(left: string, right: string): number {
	const max = Math.max(left.length, right.length);
	return max === 0 ? 1 : 1 - editDistance(left, right) / max;
}

function surnameCandidates(tokens: string[]): string[] {
	if (tokens.length === 0) return [];
	const last = tokens[tokens.length - 1];
	if (tokens.length < 2) return [last];
	return [last, tokens.slice(-2).join("")];
}

const SURNAME_THRESHOLD = 0.85;
const FIRST_NAME_THRESHOLD = 0.7;

function scoreTeacherMatch(
	realTokens: string[],
	rmpTokens: string[],
): number | null {
	if (realTokens.length === 0 || rmpTokens.length === 0) return null;

	const realSurnames = surnameCandidates(realTokens);
	const rmpSurnames = surnameCandidates(rmpTokens);
	let surnameSim = 0;
	for (const realSurname of realSurnames) {
		for (const rmpSurname of rmpSurnames) {
			surnameSim = Math.max(surnameSim, similarity(realSurname, rmpSurname));
		}
	}
	if (surnameSim < SURNAME_THRESHOLD) return null;

	let firstSim = similarity(realTokens[0], rmpTokens[0]);
	if (firstSim < FIRST_NAME_THRESHOLD) {
		const middleTokens = realTokens.slice(1, -1);
		if (!middleTokens.includes(rmpTokens[0])) return null;
		firstSim = FIRST_NAME_THRESHOLD;
	}

	return surnameSim * 0.6 + firstSim * 0.4;
}

function findTeacherRating(name: string): TeacherRating | null {
	const normalizedName = normalizeTeacherName(name);
	const ratingIndex = teacherRatings as Record<string, TeacherRating | null>;
	const exactMatch = ratingIndex[normalizedName];
	if (exactMatch) return { ...exactMatch, matchConfidence: 1 };

	const realTokens = normalizedName.split(" ").filter(Boolean);
	let best: { rating: TeacherRating; score: number } | null = null;
	for (const [candidate, rating] of Object.entries(ratingIndex)) {
		if (!rating) continue;
		const score = scoreTeacherMatch(
			realTokens,
			candidate.split(" ").filter(Boolean),
		);
		if (score === null) continue;
		if (!best || score > best.score) best = { rating, score };
	}
	return best ? { ...best.rating, matchConfidence: best.score } : null;
}

function prepareCourse(rawCourse: RawCourse): CourseSection {
	const uniquePeriods = new Map<string, CoursePeriod>();
	for (const classMeeting of rawCourse.classes) {
		const key = classMeeting.day + "-" + classMeeting.time;
		const existing = uniquePeriods.get(key);
		if (existing) {
			const teacher = classMeeting.teacher?.trim();
			if (teacher && !existing.teachers?.includes(teacher)) {
				existing.teachers = [...(existing.teachers ?? []), teacher];
			}
			continue;
		}

		const period = parsePeriod(classMeeting);
		if (period) uniquePeriods.set(key, period);
	}

	const periods = Array.from(uniquePeriods.values());
	const teacher =
		rawCourse.classes.find((classMeeting) => classMeeting.teacher)?.teacher ??
		"Teacher TBA";

	return {
		title: rawCourse.title,
		section: Number.parseInt(rawCourse.section, 10) || 0,
		id: normalizeCourseCode(rawCourse.courseId),
		teacher,
		periods,
		teacherRating: findTeacherRating(teacher),
	};
}

function createCourseIndex(catalog: RawCatalog): Map<string, CourseSection[]> {
	const index = new Map<string, CourseSection[]>();

	for (const department of Object.values(catalog)) {
		for (const rawCourse of department) {
			const code = normalizeCourseCode(rawCourse.courseId);
			const sections = index.get(code) ?? [];
			sections.push(prepareCourse(rawCourse));
			index.set(code, sections);
		}
	}

	Array.from(index.values()).forEach((sections) => {
		sections.sort((a: CourseSection, b: CourseSection) => a.section - b.section);
	});

	return index;
}

const courseIndex = createCourseIndex(dump as unknown as RawCatalog);

const courseSummaries: CourseSuggestion[] = Array.from(courseIndex.entries()).map(
	([id, sections]) => ({
		id,
		title: sections[0]?.title ?? "Untitled course",
		sections: sections.length,
	}),
);

export function getCourseCatalog(): CourseSuggestion[] {
	return [...courseSummaries];
}

export function getCourseSections(courseCode: string): CourseSection[] | undefined {
	return courseIndex.get(normalizeCourseCode(courseCode));
}
