import {defineRouting} from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
});

export type SupportedLocale = (typeof routing.locales)[number]; //[number]  يعني نوع أي عنصر داخل هذا الـ array  type SupportedLocale = "ar" | "en";
