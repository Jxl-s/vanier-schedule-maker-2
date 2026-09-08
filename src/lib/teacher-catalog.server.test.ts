import { describe, expect, it } from "vitest";
import {
	formatTeacherName,
	getTeacherCount,
	getTeacherCourses,
	searchTeachers,
} from "./teacher-catalog.server";

describe("teacher catalog", () => {
	it("loads the generated teacher index", () => {
		expect(getTeacherCount()).toBeGreaterThan(0);
	});

	it("searches teachers in either first-name or last-name order", () => {
		const [teacher] = searchTeachers("James Bland");

		expect(teacher).toMatchObject({
			id: "Bland, James",
			name: "James Bland",
		});
	});

	it("returns only the course IDs stored for a teacher", () => {
		const teacher = getTeacherCourses("Bland, James");

		expect(teacher?.courses.length).toBeGreaterThan(0);
		expect(teacher?.courses.every((course) => typeof course === "string")).toBe(true);
	});

	it("formats source names for display", () => {
		expect(formatTeacherName("Bland, James")).toBe("James Bland");
	});
});
