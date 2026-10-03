"use client";

import { useState } from "react";
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

export function TablesView() {
  const { current } = useRestaurantStore();
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<{ open: boolean; table: Table | null }>(
    { open: false, table: null }
  );
  const [deleteId, setDeleteId] = useState<Table | null>(null);

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

  // Group by location
  const locations = Array.from(
    new Set(tables.map((t) => t.location || "Genel"))
  );
  const grouped = locations.map((loc) => ({
    location: loc,
    tables: tables.filter((t) => (t.location || "Genel") === loc),
  }));

  const counts = tables.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Masalar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Masa durumlarını canlı takip et
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, table: null })}>
          <Plus className="w-4 h-4 mr-1" />
          Masa Ekle
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.keys(TABLE_STATUS) as TableStatus[]).map((s) => {
          const cfg = TABLE_STATUS[s];
          const count = counts[s] ?? 0;
          return (
            <Card key={s} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}1a` }}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums leading-none">
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cfg.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Henüz masa yok</p>
            <p className="text-sm text-muted-foreground mt-1">
              Masalarını ekleyerek başla
            </p>
            <Button
              className="mt-4"
              onClick={() => setDialog({ open: true, table: null })}
            >
              <Plus className="w-4 h-4 mr-1" />
              Masa Ekle
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <AnimatePresence>
                  {g.tables.map((t) => {
                    const cfg = TABLE_STATUS[t.status];
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card
                          className="border-border/60 hover:shadow-md transition-shadow overflow-hidden"
                          style={{
                            borderTop: `3px solid ${cfg.color}`,
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{t.name}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Users className="w-3 h-3" />
                                  {t.capacity} kişilik
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setDialog({ open: true, table: t })
                                    }
                                    className="gap-2 cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Düzenle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteId(t)}
                                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Sil
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {t.notes && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                                "{t.notes}"
                              </p>
                            )}

                            <div className="mt-3 pt-3 border-t border-border/60">
                              <Select
                                value={t.status}
                                onValueChange={(v) =>
                                  updateStatus.mutate({
                                    id: t.id,
                                    status: v as TableStatus,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(TABLE_STATUS) as TableStatus[]).map(
                                    (s) => (
                                      <SelectItem key={s} value={s}>
                                        <span className="flex items-center gap-2">
                                          <span
                                            className={`w-2 h-2 rounded-full ${TABLE_STATUS[s].dot}`}
                                          />
                                          {TABLE_STATUS[s].label}
                                        </span>
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
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
              <strong>{deleteId?.name}</strong> masasını silmek istediğine emin
              misin?
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
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<TableStatus>("available");
  const [notes, setNotes] = useState("");
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(table?.name ?? "");
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
        name,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{table ? "Masayı Düzenle" : "Yeni Masa"}</DialogTitle>
          <DialogDescription>Masa detaylarını gir</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Masa Adı</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masa 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Kapasite</Label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
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
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TableStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TABLE_STATUS) as TableStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {TABLE_STATUS[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pencere kenarı, sessiz köşe..."
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
            disabled={!name || mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
