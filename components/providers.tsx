"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { VendorStoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <VendorStoreProvider>{children}</VendorStoreProvider>
    </ThemeProvider>
  );
}
