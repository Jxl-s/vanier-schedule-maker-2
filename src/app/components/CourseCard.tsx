import { Trash2 } from "lucide-react";
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
	selection: CourseSelection;
	sections: CourseSection[];
	onRemove: () => void;
	onSectionChange: (section: number) => void;
}

export default function CourseCard({
	selection,
	sections,
	onRemove,
	onSectionChange,
}: CourseCardProps) {
	const selectedSection =
		sections.find((section) => section.section === selection.section) ??
		sections[0];

	return (
		<div className="course-option rounded-md p-3">
			<div className="mb-2 flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="font-mono text-xs font-semibold">{selection.course}</p>
					<p className="truncate text-xs text-muted-foreground">
						{selectedSection?.title ?? "Course title unavailable"}
					</p>
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
