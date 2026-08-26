## اعتماد HttpOnly Cookie مع Next.js Route Handlers
سنخزن التوكين باستخدام:
HttpOnly Cookie + Next.js Route Handlers كـ BFF

الهدف هو ألا يكون التوكين متاحًا مباشرة لكود JavaScript الذي يعمل في المتصفح.
استخدمنا Next.js Route Handlers حتى التعامل مع التوكين يصير على السيرفر، والفرونت ما يقدر يقرأ قيمته مباشرة.

`BFF` اختصار:Backend For Frontend وهي طبقة backend صغيرة مخصصة للفرونت. في مشروعنا، Next.js Route Handlers هي التي تقوم بدور الـ BFF بين الواجهة والباك الحقيقي.

------------------------

## مختصر فكرة تخزين التوكين بالاعتماد HttpOnly Cookie مع Next.js Route Handlers

HttpOnly Cookie:
هي Cookie عادية، لكن عليها الخاصية:httpOnly: true
→ تُرسل تلقائيًا
→JavaScript الفرونت الذي يتنفّذ داخل المتصفح لا يستطيع قراءة الـ HttpOnly Cookie.
→ السيرفر فقط يقرأها
والـ HttpOnly مو نوع تخزين مختلف بالكامل؛ هي Cookie عادية عليها حماية تمنع JavaScript من قراءة قيمتها.

الـ HttpOnly cookie تنرسل تلقائيًا من المتصفح إلى Route Handler، وبعدها الـ Route Handler يضيف التوكين يدويًا داخل Authorization ويرسله للباك الحقيقي

الفكرة كلا انو يتم تخزين التوكين الراجع من الباك بال HttpOnly Cookie عن طريق Route Handlers  لحتى ما يتم قراءة الكوكي من js الفرونت الممكن تكون عبارة عن كود انا كاتبتو بجيب اللوكال او الكوكي او مثلا مكتبة او سكربت خبيثين او مخترقين 
فلهيك مع كل طلب يرسل المتصفح مع الطلب المرسل للباك يرسل التوكين المخزن بالمتصفح لل Route Handlers وال Route Handlers يقراءه عن طريق دالة cookies() من next/headers ويرسلو مع كل طلب للباك بال Authorization 
فهيك نبعتت للسسيرفر التوكين والسيرفر بعتا للباك بدون ما يشوفا الفرونت
 Route Handler فهو endpoint يعمل على سيرفر Next.js، ويستطيع قراءة HttpOnly Cookie وإضافة التوكين إلى طلب الباك دون كشفه للفرونت.

 Backend يرجّع token
→ Route Handler يخزّنه داخل HttpOnly cookie
→ المتصفح يحفظ الكوكي

Frontend يرسل request إلى /api/products
→ المتصفح يرفق الكوكي تلقائيًا
→ Route Handler يقرأها عبر cookies()
→ يضيف Authorization
→ يرسل الطلب للباك الحقيقي
وبهيك التوكين يوصل من المتصفح إلى سيرفر Next.js ثم إلى الباك، بدون ما JavaScript بالفرونت يقدر يقرأ قيمته.


-----------------------------------

## طريقة الية تخزين كل الخيارات :

## localStorage و sessionStorage:
اللوكال ستوريج والسيشن ستوريج المتصفح لا يرسل التوكين تلقائيًا مع طلب الـ API المرسل إلى الباك متل fetch("https://backend.com/products") فمنضطر لقراىتو بالمتصفح عن طريق localStorage.get واضافتو يدويا لطلب الباك داخل Authorization
بس هاد الشي خطر لان اللوكال والسيشن يتم قراىتها من المتصفح

## cookie العادي:
اما الكوكي العادي فيتم ارسال الكوكي تلقاىيا من المتصفح للباك وما منحطو يدويا للتوكين بالطلب بس بشرط يكون دومين الكوكي نفس دومين الباك حتى بس يتم ارسال طلب من المتصفح للباك يتم ارفاق هي الكوكي تلقاىيا 
الطلب مو وقت طلب الصفحة نفسها؛بل بعد ما الصفحة تفتح، كودها يعمل fetch("https://backend.com/products")، ومع هاد طلب الـ API تحديدًا المتصفح يرسل الكوكي تلقائيًا للباك

بالـ cookie العادية وHttpOnly cookie بدون Route Handler المتصفح يرسل الكوكي تلقائيًا للجهة المطابقة لإعدادات Domain وPath وSameSite وSecure.يعني اللي دومين الكوكي تبعا مطابق لدومين الباك

