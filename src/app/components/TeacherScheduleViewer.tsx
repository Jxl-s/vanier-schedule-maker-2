"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, UserRound } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatSection } from "@/lib/course-code";
import { courseColorIndex } from "@/lib/course-colors";
import { formatTime, timeToMinutes } from "@/lib/schedule";
import type {
	CourseSection,
	TeacherScheduleResponse,
	TeacherSuggestion,
} from "@/types/schedule";
import AppHeader from "./AppHeader";
import Schedule from "./Schedule";
import TeacherAutocomplete from "./TeacherAutocomplete";

interface TeacherScheduleViewerProps {
	teacherCount: number;
}

export default function TeacherScheduleViewer({
	teacherCount,
}: TeacherScheduleViewerProps) {
	const [query, setQuery] = useState("");
	const [selectedTeacher, setSelectedTeacher] =
		useState<TeacherSuggestion | null>(null);
	const [sections, setSections] = useState<CourseSection[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!selectedTeacher) return;
		const teacher = selectedTeacher;

		const controller = new AbortController();
		setIsLoading(true);
		setError(null);
		setSections([]);

		async function loadTeacherSchedule() {
			try {
				const response = await fetch(
					`/api/teachers/${encodeURIComponent(teacher.id)}`,
					{ signal: controller.signal },
				);
				const result = (await response.json()) as TeacherScheduleResponse;
				if (!response.ok || !result.data) {
					throw new Error(
						result.message ?? "Unable to load this teacher's schedule.",
					);
				}
				setSections(result.data.sections);
			} catch (loadError) {
				if (!(loadError instanceof DOMException && loadError.name === "AbortError")) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load this teacher's schedule.",
					);
				}
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		loadTeacherSchedule();
		return () => controller.abort();
	}, [selectedTeacher]);

	const courseColors = useMemo(() => {
		const courseIds = Array.from(new Set(sections.map((section) => section.id)));
		return Object.fromEntries(
			courseIds.map((courseId, index) => [courseId, courseColorIndex(index)]),
		);
	}, [sections]);
	const meetingCount = sections.reduce(
		(total, section) => total + section.periods.length,
		0,
	);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppHeader page="teachers" />

			<div className="mx-auto grid max-w-[1440px] items-start gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[340px_minmax(0,1fr)]">
				<aside className="space-y-3">
					<Card className="overflow-visible">
						<CardHeader className="flex-row items-center justify-between space-y-0 rounded-t-lg bg-muted/45 p-3">
							<CardTitle className="text-sm">Teacher Lookup</CardTitle>
							<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary dark:bg-primary/20">
								{teacherCount} teachers
							</span>
						</CardHeader>
						<CardContent className="p-3">
							<TeacherAutocomplete
								onChange={setQuery}
								onSelect={(teacher) => {
									setQuery(teacher.name);
									setSelectedTeacher(teacher);
								}}
								value={query}
							/>
							<p className="mt-2 text-xs text-muted-foreground">
								Search by first or last name, then select a teacher to view their
								 current assignments.
							</p>
							{error ? (
								<p aria-live="polite" className="mt-2 text-xs text-destructive">
									{error}
								</p>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="p-3 pb-2">
							<CardTitle className="text-sm">Read-only schedule</CardTitle>
						</CardHeader>
						<CardContent className="p-3 pt-0 text-xs text-muted-foreground">
							This view is generated from the latest course dump. Course sections
							 cannot be changed here.
						</CardContent>
					</Card>
				</aside>

				<Card className="min-w-0 overflow-hidden">
					<CardHeader className="flex-row items-center justify-between space-y-0 bg-muted/45 p-3">
						<div className="min-w-0">
							<CardTitle className="truncate text-sm">
								{selectedTeacher?.name ?? "Teacher Schedule"}
							</CardTitle>
							<p className="mt-0.5 text-xs text-muted-foreground">
								{selectedTeacher && !isLoading && !error
									? `${sections.length} section${sections.length === 1 ? "" : "s"} · ${meetingCount} meeting${meetingCount === 1 ? "" : "s"}`
									: "Select a teacher to view their schedule"}
							</p>
						</div>
					</CardHeader>

					{isLoading ? (
						<div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading schedule...
						</div>
					) : sections.length > 0 ? (
						<>
							<CardContent className="p-0">
								<div className="schedule-surface p-2">
									<Schedule courseColors={courseColors} data={sections} />
								</div>
							</CardContent>
							<div className="border-t bg-muted/30 p-3">
								<h2 className="mb-2 text-xs font-semibold">Teaching assignments</h2>
								<div className="space-y-2">
									{sections.map((course) => (
										<div
											className="rounded-md bg-background/70 p-2 text-xs"
											key={`${course.id}-${course.section}`}
										>
											<p className="flex items-center gap-1.5 font-medium">
												<span
													aria-hidden="true"
													className={`course-color-indicator course-color-${courseColors[course.id] ?? 0}`}
												/>
												{course.id} - {formatSection(course.section)} - {course.title}
											</p>
											<p className="mt-1 text-muted-foreground">
												{course.periods.map((period) =>
													`${period.day} ${formatTime(timeToMinutes(period.start_hour, period.start_minute))}–${formatTime(timeToMinutes(period.end_hour, period.end_minute))} · ${period.room}`,
												).join(" · ")}
											</p>
										</div>
									))}
								</div>
							</div>
						</>
					) : (
						<div className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center text-muted-foreground">
							{selectedTeacher ? (
								<UserRound className="mb-3 h-8 w-8" />
							) : (
								<Search className="mb-3 h-8 w-8" />
							)}
							<p className="text-sm font-medium text-foreground">
								{selectedTeacher ? "No scheduled meetings found" : "Find a teacher"}
							</p>
							<p className="mt-1 max-w-sm text-xs">
								{selectedTeacher
									? "Their indexed courses do not contain any matching meeting periods."
									: "Use the teacher lookup to load a read-only weekly schedule."}
							</p>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
