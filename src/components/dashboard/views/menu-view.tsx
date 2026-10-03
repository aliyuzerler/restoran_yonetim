"use client";

import { useState } from "react";
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
} from "lucide-react";
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

  const filtered = items.filter((it) => {
    const catMatch =
      selectedCat === "all" || it.categoryId === selectedCat;
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
                      restaurantId: current?.id ?? "",
                    } as Category,
                    items: uncategorized,
                  },
                ]
              : [];
          })(),
        ]
      : [{ category: categories.find((c) => c.id === selectedCat)!, items: filtered }];

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Menü</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kategorileri ve ürünleri yönet
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

      <div className="grid lg:grid-cols-[220px_1fr] gap-5">
        {/* Categories sidebar */}
        <div>
          <Card className="border-border/60 sticky top-20">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                Kategoriler
              </p>
              <div className="space-y-0.5">
                <CategoryButton
                  active={selectedCat === "all"}
                  onClick={() => setSelectedCat("all")}
                  label="Tümü"
                  count={items.length}
                />
                {categories.map((c) => (
                  <CategoryButton
                    key={c.id}
                    active={selectedCat === c.id}
                    onClick={() => setSelectedCat(c.id)}
                    label={c.name}
                    count={
                      items.filter((it) => it.categoryId === c.id).length
                    }
                    onEdit={() => setCatDialog({ open: true, cat: c })}
                  />
                ))}
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-3">
                    Henüz kategori yok
                  </p>
                )}
              </div>
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
                <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-medium">Henüz ürün yok</p>
                <p className="text-sm text-muted-foreground mt-1">
                  İlk ürünü ekleyerek menünü oluşturmaya başla
                </p>
                <Button
                  className="mt-4"
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
                              onEdit={() =>
                                setItemDialog({ open: true, item })
                              }
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
        onOpenChange={(open) =>
          setItemDialog({ open, item: itemDialog.item })
        }
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
                    if (selectedCat === deleteTarget.id)
                      setSelectedCat("all");
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

function CategoryButton({
  active,
  onClick,
  label,
  count,
  onEdit,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  onEdit?: () => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-foreground"
      }`}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 truncate">
        <GripVertical className="w-3.5 h-3.5 opacity-40 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className="flex items-center gap-1 shrink-0">
        <span
          className={`text-[10px] tabular-nums ${
            active ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {count}
        </span>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </span>
    </div>
  );
}

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
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5">
              <h3 className="font-semibold leading-tight line-clamp-2 flex-1 min-w-0">
                {item.name}
              </h3>
              {item.isFeatured && (
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-bold text-primary">
                {formatPrice(item.price, currency)}
              </span>
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {item.isAvailable ? "Müsait" : "Tükendi"}
            </span>
            <Switch
              checked={item.isAvailable}
              onCheckedChange={onToggleAvailable}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Sync when opening
  useState(() => {});
  // use effect substitute
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(item?.name ?? "");
      setDescription(item?.description ?? "");
      setPrice(item ? String(item.price) : "");
      setCategoryId(item?.categoryId ?? "");
      setTags(item?.tags ?? "");
      setIsAvailable(item?.isAvailable ?? true);
      setIsFeatured(item?.isFeatured ?? false);
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurantId,
        name,
        description: description || undefined,
        price: Number(price) || 0,
        categoryId: categoryId || null,
        tags: tags || null,
        isAvailable,
        isFeatured,
      };
      if (item) {
        return api.updateMenuItem(item.id, payload);
      }
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
          <DialogTitle>{item ? "Ürünü Düzenle" : "Yeni Ürün"}</DialogTitle>
          <DialogDescription>
            Menüdeki bir ürünün detaylarını gir
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          <div className="space-y-2">
            <Label>Ürün Adı</Label>
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
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <p className="text-sm font-medium">Müsait</p>
              <p className="text-xs text-muted-foreground">
                Müşterilere gösterilsin mi
              </p>
            </div>
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <p className="text-sm font-medium">Öne çıkar</p>
              <p className="text-xs text-muted-foreground">
                Public sayfada vurgula
              </p>
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
          <DialogTitle>
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
