import ProductEditPage from "@/components/pages/product-edit-page";

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return <ProductEditPage productId={productId} />;
}
