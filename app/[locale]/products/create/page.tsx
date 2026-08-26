import {notFound} from "next/navigation";

import {ProductCreateForm} from "@/components/products/product-create-form";
import {DashboardShell} from "@/components/dashboard/dashboard-shell";
import {Link, redirect} from "@/i18n/navigation";
import {getSessionStatus} from "@/lib/auth/session";
import { PageHeader } from "@/components/dashboard/page-header";
import { getTranslations } from "next-intl/server";

interface CreateProductPageProps {
  params: Promise<{locale: "ar" | "en"}>;
}

export default async function CreateProductPage({
  params,
}: CreateProductPageProps) {
  const {locale} = await params;
    const t = await getTranslations("Products");

  const sessionStatus = await getSessionStatus();

  if (sessionStatus === "unauthenticated") {
    redirect({href: "/login", locale});
  }

  if (sessionStatus === "forbidden") {
    notFound();
  }

  if (sessionStatus === "unavailable") { //يعني خدمة التحقق نفسها فشلت → منرمي Error حتى error.tsx يعرض حالة خطأ مناسبة.
    throw new Error("Unable to verify session"); 
  }

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