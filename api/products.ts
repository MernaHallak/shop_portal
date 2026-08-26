import {apiClient} from "@/api/client";
import type {
  CreateProductRequest,
  CreateProductResponse,
  ProductsResponse,
} from "@/types/product";

export async function getStoreProducts(): Promise<ProductsResponse> {
  const response = await apiClient.get<ProductsResponse>("/store/products");
  return response.data;
}

export async function createProduct(
  product: CreateProductRequest,
): Promise<CreateProductResponse> {
  const formData = new FormData();
// الطلب عن طريق formData وليس جيسون لحتى ابعت صور ونصوص بنفس الطلب اما لو جيسون فانا بدي  ارفع الصورة اولا عكلاودينري وبعدين بربطا من معلوماتا مع المنتج البدي انشاو
  formData.append("name", product.name); //لازم يطابق اسم الحقل اللي الباك متوقعه بالـ API schema حرفياً
  formData.append("name_ar", product.name_ar); 
  formData.append("category", product.category); //بما إن الـ category مختارة من بيانات الباك وعندنا الـ object كامل، منعرف منها الـ slug تلقائياً وما في داعي الأدمن يدخله.
  formData.append("price", String(product.price));
  formData.append("is_active", String(product.is_active ?? true));

  if (product.subcategory_id) {
    formData.append("subcategory_id", product.subcategory_id);
  }

  // طالما الـ validation ضامن إنهم يا موجودين سوا يا فاضيين سوا، فيك تختصريهم بشرط واحد
 if (product.description && product.description_ar) {
  formData.append("description", product.description);
  formData.append("description_ar", product.description_ar);
}

  for (const file of product.images ?? []) { //file of product.images → كل دورة من مصفوفة الصور  product.images  خزن الصورة الحالية بمتغير اسمه file  و إذا product.images كانت undefined أو null استخدم مصفوفة فاضية بدالها.ووقتا إذا صارت [] ما رح تنفذ الحلقة ولا مرة
    formData.append("images", file);
  }

  const response = await apiClient.post<CreateProductResponse>(
    "/store/products/create",
    formData,
  );

  return response.data;
}