import { Suspense } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

// Suspense معناها: “إذا في شي جوّا هذا الغلاف ما قدر يجهّز/يطلع فورًا (عم يستنى)، اعرض fallback مؤقتًا.”
// fallback={null} يعني: لا تعرض ولا شي أثناء الانتظار (شاشة فاضية لحظيًا).