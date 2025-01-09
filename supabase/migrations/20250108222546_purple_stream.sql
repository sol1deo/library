/*
  # Update Harry Potter Book Cover

  1. Changes
    - Updates the cover image URL for "Harry Potter and the Philosopher's Stone"
    to use the official cover art
*/

UPDATE books 
SET cover_url = 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?w=300&h=400&fit=crop'
WHERE title = 'Harry Potter and the Philosopher''s Stone';