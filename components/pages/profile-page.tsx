"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useVendorStore } from "@/lib/store";
import { fileToDataUrl } from "@/lib/file";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile } = useVendorStore();

  const initial = useMemo(
    () => ({
      shopName: profile.shopName,
      city: profile.city,
      whatsapp: profile.whatsapp,
      description: profile.description,
      logo: profile.logo,
    }),
    [profile]
  );

  const [formData, setFormData] = useState(initial);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(profile.logo);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo too large (max 5MB).");
      return;
    }

    setIsLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoPreview(dataUrl);
      setFormData((s) => ({ ...s, logo: dataUrl }));
    } catch {
      toast.error("Failed to load logo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      updateProfile({
        shopName: formData.shopName,
        city: formData.city,
        whatsapp: formData.whatsapp,
        description: formData.description,
        logo: formData.logo,
      });

      setIsLoading(false);
      toast.success("Profile updated successfully!");
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
          <h1 className="mb-2">Store Profile</h1>
          <p className="text-muted-foreground">Update your shop information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4">Store Logo</h2>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Store className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No logo</p>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="logo"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Label>
                <p className="text-sm text-muted-foreground mt-2">PNG/JPG up to 5MB.</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4">Store Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop name</Label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) => setFormData((s) => ({ ...s, shopName: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((s) => ({ ...s, city: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((s) => ({ ...s, whatsapp: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                  disabled={isLoading}
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pb-10">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
