const dump = require('./dump-courses.json');
// Remove courses where there is thing happening on weekend "Sat or Sun"

for (const [dept, arr] of Object.entries(dump)) {
    dump[dept] = arr.filter((course) => {
        const classes = course.classes;

        const hasWeekendClass = classes.some((c) => {
            const days = c.day;
            return days.includes('Sat') || days.includes('Sun');
        });

        return !hasWeekendClass;
    });
}

// write as new file
const fs = require('fs');

fs.writeFile('dump-courses-2.json', JSON.stringify(dump), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
});