بس هاد الشي خطر لان الكوكي العادية يتم قراىتها من المتصفح
## HttpOnly cookie: نفس cookie العادي بس هي ما بتنقرا من المتصفح
ممكن استخدام HttpOnly Cookie مباشرة مع الباك بدون Route Handler إذا كان الباك يقرأ التوكين من الكوكي الواصلتو وما بدو Authorization

اذا كان بدو Authorization والباك ما بيعتمد عالكوكي فينا نستخدم الكوكي العادية ونجيب قيمتا من المتصفح عن طريق document.cookie ونضعها يدويا ضمن طلب ال api المرسل للباك بال Authorization لكن هاد الشي خطر لان تتم قراءة الكوكي من المتصفح
لهيك وقتا انسب حالة هي HttpOnly cookie + Route Handler لان HttpOnly cookie لا يتم قراىتها من المتصفح

نستخدم Route Handler كـ BFF لما بدنا نخلي Next.js وسيط، خصوصًا إذا الباك مبني ليستقبل Authorization: Bearer token وما بيقرأ التوكين من الكوكي 

## HttpOnly cookie + Route Handler:
الـ HttpOnly cookie او cookie العادية تنرسل تلقائيًا من المتصفح إلى Route Handler، وبعدها الـ Route Handler يضيف التوكين يدويًا داخل Authorization ويرسله للباك الحقيقي
لكن اذا استخدمنا الكوكي العادي فهي قابلة للقراءة من JS بالمتصفح لذلك وجود Route Handler ما بيمنع سرقة التوكين بحالة الكوكي العادية؛ الحماية الأساسية هون هي HttpOnly.لانها غير قابلة للقراءة من المتصفح اللي الاختراقات ممكن تكون عبر JavaScript خبيث داخل المتصفح، مثل XSS أو مكتبة مخترقة

Route Handlers هي حتى تقرا ال HttpOnly cookie لان ما بتنقرا غير من السيرفر او منبعتا مباشرة للباك اذا كان بيقرا التوكين من الكوكي المرسلة تلقاىيا   

## المختصررررر:
1- إذا الباك يقرأ التوكين من الكوكي: HttpOnly Cookie مباشرة.
المتصفح بيبعت الـ HttpOnly Cookie تلقائيًا مع طلب الـ API للباك
2- إذا الباك يطلب Authorization: HttpOnly Cookie + Route Handler.
لأن التوكن داخل HttpOnly cookie والفرونت ما بيقدر يقرأه، منستخدم Route Handler حتى:المتصفح يبعث الكوكي تلقائيًا للـRoute Handler. و الـRoute Handler يقرأه بالسيرفر عبر cookies() بعدها يبعته للباك بالطريقة اللي الباك طالبها: Authorization يعني Route Handler هو الوسيط الآمن بين الفرونت والباك
3- localStorage وsessionStorage والكوكي العادية أقل أمانًا للتوكين لأنها قابلة للقراءة من JavaScript داخل المتصفح.

بس HttpOnly مو حماية كاملة؛ لازم كمان حماية من XSS وCSRF. 
HttpOnly بتحمي قيمة التوكين من السرقة، أما حماية XSS وCSRF فهدفها منع تنفيذ طلبات أو عمليات باسمك من متصفحك حتى لو المهاجم ما قدر يشوف التوكين.

--------------------------------------

نحن هنا نتحدث تحديدًا عن حماية التوكين من هجمات JavaScript داخل صفحة الفرونت.
المقصود تحديدًا JavaScript الذي يعمل داخل متصفح المستخدم.
لأن سيناريو سرقة التوكين غالبًا يكون من كود اشتغل داخل الصفحة المنفَّذ بمتصفح المستخدم، مثل:
هدول كلهم بيشتغلوا داخل المتصفح، يعني على جهة الفرونت:
سكربت خبيث بسبب XSS.
مكتبة frontend مخترقة. متل مكتبةnpm مخترقة
سكربت تحليلات أو طرف ثالث مخترق.

هذا الكود يستطيع قراءة:
localStorage.getItem("token");
document.cookie;

HttpOnly ما بيحمي من XSS نفسه، وإنما بيمنع كود الـ XSS من قراءة وسرقة قيمة التوكين.
لكن كود الـ XSS يظل قادرًا يرسل طلبات باسم المستخدم من نفس المتصفح، لأن المتصفح يرفق الـ HttpOnly cookie تلقائيًا.


## الخلاصة

localStorage و sessionStorage
→ JavaScript يستطيع قراءة التوكين
→ لا يُرسل تلقائيًا
→ نحتاج إضافته يدويًا إلى الطلبات

Cookie عادية
→ تُرسل تلقائيًا
→ JavaScript يستطيع قراءتها

