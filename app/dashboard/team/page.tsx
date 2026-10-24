"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TeamChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [deptId, setDeptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (departmentId: number) => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('department_id', departmentId)
      .order('created_at');
    if (data) setMessages(data);
  };

  useEffect(() => {
    let myChannel: any = null;
    // Generate a unique channel name to prevent React Strict Mode crashes
    const channelName = `chat_${crypto.randomUUID()}`;

    const initChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUser(session.user);

      const { data: profile } = await supabase.from('profiles').select('department_id').eq('id', session.user.id).single();
      
      if (profile?.department_id) {
        setDeptId(profile.department_id);
        await fetchMessages(profile.department_id);

        myChannel = supabase.channel(channelName)
          .on(
            'postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `department_id=eq.${profile.department_id}` }, 
            () => {
              // Refetch messages when a new one arrives
              fetchMessages(profile.department_id);
            }
          )
          .subscribe();
      }
      setLoading(false);
    };
    
    initChat();

    return () => {
      if (myChannel) {
        supabase.removeChannel(myChannel);
      }
    };
  }, []);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !deptId || !user) return;
    
    const messageText = newMessage;
    setNewMessage(''); 

    const { error } = await supabase.from('messages').insert([
      { content: messageText, sender_id: user.id, department_id: deptId }
    ]);

    if (!error) {
      fetchMessages(deptId); // Refresh immediately
    } else {
      alert("Failed to send: " + error.message);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-bold">Loading chat...</div>;

  if (!deptId) {
    return (
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-yellow-800 max-w-4xl">
        <h3 className="font-bold text-lg mb-2">No Department Assigned</h3>
        <p>You need to be assigned to a department to access the team chat. Please contact the Global Admin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[70vh] max-w-4xl">
      <div className="p-4 border-b bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-lg text-gray-800">Department Team Chat</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No messages yet. Say hello to your team!</p>
        )}
        
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? 'bg-[#1e3a8a] text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                {!isMe && <p className="text-xs font-bold text-blue-600 mb-1">{msg.profiles?.full_name || 'Team Member'}</p>}
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-xl flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          style={{ color: 'black', backgroundColor: 'white' }} 
        />
        <button type="submit" className="bg-[#1e3a8a] text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition">Send</button>
      </form>
    </div>
  );
}