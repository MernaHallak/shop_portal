"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useLogin } from "@/hook/mutations/use-login";
import { useRouter } from "@/i18n/navigation";
import { normalizeApiError } from "@/lib/api-error";

export function LoginForm() {
  const t = useTranslations("Auth");
  const common = useTranslations("Common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { mutate, error, isError, isPending, reset } = useLogin(); //// الخطأ اللي رماه Axios بعد فشل تسجيل الدخول بالباك
  // useMutation يعني دالة ال useLogin ما بيشتغل لحاله  mutate هو اللي يشغّله، أما useQuery غالبًا يشتغل تلقائيًا عند mount ويجيب الداتا.
  function handleSubmit(event: FormEvent<HTMLFormElement>) { //حدث إرسال الفورم.
    event.preventDefault();
    setFieldErrors({});
    reset(); //reset() بيمسح حالة آخر طلب من الـ mutation مثل error, isError, data, وstatus يعني تمسح حالة الباك القديمة 
    // مسحنا اخر خطا راجع من الباك حتى اذا كان الخطا هو خطا فرونت للباسوورد fieldErrors.password  فما يعرض بالايميل خطا الباك السابق الكان ناتج عن خطا الايميل normalizedError?.fieldErrors.email. يعني كل محاولة ارسال جديدة، نبدأ من جديد ونمسح كل الاخطاء السابقة للباك واخطاء الفرونت عم امحيا ب setFieldErrors({});

    // منجمعهم أولًا بـ currentFieldErrors وبعدين نعمل setFieldErrors مرة واحدة  حتى ما كل مرة بتعملي setFieldErrors({ ... }) عم تستبدلي الـ object كامل  
    const currentFieldErrors: { email?: string; password?: string; } = {}; //currentFieldErrors   أخطاء الحقول الخاصة بمحاولة الإرسال الحالية  
    // قبل ما يبعت للباك الطلب حتى اذا كان في خطا بالداتا ماابعت طلب للباك خاطىء
    if (!email.trim() || !email.includes("@")) {
      currentFieldErrors.email = t("emailRequired"); //اسم الـ key email أنتِ أنشأتيه من الـ type هون: {email?: string; password?: string;}
    }

    if (!password) {
      currentFieldErrors.password = t("passwordRequired");
    }

    if (Object.keys(currentFieldErrors).length > 0) {
      setFieldErrors(currentFieldErrors);
      return; // طلاع من الدالة handleSubmit ولا تكمل تنفيذا
    }

    mutate( //mutate بتشغل الدالة الموجودة بال mutationFn وبترسل لها الداتا
      { email: email.trim(), password },
      { onSuccess: () => router.replace("/products") }, //خزّن دالة داخل onSuccess ولما login تنجح، React Query ينفذonSuccess
      // هيك غلط onSuccess: router.replace("/products") لان هيك معناها نفّذ router.replace فورا أثناء render وخزّن نتيجة التنفيذ داخل onSuccess
    );
  }

  const normalizedError = isError
    ? normalizeApiError(error, "login") //لأن الخطأ جاي من عملية تسجيل الدخول حطينا "login"
    : undefined;
  // سمّيناه requestError لأنه يمثل رسالة الخطأ العامة الخاصة بالطلب كله 
  // يعني fieldErrors للحقلين، وrequestError للخطأ العام فوق الفورم.
  const requestError = normalizedError
    ? normalizedError.message ?? common(normalizedError.translationKey) //المفتاح بيتحدد حسب الخطأ اللي رجع
    : undefined;
  const emailError =
    fieldErrors.email ?? normalizedError?.fieldErrors.email;
  const passwordError =
    fieldErrors.password ?? normalizedError?.fieldErrors.password;

  const formError =
    !emailError && !passwordError
      ? requestError
      : undefined;

  return (
    <main className="auth-page">
      <div className="auth-toolbar">
        <LanguageSwitcher />
      </div>
      <section className="auth-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">S</div>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 id="login-title">{t("loginTitle")}</h1>
        <p className="auth-description">{t("loginDescription")}</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* noValidate يعني عطّل validation الافتراضي تبع المتصفح مثل required, type="email", minLength، وخلي التحقق يتم بكودك أنت داخل handleSubmit. */}
          <div className="field">
            <label htmlFor="email">{t("email")}</label>
            <input
              id="email"
              type="email"
              autoComplete="email" //بقول للمتصفح اقترح ايميلات محفوظة عند المستخدم تلقاىيا
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors({}); //لحتى أول ما المستخدم يعدّل الحقل، تنمسح الأخطاء الظاهرة فورًا
                reset();
              }}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              required
            />
            {emailError && (
              <p className="field-error" id="email-error" role="alert">
                {emailError}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="password">{t("password")}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors({});
                reset();
              }}
              placeholder={t("passwordPlaceholder")}
              disabled={isPending}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              required
            />
            {passwordError && (
              <p className="field-error" id="password-error" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          {formError && (
            <p className="error-message" role="alert">
              {formError}
            </p>
          )}

          <button className="primary-button" type="submit" disabled={isPending}>
            {isPending && <span className="spinner" aria-hidden="true" />}
            {isPending ? t("submitting") : t("submit")}
          </button>
        </form>
      </section>
    </main>
  );
}
