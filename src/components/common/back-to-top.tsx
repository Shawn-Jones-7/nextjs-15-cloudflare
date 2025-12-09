'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

export function BackToTop() {
  const t = useTranslations('Common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      type="button"
      aria-label={t('backToTop')}
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-8 end-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
