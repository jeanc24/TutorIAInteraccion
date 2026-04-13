'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOTAL_LETTERS } from '@/lib/alphabet';

interface HeaderProps {
  completedCount: number;
}

export default function Header({ completedCount }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/learn', label: 'Aprender' },
    { href: '/practice', label: 'Practicar' },
    { href: '/quiz', label: 'Evaluar' },
    { href: '/progress', label: 'Progreso' },
  ];

  return (
    <header className="h-14 border-b border-stone-100 dark:border-stone-800 bg-surface-card dark:bg-surface-card-dark sticky top-0 z-50">
      <div className="h-full flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </div>
          <span className="font-bold text-lg hidden sm:inline">SignTutor</span>
        </Link>

        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 min-w-max pr-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary shrink-0">
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(TOTAL_LETTERS, 27) }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < completedCount
                    ? 'bg-success'
                    : 'bg-stone-200 dark:bg-stone-700'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">
            {completedCount}/{TOTAL_LETTERS}
          </span>
        </div>
      </div>
    </header>
  );
}
