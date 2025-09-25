'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <h1 className='text-xl font-semibold text-gray-900'>
              Email Agent Dashboard
            </h1>
          </div>

          <nav className='flex space-x-8'>
            <Link
              href='/dashboard'
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/dashboard'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href='/submit'
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/submit'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Submit Ticket
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
