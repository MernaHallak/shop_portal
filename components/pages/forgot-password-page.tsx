"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  //  useRouter():بيعطيك دوال تنقّل مثل:router.push ,router.replace باقي الشرح تحت 
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // success: لتبديل الواجهة بين فورم وبين رسالة نجاح.
  const [error, setError] = useState("");
//   خطأ تحقق (Email invalid)
// وبس يصير عندي api بصير حط فيه : 
//  خطأ سيرفر (500)وخطأ شبكة (catch)

  //انا بس اكبس زر عليه نوع Submit فرح يفعل ال onSubmit تبع الفورم 
  // فالزر ما عنده onClick هون؛ هو بس بيحرّك سلوك الفورم الافتراضي (submit).
  // e.preventDefault(): يمنع إرسال الفورم بالطريقة التقليدية (ريفريش/Reload). 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      setError("");
      if (!email.includes("@")) {
        setError("Email is invalid");
        return;
        // return :لحتى توقف تنفيذ الدالة فورًا
      }
      setIsLoading(true);
  
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
    }, 1200);
  };
// <Link /> و router.push() الاتنين بيعملوا “تنقّل داخل التطبيق”

// link:“اضغط هون وروح لهالمسار” بدون شروط. مناسب إذا المستخدم رح يضغط
// router.push():بتستخدمه لما التنقّل جاي من منطق/شرط داخل حدث (متل زر تسجيل الدخول اذا تحقق الشرط بياخدو عالصفحة المحمية الكان طالبا المستخدم واذا ما تحقق بخلي بصفحة تسجيل الدخول ليعمل تسجيل).  مناسب إذا بدك تنقله بعد حدث

// Link/route guard: إذا المستخدم مو مسجّل، منحوّله على /login بدل ما يفوت على الصفحة المحمية, وبعدين بوجهو عصفحة افتراضية مثلا داشبورد وليس عالصفحة الكان طالبا المستخدم قبل ما يعمل تسجيل متل اضافة منتج جديد.
// router.push مع next: منضيف ?next=... لحتى بعد تسجيل الدخول يرجّعه لنفس الصفحة المطلوبة، مو لصفحة افتراضية.

// الـ history هون هو “سجل الرجوع” تبع المتصفح (زر Back).
// استخدم router.push(...)  بيضيف صفحة جديدة للسجل إذا طبيعي المستخدم يرجع للصفحة اللي كان فيها (تنقّل عادي) 
// استخدم router.replace(...) إذا الصفحة السابقة ما عاد إلها معنى/ما لازم يرجعلها (login بعد نجاح ، redirect بعد check auth…) لتبديل الرابط بدون ما تترك صفحة بالـ history. 
// بعد نجاح تسجيل الدخول router.replace("/dashboard"); مافي داعي يرجع لصفحة تسجيل الدخول فستدبل صفحة تسجيل الدخول بالسجل بصفحة الداشبورد


  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      {/* التوسيط بيشتغل مع flex على الأب ليصفّ عناصره (الأولاد) بالنص. */}
      {/* إذا شلت w-full: الكارد ممكن يصير عرضه “على قدّ المحتوى” */}
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border shadow-sm p-8">
          {/* لينك هون افضل:لأن “Back to login” هو تنقّل بسيط بدون أي منطق قبل الانتقال.
- Link بيعطيك سلوك رابط طبيعي:
 - تفتح بـ tab جديد
 - نسخ الرابط
 - وصول أفضل بزر التاب و افضل لل seo(accessibility) */}
          <button
            onClick={() => router.push("/login")}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>

          <div className="mb-8">
              <h1 className="mb-2">Forgot password?</h1>
            <p className="text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />         
              <AlertDescription className="text-green-800">
                If an account exists for <span className="font-medium">{email || "your email"}</span>, you will receive a
                password reset link shortly.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vendor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    // المتصفح يقترح عليك إيميلات محفوظة/مستخدمة سابقًا ويعبّيها بسرعة.
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Demo: go directly to{" "}
                  <button type="button" onClick={() => router.push("/reset-password?token=demo")} className="text-primary hover:underline">
                    Reset password
                  </button>
                  {/* زر “Reset password” داخل الفورم عندك هدفه تجربة UI فقط، مو بديل عن الإيميل الحقيقي البدي اضغط عليه ليعطيني التوكين */}
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
