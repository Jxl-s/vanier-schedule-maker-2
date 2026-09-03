"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

		function syncWithPreference(event?: MediaQueryListEvent) {
			if (localStorage.getItem(THEME_STORAGE_KEY)) return;
			const nextTheme: Theme = (event?.matches ?? mediaQuery.matches)
				? "dark"
				: "light";
			setTheme(nextTheme);
			applyTheme(nextTheme);
		}

		if (savedTheme === "light" || savedTheme === "dark") {
			setTheme(savedTheme);
			applyTheme(savedTheme);
		} else {
			syncWithPreference();
		}

		mediaQuery.addEventListener("change", syncWithPreference);
		return () => mediaQuery.removeEventListener("change", syncWithPreference);
	}, []);

	function toggleTheme() {
		const nextTheme: Theme = theme === "dark" ? "light" : "dark";
		localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		setTheme(nextTheme);
		applyTheme(nextTheme);
	}

	return (
		<Button
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			className="h-8 w-8"
			onClick={toggleTheme}
			size="icon"
			title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			variant="ghost"
		>
			{theme === "dark" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</Button>
	);
}
