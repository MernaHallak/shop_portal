import type {SupportedLocale} from "@/i18n/routing";

export type {SupportedLocale};

export type LocalizedText = Partial<Record<SupportedLocale, string | null>>; //Partial يخلي كل اللغات اختيارية

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export interface ProductSubcategory {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  name_i18n?: LocalizedText | null;
  description: string | null;
  description_i18n?: LocalizedText | null;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  name_i18n?: LocalizedText | null;
  category: string;
  category_slug: string;
  subcategory: string | null;
  subcategory_ar: string | null;
  subcategory_i18n?: LocalizedText | null;
  price: number;
  description: string | null;
  description_ar: string | null;
  description_i18n?: LocalizedText | null;
  store_name: string;
  store_id: string;
  image_url: string | null;
  image_public_id: string | null;
  images: ProductImage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategory_id: string | null;
  subcategory_slug: string | null;
  subcategory_details: ProductSubcategory | null;
}

export interface ProductImage {
  url: string; //رابط HTTP عادي
  secure_url: string; //فهو نفس الصورة عبر HTTPS المشفّر، ولهيك عادةً نستخدم secure_url بالفرونت.
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  sort_order: number;
}

export interface ProductsResponse {
  pagination: Pagination;
  products: Product[];
}

export interface CreateProductRequest { // مدخلات انشاء منتج
  name: string; 
  name_ar: string;
  category: string;
  category_slug?: string;
  subcategory_id?: string;
  subcategory_slug?: string;
  subcategory?: string;
  subcategory_ar?: string;
  price: number;
  description?: string;
  description_ar?: string;
  images?: File[]; //مصفوفة ملفات 
  // الصور لسا ملفات اختارها المستخدم أما:images: ProductImage[]; هاي منستخدمها بالـ response بعد ما الباك يرفع الصور عالكلاودينري ويرجع metadata معلومات بتوصف الصورة مثل: url و secure_url وغيرها 
  is_active?: boolean; 
} 

// لاحظ إني ما حطيت:  image\_url و image\_public\_id ضمن `CreateProductInput` لأن نحنا اخترنا الـ multipart flow، والصورة نفسها رح تنبعت كـ `File`مع انشاء المنتج  
// اما لو حاطتن فمعناتا إن الصورة **مرفوعة مسبقاً** على Cloudinary  وبعدين وقت إنشاء المنتج بتربط المنتج بهالصورة عن طريق:  image\_url و image\_public\_id



export interface CreateProductResponse {
  message: string;
  product: Product;
}