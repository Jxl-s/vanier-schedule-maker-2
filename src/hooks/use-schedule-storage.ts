"use client";

import { useEffect, useState } from "react";
import {
	loadCatalog,
	loadSavedSchedules,
	loadSelections,
	saveCatalog,
	saveSavedSchedules,
	saveSelections,
} from "@/lib/storage";
import type {
	CourseCatalog,
	CourseSelection,
	SavedScheduleCollection,
} from "@/types/schedule";

export function useScheduleStorage() {
	const [catalog, setCatalog] = useState<CourseCatalog>({});
	const [selections, setSelections] = useState<CourseSelection[]>([]);
	const [savedSchedules, setSavedSchedules] =
		useState<SavedScheduleCollection>({});
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setCatalog(loadCatalog());
		setSelections(loadSelections());
		setSavedSchedules(loadSavedSchedules());
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		if (isHydrated) saveCatalog(catalog);
	}, [catalog, isHydrated]);

	useEffect(() => {
		if (isHydrated) saveSelections(selections);
	}, [isHydrated, selections]);

	useEffect(() => {
		if (isHydrated) saveSavedSchedules(savedSchedules);
	}, [isHydrated, savedSchedules]);

	return {
		catalog,
		setCatalog,
		selections,
		setSelections,
		savedSchedules,
		setSavedSchedules,
	};
}
