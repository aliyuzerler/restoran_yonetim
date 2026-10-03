"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarCheck,
  Users,
  Phone,
  Clock,
  Calendar,
  MoreVertical,
  Mail,
  StickyNote,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { Reservation, ReservationStatus, Table } from "@/lib/types";
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
import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_ORDER,
  TIME_SLOTS,
} from "@/lib/constants";
import { relativeDay, todayISO, getInitials } from "@/lib/format";
import { toast } from "sonner";

type Filter = "all" | "today" | "pending" | "confirmed" | "upcoming";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "today", label: "Bugün" },
  { key: "pending", label: "Bekleyen" },
  { key: "confirmed", label: "Onaylı" },
  { key: "upcoming", label: "Yaklaşan" },
];

export function ReservationsView() {
  const { current } = useRestaurantStore();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [dialog, setDialog] = useState<{
    open: boolean;
    res: Reservation | null;
  }>({ open: false, res: null });
  const [deleteId, setDeleteId] = useState<Reservation | null>(null);

  const { data: resData, isLoading } = useQuery({
    queryKey: ["reservations", current?.id],
    queryFn: () => api.listReservations(current!.id),
    enabled: !!current,
  });
  const { data: tableData } = useQuery({
    queryKey: ["tables", current?.id],
    queryFn: () => api.listTables(current!.id),
    enabled: !!current,
  });

  const tables = tableData?.tables ?? [];
  const reservations = resData?.reservations ?? [];

  const today = todayISO();
  const filtered = reservations.filter((r) => {
    if (filter === "all") return true;
    if (filter === "today") return r.reservationDate === today;
    if (filter === "pending") return r.status === "pending";
    if (filter === "confirmed") return r.status === "confirmed";
    if (filter === "upcoming") return r.reservationDate >= today && r.status !== "cancelled" && r.status !== "completed";
    return true;
  });

  // Sort: upcoming first by date+time
  filtered.sort((a, b) => {
    const da = a.reservationDate + a.reservationTime;
    const db = b.reservationDate + b.reservationTime;
    return da < db ? -1 : da > db ? 1 : 0;
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      api.updateReservation(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Group by date
  const groups: { date: string; items: Reservation[] }[] = [];
  for (const r of filtered) {
    let g = groups.find((x) => x.date === r.reservationDate);
    if (!g) {
      g = { date: r.reservationDate, items: [] };
      groups.push(g);
    }
    g.items.push(r);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Rezervasyonlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gelen talepleri yönet ve durumlarını güncelle
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, res: null })}>
          <Plus className="w-4 h-4 mr-1" />
          Yeni Rezervasyon
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-thin pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70 tabular-nums">
              {f.key === "all"
                ? reservations.length
                : f.key === "today"
                ? reservations.filter((r) => r.reservationDate === today).length
                : f.key === "pending"
                ? reservations.filter((r) => r.status === "pending").length
                : f.key === "confirmed"
                ? reservations.filter((r) => r.status === "confirmed").length
                : reservations.filter(
                    (r) =>
                      r.reservationDate >= today &&
                      r.status !== "cancelled" &&
                      r.status !== "completed"
                  ).length}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <CalendarCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Rezervasyon bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "all"
                ? "İlk rezervasyonu ekleyerek başla"
                : "Bu filtre için kayıt yok"}
            </p>
            <Button
              className="mt-4"
              onClick={() => setDialog({ open: true, res: null })}
            >
              <Plus className="w-4 h-4 mr-1" />
              Yeni Rezervasyon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {groups.map((g) => (
              <motion.div
                key={g.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-lg">
                    {relativeDay(g.date)}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {g.date}
                  </span>
                  <Badge variant="secondary">{g.items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {g.items.map((r) => (
                    <ReservationRow
                      key={r.id}
                      res={r}
                      tables={tables}
                      onEdit={() => setDialog({ open: true, res: r })}
                      onDelete={() => setDeleteId(r)}
                      onStatus={(s) =>
                        updateStatus.mutate({ id: r.id, status: s })
                      }
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReservationDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog({ open: v, res: dialog.res })}
        res={dialog.res}
        tables={tables}
        restaurantId={current?.id ?? ""}
        onDone={() => setDialog({ open: false, res: null })}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rezervasyonu sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteId?.customerName}</strong> adlı müşterinin{" "}
              {deleteId?.reservationDate} {deleteId?.reservationTime} rezervasyonunu silmek istediğine
              emin misin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return;
                try {
                  await api.deleteReservation(deleteId.id);
                  qc.invalidateQueries({ queryKey: ["reservations"] });
                  qc.invalidateQueries({ queryKey: ["dashboard"] });
                  toast.success("Rezervasyon silindi");
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

function ReservationRow({
  res,
  tables,
  onEdit,
  onDelete,
  onStatus,
}: {
  res: Reservation;
  tables: Table[];
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (s: ReservationStatus) => void;
}) {
  const cfg = RESERVATION_STATUS[res.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Card className="border-border/60 hover:shadow-sm transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Time */}
          <div className="flex flex-col items-center justify-center w-16 shrink-0">
            <span className="text-lg font-bold tabular-nums">{res.reservationTime}</span>
            <Clock className="w-3 h-3 text-muted-foreground mt-0.5" />
          </div>

          <div className="w-px h-10 bg-border/60 hidden sm:block" />

          {/* Customer */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {getInitials(res.customerName)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{res.customerName}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {res.guestCount} kişi
                </span>
                {res.customerPhone && (
                  <span className="hidden sm:flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {res.customerPhone}
                  </span>
                )}
                {res.table && (
                  <span className="hidden md:inline">· Masa {res.table.tableNumber}</span>
                )}
                {res.source === "online" && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    Online
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <Badge
            variant="secondary"
            className="gap-1.5 shrink-0"
            style={{ backgroundColor: `${cfg.color}1a`, color: cfg.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: cfg.color }}
            />
            {cfg.label}
          </Badge>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground shrink-0">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Durumu değiştir
              </p>
              {RESERVATION_STATUS_ORDER.map((s) => {
                const c = RESERVATION_STATUS[s];
                return (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatus(s)}
                    disabled={s === res.status}
                    className="gap-2 cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}
                  </DropdownMenuItem>
                );
              })}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReservationDialog({
  open,
  onOpenChange,
  res,
  tables,
  restaurantId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  res: Reservation | null;
  tables: Table[];
  restaurantId: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [reservationDate, setReservationDate] = useState(todayISO());
  const [reservationTime, setReservationTime] = useState("19:00");
  const [tableId, setTableId] = useState("");
  const [status, setStatus] = useState<ReservationStatus>("pending");
  const [notes, setNotes] = useState("");
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setCustomerName(res?.customerName ?? "");
      setCustomerPhone(res?.customerPhone ?? "");
      setCustomerEmail(res?.customerEmail ?? "");
      setGuestCount(res ? String(res.guestCount) : "2");
      setReservationDate(res?.reservationDate ?? todayISO());
      setReservationTime(res?.reservationTime ?? "19:00");
      setTableId(res?.tableId ?? "");
      setStatus(res?.status ?? "pending");
      setNotes(res?.notes ?? "");
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurantId,
        customerName,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        guestCount: Number(guestCount) || 1,
        reservationDate,
        reservationTime,
        tableId: tableId || null,
        status,
        notes: notes || null,
      };
      if (res) return api.updateReservation(res.id, payload);
      return api.createReservation(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(res ? "Rezervasyon güncellendi" : "Rezervasyon eklendi");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {res ? "Rezervasyonu Düzenle" : "Yeni Rezervasyon"}
          </DialogTitle>
          <DialogDescription>Rezervasyon detaylarını gir</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ayşe Yılmaz"
              />
            </div>
            <div className="space-y-2">
              <Label>Kişi Sayısı</Label>
              <Input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+90 5xx"
              />
            </div>
            <div className="space-y-2">
              <Label>E-posta (opsiyonel)</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ornek@mail.com"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Saat</Label>
              <Select value={reservationTime} onValueChange={setReservationTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Masa (opsiyonel)</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Atanmadı" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      Masa {t.tableNumber} ({t.capacity} kişilik)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ReservationStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESERVATION_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {RESERVATION_STATUS[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Doğum günü, pencere kenarı tercihi..."
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
            disabled={!customerName || !reservationDate || !reservationTime || mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
