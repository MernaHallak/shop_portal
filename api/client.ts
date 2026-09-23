// هذا Axios الخاص بالمتصفح. يعني ملف Axios يلي بتستدعيه من useQuery أو من Client Component. كل طلباته تذهب إلى Route Handlers في Next.js.

import { routing } from "@/i18n/routing";
import axios, {
  type InternalAxiosRequestConfig, //هو type من Axios بيمثل إعدادات request الأصلية، مثل: url وmethod و headers وdata 
  // يعني لما request يفشل، Axios بيحفظ config تبعه داخل: error.config  حتى Axios يضل عارف تفاصيل الطلب الأصلي ونقدر نعيده.
} from "axios";

// هاد عم ينشئ نسخة Axios خاصة بمشروعنا.
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true, //بيسمح للمتصفح يرفق الكوكيز المسموح بإرسالها مع طلبات Axios للـ Next API routes تلقائيًا.
  // headers: {
  //   "Content-Type": "application/json", //هذا مناسب للطلبات العادية، بس مو مناسب للـ FormData لهيك ما منحط نحنا النوع ومنخلي ال Axios يحدده تلقائياً حسب نوع الـ body
  // },
});

// أي request يطلع من خلال apiClient ويأخذ 401 رح يمر بنفس منطق الـ refresh تلقائيًا.
// إذا أي request رجع 401، جرّب refresh مرة واحدة، وبعدين أعد نفس request.

interface RetryableRequestConfig
// extends بـ TypeScript معناها: اعمل interface جديد يرث كل الخصائص من interface موجود، وزيد عليه خصائص إضافية. نحنا اخدنا خصاىص InternalAxiosRequestConfig من Axios، وزدنا عليها خاصية _retry اللي بتكون boolean أو undefined.
// _retry حتى نعرف إذا هالـ request جربنا نعيده سابقًا بعد refresh ولا لا.
// _retry رح نستخدمها لنعرف إذا هاد الطلب الأصلي تم إعادة المحاولة بعد نجاحrefresh token أو لا. حتى اذا تمت المحاولة ولسبب ما رغم نجاح الـ refresh عم يرجع الباك 401 مرة ثانية مثلا صار خلل بتحديث الكوكي بالمتصفح، ما نعمل loop infinite ويضل يعمل ريفريش فبعد اول محاولة مناخدو عتسجيل الدخول
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// حتى إذا عدة requests رجعوا 401 بنفس اللحظة،
// ما نعمل عدة refresh requests بنفس الوقت.
// Promise<void> يعني في عملية async منقدر ننتظرها بـ await، بس ما بهمنا أي قيمة ترجع منها؛ بهمنا بس إنها تنجح أو تفشل.
// void يعني الدالة ما بترجع قيمة للاستخدام. 
// إذا نجحت: await refreshPromise; بس بتكمل عادي وما بترجع قيمة مفيدة. إذا فشلت، الـ Promise بتعمل reject وبتروح للـ catch
// Promise<void> | null معناها يا ماسكة عملية refresh شغالة، يا ما في.  
let refreshPromise: Promise<void> | null = null;


// فـ helper فائدته الأساسية: redirect للـ login مع الحفاظ على اللغة الحالية، ومن مكان client-side ما فينا فيه نستخدم redirect() تبع Next مباشرة. لانها مخصصة للـ server-side. فهون منستخدم window.location.replace() بدلها.
// وما فينا نستخدم const router = useRouter(); router.replace("/login"); لأن useRouter() هو React Hook ولازم ينادى جوّا Client Component أو custom hook، بينما api-client.ts ملف عادي
function redirectToLogin() {
  // // يعني إذا الكود مو شغال بالمتصفح، لا تحاول تستخدم window لانها موجودة بالمتصفح بس. 
  // يعني باختصار: هي حماية حتى ما ينكسر الكود لو تنفذ خارج المتصفح.
  if (typeof window === "undefined") {
    return;
  }

  const firstPathSegment =
    window.location.pathname
      .split("/") //بتقسم النص كل ما تلاقي / يعني بتقسم بين كل عنصرين بيناتن /. مثال "/ar/products/123"  فبصير ["", "ar", "products", "123"] ليش أول عنصر فاضي؟ لأن النص بدأ بـ /
      .filter(Boolean)[0]; //وظيفتها تشيل القيم الفاضية أو falsy. فبصير ["ar", "products", "123"] وبعدين ناخد أول عنصر اللي هو "ar"

  const locale = routing.locales.includes( //routing.locales هي اللائحة اللي فيها اللغات المسموحة بالمشروع
    firstPathSegment as (typeof routing.locales)[number], //"ar" | "en" يعني نوعا واحد من القيمتين فقط.
  )
    ? firstPathSegment //يعني إذا أول جزء فعلًا locale معروف مثل ar أو en استخدمه
    : routing.defaultLocale; //وإلا استخدم اللغة الافتراضية

  window.location.replace(`/${locale}/login`); //يعني: ودّي المتصفح لرابط جديد واستبدل الصفحة الحالية به.
  // ما استخدمنا redirect(...)  لأننا هون مو داخل Server Component   
}






