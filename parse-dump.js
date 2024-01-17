// Create a new dump file, called dump-teacher.js, which groups the data by teacher

// Path: dump-teacher.js
const dump = require("./dump-courses.json");

const teachers = {};

for (const department in dump) {
    for (const course of dump[department]) {
        for (const cls of course.classes) {
            const teacher = cls.teacher;
            if (!teachers[teacher]) {
                teachers[teacher] = [];
            }

            if (teachers[teacher].find(x => x[0] == course.title && x[1] == course.courseId && x[2] == course.section)) {
                continue;
            }

            teachers[teacher].push(`${course.title}, ${course.courseId}, ${course.section}`);
        }
    }
}

const fs = require("fs");
const output = JSON.stringify(teachers, null, 4);
fs.writeFileSync("./dump-teacher.json", output);