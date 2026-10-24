"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch all departments
      const { data: deptData, error: deptError } = await supabase.from('departments').select('*');
      if (deptError) throw deptError;
      if (deptData) setDepartments(deptData);

      // 2. Fetch all profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profileError) throw profileError;

      // 3. Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('*');
      if (rolesError) throw rolesError;

      // 4. Combine them manually
      if (profileData) {
        const mergedUsers = profileData.map(profile => {
          const userRole = rolesData?.find(r => r.user_id === profile.id)?.role || 'none';
          const dept = deptData?.find(d => d.id === profile.department_id);
          
          return {
            ...profile,
            merged_role: userRole,
            merged_dept_name: dept?.name || 'No Department'
          };
        });
        setUsers(mergedUsers);
      }
    } catch (error: any) {
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // 1. Delete existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw new Error("Delete failed: " + deleteError.message);
      
      // 2. Insert the new role (if not 'none')
      if (newRole !== 'none') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
          
        if (insertError) throw new Error("Insert failed: " + insertError.message);
      }
      
      // 3. Refresh the list to show the update
      await fetchData();
      
    } catch (error: any) {
      alert("Role Update Error: " + error.message);
    }
  };

  const handleDeptChange = async (userId: string, deptId: string) => {
    try {
      const newDeptId = deptId === 'none' ? null : parseInt(deptId);
      const { error } = await supabase
        .from('profiles')
        .update({ department_id: newDeptId })
        .eq('id', userId);
        
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      alert("Department Update Error: " + error.message);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-bold">Loading users...</div>;

  return (
    <div className="max-w-6xl bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <p className="text-sm text-gray-500">Manage member roles and assign them to specific SDG departments.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-4 border-b">User</th>
              <th className="p-4 border-b">System Role</th>
              <th className="p-4 border-b">Department</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{user.full_name || 'Unnamed User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                
                <td className="p-4">
                  <select 
                    value={user.merged_role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-2 border rounded bg-white text-gray-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-[200px] cursor-pointer"
                  >
                    <option value="none">No Role</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="member">Member</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="sdg_lead">SDG Lead</option>
                    <option value="global_admin">Global Admin</option>
                  </select>
                </td>

                <td className="p-4">
                  <select 
                    value={user.department_id || 'none'}
                    onChange={(e) => handleDeptChange(user.id, e.target.value)}
                    className="p-2 border rounded bg-white text-gray-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-[200px] cursor-pointer"
                  >
                    <option value="none">No Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}