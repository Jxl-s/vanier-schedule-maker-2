#!/usr/bin/env node

const fs = require("fs");

const DEFAULT_INPUT = "dump-courses.json";
const DEFAULT_OUTPUT = "dump-teacher-courses.json";

function buildTeacherIndex(courseCatalog) {
	const teacherCourses = new Map();

	for (const department of Object.values(courseCatalog)) {
		for (const course of department) {
			for (const classMeeting of course.classes) {
				const teacher = classMeeting.teacher?.trim();
				if (!teacher) continue;

				let courses = teacherCourses.get(teacher);
				if (!courses) {
					courses = new Set();
					teacherCourses.set(teacher, courses);
				}
				courses.add(course.courseId);
			}
		}
	}

	const output = {};
	const teachers = Array.from(teacherCourses.keys()).sort((left, right) =>
		left.localeCompare(right),
	);

	for (const teacher of teachers) {
		output[teacher] = Array.from(teacherCourses.get(teacher)).sort((left, right) =>
			left.localeCompare(right),
		);
	}

	return output;
}

function writeTeacherIndex(courseCatalog, outputPath = DEFAULT_OUTPUT) {
	const teacherIndex = buildTeacherIndex(courseCatalog);
	fs.writeFileSync(outputPath, JSON.stringify(teacherIndex));
	return teacherIndex;
}

if (require.main === module) {
	const inputPath = process.argv[2] || DEFAULT_INPUT;
	const outputPath = process.argv[3] || DEFAULT_OUTPUT;
	const courseCatalog = JSON.parse(fs.readFileSync(inputPath));
	const teacherIndex = writeTeacherIndex(courseCatalog, outputPath);
	console.log(`Indexed ${Object.keys(teacherIndex).length} teachers.`);
}

module.exports = { buildTeacherIndex, writeTeacherIndex };
