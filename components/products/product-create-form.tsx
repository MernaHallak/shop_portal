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
    const [formError, setFormError] = useState<string>(); //نوع الـ state هو:  string | undefined

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

    const imagePreviews = useMemo( //useMemo هون رجّعت array جديدة للعرض اسمها imagePreviews.
        () =>
            // يعني: مصفوفة previews، كل عنصر فيها فيه الملف الأصلي + رابط مؤقت لعرضه.
            images.map((file) => ({
                file,
                url: URL.createObjectURL(file), // يعمل رابط مؤقت داخل المتصفح للملف الموجود عند المستخدم لان الصورة اللي اختارها المستخدم من جهازه لسا ما انرفعت، فما عندها URL حقيقي. هون منعمل رابط مؤقت
                //إذا المستخدم اختار صورة من جهازه، المتصفح يعطيك رابط مؤقت مثل blob:http://localhost:3000/abc-123 تستخدميه لعرض preview داخل المتصفح قبل رفع الصورة: <img src={previewUrl} alt="Preview" /> لا يصلح بهاد الرابط استخدام next/image
                // blob URL = رابط مؤقت لعرض الصورة قبل الرفع
                // secure_url = رابط حقيقي بعد رفع الصورة على Cloudinary

            })),
        [images],
    );

    useEffect(() => {
        return () => {//مشروحة بال general
            imagePreviews.forEach((image) => {
                URL.revokeObjectURL(image.url);
            });
        };
    }, [imagePreviews]);

    const normalizedCategoriesError = isCategoriesError
        ? normalizeApiError(categoriesError)
        : undefined;

    function getCategoryName(
        category: (typeof categories)[number], //يعني نوع عنصر من عناصر المصفوفة categories يعني category كانو كتبت category:category لان ال categories: Category[]
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

    // لما المستخدم يغيّر قيمة حقل، تنادي clearFieldError("name") حتى تختفي رسالة الخطأ الخاصة بهذا الحقل فقط.
    function clearFieldError(field: string) {
        // current هي القيمة الحالية للـ fieldErrors مثال:current = {
        //   name: "Name is required",
        //   price: "Price must be greater than 0"}
        setFieldErrors((current) => {
            if (!current[field]) { //إذا هذا الحقل ما عنده خطأ، لا تغيّر شيئًا
                return current;
            }

            const next = { ...current }; // React ما بحب تعدلي state مباشرة لهيك عملت نسخة وعدلت عليا وعطيتا لل state
            delete next[field]; //delete فهي كلمة جاهزة من JavaScript، تستخدم لحذف property من object

            return next;
        });
    }

    function handleImagesChange(files: FileList | null) { //FileList هو نوع جاهز من المتصفح، يمثل قائمة الملفات المختارة من input file مباشرة بس هو مو array لهيك منحولو لمصفوفة بعدين وبصير نوعو File[] 
        if (!files) {
            return;
        }

        const selectedFiles = Array.from(files);
        // حولنا لمصفوفة حتى نقدر نستخدم عليه selectedFiles.length  selectedFiles.some(...) selectedFiles.map(...)

        if (selectedFiles.length > MAX_IMAGES) {
            setFieldErrors((current) => ({
                ...current,
                images: t("validation.tooManyImages"),
            }));

            return;
        }

        const hasInvalidType = selectedFiles.some( //some بترجع true/false ترجع true إذا لقت أي ملف واحد نوعه غير مسموح.
            (file) => !ALLOWED_IMAGE_TYPES.includes(file.type),
        );

        if (hasInvalidType) {
            setFieldErrors((current) => ({
                // خذ الأخطاء الحالية، وخلي/أضف خطأ الصور
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

        // بس يكون اختيار الصورة صحيح منمسح الخطا السابق ومنضيف الصورة
        clearFieldError("images");
        setImages(selectedFiles);
    }

    // تحذف صورة من images حسب رقمها/index
    function removeImage(index: number) {
        setImages((current) =>
            current.filter((_, imageIndex) => imageIndex !== index), //filter ترجع مصفوفة جديدة، وتبقي فقط العناصر اللي الشرط تبعها true.
            // أما _: هو العنصر نفسه، يعني file، لكننا لا نحتاجه. نحتاج فقط imageIndex.     
        );

        clearFieldError("images"); // مو ضرورية لان نحنا ماسحين الخطا وقت اضافة صورة صحيحة بس هاد احتياطي
    }

    // دوال تحقق بسيطة من اللغة اذا عربي او انكليزي 
    function containsArabic(value: string) {
        return /[\u0600-\u06FF]/.test(value);
    }

    function containsEnglish(value: string) {
        return /[A-Za-z]/.test(value);
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

        if (containsArabic(name)) {
            errors.name = t("validation.englishOnly");
        }

        if (containsEnglish(nameAr)) {
            errors.name_ar = t("validation.arabicOnly");
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

        if (description && containsArabic(description)) {
            errors.description = t("validation.englishOnly");
        }

        if (descriptionAr && containsEnglish(descriptionAr)) {
            errors.description_ar = t("validation.arabicOnly");
        }

        Object.assign( //Object.assign معناها: انسخ/ادمج خصائص object الثاني داخل object الاول.
            // يدمج مفاتيح هذا الـ object داخل errors الأساسي
            //  خذ الأخطاء الراجعة من validateTranslatedFields  وضيفها داخل errors  
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
        // يحفظ أخطاء الحقول بالـ state حتى تظهر تحت inputs.
        setFieldErrors(errors);
        // setFieldErrors({});  ما إلها داعي ضرورية هون؛ لأن setFieldErrors(errors) بعد الـ validation رح يستبدل الأخطاء القديمة بالجديدة.  

        if (Object.keys(errors).length > 0) { //Object.keys(errors) ترجع مصفوفة بأسماء المفاتيح الموجودة داخل object.

            const firstErrorField = Object.keys(errors)[0];

            requestAnimationFrame(() => {
                // لو عندك كود بصري مثل تغيير مكان عنصر أو scroll، ممكن ينفذ بوقت غير مناسب: قبل ما يخلص تحديث الـ DOM أو قبل ما يحسب المتصفح أماكن العناصر.  فrequestAnimationFrame معناها:  يا متصفح، شغّل هذا الكود بالوقت المناسب قبل ما تحدّث شكل الشاشة.
                // يعني لا تعمل scroll الآن فورًا، خليه قريب من لحظة تحديث الشاشة، حتى تكون الحسابات البصرية مثل مكان العنصر جاهزة.  
                // requestAnimationFrame يؤجل scroll/focus حتى يأخذ React فرصة لتحديث الـ DOM، ويأخذ المتصفح فرصة لحساب الـ layout الجديد قبل الرسم.
                // setFieldErrors(errors)
                // ↓
                // React يسجّل طلب تحديث
                // ↓
                // handleSubmit تكمّل وتخلص
                // ↓
                // React يعمل render جديد
                // ↓
                // DOM يتحدث
                // ↓
                // requestAnimationFrame callback يشتغل قبل الرسم القادم، وهون يصير scroll/focus
                // ↓
                // المتصفح يرسم الشاشة بعد تحديث الأخطاء وبعد تنفيذ السكرول بس الفترة بين عرض الاخطاء والسكرول قليلة جدا فببين كانو صارو سوا

                // فـ requestAnimationFrame يفيد لما بدك تتعامل مع الـ DOM بعد ما يأخذ التحديث فرصته، مثل scrollIntoView وfocus.//لأن ظهور رسائل الأخطاء قد يغير ارتفاع الفورم ومكان الحقول، فبدونه ممكن scrollIntoView يعتمد على layout قديم أو غير مكتمل.
                // لأن إضافة رسائل الأخطاء إلى الـ DOM قد تغيّر الـ layout مثل ارتفاع الفورم ومكان الحقول الرح يحسبا المتصفح ويعرضا
                // requestAnimationFrame يعطي فرصة للمتصفح يحسب الـ layout الجديد بعد ما تحدثت الدوم قبل scrollIntoView. يعني الرسائل لسا ممكن ما انرسمت بصريًا للمستخدم، لكن وجودها بالـ DOM صار يؤثر على الحسابات مثل مكان العنصر وارتفاعه.

                const element = document.querySelector<HTMLElement>( //querySelector يعني: دور داخل الصفحة على أول عنصر عنده attribute: data-field="${firstErrorField}  العنصر الراجع اعتبره HTMLElement
                    `[data-field="${firstErrorField}"]`,
                );

                element?.scrollIntoView({ //scrollIntoView إذا لقى العنصر، حرّك الصفحة لعنده بسلاسة وخليه بوسط الشاشة تقريبًا.
                    behavior: "smooth",
                    block: "center",
                });

                const input = element?.querySelector< //يدور فقط داخل هذا العنصر على أول: input أو textarea أو select
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >("input, textarea, select");

                input?.focus();
            });

            return; //يوقف الدالة، يعني ما في إرسال للباك طالما في أخطاء محلية.
        }

        try {
            await createProductMutation.mutateAsync({ //mutateAsync نفس فكرة mutate: تشغّل mutationFn وتبعت لها الداتا.
                // لكن mutateAsync بترجع Promise يعني بدا await وبتتعاملين مع النجاح/الفشل عبر try/catch اما mutate ما بترجع Promise وبتتعاملين مع النجاح/الفشل عبر onSuccess/onError
                name: name.trim(),
                name_ar: nameAr.trim(),

                category: selectedCategory!.name, //! معناها: “أنا متأكد أنها ليست undefined”، لأنك فحصت فوق

                subcategory_id: selectedSubcategory?.id,

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
                // يدمج أخطاء الحقول القادمة من الباك مع الأخطاء الحالية
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
                            {/* هذا اسمه placeholder option داخل <select> */}
                            <option value="" disabled>
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

                    <div className="field" data-field="subcategory_id">
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

                    {/* أي زر داخل <form> ونوعه submit لما ينضغط يشغّل حدث الفورم:<form onSubmit={handleSubmit}> وhandleSubmit هي التي ترسل الداتا.*/}
                    <button
                        className="primary-button product-submit-button"
                        type="submit"
                        disabled={
                            createProductMutation.isPending || //طلب إنشاء المنتج شغال، حتى ما يضغط مرتين.
                            isCategoriesPending || //يعطّل الزر لحد ما تجهز الخيارات بدل ما المستخدم يضغط ويشوف error.
                            isCategoriesError //يعطّل الزر لأن الفورم ناقص بيانات أساسية من الباك.
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