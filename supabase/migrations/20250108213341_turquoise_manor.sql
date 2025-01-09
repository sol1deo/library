/*
  # Create admin user and permissions

  1. Changes
    - Drop and recreate admins table with proper structure
    - Add RLS policies for admin access
    - Insert initial admin user
*/

-- Recreate admins table
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow read access to authenticated users"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert the admin user
INSERT INTO admins (email)
VALUES ('rozhentshev@gmail.com')
ON CONFLICT (email) DO NOTHING;