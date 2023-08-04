import dump from "../../../../../dump-courses.json";
import { NextResponse } from "next/server";

export async function GET(request: Request, ctx: any) {
    // Get the course ID
    const courseId = ctx.params.courseId;
    const courseDept = courseId.split("-")[0];

    const dumpDept = dump[courseDept as never] as any[];
    if (!dumpDept) {
        return NextResponse.json({ code: 404, data: [] });
    }

    // Find all courses corresponding to the course ID
    const allCourses = dumpDept
        .filter((course) => course.courseId.toLowerCase() === courseId.toLowerCase())
        .sort((a, b) => parseInt(a) - parseInt(b));

    const returnedData = allCourses.map((course) => {
        // Should have to map the periods
        return {
            title: course.title,
            section: course.section,
            teacher: course.classes[0]?.teacher ?? "No Teacher",
            periods: course.classes.map((period: any) => {
                const timeSplit = period.time.split(" - ");
                const startSplit = timeSplit[0].split(":");
                const endSplit = timeSplit[1].split(":");

                return {
                    day: period.day,
                    room: period.room,

                    start_hour: parseInt(startSplit[0]),
                    start_minute: parseInt(startSplit[1]),
                    end_hour: parseInt(endSplit[0]),
                    end_minute: parseInt(endSplit[1]),
                };
            }),
        };
    });

    return NextResponse.json({ code: 200, data: returnedData });
}
