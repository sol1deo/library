-- Add email column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Update profiles table with emails from auth.users
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) 
DO UPDATE SET email = EXCLUDED.email
WHERE profiles.email IS NULL;