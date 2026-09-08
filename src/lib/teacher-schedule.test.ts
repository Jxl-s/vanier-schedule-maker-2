import { describe, expect, it } from "vitest";
import type { CourseSection } from "@/types/schedule";
import { getTeacherSections } from "./teacher-schedule";

const teamTaughtSection: CourseSection = {
	id: "101-101-VA",
	section: 1,
	title: "Team-taught course",
	teacher: "Alpha, Alice",
	periods: [
		{
			day: "Monday",
			room: "A-101",
			teachers: ["Alpha, Alice"],
			start_hour: 8,
			start_minute: 0,
			end_hour: 10,
			end_minute: 0,
		},
		{
			day: "Wednesday",
			room: "A-102",
			teachers: ["Alpha, Alice", "Beta, Bob"],
			start_hour: 10,
			start_minute: 0,
			end_hour: 12,
			end_minute: 0,
		},
	],
};

describe("teacher schedule filtering", () => {
	it("keeps only the selected teacher's periods in a team-taught section", () => {
		const [section] = getTeacherSections(
			[teamTaughtSection],
			"Beta, Bob",
			"Bob Beta",
		);

		expect(section.teacher).toBe("Bob Beta");
		expect(section.periods).toHaveLength(1);
		expect(section.periods[0]).toMatchObject({
			day: "Wednesday",
			teachers: ["Alpha, Alice", "Beta, Bob"],
		});
	});

	it("removes sections with no meetings for the selected teacher", () => {
		expect(
			getTeacherSections([teamTaughtSection], "Gamma, Grace", "Grace Gamma"),
		).toEqual([]);
	});
});
