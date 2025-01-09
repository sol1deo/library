import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Profile {
  name: string;
  bio: string;
}

export function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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

    if (data) {
      setName(data.name || '');
      setBio(data.bio || '');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          name,
          bio,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user?.email}
                disabled
                className="w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-[#ff725e] focus:ring-[#ff725e]"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-[#ff725e] focus:ring-[#ff725e]"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#ff725e] text-white py-3 rounded-lg hover:bg-[#ff8b7a] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}