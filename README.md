# Tablo — Restoran Yönetim Platformu

Modern restoran yönetim SaaS uygulaması. Menü, masalar, rezervasyonlar, siparişler ve public restoran sayfalarını tek bir platformdan yönetin.

## 🚀 Özellikler

### Restoran Yönetim Paneli (`/admin`)
- **Dashboard** — Bugünkü rezervasyonlar, aktif masalar, menü ürünleri, misafir sayısı + grafikler
- **Rezervasyonlar** — Tablo görünümü, durum yönetimi (Pending/Confirmed/Cancelled/Completed), filtreler (Bugün/Yarın/Bu hafta/Tarih seç)
- **Siparişler** — Online sipariş takibi (real-time polling), durum yönetimi (Beklemede→Hazırlanıyor→Hazır→Tamamlandı)
- **Masalar** — Kart/grid görünümü, hızlı durum değiştirme (Müsait/Dolu/Rezerve/Pasif)
- **Menü** — Kategori + ürün CRUD, drag/drop kategori sıralama, fotoğraf yükleme, Aktif/Pasif
- **Takvim** — Aylık rezervasyon görünümü, yoğunluk renk kodlaması
- **Analitik** — Gelir, misafir, dönüşüm oranı, yoğun saatler, popüler ürünler
- **Ekip** — Üye yönetimi (owner/manager/staff rolleri)
- **Restoran Ayarları** — Profil, iletişim, saatler, görseller, QR kod paylaşımı

### Public Restoran Sayfası (`/r/:slug`)
- Restoran logo, cover, adı, açıklama, telefon, adres
- Kategori bazlı menü (fotoğraf, isim, açıklama, fiyat)
- **Online sipariş** — Sepet + checkout (Burada Yenir/Paket)
- **Rezervasyon** — Tarih, saat, kişi sayısı ile rezervasyon talebi
- Sticky kategori navigasyonu
- SEO optimizasyonu (dynamic title, OG tags, JSON-LD Restaurant schema)

### Landing Page
- Premium SaaS tasarım (Linear/Vercel/Stripe inspired)
- Framer Motion animasyonlar (hero, scroll reveal, micro interactions)
- Bölümler: Hero, Features, How It Works, Dashboard Preview, CTA, Footer

### Auth
- Kayıt / Giriş / Şifremi Unuttum / Şifre Sıfırlama
- HttpOnly cookie session (bcrypt)
- Şifre güçlendirme göstergesi, şifre tekrar validasyonu
- Loading/error/success state'leri

## 🛠 Teknoloji Stack

- **Framework**: Next.js 16 (App Router)
- **Dil**: TypeScript 5
- **Stil**: Tailwind CSS 4 + shadcn/ui (New York)
- **Animasyon**: Framer Motion
- **State**: Zustand (client) + TanStack Query (server)
- **Form**: React Hook Form + Zod
- **Veritabanı**: Prisma ORM + SQLite
- **Auth**: bcryptjs + httpOnly cookie session
- **İkonlar**: Lucide React
- **Grafikler**: Recharts
- **Drag/Drop**: @dnd-kit
- **QR Kod**: qrcode.react

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
bun install

# Veritabanı şemasını uygula
bun run db:push

# Demo veriyi yükle (opsiyonel)
curl -X POST http://localhost:3000/api/seed

# Dev sunucusunu başlat
bun run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## 🔑 Demo Hesaplar

Seed sonrası oluşturulan demo hesaplar:

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Owner | demo@restoran.app | demo1234 |
| Staff | garson@lepetitbistro.com | staff1234 |

Demo restoran: `/#/r/le-petit-bistro`

## 📂 Proje Yapısı

```
src/
├── app/
│   ├── api/              # API routes (auth, restaurants, reservations, orders, etc.)
│   ├── globals.css       # Global styles + design tokens
│   ├── layout.tsx        # Root layout + SEO metadata
│   └── page.tsx          # Hash router orchestrator
├── components/
│   ├── ui/               # shadcn/ui components + state-views
│   ├── layout/           # Logo, footer
│   ├── landing/          # Landing page sections
│   ├── auth/             # Login, register, forgot/reset password, onboarding
│   ├── dashboard/        # Dashboard shell + views (overview, reservations, orders, tables, menu, calendar, analytics, team, settings)
│   ├── public/           # Public restaurant page + cart sheet
│   └── providers/        # QueryClient, Theme, Toaster providers
├── lib/                  # api.ts, auth.ts, db.ts, types.ts, constants.ts, format.ts, router.tsx, supabase.ts
├── services/             # Service layer (auth, restaurant, reservation, menu, table)
├── hooks/                # React hooks (useAuth, useReservations, useMenu, useTables, useRestaurant)
├── stores/               # Zustand stores (auth, restaurant, cart)
├── types/                # Type re-exports
└── utils/                # Utility re-exports
```

## 🚀 GitHub Pages Deployment

```bash
# Static build
bun run build:static

# Output: ./out
```

GitHub Actions workflow (`.github/workflows/deploy.yml`) otomatik deployment sağlar.

**Repo ayarları:**
1. Settings → Pages → Source = "GitHub Actions"
2. Secrets: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH` (repo pages için)

## 📜 Komutlar

| Komut | Açıklama |
|-------|----------|
| `bun run dev` | Dev sunucusu (port 3000) |
| `bun run build` | Production build (standalone) |
| `bun run build:static` | Static export (GitHub Pages) |
| `bun run lint` | ESLint |
| `bun run db:push` | Şema'yı veritabanına uygula |
| `bun run db:generate` | Prisma client oluştur |

## 🌐 Supabase Geçişi

Proje Prisma + SQLite ile çalışır. Supabase'e geçiş için:
1. `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var'ları set et
2. `src/lib/supabase.ts` client otomatik aktive olur
3. `src/services/` katmanı Supabase çağrılarına yönlendirilir (API contract aynı kalır)

## 📄 Lisans

MIT
