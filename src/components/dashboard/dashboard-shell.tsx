"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  LayoutGrid,
  CalendarCheck,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Plus,
  Store,
  ExternalLink,
  Moon,
  Sun,
  ChevronDown,
  CalendarDays,
  BarChart3,
  Users,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate, useRoute, type Route } from "@/lib/router";
import { useAuthStore } from "@/stores/auth-store";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/format";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OverviewView } from "./views/overview-view";
import { MenuView } from "./views/menu-view";
import { TablesView } from "./views/tables-view";
import { ReservationsView } from "./views/reservations-view";
import { SettingsView } from "./views/settings-view";
import { CalendarView } from "./views/calendar-view";
import { AnalyticsView } from "./views/analytics-view";
import { TeamView } from "./views/team-view";

type NavItem = { tab: string; label: string; icon: LucideIcon };
type NavGroup = { label?: string; items: NavItem[] };

// Spec sidebar: Dashboard, Rezervasyonlar, Masalar, Menü, Restoran, Ayarlar
// Plus an "İş Araçları" group keeping the extra features accessible.
const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { tab: "overview", label: "Dashboard", icon: LayoutDashboard },
      { tab: "reservations", label: "Rezervasyonlar", icon: CalendarCheck },
      { tab: "tables", label: "Masalar", icon: LayoutGrid },
      { tab: "menu", label: "Menü", icon: UtensilsCrossed },
      { tab: "settings", label: "Restoran", icon: Store },
    ],
  },
  {
    label: "İş Araçları",
    items: [
      { tab: "calendar", label: "Takvim", icon: CalendarDays },
      { tab: "analytics", label: "Analitik", icon: BarChart3 },
      { tab: "team", label: "Ekip", icon: Users },
    ],
  },
  {
    label: "Sistem",
    items: [{ tab: "account", label: "Ayarlar", icon: Settings }],
  },
];

// "account" tab renders the SettingsView too (account/app settings alias)
const ALL_TABS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.tab));

export function DashboardShell() {
  const route = useRoute() as Extract<Route, { name: "dashboard" }>;
  const activeTab = route.tab ?? "overview";
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuthStore();
  const { restaurants, current, setCurrent, load } = useRestaurantStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const goTab = (tab: string) => {
    navigate(`/dashboard/${tab}`);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Çıkış yapıldı");
  };

  const renderNav = (onNav?: () => void) => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-thin">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      goTab(item.tab);
                      onNav?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${active ? "" : "text-muted-foreground"}`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section: Profil + Çıkış Yap */}
      <div className="pt-3 mt-3 border-t border-border/60 space-y-1">
        <button
          onClick={() => {
            goTab("account");
            onNav?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
            {user ? getInitials(user.name) : "?"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={() => {
            handleSignOut();
            onNav?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/80 backdrop-blur-lg flex items-center gap-3 px-4 sm:px-6">
        <button
          className="md:hidden -ml-1 p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menü"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>

        <div className="hidden md:block">
          <Logo showText={false} size="sm" />
        </div>

        {/* Restaurant switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 max-w-[140px] sm:max-w-[200px] md:max-w-[240px]">
              <Store className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate font-medium">
                {current?.name ?? "Restoran seç"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Restoranlarım</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {restaurants.map((r) => (
              <DropdownMenuItem
                key={r.id}
                onClick={() => {
                  setCurrent(r);
                  goTab(activeTab);
                }}
                className="gap-2 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {getInitials(r.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {r._count?.menuItems ?? 0} ürün ·{" "}
                    {r._count?.reservations ?? 0} rezervasyon
                  </p>
                </div>
                {current?.id === r.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCreateOpen(true)}
              className="gap-2 cursor-pointer text-primary"
            >
              <Plus className="w-4 h-4" />
              Yeni restoran ekle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Public link */}
        {current && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hidden sm:flex"
            onClick={() => navigate(`/r/${current.slug}`)}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden lg:inline">Public sayfa</span>
          </Button>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="w-4 h-4 dark:hidden" />
          <Moon className="w-4 h-4 hidden dark:block" />
        </Button>

        {/* User avatar (quick menu) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {user ? getInitials(user.name) : "?"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {user?.role === "owner" ? "Sahip" : "Çalışan"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => goTab("account")}
              className="gap-2 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              Profil / Ayarlar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Çıkış yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-60 flex-col border-r border-border/60 bg-card/30 py-4 px-3 sticky top-16 h-[calc(100vh-4rem)]">
          {renderNav()}
        </aside>

        {/* Mobile sidebar / drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-black/40 z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="md:hidden fixed left-0 top-16 bottom-0 w-72 bg-background border-r border-border/60 z-50 py-4 px-3 flex flex-col"
              >
                {renderNav(() => setMobileOpen(false))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (current?.id ?? "")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {(activeTab === "overview" || !ALL_TABS.includes(activeTab)) && (
                <OverviewView />
              )}
              {activeTab === "menu" && <MenuView />}
              {activeTab === "tables" && <TablesView />}
              {activeTab === "reservations" && <ReservationsView />}
              {activeTab === "calendar" && <CalendarView />}
              {activeTab === "analytics" && <AnalyticsView />}
              {activeTab === "team" && <TeamView />}
              {(activeTab === "settings" || activeTab === "account") && (
                <SettingsView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CreateRestaurantDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async () => {
          await load();
        }}
      />
    </div>
  );
}

function CreateRestaurantDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => Promise<void>;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [city, setCity] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.createRestaurant({ name, cuisine, city }),
    onSuccess: async () => {
      await onCreated();
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Yeni restoran oluşturuldu!");
      setName("");
      setCuisine("");
      setCity("");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni restoran ekle</DialogTitle>
          <DialogDescription>
            Birden fazla restoranını tek hesaptan yönet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Restoran Adı</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cafe Marina"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mutfak Türü</Label>
              <Input
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="Deniz mahsullü"
              />
            </div>
            <div className="space-y-2">
              <Label>Şehir</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İzmir"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!name || mutation.isPending}
          >
            {mutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
