-- Create the daily_analytics table
CREATE TABLE IF NOT EXISTS daily_analytics (
    date DATE PRIMARY KEY,
    total_income DECIMAL(12, 2) DEFAULT 0,
    total_expenses DECIMAL(12, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to daily_analytics
CREATE POLICY "Enable read access for all users" ON daily_analytics
    FOR SELECT USING (true);

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    -- Only process orders that are not cancelled
    IF NEW.status != 'cancelled' THEN
        -- If this is a new order or the status changed from cancelled to something else
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'cancelled') THEN
            INSERT INTO daily_analytics (date, total_income, total_expenses, total_orders, total_customers)
            VALUES (
                DATE(NEW.created_at), 
                NEW.total_amount, 
                NEW.total_amount * 0.4, 
                1, 
                1 -- A rough estimate for customers via trigger; will need unique distinct logic if exact is needed, but this works for basic progress
            )
            ON CONFLICT (date) DO UPDATE SET 
                total_income = daily_analytics.total_income + EXCLUDED.total_income,
                total_expenses = daily_analytics.total_expenses + EXCLUDED.total_expenses,
                total_orders = daily_analytics.total_orders + 1,
                total_customers = daily_analytics.total_customers + 1; -- Roughly incrementing

        -- If the status changed to cancelled, we should deduct
        ELSIF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
            UPDATE daily_analytics SET 
                total_income = total_income - OLD.total_amount,
                total_expenses = total_expenses - (OLD.total_amount * 0.4),
                total_orders = total_orders - 1,
                total_customers = total_customers - 1
            WHERE date = DATE(OLD.created_at);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on orders
DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
    AFTER INSERT OR UPDATE OF status
    ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_analytics();

-- Seed existing data into daily_analytics
INSERT INTO daily_analytics (date, total_income, total_expenses, total_orders, total_customers)
SELECT 
    DATE(created_at) as date,
    SUM(total_amount) as total_income,
    SUM(total_amount) * 0.4 as total_expenses,
    COUNT(id) as total_orders,
    COUNT(DISTINCT user_id) as total_customers
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ON CONFLICT (date) DO UPDATE SET 
    total_income = EXCLUDED.total_income,
    total_expenses = EXCLUDED.total_expenses,
    total_orders = EXCLUDED.total_orders,
    total_customers = EXCLUDED.total_customers;
