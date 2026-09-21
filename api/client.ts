// هذا Axios الخاص بالمتصفح. يعني ملف Axios يلي بتستدعيه من useQuery أو من Client Component. كل طلباته تذهب إلى Route Handlers في Next.js.

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

// interceptor يعني شيء بيعترض الطلب أو الرد وهو مارق حتى نقدر نفحصه أو نعدله. 
// Axios عنده نوعين مشهورين:interceptors.request  قبل ما request يطلع. و:interceptors.response بعد ما response يرجع.   
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config as //error.config هو request اللي فشل نفسه
        | RetryableRequestConfig
        | undefined;

    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // ممنوع refresh request نفسه يحاول يعمل refresh،
    // وإلا منعمل loop إذا الـ refresh token منتهي.
    if (
      originalRequest.url?.includes(
        "/auth/refresh",
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

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

      // access_token الجديد صار بالـ cookie，
      // فنعيد نفس الطلب الأصلي.
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);