HttpOnly Cookie
→ تُرسل تلقائيًا
→ JavaScript لا يستطيع قراءتها
→ السيرفر فقط يقرأها

Next.js Route Handler
→ يقرأ HttpOnly Cookie
→ يضيف Authorization لطلبات الباك
→ يتواصل مع الباك الحقيقي

## شرح الفرق بين BACKEND_API_URL و NEXT_PUBLIC_API_BASE_URL
BACKEND_API_URL
متاح فقط بكود السيرفر مثل Route Handlers وServer Components.
NEXT_PUBLIC_API_BASE_URL
متاح بكود السيرفر والمتصفح  لذلك أي حدا بيقدر يشوفه من DevTools حتى لو .env.local نفسه ما انرفع.
 
نحنا هون استخدمنا  BACKEND_API_URL لنضمن انو يتم استخداما من route handler لانو عالسيرفر 
لان لو حاطة NEXT_PUBLIC_API_BASE_URL هي صح وبتتنفذ عالسيرفر والمتصفح بس استخدمنا BACKEND_API_URL لنحصر استخداما بالسيرفر لحتى ما يتم الطلب من المتصفح للباك مباشرة عن طريق وضع function api البتجيب المنتجات والفيا NEXT_PUBLIC_API_BASE_URL ضمن useQuery مباشرة متل ما عملنا بموقع الزبون بهي الحالة الفانكشن المستدعى ضمن useQuery صارت Client Component متلا وبهل الحالة ينفذ ال NEXT_PUBLIC_API_BASE_URL على المتصفح اما لو كان BACKEND_API_URL ما فيو يتنفذ عالمتصفح

فهون ضمنا انو الجلب لازم يكون عن طريق route handler لان رابط الباك ضمن BACKEND_API_URL وما رح نجيبو بهل الحالة متل قبل مباشرة useQuery → الباك مباشرة

التدفق بحالتنا :
useQuery
→ http://localhost:3000/api/products
→ Route Handler
→ https://store-api-jade.vercel.app/api/products

route handler هي api النيكست الداخلي
------------------------------------

 كلشي ملفات داخل ال api البرا ال app هي API function للفرونت تستخدم داخل المتصفح والـhooks
 إي، يعني API functions مثل login() وgetProducts() بيستدعيها useMutation أو useQuery داخل المتصفح، وبتستخدم api/client.ts لإرسال الطلب إلى Route Handler.
 useQuery React hook وما بيشتغل إلا داخل Client Component؛ لذلك الملف اللي يستخدمه لازم يكون فيه "use client" أو يكون مستورَد ضمن Client Component.

 ----------------------------------------------------------------
 ## اشكال الايرورات
 ## الحالة الأولى:في حال الخطا راجع من الباك اي من سيرفر الدوكيمنتيشن
 لما الباك الموجود بالـdocumentation يرجّع خطأ مثلاً الباك رجّع:
 هاد خطا راجع من السيرفر
 {

  "message": "Invalid credentials"

}
ومعه status:401
## Axios بيحوّل هالرد لخطأ شكله تقريبًا:هاد الشكل خاص بأخطاء Axios
error = { 
  response: {
    status: 401,
    data: { //هو الـbody اللي رجّعه الباك.
      message: "Invalid credentials" //الرسالة اللي رجّعها الباك نفسه بستخدما للمستخدم
    }
  },
  message: "Request failed with status code 401" //error.message هي رسالة عامة من Axios ممكن استخدما للتشخيص والـdebug
}
الكووود:

if (axios.isAxiosError(error)) {// هل الخطأ اللي وصل  هو الشكل الخاص بـ Axios و فينا نقرأ منه بأمان: error.response.status error.response.data ?
  return NextResponse.json(
    error.response?.data ?? { 
      message: "Authentication server is unavailable", بحال صار انقطاع بالاتصال وما وصل الرد
         // هون الخطأ مو AxiosError، يعني غالبًا ما عنا response من الباك ممكن يكون سببه bug بالكود، throw يدوي، خطأ runtime، أو أي خطأ غير متوقع
    },
    {
      status: error.response?.status ?? 502,
    },
  );
}
error.response?.data الأفضل نرجّع data كاملة حتى ما نخسر باقي تفاصيل الخطأ لأن الباك ممكن يرجّع معلومات إضافية مثل:
data:{
  message: "Validation failed",
  errors: {
    email: "Invalid email"
  }
}

