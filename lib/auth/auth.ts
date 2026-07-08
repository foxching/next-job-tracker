import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";

export const auth = betterAuth({
    database: mongodbAdapter(await getDb()),
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            title: {
                type: "string",
                required: false,
            },
            company: {
                type: "string",
                required: false,
            },
            phone: {
                type: "string",
                required: false,
            },
            location: {
                type: "string",
                required: false,
            },
            website: {
                type: "string",
                required: false,
            },
            linkedin: {
                type: "string",
                required: false,
            },
            bio: {
                type: "string",
                required: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    if (user.id) {
                        await initializeUserBoard(user.id);
                    }
                },
            },
        },
    },
});

export async function getSession() {
    const result = await auth.api.getSession({
        headers: await headers(),
        query: { disableCookieCache: true },
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
