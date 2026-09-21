import { getTranslations } from "next-intl/server";
import { requireDashboardSession } from "@/lib/require-dashboard-session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import StoreDetails from "@/components/store/store-details";

interface StorePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StorePage({
  params,
}: StorePageProps) {
  const { locale } = await params;

  await requireDashboardSession(locale);

  const t = await getTranslations("Store.details");

  return (
    <DashboardShell>
      <PageHeader
        title={t("title")}
        description={t("pageDescription")}
      />

      <StoreDetails />
    </DashboardShell>
  );
}