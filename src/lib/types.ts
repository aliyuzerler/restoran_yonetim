export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type RestaurantRole = "owner" | "manager" | "staff";

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  openTime: string | null;
  closeTime: string | null;
  currency: string;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  userRole?: RestaurantRole;
  _count?: {
    menuItems: number;
    tables: number;
    reservations: number;
  };
};

export type RestaurantMember = {
  id: string;
  restaurantId: string;
  userId: string;
  role: RestaurantRole;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  restaurantId: string;
  _count?: { menuItems: number };
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string | null;
  sortOrder: number;
  restaurantId: string;
  categoryId: string | null;
  category?: Category | null;
};

export type TableStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "inactive"
  | "cleaning";

export type Table = {
  id: string;
  tableNumber: string;
  capacity: number;
  location: string | null;
  status: TableStatus;
  notes: string | null;
  restaurantId: string;
};

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  notes: string | null;
  source: string;
  restaurantId: string;
  tableId: string | null;
  table?: Table | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  counts: {
    menuItems: number;
    tables: number;
    reservations: number;
    categories: number;
  };
  reservations: {
    today: number;
    pending: number;
    confirmed: number;
    byStatus: Record<string, number>;
    byDay: { date: string; count: number }[];
  };
  tablesByStatus: Record<string, number>;
  upcoming: Reservation[];
};

export type AnalyticsData = {
  currency: string;
  kpis: {
    totalGuests: number;
    completedGuests: number;
    avgPrice: number;
    estimatedRevenue: number;
    potentialRevenue: number;
    conversionRate: number;
    tableUtilization: number;
    onlineReservations: number;
    manualReservations: number;
  };
  busyHours: { slot: string; label: string; count: number }[];
  popularity: {
    id: string;
    name: string;
    price: number;
    categoryName: string;
    isFeatured: boolean;
    isAvailable: boolean;
    score: number;
  }[];
  categoryStats: {
    name: string;
    itemCount: number;
    avgPrice: number;
    featuredCount: number;
  }[];
  months: { label: string; count: number; guests: number }[];
  sources: { online: number; manual: number };
};
