نخلي apiClient نفسه يراقب أي 401 جاي من Next API routes، يعمل refresh مرة واحدة، وبعدين يعيد نفس الطلب تلقائيًا. هيك ما منعدل create/edit/delete واحد واحد.
 أي request يطلع من خلال apiClient ويأخذ 401 رح يمر بنفس منطق الـ refresh تلقائيًا.

التسلسل رح يصير:

الفرونت يطلب
PATCH /api/store/products/...
        ↓
Next Route → backend
        ↓
backend يرجع 401 لأن access_token انتهى
        ↓
Next Route يرجع 401 للـ apiClient
        ↓
apiClient يعمل POST /api/auth/refresh
        ↓ هون المتصفح ارسل refresh_token و access_token القديم لان المسار بيسمح 
Next refresh route يقرأ refresh_token
        ↓
يبعته للباك باسم lap_store_refresh_token
        ↓ اذا صار فشل بطلب الريفريش بياخدني عصفحة تسجيل الدخول
الباك يرجع access_token جديد
        ↓
Next يخزنه بالـ access_token cookie
        ↓
apiClient يعيد PATCH الأصلي تلقائيًا 
        ↓
 اذا تمت اعادة المحاولة ورجع الباك 401 لسبب ما مثلا صار خلل بتحديث الكوكي الجديد بالمتصفح وقتا مناخدو عصفحة تسجيل الدخول وما منضل عم نعمل ريفريش والباك يرجع 401 وندخول بلوب لا نهاىية

 الخلاصة:إذا فشل الـ refresh، أو نجح الـ refresh لكن الطلب المُعاد رجع 401 مرة ثانية، وقتها منوقف المحاولات ومنحوّل المستخدم للـ login.

 صار خلل بتحديث الكوكي الجديد بالمتصفح بعد ما عملت response.cookies.set({name: "access_token",: قصدي الكوكي الجديدة اللي فيها access_token الجديد بعد نجاح الـ refresh؛ إذا لسبب ما ما اتحدّثت صح، ممكن الطلب المعاد يضل يستخدم التوكن القديم ويرجع 401.

-----------------------------------
## شرح ملف ال api/client:
هاد مخطط بصري بيلخّص شو بصير لما أكتر من request يرجع 401 بنفس الوقت او بعد مدة قصيرة قبل انتهاء الرفرش الاول:
1. البداية
GET products → 401
GET store → 401
PATCH product → 401
بالبداية:
refreshPromise = null
2. أول Request يعمل Refresh
أول request يوصل للـ interceptor ويفحص:
if (!refreshPromise)
لأن القيمة null، يبدأ:
POST /auth/refresh
وبصير refreshPromise ماسك عملية الـ refresh الحالية.
الطلب الثاني والثالث يوصلوا لنفس الشرط، بس هالمرة refreshPromise مو null، لذلك ما بيعملوا Refresh جديد.
3. الكل ينتظر نفس العملية
await refreshPromise
الثلاث Requests بيوقفوا هون لحد ما نفس عملية الـ refresh تخلص.
يعني الأول والثاني والثالث كلهم بينتظروا نفس الـ Promise؛ الفرق الوحيد إن الأول هو اللي أنشأها، والباقي بس استخدموها وانتظروها.

↓
Refresh نجح → المتصفح خزّن access token الجديد
↓
4. كل Request يعيد نفسه
GET products
يعاد بالتوكن الجديد
GET store
يعاد بالتوكن الجديد
PATCH product
يعاد بالتوكن الجديد
return apiClient(originalRequest)
↓
5. تنظيف refreshPromise
.finally(() => { refreshPromise = null; })
بعد انتهاء الـ refresh — نجاح أو فشل — منرجعها null حتى يصير مسموح نعمل Refresh جديد بالمستقبل عند الحاجة.

بدون refreshPromise ممكن كل واحد يعمل:  POST /auth/refresh  فتصير 3 عمليات refresh بنفس الوقت. نحنا بدنا:refresh واحد فقط  والباقي ينتظروه.  

احفظيها بهاي الجملة: أول 401 يبدأ Refresh واحد → باقي الـ 401 ينتظروه → إذا نجح، كل Request يعيد نفسه → بالنهاية refreshPromise ترجع null.
 --------------------

 عم نختبر حالة الـ response من خلال الجزء التاني من response.use(...)، يعني لما يصير error. 

الاختبار   هون:  const status = error.response?.status; وبعدين:

if (status !== 401)
ليش عم نختبره؟ لأننا بدنا نعمل refresh فقط إذا السبب هو 401، يعني غالبًا الـ access token منتهي أو غير صالح.
أما إذا الرد مثل:400 403 500 ما منعمل refresh، ومنرجع الخطأ طبيعي.

-------------------------

أي Component
    │
    │ يستعمل apiClient
    ▼
مثلاً:
PATCH /api/store/products/edit/123
    │
    ▼
المتصفح يرسل الكوكيز المسموح فيها
    │
    ▼
Next API Route
    │
    ▼
Backend

إذا الطلب نجح:

Backend → 200
          │
          ▼ لان نحنا حاطين لنراقب الرد interceptors.response
apiClient interceptor
          │
          ▼
(response) => response
          │
          ▼
الطلب يكمل طبيعي

اما بحالة الخطا منفذ الكود api/client