import Course from "./Course.js";
import { LRUCache } from "lru-cache";

function base64DecodeUnicode(e) {
	return decodeURIComponent(
		atob(e)
			.split("")
			.map(function (e) {
				return "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2);
			})
			.join(""),
	);
}

export class Schedule {
	static BASE_URL = "https://vanierlivecourseschedule.powerappsportals.com";
	static instance = null;

	constructor() {
		if (Schedule.instance) {
			return Schedule.instance;
		}

		this.baseSecureConfig = "";
		this.formId = "";

		this.headerToken = "";
		this.cookieToken = "";

		this.cache = new LRUCache({
			max: 500,
			ttl: 1000 * 60 * 5, // 15 minutes
		});

		this.updatedAt = undefined;

		Schedule.instance = this;
	}

	async init() {
		// 1. Fetch the secure config and the form ID
		const { secureConfig, entityFormId } = await this._getSecureConfig(
			Schedule.BASE_URL,
		);

		this.baseSecureConfig = secureConfig;
		this.formId = entityFormId;

		// 2. Fetch the session tokens
		const { header, cookie } = await this._getVerifTokens();
		this.headerToken = header;
		this.cookieToken = cookie;

		this.updatedAt = new Date();
	}

	async search({ page = 1, pageSize = 40, search = "" }) {
		const res = await fetch(
			Schedule.BASE_URL +
				"/_services/entity-grid-data.json/c7a13072-c94f-ed11-bba3-0022486daee2",
			{
				headers: {
					cookie: `__RequestVerificationToken=${this.cookieToken}`,
					"Content-Type": "application/json; charset=utf-8",
					__RequestVerificationToken: this.headerToken,
					"X-Requested-With": "XMLHttpRequest",
				},
				referrer: Schedule.BASE_URL,
				body: JSON.stringify({
					base64SecureConfiguration: this.baseSecureConfig,
					sortExpression: "vit_course ASC,vit_sec ASC",
					search,
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

		const results = [];
		const promises = [];

		if (res.status !== 200) {
			return results;
		}

		const resJson = await res.json();
		for (const course of resJson.Records) {
			const data = {};
			for (const attr of course.Attributes) {
				if (!attr.Name.startsWith("vit_")) {
					continue;
				}

				data[attr.Name.substring(4)] = attr.Value;
			}

			const courseObj = new Course({
				infoId: data.courseinfoid,
				restriction: data.restrictedtoprogram,
				title: data.coursetitle,
				section: data.sec,
				seats: data.availableplaces ?? 0,
				courseId: data.course,
			});

			results.push(courseObj);
			promises.push(courseObj.init());
		}

		await Promise.all(promises);
		return results;
	}

	async _getSecureConfig(url = Schedule.BASE_URL) {
		const result = { secureConfig: "", entityFormId: "" };
		const res = await fetch(url);
		if (res.status !== 200) {
			return result;
		}

		try {
			const resText = await res.text();

			// Try matching the data-view-layouts field
			let match =
				resText.match(/data-view-layouts='(.+?)'/) ??
				resText.match(/data-view-layouts="(.+?)"/);
			match = match[1];

			// Extract the base config, and the form ID
			const dataViewLayouts = JSON.parse(base64DecodeUnicode(match))[0];
			const secureConfig = dataViewLayouts.Base64SecureConfiguration;

			const entityFormId =
				dataViewLayouts.Configuration.ItemActionLinks[0]?.EntityForm
					?.Id;

			return {
				secureConfig,
				entityFormId,
			};
		} catch (e) {
			console.log(e);
			return result;
		}
	}

	async _getVerifTokens() {
		const result = { header: "", cookie: "" };
		const res = await fetch(Schedule.BASE_URL + "/_layout/tokenhtml");
		if (res.status !== 200) {
			return result;
		}

		const resText = await res.text();

		// Grab the tokens
		const header = resText.match(
			/__RequestVerificationToken" type="hidden" value="(.+?)"/,
		)[1];
		const cookie = res.headers
			.get("set-cookie")
			.match(/__RequestVerificationToken=(.+?);/)[1];

		return {
			header,
			cookie,
		};
	}
}

if (import.meta.url === new URL(import.meta.url, import.meta.url).href) {
	// Code to run if the file is executed directly
	const schedule = new Schedule();
	await schedule.init();

	for (let i = 0; i < 100; i++) {
		const results = await schedule.search({
			page: 1,
			pageSize: 50,
			search: "420-101-VA",
		});

		console.log("DONE ONCE", i);
	}

	console.log(JSON.stringify(results));
}
