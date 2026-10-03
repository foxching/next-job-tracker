import mongoose, { Schema, Document } from "mongoose";

export interface ICardDisplaySettings {
    showSalary: boolean;
    showAppliedDate: boolean;
    showTags: boolean;
}

export interface ISortingSettings {
    field: "createdAt" | "company" | "position" | "manual";
    direction: "asc" | "desc";
}

export interface IBoardSettings {
    cardDisplay: ICardDisplaySettings;
    sorting: ISortingSettings;
}

export interface IBoard extends Document {
    name: string;
    description: string;
    themeColor: string;
    backgroundImageUrl: string;
    backgroundImage?: string;
    userId: string;
    columns: mongoose.Types.ObjectId[];
    isActive?: boolean;
    settings: IBoardSettings;
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
        backgroundImageUrl: {
            type: String,
            default: "",
        },
        backgroundImage: {
            type: String,
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
        settings: {
            cardDisplay: {
                showSalary: {
                    type: Boolean,
                    default: true,
                },
                showAppliedDate: {
                    type: Boolean,
                    default: false,
                },
                showTags: {
                    type: Boolean,
                    default: true,
                },
            },
            sorting: {
                field: {
                    type: String,
                    enum: ["createdAt", "company", "position", "manual"],
                    default: "createdAt",
                },
                direction: {
                    type: String,
                    enum: ["asc", "desc"],
                    default: "desc",
                },
            },
        },
    },
    {
        timestamps: true,
    }
);

const existingBoardModel = mongoose.models.Board;
if (existingBoardModel && !existingBoardModel.schema.path("backgroundImageUrl")) {
    delete mongoose.models.Board;
}

export default mongoose.models.Board ||
    mongoose.model<IBoard>("Board", BoardSchema);