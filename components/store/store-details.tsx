"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SupportedLocale } from "@/i18n/routing";
import { useStore } from "@/hook/queries/use-store";

export default function StoreDetails() {
  const locale = useLocale() as SupportedLocale;

  const t = useTranslations("Store.details");
  const common = useTranslations("Common");

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useStore();

  const store = data?.store;

  if (isPending) {
    return (
      <section className="store-details-panel">
        <p>{t("loading")}</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="store-details-panel">
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
      </section>
    );
  }

  if (!store) {
    return null;
  }

  const storeName =
    store.name_i18n?.[locale] ??
    (locale === "ar"
      ? store.name_ar
      : store.name) ??
    store.name;

  const storeDescription =
    store.description_i18n?.[locale] ??
    (locale === "ar"
      ? store.description_ar
      : store.description);

  const storeLocation =
    store.location_i18n?.[locale] ??
    (locale === "ar"
      ? store.location_ar
      : store.location);

  return (
    <section className="store-details-panel">
      <div className="store-details-toolbar">
        <Link
          href="/store/edit"
          className="primary-button"
        >
          <Pencil size={18} />
          {t("edit")}
        </Link>
      </div>

      {store.cover_url && (
        <div className="store-cover">
          <Image
            src={store.cover_url}
            alt={storeName}
            width={1200}
            height={320}
          />
        </div>
      )}

      <div className="store-profile">
        {store.logo_url ? (
          <Image
            src={store.logo_url}
            alt={storeName}
            width={96}
            height={96}
            className="store-logo"
          />
        ) : (
          <div className="store-logo-fallback">
            {storeName.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h2>{storeName}</h2>
          <p>@{store.slug}</p>
        </div>
      </div>

      <div className="store-details-grid">
        <div className="store-details-item">
          <span>{t("name")}</span>
          <strong>{storeName}</strong>
        </div>

        <div className="store-details-item">
          <span>{t("location")}</span>
          <strong>
            {storeLocation ?? t("notAvailable")}
          </strong>
        </div>

        <div className="store-details-item">
          <span>{t("phone")}</span>
          <strong>
            {store.phone ?? t("notAvailable")}
          </strong>
        </div>

        <div className="store-details-item">
          <span>{t("status")}</span>
          <strong>
            {store.is_active
              ? t("active")
              : t("inactive")}
          </strong>
        </div>

        <div className="store-details-item store-details-full">
          <span>{t("description")}</span>
          <p>
            {storeDescription ??
              t("notAvailable")}
          </p>
        </div>
      </div>

      <div className="store-socials">
        <h2>{t("socialLinks")}</h2>

        <div className="store-details-grid">
          <div className="store-details-item">
            <span>WhatsApp</span>
            <strong>
              {store.whatsapp_url ??
                t("notAvailable")}
            </strong>
          </div>

          <div className="store-details-item">
            <span>Facebook</span>
            <strong>
              {store.facebook_url ??
                t("notAvailable")}
            </strong>
          </div>

          <div className="store-details-item">
            <span>Instagram</span>
            <strong>
              {store.instagram_url ??
                t("notAvailable")}
            </strong>
          </div>

          <div className="store-details-item">
            <span>Telegram</span>
            <strong>
              {store.telegram_url ??
                t("notAvailable")}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}