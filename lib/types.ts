export type ProductCategory =
  | "business"
  | "gaming"
  | "ultrabook"
  | "workstation"
  | "budget"
  | "2in1";

export type ProductCondition = "new" | "refurbished" | "excellent" | "good" | "fair";

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  business: "Business Laptop",
  gaming: "Gaming Laptop",
  ultrabook: "Ultrabook",
  workstation: "Workstation",
  budget: "Budget Laptop",
  "2in1": "2-in-1 Convertible",
};

export const CONDITION_LABEL: Record<ProductCondition, string> = {
  new: "Brand New",
  refurbished: "Refurbished",
  excellent: "Excellent (Used)",
  good: "Good (Used)",
  fair: "Fair (Used)",
};

export interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  screen: string;
  condition: ProductCondition;
  warranty: string;
  description: string;
  category: ProductCategory;
  visible: boolean;
  image?: string; // data URL or remote URL
}

export interface VendorProfile {
  shopName: string;
  city: string;
  whatsapp: string;
  description: string;
  logo?: string; // data URL or remote URL
}

export interface VendorAuth {
  isAuthenticated: boolean;
  email?: string;
}
