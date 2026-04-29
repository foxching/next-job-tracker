import { Board, Column } from "@/lib/models/models.types";
import { Award, Calendar, CheckCircle2, Mic, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./ui/card";

interface KanbanBoardProps {
    board: Board;
    userId: string;
}
interface ColConfig {
    color: string;
    icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
    {
        color: "bg-cyan-500",
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        color: "bg-purple-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    {
        color: "bg-yellow-500",
        icon: <Award className="h-4 w-4" />,
    },
    {
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4" />,
    },
];

function DroppableColumn({ column, config, boardId }: { column: Column, config: ColConfig, boardId: string }) {
    return (
        <Card>
            <CardHeader className={`${config.color}`}>
                <div className="">
                    <div>{config.icon}</div>
                    <CardTitle>{column.name}</CardTitle>
                </div>
            </CardHeader>
        </Card>
    );
}

export default function KanbanBoard({ board, userId }: KanbanBoardProps) {
    const columns = board?.columns || [];

    return (
        <>
            <div>
                <div>
                    {columns.map((col, key) => {
                        const config = COLUMN_CONFIG[key] || { color: "bg-gray-500", icon: <Calendar className="h-4 w-4" /> };
                        return (
                            <DroppableColumn key={key} column={col} config={config} boardId={board._id} />
                        )
                    })}
                </div>
            </div>
        </>

    )
}