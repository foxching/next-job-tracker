import KanbanBoard from "@/components/kanban-board";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import EditableBoardTitle from "@/components/editable-board-title";
import BoardMenu from "@/components/board-menu";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string) {
    await connectDB();

    const boardDoc = await Board.findOne({
        userId: userId,
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
                        {board && <EditableBoardTitle boardId={board._id} initialName={board.name} />}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <BoardMenu boardId={board._id} />
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New application
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {board ? <KanbanBoard board={board} /> : <div className="flex items-center justify-center h-full text-muted-foreground">No board found</div>}
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