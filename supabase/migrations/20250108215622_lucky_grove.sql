/*
  # Add foreign key relationships for book borrows

  1. Changes
    - Add foreign key relationships for book_borrows table
    - Add explicit foreign key references for PostgREST
*/

-- Drop existing foreign key constraints if they exist
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'book_borrows_book_id_fkey'
    AND table_name = 'book_borrows'
  ) THEN
    ALTER TABLE book_borrows DROP CONSTRAINT book_borrows_book_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'book_borrows_user_id_fkey'
    AND table_name = 'book_borrows'
  ) THEN
    ALTER TABLE book_borrows DROP CONSTRAINT book_borrows_user_id_fkey;
  END IF;
END $$;

-- Add foreign key constraints with explicit names
ALTER TABLE book_borrows
  ADD CONSTRAINT book_borrows_book_id_fkey 
  FOREIGN KEY (book_id) 
  REFERENCES books(id) 
  ON DELETE CASCADE;

ALTER TABLE book_borrows
  ADD CONSTRAINT book_borrows_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;