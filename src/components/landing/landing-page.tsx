"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  Zap,
  ShieldCheck,
  RefreshCw,
  Mouse,
  ChevronRight,
  Play,
  Bell,
  Utensils,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: UtensilsCrossed,
    title: "Menü Yönetimi",
    desc: "Kategorilere ayır, fiyat güncelle, öne çıkanları belirle. Tek tıkla ürün ekleyip düzenle.",
    color: "bg-orange-500/10 text-orange-600",
    ring: "group-hover:ring-orange-500/20",
  },
  {
    icon: LayoutGrid,
    title: "Masa Yönetimi",
    desc: "Tüm masalarını canlı durumlarıyla görüntüle: müsait, dolu, rezerve, temizlik.",
    color: "bg-emerald-500/10 text-emerald-600",
    ring: "group-hover:ring-emerald-500/20",
  },
  {
    icon: CalendarCheck,
    title: "Rezervasyon Sistemi",
    desc: "Gelen rezervasyonları onayla, masaya ata, durumlarını takip et. Online talepler otomatik gelir.",
    color: "bg-rose-500/10 text-rose-600",
    ring: "group-hover:ring-rose-500/20",
  },
  {
    icon: Store,
    title: "Restoran Yönetimi",
    desc: "Profil, iletişim, çalışma saatleri, görseller. Her restoran için ayrı kontrol paneli.",
    color: "bg-amber-500/10 text-amber-600",
    ring: "group-hover:ring-amber-500/20",
  },
  {
    icon: RefreshCw,
    title: "Gerçek Zamanlı Güncellemeler",
    desc: "Masa durumu ve rezervasyon değişiklikleri anlık yansır. Her zaman güncel kalın.",
    color: "bg-sky-500/10 text-sky-600",
    ring: "group-hover:ring-sky-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Kolay Kullanım",
    desc: "Sıfır öğrenme eğrisi. Saniyeler içinde kurulum, dakikalar içinde profesyonel yönetim.",
    color: "bg-violet-500/10 text-violet-600",
    ring: "group-hover:ring-violet-500/20",
  },
];

const steps = [
  {
    n: "01",
    title: "Restoranınızı oluşturun",
    desc: "Ücretsiz kayıt olun, restoran bilgilerinizi girin ve public sayfanız anında hazır olsun.",
    icon: Store,
  },
  {
    n: "02",
    title: "Menünüzü ve masalarınızı ekleyin",
    desc: "Ürünleri kategorilere ayırın, masaları ve kapasitelerini tanımlayın. Hazır.",
    icon: Utensils,
  },
  {
    n: "03",
    title: "Rezervasyonlarınızı yönetin",
    desc: "Gelen talepleri onaylayın, masalara atayın, günü verimli geçirin.",
    icon: CalendarCheck,
  },
];

const mockStats = [
  { label: "Bugünkü Rezervasyon", value: 12, icon: CalendarCheck, trend: "+3", color: "text-rose-600" },
  { label: "Masa Doluluk", value: "62%", icon: LayoutGrid, trend: "5/8", color: "text-emerald-600" },
  { label: "Menü Ürünü", value: 48, icon: UtensilsCrossed, trend: "", color: "text-orange-600" },
  { label: "Bekleyen Talep", value: 3, icon: Clock, trend: "", color: "text-amber-600" },
];

const mockReservations = [
  { name: "Ayşe Y.", time: "19:00", size: 2, status: "Onaylandı" },
  { name: "Mehmet D.", time: "20:30", size: 4, status: "Beklemede" },
  { name: "Zeynep K.", time: "21:00", size: 6, status: "Onaylandı" },
];

