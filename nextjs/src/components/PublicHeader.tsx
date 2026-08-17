'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import MenuNav from '@/components/MenuNav';

export default function PublicHeader() {
  // null until the site title has loaded — we render nothing in the header
  // until the DB value arrives so we never flash a stale/default title.
  const [siteTitle, setSiteTitle] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/site-title')
      .then((res) => res.json())
      .then((data) => {
        if (active) setSiteTitle(data?.title || 'TTS Intake');
      })
      .catch(() => {
        if (active) setSiteTitle('TTS Intake');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-[#F2FCFF] z-50 border-b border-[#d8d8d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary-600" />
              <span className="text-2xl font-bold text-primary-600">
                {siteTitle}
              </span>
            </Link>
          </div>
          <MenuNav />
        </div>
      </div>
    </nav>
  );
}