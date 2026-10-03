"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  Users,
  MapPin,
  MoreVertical,
  Circle,
  Armchair,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { Table, TableStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TABLE_STATUS } from "@/lib/constants";
import { toast } from "sonner";

// Quick-action statuses (the 4 spec ones: available, occupied, reserved, inactive)
const QUICK_STATUSES: TableStatus[] = [
  "available",
  "occupied",
  "reserved",
  "inactive",
];

export function TablesView() {
  const { current } = useRestaurantStore();
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<{ open: boolean; table: Table | null }>({
    open: false,
    table: null,
  });
  const [deleteId, setDeleteId] = useState<Table | null>(null);
  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["tables", current?.id],
    queryFn: () => api.listTables(current!.id),
    enabled: !!current,
  });

  const tables = data?.tables ?? [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      api.updateTable(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tables"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Counts per status
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of tables) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tables]);

  // Capacity / occupancy summary
  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0);
  const occupiedSeats = tables
    .filter((t) => t.status === "occupied")
    .reduce((s, t) => s + t.capacity, 0);

  // Apply status filter
  const filtered =
    statusFilter === "all"
      ? tables
      : tables.filter((t) => t.status === statusFilter);

  // Group by location
  const locations = Array.from(
    new Set(tables.map((t) => t.location || "Genel"))
  );
  const grouped = locations.map((loc) => ({
    location: loc,
    tables: filtered.filter((t) => (t.location || "Genel") === loc),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Masalar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Masa durumlarını canlı takip et ve yönet
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, table: null })}>
          <Plus className="w-4 h-4 mr-1" />
          Yeni Masa
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {(Object.keys(TABLE_STATUS) as TableStatus[])
          .filter((s) => s !== "cleaning")
          .map((s) => {
            const cfg = TABLE_STATUS[s];
            const count = counts[s] ?? 0;
            const active = statusFilter === s;
            return (
              <motion.button
                key={s}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setStatusFilter((cur) => (cur === s ? "all" : s))
                }
                className={`text-left rounded-xl border p-4 transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card hover:border-border hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cfg.color}1a` }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                  </div>
                  {active && (
                    <span className="text-[10px] font-medium text-primary">
                      filtreli
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold tabular-nums leading-none">
                  {count}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{cfg.label}</p>
              </motion.button>
            );
          })}
      </div>

      {/* Capacity strip */}
      {tables.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Armchair className="w-4 h-4" />
            <span>
              <strong className="text-foreground tabular-nums">
                {tables.length}
              </strong>{" "}
              masa
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              <strong className="text-foreground tabular-nums">
                {totalCapacity}
              </strong>{" "}
              toplam kapasite
            </span>
          </div>
          {occupiedSeats > 0 && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Circle className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>
                  <strong className="text-foreground tabular-nums">
                    {occupiedSeats}
                  </strong>{" "}
                  dolu koltuk
                </span>
              </div>
            </>
          )}
          {statusFilter !== "all" && (
            <>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setStatusFilter("all")}
              >
                Filtreyi temizle
              </Button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-44 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-7 h-7 text-primary/40" />
            </div>
            <p className="font-medium">Henüz masa yok</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Restoranındaki masaları ekleyerek başla. Her masa için numara,
              kapasite ve lokasyon belirleyebilirsin.
            </p>
            <Button
              className="mt-5"
              onClick={() => setDialog({ open: true, table: null })}
            >
              <Plus className="w-4 h-4 mr-1" />
              İlk Masayı Ekle
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-12 text-center">
            <p className="font-medium">Bu filtreye uygun masa yok</p>
            <p className="text-sm text-muted-foreground mt-1">
              {TABLE_STATUS[statusFilter as TableStatus]?.label} durumunda masa
              bulunmuyor.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setStatusFilter("all")}
            >
              Filtreyi temizle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <div key={g.location}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-lg">{g.location}</h2>
                <Badge variant="secondary">{g.tables.length}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {g.tables.map((t) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      onEdit={() => setDialog({ open: true, table: t })}
                      onDelete={() => setDeleteId(t)}
                      onStatus={(s) =>
                        updateStatus.mutate({ id: t.id, status: s })
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <TableDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog({ open: v, table: dialog.table })}
        table={dialog.table}
        restaurantId={current?.id ?? ""}
        onDone={() => setDialog({ open: false, table: null })}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masayı sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Masa {deleteId?.tableNumber}</strong> masasını silmek
              istediğine emin misin? Bu masaya atanmış rezervasyonlardaki masa
              referansı kaldırılacak (rezervasyon silinmez).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return;
                try {
                  await api.deleteTable(deleteId.id);
                  qc.invalidateQueries({ queryKey: ["tables"] });
                  qc.invalidateQueries({ queryKey: ["dashboard"] });
                  toast.success("Masa silindi");
                } catch (e) {
                  toast.error((e as Error).message);
                }
                setDeleteId(null);
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
// Table card — modern, prominent, matches spec (Masa N / X kişi / Status)
// ---------------------------------------------------------------------------

function TableCard({
  table,
  onEdit,
  onDelete,
  onStatus,
}: {
  table: Table;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (s: TableStatus) => void;
}) {
  const cfg = TABLE_STATUS[table.status];
  const isInactive = table.status === "inactive";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
    >
      <Card
        className="border-border/60 overflow-hidden relative group"
        style={{ borderTop: `4px solid ${cfg.color}` }}
      >
        {/* subtle status glow at top */}
        <div
          className="absolute top-0 left-0 right-0 h-20 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${cfg.color}, transparent 70%)`,
          }}
        />

        <CardContent className="p-4 relative">
          {/* Top row: table number + menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cfg.color}15` }}
              >
                <Armchair
                  className="w-5 h-5"
                  style={{ color: cfg.color }}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  Masa {table.tableNumber}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" />
                  {table.capacity} kişi
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={onEdit}
                  className="gap-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status badge — prominent */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3"
            style={{ backgroundColor: `${cfg.color}12` }}
          >
            <span
              className="relative flex w-2.5 h-2.5"
              title={cfg.label}
            >
              {!isInactive && table.status !== "cleaning" && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-60"
                  style={{ backgroundColor: cfg.color }}
                />
              )}
              <span
                className="relative w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Notes */}
          {table.notes && (
            <p className="text-[11px] text-muted-foreground italic line-clamp-2 mb-3 px-1">
              "{table.notes}"
            </p>
          )}

          {/* Quick status toggle */}
          <div className="pt-3 border-t border-border/60">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Durumu değiştir
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_STATUSES.map((s) => {
                const sc = TABLE_STATUS[s];
                const active = table.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatus(s)}
                    title={sc.label}
                    className={`flex flex-col items-center gap-1 py-2 min-h-[44px] rounded-md transition-all ${
                      active
                        ? "bg-muted"
                        : "hover:bg-muted/60 opacity-60 hover:opacity-100"
                    }`}
                    style={
                      active
                        ? { backgroundColor: `${sc.color}18` }
                        : undefined
                    }
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-transform ${
                        active ? "scale-125" : ""
                      }`}
                      style={{ backgroundColor: sc.color }}
                    />
                    <span
                      className={`text-[9px] font-medium leading-none ${
                        active ? "" : "text-muted-foreground"
                      }`}
                      style={active ? { color: sc.color } : undefined}
                    >
                      {sc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Table create/edit dialog
// ---------------------------------------------------------------------------

function TableDialog({
  open,
  onOpenChange,
  table,
  restaurantId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  table: Table | null;
  restaurantId: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<TableStatus>("available");
  const [notes, setNotes] = useState("");
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setTableNumber(table?.tableNumber ?? "");
      setCapacity(table ? String(table.capacity) : "4");
      setLocation(table?.location ?? "");
      setStatus(table?.status ?? "available");
      setNotes(table?.notes ?? "");
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurantId,
        tableNumber,
        capacity: Number(capacity) || 1,
        location: location || null,
        status,
        notes: notes || null,
      };
      if (table) return api.updateTable(table.id, payload);
      return api.createTable(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tables"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(table ? "Masa güncellendi" : "Masa eklendi");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Suggested next table number
  const suggestion = table ? null : "Sonraki uygun numara otomatik önerilir";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Armchair className="w-5 h-5 text-primary" />
            {table ? "Masayı Düzenle" : "Yeni Masa"}
          </DialogTitle>
          <DialogDescription>Masa detaylarını gir</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Masa Numarası</Label>
              <Input
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="1"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Kapasite</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          {suggestion && (
            <p className="text-[11px] text-muted-foreground -mt-2">{suggestion}</p>
          )}
          <div className="space-y-2">
            <Label>Lokasyon</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="İç Salon, Teras, Bahçe..."
            />
          </div>
          <div className="space-y-2">
            <Label>Durum</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TableStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TABLE_STATUS) as TableStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: TABLE_STATUS[s].color }}
                      />
                      {TABLE_STATUS[s].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notlar (opsiyonel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pencere kenarı, sessiz köşe, manzaralı..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            İptal
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!tableNumber || mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
