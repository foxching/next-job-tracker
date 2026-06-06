"use client";

import { Briefcase, User } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import ThemeToggle from "./theme-toggle";
import { useSession } from "@/lib/auth/auth-client";

export default function Navbar() {
    const { data: session } = useSession();
    return (
        <nav className="border-b border-border bg-background">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <Link href="/" className="flex items-center text-xl font-semibold gap-2 text-primary">
                    <Briefcase />
                    Job Tracker
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {
                        session?.user ?
                            <>
                                <Link href="/dashboard">
                                    <Button
                                        variant="ghost"
                                        className="text-foreground hover:text-foreground"
                                    >
                                        Dashboard
                                    </Button>
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant="ghost"
                                            className="relative h-8 w-8 rounded-full"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary text-white">
                                                    {session.user.name[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-56" align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {session.user.name}
                                                    </p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {session.user.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <Link href={`/profile`}>
                                                <DropdownMenuItem>
                                                    <User className="h-4 w-4" />
                                                    <span>Profile</span>
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <SignOutButton />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                            :
                            <>
                                <Link href="/sign-in">
                                    <Button variant="ghost" className="text-foreground hover:text-foreground">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button className="bg-primary hover:bg-primary/90">
                                        Start for free
                                    </Button>
                                </Link>
                            </>
                    }

                </div>
            </div>
        </nav>
    )
}
