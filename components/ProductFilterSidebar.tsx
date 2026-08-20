"use client";

type ProductFilterSidebarProps = {
  totalItems: number;
  inStockItems: number;
  categories: Array<{ name: string; count: number }>;
  selectedCategory: string;
  availabilityFilter: "all" | "in-stock";
  onCategoryChange: (category: string) => void;
  onAvailabilityChange: (filter: "all" | "in-stock") => void;
};

export default function ProductFilterSidebar({
  totalItems,
  inStockItems,
  categories,
  selectedCategory,
  availabilityFilter,
  onCategoryChange,
  onAvailabilityChange,
}: ProductFilterSidebarProps) {
  return (
    <aside className="hidden self-start p-6 lg:sticky lg:top-[140px] lg:block lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-white/10 pb-5">
        <span className="font-black text-white">Filter</span>
        <span className="rounded-lg bg-purple-500 px-2 py-1 text-xs font-black text-white">
          {totalItems} items
        </span>
      </div>

      <div className="border-b border-white/10 py-5">
        <p className="mb-3 text-sm font-black text-slate-300">Availability</p>

        <button
          onClick={() => onAvailabilityChange("in-stock")}
          className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          <span className="flex items-center gap-3">
            <span className={availabilityFilter === "in-stock" ? "h-5 w-5 rounded bg-purple-500 ring-2 ring-purple-300" : "h-5 w-5 rounded bg-slate-700"} />
            In stock only
          </span>
          <span className="text-xs text-slate-500">{inStockItems}</span>
        </button>

        <button
          onClick={() => onAvailabilityChange("all")}
          className="mt-3 flex w-full items-center gap-3 text-left text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          <span className={availabilityFilter === "all" ? "h-5 w-5 rounded bg-purple-500 ring-2 ring-purple-300" : "h-5 w-5 rounded bg-slate-700"} />
          Show all items
        </button>
      </div>

      <div className="pt-5">
        <p className="mb-3 text-sm font-black text-slate-300">Categories</p>

        <div className="space-y-3">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryChange(category.name)}
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <span className="flex items-center gap-3">
                <span className={selectedCategory === category.name ? "h-5 w-5 rounded bg-purple-500 ring-2 ring-purple-300" : "h-5 w-5 rounded bg-slate-700"} />
                {category.name}
              </span>
              <span className="text-xs text-slate-500">{category.count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
