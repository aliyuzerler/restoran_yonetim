"use client";

import { Loader2 } from "lucide-react";

export function AppLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
            T
          </div>
          <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10" />
        </div>
        <span className="text-xl font-bold tracking-tight">Tablo</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Yükleniyor...
      </div>
    </div>
  );
}
