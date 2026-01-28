export { default } from '@/components/pages/forgot-password-page';

// export default  معناها تصدير: عم عيّن “هذا هو الشي الرئيسي” اللي هالملف بيقدّمه بدونا ما بينعرض شي
// هدول الطريقتين نفس الفوق بس الفوق اختصار:
// import ForgotPasswordPage from "@/components/pages/forgot-password-page";
// export default function Page() {
//   return <ForgotPasswordPage />;
// }
// السيرفر بنفذ المطلوب منو على السيرفر وبس يوصل لكمبونانت كلينت بس بيحط “مكان” لهذا المكوّن ضمن الناتج يلي هو صفحة html المرسل للمتصفح لحتى ينفذو عليه الكلينت بعدين ويصير الو تفاعل لان من السيرفر بكون واصلو ك markup يعني شكل html

// import ForgotPasswordPage from "@/components/pages/forgot-password-page";
// export default ForgotPasswordPage;

// لي الكود مكتوب بملف تاني:
// تنظيم ومسؤوليات واضحة:
// ملفات app/ تكون “Routing + Layout” (مين الصفحة؟ شو المسار؟)
// وملفات components/pages/ تكون “واجهة ومنطق الصفحة” (UI).

// إعادة استخدام أسهل:
// نفس صفحة/واجهة (مثل LoginPage) ممكن تستخدمها بمكان تاني (Modal، Drawer، onboarding…) بدون ما تربطها ببنية app/.

// متى بنقول “الأفضل تنفيذ على سيرفر بدل الكلينت”؟

// إذا بدك تعمل بناءً على البارامس شغلات مثل:
// redirect() , notFound() , قراءة cookies(), حماية قبل ما تنعرض الصفحة
// هاي الأشياء لازم تكون بسيرفر كومبوننت (أو بمكان شغله سيرفر مثل middleware) لأنّها بتشتغل “قبل ما الصفحة تنرسم” وبتتحكم بالاستجابة نفسها.