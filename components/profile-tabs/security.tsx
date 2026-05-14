import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Security() {
    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">
                Security
            </h1>

            <div className="space-y-5">

                <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" />
                </div>

                <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" />
                </div>

                <Button>
                    Update Password
                </Button>

            </div>
        </>
    );
}