-- NexusHub Services Table
-- This table stores official services offered by the Nexus226 team

CREATE TABLE IF NOT EXISTS nexhub_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_nexhub_services_status ON nexhub_services(status);
CREATE INDEX IF NOT EXISTS idx_nexhub_services_display_order ON nexhub_services(display_order);

-- Enable Row Level Security
ALTER TABLE nexhub_services ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view active services
CREATE POLICY "Public can view active nexhub services"
ON nexhub_services
FOR SELECT
TO public
USING (status = 'active');

-- RLS Policy: Admins can view all services
CREATE POLICY "Admins can view all nexhub services"
ON nexhub_services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- RLS Policy: Admins can insert services
CREATE POLICY "Admins can insert nexhub services"
ON nexhub_services
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- RLS Policy: Admins can update services
CREATE POLICY "Admins can update nexhub services"
ON nexhub_services
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- RLS Policy: Admins can delete services
CREATE POLICY "Admins can delete nexhub services"
ON nexhub_services
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nexhub_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER nexhub_services_updated_at
BEFORE UPDATE ON nexhub_services
FOR EACH ROW
EXECUTE FUNCTION update_nexhub_services_updated_at();
