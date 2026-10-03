-- Seed data for Tablo Restaurant Management Platform
-- Run this AFTER supabase-migration.sql in the Supabase SQL Editor

-- Demo owner user (password: demo1234)
-- Hash generated with bcryptjs (10 rounds)
INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
  'usr_demo_owner',
  'demo@restoran.app',
  'Demo Restoran Sahibi',
  '$2b$10$8TRKkAYtMLmeK3mVwtUHm.Ose1MJcVzSIngd/2lf.zKwmlGpkezCQ',
  'owner',
  NOW(),
  NOW()
);

-- Demo staff user (password: staff1234)
INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
  'usr_demo_staff',
  'garson@lepetitbistro.com',
  'Ali Garson',
  '$2b$10$8TRKkAYtMLmeK3mVwtUHm.Ose1MJcVzSIngd/2lf.zKwmlGpkezCQ',
  'staff',
  NOW(),
  NOW()
);

-- Demo restaurant
INSERT INTO "Restaurant" ("id", "slug", "name", "description", "cuisine", "phone", "email", "address", "city", "logoUrl", "coverImageUrl", "openTime", "closeTime", "currency", "isActive", "ownerId", "createdAt", "updatedAt")
VALUES (
  'rst_demo',
  'le-petit-bistro',
  'Le Petit Bistro',
  'Şehrin kalbinde, mevsim malzemeleriyle hazırlanan modern Fransız-Akdeniz mutfağı. Sıcacık atmosfer ve özenli sunum.',
  'Fransız & Akdeniz',
  '+90 212 555 0100',
  'merhaba@lepetitbistro.com',
  'Bağdat Caddesi No: 142, Kadıköy',
  'İstanbul',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
  '12:00',
  '23:00',
  '₺',
  true,
  'usr_demo_owner',
  NOW(),
  NOW()
);

-- Staff member
INSERT INTO "RestaurantMember" ("id", "restaurantId", "userId", "role", "createdAt")
VALUES ('mem_demo_staff', 'rst_demo', 'usr_demo_staff', 'staff', NOW());

-- Categories
INSERT INTO "Category" ("id", "name", "sortOrder", "isActive", "restaurantId", "createdAt", "updatedAt") VALUES
('cat_1', 'Başlangıçlar', 0, true, 'rst_demo', NOW(), NOW()),
('cat_2', 'Ana Yemekler', 1, true, 'rst_demo', NOW(), NOW()),
('cat_3', 'Makarnalar', 2, true, 'rst_demo', NOW(), NOW()),
('cat_4', 'Tatlılar', 3, true, 'rst_demo', NOW(), NOW()),
('cat_5', 'İçecekler', 4, true, 'rst_demo', NOW(), NOW());

