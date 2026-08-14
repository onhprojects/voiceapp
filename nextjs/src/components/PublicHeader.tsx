import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';

export default function PublicHeader() {
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

  return (
    <nav className="fixed top-0 w-full bg-[#F2FCFF] z-50 border-b border-[#d8d8d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary-600" />
              <span className="text-2xl font-bold text-primary-600">
                {productName || 'Resume Builder'}
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900">
              How it works
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <AuthAwareButtons variant="nav" />
          </div>
        </div>
      </div>
    </nav>
  );
}