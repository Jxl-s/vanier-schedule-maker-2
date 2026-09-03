import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{
			code: 404,
			message:
				"Add a course code to the URL, for example /api/courses/420-101-VA.",
		},
		{
			status: 404,
			headers: { "X-Robots-Tag": "noindex, nofollow" },
		},
	);
}
