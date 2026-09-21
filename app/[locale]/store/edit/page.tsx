import { getTranslations } from "next-intl/server";
import { requireDashboardSession } from "@/lib/require-dashboard-session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import StoreEditForm from "@/components/store/store-edit-form";

interface StoreEditPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StoreEditPage({
  params,
}: StoreEditPageProps) {
  const { locale } = await params;

  await requireDashboardSession(locale);

  const t = await getTranslations("Store.edit");

  return (
    <DashboardShell>
      <PageHeader
        title={t("title")}
        description={t("pageDescription")}
      />

      <StoreEditForm />
    </DashboardShell>
  );
}