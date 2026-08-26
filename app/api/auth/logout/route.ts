// هذا يحذف الكوكيز من المتصفح.
import { NextResponse } from "next/server";
// بتسجيل الدخول لازم نبعت للباك لأن الباك هو اللي بيتحقق من email/password وبيعطينا session/tokens ورسالة نجاح.
// أما logout عندك غالبًا شغله الأساسي محلي عند Next.js: يمسح cookies من المتصفح فبتروح التوكين المخزنة، لذلك ممكن ما تحتاجي تبعتي للباك.وببعت رسالة من عندي وليس من الباك فال logout ما عندو endpoint الو بالباك
export async function POST() { //السبب نستخدم POST للـ logout لأنه action يغيّر حالة المستخدم
  const response = NextResponse.json({
    message: "Logout successful",
  });

  response.cookies.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, //المتصفح يفهمها كأمر حذف للكوكي لان maxAge هي عمر الكوكي
  });

  response.cookies.set({
    name: "refresh_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });

  return response;
}