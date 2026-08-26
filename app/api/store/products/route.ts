import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendClient } from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        // كنت عم اسال لي ما اخدتو عصفحة تسجيل الدخول من هون:لان الـ API ما يعمل redirect غالبًا، لأنه endpoint يرجع data/status، والصفحة هي التي تقرر ماذا تفعل.
        { message: "يجب تسجيل الدخول أولًا." },
        { status: 401 },
      );
    }

    const response = await backendClient.get(
      "/api/admin/products/get", //هات منتجات المستخدم/المتجر المرتبط بهذا accessToken
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const normalized = normalizeBackendError(
      error,
      "Unable to load store products",
    );
    return NextResponse.json(normalized.body, {status: normalized.status});
  }
}
