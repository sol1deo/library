import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, X, BookOpen, Clock, Star, Heart, User, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  pages: number;
  plot: string;
}

export function Home() {
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [addingToFavorites, setAddingToFavorites] = useState<string | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<string[]>([]);
  const [borrowing, setBorrowing] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchFavoriteBooks();
      fetchBorrowedBooks();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(8);

      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="h-full flex flex-col p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-8">Discover</h1>
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="Find the book you like..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-xl px-4 py-3 pl-10 text-sm border border-gray-100"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <button className="bg-[#1b3a4b] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#2c5a74] transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* User Profile - Top Right */}
      <div className="absolute top-8 right-12 flex items-center space-x-3">
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 hover:bg-white/50 rounded-lg px-2 py-1 transition-colors"
          >
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'Guest'}`}
              alt="Profile"
              className="w-8 h-8 rounded-full bg-gray-100"
            />
            <span className="text-sm font-medium text-gray-700">{user?.email?.split('@')[0]}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={async () => {
                  await signOut();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-gray-200"></div>
        <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center relative">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#ff725e]"></span>
        </button>
      </div>

      {/* Book Recommendations */}
      <div className="space-y-12">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Book Recommendation</h2>
            <button 
              onClick={() => navigate('/all-books')}
              className="flex items-center space-x-1 bg-[#f5f2ea] hover:bg-[#e8e4d8] text-[#1b3a4b] px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <span>View all</span>
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="cursor-pointer group relative"
                >
                  <div className="relative aspect-[3/4] mb-4">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow"
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
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-[#ff725e] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500">{book.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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