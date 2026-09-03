import { describe, expect, it } from "vitest";
import { getCourseCatalog, getCourseSections } from "./course-catalog.server";

describe("course catalog", () => {
	it("normalizes course lookup and returns prepared sections", () => {
		const sections = getCourseSections(" 420-101-va ");

		expect(sections).toBeDefined();
		expect(sections?.length).toBeGreaterThan(0);
		expect(sections?.[0]).toMatchObject({ id: "420-101-VA" });
		expect(sections?.[0].periods.length).toBeGreaterThan(0);
	});

	it("exposes lightweight summaries for client-side search", () => {
		const catalog = getCourseCatalog();
		const programming = catalog.find((course) => course.id === "420-101-VA");

		expect(catalog.length).toBeGreaterThan(100);
		expect(programming).toMatchObject({
			id: "420-101-VA",
			title: "Programming 1",
		});
		expect(programming?.sections).toBeGreaterThan(0);
	});
});
