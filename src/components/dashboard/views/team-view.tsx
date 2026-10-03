"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  UserCog,
  Mail,
  Loader2,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useAuthStore } from "@/stores/auth-store";
import type { RestaurantRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getInitials } from "@/lib/format";
import { toast } from "sonner";

const ROLE_META: Record<
  RestaurantRole,
  {
    label: string;
    icon: typeof Crown;
    className: string;
    avatarClass: string;
  }
> = {
  owner: {
    label: "Sahip",
    icon: Crown,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    avatarClass: "bg-amber-500/15 text-amber-600",
  },
  manager: {
    label: "Yönetici",
    icon: Shield,
    className: "bg-primary/10 text-primary border-primary/30",
    avatarClass: "bg-primary/15 text-primary",
  },
  staff: {
    label: "Personel",
    icon: UserCog,
    className: "bg-muted text-muted-foreground border-border",
    avatarClass: "bg-muted text-muted-foreground",
  },
};

const MANAGER_STAFF_ROLES: RestaurantRole[] = ["manager", "staff"];

export function TeamView() {
  const { current } = useRestaurantStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isOwner = current?.userRole === "owner";

  const { data, isLoading } = useQuery({
    queryKey: ["members", current?.id],
    queryFn: () => api.listMembers(current!.id),
    enabled: !!current,
  });

  const members = data?.members ?? [];

  const updateRole = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: RestaurantRole;
    }) => api.updateMember(current!.id, memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Üye rolü güncellendi");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) =>
      api.removeMember(current!.id, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Üye kaldırıldı");
      setRemoveTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!current) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ekip
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Restoran ekibini yönet — rolleri ata, üye davet et
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1" />
            Üye Ekle
          </Button>
        )}
      </div>

      {/* Current user's role banner */}
      <Card className="border-primary/30 bg-primary/5 mb-5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              Bu restorandaki rolün
            </p>
            <p className="text-xs text-muted-foreground">
              {current.name}
            </p>
          </div>
          <Badge className={`gap-1 ${ROLE_META[current.userRole ?? "staff"].className}`}>
            {(() => {
              const Icon = ROLE_META[current.userRole ?? "staff"].icon;
              return <Icon className="w-3 h-3" />;
            })()}
            {ROLE_META[current.userRole ?? "staff"].label}
          </Badge>
        </CardContent>
      </Card>

      {!isOwner && (
        <Card className="border-amber-500/40 bg-amber-500/5 mb-5">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-500">
              Bu sayfayı görüntüleme yetkiniz yok. Ekip listesi salt okunur
              olarak gösteriliyor. Üye eklemek, rol değiştirmek veya kaldırmak
              için restoran sahibi olmanız gerekir.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Ekip Üyeleri
            <Badge variant="secondary" className="ml-1">
              {members.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center px-6">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium">Henüz ekip üyesi yok</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isOwner
                  ? "İlk üyeyi ekleyerek ekibini oluşturmaya başla"
                  : "Restoran sahibi üye ekleyebilir"}
              </p>
              {isOwner && (
                <Button
                  className="mt-4"
                  onClick={() => setAddOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Üye Ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              <AnimatePresence initial={false}>
                {members.map((m, idx) => {
                  const isMemberOwner = m.role === "owner";
                  const isCurrentUser = m.userId === user?.id;
                  const meta = ROLE_META[m.role];
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className={meta.avatarClass}>
                          {getInitials(m.user?.name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">
                            {m.user?.name ?? "Bilinmeyen kullanıcı"}
                          </p>
                          {isCurrentUser && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5"
                            >
                              Sen
                            </Badge>
                          )}
                          {isMemberOwner && (
                            <Badge
                              className={`text-[10px] py-0 px-1.5 gap-0.5 ${meta.className}`}
                            >
                              <Crown className="w-2.5 h-2.5" />
                              Sahip
                            </Badge>
                          )}
                        </div>
                        {m.user?.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <Mail className="w-3 h-3" />
                            {m.user.email}
                          </p>
                        )}
                      </div>

                      {/* Role controls */}
                      {isOwner && !isMemberOwner ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={m.role}
                            onValueChange={(v) =>
                              updateRole.mutate({
                                memberId: m.id,
                                role: v as RestaurantRole,
                              })
                            }
                            disabled={updateRole.isPending}
                          >
                            <SelectTrigger className="h-9 w-[140px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MANAGER_STAFF_ROLES.map((r) => {
                                const M = ROLE_META[r];
                                const MIcon = M.icon;
                                return (
                                  <SelectItem key={r} value={r}>
                                    <span className="flex items-center gap-2">
                                      <MIcon className="w-3 h-3" />
                                      {M.label}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setRemoveTarget({
                                id: m.id,
                                name: m.user?.name ?? "Bu üye",
                              })
                            }
                            title="Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          className={`gap-1 shrink-0 ${meta.className}`}
                          variant="outline"
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        restaurantId={current.id}
      />

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Üyeyi kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removeTarget?.name}</strong> adlı üyeyi restoran
              ekibinden kaldırmak istediğine emin misin? Üye restoran verilerine
              erişimini kaybedecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeMember.isPending}
              onClick={() => {
                if (removeTarget) removeMember.mutate(removeTarget.id);
              }}
            >
              {removeMember.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Kaldır
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddMemberDialog({
  open,
  onOpenChange,
  restaurantId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  restaurantId: string;
}) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RestaurantRole>("staff");
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setEmail("");
      setRole("staff");
    }
  }

  const mutation = useMutation({
    mutationFn: () => api.addMember(restaurantId, email.trim(), role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Üye eklendi");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Üye Ekle</DialogTitle>
          <DialogDescription>
            E-posta adresiyle yeni üye davet et. Kullanıcının önceden kayıt
            olmuş olması gerekir.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="uye@restoran.com"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as RestaurantRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANAGER_STAFF_ROLES.map((r) => {
                  const M = ROLE_META[r];
                  const MIcon = M.icon;
                  return (
                    <SelectItem key={r} value={r}>
                      <span className="flex items-center gap-2">
                        <MIcon className="w-3.5 h-3.5" />
                        {M.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "manager"
                ? "Yönetici; menü, masa, rezervasyon ve restoran ayarlarını düzenleyebilir."
                : "Personel; rezervasyon oluşturup düzenleyebilir. Ayarları değiştiremez."}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!email.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-1" />
            )}
            Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
