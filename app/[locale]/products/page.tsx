import {ProductsList} from "@/components/products/products-list";
import {DashboardShell} from "@/components/dashboard/dashboard-shell";
import {Link, redirect} from "@/i18n/navigation";
import {getSessionStatus} from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getTranslations } from "next-intl/server";
import { requireDashboardSession } from "@/lib/require-dashboard-session";

interface ProductsPageProps {
  params: Promise<{locale: "ar" | "en"}>; //اسمها لازم يكون params لأن Next.js يمرّر prop اسمه params للـ page/layout.
// أما داخل params، الاسم locale لازم يطابق اسم folder الديناميكي
}

export default async function ProductsPage({params}: ProductsPageProps) {
  const {locale} = await params;
    const t = await getTranslations("Products");

    await requireDashboardSession(locale);
 
  return (
    <DashboardShell>
  <PageHeader
    eyebrow={t("eyebrow")}
    title={t("title")}
    description={t("description")}
     actions={
    <Link href="/products/create">
      {t("addProduct")}
    </Link>
  }
  />

  <ProductsList />
</DashboardShell>
  );
}
