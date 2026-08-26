import type {ApiErrorResponse, ApiValidationError} from "@/types/api";

export type {ApiErrorResponse, ApiValidationError};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthStore {
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
  social_links: Record<string, unknown>;
  name_ar: string | null;
  description_ar: string | null;
  location_ar: string | null;
}

export interface BackendLoginResponse {
  message: string;
  session: AuthSession;
  user: AuthUser;
  profile: AuthProfile;
  store: AuthStore;
}

/**
 * هذه البيانات فقط تعود إلى كود المتصفح.
 * التوكينات لا تعود إلى المتصفح.
 */
export interface LoginResponse {
  message: string;
  user: AuthUser;
  profile: AuthProfile;
  store: AuthStore;
}

