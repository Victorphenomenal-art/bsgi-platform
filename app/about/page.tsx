"use client";
import { useEffect, useState } from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import { supabase } from '../../lib/supabase';

export default function About() {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      // Fetch profiles that have a bio written
      const { data } = await supabase.from('profiles').select('*, user_roles(role)').not('bio', 'is', null);
      if (data) setLeaders(data);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PublicNavbar />
      
      <main className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-extrabold text-[#1e3a8a] mb-8 text-center">About Bright Stars Global Initiative</h2>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6 text-gray-700 leading-relaxed text-lg mb-12">
          <p>
            <strong>Bright Stars Global Initiative (BSGI)</strong> is a youth-driven organization dedicated to creating actionable change in communities worldwide. We believe that young people are not just the leaders of tomorrow, but the catalysts of today.
          </p>
          <p>
            Our work is anchored on the United Nations Sustainable Development Goals (SDGs). While our vision encompasses all 17 goals, our currently active departments are focused on <strong>SDG 4 (Quality Education)</strong> and <strong>SDG 16 (Peace, Justice & Strong Institutions)</strong>, driving targeted, actionable change in these critical areas.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900 text-xl mb-3">Our Mission</h3>
              <p>To empower youth, drive sustainable development, and build strong institutions through advocacy, capacity building, and community impact.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-bold text-green-900 text-xl mb-3">Our Vision</h3>
              <p>A world where every young person has access to quality education and lives in a society governed by peace, justice, and strong institutions.</p>
            </div>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-[#1e3a8a] mb-8 text-center border-t pt-12">Our Leadership</h3>
        
        {leaders.length === 0 ? (
          <p className="text-center text-gray-500 mb-12">Leadership bios coming soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {leaders.map((leader) => (
              <div key={leader.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                {leader.avatar_url ? (
                  <img src={leader.avatar_url} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-2xl border-2 border-gray-200">
                    {leader.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{leader.full_name}</h4>
                  <p className="text-sm font-bold text-blue-600 uppercase mb-2">
                    {leader.user_roles?.[0]?.role?.replace('_', ' ') || 'Member'}
                  </p>
                  <p className="text-gray-600 text-sm">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTACT SECTION */}
        <h3 className="text-3xl font-bold text-[#1e3a8a] mb-6 text-center border-t pt-12">Contact Us</h3>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-700 mb-2">Have questions or want to partner with us?</p>
          <p className="font-bold text-lg text-[#1e3a8a]">Email: info@brightstarsglobal.org</p>
          <p className="text-gray-500 text-sm mt-4">Follow our social media channels for the latest updates!</p>
        </div>
      </main>
    </div>
  );
}