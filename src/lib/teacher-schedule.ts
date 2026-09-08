import type { CourseSection } from "@/types/schedule";

export function getTeacherSections(
	sections: CourseSection[],
	teacherId: string,
	teacherName: string,
): CourseSection[] {
	return sections.flatMap((section) => {
		const periodsWithTeacher = section.periods.filter(
			(period) => (period.teachers?.length ?? 0) > 0,
		);
		const matchingPeriods = section.periods.filter(
			(period) => period.teachers?.some((teacher) => teacher.trim() === teacherId),
		);
		const periods =
			periodsWithTeacher.length === 0 && section.teacher.trim() === teacherId
				? section.periods
				: matchingPeriods;

		return periods.length > 0
			? [{ ...section, teacher: teacherName, periods }]
			: [];
	});
}
