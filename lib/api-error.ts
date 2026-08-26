// أخطاء المتصفح
import axios from "axios";

import type {
  ApiErrorDetails,
  ApiErrorResponse,
  ApiValidationError,
} from "@/types/api";

// هذا يحدد سياق الخطأ يعني: وين صار الخطأ؟ بأي عملية؟  لأن نفس status ممكن نعرض له رسالة مختلفة حسب المكان مثلاً: 401 أثناء login => invalidCredentials و 401 أثناء session/me => unauthenticated
// مو شرط ال session/me أي endpoint محمي ممكن يتحقق من الجلسة بس /me غالبًا نعتبره session check لأنه endpoint معمول ليجاوب: “هل المستخدم الحالي مسجل؟ ومن هو؟”
export type ErrorContext = "login" | "session" | "request";
// login   => خطأ أثناء تسجيل الدخول
// session => خطأ أثناء التحقق من الجلسة، مثل /me
// request => أي طلب عادي ثاني

export type ErrorTranslationKey =
  | "unexpectedError"
  | "networkError"
  | "invalidCredentials"
  | "accountUnavailable"
  | "unauthenticated"
  | "forbidden"
  | "notFound"
  | "validationError"
  | "serverError";

export interface NormalizedApiError {
  status?: number;
  code?: string;
  message?: string;
  fieldErrors: Record<string, string>;
  translationKey: ErrorTranslationKey;
}
// هاي patterns تمنع عرض رسائل تقنية للمستخدم.
const TECHNICAL_MESSAGE_PATTERNS = [
  /request failed with status code/i,
  /stack trace/i,
  /\bat\s+\S+\s+\([^)]+:\d+:\d+\)/i,
  /supabase/i,
  /postgres|postgresql|sqlstate/i,
  /internal server error/i,
  /ECONN|ENOTFOUND|ETIMEDOUT/i,
  /bearer\s+<token>/i,
];
// انا بكون امرقا للدالة ايرور الباك بعد التوحيد  
function getErrorDetailsCode(error: ApiErrorResponse["error"]) { //نوع الباراميتر error هو نفس نوع الخاصية error الموجودة داخل interface ApiErrorResponse.
  if (!error || typeof error === "string") return undefined;
  return (error as ApiErrorDetails).code; //بعد الشرط استبعدنا undefined -string فالنوع الضل ApiErrorDetails فحطيناه للتاكيد
}

function isSafeUserMessage(
  message: unknown,
  status: number | undefined,
): message is string {
  if (typeof message !== "string") return false;
  const normalized = message.trim();
  if (!normalized || normalized.length > 240) return false;
  if (status !== undefined && status >= 500) return false; //لأن رسائل 5xx غالبًا أخطاء سيرفر، ما منعرضها للمستخدم.
  return !TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(normalized)); //بترجع true إذا أي pattern واحد من TECHNICAL_MESSAGE_PATTERNS طابق الرسالة normalized
}

function getFieldErrors(errors: ApiValidationError[] | undefined) {
  if (!Array.isArray(errors)) return {};
  // reduce يعني: لفّي على عناصر المصفوفة، واجمعيهم بالنهاية بقيمة واحدة. reduce مناسب لما بدك تحولي array إلى قيمة واحدة، وهون القيمة الواحدة هي object.
  // هون القيمة الواحدة هي object اسمه result وعن طريقا بحدد اسماء المفاتيح وقيما البدي ياها تكون بقلب ال result
  // result هو الـ object المتراكم، وreduce هي الآلية اللي بتلف على المصفوفة وتبني هذا الـ object.
  return errors.reduce<Record<string, string>>((result, item) => {
    // result = النتيجة المتراكمة
    // item = الخطأ الحالي من المصفوفة
    if (
      typeof item?.field === "string" &&
      isSafeUserMessage(item.message, 400) &&
      !result[item.field] // اقرأ المفتاح. إذا غير موجود، قيمته undefined و!undefined تساوي true لان اول شي نحنا عنا الاوبجيكت فاضية ما فيا مفاتيح  لو جاء خطأ ثاني لنفس الحقل بعد ما عبيناه بيعطينا  false، وما نستبدل أول رسالة
      // مثال: const errors = [
      //   { field: "email", message: "Email is required" },
      //   { field: "email", message: "Email must be valid" },
      //   { field: "password", message: "Password is required" },
      // ];
      // النتيجة:{
      //   email: "Email is required",
      //   password: "Password is required"
      // }لأن أول object عمل مفتاح email، الثاني نفس المفتاح فتجاهله بسبب !result[item.field]، والثالث مفتاح جديد password فأضافه.
    ) {
      result[item.field] = item.message.trim(); //هون عم تضيفي المفتاح ,وتعطي قيمة
      //لأن [] نفسها هي طريقة الوصول للمفتاح المتغير. اما لو ثابت كنت حطيت result.email  
    }
    return result;
  }, {}); // نبدأ بـ: result = {}
}

