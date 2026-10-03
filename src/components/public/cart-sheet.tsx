"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Utensils,
  Package,
  User,
  Phone,
  Hash,
  StickyNote,
} from "lucide-react";
import { api } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { ORDER_TYPE } from "@/lib/constants";
import { toast } from "sonner";

export function CartButton({ slug }: { slug: string }) {
  const items = useCartStore((s) => s.items);
  const setRestaurant = useCartStore((s) => s.setRestaurant);
  useEffect(() => {
    setRestaurant(slug);
  }, [slug, setRestaurant]);
  const [open, setOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  if (cartCount === 0) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center gap-2 font-medium"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Sepet</span>
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary-foreground/20 text-xs font-bold tabular-nums">
          {cartCount}
        </span>
      </motion.button>
      <CartSheet open={open} onOpenChange={setOpen} slug={slug} />
    </>
  );
}

function CartSheet({
  open,
  onOpenChange,
  slug,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slug: string;
}) {
  const { items, total, count, updateQuantity, remove, clear } = useCartStore();
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.publicOrder({
        restaurantSlug: slug,
        customerName,
        customerPhone: customerPhone || null,
        tableNumber: orderType === "dine_in" ? tableNumber || null : null,
        orderType,
        notes: notes || null,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          notes: i.notes || null,
        })),
      }),
    onSuccess: () => {
      setStep("success");
      clear();
      toast.success("Siparişin alındı!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!customerName) {
      toast.error("Lütfen ad soyad gir");
      return;
    }
    mutation.mutate();
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      // Reset to cart step when closing
      setTimeout(() => setStep("cart"), 300);
    }
    onOpenChange(v);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 py-4 border-b border-border/60">
          <SheetTitle className="flex items-center gap-2">
            {step === "success" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Sipariş Alındı
              </>
            ) : step === "checkout" ? (
              <>
                <ShoppingBag className="w-5 h-5 text-primary" />
                Sipariş Bilgileri
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 text-primary" />
                Sepetim
                <Badge variant="secondary" className="ml-1">{count()}</Badge>
              </>
            )}
          </SheetTitle>
          <SheetDescription>
            {step === "success"
              ? "Siparişin restorana iletildi"
              : step === "checkout"
              ? "Teslimat bilgilerini gir"
              : `${count()} ürün · Toplam ${formatPrice(total())}`}
          </SheetDescription>
        </SheetHeader>

        {/* Success step */}
        {step === "success" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-bold">Siparişin alındı! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Siparişin restorana iletildi. Hazır olduğunda sizinle
              iletişime geçilecek.
            </p>
            <Button className="mt-6 w-full" onClick={() => handleClose(false)}>
              Menüye Dön
            </Button>
          </div>
        ) : step === "checkout" ? (
          /* Checkout step */
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
            {/* Order type toggle */}
            <div className="space-y-2">
              <Label>Sipariş Tipi</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType("dine_in")}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    orderType === "dine_in"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Utensils className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Burada Yenir</span>
                </button>
                <button
                  onClick={() => setOrderType("takeaway")}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    orderType === "takeaway"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Paket</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Adınız"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefon (opsiyonel)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+90 5xx"
                  className="pl-9"
                />
              </div>
            </div>

            {orderType === "dine_in" && (
              <div className="space-y-2">
                <Label>Masa Numarası</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="5"
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Sipariş Notu (opsiyonel)</Label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Acılı olmasın, soğansız..."
                  rows={2}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="rounded-lg border border-border/60 p-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Sipariş Özeti
              </p>
              <div className="space-y-1.5">
                {items.map((i) => (
                  <div key={i.menuItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {i.quantity}× {i.name}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/60 mt-2 pt-2 flex justify-between font-bold">
                <span>Toplam</span>
                <span className="text-primary tabular-nums">
                  {formatPrice(total())}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Cart step */
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="font-medium">Sepetin boş</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Menüden ürün ekleyerek başla
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((i) => (
                    <motion.div
                      key={i.menuItemId}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 p-2.5 rounded-lg border border-border/60"
                    >
                      {i.imageUrl ? (
                        <img
                          src={i.imageUrl}
                          alt={i.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5 text-primary/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{i.name}</p>
                        <p className="text-xs text-primary font-semibold tabular-nums">
                          {formatPrice(i.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => updateQuantity(i.menuItemId, i.quantity - 1)}
                            className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium tabular-nums w-6 text-center">
                            {i.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(i.menuItemId, i.quantity + 1)}
                            className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => remove(i.menuItemId)}
                            className="ml-auto p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums">
                          {formatPrice(i.price * i.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {step !== "success" && items.length > 0 && (
          <SheetFooter className="px-5 py-4 border-t border-border/60">
            {step === "checkout" ? (
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Toplam</span>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {formatPrice(total())}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("cart")}
                    disabled={mutation.isPending}
                  >
                    Geri
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={!customerName || mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        Siparişi Gönder
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Toplam</span>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {formatPrice(total())}
                  </span>
                </div>
                <Button
                  className="w-full h-11"
                  onClick={() => setStep("checkout")}
                >
                  Siparişi Tamamla
                  <ShoppingBag className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