const dashboardTabs = ["Genel Bakış", "Menü", "Masalar", "Rezervasyonlar"] as const;

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  return (
    <div className="min-h-screen flex flex-col bg-background bg-mesh">
      {/* Header */}
      <Header />

      <main className="flex-1">
        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="relative overflow-hidden pt-14 lg:pt-20 pb-24">
          {/* Background decorations */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] translate-y-1/4 -translate-x-1/4" />
            <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/2" />
          </motion.div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
              {/* Left: copy + CTAs */}
              <motion.div variants={stagger} initial="hidden" animate="visible">
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 pl-1.5 pr-3 py-1 text-xs font-medium text-primary">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    Restoran yönetiminde yeni nesil
                    <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-primary/70">
                      <span className="w-1 h-1 rounded-full bg-primary/60" />
                      v2.0
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mt-6 text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-balance leading-[1.05]"
                >
                  Restoranınızı{" "}
                  <span className="relative inline-block">
                    <span className="text-gradient-warm">Tek Panelden</span>
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.9, ease: "easeInOut" }}
                      viewBox="0 0 300 12"
                      className="absolute -bottom-1 left-0 w-full h-3"
                      fill="none"
                    >
                      <motion.path
                        d="M2 8 Q 75 2, 150 6 T 298 5"
                        stroke="oklch(0.62 0.17 45)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </motion.svg>
                  </span>{" "}
                  Yönetin
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-6 text-lg text-muted-foreground max-w-xl text-balance leading-relaxed"
                >
                  Menünüzü, masalarınızı ve rezervasyonlarınızı tek bir modern
                  platform üzerinden kolayca yönetin. Müşterileriniz için
                  paylaşılabilir public sayfa dahil.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    size="lg"
                    className="h-12 px-7 text-base group glow-primary"
                    onClick={() => navigate("/register")}
                  >
                    Hemen Başla
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-base group"
                    onClick={() => navigate("/login")}
                  >
                    Giriş Yap
                  </Button>
                </motion.div>

                {/* Secondary CTAs */}
                <motion.div
                  variants={fadeUp}
                  className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
                >
                  <button
                    onClick={() => navigate("/r/le-petit-bistro")}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-full border border-border/80 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 transition-colors">
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                    Demo Gör
                  </button>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-full border border-border/80 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 transition-colors">
                      <ChevronRight className="w-3 h-3" />
                    </span>
                    Özellikleri İncele
                  </button>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
                >
                  {["Kredi kartı gerekmez", "Anında kurulum", "İstediğin zaman iptal"].map(
                    (t) => (
                      <span key={t} className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        {t}
                      </span>
                    )
                  )}
                </motion.div>
              </motion.div>

              {/* Right: animated dashboard mockup */}
              <HeroMockup />
            </div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5 text-muted-foreground"
          >
            <Mouse className="w-4 h-4" />
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-6 bg-gradient-to-b from-primary/60 to-transparent"
            />
          </motion.div>
        </section>

        {/* ───────────────────────── LOGO MARQUEE STRIP ───────────────────────── */}
        <section className="border-y border-border/60 bg-card/30 py-6 overflow-hidden">
          <div className="mask-fade-x overflow-hidden">
            <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
              {[...Array(2)].map((_, dup) => (
                <div key={dup} className="flex gap-12 items-center">
                  {[
                    "Le Petit Bistro",
                    "Cafe Marina",
                    "Trattoria Bella",
                    "Sushi Zen",
                    "Mangal Evi",
                    "Lokanta 34",
                    "The Green Spoon",
                    "Bosphorus Bistro",
                  ].map((name) => (
                    <span
                      key={name + dup}
                      className="text-sm font-medium text-muted-foreground/60 flex items-center gap-2"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 text-primary/40" />
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────── STATS STRIP ───────────────────────── */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { value: "10×", label: "Daha hızlı yönetim", icon: TrendingUp },
                { value: "7/24", label: "Online rezervasyon", icon: Clock },
                { value: "∞", label: "Menü & masa ürünü", icon: UtensilsCrossed },
                { value: "1", label: "Public restoran sayfası", icon: Store },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  custom={i}
                  className="relative text-center rounded-2xl border border-border/60 bg-card/40 p-6 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
                >
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-4xl font-bold tracking-tight tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────── FEATURES ───────────────────────── */}
        <section id="features" className="py-20 lg:py-28 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Özellikler"
              title="Restoran yönetiminin tamamı, tek yerde"
              desc="Dağınık tabloları ve defterleri bırakın. Tablo ile her şey düzenli, erişilebilir ve hızlı."
            />
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14"
            >
              {features.map((f, i) => (
                <motion.div key={f.title} variants={fadeUp} custom={i}>
                  <Card className="group h-full p-6 border-border/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    {/* hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/8 rounded-full blur-2xl" />
                    </div>
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${f.color} mb-5 ring-2 ring-transparent ${f.ring} transition-all group-hover:scale-110`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="relative font-semibold text-lg">{f.title}</h3>
                    <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                    <div className="relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      Keşfet
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
        <section id="how" className="py-20 lg:py-28 bg-card/30 border-y border-border/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Nasıl Çalışır"
              title="3 adımda başlayın"
              desc="Kurulumdan ilk rezervasyona kadar sadece birkaç dakika."
            />
            <div className="relative mt-14">
              {/* connecting line */}
              <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="grid md:grid-cols-3 gap-6 relative"
              >
                {steps.map((s, i) => (
                  <motion.div key={s.n} variants={fadeUp} custom={i} className="relative">
                    <Card className="h-full p-7 border-border/60 hover:shadow-lg transition-shadow relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <s.icon className="w-5 h-5 text-primary" />
                          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
                            {i + 1}
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-primary/15 tabular-nums">
                          {s.n}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── DASHBOARD PREVIEW ───────────────────────── */}
        <section id="preview" className="py-20 lg:py-28 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Dashboard Önizleme"
              title="Yönetim paneline yakından bakın"
              desc="Modern, hızlı ve sezgisel. Her şey parmaklarınızın ucunda."
            />
            <DashboardPreview />
          </div>
        </section>

        {/* ───────────────────────── CTA ───────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative overflow-hidden rounded-3xl bg-animated-gradient text-white p-10 sm:p-16 text-center shadow-2xl"
            >
              <div className="absolute inset-0 bg-noise opacity-40 mix-blend-overlay" />
              <div className="absolute inset-0 bg-grid opacity-10" />
              {/* floating decorative blobs */}
              <motion.div
                animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 left-8 w-20 h-20 rounded-full bg-white/10 blur-2xl"
              />
              <motion.div
                animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 right-10 w-24 h-24 rounded-full bg-white/10 blur-2xl"
              />

              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", damping: 12 }}
                  className="inline-flex w-14 h-14 rounded-2xl bg-white/15 backdrop-blur items-center justify-center mb-5"
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                  Restoranınızı bugün dijitalleştirin.
                </h2>
                <p className="mt-4 text-white/85 max-w-xl mx-auto text-balance text-lg">
                  Ücretsiz hesabınızı oluşturun, ilk restoranınızı ekleyin ve
                  yönetimin keyfini çıkarın. Kredi kartı gerekmez.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-7 text-base group shadow-lg"
                    onClick={() => navigate("/register")}
                  >
                    Hemen Başla
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-base border-white/30 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => navigate("/r/le-petit-bistro")}
                  >
                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                    Demo İncele
                  </Button>
                </div>
                <div className="mt-7 flex items-center justify-center gap-x-6 gap-y-1 text-sm text-white/80 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    5 dakikada kurulum
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Ücretsiz forever
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Türkçe destek
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 glass shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {[
            { label: "Özellikler", anchor: "#features" },
            { label: "Nasıl Çalışır", anchor: "#how" },
            { label: "Önizleme", anchor: "#preview" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.anchor}
              className="relative hover:text-foreground transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => navigate("/r/le-petit-bistro")}
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            Demo
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
          <Button
            size="sm"
            onClick={() => navigate("/register")}
            className="group"
          >
            Hemen Başla
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-2xl mx-auto"
    >
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-balance leading-tight">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground text-balance text-lg">{desc}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Hero mockup — animated dashboard card
// ---------------------------------------------------------------------------

function HeroMockup() {
  const [activeIdx, setActiveIdx] = useState(0);

  // cycle "live" indicator pulses and stat updates feel
  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % mockStats.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative"
    >
      {/* glow behind card */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-primary/15 via-amber-500/10 to-emerald-500/10 rounded-[2rem] blur-2xl opacity-70" />

      <Card className="relative overflow-hidden shadow-2xl shadow-primary/10 border-border/60 backdrop-blur">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/60 bg-muted/40">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <div className="flex-1 text-center">
            <span className="text-[10px] text-muted-foreground font-mono">
              tablo.app/dashboard
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-card p-5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Le Petit Bistro</p>
              <p className="font-semibold">Bugün Genel Bakış</p>
            </div>
            <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              Canlı
            </Badge>
          </div>
        </div>

        {/* Stats grid */}
        <div className="p-5 grid grid-cols-2 gap-3">
          {mockStats.map((s, i) => (
            <motion.div
              key={s.label}
              animate={
                activeIdx === i
                  ? { borderColor: "oklch(0.62 0.17 45 / 0.4)" }
                  : { borderColor: "var(--border)" }
              }
              className="relative rounded-xl border bg-card p-3.5 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                {s.trend && (
                  <span className="text-[10px] font-medium text-primary tabular-nums">
                    {s.trend}
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              {activeIdx === i && (
                <motion.div
                  layoutId="stat-active"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Upcoming reservations */}
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-border/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Yaklaşan Rezervasyonlar</p>
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="space-y-1">
              {mockReservations.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {r.size} kişi · {r.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">
                    {r.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Floating notification badge */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1, type: "spring", damping: 14 }}
        className="absolute -right-3 top-1/3 hidden sm:flex items-center gap-2 rounded-xl bg-card border border-border shadow-lg px-3 py-2"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-primary" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <p className="text-xs font-medium leading-tight">Yeni rezervasyon!</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            2 dk önce
          </p>
        </div>
      </motion.div>

      {/* Floating mini stat card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute -left-4 bottom-8 hidden sm:flex items-center gap-2 rounded-xl bg-card border border-border shadow-lg px-3 py-2"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold leading-tight">+%18</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            bu hafta
          </p>
        </div>
      </motion.div>

      {/* Decorative animated dot */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-3 -left-3 w-6 h-6 rounded-full border-2 border-dashed border-primary/40"
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard preview — animated tab switcher
// ---------------------------------------------------------------------------

function DashboardPreview() {
  const [tab, setTab] = useState<(typeof dashboardTabs)[number]>("Genel Bakış");

  useEffect(() => {
    const t = setInterval(() => {
      setTab((cur) => {
        const idx = dashboardTabs.indexOf(cur);
        return dashboardTabs[(idx + 1) % dashboardTabs.length];
      });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-amber-500/5 to-transparent rounded-3xl blur-2xl" />
      <Card className="relative overflow-hidden border-border/60 shadow-2xl shadow-primary/10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Tablo Panel</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {dashboardTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  tab === t
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="preview-tab"
                    className="absolute inset-0 rounded-md bg-primary"
                    transition={{ type: "spring", damping: 20, stiffness: 280 }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 min-h-[280px] bg-gradient-to-br from-card to-muted/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "Genel Bakış" && <PreviewOverview />}
              {tab === "Menü" && <PreviewMenu />}
              {tab === "Masalar" && <PreviewTables />}
              {tab === "Rezervasyonlar" && <PreviewReservations />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

function PreviewOverview() {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {[
        { label: "Günlük Rezervasyon", value: "12", icon: CalendarCheck, c: "text-rose-600 bg-rose-500/10" },
        { label: "Doluluk", value: "62%", icon: LayoutGrid, c: "text-emerald-600 bg-emerald-500/10" },
        { label: "Bekleyen", value: "3", icon: Clock, c: "text-amber-600 bg-amber-500/10" },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border/60 bg-card p-4"
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.c} mb-2`}>
            <s.icon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
      <div className="sm:col-span-3 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-end gap-1.5 h-20">
          {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary/50 to-primary"
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Haftalık rezervasyon trendi</p>
      </div>
    </div>
  );
}

function PreviewMenu() {
  const items = [
    { name: "Burrata Salatası", price: "₺285", cat: "Başlangıç", featured: true },
    { name: "Dana Cheek", price: "₺540", cat: "Ana Yemek", featured: true },
    { name: "Trüf Risotto", price: "₺360", cat: "Makarna", featured: false },
    { name: "Crème Brûlée", price: "₺180", cat: "Tatlı", featured: false },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {items.map((it, i) => (
        <motion.div
          key={it.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium truncate">{it.name}</p>
              {it.featured && (
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{it.cat}</p>
          </div>
          <span className="text-sm font-semibold text-primary tabular-nums">
            {it.price}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function PreviewTables() {
  const tables = [
    { name: "Masa 1", status: "Müsait", c: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
    { name: "Masa 3", status: "Dolu", c: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
    { name: "Masa 5", status: "Rezerve", c: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
    { name: "Masa 7", status: "Temizlik", c: "bg-slate-500/10 text-slate-600 border-slate-500/30" },
    { name: "Masa 2", status: "Müsait", c: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
    { name: "Masa 8", status: "Müsait", c: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {tables.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
          className={`rounded-xl border p-3 ${t.c}`}
        >
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-[11px] mt-0.5">{t.status}</p>
        </motion.div>
      ))}
    </div>
  );
}

function PreviewReservations() {
  const res = [
    { name: "Ayşe Y.", time: "19:00", size: 2, status: "Onaylandı", c: "bg-emerald-500/10 text-emerald-600" },
    { name: "Mehmet D.", time: "20:30", size: 4, status: "Beklemede", c: "bg-amber-500/10 text-amber-600" },
    { name: "Zeynep K.", time: "21:00", size: 6, status: "Onaylandı", c: "bg-emerald-500/10 text-emerald-600" },
    { name: "Can Ö.", time: "21:30", size: 2, status: "Onaylandı", c: "bg-emerald-500/10 text-emerald-600" },
  ];
  return (
    <div className="space-y-2">
      {res.map((r, i) => (
        <motion.div
          key={r.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5"
        >
          <div className="flex flex-col items-center justify-center w-12 shrink-0">
            <span className="text-sm font-bold tabular-nums">{r.time}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
            {r.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{r.name}</p>
            <p className="text-[11px] text-muted-foreground">{r.size} kişi</p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${r.c}`}>
            {r.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scrollToSection(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
}
