"use client";

import {
	useId,
	useMemo,
	useState,
	type KeyboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { normalizeCourseCode } from "@/lib/course-code";
import type { CourseSuggestion } from "@/types/schedule";

interface CourseAutocompleteProps {
	courses: CourseSuggestion[];
	disabled?: boolean;
	onChange: (value: string) => void;
	value: string;
}

export default function CourseAutocomplete({
	courses,
	disabled,
	onChange,
	value,
}: CourseAutocompleteProps) {
	const listboxId = useId();
	const [activeIndex, setActiveIndex] = useState(-1);
	const [isDismissed, setIsDismissed] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const suggestions = useMemo(() => {
		const normalizedQuery = normalizeCourseCode(value);
		const titleQuery = value.trim().toLowerCase();
		if (isDismissed || (normalizedQuery.length < 2 && titleQuery.length < 2)) {
			return [];
		}

		return courses
			.filter(
				(course) =>
					course.id.includes(normalizedQuery) ||
					course.title.toLowerCase().includes(titleQuery),
			)
			.sort((a, b) => {
				const aStarts = a.id.startsWith(normalizedQuery) ? 0 : 1;
				const bStarts = b.id.startsWith(normalizedQuery) ? 0 : 1;
				return aStarts - bStarts || a.id.localeCompare(b.id);
			})
			.slice(0, 8);
	}, [courses, isDismissed, value]);

	function chooseCourse(course: CourseSuggestion) {
		onChange(course.id);
		setIsDismissed(true);
		setActiveIndex(-1);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (!suggestions.length) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((current) => (current + 1) % suggestions.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((current) =>
				current <= 0 ? suggestions.length - 1 : current - 1,
			);
		} else if (event.key === "Enter" && activeIndex >= 0) {
			event.preventDefault();
			chooseCourse(suggestions[activeIndex]);
		} else if (event.key === "Escape") {
			setIsDismissed(true);
			setActiveIndex(-1);
		}
	}

	const isOpen = isFocused && suggestions.length > 0;

	return (
		<div className="relative min-w-0 flex-1">
			<Input
				aria-activedescendant={
					activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
				}
				aria-autocomplete="list"
				aria-controls={listboxId}
				aria-expanded={isOpen}
				aria-label="Course code"
				autoCapitalize="characters"
				autoComplete="off"
				className="h-8 font-mono text-xs uppercase"
				data-1p-ignore="true"
				data-form-type="other"
				data-lpignore="true"
				disabled={disabled}
				name="course-code-lookup"
				onBlur={() => window.setTimeout(() => setIsFocused(false), 100)}
				onChange={(event) => {
					setIsDismissed(false);
					setActiveIndex(-1);
					onChange(event.target.value);
				}}
				onFocus={() => {
					setIsFocused(true);
					setIsDismissed(false);
				}}
				onKeyDown={handleKeyDown}
				placeholder="420-101-VA"
				role="combobox"
				spellCheck={false}
				type="search"
				value={value}
			/>

			{isOpen ? (
				<div
					aria-label="Course suggestions"
					className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
					id={listboxId}
					role="listbox"
				>
					{suggestions.map((course, index) => (
						<button
							aria-selected={index === activeIndex}
							className={cn(
								"flex w-full items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs",
								index === activeIndex && "bg-accent text-accent-foreground",
							)}
							id={`${listboxId}-${index}`}
							key={course.id}
							onMouseDown={(event) => event.preventDefault()}
							onMouseEnter={() => setActiveIndex(index)}
							onClick={() => chooseCourse(course)}
							role="option"
							type="button"
						>
							<span className="min-w-0">
								<span className="block font-mono font-medium">{course.id}</span>
								<span className="block truncate text-muted-foreground">
									{course.title}
								</span>
							</span>
							<span className="shrink-0 text-muted-foreground">
								{course.sections} {course.sections === 1 ? "section" : "sections"}
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
