import type {
	CourseCatalog,
	CoursePeriod,
	CourseSection,
	CourseSelection,
} from "@/types/schedule";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export const SCHEDULE_START_MINUTES = 8 * 60;
export const SCHEDULE_END_MINUTES = 18 * 60;
export const SLOT_MINUTES = 30;
export const MAX_GENERATED_SCHEDULES = 2_000;

const DAY_INDEX: Record<string, number> = {
	mon: 0,
	monday: 0,
	tue: 1,
	tues: 1,
	tuesday: 1,
	wed: 2,
	wednesday: 2,
	thu: 3,
	thur: 3,
	thurs: 3,
	thursday: 3,
	fri: 4,
	friday: 4,
};

export function dayToIndex(day: string): number {
	return DAY_INDEX[day.trim().toLowerCase()] ?? -1;
}

export function timeToMinutes(hours: number, minutes: number): number {
	return hours * 60 + minutes;
}

export function formatTime(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

interface OccupiedPeriod {
	day: number;
	start: number;
	end: number;
}

function toOccupiedPeriod(period: CoursePeriod): OccupiedPeriod | null {
	const day = dayToIndex(period.day);
	if (day < 0) return null;

	return {
		day,
		start: timeToMinutes(period.start_hour, period.start_minute),
		end: timeToMinutes(period.end_hour, period.end_minute),
	};
}

function hasConflict(candidate: CourseSection, occupied: OccupiedPeriod[]): boolean {
	return candidate.periods.some((period) => {
		const next = toOccupiedPeriod(period);
		if (!next) return false;

		return occupied.some(
			(current) =>
				current.day === next.day &&
				next.start < current.end &&
				next.end > current.start,
		);
	});
}

function getOptions(
	selection: CourseSelection,
	catalog: CourseCatalog,
): CourseSection[] {
	const sections = catalog[selection.course] ?? [];
	if (selection.section === -1) return sections;

	return sections.filter((section) => section.section === selection.section);
}

export interface ScheduleGenerationResult {
	schedules: CourseSection[][];
	truncated: boolean;
}

/**
 * Builds schedules with early conflict pruning. This avoids first allocating the
 * complete Cartesian product, which grows very quickly when "Try all" is used.
 */
export function generateValidSchedules(
	selections: CourseSelection[],
	catalog: CourseCatalog,
	limit = MAX_GENERATED_SCHEDULES,
): ScheduleGenerationResult {
	if (selections.length === 0) return { schedules: [], truncated: false };

	const options = selections.map((selection) => getOptions(selection, catalog));
	if (options.some((sections) => sections.length === 0)) {
		return { schedules: [], truncated: false };
	}

	const schedules: CourseSection[][] = [];
	let truncated = false;

	function visit(
		courseIndex: number,
		current: CourseSection[],
		occupied: OccupiedPeriod[],
	): void {
		if (schedules.length >= limit) {
			truncated = true;
			return;
		}

		if (courseIndex === options.length) {
			schedules.push([...current]);
			return;
		}

		for (const section of options[courseIndex]) {
			if (hasConflict(section, occupied)) continue;

			const nextPeriods = section.periods
				.map(toOccupiedPeriod)
				.filter((period): period is OccupiedPeriod => period !== null);

			current.push(section);
			visit(courseIndex + 1, current, [...occupied, ...nextPeriods]);
			current.pop();

			if (truncated) return;
		}
	}

	visit(0, [], []);
	return { schedules, truncated };
}
