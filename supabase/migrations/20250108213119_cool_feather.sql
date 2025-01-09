/*
  # Create admin role and permissions

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `admins` table
    - Add policy for admin access
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Allow full access to admins"
  ON admins
  TO authenticated
  USING (auth.email() = 'rozhentshev@gmail.com');

-- Insert the admin user
INSERT INTO admins (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'rozhentshev@gmail.com'
ON CONFLICT DO NOTHING;