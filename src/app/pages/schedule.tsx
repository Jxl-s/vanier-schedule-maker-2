"use client";

import { useEffect, useState } from "react";
import Button from "../components/interactive/Button";
import Input from "../components/interactive/Input";
import List from "../components/interactive/List";
import Schedule, { dayToInt } from "../components/Schedule";
import MainLayout from "../layouts/main";

interface CourseData {
	title: string;
	section: number;
	teacher: string;
	id: string;

	periods: {
		day: string;
		room: string;

		start_hour: number;
		start_minute: number;

		end_hour: number;
		end_minute: number;
	}[];
}

interface CourseDisplayProps {
	course: { course: string; section: number };
	data: CourseData[];
	onSectionChange: (section: number) => void;
	onDelete: () => void;
}

function CourseDisplay({
	course,
	data,
	onSectionChange,
	onDelete,
}: CourseDisplayProps) {
	// to make sure that the section is 5 digits
	const addLeadingZeros = (num: number) => {
		return num.toString().padStart(5, "0");
	};

	const sectionOptions = data.map((section, i) => {
		return addLeadingZeros(section.section) + " - " + section.teacher;
	});

	sectionOptions.push("Try All");

	// Get the course's title
	const title = data.find(
		(section) => section.section === course.section,
	)?.title;

	return (
		<div className="grid grid-cols-5 bg-zinc-800 rounded-lg p-3 my-2 gap-2">
			<div className="col-span-2">
				<p>{course.course}</p>
				<p className="opacity-80">{title ?? "No title"}</p>
			</div>
			<div className="col-span-2">
				<List
					options={sectionOptions}
					_preset={
						course.section === -1
							? sectionOptions[sectionOptions.length - 1]
							: sectionOptions.find((e) =>
									e.startsWith(
										addLeadingZeros(course.section),
									),
								)
					}
					onChange={(selected) => {
						// split before the first dash
						const section = selected.split("-")[0].trim();
						if (section === "Try All") {
							return onSectionChange(-1);
						}

						// otherwise, just remove the leading 0's and parse it as an int
						return onSectionChange(parseInt(section));
					}}
				/>
			</div>
			<div className="col-span-1">
				<Button
					variant="solid"
					color="danger"
					className="w-full h-9 mt-1"
					onClick={onDelete}
				>
					Delete
				</Button>
			</div>
		</div>
	);
}

