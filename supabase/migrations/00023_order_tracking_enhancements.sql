-- Add order tracking enhancements for delivery time tracking and admin visibility

-- Admin viewed flag
alter table public.orders add column if not exists admin_viewed boolean default false;

-- Tracking number for shipping
alter table public.orders add column if not exists tracking_number text;

-- Shipping carrier
alter table public.orders add column if not exists shipping_carrier text;

-- Shipped at timestamp
alter table public.orders add column if not exists shipped_at timestamp with time zone;

-- Delivered at timestamp
alter table public.orders add column if not exists delivered_at timestamp with time zone;

-- Expected delivery date (computed as order_date + 3 days)
alter table public.orders add column if not exists expected_delivery_date date;

-- Updated at timestamp for last update tracking
alter table public.orders add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Create index for admin_viewed for filtering
create index if not exists idx_orders_admin_viewed on public.orders(admin_viewed);

-- Create index for expected_delivery_date for delayed filtering
create index if not exists idx_orders_expected_delivery on public.orders(expected_delivery_date);

-- Create index for status for filtering
create index if not exists idx_orders_status on public.orders(status);

-- Create trigger to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trigger_orders_updated_at on public.orders;
create trigger trigger_orders_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- Update existing orders to set expected_delivery_date (order_date + 3 days)
update public.orders 
set expected_delivery_date = (created_at::date + interval '3 days')::date
where expected_delivery_date is null;

-- Set admin_viewed to true for orders that are already delivered (assumed viewed)
update public.orders 
set admin_viewed = true
where status = 'delivered' and admin_viewed = false;

-- Set shipped_at for shipped orders
update public.orders 
set shipped_at = created_at + interval '1 day'
where status in ('shipped', 'out_for_delivery', 'delivered') and shipped_at is null;

-- Set delivered_at for delivered orders
update public.orders 
set delivered_at = created_at + interval '3 days'
where status = 'delivered' and delivered_at is null;