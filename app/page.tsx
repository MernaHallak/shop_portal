"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVendorStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useVendorStore();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, isHydrated, router]);

  return null;
}
