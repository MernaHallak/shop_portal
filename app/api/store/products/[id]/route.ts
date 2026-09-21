import {NextResponse} from "next/server";

import {backendClient} from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";
import type {ProductResponse} from "@/types/product";

interface ProductRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  {params}: ProductRouteProps,
) {
  const {id} = await params;

  try {
    const response =
      await backendClient.get<ProductResponse>(
        `/api/products/${id}`,
      );

    return NextResponse.json(response.data);
  } catch (error) {
    const normalized = normalizeBackendError(
      error,
      "Unable to load product",
    );

    return NextResponse.json(
      normalized.body,
      {
        status: normalized.status,
      },
    );
  }
}