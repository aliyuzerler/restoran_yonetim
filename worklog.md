# Tablo — Restoran Yönetim Platformu | Worklog

## Proje Özeti
Restoran yönetim SaaS MVP'si. Menü, masa, rezervasyon, restoran profili ve public restoran sayfasını tek web uygulamasından yönetir.

## Teknoloji Stack (Gereksinimlere Uyarlama)
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui + Framer Motion + Lucide + React Hook Form + Zod + TanStack Query + Zustand
  - *Not*: Kullanıcı Vite + React Router istedi, ancak sistem Next.js 16 gerektirdiği için App Router + hash-based client routing kullanıldı (sadece `/` route'u görünür kısıtı nedeniyle).
- **Backend**: Next.js API Routes + Prisma ORM + SQLite (Supabase yerine, çünkü Supabase credentials ortamda yok)
- **Auth**: HttpOnly cookie tabanlı session + bcryptjs (NextAuth yerine lightweight çözüm)

## Mevcut Proje Durumu (Stabil ✅)
Uygulama uçtan uca çalışıyor ve agent-browser ile doğrulandı:
- ✅ Landing page (hero, özellikler, nasıl çalışır, CTA, sticky footer)
- ✅ Auth: register / login / logout (session cookie)
- ✅ Onboarding (ilk restoran oluşturma)
- ✅ Dashboard shell (sidebar + topbar + restoran switcher + theme toggle + user menu)
- ✅ Overview: istatistik kartları, haftalık rezervasyon bar chart, masa durumu pie chart, bugünkü rezervasyonlar, özet
- ✅ Menü yönetimi: kategori + ürün CRUD, öne çıkarma, müsaitlik toggle, arama, "Diğer" grubu (kategorisiz ürünler)
- ✅ Masa yönetimi: lokasyon gruplu kartlar, hızlı durum değiştirme, CRUD
- ✅ Rezervasyon yönetimi: filtreler (tümü/bugün/bekleyen/onaylı/yaklaşan), tarih gruplu liste, durum değiştirme, CRUD, online kaynak rozeti
- ✅ Restoran ayarları: temel bilgiler, iletişim, saatler, görseller, görünürlük, silme
- ✅ Public restoran sayfası: kapak + bilgi + şefin önerileri + kategori gruplu menü + rezervasyon formu
- ✅ Public rezervasyon → dashboard'da "Online" rozetiyle görünür
- ✅ Dark mode
- ✅ Demo veri seed API (`/api/seed`) — demo@restoran.app / demo1234

## Doğrulama Sonuçları (agent-browser)
1. Landing page render ✓ (tüm bölümler, animasyonlar)
2. Public sayfa `/r/le-petit-bistro` ✓ (menü, featured, rezervasyon formu)
3. Login demo@restoran.app ✓ → dashboard'a yönlendirme
4. Dashboard overview ✓ (stats, charts, upcoming)
5. Menü sekmesi ✓ (5 kategori + ürünler)
6. Masalar sekmesi ✓ (lokasyon gruplu, durum select)
7. Rezervasyon sekmesi ✓ (filtreler, tarih gruplu)
8. Ayarlar sekmesi ✓ (tüm alanlar, public link)
9. Public rezervasyon oluşturma ✓ → dashboard'da göründü (Bugün 3→4)
10. Dark mode toggle ✓
11. Menüye yeni ürün ekleme ✓ (kategorisiz ürün "Diğer" grubunda düzeltildi)
12. Lint temiz, dev log'da runtime hatası yok

## Dosya Yapısı
```
prisma/schema.prisma              # User, Session, Restaurant, Category, MenuItem, Table, Reservation
src/lib/auth.ts                   # session/cookie/bcrypt
src/lib/db.ts                     # prisma client
src/lib/slug.ts                   # slugify + unique
src/lib/api.ts                    # fetch wrapper (tüm API çağrıları)
src/lib/types.ts                  # TS tipleri
src/lib/format.ts                 # fiyat/tarih formatlama
src/lib/constants.ts              # durum etiket/renkleri, time slots
src/lib/router.tsx                # hash-based client router
src/stores/auth-store.ts          # zustand auth
src/stores/restaurant-store.ts    # zustand restoran seçici
src/app/api/auth/{register,login,logout,me}/route.ts
src/app/api/restaurants/route.ts + [id]/route.ts
src/app/api/categories/route.ts + [id]/route.ts
src/app/api/menu-items/route.ts + [id]/route.ts
src/app/api/tables/route.ts + [id]/route.ts
src/app/api/reservations/route.ts + [id]/route.ts
src/app/api/dashboard/route.ts
src/app/api/seed/route.ts
src/app/api/public/restaurants/[slug]/route.ts
src/app/api/public/reservations/route.ts
src/components/landing/landing-page.tsx
src/components/auth/{login,register,onboarding}-page.tsx
src/components/dashboard/dashboard-shell.tsx
src/components/dashboard/views/{overview,menu,tables,reservations,settings}-view.tsx
src/components/public/public-restaurant-page.tsx
src/components/layout/{logo,footer}.tsx
src/components/providers/{providers,app-loader}.tsx
```

## Çözülmemiş Sorular / Riskler
- **Supabase**: Kullanıcı Supabase istedi ancak credentials yok. Prisma+SQLite kullanıldı. İleride Supabase'e geçiş için sadece `src/lib/db.ts` ve `src/lib/auth.ts` değiştirilmeli; API rotaları aynı kalır.
- **Routing**: Hash-based routing (`/#/dashboard/menu`) kullanıldı çünkü sadece `/` route'u görünür. Next.js App Router route'ları yerine tek sayfa SPA.
- **Görsel yükleme**: Görsel alanları URL tabanlı. Supabase Storage entegrasyonu ileride eklenebilir.

## Sonraki Aşama Önerileri
1. Rezervasyon takvim (aylık görünüm) ekle
2. Masa kat planı (görsel drag-drop düzenleme)
3. QR kod ile public sayfa paylaşımı
4. Rezervasyon bildirimleri (e-posta)
5. Çoklu dil (i18n) — arayüz zaten Türkçe
6. Satış/istatistik raporları (menü popülerliği)
7. Personel/rol yönetimi (owner/staff)

---
Task ID: webDevReview-1
Agent: webDevReview (cron)
Task: QA testi via agent-browser + bug fix + yeni özellikler (takvim, analitik, QR paylaşım)

Work Log:
- worklog.md okundu, mevcut durum stable olarak değerlendirildi
- agent-browser + VLM (z-ai vision) ile 8 ekran görüntüsü alınıp analiz edildi
- Tespit edilen QA sorunları:
  1. Settings sayfasında sticky "Kaydet" butonu içeriği örtüyordu (critical z-index/positioning bug)
  2. Dashboard bar chart alttan kesiliyordu (margin/grid eksik)
  3. Menü kartında uzun isimler "truncate" ile kesiliyordu
  4. Sidebar inactive item kontrastı düşüktü
- Bug fix'ler uygulandı:
  - Settings: sticky floating button → fixed bottom action bar (backdrop blur + border + İptal butonu)
  - Overview: BarChart'a CartesianGrid, gradient fill, margin, dy eklendi
  - Menu ItemCard: truncate → line-clamp-2 (uzun isimler artık 2 satıra kayıyor)
  - Sidebar: inactive items `text-foreground/70`, ikonlar `text-muted-foreground` ile kontrast artırıldı
- Yeni özellikler eklendi:
  1. **Rezervasyon Takvimi** (calendar-view): Aylık grid, günlük rezervasyon sayısı, yoğunluk renk intensity'si (az/orta/yoğun), güne tıklayınca o günün rezervasyonlarını gösteren dialog, ay navigasyonu, Bugün butonu, ay bazlı istatistik (rezervasyon/misafir sayısı), doluluk legend'i
  2. **Analitik sayfası** (analytics-view): 4 KPI kartı (tahmini gelir, misafir, dönüşüm oranı, masa doluluk), aylık trend area chart (2 seri: rezervasyon + misafir), kaynak dağılımı donut chart (online vs manuel), yoğun saatler bar chart, popüler ürünler listesi (medalya sıralaması), kategori dağılımı progress bar'lar, altta 3 ek KPI kartı
  3. **QR kod paylaşımı** (settings içinde): QRCodeSVG ile public link QR'ı, linki kopyala, QR SVG indir, native Paylaş API, sayfayı aç butonu
- Backend:
  - `/api/analytics` endpoint eklendi (popülerlik skorlama, gelir tahmini, yoğun saatler, aylık trend, kaynak dağılımı, kategori istatistikleri)
  - Gelir hesabı: realized (confirmed+seated+completed) ve potential (all) olarak ayrıldı
- Tipler: AnalyticsData tipi eklendi, api.ts'e analytics metodu eklendi
- qrcode.react paketi kuruldu (qrcode.react@4.2.0)

Stage Summary:
- ✅ Tüm 7 dashboard sekmesi yükleniyor ve render oluyor (Genel Bakış, Menü, Masalar, Rezervasyonlar, Takvim, Analitik, Ayarlar)
- ✅ Settings kritik bug düzeltildi: kaydet butonu artık içeriği örtmüyor (DOM ölçümü ile doğrulandı: gap 465px)
- ✅ QR kod render oluyor, link kopyalama çalışıyor
- ✅ Takvim: güne tıklayınca o günün 4 rezervasyonu dialog'da gösteriliyor
- ✅ Analitik: area chart + donut chart + bar chart + progress bar'lar hepsi veri ile render oluyor
- ✅ Lint temiz, dev log'da runtime hatası yok
- VLM ile doğrulandı: "Delete button fully visible, not covered" / "Both charts fully rendered with actual data"

Unresolved issues / risks:
- Analitik revenue tahmini "avgPrice * guests" yaklaşıksık (gerçek sipariş verisi yok). İleride gerçek sipariş/satış takibi eklenirse daha doğru olur.
- Takvim "prev/next" ay limitleri ±12 ay (yeterli MVP için)
- QR indirme SVG formatında (PNG de eklenebilir)

Priority recommendations for next phase:
1. Masa kat planı (görsel drag-drop floor plan editor)
2. Rezervasyon bildirimleri (e-posta) — şu an bildirim yok
3. Personel/rol yönetimi (owner/staff davet, yetkilendirme)
4. Gerçek sipariş/satış takibi ile analitik gelir verisini doğru yap
5. Çoklu dil (i18n) desteği
6. Rezervasyon saat çakışma kontrolü (aynı masaya aynı saatte iki rezervasyon engeli)
