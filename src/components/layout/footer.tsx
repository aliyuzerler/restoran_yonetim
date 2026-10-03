"use client";

import { Logo } from "./logo";
import { useNavigate } from "@/lib/router";
import {
  Github,
  Twitter,
  Linkedin,
  Heart,
  Mail,
  ArrowUpRight,
} from "lucide-react";

const COLUMNS = [
  {
    title: "Ürün",
    links: [
      { label: "Hemen Başla", action: "/register" as const },
      { label: "Giriş Yap", action: "/login" as const },
      { label: "Demo Restoran", action: "/r/le-petit-bistro" as const },
      { label: "Özellikleri İncele", anchor: "#features" },
    ],
  },
  {
    title: "Özellikler",
    links: [
      { label: "Menü Yönetimi", anchor: "#features" },
      { label: "Masa Yönetimi", anchor: "#features" },
      { label: "Rezervasyon Sistemi", anchor: "#features" },
      { label: "Analitik & Raporlar", anchor: "#features" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { label: "İletişim", mailto: "merhaba@tablo.app" },
      { label: "Gizlilik Politikası", anchor: "#privacy" },
      { label: "Kullanım Şartları", anchor: "#terms" },
      { label: "Blog", anchor: "#blog" },
    ],
  },
];

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="mt-auto border-t border-border bg-card/40 relative overflow-hidden">
      {/* Subtle top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px shimmer-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Restoranınızın menüsünü, masalarını, rezervasyonlarını ve
              profilini tek bir modern panelden yönetin. Saniyeler içinde
              kurulum, ömür boyu kolaylık.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Github, label: "GitHub" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"action" in link && link.action ? (
                      <button
                        onClick={() => navigate(link.action!)}
                        className="text-muted-foreground hover:text-foreground transition-colors text-left inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </button>
                    ) : "anchor" in link && link.anchor ? (
                      <a
                        href={link.anchor}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <a
                        href={`mailto:${link.mailto}`}
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA mini */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="font-semibold text-sm mb-3">Başla</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Ücretsiz hesap, kredi kartı gerekmez.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2 transition-all"
            >
              Hemen Kayıt Ol
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tablo. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-foreground transition-colors">
              Gizlilik
            </a>
            <a href="#terms" className="hover:text-foreground transition-colors">
              Şartlar
            </a>
            <p className="flex items-center gap-1.5">
              İstanbul'da{" "}
              <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> ile
              yapıldı
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
