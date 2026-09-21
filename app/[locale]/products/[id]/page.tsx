import { getTranslations } from "next-intl/server";
import { notFound} from "next/navigation";

import { getSessionStatus } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { redirect } from "@/i18n/navigation";
import { requireDashboardSession } from "@/lib/require-dashboard-session";
import ProductDetails from "@/components/products/product-details";



interface ProductDetailsPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("Products.details");

 await requireDashboardSession(locale);
 

  return (
    <DashboardShell>
      <PageHeader
        title={t("title")}
        description={t("pageDescription")}
      />

      <ProductDetails productId={id} />
    </DashboardShell>
  );
}