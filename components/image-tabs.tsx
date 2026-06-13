"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "./theme-provider";

export default function ImageTabs() {
    const [activeTab, setActiveTab] = useState("organize"); // organize, hired, boards
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    console.log("isDark", isDark);

    return (
        <section className="border-t border-border bg-background py-16">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Tabs */}
                    <div className="flex gap-2 justify-center mb-8">
                        <Button
                            onClick={() => setActiveTab("organize")}
                            className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${activeTab === "organize"
                                ? "bg-primary text-white"
                                : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            Organize Applications
                        </Button>
                        <Button
                            onClick={() => setActiveTab("hired")}
                            className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${activeTab === "hired"
                                ? "bg-primary text-white"
                                : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            Get Hired
                        </Button>
                        <Button
                            onClick={() => setActiveTab("boards")}
                            className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${activeTab === "boards"
                                ? "bg-primary text-white"
                                : "bg-muted text-foreground hover:bg-muted/80"
                                }`}
                        >
                            Manage Boards
                        </Button>
                    </div>
                    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border border-border shadow-xl">
                        {activeTab === "organize" && (
                            <Image
                                src={isDark ? "/hero-images/hero1-dark.png" : "/hero-images/hero1-light.png"}
                                alt="Organize Applications"
                                width={1200}
                                height={800}
                            />
                        )}

                        {activeTab === "hired" && (
                            <Image
                                src={isDark ? "/hero-images/hero2-dark.png" : "/hero-images/hero2-light.png"}
                                alt="Organize Applications"
                                width={1200}
                                height={800}
                            />
                        )}

                        {activeTab === "boards" && (
                            <Image
                                src={isDark ? "/hero-images/hero3-dark.png" : "/hero-images/hero3-light.png"}
                                alt="Organize Applications"
                                width={1200}
                                height={800}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}