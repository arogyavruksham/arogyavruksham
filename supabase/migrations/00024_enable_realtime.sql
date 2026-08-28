-- Enable real-time for all tables that the admin panel listens to

-- Add the tables to the publication so it broadcasts changes to our clients
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE newsletter_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE homepage_images;
ALTER PUBLICATION supabase_realtime ADD TABLE coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
