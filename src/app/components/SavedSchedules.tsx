import { useState, type FormEvent } from "react";
import { FolderOpen, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SavedSchedulesProps {
	names: string[];
	onDelete: (name: string) => void;
	onLoad: (name: string) => void;
	onSave: (name: string) => string | null;
}

export default function SavedSchedules({
	names,
	onDelete,
	onLoad,
	onSave,
}: SavedSchedulesProps) {
	const [name, setName] = useState("");
	const [message, setMessage] = useState<string | null>(null);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const scheduleName = name.trim();
		if (!scheduleName) {
			setMessage("Enter a schedule name.");
			return;
		}

		const error = onSave(scheduleName);
		if (error) {
			setMessage(error);
			return;
		}

		setName("");
		setMessage("Saved.");
	}

	function handleLoad(savedName: string) {
		if (window.confirm(`Are you sure you want to load "${savedName}"?`)) {
			onLoad(savedName);
		}
	}

	function handleDelete(savedName: string) {
		if (window.confirm(`Are you sure you want to delete "${savedName}"?`)) {
			onDelete(savedName);
		}
	}

	return (
		<Card className="overflow-hidden">
			<CardHeader className="bg-muted/45 p-3">
				<CardTitle className="flex items-center justify-between text-sm">
					Saved schedules
					<span className="min-w-5 rounded-full bg-secondary px-1.5 py-0.5 text-center text-[11px] font-medium text-secondary-foreground">
						{names.length}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="p-3">
				<form className="flex gap-2" onSubmit={handleSubmit}>
					<Input
						aria-label="Schedule name"
						className="h-8 text-xs"
						onChange={(event) => setName(event.target.value)}
						placeholder="Schedule name"
						value={name}
					/>
					<Button aria-label="Save schedule" className="h-8 w-8" size="icon" type="submit">
						<Save className="h-3.5 w-3.5" />
					</Button>
				</form>
				{message ? (
					<p aria-live="polite" className="mt-1.5 text-xs text-muted-foreground">
						{message}
					</p>
				) : null}

				{names.length > 0 ? (
					<div className="mt-2 space-y-1">
						{names.map((savedName) => (
							<div className="flex items-center gap-1" key={savedName}>
								<Button
									className="h-8 min-w-0 flex-1 justify-start px-2 text-xs"
									onClick={() => handleLoad(savedName)}
									variant="outline"
								>
									<FolderOpen className="mr-1.5 h-3.5 w-3.5 shrink-0" />
									<span className="truncate">{savedName}</span>
								</Button>
								<Button
									aria-label={"Delete saved schedule " + savedName}
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									onClick={() => handleDelete(savedName)}
									size="icon"
									variant="ghost"
								>
									<X className="h-3.5 w-3.5" />
								</Button>
							</div>
						))}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