// interceptor يعني شيء بيعترض الطلب أو الرد وهو مارق حتى نقدر نفحصه أو نعدله. 
// Axios عنده نوعين مشهورين:interceptors.request  قبل ما request يطلع. و:interceptors.response بعد ما response يرجع. 

// كل response ناتج عن request انعمل بـ apiClient رح يمر بهالـ interceptor
// response.use بياخد عادةً دالتين: successHandler, errorHandler,  
apiClient.interceptors.response.use(
  (response) => response, //يعني إذا request نجح: ما نعمل شي، رجّع response مثل ما هو.  

  // error = خطأ الطلب الأصلي.
  async (error) => { //هاي بتشتغل إذا request فشل.
    const originalRequest =
      error.config as // هي اعدادات الطلب الفشل، مثل: url وmethod و headers وdata.
        | RetryableRequestConfig
        | undefined; //لأن error.config ممكن نظريًا ما تكون موجودة ببعض حالات الخطأ،

    const status = error.response?.status; //الـ ?. لأن response ممكن أصلًا ما تكون موجودة بحالات مثل network error.

    if ( // اذا الخطا من هدول فما إلو علاقة بالـ refresh.
      status !== 401 || //إذا الخطأ مو 401، مثل 500، refresh ما إله علاقة.
      !originalRequest  //إذا ما عنا معلومات عن الطلب الأصلي، ما منقدر نعيده.
    ) {
      return Promise.reject(error); //يعني رجّع الخطأ مثل ما هو وخليه يكمل للـ catch تبع المكان اللي نادى request.
      // يعني interceptor ما "بيبلع" الخطأ؛ إذا ما عالجناه، منرجعه مرفوض لحتى الكود الأصلي يتعامل معه.
    }

       // إذا هاد طلب login نفسه ورجع 401، غالبًا بيانات الدخول غلط. ما منعمل refresh.
    if (
      originalRequest.url?.includes(
        "/auth/login",
      )
    ) {
      return Promise.reject(error);
    }
 
   // // إذا الطلب رجع 401 أول مرة، منعمل refresh وبنعلّمه _retry = true وبنعيد الطلب مرة واحدة. إذا رجع 401 بعد الإعادة، منوقف مباشرة وما منعمل refresh ثاني لنفس الطلب.
    if (originalRequest._retry) {
      redirectToLogin();

      return Promise.reject(error);
    }

    if ( //إذا request الفاشل نفسه هو /auth/refresh، لا تحاول تعمل refresh للـ refresh لان بكون رجع 401 لأن refresh token انتهى فاحتى ما يصير loop لا نهائي بقلو ياخدني لتسجيل الدخول 
      originalRequest.url?.includes(
        "/auth/refresh",
      )
    ) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true; //هاد الطلب صار له محاولة retry.

    try {
      // مشروحة بالتفصيل بال refresh-token.md
      if (!refreshPromise) {
        refreshPromise = apiClient
          .post("/auth/refresh") //هاي بتبدأ طلب الـ refresh، وبترجع Promise فيها response.
          .then(() => undefined) //إذا refresh نجح، تجاهل الـ response اللي رجع وخلي نتيجة الـ Promise هي undefined يعني عمليا Promise<void>. لأننا مو محتاجين الـ response نفسه، بس محتاجين نعرف إنه العملية خلصت بنجاح.
          .finally(() => {
            refreshPromise = null; //هاي بتنّفذ بالنهاية سواء refresh نجح أو فشل، وبتقول: ما عاد في عملية refresh شغالة حاليًا، رجّع المتغير null.
          });
      }

      await refreshPromise; //بنستنى تخلص فقط، ما في نتيجة نستخدمها

          // refresh نجح والكوكي الجديدة انخزنت، منعيد نفس الطلب الأصلي.
      return apiClient(originalRequest); //أعد نفس request اللي فشل قبل شوي. بال access_token جديد 
    } catch (refreshError) { //refreshError = خطأ محاولة تجديد الجلسة.
      redirectToLogin(); //إذا refresh فشل، روح على صفحة تسجيل الدخول.
      return Promise.reject(refreshError); //وبيرجع للـ catch الموجود بالمكان اللي استدعى apiClient أصلًا. يعني catch الخارجي.
    }
  },
);

