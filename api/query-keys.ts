export const queryKeys = { // queryKey يعني React Query عنده كاش داخلي، وqueryKey هو العنوان تبع البيانات داخله.
  // React Query يحفظ نتيجة getStoreProducts تحت هذا المفتاح:["store", "products"] → بيانات المنتجات
  // ["store", "products"] → بيانات المنتجات ووقت تعمل invalidateQueries بنفس المفتاح، يعرف أن المقصود تحديث بيانات المنتجات تحديدًا.  
  storeProducts: ["store", "products"] as const, 
  categories: ["categories"],
};
