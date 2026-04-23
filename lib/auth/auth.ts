import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "@/lib/db";

export const auth = betterAuth({
    database: mongodbAdapter(await getDb()),
    emailAndPassword: {
        enabled: true,
    },
    // ...rest of config
});