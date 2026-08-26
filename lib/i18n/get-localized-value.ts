import type {
  LocalizedText,
  SupportedLocale,
} from "@/types/product";

interface GetLocalizedValueOptions {
  localized?: LocalizedText | null;
  locale: SupportedLocale;
  fallback?: string | null;
}

function asNonEmptyString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getLocalizedValue({
  localized,
  locale,
  fallback,
}: GetLocalizedValueOptions): string {
  const alternateLocale: SupportedLocale = locale === "ar" ? "en" : "ar";

  return (
    asNonEmptyString(localized?.[locale]) ?? // اذا موجودة اللغة المحطوطة بيعرض النص تبعا وبشيل الفراغات 
    // حطينا [] لأن locale متغير، مو اسم property ثابت
    asNonEmptyString(fallback) ?? //والا يعرض النص البديل 
    asNonEmptyString(localized?.[alternateLocale]) ?? // والا يعرض نص اللغة التانية 
    ""
  );
}
