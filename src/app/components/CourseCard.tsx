import { ExternalLink, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatSection } from "@/lib/course-code";
import type { CourseSection, CourseSelection } from "@/types/schedule";

interface CourseCardProps {
	colorIndex: number;
	selection: CourseSelection;
	sections: CourseSection[];
	onRemove: () => void;
	onSectionChange: (section: number) => void;
}

export default function CourseCard({
	colorIndex,
	selection,
	sections,
	onRemove,
	onSectionChange,
}: CourseCardProps) {
	const selectedSection =
		sections.find((section) => section.section === selection.section) ??
		sections[0];
	const teacherRating = selectedSection?.teacherRating;
	const displayRating =
		teacherRating?.rating != null && (teacherRating.reviewCount ?? 0) > 0
			? teacherRating
			: null;

	return (
		<div className={`course-option course-color-${colorIndex} rounded-md p-3`}>
			<div className="mb-2 flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="flex items-center gap-1.5 font-mono text-xs font-semibold">
						<span aria-hidden="true" className={`course-color-indicator course-color-${colorIndex}`} />
						{selection.course}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{selectedSection?.title ?? "Course title unavailable"}
					</p>
					{selectedSection?.teacher ? (
						<div className="mt-1 flex items-center gap-1.5 text-[11px]">
							{displayRating ? (
								<span className="teacher-rating-badge" title="RateMyProfessors rating">
									<Star className="h-3 w-3 fill-current" />
									<span>{displayRating.rating!.toFixed(1)}</span>
									{displayRating.reviewCount != null ? (
										<span className="opacity-75">({displayRating.reviewCount})</span>
									) : null}
								</span>
							) : null}
							{displayRating ? (
								<a
									className="inline-flex min-w-0 items-center gap-0.5 text-primary hover:underline"
									href={displayRating.profileUrl ?? "https://www.ratemyprofessors.com/"}
									rel="noreferrer"
									target="_blank"
								>
									<span className="truncate">View professor ratings</span>
									<ExternalLink className="h-3 w-3 shrink-0" />
								</a>
							) : null}
						</div>
					) : null}
				</div>
				<Button
					aria-label={"Remove " + selection.course}
					className="h-7 w-7 text-muted-foreground hover:text-destructive"
					onClick={onRemove}
					size="icon"
					variant="ghost"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>

			<Select
				onValueChange={(value) => onSectionChange(Number(value))}
				value={String(selection.section)}
			>
				<SelectTrigger
					aria-label={"Section for " + selection.course}
					className="h-8 bg-background/80 text-xs shadow-inner"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{sections.map((section) => (
						<SelectItem key={section.section} value={String(section.section)}>
							{formatSection(section.section)} - {section.teacher || "Teacher TBA"}
						</SelectItem>
					))}
					<SelectItem value="-1">Try All</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
