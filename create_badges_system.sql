-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL,
    description TEXT,
    icon TEXT, -- CSS class or icon name
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (Public Read, Admin Write)
CREATE POLICY "Public read badges" ON badges
    FOR SELECT USING (true);

CREATE POLICY "Admin insert badges" ON badges
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin update badges" ON badges
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- RLS Policies for user_badges (Public Read, Admin Write)
CREATE POLICY "Public read user_badges" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Admin insert user_badges" ON user_badges
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admin delete user_badges" ON user_badges
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Seed Data (The 5 Tiers)
INSERT INTO badges (name, tier, description, icon) VALUES
('Active Contributor', 1, 'Recognized for consistency and basic participation.', 'star'),
('Reliable Provider', 2, 'Recognized for service reliability and positive feedback.', 'shield-check'),
('Certified Specialist', 3, 'Recognized for certified knowledge in a specific field.', 'certificate'),
('Elite Partner', 4, 'Recognized for high volume and sustained excellence.', 'trophy'),
('Nexus Legend', 5, 'Reserved for the highest impact members.', 'crown')
ON CONFLICT DO NOTHING;
