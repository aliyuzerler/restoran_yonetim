"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
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

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.login(data.email, data.password),
    onMutate: () => setError(null),
    onSuccess: ({ user }) => {
      setUser(user);
      toast.success(`Hoş geldin, ${user.name}!`);
      navigate("/dashboard");
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
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Ana sayfa
                </button>
              </div>
              <CardTitle className="text-2xl">Tekrar hoş geldin</CardTitle>
              <CardDescription>
                Devam etmek için hesabına giriş yap
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
                        <p className="font-medium text-destructive">Giriş başarısız</p>
                        <p className="text-destructive/80 text-xs mt-0.5">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-destructive/60 hover:text-destructive shrink-0"
                        aria-label="Kapat"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
                className="space-y-4"
              >
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Şifre</label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Şifremi unuttum
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {form.formState.errors.password.message}
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
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      Giriş Yap
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Demo hesabı
                </p>
                <p className="mt-1 text-muted-foreground">
                  E-posta: <span className="font-mono">demo@restoran.app</span>
                  <br />
                  Şifre: <span className="font-mono">demo1234</span>
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Hesabın yok mu?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-primary hover:underline"
                >
                  Hemen kayıt ol
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
