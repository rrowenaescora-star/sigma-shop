"use client";

import { useEffect, useMemo, useState } from "react";
import LogoutButton from "../logout-button";

type Product = {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  compare_at_price?: number | null;
  tag: string | null;
  stock: string;
  stock_quantity?: number | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  cost_value?: number | null;
  created_at?: string;
};

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  compareAtPrice: "",
  tag: "",
  stock: "In Stock",
  stockQuantity: "",
  category: "",
  description: "",
  imageUrl: "",
  costValue: "",
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading products...");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [globalCapital, setGlobalCapital] = useState<number | null>(null);
  const [capitalInput, setCapitalInput] = useState("");
  const [capitalSaving, setCapitalSaving] = useState(false);

  useEffect(() => {
    loadPageData();
  }, []);

  const parsedPrice = Number(form.price || 0);
  const parsedCompareAtPrice = Number(form.compareAtPrice || 0);

  const discountPreview = useMemo(() => {
    if (!form.price || !form.compareAtPrice) return null;
    if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedCompareAtPrice)) {
      return null;
    }
    if (parsedCompareAtPrice <= parsedPrice || parsedPrice <= 0) return null;

    const percentOff = Math.round(
      ((parsedCompareAtPrice - parsedPrice) / parsedCompareAtPrice) * 100
    );
    const savings = parsedCompareAtPrice - parsedPrice;

    return {
      percentOff,
      savings,
    };
  }, [form.price, form.compareAtPrice, parsedPrice, parsedCompareAtPrice]);

  const unavailableByCapitalCount = useMemo(() => {
    if (globalCapital === null) return 0;
    return products.filter(
      (product) => Number(product.cost_value || 0) > globalCapital
    ).length;
  }, [products, globalCapital]);

  async function loadPageData() {
    await Promise.all([loadProducts(), loadCapital()]);
  }

  async function loadProducts() {
    try {
      setLoading(true);
      setMessage("Loading products...");

      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });

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

  async function loadCapital() {
    try {
      const response = await fetch("/api/admin/settings", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(result.error || "Failed to load capital.");
        return;
      }

      const capital = Number(result.global_capital || 0);
      setGlobalCapital(capital);
      setCapitalInput(String(capital));
    } catch (error) {
      console.error("Failed to load capital:", error);
    }
  }

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSaveCapital() {
    const parsed = Number(capitalInput);

    if (!Number.isFinite(parsed) || parsed < 0) {
      alert("Please enter a valid capital amount.");
      return;
    }

    try {
      setCapitalSaving(true);

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          global_capital: parsed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update capital.");
        return;
      }

      setGlobalCapital(parsed);
      alert("Global capital updated successfully.");
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating capital.");
    } finally {
      setCapitalSaving(false);
    }
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
        compare_at_price: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : null,
        tag: form.tag,
        stock: form.stock,
        stock_quantity:
          form.stockQuantity === "" ? null : Number(form.stockQuantity),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
        cost_value: form.costValue === "" ? 0 : Number(form.costValue),
        isActive: form.isActive,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to create product.");
      return;
    }

    alert("Product created successfully.");
    setForm(emptyForm);
    await loadPageData();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      price: String(product.price ?? ""),
      compareAtPrice: product.compare_at_price
        ? String(product.compare_at_price)
        : "",
      tag: product.tag || "",
      stock: product.stock || "In Stock",
      stockQuantity:
        product.stock_quantity === null || product.stock_quantity === undefined
          ? ""
          : String(product.stock_quantity),
      category: product.category || "",
      description: product.description || "",
      imageUrl: product.image_url || "",
      costValue:
        product.cost_value === null || product.cost_value === undefined
          ? ""
          : String(product.cost_value),
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
        compare_at_price: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : null,
        tag: form.tag,
        stock: form.stock,
        stock_quantity:
          form.stockQuantity === "" ? null : Number(form.stockQuantity),
        category: form.category,
        description: form.description,
        imageUrl: form.imageUrl,
        cost_value: form.costValue === "" ? 0 : Number(form.costValue),
        isActive: form.isActive,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to update product.");
      return;
    }

    alert("Product updated successfully.");
    setEditingId(null);
    setForm(emptyForm);
    await loadPageData();
  }

  async function handleArchiveProduct(id: number, isActive: boolean) {
    const action = isActive ? "archive" : "restore";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this product?`
    );
    if (!confirmed) return;

    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        isActive: !isActive,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || `Failed to ${action} product.`);
      return;
    }

    alert(`Product ${action}d successfully.`);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    await loadPageData();
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("Edit cancelled.");
  }

  return (
    <div className="min-h-screen bg-[#070b14] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">Products Dashboard</h1>
            <p className="mt-2 text-slate-400">
              Add, edit, archive, and manage your store products
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadPageData}
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh Products
            </button>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          {message}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
              Global Capital
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">
              $
              {globalCapital === null
                ? "Loading..."
                : Number(globalCapital).toFixed(2)}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Any product with a cost value higher than this becomes unavailable.
            </p>
          </div>

          <div className="rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-300">
              Low Capital Unavailable
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">
              {unavailableByCapitalCount}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Products currently above your remaining capital.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#101729] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Update Capital
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="number"
                step="0.01"
                min="0"
                value={capitalInput}
                onChange={(e) => setCapitalInput(e.target.value)}
                placeholder="Enter new capital"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />
              <button
                onClick={handleSaveCapital}
                disabled={capitalSaving}
                className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"
              >
                {capitalSaving ? "Saving..." : "Save Capital"}
              </button>
            </div>
          </div>
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
                type="number"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => updateForm("compareAtPrice", e.target.value)}
                placeholder="Original price / Compare-at price (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              {discountPreview ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <p className="text-sm font-bold text-emerald-300">
                    🔥 {discountPreview.percentOff}% OFF
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Customer saves ${discountPreview.savings.toFixed(2)}
                  </p>
                </div>
              ) : form.compareAtPrice ? (
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
                  <p className="text-sm text-yellow-200">
                    Compare-at price should be higher than the actual price to
                    show a discount.
                  </p>
                </div>
              ) : null}

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
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(e) => updateForm("stockQuantity", e.target.value)}
                placeholder="Stock quantity (example: 10)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {form.stockQuantity === "" ? (
                  <p>No stock quantity set yet.</p>
                ) : Number(form.stockQuantity) <= 0 ? (
                  <p className="text-red-300">
                    This product will be treated as out of stock.
                  </p>
                ) : Number(form.stockQuantity) <= 3 ? (
                  <p className="text-yellow-300">
                    This product will show as limited stock.
                  </p>
                ) : (
                  <p className="text-emerald-300">
                    This product will show as in stock.
                  </p>
                )}
              </div>

              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costValue}
                onChange={(e) => updateForm("costValue", e.target.value)}
                placeholder="Cost value (capital deduction amount)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {form.costValue === "" ? (
                  <p>No cost value set yet.</p>
                ) : globalCapital === null ? (
                  <p>Capital status will appear once capital is loaded.</p>
                ) : Number(form.costValue) > globalCapital ? (
                  <p className="text-red-300">
                    This product will be unavailable because its cost value is
                    higher than your current capital.
                  </p>
                ) : (
                  <p className="text-emerald-300">
                    This product is within your current capital range.
                  </p>
                )}
              </div>

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
                products.map((product) => {
                  const blockedByCapital =
                    globalCapital !== null &&
                    Number(product.cost_value || 0) > globalCapital;

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400" />
                            )}
                          </div>

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
                              Stock label: {product.stock}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Stock quantity: {product.stock_quantity ?? "N/A"}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Cost value: ${Number(product.cost_value || 0).toFixed(2)}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Status: {product.is_active ? "Active" : "Inactive"}
                            </p>

                            {blockedByCapital ? (
                              <p className="mt-2 text-sm font-semibold text-red-300">
                                Unavailable because cost value is higher than current capital.
                              </p>
                            ) : (
                              <p className="mt-2 text-sm font-semibold text-emerald-300">
                                Within capital range.
                              </p>
                            )}

                            <p className="mt-2 text-slate-300">
                              {product.description || "No description."}
                            </p>
                            <p className="mt-2 break-all text-xs text-cyan-300">
                              {product.image_url || "No image URL"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 md:items-end">
                          <div className="flex flex-col items-start md:items-end">
                            <span className="text-2xl font-extrabold text-cyan-300">
                              ${Number(product.price).toFixed(2)}
                            </span>

                            {product.compare_at_price &&
                            Number(product.compare_at_price) > Number(product.price) ? (
                              <>
                                <span className="text-sm text-slate-500 line-through">
                                  ${Number(product.compare_at_price).toFixed(2)}
                                </span>
                                <span className="mt-1 text-xs font-bold text-emerald-300">
                                  {Math.round(
                                    ((Number(product.compare_at_price) - Number(product.price)) /
                                      Number(product.compare_at_price)) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </>
                            ) : null}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(product)}
                              className="rounded-xl bg-violet-400 px-4 py-2 font-bold text-slate-950"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleArchiveProduct(product.id, product.is_active)
                              }
                              className={`rounded-xl px-4 py-2 font-bold text-white ${
                                product.is_active ? "bg-red-500" : "bg-green-500"
                              }`}
                            >
                              {product.is_active ? "Archive" : "Restore"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}