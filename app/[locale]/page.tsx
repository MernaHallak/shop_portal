import {redirect} from "@/i18n/navigation";
import {hasValidSession} from "@/lib/auth/session";

interface HomePageProps {
  params: Promise<{locale: "ar" | "en"}>;
}
// دالة ال async تستخدم وقت يكون عنا عملية بدا await وهي الدالة بترجع Promise تلقاىيا ولو ما انا كتبت النوع يدويا
export default async function HomePage({params}: HomePageProps) {
  const {locale} = await params;
  const authenticated = await hasValidSession();

  redirect({href: authenticated ? "/products" : "/login", locale});
}
