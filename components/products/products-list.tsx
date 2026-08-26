"use client";

import { useLocale, useTranslations } from "next-intl";

import { useStoreProducts } from "@/hook/queries/use-store-products";
import { useRouter } from "@/i18n/navigation";
import { normalizeApiError } from "@/lib/api-error";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/types/product";
import Image from "next/image";
// الحماية الاساسية بال ProductsPage هذا فقط حماية إضافية لو طلب ProductsList فشل بعد ما الصفحة انعرضت، لأنه useEffect يشتغل بعد أول render، لذلك ممكن يظهر جزء من الصفحة لحظة قصيرة.
// بما انو شرط ال ProductsPage تحقق فالتوكن صالح والطلب صحيح بس ممكن بحالات نادرة التوكن انتهى بين فحص ProductsPage وبين طلب ProductsList فهون فايدة ال useEffect
const TABLE_COLUMN_COUNT = 6;

export function ProductsList() {
  const t = useTranslations("Products");
  const common = useTranslations("Common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const { data, isPending, isError, error, refetch, isFetching } =
    useStoreProducts();

  const normalizedError = isError ? normalizeApiError(error) : undefined;

  const toolbarDescription = isPending
    ? t("loading")
    : isError
      ? t("unableToLoadProducts")
      : data
        ? t("results", { count: data.pagination.total })
        : t("empty");

  return (
    <section className="data-table-panel" aria-labelledby="products-table-title">
      <div className="table-toolbar">
        <div>
          <h2 id="products-table-title">{t("tableTitle")}</h2>
          <p>{toolbarDescription}</p>
        </div>
        {/* isPending = أول تحميل للـ query ولسا ما في data نهائيًا  
isFetching = أي عملية fetch شغالة: أول تحميل أو تحديث بالخلفية */}
        <div className="table-toolbar-actions">
          {isFetching && !isPending && (
            <span className="table-refreshing" aria-label={t("refreshing")}>
              <span className="spinner dark" aria-hidden="true" />
            </span>
          )}
          <button
            className="add-product-button"
            type="button"
            onClick={() => router.push("/products/create")}
          >
            {t("addProduct")}
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="products-table">
          <thead>
            <tr>
              <th scope="col">{t("product")}</th>
              <th scope="col">{t("category")}</th>
              <th scope="col">{t("subcategory")}</th>
              <th scope="col">{t("price")}</th>
              <th scope="col">{t("status")}</th>
              <th scope="col">{t("updated")}</th>
            </tr>
          </thead>

          <tbody>
            {isPending ? (
              <TableLoadingRows label={t("loading")} />
            ) : isError ? (
              <tr>
                <td colSpan={TABLE_COLUMN_COUNT}>
                  {/* يعني هذه الخلية تأخذ عرض 6 أعمدة، لذلك نستخدمها لحالة loading/error/empty */}
                  <div className="table-state" role="alert">
                    <span className="state-icon" aria-hidden="true">
                      !
                    </span>

                    <strong>{t("loadError")}</strong>

                    <p>
                      {normalizedError?.status === 401
                        ? t("sessionExpired")
                        : normalizedError?.message ??
                        common(
                          normalizedError?.translationKey ??
                          "unexpectedError",
                        )}
                    </p>

                    {normalizedError?.status === 401 ? (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => router.replace("/login")}
                      >
                        {common("login")}
                      </button>
                    ) : (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => refetch()}
                      >
                        {common("retry")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : !data || !data.products.length ? (
              <tr>
                <td colSpan={TABLE_COLUMN_COUNT}>
                  <div className="table-state">
                    <span className="state-icon" aria-hidden="true">
                      ◇
                    </span>
                    <p>{t("empty")}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.products.map((product) => {
                const name =
                  getLocalizedValue({
                    localized: product.name_i18n,
                    locale,
                    fallback: product.name,
                  }) || product.name;

                const description = getLocalizedValue({
                  localized: product.description_i18n,
                  locale,
                  fallback: product.description,
                });

                const subcategory = getLocalizedValue({
                  localized: product.subcategory_i18n,
                  locale,
                  fallback: product.subcategory,
                });

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <div className="table-product-image">
                          {product.image_url ? (

                            // eslint-disable-next-line @next/next/no-img-element 
                            //منحط هاد التعليق لنمنع من تحذير ال ESLint البقول لا تستخدمي <img> العادي، استخدمي <Image /> لأنه أحسن للأداء وتحسين الصور 
                            // بال general.md في شرح اذا بدي عدل لل <Image />
                            <Image
                              src={product.image_url}
                              alt={t("imageAlt", { name })}
                              width={64}
                              height={64}
                            />
                          ) : (
                            <span aria-hidden="true">◇</span>
                          )}
                        </div>

                        <div className="table-product-copy">
                          <strong>{name}</strong>
                          <span>{description || t("noDescription")}</span>
                        </div>
                      </div>
                    </td>

                    <td>{product.category || t("unknownCategory")}</td>
                    <td>{subcategory || "—"}</td>

                    <td className="numeric-cell">
                      {/* هذا كود جاهز من JavaScript لتنسيق الرقم كعملة حسب locale، يعني حسب اللغة يغيّر شكل الأرقام والفواصل وترتيب رمز العملة. متل $25.00 و ‏٢٥٫٠٠ US$*/}
                      {new Intl.NumberFormat(locale, {
                        style: "currency",
                        currency: "USD",
                      }).format(product.price)}
                    </td>

                    <td>
                      <span
                        className={`status-badge table-status ${product.is_active ? "active" : "inactive"
                          }`}
                      >
                        {t(product.is_active ? "active" : "inactive")}
                      </span>
                    </td>

                    <td className="date-cell">
                      {/* هذا كود جاهز من JavaScript لتنسيق التاريخ حسب locale، يعني حسب اللغة يغيّر شكل الأرقام واسم الشهر وترتيب اليوم/الشهر/السنة. مثل Aug 13, 2026  ١٣ أغسطس ٢٠٢٦ و  */}
                      {new Intl.DateTimeFormat(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(product.updated_at))}
                      {/* new Date:تحوّل التاريخ من نص "2026-08-13T10:00:00Z"   جاي من الباك إلى كائن Date يفهمه JavaScript   */}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
// هذا يظهر صفوف تحميل وهمية Skeleton بدل المنتجات وقت isPending
function TableLoadingRows({ label }: { label: string }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((row) => (
        <tr key={row} aria-label={label}>
          <td>
            {/* هي خلية الصورة والاسم والوصف */}
            <div className="table-product">
              <div className="skeleton table-product-image" />
              <div className="table-product-copy">
                <span className="skeleton table-line wide" />
                {/* خط سكيلتون عريض مكان الاسم */}
                <span className="skeleton table-line" />
              </div>
            </div>
          </td>

          {[1, 2, 3, 4, 5].map((cell) => (
            <td key={cell}>
              <span className="skeleton table-line" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}