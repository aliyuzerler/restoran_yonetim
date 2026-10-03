"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  LayoutGrid,
  CalendarCheck,
  Layers,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useNavigate } from "@/lib/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, relativeDay, todayISO } from "@/lib/format";
import { RESERVATION_STATUS, TABLE_STATUS } from "@/lib/constants";

export function OverviewView() {
  const { current } = useRestaurantStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", current?.id],
    queryFn: () => api.dashboard(current!.id),
    enabled: !!current,
  });

  if (isLoading || !data) {
    return <OverviewSkeleton />;
  }

  const stats = [
    {
      label: "Bugünkü Rezervasyon",
      value: data.reservations.today,
      icon: CalendarCheck,
      tint: "bg-rose-500/10 text-rose-600",
    },
    {
      label: "Bekleyen Talep",
      value: data.reservations.pending,
      icon: Clock,
      tint: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Menü Ürünü",
      value: data.counts.menuItems,
      icon: UtensilsCrossed,
      tint: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Toplam Masa",
      value: data.counts.tables,
      icon: LayoutGrid,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  const chartData = data.reservations.byDay.map((d) => ({
    name: new Date(d.date).toLocaleDateString("tr-TR", {
      weekday: "short",
    }),
    rezervasyon: d.count,
  }));

  const pieData = Object.entries(data.tablesByStatus).map(([k, v]) => ({
    name: TABLE_STATUS[k]?.label ?? k,
    value: v,
    color: TABLE_STATUS[k]?.color ?? "#999",
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
            {current?.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Genel bakış ve günlük özet
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/reservations")}>
          <CalendarCheck className="w-4 h-4 mr-1" />
          Rezervasyon Yönet
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Weekly reservations chart */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Haftalık Rezervasyon</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Son 7 günün rezervasyon trendi
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] -ml-2 pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                    cursor={{ fill: "var(--accent)", fillOpacity: 0.4 }}
                  />
                  <Bar
                    dataKey="rezervasyon"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Table status pie */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Masa Durumu</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Anlık kapasite kullanımı
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Today's reservations */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Bugünkü Rezervasyonlar</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/reservations")}
              >
                Tümünü gör
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.upcoming.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Bugün için rezervasyon yok
              </div>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
                {data.upcoming.map((r) => {
                  const cfg = RESERVATION_STATUS[r.status];
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center w-14 shrink-0 py-1 rounded-lg bg-primary/5">
                        <span className="text-xs font-semibold text-primary tabular-nums">
                          {r.reservationTime}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {r.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          {r.guestCount} kişi
                          {r.table && (
                            <>
                              <span>·</span>
                              <span>Masa {r.table.tableNumber}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="gap-1 shrink-0"
                        style={{
                          backgroundColor: `${cfg.color}1a`,
                          color: cfg.color,
                        }}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats summary */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Özet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow
              icon={CheckCircle2}
              label="Onaylı rezervasyon"
              value={data.reservations.confirmed}
            />
            <SummaryRow
              icon={Layers}
              label="Kategori sayısı"
              value={data.counts.categories}
            />
            <SummaryRow
              icon={CalendarCheck}
              label="Toplam rezervasyon"
              value={data.counts.reservations}
            />
            <div className="pt-3 mt-3 border-t border-border/60">
              <p className="text-xs text-muted-foreground mb-2">
                Rezervasyon durumu dağılımı
              </p>
              <div className="space-y-1.5">
                {Object.entries(data.reservations.byStatus).map(([k, v]) => {
                  const cfg = RESERVATION_STATUS[k];
                  if (!cfg) return null;
                  return (
                    <div
                      key={k}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </span>
                      <span className="font-medium tabular-nums">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-80 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-80 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
