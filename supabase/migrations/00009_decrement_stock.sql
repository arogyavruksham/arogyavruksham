-- Function to decrement product stock securely
create or replace function public.decrement_stock(product_id uuid, quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock_count = stock_count - quantity
  where id = product_id and stock_count >= quantity;
end;
$$;
