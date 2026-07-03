"use client"

import { Plus, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CreateBoardDialog from "./create-board-dialog";
import { Board } from "@/lib/models/models.types";
import { setActiveBoard } from "@/lib/actions/board";
import { useOptionalBoardContext } from "./board-provider";

interface BoardSwitcherProps {
    boards: Board[];
}

export default function BoardSwitcher({ boards }: BoardSwitcherProps) {
    const boardContext = useOptionalBoardContext();
    const router = useRouter();
    const [showAddBoardDialog, setShowAddBoardDialog] = useState(false);
    const [isPending, startTransition] = useTransition();
    const visibleBoards = boardContext?.boards.length ? boardContext.boards : boards;
    const isSwitching = boardContext?.isSwitchingBoard || isPending;

    const handleSwitchBoard = (boardId: string) => {
        if (boardContext) {
            startTransition(() => {
                void boardContext.switchBoard(boardId);
            });
            return;
        }

        startTransition(async () => {
            await setActiveBoard(boardId);
            router.refresh();
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="inline-flex items-center gap-2"
                        disabled={isSwitching}
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {isSwitching ? "Switching" : "Switch board"}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {visibleBoards.length > 0 && visibleBoards.map((board) => (
                        <DropdownMenuItem
                            key={board._id}
                            disabled={isSwitching || board.isActive}
                            onClick={() => handleSwitchBoard(board._id)}
                        >
                            {board.name}
                            {board.isActive && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                    Active
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))}
                    {visibleBoards.length > 0 && (
                        <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem onClick={() => setShowAddBoardDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create new board
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {showAddBoardDialog && (
                <CreateBoardDialog
                    open={showAddBoardDialog}
                    onOpenChange={setShowAddBoardDialog}
                />
            )}
        </>
    );
}
