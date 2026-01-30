"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  // useSearchParams() بيعطيك واجهة قراءة محلية للـ URL الموجود بالمتصفح. 
// get("token") مجرد قراءة من الذاكرة (زي تقرأ من object) → فوري ومو async
// بالسيرفر كمبونانت بمررو ك prop نوعو promise عشان بدي أعمل await عليه.. وهي طريقة كتابة بالاصدارات الحديثة بالنيكست
  
const router = useRouter();
// قراءة التوكين:
  const search = useSearchParams();
  const token = search.get("token"); //بترجع string | null

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  // null = “لسّا عم نتحقق” (حالة loading للتحقق) حاليا عاملينا ك ui لبين ما تخلص ال setTimeout بس مستقبليا رح تكون لبين ما يخلص تحقق حقيقي من السيرفر
  // true/false = نتيجة التحقق. هي من boolean
  // هون التحقق اذا في توكين بالرابط او لا بس ما عم اتحقق من السيرفر بشكل حقيقي

  useEffect(() => {
    // simulate token verification
    setTokenValid(null);
    const t = setTimeout(() => {
      setTokenValid(Boolean(token));
    }, 600);
    return () => clearTimeout(t); //لما يتغير token أو الصفحة تنشال:React بينفّذ الـ cleanupبيلغي الـ timeout القديم
  }, [token]);
// داخل useEffect + dependencies → يفضل جدًا تعمل cleanup حتى ما يصير تعارض اذا تغير التوكين فجاة وما كان خالص لسا وقت الاول او حتى اذا المستخدم طلع من الصفحة قبل ما يخلص الوقت فهاد غلط لأنك عم تعمل تحديث state على كومبوننت مش موجود.اما بباقي الحالات مو كتير ضروري
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      setTimeout(() => {
        router.replace("/login"); //استخدام replace حتى ما يرجع المستخدم لصفحة reset بالـ Back بعد ما خلّص.
      }, 1200);
    }, 1100);
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border shadow-sm p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border shadow-sm p-8">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Invalid or expired reset link.</AlertDescription>
            </Alert>

            <Button className="w-full" onClick={() => router.replace("/forgot-password")}>
              Request a new link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border shadow-sm p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2">Reset password</h1>
            <p className="text-muted-foreground">Create a new password for your account</p>
          </div>

          {success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Password reset successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
