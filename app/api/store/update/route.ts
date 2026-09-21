import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendClient } from "@/lib/backend-client";

import type { UpdateStoreResponse } from "@/types/store";
import { normalizeBackendError } from "@/lib/server/backend-error";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("access_token")?.value;

    const formData = await request.formData();

    const response =
      await backendClient.patch<UpdateStoreResponse>(
        "/api/admin/store/update",
        formData,
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
        "Failed to update store",
      );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}