import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendClient } from "@/lib/backend-client";
import {
  getBackendErrorStatus,
  normalizeBackendError,
} from "@/lib/server/backend-error";

// /api/auth/me يتأكد أن التوكن لسه صالح ويرجع صاحب التوكن
export async function GET() {
  // cookieStore يعني مخزن الكوكيز تبع الطلب الحالي لانrequest في headers وcookies ,body وغيرها بكون فيه كل الكوكي المسموح تنبعت لهاد المسار /api/auth/me
  const cookieStore = await cookies(); //عم تقرأي الكوكيز المرسلة مع هذا الطلب الحالي من المتصفح للروت 
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) { //بيفحص فقط: هل التوكن موجود ولا لا. وليس لاختبار الصلاحية
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await backendClient.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: backendResponse.data,
    });
  } catch (error) {
    if (getBackendErrorStatus(error) === 401) {//معناه توكين انتهت صلاحيتو او غير صالح ال 401 ما معناتا email/password خطأ لان هون نحنا مانا بتسجيل الدخول لنكون عم نفحصن نحنا هون عم نفحص التوكين فقط عن طريق طلب للباك على /api/auth/me، واذا الباك رجع 401 معناتا التوكين انتهت صلاحيتو او غير صالح
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
// لان التوكين غلط فمنحذف الكوكي ليرجع يسجل المستخدم من جديد او يكون عنا  /api/auth/refresh باستخدام refresh_token إذا refresh نجح: خزّني access_token جديد وارجعي نادِي /me وإذا refresh فشل: هون امسحي الكوكيز واعتبريه logged out

      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");

      return response;
    }

    const normalized = normalizeBackendError(
      error,
      "Unable to verify the current session",
    );
    return NextResponse.json(normalized.body, {status: normalized.status});
  }
}
