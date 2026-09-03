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

function findTeacherRating(name: string): TeacherRating | null {
	const normalizedName = normalizeTeacherName(name);
	const ratingIndex = teacherRatings as Record<string, TeacherRating | null>;
	const exactMatch = ratingIndex[normalizedName];
	if (exactMatch) return exactMatch;

	const candidates = Object.entries(ratingIndex)
		.map(([candidate, rating]) => ({
			candidate,
			rating,
			similarity:
				1 - editDistance(normalizedName, candidate) /
					Math.max(normalizedName.length, candidate.length),
		}))
		.filter(({ similarity, rating }) => rating && similarity >= 0.92)
		.sort((left, right) => right.similarity - left.similarity);

	return candidates.length === 1 || candidates[0]?.similarity > (candidates[1]?.similarity ?? 0) + 0.04
		? candidates[0]?.rating ?? null
		: null;
}

function prepareCourse(rawCourse: RawCourse): CourseSection {
	const uniqueClasses = new Map<string, RawClass>();
	for (const classMeeting of rawCourse.classes) {
		const key = classMeeting.day + "-" + classMeeting.time;
		if (!uniqueClasses.has(key)) uniqueClasses.set(key, classMeeting);
	}

	const periods = Array.from(uniqueClasses.values())
		.map(parsePeriod)
		.filter((period): period is CoursePeriod => period !== null);
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
