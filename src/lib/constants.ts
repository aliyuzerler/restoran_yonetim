import type { ReservationStatus, TableStatus } from "./types";

export const RESERVATION_STATUS: Record<
  ReservationStatus,
  { label: string; color: string; description: string }
> = {
  pending: {
    label: "Beklemede",
    color: "#f59e0b",
    description: "Onay bekleyen talep",
  },
  confirmed: {
    label: "Onaylandı",
    color: "#10b981",
    description: "Onaylanmış rezervasyon",
  },
  seated: {
    label: "Masada",
    color: "#3b82f6",
    description: "Müşteri masaya oturdu",
  },
  completed: {
    label: "Tamamlandı",
    color: "#6b7280",
    description: "Tamamlanmış ziyaret",
  },
  cancelled: {
    label: "İptal",
    color: "#ef4444",
    description: "İptal edilmiş rezervasyon",
  },
  no_show: {
    label: "Gelmedi",
    color: "#8b5cf6",
    description: "Müşteri gelmedi",
  },
};

export const RESERVATION_STATUS_ORDER: ReservationStatus[] = [
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
];

// The 4 spec statuses for the reservations management UI
// (Pending, Confirmed, Cancelled, Completed). Seated/no_show are kept as
// extended statuses but the primary quick-status menu shows these four.
export const RESERVATION_STATUS_SPEC: ReservationStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

export const TABLE_STATUS: Record<
  TableStatus,
  { label: string; color: string; dot: string }
> = {
  available: {
    label: "Müsait",
    color: "#10b981",
    dot: "bg-emerald-500",
  },
  occupied: {
    label: "Dolu",
    color: "#ef4444",
    dot: "bg-rose-500",
  },
  reserved: {
    label: "Rezerve",
    color: "#f59e0b",
    dot: "bg-amber-500",
  },
  cleaning: {
    label: "Temizlik",
    color: "#6b7280",
    dot: "bg-gray-500",
  },
  inactive: {
    label: "Pasif",
    color: "#9ca3af",
    dot: "bg-gray-400",
  },
};

export const TIME_SLOTS: string[] = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00",
];
