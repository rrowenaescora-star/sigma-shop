"use client";

import { useEffect, useState } from "react";

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
  const [message, setMessage] = useState("Loading products...");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

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
      setMessage("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleCreateProduct() {
    if (!form.name.trim() || !form.price.toString().trim()) {
      alert("Name and price are required.");
      return;
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      alert(result.error || "Failed to create product.");
      return;
    }

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
    setMessage(`Editing product #${product.id}`);
  }

  async function handleUpdateProduct() {
    if (!editingId) return;

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingId,
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
      alert(result.error || "Failed to update product.");
      return;
    }

    setEditingId(null);
    setForm(emptyForm);
    loadProducts();
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("Edit cancelled.");
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">Products Dashboard</h1>
            <p className="mt-2 text-slate-400">
              Add, edit, and manage your store products
            </p>
          </div>

          <button
            onClick={loadProducts}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Refresh Products
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          {message}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#101729] p-6 shadow-xl">
            <h2 className="text-2xl font-bold">
              {editingId ? `Edit Product #${editingId}` : "Add New Product"}
            </h2>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Product name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm("slug", e.target.value)}
                placeholder="Slug (example: kitsune-pack)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                placeholder="Price"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <input
                type="text"
                value={form.tag}
                onChange={(e) => updateForm("tag", e.target.value)}
                placeholder="Tag (example: Hot)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <select
                value={form.stock}
                onChange={(e) => updateForm("stock", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              >
                <option value="In Stock">In Stock</option>
                <option value="Limited">Limited</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <input
                type="text"
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                placeholder="Category"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Description"
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => updateForm("imageUrl", e.target.value)}
                placeholder="Image URL (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateForm("isActive", e.target.checked)}
                />
                Active product
              </label>

              <div className="flex gap-3">
                {editingId ? (
                  <>
                    <button
                      onClick={handleUpdateProduct}
                      className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="rounded-2xl bg-white/10 px-5 py-3 font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateProduct}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
                  >
                    Add Product
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#101729] p-6 shadow-xl">
            <h2 className="text-2xl font-bold">All Products</h2>

            <div className="mt-6 grid gap-4">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  Loading...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  No products found.
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Slug: {product.slug || "N/A"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Category: {product.category || "N/A"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Tag: {product.tag || "N/A"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Stock: {product.stock}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Active: {product.is_active ? "Yes" : "No"}
                        </p>
                        <p className="mt-2 text-slate-300">
                          {product.description || "No description."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <span className="text-2xl font-extrabold text-cyan-300">
                          ${Number(product.price).toFixed(2)}
                        </span>

                        <button
                          onClick={() => startEdit(product)}
                          className="rounded-xl bg-violet-400 px-4 py-2 font-bold text-slate-950"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
