"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Tag,
  GripVertical,
  Star,
  Search,
  Leaf,
  ImageIcon,
  Upload,
  X,
  ImageUp,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { Category, MenuItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function MenuView() {
  const { current } = useRestaurantStore();
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [itemDialog, setItemDialog] = useState<{
    open: boolean;
    item: MenuItem | null;
  }>({ open: false, item: null });
  const [catDialog, setCatDialog] = useState<{
    open: boolean;
    cat: Category | null;
  }>({ open: false, cat: null });
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "item"; id: string; name: string }
    | { type: "category"; id: string; name: string }
    | null
  >(null);

  const qc = useQueryClient();

  const { data: catData } = useQuery({
    queryKey: ["categories", current?.id],
    queryFn: () => api.listCategories(current!.id),
    enabled: !!current,
  });
  const { data: itemData } = useQuery({
    queryKey: ["menu-items", current?.id],
    queryFn: () => api.listMenuItems(current!.id),
    enabled: !!current,
  });

  const categories = catData?.categories ?? [];
  const items = itemData?.items ?? [];

  // Reorder mutation (drag/drop)
  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      api.reorderCategories(current!.id, orderedIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.error("Sıralama kaydedilemedi");
    },
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      api.updateMenuItem(id, { isAvailable: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      api.updateMenuItem(id, { isFeatured: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const filtered = items.filter((it) => {
    const catMatch = selectedCat === "all" || it.categoryId === selectedCat;
    const sMatch =
      !search ||
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      (it.description ?? "").toLowerCase().includes(search.toLowerCase());
    return catMatch && sMatch;
  });

  const grouped =
    selectedCat === "all"
      ? [
          ...categories.map((c) => ({
            category: c,
            items: filtered.filter((it) => it.categoryId === c.id),
          })),
          ...(() => {
            const uncategorized = filtered.filter(
              (it) => !it.categoryId || !categories.find((c) => c.id === it.categoryId)
            );
            return uncategorized.length > 0
              ? [
                  {
                    category: {
                      id: "__none__",
                      name: "Diğer",
                      description: null,
                      sortOrder: 999,
                      isActive: true,
                      restaurantId: current?.id ?? "",
                    } as Category,
                    items: uncategorized,
                  },
                ]
              : [];
          })(),
        ]
      : [{ category: categories.find((c) => c.id === selectedCat)!, items: filtered }];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = categories.findIndex((c) => c.id === active.id);
    const newIdx = categories.findIndex((c) => c.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(categories, oldIdx, newIdx);
    reorderMutation.mutate(reordered.map((c) => c.id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Menü</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kategorileri ve ürünleri yönet · Sürükleyerek sırala
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatDialog({ open: true, cat: null })}>
            <Tag className="w-4 h-4 mr-1" />
            Kategori
          </Button>
          <Button onClick={() => setItemDialog({ open: true, item: null })}>
            <Plus className="w-4 h-4 mr-1" />
            Ürün Ekle
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-5">
        {/* Categories sidebar — drag/drop sortable */}
        <div>
          <Card className="border-border/60 sticky top-20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kategoriler
                </p>
                <span className="text-[10px] text-muted-foreground/60">sürükle</span>
              </div>
              {/* "Tümü" is NOT sortable */}
              <CategoryButton
                active={selectedCat === "all"}
                onClick={() => setSelectedCat("all")}
                label="Tümü"
                count={items.length}
              />
              {categories.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-0.5 mt-0.5">
                      {categories.map((c) => (
                        <SortableCategoryButton
                          key={c.id}
                          category={c}
                          active={selectedCat === c.id}
                          onClick={() => setSelectedCat(c.id)}
                          count={items.filter((it) => it.categoryId === c.id).length}
                          onEdit={() => setCatDialog({ open: true, cat: c })}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <p className="text-xs text-muted-foreground px-2 py-3">
                  Henüz kategori yok
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        <div className="min-w-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ürün ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <Card className="border-dashed border-border/60">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-7 h-7 text-primary/40" />
                </div>
                <p className="font-medium">Henüz ürün yok</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  İlk ürünü ekleyerek menünü oluştur. İsim, açıklama, fiyat,
                  kategori, fotoğraf ve aktif/pasif ayarlarını belirle.
                </p>
                <Button
                  className="mt-5"
                  onClick={() => setItemDialog({ open: true, item: null })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ürün Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {grouped.map((g) =>
                g.category && g.items.length > 0 ? (
                  <div key={g.category.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="font-semibold text-lg">
                        {g.category.name}
                      </h2>
                      <Badge variant="secondary">{g.items.length}</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      <AnimatePresence>
                        {g.items.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <ItemCard
                              item={item}
                              currency={current?.currency ?? "₺"}
                              onEdit={() => setItemDialog({ open: true, item })}
                              onDelete={() =>
                                setDeleteTarget({
                                  type: "item",
                                  id: item.id,
                                  name: item.name,
                                })
                              }
                              onToggleAvailable={(v) =>
                                toggleAvailable.mutate({ id: item.id, value: v })
                              }
                              onToggleFeatured={(v) =>
                                toggleFeatured.mutate({ id: item.id, value: v })
                              }
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>

      <ItemDialog
        open={itemDialog.open}
        onOpenChange={(open) => setItemDialog({ open, item: itemDialog.item })}
        item={itemDialog.item}
        categories={categories}
        restaurantId={current?.id ?? ""}
        onDone={() => setItemDialog({ open: false, item: null })}
      />

      <CategoryDialog
        open={catDialog.open}
        onOpenChange={(open) => setCatDialog({ open, cat: catDialog.cat })}
        category={catDialog.cat}
        restaurantId={current?.id ?? ""}
        onDone={() => setCatDialog({ open: false, cat: null })}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silme onayı</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> adlı{" "}
              {deleteTarget?.type === "item" ? "ürünü" : "kategoriyi"} silmek
              istediğine emin misin? Bu işlem geri alınamaz.
              {deleteTarget?.type === "category" &&
                " Kategoriye ait ürünler kategorisiz kalacak."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return;
                try {
                  if (deleteTarget.type === "item") {
                    await api.deleteMenuItem(deleteTarget.id);
                    qc.invalidateQueries({ queryKey: ["menu-items"] });
                  } else {
                    await api.deleteCategory(deleteTarget.id);
                    qc.invalidateQueries({ queryKey: ["categories"] });
                    qc.invalidateQueries({ queryKey: ["menu-items"] });
                    if (selectedCat === deleteTarget.id) setSelectedCat("all");
                  }
                  toast.success("Silindi");
                } catch (e) {
                  toast.error((e as Error).message);
                }
                setDeleteTarget(null);
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable category button (drag handle)
// ---------------------------------------------------------------------------

function SortableCategoryButton({
  category,
  active,
  onClick,
  count,
  onEdit,
}: {
  category: Category;
  active: boolean;
  onClick: () => void;
  count: number;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : isDragging
          ? "bg-muted shadow-lg ring-2 ring-primary/30"
          : "hover:bg-muted text-foreground"
      }`}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 truncate min-w-0">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className={`shrink-0 cursor-grab active:cursor-grabbing touch-none ${
            active ? "text-primary-foreground/70" : "text-muted-foreground/60 hover:text-foreground"
          }`}
          aria-label="Sürükle"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <span className="truncate">{category.name}</span>
      </span>
      <span className="flex items-center gap-1 shrink-0">
        <span
          className={`text-[10px] tabular-nums ${
            active ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {count}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity"
          aria-label="Düzenle"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </span>
    </div>
  );
}

// Non-sortable category button (for "Tümü")
function CategoryButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors ${
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
      }`}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 truncate">
        <GripVertical className="w-3.5 h-3.5 opacity-20 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span
        className={`text-[10px] tabular-nums ${
          active ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item card — shows photo, name, desc, price, category, aktif/pasif
// ---------------------------------------------------------------------------

function ItemCard({
  item,
  currency,
  onEdit,
  onDelete,
  onToggleAvailable,
  onToggleFeatured,
}: {
  item: MenuItem;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailable: (v: boolean) => void;
  onToggleFeatured: (v: boolean) => void;
}) {
  const tags = item.tags
    ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return (
    <Card
      className={`group border-border/60 hover:shadow-md transition-all overflow-hidden ${
        !item.isAvailable ? "opacity-60" : ""
      }`}
    >
      {/* Photo */}
      {item.imageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-muted relative">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!item.isAvailable && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-medium">
              Tükendi
            </div>
          )}
          {item.isFeatured && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
            </div>
          )}
        </div>
      ) : null}
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {!item.imageUrl && (
            <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-primary/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5">
              <h3 className="font-semibold leading-tight line-clamp-2 flex-1 min-w-0">
                {item.name}
              </h3>
              {item.isFeatured && !item.imageUrl && (
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {item.description}
              </p>
            )}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <span className="font-bold text-primary">
                {formatPrice(item.price, currency)}
              </span>
              {item.category && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                  {item.category.name}
                </Badge>
              )}
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="text-[10px] gap-0.5 py-0 px-1.5"
                >
                  <Leaf className="w-2.5 h-2.5" />
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFeatured(!item.isFeatured)}
              className={`p-1.5 rounded-md transition-colors ${
                item.isFeatured
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title={item.isFeatured ? "Öne çıkan" : "Öne çıkar"}
            >
              <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Düzenle"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Aktif/Pasif toggle */}
          <div className="flex items-center gap-2">
            {item.isAvailable ? (
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className="text-[11px] font-medium">
              {item.isAvailable ? "Aktif" : "Pasif"}
            </span>
            <Switch
              checked={item.isAvailable}
              onCheckedChange={onToggleAvailable}
              aria-label="Aktif/Pasif"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Item create/edit dialog — with photo upload (base64)
// ---------------------------------------------------------------------------

function ItemDialog({
  open,
  onOpenChange,
  item,
  categories,
  restaurantId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: MenuItem | null;
  categories: Category[];
  restaurantId: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(item?.name ?? "");
      setDescription(item?.description ?? "");
      setPrice(item ? String(item.price) : "");
      setCategoryId(item?.categoryId ?? "");
      setImageUrl(item?.imageUrl ?? null);
      setTags(item?.tags ?? "");
      setIsAvailable(item?.isAvailable ?? true);
      setIsFeatured(item?.isFeatured ?? false);
    }
  }

  // Handle file upload — convert to base64 data URL (no Supabase Storage)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seç");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Görsel 2MB'den küçük olmalı");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error("Görsel yüklenemedi");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurantId,
        name,
        description: description || undefined,
        price: Number(price) || 0,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
        tags: tags || null,
        isAvailable,
        isFeatured,
      };
      if (item) return api.updateMenuItem(item.id, payload);
      return api.createMenuItem(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success(item ? "Ürün güncellendi" : "Ürün eklendi");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            {item ? "Ürünü Düzenle" : "Yeni Ürün"}
          </DialogTitle>
          <DialogDescription>
            İsim, açıklama, fiyat, kategori, fotoğraf ve aktiflik ayarları
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          {/* Photo upload */}
          <div className="space-y-2">
            <Label>Fotoğraf</Label>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border/60 aspect-[16/9] group">
                <img src={imageUrl} alt="Ürün" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Fotoğrafı kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs hover:bg-black/80 transition-colors"
                >
                  <ImageUp className="w-3 h-3" />
                  Değiştir
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors py-6 flex flex-col items-center gap-2 text-muted-foreground"
              >
                {uploading ? (
                  <>
                    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-xs">Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Fotoğraf yükle
                      </p>
                      <p className="text-[11px] mt-0.5">
                        PNG, JPG · max 2MB
                      </p>
                    </div>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label>İsim</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Karışık Kızartma"
            />
          </div>
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Taze sebzeler ve özel sosumuzla..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fiyat</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="180"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seç..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Etiketler (virgülle ayır)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vegan, acılı, glutensiz"
            />
          </div>
          {/* Aktif/Pasif */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <Eye className="w-4 h-4 text-emerald-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Müşterilere gösterilsin mi
                </p>
              </div>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-medium">Öne çıkar</p>
                <p className="text-xs text-muted-foreground">
                  Public sayfada vurgula
                </p>
              </div>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            İptal
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!name || !price || mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Category create/edit dialog
// ---------------------------------------------------------------------------

function CategoryDialog({
  open,
  onOpenChange,
  category,
  restaurantId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  restaurantId: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (category) {
        return api.updateCategory(category.id, { name, description });
      }
      return api.createCategory({ restaurantId, name, description });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(category ? "Kategori güncellendi" : "Kategori eklendi");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            {category ? "Kategoriyi Düzenle" : "Yeni Kategori"}
          </DialogTitle>
          <DialogDescription>Menü kategorisi oluştur</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Kategori Adı</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ana Yemekler"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Açıklama (opsiyonel)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şefin önerileri"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            İptal
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!name || mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
