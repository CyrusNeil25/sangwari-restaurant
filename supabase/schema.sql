-- =============================================================
-- Sangwari Restaurant — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL editor → New query).
-- =============================================================

-- ─── Enums ────────────────────────────────────────────────────
create type order_type as enum ('delivery', 'takeaway', 'dinein');

create type order_status as enum (
  'PENDING', 'CONFIRMED', 'PREPARING',
  'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'
);

create type payment_status as enum ('UNPAID', 'PAID');

-- ─── Settings (single row) ────────────────────────────────────
create table settings (
  id            integer primary key default 1 check (id = 1), -- enforce singleton
  name          text not null default 'Sangwari',
  tagline       text,
  welcome       text,
  upi_id        text not null default '',
  upi_name      text not null default '',
  whatsapp_number text not null default '',
  phone_display text,
  address       text not null default '',
  map_url       text,
  hours         text not null default '11:00 AM – 11:00 PM',
  is_open       boolean not null default true,
  delivery_fee  integer not null default 30,
  min_order     integer not null default 99,
  tax_percent   integer not null default 5,
  instagram     text
);

-- ─── Categories ───────────────────────────────────────────────
create table categories (
  id          text primary key,
  name        text not null,
  emoji       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

-- ─── Menu items ───────────────────────────────────────────────
create table menu_items (
  id           text primary key,
  category_id  text not null references categories(id) on delete cascade,
  name         text not null,
  description  text not null default '',
  price        integer not null,          -- rupees, no decimals
  emoji        text,
  image_url    text,
  is_veg       boolean not null default true,
  is_available boolean not null default true,
  spice_level  smallint check (spice_level between 0 and 3),
  tags         text[] default '{}',
  sort_order   integer not null default 0
);

-- ─── Orders ───────────────────────────────────────────────────
create table orders (
  code            text primary key,       -- e.g. 'A1B2'
  type            order_type not null,
  customer_name   text not null,
  customer_phone  text not null,
  address         text,
  table_number    text,
  subtotal        integer not null,
  delivery_fee    integer not null default 0,
  tax             integer not null default 0,
  total           integer not null,
  status          order_status not null default 'PENDING',
  payment_status  payment_status not null default 'UNPAID',
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── Order items ─────────────────────────────────────────────
create table order_items (
  id          bigint generated always as identity primary key,
  order_code  text not null references orders(code) on delete cascade,
  item_id     text not null,               -- snapshot; item may be deleted later
  name        text not null,               -- snapshotted so history stays correct
  price       integer not null,
  qty         integer not null default 1,
  note        text
);

create index on order_items (order_code);
create index on orders (status);
create index on orders (created_at desc);

-- ─── Row Level Security ───────────────────────────────────────
alter table settings   enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders     enable row level security;
alter table order_items enable row level security;

-- Settings: public read; admin write (service role bypasses RLS automatically)
create policy "settings_public_read"
  on settings for select using (true);

-- Categories: public read
create policy "categories_public_read"
  on categories for select using (true);

-- Menu items: public read
create policy "menu_items_public_read"
  on menu_items for select using (true);

-- Orders: anon can INSERT (place an order); can SELECT their own order by code
-- (The SELECT by code is done via a server action using the service role, so
--  we just allow anon insert here. Admins use the service role key.)
create policy "orders_anon_insert"
  on orders for insert with check (true);

create policy "order_items_anon_insert"
  on order_items for insert with check (true);

-- ─── Realtime ────────────────────────────────────────────────
-- Enable realtime on orders so the admin board gets live updates.
-- In Supabase dashboard: Database → Replication → enable orders table.
-- (Cannot be done via SQL; use the dashboard toggle.)
