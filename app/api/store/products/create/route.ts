import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

import {backendClient} from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Authentication required",
      },
      {status: 401},
    );
  }

  try {
    const formData = await request.formData(); //بترجع البيانات المرسلة كـ FormData object  وبتقرأ منه الحقول بـ formData.get("file")  

    const response = await backendClient.post(
      "/api/admin/products/create",
      formData,
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
      "Unable to create product",
    );

    return NextResponse.json(
      normalized.body,
      {status: normalized.status},
    );
  }
}