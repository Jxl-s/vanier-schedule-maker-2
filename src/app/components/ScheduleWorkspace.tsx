import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatSection } from "@/lib/course-code";
import type { CourseSection } from "@/types/schedule";
import Schedule from "./Schedule";

interface ScheduleWorkspaceProps {
	courseColors: Record<string, number>;
	currentIndex: number;
	onNext: () => void;
	onPrevious: () => void;
	schedule: CourseSection[];
	total: number;
	truncated: boolean;
}

export default function ScheduleWorkspace({
	courseColors,
	currentIndex,
	onNext,
	onPrevious,
	schedule,
	total,
	truncated,
}: ScheduleWorkspaceProps) {
	const hasSchedules = total > 0;

	return (
		<Card className="min-w-0 overflow-hidden">
			<CardHeader className="flex-row items-center justify-between space-y-0 bg-muted/45 p-3">
				<div>
					<CardTitle className="text-sm">Schedule Visualizer</CardTitle>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{hasSchedules
							? "Schedule " +
								(currentIndex + 1) +
								" of " +
								total +
								(truncated ? "+" : "")
							: "Add a course to begin"}
					</p>
				</div>
				<div className="flex gap-1">
					<Button
						aria-label="Previous schedule"
						className="h-8 w-8"
						disabled={!hasSchedules || currentIndex === 0}
						onClick={onPrevious}
						size="icon"
						variant="secondary"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						aria-label="Next schedule"
						className="h-8 w-8"
						disabled={!hasSchedules || currentIndex >= total - 1}
						onClick={onNext}
						size="icon"
						variant="secondary"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="schedule-surface p-2">
					<Schedule courseColors={courseColors} data={schedule} />
				</div>

				{hasSchedules ? (
					<div className="space-y-0.5 bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
						{schedule.map((course) => (
							<p className="flex items-center gap-1.5" key={course.id}>
								<span aria-hidden="true" className={`course-color-indicator course-color-${courseColors[course.id] ?? 0}`} />
								{course.id} - {formatSection(course.section)} - {course.title}
							</p>
						))}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
