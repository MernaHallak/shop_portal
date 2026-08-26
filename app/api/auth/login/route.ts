import {NextRequest, NextResponse} from "next/server";// خاصة بسيرفر Next.js
// NextRequest يمثّل الطلب اللي وصل للـ Route Handler. مثلًا المتصفح أرسل كائن طلب HTTP وفيه ال الـbody:
// axios.post("/api/auth/login", {
//   email: "test@test.com",
//   password: "123456",
// });

// NextResponse هو الكائن اللي بترجعيه من Route Handler للمتصفح هاد الكاىن بكون فيو ال body وال header وال config هو رد http للمتصفح
//  NextResponse.json() = HTTP response حقيقي رايح للفرونت 

// العم نعملووو:
// request.json()  => هل الـ body JSON صالح؟
// isRecord()      => هل هو object عادي؟
// validation      => هل email/password موجودين ونوعهم string؟

import {backendClient} from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";
import type {
  BackendLoginResponse,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";
// isRecord معناها هل القيمة object عادي فيه حقول؟ لان بـ TypeScript كلمة Record معناها: object فيه key/value
// Record<string, unknown> هو type بـ TypeScript يعني: object مفاتيحه نصوص، وقيمه لسا نوعها غير معروف.
// استخدمنا unknown للقيم لأننا بهالمرحلة عرفنا فقط إنه object، بس لسا ما عرفنا إذا email string أو password string.
// value is Record<string, unknown> هذا اسمه type guard. معناه: إذا الدالة رجعت true، TypeScript اعتبر value من هون وطالع object من نوع Record<string, unknown>.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
  // أي شي مو object بيرجع false تلقائيًا، مثل: typeof = "string" - typeof = "number" -typeof ="boolean" أما null وarray لازم نفحصهم لحالهم لأن JavaScript بتعتبرهم object
}
// success: true  الطلب شكله صحيح عندي data فيها email/password كـ strings كمل وابعتهم للباك لتسجيل الدخول
// success: false الطلب شكله غلط لا تبعت شي للباك رجّع response للفرونت مباشرة
// هذا validation محلي بالـ Next route قبل ما تبعتي الطلب للباك الخارجي. ليتحقق انو ال  body هو object وال email/password مو ناقصين
//  كان فيني ابعت الطلب للباك بدون هاد التحقق والباك يبعتلي الخطا بدل ما اكتبو يدويا لكن هي الدالة وظيفتها تقول: هل الطلب صالح أصلًا قبل ما أرسله للباك؟ حتى ما نكلف الباك بطلب معروف أنه غلط
// اما parsedBody = await request.json(); ما كان فيني ابعتا للباك وهو يرجعلي الخطا لان هون صار عندي خطا بالكود قبل ما يوصل الطلب للباك لان الجيسون غير صالح للتحويل لجافا سكريبت  يعني الباك الخارجي ما أخذ الطلب وما رجّع شي. لذلك نرجع الخطا يدويا 
// الخلاصة: الأخطاء الشكلية/basic validation بنرجعها من route.ts، أما أخطاء التحقق الحقيقي من الحساب بتجي من الباك مثل email/password غلط فعليًا -  الحساب ممنوع - السيرفر واقع
// يعني اخطاء ال 400 الهي الطلب المرسل من الفرونت غلط منتحقق منا ومنبعت شكل الغلط يدويا قبل ما نرسلو للباك حتى ما نكلف الباك بطلب معروف أنه غلط ومن الدوكيمنتيشن بس مناخد شكل الخطا ليكون الخطا موحد بالفرونت

