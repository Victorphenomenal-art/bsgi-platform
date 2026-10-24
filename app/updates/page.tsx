"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import PublicNavbar from '../../components/PublicNavbar';

export default function PublicUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      const { data } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setUpdates(data);
      setLoading(false);
    };
    fetchUpdates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PublicNavbar />
      
      <main className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-extrabold text-[#1e3a8a] mb-8 text-center">Latest Updates</h2>
        
        <div className="space-y-8">
          {loading && <p className="text-center text-gray-500">Loading updates...</p>}
          
          {!loading && updates.length === 0 && (
            <p className="text-center text-gray-500">No updates yet. Check back soon!</p>
          )}
          
          {updates.map((update) => (
            <div key={update.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {update.image_url && (
                <div className="w-full bg-gray-100 flex justify-center">
                  <img 
                    src={update.image_url} 
                    alt={update.title} 
                    className="w-full h-auto max-h-[600px] object-contain" 
                  />
                </div>
              )}
              <div className="p-6 border-l-4 border-[#1e3a8a]">
                <p className="text-sm text-gray-400 font-semibold mb-2">
                  {new Date(update.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{update.title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{update.content}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}