const fs = require("fs");

async function dump(clear = true) {
	const BASE_URL = "https://vanierlivecourseschedule.powerappsportals.com";
	const FORM_ID = "64153239-ba95-ed11-aad1-0022486daee2";

	function base64DecodeUnicode(e) {
		return decodeURIComponent(
			atob(e)
				.split("")
				.map(function (e) {
					return (
						"%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2)
					);
				})
				.join(""),
		);
	}

	async function getSecureConfig(url) {
		// Retrieve the secure configuration token
		const response = await fetch(url);
		if (response.status !== 200) {
			return false;
		}

		const responseText = await response.text();

		// Regex to extract the data-view-layouts field
		let viewLayouts =
			responseText.match(/data-view-layouts='(.+?)'/) ??
			responseText.match(/data-view-layouts="(.+?)"/);
		if (!viewLayouts) console.log(responseText);
		viewLayouts = viewLayouts[1];

		const viewData = JSON.parse(base64DecodeUnicode(viewLayouts))[0];
		const secureConfig = viewData.Base64SecureConfiguration;

		return secureConfig;
	}

	async function getTokens() {
		const response = await fetch(BASE_URL + "/_layout/tokenhtml");
		if (response.status !== 200) {
			return false;
		}

		const responseText = await response.text();
		const token = responseText.match(
			/__RequestVerificationToken" type="hidden" value="(.+?)"/,
		)[1];

		const cookie = response.headers
			.get("set-cookie")
			.match(/__RequestVerificationToken=(.+?);/)[1];
		return [cookie, token];
	}

	async function getCourses(cookie, token, page = 1, pageSize = 40) {
		const secureConfig = await getSecureConfig(BASE_URL);
		const res = await fetch(
			BASE_URL +
				"/_services/entity-grid-data.json/c7a13072-c94f-ed11-bba3-0022486daee2",
			{
				headers: {
					cookie: `__RequestVerificationToken=${cookie}`,
					"Content-Type": "application/json; charset=utf-8",
					__RequestVerificationToken: token,
					"X-Requested-With": "XMLHttpRequest",
				},
				referrer: BASE_URL,
				body: JSON.stringify({
					base64SecureConfiguration: secureConfig,
					sortExpression: "vit_course ASC,vit_sec ASC",
					search: "",
					page,
					pageSize,
					pagingCookie: "",
					filter: null,
					metaFilter: null,
					timezoneOffset: 300,
					customParameters: [],
				}),
				method: "POST",
			},
		);

		const resJson = await res.json();
		const courses = [];

		for (const course of resJson.Records) {
			courses.push({
				id: course.Id,
				section: course.Attributes.find(
					(attr) => attr.Name === "vit_sec",
				).Value,
				courseId: course.Attributes.find(
					(attr) => attr.Name === "vit_course",
				).Value,
				title: course.Attributes.find(
					(attr) => attr.Name === "vit_coursetitle",
				).Value,
			});
		}

		return courses;
	}

	async function getClasses(cookie, token, entityId) {
		const secureConfig = await getSecureConfig(
			`${BASE_URL}/_portal/modal-form-template-path/c7a13072-c94f-ed11-bba3-0022486daee2?id=${entityId}&entityformid=${FORM_ID}&languagecode=1033`,
		);
		const res = await fetch(
			BASE_URL +
				"/_services/entity-grid-data.json/c7a13072-c94f-ed11-bba3-0022486daee2",
			{
				headers: {
					cookie: `__RequestVerificationToken=${cookie}`,
					"Content-Type": "application/json; charset=utf-8",
					__RequestVerificationToken: token,
					"X-Requested-With": "XMLHttpRequest",
				},
				referrer: BASE_URL,
				body: JSON.stringify({
					base64SecureConfiguration: secureConfig,
					customParameters: [],
					entityId,
					entityName: "vit_courseinfo",
					filter: null,
					metaFilter: null,
					page: 1,
					pageSize: 50,
					pagingCookie: "",
					search: null,
					sortExpression: "vit_teacher ASC,vit_time ASC",
					timezoneOffset: 300,
				}),
				method: "POST",
			},
		);

		const resJson = await res.json();

		const classes = [];

		for (const record of resJson.Records) {
			const teacher = record.Attributes.find(
				(attr) => attr.Name === "vit_teacher",
			)?.Value;
			const day = record.Attributes.find(
				(attr) => attr.Name === "vit_day",
			)?.Value?.slice(0, 3);
			const time = record.Attributes.find(
				(attr) => attr.Name === "vit_time",
			)?.Value;
			const room = record.Attributes.find(
				(attr) => attr.Name === "vit_room",
			)?.Value;

			if (!teacher || !day || !time || !room) {
				continue;
			}

			classes.push({
				teacher,
				day,
				time,
				room,
			});
		}

		return classes;
	}

	const [cookie, token] = await getTokens();

	// Prepare the dump
	const PAGE_SIZE = 50;
	if (clear && fs.existsSync("dump_output")) {
		fs.rmSync("dump_output", { recursive: true });
	}

	fs.mkdirSync("dump_output");

	let currentPage = 1;
	let allCourses = await getCourses(cookie, token, currentPage, PAGE_SIZE);

	while (allCourses.length > 0) {
		const pageDump = {};

		const promises = [];
		for (const course of allCourses) {
			promises.push(getClasses(cookie, token, course.id));
		}

		const allClasses = await Promise.all(promises);

		for (const [index, course] of allCourses.entries()) {
			const department = course.courseId.substring(0, 3);

			if (!(department in pageDump)) {
				pageDump[department] = [];
			}

			pageDump[department].push({
				section: course.section,
				title: course.title,
				courseId: course.courseId,
				classes: allClasses[index],
			});
		}

		// Save current to dump output ${PAGE}.json
		fs.writeFileSync(
			`dump_output/${currentPage}.json`,
			JSON.stringify(pageDump),
		);
		console.log(`Dumped page ${currentPage}`);
		currentPage++;
		allCourses = await getCourses(cookie, token, currentPage, PAGE_SIZE);
	}
}

async function join() {
	// read all files in the dump output, join then into a single output
	const files = fs.readdirSync("dump_output");
	const output = {};

	for (const file of files) {
		const data = JSON.parse(fs.readFileSync(`dump_output/${file}`));
		for (const department in data) {
			if (!(department in output)) {
				output[department] = [];
			}

			output[department].push(...data[department]);
		}
	}

	fs.writeFileSync("dump-courses.json", JSON.stringify(output));
}

//dump(true);
join();
