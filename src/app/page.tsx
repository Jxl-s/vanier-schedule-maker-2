import ScheduleBuilder from "./components/ScheduleBuilder";
import { getCourseCatalog } from "@/lib/course-catalog.server";

export default function HomePage() {
	return <ScheduleBuilder courseSuggestions={getCourseCatalog()} />;
}
