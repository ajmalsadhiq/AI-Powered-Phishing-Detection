'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeLinks = [
  { href: '/', label: 'Home' },
  { href: '/working', label: 'Working' },
];

const profileLinks = [
  { href: 'https://github.com/ajmalsadhiq', label: 'GitHub' },
  { href: 'https://resume-gamma-nine-11.vercel.app/', label: 'Resume' },
  {
    href: 'https://www.linkedin.com/in/ajmal-sadhiq-puthanpura-ebrahim-012ab0291/?isSelfProfile=false',
    label: 'LinkedIn',
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed left-5 top-5 z-50 sm:left-6 sm:top-6">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-2 py-2 shadow-lg shadow-slate-950/10 backdrop-blur-xl transition-shadow duration-300 ease-out hover:shadow-xl sm:px-2.5 sm:py-2.5">
          {profileLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-wide text-white shadow-md shadow-slate-950/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <Link
        href={pathname === '/working' ? '/' : '/working'}
        aria-label={pathname === '/working' ? 'Go to home page' : 'Go to working page'}
        className="fixed right-5 top-5 z-50 sm:right-6 sm:top-6"
      >
        <span className="relative grid h-14 w-52 grid-cols-2 items-center rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-lg shadow-slate-950/10 backdrop-blur-xl transition-shadow duration-300 ease-out hover:shadow-xl">
          <span
            className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-0.1875rem)] rounded-full bg-slate-950 shadow-md transition-transform duration-500 ease-in-out ${
              pathname === '/working' ? 'translate-x-[calc(100%+0.1875rem)]' : 'translate-x-0'
            }`}
          />
          <span
            className={`relative z-10 text-center text-sm font-semibold tracking-wide transition-colors duration-300 ${
              pathname === '/' ? 'text-white' : 'text-slate-600'
            }`}
          >
            Home
          </span>
          <span
            className={`relative z-10 text-center text-sm font-semibold tracking-wide transition-colors duration-300 ${
              pathname === '/working' ? 'text-white' : 'text-slate-600'
            }`}
          >
            Working
          </span>
        </span>
      </Link>
    </>
  );
}