import { NextResponse } from "next/server";
import { getTeacherCount, searchTeachers } from "@/lib/teacher-catalog.server";

const responseHeaders = {
	"Cache-Control":
		"public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
	"X-Robots-Tag": "noindex, nofollow",
};

export const dynamic = "force-dynamic";

export function GET(request: Request) {
	const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

	if (query.length > 100) {
		return NextResponse.json(
		{
			code: 400,
			data: [],
			total: getTeacherCount(),
			message: "Teacher search is too long.",
		},
		{ status: 400, headers: responseHeaders },
		);
	}

	return NextResponse.json(
		{ code: 200, data: searchTeachers(query), total: getTeacherCount() },
		{ headers: responseHeaders },
	);
}
