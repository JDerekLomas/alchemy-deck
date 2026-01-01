-- Alchemy Deck Reviews Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gtgltxaixpnclilmkshj/sql

CREATE TABLE IF NOT EXISTS alchemy_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewer TEXT NOT NULL,
  approved_count INTEGER DEFAULT 0,
  needs_work_count INTEGER DEFAULT 0,
  rejected_count INTEGER DEFAULT 0,
  reviews JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE alchemy_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous submissions)
CREATE POLICY "Allow anonymous inserts" ON alchemy_reviews
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anyone to read (so you can view results)
CREATE POLICY "Allow public read" ON alchemy_reviews
  FOR SELECT TO anon
  USING (true);

-- Index for faster queries
CREATE INDEX idx_alchemy_reviews_created_at ON alchemy_reviews(created_at DESC);
