"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/products/product-form";
import { useVendorStore } from "@/lib/store";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductEditPage({ productId }: { productId: string }) {
  const router = useRouter();
  const id = Number(productId);

  const { products } = useVendorStore();
  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  if (!Number.isFinite(id) || !product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h2 className="mb-1">Product not found</h2>
                <p className="text-muted-foreground">The product you&apos;re trying to edit doesn&apos;t exist.</p>
                <Button className="mt-4" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
