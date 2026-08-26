// أخطاء الباك داخل Route Handlers
// normalize يعني وحّد الشكل أو خلّيه بصيغة ثابتة.لأن أخطاء الباك ممكن ترجع بأشكال مختلفة، وهي الدالة بتحولها لشكل واحد مفهوم للفرونت.
import "server-only";

import axios from "axios";

import type {
  ApiErrorDetails,
  ApiErrorResponse,
  ApiValidationError,
} from "@/types/api";

interface BackendErrorResult {
  status: number;
  body: ApiErrorResponse;
}

const TECHNICAL_MESSAGE_PATTERNS = [
  /request failed with status code/i,
  /stack trace/i,
  /supabase/i,
  /postgres|postgresql|sqlstate/i,
  /internal server error/i,
  /ECONN|ENOTFOUND|ETIMEDOUT/i,
];
// هاي دالة type guard، معناها إذا رجعت true، TypeScript اعتبر value من هون وطالع string
// هل هاي القيمة نص نظيف وآمن أقدر أعرضه للمستخدم؟
function isSafeMessage(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const message = value.trim();
  return (
    message.length > 0 &&
    message.length <= 240 &&
    !TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(message)) //هي قائمة “كلمات/أنماط تقنية” ما بدك تعرضيها للمستخدم متل Cannot read properties of undefined -SQL connection failed اذا كان هيك برجع فولس وبرجعلو fallbackMessage
  );
}
// بتشيل العناصر الغلط أو غير الآمنة وبترجع فقط أخطاء منظمة بالشكل ApiValidationError[] لان ممكن الباك يتغير، أو يصير bug، أو endpoint ثاني يرجع شكل مختلف.لأننا ما بدنا الكود ينهار إذا صار غلط
function sanitizeValidationErrors(value: unknown): ApiValidationError[] | undefined {
  if (!Array.isArray(value)) return undefined; //يعني إذا value مو مصفوفة، اطلعي فورًا
// map     => يرجع array // [[10], [], [30]]
// flatMap => يرجع array كمان، بس إذا كل item رجّع array، بيفردها مستوى واحد // [10, 30], وتسمح لك ترجعي [] لتجاهل العنصر 
  // الـ <ApiValidationError> هون يحدد نوع العناصر اللي سترجع من flatMap
const errors = value.flatMap<ApiValidationError>((item) => { // item هو اوبجيكت الخطا
    // !item تمسك null لان ال null يعتبر اوبجيكت
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>; //اعتبره object بمفاتيح string، وقيمها unknown لان اذا ما حطيت هيك التايب سكريبت ما رح يقرا المفاتيح لان بالشرط الفوق عرف انو اوبجيكت بشكل عام بس ما عرفنا مقاتيحو 
    if (!isSafeMessage(candidate.message)) return []; //إذا message مو نص آمن، تجاهلي الخطأ كاملًا يعني اوبجيكت الخطا كلو

    return [{
      field: typeof candidate.field === "string" ? candidate.field : undefined,
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message: candidate.message.trim(),
      expected:
        typeof candidate.expected === "string" ? candidate.expected : undefined,
    }];
  });

  return errors.length ? errors : undefined;
}
// الدالة وظيفتها ترجع code إذا كان موجود كنص من أكثر من مكان محتمل
function getCode(data: ApiErrorResponse | undefined) {
    const firstErrorCode = data?.errors?.[0]?.code;
  if (typeof firstErrorCode === "string") return firstErrorCode;
  if (typeof data?.code === "string") return data.code;
if (data?.error && typeof data.error === "object") {
  const errorCode = data.error.code;
  if (typeof errorCode === "string") return errorCode;
  }
  return undefined;
}

export function normalizeBackendError(
  error: unknown,
  fallbackMessage: string,
): BackendErrorResult {
  //  إذا طلع الخطاAxiosError، فـ data تبعه متوقعة تكون ApiErrorResponse الهي error.response?.data
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    // الخطأ اللي وصل للـ catch ليس بالشكل الخاص بـ Axios فما فينا نقرأ منه بأمان: error.response.status error.response.data
      // هون الخطأ مو AxiosError، يعني غالبًا ما عنا response من الباك والكود تبع Next هو اللي وقع ممكن يكون سببه bug بالكود، throw يدوي، خطأ runtime، أو أي خطأ غير متوقع
    return {status: 500, body: {message: fallbackMessage}}; //500  خطأ عام غير معروف أو غير متوقع من جهة السيرفر/الكود الذي يعالج الطلب
  }
// upstreamStatus:status القادم من الباك الخارجي
  const upstreamStatus = error.response?.status;
  const status = upstreamStatus ?? 502; 
  // 502 Bad Gateway معناها عادةً: السيرفر الوسيط اشتغل Next API Route  ، لكنه فشل بالحصول على رد HTTP صالح من الباك الخارجي، لا نجاح ولا فشل واضح؛ السبب ممكن انقطاع نت، timeout، CORS، DNS، أو الباك واقع.  
  const data = error.response?.data;
  const code = getCode(data);

  if (status >= 500) {// اذا الباك رجع 500 وما فوق معناتا معناها في مشكلة بالسيرفر
    return {
      status,
      body: {
        message: fallbackMessage, // ما عرضنا الخطا لأن أخطاء 500 وما فوق غالبًا أخطاء داخلية من السيرفر، ورسالة الباك ممكن تكون تقنية أو حساسة أو غير مفهومة للمستخدم.
        ...(code ? {code} : {}), //{ code } هي اختصار ل { code: code }  ف ...{ code: code } يعني انسخي محتوى هاد الـ object داخل الـ object الأكبر وبصير عنا code: code
      },
    };
  }
// بحالة network error رح يرجع :
// {
//   status: 502,
//   body: {
//     message: fallbackMessage
//   }
// }

  const message = isSafeMessage(data?.message)
    ? data.message.trim()
    : fallbackMessage;
  const errors = sanitizeValidationErrors(data?.errors);

  return {
    status,
    body: {
      message,
      ...(code ? {code} : {}),
      ...(errors ? {errors} : {}),
    },
  };
}

export function getBackendErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
