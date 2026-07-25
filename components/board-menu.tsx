"use client"

import { Settings, ChevronDown, MoreHorizontal, Info, Star } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useState } from "react";
import BoardSettingsDialog from "./board-settings-dialog";
import { useBoardContext } from "./board-provider";

export default function BoardMenu() {
    const [showBoardSettingsDialog, setShowBoardSettingsDialog] = useState(false);
    const { board } = useBoardContext();


    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="More board actions"
                        title="More board actions"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Info className="mr-2 h-4 w-4" />
                        About
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Star className="mr-2 h-4 w-4" />
                        Star
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowBoardSettingsDialog(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {showBoardSettingsDialog && (
                <BoardSettingsDialog
                    board={board}
                    open={showBoardSettingsDialog}
                    onOpenChange={setShowBoardSettingsDialog}
                />
            )}
        </>
    );
}
