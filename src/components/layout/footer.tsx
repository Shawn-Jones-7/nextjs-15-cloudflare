'use client';

import { Globe, Mail, Phone, MapPin, ExternalLink, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Link } from '@/lib/i18n/routing';

export default function Footer() {
  const site = useTranslations('Site');
  const t = useTranslations('Footer');
  const nav = useTranslations('Navigation');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect -- needed for hydration safety
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const quickLinks = [
    { href: '/', label: nav('home') },
    { href: '/about', label: nav('about') },
    { href: '/cases', label: nav('cases') },
    { href: '/contact', label: nav('contact') },
  ];

  const socialLinks = [
    { href: '#', label: site('social.linkedin') },
    { href: '#', label: site('social.twitter') },
    { href: '#', label: site('social.facebook') },
    { href: '#', label: site('social.instagram') },
  ];

  return (
    <footer className="border-t border-border bg-muted/30 text-muted-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <Globe className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">{site('brandName')}</span>
            </div>
            <p className="text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('contact')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span>{site('contact.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span>{site('contact.phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span>{site('contact.email')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              {t('followUs')}
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="rounded-full bg-background p-2 text-muted-foreground shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-12 border-t border-border pb-16 pt-8 text-center text-sm">
          <p>
            &copy; {currentYear} {site('brandName')}. {t('copyright')}
          </p>
          {mounted && (
            <button
              type="button"
              onClick={handleThemeToggle}
              className="absolute bottom-4 right-4 rtl:left-4 rtl:right-auto flex items-center gap-2 rounded-full bg-background px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-border transition hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={t('themeToggle')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
