"use client";

import { Plus } from "lucide-react";
import { Board } from "@/lib/models/models.types";
import { BoardProvider, useBoardContext } from "./board-provider";
import BoardMenu from "./board-menu";
import BoardSwitcher from "./board-swticher";
import EditableBoardTitle from "./editable-board-title";
import KanbanBoard from "./kanban-board";
import { Button } from "./ui/button";

function DashboardBoardContent({ boards }: { boards: Board[] }) {
    const { board, isSwitchingBoard } = useBoardContext();

    return (
        <>
            <div
                className={`mb-6 flex flex-col gap-4 px-2 transition-opacity duration-200 ease-out md:flex-row md:items-end md:justify-between ${isSwitchingBoard ? "opacity-60" : "opacity-100"
                    }`}
            >
                <div className="flex items-center gap-4">
                    <EditableBoardTitle
                        key={`${board._id}-${board.name}`}
                        boardId={board._id}
                        initialName={board.name}
                    />
                    <BoardSwitcher boards={boards} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <BoardMenu />
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New application
                    </Button>
                </div>
            </div>
            <div
                className={`flex-1 overflow-hidden transition-all duration-300 ease-out ${isSwitchingBoard ? "translate-y-1 opacity-40" : "translate-y-0 opacity-100"
                    }`}
            >
                <KanbanBoard />
            </div>
        </>
    );
}

export default function DashboardBoardShell({
    board,
    boards,
}: {
    board: Board;
    boards: Board[];
}) {
    return (
        <BoardProvider key={board._id} initialBoard={board} initialBoards={boards}>
            <DashboardBoardContent boards={boards} />
        </BoardProvider>
    );
}
