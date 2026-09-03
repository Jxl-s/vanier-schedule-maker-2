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
		this.initPromise = null;

		this.cache = new LRUCache({
			max: 500,
			ttl: 1000 * 60 * 5,
		});

		this.updatedAt = undefined;

		Schedule.instance = this;
	}

	async init() {
		if (this.initPromise) return this.initPromise;

		this.initPromise = this._initialize();
		return this.initPromise;
	}

	async _initialize() {
		const [{ secureConfig, entityFormId }, { header, cookie }] =
			await Promise.all([
				this._getSecureConfig(Schedule.BASE_URL),
				this._getVerifTokens(),
			]);

		this.baseSecureConfig = secureConfig;
		this.formId = entityFormId;
		this.headerToken = header;
		this.cookieToken = cookie;
		this.updatedAt = new Date();
	}

	async search({ page = 1, pageSize = 40, search = "" }) {
		await this.init();

		const cacheKey = ["search", page, pageSize, search.trim().toLowerCase()].join(
			"_",
		);
		const cachedResults = this.cache.get(cacheKey);
		if (cachedResults) return cachedResults;

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
		if (!res.ok) {
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
		}

		// Avoid overwhelming the upstream portal with one request per section.
		for (let index = 0; index < results.length; index += 8) {
			await Promise.all(results.slice(index, index + 8).map((course) => course.init()));
		}

		this.cache.set(cacheKey, results);
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
			if (!match) return result;

			// Extract the base config, and the form ID
			const dataViewLayouts = JSON.parse(base64DecodeUnicode(match[1]))[0];
			const secureConfig = dataViewLayouts.Base64SecureConfiguration;

			const entityFormId =
				dataViewLayouts.Configuration.ItemActionLinks[0]?.EntityForm
					?.Id;

			return {
				secureConfig,
				entityFormId,
			};
		} catch {
			return result;
		}
	}

	async _getVerifTokens() {
		const result = { header: "", cookie: "" };
		const res = await fetch(Schedule.BASE_URL + "/_layout/tokenhtml");
		if (!res.ok) {
			return result;
		}

		const resText = await res.text();

		// Grab the tokens
		const headerMatch = resText.match(
			/__RequestVerificationToken" type="hidden" value="(.+?)"/,
		);
		const cookieMatch = res.headers
			.get("set-cookie")
			?.match(/__RequestVerificationToken=(.+?);/);

		return {
			header: headerMatch?.[1] ?? "",
			cookie: cookieMatch?.[1] ?? "",
		};
	}
}
