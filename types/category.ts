export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_slug: string;

  name_i18n: {
    en: string;
    ar: string;
  };

  description_i18n: {
    en: string;
    ar: string;
  };
}

export interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  name_i18n: {
    en: string;
    ar: string;
  };

  description_i18n: {
    en: string;
    ar: string;
  };

  subcategories: Subcategory[];
}

export interface CategoriesResponse {
  categories: Category[];
}