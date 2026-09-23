import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/backend-client";
import { normalizeBackendError } from "@/lib/server/backend-error";

export async function GET(request: NextRequest) {
  // Client Component
  // → useSearchParams()

  // Route Handler / Server
  // → request.nextUrl.searchParams
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search"); //...(search ? { search: search } : {})
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  const params = {
    ...(search ? { search } : {}),
    ...(page ? { page } : {}),
    ...(limit ? { limit } : {}),
  };
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
        params,
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const normalized = normalizeBackendError(
      error,
      "Unable to load store products",
    );
    return NextResponse.json(normalized.body, { status: normalized.status });
  }
}
