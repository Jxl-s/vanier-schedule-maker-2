import { formatSection } from "@/lib/course-code";
import {
	DAYS,
	formatTime,
	SCHEDULE_END_MINUTES,
	SCHEDULE_START_MINUTES,
	SLOT_MINUTES,
	dayToIndex,
	timeToMinutes,
} from "@/lib/schedule";
import type { CoursePeriod, CourseSection } from "@/types/schedule";

interface ScheduleProps {
	courseColors: Record<string, number>;
	data: CourseSection[];
}

interface CourseCell {
	course: CourseSection;
	period: CoursePeriod;
	rowSpan: number;
}

type ScheduleCell = CourseCell | "occupied" | null;

function calculateScheduleCells(data: CourseSection[]): ScheduleCell[][] {
	const rowCount =
		(SCHEDULE_END_MINUTES - SCHEDULE_START_MINUTES) / SLOT_MINUTES;
	const table = Array.from({ length: rowCount }, () =>
		Array<ScheduleCell>(DAYS.length).fill(null),
	);

	for (const course of data) {
		for (const period of course.periods) {
			const dayIndex = dayToIndex(period.day);
			const start = timeToMinutes(period.start_hour, period.start_minute);
			const end = timeToMinutes(period.end_hour, period.end_minute);
			const rowIndex = Math.round(
				(start - SCHEDULE_START_MINUTES) / SLOT_MINUTES,
			);
			const rowSpan = Math.max(1, Math.round((end - start) / SLOT_MINUTES));

			if (
				dayIndex < 0 ||
				rowIndex < 0 ||
				rowIndex >= table.length ||
				end <= start
			) {
				continue;
			}

			table[rowIndex][dayIndex] = {
				course,
				period,
				rowSpan: Math.min(rowSpan, table.length - rowIndex),
			};

			for (let offset = 1; offset < rowSpan; offset += 1) {
				if (table[rowIndex + offset]) {
					table[rowIndex + offset][dayIndex] = "occupied";
				}
			}
		}
	}

	return table;
}

export default function Schedule({ courseColors, data }: ScheduleProps) {
	const scheduleTable = calculateScheduleCells(data);

	return (
		<div
			aria-label="Weekly schedule"
			className="schedule-scroll overflow-hidden"
			role="region"
			tabIndex={0}
		>
			<table className="schedule-table w-full table-fixed border-collapse">
				<caption className="sr-only">
					Weekly course schedule from 8:00 to 18:00
				</caption>
				<thead>
					<tr>
						<th className="time-column" scope="col" />
						{DAYS.map((day) => (
							<th key={day} scope="col">
								{day}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{scheduleTable.map((row, rowIndex) => {
						const startTime =
							SCHEDULE_START_MINUTES + rowIndex * SLOT_MINUTES;
						const endTime = startTime + SLOT_MINUTES;

						return (
							<tr key={startTime}>
								<th className="time-column" scope="row">
									{formatTime(startTime)}
									<br />
									{formatTime(endTime)}
								</th>
								{row.map((cell, dayIndex) => {
									if (cell === "occupied") return null;

									if (cell === null) {
										return <td key={DAYS[dayIndex]} />;
									}

									const { course, period, rowSpan } = cell;
									return (
										<td
											className={`course-cell course-color-${courseColors[course.id] ?? 0}`}
											key={[course.id, course.section, period.day, startTime].join("-")}
											rowSpan={rowSpan}
										>
											<strong>{course.title.slice(0, 20)}</strong>
											<br />
											{course.id} - {formatSection(course.section)}
											<br />
											{course.teacher}
											<br />
											{period.room || "..."}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
