import { apiClient } from "@/api/client";
import type { StoreResponse, UpdateStoreRequest, UpdateStoreResponse } from "@/types/store";



export async function getStore(): Promise<StoreResponse> {
  const response =
    await apiClient.get<StoreResponse>(
      "/store/me",
    );

  return response.data;
}

// getStore(userId) مافي داعي مرر userId
// لان كلمة me معناها: جيب المتجر المرتبط بالمستخدم الحالي والباك بيعرف مين المستخدم الحالي؟ من التوكن


export async function updateStore(
  updateData: UpdateStoreRequest,
): Promise<UpdateStoreResponse> {
  const formData = new FormData();

  if (updateData.name !== undefined) {
    formData.append("name", updateData.name);
  }

  if (updateData.name_ar !== undefined) {
    formData.append(
      "name_ar",
      updateData.name_ar ?? "",
    );
  }

  if (updateData.description !== undefined) {
    formData.append(
      "description",
      updateData.description ?? "",
    );
  }

  if (updateData.description_ar !== undefined) {
    formData.append(
      "description_ar",
      updateData.description_ar ?? "",
    );
  }

  if (updateData.location !== undefined) {
    formData.append(
      "location",
      updateData.location ?? "",
    );
  }

  if (updateData.location_ar !== undefined) {
    formData.append(
      "location_ar",
      updateData.location_ar ?? "",
    );
  }

  if (updateData.phone !== undefined) {
    formData.append(
      "phone",
      updateData.phone ?? "",
    );
  }

  if (updateData.whatsapp_url !== undefined) {
    formData.append(
      "whatsapp_url",
      updateData.whatsapp_url ?? "",
    );
  }

  if (updateData.facebook_url !== undefined) {
    formData.append(
      "facebook_url",
      updateData.facebook_url ?? "",
    );
  }

  if (updateData.instagram_url !== undefined) {
    formData.append(
      "instagram_url",
      updateData.instagram_url ?? "",
    );
  }

  if (updateData.telegram_url !== undefined) {
    formData.append(
      "telegram_url",
      updateData.telegram_url ?? "",
    );
  }

  if (updateData.social_links !== undefined) {
    formData.append(
      "social_links",
      JSON.stringify(updateData.social_links), //لأن FormData.append() ما بيقبل object مباشرة؛ بيقبل string أو Blob/File
    );
  }

  if (updateData.logo_file) {
    formData.append(
      "logo_file",
      updateData.logo_file,
    );
  }

  if (updateData.cover_file) {
    formData.append(
      "cover_file",
      updateData.cover_file,
    );
  }

  const response =
    await apiClient.patch<UpdateStoreResponse>(
      "/store/update",
      formData,
    );

  return response.data;
}