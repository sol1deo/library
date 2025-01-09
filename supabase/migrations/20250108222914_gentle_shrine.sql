/*
  # Add Popular Books

  1. New Books
    - Adds a collection of popular books to the database
    - Includes bestsellers and classics across different genres
*/

INSERT INTO books (title, author, cover_url, pages, plot)
VALUES
  (
    'The Lord of the Rings',
    'J.R.R. Tolkien',
    'https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=300&h=400&fit=crop',
    1178,
    'In ancient times the Rings of Power were crafted by the Elven-smiths, and Sauron, The Dark Lord, forged the One Ring, filling it with his own power so that he could rule all others. But the One Ring was taken from him, and though he sought it throughout Middle-earth, it remained lost to him.'
  ),
  (
    '1984',
    'George Orwell',
    'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=400&fit=crop',
    328,
    E'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell\'s nightmarish vision of a totalitarian, bureaucratic world and one poor stiff\'s attempt to find individuality.'
  ),
  (
    'Pride and Prejudice',
    'Jane Austen',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    432,
    'Pride and Prejudice follows the turbulent relationship between Elizabeth Bennet, the daughter of a country gentleman, and Fitzwilliam Darcy, a rich aristocratic landowner. They must overcome the titular sins of pride and prejudice in order to fall in love and marry.'
  ),
  (
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop',
    180,
    'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted "gin was the national drink and sex the national obsession," is an exquisitely crafted tale of America in the 1920s.'
  ),
  (
    'To Kill a Mockingbird',
    'Harper Lee',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop',
    281,
    'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. Through the young eyes of Scout and Jem Finch, Harper Lee explores with rich humor and unswerving honesty the irrationality of adult attitudes toward race and class in the Deep South of the 1930s.'
  ),
  (
    'The Hobbit',
    'J.R.R. Tolkien',
    'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop',
    310,
    'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep one day to whisk him away on an adventure.'
  ),
  (
    'The Catcher in the Rye',
    'J.D. Salinger',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    234,
    'The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult, secondhand description, he leaves his prep school in Pennsylvania and goes underground in New York City for three days.'
  ),
  (
    'The Alchemist',
    'Paulo Coelho',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    197,
    'Paulo Coelho''s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.'
  )
ON CONFLICT (title) DO UPDATE SET
  author = EXCLUDED.author,
  cover_url = EXCLUDED.cover_url,
  pages = EXCLUDED.pages,
  plot = EXCLUDED.plot;