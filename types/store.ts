import { LocalizedText } from "./product";

export interface Store {
  id: string;
  name: string;
  slug: string;

  description: string | null;
  location: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;

  logo_url: string | null;
  cover_url: string | null;

  phone: string | null;

  whatsapp_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;

  social_links: Record<string, string>; //بتفيدك إذا بدك تضيفي منصات إضافية ما إلها field مستقل بالـ API

  name_ar: string | null;
  description_ar: string | null;
  location_ar: string | null;

  name_i18n?: LocalizedText | null;
  description_i18n?: LocalizedText | null;
  location_i18n?: LocalizedText | null;
}

export interface StoreResponse {
  store: Store;
}

export interface UpdateStoreRequest {
  name?: string;
  name_ar?: string | null;

  description?: string | null;
  description_ar?: string | null;

  location?: string | null;
  location_ar?: string | null;

  phone?: string | null;

  whatsapp_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  telegram_url?: string | null;

  social_links?: Record<string, string>;

  logo_file?: File;
  cover_file?: File;
}

export interface UpdateStoreResponse {
  message: string;
  store: Store;
}