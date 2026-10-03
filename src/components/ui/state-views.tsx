"use client";

/**
 * Reusable loading / error / empty state components.
 * Use these for consistent state handling across all data-driven views.
 */
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

/** Full loading spinner with optional message. */
export function LoadingState({
  message = "Yükleniyor...",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <Loader2 className="w-7 h-7 animate-spin text-primary" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Error state with retry button. */
export function ErrorState({
  message = "Bir hata oluştu",
  onRetry,
  className = "",
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <p className="font-medium text-sm">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Lütfen daha sonra tekrar dene.
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Tekrar dene
        </Button>
      )}
    </div>
  );
}

/** Empty state with optional icon, title, description, and action button. */
export function EmptyState({
  icon: Icon = Inbox,
  title = "Henüz kayıt yok",
  description,
  actionLabel,
  onAction,
  className = "",
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <Card className={`border-dashed border-border/60 ${className}`}>
      <CardContent className="py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18 }}
          className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4"
        >
          <Icon className="w-7 h-7 text-primary/40" />
        </motion.div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/** Skeleton grid for loading card lists. */
export function SkeletonGrid({
  count = 6,
  className = "h-32",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} bg-muted/50 rounded-xl animate-pulse`}
        />
      ))}
    </div>
  );
}

/**
 * Smart wrapper that renders loading/error/empty/data states automatically.
 * Usage:
 *   <QueryState isLoading={isLoading} isError={isError} isEmpty={items.length===0}
 *     emptyTitle="Henüz ürün yok" onRetry={refetch}>
 *     {items.map(...)}
 *   </QueryState>
 */
export function QueryState({
  isLoading,
  isError,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  children,
  skeleton,
  skeletonCount,
  skeletonClassName,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  skeletonCount?: number;
  skeletonClassName?: string;
}) {
  if (isLoading) {
    return skeleton ?? <SkeletonGrid count={skeletonCount} className={skeletonClassName} />;
  }
  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }
  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }
  return <>{children}</>;
}
