"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import PublicNavbar from '../../components/PublicNavbar';

export default function VolunteerForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', email: '', whatsapp: '', skills: '', sdg_choice: 'SDG 4', weekly_plan: '', commitment_agreed: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('applications').insert([formData]);
    
    if (error) {
      alert("Error submitting application: " + error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50"><PublicNavbar />
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-md text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Application Submitted!</h2>
          <p className="text-gray-600">Thank you for applying to BSGI. Our Global Admin will review your application and reach out via WhatsApp or Email soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50"><PublicNavbar />
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-extrabold text-[#1e3a8a] mb-2 text-center">Join the BSGI Team</h2>
        <p className="text-center text-gray-500 mb-8">Fill out this form to apply as a volunteer.</p>
        
                <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input type="text" name="full_name" required onChange={handleChange} className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number</label>
              <input type="text" name="whatsapp" required onChange={handleChange} className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+234..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Which SDG are you most passionate about?</label>
            <select name="sdg_choice" onChange={handleChange} className="w-full p-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="SDG 4">SDG 4 - Quality Education</option>
              <option value="SDG 16">SDG 16 - Peace, Justice & Strong Institutions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">What relevant skills do you bring?</label>
            <textarea name="skills" required onChange={handleChange} rows={2} className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Graphic Design, Project Management, Writing..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">What is one thing you will do EVERY WEEK?</label>
            <textarea name="weekly_plan" required onChange={handleChange} rows={2} className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="I will help coordinate the weekly team meetings..."></textarea>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" name="commitment_agreed" required onChange={handleChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <label className="text-sm text-gray-700">I agree to dedicate at least 2 hours weekly and understand that prolonged inactivity may revoke my status.</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#1e3a8a] text-white font-bold py-3 rounded-md hover:bg-blue-800 transition mt-4 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}