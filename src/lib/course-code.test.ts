import { describe, expect, it } from "vitest";
import { formatSection, normalizeCourseCode } from "./course-code";

describe("course code helpers", () => {
	it("normalizes whitespace and casing", () => {
		expect(normalizeCourseCode(" 420 - 101 - va ")).toBe("420-101-VA");
	});

	it("pads section numbers for display", () => {
		expect(formatSection(18)).toBe("00018");
		expect(formatSection(12345)).toBe("12345");
	});
});
