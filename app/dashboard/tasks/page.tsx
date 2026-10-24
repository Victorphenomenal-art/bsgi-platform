"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '' });
  
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('LOADING');
  const [currentUserId, setCurrentUserId] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'

  // States for Editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', assigned_to: '' });

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const fetchTeam = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name');
    if (data) setTeamMembers(data);
  };

  useEffect(() => { 
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
        if (roleData) setUserRole(roleData.role);
      }
      fetchTasks();
      fetchTeam();
    };
    init();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const assignedUser = newTask.assigned_to === '' ? null : newTask.assigned_to;

    const { error } = await supabase.from('tasks').insert([
      { title: newTask.title, description: newTask.description, assigned_to: assignedUser, status: 'pending' }
    ]);
    
    if (!error) {
      setNewTask({ title: '', description: '', assigned_to: '' });
      fetchTasks();
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const startEdit = (task: any) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to || ''
    });
  };

  const saveEdit = async (id: number) => {
    const assignedUser = editForm.assigned_to === '' ? null : editForm.assigned_to;
    
    const { error } = await supabase.from('tasks').update({
      title: editForm.title,
      description: editForm.description,
      assigned_to: assignedUser
    }).eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchTasks();
    } else {
      alert("Error updating task: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) return;
    
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      fetchTasks();
    } else {
      alert("Error deleting task: " + error.message);
    }
  };

  const markComplete = async (id: number) => {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
    fetchTasks();
  };

  const canPostTask = userRole === 'global_admin' || userRole === 'sdg_lead' || userRole === 'team_lead';
  const displayedTasks = activeTab === 'all' ? tasks : tasks.filter(task => task.assigned_to === currentUserId);

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* CREATE TASK FORM */}
      {canPostTask && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Post a New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" style={{ color: 'black' }} required />
              <input type="text" placeholder="Short Description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" style={{ color: 'black' }} required />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <select value={newTask.assigned_to} onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})} className="flex-1 p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                <option value="">-- Assign to anyone (Unassigned) --</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.full_name || 'Unnamed Member'}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-[#1e3a8a] text-white px-8 py-2 rounded font-bold hover:bg-blue-800 transition disabled:opacity-50 w-full md:w-auto">
                {loading ? 'Posting...' : 'Post Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TASK LIST */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* TABS */}
        <div className="flex gap-4 border-b mb-6">
          <button onClick={() => setActiveTab('all')} className={`pb-2 px-2 font-bold transition ${activeTab === 'all' ? 'border-b-2 border-[#1e3a8a] text-[#1e3a8a]' : 'text-gray-400 hover:text-gray-600'}`}>All Tasks</button>
          <button onClick={() => setActiveTab('mine')} className={`pb-2 px-2 font-bold transition ${activeTab === 'mine' ? 'border-b-2 border-[#1e3a8a] text-[#1e3a8a]' : 'text-gray-400 hover:text-gray-600'}`}>My Tasks</button>
        </div>

        {displayedTasks.length === 0 ? (
          <p className="text-gray-500">No tasks found here yet.</p>
        ) : (
          <div className="space-y-3">
            {displayedTasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                
                {editingId === task.id ? (
                  // EDIT MODE
                  <div className="space-y-3">
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full p-2 border rounded font-bold" style={{ color: 'black' }} />
                    <input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full p-2 border rounded" style={{ color: 'black' }} />
                    
                    <select value={editForm.assigned_to} onChange={(e) => setEditForm({...editForm, assigned_to: e.target.value})} className="w-full p-2 border rounded bg-white text-gray-900 cursor-pointer">
                      <option value="">-- Assign to anyone (Unassigned) --</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.full_name || 'Unnamed Member'}</option>
                      ))}
                    </select>

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => saveEdit(task.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded font-bold transition">Save</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded font-bold transition">Cancel</button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="font-bold text-lg text-gray-800">{task.title}</p>
                      <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                      <p className="text-xs text-blue-600 font-semibold">
                        Assigned to: {task.profiles?.full_name || 'Anyone'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {task.status}
                      </span>
                      
                      {task.status === 'pending' && (task.assigned_to === currentUserId || canPostTask) && (
                        <button onClick={() => markComplete(task.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold transition">
                          Mark Done
                        </button>
                      )}

                      {/* SHOW EDIT/DELETE ONLY TO LEADS/ADMINS */}
                      {canPostTask && (
                        <div className="flex gap-2 border-l border-gray-300 pl-3 ml-1">
                          <button onClick={() => startEdit(task)} className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                          <button onClick={() => handleDelete(task.id)} className="text-red-600 text-xs font-bold hover:underline">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}