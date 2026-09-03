import { beforeEach, describe, expect, it } from "vitest";
import {
	loadCatalog,
	loadSavedSchedules,
	loadSelections,
	STORAGE_KEYS,
} from "./storage";

class MemoryStorage {
	private values = new Map<string, string>();

	get length() {
		return this.values.size;
	}

	clear() {
		this.values.clear();
	}

	getItem(key: string) {
		return this.values.get(key) ?? null;
	}

	key(index: number) {
		return Array.from(this.values.keys())[index] ?? null;
	}

	removeItem(key: string) {
		this.values.delete(key);
	}

	setItem(key: string, value: string) {
		this.values.set(key, value);
	}
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "window", {
	configurable: true,
	value: { localStorage: storage },
});

describe("local storage parsing", () => {
	beforeEach(() => storage.clear());

	it("keeps valid selections and discards malformed entries", () => {
		storage.setItem(
			STORAGE_KEYS.selections,
			JSON.stringify([
				{ course: "420-101-VA", section: 1 },
				{ course: "", section: "bad" },
			]),
		);

		expect(loadSelections()).toEqual([{ course: "420-101-VA", section: 1 }]);
	});

	it("filters invalid catalog sections instead of trusting JSON", () => {
		storage.setItem(
			STORAGE_KEYS.catalog,
			JSON.stringify({
				"420-101-VA": [
					{
						title: "Programming 1",
						section: 1,
						teacher: "Teacher",
						id: "420-101-VA",
						periods: [],
					},
				],
				bad: [{ title: "missing fields" }],
			}),
		);

		expect(Object.keys(loadCatalog())).toEqual(["420-101-VA"]);
	});

	it("filters malformed saved schedules", () => {
		storage.setItem(
			STORAGE_KEYS.saved,
			JSON.stringify({
				Good: {
					courses: [{ course: "420-101-VA", section: 1 }],
					data: {},
				},
				Broken: { courses: "not-an-array", data: {} },
			}),
		);

		expect(Object.keys(loadSavedSchedules())).toEqual(["Good"]);
	});
});
