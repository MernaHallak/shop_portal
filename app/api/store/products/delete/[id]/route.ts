import {cookies} from "next/headers";
import {NextResponse} from "next/server";

import {backendClient} from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";
import { DeleteProductResponse } from "@/types/product";

interface DeleteProductRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _request: Request,
  {params}: DeleteProductRouteProps,
) {
  const {id} = await params;

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
    const response = await backendClient.delete<DeleteProductResponse>(
      `/api/admin/products/delete/${id}`,
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
      "Unable to delete product",
    );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}