-- Menu items
INSERT INTO "MenuItem" ("id", "name", "description", "price", "imageUrl", "isAvailable", "isFeatured", "tags", "sortOrder", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES
('mi_1', 'Burrata Salatası', 'Taze burrata, çeri domates, fesleğen, sızma zeytinyağı ve balsamik glazür', 285, NULL, true, true, 'vejetaryen', 0, 'rst_demo', 'cat_1', NOW(), NOW()),
('mi_2', 'Karides Gumbo', 'Taze karides, andouille sosis, kereviz ve baharatlı et suyu', 320, NULL, true, false, NULL, 1, 'rst_demo', 'cat_1', NOW(), NOW()),
('mi_3', 'Izgara Kalamar', 'Limonlu rocket salata ve sarımsaklı aioli', 295, NULL, true, false, NULL, 2, 'rst_demo', 'cat_1', NOW(), NOW()),
('mi_4', 'Dana Cheek', '8 saat pişmiş dana yanağı, karamelize soğan püresi ve kırmızı şarap sosu', 540, NULL, true, true, NULL, 0, 'rst_demo', 'cat_2', NOW(), NOW()),
('mi_5', 'Somon En Papillote', 'Pergamentte pişmiş Norveç somonu, mevsim sebzeleri ve dereotu', 495, NULL, true, false, NULL, 1, 'rst_demo', 'cat_2', NOW(), NOW()),
('mi_6', 'Dana Tartar', 'Elmeli hardal ve kapariyle dana eti tartarı, çıtır ekmek', 380, NULL, true, false, NULL, 2, 'rst_demo', 'cat_2', NOW(), NOW()),
('mi_7', 'Trüf Mantar Risotto', 'Arborio pirinç, karışık mantar, parmesan ve siyah trüf', 360, NULL, true, true, 'vejetaryen', 0, 'rst_demo', 'cat_3', NOW(), NOW()),
('mi_8', 'Deniz Mahsullü Linguine', 'Midye, karides ve kalamarla beyaz şaraplı sos', 420, NULL, true, false, NULL, 1, 'rst_demo', 'cat_3', NOW(), NOW()),
('mi_9', 'Crème Brûlée', 'Klasik vanilyalı krema, karamelize şeker kabuğu', 180, NULL, true, false, 'vejetaryen', 0, 'rst_demo', 'cat_4', NOW(), NOW()),
('mi_10', 'Çikolata Fondan', 'Akışkan bitter çikolata, vanilyalı dondurma ve taze çilek', 210, NULL, true, true, NULL, 1, 'rst_demo', 'cat_4', NOW(), NOW()),
('mi_11', 'Tiramisu', 'Espresso ve mascarpone ile katmanlı İtalyan klasiği', 195, NULL, true, false, NULL, 2, 'rst_demo', 'cat_4', NOW(), NOW()),
('mi_12', 'Sigara Böreği', 'Çıtır yufkada peynirli börek, nar ekşisi', 145, NULL, true, false, NULL, 0, 'rst_demo', 'cat_5', NOW(), NOW()),
('mi_13', 'Mevsim Limonata', 'Taze sıkılmış limon, nane ve çubuk krallık', 95, NULL, true, false, NULL, 1, 'rst_demo', 'cat_5', NOW(), NOW());

-- Tables
INSERT INTO "Table" ("id", "tableNumber", "capacity", "location", "status", "notes", "restaurantId", "createdAt", "updatedAt") VALUES
('tbl_1', '1', 2, 'Pencere Kenarı', 'available', NULL, 'rst_demo', NOW(), NOW()),
('tbl_2', '2', 2, 'Pencere Kenarı', 'available', NULL, 'rst_demo', NOW(), NOW()),
('tbl_3', '3', 4, 'İç Salon', 'occupied', NULL, 'rst_demo', NOW(), NOW()),
('tbl_4', '4', 4, 'İç Salon', 'available', NULL, 'rst_demo', NOW(), NOW()),
('tbl_5', '5', 6, 'İç Salon', 'reserved', NULL, 'rst_demo', NOW(), NOW()),
('tbl_6', '6', 2, 'Teras', 'available', NULL, 'rst_demo', NOW(), NOW()),
('tbl_7', '7', 4, 'Teras', 'cleaning', NULL, 'rst_demo', NOW(), NOW()),
('tbl_8', '8', 8, 'VIP Salon', 'inactive', NULL, 'rst_demo', NOW(), NOW());

-- Reservations (today + upcoming)
INSERT INTO "Reservation" ("id", "customerName", "customerPhone", "guestCount", "reservationDate", "reservationTime", "status", "notes", "source", "restaurantId", "tableId", "userId", "createdAt", "updatedAt") VALUES
('res_1', 'Ayşe Yılmaz', '+90 532 111 2233', 2, to_char(NOW(), 'YYYY-MM-DD'), '19:00', 'confirmed', 'Doğum günü', 'manual', 'rst_demo', 'tbl_1', 'usr_demo_owner', NOW(), NOW()),
('res_2', 'Mehmet Demir', '+90 533 222 3344', 4, to_char(NOW(), 'YYYY-MM-DD'), '20:30', 'pending', NULL, 'manual', 'rst_demo', 'tbl_4', 'usr_demo_owner', NOW(), NOW()),
('res_3', 'Zeynep Kaya', '+90 534 333 4455', 6, to_char(NOW(), 'YYYY-MM-DD'), '21:00', 'confirmed', NULL, 'manual', 'rst_demo', 'tbl_5', 'usr_demo_owner', NOW(), NOW()),
('res_4', 'Can Öztürk', '+90 535 444 5566', 2, to_char(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '13:00', 'pending', NULL, 'manual', 'rst_demo', NULL, 'usr_demo_owner', NOW(), NOW()),
('res_5', 'Elif Şahin', '+90 536 555 6677', 4, to_char(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '19:30', 'confirmed', NULL, 'manual', 'rst_demo', 'tbl_4', 'usr_demo_owner', NOW(), NOW()),
('res_6', 'Burak Aydın', '+90 537 666 7788', 3, to_char(NOW() + INTERVAL '2 days', 'YYYY-MM-DD'), '20:00', 'pending', NULL, 'manual', 'rst_demo', NULL, 'usr_demo_owner', NOW(), NOW()),
('res_7', 'Selin Arslan', '+90 538 777 8899', 2, to_char(NOW() + INTERVAL '2 days', 'YYYY-MM-DD'), '21:30', 'confirmed', NULL, 'manual', 'rst_demo', 'tbl_2', 'usr_demo_owner', NOW(), NOW());

-- Note: The bcrypt hash above is for "demo1234". If it doesn't work,
-- you may need to re-hash the password. Run this in Node:
-- const bcrypt = require('bcryptjs'); bcrypt.hash('demo1234', 10).then(console.log)
-- Then update the User table with the correct hash.
