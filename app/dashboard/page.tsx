import KanbanBoard from "@/components/kanban-board";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Settings } from "lucide-react";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string) {
    "use cache";

    await connectDB();

    const boardDoc = await Board.findOne({
        userId: userId,
        name: "Job Hunt",
    }).populate({
        path: "columns",
        populate: {
            path: "jobApplications",
        },
    });

    if (!boardDoc) return null;

    const board = JSON.parse(JSON.stringify(boardDoc));

    return board;
}

async function DashboardPage() {
    const session = await getSession();
    const board = await getBoard(session?.user.id ?? "");

    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <div className="h-[calc(100vh-5rem)] bg-background text-foreground overflow-hidden">
            <div className="flex h-full flex-col w-full px-6 py-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{board?.name}</h1>
                        <p className="text-muted-foreground">Track your job applications</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="inline-flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Board menu
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add column
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Board settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Export board
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New application
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard board={board} />
                </div>
            </div>
        </div>
    )
}
export default async function Dashboard() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
        </Suspense>
    );
}