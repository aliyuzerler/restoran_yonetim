"use client";

import { Logo } from "./logo";
import { useNavigate } from "@/lib/router";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              Restoranınızın menüsünü, masalarını, rezervasyonlarını ve
              profilini tek bir modern panelden yönetin.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Ürün</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => navigate("/register")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Ücretsiz Başla
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/login")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Giriş Yap
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/r/le-petit-bistro")}
                  className="hover:text-foreground transition-colors text-left"
                >
                  Demo Restoran
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Özellikler</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Menü Yönetimi</li>
              <li>Masa Yönetimi</li>
              <li>Rezervasyon Sistemi</li>
              <li>Public Restoran Sayfası</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tablo. Tüm hakları saklıdır.</p>
          <p className="flex items-center gap-1.5">
            İstanbul'da <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> ile yapıldı
          </p>
        </div>
      </div>
    </footer>
  );
}
