import { NextResponse } from "next/server";
import { normalizeCourseCode } from "@/lib/course-code";
import { getCourseSections } from "@/lib/course-catalog.server";

interface RouteContext {
	params: { courseId: string };
}

const responseHeaders = {
	"Cache-Control":
		"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
	"X-Robots-Tag": "noindex, nofollow",
};

export const revalidate = 86_400;

export async function GET(_request: Request, { params }: RouteContext) {
	const courseId = normalizeCourseCode(params.courseId);

	if (!courseId || courseId.length > 40) {
		return NextResponse.json(
			{ code: 400, data: [], message: "Enter a valid course code." },
			{ status: 400, headers: responseHeaders },
		);
	}

	const sections = getCourseSections(courseId);
	if (!sections?.length) {
		return NextResponse.json(
			{ code: 404, data: [], message: "No course matched " + courseId + "." },
			{ status: 404, headers: responseHeaders },
		);
	}

	return NextResponse.json(
		{ code: 200, data: sections },
		{ headers: responseHeaders },
	);
}
