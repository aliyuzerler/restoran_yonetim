"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "@/lib/router";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { toast } from "sonner";

const schema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string().min(1, "Şifre tekrar gerekli"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function getPasswordStrength(pw: string): {
  score: number; // 0-4
  label: string;
  color: string;
  checks: { label: string; ok: boolean }[];
} {
  const checks = [
    { label: "En az 6 karakter", ok: pw.length >= 6 },
    { label: "Büyük harf", ok: /[A-ZĞÜŞİÖÇ]/.test(pw) },
    { label: "Küçük harf", ok: /[a-zğüşıöç]/.test(pw) },
    { label: "Rakam", ok: /\d/.test(pw) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const labels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
  const colors = [
    "bg-muted",
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-emerald-500",
  ];
  return { score, label: labels[score], color: colors[score], checks };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = form.watch("password");
  const strength = useMemo(() => getPasswordStrength(password ?? ""), [password]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api.register(data.name, data.email, data.password),
    onMutate: () => setError(null),
    onSuccess: ({ user }) => {
      setUser(user);
      setSuccess(true);
      toast.success(`Hoş geldin, ${user.name}! İlk restoranını ekleyelim.`);
      // brief success state before redirect
      setTimeout(() => navigate("/onboarding"), 600);
    },
    onError: (e: Error) => {
      setError(e.message);
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background bg-mesh">
      <header className="h-16 border-b border-border/60 flex items-center px-4 sm:px-6">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <Logo />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/60 shadow-xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Ana sayfa
                </button>
              </div>
              <CardTitle className="text-2xl">Ücretsiz hesap oluştur</CardTitle>
              <CardDescription>
                Restoranını yönetmeye dakikalar içinde başla
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Inline error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">Kayıt başarısız</p>
                        <p className="text-destructive/80 text-xs mt-0.5">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-destructive/60 hover:text-destructive shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success banner */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">
                        Hesabın oluşturuldu! Yönlendiriliyorsun...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ad Soyad</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Ayşe Yılmaz"
                      className={`pl-9 ${form.formState.errors.name ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
                      disabled={mutation.isPending}
                      {...form.register("name")}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="ornek@restoran.com"
                      className={`pl-9 ${form.formState.errors.email ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
                      disabled={mutation.isPending}
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="En az 6 karakter"
                      className={`pl-9 pr-9 ${form.formState.errors.password ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
                      disabled={mutation.isPending}
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {password && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < strength.score ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground w-10 text-right">
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                        {strength.checks.map((c) => (
                          <div
                            key={c.label}
                            className={`flex items-center gap-1 text-[10px] ${
                              c.ok ? "text-emerald-600" : "text-muted-foreground"
                            }`}
                          >
                            {c.ok ? (
                              <Check className="w-2.5 h-2.5" />
                            ) : (
                              <X className="w-2.5 h-2.5" />
                            )}
                            {c.label}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifre Tekrar</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Şifreni tekrar gir"
                      className={`pl-9 pr-9 ${
                        form.formState.errors.confirmPassword
                          ? "border-destructive/50 focus-visible:ring-destructive/20"
                          : form.formState.touchedFields.confirmPassword &&
                            !form.formState.errors.confirmPassword
                          ? "border-emerald-500/50"
                          : ""
                      }`}
                      disabled={mutation.isPending}
                      {...form.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Gizle" : "Göster"}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                  {form.formState.touchedFields.confirmPassword &&
                    !form.formState.errors.confirmPassword &&
                    confirmPassword(form.getValues()) && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Şifreler eşleşiyor
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 group"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Hesap oluşturuluyor...
                    </>
                  ) : (
                    <>
                      Hesap Oluştur
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">
                  Kayıt olarak{" "}
                  <a href="#terms" className="underline hover:text-foreground">
                    Kullanım Şartları
                  </a>{" "}
                  ve{" "}
                  <a href="#privacy" className="underline hover:text-foreground">
                    Gizlilik Politikası
                  </a>
                  'nı kabul etmiş olursun.
                </p>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Zaten hesabın var mı?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-medium text-primary hover:underline"
                >
                  Giriş yap
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function confirmPassword(values: { password?: string; confirmPassword?: string }) {
  return (
    !!values.confirmPassword &&
    values.password === values.confirmPassword
  );
}
