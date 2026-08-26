import {NextResponse} from "next/server";

import {backendClient} from "@/lib/backend-client";
import {normalizeBackendError} from "@/lib/server/backend-error";
import { CategoriesResponse } from "@/types/category";

export async function GET() {
  try {
    const response = await backendClient.get<CategoriesResponse>(
      "/api/categories/get",
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const normalized = normalizeBackendError(
      error,
      "Unable to load categories",
    );

    return NextResponse.json(
      normalized.body,
      {status: normalized.status},
    );
  }
}