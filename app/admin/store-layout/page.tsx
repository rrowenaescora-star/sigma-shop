"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Monitor, Redo2, RotateCcw, Smartphone, Tablet, Undo2 } from "lucide-react";
import AdminHeader from "../admin-header";

type Viewport = "desktop" | "tablet" | "mobile";
type Span = "normal" | "wide" | "large";
type SectionKey = "catalog" | "store_info" | "faq";
type Section = { section_key: SectionKey; display_order: number; mobile_display_order?: number | null; enabled: boolean; settings?: Record<string, unknown> };
type Product = { id: number; name: string; image_url?: string | null; is_active: boolean; display_order?: number | null; mobile_display_order?: number | null; grid_span?: Span | null };
type Snapshot = { sections: Section[]; products: Product[] };

const labels: Record<SectionKey, string> = { catalog: "Product Catalog", store_info: "Store Information", faq: "Help Center" };
const clone = (value: Snapshot): Snapshot => JSON.parse(JSON.stringify(value));
const order = <T extends { display_order?: number | null }>(rows: T[]) => [...rows].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
const normalise = (sections: Section[], products: Product[]): Snapshot => ({
  sections: sections.map((item, index) => ({ ...item, display_order: index + 1, mobile_display_order: index + 1 })),
  products: products.map((item, index) => ({ ...item, display_order: index + 1, mobile_display_order: index + 1, grid_span: (item.grid_span || "normal") as Span })),
});

