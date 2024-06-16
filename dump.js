(async () => {
    console.error = () => {};
    console.warn = () => {};

    const allData = {};

    const INTERESTED_COURSES = ["609-HSA-VA", "502-211-VA", "603-102-MQ", "530-110-VA"];

    // helpers
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const sleepUntilExist = async (selector) => {
        while (!document.querySelector(selector)) {
            await sleep(500);
        }
    };

    // inputs
    const searchBox = document.querySelector("input.query.form-control");
    const searchBtn = document.querySelector("button[title='Search Results']");

    const searchCourse = async (course) => {
        console.log(`[Dumper] Searching for ${course}`);
        searchBox.value = course;
        await sleep(500);

        searchBtn.click();
        await sleep(1000);
        await sleepUntilExist("table.table.table-striped > tbody");
    };

    async function dumpPages() {
        for (let i = 0; i < 58; i++) {
            const btns = [
                ...document.getElementsByClassName("details-link has-tooltip launch-modal"),
            ];
            const iframe = document.querySelector("iframe[aria-hidden=true]");

            const waitUntilLoad = () => {
                return new Promise((resolve, reject) => {
                    let interval = setInterval(() => {
                        if (
                            iframe.contentDocument.querySelectorAll("[data-entity=vit_meetingtime")
                                .length > 0
                        ) {
                            clearInterval(interval);
                            return resolve();
                        }

                        console.log("[Dumper] Waiting for iframe to load...");
                    }, 2000);
                });
            };

            // Press on the button
            for (const btn of btns) {
                btn.click();
                await waitUntilLoad();

                const doc = iframe.contentDocument;

                const courseName = doc.getElementById("vit_coursetitle").getAttribute("value");
                const courseCode = doc.getElementById("vit_course").getAttribute("value");
                const section = doc.getElementById("vit_sec").getAttribute("value");

                // If it's a new department (3 first letters), add a key in the object
                const department = courseCode.slice(0, 3);
                if (!allData[department]) {
                    allData[department] = [];
                }

                const classesArr = [];
                // example data: {"101":[{"section":"00001","courseId":"101-101-VA","title":"Anatomy and Physiology I","classes":[{"day":"Mon","time":"8:00 - 10:00","room":"A-320","teacher":"Panzuto, Maria T."},{"day":"Tue","time":"10:00 - 13:00","room":"A-453","teacher":"Chit, Fallah Hassan"},{"day":"Fri","time":"8:00 - 10:00","room":"C-418","teacher":"Panzuto, Maria T."}]},{"section":"00002","courseId":"101-101-VA","title":"Anatomy and Physiology I","classes":[{"day":"Mon","time":"8:00 - 10:00","room":"A-320","teacher":"Panzuto, Maria T."},{"day":"Tue","time":"13:00 - 16:00","room":"A-453","teacher":"Chit, Fallah Hassan"}
                allData[department].push({
                    section,
                    courseId: courseCode,
                    title: courseName,
                    classes: classesArr,
                });

                const meetings = [...doc.querySelectorAll("[data-entity=vit_meetingtime")];
                console.log(`[Dumper] ${courseCode} ${courseName} ${meetings.length}`);

                for (const meeting of meetings) {
                    const teacher = meeting.querySelector("[data-attribute=vit_teacher]").innerText;
                    const day = meeting.querySelector("[data-attribute=vit_day]").innerText;
                    const time = meeting.querySelector("[data-attribute=vit_time]").innerText;

                    classesArr.push({
                        teacher,
                        day,
                        time,
                    });
                }
            }

            const nextButton = document.querySelector("[aria-label='Next page']");
            if (
                nextButton?.checkVisibility() &&
                (!nextButton?.getAttribute("aria-disabled") ?? false)
            ) {
                nextButton.click();

                await new Promise((resolve, reject) => setTimeout(resolve, 4000));
                console.log(
                    `[Dumper] Currently on page ${
                        document.querySelector(".active > [aria-current=page]")?.innerText ?? "?"
                    }`
                );
            } else {
                break;
            }
        }

        console.log(JSON.stringify(allData));
    }

    for (const course of INTERESTED_COURSES) {
        await searchCourse(course);
        await dumpPages();
    }
})();
