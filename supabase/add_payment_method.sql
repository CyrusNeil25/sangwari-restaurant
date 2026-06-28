-- Run this in Supabase SQL editor to add the payment_method column.
alter table orders
  add column if not exists payment_method text not null default 'upi'
    check (payment_method in ('upi', 'cod'));
