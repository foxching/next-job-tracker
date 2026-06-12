import mongoose, { Schema, Document } from "mongoose";

export interface IColumn extends Document {
    name: string;
    boardId: mongoose.Types.ObjectId;
    order: number;
    icon: string;
    color: string;
    jobApplications: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

// Board -> Columns -> JobApplications

const ColumnSchema = new Schema<IColumn>(
    {
        name: {
            type: String,
            required: true,
        },
        boardId: {
            type: Schema.Types.ObjectId,
            ref: "Board",
            required: true,
            index: true,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
        icon: {
            type: String,
            required: true,
            default: "Calendar",
        },
        color: {
            type: String,
            required: true,
            default: "bg-cyan-500",
        },
        jobApplications: [
            {
                type: Schema.Types.ObjectId,
                ref: "JobApplication",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const ColumnModel = mongoose.models.Column as mongoose.Model<IColumn> | undefined;

const Column =
    ColumnModel &&
        ColumnModel.schema.path("icon") &&
        ColumnModel.schema.path("color")
        ? ColumnModel
        : mongoose.model<IColumn>("Column", ColumnSchema);

export default Column;