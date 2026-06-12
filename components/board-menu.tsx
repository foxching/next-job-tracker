"use client"

import { Plus, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useState } from "react";
import CreateColumnDialog from "./create-column-dialog";

interface BoardMenuProps {
    boardId: string;
}

export default function BoardMenu({ boardId }: BoardMenuProps) {
    const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Board menu
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAddColumnDialog(true)}>
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
            <CreateColumnDialog
                boardId={boardId}
                open={showAddColumnDialog}
                onOpenChange={setShowAddColumnDialog}
            />
        </>
    );
}
