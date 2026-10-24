"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import PublicNavbar from '../../../components/PublicNavbar';

export default function DepartmentContent({ departmentId }: { departmentId: string }) {
  const [dept, setDept] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeptData = async () => {
      const { data: deptData } = await supabase.from('departments').select('*').eq('id', departmentId).single();
      if (deptData) setDept(deptData);

      const { data: updateData } = await supabase.from('updates').select('*').eq('department_id', departmentId).order('created_at', { ascending: false });
      if (updateData) setUpdates(updateData);
      
      setLoading(false);
    };
    fetchDeptData();
  }, [departmentId]);

  if (loading) return null; 
  if (!dept) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Department not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PublicNavbar />
      
      {/* HERO SECTION */}
      <div className="text-white py-16 px-6 text-center" style={{ backgroundColor: dept.color_hex || '#1e3a8a' }}>
        {dept.logo_url && <img src={dept.logo_url} alt="logo" className="w-24 h-24 mx-auto rounded-full bg-white p-2 mb-4 object-cover shadow-lg" />}
        <h1 className="text-4xl font-extrabold mb-2">{dept.name}</h1>
        <p className="text-lg opacity-90">Bright Stars Global Initiative Department</p>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: dept.color_hex }}>About this Department</h2>
          <p className="text-gray-700 leading-relaxed">{dept.description || "This department is dedicated to driving impactful change in line with our organizational goals."}</p>
        </div>

        <h2 className="text-2xl font-bold mb-6" style={{ color: dept.color_hex }}>Latest Updates from {dept.name}</h2>
        {updates.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200">No updates posted for this department yet. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="bg-white rounded-xl shadow-sm border-l-4 p-6" style={{ borderColor: dept.color_hex }}>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{update.title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{update.content}</p>
                <p className="text-xs text-gray-400 mt-4">{new Date(update.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}