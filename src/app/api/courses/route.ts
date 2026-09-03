import { NextResponse } from "next/server";
import { getCourseCatalog } from "@/lib/course-catalog.server";

const responseHeaders = {
	"Cache-Control":
		"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
	"X-Robots-Tag": "noindex, nofollow",
};

export const revalidate = 86_400;

export function GET() {
	return NextResponse.json(
		{ code: 200, data: getCourseCatalog() },
		{ headers: responseHeaders },
	);
}
