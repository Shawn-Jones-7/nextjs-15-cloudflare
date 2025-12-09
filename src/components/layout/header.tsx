'use client'

import { useState } from 'react'

import { Globe, Menu } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import LocaleSwitcher from '@/components/i18n/locale-switcher'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { productCategories } from '@/data/products'
import { cn } from '@/lib/cn'
import { isRtl } from '@/lib/i18n/config'
import { Link, usePathname } from '@/lib/i18n/routing'

export default function Header() {
  const locale = useLocale()
  const site = useTranslations('Site')
  const t = useTranslations('Navigation')
  const tCommon = useTranslations('Common')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isContactPage = pathname === '/contact' || pathname.endsWith('/contact')
  const sheetSide = isRtl(locale) ? 'right' : 'left'

  const mainNav = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('blog') },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className='border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link
          href='/'
          className='text-primary flex items-center gap-2 text-xl font-bold tracking-tight'
        >
          <Globe className='h-6 w-6' />
          <span>{site('brandName')}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex md:items-center md:gap-6'>
          <NavigationMenu>
            <NavigationMenuList>
              {mainNav.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent',
                        isActive(item.href) && 'text-primary',
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <NavigationMenuTrigger className='bg-transparent'>
                  {t('products')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                    {productCategories.map((category) => (
                      <li key={category.slug}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={`/products?category=${category.slug}`}
                            className='hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none'
                          >
                            <div className='text-sm leading-none font-medium'>
                              {t(`categories.${category.i18nKey}`)}
                            </div>
                            <p className='text-muted-foreground line-clamp-2 text-sm leading-snug'>
                              {t(`categoryDescriptions.${category.i18nKey}`)}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className='hidden items-center gap-4 md:flex'>
          <LocaleSwitcher />
          {!isContactPage && (
            <Button asChild>
              <Link href='/contact'>{t('contact')}</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className='md:hidden'>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' aria-label={t('openMenu')}>
                <Menu className='h-6 w-6' />
              </Button>
            </SheetTrigger>
            <SheetContent side={sheetSide} className='w-[300px] sm:w-[400px]'>
              <SheetHeader>
                <SheetTitle className='text-start'>
                  {site('brandName')}
                </SheetTitle>
              </SheetHeader>
              <div className='mt-8 flex flex-col gap-6'>
                <nav className='flex flex-col space-y-4'>
                  {mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setIsOpen(false)
                      }}
                      className={cn(
                        'hover:text-primary text-lg font-medium transition-colors',
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Mobile Products Section */}
                  <div className='py-2'>
                    <h4 className='text-foreground mb-2 text-sm font-semibold'>
                      {t('products')}
                    </h4>
                    <div className='border-border ms-4 flex flex-col space-y-2 border-s ps-4'>
                      {productCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/products?category=${category.slug}`}
                          onClick={() => {
                            setIsOpen(false)
                          }}
                          className='text-muted-foreground hover:text-primary text-sm'
                        >
                          {t(`categories.${category.i18nKey}`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>

                <div className='border-border flex flex-col gap-4 border-t pt-6'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      {tCommon('language')}
                    </span>
                    <LocaleSwitcher />
                  </div>
                  {!isContactPage && (
                    <Button
                      asChild
                      className='w-full'
                      onClick={() => {
                        setIsOpen(false)
                      }}
                    >
                      <Link href='/contact'>{t('contact')}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
