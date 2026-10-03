"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
// Note: SEO metadata is updated dynamically via useSeo hook below
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
  Navigation,
} from "lucide-react";
import { api } from "@/lib/api";
import { useNavigate } from "@/lib/router";
import type { MenuItem, Category } from "@/lib/types";
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
  const [activeCat, setActiveCat] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-restaurant", slug],
    queryFn: () => api.publicRestaurant(slug),
    retry: false,
  });

  // Dynamic SEO — update document title + meta tags for the public restaurant page.
  // This makes each restaurant page shareable with proper title/description/OG tags.
  useEffect(() => {
    if (!data?.restaurant) return;
    const r = data.restaurant;
    const title = `${r.name} · Menü & Rezervasyon`;
    const description =
      r.description ??
      `${r.name} — online menü ve rezervasyon. ${r.cuisine ?? ""} mutfağı`.trim();
    const ogImageUrl = r.coverImageUrl ?? r.logoUrl ?? "/og-image.svg";

    document.title = title;

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "restaurant.menu", "property");
    setMeta("og:image", ogImageUrl, "property");
    setMeta("og:url", window.location.href, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImageUrl);

    // JSON-LD structured data for the restaurant
    const existingLd = document.getElementById("restaurant-jsonld");
    if (existingLd) existingLd.remove();
    const ld = document.createElement("script");
    ld.id = "restaurant-jsonld";
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: r.name,
      description: description,
      servesCuisine: r.cuisine ?? undefined,
      telephone: r.phone ?? undefined,
      email: r.email ?? undefined,
      address: r.address
        ? {
            "@type": "PostalAddress",
            streetAddress: r.address,
            addressLocality: r.city ?? undefined,
          }
        : undefined,
      url: window.location.href,
      image: r.coverImageUrl ?? r.logoUrl ?? undefined,
      acceptsReservations: "True",
    });
    document.head.appendChild(ld);

    return () => {
      // Clean up JSON-LD on unmount
      const el = document.getElementById("restaurant-jsonld");
      if (el) el.remove();
    };
  }, [data]);

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
  const categories = restaurant.categories.filter((c) => c.isActive);
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
      <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-background/80 backdrop-blur-lg flex items-center justify-between px-4">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <Logo size="sm" />
        </button>
        <Button size="sm" onClick={() => setResOpen(true)}>
          <CalendarCheck className="w-4 h-4 mr-1" />
          Rezervasyon Yap
        </Button>
      </header>

      {/* Cover */}
      <div className="relative h-56 sm:h-72 lg:h-96 overflow-hidden bg-muted">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Restaurant info card — overlaps cover */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/60 shadow-xl overflow-hidden">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-card shadow-lg -mt-12 sm:-mt-16">
                  {restaurant.logoUrl ? (
                    <img
                      src={restaurant.logoUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-9 h-9 text-primary" />
                  )}
                </div>

                {/* Info */}
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
                    <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                      {restaurant.description}
                    </p>
                  )}

                  {/* Contact info grid — Telefon, Adres, Saatler */}
                  <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
                    {restaurant.phone && (
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="flex items-center gap-2.5 text-sm group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Telefon</p>
                          <p className="font-medium truncate">{restaurant.phone}</p>
                        </div>
                      </a>
                    )}
                    {(restaurant.address || restaurant.city) && (
                      <div className="flex items-start gap-2.5 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Adres</p>
                          <p className="font-medium">
                            {restaurant.address}
                            {restaurant.address && restaurant.city ? ", " : ""}
                            {restaurant.city}
                          </p>
                        </div>
                      </div>
                    )}
                    {restaurant.openTime && restaurant.closeTime && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Çalışma Saatleri</p>
                          <p className="font-medium">{restaurant.openTime} - {restaurant.closeTime}</p>
                        </div>
                      </div>
                    )}
                    {restaurant.email && (
                      <a
                        href={`mailto:${restaurant.email}`}
                        className="flex items-center gap-2.5 text-sm group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">E-posta</p>
                          <p className="font-medium truncate">{restaurant.email}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Reserve button */}
                <Button
                  className="shrink-0 h-11"
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

      {/* Sticky category navigation */}
      {grouped.length > 0 && (
        <CategoryNav
          grouped={grouped}
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          sectionRefs={sectionRefs}
        />
      )}

      {/* Menu */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h2 className="text-xl font-bold">Şefin Önerileri</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((item, i) => (
                <FeaturedCard
                  key={item.id}
                  item={item}
                  currency={restaurant.currency}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Full menu by category */}
        {grouped.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-7 h-7 text-primary/40" />
              </div>
              <p className="font-medium">Menü hazırlanıyor</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Restoran henüz menüsünü eklememiş. Daha sonra tekrar ziyaret edebilirsin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {grouped.map((g) => (
              <section
                key={g.category.id}
                id={`cat-${g.category.id}`}
                ref={(el) => {
                  sectionRefs.current[g.category.id] = el;
                }}
                className="scroll-mt-28"
              >
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold">{g.category.name}</h2>
                  <Badge variant="secondary">{g.items.length} ürün</Badge>
                </div>
                {g.category.description && (
                  <p className="text-sm text-muted-foreground mb-4 -mt-3">
                    {g.category.description}
                  </p>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.items.map((item, i) => (
                    <MenuProductCard
                      key={item.id}
                      item={item}
                      currency={restaurant.currency}
                      index={i}
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

// ---------------------------------------------------------------------------
// Sticky category navigation
// ---------------------------------------------------------------------------

function CategoryNav({
  grouped,
  activeCat,
  setActiveCat,
  sectionRefs,
}: {
  grouped: { category: Category; items: MenuItem[] }[];
  activeCat: string;
  setActiveCat: (id: string) => void;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("cat-", "");
            setActiveCat(id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [grouped, setActiveCat, sectionRefs]);

  const handleClick = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (grouped.length <= 1) return null;

  return (
    <div className="sticky top-14 z-30 border-y border-border/60 bg-background/90 backdrop-blur-lg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin py-2">
          {grouped.map((g) => (
            <button
              key={g.category.id}
              onClick={() => handleClick(g.category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCat === g.category.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {g.category.name}
              <span className="ml-1.5 opacity-60 tabular-nums text-xs">{g.items.length}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Featured card (large photo)
// ---------------------------------------------------------------------------

function FeaturedCard({
  item,
  currency,
  index,
}: {
  item: MenuItem;
  currency: string;
  index: number;
}) {
  const tags = item.tags
    ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="overflow-hidden border-border/60 hover:shadow-lg transition-shadow group h-full">
        {item.imageUrl ? (
          <div className="aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-primary/30" />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{item.name}</h3>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
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

// ---------------------------------------------------------------------------
// Menu product card — Fotoğraf, İsim, Açıklama, Fiyat (prominent)
// ---------------------------------------------------------------------------

function MenuProductCard({
  item,
  currency,
  index,
}: {
  item: MenuItem;
  currency: string;
  index: number;
}) {
  const tags = item.tags
    ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="overflow-hidden border-border/60 hover:shadow-md transition-shadow group h-full flex flex-col">
        {/* Fotoğraf */}
        {item.imageUrl ? (
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-primary/8 to-primary/3 flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-primary/25" />
          </div>
        )}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* İsim */}
          <h3 className="font-semibold leading-tight">{item.name}</h3>
          {/* Açıklama */}
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 flex-1">
              {item.description}
            </p>
          )}
          {/* Fiyat + tags */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
            <span className="font-bold text-primary text-base">
              {formatPrice(item.price, currency)}
            </span>
            {tags.length > 0 && (
              <div className="flex gap-1">
                {tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] gap-0.5 py-0 px-1.5">
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

// ---------------------------------------------------------------------------
// Reservation dialog
// ---------------------------------------------------------------------------

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