## الحالة الثانية: خطأ JavaScript عام غالبا من وجود خطا بالكود أو مكتبة ثانية
 هاي مو رسالة جاية من الباك يعني الخطأ ما جاي منAxios أصلًا. هاي إنتِ كتبتيها لوجود خطأ بكود Next.js عندك مثلا
 return NextResponse.json(
  {
    message: "Internal server error", لأن الخطأ صار داخل سيرفر Next.js نفسه محل مو كاتبة الكود فبالنسبة للمتصفح هو خطأ داخلي بالسيرفر
     لو كاتبتو بالمتصفح كنت حطيت Client error وما برجع ستيتوس إلا إذا في رد HTTP من السيرفر.
  },
  {
    status: 500,
  },
);
بعد ما الـRoute Handler يرجعها للمتصفح، Axios الموجود بالمتصفح رح يشوف الرد:
{
  "message": "Internal server error"
}
وبالتالي كمان بتقدري تقرئيها بنفس الطريقة:error.response?.data.message
لأنها صارت body رد HTTP، حتى لو إنتِ اللي أنشأتيها
response.data دائمًا تعني: محتوى body رد HTTP، بغض النظر مين أنشأه.

## بالفرونت:
try {
  await apiClient.post("/login", credentials);
} catch (error) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message =
      error.response?.data?.message ??
      "تعذّر الاتصال بالخادم";

    const status = error.response?.status;
  }
}
بالفرونت ما عندي NextResponse.json(...) لرجع الخطا للمتصفح لان هي خاصة بالسيرفر فبروح برمي الخطا هيك throw new Error(message);
عم ترمي الخطأ للدالة أو الطبقة اللي استدعت الكود حتى React Query أو catch يمسكه ويخزّنه كـerror، وبعدها تعرضيه بالـComponent:
const { error, isError } = useQuery(...);

if (isError) {
  return <p>{error.message}</p>;
}
مع React Query، الخطأ بينحفظ تلقائيًا داخل error

## 
export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "حدث خطأ في الاتصال بالخادم."
    );
  }

  if (error instanceof Error) { خطأ JavaScript عادي عم تتأكد إن القيمة كائن Error من JavaScript، وبترجع رسالته التلقائية أو الرسالة اللي انرمَت معه
  وAxiosError من ضمن Error فاذا ما كنت متاكدة منا بالشرط فوق فممكن يكون الخطا AxiosError ويعرض رسالة Axios العامة
    return error.message; 
    error instanceof Error يلتقط أي خطأ JavaScript تم رميه، سواء رميتيه إنتِ أو تولّد تلقائيًا من JavaScript أو مكتبة ثانية
  }

  return "حدث خطأ غير متوقع، حاول مرة أخرى.";
}


--------------------------
## انواع الاخطاء:
 // 500 هون غالبًا خطأ بالكود أو خطأ غير متوقع متل انقطاع الاتصال مع الباك، وليس رد واضح من الباك هو Internal Server Error، يعني “خطأ داخلي غير متوقع” ,وممكن الباك كمان يرجع 500 كمان معناها في مشكلة بالسيرفر، جرّب لاحقًا
 500: تقدري تعتبريها خطأ عام غير معروف أو غير متوقع من جهة السيرفر/الكود الذي يعالج الطلب
    // 401: المستخدم غير مسجل دخول يعني السيرفر ما قدر يثبت هوية المستخدم او غير مُصادَق عليه مثل email/password غلط أثناء login -token ناقص او غلط او منتهي -session غير صالحة
  // 400 معناها: الطلب المرسل من الفرونت غلط مثلا ليس اوبجيكت او الباسورد او الايميل ليسو نص
  400 Bad Request => الطلب شكله غلط: body ناقص، JSON غلط، type غلط

  422 Unprocessable Entity => البيانات مفهومة لكن غير صالحة منطقيًا: email invalid، password قصير، حقل مطلوب يعني الطلب JSON مفهوم، بس القيم نفسها غير مقبولة منطقيًا.  price = -10  

409 Conflict => الطلب صحيح، لكن يتعارض مع حالة موجودة: email مستخدم مسبقًا، product slug موجود، duplicate category 

إذا صار 403 أثناء login: يعني الإيميل والباسورد ممكن يكونوا صح، لكن الحساب ممنوع يدخل is_active = false أو blocked أو ليس admin، فبيرجع 403 بمعنى: عرفناك، لكن دخولك ممنوع. متل اذا اجا الادمن يسجل دخول عالسوبر ادمن يعني خطا اسمو accountUnavailable نوع من اخطاء ال forbidden

403 يعني Forbidden إذا صار 403 بطلب عادي بعد تسجيل الدخول: التوكن ممكن يكون صالح، بس المستخدم ما عنده صلاحية يدخل على هذا الـ endpoint هون بكون مثلا ادمن مسجل حساب علوحة الادمن وعم يحاول يحط endpoint يدويا خاص بالسوبر ادمن  الباك يفحص التوكن ويقول:التوكن صحيح - المستخدم معروف- لكن role = admin وليس super_admin 

