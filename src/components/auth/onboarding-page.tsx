"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Store,
  Phone,
  MapPin,
  Clock,
  Utensils,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "@/lib/router";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Restoran adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { load, setCurrent } = useRestaurantStore();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      cuisine: "",
      phone: "",
      address: "",
      city: "",
      openTime: "12:00",
      closeTime: "23:00",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.createRestaurant(data),
    onSuccess: async ({ restaurant }) => {
      await load();
      setCurrent(restaurant);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`"${restaurant.name}" oluşturuldu!`);
      navigate("/dashboard");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border/60 flex items-center justify-between px-4 sm:px-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              İlk restoranını ekle
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Restoranını tanıtalım
            </h1>
            <p className="mt-2 text-muted-foreground">
              Bu bilgileri istediğin zaman ayarlardan düzenleyebilirsin
            </p>
          </div>

          <Card className="border-border/60 shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <form
                onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Restoran Adı <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Le Petit Bistro"
                      className="pl-9"
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mutfak Türü</label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="İtalyan, Fransız..."
                        className="pl-9"
                        {...form.register("cuisine")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="+90 212 ..."
                        className="pl-9"
                        {...form.register("phone")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Açıklama</label>
                  <Textarea
                    placeholder="Restoranınızı kısaca tanıtın..."
                    rows={3}
                    {...form.register("description")}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adres</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Mahalle, sokak..."
                        className="pl-9"
                        {...form.register("address")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Şehir</label>
                    <Input
                      placeholder="İstanbul"
                      {...form.register("city")}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Açılış Saati</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        className="pl-9"
                        {...form.register("openTime")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kapanış Saati</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        className="pl-9"
                        {...form.register("closeTime")}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Oluşturuluyor..."
                    : "Restoranı Oluştur ve Devam Et"}
                  {!mutation.isPending && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
