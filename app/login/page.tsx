"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin + '/dashboard',
        queryParams: { prompt: 'select_account' } // Forces Google to ask which account
      }
    });
    if (error) alert(error.message);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e3a8a] text-white">
      <img src="/bsgi-logo.jpeg" alt="BSGI Logo" className="w-32 h-32 mb-4 object-cover rounded-full mix-blend-screen shadow-lg" />
      <h1 className="text-4xl font-bold mb-8">BSGI Login</h1>
      
      <button onClick={handleGoogleLogin} className="bg-white text-blue-900 px-6 py-2 rounded font-bold mb-4 w-64 hover:bg-gray-100 transition shadow-md">
        Sign in with Google
      </button>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 w-64">
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="p-2 text-black rounded shadow-sm" required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="p-2 text-black rounded shadow-sm" required />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 p-2 rounded font-bold transition shadow-md">
          Sign in with Email
        </button>
      </form>
    </div>
  );
}