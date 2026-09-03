import ScheduleBuilder from "./components/ScheduleBuilder";
import { getCourseCatalog } from "@/lib/course-catalog.server";
import "./index.css";

export default function HomePage() {
	return <ScheduleBuilder courseSuggestions={getCourseCatalog()} />;
}
