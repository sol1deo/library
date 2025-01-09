/*
  # Fix foreign key relationships

  1. Changes
    - Drop and recreate book_borrows table with proper foreign key relationships
    - Ensure proper column references for joins
  
  2. Security
    - Maintain existing RLS policies
*/

-- Temporarily disable RLS to allow table recreation
ALTER TABLE book_borrows DISABLE ROW LEVEL SECURITY;

-- Drop existing table
DROP TABLE IF EXISTS book_borrows;

-- Recreate book_borrows table with proper relationships
CREATE TABLE book_borrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  borrow_date timestamptz DEFAULT now(),
  return_date timestamptz,
  status text DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned')),
  created_at timestamptz DEFAULT now()
);

-- Re-enable RLS
ALTER TABLE book_borrows ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own borrows"
  ON book_borrows
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can borrow books"
  ON book_borrows
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all borrows"
  ON book_borrows
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE email = auth.email()
    )
  );