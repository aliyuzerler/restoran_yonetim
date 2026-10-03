"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Percent,
  LayoutGrid,
  Star,
  Crown,
  Clock3,
  Globe,
  Wallet,
  ArrowUpRight,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getInitials } from "@/lib/format";

export function AnalyticsView() {
  const { current } = useRestaurantStore();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", current?.id],
    queryFn: () => api.analytics(current!.id),
    enabled: !!current,
  });

  if (isLoading || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-80 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, busyHours, popularity, categoryStats, months, sources, currency } =
    data;

  const kpiCards = [
    {
      label: "Tahmini Gelir",
      value: formatPrice(kpis.estimatedRevenue, currency),
      sub: `${formatPrice(kpis.potentialRevenue, currency)} potansiyel`,
      icon: Wallet,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Toplam Misafir",
      value: kpis.totalGuests,
      sub: `${kpis.completedGuests} tamamlanan`,
      icon: Users,
      tint: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Dönüşüm Oranı",
      value: `%${kpis.conversionRate}`,
      sub: "talep → onaylı/seated",
      icon: Percent,
      tint: "bg-rose-500/10 text-rose-600",
    },
    {
      label: "Masa Doluluk",
      value: `%${kpis.tableUtilization}`,
      sub: "anlık kapasite kullanımı",
      icon: LayoutGrid,
      tint: "bg-amber-500/10 text-amber-600",
    },
  ];

  const monthsData = months.map((m) => ({
    name: m.label,
    rezervasyon: m.count,
    misafir: m.guests,
  }));

  const busyData = busyHours.map((b) => ({
    name: b.label,
    rezervasyon: b.count,
  }));

  const sourceData = [
    { name: "Online", value: sources.online, color: "var(--primary)" },
    {
      name: "Manuel",
      value: sources.manual,
      color: "var(--muted-foreground)",
    },
  ];

  const maxCatCount = Math.max(...categoryStats.map((c) => c.itemCount), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("tr-TR", {
            month: "long",
            year: "numeric",
          })}{" "}
          raporu
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
          Analitik
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Restoran performansı, menü popülerliği ve rezervasyon trendleri
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}
                  >
                    <s.icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  {s.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly trend + Busy hours */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Aylık Trend</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Son 6 ay: rezervasyon ve misafir sayısı
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] -ml-2 pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthsData}
                  margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGuest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  />
                  <Area
                    type="monotone"
                    dataKey="misafir"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorGuest)"
                    name="Misafir"
                  />
                  <Area
                    type="monotone"
                    dataKey="rezervasyon"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#colorRes)"
                    name="Rezervasyon"
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sources pie */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Kaynak Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Online vs manuel
                </p>
              </div>
              <Globe className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={(entry) =>
                      entry.value > 0 ? `${entry.value}` : ""
                    }
                  >
                    {sourceData.map((entry, index) => (
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

      {/* Busy hours + Top items */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Yoğun Saatler</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Günün dönemlerine göre rezervasyon
                </p>
              </div>
              <Clock3 className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] -ml-2 pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={busyData}
                  margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
                >
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
                    }}
                    cursor={{ fill: "var(--accent)", fillOpacity: 0.4 }}
                  />
                  <Bar
                    dataKey="rezervasyon"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top menu items */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Popüler Ürünler</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Öne çıkan ve yüksek skorlu ürünler
                </p>
              </div>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto scrollbar-thin">
              {popularity.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Henüz veri yok
                </div>
              ) : (
                popularity.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0
                          ? "bg-amber-500/15 text-amber-600"
                          : idx === 1
                          ? "bg-slate-400/15 text-slate-600"
                          : idx === 2
                          ? "bg-orange-700/15 text-orange-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx < 3 ? (
                        <Crown className="w-3.5 h-3.5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        {item.isFeatured && (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {item.categoryName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0 tabular-nums">
                      {formatPrice(item.price, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category distribution */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Kategori Dağılımı</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ürün sayısı ve ortalama fiyat
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categoryStats.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Henüz kategori yok
            </div>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      {c.featuredCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-0.5 py-0 px-1.5"
                        >
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {c.featuredCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-xs tabular-nums">{c.itemCount} ürün</span>
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        ort. {formatPrice(c.avgPrice, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(c.itemCount / maxCatCount) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extra KPI strip */}
      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ortalama Kişi Harcaması</p>
              <p className="text-lg font-bold tabular-nums">
                {formatPrice(kpis.avgPrice, currency)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Online Rezervasyon</p>
              <p className="text-lg font-bold tabular-nums">
                {kpis.onlineReservations}
                <span className="text-xs text-muted-foreground font-normal">
                  {" "}
                  / {kpis.onlineReservations + kpis.manualReservations}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tamamlanan Misafir</p>
              <p className="text-lg font-bold tabular-nums">
                {kpis.completedGuests}
                <span className="text-xs text-muted-foreground font-normal">
                  {" "}
                  / {kpis.totalGuests}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
