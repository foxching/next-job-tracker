import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BoardSwitcher from "@/components/board-swticher";
import DashboardBoardShell from "@/components/dashboard-board-shell";

async function getBoard(userId: string) {
    await connectDB();

    const boardDoc = await Board.findOne({
        userId: userId,
        isActive: true,
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

async function getBoards(userId: string) {
    await connectDB();

    const boardDocs = await Board.find({
        userId,
    })
        .sort({ createdAt: 1 })
        .lean();

    return boardDocs.map((board) => ({
        _id: board._id.toString(),
        name: board.name,
        columns: [], // We don't need columns for the board switcher
        isActive: board.isActive,
    }));
}

async function DashboardPage() {
    const session = await getSession();
    const board = await getBoard(session?.user.id ?? "");
    const boards = await getBoards(session?.user.id ?? "");
    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <div className="h-[calc(100vh-5rem)] bg-background text-foreground overflow-x-auto overflow-y-hidden">
            < div className="flex h-full flex-col w-full px-2 py-2" >
                {board ? (
                    <DashboardBoardShell board={board} boards={boards} />
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between px-2">
                            <BoardSwitcher boards={boards} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No board found
                            </div>
                        </div>
                    </>
                )}
            </div >
        </div >
    )
}
export default async function Dashboard() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
        </Suspense>
    );
}