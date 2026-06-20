
"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CardDisplayFormValues } from "@/lib/models/models.types";

type CardDisplayTabProps = {
    values: CardDisplayFormValues;
    onChange: (values: CardDisplayFormValues) => void;
};

export default function CardDisplayTab({ values, onChange }: CardDisplayTabProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium">Visibility</p>
                    <p className="text-xs text-muted-foreground">
                        Control what shows on each job card
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-salary" className="font-normal">
                                Show salary on cards
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Display salary range below job title
                            </p>
                        </div>
                        <Switch
                            id="show-salary"
                            checked={values.showSalary}
                            onCheckedChange={(checked) =>
                                onChange({ ...values, showSalary: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-date" className="font-normal">
                                Show applied date
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Date each job was added
                            </p>
                        </div>
                        <Switch
                            id="show-date"
                            checked={values.showAppliedDate}
                            onCheckedChange={(checked) =>
                                onChange({ ...values, showAppliedDate: checked })
                            }
                        />

                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-tags" className="font-normal">
                                Show tags & labels
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Priority, remote, job type badges
                            </p>
                        </div>
                        <Switch
                            id="show-tags"
                            checked={values.showTags}
                            onCheckedChange={(checked) =>
                                onChange({ ...values, showTags: checked })
                            }
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}