export default function Schedules() {
	const [courseData, setCourseData] = useState<Map<string, CourseData[]>>(
		new Map(),
	);

	const [currentCourses, setCurrentCourses] = useState<
		{
			course: string;
			section: number;
		}[]
	>([]);

	// Saving and loading
	const [saveName, setSaveName] = useState("");
	const [savedSchedules, setSavedSchedule] = useState<string[]>([]);

	const loadSavedSchedules = () => {
		const allSaved = localStorage.getItem("savedSchedules");
		if (!allSaved) return;

		const allSavedJson = JSON.parse(allSaved);
		setSavedSchedule(Object.keys(allSavedJson));
	};

	const onSaveSchedule = () => {
		if (!saveName) return;

		let allSaved = localStorage.getItem("savedSchedules");
		if (!allSaved) allSaved = "{}";

		const allSavedJson = JSON.parse(allSaved);

		// Check for duplicate saveName
		if (allSavedJson[saveName]) {
			alert(
				"A schedule with this name already exists. Please choose a different name.",
			);
			return;
		}

		// Save the course data
		const localObject: any = {};
		courseData.forEach((value, key) => {
			localObject[key] = value;
		});

		allSavedJson[saveName] = {
			courses: currentCourses,
			data: localObject,
		};

		localStorage.setItem("savedSchedules", JSON.stringify(allSavedJson));
		loadSavedSchedules();
	};

	const loadSchedule = (name: string) => {
		const allSaved = localStorage.getItem("savedSchedules");
		if (!allSaved) return;

		const allSavedJson = JSON.parse(allSaved);
		const savedSchedule = allSavedJson[name];
		if (!savedSchedule) return;

		setCurrentCourses(savedSchedule.courses);
		setCourseData(new Map(Object.entries(savedSchedule.data)));
	};

	const deleteSchedule = (name: string) => {
		let allSaved = localStorage.getItem("savedSchedules");
		if (!allSaved) allSaved = "{}";

		const allSavedJson = JSON.parse(allSaved);
		delete allSavedJson[name];

		localStorage.setItem("savedSchedules", JSON.stringify(allSavedJson));
		loadSavedSchedules();
	};

	useEffect(() => {
		const courseDataString = localStorage.getItem("courseData");
		if (courseDataString) {
			setCourseData(
				new Map(Object.entries(JSON.parse(courseDataString))),
			);
		}

		const currentCoursesString = localStorage.getItem("currentCourses");
		if (currentCoursesString) {
			setCurrentCourses(JSON.parse(currentCoursesString));
		}

		loadSavedSchedules();
	}, []);

	useEffect(() => {
		localStorage.setItem("currentCourses", JSON.stringify(currentCourses));
	}, [currentCourses]);

	useEffect(() => {
		const localObject: any = {};
		courseData.forEach((value, key) => {
			localObject[key] = value;
		});

		localStorage.setItem("courseData", JSON.stringify(localObject));
	}, [courseData]);

	const [inputCourseCode, setInputCourseCode] = useState("");
	const [isFetchingData, setIsFetchingData] = useState(false);

	async function onAddCourse() {
		// Check if the course is already part of the current courses
		if (
			currentCourses.find((course) => course.course === inputCourseCode)
		) {
			console.log("course already added");
			return;
		}

		setIsFetchingData(true);

		// Fetch the course data from the API
		const res = await fetch("/api/courses/" + inputCourseCode);
		if (res.status !== 200) {
			console.log("error");
			setIsFetchingData(false);
			return;
		}

		const resJson = await res.json();

		// If the course data is empty, then the course code is invalid
		if (resJson.data.length === 0) {
			console.log("invalid course");
			setIsFetchingData(false);
			return;
		}

		// Add the data to the course data map
		setCourseData((prev) => {
			const map = new Map(prev);
			map.set(
				inputCourseCode.toUpperCase(),
				resJson.data.map((course: any) => ({
					title: course.title,
					section: course.section,
					teacher: course.teacher,
					periods: course.periods,
					id: course.id,
				})),
			);

			return map;
		});

		// Add the course to the current courses
		setCurrentCourses((prev) => {
			const newData = [
				...prev,
				{
					course: inputCourseCode.toUpperCase(),
					section: resJson.data[0].section,
				},
			];

			return newData;
		});

		setIsFetchingData(false);
	}

	function getValidDispositions() {
		const coursesToTry: CourseData[][] = [];

		for (const course of currentCourses) {
			const data = courseData.get(course.course);

			if (course.section !== -1) {
				// insert the current section into the courses to try
				const sectionCourse = data?.filter(
					(section) => section.section === course.section,
				);

				if (sectionCourse) {
					coursesToTry.push(sectionCourse);
					continue;
				}
			}

			// Since it's -1, we try all the sections
			coursesToTry.push(data ?? []);
		}

		// Find all the permutations of the courses to try. the total
		// number of permutations is the product of the lengths of each
		// array in coursesToTry
		const cartesianProduct = <T extends any>(arrays: T[][]) => {
			const result: any[][] = [];

			const helper = (arr: any[], i: number) => {
				for (let j = 0; j < arrays[i].length; j++) {
					const a = arr.slice(0);
					a.push(arrays[i][j]);
					if (i === arrays.length - 1) {
						result.push(a);
					} else {
						helper(a, i + 1);
					}
				}
			};

			helper([], 0);

			return result;
		};

		const permutations = cartesianProduct(coursesToTry) as CourseData[][];

		// Find which permutations are valid

		const timeToInt = (hours: number, minutes: number) => {
			return hours * 60 + minutes;
		};

		const validPermutations = permutations.filter((permutation) => {
			// Check if there are any overlapping periods
			let days: { start: number; end: number }[][] = [];

			for (let i = 0; i < 5; i++) {
				days.push([]);
			}

			let isValid = true;

			for (const course of permutation) {
				for (const period of course.periods) {
					// Try adding each period of the course to the day
					const day = dayToInt(period.day);
					const daySlots = days[day];

					const startTime = timeToInt(
						period.start_hour,
						period.start_minute,
					);
					const endTime = timeToInt(
						period.end_hour,
						period.end_minute,
					);

					// find if it collides
					for (const slot of daySlots) {
						if (startTime < slot.end && endTime > slot.start) {
							isValid = false;
							break;
						}
					}

					// if it's valid, we push it in
					daySlots.push({
						start: startTime,
						end: endTime,
					});
				}
			}

			return isValid;
		});

		return validPermutations;
	}

	const currentCombinations =
		currentCourses.length > 0 ? getValidDispositions() : [];
	const [combIdx, setCombIdx] = useState(1);

	const nextComb = () => {
		setCombIdx((prev) => Math.min(currentCombinations.length, prev + 1));
	};

	const prevComb = () => {
		setCombIdx((prev) => Math.max(1, prev - 1));
	};

	return (
		<MainLayout>
			<div className="grid grid-cols-2">
				<div className="w-full col-span-2 xl:col-span-1">
					<div>
						<p className="text-2xl pb-1 border-zinc-500 border-b mb-2 text-center">
							Course Selector
						</p>
						<div>
							<p>Add a course</p>
							<div>
								<Input
									placeholder="Course Code"
									height={8}
									value={inputCourseCode}
									onChange={setInputCourseCode}
								/>
								<Button
									variant="solid"
									color="secondary"
									className="w-full mt-2"
									onClick={onAddCourse}
									disabled={isFetchingData}
								>
									{isFetchingData
										? "Fetching course..."
										: "Add Course"}
								</Button>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-2xl pb-1 border-zinc-500 border-b mb-2 text-center">
							Current Courses
						</p>
						<div>
							{currentCourses.map((course, i) => {
								const data = courseData.get(course.course);

								return (
									<CourseDisplay
										key={i}
										course={course}
										data={data ?? []}
										onSectionChange={(section) => {
											const newCourses = [
												...currentCourses,
											];
											newCourses[i].section = section;

											setCurrentCourses(newCourses);
										}}
										onDelete={() => {
											setCurrentCourses((prev) => {
												return prev.filter(
													(_, j) => j !== i,
												);
											});
										}}
									/>
								);
							})}
						</div>
						<p className="opacity-50">
							There are currently {currentCombinations.length}{" "}
							possible schedule(s)
						</p>
					</div>
					<div className="mt-4">
						<p className="text-2xl pb-1 border-zinc-500 border-b mb-2 text-center">
							Save
						</p>
						<Input
							label="Schedule Name"
							placeholder="Name here"
							onChange={(v) => setSaveName(v)}
							value={saveName}
						/>
						<Button
							variant="solid"
							color="primary"
							className="w-full mt-2"
							onClick={onSaveSchedule}
						>
							Save
						</Button>
					</div>
					<div className="mt-4">
						<p className="text-2xl pb-1 border-zinc-500 border-b mb-2 text-center">
							Load
						</p>
						<div className="grid lg:grid-cols-4 gap-2">
							{savedSchedules.length === 0 ? (
								<p className="text-center col-span-4 opacity-50 my-10">
									No saved schedules
								</p>
							) : (
								savedSchedules.map((schedule, i) => (
									<div key={i} className="relative">
										<Button
											variant="solid"
											color="primary"
											className="w-full mt-2"
											onClick={() =>
												loadSchedule(schedule)
											}
										>
											{schedule}
										</Button>
										<div
											className="absolute top-0 right-0 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-mono hover:cursor-pointer hover:bg-red-300"
											onClick={() =>
												deleteSchedule(schedule)
											}
										>
											x
										</div>
									</div>
								))
							)}
						</div>
						<div className="text-2xl pb-1 border-zinc-500 border-b mb-4 text-center mt-3" />
						<p>
							The source code of the project can be found at{" "}
							<a
								href="https://github.com/Jxl-s/vanier-schedule-maker-2"
								className="text-blue-400 hover:text-blue-100"
								target="_blank"
							>
								https://github.com/Jxl-s/vanier-schedule-maker-2
							</a>
							<br />
							It was originally developed in a single day, so the
							interface and features are very basic.
						</p>
						<br />
						<p>
							P.S. There exists an unofficial Vanier Discord
							server, at{" "}
							<a
								href="https://discord.gg/QXbe4dqyr4"
								className="text-blue-400 hover:text-blue-100"
								target="_blank"
							>
								https://discord.gg/QXbe4dqyr4
							</a>
						</p>
					</div>
				</div>
				<div className="w-full col-span-2 xl:col-span-1 mt-2 xl:mt-0">
					<p className="text-2xl pb-1 border-zinc-500 border-b mb-2 text-center">
						Schedule Visualizer
					</p>
					<div className="w-10/12 mx-auto">
						<Schedule
							data={currentCombinations[combIdx - 1] ?? []}
						/>
						<div className="mt-2 grid grid-cols-3">
							<Button
								variant="solid"
								color="primary"
								className="w-full"
								disabled={combIdx <= 1}
								onClick={prevComb}
							>
								{"Previous"}
							</Button>
							<p className="text-center my-auto">
								Schedule {combIdx} of{" "}
								{currentCombinations.length}
							</p>
							<Button
								variant="solid"
								color="primary"
								className="w-full"
								disabled={combIdx >= currentCombinations.length}
								onClick={nextComb}
							>
								{"Next"}
							</Button>
						</div>
						<br />
						<span
							className="w-full text-left text-blue-200 text-lg"
							style={{
								fontFamily: "'Space Mono', monospace",
							}}
						>
							{(currentCombinations[combIdx - 1] ?? []).map(
								(course, i) => (
									<p key={i}>
										{course.id +
											" - " +
											course.section
												.toString()
												.padStart(5, "0") +
											" - " +
											course.title}
									</p>
								),
							)}
						</span>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
