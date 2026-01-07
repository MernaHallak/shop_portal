"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVendorStore } from "@/lib/store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { auth, isHydrated } = useVendorStore();

  React.useEffect(() => {
    if (!isHydrated) return;
    if (!auth.isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [auth.isAuthenticated, isHydrated, pathname, router]);

  if (!isHydrated) return null;
  if (!auth.isAuthenticated) return null;

  return <>{children}</>;
}
