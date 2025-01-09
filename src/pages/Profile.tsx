import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

interface BorrowedBook {
  id: string;
  book: {
    title: string;
    author: string;
    cover_url: string;
  };
  borrow_date: string;
  status: 'borrowed' | 'returned';
}

interface Profile {
  created_at: string;
  name: string;
  bio: string;
}

export function Profile() {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [returningBook, setReturningBook] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBorrowedBooks();
      subscribeToBookBorrows();
    }

    return () => {
      supabase.channel('book_borrows_changes').unsubscribe();
    };
  }, [user]);

  const subscribeToBookBorrows = () => {
    supabase
      .channel('book_borrows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_borrows',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchBorrowedBooks();
        }
      )
      .subscribe();
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchBorrowedBooks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('book_borrows')
      .select(`
        id,
        borrow_date,
        status,
        book:books (
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', user.id)
      .order('borrow_date', { ascending: false });

    if (error) {
      console.error('Error fetching borrowed books:', error);
      return;
    }

    setBorrowedBooks(data || []);
    setLoading(false);
  };

  const handleReturnBook = async (borrowId: string) => {
    setReturningBook(borrowId);
    setMessage('');
    
    try {
      const { error } = await supabase
        .from('book_borrows')
        .update({
          status: 'returned',
          return_date: new Date().toISOString()
        })
        .eq('id', borrowId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setMessage('Book returned successfully!');
      
      // Fetch updated books list
      await fetchBorrowedBooks();
    } catch (error) {
      console.error('Error returning book:', error);
      setMessage('Error returning book');
    } finally {
      setReturningBook(null);
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
      <div className="max-w-4xl mx-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium">Member since</h3>
            </div>
            <p className="text-gray-600">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium">Books Read</h3>
            </div>
            <p className="text-gray-600">{borrowedBooks.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Reading History</h2>
          </div>
          <div className="p-6">
            {borrowedBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven't borrowed any books yet
              </div>
            ) : (
              <div className="space-y-6">
                {borrowedBooks.map((borrow) => (
                  <div
                    key={borrow.id}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100"
                  >
                    <img
                      src={borrow.book.cover_url}
                      alt={borrow.book.title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{borrow.book.title}</h3>
                      <p className="text-sm text-gray-500">{borrow.book.author}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Borrowed on {new Date(borrow.borrow_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {borrow.status === 'borrowed' ? (
                        <button
                          onClick={() => handleReturnBook(borrow.id)}
                          disabled={returningBook === borrow.id}
                          className="px-4 py-2 text-sm font-medium text-[#ff725e] hover:text-[#ff8b7a] transition-colors disabled:opacity-50"
                        >
                          {returningBook === borrow.id ? 'Returning...' : 'Return Book'}
                        </button>
                      ) : (
                        <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                          Returned
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}