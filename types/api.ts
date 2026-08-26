import type {LocalizedText} from "@/types/product";

export interface ApiValidationError {
  field?: string;
  code?: string;
  message?: string;
  expected?: string;
  received?: unknown;
}

export interface ApiErrorDetails {
  code?: string;
  details?: string;
}

export interface ApiErrorResponse {
  message?: string;
  message_i18n?: LocalizedText | null;
  code?: string;
  errors?: ApiValidationError[];
  error?: string | ApiErrorDetails;
}
