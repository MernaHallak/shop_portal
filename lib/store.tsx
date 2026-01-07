"use client";

import * as React from "react";
import type { Product, VendorAuth, VendorProfile } from "./types";
import { seedProducts, seedProfile } from "./seed";

type VendorState = {
  auth: VendorAuth;
  products: Product[];
  profile: VendorProfile;
  isHydrated: boolean;
};

type VendorActions = {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: number, patch: Partial<Omit<Product, "id">>) => void;
  toggleVisibility: (id: number) => void;
  removeProduct: (id: number) => void;

  updateProfile: (patch: Partial<VendorProfile>) => void;
  resetAll: () => void;
};

type VendorStore = VendorState & VendorActions;

const STORAGE_KEY = "vendor_portal:v1";
const DEMO_EMAIL = "vendor@example.com";
const DEMO_PASSWORD = "password";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function persist(state: Omit<VendorState, "isHydrated">) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const VendorStoreContext = React.createContext<VendorStore | null>(null);

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<VendorState>({
    auth: { isAuthenticated: false },
    products: seedProducts,
    profile: seedProfile,
    isHydrated: false,
  });

  // Hydrate from localStorage (client-only)
  React.useEffect(() => {
    const stored = safeParse<Omit<VendorState, "isHydrated">>(localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setState({ ...stored, isHydrated: true });
    } else {
      setState((s) => ({ ...s, isHydrated: true }));
    }
  }, []);

  // Persist on change (after hydration)
  React.useEffect(() => {
    if (!state.isHydrated) return;
    persist({ auth: state.auth, products: state.products, profile: state.profile });
  }, [state.auth, state.products, state.profile, state.isHydrated]);

  const actions = React.useMemo<VendorActions>(() => {
    return {
      login: async (email: string, password: string) => {
        // simulate small delay
        await new Promise((r) => setTimeout(r, 300));
        if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
          setState((s) => ({ ...s, auth: { isAuthenticated: true, email } }));
          return true;
        }
        return false;
      },
      logout: () => setState((s) => ({ ...s, auth: { isAuthenticated: false } })),

      addProduct: (product) => {
        const nextId = Math.max(0, ...state.products.map((p) => p.id)) + 1;
        const created: Product = { id: nextId, ...product };
        setState((s) => ({ ...s, products: [created, ...s.products] }));
        return created;
      },

      updateProduct: (id, patch) => {
        setState((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
      },

      toggleVisibility: (id) => {
        setState((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)),
        }));
      },

      removeProduct: (id) => {
        setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
      },

      updateProfile: (patch) => {
        setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
      },

      resetAll: () => {
        setState({ auth: { isAuthenticated: false }, products: seedProducts, profile: seedProfile, isHydrated: true });
      },
    };
  }, [state.products]);

  const value: VendorStore = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore(): VendorStore {
  const ctx = React.useContext(VendorStoreContext);
  if (!ctx) throw new Error("useVendorStore must be used within VendorStoreProvider");
  return ctx;
}
