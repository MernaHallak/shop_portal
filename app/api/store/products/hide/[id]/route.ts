import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendClient } from "@/lib/backend-client";
import type { HideProductResponse } from "@/types/product";
import { normalizeBackendError } from "@/lib/server/backend-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get("access_token")?.value;

    const response =
      await backendClient.patch<HideProductResponse>(
        `/api/admin/products/hide/${id}`,
        undefined, //لأن PATCH hide ما عنده request body لأن الترتيب هو:  axios.patch(url, data, config) 
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
        "Failed to hide product"
      );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}