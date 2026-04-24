import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";

export const auth = betterAuth({
    database: mongodbAdapter(await getDb()),
    emailAndPassword: {
        enabled: true,
    },

});

export async function getSession() {
    const result = await auth.api.getSession({
        headers: await headers(),
    });

    return result;
}

export async function signOut() {
    const result = await auth.api.signOut({
        headers: await headers(),
    });

    if (result.success) {
        redirect("/sign-in");
    }
}
