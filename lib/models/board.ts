import mongoose, { Schema, Document } from "mongoose";

export interface IBoard extends Document {
    name: string;
    description: string;
    themeColor: string;
    userId: string;
    columns: mongoose.Types.ObjectId[];
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        themeColor: {
            type: String,
            default: "#7F77DD",
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        columns: [
            {
                type: Schema.Types.ObjectId,
                ref: "Column",
            },
        ],
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Board ||
    mongoose.model<IBoard>("Board", BoardSchema);