"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  Clock,
  X,
  CalendarCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { Reservation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "@/lib/router";
import { RESERVATION_STATUS } from "@/lib/constants";
import { todayISO, relativeDay, getInitials } from "@/lib/format";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function CalendarView() {
  const { current } = useRestaurantStore();
  const navigate = useNavigate();
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reservations", current?.id],
    queryFn: () => api.listReservations(current!.id),
    enabled: !!current,
  });

  const reservations = data?.reservations ?? [];

  // Build calendar grid
  const grid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // JS: 0=Sunday. Convert to Monday-first: Pzt=0
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();

    const cells: { date: Date | null; iso: string | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ date: null, iso: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, iso: toISO(date) });
    }
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push({ date: null, iso: null });
    return cells;
  }, [viewDate]);

  // Count reservations per day for current month view
  const countsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reservations) {
      map[r.date] = (map[r.date] ?? 0) + 1;
    }
    return map;
  }, [reservations]);

  const maxCount = Math.max(1, ...Object.values(countsByDay));

  // Month stats
  const monthReservations = reservations.filter((r) => {
    const [y, m] = r.date.split("-").map(Number);
    return y === viewDate.getFullYear() && m - 1 === viewDate.getMonth();
  });
  const monthGuests = monthReservations.reduce((s, r) => s + r.partySize, 0);

  const todayIso = todayISO();

  const selectedDayReservations = selectedDay
    ? reservations
        .filter((r) => r.date === selectedDay)
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  function intensity(count: number): string {
    if (count === 0) return "";
    const ratio = count / maxCount;
    if (ratio > 0.75) return "bg-primary text-primary-foreground";
    if (ratio > 0.5) return "bg-primary/80 text-primary-foreground";
    if (ratio > 0.25) return "bg-primary/40 text-foreground";
    return "bg-primary/15 text-foreground";
  }

  function dotIntensity(count: number): string {
    if (count === 0) return "";
    const ratio = count / maxCount;
    if (ratio > 0.75) return "bg-primary-foreground";
    if (ratio > 0.5) return "bg-primary-foreground";
    return "bg-primary";
  }

  const canGoPrev =
    new Date(today.getFullYear(), today.getMonth() - 12, 1) <= viewDate;
  const canGoNext =
    viewDate <= new Date(today.getFullYear(), today.getMonth() + 12, 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Takvim
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aylık rezervasyon görünümü — güne tıklayıp detayları gör
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month stats */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/50">
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums leading-none">
                {monthReservations.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">rezervasyon</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums leading-none">
                {monthGuests}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">misafir</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border/60 overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
              disabled={!canGoPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[140px] text-center">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h2>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
              disabled={!canGoNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const t = new Date();
              setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
            }}
          >
            Bugün
          </Button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-semibold text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="p-4 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="p-3 grid grid-cols-7 gap-1.5">
            {grid.map((cell, i) => {
              if (!cell.date) {
                return <div key={i} className="h-20 sm:h-24" />;
              }
              const count = countsByDay[cell.iso!] ?? 0;
              const isToday = cell.iso === todayIso;
              const isPast = cell.iso < todayIso;
              const isWeekend = i % 7 >= 5;
              return (
                <motion.button
                  key={cell.iso}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDay(cell.iso)}
                  className={`relative h-20 sm:h-24 rounded-lg p-1.5 sm:p-2 text-left transition-colors border ${
                    intensity(count) || "border-border/40 hover:border-border bg-card"
                  } ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        count > 0 && count / maxCount > 0.5
                          ? "text-primary-foreground"
                          : isToday
                          ? "text-primary"
                          : isPast
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {count > 0 && (
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          count / maxCount > 0.5
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                  {count > 0 && (
                    <div className="mt-1 space-y-0.5 hidden sm:block">
                      {reservations
                        .filter((r) => r.date === cell.iso)
                        .slice(0, 2)
                        .map((r) => (
                          <div
                            key={r.id}
                            className={`text-[10px] truncate rounded px-1 py-0.5 ${
                              count / maxCount > 0.5
                                ? "bg-primary-foreground/15 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {r.time} {r.customerName.split(" ")[0]}
                          </div>
                        ))}
                      {count > 2 && (
                        <div
                          className={`text-[10px] px-1 ${
                            count / maxCount > 0.5
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          +{count - 2} daha
                        </div>
                      )}
                    </div>
                  )}
                  {count === 0 && isWeekend && (
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="px-4 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Doluluk:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary/15" />
              <span>Az</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary/40" />
              <span>Orta</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary" />
              <span>Yoğun</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="w-3.5 h-3.5" />
            Güne tıkla → rezervasyonları gör
          </div>
        </div>
      </Card>

      {/* Day detail dialog */}
      <Dialog
        open={!!selectedDay}
        onOpenChange={(v) => !v && setSelectedDay(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {selectedDay ? relativeDay(selectedDay) : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedDay && selectedDay !== todayIso ? selectedDay : "Bugün"}{" "}
              için {selectedDayReservations.length} rezervasyon
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto scrollbar-thin -mx-1 px-1">
            {selectedDayReservations.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Bu gün için rezervasyon yok
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedDay(null);
                    navigate("/dashboard/reservations");
                  }}
                >
                  Rezervasyon Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayReservations.map((r) => {
                  const cfg = RESERVATION_STATUS[r.status];
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center w-14 shrink-0 py-1.5 rounded-lg bg-primary/5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-semibold text-primary tabular-nums mt-0.5">
                          {r.time}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                            {getInitials(r.customerName)}
                          </div>
                          <p className="text-sm font-medium truncate">
                            {r.customerName}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Users className="w-3 h-3" />
                          {r.partySize} kişi
                          {r.table && (
                            <>
                              <span>·</span>
                              <span>{r.table.name}</span>
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
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
