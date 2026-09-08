"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useScheduleStorage } from "@/hooks/use-schedule-storage";
import { normalizeCourseCode } from "@/lib/course-code";
import { courseColorIndex } from "@/lib/course-colors";
import { generateValidSchedules } from "@/lib/schedule";
import type { CourseResponse, CourseSuggestion } from "@/types/schedule";
import AppHeader from "./AppHeader";
import CourseCard from "./CourseCard";
import CourseAutocomplete from "./CourseAutocomplete";
import SavedSchedules from "./SavedSchedules";
import ScheduleWorkspace from "./ScheduleWorkspace";
import UsefulLinks from "./UsefulLinks";

type Status = {
	tone: "error" | "success";
	message: string;
} | null;

interface ScheduleBuilderProps {
	courseSuggestions: CourseSuggestion[];
}

export default function ScheduleBuilder({
	courseSuggestions,
}: ScheduleBuilderProps) {
	const {
		catalog,
		setCatalog,
		selections,
		setSelections,
		savedSchedules,
		setSavedSchedules,
		isHydrated,
	} = useScheduleStorage();
	const [courseCode, setCourseCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<Status>(null);
	const [scheduleIndex, setScheduleIndex] = useState(0);

	const generation = useMemo(
		() => generateValidSchedules(selections, catalog),
		[selections, catalog],
	);
	const currentSchedule = generation.schedules[scheduleIndex] ?? [];
	const courseColors = useMemo(
		() =>
			Object.fromEntries(
				selections.map((selection, index) => [selection.course, courseColorIndex(index)]),
			),
		[selections],
	);

	useEffect(() => {
		setScheduleIndex((current) =>
			Math.max(0, Math.min(current, generation.schedules.length - 1)),
		);
	}, [generation.schedules.length]);

	useEffect(() => {
		if (!isHydrated) return;
		const missing = selections
			.map((selection) => selection.course)
			.filter((course) => !catalog[course]);
		if (missing.length === 0) return;

		let cancelled = false;
		Promise.all(
			missing.map(async (course) => {
				try {
					const response = await fetch(
						"/api/courses/" + encodeURIComponent(course),
						{ cache: "no-store" },
					);
					const result = (await response.json()) as CourseResponse;
					if (!response.ok || result.data.length === 0) return null;
					return [course, result.data] as const;
				} catch {
					return null;
				}
			}),
		).then((results) => {
			if (cancelled) return;
			const fetched = results.filter(
				(entry): entry is readonly [string, CourseResponse["data"]] => entry !== null,
			);
			if (fetched.length === 0) return;
			setCatalog((current) => {
				const next = { ...current };
				for (const [code, sections] of fetched) next[code] = sections;
				return next;
			});
		});

		return () => {
			cancelled = true;
		};
	}, [isHydrated, selections, catalog, setCatalog]);

	async function addCourse(code: string) {
		const normalizedCode = normalizeCourseCode(code);
		if (!normalizedCode) return;

		if (selections.some((selection) => selection.course === normalizedCode)) {
			setStatus({ tone: "error", message: normalizedCode + " is already added." });
			setCourseCode("");
			return;
		}

		setIsLoading(true);
		setStatus(null);

		try {
			let sections = catalog[normalizedCode];
			if (!sections) {
				const response = await fetch(
					"/api/courses/" + encodeURIComponent(normalizedCode),
					{ cache: "no-store" },
				);
				const result = (await response.json()) as CourseResponse;
				if (!response.ok || result.data.length === 0) {
					throw new Error(result.message ?? "Course not found.");
				}
				sections = result.data;
				setCatalog((current) => ({ ...current, [normalizedCode]: sections }));
			}

			setSelections((current) => [
				...current,
				{ course: normalizedCode, section: sections[0].section },
			]);
			setCourseCode("");
			setScheduleIndex(0);
			setStatus({ tone: "success", message: normalizedCode + " added." });
		} catch (error) {
			setStatus({
				tone: "error",
				message: error instanceof Error ? error.message : "Unable to load course.",
			});
		} finally {
			setIsLoading(false);
		}
	}

	function updateSection(course: string, section: number) {
		setSelections((current) =>
			current.map((selection) =>
				selection.course === course ? { ...selection, section } : selection,
			),
		);
		setScheduleIndex(0);
	}

	function removeCourse(course: string) {
		setSelections((current) =>
			current.filter((selection) => selection.course !== course),
		);
		setCatalog((current) => {
			const next = { ...current };
			delete next[course];
			return next;
		});
		setScheduleIndex(0);
		setStatus(null);
	}

	function saveSchedule(name: string): string | null {
		if (selections.length === 0) return "Add at least one course first.";
		if (savedSchedules[name]) return "That name is already used.";

		setSavedSchedules((current) => ({
			...current,
			[name]: { courses: selections },
		}));
		return null;
	}

	function loadSchedule(name: string) {
		const saved = savedSchedules[name];
		if (!saved) return;
		setSelections(saved.courses);
		setScheduleIndex(0);
		setStatus({ tone: "success", message: name + " loaded." });
	}

	function deleteSchedule(name: string) {
		setSavedSchedules((current) => {
			const next = { ...current };
			delete next[name];
			return next;
		});
	}

	function renameSchedule(name: string, nextName: string): string | null {
		if (savedSchedules[nextName]) return "That name is already used.";
		const saved = savedSchedules[name];
		if (!saved) return "Saved schedule not found.";

		setSavedSchedules((current) => {
			const next = { ...current };
			delete next[name];
			next[nextName] = saved;
			return next;
		});
		return null;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppHeader page="builder" />

			<div className="mx-auto grid max-w-[1440px] items-start gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[340px_minmax(0,1fr)]">
				<aside className="space-y-3">
					<Card className="overflow-visible">
						<CardHeader className="flex-row items-center justify-between space-y-0 rounded-t-lg bg-muted/45 p-3">
							<CardTitle className="text-sm">Course Selector</CardTitle>
							<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary dark:bg-primary/20">
								{selections.length} selected
							</span>
						</CardHeader>
						<CardContent className="p-3">
							<div className="relative flex gap-2">
								<CourseAutocomplete
									courses={courseSuggestions}
									disabled={isLoading}
									onChange={setCourseCode}
									onSelect={(course) => addCourse(course.id)}
									value={courseCode}
								/>
								{isLoading ? (
									<Loader2 className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
								) : null}
							</div>

							{status ? (
								<p
									aria-live="polite"
									className={
										"mt-2 text-xs " +
										(status.tone === "error"
											? "text-destructive"
											: "text-emerald-700 dark:text-emerald-400")
									}
								>
									{status.message}
								</p>
							) : null}

							<div className="mt-3 space-y-2">
								{selections.length === 0 ? (
									<p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
										Add a course code to begin.
									</p>
								) : (
									selections.map((selection) => (
							<CourseCard
								activeSection={
									currentSchedule.find(
										(section) => section.id === selection.course,
									) ?? null
								}
								colorIndex={courseColors[selection.course] ?? 0}
											key={selection.course}
											onRemove={() => removeCourse(selection.course)}
											onSectionChange={(section) =>
												updateSection(selection.course, section)
											}
											sections={catalog[selection.course] ?? []}
											selection={selection}
										/>
									))
								)}
							</div>

							<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								<span>
									{generation.schedules.length}
									{generation.truncated ? "+" : ""} possible schedule(s)
								</span>
							</div>
						</CardContent>
					</Card>

					<div className="hidden lg:block">
						<SavedSchedules
							names={Object.keys(savedSchedules)}
							onDelete={deleteSchedule}
							onLoad={loadSchedule}
							onRename={renameSchedule}
							onSave={saveSchedule}
						/>
					</div>
					<div className="hidden lg:block">
						<UsefulLinks />
						<p className="mt-2 px-1 text-xs text-muted-foreground">
							Always verify your final schedule with Vanier&apos;s official system.
						</p>
					</div>
				</aside>

				<ScheduleWorkspace
					courseColors={courseColors}
					currentIndex={scheduleIndex}
					onNext={() =>
						setScheduleIndex((current) =>
							Math.min(generation.schedules.length - 1, current + 1),
						)
					}
					onPrevious={() =>
						setScheduleIndex((current) => Math.max(0, current - 1))
					}
					schedule={currentSchedule}
					total={generation.schedules.length}
					truncated={generation.truncated}
				/>

				<div className="lg:hidden">
					<SavedSchedules
						names={Object.keys(savedSchedules)}
						onDelete={deleteSchedule}
						onLoad={loadSchedule}
						onRename={renameSchedule}
						onSave={saveSchedule}
					/>
				</div>

				<div className="lg:hidden">
					<UsefulLinks />
					<p className="mt-2 px-1 text-xs text-muted-foreground">
						Always verify your final schedule with Vanier&apos;s official system.
					</p>
				</div>
			</div>
		</div>
	);
}
