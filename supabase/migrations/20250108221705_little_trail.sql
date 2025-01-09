/*
  # Add favorite books functionality

  1. New Tables
    - `favorite_books`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (uuid, references books)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `favorite_books` table
    - Add policies for users to manage their favorites
    - Add policy for admins to view all favorites
*/

-- Create favorite_books table
CREATE TABLE IF NOT EXISTS favorite_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE favorite_books ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON favorite_books
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON favorite_books
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own favorites"
  ON favorite_books
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all favorites"
  ON favorite_books
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE email = auth.email()
    )
  );