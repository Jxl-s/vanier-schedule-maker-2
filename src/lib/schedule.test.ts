import { describe, expect, it } from "vitest";
import type { CoursePeriod, CourseSection } from "@/types/schedule";
import {
	DAYS,
	WEEKDAYS,
	dayToIndex,
	generateValidSchedules,
	getScheduleDays,
	getScheduleEndMinutes,
} from "./schedule";

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

	it("detects conflicts between weekend periods", () => {
		const catalog = {
			A: [section("A", 1, [period("Saturday", 9, 10)])],
			B: [section("B", 1, [period("Sat", 9, 10)])],
		};

		const result = generateValidSchedules([
			{ course: "A", section: 1 },
			{ course: "B", section: 1 },
		], catalog);

		expect(result.schedules).toEqual([]);
	});
});

describe("schedule layout", () => {
	it("shows weekdays and ends at 18:00 by default", () => {
		const data = [section("A", 1, [period("Monday", 9, 10)])];

		expect(getScheduleDays(data)).toEqual(WEEKDAYS);
		expect(getScheduleEndMinutes(data)).toBe(18 * 60);
	});

	it("shows both weekend columns when a weekend period is present", () => {
		const data = [section("A", 1, [period("Saturday", 9, 10)])];

		expect(getScheduleDays(data)).toEqual(DAYS);
		expect(dayToIndex("Saturday")).toBe(5);
		expect(dayToIndex("Sun")).toBe(6);
	});

	it("extends to the latest course end time after 18:00", () => {
		const data = [
			section("A", 1, [period("Monday", 18, 20)]),
			section("B", 1, [period("Tuesday", 19, 21)]),
		];

		expect(getScheduleEndMinutes(data)).toBe(21 * 60);
	});
});
