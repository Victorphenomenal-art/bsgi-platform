"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState('LOADING...');
  const [deptColor, setDeptColor] = useState('#1e3a8a'); 
  const [deptName, setDeptName] = useState('BSGI Main');
  const [deptLogo, setDeptLogo] = useState('/bsgi-logo.jpeg'); 
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchProfile = async (user: any) => {
    try {
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      if (roleData && roleData.length > 0) setRole(roleData[0].role);
      else setRole('NO ROLE ASSIGNED');

      const { data: profileData } = await supabase.from('profiles').select('*, departments(*)').eq('id', user.id).maybeSingle();
      
      if (profileData) {
        setProfile({ ...profileData, email: user.email });
        if (profileData.departments) {
          setDeptName(profileData.departments.name);
          if (profileData.departments.color_hex) setDeptColor(profileData.departments.color_hex);
          if (profileData.departments.logo_url) setDeptLogo(profileData.departments.logo_url);
        }
      } else {
        setProfile({ id: user.id, full_name: user.user_metadata?.full_name || 'User', avatar_url: user.user_metadata?.avatar_url, email: user.email });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) fetchProfile(session.user);
      else if (event === 'SIGNED_OUT') window.location.href = '/login';
    });

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchProfile(session.user);
      else {
        const hasTokenInUrl = window.location.hash.includes('access_token') || window.location.search.includes('code=');
        if (!hasTokenInUrl) {
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) window.location.href = '/login';
          }, 1500);
        }
      }
    };
    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id);
      window.location.reload();
    } catch (error: any) {
      alert("Error: " + error.message);
      setUploading(false);
    }
  };

  // Role Based Access Flags
  const canPostUpdate = role === 'global_admin' || role === 'sdg_lead';
  const canPostTask = role === 'global_admin' || role === 'sdg_lead' || role === 'team_lead';

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      <aside className="w-64 text-white flex flex-col shadow-xl transition-colors duration-500" style={{ backgroundColor: deptColor }}>
        <div className="p-6 flex items-center gap-3 border-b border-white/20">
          <img src={deptLogo} alt="Logo" className="w-10 h-10 rounded-full bg-white p-1 object-cover" />
          <h1 className="text-xl font-bold tracking-wider">BSGI Portal</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className={`block px-4 py-3 rounded-lg font-semibold transition ${pathname === '/dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Dashboard</Link>
          <Link href="/dashboard/team" className={`block px-4 py-3 rounded-lg font-semibold transition ${pathname === '/dashboard/team' ? 'bg-white/20' : 'hover:bg-white/10'}`}>My Team</Link>
          <Link href="/dashboard/tasks" className={`block px-4 py-3 rounded-lg font-semibold transition ${pathname === '/dashboard/tasks' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Tasks & Projects</Link>
          
          {/* Only Leads and Admins see Post Updates */}
          {canPostUpdate && (
            <Link href="/dashboard/updates" className={`block px-4 py-3 rounded-lg font-semibold transition ${pathname === '/dashboard/updates' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Post Updates</Link>
          )}

          {/* Only Admins see Manage Users */}
          {role === 'global_admin' && (
            <Link href="/dashboard/users" className={`block px-4 py-3 rounded-lg font-semibold transition ${pathname === '/dashboard/users' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
              Manage Users
            </Link>
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r pr-4 border-gray-300">
              <div className="text-right hidden md:block">
                <p className="font-bold text-gray-800">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">{role.replace('_', ' ')}</p>
              </div>
              <label className="cursor-pointer relative group">
                <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg border-2 border-gray-200">
                    {(profile?.full_name || 'U').charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xs rounded-full opacity-0 group-hover:opacity-100 transition">
                  {uploading ? '...' : 'Edit'}
                </div>
              </label>
            </div>
            <button onClick={() => { supabase.auth.signOut(); window.location.href = '/login'; }} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition">Logout</button>
          </div>
        </header>

        <div className="p-8 flex-1 relative">
          {children}
          {loading && (
            <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center">
              <div className="text-2xl font-bold text-[#1e3a8a] animate-pulse">Authenticating...</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}