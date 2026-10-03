"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  X,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "@/lib/router";
import { api } from "@/lib/api";
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
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string().min(1, "Şifre tekrar gerekli"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function getStrength(pw: string) {
  const checks = [
    { label: "En az 6 karakter", ok: pw.length >= 6 },
    { label: "Büyük harf", ok: /[A-ZĞÜŞİÖÇ]/.test(pw) },
    { label: "Küçük harf", ok: /[a-zğüşıöç]/.test(pw) },
    { label: "Rakam", ok: /\d/.test(pw) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const labels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
  const colors = ["bg-muted", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];
  return { score, label: labels[score], color: colors[score], checks };
}

export function ResetPasswordPage({ token }: { token: string }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Verify token validity on mount
  const { data: verifyData, isLoading: verifying } = useQuery({
    queryKey: ["reset-token", token],
    queryFn: () => api.verifyResetToken(token),
    retry: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = form.watch("password");
  const strength = useMemo(() => getStrength(password ?? ""), [password]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api.resetPassword(token, data.password),
    onMutate: () => setError(null),
    onSuccess: () => {
      setDone(true);
      toast.success("Şifren başarıyla sıfırlandı!");
    },
    onError: (e: Error) => setError(e.message),
  });

  const invalid = !verifying && verifyData && !verifyData.valid;

  return (
    <div className="min-h-screen flex flex-col bg-background bg-mesh">
      <header className="h-16 border-b border-border/60 flex items-center px-4 sm:px-6">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <Logo />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
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
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Girişe dön
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Yeni şifre belirle</CardTitle>
                  <CardDescription>
                    Hesabın için yeni bir şifre oluştur
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Verifying state */}
              {verifying && (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground mt-3">
                    Bağlantı doğrulanıyor...
                  </p>
                </div>
              )}

              {/* Invalid/expired token */}
              {invalid && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold">Geçersiz bağlantı</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    Bu sıfırlama bağlantısı geçersiz, süresi dolmuş veya zaten
                    kullanılmış. Yeni bir bağlantı iste.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => navigate("/forgot-password")}
                  >
                    <KeyRound className="w-4 h-4 mr-1.5" />
                    Yeni bağlantı iste
                  </Button>
                </motion.div>
              )}

              {/* Success state */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold">Şifren güncellendi!</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Yeni şifrenle giriş yapabilirsin. Güvenliğin için tüm
                      aktif oturumlar sonlandırıldı.
                    </p>
                    <Button
                      className="mt-5 w-full"
                      onClick={() => navigate("/login")}
                    >
                      Giriş Yap
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form (only when token valid & not done) */}
              {!verifying && !invalid && !done && verifyData?.valid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginBottom: 16,
                        }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-destructive">
                              Sıfırlama başarısız
                            </p>
                            <p className="text-destructive/80 text-xs mt-0.5">
                              {error}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form
                    onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Yeni Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="En az 6 karakter"
                          className={`pl-9 pr-9 ${
                            form.formState.errors.password
                              ? "border-destructive/50 focus-visible:ring-destructive/20"
                              : ""
                          }`}
                          disabled={mutation.isPending}
                          {...form.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {password && (
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
                          placeholder="Yeni şifreni tekrar gir"
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
                        form.getValues("password") ===
                          form.getValues("confirmPassword") && (
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
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          Şifreyi Güncelle
                          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
