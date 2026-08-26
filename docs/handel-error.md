 ## خطوات الخطا:
catch (error)
External Backend او قد لا يوجد رد من الباك ونحنا منرجع رد من حالنا من الapi next عحسب الحالة اذا كان خطا بالكود او انقطاع الاتصال نيتورك ايرور او غيرها
يرجع خطأ خام
↓ داخل route.ts

normalizeBackendError
ينظف ويرجع body موحّد:
{ message, code, errors }
Error Responses أخطاء الباك بالدوكيومنتيشن بتخبرك شو ممكن يجيك اخطاء خام، وأنتِ بالـ normalizeBackendError بتختاري contract موحّد ترجعينه للفرونت مثل:  { message, code, errors }
ليش ما رجعنا error؟  لأن error غالبًا يكون غير ثابت: مرة string، مرة object، مرة technical details. لذلك استخرجنا منه الشي المفيد مثل code، وتركنا التفاصيل الخام.
مثال:if (error.code === "INVALID_CREDENTIALS") {
  return "الإيميل أو كلمة المرور غير صحيحة.";
}  

route.ts يرجع HTTP response
↓
المتصفح يستقبله
المتصفح هو البيئة اللي فيها كود الفرونت شغال، وداخل هالبيئة Axios هو اللي أرسل الطلب وهو اللي يستلم نتيجة الطلب.
const response = await apiClient.post<LoginResponse>( هاد اكسيوس الفرونت
    "/auth/login",
    credentials,
  );
↓
Axios الفرونت يستلمه
↓
إذا status 2xx => يعطيك response
إذا status خارج 2xx => يرمي AxiosError:
error.response.status
error.response.data

Axios يرمي AxiosError
↓
login لا ترجع LoginResponse  return response.data;
↓
React Query يمسك الخطأ
↓
يحطه داخل property اسمها error //React Query يأخذ الشيء اللي انرمى من mutationFn ويحطه كما هو داخل property اسمها:error
المقصود mutationFn نفسها؛ يعني الدالة اللي بتنفيذ العملية مثل login(credentials)، وإذا جواتها Axios رمى خطأ، React Query بياخد هالخطأ ويحطه في error.
إذا ما في خطأ، mutationFn بترجع نتيجة login(credentials)، وReact Query بيحفظها داخل property اسمها:data  

↓ داخل component/hook
const { mutate, error, isError, isPending, reset } = useLogin(); //error  الخطأ اللي رماه Axios

normalizeApiError
normalizeApiError وظيفتها: تأخذ الخطأ التقني الجاي من Axios/React Query، وتحوّله لشكل ثابت وسهل للواجهة مثل { status, code, message, fieldErrors, translationKey } حتى نعرض رسالة مناسبة للمستخدم بدون ما نفك AxiosError بكل component بهذا الشكل 
if (axios.isAxiosError(error)) {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  // افحصي network error
  // افحصي 401
  // افحصي 500
  // افحصي field errors
}
normalizeApiError يحوّل AxiosError إلى UI error:
{ status, code, message, fieldErrors, translationKey }

↓ UI

t(error.translationKey)
أو عرض fieldErrors.email

translationKey => رسالة عامة للمستخدم
fieldErrors.email/password => رسائل تحت الحقول

## Error Responses : 
هي الأمثلة عن الاخطاء الممكنة بيعطيني ياها الباك ولكن غير شاملة فانا بس بستفاد منا لاعرف شو الحقول البترجعا لاعمل دالة توحيد الاخطاء وخليا ترجع الحقول الرح استفاد منا من الباك وبالنسبة للاخطاء انا عكل حقل بحط تحتو حالة خطاء اذا كان موجود رد بالباك برجعلي ياه ولو مو مزكور بالدكيمنتيشن لان هي مجرد أمثلة عن الاخطاء وليست شاملة يعني انا البحط الحالات الممكنة لان الباك ما ضروري يكون ذاكر كلشي متل  كلمة السر مطلوبة ممكن ما يكون ذاكرا الباك بس برجعلي رد الها 
Error Responses بتستفيد منا أساساً لتعرف:
شكل الـ error object.
شو الحقول الممكن ترجع مثل field, code, message, errors.
وبالتالي كيف تخلي دالة التوحيد تتعامل معها.

أما الأمثلة نفسها مو شرط تكون كل الأخطاء الممكنة.

## دور ال normalizeBackendError و وnormalizeApiError:
normalizeBackendError : تنظيف خطأ الباك الخارجي قبل إرساله للفرونت
تشتغل داخل route.ts، وتحوّل خطأ الباك الخارجي إلى response موحّد يرجع للفرونت.

normalizeApiError : تجهيز خطأ Axios داخل الفرونت للعرض للمستخدم
تشتغل داخل Client Component، وتحوّل AxiosError إلى شكل مناسب للـ UI.

ليش ما نكتفي بالأولى؟ لأن الأولى فقط توحّد response بين السيرفر والفرونت، لكن الفرونت لسه يستقبلها ملفوفة داخل AxiosError:error.response.data

