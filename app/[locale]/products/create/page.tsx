import {notFound} from "next/navigation";

import {ProductCreateForm} from "@/components/products/product-create-form";
import {DashboardShell} from "@/components/dashboard/dashboard-shell";
import {Link, redirect} from "@/i18n/navigation";
import {getSessionStatus} from "@/lib/auth/session";
import { PageHeader } from "@/components/dashboard/page-header";
import { getTranslations } from "next-intl/server";
import { requireDashboardSession } from "@/lib/require-dashboard-session";

interface CreateProductPageProps {
  params: Promise<{locale: "ar" | "en"}>;
}

export default async function CreateProductPage({
  params,
}: CreateProductPageProps) {
  const {locale} = await params;
    const t = await getTranslations("Products");

 await requireDashboardSession(locale);

  return (
 <DashboardShell>
   <PageHeader
      eyebrow={t("createEyebrow")}
  title={t("createTitle")}
  description={t("createDescription")}
    actions={
      <Link href="/products">
        {t("backToProducts")}
      </Link>
    }
   />
   <ProductCreateForm />
 </DashboardShell>
  );
}