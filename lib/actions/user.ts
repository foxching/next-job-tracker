"use server";
//import { auth } from "../auth";     // auth.ts is at lib/auth.ts ✅
//import { auth } from "./auth";      // auth.ts is at lib/actions/auth.ts
//import { auth } from "../../auth";  // auth.ts is at the project root
import { auth } from "../auth/auth";  // auth.ts is at lib/auth/auth.ts ✅
import { headers } from "next/headers";

export async function updateName(formData: FormData) {
    const name = formData.get("name") as string;

    if (!name) {
        throw new Error("Name is required");
    }

    await auth.api.updateUser({
        headers: await headers(),
        body: {
            name,
        },
    });

    return {
        success: true,
    };
}