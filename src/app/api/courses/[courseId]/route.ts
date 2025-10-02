import dump from "../../../../../dump-courses.json";
import { NextResponse } from "next/server";

export async function GET(request: Request, ctx: any) {
    // Add no-index header to prevent search engine indexing
    const headers = new Headers();
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    
    // Get the course ID
    const courseId = ctx.params.courseId;
    const courseDept = courseId.split("-")[0];

    const dumpDept = dump[courseDept as never] as any[];
    if (!dumpDept) {
        return NextResponse.json({ code: 404, data: [] }, { headers });
    }

    // Find all courses corresponding to the course ID
    const allCourses = dumpDept
        .filter((course) => course.courseId.toLowerCase() === courseId.toLowerCase())
        .sort((a, b) => parseInt(a) - parseInt(b));

    // For each course, go through their classes and filter out duplicate time slots
    const filteredCourses = allCourses.map((course) => {
        const classes = course.classes;
        const filteredClasses: any = [];
        const keySet = new Set<string>();

        for (const classObj of classes) {
            const classKey = `${classObj.day}-${classObj.time}`;
            if (keySet.has(classKey)) continue;

            filteredClasses.push(classObj);
            keySet.add(classKey);
        }

        return {
            ...course,
            classes: filteredClasses,
        };
    });

    const returnedData = filteredCourses.map((course) => {
        // Should have to map the periods
        // removing the leading zeros from the section
        return {
            title: course.title,
            section: parseInt(course.section.replace(/^0+/, "")),
            id: course.courseId.toUpperCase(),
            // teacher: course.classes[0]?.teacher ?? "No Teacher",
            teacher: "",
            periods: course.classes.map((period: any) => {
                const timeSplit = period.time.split(" - ");
                const startSplit = timeSplit[0].split(":");
                const endSplit = timeSplit[1].split(":");

                return {
                    day: period.day,
                    room: period.room ?? "...",

                    start_hour: parseInt(startSplit[0]),
                    start_minute: parseInt(startSplit[1]),
                    end_hour: parseInt(endSplit[0]),
                    end_minute: parseInt(endSplit[1]),
                };
            }),
        };
    });

    return NextResponse.json({ code: 200, data: returnedData }, { headers });
}
