import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {DashboardShell} from "@/components/dashboard/dashboard-shell";
import {PageHeader} from "@/components/dashboard/page-header";
import {redirect} from "@/i18n/navigation";
import {getSessionStatus} from "@/lib/auth/session";
import { ProductEditForm } from "@/components/products/product-edit-form";
import { requireDashboardSession } from "@/lib/require-dashboard-session";

interface EditProductPageProps {
  params: Promise<{
    locale: "ar" | "en";
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const {locale, id} = await params;
  const t = await getTranslations("Products.edit"); 

  await requireDashboardSession(locale);

  return (
    <DashboardShell>
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      <ProductEditForm productId={id} />
    </DashboardShell>
  );
}