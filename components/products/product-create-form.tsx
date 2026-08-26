"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useCreateProduct } from "@/hook/mutations/use-create-product";
import { useCategories } from "@/hook/queries/use-categories";
import { useRouter } from "@/i18n/navigation";
import { normalizeApiError } from "@/lib/api-error";
import { validateTranslatedFields } from "@/lib/validation/product-validation";
import type { SupportedLocale } from "@/types/product";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; //عم حول من ميغا لبايت لان هيك لازم تكون
const MAX_IMAGES = 10;

export function ProductCreateForm() {
    const t = useTranslations("Products.create");
    const common = useTranslations("Common");
    const locale = useLocale() as SupportedLocale;
    const router = useRouter();

    const {
        data: categoriesData,
        isPending: isCategoriesPending,
        isError: isCategoriesError,
        error: categoriesError,
        refetch: refetchCategories,
        isFetching: isCategoriesFetching,
    } = useCategories();

    const createProductMutation = useCreateProduct();

    const [name, setName] = useState("");
    const [nameAr, setNameAr] = useState("");

    const [categorySlug, setCategorySlug] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");

    const [price, setPrice] = useState("");

    const [description, setDescription] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");

    const [images, setImages] = useState<File[]>([]);
    const [isActive, setIsActive] = useState(true);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string>();

    const categories = categoriesData?.categories ?? [];

    const selectedCategory = useMemo( 
        () =>
            categories.find(
                (category) => category.slug === categorySlug,
            ),
        [categories, categorySlug],
    );

    const subcategories = selectedCategory?.subcategories ?? [];

    const selectedSubcategory = useMemo(
        () =>
            subcategories.find(
                (subcategory) => subcategory.id === subcategoryId,
            ),
        [subcategories, subcategoryId],
    );

    const imagePreviews = useMemo(
        () =>
            images.map((file) => ({
                file,
                url: URL.createObjectURL(file), // يعمل رابط مؤقت داخل المتصفح للملف الموجود عند المستخدم
                //إذا المستخدم اختار صورة من جهازه، المتصفح يعطيك رابط مؤقت مثل blob:http://localhost:3000/abc-123 تستخدميه لعرض preview داخل المتصفح قبل رفع الصورة: <img src={previewUrl} alt="Preview" /> لا يصلح بهاد الرابط استخدام next/image
                // blob URL = رابط مؤقت لعرض الصورة قبل الرفع
                // secure_url = رابط حقيقي بعد رفع الصورة على Cloudinary

            })),
        [images],
    );

    useEffect(() => {
        return () => {
            imagePreviews.forEach((image) => {
                URL.revokeObjectURL(image.url);
            });
        };
    }, [imagePreviews]);

    const normalizedCategoriesError = isCategoriesError
        ? normalizeApiError(categoriesError)
        : undefined;

    function getCategoryName(
        category: (typeof categories)[number],
    ) {
        return (
            category.name_i18n?.[locale] ??
            (locale === "ar" ? category.name_ar : category.name) ??
            category.name
        );
    }

    function getSubcategoryName(
        subcategory: (typeof subcategories)[number],
    ) {
        return (
            subcategory.name_i18n?.[locale] ??
            (locale === "ar"
                ? subcategory.name_ar
                : subcategory.name) ??
            subcategory.name
        );
    }

    function clearFieldError(field: string) {
        setFieldErrors((current) => {
            if (!current[field]) {
                return current;
            }

            const next = { ...current };
            delete next[field];

            return next;
        });
    }

    function handleImagesChange(files: FileList | null) {
        if (!files) {
            return;
        }

        const selectedFiles = Array.from(files);

        if (selectedFiles.length > MAX_IMAGES) {
            setFieldErrors((current) => ({
                ...current,
                images: t("validation.tooManyImages"),
            }));

            return;
        }

        const hasInvalidType = selectedFiles.some(
            (file) => !ALLOWED_IMAGE_TYPES.includes(file.type),
        );

        if (hasInvalidType) {
            setFieldErrors((current) => ({
                ...current,
                images: t("validation.invalidImageType"),
            }));

            return;
        }

        const hasLargeImage = selectedFiles.some(
            (file) => file.size > MAX_IMAGE_SIZE,
        );

        if (hasLargeImage) {
            setFieldErrors((current) => ({
                ...current,
                images: t("validation.imageTooLarge"),
            }));

            return;
        }

        clearFieldError("images");
        setImages(selectedFiles);
    }

    function removeImage(index: number) {
        setImages((current) =>
            current.filter((_, imageIndex) => imageIndex !== index),
        );

        clearFieldError("images");
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setFormError(undefined);

        const errors: Record<string, string> = {};

        if (!name.trim()) {
            errors.name = t("validation.nameRequired");
        }

        if (!nameAr.trim()) {
            errors.name_ar = t("validation.nameArRequired");
        }

        if (!categorySlug || !selectedCategory) {
            errors.category = t("validation.categoryRequired");
        }

        if (!price.trim()) {
            errors.price = t("validation.priceRequired");
        } else if (
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            errors.price = t("validation.pricePositive");
        }

        Object.assign(
            errors,
            validateTranslatedFields(
                description.trim(),
                descriptionAr.trim(),
                "description",
                "description_ar",
                t("validation.translationEnRequired", {
                    field: t("validation.fields.description"),
                }),
                t("validation.translationArRequired", {
                    field: t("validation.fields.description"),
                }),
            ),
        );

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];

            requestAnimationFrame(() => {
                const element = document.querySelector<HTMLElement>(
                    `[data-field="${firstErrorField}"]`,
                );

                element?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

                const input = element?.querySelector<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >("input, textarea, select");

                input?.focus();
            });

            return;
        }

        try {
            await createProductMutation.mutateAsync({
                name: name.trim(),
                name_ar: nameAr.trim(),

                category: selectedCategory!.name,
                category_slug: selectedCategory!.slug,

                subcategory_id: selectedSubcategory?.id,
                subcategory_slug: selectedSubcategory?.slug,
                subcategory: selectedSubcategory?.name,
                subcategory_ar:
                    selectedSubcategory?.name_ar ?? undefined,

                price: Number(price),

                description: description.trim() || undefined,
                description_ar: descriptionAr.trim() || undefined,

                images,
                is_active: isActive,
            });

            router.replace("/products");
        } catch (error) {
            const normalizedError = normalizeApiError(error);

            if (normalizedError.status === 401) {
                router.replace("/login");
                return;
            }

            setFieldErrors((current) => ({
                ...current,
                ...normalizedError.fieldErrors,
            }));

            setFormError(
                normalizedError.message ??
                common(normalizedError.translationKey),
            );
        }
    }

    return (
        <section className="product-form-panel">
            <form
                className="product-form"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="product-form-grid">
                    <div className="field" data-field="name">
                        <label htmlFor="name">
                            {t("name")}
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                clearFieldError("name");
                            }}
                        />

                        {fieldErrors.name && (
                            <p className="field-error">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    <div className="field" data-field="name_ar">
                        <label htmlFor="name-ar">
                            {t("nameAr")}
                        </label>

                        <input
                            id="name-ar"
                            type="text"
                            dir="rtl"
                            value={nameAr}
                            onChange={(event) => {
                                setNameAr(event.target.value);
                                clearFieldError("name_ar");
                            }}
                        />

                        {fieldErrors.name_ar && (
                            <p className="field-error">
                                {fieldErrors.name_ar}
                            </p>
                        )}
                    </div>

                    <div className="field" data-field="category">
                        <label htmlFor="category">
                            {t("category")}
                        </label>

                        <select
                            id="category"
                            value={categorySlug}
                            disabled={
                                isCategoriesPending ||
                                isCategoriesError
                            }
                            onChange={(event) => {
                                setCategorySlug(event.target.value);
                                setSubcategoryId("");
                                clearFieldError("category");
                                clearFieldError("subcategory_id");
                            }}
                        >
                            <option value="">
                                {isCategoriesPending
                                    ? t("loadingCategories")
                                    : t("selectCategory")}
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.slug}
                                >
                                    {getCategoryName(category)}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.category && (
                            <p className="field-error">
                                {fieldErrors.category}
                            </p>
                        )}
                    </div>

                    <div className="field"  data-field="subcategory_id">
                        <label htmlFor="subcategory">
                            {t("subcategory")}
                        </label>

                        <select
                            id="subcategory"
                            value={subcategoryId}
                            disabled={
                                !selectedCategory ||
                                isCategoriesPending ||
                                isCategoriesError
                            }
                            onChange={(event) => {
                                setSubcategoryId(event.target.value);
                                clearFieldError("subcategory_id");
                            }}
                        >
                            <option value="">
                                {selectedCategory &&
                                    subcategories.length === 0
                                    ? t("noSubcategories")
                                    : t("selectSubcategory")}
                            </option>

                            {subcategories.map((subcategory) => (
                                <option
                                    key={subcategory.id}
                                    value={subcategory.id}
                                >
                                    {getSubcategoryName(subcategory)}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.subcategory_id && (
                            <p className="field-error">
                                {fieldErrors.subcategory_id}
                            </p>
                        )}
                    </div>

                    <div className="field" data-field="price">
                        <label htmlFor="price">
                            {t("price")}
                        </label>

                        <input
                            id="price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            value={price}
                            onChange={(event) => {
                                setPrice(event.target.value);
                                clearFieldError("price");
                            }}
                        />

                        {fieldErrors.price && (
                            <p className="field-error">
                                {fieldErrors.price}
                            </p>
                        )}
                    </div>

                    <label className="product-active-field">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(event) =>
                                setIsActive(event.target.checked)
                            }
                        />

                        <span>
                            {t("active")}
                        </span>
                    </label>

                    <div className="field product-form-full" data-field="description">
                        <label htmlFor="description">
                            {t("description")}
                        </label>

                        <textarea
                            id="description"
                            rows={5}
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value);
                                clearFieldError("description");
                            }}
                        />

                        {fieldErrors.description && (
                            <p className="field-error">
                                {fieldErrors.description}
                            </p>
                        )}
                    </div>

                    <div className="field product-form-full" data-field="description_ar">
                        <label htmlFor="description-ar">
                            {t("descriptionAr")}
                        </label>

                        <textarea
                            id="description-ar"
                            rows={5}
                            dir="rtl"
                            value={descriptionAr}
                            onChange={(event) => {
                                setDescriptionAr(event.target.value);
                                clearFieldError("description_ar");
                            }}
                        />

                        {fieldErrors.description_ar && (
                            <p className="field-error">
                                {fieldErrors.description_ar}
                            </p>
                        )}
                    </div>

                    <div className="field product-form-full" data-field="images">
                        <label htmlFor="images">
                            {t("images")}
                        </label>

                        <input
                            id="images"
                            className="product-images-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            multiple
                            onChange={(event) =>
                                handleImagesChange(event.target.files)
                            }
                        />

                        <p className="field-hint">
                            {t("imageHint")}
                        </p>

                        {fieldErrors.images && (
                            <p className="field-error">
                                {fieldErrors.images}
                            </p>
                        )}

                        {imagePreviews.length > 0 && (
                            <div
                                className="product-image-previews"
                                aria-label={t("selectedImages")}
                            >
                                {imagePreviews.map(
                                    ({ file, url }, index) => (
                                        <div
                                            className="product-image-preview"
                                            key={`${file.name}-${file.lastModified}`}
                                        >
                                            <img
                                                src={url}
                                                alt={t("previewAlt", {
                                                    name: file.name,
                                                })}
                                            />

                                            <div className="product-image-preview-info">
                                                <span title={file.name}>
                                                    {file.name}
                                                </span>

                                                <small>
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </small>
                                            </div>

                                            <button
                                                className="image-remove-button"
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                aria-label={t("removeImage", {
                                                    name: file.name,
                                                })}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isCategoriesError && (
                    <div className="form-error-block" role="alert">
                        <p>
                            {normalizedCategoriesError?.message ??
                                common(
                                    normalizedCategoriesError?.translationKey ??
                                    "unexpectedError",
                                )}
                        </p>

                        <button
                            className="secondary-button"
                            type="button"
                            disabled={isCategoriesFetching}
                            onClick={() => refetchCategories()}
                        >
                            {isCategoriesFetching
                                ? common("loading")
                                : common("retry")}
                        </button>
                    </div>
                )}

                {formError && (
                    <p
                        className="error-message"
                        role="alert"
                    >
                        {formError}
                    </p>
                )}

                <div className="product-form-actions">
                    <button
                        className="secondary-button"
                        type="button"
                        disabled={createProductMutation.isPending}
                        onClick={() => router.push("/products")}
                    >
                        {t("cancel")}
                    </button>

                    <button
                        className="primary-button product-submit-button"
                        type="submit"
                        disabled={
                            createProductMutation.isPending ||
                            isCategoriesPending ||
                            isCategoriesError
                        }
                    >
                        {createProductMutation.isPending && (
                            <span
                                className="spinner"
                                aria-hidden="true"
                            />
                        )}

                        {createProductMutation.isPending
                            ? t("submitting")
                            : t("submit")}
                    </button>
                </div>
            </form>
        </section>
    );
}