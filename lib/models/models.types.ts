export type SortField =
    | "createdAt"
    | "company"
    | "position"
    | "manual";

export type SortDirection =
    | "asc"
    | "desc";

export interface JobApplication {
    _id: string;
    company: string;
    position: string;
    location?: string;
    status: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    order: number;
    columnId?: string;
    tags?: string[];
    appliedDate?: string;
    description?: string;
    createdAt: string
}

export interface Column {
    _id: string;
    name: string;
    order: number;
    icon?: string;
    color?: string;
    jobApplications: JobApplication[];
}

export interface Board {
    _id: string;
    name: string;
    description?: string;
    themeColor?: string;
    columns: Column[];
    isActive: boolean;
    settings?: {
        cardDisplay?: {
            showSalary: boolean;
            showAppliedDate: boolean;
            showTags: boolean;
        }
        sorting?: {
            field: SortField;
            direction: SortDirection
        }
    }
}

//BOARD SETTINGS
export type GeneralFormValues = {
    name: string;
    description: string;
    themeColor: string;
};

export type CardDisplayFormValues = {
    showSalary: boolean;
    showAppliedDate: boolean;
    showTags: boolean;
};

export type ColumnFormValues = {
    [columnId: string]: {
        name: string;
    };
};

export type SortingFormValues = {
    field: "createdAt" | "company" | "position" | "manual";
    direction: "asc" | "desc";
};