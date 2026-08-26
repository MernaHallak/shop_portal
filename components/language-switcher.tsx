"use client";

import {useEffect} from "react";
import {useLocale, useTranslations} from "next-intl";

import {usePathname, useRouter} from "@/i18n/navigation";
import type {SupportedLocale} from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale() as SupportedLocale;
  const pathname = usePathname(); // قيمة المسار الحالي
  const router = useRouter();
  const nextLocale: SupportedLocale = locale === "ar" ? "en" : "ar";

// بعد ما الكومبوننت ينعرض، React يشغّل هذا الكود ليحضّر صفحة نفس المسار لكن باللغة الثانية.
  useEffect(() => {
    router.prefetch(pathname, {locale: nextLocale}); //router.prefetch(...) يعني: حمّل بيانات/كود الصفحة مسبقًا في الخلفية، بدون ما ينقل المستخدم الآن. ومرقنا اللغة لان next-intl يعرف اللغة الحالية وليس اللغة الثانية
  }, [nextLocale, pathname, router]);
// إذا انتقلت من /products إلى /login يتغير pathname، فيعمل prefetch للمسار الجديد باللغة الثانية.
// إذا تغيرت اللغة الحالية، يتغير nextLocale، فيعمل prefetch للغة المقابلة الجديدة الكان عليا من شوي 
// router غالبًا ما يتغير، لكنه يُضاف لأن الكود يستخدمه داخل effect.

  return (
    <button
      className="language-switcher"
      type="button"
      onClick={() => router.replace(pathname, {locale: nextLocale})} // عند الضغط:ينقلك فعليًا لنفس المسار باللغة الثانية، وغالبًا يكون أسرع لأن prefetch حضّرها قبل
      aria-label={`${t("language")}: ${t(nextLocale === "ar" ? "arabic" : "english")}`}
    >
      <span aria-hidden="true">文</span>
      {t(nextLocale === "ar" ? "arabic" : "english")}
    </button>
  );
}
