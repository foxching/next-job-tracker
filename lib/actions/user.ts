"use server";

import { auth } from "../auth/auth";
import { headers } from "next/headers";

type UpdatePasswordInput = {
    currentPassword: string;
    newPassword: string;
};

type UpdateProfileInput = {
    name: string;
    title?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    bio?: string;
};

export async function updateName({ name }: { name: string }) {
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

export async function updateUserProfile({
    name,
    title,
    company,
    phone,
    location,
    website,
    linkedin,
    bio,
}: UpdateProfileInput) {
    if (!name) {
        throw new Error("Name is required");
    }

    await auth.api.updateUser({
        headers: await headers(),
        body: {
            name,
            title,
            company,
            phone,
            location,
            website,
            linkedin,
            bio,
        },
    });

    return {
        success: true,
    };
}

export async function updatePassword({ currentPassword, newPassword }: UpdatePasswordInput) {
    if (!currentPassword) {
        throw new Error("Current password is required");
    }

    if (!newPassword) {
        throw new Error("New password is required");
    }

    await auth.api.changePassword({
        headers: await headers(),
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: false,
        },
    });

    return {
        success: true,
    };
}
