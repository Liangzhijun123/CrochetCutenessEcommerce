-- Migration 008: Seller Dashboard Enhancements
-- Add tables and columns for comprehensive seller dashboard functionality

-- Add missing columns to patterns table
ALTER TABLE patterns 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create creator_profiles table for enhanced profile management
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    profile_image VARCHAR(500),
    cover_image VARCHAR(500),
    brand_colors JSONB DEFAULT '{"primary": "#f43f5e", "secondary": "#ec4899"}',
    specialties JSONB DEFAULT '[]',
    experience VARCHAR(100),
    achievements JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT true,
    show_location BOOLEAN DEFAULT true,
    show_social_links BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create pattern_reviews table for ratings and reviews
CREATE TABLE IF NOT EXISTS pattern_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(pattern_id, user_id)
);

-- Create pattern_analytics table for tracking views and performance
CREATE TABLE IF NOT EXISTS pattern_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(pattern_id, date)
);

-- Create seller_notifications table
CREATE TABLE IF NOT EXISTS seller_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patterns_creator_id ON patterns(creator_id);
CREATE INDEX IF NOT EXISTS idx_patterns_is_active ON patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
CREATE INDEX IF NOT EXISTS idx_purchases_pattern_id ON purchases(pattern_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at);
CREATE INDEX IF NOT EXISTS idx_pattern_reviews_pattern_id ON pattern_reviews(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_reviews_rating ON pattern_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_pattern_analytics_pattern_id ON pattern_analytics(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_analytics_date ON pattern_analytics(date);
CREATE INDEX IF NOT EXISTS idx_seller_notifications_seller_id ON seller_notifications(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_notifications_is_read ON seller_notifications(is_read);

-- Update existing patterns to have default values
UPDATE patterns SET views = 0 WHERE views IS NULL;
UPDATE patterns SET is_draft = false WHERE is_draft IS NULL;
UPDATE patterns SET is_archived = false WHERE is_archived IS NULL;

-- Insert sample data for testing (optional)
-- This would be removed in production
INSERT INTO pattern_reviews (pattern_id, user_id, rating, review_text, is_verified_purchase)
SELECT 
    p.id,
    u.id,
    (RANDOM() * 4 + 1)::INTEGER,
    'Great pattern! Easy to follow and beautiful results.',
    true
FROM patterns p
CROSS JOIN users u
WHERE u.role = 'user'
AND NOT EXISTS (SELECT 1 FROM pattern_reviews pr WHERE pr.pattern_id = p.id AND pr.user_id = u.id)
LIMIT 50;

-- Update pattern views with random data for testing
UPDATE patterns SET views = (RANDOM() * 1000)::INTEGER WHERE views = 0;

COMMIT;