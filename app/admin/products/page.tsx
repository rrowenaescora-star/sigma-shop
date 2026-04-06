"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import LogoutButton from "../logout-button";

type Product = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  tag: string | null;
  stock: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
};

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  tag: "",
  stock: "In Stock",
  category: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Checking access...");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // 🔥 PROTECT PAGE
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.replace("/admin/login");
        return;
      }

      loadProducts();
    }

    checkUser();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setMessage("Loading products...");

      const response = await fetch("/api/admin/products");
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to load products.");
        return;
      }

      setProducts(result.products || []);
      setMessage("Products loaded.");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateProduct() {
    if (!form.name.trim() || !form.price.toString().trim()) {
      alert("Name and price are required.");
      return;
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        price: Number(form.price),
        tag: form.tag,
        stock: form.stock,
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed.");
      return;
    }

    alert("Created!");
    setForm(emptyForm);
    loadProducts();
  }

  async function handleUpdateProduct() {
    if (!editingId) return;

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        ...form,
        price: Number(form.price),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed.");
      return;
    }

    alert("Updated!");
    setEditingId(null);
    setForm(emptyForm);
    loadProducts();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      price: String(product.price ?? ""),
      tag: product.tag || "",
      stock: product.stock || "In Stock",
      category: product.category || "",
      description: product.description || "",
      imageUrl: product.image_url || "",
      isActive: product.is_active,
    });
  }

  async function handleArchiveProduct(id: number, isActive: boolean) {
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });

    await response.json();
    loadProducts();
  }

  // 🔒 BLOCK UI while checking auth
  if (loading && message === "Checking access...") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-extrabold mb-6">Admin Dashboard</h1>

        <button
          onClick={loadProducts}
          className="mb-4 bg-cyan-400 px-4 py-2 rounded"
        >
          Refresh
        </button>

        <div className="mb-6">{message}</div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold mb-3">
              {editingId ? "Edit" : "Create"}
            </h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className="block w-full mb-2 p-2 bg-black"
            />

            <input
              placeholder="Price"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              className="block w-full mb-2 p-2 bg-black"
            />

            <button
              onClick={
                editingId ? handleUpdateProduct : handleCreateProduct
              }
              className="bg-cyan-400 px-4 py-2"
            >
              Save
            </button>
            <LogoutButton />
          </div>

          <div>
            {products.map((p) => (
              <div key={p.id} className="border p-3 mb-2">
                <h3>{p.name}</h3>
                <p>${p.price}</p>

                <button onClick={() => startEdit(p)}>Edit</button>
                <button
                  onClick={() =>
                    handleArchiveProduct(p.id, p.is_active)
                  }
                >
                  Toggle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
