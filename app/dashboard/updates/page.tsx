"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function PostUpdates() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [updates, setUpdates] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Role and Department tracking
  const [userRole, setUserRole] = useState('LOADING');
  const [deptId, setDeptId] = useState<number | null>(null);
  const [deptName, setDeptName] = useState('Main Organization');

  const fetchUpdates = async () => {
    const { data } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
    if (data) setUpdates(data);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check Role
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      if (roleData) setUserRole(roleData.role);

      // Check Department
      const { data: profileData } = await supabase.from('profiles').select('department_id, departments(name)').eq('id', user.id).single();
      if (profileData?.department_id) {
        setDeptId(profileData.department_id);
        const dept = profileData.departments as any;
        if (dept?.name) setDeptName(dept.name);
      }
      fetchUpdates();
    };
    init();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;

      if (image) {
        const fileName = `${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage.from('updates-images').upload(fileName, image);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('updates-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      // Determine department ID based on role
      const finalDeptId = userRole === 'global_admin' ? null : deptId;

      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from('updates').insert([
        { title, content, image_url: imageUrl, author_id: user?.id, department_id: finalDeptId }
      ]);
      if (dbError) throw dbError;

      alert("Update posted successfully!");
      setTitle(''); setContent(''); setImage(null);
      fetchUpdates(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this update?")) return;
    await supabase.from('updates').delete().eq('id', id);
    fetchUpdates();
  };

  const startEdit = (update: any) => {
    setEditingId(update.id);
    setEditTitle(update.title);
    setEditContent(update.content);
  };

  const saveEdit = async (id: number) => {
    await supabase.from('updates').update({ title: editTitle, content: editContent }).eq('id', id);
    setEditingId(null);
    fetchUpdates();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* CREATE FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Post an Update</h2>
        <p className="text-sm font-semibold text-blue-600 mb-6 pb-4 border-b">
          {userRole === 'global_admin' 
            ? "You are posting to the MAIN public page." 
            : `You are posting to the ${deptName} department page.`}
        </p>
        
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">Title</label>
            <input type="text" placeholder="Update Title" required value={title} onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              style={{ color: 'black', backgroundColor: 'white' }} />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">Content</label>
            <textarea placeholder="Write your update here..." required rows={4} value={content} onChange={(e) => setContent(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              style={{ color: 'black', backgroundColor: 'white' }}></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">Upload Image (Optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded text-gray-700" />
          </div>
          
          <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition">
            {loading ? 'Publishing...' : 'Publish Update'}
          </button>
        </form>
      </div>

      {/* MANAGE EXISTING UPDATES */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Updates</h2>
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              {editingId === update.id ? (
                <div className="space-y-3">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                    style={{ color: 'black', backgroundColor: 'white' }} />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    style={{ color: 'black', backgroundColor: 'white' }} />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(update.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded font-bold">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{update.title}</h3>
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(update)} className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
                      <button onClick={() => handleDelete(update.id)} className="text-red-600 text-sm font-bold hover:underline">Delete</button>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{update.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}