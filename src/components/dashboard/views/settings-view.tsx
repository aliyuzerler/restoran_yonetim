"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Image as ImageIcon,
  Save,
  ExternalLink,
  Trash2,
  Coins,
  Globe,
  Loader2,
  QrCode,
  Copy,
  Download,
  Share2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useNavigate } from "@/lib/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function SettingsView() {
  const { current, setCurrent, load } = useRestaurantStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    name: current?.name ?? "",
    description: current?.description ?? "",
    cuisine: current?.cuisine ?? "",
    phone: current?.phone ?? "",
    email: current?.email ?? "",
    address: current?.address ?? "",
    city: current?.city ?? "",
    coverImage: current?.coverImage ?? "",
    logoImage: current?.logoImage ?? "",
    openTime: current?.openTime ?? "12:00",
    closeTime: current?.closeTime ?? "23:00",
    currency: current?.currency ?? "₺",
    isActive: current?.isActive ?? true,
  });

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => api.updateRestaurant(current!.id, form),
    onSuccess: ({ restaurant }) => {
      setCurrent(restaurant);
      qc.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Ayarlar kaydedildi");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteRestaurant(current!.id),
    onSuccess: async () => {
      toast.success("Restoran silindi");
      await load();
      navigate("/dashboard");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!current) return null;

  const publicUrl = `${window.location.origin}/#/r/${current.slug}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-28">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Restoran Ayarları
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Restoran bilgilerini ve public sayfa ayarlarını düzenle
        </p>
      </div>

      <div className="space-y-5">
        {/* Public link banner */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Public restoran sayfan</p>
              <p className="text-xs text-muted-foreground truncate">
                /r/{current.slug}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/r/${current.slug}`)}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Görüntüle
            </Button>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Restoran Adı</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                placeholder="Restoranını tanıt..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mutfak Türü</Label>
                <Input
                  value={form.cuisine}
                  onChange={(e) => update("cuisine", e.target.value)}
                  placeholder="İtalyan"
                />
              </div>
              <div className="space-y-2">
                <Label>Para Birimi</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="pl-9"
                    placeholder="₺"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              İletişim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="pl-9"
                    placeholder="+90 212..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="pl-9"
                    placeholder="info@restoran.com"
                  />
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adres</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="pl-9"
                    placeholder="Mahalle, cadde..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Şehir</Label>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="İstanbul"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Çalışma Saatleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Açılış</Label>
                <Input
                  type="time"
                  value={form.openTime}
                  onChange={(e) => update("openTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kapanış</Label>
                <Input
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => update("closeTime", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Görseller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Kapak Görseli URL</Label>
              <Input
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://..."
              />
              {form.coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border/60 aspect-[16/6]">
                  <img
                    src={form.coverImage}
                    alt="Kapak"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Logo Görseli URL</Label>
              <Input
                value={form.logoImage}
                onChange={(e) => update("logoImage", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Görünürlük</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
              <div>
                <p className="font-medium text-sm">Public sayfa aktif</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Müşteriler restoran sayfanı görüp rezervasyon yapabilir
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => update("isActive", v)}
              />
            </div>
            {form.isActive ? (
              <Badge className="mt-3 gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Yayında
              </Badge>
            ) : (
              <Badge variant="secondary" className="mt-3">
                Yayında değil
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* QR Code sharing */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" />
              Paylaş & QR Kod
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="p-3 bg-white rounded-xl border border-border/60 shadow-sm shrink-0">
                <QRCodeSVG
                  value={publicUrl}
                  size={128}
                  level="M"
                  fgColor="#1a1410"
                  bgColor="#ffffff"
                />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <p className="text-sm font-medium">Public sayfa linki</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Müşterilerin menüyü görüp rezervasyon yapabileceği adres
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={publicUrl}
                    readOnly
                    className="text-xs font-mono h-9"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success("Link kopyalandı");
                    }}
                    title="Linki kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/r/${current.slug}`)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Sayfayı Aç
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const svg = document.querySelector(
                        "#qr-download-target svg"
                      ) as SVGElement | null;
                      if (!svg) return;
                      const data = new XMLSerializer().serializeToString(svg);
                      const blob = new Blob([data], {
                        type: "image/svg+xml;charset=utf-8",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${current.slug}-qr.svg`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("QR kod indirildi");
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    QR İndir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: current.name,
                            text: `${current.name} - Menü ve Rezervasyon`,
                            url: publicUrl,
                          })
                          .catch(() => {});
                      } else {
                        navigator.clipboard.writeText(publicUrl);
                        toast.success("Link kopyalandı (paylaşım desteklenmiyor)");
                      }
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Paylaş
                  </Button>
                </div>
              </div>
            </div>
            <div id="qr-download-target" className="hidden">
              <QRCodeSVG
                value={publicUrl}
                size={512}
                level="M"
                fgColor="#1a1410"
                bgColor="#ffffff"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Tehlikeli Bölge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Restoranı sil</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Restoran ve tüm bağlı veriler (menü, masalar, rezervasyonlar)
                  kalıcı olarak silinir.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                onClick={() => setDeleteOpen(true)}
              >
                Sil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky save action bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 z-30 border-t border-border bg-background/90 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Değişiklikler otomatik kaydedilmez — kaydetmeyi unutma
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="h-10"
            >
              İptal
            </Button>
            <Button
              size="lg"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="h-10 shadow-md"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Değişiklikleri Kaydet
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restoranı kalıcı olarak sil
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{current.name}</strong> restoranını ve tüm verilerini
              (menü, masalar, rezervasyonlar) silmek üzeresin. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Evet, sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
