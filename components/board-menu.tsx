"use client"

import { Settings, MoreHorizontal, Info, Star, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import BoardSettingsDialog from "./board-settings-dialog";
import { useBoardContext } from "./board-provider";
import { BOARD_BACKGROUND_OPTIONS } from "@/lib/models/models.types";
import { updateBoardBackground } from "@/lib/actions/board";
import { toast } from "sonner";

export default function BoardMenu() {
    const [showBoardSettingsDialog, setShowBoardSettingsDialog] = useState(false);
    const { board, patchBoard } = useBoardContext();

    const handleBackgroundChange = async (backgroundImage: string) => {
        if (backgroundImage === board.backgroundImageUrl) {
            return;
        }

        const previousBackgroundImageUrl = board.backgroundImageUrl;
        patchBoard({ backgroundImageUrl: backgroundImage });

        try {
            const result = await updateBoardBackground(board._id, backgroundImage);
            if (result.error) {
                patchBoard({ backgroundImageUrl: previousBackgroundImageUrl });
                toast.error(result.error);
                return;
            }

            patchBoard({ backgroundImageUrl: result.backgroundImageUrl });
            toast.success("Board background updated.");
        } catch (error) {
            patchBoard({ backgroundImageUrl: previousBackgroundImageUrl });
            console.error("Failed to update board background", error);
            toast.error("Failed to update board background.");
        }
    };

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
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Change background
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                            {BOARD_BACKGROUND_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                    key={option.image}
                                    onClick={() => void handleBackgroundChange(option.image)}
                                >
                                    {option.label}
                                    {board.backgroundImageUrl === option.image && (
                                        <Check className="ml-auto h-4 w-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
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
