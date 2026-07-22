-- Add payment_method to orders
alter table public.orders add column if not exists payment_method text default 'Online Payment';