function SortableRow({ id, children }: { id: string; children: (handle: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={"rounded-xl border border-white/10 bg-white/[0.03] p-2 " + (isDragging ? "z-20 opacity-50 ring-2 ring-cyan-300" : "")}>
    {children(<button ref={setActivatorNodeRef} type="button" aria-label="Drag to reorder" className="cursor-grab touch-none rounded-lg p-2 text-slate-400 hover:bg-white/10 active:cursor-grabbing" {...attributes} {...listeners}><GripVertical className="h-4 w-4" /></button>)}
  </div>;
}

export default function StoreLayoutEditorPage() {
  const [saved, setSaved] = useState<Snapshot | null>(null);
  const [draft, setDraft] = useState<Snapshot | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [message, setMessage] = useState("Loading layout…");
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const sections = useMemo(() => draft ? order(draft.sections) : [], [draft]);
  const products = useMemo(() => draft ? order(draft.products) : [], [draft]);
  const changed = !!saved && !!draft && JSON.stringify(saved) !== JSON.stringify(draft);

  useEffect(() => {
    fetch("/api/admin/store-layout", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load the layout.");
      const snapshot = normalise(order(data.sections || []), order(data.products || []));
      setSaved(clone(snapshot)); setDraft(clone(snapshot)); setMessage("Drag a grip handle or use the Move buttons, then press Save layout.");
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load the layout."));
  }, []);

  function commit(next: Snapshot) {
    if (!draft) return;
    setHistory((items) => [...items.slice(-39), clone(draft)]);
    setFuture([]);
    setDraft(normalise(next.sections, next.products));
    setMessage("Unsaved changes — press Save layout when finished.");
  }

  function reorderProducts(activeId: string, overId: string) {
    if (!draft || activeId === overId) return;
    const oldIndex = products.findIndex((item) => "product-" + item.id === activeId);
    const newIndex = products.findIndex((item) => "product-" + item.id === overId);
    if (oldIndex >= 0 && newIndex >= 0) commit({ sections: draft.sections, products: arrayMove(products, oldIndex, newIndex) });
  }

  function reorderSections(activeId: string, overId: string) {
    if (!draft || activeId === overId) return;
    const oldIndex = sections.findIndex((item) => "section-" + item.section_key === activeId);
    const newIndex = sections.findIndex((item) => "section-" + item.section_key === overId);
    if (oldIndex >= 0 && newIndex >= 0) commit({ sections: arrayMove(sections, oldIndex, newIndex), products: draft.products });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over) return;
    const active = String(event.active.id), over = String(event.over.id);
    if (active.startsWith("product-") && over.startsWith("product-")) reorderProducts(active, over);
    if (active.startsWith("section-") && over.startsWith("section-")) reorderSections(active, over);
  }

  function moveProduct(id: number, direction: number) {
    const index = products.findIndex((item) => item.id === id);
    const target = Math.max(0, Math.min(products.length - 1, index + direction));
    if (draft && index >= 0 && target !== index) commit({ sections: draft.sections, products: arrayMove(products, index, target) });
  }

  function moveSection(key: SectionKey, direction: number) {
    const index = sections.findIndex((item) => item.section_key === key);
    const target = Math.max(0, Math.min(sections.length - 1, index + direction));
    if (draft && index >= 0 && target !== index) commit({ sections: arrayMove(sections, index, target), products: draft.products });
  }

  function toggleSection(key: SectionKey) {
    if (draft) commit({ products: draft.products, sections: draft.sections.map((item) => item.section_key === key ? { ...item, enabled: !item.enabled } : item) });
  }

  function setSpan(id: number, span: Span) {
    if (draft) commit({ sections: draft.sections, products: draft.products.map((item) => item.id === id ? { ...item, grid_span: span } : item) });
  }

  function undo() {
    if (!draft || !history.length) return;
    const previous = history[history.length - 1];
    setHistory((items) => items.slice(0, -1)); setFuture((items) => [clone(draft), ...items].slice(0, 40)); setDraft(clone(previous)); setMessage("Change undone.");
  }

  function redo() {
    if (!draft || !future.length) return;
    const next = future[0];
    setFuture((items) => items.slice(1)); setHistory((items) => [...items, clone(draft)].slice(-40)); setDraft(clone(next)); setMessage("Change restored.");
  }

  function reset() {
    if (!saved || !changed || !window.confirm("Discard all unsaved layout changes?")) return;
    setDraft(clone(saved)); setHistory([]); setFuture([]); setMessage("Restored your last saved layout.");
  }

  async function save() {
    if (!draft) return;
    setSaving(true); setMessage("Saving layout…");
    try {
      const response = await fetch("/api/admin/store-layout", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSaved(clone(draft)); setHistory([]); setFuture([]); setMessage("Layout saved successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save layout. Your changes are still here."); }
    finally { setSaving(false); }
  }

  const previewWidth = viewport === "desktop" ? "max-w-6xl" : viewport === "tablet" ? "max-w-3xl" : "max-w-sm";
  const previewColumns = viewport === "mobile" ? "grid-cols-1" : viewport === "tablet" ? "grid-cols-2" : "grid-cols-4";

  return <main className="min-h-screen bg-[#06101d] px-4 py-6 text-white sm:px-6">
    <AdminHeader title="Store Layout Editor" subtitle="Use a drag handle or the clear Move buttons. Nothing saves until you press Save layout." active="layout" />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300/15 bg-[#0b1728] p-4">
      <div className="flex flex-wrap gap-2">{(["desktop", "tablet", "mobile"] as Viewport[]).map((item) => {
        const Icon = item === "desktop" ? Monitor : item === "tablet" ? Tablet : Smartphone;
        return <button key={item} onClick={() => setViewport(item)} className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold " + (viewport === item ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10")}><Icon className="h-4 w-4" />{item}</button>;
      })}</div>
      <div className="flex flex-wrap gap-2"><button onClick={undo} disabled={!history.length} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"><Undo2 className="mr-1 inline h-4 w-4" />Undo</button><button onClick={redo} disabled={!future.length} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"><Redo2 className="mr-1 inline h-4 w-4" />Redo</button><button onClick={reset} disabled={!changed} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold disabled:opacity-40"><RotateCcw className="mr-1 inline h-4 w-4" />Reset</button><button onClick={save} disabled={!changed || saving} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-50">{saving ? "Saving…" : "Save layout"}</button></div>
    </div>
    <p className={"mb-6 text-sm font-semibold " + (changed ? "text-amber-200" : "text-emerald-200")}>{changed ? "Unsaved changes · " : ""}{message}</p>
    {!draft ? <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-6 text-slate-300">{message}</div> :
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-6"><section className="rounded-2xl border border-white/10 bg-[#0b1728] p-4"><h2 className="font-black">Store sections</h2><p className="mt-1 text-xs text-slate-400">Hold the ⠿ handle and drag, or use Move up/down.</p><div className="mt-4 space-y-2"><SortableContext items={sections.map((item) => "section-" + item.section_key)} strategy={verticalListSortingStrategy}>{sections.map((section, index) => <SortableRow key={section.section_key} id={"section-" + section.section_key}>{(handle) => <div className="flex items-center gap-2">{handle}<span className="min-w-0 flex-1 truncate text-sm font-bold">{labels[section.section_key]}</span><button onClick={() => toggleSection(section.section_key)} className="rounded-lg p-2 hover:bg-white/10">{section.enabled ? <Eye className="h-4 w-4 text-emerald-300" /> : <EyeOff className="h-4 w-4 text-slate-500" />}</button><button onClick={() => moveSection(section.section_key, -1)} disabled={!index} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold disabled:opacity-30">Up</button><button onClick={() => moveSection(section.section_key, 1)} disabled={index === sections.length - 1} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold disabled:opacity-30">Down</button></div>}</SortableRow>)}</SortableContext></div></section>
      <section className="rounded-2xl border border-white/10 bg-[#0b1728] p-4"><h2 className="font-black">Product order</h2><p className="mt-1 text-xs text-slate-400">Default shop order follows this list. Customer sorting still overrides it.</p><div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1"><SortableContext items={products.map((item) => "product-" + item.id)} strategy={verticalListSortingStrategy}>{products.map((product, index) => <SortableRow key={product.id} id={"product-" + product.id}>{(handle) => <div><div className="flex items-center gap-2">{handle}{product.image_url ? <img src={product.image_url} alt="" className="h-8 w-8 rounded-lg object-contain" /> : <span className="h-8 w-8 rounded-lg bg-cyan-400/10" />}<span className="min-w-0 flex-1 truncate text-sm font-bold">{product.name}</span><button onClick={() => moveProduct(product.id, -1)} disabled={!index} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold disabled:opacity-30">Up</button><button onClick={() => moveProduct(product.id, 1)} disabled={index === products.length - 1} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold disabled:opacity-30">Down</button></div><div className="mt-2 flex gap-1 pl-10">{(["normal", "wide", "large"] as Span[]).map((span) => <button key={span} onClick={() => setSpan(product.id, span)} className={"rounded-md px-2 py-1 text-[10px] font-bold " + (product.grid_span === span ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-300")}>{span}</button>)}</div></div>}</SortableRow>)}</SortableContext></div></section></aside>
      <section className="min-w-0 rounded-2xl border border-white/10 bg-[#07111f] p-4 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-black">Store preview</h2><p className="text-xs text-slate-400">Preview only — no customer actions run here.</p></div><span className="rounded-full bg-white/5 px-3 py-1 text-xs">{viewport}</span></div><div className={"mx-auto overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#06101d] " + previewWidth}><div className="border-b border-white/10 bg-cyan-500/10 px-5 py-4 font-black">BLOXHOP ONLINE STORE</div><div className="space-y-8 p-5">{sections.filter((section) => section.enabled).map((section) => <div key={section.section_key} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{labels[section.section_key]}</p>{section.section_key === "catalog" && <div className={"grid auto-rows-[180px] gap-3 " + previewColumns}>{products.filter((item) => item.is_active).slice(0, 12).map((product) => <div key={product.id} className={"relative overflow-hidden rounded-xl border border-emerald-200/30 bg-[#10343a] p-3 " + (product.grid_span === "wide" && viewport !== "mobile" ? "col-span-2" : "") + (product.grid_span === "large" && viewport === "desktop" ? " col-span-2 row-span-2" : "")}><span className="text-xs font-black">{product.name}</span>{product.image_url && <img src={product.image_url} alt="" className="absolute bottom-2 right-2 h-24 w-24 object-contain opacity-80" />}</div>)}</div>}{section.section_key === "store_info" && <div className="grid gap-3 md:grid-cols-3">{["Secure Flow", "Digital Fulfillment", "Customer Support"].map((item) => <div key={item} className="rounded-xl bg-white/5 p-4 text-sm font-bold">{item}</div>)}</div>}{section.section_key === "faq" && <div className="space-y-2">{["How does delivery work?", "How long does delivery take?", "Where can I ask for help?"].map((item) => <div key={item} className="rounded-xl bg-white/5 px-4 py-3 text-sm font-bold">{item}</div>)}</div>}</div>)}</div></div></section>
    </div></DndContext>}
  </main>;
}