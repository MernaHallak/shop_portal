import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendClient } from "@/lib/backend-client";
import type { StoreResponse } from "@/types/store";
import { normalizeBackendError } from "@/lib/server/backend-error";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("access_token")?.value;

    const response =
      await backendClient.get<StoreResponse>(
        "/api/admin/store/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

    return NextResponse.json(response.data);
  } catch (error) {
    const normalized =
      normalizeBackendError(
        error,
        "Failed to load store",
      );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}