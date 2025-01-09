import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Search, Heart, BookOpen, Clock, Star, X } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  pages: number;
  plot: string;
}

export function AllBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<string[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToFavorites, setAddingToFavorites] = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchBorrowedBooks();
      fetchFavoriteBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');
    
    if (error) {
      console.error('Error fetching books:', error);
      return;
    }

    setBooks(data || []);
    setLoading(false);
  };

  const fetchBorrowedBooks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('book_borrows')
      .select('book_id')
      .eq('user_id', user.id)
      .eq('status', 'borrowed');

    if (error) {
      console.error('Error fetching borrowed books:', error);
      return;
    }

    setBorrowedBooks(data.map(borrow => borrow.book_id));
  };

  const fetchFavoriteBooks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favorite_books')
      .select('book_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorite books:', error);
      return;
    }

    setFavoriteBooks(data.map(favorite => favorite.book_id));
  };

  const handleBorrow = async (bookId: string) => {
    if (!user) return;
    
    setBorrowing(true);
    try {
      const { error } = await supabase
        .from('book_borrows')
        .insert({
          book_id: bookId,
          user_id: user.id,
          borrow_date: new Date().toISOString(),
          status: 'borrowed'
        });

      if (error) throw error;
      
      await fetchBorrowedBooks();
    } catch (err) {
      console.error('Error borrowing book:', err);
    } finally {
      setBorrowing(false);
    }
  };

  const toggleFavorite = async (bookId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;

    setAddingToFavorites(bookId);
    try {
      if (favoriteBooks.includes(bookId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_books')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);

        if (error) throw error;
        setFavoriteBooks(favoriteBooks.filter(id => id !== bookId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_books')
          .insert({
            user_id: user.id,
            book_id: bookId
          });

        if (error) throw error;
        setFavoriteBooks([...favoriteBooks, bookId]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setAddingToFavorites(null);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-12">
      <h1 className="text-4xl font-bold mb-8">All Books</h1>

      <div className="flex items-center space-x-3 mb-12">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm border border-gray-100 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)}
            className="cursor-pointer group relative"
          >
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full aspect-[3/4] rounded-2xl shadow-lg object-cover group-hover:shadow-xl transition-shadow"
            />
            <button
              onClick={(e) => toggleFavorite(book.id, e)}
              disabled={addingToFavorites === book.id}
              className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                favoriteBooks.includes(book.id)
                  ? 'bg-[#ff725e] text-white'
                  : 'bg-white text-gray-400 hover:text-[#ff725e]'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteBooks.includes(book.id) ? 'fill-current' : ''
                }`}
              />
            </button>
            <div className="mt-4">
              <h3 className="font-medium text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-500">{book.author}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="grid grid-cols-[300px,1fr] h-full">
              <div className="p-8">
                <img
                  src={selectedBook.cover_url}
                  alt={selectedBook.title}
                  className="w-full aspect-[3/4] rounded-xl shadow-lg object-cover"
                />
              </div>
              
              <div className="p-8 pl-0 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{selectedBook.title}</h2>
                  <p className="text-gray-600 mb-6">{selectedBook.author}</p>
                  
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span>{selectedBook.pages} pages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>30 days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span>4.5</span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="font-semibold mb-3">Plot</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedBook.plot}</p>
                  </div>
                </div>
                
                <div>
                  {borrowedBooks.includes(selectedBook.id) ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed"
                    >
                      Already Borrowed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBorrow(selectedBook.id)}
                      disabled={borrowing}
                      className="w-full bg-[#ff725e] text-white py-3 rounded-xl font-medium hover:bg-[#ff8b7a] transition-colors disabled:opacity-50"
                    >
                      {borrowing ? 'Processing...' : 'Borrow Now'}
                    </button>
                  )}
                  <p className="text-center text-sm text-gray-400 mt-2">30 days borrowing period</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}