502 Bad Gateway معناها عادةً: السيرفر الوسيط اشتغل Next API Route  ، لكنه فشل بالحصول على رد HTTP صالح من الباك الخارجي، لا نجاح ولا فشل واضح؛ السبب ممكن انقطاع نت، timeout، CORS، DNS، أو الباك واقع.  

authenticated 200 يعني المستخدم مسجل دخول والتوكن صالح.
unauthenticated 401 يعني: السيرفر ما قدر يثبت هوية المستخدم، بسبب email/password غلط أثناء login، أو token مفقود/منتهي/غلط أثناء الطلبات المحمية. او المستخدم مو مسجل دخول أساسًا
بس عمليًا بالـ UI غالبًا بدنا نفرّق رسالة login:
email/password غلط => invalidCredentials
token مفقود/منتهي/غلط => unauthenticated
ليش؟ لأن invalidCredentials أوضح للمستخدم بصفحة login: “الإيميل أو كلمة المرور غير صحيحة”.
أما unauthenticated معناها أوسع: “أنت غير مسجل دخول أو جلستك غير صالحة”.

 "forbidden"403 يعني المستخدم معروف ومسجل دخول، لكن ما عنده صلاحية لهذا الشيء. مثل customer يحاول يدخل admin dashboard.
unavailable 500 يعني ما قدرنا نتحقق من الجلسة بسبب مشكلة خارج منطق التوكن، مثل backend down أو network error أو 500 أو timeout.


الفرونت بعت JSON مكسور        => 400 Invalid JSON
الفرونت بعت JSON صالح بس مو object => 400 Invalid body
الفرونت بعت object ناقص email/password => 400 Required fields
الفرونت بعت email/password غلطين => غالبًا 401 unauthenticated


خطأ من route تبعك قبل استدعاء الباك
=> أنتِ تحددي شكل الرد بال route.ts
الحالات اللي تصير قبل استدعاء الباك، مثل:request.json() فشل- body مو object-email ناقص-password ناقص  فهذه أنتِ تنشئي ردها بنفسك، وما لازم تكون موجودة بالباك

خطأ راجع من الباك وبدك تمرريه كما هو
=> التزمي بشكل الباك بالفرونت يعني متل مو مرجع الباك بحط بالفرونت

خطأ راجع من الباك وبدك توحّديه
هون بتقرئي من الباك اللي بدك ياه، وبعدين بتطلعي شكل ثابت من عندك
=> حوّليه لشكل موحد أنتِ محددته بال route.ts 

بس الفكرة الأساسية :
توحيد الخطأ يخلي الفرونت يتعامل مع شكل واحد.
تمرير خطأ الباك كما هو يخلي الفرونت مضطر يتحمل أكثر من شكل لاخطاء الراجعة من الباك
  -----------------------------

  داخل route.ts لازم ترجعي NextResponse، مو object عادي.
  NextResponse.json() = يغلف البيانات كرد HTTP صالح للمتصفح/Postman/Axios.
 NextResponse.json() = HTTP response حقيقي رايح للفرونت فيه:
  body: { message: "Validation failed" }
status: 400
headers: content-type: application/json
يعني return NextResponse.json(...) هو الرد اللي بيرجع للـ fetch أو axios

مثال:
في route.ts:
return NextResponse.json(
  { message: "Login success" },
  { status: 200 }
);
بالفرونت:
const res = await axios.post("/api/auth/login", body); ال body هي الطلب الباعتو متل ايميل وباسورد 

console.log(res.data);
// { message: "Login success" }

console.log(res.status);
// 200


---------------------------------
## refresh_token و access_token:
يعني وجود refresh_token لا يعني أن access_token لا ينتهي.يعني فقط عندك طريقة لتجديده بعد ما ينتهي.

صلاحية التوكن بتعرفيها لما تبعتيه للباك على endpoint محمي مثل: /api/auth/me إذا التوكن صالح، الباك يرجع بيانات المستخدم. إذا منتهي أو غلط، الباك غالبًا يرجع 401.

-------------------------
دالة ال async تستخدم وقت يكون عنا عملية بدا await وهي الدالة بترجع Promise تلقاىيا ولو ما انا كتبت النوع يدويا
التنفيذ داخلها ما بيصير كله متزامن. هو يمشي سطر سطر، لكن لما يوصل لـ await بيوقف الدالة نفسها مؤقتًا، وما بيجمّد التطبيق كله.