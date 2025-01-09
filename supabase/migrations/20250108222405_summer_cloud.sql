/*
  # Add Harry Potter Books

  1. Changes
    - Adds unique constraint on book titles to prevent duplicates
    - Adds all 7 Harry Potter books with accurate details
  
  2. Security
    - Maintains existing RLS policies
*/

-- First add a unique constraint on the title column
ALTER TABLE books ADD CONSTRAINT books_title_key UNIQUE (title);

-- Then insert the books
INSERT INTO books (title, author, cover_url, pages, plot)
VALUES
  (
    'Harry Potter and the Philosopher''s Stone',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    223,
    'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle. Then, on Harry''s eleventh birthday, a great beetle-eyed giant of a man called Rubeus Hagrid bursts in with some astonishing news: Harry Potter is a wizard, and he has a place at Hogwarts School of Witchcraft and Wizardry.'
  ),
  (
    'Harry Potter and the Chamber of Secrets',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    251,
    'Ever since Harry Potter had come home for the summer, the Dursleys had been so mean and hideous that all Harry wanted was to get back to the Hogwarts School of Witchcraft and Wizardry. But just as he''s packing his bags, Harry receives a warning from a strange impish creature who says that if Harry returns to Hogwarts, disaster will strike.'
  ),
  (
    'Harry Potter and the Prisoner of Azkaban',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    317,
    'When the Knight Bus crashes through the darkness and screeches to a halt in front of him, it''s the start of another far from ordinary year at Hogwarts for Harry Potter. Sirius Black, escaped mass-murderer and follower of Lord Voldemort, is on the run - and they say he is coming after Harry.'
  ),
  (
    'Harry Potter and the Goblet of Fire',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    636,
    'The Triwizard Tournament is to be held at Hogwarts. Only wizards who are over seventeen are allowed to enter - but that doesn''t stop Harry dreaming that he will win the competition. Then at Hallowe''en, when the Goblet of Fire makes its selection, Harry is amazed to find his name is one of those that the magical cup picks out.'
  ),
  (
    'Harry Potter and the Order of the Phoenix',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    766,
    'Dark times have come to Hogwarts. After the Dementors'' attack on his cousin Dudley, Harry Potter knows that Voldemort will stop at nothing to find him. There are many who deny the Dark Lord''s return, but Harry is not alone: a secret order gathers at Grimmauld Place to fight against the Dark forces.'
  ),
  (
    'Harry Potter and the Half-Blood Prince',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    607,
    'When Dumbledore arrives at Privet Drive one summer night to collect Harry Potter, his wand hand is blackened and shrivelled, but he does not reveal why. Secrets and suspicion are spreading through the wizarding world, and Hogwarts itself is not safe. Harry is convinced that Malfoy bears the Dark Mark: there is a Death Eater amongst them.'
  ),
  (
    'Harry Potter and the Deathly Hallows',
    'J.K. Rowling',
    'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=400&fit=crop',
    607,
    'As he climbs into the sidecar of Hagrid''s motorbike and takes to the skies, leaving Privet Drive for the last time, Harry Potter knows that Lord Voldemort and the Death Eaters are not far behind. The protective charm that has kept Harry safe until now is broken, but he cannot keep hiding. The Dark Lord is breathing fear into everything Harry loves, and to stop him Harry will have to find and destroy the remaining Horcruxes.'
  )
ON CONFLICT (title) DO UPDATE SET
  author = EXCLUDED.author,
  cover_url = EXCLUDED.cover_url,
  pages = EXCLUDED.pages,
  plot = EXCLUDED.plot;