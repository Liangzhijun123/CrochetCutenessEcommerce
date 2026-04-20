-- Migration 012: Add extended columns to products table
-- These columns are required by the seller product upload form

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS youtube_link TEXT,
  ADD COLUMN IF NOT EXISTS written_instructions TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'plushie' CHECK (product_type IN ('plushie', 'pdf_pattern', 'both')),
  ADD COLUMN IF NOT EXISTS pdf_password TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_url TEXT;
