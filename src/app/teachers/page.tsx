import type { Metadata } from "next";
import TeacherScheduleViewer from "../components/TeacherScheduleViewer";
import { getTeacherCount } from "@/lib/teacher-catalog.server";

export const metadata: Metadata = {
	title: "Teacher Schedules | Vanier Schedule Builder",
	description: "Look up a Vanier College teacher's current weekly course schedule.",
};

export default function TeacherSchedulesPage() {
	return <TeacherScheduleViewer teacherCount={getTeacherCount()} />;
}