function validateLoginRequest(value: unknown):
  | {success: true; data: LoginRequest}
  | {success: false; response: NextResponse} {
  if (!isRecord(value)) {
    return {
      // اللي بيوصل للفرونت عبر Axios هو فقط محتوى NextResponse.json(...) لان هاد هو الرد للفرونت
      // يعني success وظيفته قرار داخلي بال route.ts هل التحقق نجح؟
      success: false,
      response: NextResponse.json(
        {
          message: "Validation failed",
          errors: [{
            field: "body",
            code: "INVALID_BODY",
            message: "Request body must be an object.",
          }],
        },
        {status: 400},
      ),
    };
  }

  const email = typeof value.email === "string" ? value.email.trim() : "";
  const password = typeof value.password === "string" ? value.password : "";
  const errors: Array<{ //errors هو array، وكل عنصر داخله لازم يكون بالشكل المكتوب بين <>
    field: "email" | "password";
    code: string;
    message: string;
  }> = [];

  if (!email || !email.includes("@")) {
    errors.push({
      field: "email",
      code: "INVALID_EMAIL",
      message: "Email must be a valid email address.",
    });
  }
  if (!password) {
    errors.push({
      field: "password",
      code: "REQUIRED",
      message: "Password is required.",
    });
  }

  if (errors.length) {
    return {
      success: false,
      response: NextResponse.json(
        {message: "Validation failed", errors}, // كاتبتا بطريقة مختصرة هي هيك errors: errors
        {status: 400},
      ),
    };
  }

  return {success: true, data: {email, password}};
}

