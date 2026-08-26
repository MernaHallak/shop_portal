import { apiClient } from "@/api/client";
import type {
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  // اللي بيوصل للفرونت من route.ts عبر Axios هو فقط محتوى NextResponse.json(...) لان هاد هو الرد للفرونت
  const response = await apiClient.post<LoginResponse>( //إذا رجع خطأ، هذا السطر يرمي error وما يكمل للسطر:return response.data;  Axios يرمي error → React Query يمسكه داخل useMutation error
    "/auth/login",
    credentials, //Axios يحوّله تلقائيًا إلى JSON text عند الإرسال وبعدها في route.ts :const parsedBody = await request.json(); يرجع يتحول من JSON text إلى JavaScript object تستخدميه بالكود
  );
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
