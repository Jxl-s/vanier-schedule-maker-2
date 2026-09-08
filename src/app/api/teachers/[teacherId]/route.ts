import { NextResponse } from "next/server";
import { getTeacherSchedule } from "@/lib/teacher-catalog.server";

interface RouteContext {
	params: { teacherId: string };
}

const responseHeaders = {
	"Cache-Control":
		"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
	"X-Robots-Tag": "noindex, nofollow",
};

export const revalidate = 86_400;

export function GET(_request: Request, { params }: RouteContext) {
	const teacherId = params.teacherId.trim();

	if (!teacherId || teacherId.length > 160) {
		return NextResponse.json(
		{ code: 400, data: null, message: "Enter a valid teacher name." },
		{ status: 400, headers: responseHeaders },
		);
	}

	const schedule = getTeacherSchedule(teacherId);
	if (!schedule) {
		return NextResponse.json(
		{ code: 404, data: null, message: "Teacher schedule not found." },
		{ status: 404, headers: responseHeaders },
		);
	}

	return NextResponse.json(
		{ code: 200, data: schedule },
		{ headers: responseHeaders },
	);
}