فـ normalizeApiError تفكّ AxiosError وتجهّزها للعرض: رسالة عامة، أخطاء حقول، ومفتاح ترجمة حسب السياق.

لأن دالة الباك توحّد شكل الرد الخارج من route.ts، لكنها ما تمنع أن الفرونت يستقبل الخطأ كـ AxiosError وفيه حالات خاصة لازم تتحول لـ UI.
مثلا:
normalizeBackendError
External Backend error → {message, code, errors} + status
لكن بالفرونت اللي بيوصل هو:
AxiosError {
  response: {
    status,
    data: {message, code, errors}
  }
}
فـ normalizeApiError تفكّ هذا الشكل وتطلع لك شيء جاهز للعرض:
{
  status,
  message,
  fieldErrors,
  translationKey
}

وكمان في حالات ما تمر أصلًا على normalizeBackendError:
network error من المتصفح إلى Next API Route //axios.get("/api/products") هذا الطلب يطلع من المتصفح إلى Next API Route فممكن يفشل قبل ما يوصل للـ route أصلًا بسبب:النت مقطوع - السيرفر المحلي/Next واقع- URL غلط -timeout
route ثاني ما استخدم normalizeBackendError 
## بالمختصررر  خطوات الخطا:
route.ts رجع HTTP response بفشل
↓
Axios الفرونت استلم status 401/422/500
↓
Axios حوّله إلى AxiosError
↓
React Query حطه داخل error
ومنحطو بال normalizeApiError لنعرضو بالواجهة بشكل موحد وبسيط



---------------------------------
## لي عم اتحقق انو الخطا شكلو اكسيوس بال export function normalizeApiError:
كنت عم اتحقق انو الخطا شكلو اكسيوس لأن normalizeApiError(error) تستقبل error: unknown يعني دالة عامة ممكن تنادى بأي خطأ، وليس فقط خطأ جاي من Axios.
مثال عندك حاليًا:const normalizedError = normalizeApiError(error, "login"); هون غالبًا error هو AxiosError.
لان المسار محدد جدًا:
route.ts رجع HTTP response بفشل
↓
Axios الفرونت استلم status 401/422/500
↓
Axios حوّله إلى AxiosError
↓
React Query حطه داخل error

بس ممكن لاحقًا يصير في mutationFn هيك:

mutationFn: async (credentials) => {

  if (!credentials.email) {

    throw new Error("Missing email before request");

  }
  return login(credentials);

}
هون الخطأ صار قبل Axios يعني قبل ما يفوت على login ويعمل طلب اكسيوس، فمو AxiosError.

 catch (error) { // error بيجي تلقائيًا من الشي اللي صارله throw داخل الـ try ممكن يكون خطا اكسيوس او خطا بالكود
  // إذا الطلب للباك فشل وAxios رمى خطأ، فـ catch (error) يستقبل AxiosError، وداخله الرد الراجع من الباك يكون هنا:  error.response?.data أو يكون network error وما فيه رد من الباك أصلًا بس يعتبر رد AxiosError بهي الحالة كمان بس بدون ريسبونس error.response === undefined
  //  اماااا اذا ال Axios ما رمى خطا فالخطا ممكن يكون من سبب ثاني داخل try، مو من Axios، مثل خطأ بالكود نفسه. 

-----------------------------------------
## AxiosError نوعين مهمين:

AxiosError ومعه response
=> السيرفر ردّ HTTP response مثل 401/500
=> نقرأ: error.response.status و error.response.data

AxiosError بدون response
=> الطلب ما وصل أو ما رجع رد HTTP واضح
=> مثل network error / CORS / timeout يعني الطلب أخذ وقت أطول من الحد المسموح، فـ Axios أوقفه واعتبره فشل اتصال / server down 
=> ما في error.response.data أصلًا
فبقرا من الخصائص عامة على AxiosError نفسهم  error.code - error.message
أما error.response.data.code فهي code جاية من body تبع السيرفر لما يكون في HTTP response.

غياب response غالبًا يعني مشكلة اتصال networkError
إمّا الطلب ما وصل للباك أصلًا، أو وصل والباك رد بس الرد انحجب/انقطع قبل ما Axios يستلمه؛ المهم من جهة Axios: ما عنده response لذلك يعاملها networkError.
----------------------------
## فايدة ال optional chaining "?"
error.response?.status فالـ "?." يقول إذا response غير موجودة، لا تكملي لـ .status ورجّعي undefined.
undefined يعني: القيمة غير موجودة/لم يتم تحديدها.

data?.error  احميني إذا data غير موجودة ورجع undefined بدل ايرور ، وإذا error غير موجودة رجّع undefined عادي  لأن قراءة property غير موجودة من object موجود ما بتكسر  الكود اما اذا كان الاوبجيكت هو المو موجود ومو حاطة "؟" وقتا رح ينكسر الكود ويرجع ايرور

console.log(data.error); // undefined
console.log(data?.error); // undefined