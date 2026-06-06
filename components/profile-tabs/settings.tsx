import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === "dark";

    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">
                Settings
            </h1>

            <div className="space-y-4">

                {/* Email Notifications */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Email Notifications</span>

                    <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${emailNotifications ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-5" : ""
                                }`}
                        />
                    </button>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Dark Mode</span>

                    <button
                        onClick={toggleTheme}
                        className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${darkMode ? "translate-x-5" : ""
                                }`}
                        />
                    </button>
                </div>

            </div>
        </>
    );
}