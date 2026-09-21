import { notFound } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import { getSessionStatus } from "./auth/session";

export async function requireDashboardSession(locale: string) {

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
}
