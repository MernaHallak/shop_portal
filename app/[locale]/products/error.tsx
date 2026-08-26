"use client";

import {useTranslations} from "next-intl";

export default function ErrorPage({
  error,
  reset, //reset هي function من Next تعيد محاولة render  للمسار الحالي الذي ظهر فيه الخطأ من جديد
//   مثال :app/[locale]/products/error.tsx
// app/[locale]/products/page.tsx
// app/[locale]/products/[id]/page.tsx
// هون error.tsx تبع products يمسك أخطاء: /ar/products /ar/products/123
}: {
  error: Error;
  reset: () => void; //يعني دالة ما بتأخذ أي arguments و ما بترجع قيمة
}) {
  const t = useTranslations("SessionError");

  console.error(error);

  return (
    <main className="error-page">
      <section className="error-card">
        <div className="error-icon" aria-hidden="true">
          !
        </div>

        <h1>{t("title")}</h1>
        <p>{t("description")}</p>

        <button className="primary-button" type="button" onClick={reset}>
          {t("retry")}
        </button>
      </section>
    </main>
  );
}