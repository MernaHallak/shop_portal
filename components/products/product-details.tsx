"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Pencil } from "lucide-react";
import { SupportedLocale } from "@/i18n/routing";
import { useProduct } from "@/hook/queries/use-product";
import { useRouter } from "@/i18n/navigation";



interface ProductDetailsProps {
    productId: string;
}

export default function ProductDetails({
    productId,
}: ProductDetailsProps) {
    const router = useRouter();
    const locale = useLocale() as SupportedLocale;

    const t = useTranslations("Products.details");
    const common = useTranslations("Common");

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
    } = useProduct(productId);

    const product = data?.product;

    if (isPending) {
        return (
            <div className="product-details-panel">
                <p>{t("loading")}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="product-details-panel">
                <div className="error-message">
                    {t("loadError")}
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => refetch()}
                >
                    {common("retry")}
                </button>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const productName =
        product.name_i18n?.[locale] ??
        (locale === "ar"
            ? product.name_ar
            : product.name) ??
        product.name;

    const productDescription =
        product.description_i18n?.[locale] ??
        (locale === "ar"
            ? product.description_ar
            : product.description);

    const categoryName = product.category;

    const subcategoryName =
        product.subcategory_details?.name_i18n?.[locale] ??
        product.subcategory_details?.name ??
        product.subcategory ??
        null;

    return (
        <section className="product-details-panel">
            <div className="product-details-toolbar">
                <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                        router.push(`/products/${product.id}/edit`)
                    }
                >
                    <Pencil size={18} />
                    {t("edit")}
                </button>
            </div>

            <div className="product-details-grid">
                <div className="product-details-item">
                    <span>{t("name")}</span>
                    <strong>{productName}</strong>
                </div>

                <div className="product-details-item">
                    <span>{t("price")}</span>
                    <strong>{product.price}</strong>
                </div>

                <div className="product-details-item">
                    <span>{t("category")}</span>
                    <strong>{categoryName}</strong>
                </div>

                <div className="product-details-item">
                    <span>{t("subcategory")}</span>
                    <strong>
                        {subcategoryName ?? t("notAvailable")}
                    </strong>
                </div>

                <div className="product-details-item">
                    <span>{t("status")}</span>
                    <strong>
                        {product.is_active
                            ? t("active")
                            : t("inactive")}
                    </strong>
                </div>

                <div className="product-details-item product-details-full">
                    <span>{t("description")}</span>
                    <p>
                        {productDescription ||
                            t("notAvailable")}
                    </p>
                </div>
            </div>

            <div className="product-details-images">
                <h2>{t("images")}</h2>

                {product.images?.length ? (
                    <div className="product-details-image-grid">
                        {product.images.map((image) => (
                            <div
                                key={image.public_id}
                                className="product-details-image"
                            >
                                <Image
                                    src={image.secure_url ?? image.url}
                                    alt={productName}
                                    width={220}
                                    height={220}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>{t("noImages")}</p>
                )}
            </div>
        </section>
    );
}