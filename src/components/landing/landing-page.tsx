"use client";

import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  LayoutGrid,
  CalendarCheck,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";
import { useNavigate } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Menü Yönetimi",
    desc: "Kategorilere ayır, fiyat güncelle, öne çıkanları belirle. Tek tıkla ürün ekleyip düzenle.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: LayoutGrid,
    title: "Masa Yönetimi",
    desc: "Tüm masalarını canlı durumlarıyla görüntüle: müsait, dolu, rezerve, temizlik.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: CalendarCheck,
    title: "Rezervasyon Sistemi",
    desc: "Gelen rezervasyonları onayla, masaya ata, durumlarını takip et. Online talepler otomatik gelir.",
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    icon: Store,
    title: "Public Restoran Sayfası",
    desc: "Her restoran için paylaşılabilir bir sayfa. Müşteriler menüyü görür, online rezervasyon yapar.",
    color: "bg-amber-500/10 text-amber-600",
  },
];

const steps = [
  {
    n: "01",
    title: "Hesap oluştur",
    desc: "Saniyeler içinde ücretsiz kayıt ol ve ilk restoranını ekle.",
  },
  {
    n: "02",
    title: "Menü & masalarını tanımla",
    desc: "Ürünlerini kategorilere ayır, masalarını ve kapasitelerini gir.",
  },
  {
    n: "03",
    title: "Yönetmeye başla",
    desc: "Rezervasyonları onayla, masaları takip et, panelinden her şeyi kontrol et.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Özellikler
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              Nasıl Çalışır
            </a>
            <button
              onClick={() => navigate("/r/le-petit-bistro")}
              className="hover:text-foreground transition-colors"
            >
              Demo
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Giriş Yap
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              Ücretsiz Başla
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-5 gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Restoran yönetiminde yeni nesil
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
                Restoranınızı{" "}
                <span className="text-primary">tek panelden</span> yönetin
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg text-balance">
                Menü, masalar, rezervasyonlar ve restoran profiliniz.
                Hepsini modern, hızlı ve kolay bir arayüzde toplayın.
                Müşterileriniz için paylaşılabilir public sayfa hediyemiz.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="h-12 px-6 text-base"
                  onClick={() => navigate("/register")}
                >
                  Ücretsiz Hesap Oluştur
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base"
                  onClick={() => navigate("/r/le-petit-bistro")}
                >
                  Demo Restoranı Gör
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Kredi kartı gerekmez
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Anında kurulum
                </div>
              </div>
            </motion.div>

            {/* Hero visual: mock dashboard card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <Card className="overflow-hidden shadow-2xl shadow-primary/10 border-border/60">
                <div className="bg-gradient-to-br from-primary/10 via-card to-card p-5 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Le Petit Bistro</p>
                      <p className="font-semibold">Bugün Genel Bakış</p>
                    </div>
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Canlı
                    </Badge>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                  {[
                    { label: "Bugünkü Rezervasyon", value: "12", icon: CalendarCheck, trend: "+3" },
                    { label: "Dolu Masa", value: "5/8", icon: LayoutGrid, trend: "62%" },
                    { label: "Menü Ürünü", value: "48", icon: UtensilsCrossed, trend: "" },
                    { label: "Bekleyen Talep", value: "3", icon: Clock, trend: "" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border/60 bg-card p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <s.icon className="w-4 h-4 text-muted-foreground" />
                        {s.trend && (
                          <span className="text-[10px] font-medium text-primary">
                            {s.trend}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-2xl font-bold tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <div className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium">Yaklaşan Rezervasyonlar</p>
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {[
                      { name: "Ayşe Y.", time: "19:00", size: 2 },
                      { name: "Mehmet D.", time: "20:30", size: 4 },
                    ].map((r) => (
                      <div
                        key={r.name}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {r.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {r.size} kişi
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">{r.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -right-3 top-1/3 hidden sm:flex items-center gap-1.5 rounded-full bg-card border border-border shadow-lg px-3 py-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium">Yeni rezervasyon!</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10x", label: "Daha hızlı yönetim", icon: TrendingUp },
            { value: "7/24", label: "Online rezervasyon", icon: Clock },
            { value: "∞", label: "Menü & masa ürünü", icon: UtensilsCrossed },
            { value: "1", label: "Public restoran sayfası", icon: Store },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Özellikler</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Restoran yönetiminin tamamı, tek yerde
            </h2>
            <p className="mt-4 text-muted-foreground text-balance">
              Dağınık tabloları ve defterleri bırakın. Tablo ile her şey
              düzenli ve erişilebilir.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-border/60 group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 lg:py-28 bg-card/40 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Nasıl Çalışır</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              3 adımda başla
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <Card className="h-full p-6 border-border/60">
                  <div className="text-4xl font-bold text-primary/20 tabular-nums">
                    {s.n}
                  </div>
                  <h3 className="mt-2 font-semibold text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </Card>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-border -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-dots opacity-10" />
            <div className="relative">
              <Users className="w-10 h-10 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Restoranınız dijitalleşmeye hazır mı?
              </h2>
              <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto text-balance">
                Bugün ücretsiz hesabınızı oluşturun, ilk restoranınızı ekleyin
                ve yönetimin keyfini çıkarın.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-6 text-base"
                  onClick={() => navigate("/register")}
                >
                  Hemen Başla
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  onClick={() => navigate("/r/le-petit-bistro")}
                >
                  Demo İncele
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
