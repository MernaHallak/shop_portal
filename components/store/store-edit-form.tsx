"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";


import type { UpdateStoreRequest } from "@/types/store";
import { useStore } from "@/hook/queries/use-store";
import { useUpdateStore } from "@/hook/mutations/use-update-store";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function StoreEditForm() {
    const router = useRouter();

    const t = useTranslations("Store.edit");

    const { data, isPending, isError, refetch } =
        useStore();

    const updateStoreMutation = useUpdateStore();

    const store = data?.store;

    const [name, setName] = useState("");
    const [nameAr, setNameAr] = useState("");

    const [description, setDescription] =
        useState("");
    const [descriptionAr, setDescriptionAr] =
        useState("");

    const [location, setLocation] = useState("");
    const [locationAr, setLocationAr] =
        useState("");

    const [phone, setPhone] = useState("");

    const [whatsappUrl, setWhatsappUrl] =
        useState("");
    const [facebookUrl, setFacebookUrl] =
        useState("");
    const [instagramUrl, setInstagramUrl] =
        useState("");
    const [telegramUrl, setTelegramUrl] =
        useState("");

    const [logoFile, setLogoFile] =
        useState<File | null>(null);

    const [coverFile, setCoverFile] =
        useState<File | null>(null);

    const [formError, setFormError] =
        useState<string | null>(null);

    const [isInitialized, setIsInitialized] =
        useState(false);

    const [logoPreview, setLogoPreview] =
        useState<string | null>(null);

    const [coverPreview, setCoverPreview] =
        useState<string | null>(null);

    // هيك كل preview قديم بينعمله cleanup لما يتبدل أو لما الكمبوننت ينشال.
// إي، بالضبط. لما تختاري صورة جديدة ويتغير logoPreview أو coverPreview، الـ cleanup القديم بينفذ وبيعمل:URL.revokeObjectURL(oldPreview) حتى يحرر الرابط المؤقت القديم من الذاكرة. وكمان بينفذ لما تطلعي من الصفحة وينشال الكمبوننت.
    // cleanup للـ logo preview
    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    // cleanup للـ cover preview
    useEffect(() => {
        return () => {
            if (coverPreview) {
                URL.revokeObjectURL(coverPreview);
            }
        };
    }, [coverPreview]);

    // تعبئة الفورم من بيانات المتجر
    useEffect(() => {
        if (!store || isInitialized) {
            return;
        }

        setName(store.name ?? "");
        setNameAr(store.name_ar ?? "");

        setDescription(store.description ?? "");
        setDescriptionAr(
            store.description_ar ?? "",
        );

        setLocation(store.location ?? "");
        setLocationAr(store.location_ar ?? "");

        setPhone(store.phone ?? "");

        setWhatsappUrl(store.whatsapp_url ?? "");
        setFacebookUrl(store.facebook_url ?? "");
        setInstagramUrl(
            store.instagram_url ?? "",
        );
        setTelegramUrl(store.telegram_url ?? "");

        setIsInitialized(true);
    }, [store, isInitialized]);

    if (isPending) {
        return (
            <div className="product-form-panel">
                <p>{t("loading")}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="product-form-panel">
                <p>{t("loadError")}</p>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => refetch()}
                >
                    {t("retry")}
                </button>
            </div>
        );
    }

    if (!store) {
        return null;
    }

    function validateImageFile(file: File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return t("validation.invalidImageType");
        }

        if (file.size > MAX_IMAGE_SIZE) {
            return t("validation.imageTooLarge");
        }

        return null;
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!store) {
            return;
        }
        // من هون وطالع TypeScript بيعرف إن store موجودة لان بدون هاد الشرط if (!store) كان عم يعطيني ايرورو على اي store.instagram_url لان TypeScript شايف store ممكن تكون undefined.
        setFormError(null);

        const nextName = name.trim();
        const nextNameAr = nameAr.trim();

        const nextDescription =
            description.trim();

        const nextDescriptionAr =
            descriptionAr.trim();

        const nextLocation = location.trim();
        const nextLocationAr =
            locationAr.trim();

        const nextPhone = phone.trim();

        const nextWhatsappUrl =
            whatsappUrl.trim();

        const nextFacebookUrl =
            facebookUrl.trim();

        const nextInstagramUrl =
            instagramUrl.trim();

        const nextTelegramUrl =
            telegramUrl.trim();

        if (!nextName) {
            setFormError(t("validation.nameRequired"));
            return;
        }

        const updates: UpdateStoreRequest = {};

        if (nextName !== store.name) {
            updates.name = nextName;
        }

        if (
            nextNameAr !==
            (store.name_ar ?? "")
        ) {
            updates.name_ar = nextNameAr;
        }

        if (
            nextDescription !==
            (store.description ?? "")
        ) {
            updates.description = nextDescription;
        }

        if (
            nextDescriptionAr !==
            (store.description_ar ?? "")
        ) {
            updates.description_ar =
                nextDescriptionAr;
        }

        if (
            nextLocation !==
            (store.location ?? "")
        ) {
            updates.location = nextLocation;
        }

        if (
            nextLocationAr !==
            (store.location_ar ?? "")
        ) {
            updates.location_ar =
                nextLocationAr;
        }

        if (
            nextPhone !==
            (store.phone ?? "")
        ) {
            updates.phone = nextPhone;
        }

        if (
            nextWhatsappUrl !==
            (store.whatsapp_url ?? "")
        ) {
            updates.whatsapp_url =
                nextWhatsappUrl;
        }

        if (
            nextFacebookUrl !==
            (store.facebook_url ?? "")
        ) {
            updates.facebook_url =
                nextFacebookUrl;
        }

        if (
            nextInstagramUrl !==
            (store.instagram_url ?? "")
        ) {
            updates.instagram_url =
                nextInstagramUrl;
        }

        if (
            nextTelegramUrl !==
            (store.telegram_url ?? "")
        ) {
            updates.telegram_url =
                nextTelegramUrl;
        }

        if (logoFile) {
            updates.logo_file = logoFile;
        }

        if (coverFile) {
            updates.cover_file = coverFile;
        }

        if (Object.keys(updates).length === 0) {
            setFormError(t("noChanges"));
            return;
        }

        try {
            await updateStoreMutation.mutateAsync(
                updates,
            );

            router.replace("/store");
        } catch {
            setFormError(t("updateError"));
        }
    }

    return (
        <section className="product-form-panel">
            <form
                className="product-form"
                onSubmit={handleSubmit}
            >
                <div className="product-form-grid">
                    <div className="field">
                        <label htmlFor="name">
                            {t("name")}
                        </label>

                        <input
                            id="name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="nameAr">
                            {t("nameAr")}
                        </label>

                        <input
                            id="nameAr"
                            value={nameAr}
                            onChange={(event) =>
                                setNameAr(event.target.value)
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="location">
                            {t("location")}
                        </label>

                        <input
                            id="location"
                            value={location}
                            onChange={(event) =>
                                setLocation(event.target.value)
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="locationAr">
                            {t("locationAr")}
                        </label>

                        <input
                            id="locationAr"
                            value={locationAr}
                            onChange={(event) =>
                                setLocationAr(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field product-form-full">
                        <label htmlFor="description">
                            {t("description")}
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field product-form-full">
                        <label htmlFor="descriptionAr">
                            {t("descriptionAr")}
                        </label>

                        <textarea
                            id="descriptionAr"
                            value={descriptionAr}
                            onChange={(event) =>
                                setDescriptionAr(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="phone">
                            {t("phone")}
                        </label>

                        <input
                            id="phone"
                            value={phone}
                            onChange={(event) =>
                                setPhone(event.target.value)
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="whatsapp">
                            WhatsApp
                        </label>

                        <input
                            id="whatsapp"
                            value={whatsappUrl}
                            onChange={(event) =>
                                setWhatsappUrl(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="facebook">
                            Facebook
                        </label>

                        <input
                            id="facebook"
                            value={facebookUrl}
                            onChange={(event) =>
                                setFacebookUrl(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="instagram">
                            Instagram
                        </label>

                        <input
                            id="instagram"
                            value={instagramUrl}
                            onChange={(event) =>
                                setInstagramUrl(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="telegram">
                            Telegram
                        </label>

                        <input
                            id="telegram"
                            value={telegramUrl}
                            onChange={(event) =>
                                setTelegramUrl(
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="logo">
                            {t("logo")}
                        </label>

                        <input
                            id="logo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (!file) {
                                    return;
                                }

                                const error = validateImageFile(file);

                                if (error) {
                                    setFormError(error);
                                    event.target.value = "";
                                    return;
                                }

                                setFormError(null);
                                setLogoFile(file);

                                if (logoPreview) {
                                    URL.revokeObjectURL(logoPreview);
                                }

                                setLogoPreview(URL.createObjectURL(file));
                            }}
                        />

                        {(logoPreview || store.logo_url) && (
                            <div className="store-image-preview store-logo-preview">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt={t("logoPreview")}
                                    />
                                ) : (
                                    <Image
                                        src={store.logo_url!}
                                        alt={t("logoPreview")}
                                        width={140}
                                        height={140}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="cover">
                            {t("cover")}
                        </label>

                        <input
                            id="cover"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (!file) {
                                    return;
                                }

                                const error = validateImageFile(file);

                                if (error) {
                                    setFormError(error);
                                    event.target.value = "";
                                    return;
                                }

                                setFormError(null);
                                setCoverFile(file);

                                if (coverPreview) {
                                    URL.revokeObjectURL(coverPreview);
                                }

                                setCoverPreview(URL.createObjectURL(file));
                            }}
                        />

                        {(coverPreview || store.cover_url) && (
                            <div className="store-image-preview store-cover-preview">
                                {coverPreview ? (
                                    <img
                                        src={coverPreview}
                                        alt={t("coverPreview")}
                                    />
                                ) : (
                                    <Image
                                        src={store.cover_url!}
                                        alt={t("coverPreview")}
                                        width={800}
                                        height={260}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {formError && (
                    <div className="form-error-block">
                        {formError}
                    </div>
                )}

                <div className="product-form-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            router.push("/store")
                        }
                    >
                        {t("cancel")}
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            updateStoreMutation.isPending
                        }
                    >
                        {updateStoreMutation.isPending
                            ? t("submitting")
                            : t("submit")}
                    </button>
                </div>
            </form>
        </section>
    );
}