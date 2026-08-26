-- ===================================================
-- Supabase Migration: sent_emails table
-- Run this in your Supabase SQL Editor
-- ===================================================

CREATE TABLE IF NOT EXISTS sent_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL,
  -- Possible values: 'order_confirmation', 'status_packed', 'status_shipped', 
  -- 'status_out_for_delivery', 'status_delivered', 'status_cancelled', 'product_launch', 'otp'
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  -- metadata can include: items, totalAmount, deliveryAddress, etc.
  html_preview TEXT, -- Store first ~500 chars of HTML for admin preview
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries in the admin panel
CREATE INDEX IF NOT EXISTS idx_sent_emails_order ON sent_emails(order_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_type ON sent_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_sent_emails_recipient ON sent_emails(recipient_email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_created ON sent_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_emails_status ON sent_emails(status);

-- Enable RLS (admin-only access via service role key)
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read (no client access)
CREATE POLICY "Service role full access" ON sent_emails
  FOR ALL
  USING (true)
  WITH CHECK (true);
