#!/usr/bin/env node

const fs = require("fs");

const RMP_SCHOOL_ID = "U2Nob29sLTE1MDQ4";
const RMP_GRAPHQL_URL = "https://www.ratemyprofessors.com/graphql";

function normalizeTeacherName(name) {
	const [lastName, firstNames] = name.split(",", 2).map((part) => part.trim());
	const orderedName = firstNames ? `${firstNames} ${lastName}` : name;
	return orderedName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

async function dumpTeachers() {
	try {
		const response = await fetch(RMP_GRAPHQL_URL, {
			method: "POST",
			headers: {
				Authorization: "Basic dGVzdDp0ZXN0",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query: `query TeacherDirectoryQuery($query: TeacherSearchQuery!) {
					newSearch { teachers(query: $query, first: 1000, after: "") {
						edges { node { firstName lastName legacyId avgRating numRatings } }
					} }
				}`,
				variables: {
					query: { schoolID: RMP_SCHOOL_ID, text: "", fallback: true },
				},
			}),
		});
		if (!response.ok) throw new Error(`RMP returned ${response.status}`);

		const payload = await response.json();
		const ratings = {};
		for (const edge of payload?.data?.newSearch?.teachers?.edges ?? []) {
			const teacher = edge.node;
			if (!teacher?.firstName || !teacher?.lastName) continue;
			ratings[normalizeTeacherName(`${teacher.firstName} ${teacher.lastName}`)] = {
				name: `${teacher.firstName} ${teacher.lastName}`,
				rating: typeof teacher.avgRating === "number" ? teacher.avgRating : null,
				reviewCount: typeof teacher.numRatings === "number" ? teacher.numRatings : null,
				profileUrl: teacher.legacyId
					? `https://www.ratemyprofessors.com/professor/${teacher.legacyId}`
					: null,
			};
		}

		fs.writeFileSync("dump-teachers.json", JSON.stringify(ratings));
		console.log(`Dumped ${Object.keys(ratings).length} teacher rating records`);
	} catch (error) {
		console.warn("Unable to fetch the RMP teacher directory:", error.message);
		fs.writeFileSync("dump-teachers.json", "{}");
	}
}

dumpTeachers();
