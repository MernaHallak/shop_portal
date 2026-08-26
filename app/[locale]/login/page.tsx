import {LoginForm} from "@/components/auth/login-form";
import {redirect} from "@/i18n/navigation";
import {hasValidSession} from "@/lib/auth/session";

interface LoginPageProps {
  params: Promise<{locale: "ar" | "en"}>;
}

export default async function LoginPage({params}: LoginPageProps) {
  const {locale} = await params;
  if (await hasValidSession()) redirect({href: "/products", locale}); //مع next-intl الأفضل تمرير locale في redirect ليعرف يبني الرابط عاي لغة، أما بالـ Link غالبًا ما تحتاجي لأن السياق موجود

  return <LoginForm />;
}
