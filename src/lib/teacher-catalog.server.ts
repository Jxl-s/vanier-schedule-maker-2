import teacherCourseDump from "../../dump-teacher-courses.json";
import { getCourseSections } from "./course-catalog.server";
import { getTeacherSections } from "./teacher-schedule";
import type {
	TeacherCourseIndexEntry,
	TeacherSchedule,
	TeacherSuggestion,
} from "@/types/schedule";

type TeacherCourseDump = Record<string, string[]>;

function normalizeSearchText(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

export function formatTeacherName(name: string): string {
	const [lastName, firstNames] = name.split(",", 2).map((part) => part.trim());
	return firstNames ? `${firstNames} ${lastName}` : name.trim();
}

const teacherCourses = teacherCourseDump as TeacherCourseDump;
const teacherIndex: TeacherCourseIndexEntry[] = Object.entries(teacherCourses).map(
	([id, courses]) => ({ id, name: formatTeacherName(id), courses }),
);
const teachersById = new Map(teacherIndex.map((teacher) => [teacher.id, teacher]));
const teacherSearchIndex = teacherIndex.map((teacher) => ({
	...teacher,
	searchText: normalizeSearchText(`${teacher.name} ${teacher.id}`),
}));

export function getTeacherCount(): number {
	return teacherIndex.length;
}

export function searchTeachers(query: string, limit = 8): TeacherSuggestion[] {
	const normalizedQuery = normalizeSearchText(query);
	if (!normalizedQuery) return [];

	const queryTokens = normalizedQuery.split(" ");
	return teacherSearchIndex
		.filter((teacher) =>
			queryTokens.every((token) => teacher.searchText.includes(token)),
		)
		.sort((left, right) => {
			const leftStarts = left.searchText.startsWith(normalizedQuery) ? 0 : 1;
			const rightStarts = right.searchText.startsWith(normalizedQuery) ? 0 : 1;
			return leftStarts - rightStarts || left.name.localeCompare(right.name);
		})
		.slice(0, limit)
		.map(({ id, name, courses }) => ({ id, name, courses: courses.length }));
}

export function getTeacherCourses(
	id: string,
): TeacherCourseIndexEntry | undefined {
	return teachersById.get(id.trim());
}

export function getTeacherSchedule(id: string): TeacherSchedule | undefined {
	const teacher = getTeacherCourses(id);
	if (!teacher) return undefined;

	const sections = teacher.courses
		.flatMap((courseId) =>
			getTeacherSections(
				getCourseSections(courseId) ?? [],
				teacher.id,
				teacher.name,
			),
		)
		.sort(
			(left, right) =>
				left.id.localeCompare(right.id) || left.section - right.section,
		);

	return { id: teacher.id, name: teacher.name, sections };
}
