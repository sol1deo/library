import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Heart, BookOpen, Clock, Star, X } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  pages: number;
  plot: string;
}

export function Favorites() {
  const { user } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingFavorite, setRemovingFavorite] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<string[]>([]);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavoriteBooks();
      fetchBorrowedBooks();
    }
  }, [user]);

  const fetchFavoriteBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_books')
        .select(`
          book_id,
          books (
            id,
            title,
            author,
            cover_url,
            pages,
            plot
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const books = data
        .map(item => item.books)
        .filter(book => book) as Book[];

      setFavoriteBooks(books);
    } catch (err) {
      console.error('Error fetching favorite books:', err);
    } finally {
      setLoading(false);
    }
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

  const removeFavorite = async (bookId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (!user) return;

    setRemovingFavorite(bookId);
    try {
      const { error } = await supabase
        .from('favorite_books')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;

      setFavoriteBooks(favoriteBooks.filter(book => book.id !== bookId));
      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    } finally {
      setRemovingFavorite(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-12">
      <h1 className="text-4xl font-bold mb-10">Favorites</h1>

      {favoriteBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Heart className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-medium text-gray-600 mb-2">No favorite books yet</h2>
          <p className="text-gray-400">
            Start adding books to your favorites by clicking the heart icon on any book
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {favoriteBooks.map((book) => (
            <div 
              key={book.id} 
              className="relative group cursor-pointer"
              onClick={() => setSelectedBook(book)}
            >
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full aspect-[3/4] rounded-2xl shadow-lg object-cover group-hover:shadow-xl transition-shadow"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => removeFavorite(book.id, e)}
                  disabled={removingFavorite === book.id}
                  className="bg-white text-[#ff725e] p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Heart className="w-6 h-6 fill-current" />
                </button>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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