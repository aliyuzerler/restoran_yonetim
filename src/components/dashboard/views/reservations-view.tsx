"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarCheck,
  Users,
  Phone,
  Calendar,
  MoreVertical,
  CalendarRange,
  Filter,
  CheckCircle2,
  X as XIcon,
  Clock,
  LayoutGrid,
  Radio,
  Bell,
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
  Table as UITable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
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
  RESERVATION_STATUS_SPEC,
  TIME_SLOTS,
} from "@/lib/constants";
import { relativeDay, todayISO, getInitials, formatShortDate } from "@/lib/format";
import { toast } from "sonner";

// Date filter options per spec: Bugün, Yarın, Bu hafta, Tarih seç
type DateFilter = "today" | "tomorrow" | "this_week" | "pick" | "all";

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "today", label: "Bugün" },
  { key: "tomorrow", label: "Yarın" },
  { key: "this_week", label: "Bu hafta" },
  { key: "pick", label: "Tarih seç" },
  { key: "all", label: "Tümü" },
];

export function ReservationsView() {
  const { current } = useRestaurantStore();
  const qc = useQueryClient();
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [pickedDate, setPickedDate] = useState<string>(todayISO());
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all"
  );
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{
    open: boolean;
    res: Reservation | null;
  }>({ open: false, res: null });
  const [deleteId, setDeleteId] = useState<Reservation | null>(null);

  const { data: resData, isLoading } = useQuery({
    queryKey: ["reservations", current?.id],
    queryFn: () => api.listReservations(current!.id),
    enabled: !!current,
    // Real-time polling — checks for new reservations every 10 seconds
    // (Supabase Realtime equivalent; auto-refreshes the dashboard)
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const { data: tableData } = useQuery({
    queryKey: ["tables", current?.id],
    queryFn: () => api.listTables(current!.id),
    enabled: !!current,
  });

  const tables = tableData?.tables ?? [];
  const reservations = resData?.reservations ?? [];

  // Real-time: detect new online reservations and notify
  const prevOnlineCountRef = useRef<number | null>(null);
  const onlineReservations = reservations.filter((r) => r.source === "online");
  const newOnlineCount = onlineReservations.length;

  useEffect(() => {
    if (prevOnlineCountRef.current === null) {
      // First load — just store the count, don't notify
      prevOnlineCountRef.current = newOnlineCount;
      return;
    }
    if (newOnlineCount > prevOnlineCountRef.current) {
      const diff = newOnlineCount - prevOnlineCountRef.current;
      const latest = onlineReservations
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, diff);
      if (latest.length > 0) {
        const name = latest[0].customerName;
        toast.success("🛎️ Yeni online rezervasyon!", {
          description: `${name} — ${latest[0].guestCount} kişi · ${latest[0].reservationDate} ${latest[0].reservationTime}`,
          duration: 6000,
        });
      }
    }
    prevOnlineCountRef.current = newOnlineCount;
  }, [newOnlineCount, onlineReservations]);

  const today = todayISO();
  const tomorrow = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  // Compute "this week" range (Monday → Sunday of current week)
  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const mondayOffset = (day + 6) % 7; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    };
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        // Date filter
        if (dateFilter === "today" && r.reservationDate !== today) return false;
        if (dateFilter === "tomorrow" && r.reservationDate !== tomorrow)
          return false;
        if (
          dateFilter === "this_week" &&
          (r.reservationDate < weekRange.start ||
            r.reservationDate > weekRange.end)
        )
          return false;
        if (dateFilter === "pick" && r.reservationDate !== pickedDate)
          return false;
        // Status filter
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        // Search filter (customer name / phone)
        if (search) {
          const q = search.toLowerCase();
          const matches =
            r.customerName.toLowerCase().includes(q) ||
            (r.customerPhone ?? "").toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort: upcoming first (date asc, then time asc), past at bottom
        const da = a.reservationDate + a.reservationTime;
        const db = b.reservationDate + b.reservationTime;
        return da < db ? -1 : da > db ? 1 : 0;
      });
  }, [
    reservations,
    dateFilter,
    pickedDate,
    statusFilter,
    search,
    today,
    tomorrow,
    weekRange,
  ]);

  // Counts per date filter (for the tab badges)
  const countFor = (key: DateFilter) => {
    return reservations.filter((r) => {
      if (key === "today") return r.reservationDate === today;
      if (key === "tomorrow") return r.reservationDate === tomorrow;
      if (key === "this_week")
        return (
          r.reservationDate >= weekRange.start && r.reservationDate <= weekRange.end
        );
      if (key === "pick") return r.reservationDate === pickedDate;
      return true;
    }).length;
  };

  // Status counts (for the status filter dropdown)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reservations) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return counts;
  }, [reservations]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      api.updateReservation(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Rezervasyonlar
            </h1>
            {/* Live indicator — real-time polling active */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              Canlı
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gelen talepleri yönet, durumlarını güncelle · 10 sn'de bir otomatik
            yenilenir
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, res: null })}>
          <Plus className="w-4 h-4 mr-1" />
          Yeni Rezervasyon
        </Button>
      </div>

      {/* Date filter tabs (spec: Bugün, Yarın, Bu hafta, Tarih seç) */}
      <div className="flex flex-wrap items-center gap-2 mb-4 max-w-full">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin max-w-full pb-1">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                dateFilter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {f.key === "this_week" && <CalendarRange className="w-3.5 h-3.5" />}
              {f.key === "pick" && <Calendar className="w-3.5 h-3.5" />}
              {f.label}
              <span className="opacity-70 tabular-nums">{countFor(f.key)}</span>
            </button>
          ))}
        </div>

        {/* Date picker (shown when "Tarih seç" is active) */}
        {dateFilter === "pick" && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            className="flex items-center gap-1.5"
          >
            <Input
              type="date"
              value={pickedDate}
              onChange={(e) => setPickedDate(e.target.value)}
              className="w-44 h-9"
            />
          </motion.div>
        )}
      </div>

      {/* Status filter + search row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Filter className="w-3.5 h-3.5" />
              Durum:
              {statusFilter === "all" ? (
                <span className="text-muted-foreground">Tümü</span>
              ) : (
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: RESERVATION_STATUS[statusFilter].color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: RESERVATION_STATUS[statusFilter].color,
                    }}
                  />
                  {RESERVATION_STATUS[statusFilter].label}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Duruma göre filtrele</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setStatusFilter("all")}
              className="gap-2 cursor-pointer justify-between"
            >
              Tümü
              <span className="text-xs text-muted-foreground tabular-nums">
                {reservations.length}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {RESERVATION_STATUS_ORDER.map((s) => {
              const cfg = RESERVATION_STATUS[s];
              return (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="gap-2 cursor-pointer justify-between"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {statusCounts[s] ?? 0}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {statusFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={() => setStatusFilter("all")}
          >
            <XIcon className="w-3.5 h-3.5 mr-1" />
            Durum filtresini temizle
          </Button>
        )}

        <div className="flex-1" />

        {/* Search */}
        <Input
          placeholder="Müşteri veya telefon ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs h-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <CalendarCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Rezervasyon bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {reservations.length === 0
                ? "Henüz hiç rezervasyon yok. İlk rezervasyonu ekleyerek başla."
                : "Bu filtre için kayıt yok. Filtreleri değiştir veya temizle."}
            </p>
            {reservations.length === 0 ? (
              <Button
                className="mt-4"
                onClick={() => setDialog({ open: true, res: null })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Yeni Rezervasyon
              </Button>
            ) : (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setDateFilter("all");
                  setStatusFilter("all");
                  setSearch("");
                }}
              >
                Filtreleri temizle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results count */}
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            rezervasyon gösteriliyor
          </p>

          {/* Desktop table view */}
          <div className="hidden lg:block">
            <Card className="border-border/60 overflow-hidden">
              <UITable>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-4">Müşteri</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Saat</TableHead>
                    <TableHead>Kişi</TableHead>
                    <TableHead>Masa</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filtered.map((r) => (
                      <ReservationTableRow
                        key={r.id}
                        res={r}
                        onEdit={() => setDialog({ open: true, res: r })}
                        onDelete={() => setDeleteId(r)}
                        onStatus={(s) =>
                          updateStatus.mutate({ id: r.id, status: s })
                        }
                      />
                    ))}
                  </AnimatePresence>
                </TableBody>
              </UITable>
            </Card>
          </div>

          {/* Mobile/tablet card view */}
          <div className="lg:hidden space-y-2">
            <AnimatePresence initial={false}>
              {filtered.map((r) => (
                <ReservationMobileCard
                  key={r.id}
                  res={r}
                  onEdit={() => setDialog({ open: true, res: r })}
                  onDelete={() => setDeleteId(r)}
                  onStatus={(s) =>
                    updateStatus.mutate({ id: r.id, status: s })
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        </>
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
              {deleteId?.reservationDate} {deleteId?.reservationTime}{" "}
              rezervasyonunu silmek istediğine emin misin?
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

// ---------------------------------------------------------------------------
// Desktop table row
// ---------------------------------------------------------------------------

function ReservationTableRow({
  res,
  onEdit,
  onDelete,
  onStatus,
}: {
  res: Reservation;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (s: ReservationStatus) => void;
}) {
  const cfg = RESERVATION_STATUS[res.status];
  const isToday = res.reservationDate === todayISO();
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group"
    >
      {/* Müşteri */}
      <TableCell className="pl-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
            {getInitials(res.customerName)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{res.customerName}</p>
            {res.source === "online" && (
              <span className="text-[10px] text-primary">Online talep</span>
            )}
            {res.notes && (
              <p className="text-[10px] text-muted-foreground truncate italic max-w-[180px]">
                {res.notes}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Telefon */}
      <TableCell className="py-3">
        {res.customerPhone ? (
          <span className="text-sm tabular-nums">{res.customerPhone}</span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </TableCell>

      {/* Tarih */}
      <TableCell className="py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isToday ? "Bugün" : formatShortDate(res.reservationDate)}
          </span>
          {!isToday && (
            <span className="text-[10px] text-muted-foreground">
              {relativeDay(res.reservationDate)}
            </span>
          )}
        </div>
      </TableCell>

      {/* Saat */}
      <TableCell className="py-3">
        <span className="text-sm font-semibold tabular-nums">
          {res.reservationTime}
        </span>
      </TableCell>

      {/* Kişi */}
      <TableCell className="py-3">
        <span className="inline-flex items-center gap-1 text-sm tabular-nums">
          <Users className="w-3 h-3 text-muted-foreground" />
          {res.guestCount}
        </span>
      </TableCell>

      {/* Masa */}
      <TableCell className="py-3">
        {res.table ? (
          <Badge variant="outline" className="gap-1 font-normal">
            <LayoutGrid className="w-3 h-3" />
            Masa {res.table.tableNumber}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground/50">Atanmadı</span>
        )}
      </TableCell>

      {/* Durum */}
      <TableCell className="py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:scale-105"
              style={{ backgroundColor: `${cfg.color}1a`, color: cfg.color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Durumu değiştir
            </p>
            {RESERVATION_STATUS_SPEC.map((s) => {
              const c = RESERVATION_STATUS[s];
              return (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onStatus(s)}
                  disabled={s === res.status}
                  className="gap-2 cursor-pointer justify-between"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}
                  </span>
                  {s === res.status && (
                    <CheckCircle2 className="w-3 h-3 opacity-60" />
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Diğer
            </p>
            {(["seated", "no_show"] as ReservationStatus[])
              .filter((s) => s !== res.status)
              .map((s) => {
                const c = RESERVATION_STATUS[s];
                return (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatus(s)}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* İşlem */}
      <TableCell className="pr-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
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
      </TableCell>
    </motion.tr>
  );
}

// ---------------------------------------------------------------------------
// Mobile card view
// ---------------------------------------------------------------------------

function ReservationMobileCard({
  res,
  onEdit,
  onDelete,
  onStatus,
}: {
  res: Reservation;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (s: ReservationStatus) => void;
}) {
  const cfg = RESERVATION_STATUS[res.status];
  const isToday = res.reservationDate === todayISO();
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card className="border-border/60">
        <CardContent className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex flex-col items-center justify-center w-12 shrink-0 py-1.5 rounded-lg bg-primary/5">
                <span className="text-sm font-bold tabular-nums text-primary">
                  {res.reservationTime}
                </span>
                <Clock className="w-2.5 h-2.5 text-muted-foreground mt-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{res.customerName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isToday ? "Bugün" : formatShortDate(res.reservationDate)}
                  {" · "}
                  <Users className="w-2.5 h-2.5 inline" /> {res.guestCount}
                  {res.table && ` · Masa ${res.table.tableNumber}`}
                  {res.customerPhone && ` · ${res.customerPhone}`}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium shrink-0"
                  style={{ backgroundColor: `${cfg.color}1a`, color: cfg.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Durumu değiştir
                </p>
                {RESERVATION_STATUS_SPEC.map((s) => {
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
                <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                  Düzenle
                </DropdownMenuItem>
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
          {res.notes && (
            <p className="text-[11px] text-muted-foreground italic mt-2 pl-14">
              "{res.notes}"
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Reservation create/edit dialog
// ---------------------------------------------------------------------------

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
            disabled={
              !customerName ||
              !reservationDate ||
              !reservationTime ||
              mutation.isPending
            }
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
