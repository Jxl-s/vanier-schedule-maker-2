import { Schedule } from "./Schedule.js";
import Period from "./Period.js";

export default class Course {
	constructor({ section, courseId, seats, title, restriction, infoId }) {
		const schedule = Schedule.instance;
		if (schedule.cache.has("course_" + infoId)) {
			return schedule.cache.get("course_" + infoId);
		}

		this.section = section;
		this.courseId = courseId;
		this.seats = seats;
		this.title = title;
		this.restriction = restriction;
		this.infoId = infoId;

		this.periods = [];
	}

	async init() {
		if (this.periods.length > 0) {
			return;
		}

		const schedule = Schedule.instance;

		// Get the tokens
		const configUrl = `${Schedule.BASE_URL}/_portal/modal-form-template-path/c7a13072-c94f-ed11-bba3-0022486daee2?id=${this.infoId}&entityformid=${schedule.formId}&languagecode=1033`;
		const { secureConfig } = await schedule._getSecureConfig(configUrl);

		// Fetch the periods
		const res = await fetch(
			Schedule.BASE_URL +
				"/_services/entity-grid-data.json/c7a13072-c94f-ed11-bba3-0022486daee2",
			{
				headers: {
					cookie: `__RequestVerificationToken=${schedule.cookieToken}`,
					"Content-Type": "application/json; charset=utf-8",
					__RequestVerificationToken: schedule.headerToken,
					"X-Requested-With": "XMLHttpRequest",
				},
				referrer: Schedule.BASE_URL,
				body: JSON.stringify({
					base64SecureConfiguration: secureConfig,
					customParameters: [],
					entityId: this.infoId,
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

		if (res.status !== 200) {
			return;
		}

		const resJson = await res.json();

		for (const record of resJson.Records) {
			const data = {};
			for (const attr of record.Attributes) {
				if (!attr.Name.startsWith("vit_")) {
					continue;
				}

				data[attr.Name.substring(4)] = attr.Value;
			}

			const periodObj = new Period({
				time: data.time,
				day: data.day.slice(0, -1),
				room: data.room,
				teacher: data.teacher,
			});

			this.periods.push(periodObj);
		}

		schedule.cache.set("course_" + this.infoId, this);
	}
}
