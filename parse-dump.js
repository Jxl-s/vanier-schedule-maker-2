const dump1 = require('./dump-courses.json');
const dump2 = require('./dump-courses-2.json');
const fs = require("fs");

// create a file dump-courses-3, which removes duplicates, but only keep one.
// a duplicate is where the course code and the section number are the same
// This is the format of the dump:
// {"101":[{"section":"00001","courseId":"101-201-VA","title":"Nursing Students ONLY","classes":[{"teacher":"Panzuto, Maria T.","day":"Tue.","time":"10:00 - 13:00"},{"teacher":"Panzuto, Maria T.","day":"Fri.","time":"8:00 - 10:00"},{"teacher":"Panzuto, Maria T.","day":"Mon.","time":"12:00 - 14:00"}]},{"section":"00002","courseId":"101-201-VA","title":"Nursing Students ONLY","classes":[{"teacher":"Panzuto, Maria T.","day":"Fri.","time":"8:00 - 10:00"},{"teacher":"Panzuto, Maria T.","day":"Mon.","time":"12 ...
// the key is the department, it contains all course sections in the department
// the second file may not have all departments from the first file, so we need to merge them.

// merge the two dumps
const merged = {};

for (const department in dump1) {
    merged[department] = dump1[department];
}

for (const department in dump2) {
    if (!merged[department]) {
        merged[department] = dump2[department];
    } else {
        merged[department] = [...merged[department], ...dump2[department]];
    }
}

// remove duplicates
for (const department in merged) {
    const courses = merged[department];
    const seen = new Set();

    merged[department] = courses.filter(course => {
        if (seen.has(course.courseId + course.section)) {
            return false;
        }

        seen.add(course.courseId + course.section);
        return true;
    });
}

// write to file
fs.writeFileSync("dump-courses-3.json", JSON.stringify(merged));