/*
  # Create books and borrowing system

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `cover_url` (text)
      - `pages` (integer)
      - `plot` (text)
      - `created_at` (timestamp)
    - `book_borrows`
      - `id` (uuid, primary key) 
      - `book_id` (uuid, references books)
      - `user_id` (uuid, references auth.users)
      - `borrow_date` (timestamp)
      - `return_date` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  cover_url text NOT NULL,
  pages integer NOT NULL,
  plot text,
  created_at timestamptz DEFAULT now()
);

-- Create book_borrows table
CREATE TABLE IF NOT EXISTS book_borrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  borrow_date timestamptz DEFAULT now(),
  return_date timestamptz,
  status text DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_borrows ENABLE ROW LEVEL SECURITY;

-- Policies for books
CREATE POLICY "Anyone can view books"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for book_borrows
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

-- Insert some sample books
INSERT INTO books (title, author, cover_url, pages, plot) VALUES
('The Psychology of Money', 'Morgan Housel', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', 256, $$Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know. It's about how you behave.$$),
('Company of One', 'Paul Jarvis', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', 240, $$What if the real key to a richer and more fulfilling career was not to create and scale a new start-up, but rather, to be able to work for yourself, determine your own hours, and become a (highly profitable) and sustainable company of one?$$),
('How Innovation Works', 'Matt Ridley', 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop', 320, 'Innovation is the main event of the modern age, the reason we experience both dramatic improvements in our living standards and unsettling changes in our society.'),
('The Picture of Dorian Gray', 'Oscar Wilde', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', 272, 'Enthralled by his own exquisite portrait, Dorian Gray makes a Faustian bargain to sell his soul in exchange for eternal youth and beauty.');