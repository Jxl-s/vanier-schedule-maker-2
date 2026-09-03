"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Code2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useScheduleStorage } from "@/hooks/use-schedule-storage";
import { normalizeCourseCode } from "@/lib/course-code";
import { generateValidSchedules } from "@/lib/schedule";
import { siteConfig } from "@/lib/site";
import type { CourseResponse, CourseSuggestion } from "@/types/schedule";
import CourseCard from "./CourseCard";
import CourseAutocomplete from "./CourseAutocomplete";
import SavedSchedules from "./SavedSchedules";
import ScheduleWorkspace from "./ScheduleWorkspace";
import ThemeToggle from "./ThemeToggle";
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

	useEffect(() => {
		setScheduleIndex((current) =>
			Math.max(0, Math.min(current, generation.schedules.length - 1)),
		);
	}, [generation.schedules.length]);

	async function handleAddCourse(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedCode = normalizeCourseCode(courseCode);

		if (!normalizedCode) {
			setStatus({ tone: "error", message: "Enter a course code." });
			return;
		}

		if (selections.some((selection) => selection.course === normalizedCode)) {
			setStatus({ tone: "error", message: normalizedCode + " is already added." });
			return;
		}

		setIsLoading(true);
		setStatus(null);

		try {
			let sections = catalog[normalizedCode];
			if (!sections) {
				const response = await fetch(
					"/api/courses/" + encodeURIComponent(normalizedCode),
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
		setScheduleIndex(0);
		setStatus(null);
	}

	function saveSchedule(name: string): string | null {
		if (selections.length === 0) return "Add at least one course first.";
		if (savedSchedules[name]) return "That name is already used.";

		const relevantCatalog = Object.fromEntries(
			selections.map((selection) => [
				selection.course,
				catalog[selection.course] ?? [],
			]),
		);
		setSavedSchedules((current) => ({
			...current,
			[name]: { courses: selections, data: relevantCatalog },
		}));
		return null;
	}

	function loadSchedule(name: string) {
		const saved = savedSchedules[name];
		if (!saved) return;
		setCatalog((current) => ({ ...current, ...saved.data }));
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

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="app-header bg-card">
				<div className="mx-auto flex max-w-[1440px] items-center justify-between px-3 py-3 sm:px-4">
					<div>
						<h1 className="text-base font-semibold">{siteConfig.name}</h1>
						<p className="text-xs text-muted-foreground">
							{siteConfig.shortDescription}
						</p>
					</div>
					<div className="flex items-center gap-1">
						<ThemeToggle />
						<Button asChild className="h-8 w-8" size="icon" variant="ghost">
							<a
								aria-label="View source on GitHub"
								href="https://github.com/Jxl-s/vanier-schedule-maker-2"
								rel="noreferrer"
								target="_blank"
							>
								<Code2 className="h-4 w-4" />
							</a>
						</Button>
					</div>
				</div>
			</header>

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
							<form className="flex gap-2" onSubmit={handleAddCourse}>
								<CourseAutocomplete
									courses={courseSuggestions}
									disabled={isLoading}
									onChange={setCourseCode}
									value={courseCode}
								/>
								<Button className="h-8 shrink-0 px-3" disabled={isLoading} size="sm" type="submit">
									{isLoading ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Plus className="h-3.5 w-3.5" />
									)}
									Add
								</Button>
							</form>

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

					<SavedSchedules
						names={Object.keys(savedSchedules)}
						onDelete={deleteSchedule}
						onLoad={loadSchedule}
						onSave={saveSchedule}
					/>
				</aside>

				<ScheduleWorkspace
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

				<div className="lg:col-start-1 lg:row-start-2">
					<UsefulLinks />
				</div>
			</div>

			<footer className="mx-auto max-w-[1440px] px-4 pb-4 text-xs text-muted-foreground">
				Always verify your final schedule with Vanier&apos;s official system.
			</footer>
		</div>
	);
}
