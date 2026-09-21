import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendClient } from "@/lib/backend-client";
import type { RefreshResponse } from "@/types/auth";
import { normalizeBackendError } from "@/lib/server/backend-error";

export async function POST() {
  const cookieStore = await cookies();

  const refreshToken =
    cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      {
        message: "Refresh token is missing",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const { data } =
      await backendClient.post<RefreshResponse>(
        "/api/auth/refresh",
        undefined,
        {
          headers: {
            // عندك محليًا اسم الكوكي:refresh_token لكن الباك حسب الـ documentation ينتظر:lap_store_refresh_token فنحنا قرأنا المحلي وبعتناه للباك بالاسم اللي هو متوقعه
            Cookie:
              `lap_store_refresh_token=${encodeURIComponent(
                refreshToken,
              )}`,
          },
        },
      );

    // ما منرجع access_token للـ JavaScript.
    // منخزنه بالHttpOnly cookie مثل login.
    const response = NextResponse.json({
      message: data.message,
    });

    response.cookies.set({
      name: "access_token",
      value: data.session.access_token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.session.expires_in,
    });

    return response;
  } 
  // هاد الـ catch كافي لتنظيف الجلسة من جهة السيرفر: بيمسح access_token وrefresh_token وبي رجّع status/message مناسبين.
  catch (error) {
    const normalized = normalizeBackendError(
      error,
      "Unable to refresh session",
    );

    const response = NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );

    // إذا refresh نفسه فشل، الجلسة ما عاد صالحة.
    response.cookies.set({
      name: "access_token",
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set({
      name: "refresh_token",
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 0,
    });

    return response;
  }
}