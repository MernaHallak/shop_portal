 ## التدفق رح يكون:  

ProductCreateForm componant
        ↓
useCreateProduct() hook
        ↓
createProduct() api function
        ↓
POST /api/store/products/create api next
        ↓
Next Route Handler 
        ↓
POST /api/admin/products/create backend
        ↓
Store API

## وعند الخطأ:  

Store API error
      ↓
normalizeBackendError()
      ↓
Next Route returns unified error
      ↓
Axios error
      ↓
normalizeApiError()
      ↓
fieldErrors / translationKey / message
      ↓
ProductCreateForm

## البنية اللي ماشين عليها:
Component → Hook/React Query → api/*.ts الفرونت → Next Route Handler → backendClient → Store API السيرفر الخارجي  

وقت كان عنا توكين بال http cookie استخدمنا API Route  كان يعمل كـ BFF / proxy layer بين المتصفح والـ backend وكمان فينا نختصر طبقة ال API Route ويصير عنا طلب واحد من المتصفح بدل طلبين الهني طلب الصفحة وطلب البيانات عن طريق API Route بانو نعمل طريقة Browser → Server Component → Backend فهيك بصير طلب واحد من المتصفح بيطلب فيه الصفحة وبجيب البيانات من الباك بنفس الوقت 

متى تستخدم كل من هدول الطريقتين؟
اذا كانت البيانات عرض بيانات أولي بدون تفاعل مستخدم:Browser → Server Component → Backend وبجيب منا التوكين بالسيرفر كمبونانت بدل API Route
اما اذا كانت البيانات تعتمد على حذف/إضافة/تعديل بعد تفاعل المستخدم: Browser → BFF (Server Action أو Route Handler) → Backend فتعديل البيانات بدو يصير بالكلينت كمبونانت وهون ما فيني ابعت طلب للباك لان ما معي التوكين وما فيني جيبو من الكلينت كمبونانت لهيك بحتاج BFF (Server Action أو Route Handler) هي التجيب التوكين وتبعت طلب للباك فيه وبالكلينت كمبونانت بستخدم فانكشن الفيا useMutation البتم من خلالا ارسال طلب لل  API Route  ومنو بتم جلب التوكين وارسال طلب للباك

التدفق:
Client Component
↓ useMutation
يرسل request إلى API Route / Server Action داخل Next.js عن طريق فانكشن بال useMutation
↓
BFF  API Route / Server Action  يقرأ HttpOnly cookie من السيرفر
↓
يرسل request للباك الخارجي ومعه التوكن
↓
الباك يعدّل البيانات
↓
يرجع النتيجة للـ BFF
↓
BFF يرجع response للكلينت



## rerender state :
setState ما بتغيّر قيمة الـ state داخل نفس تنفيذ الفنكشن؛ هي بتطلب من React تحديثها. React يستنى الفنكشن تخلص، بعدين يعمل rerender، وبالـ render الجديد بتصير قيمة الـ state الجديدة متاحة للعرض.
يعني داخل نفس الفنكشن:
setEmail("new");
console.log(email); // القيمة القديمة

## الفرق بين router.replace و redirect:
router.replace
=> client-side navigation
=> بعد ما الصفحة اشتغلت بالمتصفح 
مثل صفحة تسجيل الدخول :
بعد ما صفحة login ظهرت بالمتصفح وكبس المستخدم إرسال ونجح login، تستخدم router.replace("/products") لأنه تنقّل من client بعد حدث submit.

redirect
=> server-side redirect
=> قبل عرض الصفحة غالبًا 
مثال: قبل ما تنعرض صفحة login، السيرفر يتحقق من الجلسة، وإذا المستخدم مسجل دخول يحوّله فورًا لـ /products.

-------------------------------------
## الفرق بين <img /> و <Image /> :

<img /> :وسم HTML عادي، يعرض الصورة مباشرة من أي رابط.

<Image /> : كومبوننت من Next.js، يعمل optimization للصورة مثل lazy loading، تغيير الحجم، وتحسين الأداء، لكن يحتاج إعدادات بال  next.config.ts للسماح بالدومين الخارجي الذي تأتي منه الصورة.

lazy loading يعني الصورة ما بتنحمّل فورًا، بتنحمّل بس لما تقرب تظهر على الشاشة.الفائدة: الصفحة تفتح أسرع وتستهلك نت أقل.

استخدمنا <img> لأن:  product.image_url جاي من الكلاودنري وممكن يكون من hosts مختلفة، و<Image /> قد يرفضها إذا الدومين غير مضاف في next.config.  
لو عندك دومين ثابت للصور، الأفضل تستخدمين next/image.  

في next.config.ts أو next.config.js ضيفي Cloudinary ضمن remotePatterns، لأن Next يطلب تحديد مصادر الصور الخارجية المسموحة لـ <Image />.

import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", //host: يعني دومين/عنوان السيرفر/الخدمة اللي تستضيف الصورة
        pathname: "/YOUR_CLOUD_NAME/**", بدلو باسم cloud name تبعك من Cloudinary. البشوفا من https://res.cloudinary.com/your-cloud-name/image/upload/... الموجودة بال DevTools → Network → Img، وافتحي request الصورة وشوفي Request URL او بطبع ال  console.log(product.image_url); فبيطلع الرابط
      },
    ],
  },
};

export default nextConfig;

وبدل ال <img /> ب <Image
  src={product.image_url}
  alt={t("imageAlt", {name})}
  width={64}
  height={64} 
/>
بعد تعديل next.config لازم تعيدي تشغيل السيرفر: npm run dev 

## طريقة تخزين الصور: 
 إماارسال ملفات مباشرة بانشاء المنتج والباك لحالو بيرفعا عكلاودينري حيث يتم إرسال المنتج + File مع بعض بـ FormData والباك يرفع الصورة للكلاودينري وينشئ المنتج بنفس الطلب
  أو بيانات صور مرفوعة من قبل بهي الطريقة:
 المستخدم يختار صورة
        ↓
POST /api/admin/uploads/image
        ↓
الباك يرفع الصورة على Cloudinary
        ↓
يرجع معلومات عن الصورة secure_url و public_id وغيرها
        ↓
نرسل هذه المعلومات داخل JSON عند إنشاء المنتج  بدل formData
يعني الصورة مرفوعة مسبقاً، وإنشاء المنتج فقط بيقول للباك: "اربط هذا المنتج بهذه الصورة".

إذا الطلب multipart/form-data → بتبعت ملفات الصور نفسها:
<input
  type="file"
  onChange={(e) => { e هي event object اللي React بيمررها تلقائياً لما المستخدم يغيّر قيمة الـ input.
    const file = e.target.files?.[0];
<!-- e.target هو عنصر <input> نفسه -->
<!-- e.target.files هي الملفات اللي اختارها المستخدم -->
    if (file) {
      formData.append("images", file); 
      <!-- multipart/form-data يعني نوع request بنستخدمه لما بدنا نبعت ملفات، مثل الصور، مع حقول نصية بنفس الطلب. بدل JSON عادي، منعمل FormData ونضيف فيه القيم والملفات. -->
    }
  }}
/>

إذا الطلب JSON → ما بتبعت ملف، بتبعت معلومات صور مرفوعة مسبقاً مثل:
{
  "name": "Dell Latitude 7490",
  "price": 390,
  "category": "Laptops",
  "images": [
    {
      "secure_url": "https://res.cloudinary.com/.../image.png", رابط الصورة بعد ما تكون مرفوعة على خدمة التخزين المستخدمة عند الباك، مثل Cloudinary
      "public_id": "lap-store/products/image123" هو المعرّف الخاص بالصورة داخل Cloudinary 
    }
  ]
}
اذا عندي رابط صورة عغوغل فاول شي ترفع الصورة عبر endpoint: POST /api/admin/uploads/image وهو بيرفع الصورة على Cloudinary وبرجعلك secure_url وpublic_id
بس اول شي بدي شوف إذا endpoint الرفع بيدعم استقبال رابط خارجي، بتبعتي رابط Google إله اما اذا كان الرفع يستقبل ملف الصورة نفسه File عبر multipart/form-data وهاد الشي العنا بالمشروع فوقتا ما فيني ابعت رابط غوغل وقتا بنزلا عالجهاز كملف وبعدين برفعا لتصير عكلاودينري

## طرق ارستا اللغة بالطلب :
بال JSON   فيني ارسل بطريقتين:
الاولى:
{ 
  "name_i18n": { 
 "en": "Dell", 
    "ar": "ديل" 
  } 
}
وهي الطريقة قال عنا بالدوكيمنتيشن
 JSON-only convenience object. يعني هالطريقة مخصصة لطلبات JSON  عن طريق اوبجيكت name_i18n للتسهيل
Maps en to name and ar to name_ar. كلمة maps هون معناها "يربط/يحوّل قيمة en إلى الحقل name"  
التانية: متل مو عاملين بالريكويست اكزامبل وهي الطريقة بدي ابعت حقلين منفصلين  اما بالاولى اسهل لان بتبعتي حقل واحد قيمته object  فهو أسهل بالتجميع والتنظيم، خصوصاً إذا عندك أكثر من لغة  
{ 
  "name": "Dell", 

  "name_ar": "ديل" 
}
اما بطريقة ال formData النحنا عتمدناها:
بس ببعت هيك{ 
  "name": "Dell", 
  "name_ar": "ديل" 
}
لان بال FormData.append   يقبل فقط نصوص او ملفات ولا يقبل اوبجيكت
 
--------------------------------
## الفرق بين useMemo و useEffect :
تنيناتن بيشبهو بعض بيتنفذو بس تتفير قيمة من dependencies وبيتنفذو بعد ما الكود بيتنفذ 
لكن ال useEffect: ما بترجع قيمة تستخدمها بالـ UI؛ هي لتنفيذ شيء بعد تغيّر state/props، مثل تصفير state أو طلب API أو localStorage.
useEffect ينفذ بعد الـ render.
React يتوقع من useEffect يرجع واحد من اثنين فقط: undefined أو:  function cleanup

useEffect(() => {
  هون عم ينفذذ كود معين هي ما بترجع شي يعني undefined
  console.log("effect اشتغل"); تنفذ مباشرة عند دخول ال useEffect

  return () => { هي اسما function cleanup
    imagePreviews.forEach((image) => {
      URL.revokeObjectURL(image.url);
    })
  };
}, [imagePreviews]);
اما هون وقت useEffect يشتغل، هو فقط يرجع دالة:
() => {
  imagePreviews.forEach(...)
}
React يحتفظ بهذه الدالة لوقت لاحق. لا ينفذها فورًا.
حيث ان useEffect يسجّل cleanup خاص بـ url1 لكن لا ينفذه الا عند حدوث حالة من التنتين التحت 

الـ return () => { ... } لا ينفذ فورًا. React ينفذه في حالتين:
1) قبل ما يعيد تشغيل نفس useEffect بسبب تغيّر dependency
2) لما يطلع الكومبوننت من الصفحة unmount
اذا ما حذفت الروابط العم تتنانشى عند كل اضافة صورة لكل الصور من جديد او عند الخروج من الكمبونانت عم اضل عالفاضي فالاثر:
روابط blob ممكن تبقى محجوزة بذاكرة المتصفح ممكن يصير memory leak، يعني ذاكرة محجوزة بلا داعي، خصوصًا لو الصور كثيرة أو حجمها كبير. لذلك نستخدم URL.revokeObjectURL لتنظيف روابط المعاينة لما ما نعود نحتاجها.  


اما useMemo: إذا بدك تحسبي قيمة وترجعيها متل شرط find ليرجعلي القيمة المطابقة 
useMemo ينفذ أثناء الـ render حتى يحسب القيمة، وليس بعده.

------------------------------
## الفرق بين undefined و null و "" :

undefined يعني ما في قيمة محددة أصلاً.
 null يعني أنا محدد عمداً إنه ما في قيمة.
 "" يعني في قيمة من نوع string، بس فاضية.  

if (product.description)  هذا يتحقق فقط إذا القيمة truthy. يعني ما بيدخل إذا كانت:  
undefined
null
""
أما:  if (product.description !== undefined)
هذا يسأل سؤال واحد فقط: هل الحقل موجود ضمن التعديل؟  
فهدول بيدخلوا:  
"hello"
""
null
وحدها هاي ما تدخل:  undefined

نعمل validation بالـ ProductEditForm قبل استدعاء updateProduct() مشان نتحقق انو الاسم ما عدلو لقيمة فاضية لان لازم يكون الو قيمة 
if (!name.trim()) {
  errors.name = t("validation.nameRequired");
}
لأن وظيفة دالة الـ API هون مو validation، بل تقرر هل الحقل موجود ضمن الـ PATCH ولا لا. لان بال PATCHما ببعت كل الحقول متل الانشاء ببعت بس الحقول المعدلة 
if (product.name !== undefined) {
  formData.append("name", product.name);
}

هنا في فرق مهم عن create: استخدمت:
!== undefined
بدل:
if (product.description)
لأنه بالتعديل ممكن الأدمن يقصد يمسح الوصف، فالقيمة "" إلها معنى ولازم نوصلها للباك. 
لأنه بالإنشاء إذا المستخدم ما عبّى الوصف، عادي ما ينبعت أصلاً للباك لأنه اختياري.
-------------------
## الفرق بين Client Component  و  Server Component:

Client Component لازم يرجع JSX مباشرة ويعرض شي مبدئيًا، وبعدها يجيب الداتا بالـ useEffect أو React Query أو event handler.
مثال على event handler :
"use client";
export default function ProductsList() {
  async function handleClick() { // دالة داخل الكلينت كمبونانت تكون async عادي
    const data = await getProducts(); //await يوقف تنفيذ الدالة التي هو بداخلها فقط، مو كل الكومبوننت ولا كل الصفحة
  }
  return <button onClick={handleClick}>Load</button>;
}
لان بالـ Client Component ما فيك توقفي الـ render وتستني بمثالنا فوق عرض الزر مباشرة وبس المستخدم يضغط الزر عليه بجيب الداتا يعني الكومبوننت ما انتظر الداتا قبل العرض
أما Server Component عادي تكون async ما بيرجع JSX مباشرة، بيرجع Promise وتعمل await قبل ما ترجع JSX، لأن الانتظار يصير على السيرفر قبل إرسال الصفحة للمتصفح.

--------------------------
## حذف الصور:
إذا عندك عدة صور مثل product.images[]، بدك طريقة تحددي أي صورة تنحذف، وغالبًا هاد بيكون عبر public_id ضمن endpoint حذف مستقل.
أما إذا عندك صورة ثابتة واحدة مثل logo_url، فممكن يكفي تبعتي:
logo_url: null
الباك يكون مصمم يعتبر null = حذف الصورة من قاعدة البيانات على الأقل، أما حذف ملف Cloudinary نفسه فهاد سلوك إضافي لازم يكون الباك منفذه صراحة واذا ما منفذو بصير بدنا endpoint حذف مستقل 
<!-- إذا الباك ما عم يحذف ملف Cloudinary لما تبعتي null، فإما يضيف منطق التنظيف بنفس PATCH، أو يعمل endpoint حذف مستقل يعتمد على public_id بيكون عندك logo_public_id وcover_public_id، واحد لكل صورة ثابتة -->