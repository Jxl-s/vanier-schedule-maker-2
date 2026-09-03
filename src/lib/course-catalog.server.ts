import dump from "../../dump-courses.json";
import { normalizeCourseCode } from "./course-code";
import type {
	CoursePeriod,
	CourseSection,
	CourseSuggestion,
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

function prepareCourse(rawCourse: RawCourse): CourseSection {
	const uniqueClasses = new Map<string, RawClass>();
	for (const classMeeting of rawCourse.classes) {
		const key = classMeeting.day + "-" + classMeeting.time;
		if (!uniqueClasses.has(key)) uniqueClasses.set(key, classMeeting);
	}

	const periods = Array.from(uniqueClasses.values())
		.map(parsePeriod)
		.filter((period): period is CoursePeriod => period !== null);

	return {
		title: rawCourse.title,
		section: Number.parseInt(rawCourse.section, 10) || 0,
		id: normalizeCourseCode(rawCourse.courseId),
		teacher:
			rawCourse.classes.find((classMeeting) => classMeeting.teacher)?.teacher ??
			"Teacher TBA",
		periods,
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
