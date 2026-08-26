"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { logout } from "@/api/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useRouter } from "@/i18n/navigation";

export function DashboardNavbar() {
    const common = useTranslations("Common");
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            await logout();
        } finally {
            router.replace("/login");
        }
    }

    return (
        <nav className="dashboard-navbar">
            <a className="brand" href="#main-content">
                <span className="brand-mark small" aria-hidden="true">
                    S
                </span>

                {common("brand")}
            </a>

            <div className="header-actions">
                <LanguageSwitcher />

                <button
                    className="logout-button"
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? common("loading") : common("logout")}
                </button>
            </div>
        </nav>
    );
}