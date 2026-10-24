"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('LOADING...');
  const [deptName, setDeptName] = useState('BSGI Main'); // Added dynamic state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Fetch Role
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id);
        if (roleData && roleData.length > 0) {
          setRole(roleData[0].role);
        } else {
          setRole('NO ROLE ASSIGNED');
        }

        // Fetch Department Name
        const { data: profileData } = await supabase.from('profiles').select('*, departments(name)').eq('id', session.user.id).single();
        if (profileData?.departments) {
          setDeptName(profileData.departments.name);
        }
      }
      setLoading(false);
    };
    
    fetchData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="text-gray-500 font-bold p-8 animate-pulse">Syncing profile data...</div>;
  if (!user) return <div className="text-gray-500 font-bold p-8">Waiting for authentication...</div>; 

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2">Your Role</h4>
          <p className="text-2xl font-extrabold text-blue-700 uppercase">{role.replace('_', ' ')}</p>
        </div>
        
        <div className="p-6 bg-green-50 rounded-xl border border-green-100">
          <h4 className="font-bold text-green-900 mb-2">Department</h4>
          {/* NOW IT SHOWS THE DYNAMIC NAME */}
          <p className="text-2xl font-extrabold text-green-700">{deptName}</p>
        </div>
        
        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
          <h4 className="font-bold text-purple-900 mb-2">Email</h4>
          <p className="text-lg font-semibold text-purple-700 truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}