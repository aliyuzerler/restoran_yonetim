"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  UtensilsCrossed,
  CalendarCheck,
  Loader2,
  ArrowLeft,
  Leaf,
  Users,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "@/lib/router";
import type { MenuItem } from "@/lib/types";
import { Logo } from "@/components/layout/logo";
import { Footer } from "@/components/layout/footer";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, todayISO } from "@/lib/format";
import { TIME_SLOTS } from "@/lib/constants";
import { toast } from "sonner";

export function PublicRestaurantPage({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [resOpen, setResOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-restaurant", slug],
    queryFn: () => api.publicRestaurant(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="h-16 border-b border-border/60 flex items-center px-4">
          <button onClick={() => navigate("/")}>
            <Logo />
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-7 h-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Restoran bulunamadı</h1>
            <p className="mt-2 text-muted-foreground">
              Aradığınız restoran mevcut değil veya yayından kaldırılmış olabilir.
            </p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Ana sayfaya dön
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { restaurant } = data;
  const categories = restaurant.categories;
  const items = restaurant.menuItems;
  const featured = items.filter((it) => it.isFeatured);

  // group items by category
  const grouped = categories
    .map((c) => ({
      category: c,
      items: items.filter((it) => it.categoryId === c.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="sticky top-0 z-30 h-14 border-b border-border/60 bg-background/80 backdrop-blur-lg flex items-center justify-between px-4">
        <button onClick={() => navigate("/")}>
          <Logo size="sm" />
        </button>
        <Button size="sm" onClick={() => setResOpen(true)}>
          <CalendarCheck className="w-4 h-4 mr-1" />
          Rezervasyon Yap
        </Button>
      </header>

      {/* Cover */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden bg-muted">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Restaurant info */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/60 shadow-xl overflow-hidden">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/60">
                  {restaurant.logoUrl ? (
                    <img
                      src={restaurant.logoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {restaurant.name}
                    </h1>
                    {restaurant.cuisine && (
                      <Badge variant="secondary">{restaurant.cuisine}</Badge>
                    )}
                  </div>
                  {restaurant.description && (
                    <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl">
                      {restaurant.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    {restaurant.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {restaurant.city}
                      </span>
                    )}
                    {restaurant.openTime && restaurant.closeTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {restaurant.openTime} - {restaurant.closeTime}
                      </span>
                    )}
                    {restaurant.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {restaurant.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  className="shrink-0"
                  onClick={() => setResOpen(true)}
                >
                  <CalendarCheck className="w-4 h-4 mr-1" />
                  Rezerve Et
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Menu */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h2 className="text-xl font-bold">Şefin Önerileri</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((item) => (
                <FeaturedCard
                  key={item.id}
                  item={item}
                  currency={restaurant.currency}
                />
              ))}
            </div>
          </section>
        )}

        {/* Full menu by category */}
        {grouped.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="py-16 text-center">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium">Menü hazırlanıyor</p>
              <p className="text-sm text-muted-foreground mt-1">
                Restoran henüz menüsünü eklememiş
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {grouped.map((g) => (
              <section key={g.category.id}>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/60">
                  <h2 className="text-xl font-bold">{g.category.name}</h2>
                  <Badge variant="secondary">{g.items.length}</Badge>
                  {g.category.description && (
                    <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">
                      {g.category.description}
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {g.items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      currency={restaurant.currency}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <ReservationDialog
        open={resOpen}
        onOpenChange={setResOpen}
        slug={slug}
        tables={restaurant.tables}
      />
    </div>
  );
}

function FeaturedCard({
  item,
  currency,
}: {
  item: MenuItem;
  currency: string;
}) {
  const tags = item.tags
    ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="overflow-hidden border-border/60 hover:shadow-lg transition-shadow group h-full">
        {item.imageUrl && (
          <div className="aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{item.name}</h3>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-primary">
              {formatPrice(item.price, currency)}
            </span>
            {tags.length > 0 && (
              <div className="flex gap-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] gap-0.5 py-0 px-1.5">
                    <Leaf className="w-2.5 h-2.5" />
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MenuItemRow({
  item,
  currency,
}: {
  item: MenuItem;
  currency: string;
}) {
  const tags = item.tags
    ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
      {item.imageUrl ? (
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-primary/40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm">{item.name}</h3>
          <span className="font-semibold text-primary text-sm shrink-0">
            {formatPrice(item.price, currency)}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {item.description}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px] gap-0.5 py-0 px-1.5">
                <Leaf className="w-2.5 h-2.5" />
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationDialog({
  open,
  onOpenChange,
  slug,
  tables,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slug: string;
  tables: { id: string; tableNumber: string; capacity: number; status: string }[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [reservationDate, setReservationDate] = useState(todayISO());
  const [reservationTime, setReservationTime] = useState("19:00");
  const [tableId, setTableId] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setDone(false);
    }
  }

  const mutation = useMutation({
    mutationFn: () =>
      api.publicReservation({
        restaurantSlug: slug,
        customerName: name,
        customerPhone: phone || null,
        customerEmail: email || null,
        guestCount: Number(guestCount) || 1,
        reservationDate,
        reservationTime,
        tableId: tableId || null,
        notes: notes || null,
      }),
    onSuccess: () => {
      setDone(true);
      toast.success("Rezervasyon talebin alındı!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const availableTables = tables.filter((t) => t.status === "available");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setName("");
          setPhone("");
          setEmail("");
          setGuestCount("2");
          setReservationDate(todayISO());
          setReservationTime("19:00");
          setTableId("");
          setNotes("");
        }
      }}
    >
      <DialogContent className="max-w-lg">
        {done ? (
          <div className="py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-bold">Talebin alındı!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Rezervasyon talebin başarıyla oluşturuldu. Restoran onayladığında
              sizinle iletişime geçilecek.
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tarih</span>
                <span className="font-medium">{reservationDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Saat</span>
                <span className="font-medium">{reservationTime}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Kişi</span>
                <span className="font-medium">{guestCount}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" onClick={() => onOpenChange(false)}>
              Tamam
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Rezervasyon Yap</DialogTitle>
              <DialogDescription>
                Bilgilerini gir, restoran onaylasın
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kişi Sayısı</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5xx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-posta (opsiyonel)</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mail@ornek.com"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tarih</Label>
                  <Input
                    type="date"
                    value={reservationDate}
                    min={todayISO()}
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
              {availableTables.length > 0 && (
                <div className="space-y-2">
                  <Label>Masa tercihi (opsiyonel)</Label>
                  <Select value={tableId} onValueChange={setTableId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Önemli değil" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          Masa {t.tableNumber} ({t.capacity} kişilik)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Notlar (opsiyonel)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Özel istekleriniz..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button
                onClick={() => mutation.mutate()}
                disabled={!name || !reservationDate || !reservationTime || mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <CalendarCheck className="w-4 h-4 mr-1" />
                )}
                Rezervasyon Talebi Gönder
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
