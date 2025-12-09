'use client'

import { useEffect, useState } from 'react'

import {
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Moon,
  Phone,
  Sun,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Link } from '@/lib/i18n/routing'

export default function Footer() {
  const site = useTranslations('Site')
  const t = useTranslations('Footer')
  const nav = useTranslations('Navigation')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect -- needed for hydration safety
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const quickLinks = [
    { href: '/', label: nav('home') },
    { href: '/about', label: nav('about') },
    { href: '/cases', label: nav('cases') },
    { href: '/contact', label: nav('contact') },
  ]

  const socialLinks = [
    { href: '#', label: site('social.linkedin') },
    { href: '#', label: site('social.twitter') },
    { href: '#', label: site('social.facebook') },
    { href: '#', label: site('social.instagram') },
  ]

  return (
    <footer className='border-border bg-muted/30 text-muted-foreground border-t'>
      <div className='container mx-auto px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          <div className='space-y-4'>
            <div className='text-foreground flex items-center gap-2'>
              <Globe className='text-primary h-6 w-6' />
              <span className='text-lg font-bold'>{site('brandName')}</span>
            </div>
            <p className='text-sm leading-relaxed'>{t('description')}</p>
          </div>

          <div>
            <h3 className='text-foreground mb-4 text-sm font-semibold tracking-wider uppercase'>
              {t('quickLinks')}
            </h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='hover:text-primary text-sm transition-colors'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='text-foreground mb-4 text-sm font-semibold tracking-wider uppercase'>
              {t('contact')}
            </h3>
            <ul className='space-y-3 text-sm'>
              <li className='flex items-start gap-3'>
                <MapPin className='text-primary h-5 w-5 shrink-0' />
                <span>{site('contact.address')}</span>
              </li>
              <li className='flex items-center gap-3'>
                <Phone className='text-primary h-5 w-5 shrink-0' />
                <span>{site('contact.phone')}</span>
              </li>
              <li className='flex items-center gap-3'>
                <Mail className='text-primary h-5 w-5 shrink-0' />
                <span>{site('contact.email')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-foreground mb-4 text-sm font-semibold tracking-wider uppercase'>
              {t('followUs')}
            </h3>
            <div className='flex gap-4'>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className='bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-full p-2 shadow-sm transition-colors'
                  aria-label={social.label}
                >
                  <ExternalLink className='h-5 w-5' />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className='border-border relative mt-12 border-t pt-8 pb-16 text-center text-sm'>
          <p>
            &copy; {currentYear} {site('brandName')}. {t('copyright')}
          </p>
          {mounted && (
            <button
              type='button'
              onClick={handleThemeToggle}
              className='bg-background text-muted-foreground ring-border hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary absolute right-4 bottom-4 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-sm ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rtl:right-auto rtl:left-4'
              aria-label={t('themeToggle')}
            >
              {theme === 'dark' ? (
                <Sun className='h-4 w-4' />
              ) : (
                <Moon className='h-4 w-4' />
              )}
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
