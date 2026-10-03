export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

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
  coverImage: string | null;
  logoImage: string | null;
  openTime: string | null;
  closeTime: string | null;
  currency: string;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    menuItems: number;
    tables: number;
    reservations: number;
  };
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  restaurantId: string;
  _count?: { menuItems: number };
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
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
  | "cleaning";

export type Table = {
  id: string;
  name: string;
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
  partySize: number;
  date: string;
  time: string;
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
