-- ========================================================
-- ฐานข้อมูลระบบเว็บ "อยู่เลย เฮาส์" (YooLoei House)
-- สำหรับนำเข้า (Import / Execute SQL) ใน DB Browser for SQLite
-- วันที่สร้าง: 15/9/2569 10:06:12
-- ========================================================

PRAGMA foreign_keys = OFF;

-- --------------------------------------------------------
-- ตาราง: users (จำนวน 16 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "users";
CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      username TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'admin@yooloei.com', '$2b$10$bDI2V./kAdkdg/pJ6rjmkOOfGh5kfdXDL34gKJavJtqk4bJeQ0FIq', 'แอดมิน ผู้ดูแลสูงสุด', 'แอดมิน', 'ผู้ดูแลสูงสุด', '089-999-8888', 'admin', '/uploads/img-1788845788088-284155111.png', 'admin', '2026-09-06T13:18:19.043Z', '2026-09-08T05:36:28.103Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('0f9be26f-766e-4914-991a-ee51506ae407', 'owner@yooloei.com', '$2b$10$xoNC3L4SIWbj0I0IpFBEFOxv7UPZ3jPRyJfDxyZniGc/hWtHDI8.y', 'สมชาย เจ้าของหอ', 'สมชาย', 'เจ้าของหอ', '0898765432', 'somchai_owner', '/uploads/img-1788853025579-111109492.png', 'owner', '2026-09-06T13:18:19.043Z', '2026-09-08T07:37:05.596Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('f211e6e7-0d89-4991-97dc-597be2d62ac6', 'user@yooloei.com', '$2b$10$P6hzF7UaFZLW.fD732PX..SS4A5KklSo1rtCevr4z/JsKR5mJX5Qy', 'สมหญิง ผู้เช่าใจดี', 'สมหญิง', 'ผู้เช่าใจดี', '0851112233', 'somying_user', '/uploads/img-1788846796296-698291552.jpg', 'user', '2026-09-06T13:18:19.043Z', '2026-09-08T05:53:16.309Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('12d5b402-5582-4835-82f8-893bc6f669c6', 'owner_test_1788700892201@yooloei.com', '$2b$10$oDwRI.ZunGd22qzh3nlhE.f/tcX/sO0BC/PuJnN9q49wHD4Itr3vi', 'ประสิทธิ์ ทดสอบ', 'ประสิทธิ์', 'ทดสอบ', '081-111-2222', 'prasit_1788700892201', '/images/default-avatar.jpg', 'owner', '2026-09-06T13:21:32.464Z', '2026-09-06T13:21:32.464Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('ca06ea5a-cfd5-4a88-8609-43fddb48ca67', 'user_test_1788700892634@yooloei.com', '$2b$10$UdhqvTvCnQyQSzLGNNCK0ub6APvhtJwddLzqNGJSfkBvXjRoI71ui', 'กานดา ผู้เช่า', 'กานดา', 'ผู้เช่า', '', 'user_test_1788700892634', '/images/default-avatar.jpg', 'user', '2026-09-06T13:21:32.696Z', '2026-09-06T13:21:32.696Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('73fa250c-d25d-4d65-97d3-3ee8edd1c306', 'teen423mo@gmail.com', '$2b$10$TgQRZsptARv93bNT2yy9.Ob0S9ZVpC522BEbgs99zPwczPCdDRIAO', 'Aphiwat Phumdaeng', 'Aphiwat', 'Phumdaeng', '0819196096', 'nineteen19', '/uploads/img-1788709161790-321952411.jpg', 'user', '2026-09-06T15:39:05.065Z', '2026-09-06T15:39:21.801Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('22ee90b6-cfa9-4ddb-a339-7e613309e8a7', 'user_1788711333688@gmail.com', '$2b$10$l2xHVEKdOByOEZ/xQ1cMlu8l6NDb19hiXQQhd7yQu.UgA6TWWjD2C', 'ผู้ใช้ Google', 'ผู้ใช้', 'Google', '', 'google_user_3688', '/images/default-avatar.jpg', 'user', '2026-09-06T16:15:33.762Z', '2026-09-06T16:15:33.762Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('dfc99bd7-b7c6-424c-8a6a-26bdcd434c5f', 'user_1788711335176@gmail.com', '$2b$10$lCeAAPUeO0nZsdsoasRoKug6MzchykH0VF/oXrCKhxHDe85kWAgmm', 'ผู้ใช้ Google', 'ผู้ใช้', 'Google', '', 'google_user_5176', '/images/default-avatar.jpg', 'user', '2026-09-06T16:15:35.253Z', '2026-09-06T16:15:35.253Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('b8ed2748-fc63-4243-a9d6-fbe55970789e', 'user_1788711336223@gmail.com', '$2b$10$j33q7TbylfN2tVIYkpsOvOYTNQMfgMgUaulYN9wqJ2fK4icWquwsu', 'ผู้ใช้ Google', 'ผู้ใช้', 'Google', '', 'google_user_6223', '/images/default-avatar.jpg', 'user', '2026-09-06T16:15:36.299Z', '2026-09-06T16:15:36.299Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('d6559982-5d5d-4a7b-833c-296f89077a18', 'user_1788711336687@gmail.com', '$2b$10$zoK8YC2A1GBuAm6Uyht/OOlG9cCOzGPLFONHTqgYEKorlU.fKhuLa', 'ผู้ใช้ Google', 'ผู้ใช้', 'Google', '', 'google_user_6687', '/images/default-avatar.jpg', 'user', '2026-09-06T16:15:36.758Z', '2026-09-06T16:15:36.758Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('7d7d4e5f-a8e8-4c09-a559-52166d8b7290', 'user_1788711336976@gmail.com', '$2b$10$mCeQOMmiQizg.0QRVKByBOaIzluTEPz8I.dYfLxiHFzhwo.l4cY96', 'ผู้ใช้ Google', 'ผู้ใช้', 'Google', '', 'google_user_6976', '/images/default-avatar.jpg', 'user', '2026-09-06T16:15:37.050Z', '2026-09-06T16:15:37.050Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('a6e7a8f4-22dc-4549-865a-693ca57ecfc1', 'as123@gmail.com', '$2b$10$MpVrtSn4yUiOiJ394nDwpuDk8fFeJvWej8QSGgLeuwLB9clqLiN1m', '555 as55', '555', 'as55', '0987452136', 'asas', '/images/default-avatar.jpg', 'user', '2026-09-06T16:16:12.245Z', '2026-09-08T06:00:37.252Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('c7e4a548-cd0a-499c-9bac-b32b1bd733cc', 'test12@gmail.com', '$2b$10$Xk5yEt4hIzvXv5if7mDEDOSEWJJUk2HG9LMdFD8dCzNYrWrsn0Oo2', 'test ss', 'test', 'ss', '0987452136', 'test12', '/uploads/img-1788851408471-280624830.jpg', 'user', '2026-09-06T17:25:01.282Z', '2026-09-08T07:11:14.355Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('580964d5-85c5-4c5f-8640-2f1726d68e89', 'ap04052546@gmail.com', '$2b$10$J8lP08KnMeZ4MfDul7Ufq.s9aZBU1FR1noxBWH0fmtkCmzebehHUC', 'นายทีน อภิวัฒน์ 19', 'นายทีน', 'อภิวัฒน์ 19', '0808553732', 'นายทีน', '/uploads/img-1789440675392-392015598.jpg', 'owner', '2026-09-08T12:43:14.716Z', '2026-09-15T02:51:15.406Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('69b4632c-2713-46a1-9cc5-b069e0c45e30', 'teenboy@gmail.com', '$2b$10$28P24T1.y8tnzbOWF/jvY.hOIjUQoTe5FAyfqsqx6RwkID5qhzgUq', 'tee boy', 'tee', 'boy', '087456319', 'teenboy', '/uploads/img-1788878465524-254053042.jpg', 'user', '2026-09-08T14:28:20.262Z', '2026-09-08T14:41:05.537Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "first_name", "last_name", "phone", "username", "avatar_url", "role", "created_at", "updated_at") VALUES ('c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', '$2b$10$5E/ICnTNP7Ssjpgzgvq3EO.UQx3I0F/DmlGxtbRXLqul36UV2XH0O', 'พี่ ทีน', 'พี่', 'ทีน', '0896547123', 'peeteen', '/uploads/img-1788885525198-115124292.jpg', 'user', '2026-09-08T14:49:26.422Z', '2026-09-08T16:38:45.213Z');

-- --------------------------------------------------------
-- ตาราง: dormitories (จำนวน 7 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "dormitories";
CREATE TABLE dormitories (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      owner_name TEXT,
      name TEXT NOT NULL,
      district TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      phone TEXT,
      line_id TEXT,
      price_min REAL DEFAULT 0,
      price_max REAL DEFAULT 0,
      amenities TEXT DEFAULT '[]',     -- เก็บ JSON array
      room_types TEXT DEFAULT '[]',    -- เก็บ JSON array
      images TEXT DEFAULT '[]',        -- เก็บ JSON array
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      favorite_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'ggg', 'ตำบลนาอ้อ', 'ddd', '', '0898765432', '', 1000, 2000, '["แอร์","WiFi","เครื่องทำน้ำอุ่น","ระเบียง","ระบบคีย์การ์ด","เครื่องซักผ้าหยอดเหรียญ","เฟอร์นิเจอร์ครบ","ตู้เย็น","ที่จอดรถ","กล้องวงจรปิด","ทีวี","ระบบรักษาความปลอดภัย 24 ชม."]', '["ห้องแอร์","ห้องสตูดิโอ","ห้องชุด","ห้องพัดลม"]', '["/uploads/img-1788851605186-577905564.jpg","/uploads/img-1788851605199-387409891.jpg","/uploads/img-1788851605210-507085734.png","/uploads/img-1788851605242-861603766.jpg"]', 0, 0, 98, 2, 'approved', '2026-09-08T07:13:25.252Z', '2026-09-08T07:14:38.452Z');
INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('6a733a35-e0db-4bf2-a59c-854e58a49b90', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'tbz 122', 'เมืองเลย', '1232', 'dwd', '0808553732', '', 1953, 500, '["แอร์","WiFi"]', '["ห้องแอร์","ห้องพัดลม","ห้องชุด","ห้องสตูดิโอ"]', '["/images/dorm-1.jpg"]', 5, 2, 208, 1, 'approved', '2026-09-08T13:02:37.587Z', '2026-09-09T06:03:44.788Z');
INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('0546c06b-0cc4-4295-9779-801228ed5c06', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', ' gggggggg', 'เมืองเลย', '0412', '', '0808553732', '', 2000, 1970, '["แอร์","WiFi"]', '["ห้องแอร์","ห้องพัดลม"]', '["/images/dorm-1.jpg"]', 5, 1, 118, 0, 'approved', '2026-09-09T06:15:14.521Z', '2026-09-09T06:17:58.450Z');
INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('a600bda5-3c70-49ba-896a-16b716146f42', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '12121', 'เมืองเลย', '1212', '1212', '0808553732', '', 520, 1000, '["แอร์","WiFi"]', '["ห้องแอร์"]', '["/images/dorm-1.jpg"]', 0, 0, 43, 1, 'approved', '2026-09-09T07:47:12.727Z', '2026-09-09T07:47:19.166Z');
INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('64995a8d-cf57-44ff-8ec4-3841f78527b2', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์ 19', 'test', 'เมืองเลย', '123', '', '0808553732', 'test19', 12000, 15000, '["แอร์","WiFi"]', '["ห้องแอร์","ห้องชุด","รายเดือน","ห้องสตูดิโอ","ห้องพัดลม","รายวัน"]', '["/uploads/img-1789440824194-251491164.jpg","/uploads/img-1789440854730-974135144.jpg","/uploads/img-1789440854742-275801897.jpg","/uploads/img-1789440854755-987307341.jpg"]', 5, 1, 40, 2, 'approved', '2026-09-15T02:53:44.206Z', '2026-09-15T02:54:54.567Z');
INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('3e4029b1-ce07-450e-b369-ba468a2fef76', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์ 19', 'kkkkk', 'เมืองเลย', '120', '', '0808553732', 'kkk', 1000, 1200, '["แอร์","WiFi"]', '["ห้องแอร์","รายวัน","รายเดือน"]', '["/images/dorm-1.jpg"]', 0, 0, 8, 0, 'approved', '2026-09-15T02:59:33.847Z', '2026-09-15T02:59:40.165Z');
INSERT INTO "dormitories" ("id", "owner_id", "owner_name", "name", "district", "address", "description", "phone", "line_id", "price_min", "price_max", "amenities", "room_types", "images", "rating", "review_count", "view_count", "favorite_count", "status", "created_at", "updated_at") VALUES ('562d68d0-03e4-4479-9880-d4af7ced52ec', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์ 19', 'ppp', 'ราชภัฏเลย', 'pppp', '', '0808553732', 'ppp', 1000, 12100, '["แอร์","WiFi"]', '["ห้องแอร์"]', '["/images/dorm-1.jpg"]', 0, 0, 16, 0, 'approved', '2026-09-15T03:00:32.148Z', '2026-09-15T03:00:38.467Z');

-- --------------------------------------------------------
-- ตาราง: rooms (จำนวน 5 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "rooms";
CREATE TABLE rooms (
      id TEXT PRIMARY KEY,
      dormitory_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      room_number TEXT NOT NULL,
      room_type TEXT NOT NULL,
      price REAL DEFAULT 0,
      status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (dormitory_id) REFERENCES dormitories(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

INSERT INTO "rooms" ("id", "dormitory_id", "owner_id", "room_number", "room_type", "price", "status", "created_at") VALUES ('c05a6c43-1529-4e6d-b47a-867c196c199d', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '580964d5-85c5-4c5f-8640-2f1726d68e89', '123', 'ห้องแอร์', 1213, 'available', '2026-09-09T06:04:39.850Z');
INSERT INTO "rooms" ("id", "dormitory_id", "owner_id", "room_number", "room_type", "price", "status", "created_at") VALUES ('73a9cfeb-d166-4836-b192-c2b76c593e1f', '0546c06b-0cc4-4295-9779-801228ed5c06', '580964d5-85c5-4c5f-8640-2f1726d68e89', '11', 'ห้องแอร์', 11111, 'available', '2026-09-09T06:16:19.698Z');
INSERT INTO "rooms" ("id", "dormitory_id", "owner_id", "room_number", "room_type", "price", "status", "created_at") VALUES ('46df8ce5-8a45-42af-8d9a-99d301253c38', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '580964d5-85c5-4c5f-8640-2f1726d68e89', '1', 'ห้องพัดลม', 1200, 'available', '2026-09-15T02:55:14.520Z');
INSERT INTO "rooms" ("id", "dormitory_id", "owner_id", "room_number", "room_type", "price", "status", "created_at") VALUES ('f745e5b0-c5ed-4b33-bbfd-7cb2f5e159dd', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '580964d5-85c5-4c5f-8640-2f1726d68e89', '2', 'ห้องพัดลม', 1220, 'available', '2026-09-15T02:55:21.681Z');
INSERT INTO "rooms" ("id", "dormitory_id", "owner_id", "room_number", "room_type", "price", "status", "created_at") VALUES ('34dec855-ecee-4167-ad2c-be93275369d5', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '580964d5-85c5-4c5f-8640-2f1726d68e89', '123', 'ห้องแอร์', 2000, 'available', '2026-09-15T02:55:26.983Z');

-- --------------------------------------------------------
-- ตาราง: bookings (จำนวน 9 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "bookings";
CREATE TABLE bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT,
      user_name TEXT,
      user_phone TEXT,
      owner_id TEXT NOT NULL,
      dormitory_id TEXT NOT NULL,
      dormitory_name TEXT NOT NULL,
      room_id TEXT,
      room_number TEXT,
      booking_date TEXT NOT NULL,
      note TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dormitory_id) REFERENCES dormitories(id) ON DELETE CASCADE
    );

INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('94ab426c-e11c-442f-ae7a-221b6f843f6b', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ap04052546@gmail.com', 'นายทีน อภิวัฒน์', '0808553732', '0f9be26f-766e-4914-991a-ee51506ae407', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', 'ggg', 'general', 'ห้องมาตรฐาน', '2026-09-16', 'มีสัตว์เลี้ยงอยู่ได้ไหมครับ', 'pending', '2026-09-08T12:44:21.103Z', '2026-09-08T12:44:21.103Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('27b4d4ed-a81a-405c-8d28-9b827fd242c3', '69b4632c-2713-46a1-9cc5-b069e0c45e30', 'teenboy@gmail.com', 'tee boy', '087456319', '580964d5-85c5-4c5f-8640-2f1726d68e89', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', 'general', 'ห้องมาตรฐาน', '2026-09-10', '', 'approved', '2026-09-08T14:44:21.243Z', '2026-09-08T16:53:00.903Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('3ff48688-b3bb-48cc-bcb0-ed32b86f751e', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', 'พี่ ทีน', '0896547123', '580964d5-85c5-4c5f-8640-2f1726d68e89', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', 'general', 'ห้องมาตรฐาน', '2026-09-10', '', 'approved', '2026-09-08T16:52:52.360Z', '2026-09-08T16:53:00.000Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('4ca9cd11-601c-42cf-8420-76e853912ae1', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', 'พี่ ทีน', '0896547123', '580964d5-85c5-4c5f-8640-2f1726d68e89', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', '4c199830-8d36-424d-892f-2ad60bbf4027', 'jihy', '2026-09-10', '', 'approved', '2026-09-08T16:53:16.513Z', '2026-09-08T16:53:24.030Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('ec14d020-c648-4f7e-bbed-22c28d4d98f0', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', 'พี่ ทีน', '0896547123', '580964d5-85c5-4c5f-8640-2f1726d68e89', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', '4c199830-8d36-424d-892f-2ad60bbf4027', 'jihy', '2026-09-16', '', 'approved', '2026-09-08T16:55:04.568Z', '2026-09-08T16:55:11.543Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('087bbb17-92d8-4ae2-9c40-c3590285389f', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', 'พี่ ทีน', '0896547123', '580964d5-85c5-4c5f-8640-2f1726d68e89', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', '4c199830-8d36-424d-892f-2ad60bbf4027', 'jihy', '2026-09-26', '', 'approved', '2026-09-08T16:57:09.184Z', '2026-09-08T16:57:15.216Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('d15d8bbc-7ba5-47b1-af55-ef3869d4799e', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', 'พี่ ทีน', '0896547123', '580964d5-85c5-4c5f-8640-2f1726d68e89', '0546c06b-0cc4-4295-9779-801228ed5c06', ' gggggggg', '73a9cfeb-d166-4836-b192-c2b76c593e1f', '11', '2026-09-10', '', 'cancelled', '2026-09-09T06:19:09.188Z', '2026-09-09T06:19:31.277Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('0a5bb3c7-8ea6-4d92-a20a-523b24de93da', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'peeteen@gmail.com', 'พี่ ทีน', '0896547123', '580964d5-85c5-4c5f-8640-2f1726d68e89', '0546c06b-0cc4-4295-9779-801228ed5c06', ' gggggggg', '73a9cfeb-d166-4836-b192-c2b76c593e1f', '11', '2026-09-11', '', 'cancelled', '2026-09-09T06:26:22.508Z', '2026-09-09T06:27:37.021Z');
INSERT INTO "bookings" ("id", "user_id", "user_email", "user_name", "user_phone", "owner_id", "dormitory_id", "dormitory_name", "room_id", "room_number", "booking_date", "note", "status", "created_at", "updated_at") VALUES ('e9f35813-60d1-4a6e-8380-6fde606d1bd5', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'user@yooloei.com', 'สมหญิง ผู้เช่าใจดี', '0851112233', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'a600bda5-3c70-49ba-896a-16b716146f42', '12121', 'general', 'ห้องมาตรฐาน', '2026-09-11', '', 'cancelled', '2026-09-15T02:50:37.038Z', '2026-09-15T02:51:55.385Z');

-- --------------------------------------------------------
-- ตาราง: reviews (จำนวน 4 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "reviews";
CREATE TABLE reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_photo TEXT,
      dormitory_id TEXT NOT NULL,
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      owner_reply TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, owner_reply_name TEXT, owner_reply_photo TEXT, owner_reply_role TEXT, owner_reply_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dormitory_id) REFERENCES dormitories(id) ON DELETE CASCADE
    );

INSERT INTO "reviews" ("id", "user_id", "user_name", "user_photo", "dormitory_id", "rating", "comment", "owner_reply", "created_at", "updated_at", "owner_reply_name", "owner_reply_photo", "owner_reply_role", "owner_reply_at") VALUES ('65197491-c6f5-4893-a8a7-065be2e6d44c', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '/uploads/img-1788846796296-698291552.jpg', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 5, 'fu8iy[www
', 'kjl', '2026-09-08T13:18:55.148Z', '2026-09-08T14:10:35.321Z', NULL, NULL, NULL, NULL);
INSERT INTO "reviews" ("id", "user_id", "user_name", "user_photo", "dormitory_id", "rating", "comment", "owner_reply", "created_at", "updated_at", "owner_reply_name", "owner_reply_photo", "owner_reply_role", "owner_reply_at") VALUES ('b36c1ec2-8d17-4788-b58c-3db60ebe7389', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'พี่ ทีน', '/uploads/img-1788885525198-115124292.jpg', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 5, 'เอาดงเอาดี

', '5555', '2026-09-08T16:54:29.798Z', '2026-09-09T05:57:05.544Z', NULL, NULL, NULL, NULL);
INSERT INTO "reviews" ("id", "user_id", "user_name", "user_photo", "dormitory_id", "rating", "comment", "owner_reply", "created_at", "updated_at", "owner_reply_name", "owner_reply_photo", "owner_reply_role", "owner_reply_at") VALUES ('a0f3f995-dacf-471b-9d55-cc66f5a0a1d2', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'พี่ ทีน', '/uploads/img-1788885525198-115124292.jpg', '0546c06b-0cc4-4295-9779-801228ed5c06', 5, '5555', '555', '2026-09-09T06:32:47.665Z', '2026-09-09T06:33:06.320Z', 'นายทีน อภิวัฒน์', '/uploads/img-1788871409948-311713803.jpg', 'user', '2026-09-09T06:33:06.320Z');
INSERT INTO "reviews" ("id", "user_id", "user_name", "user_photo", "dormitory_id", "rating", "comment", "owner_reply", "created_at", "updated_at", "owner_reply_name", "owner_reply_photo", "owner_reply_role", "owner_reply_at") VALUES ('3fba063d-9fc7-451e-8838-148f8eb96c0a', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'แอดมิน ผู้ดูแลสูงสุด (ผู้ดูแลระบบ)', '/uploads/img-1788845788088-284155111.png', '64995a8d-cf57-44ff-8ec4-3841f78527b2', 5, 'du', 'ttt', '2026-09-15T02:54:32.472Z', '2026-09-15T02:54:45.791Z', 'นายทีน อภิวัฒน์ 19', '/uploads/img-1789440675392-392015598.jpg', 'user', '2026-09-15T02:54:45.791Z');

-- --------------------------------------------------------
-- ตาราง: favorites (จำนวน 5 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "favorites";
CREATE TABLE favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      dormitory_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, dormitory_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dormitory_id) REFERENCES dormitories(id) ON DELETE CASCADE
    );

INSERT INTO "favorites" ("id", "user_id", "dormitory_id", "created_at") VALUES ('9c4bc1be-a7d6-4672-acda-0f5bfdf3ea46', 'c7e4a548-cd0a-499c-9bac-b32b1bd733cc', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '2026-09-08T07:36:32.917Z');
INSERT INTO "favorites" ("id", "user_id", "dormitory_id", "created_at") VALUES ('994d9689-d654-4e7a-beff-8da53d75c3fc', '580964d5-85c5-4c5f-8640-2f1726d68e89', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '2026-09-08T12:44:59.131Z');
INSERT INTO "favorites" ("id", "user_id", "dormitory_id", "created_at") VALUES ('3dfb5514-fb3c-4ef1-ba0f-4e555da4f0e1', 'c89779f0-e118-4305-89a2-5e6ac6345508', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '2026-09-09T05:49:35.226Z');
INSERT INTO "favorites" ("id", "user_id", "dormitory_id", "created_at") VALUES ('5e1f7958-516f-454f-b828-a60e36aea45b', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '2026-09-15T02:58:38.500Z');
INSERT INTO "favorites" ("id", "user_id", "dormitory_id", "created_at") VALUES ('7c98d8f3-577f-4136-b019-dc513d2d6507', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'a600bda5-3c70-49ba-896a-16b716146f42', '2026-09-15T02:58:49.964Z');

-- --------------------------------------------------------
-- ตาราง: messages (จำนวน 30 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "messages";
CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      sender_name TEXT,
      receiver_id TEXT NOT NULL,
      receiver_name TEXT,
      dormitory_id TEXT,
      dormitory_name TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('test-msg-1788704653483', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'ผู้เช่าทดสอบ', '0f9be26f-766e-4914-991a-ee51506ae407', 'เจ้าของหอทดสอบ', NULL, NULL, 'สวัสดีครับ สนใจห้องพักครับ', '2026-09-06T14:24:13.482Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('4ee8a75c-0d21-4000-883a-e9972fc25d1a', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'db416917-67d9-45b0-b8c2-430c5e50cbfc', 'อยู่เลย เฮาส์ (YooLoei House)', 'ทดสอบส่งข้อความหลังรีสตาร์ทเซิร์ฟเวอร์', '2026-09-06T16:43:00.283Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('1bec7980-82f1-453f-804d-e4eb7e7fe7e5', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'db416917-67d9-45b0-b8c2-430c5e50cbfc', 'อยู่เลย เฮาส์ (YooLoei House)', '555', '2026-09-06T16:47:37.217Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('66891a25-7be6-41f3-aed4-c1bf04645929', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'dorm-1', 'หอพัก อานนท์', 'สวัสดีครับ สนใจห้องพักว่างไหมครับ? (ทดสอบข้อความ)', '2026-09-06T17:00:50.329Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('c1f99474-136b-44b5-adf2-0b0c79435213', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'dorm-1', 'หอพัก อานนท์', 'สวัสดีครับ สนใจห้องพักว่างไหมครับ? (ทดสอบข้อความ)', '2026-09-06T17:01:07.715Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('8940ca3a-1ab0-4c7e-80d1-3beb6df316cc', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'dorm-1', 'หอพัก อานนท์', 'สวัสดีครับ สนใจห้องพักว่างไหมครับ? (ทดสอบข้อความ)', '2026-09-06T17:01:42.850Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('fa776626-2f6c-4745-b55d-d9b40eee917a', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'dorm-1', 'หอพัก อานนท์', '4444', '2026-09-06T17:04:50.346Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('c8d25b2b-9be9-4030-9709-56220cdbcd76', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', 'dorm-1', 'หอพัก อานนท์', '555', '2026-09-06T17:05:12.595Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('0e6ef83a-79ae-42c8-8f5e-5d2bc65a513d', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', 'dorm-1', 'หอพัก อานนท์', 'สวสัดีครย', '2026-09-06T17:05:30.248Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('f84ac2b2-3cc1-4752-9e61-cded9d7b6a9b', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'dorm-1', 'หอพัก อานนท์', 'คว ย', '2026-09-06T17:17:50.181Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('c030a0cd-cb9c-4261-9843-b038f0b9e318', 'c7e4a548-cd0a-499c-9bac-b32b1bd733cc', 'test ss', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', 'ggg', 'สวสัดีครับ', '2026-09-08T07:15:20.397Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('b4c44f8a-0282-4673-bd85-8936a98f02ad', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'ผู้เช่าทดสอบ', NULL, NULL, 'ว่าไงครับ', '2026-09-08T07:16:03.723Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('461a6813-7ba7-4d40-8aae-1a723034243b', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', 'c7e4a548-cd0a-499c-9bac-b32b1bd733cc', 'test ss', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', 'ggg', 'ว่าไง', '2026-09-08T07:16:24.124Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('048dc463-cf6c-4fc2-9a86-a9d4c986068b', 'c7e4a548-cd0a-499c-9bac-b32b1bd733cc', 'test ss', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', 'ggg', 'ทำไรครับ', '2026-09-08T07:37:16.997Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('29daa619-bca0-4215-80fa-2f63c90f630d', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'แอดมิน ผู้ดูแลสูงสุด', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', NULL, NULL, 'ทำไรครับ', '2026-09-08T07:40:30.676Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('654ad64e-0275-4ea5-9024-c74514799afa', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', 'ggg', 'สวัสดีครับ สนใจห้องพักครับ', '2026-09-08T12:45:23.175Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('9838b24a-24bc-4643-b8ef-b7f9ce830b84', '0f9be26f-766e-4914-991a-ee51506ae407', 'สมชาย เจ้าของหอ', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', 'ggg', 'ได้ครับย้ายมาวันไหนครับ', '2026-09-08T12:46:17.582Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('b0477b59-29b5-48ee-83ac-55d03e3213d2', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '782c3c63-9c79-4ab5-97b0-431bd83625ff', 'ghfghgjhjhj', 'สวัสดีครับ สนใจห้องพักครับ', '2026-09-08T14:01:50.109Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('08fab60e-3382-498f-9fbb-b865009607e8', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '782c3c63-9c79-4ab5-97b0-431bd83625ff', 'ghfghgjhjhj', '555', '2026-09-08T14:02:05.058Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('46829213-652f-419d-96f9-4e1677a742fe', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '782c3c63-9c79-4ab5-97b0-431bd83625ff', 'ghfghgjhjhj', '8;p', '2026-09-08T14:02:21.506Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('6478ecca-19b2-4036-8c2e-efd79c0e5d17', '69b4632c-2713-46a1-9cc5-b069e0c45e30', 'tee boy', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', 'สวัสดีครับ สนใจห้องพักครับ', '2026-09-08T14:40:19.909Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('babf522f-3a7a-48ea-a69b-a9a8bd32a108', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'พี่ ทีน', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', 'ตอนนี้ยังมีห้องว่างอยู่ไหมครับ', '2026-09-08T16:52:26.905Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('b2ebfa2e-e109-4702-b868-ad9610b85d08', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'พี่ ทีน', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', '55', '2026-09-08T16:52:37.913Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('491694c6-007f-4b54-a8cd-c1154cd8ac5c', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'พี่ ทีน', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', '555', '2026-09-09T06:01:36.889Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('3dd04d39-e383-44f3-a2d9-60bd24f6cdbd', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'พี่ ทีน', '6a733a35-e0db-4bf2-a59c-854e58a49b90', 'tbz 122', '444', '2026-09-09T06:01:48.775Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('c4e1e134-9169-46e6-85ba-a12d6c1b0ed4', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'ผู้ดูแลระบบ', NULL, NULL, '[ข้อความติดต่อถึงทีมงาน]: 555', '2026-09-09T06:56:46.509Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('631c4ae9-7c15-42ab-8b38-11529d0209f5', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', '782c3c63-9c79-4ab5-97b0-431bd83625ff', 'ghfghgjhjhj', '555', '2026-09-15T02:49:56.264Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('dcee493f-2863-4cfa-ac7f-6228b2ed0e72', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '782c3c63-9c79-4ab5-97b0-431bd83625ff', 'ghfghgjhjhj', 'vhk;;;', '2026-09-15T02:50:12.384Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('9c18ca2c-baf7-4eb0-9f95-bacb3ff6b552', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'สมหญิง ผู้เช่าใจดี', '782c3c63-9c79-4ab5-97b0-431bd83625ff', 'ghfghgjhjhj', 'ghg', '2026-09-15T02:50:20.184Z', 1);
INSERT INTO "messages" ("id", "sender_id", "sender_name", "receiver_id", "receiver_name", "dormitory_id", "dormitory_name", "message", "created_at", "is_read") VALUES ('360e2edb-1569-4d67-a9d5-e3b86aa932d7', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'แอดมิน ผู้ดูแลสูงสุด', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'นายทีน อภิวัฒน์ 19', NULL, NULL, '55', '2026-09-15T02:56:06.545Z', 1);

-- --------------------------------------------------------
-- ตาราง: view_history (จำนวน 23 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "view_history";
CREATE TABLE view_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      dormitory_id TEXT NOT NULL,
      viewed_at TEXT NOT NULL,
      UNIQUE(user_id, dormitory_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dormitory_id) REFERENCES dormitories(id) ON DELETE CASCADE
    );

INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('c3053074-0987-4cd1-9d3d-7c9a070a5b32', '580964d5-85c5-4c5f-8640-2f1726d68e89', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '2026-09-08T13:00:31.632Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('d6dc2400-85ef-4a63-a80c-a7c590c45e98', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '2026-09-08T13:06:36.226Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('05005f84-79a1-44c8-b884-2e184c989715', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '2026-09-09T06:05:06.024Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('4c154657-fe46-4881-ab29-9460c3f18b72', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '2026-09-09T06:46:07.918Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('ac65289e-e0a9-445e-839a-a39bdce9f040', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '2026-09-08T14:18:35.511Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('0a0d6a7e-17c3-40cf-a8fd-b071458712c5', '580964d5-85c5-4c5f-8640-2f1726d68e89', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '2026-09-09T06:08:33.458Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('35741116-7ce1-4c8b-91e3-10ac0e4293c3', '69b4632c-2713-46a1-9cc5-b069e0c45e30', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '2026-09-08T14:44:11.866Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('e2f44c63-3950-409a-9025-f523aedd6b75', 'c89779f0-e118-4305-89a2-5e6ac6345508', '6a733a35-e0db-4bf2-a59c-854e58a49b90', '2026-09-09T06:14:20.721Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('db00f491-8384-433b-b03c-025118e45dcc', 'c89779f0-e118-4305-89a2-5e6ac6345508', '8eab0f19-3c03-4c0c-99b5-c88126ff32e8', '2026-09-09T06:16:35.897Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('9cb3b9ff-39d4-4406-81a0-49b6607e312a', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '0546c06b-0cc4-4295-9779-801228ed5c06', '2026-09-09T06:52:30.588Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('63c626a9-2b51-40fc-887a-178efef979a7', 'c89779f0-e118-4305-89a2-5e6ac6345508', '0546c06b-0cc4-4295-9779-801228ed5c06', '2026-09-09T07:41:47.280Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('db6ba5b1-c2e0-4c04-ba32-7aae6b91316b', '580964d5-85c5-4c5f-8640-2f1726d68e89', '0546c06b-0cc4-4295-9779-801228ed5c06', '2026-09-09T07:39:55.820Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('be7b85dd-a585-4f5a-92be-29522d28b78f', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'a600bda5-3c70-49ba-896a-16b716146f42', '2026-09-09T07:48:54.707Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('852a49d5-13db-4e3d-b46e-6f0a6b4f601b', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'a600bda5-3c70-49ba-896a-16b716146f42', '2026-09-15T02:47:50.708Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('b4b4a107-f135-4827-9944-8a66699c09af', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'a600bda5-3c70-49ba-896a-16b716146f42', '2026-09-15T02:48:00.016Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('8d94e426-b2d6-4fcc-ad61-41af3269df62', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'a600bda5-3c70-49ba-896a-16b716146f42', '2026-09-15T02:58:48.450Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('d68212b7-c19c-4a01-99e8-2f3d4873cd57', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '2026-09-15T02:58:11.699Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('deb00547-ec62-4aa8-a84f-cacbf0af1f30', '580964d5-85c5-4c5f-8640-2f1726d68e89', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '2026-09-15T02:54:37.101Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('6f04ddfb-12ed-4bbb-9839-1d2b830617b4', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', '64995a8d-cf57-44ff-8ec4-3841f78527b2', '2026-09-15T02:58:36.882Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('c891da3c-5dd1-4c7b-811f-4289dcc3e348', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', '3e4029b1-ce07-450e-b369-ba468a2fef76', '2026-09-15T02:59:47.995Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('2dbdacde-9ddf-4e3d-9a3c-3753b7f1ec4d', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', '562d68d0-03e4-4479-9880-d4af7ced52ec', '2026-09-15T03:03:01.042Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('caf684e0-85c5-4912-9a53-04de30948849', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '562d68d0-03e4-4479-9880-d4af7ced52ec', '2026-09-15T03:03:11.829Z');
INSERT INTO "view_history" ("id", "user_id", "dormitory_id", "viewed_at") VALUES ('925811ec-2e0a-46be-ba23-bd9bd8a784c5', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '3e4029b1-ce07-450e-b369-ba468a2fef76', '2026-09-15T03:03:29.063Z');

-- --------------------------------------------------------
-- ตาราง: notifications (จำนวน 73 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "notifications";
CREATE TABLE notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('772934da-2ef1-4a0e-ae42-913c7a5b4157', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "ghfghgjhjhj" โดยคุณ นายทีน อภิวัฒน์ รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-08T13:11:46.380Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('bccbb10c-155f-4a1b-9dc3-cd4ad09e8c41', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "ghfghgjhjhj" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-08T13:12:05.237Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('b0bea187-aca5-4435-95e7-907ead02ef70', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "tbz 122" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-08T13:12:06.252Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('8bde02eb-5588-4671-9ec9-ab8d17f72bc3', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณไม่อนุมัติ', 'หอพัก "ghfghgjhjhj" ไม่ผ่านการอนุมัติจากผู้ดูแลระบบ', 'dormitory', '/owner/dormitories', 1, '2026-09-08T13:12:08.990Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('10470f71-094f-48c5-89e1-31079bdcd30d', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณไม่อนุมัติ', 'หอพัก "tbz 122" ไม่ผ่านการอนุมัติจากผู้ดูแลระบบ', 'dormitory', '/owner/dormitories', 1, '2026-09-08T13:12:09.748Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('3085b237-d23f-4b5b-929c-17b2b173f4fc', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "tbz 122" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-08T13:12:10.580Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('48328828-2c92-43b4-9121-5b710c83c77a', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "ghfghgjhjhj" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-08T13:12:11.197Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('33730f51-0150-42ec-aa42-2703a812db9c', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'รีวิวใหม่สำหรับหอพัก tbz 122', 'สมหญิง ผู้เช่าใจดี ให้คะแนน 5 ดาว: "fu8iy[www
"', 'review', '/dormitories/6a733a35-e0db-4bf2-a59c-854e58a49b90', 1, '2026-09-08T13:18:55.150Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('a96fb4d2-313f-4452-8323-e578509a32bd', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (ghfghgjhjhj)', 'คุณ แอดมิน ผู้ดูแลสูงสุด ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-08T13:36:09.400Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('55b05b09-8331-41c5-8cc3-89f858a84015', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'อัปเดตสถานะการจองห้องพัก (ghfghgjhjhj)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 1, '2026-09-08T13:36:32.675Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('22f16814-0c87-4fdd-8d8c-e43bac3177a8', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'รีวิวใหม่สำหรับหอพัก ghfghgjhjhj', 'สมหญิง ผู้เช่าใจดี ให้คะแนน 5 ดาว: "fuuu"', 'review', '/dorms/782c3c63-9c79-4ab5-97b0-431bd83625ff', 1, '2026-09-08T13:54:16.687Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('d151edba-fe34-4b2e-8ce2-0767c7a52f87', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "fg" โดยคุณ นายทีน อภิวัฒน์ รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-08T13:57:23.357Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('4011bc8a-d80f-4f0c-9dbf-3fbd9c5500d9', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "ttgy" โดยคุณ นายทีน อภิวัฒน์ รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-08T14:00:19.179Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('65ccd9ba-9e82-4215-83b0-ba6c9bd02911', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "ttgy" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-08T14:00:45.535Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('c587318c-47ab-4339-a4a1-22dec6f04229', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "fg" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-08T14:00:51.303Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('441b421e-77c1-4f8f-8d54-908199feca6b', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก สมหญิง ผู้เช่าใจดี', 'สวัสดีครับ สนใจห้องพักครับ', 'chat', '/owner/messages', 1, '2026-09-08T14:01:50.111Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('d94e9118-1739-4c0c-8706-1387d5c8dcdb', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'ข้อความใหม่จาก นายทีน อภิวัฒน์', '555', 'chat', '/user/messages', 1, '2026-09-08T14:02:05.059Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('fe82ca16-6d1d-48c7-943e-c1d54dd1c784', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก สมหญิง ผู้เช่าใจดี', '8;p', 'chat', '/owner/messages', 1, '2026-09-08T14:02:21.507Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('5983ca66-eb76-4552-884c-4a45bd2bcfdc', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'เจ้าของหอพักตอบกลับรีวิวของคุณ', 'การตอบกลับสำหรับหอพัก tbz 122: "kjl"', 'review', '/dorms/6a733a35-e0db-4bf2-a59c-854e58a49b90', 0, '2026-09-08T14:09:54.819Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('c56ade79-271e-4712-9b70-26484b03c9fc', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'เจ้าของหอพักตอบกลับรีวิวของคุณ', 'การตอบกลับสำหรับหอพัก ghfghgjhjhj: "545"', 'review', '/dorms/782c3c63-9c79-4ab5-97b0-431bd83625ff', 0, '2026-09-08T14:10:02.466Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('ad18e61b-fc06-4296-9dda-f5b879be6109', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'เจ้าของหอพักตอบกลับรีวิวของคุณ', 'การตอบกลับสำหรับหอพัก tbz 122: "kjl"', 'review', '/dorms/6a733a35-e0db-4bf2-a59c-854e58a49b90', 0, '2026-09-08T14:10:35.323Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('33816405-e535-4c7e-9312-e7edb91a5fff', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'รีวิวใหม่สำหรับหอพัก ttgy', 'สมหญิง ผู้เช่าใจดี ให้คะแนน 5 ดาว: "5555"', 'review', '/dorms/e6e0fe37-910a-4008-be1b-db7d7924645e', 1, '2026-09-08T14:12:27.915Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('10a5cd8e-d253-4e4b-9953-fd92a2f783b6', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'แจ้งเตือนสมาชิกใหม่!', 'มีผู้ใช้งานใหม่ ''tee boy'' สมัครเข้าใช้งานระบบในบทบาท ผู้เช่าหอพัก', 'system', '/admin/logs', 1, '2026-09-08T14:28:20.265Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('f4b4e2f0-3c8e-4a98-a2cb-5a7daa3d03d5', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก tee boy', 'สวัสดีครับ สนใจห้องพักครับ', 'chat', '/owner/messages', 1, '2026-09-08T14:40:19.911Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('f02e6d1d-223b-4750-85ab-8443cf19528c', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (tbz 122)', 'คุณ tee boy ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-08T14:44:21.245Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('a960f426-147f-490a-81a8-59c1bf84b6e8', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'แจ้งเตือนสมาชิกใหม่!', 'มีผู้ใช้งานใหม่ ''พี่ ทีน'' สมัครเข้าใช้งานระบบในบทบาท ผู้เช่าหอพัก', 'system', '/admin/logs', 1, '2026-09-08T14:49:26.424Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('3c6a5a68-83fb-4d95-850c-662987baff52', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก พี่ ทีน', 'ตอนนี้ยังมีห้องว่างอยู่ไหมครับ', 'chat', '/owner/messages', 1, '2026-09-08T16:52:26.906Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('771f01ed-0b23-4735-a698-be2db9f3bb77', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'ข้อความใหม่จาก นายทีน อภิวัฒน์', '55', 'chat', '/user/messages', 1, '2026-09-08T16:52:37.914Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('2362f84b-b8d1-4b78-8b3c-5b9a92ecbf21', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (tbz 122)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-08T16:52:52.362Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('c08176e1-7159-4285-ab14-6f71478b4c6b', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก (tbz 122)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 1, '2026-09-08T16:53:00.002Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('5d6848e1-6fbe-4746-afc2-7d7926e13de7', '69b4632c-2713-46a1-9cc5-b069e0c45e30', 'อัปเดตสถานะการจองห้องพัก (tbz 122)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 0, '2026-09-08T16:53:00.905Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('77427cd4-42c6-4998-912f-3a33f234817a', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (tbz 122)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-08T16:53:16.514Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('a7c0636c-1e8b-4a41-a5f3-199b58b40e24', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก (tbz 122)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 1, '2026-09-08T16:53:24.031Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('21eadda3-2668-47fa-957f-9d299d4a4081', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'มีผู้เช่าแสดงความคิดเห็น/รีวิวใหม่', 'ผู้เช่า พี่ ทีน ได้แสดงความคิดเห็นสำหรับหอพัก tbz 122: "เอาดงเอาดี

"', 'review', '/dorms/6a733a35-e0db-4bf2-a59c-854e58a49b90', 1, '2026-09-08T16:54:29.800Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('b45cf343-e404-4404-9504-47a40262e89e', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีผู้เช่าแสดงความคิดเห็น/รีวิวใหม่', 'ผู้เช่า พี่ ทีน ได้แสดงความคิดเห็นสำหรับหอพัก tbz 122: "เอาดงเอาดี

"', 'review', '/dorms/6a733a35-e0db-4bf2-a59c-854e58a49b90', 1, '2026-09-08T16:54:29.800Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('ef63cbc9-efb9-4960-a96f-0dc4d1f4c0ba', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (tbz 122)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-08T16:55:04.569Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('7a93ff4d-56e7-4745-a765-eb212f6a483a', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก (tbz 122)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 1, '2026-09-08T16:55:11.545Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('f8c22c7b-8c74-4702-be87-2c84b5eafe66', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (tbz 122)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-08T16:57:09.186Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('5f66bfe3-bc16-4ba2-92f3-863505b2f965', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก (tbz 122)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 1, '2026-09-08T16:57:15.218Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('a7b62c0a-2435-469f-81aa-a1d422c249d3', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'เจ้าของหอพักตอบกลับรีวิวของคุณ', 'การตอบกลับสำหรับหอพัก tbz 122: "5555"', 'review', '/dorms/6a733a35-e0db-4bf2-a59c-854e58a49b90', 1, '2026-09-09T05:57:05.546Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('b6e59d45-fd1c-43bf-96ee-dfc530499496', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก พี่ ทีน', '555', 'chat', '/owner/messages', 1, '2026-09-09T06:01:36.890Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('79803319-9229-4ce2-87ee-db5055fca2b5', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'ข้อความใหม่จาก นายทีน อภิวัฒน์', '444', 'chat', '/user/messages', 1, '2026-09-09T06:01:48.776Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('46e54ea2-cf1c-4a56-9f9b-0d74110ba271', '0f9be26f-766e-4914-991a-ee51506ae407', 'การจองห้องพักใหม่ (ssssss)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 0, '2026-09-09T06:14:39.809Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('6897673c-7f7b-4252-80c1-b2ab5753567c', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก " gggggggg" โดยคุณ นายทีน อภิวัฒน์ รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-09T06:15:14.522Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('ee191d25-973a-4895-925c-79680ee2c8d8', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก " gggggggg" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-09T06:17:58.452Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('9da0c5e0-becb-4cb0-a9cc-597fae0830cc', '0f9be26f-766e-4914-991a-ee51506ae407', 'อัปเดตสถานะการจองห้องพัก (ssssss)', 'คำขอจองห้องพักถูกยกเลิก', 'booking', '/owner/bookings', 0, '2026-09-09T06:18:57.168Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('f7774e80-bcbd-4fc0-97e0-a05ca6af3021', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ ( gggggggg)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-09T06:19:09.189Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('01e0b6ba-da8a-4582-bc5f-3ef1e8a5b948', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก ( gggggggg)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว', 'booking', '/user/bookings', 1, '2026-09-09T06:19:31.279Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('1ccd20e4-ac3d-411f-abb7-f4c6b5bda08f', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ ( gggggggg)', 'คุณ พี่ ทีน ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-09T06:26:22.509Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('62faa874-b4ea-461f-a47f-6253aa81351c', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก ( gggggggg)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว (จองแล้ว)', 'booking', '/user/bookings', 1, '2026-09-09T06:26:37.551Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('0d2e65b2-17dd-4256-a55a-dd280a6ecded', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก ( gggggggg)', 'คำขอจองห้องพักของคุณมีผู้เช่าแล้ว', 'booking', '/user/bookings', 1, '2026-09-09T06:27:06.413Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('8b7dfea7-821d-4c3e-b148-93455961455a', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'อัปเดตสถานะการจองห้องพัก ( gggggggg)', 'คำขอจองห้องพักของคุณเป็นห้องว่างแล้ว', 'booking', '/user/bookings', 1, '2026-09-09T06:27:37.023Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('7405c4cf-59f9-42d1-9763-050c5c29c24e', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'มีผู้เช่าแสดงความคิดเห็น/รีวิวใหม่', 'ผู้เช่า พี่ ทีน ได้แสดงความคิดเห็นสำหรับหอพัก  gggggggg: "5555"', 'review', '/dorms/0546c06b-0cc4-4295-9779-801228ed5c06', 1, '2026-09-09T06:32:47.668Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('244e9056-1056-405c-a772-f7e36ea109d5', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีผู้เช่าแสดงความคิดเห็น/รีวิวใหม่', 'ผู้เช่า พี่ ทีน ได้แสดงความคิดเห็นสำหรับหอพัก  gggggggg: "5555"', 'review', '/dorms/0546c06b-0cc4-4295-9779-801228ed5c06', 1, '2026-09-09T06:32:47.669Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('4009b7cc-051b-46ec-85c8-458a7878fd4f', 'c89779f0-e118-4305-89a2-5e6ac6345508', 'เจ้าของหอพักตอบกลับรีวิวของคุณ', 'การตอบกลับสำหรับหอพัก  gggggggg: "555"', 'review', '/dorms/0546c06b-0cc4-4295-9779-801228ed5c06', 1, '2026-09-09T06:33:06.322Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('7fb3c8df-e49a-4bac-b488-d05d56e97e53', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', '📬 มีข้อความติดต่อใหม่จาก ผู้เช่า (นายทีน อภิวัฒน์)', 'ข้อความ: "555" (ติดต่อ: 0808553732 / ap04052546@gmail.com)', 'contact', '/admin/logs', 1, '2026-09-09T06:56:46.508Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('f2bc3f46-37e8-4272-8910-c570ead7782e', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "12121" โดยคุณ นายทีน อภิวัฒน์ รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-09T07:47:12.728Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('312bb046-9608-4101-9026-f0d9c9721414', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "12121" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-09T07:47:19.168Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('40495821-c946-43cc-98aa-c82d657fd5d8', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก สมหญิง ผู้เช่าใจดี', '555', 'chat', '/owner/messages', 1, '2026-09-15T02:49:56.265Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('bb4871bf-64ea-4156-b350-224a31933392', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'ข้อความใหม่จาก นายทีน อภิวัฒน์', 'vhk;;;', 'chat', '/user/messages', 0, '2026-09-15T02:50:12.385Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('9100820a-f57f-4f20-842e-55414ac022d4', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'ข้อความใหม่จาก นายทีน อภิวัฒน์', 'ghg', 'chat', '/user/messages', 0, '2026-09-15T02:50:20.185Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('fed9fbe0-c491-4b91-a47d-3b34c81501a2', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'การจองห้องพักใหม่ (12121)', 'คุณ สมหญิง ผู้เช่าใจดี ได้ส่งคำขอจองห้องพัก', 'booking', '/owner/bookings', 1, '2026-09-15T02:50:37.040Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('4d22aa08-4b5b-4e44-8714-1fa878526f87', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'อัปเดตสถานะการจองห้องพัก (12121)', 'คำขอจองห้องพักของคุณได้รับการอนุมัติแล้ว (จองแล้ว)', 'booking', '/user/bookings', 1, '2026-09-15T02:50:47.299Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('cfeaf18e-e4d3-43f5-8a76-94220525d211', 'f211e6e7-0d89-4991-97dc-597be2d62ac6', 'อัปเดตสถานะการจองห้องพัก (12121)', 'คำขอจองห้องพักของคุณเป็นห้องว่างแล้ว', 'booking', '/user/bookings', 1, '2026-09-15T02:51:55.386Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('56facb34-bacb-4cb6-bca1-e19c7024f074', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "test" โดยคุณ นายทีน อภิวัฒน์ 19 รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-15T02:53:44.206Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('0f326281-07e1-42b6-917f-1e90e942691e', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'มีผู้เช่าแสดงความคิดเห็น/รีวิวใหม่', 'ผู้เช่า แอดมิน ผู้ดูแลสูงสุด (ผู้ดูแลระบบ) ได้แสดงความคิดเห็นสำหรับหอพัก test: "du"', 'review', '/dorms/64995a8d-cf57-44ff-8ec4-3841f78527b2', 1, '2026-09-15T02:54:32.474Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('4fb8bfd0-e01c-478c-a98f-15327526f814', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'เจ้าของหอพักตอบกลับรีวิวของคุณ', 'การตอบกลับสำหรับหอพัก test: "ttt"', 'review', '/dorms/64995a8d-cf57-44ff-8ec4-3841f78527b2', 1, '2026-09-15T02:54:45.796Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('a872a720-0d46-4a41-b487-4507b064add6', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "test" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 1, '2026-09-15T02:54:54.569Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('e764ffe2-882a-42af-b68e-dd5056d4f126', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'ข้อความใหม่จาก แอดมิน ผู้ดูแลสูงสุด', '55', 'chat', '/owner/messages', 1, '2026-09-15T02:56:06.547Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('00c02658-9714-40ca-98ed-21c653b3c758', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "kkkkk" โดยคุณ นายทีน อภิวัฒน์ 19 รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-15T02:59:33.848Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('0bd299ff-f391-42c5-9f35-99e292b1acd1', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "kkkkk" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 0, '2026-09-15T02:59:40.166Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('0f18755d-4837-4eea-a6de-aab519251922', 'f4f19b59-01fa-45f6-bb45-c42ff9ddd3a6', 'มีหอพักใหม่รอการตรวจสอบและอนุมัติ', 'หอพัก "ppp" โดยคุณ นายทีน อภิวัฒน์ 19 รอการตรวจสอบจากคุณ', 'dormitory', '/admin/dormitories', 1, '2026-09-15T03:00:32.149Z');
INSERT INTO "notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES ('ac145eb3-2de1-4054-a9ca-e4d8f912e580', '580964d5-85c5-4c5f-8640-2f1726d68e89', 'หอพักของคุณได้รับการอนุมัติเรียบร้อยแล้ว', 'หอพัก "ppp" ได้รับการอนุมัติจากผู้ดูแลระบบเรียบร้อยแล้ว', 'dormitory', '/owner/dormitories', 0, '2026-09-15T03:00:38.468Z');

-- --------------------------------------------------------
-- ตาราง: system_logs (จำนวน 17 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "system_logs";
CREATE TABLE system_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      details TEXT,
      performed_by TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      created_at TEXT NOT NULL
    );

INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('7cd94011-d0ff-4be3-b27d-c89491493aae', 'ระบบเริ่มทำงาน และเริ่มต้นฐานข้อมูล', 'เริ่มต้นระบบและฐานข้อมูล SQLite สำเร็จ', 'system', 'system', '2026-09-08T09:26:13.151Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('37d8ada7-fdee-40a4-819c-05740b99255b', 'ผู้ใช้งานใหม่ลงทะเบียน: ''สมชาย ใจดี''', 'สมัครสมาชิกสำเร็จในบทบาท: ผู้เช่าหอพัก (อีเมล: user@yooloei.com)', 'สมชาย ใจดี', 'new_user', '2026-09-08T12:26:13.151Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('56dfe779-58f5-49f2-ba86-2384302ee119', 'ผู้ใช้งานใหม่ลงทะเบียน: ''อนันต์ เจ้าของหอ''', 'สมัครสมาชิกสำเร็จในบทบาท: เจ้าของหอพัก (อีเมล: owner@yooloei.com)', 'อนันต์ เจ้าของหอ', 'new_user', '2026-09-08T13:26:13.151Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('1f5ad619-99a4-4f99-bd88-ffdc367a5f11', 'ผู้ใช้งานใหม่ลงทะเบียน: tee boy', 'สมัครสมาชิกสำเร็จในบทบาท: ผู้เช่าหอพัก (อีเมล: teenboy@gmail.com)', 'tee boy', 'new_user', '2026-09-08T14:28:20.265Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('25354a9a-95b5-4c3e-a6ef-e8e2b67e53c2', 'ผู้ใช้งานใหม่ลงทะเบียน: พี่ ทีน', 'สมัครสมาชิกสำเร็จในบทบาท: ผู้เช่าหอพัก (อีเมล: peeteen@gmail.com)', 'พี่ ทีน', 'new_user', '2026-09-08T14:49:26.423Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('da562548-6107-4641-b052-82cb48954c1d', 'DELETE_LOCATION', 'admin@yooloei.com', 'ลบพื้นที่ ID loc-2', 'system', '2026-09-08T15:03:43.746Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('5ee6b34f-7c24-4307-9658-69bbcbed0699', 'ADD_LOCATION', 'admin@yooloei.com', 'เพิ่มพื้นที่ใหม่: 555', 'system', '2026-09-08T16:49:04.907Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('d548d520-7d3d-4c49-8499-97d84775d97a', 'มีข้อความติดต่อใหม่ถึงผู้ดูแลระบบ (ผู้เช่า)', 'ข้อความจาก: นายทีน อภิวัฒน์ | อีเมล: ap04052546@gmail.com | เบอร์: 0808553732
รายละเอียด: "555"', 'นายทีน อภิวัฒน์', 'contact', '2026-09-09T06:56:46.507Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('c352eaad-c27f-4c60-a5ee-66194b45e015', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์1 / โลโก้: /uploads/img-1788938015555-588811597.jpg / สีธีม: #e11d48', 'system', '2026-09-09T07:13:43.372Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('2c07507c-ca67-4620-b5ae-68f6b1dbd6d7', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์ / โลโก้: /uploads/img-1788938058083-952560784.jpg / สีธีม: #334155', 'system', '2026-09-09T07:14:23.616Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('c2f96ca8-d22f-4f6c-9758-49a6abcdf671', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์ / โลโก้: /uploads/img-1788938058083-952560784.jpg / สีธีม: #7da27c', 'system', '2026-09-09T07:14:44.488Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('17cb83d4-e545-4ddf-b3de-be2af78b094a', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์ / โลโก้: /uploads/img-1788938058083-952560784.jpg / สีธีม: #e11d48', 'system', '2026-09-09T07:15:32.188Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('c996abee-96e3-4bf3-9dde-7c4485e78d51', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์ / โลโก้: /uploads/img-1788938058083-952560784.jpg / สีธีม: #7da27c', 'system', '2026-09-09T07:19:13.295Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('52e5c5af-a127-4975-a44a-dcb013132b2d', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์ / โลโก้: /uploads/img-1788938058083-952560784.jpg / สีธีม: #e11d48', 'system', '2026-09-09T07:19:26.574Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('509e139a-5608-4d74-a270-1679bd70025f', 'UPDATE_SETTINGS', 'admin@yooloei.com', 'ปรับแต่งการตั้งค่าระบบ ชื่อเว็บ: อยู่เลย เฮาส์ / โลโก้: /images/logo.png / สีธีม: -', 'system', '2026-09-09T07:22:44.943Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('19d3be38-c4e9-47a3-b3a0-bed577ee3481', 'ADD_ROOM_TYPE', 'admin@yooloei.com', 'เพิ่มประเภทห้อง/การเช่าใหม่: shv''gfup;', 'system', '2026-09-09T08:09:25.907Z');
INSERT INTO "system_logs" ("id", "action", "details", "performed_by", "type", "created_at") VALUES ('b73aa2a5-4c1f-4586-83a7-52e63ef2850f', 'DELETE_ROOM_TYPE', 'admin@yooloei.com', 'ลบประเภทห้อง ID rt-1788941365904', 'system', '2026-09-09T08:09:34.276Z');

-- --------------------------------------------------------
-- ตาราง: locations (จำนวน 8 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "locations";
CREATE TABLE locations (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-1', 'กำเนิดเพชร', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-3', 'ราชภัฏเลย', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-4', 'โรงพยาบาลเลย', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-5', 'โรงเรียนเลยพิท', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-6', 'เมืองเลย', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-7', 'นาอาน', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-8', 'กุดป่อง', 'พื้นที่ในจังหวัดเลย', '2026-09-08T15:00:22.863Z');
INSERT INTO "locations" ("id", "name", "description", "created_at") VALUES ('loc-1788886144905', '555', '', '2026-09-08T16:49:04.905Z');

-- --------------------------------------------------------
-- ตาราง: system_settings (จำนวน 7 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "system_settings";
CREATE TABLE system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('site_name', 'อยู่เลย เฮาส์', '2026-09-09T07:22:44.938Z');
INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('site_name_en', 'YOOLOEI HOUSE', '2026-09-09T07:22:44.938Z');
INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('site_logo', '/images/logo.png', '2026-09-09T07:22:44.938Z');
INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('theme_color', '#e11d48', '2026-09-09T07:19:26.569Z');
INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('admin_email', 'admin@yooloei.com', '2026-09-09T07:22:44.938Z');
INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('contact_phone', '042-123-456', '2026-09-09T07:22:44.938Z');
INSERT INTO "system_settings" ("key", "value", "updated_at") VALUES ('auto_approve_dorms', 'manual', '2026-09-09T07:22:44.938Z');

-- --------------------------------------------------------
-- ตาราง: room_types (จำนวน 6 แถว)
-- --------------------------------------------------------
DROP TABLE IF EXISTS "room_types";
CREATE TABLE room_types (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'ทั่วไป',
      description TEXT,
      created_at TEXT NOT NULL
    );

INSERT INTO "room_types" ("id", "name", "category", "description", "created_at") VALUES ('rt-1', 'รายเดือน', 'รูปแบบการเช่า', 'เช่าระยะยาวรายเดือน', '2026-09-09T08:00:14.030Z');
INSERT INTO "room_types" ("id", "name", "category", "description", "created_at") VALUES ('rt-2', 'รายวัน', 'รูปแบบการเช่า', 'เช่าระยะสั้นรายวัน', '2026-09-09T08:00:14.030Z');
INSERT INTO "room_types" ("id", "name", "category", "description", "created_at") VALUES ('rt-3', 'ห้องแอร์', 'ประเภทห้อง', 'ห้องพักติดเครื่องปรับอากาศ', '2026-09-09T08:00:14.030Z');
INSERT INTO "room_types" ("id", "name", "category", "description", "created_at") VALUES ('rt-4', 'ห้องพัดลม', 'ประเภทห้อง', 'ห้องพักแบบพัดลม', '2026-09-09T08:00:14.030Z');
INSERT INTO "room_types" ("id", "name", "category", "description", "created_at") VALUES ('rt-5', 'ห้องสตูดิโอ', 'ประเภทห้อง', 'ห้องสตูดิโอพร้อมเฟอร์นิเจอร์', '2026-09-09T08:00:14.030Z');
INSERT INTO "room_types" ("id", "name", "category", "description", "created_at") VALUES ('rt-6', 'ห้องชุด', 'ประเภทห้อง', 'ห้องชุดแบ่งสัดส่วนกว้างขวาง', '2026-09-09T08:00:14.030Z');

PRAGMA foreign_keys = ON;