export async function POST(request: NextRequest) {//حتى بس الفرونت يبعت طلب POST على /api/auth/login، فهاد الفانكشن رح يشتغل
  let parsedBody: unknown; 
  // unknown قبل الفحص، لأنه دخل خارجي غير موثوق  ممكن المستخدم يبعت أي شي مو ضروري عحسب الدوكيمنتيشن المتوقع
  // LoginRequest بعد الفحص، لأنه صار validated
  // استخدمنا let لأننا عرّفنا المتغير أولًا بدون قيمة،
  // وبعدين أعطيناه قيمة داخل try.
  // أما مع const لازم نعرّف المتغير ونعطيه قيمة بنفس السطر.
  try {
       // request.json() بتقرأ الـ body اللي أرسله المتصفح. يقرا جسم الطلب
    // وممكن نقرأ أشياء ثانية:لان الريكويست عبارة عن كاىن فيو كذا شي مو بس الـbody
    // request.headers -request.cookies -request.nextUrl
    parsedBody = await request.json();
     //لما الطلب يدخل للسيرفر: await بينتظر لحتى request.json() يقرأ الـ body كـ JSON  اللي باعتو الفرونت بالطلب للروت ويحوّله لقيمة JavaScript صالحة للاستخدام بالكود اي request.json() يفحص إن النص JSON صالح 
    //  يعني لما الفرونت يعمل: axios.post("/api/auth/login", body) الـ route يستقبل طلب كامل فيه: method: POST -headers - cookies-url-body
// JSON ممكن يكون object، وممكن يكون string، number، boolean، array، أو null
    // إذا الفرونت بعت body مو JSON صحيح، مثلًا: { "email": "test@test.com", } فيه فاصلة زيادة، أو بعت نص عادي بدون اشارتين تنصيص بدل JSON، وقتها request.json() بتفشل لان معد يزبط التحويل من جيسون لJavaScript وبتعمل throw.
    // تحولت من جيسون هيك :'{"email":"test@example.com","password":"123456"}' الى جافا سكريبت من نوع اوبجيكت{email: "test@example.com",password: "123456"} يقدر الجافا سكريبت يتعامل معها كقيمة بالكودparsedBody.email 
  } catch {
    // الخطأ محلي يعني body المرسل إلى route.ts نفسه ليس JSON صالحًا، يعني الخطأ من طلب الفرونت/العميل، قبل طلب الباك الخارجي، فلا يدخل normalizeBackendError، لكنه يرجع للفرونت كـ response خطأ مكتوب يدويا، وAxios يرميه ثم normalizeApiError يتعامل معه.
    return NextResponse.json(
      {
        message: "Invalid JSON body",
        error: {
          code: "INVALID_JSON",
          // details: "Request body must be valid JSON."

        },
      },
      {status: 400},  // 400 معناها: الطلب المرسل من الفرونت غلط
    );
  }

  const validation = validateLoginRequest(parsedBody);
  if (!validation.success) return validation.response;

  try {
      // backendResponse هو رد Axios الكامل من الباك، وبيحتوي:
    // {
    //   data: ...,       // البيانات التي أرسلها الباك داخل Response Body
    //   status: 200,
    //   headers: ...,
    //   config: ...
    // }
    // post<BackendLoginResponse> ما عم يصف backendResponse كله هو عم يصف شكل backendResponse.data فقط.
    const backendResponse = await backendClient.post<BackendLoginResponse>(
      "/api/auth/login",
      validation.data,
    );
     // backendData هي فقط البيانات الموجودة داخل body رد الباك.
    const backendData = backendResponse.data;
      // responseBody هو الـ body اللي Route Handler رح يرجّعه للمتصفح
    // بعد حذف session والتوكينات.
    const responseBody: LoginResponse = {
      message: backendData.message,
      user: backendData.user,
      profile: backendData.profile,
      store: backendData.store,
    };
    const response = NextResponse.json(responseBody);
// response.cookies.set(...) يعني عم تضيفي cookie على نفس الـ response اللي رح يرجع للفرونت وهنيك المتصفح يخزن الكوكي
    response.cookies.set({
      name: "access_token",
      value: backendData.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  // بالإنتاج بتصير true، يعني الكوكي تنرسل فقط عبر HTTPS.
          // بتخفف خطر CSRF، وبتمنع إرسال الكوكي بمعظم الطلبات الجاية من مواقع خارجية.
      // CSRF: الطلب بينطلق من موقع خارجي والمتصفح هو اللي بيرسل الكوكي تلقائيًا مع الطلب.
      // SameSite هو اللي بيقرر إذا يسمح بإرسال الكوكي بهالحالة 
// أما XSS فالكود الخبيث بيشتغل داخل موقعك نفسه وبيبعت الطلبات منه.
      sameSite: "lax",
      path: "/",   // يعني الكوكي تنرسل مع كل مسارات الموقع.
      maxAge: backendData.session.expires_in,
    });
    response.cookies.set({
      name: "refresh_token",
      value: backendData.session.refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
        // الكوكي بتنرسل فقط مع /api/auth والمسارات اللي تحته.
      // لأن access_token منحتاجه بمعظم الطلبات المحمية مثل: إضافة، تعديل، حذف المنتجات والطلبات، لذلك path: "/".
      // أما refresh_token ما لازم ينرسل إلا لنقاط المصادقة مثل /api/auth/refresh أو logout،فبنضيّق مساره لتقليل انكشافه.
      path: "/api/auth",
      maxAge: 60 * 60 * 24 * 30,
    });
// access_token: التوكن اللي تستخدمه مع الطلبات المحمية، عمره قصير، وإذا انتهى يعطيك غالبًا 401.
// refresh_token: توكن عمره أطول، ما تستخدمه لكل الطلبات، تستخدمه فقط لتجديد access_token لما ينتهي.
    return response;
//     catch (error) => لما بدك تستخدم تفاصيل الخطأ 
// catch=> لما بدك تعرف فقط أنه صار خطأ، بدون تفاصيل
// AxiosError يعني خطأ رماه Axios، وقد يكون فيه رد من الباك داخل error.response.data، أو يكون network error وما فيه رد من الباك أصلًا.
// الطلب فعلًا راح للباك الخارجي، وإذا فشل فالخطأ جاي من Axios/الباك الخارجي، لذلك ندخله على: normalizeBackendError
  } catch (error) { // error بيجي تلقائيًا من الشي اللي صارله throw داخل الـ try ممكن يكون خطا اكسيوس او خطا بالكود
  // إذا الطلب للباك فشل وAxios رمى خطأ، فـ catch (error) يستقبل AxiosError، وداخله الرد الراجع من الباك يكون هنا:  error.response?.data أو يكون network error وما فيه رد من الباك أصلًا بس يعتبر رد AxiosError بهي الحالة كمان بس بدون ريسبونس error.response === undefined
  //  اماااا اذا ال Axios ما رمى خطا فالخطا ممكن يكون من سبب ثاني داخل try، مو من Axios، مثل خطأ بالكود نفسه. 
    const normalized = normalizeBackendError(
      error,
      "Authentication service is unavailable",
    );
    return NextResponse.json(normalized.body, {status: normalized.status});
  }
  // NextResponse.json(body, options) body ممكن يكون object أو array أو string... اما options لازم يكون object
}