function getTranslationKey(
  status: number,
  context: ErrorContext,
): ErrorTranslationKey {
  if (status === 401) {
    return context === "login" ? "invalidCredentials" : "unauthenticated";
  }
  if (status === 403) {
    return context === "login" ? "accountUnavailable" : "forbidden";
  }
  if (status === 404) return "notFound";
  if (status === 400 || status === 409 || status === 422) {
    return "validationError";
  }
  if (status >= 500) return "serverError";

  return "unexpectedError";
}

export function normalizeApiError(
  error: unknown, //error هون هو الخطأ الراجع للفرونت من Next API Route بعد ما صار توحيد بـ normalizeBackendError، لكن داخل Axios يكون ملفوف كـ AxiosError، والـ body الموحّد موجود في error.response.data.لان اكسيوس الستلم الخطا بطلب ال login
  context: ErrorContext = "request", //إذا ما مررتيله قيمة، قيمته الافتراضية تكون:request
): NormalizedApiError {
  // ليش ما نعرض الخطأ الصاير إذا مو Axios لأنه غالبًا يكون خطأ تقني داخلي، وليس رسالة مناسبة للمستخدم. للمستخدم نعرض translationKey: "unexpectedError"
  if (!axios.isAxiosError<ApiErrorResponse>(error)) { //<ApiErrorResponse> نوع error.response.data
    return { fieldErrors: {}, translationKey: "unexpectedError" };
  }

  if (!error.response) {
    return {
      code: error.code, //الخصائص عامة من AxiosError
      fieldErrors: {},
      translationKey: "networkError", //غياب response غالبًا يعني مشكلة اتصال networkError
      // إمّا الطلب ما وصل للباك أصلًا، أو وصل والباك رد بس الرد انحجب/انقطع قبل ما Axios يستلمه؛ المهم من جهة Axios: ما عنده response لذلك يعاملها networkError.
    };
  }

  const status = error.response.status;
  const data = error.response.data;
  const code = data?.code ?? getErrorDetailsCode(data?.error);
  // كنت عم اسال لي ما جبنا الكود من errors فكان errors غالبًا مخصصة لأخطاء الحقول مثل email/password واذا بدي فيني حط الكود البترجعو ، أما data.code أو data.error.code تكون code عامة للخطأ كله.
  return {
    status,
    code, //فايدته إنه بيعطينا هوية دقيقة للخطأ ممكن نستخدمو بشرط معين if (normalizedError.code === "CATEGORY_NOT_FOUND") {تصرف خاص} بدون الاعتماد على نص الرسالة لان message نص للبشر وممكن الباك يغيّر صياغته يعني للعرض اما code مفروض يضل ثابت لأنه معمول للمنطق البرمجي لاتخاذ قرار بالكود
    message: isSafeUserMessage(data?.message, status)
      ? data.message.trim()
      : undefined,
    fieldErrors: getFieldErrors(data?.errors), // لأخطاء الحقول بتنحط تحت الحقل
    translationKey: getTranslationKey(status, context),
    // translationKey هو مفتاح الرسالة البديلة/المترجمة لما message ما تكون موجودة أو ما تكون آمنة للعرض
    // ما مررنا رسالة بديلة ثابتة متل ما عملنا بالباك هون عملنا رسالة بديلة عحسب ال status
  };
}
// لي باخطاء الباك normalizeBackendError  عم نحط رسالة بديلة اما باخطاء الفرونتnormalizeApiError عم نعرض رسالة بديلة عحسب ال (status, context) ?

// بالباك/route.ts الرسالة البديلة تكون مرتبطة بالعملية نفسها، مثل:فشل خدمة تسجيل الدخول / التحقق من الجلسة / جلب المنتجات يعني رسالة وحدة بتعبر عن خطا العملية العم اعملا بتكفي

// أما بالفرونت نفس status ممكن معناه يختلف حسب المكان  حسب تجربة المستخدم والمكان المعروض فيه الخطأ:
// 401 في login = بيانات الدخول خاطئة
// 401 في products = الجلسة انتهت
// 403 في login = الحساب غير مسموح له
// 403 في products = لا تملك صلاحية

// بالباك نمرر fallback ثابت لأنه حسب نوع العملية/server route.
// بالفرونت نطلع translationKey حسب status/context لأنه حسب تجربة المستخدم والمكان المعروض فيه الخطأ.
