"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TeacherSearchResponse, TeacherSuggestion } from "@/types/schedule";

interface TeacherAutocompleteProps {
	onSelect: (teacher: TeacherSuggestion) => void;
	value: string;
	onChange: (value: string) => void;
}

export default function TeacherAutocomplete({
	onSelect,
	value,
	onChange,
}: TeacherAutocompleteProps) {
	const listboxId = useId();
	const [suggestions, setSuggestions] = useState<TeacherSuggestion[]>([]);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [isDismissed, setIsDismissed] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	useEffect(() => {
		const query = value.trim();
		if (isDismissed || query.length < 2) {
			setSuggestions([]);
			setIsSearching(false);
			return;
		}

		const controller = new AbortController();
		setIsSearching(true);
		const timeout = window.setTimeout(async () => {
			try {
				const response = await fetch(
					`/api/teachers?q=${encodeURIComponent(query)}`,
					{ signal: controller.signal },
				);
				const result = (await response.json()) as TeacherSearchResponse;
				if (!response.ok) throw new Error(result.message ?? "Unable to search teachers.");
				setSuggestions(result.data);
				setActiveIndex(-1);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === "AbortError")) {
					setSuggestions([]);
				}
			} finally {
				if (!controller.signal.aborted) setIsSearching(false);
			}
		}, 200);

		return () => {
			window.clearTimeout(timeout);
			controller.abort();
		};
	}, [isDismissed, value]);

	function chooseTeacher(teacher: TeacherSuggestion) {
		setIsDismissed(true);
		setSuggestions([]);
		setActiveIndex(-1);
		onSelect(teacher);
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
		} else if (event.key === "Enter") {
			event.preventDefault();
			chooseTeacher(suggestions[activeIndex >= 0 ? activeIndex : 0]);
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
				aria-label="Teacher name"
				autoComplete="off"
				className="h-8 pr-8 text-xs"
				data-1p-ignore="true"
				data-form-type="other"
				data-lpignore="true"
				name="teacher-lookup"
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
				placeholder="Type a teacher's name..."
				role="combobox"
				spellCheck={false}
				type="search"
				value={value}
			/>

			{isSearching ? (
				<Loader2 className="pointer-events-none absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground" />
			) : null}

			{isOpen ? (
				<div
					aria-label="Teacher suggestions"
					className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
					id={listboxId}
					role="listbox"
				>
					{suggestions.map((teacher, index) => (
						<button
							aria-selected={index === activeIndex}
							className={cn(
								"flex w-full items-center justify-between gap-3 rounded-sm px-2 py-2 text-left text-xs",
								index === activeIndex && "bg-accent text-accent-foreground",
							)}
							id={`${listboxId}-${index}`}
							key={teacher.id}
							onClick={() => chooseTeacher(teacher)}
							onMouseDown={(event) => event.preventDefault()}
							onMouseEnter={() => setActiveIndex(index)}
							role="option"
							type="button"
						>
							<span className="min-w-0 truncate font-medium">{teacher.name}</span>
							<span className="shrink-0 text-muted-foreground">
								{teacher.courses} {teacher.courses === 1 ? "course" : "courses"}
							</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
