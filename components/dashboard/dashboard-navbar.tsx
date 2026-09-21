"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { logout } from "@/api/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useStore } from "@/hook/queries/use-store";
import Image from "next/image";

export function DashboardNavbar() {
    const common = useTranslations("Common");
    const t = useTranslations("Dashboard");
    const pathname = usePathname();
    const { data, isPending } = useStore();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const store = data?.store;

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
                <div className="dashboard-navbar-store">
                    {store?.logo_url ? (
                        <Image
                            src={store.logo_url}
                            alt={store.name}
                            width={40}
                            height={40}
                            className="dashboard-navbar-store-logo"
                        />
                    ) : (
                        <div className="dashboard-navbar-store-logo-fallback">
                            {store?.name?.charAt(0).toUpperCase() ?? "S"}
                        </div>
                    )}

                    <div className="dashboard-navbar-store-info">
                        <strong>
                            {isPending
                                ? t("loadingStore")
                                : store?.name ?? t("store")}
                        </strong>
                    </div>
                </div>
            </a>

            <div className="dashboard-navbar-links">
                <Link
                    href="/products"
                    className={`dashboard-navbar-link ${pathname.startsWith("/products") ? "active" : ""
                        }`}
                >
                    {t("products")}
                </Link>

                <Link
                    href="/store"
                    className={`dashboard-navbar-link ${pathname.startsWith("/store") ? "active" : ""
                        }`}
                >
                    {t("storeSettings")}
                </Link>
            </div>

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