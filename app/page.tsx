"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVendorStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { auth, isHydrated } = useVendorStore();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(auth.isAuthenticated ? "/dashboard" : "/login");
  }, [auth.isAuthenticated, isHydrated, router]);

  return null;
}
