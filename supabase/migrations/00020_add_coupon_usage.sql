-- Add usage tracking to coupons
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_limit integer DEFAULT NULL;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_code text)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
