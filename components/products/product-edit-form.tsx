"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useUpdateProduct } from "@/hook/mutations/use-update-product";
import { useCategories } from "@/hook/queries/use-categories";
import { useProduct } from "@/hook/queries/use-product";
import { useRouter } from "@/i18n/navigation";
import { normalizeApiError } from "@/lib/api-error";
import { validateTranslatedFields } from "@/lib/validation/product-validation";
import type {
    SupportedLocale,
    UpdateProductRequest,
} from "@/types/product";
import { useDeleteProductImage } from "@/hook/mutations/use-delete-product-image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

interface ProductEditFormProps {
    productId: string;
}

export function ProductEditForm({
    productId,
}: ProductEditFormProps) {
    const t = useTranslations("Products.edit");
    const createT = useTranslations("Products.create");
    const common = useTranslations("Common");

    const locale = useLocale() as SupportedLocale;
    const router = useRouter();

    const {
        data: productData,
        isPending: isProductPending,
        isError: isProductError,
        error: productError,
        refetch: refetchProduct,
        isFetching: isProductFetching,
    } = useProduct(productId);

    const {
        data: categoriesData,
        isPending: isCategoriesPending,
        isError: isCategoriesError,
        error: categoriesError,
        refetch: refetchCategories,
        isFetching: isCategoriesFetching,
    } = useCategories();

    const updateProductMutation = useUpdateProduct();
    const deleteProductImageMutation =
        useDeleteProductImage();

    const product = productData?.product; // بيانات المنتج الحالية الراجعة من الباك
    const categories = categoriesData?.categories ?? []; //categories بالبداية ممكن تكون undefined، لكن هنا بتكون [] لان عاملة قيمة بديلة وبعد وصول الداتا بتصير المصفوفة الحقيقية.  

    const [isInitialized, setIsInitialized] = useState(false); //isInitialized معناها: هل عبّينا حقول الفورم بالقيم القديمة لأول مرة ولا لسا؟

    const [name, setName] = useState("");
    const [nameAr, setNameAr] = useState("");

    const [categorySlug, setCategorySlug] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");

    const [price, setPrice] = useState("");

    const [description, setDescription] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");

    const [newImages, setNewImages] = useState<File[]>([]);
    const [isActive, setIsActive] = useState(true);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formError, setFormError] = useState<string>();

    const [deletingImagePublicId, setDeletingImagePublicId] =
        useState<string | null>(null); // deletingImagePublicId مو للحذف نفسه؛ هو فقط حتى نعرف أي صورة تحديدًا عم تنحذف الآن ونغيّر UI تبعها لحالها.
    //لما بيانات المنتج توصل لأول مرة:منعبّي الفورم بالقيم القديمة.
    useEffect(() => {
        if (!product || isInitialized) { //إذا المنتج لسا ما وصل: لا تعمل شي او إذا الفورم اتعبّى سابقًا: لا تعيد التعبئة يعني منمنع أي refetch تمسح تعديلات المستخدم وترجع تعبي بالقيم القديمة 

            // لان ال re-render البصير بسبب تغير اي State برجع يشغّل الكومبونانت والـ hooks كلها بالترتيب، يعني useProduct(productId) بتنادى من جديد، لكن هذا مو معناته React Query تعمل request جديد كل مرة الا اذا كان الكاش بحالة stale فبهل الحالة الرياكت كويري تعمل refetch بالخلفية وبالتالي يتم اعادة جلب ال product وحتى لو البيانات نفسها بالقيم فالراياكت يعتبرا اوبجيكت جديد لانه غير  مرجع product يعني object منفصل بمكان مختلف بالذاكرة فبالتالي يتم تنفيذ ال useEffect وهون بتجي فايدة ال isInitialized بانه يمنع إعادة تعبئة الفورم بعد أول مرة حتى ما يمسح تعديلات المستخدم
            return;
        }

        setName(product.name ?? "");
        setNameAr(product.name_ar ?? "");

        setCategorySlug(product.category_slug ?? "");
        setSubcategoryId(product.subcategory_id ?? "");

        setPrice(String(product.price));

        setDescription(product.description ?? "");
        setDescriptionAr(product.description_ar ?? "");

        setIsActive(product.is_active);

        setIsInitialized(true);
    }, [product, isInitialized]);
    // ال product  بتتغير لأن product جاي من الباك، بالبداية غالبًا يكون:  product = undefined وبعد ما يخلص fetch يصير:
    //   product = {
    //   name: "Laptop",
    //   price: 1000,
    //   ...
    // }
    // فلما product تتغير من undefined إلى بيانات حقيقية، useEffect يشتغل ويعبّي الـ state او ممكن product تتغير بعد refetch بالخلفية حتى لو رجعت نفس البيانات، لأن ممكن ترجع كـ object جديد بالذاكرة.

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) => category.slug === categorySlug,
            ),
        [categories, categorySlug],
    );

    const subcategories =
        selectedCategory?.subcategories ?? [];

    const selectedSubcategory = useMemo(
        () =>
            subcategories.find(
                (subcategory) =>
                    subcategory.id === subcategoryId,
            ),
        [subcategories, subcategoryId],
    );

    // Preview للصور الجديدة فقط.الصور القديمة عندنا إلها URL حقيقي من Cloudinary.
    const newImagePreviews = useMemo(
        () =>
            newImages.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            })),
        [newImages],
    );

    useEffect(() => {
        return () => {
            newImagePreviews.forEach(({ url }) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [newImagePreviews]);

    const normalizedProductError = isProductError
        ? normalizeApiError(productError)
        : undefined;

    const normalizedCategoriesError = isCategoriesError
        ? normalizeApiError(categoriesError)
        : undefined;

    function getCategoryName(
        category: (typeof categories)[number],
    ) {
        return (
            category.name_i18n?.[locale] ??
            (locale === "ar"
                ? category.name_ar
                : category.name) ??
            category.name
        );
    }

    async function handleDeleteExistingImage(
        publicId: string,
    ) {
        setDeletingImagePublicId(publicId);
        setFormError(undefined);

        try {
            await deleteProductImageMutation.mutateAsync({
                productId,
                publicId,
            });
    // بعد نجاح عملية الحذف
    // toast: ممتازة للإجراءات الفورية اللي نتيجتها بتنتهي مباشرة، مثل: حذف صورة، إخفاء منتج، تفعيل منتج، أو حفظ تعديل بنجاح.  أما أخطاء الحقول نفسها، مثل “السعر غير صالح”، الأفضل تضل تحت الحقل بدل toast.  
                toast.success(
      t("imageDeletedSuccessfully"),
    );
        } catch (error) {
            const normalized =
                normalizeApiError(error);

            toast.error(
    normalized.message ??
      common(normalized.translationKey),
  );
        } finally {
            setDeletingImagePublicId(null); //لأننا بدنا بعد انتهاء عملية الحذف نقول للواجهة: ما عاد في أي صورة عم تنحذف حاليًا. 
        }
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

    //   الدالة وظيفتها: تروح لأول حقل فيه خطأ، تعمل scroll عليه، وتحط التركيز داخله.
    // لو استدعيتِ scrollToFirstError(errors) بمكان ما قبله أي state update يغير DOM، وقتها requestAnimationFrame مو ضروري غالبًا لان requestAnimationFrame بيفيد خصوصًا لما قبلو في setState بيغيّر الـ DOM/layout، أما إذا ما في تحديث بصري قبله فغالبًا ما إله داعي.
    function scrollToFirstError(
        errors: Record<string, string>,
    ) {
        const firstErrorField = Object.keys(errors)[0];

        if (!firstErrorField) {
            return;
        }

        requestAnimationFrame(() => {
            const container =
                document.querySelector<HTMLElement>(
                    `[data-field="${firstErrorField}"]`,
                );

            container?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            const input = container?.querySelector<
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement
            >("input, textarea, select");

            input?.focus();
        });
    }

    function handleImagesChange(
        files: FileList | null,
    ) {
        if (!files) {
            return;
        }

        const selectedFiles = Array.from(files);

        if (selectedFiles.length > MAX_IMAGES) {
            setFieldErrors((current) => ({
                ...current,
                images: createT(
                    "validation.tooManyImages",
                ),
            }));

            return;
        }

        const hasInvalidType = selectedFiles.some(
            (file) =>
                !ALLOWED_IMAGE_TYPES.includes(file.type),
        );

        if (hasInvalidType) {
            setFieldErrors((current) => ({
                ...current,
                images: createT(
                    "validation.invalidImageType",
                ),
            }));

            return;
        }

        const hasLargeImage = selectedFiles.some(
            (file) => file.size > MAX_IMAGE_SIZE,
        );

        if (hasLargeImage) {
            setFieldErrors((current) => ({
                ...current,
                images: createT(
                    "validation.imageTooLarge",
                ),
            }));

            return;
        }

        clearFieldError("images");
        setNewImages(selectedFiles);
    }

    function removeNewImage(index: number) {
        setNewImages((current) =>
            current.filter(
                (_, imageIndex) => imageIndex !== index,
            ),
        );

        clearFieldError("images");
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        // الفكرة بالكلينت:  
        // أول render → data undefined
        // React Query يجلب البيانات
        // لما توصل → component يعمل rerender
        // data تصير موجودة
        // لذلك نحط حماية:  if (!product) return;
        // ونعطّل زر submit وقت التحميل:  disabled={isProductPending || !product}

        if (!product) {
            return;
        }

        setFormError(undefined);

        const errors: Record<string, string> = {};

        // هدول الحقول لازم يضلوا موجودين حتى لو PATCH نفسه partial.
        if (!name.trim()) {
            errors.name = createT(
                "validation.nameRequired",
            );
        }

        if (!nameAr.trim()) {
            errors.name_ar = createT(
                "validation.nameArRequired",
            );
        }

        if (!categorySlug || !selectedCategory) { // كمان هون ممكن تكون categorySlug undefined اذا لسا ما اجت من الباك 
            errors.category = createT(
                "validation.categoryRequired",
            );
        }

        if (!price.trim()) {
            errors.price = createT(
                "validation.priceRequired",
            );
        } else if (
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            errors.price = createT(
                "validation.pricePositive",
            );
        }

        //    الوصفين اختياريين،بس إذا موجود واحد لازم تكون ترجمته موجودة.
        Object.assign(
            errors,
            validateTranslatedFields(
                description.trim(),
                descriptionAr.trim(),
                "description",
                "description_ar",
                createT(
                    "validation.translationEnRequired",
                    {
                        field: createT(
                            "validation.fields.description",
                        ),
                    },
                ),
                createT(
                    "validation.translationArRequired",
                    {
                        field: createT(
                            "validation.fields.description",
                        ),
                    },
                ),
            ),
        );

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            scrollToFirstError(errors);
            return;
        }

        //  منقارن القيمة الحالية بالقيمة القديمة، وما منضيف للـ request إلا الشي اللي تغيّر.
        const updates: UpdateProductRequest = {};

        // product.name = الاسم الأصلي الجاي من الباك.
        // name = قيمة الـ state المرتبطة بحقل الإدخال،اول شي قيمتا بتكون من القيمة الراجعة من الباك متل ما عينا فوق وبعدين اذا المستخدم غير قيمة الحقل فبتصير قيمتا من القيمة المعدلة
        const nextName = name.trim();
        const nextNameAr = nameAr.trim();

        const nextPrice = Number(price);

        const nextDescription =
            description.trim();

        const nextDescriptionAr =
            descriptionAr.trim();

        // اذا المستخدم ما كان معدل ال name فبكون عم قارن قيمتين نفس بعض الراجعيلي من الباك
        if (nextName !== product.name) {
            updates.name = nextName;
        }

        if (
            nextNameAr !== (product.name_ar ?? "")
        ) {
            updates.name_ar = nextNameAr;
        }

        //category مطلوب بالـ API.بس ما منبعته إلا إذا تغيرت فعلاً.
        if (
            selectedCategory &&
            categorySlug !== product.category_slug
        ) {
            updates.category =
                selectedCategory.name; //بالـ category إنتِ بالنهاية لازم تبعتي الاسم للـ API
        }

        //subcategory اختيارية.
        if (
            subcategoryId !==
            (product.subcategory_id ?? "")
        ) {
            updates.subcategory_id =
                subcategoryId || null;
        }

        if (nextPrice !== product.price) {
            updates.price = nextPrice;
        }


        if (
            nextDescription !==
            (product.description ?? "")
        ) {
            updates.description =
                nextDescription;
        }

        if (
            nextDescriptionAr !==
            (product.description_ar ?? "")
        ) {
            updates.description_ar =
                nextDescriptionAr;
        }

        if (isActive !== product.is_active) {
            updates.is_active = isActive;
        }

        //  عم نبعت الصورة الجديدة بدون ما قارنا بالقديمة لان ما فينا نقارنها بالقديمة كـ File،
        if (newImages.length > 0) {
            updates.images = newImages;
        }

        // إذا ما تغيّر ولا شي، ما في داعي نعمل PATCH.
        if (Object.keys(updates).length === 0) {
            setFormError(t("noChanges"));
            return;
        }

        try {
            await updateProductMutation.mutateAsync({
                productId,
                updateData: updates,
            });

            router.replace("/products");
        } catch (error) {
            const normalizedError =
                normalizeApiError(error);

            // ممكن الـ session تنتهي بعد فتح الصفحة.
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
                common(
                    normalizedError.translationKey,
                ),
            );

            if (
                Object.keys(
                    normalizedError.fieldErrors,
                ).length > 0
            ) {
                scrollToFirstError(
                    normalizedError.fieldErrors,
                );
            }
        }
    }

    // أول تحميل لبيانات المنتج أو categories.
    if (
        isProductPending ||
        isCategoriesPending
    ) {
        return (
            <div className="product-form-panel">
                <div className="product-form-state">
                    <span
                        className="spinner dark"
                        aria-hidden="true"
                    />

                    <p>{t("loading")}</p>
                </div>
            </div>
        );
    }

    // خطأ GET product.
    if (isProductError) {
        return (
            <div className="product-form-panel">
                <div className="product-form-state">
                    <p
                        className="error-message"
                        role="alert"
                    >
                        {normalizedProductError?.message ??
                            common(
                                normalizedProductError
                                    ?.translationKey ??
                                "unexpectedError",
                            )}
                    </p>

                    <button
                        className="secondary-button"
                        type="button"
                        disabled={isProductFetching}
                        onClick={() => refetchProduct()}
                    >
                        {isProductFetching
                            ? common("loading")
                            : common("retry")}
                    </button>
                </div>
            </div>
        );
    }

    // خطأ GET categories.
    if (isCategoriesError) {
        return (
            <div className="product-form-panel">
                <div className="product-form-state">
                    <p
                        className="error-message"
                        role="alert"
                    >
                        {normalizedCategoriesError
                            ?.message ??
                            common(
                                normalizedCategoriesError
                                    ?.translationKey ??
                                "unexpectedError",
                            )}
                    </p>

                    <button
                        className="secondary-button"
                        type="button"
                        disabled={isCategoriesFetching}
                        onClick={() =>
                            refetchCategories()
                        }
                    >
                        {isCategoriesFetching
                            ? common("loading")
                            : common("retry")}
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <section className="product-form-panel">
            <form
                className="product-form"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="product-form-grid">
                    <div
                        className="field"
                        data-field="name"
                    >
                        <label htmlFor="name">
                            {createT("name")}
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

                    <div
                        className="field"
                        data-field="name_ar"
                    >
                        <label htmlFor="name-ar">
                            {createT("nameAr")}
                        </label>

                        <input
                            id="name-ar"
                            type="text"
                            dir="rtl"
                            value={nameAr}
                            onChange={(event) => {
                                setNameAr(
                                    event.target.value,
                                );

                                clearFieldError("name_ar");
                            }}
                        />

                        {fieldErrors.name_ar && (
                            <p className="field-error">
                                {fieldErrors.name_ar}
                            </p>
                        )}
                    </div>

                    <div
                        className="field"
                        data-field="category"
                    >
                        <label htmlFor="category">
                            {createT("category")}
                        </label>

                        <select
                            id="category"
                            value={categorySlug}
                            onChange={(event) => {
                                setCategorySlug(
                                    event.target.value,
                                );

                                /*
                                 * إذا تغيرت category،
                                 * subcategory القديمة ما عاد بالضرورة
                                 * تنتمي إلها.
                                 */
                                setSubcategoryId("");

                                clearFieldError("category");
                                clearFieldError(
                                    "subcategory_id",
                                );
                            }}
                        >
                            <option value="">
                                {createT(
                                    "selectCategory",
                                )}
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.slug}
                                    >
                                        {getCategoryName(
                                            category,
                                        )}
                                    </option>
                                ),
                            )}
                        </select>

                        {fieldErrors.category && (
                            <p className="field-error">
                                {fieldErrors.category}
                            </p>
                        )}
                    </div>

                    <div
                        className="field"
                        data-field="subcategory_id"
                    >
                        <label htmlFor="subcategory">
                            {createT("subcategory")}
                        </label>

                        <select
                            id="subcategory"
                            value={subcategoryId}
                            disabled={!selectedCategory}
                            onChange={(event) => {
                                setSubcategoryId(
                                    event.target.value, //<option value="sub-123">Phones</option> لما المستخدم يختارها:  e.target.value // "sub-123"  
                                );

                                clearFieldError(
                                    "subcategory_id",
                                );
                            }}
                        >
                            <option value="">
                                {selectedCategory &&
                                    subcategories.length === 0
                                    ? createT(
                                        "noSubcategories",
                                    )
                                    : createT(
                                        "selectSubcategory",
                                    )}
                            </option>

                            {subcategories.map(
                                (subcategory) => (
                                    <option
                                        key={subcategory.id}
                                        value={subcategory.id}
                                    >
                                        {getSubcategoryName(
                                            subcategory,
                                        )}
                                    </option>
                                ),
                            )}
                        </select>

                        {fieldErrors.subcategory_id && (
                            <p className="field-error">
                                {
                                    fieldErrors.subcategory_id
                                }
                            </p>
                        )}
                    </div>

                    <div
                        className="field"
                        data-field="price"
                    >
                        <label htmlFor="price">
                            {createT("price")}
                        </label>

                        <input
                            id="price"
                            className="price-input"
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            value={price}
                            onChange={(event) => {
                                setPrice(
                                    event.target.value,
                                );

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
                                setIsActive(
                                    event.target.checked,
                                )
                            }
                        />

                        <span>
                            {createT("active")}
                        </span>
                    </label>

                    <div
                        className="field product-form-full"
                        data-field="description"
                    >
                        <label htmlFor="description">
                            {createT("description")}
                        </label>

                        <textarea
                            id="description"
                            rows={5}
                            value={description}
                            onChange={(event) => {
                                setDescription(
                                    event.target.value,
                                );

                                clearFieldError(
                                    "description",
                                );
                            }}
                        />

                        {fieldErrors.description && (
                            <p className="field-error">
                                {fieldErrors.description}
                            </p>
                        )}
                    </div>

                    <div
                        className="field product-form-full"
                        data-field="description_ar"
                    >
                        <label htmlFor="description-ar">
                            {createT(
                                "descriptionAr",
                            )}
                        </label>

                        <textarea
                            id="description-ar"
                            rows={5}
                            dir="rtl"
                            value={descriptionAr}
                            onChange={(event) => {
                                setDescriptionAr(
                                    event.target.value,
                                );

                                clearFieldError(
                                    "description_ar",
                                );
                            }}
                        />

                        {fieldErrors.description_ar && (
                            <p className="field-error">
                                {
                                    fieldErrors.description_ar
                                }
                            </p>
                        )}
                    </div>

                    {/* الصور الحالية */}
                    {product.images?.length > 0 && (
                        <div className="field product-form-full">
                            <label>
                                {t("currentImages")}
                            </label>

                            <div className="product-image-previews">
                                {product.images.map((image) => {
                                    const isDeleting =
                                        deletingImagePublicId === image.public_id;

                                    return (
                                        <div
                                            key={image.public_id}
                                            className="existing-product-image"
                                        >
                                            <Image
                                                src={image.secure_url}
                                                alt={name}
                                                width={180}
                                                height={180}
                                            />

                                            <button
                                                type="button"
                                                className="image-remove-button"
                                                aria-label={t("removeExistingImage")}
                                                title={t("removeExistingImage")}
                                                disabled={isDeleting}
                                                onClick={() =>
                                                    handleDeleteExistingImage(
                                                        image.public_id,
                                                    )
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            {isDeleting && (
                                                <span className="image-deleting-text">
                                                    {t("deletingImage")}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* صور جديدة */}
                    <div
                        className="field product-form-full"
                        data-field="images"
                    >
                        <label htmlFor="edit-images">
                            {t("newImages")}
                        </label>

                        <input
                            id="edit-images"
                            className="product-images-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            multiple
                            onChange={(event) =>
                                handleImagesChange(
                                    event.target.files,
                                )
                            }
                        />

                        <p className="field-hint">
                            {createT("imageHint")}
                        </p>

                        {fieldErrors.images && (
                            <p className="field-error">
                                {fieldErrors.images}
                            </p>
                        )}

                        {newImagePreviews.length > 0 && (
                            <div className="product-image-previews">
                                {newImagePreviews.map(
                                    ({ file, url }, index) => (
                                        <div
                                            className="product-image-preview"
                                            key={`${file.name}-${file.lastModified}`}
                                        >
                                            {/* blob URL محلي،لذلك img العادي مناسب هون. */}
                                            <img
                                                src={url}
                                                alt={createT(
                                                    "previewAlt",
                                                    {
                                                        name: file.name,
                                                    },
                                                )}
                                            />

                                            <div className="product-image-preview-info">
                                                <span title={file.name}>
                                                    {file.name}
                                                </span>

                                                <small>
                                                    {(
                                                        file.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </small>
                                            </div>

                                            <button
                                                className="image-remove-button"
                                                type="button"
                                                onClick={() =>
                                                    removeNewImage(index)
                                                }
                                                aria-label={createT(
                                                    "removeImage",
                                                    {
                                                        name: file.name,
                                                    },
                                                )}
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
                        disabled={
                            updateProductMutation.isPending
                        }
                        onClick={() =>
                            router.push("/products")
                        }
                    >
                        {t("cancel")}
                    </button>

                    <button
                        className="primary-button product-submit-button"
                        type="submit"
                        disabled={
                            updateProductMutation.isPending
                        }
                    >
                        {updateProductMutation.isPending && (
                            <span
                                className="spinner"
                                aria-hidden="true"
                            />
                        )}

                        {updateProductMutation.isPending
                            ? t("submitting")
                            : t("submit")}
                    </button>
                </div>
            </form>
        </section>
    );
}