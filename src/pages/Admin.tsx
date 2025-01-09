import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BorrowedBook {
  id: string;
  user_id: string;
  book_id: string;
  user_email: string;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned';
}

export function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [borrowedBooks, setBorrowedBooks] = React.useState<BorrowedBook[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .eq('email', user.email)
          .single();

        if (error) throw error;
        
        setIsAdmin(!!data);
        
        if (!!data) {
          await fetchBorrowedBooks();
          subscribeToBookBorrows();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();

    return () => {
      supabase.channel('admin_book_borrows').unsubscribe();
    };
  }, [user]);

  const subscribeToBookBorrows = () => {
    const channel = supabase
      .channel('admin_book_borrows')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_borrows'
        },
        async () => {
          await fetchBorrowedBooks();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to book_borrows changes');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const fetchBorrowedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('book_borrows')
        .select(`
          id,
          user_id,
          book_id,
          borrow_date,
          return_date,
          status,
          user:auth_users_view!inner(email),
          book:books!inner(title)
        `)
        .order('borrow_date', { ascending: false });

      if (error) throw error;

      const transformedData: BorrowedBook[] = (data || []).map(borrow => ({
        id: borrow.id,
        user_id: borrow.user_id,
        book_id: borrow.book_id,
        user_email: borrow.user.email,
        book_title: borrow.book.title,
        borrow_date: borrow.borrow_date,
        return_date: borrow.return_date,
        status: borrow.status,
      }));

      setBorrowedBooks(transformedData);
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      setError('Failed to load borrowed books');
    }
  };

  const calculateDaysLeft = (borrowDate: string) => {
    const start = new Date(borrowDate);
    const now = new Date();
    const diffTime = 30 - Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffTime);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const activeBorrows = borrowedBooks.filter(b => b.status === 'borrowed');
  const returnedBooks = borrowedBooks.filter(b => b.status === 'returned');

  return (
    <div className="p-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Active Borrows</h3>
          <p className="text-3xl font-bold text-[#ff725e]">
            {activeBorrows.length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Returned Books</h3>
          <p className="text-3xl font-bold text-[#ff725e]">
            {returnedBooks.length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-[#ff725e]">{borrowedBooks.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Borrowed Books</h2>
        </div>
        <div className="p-6">
          {borrowedBooks.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No borrowed books</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-4 font-semibold text-gray-600">User Email</th>
                    <th className="pb-4 font-semibold text-gray-600">Book Title</th>
                    <th className="pb-4 font-semibold text-gray-600">Days Left</th>
                    <th className="pb-4 font-semibold text-gray-600">Status</th>
                    <th className="pb-4 font-semibold text-gray-600">Borrow Date</th>
                    <th className="pb-4 font-semibold text-gray-600">Return Date</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowedBooks.map((borrow) => (
                    <tr key={borrow.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-4">{borrow.user_email}</td>
                      <td className="py-4">{borrow.book_title}</td>
                      <td className="py-4">
                        {borrow.status === 'borrowed' ? (
                          <span className="font-medium">
                            {calculateDaysLeft(borrow.borrow_date)} days
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          borrow.status === 'borrowed' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {borrow.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {new Date(borrow.borrow_date).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        {borrow.return_date 
                          ? new Date(borrow.return_date).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}