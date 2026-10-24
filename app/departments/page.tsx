"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import PublicNavbar from '../../components/PublicNavbar';
import Link from 'next/link';

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('*').order('id');
      if (data) setDepartments(data);
      setLoading(false);
    };
    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PublicNavbar />
      
      <main className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-extrabold text-[#1e3a8a] mb-4 text-center">Our Departments</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore the specialized teams driving the mission of Bright Stars Global Initiative. Click on any department to learn more and see their latest updates.
        </p>
        
        {loading ? (
          <p className="text-center text-gray-500 font-bold">Loading departments...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <Link 
                href={`/departments/${dept.id}`} 
                key={dept.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block cursor-pointer group"
              >
                <div className="h-4 w-full" style={{ backgroundColor: dept.color_hex || '#1e3a8a' }}></div>
                
                <div className="p-6 text-center">
                  {dept.logo_url ? (
                    <img 
                      src={dept.logo_url} 
                      alt={dept.name} 
                      className="w-24 h-24 mx-auto rounded-full object-cover mb-4 shadow-sm bg-white p-1 border-2 group-hover:scale-110 transition-transform duration-300"
                      style={{ borderColor: dept.color_hex || '#1e3a8a' }}
                    />
                  ) : (
                    <div 
                      className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: dept.color_hex || '#1e3a8a' }}
                    >
                      {dept.name.charAt(0)}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{dept.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {dept.description || "Dedicated to driving impactful change and sustainable development."}
                  </p>
                  
                  <span 
                    className="inline-block px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider group-hover:bg-opacity-80 transition"
                    style={{ backgroundColor: dept.color_hex || '#1e3a8a' }}
                  >
                    View Department
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}