import { describe, expect, it } from "vitest";
import type { CoursePeriod, CourseSection } from "@/types/schedule";
import { generateValidSchedules } from "./schedule";

function period(day: string, start: number, end: number): CoursePeriod {
	return {
		day,
		room: "A-101",
		start_hour: start,
		start_minute: 0,
		end_hour: end,
		end_minute: 0,
	};
}

function section(id: string, sectionNumber: number, periods: CoursePeriod[]): CourseSection {
	return {
		title: id,
		section: sectionNumber,
		teacher: "Teacher",
		id,
		periods,
	};
}

describe("schedule generation", () => {
	it("returns no schedules when no courses are selected", () => {
		expect(generateValidSchedules([], {})).toEqual({
			schedules: [],
			truncated: false,
		});
	});

	it("prunes sections with overlapping periods", () => {
		const catalog = {
			A: [section("A", 1, [period("Monday", 9, 10)])],
			B: [section("B", 1, [period("Monday", 9, 10)])],
		};

		const result = generateValidSchedules([
			{ course: "A", section: 1 },
			{ course: "B", section: 1 },
		], catalog);

		expect(result.schedules).toEqual([]);
		expect(result.truncated).toBe(false);
	});

	it("keeps non-conflicting try-all combinations", () => {
		const catalog = {
			A: [
				section("A", 1, [period("Monday", 9, 10)]),
				section("A", 2, [period("Tuesday", 9, 10)]),
			],
			B: [section("B", 1, [period("Monday", 9, 10)])],
		};

		const result = generateValidSchedules([
			{ course: "A", section: -1 },
			{ course: "B", section: 1 },
		], catalog);

		expect(result.schedules).toHaveLength(1);
		expect(result.schedules[0][0].section).toBe(2);
	});

	it("marks output when the configured limit is reached", () => {
		const catalog = {
			A: [section("A", 1, []), section("A", 2, [])],
			B: [section("B", 1, []), section("B", 2, [])],
		};

		const result = generateValidSchedules(
			[
				{ course: "A", section: -1 },
				{ course: "B", section: -1 },
			],
			catalog,
			1,
		);

		expect(result.schedules).toHaveLength(1);
		expect(result.truncated).toBe(true);
	});
});
