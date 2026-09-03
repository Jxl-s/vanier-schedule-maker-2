export interface CoursePeriod {
	day: string;
	room: string;
	start_hour: number;
	start_minute: number;
	end_hour: number;
	end_minute: number;
}

export interface CourseSection {
	title: string;
	section: number;
	teacher: string;
	id: string;
	periods: CoursePeriod[];
	teacherRating?: TeacherRating | null;
}

export interface TeacherRating {
	name?: string;
	rating: number | null;
	reviewCount: number | null;
	profileUrl: string | null;
}

export interface CourseSelection {
	course: string;
	section: number;
}

export type CourseCatalog = Record<string, CourseSection[]>;

export interface SavedSchedule {
	courses: CourseSelection[];
	data: CourseCatalog;
}

export type SavedScheduleCollection = Record<string, SavedSchedule>;

export interface CourseResponse {
	code: number;
	data: CourseSection[];
	message?: string;
}

export interface CourseSuggestion {
	id: string;
	title: string;
	sections: number;
}
