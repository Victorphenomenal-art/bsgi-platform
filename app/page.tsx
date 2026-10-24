import Link from 'next/link';
import PublicNavbar from '../components/PublicNavbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="text-center py-24 px-4 bg-white">
        <img src="/bsgi-logo.jpeg" alt="BSGI Logo" className="w-40 h-40 mx-auto mb-6 drop-shadow-xl rounded-full" />
        <h2 className="text-5xl font-extrabold text-[#1e3a8a] mb-4">Bright Stars Global Initiative</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Empowering youth, driving sustainable development, and building strong institutions. We are committed to the United Nations Sustainable Development Goals (SDGs), with our current active focus on <strong>SDG 4 (Quality Education)</strong> and <strong>SDG 16 (Peace, Justice & Strong Institutions)</strong>.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/about" className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-blue-800 transition shadow-lg">
            Learn More
          </Link>
          <Link href="/login" className="bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] px-8 py-3 rounded-full text-lg font-bold hover:bg-gray-50 transition shadow-lg">
            Join the Team
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1e3a8a] text-white text-center py-8 mt-auto">
        <img src="/bsgi-logo.jpeg" alt="BSGI" className="w-12 h-12 mx-auto mb-4 rounded-full bg-white p-1" />
        <p>&copy; 2026 Bright Stars Global Initiative. All rights reserved.</p>
      </footer>
    </div>
  );
}