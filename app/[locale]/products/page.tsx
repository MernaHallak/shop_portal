import {ProductsList} from "@/components/products/products-list";
import {DashboardShell} from "@/components/dashboard/dashboard-shell";
import {Link, redirect} from "@/i18n/navigation";
import {getSessionStatus} from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getTranslations } from "next-intl/server";

interface ProductsPageProps {
  params: Promise<{locale: "ar" | "en"}>; //اسمها لازم يكون params لأن Next.js يمرّر prop اسمه params للـ page/layout.
// أما داخل params، الاسم locale لازم يطابق اسم folder الديناميكي
}

export default async function ProductsPage({params}: ProductsPageProps) {
  const {locale} = await params;
    const t = await getTranslations("Products");

  const sessionStatus = await getSessionStatus();
  if (sessionStatus === "unauthenticated") {
    redirect({href: "/login", locale});
  }

if (sessionStatus === "forbidden") {
  notFound(); //حتى لا تكشفي أن الصفحة موجودة اذا كان الشخص ما عندو الصلاحيات يفوت عليا
}

if (sessionStatus === "unavailable") {
  throw new Error("Unable to verify session"); // يوقف عرض ProductsPage، وNext يعرض أقرب error.tsx. إذا ما في error.tsx، يعرض صفحة الخطأ الافتراضية.  throw new Error بتكون رسالة عامة عن الخطا 
// الرسالة "Unable to verify session" غالبًا لا تظهر للمستخدم في production، بل تفيد المطور بالـ logs/debug.
// استخدمي throw للحالات غير المتوقعة أو لفشل تحميل الصفحة بالكامل.
// أما أخطاء متوقعة داخل الفورم مثل login credentials، لا نرمي error؛ نستخدم normalizeApiError لعرض رسالة تحت الحقل أو فوق الفورم.
// في حالتنا هذه ليست مشكلة فورم، بل فشل route/server أثناء بناء الصفحة وانشاء HTML الصفحة قبل عرضها، لذلك نعالجها بـ redirect / notFound / return UI / error.tsx حسب نوع SessionStatus.
}
  
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
