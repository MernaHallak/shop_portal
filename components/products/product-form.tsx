"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Image as ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Product, ProductCategory, ProductCondition } from "@/lib/types";
import { CATEGORY_LABEL, CONDITION_LABEL } from "@/lib/types";
import { fileToDataUrl } from "@/lib/file";
import { useVendorStore } from "@/lib/store";

type Mode = "add" | "edit";

type Props = {
  mode: Mode;
  product?: Product;
};

type FormState = Omit<Product, "id">;
type FormErrors = Partial<Record<keyof FormState, string>>;

const CATEGORY_OPTIONS: ProductCategory[] = ["business", "gaming", "ultrabook", "workstation", "budget", "2in1"];
const CONDITION_OPTIONS: ProductCondition[] = ["new", "refurbished", "excellent", "good", "fair"];

function toNumber(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const { addProduct, updateProduct } = useVendorStore();

  const initial = useMemo<FormState>(() => {
    if (mode === "edit" && product) {
      const { id: _id, ...rest } = product;
      return rest;
    }

    return {
      name: "",
      brand: "",
      model: "",
      price: 0,
      cpu: "",
      ram: "",
      storage: "",
      gpu: "",
      screen: "",
      condition: "new",
      warranty: "1 year",
      description: "",
      category: "business",
      visible: true,
      image: undefined,
    };
  }, [mode, product]);

  const [form, setForm] = useState<FormState>(initial);
  const [priceText, setPriceText] = useState(form.price ? String(form.price) : "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const imagePreview = form.image;

  const validateField = (field: keyof FormState) => {
    const next: FormErrors = { ...errors };

    const requiredText = (k: keyof FormState, label: string) => {
      const v = String(form[k] ?? "").trim();
      if (!v) next[k] = `${label} is required`;
      else delete next[k];
    };

    switch (field) {
      case "name":
        requiredText("name", "Product name");
        break;
      case "brand":
        requiredText("brand", "Brand");
        break;
      case "model":
        requiredText("model", "Model");
        break;
      case "price": {
        const n = toNumber(priceText);
        if (!Number.isFinite(n) || n <= 0) next.price = "Price must be a positive number";
        else delete next.price;
        break;
      }
      case "category":
        if (!form.category) next.category = "Category is required";
        else delete next.category;
        break;
      case "condition":
        if (!form.condition) next.condition = "Condition is required";
        else delete next.condition;
        break;
      default:
        break;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateAll = () => {
    const required: (keyof FormState)[] = ["name", "brand", "model", "price", "category", "condition"];
    let ok = true;
    required.forEach((f) => {
      setTouched((t) => ({ ...t, [f]: true }));
      if (!validateField(f)) ok = false;
    });
    return ok;
  };

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB).");
      return;
    }

    setIsLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((s) => ({ ...s, image: dataUrl }));
    } catch {
      toast.error("Failed to load image.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => setForm((s) => ({ ...s, image: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const price = toNumber(priceText);
    if (!Number.isFinite(price) || price <= 0) {
      setErrors((s) => ({ ...s, price: "Price must be a positive number" }));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (mode === "add") {
        addProduct({ ...form, price });
        toast.success("Product added successfully!");
      } else if (mode === "edit" && product) {
        updateProduct(product.id, { ...form, price });
        toast.success("Product updated successfully!");
      }

      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="mb-2">{mode === "edit" ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-muted-foreground">
            {mode === "edit" ? "Update product information" : "Fill in the details to add a new product to your inventory"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4">Product Image</h2>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48">
                <div className="aspect-square bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden relative">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="image"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG/JPG up to 5MB. Stored locally (localStorage) for demo.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  onBlur={() => validateField("name")}
                  disabled={isLoading}
                />
                {touched.name && errors.name && <p className="text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => onChange("brand", e.target.value)}
                  onBlur={() => validateField("brand")}
                  disabled={isLoading}
                />
                {touched.brand && errors.brand && <p className="text-destructive">{errors.brand}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(e) => onChange("model", e.target.value)}
                  onBlur={() => validateField("model")}
                  disabled={isLoading}
                />
                {touched.model && errors.model && <p className="text-destructive">{errors.model}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  inputMode="decimal"
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  onBlur={() => validateField("price")}
                  disabled={isLoading}
                />
                {touched.price && errors.price && <p className="text-destructive">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => onChange("category", v as ProductCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.category && errors.category && <p className="text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={form.condition} onValueChange={(v) => onChange("condition", v as ProductCondition)}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CONDITION_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.condition && errors.condition && <p className="text-destructive">{errors.condition}</p>}
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU</Label>
                <Input id="cpu" value={form.cpu} onChange={(e) => onChange("cpu", e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input id="ram" value={form.ram} onChange={(e) => onChange("ram", e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Input
                  id="storage"
                  value={form.storage}
                  onChange={(e) => onChange("storage", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpu">GPU</Label>
                <Input id="gpu" value={form.gpu} onChange={(e) => onChange("gpu", e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screen">Screen</Label>
                <Input
                  id="screen"
                  value={form.screen}
                  onChange={(e) => onChange("screen", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  value={form.warranty}
                  onChange={(e) => onChange("warranty", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Description + Visibility */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4">Details</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  disabled={isLoading}
                  rows={5}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <div>
                  <p className="mb-0.5">Visible in marketplace</p>
                  <p className="text-sm text-muted-foreground">Hide products you don&apos;t want to show publicly.</p>
                </div>
                <Switch checked={form.visible} onCheckedChange={(v) => onChange("visible", v)} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pb-10">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "edit" ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
