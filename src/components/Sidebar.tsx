import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Library, Download, Heart, Settings, HelpCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return;
      
      const { data } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email)
        .single();

      setIsAdmin(!!data);
    }

    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: 'Discover', path: '/' },
    { icon: Grid, label: 'Category', path: '/category' },
    { icon: Library, label: 'My Library', path: '/library' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Download, label: 'Download', path: '/downloads' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  return (
    <div className="w-80 bg-white p-12 flex flex-col h-full">
      <h1 className="text-2xl font-bold tracking-wide mb-16">THE BOOKS</h1>
      
      <div className="flex-1 flex flex-col">
        <div className="text-sm text-gray-400 font-medium mb-8">MENU</div>
        <nav className="flex-1 flex flex-col">
          <div className="space-y-6 flex-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center space-x-4 ${isActive(item.path) ? 'text-[#ff725e]' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive(item.path) ? 'bg-[#ff725e] bg-opacity-10' : 'bg-gray-50'
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-[#ff725e]' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-base ${isActive(item.path) ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="h-[1px] bg-gray-200 my-6" />

          <div className="space-y-6">
            {settingsItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center space-x-4 ${isActive(item.path) ? 'text-[#ff725e]' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive(item.path) ? 'bg-[#ff725e] bg-opacity-10' : 'bg-gray-50'
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-[#ff725e]' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-base ${isActive(item.path) ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}

            {isAdmin && (
              <Link to="/admin">
                <div className={`flex items-center space-x-4 ${isActive('/admin') ? 'text-[#ff725e]' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive('/admin') ? 'bg-[#ff725e] bg-opacity-10' : 'bg-gray-50'
                  }`}>
                    <ShieldCheck className={`w-5 h-5 ${isActive('/admin') ? 'text-[#ff725e]' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-base ${isActive('/admin') ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    Admin
                  </span>
                </div>
              </Link>
            )}
          </div>
        </nav>
      </div>
      
      <div>
        <div className="h-[1px] bg-gray-200 my-6" />
        <button onClick={signOut} className="w-full">
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-base">Log out</span>
          </div>
        </button>
      </div>
    </div>
  );
}