"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, ChevronDown, Shield } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import MobileMenu from '@/components/MobileMenu';

export default function PublicHeader() {
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;
  const [legalOpen, setLegalOpen] = useState(false);
  const legalRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the legal dropdown when clicking outside or on route change
  useEffect(() => {
    setLegalOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (legalRef.current && !legalRef.current.contains(event.target as Node)) {
        setLegalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const legalDocuments = [
    { href: '/privacy', label: 'Privacy Policy', icon: Shield },
    { href: '/terms', label: 'Terms of Service', icon: FileText },
  ];

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

            {/* Legal dropdown */}
            <div className="relative" ref={legalRef}>
              <button
                type="button"
                onClick={() => setLegalOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={legalOpen}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                Legal
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    legalOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {legalOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {legalDocuments.map((doc) => (
                    <Link
                      key={doc.href}
                      href={doc.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <doc.icon className="mr-3 h-4 w-4 text-gray-400" />
                      {doc.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <AuthAwareButtons variant="nav" />
          </div>
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}