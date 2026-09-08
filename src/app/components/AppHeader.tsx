"use client";

import Link from "next/link";
import { CalendarDays, Code2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";

interface AppHeaderProps {
	page: "builder" | "teachers";
}

export default function AppHeader({ page }: AppHeaderProps) {
	const isTeacherPage = page === "teachers";

	return (
		<header className="app-header bg-card">
			<div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 py-3 sm:px-4">
				<div className="min-w-0">
					<h1 className="truncate text-base font-semibold">{siteConfig.name}</h1>
					<p className="truncate text-xs text-muted-foreground">
						{isTeacherPage
							? "Look up a teacher's current course schedule."
							: siteConfig.shortDescription}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<Button asChild className="h-8 gap-1.5 px-2" size="sm" variant="ghost">
						<Link href={isTeacherPage ? "/" : "/teachers"}>
							{isTeacherPage ? (
								<CalendarDays className="h-4 w-4" />
							) : (
								<Users className="h-4 w-4" />
							)}
							<span className="hidden sm:inline">
								{isTeacherPage ? "Course builder" : "Teacher schedules"}
							</span>
						</Link>
					</Button>
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
	);
}
