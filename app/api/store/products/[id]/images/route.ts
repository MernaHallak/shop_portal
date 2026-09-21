import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendClient } from "@/lib/backend-client";

import type {
  DeleteProductImageRequest,
  DeleteProductImageResponse,
} from "@/types/product";
import { normalizeBackendError } from "@/lib/server/backend-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("access_token")?.value;

    const body =
      (await request.json()) as DeleteProductImageRequest;

    const response =
      await backendClient.delete<DeleteProductImageResponse>(
        `/api/admin/products/${id}/images`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },

          data: body,
        },
      );

    return NextResponse.json(response.data);
  } catch (error) {
    const normalized =
      normalizeBackendError(
        error,
        "Failed to delete product image",
      );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}