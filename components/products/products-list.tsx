"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useStoreProducts } from "@/hook/queries/use-store-products";
import { useRouter } from "@/i18n/navigation";
import { normalizeApiError } from "@/lib/api-error";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { LocalizedText, Product, SupportedLocale } from "@/types/product";
import { useDeleteProduct } from "@/hook/mutations/use-delete-product";
import Image from "next/image";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useHideProduct } from "@/hook/mutations/use-hide-product";
import { useUpdateProduct } from "@/hook/mutations/use-update-product";
// الحماية الاساسية بال ProductsPage هذا فقط حماية إضافية لو طلب ProductsList فشل بعد ما الصفحة انعرضت، لأنه useEffect يشتغل بعد أول render، لذلك ممكن يظهر جزء من الصفحة لحظة قصيرة.
// بما انو شرط ال ProductsPage تحقق فالتوكن صالح والطلب صحيح بس ممكن بحالات نادرة التوكن انتهى بين فحص ProductsPage وبين طلب ProductsList فهون فايدة ال useEffect
const TABLE_COLUMN_COUNT = 7;

export function ProductsList() {
  const t = useTranslations("Products");
  const common = useTranslations("Common");
  const actionsT = useTranslations("Products.actions");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState(""); //هي نسخة من قيمة البحث بس متأخرة شوي.

  const deleteProductMutation = useDeleteProduct();
  const { data, isPending, isError, error, refetch, isFetching } =
    useStoreProducts({
    search: debouncedSearch || undefined, //حتى إذا الحقل فاضي ما نرسل:  ?search=  
  });

  const hideProductMutation = useHideProduct();
  const updateProductMutation = useUpdateProduct();

  const normalizedError = isError ? normalizeApiError(error) : undefined;

  const toolbarDescription = isPending
    ? t("loading")
    : isError
      ? t("unableToLoadProducts")
      : data
        ? t("results", { count: data.pagination.total })
        : t("empty");

  // هذا state يخزن المنتج الذي المستخدم يريد حذفه.
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name_i18n: LocalizedText | null;
  } | null>(null);

  // deleteError تعبر عن رسالة خطأ خاصة بعملية الحذف
  const [deleteError, setDeleteError] = useState<string>();

  const [updatingProductId, setUpdatingProductId] =
  useState<string | null>(null);



useEffect(() => {
  const timeout = window.setTimeout(() => {
    setDebouncedSearch(search.trim());
  }, 350);

  return () => {
    window.clearTimeout(timeout);
  };
}, [search]);

 async function handleStatusToggle(product: Product) {
  setUpdatingProductId(product.id);
  // هون الدالة بتستنى العملية تخلص await hideProductMutation.mutateAsync(...) او  await updateProductMutation.mutateAsync(...).  بس بعد ما تخلص، بيفوت على: finally   فالقيمة setUpdatingProductId ما بتنمسح مباشرة، بتضل طول مدة الـ request. وبس يخلص الريكويست بتصير null وبتختفي حالة التعطيل disabled للزر.
  try {
    if (product.is_active) {
      await hideProductMutation.mutateAsync(product.id);
    } else {
      await updateProductMutation.mutateAsync({
        productId: product.id,
        updateData: {
          is_active: true,
        },
      });
    }
  } finally {
    setUpdatingProductId(null);
  }
}

  async function handleDeleteProduct() {
    if (!productToDelete) {
      return;
    }

    setDeleteError(undefined);

    try {
      await deleteProductMutation.mutateAsync(
        productToDelete.id,
      );

      setProductToDelete(null); //إذا الحذف نجح، صفّر productToDelete
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setDeleteError(
        normalizedError.message ??
        common(normalizedError.translationKey),
      );
    }
  }

  return (
    <section className="data-table-panel" aria-labelledby="products-table-title">
      <div className="table-toolbar">
        <div className="table-toolbar-copy">
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

 <div className="products-search">
      <Search
        size={18}
        aria-hidden="true"
      />

      <input
        type="search"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
      />
    </div>

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
              <th scope="col">{actionsT("label")}</th>
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
                      <div className="product-row-actions">
                        <button
                          type="button"
                          className="product-action-button"
                          aria-label={t("actions.view")}
                          title={t("actions.view")}
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          className="product-action-button danger"
                          type="button"
                          aria-label={actionsT("delete")}
                          title={actionsT("delete")}
                          onClick={() =>
                            setProductToDelete({
                              id: product.id,
                              name_i18n: product.name_i18n ?? null,
                            })
                          }
                        >
                          <Trash2 size={18} />
                        </button>

                        <button
                          className="product-action-button"
                          type="button"
                          aria-label={actionsT("edit")}
                          title={actionsT("edit")}
                          onClick={() =>
                            router.push(`/products/${product.id}/edit`)
                          }
                        >
                          <Pencil size={18} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`product-status-button ${product.is_active ? "active" : "inactive"
                          }`}
                        onClick={() => handleStatusToggle(product)}
                       disabled={updatingProductId === product.id} //فبس زر هالمنتج يتعطل
                      >
                        {product.is_active
                          ? t("active")
                          : t("inactive")}
                      </button>
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

      {/* Confirmation modal delete */}
      {productToDelete && (
        // الـ backdrop هو الخلفية اللي بتغطي الشاشة كلها.
        // الـ onClick على الـ div الخارجي معمول حتى إذا المستخدم ضغط برا صندوق التأكيد على الخلفية المعتمة، نسكر الـ modal
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!deleteProductMutation.isPending) { //إذا الحذف مو isPending يعني عملية الحذف حالياً مو قيد التنفيذ فمنعمل setProductToDelete(null)، فشرط {productToDelete && ...} بصير false وبتختفي نافذة التأكيد.
              setProductToDelete(null);
            }
          }}
        >
          {/* الـ confirm-modal هو الصندوق الموجود بالنص. */}
          <div
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            onClick={(event) => event.stopPropagation()} //stopPropagation() معناها: وقف انتقال حدث الضغط للعنصرالاب
          // لأن الـ modal الداخلي موجود جوّا الـ backdrop. بدونها، لو ضغطت جوّا الصندوق نفسه، حدث الضغط ممكن يطلع للأب ويشغّل:  setProductToDelete(null);
          >
            <h2 id="delete-product-title">
              {actionsT("deleteConfirmTitle")}
            </h2>

            <p>
              {actionsT("deleteConfirmMessage")}
            </p>

            <strong className="delete-product-name">
              {productToDelete.name_i18n?.[locale] ?? ""}
            </strong>

            {deleteError && (
              <p
                className="error-message"
                role="alert"
              >
                {deleteError}
              </p>
            )}

            <div className="confirm-modal-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={deleteProductMutation.isPending}
                onClick={() => setProductToDelete(null)}
              >
                {actionsT("cancel")}
              </button>

              <button
                className="danger-button"
                type="button"
                disabled={deleteProductMutation.isPending}
                onClick={handleDeleteProduct}
              >
                {deleteProductMutation.isPending
                  ? actionsT("deleting")
                  : actionsT("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
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
