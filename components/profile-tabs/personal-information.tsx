import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
    userId: string;
};

export default function PersonalInformation({
    userId,
}: Props) {
    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">
                Personal Information
            </h1>

            <div className="space-y-5">

                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input defaultValue="John Doe" />
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue="john@example.com" />
                </div>

                <div className="text-sm text-gray-500">
                    User ID: {userId}
                </div>

                <Button>
                    Save Changes
                </Button>

            </div>
        </>
    );
}