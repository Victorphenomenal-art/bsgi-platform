import Link from 'next/link';

export default function PublicNavbar() {
  return (
    <header className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3">
        <img src="/bsgi-logo.jpeg" alt="BSGI" className="w-12 h-12 rounded-full bg-white p-1 object-cover" />
        <h1 className="text-2xl font-bold tracking-wider">BSGI</h1>
      </Link>
      <nav className="flex gap-6 font-semibold items-center">
        <Link href="/about" className="hover:text-blue-200 transition">About Us</Link>
        <Link href="/departments" className="hover:text-blue-200 transition">Departments</Link>
        <Link href="/updates" className="hover:text-blue-200 transition">Updates</Link>
        <Link href="/login" className="hover:text-blue-200 transition">Login</Link>
        <Link href="/volunteer" className="bg-white text-[#1e3a8a] px-5 py-2 rounded-full hover:bg-gray-100 transition shadow-sm">
          Apply Now
        </Link>
      </nav>
    </header>
  );
}