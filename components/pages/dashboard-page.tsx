"use client";

import { Button } from "@/components/ui/button";
import { Package, Plus, Store, LogOut, Edit, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVendorStore } from "@/lib/store";
import { CATEGORY_LABEL } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { products, toggleVisibility, logout } = useVendorStore();

  const visibleCount = products.filter((p) => p.visible).length;
  const hiddenCount = products.filter((p) => !p.visible).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <h2>Vendor Portal</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                <Store className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">My Profile</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground mb-1">Total Products</p>
            <p className="text-3xl">{products.length}</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground mb-1">Visible</p>
            <p className="text-3xl text-green-600">{visibleCount}</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground mb-1">Hidden</p>
            <p className="text-3xl text-muted-foreground">{hiddenCount}</p>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="mb-1">Products</h2>
              <p className="text-muted-foreground">Manage your laptop inventory</p>
            </div>
            <Button onClick={() => router.push("/products/add")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Table Header - Desktop only */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b">
            <div className="col-span-1"></div>
            <div className="col-span-3">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className="p-4 hover:bg-muted/30 transition-colors">
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <img
                      src={product.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  </div>
                  <div className="col-span-3">
                    <p className="mb-0.5">{product.name}</p>
                    <p className="text-muted-foreground">{product.brand}</p>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{CATEGORY_LABEL[product.category]}</div>
                  <div className="col-span-2">${product.price.toLocaleString()}</div>
                  <div className="col-span-1">
                    {product.visible ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                        <Eye className="h-3 w-3" />
                        <span className="hidden xl:inline">Visible</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                        <EyeOff className="h-3 w-3" />
                        <span className="hidden xl:inline">Hidden</span>
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/products/${product.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant={product.visible ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => toggleVisibility(product.id)}
                    >
                      {product.visible ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden flex gap-3">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="mb-0.5 truncate">{product.name}</p>
                        <p className="text-muted-foreground">{product.brand}</p>
                      </div>
                      {product.visible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                          <Eye className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground border flex-shrink-0">
                          <EyeOff className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <span>{CATEGORY_LABEL[product.category]}</span>
                      <span>•</span>
                      <span>${product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/products/${product.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant={product.visible ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => toggleVisibility(product.id)}
                      >
                        {product.visible ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-muted-foreground">No products yet.</p>
              <Button className="mt-4" onClick={() => router.push("/products/add")}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first product
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
