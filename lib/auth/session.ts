import "server-only";

import {cookies} from "next/headers";

import {backendClient} from "@/lib/backend-client";
import {getBackendErrorStatus} from "@/lib/server/backend-error";

export type SessionStatus = "authenticated" | "unauthenticated" | "unavailable" | "forbidden"; // 403  يعني مُحرَّمForbidden : التوكن ممكن يكون صالح، بس المستخدم ما عنده صلاحية يدخل على هذا الـ endpoint

export async function getSessionStatus(): Promise<SessionStatus> {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) return "unauthenticated";

  try {
    await backendClient.get("/api/auth/me", {
      headers: {Authorization: `Bearer ${accessToken}`},
    });
    return "authenticated";
  } catch (error) {
    const status = getBackendErrorStatus(error);
    if (status === 401 ) return "unauthenticated";
    if ( status === 403) return "forbidden";
    return "unavailable"; //حالات متل : الباك واقع -network error - timeout - status 500 -  مشكلة DNS - السيرفر رجع رد غير متوقع
    // بتعبر عن إنو ما قدرنا نتحقق من الـ session بسبب مشكلة تقنية، مو لأن المستخدم مو مسجل دخول.
  }
}

export async function hasValidSession(): Promise<boolean> {
  return (await getSessionStatus()) === "authenticated";
}
