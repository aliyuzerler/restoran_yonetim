"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  ArrowLeft as ArrowBack,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  Copy,
  ExternalLink,
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

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.forgotPassword(data.email),
    onMutate: () => setError(null),
    onSuccess: (res) => {
      setSent(true);
      if (res.devToken) setDevToken(res.devToken);
    },
    onError: (e: Error) => setError(e.message),
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
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Girişe dön
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Şifremi unuttum</CardTitle>
                  <CardDescription>
                    E-posta adresini gir, sıfırlama bağlantısı gönderelim
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
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
                    <h3 className="text-lg font-semibold">Bağlantı gönderildi</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      Eğer <strong>{form.getValues("email")}</strong> adresi
                      sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı
                      gönderilmiştir.
                    </p>

                    {/* Dev mode: show the reset link directly */}
                    {devToken && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-left"
                      >
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Geliştirme modu
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          E-posta sağlayıcısı olmadığı için sıfırlama bağlantısı
                          burada gösteriliyor:
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Input
                            readOnly
                            value={devToken}
                            className="text-xs font-mono h-8"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(devToken);
                              toast.success("Token kopyalandı");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() =>
                            navigate(`/reset-password/${devToken}`)
                          }
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Sıfırlama sayfasına git
                        </Button>
                      </motion.div>
                    )}

                    <Button
                      variant="outline"
                      className="mt-5 w-full"
                      onClick={() => navigate("/login")}
                    >
                      <ArrowBack className="w-4 h-4 mr-1.5" />
                      Girişe dön
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                              <p className="font-medium text-destructive">Hata</p>
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
                        <label className="text-sm font-medium">E-posta</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="ornek@restoran.com"
                            className={`pl-9 ${
                              form.formState.errors.email
                                ? "border-destructive/50 focus-visible:ring-destructive/20"
                                : ""
                            }`}
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

                      <Button
                        type="submit"
                        className="w-full h-11 group"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            Sıfırlama Bağlantısı Gönder
                            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Hesabın yok mu?{" "}
                      <button
                        onClick={() => navigate("/register")}
                        className="font-medium text-primary hover:underline"
                      >
                        Hemen kayıt ol
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
