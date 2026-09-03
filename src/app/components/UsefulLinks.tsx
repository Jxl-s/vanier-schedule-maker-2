import { ExternalLink } from "lucide-react";
import { FaDiscord, FaRedditAlien } from "react-icons/fa6";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const links = [
	{
		label: "Vanier subreddit",
		description: "Student discussion and updates",
		href: "https://www.reddit.com/r/VanierCollege/",
		icon: FaRedditAlien,
		iconClassName: "bg-[#ff4500]/10 text-[#ff4500] dark:bg-[#ff4500]/20",
	},
	{
		label: "Vanier Discord",
		description: "Chat with the student community",
		href: "https://discord.com/invite/QXbe4dqyr4",
		icon: FaDiscord,
		iconClassName: "bg-[#5865f2]/10 text-[#5865f2] dark:bg-[#5865f2]/20",
	},
] as const;

export default function UsefulLinks() {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="bg-muted/45 p-3">
				<CardTitle className="text-sm">Useful Vanier Links</CardTitle>
			</CardHeader>
			<CardContent className="p-2">
				<div className="space-y-1">
					{links.map((link) => {
						const Icon = link.icon;
						return (
						<a
							className="group flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
							href={link.href}
							key={link.href}
							rel="noreferrer"
							target="_blank"
						>
							<span
								className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${link.iconClassName}`}
							>
								<Icon aria-hidden="true" className="h-4 w-4" />
							</span>
							<span className="min-w-0 flex-1">
								<span className="block text-xs font-medium">{link.label}</span>
								<span className="block truncate text-[11px] text-muted-foreground">
									{link.description}
								</span>
							</span>
							<ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-current" />
						</a>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
