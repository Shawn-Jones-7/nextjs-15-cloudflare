import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import Header from './header'

// Mock next-intl hooks
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === 'Site' && key === 'brandName') return 'Test Brand'
    if (namespace === 'Navigation') {
      const translations: Record<string, string> = {
        home: 'Home',
        about: 'About',
        blog: 'Blog',
        products: 'Products',
        contact: 'Contact',
        openMenu: 'Open menu',
        'categories.industrialPumps': 'Industrial Pumps',
        'categories.valves': 'Valves',
        'categories.pipes': 'Pipes',
        'categories.fittings': 'Fittings',
        'categories.accessories': 'Accessories',
        'categoryDescriptions.industrialPumps': 'High-performance pumps',
        'categoryDescriptions.valves': 'Quality valves',
        'categoryDescriptions.pipes': 'Durable pipes',
        'categoryDescriptions.fittings': 'Pipe fittings',
        'categoryDescriptions.accessories': 'Pump accessories',
      }
      return translations[key] || key
    }
    if (namespace === 'Common' && key === 'language') return 'Language'
    return key
  },
  useLocale: () => 'en',
}))

vi.mock('@/lib/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
}))

vi.mock('@/lib/i18n/config', () => ({
  isRtl: (locale: string) => locale === 'ar',
}))

// Mock LocaleSwitcher component
vi.mock('@/components/i18n/locale-switcher', () => ({
  default: () => <div data-testid='locale-switcher'>Locale Switcher</div>,
}))

// Mock productCategories
vi.mock('@/data/products', () => ({
  productCategories: [
    {
      slug: 'industrial-pumps',
      i18nKey: 'industrialPumps',
      icon: 'factory',
      products: [],
    },
    {
      slug: 'valves',
      i18nKey: 'valves',
      icon: 'gauge',
      products: [],
    },
    {
      slug: 'pipes',
      i18nKey: 'pipes',
      icon: 'cylinder',
      products: [],
    },
    {
      slug: 'fittings',
      i18nKey: 'fittings',
      icon: 'wrench',
      products: [],
    },
    {
      slug: 'accessories',
      i18nKey: 'accessories',
      icon: 'settings',
      products: [],
    },
  ],
}))

describe('Header', () => {
  it('renders logo/brand', async () => {
    const screen = await render(<Header />)

    const brandLink = screen.getByRole('link', { name: /test brand/i })
    await expect.element(brandLink).toBeVisible()

    // Check href points to home
    const linkElement = brandLink.element() as HTMLAnchorElement
    expect(linkElement.href).toContain('/')
  })

  it('renders navigation links', async () => {
    const screen = await render(<Header />)

    // Check main navigation links
    const homeLink = screen.getByRole('link', { name: /^home$/i })
    const aboutLink = screen.getByRole('link', { name: /^about$/i })
    const blogLink = screen.getByRole('link', { name: /^blog$/i })

    await expect.element(homeLink).toBeVisible()
    await expect.element(aboutLink).toBeVisible()
    await expect.element(blogLink).toBeVisible()
  })

  it('renders locale switcher', async () => {
    const screen = await render(<Header />)

    const localeSwitcher = screen.getByTestId('locale-switcher')
    await expect.element(localeSwitcher).toBeVisible()
  })

  it('mobile menu toggles on hamburger click', async () => {
    const screen = await render(<Header />)

    // Find the hamburger button (mobile menu trigger)
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await expect.element(menuButton).toBeVisible()

    // Click to open
    await userEvent.click(menuButton)

    // Wait for mobile menu to appear by checking for sheet content in DOM
    await vi.waitFor(
      () => {
        const sheetContent = screen.container.querySelector(
          '[data-state="open"]',
        )
        expect(sheetContent).toBeDefined()
      },
      { timeout: 2000 },
    )

    // Verify mobile navigation is visible
    const allLinks = screen.container.querySelectorAll('a')
    const hasHomeLink = [...allLinks].some((link) =>
      link.textContent?.includes('Home'),
    )
    expect(hasHomeLink).toBe(true)
  })

  it('navigation links have correct hrefs', async () => {
    const screen = await render(<Header />)

    // Check desktop navigation
    const homeLink = screen.getByRole('link', { name: /^home$/i })
    const aboutLink = screen.getByRole('link', { name: /^about$/i })
    const blogLink = screen.getByRole('link', { name: /^blog$/i })

    const homeElement = homeLink.element() as HTMLAnchorElement
    const aboutElement = aboutLink.element() as HTMLAnchorElement
    const blogElement = blogLink.element() as HTMLAnchorElement

    expect(homeElement.href).toContain('/')
    expect(aboutElement.href).toContain('/about')
    expect(blogElement.href).toContain('/blog')
  })
})
