import {cookies} from "next/headers";
import {NextResponse} from "next/server";

import {backendClient} from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";
import type {UpdateProductResponse} from "@/types/product";

interface EditProductRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  {params}: EditProductRouteProps,
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
    const formData = await request.formData();

    const response =
      await backendClient.patch<UpdateProductResponse>(
        `/api/admin/products/edit/${id}`,
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
      "Unable to update product",
    );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}