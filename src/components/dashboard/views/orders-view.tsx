"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Phone,
  Clock,
  MoreVertical,
  Utensils,
  Package,
  Hash,
  User,
  Radio,
  CheckCircle2,
  X as XIcon,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { Order, OrderStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ORDER_STATUS, ORDER_STATUS_ORDER, ORDER_TYPE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

type Filter = "all" | OrderStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "pending", label: "Beklemede" },
  { key: "preparing", label: "Hazırlanıyor" },
  { key: "ready", label: "Hazır" },
  { key: "completed", label: "Tamamlandı" },
  { key: "cancelled", label: "İptal" },
];

export function OrdersView() {
  const { current } = useRestaurantStore();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [deleteId, setDeleteId] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", current?.id],
    queryFn: () => api.listOrders(current!.id),
    enabled: !!current,
    refetchInterval: 10000, // real-time polling
    refetchOnWindowFocus: true,
  });

  const orders = data?.orders ?? [];

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["orders"] });
      const prev = qc.getQueryData<{ orders: Order[] }>(["orders", current?.id]);
      if (prev) {
        qc.setQueryData(["orders", current?.id], {
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        });
      }
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["orders", current?.id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Stats
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const todayRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Siparişler
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              Canlı
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Online siparişleri takip et · 10 sn'de bir otomatik yenilenir
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Beklemede" value={pendingCount} color="#f59e0b" icon={Clock} />
        <StatCard label="Hazırlanıyor" value={preparingCount} color="#3b82f6" icon={Utensils} />
        <StatCard label="Hazır" value={readyCount} color="#10b981" icon={CheckCircle2} />
        <StatCard label="Günlük Gelir" value={formatPrice(todayRevenue, current?.currency ?? "₺")} color="#c2682c" icon={TrendingUp} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-thin pb-1">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? orders.length
              : orders.filter((o) => o.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {f.label}
              <span className="opacity-70 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-primary/40" />
            </div>
            <p className="font-medium">Henüz sipariş yok</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {orders.length === 0
                ? "Müşteriler public sayfadan sipariş verdiğinde burada görünecek."
                : "Bu filtre için sipariş yok."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                currency={current?.currency ?? "₺"}
                onStatus={(s) => updateStatus.mutate({ id: order.id, status: s })}
                onDelete={() => setDeleteId(order)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Siparişi sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteId?.customerName}</strong> adlı müşterinin
              siparişini silmek istediğine emin misin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return;
                try {
                  await api.deleteOrder(deleteId.id);
                  qc.invalidateQueries({ queryKey: ["orders"] });
                  toast.success("Sipariş silindi");
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

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: typeof Clock;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tabular-nums leading-none truncate">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderRow({
  order,
  currency,
  onStatus,
  onDelete,
}: {
  order: Order;
  currency: string;
  onStatus: (s: OrderStatus) => void;
  onDelete: () => void;
}) {
  const cfg = ORDER_STATUS[order.status];
  const typeCfg = ORDER_TYPE[order.orderType] ?? ORDER_TYPE.dine_in;
  const time = new Date(order.createdAt).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card
        className="border-border/60 hover:shadow-md transition-shadow"
        style={{ borderLeft: `4px solid ${cfg.color}` }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Order type icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{ backgroundColor: `${cfg.color}12` }}
            >
              {order.orderType === "takeaway" ? (
                <Package className="w-5 h-5" style={{ color: cfg.color }} />
              ) : (
                <Utensils className="w-5 h-5" style={{ color: cfg.color }} />
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{order.customerName}</h3>
                <Badge variant="outline" className="text-[10px] gap-1 py-0 px-1.5 font-normal">
                  {typeCfg.icon} {typeCfg.label}
                </Badge>
                {order.tableNumber && (
                  <Badge variant="outline" className="text-[10px] gap-1 py-0 px-1.5 font-normal">
                    <Hash className="w-2.5 h-2.5" />
                    Masa {order.tableNumber}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {time}
                </span>
              </div>

              {/* Items */}
              <div className="mt-2 space-y-0.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{item.quantity}×</span>{" "}
                      {item.name}
                      {item.notes && (
                        <span className="text-xs italic text-muted-foreground/70"> · {item.notes}</span>
                      )}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes + total */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {order.customerPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </span>
                  )}
                  {order.notes && (
                    <span className="italic truncate max-w-[200px]">"{order.notes}"</span>
                  )}
                </div>
                <span className="font-bold text-primary tabular-nums">
                  {formatPrice(order.total, currency)}
                </span>
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
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
                <DropdownMenuContent align="end" className="w-48">
                  <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Durumu değiştir
                  </p>
                  {ORDER_STATUS_ORDER.map((s) => {
                    const c = ORDER_STATUS[s];
                    return (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => onStatus(s as OrderStatus)}
                        disabled={s === order.status}
                        className="gap-2 cursor-pointer justify-between"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.label}
                        </span>
                        {s === order.status && (
                          <CheckCircle2 className="w-3 h-3 opacity-60" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
