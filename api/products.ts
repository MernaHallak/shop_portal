import {apiClient} from "@/api/client";
import type {
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductImageRequest,
  DeleteProductImageResponse,
  DeleteProductResponse,
  HideProductResponse,
  ProductResponse,
  ProductsResponse,
  StoreProductsParams,
  UpdateProductRequest,
  UpdateProductResponse,
} from "@/types/product";


export async function getStoreProducts(params?: StoreProductsParams): Promise<ProductsResponse> {
  const response = await apiClient.get<ProductsResponse>("/store/products", { params });
  return response.data;
}

// الميزة هون إن Axios بيحوّل:{
//   search: "Dell",
//   page: 1,
//   limit: 24,
// }
// تلقائيًا إلى:/api/store/products?search=Dell&page=1&limit=24  
// لهيك بال Route Handler بيوصلو الطلب بهل الشكل /api/store/products?search=Dell&page=1&limit=24 ومنقدر نقرأها عبر request.nextUrl.searchParams.get("search") 

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


export async function deleteProduct(
  productId: string,
): Promise<DeleteProductResponse> {
  const response = await apiClient.delete<DeleteProductResponse>(
    `/store/products/delete/${productId}`,
  );

  return response.data;
}


export async function updateProduct(
  productId: string, //الـ productId يجي من product.id وقت الضغط على زر التعديل، وبعدين منحطه بالـ URL، وصفحة التعديل بتقرأه من الـ URL.
  updateData: UpdateProductRequest, //updateData هي الحقول التعدلت فقط لو كان الطلب جيسون وما عندي صور كنت ببعت  ال updateData مباشرة مع الطلب بدون شروط بس لانو طلب formData لازم تعملي شروط قبل append لأنك ما فيك تعملي append لحقل غير موجود/undefined بشكل نظيف يعني الشروط هون صارت بسبب تحويل updateData إلى FormData
): Promise<UpdateProductResponse> {
  const formData = new FormData();

  if (updateData.name !== undefined) { //للتحقق هل هالحقل موجود أصلاً ضمن بيانات التعديل وبدنا نبعته للباك أو لا 
    formData.append("name", updateData.name);
  }

  if (updateData.name_ar !== undefined) {
    formData.append("name_ar", updateData.name_ar);
  }

  if (updateData.category !== undefined) {
    formData.append("category", updateData.category);
  }

  if (updateData.subcategory_id !== undefined) {
    formData.append("subcategory_id", updateData.subcategory_id ?? "",);
  }

  if (updateData.price !== undefined) {
    formData.append("price", String(updateData.price));
  }

  if (updateData.description !== undefined) {
    formData.append("description",updateData.description ?? "",);
  }

  if (updateData.description_ar !== undefined) {
    formData.append("description_ar",updateData.description_ar ?? "",);
  }

  if (updateData.is_active !== undefined) {
    formData.append(
      "is_active",
      String(updateData.is_active),
    );
  }

  for (const file of updateData.images ?? []) {
    formData.append("images", file);
  }

  const response = await apiClient.patch<UpdateProductResponse>(
    `/store/products/edit/${productId}`,
    formData,
  );

  return response.data;
}


export async function getProductById(
  productId: string, //هون الـ productId جاي من الـ URL تبع صفحة التعديل.
): Promise<ProductResponse> {
  const response = await apiClient.get<ProductResponse>(
    `/store/products/${productId}`,
  );

  return response.data;
}


export async function hideProduct(
  productId: string,
): Promise<HideProductResponse> {
  const response =
    await apiClient.patch<HideProductResponse>(
      `/store/products/hide/${productId}`,
    );

  return response.data;
}

export async function deleteProductImage(
  productId: string,
  data: DeleteProductImageRequest,
): Promise<DeleteProductImageResponse> {
  const response =
    await apiClient.delete<DeleteProductImageResponse>(
      `/store/products/${productId}/images`,
      {
        data,
      },
    );

  return response.data;
}