import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import LocaleSwitcher from './locale-switcher'

// Hoist mock functions
const mockReplace = vi.hoisted(() => vi.fn())
const mockUsePathname = vi.hoisted(() => vi.fn())

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('@/lib/i18n/routing', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/lib/i18n/config', () => ({
  locales: ['en', 'zh', 'es', 'ar'],
  localeLabels: {
    en: 'English',
    zh: '中文',
    es: 'Español',
    ar: 'العربية',
  },
  defaultLocale: 'en',
  isRtl: (locale: string) => locale === 'ar',
}))

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
  })

  it('renders current locale', async () => {
    const screen = await render(<LocaleSwitcher />)

    const select = screen.getByRole('combobox')
    await expect.element(select).toBeVisible()

    // Check the selected value is 'en'
    const selectElement = select.element() as unknown as HTMLSelectElement
    expect(selectElement.value).toBe('en')
  })

  it('shows dropdown with all locales', async () => {
    const screen = await render(<LocaleSwitcher />)

    // Get the select element and its options
    const select = screen.container.querySelector('select')
    expect(select).toBeDefined()

    const options = [...select!.querySelectorAll('option')]

    // Should have 4 locales
    expect(options).toHaveLength(4)

    // Check locale values
    const values = options.map((element) => element.value)
    expect(values).toEqual(['en', 'zh', 'es', 'ar'])
  })

  it('navigates to correct path on locale select', async () => {
    mockUsePathname.mockReturnValue('/about')

    const screen = await render(<LocaleSwitcher />)

    const select = screen.getByRole('combobox')

    // Change to Chinese - use the native DOM element
    const selectElement = select.element() as unknown as HTMLSelectElement
    selectElement.value = 'zh'
    selectElement.dispatchEvent(new Event('change', { bubbles: true }))

    // Wait for navigation
    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/about', { locale: 'zh' })
    })
  })

  it('highlights current locale in dropdown', async () => {
    // The mock returns 'en' as the current locale
    const screen = await render(<LocaleSwitcher />)

    const select = screen.getByRole('combobox')
    const selectElement = select.element() as unknown as HTMLSelectElement

    // Current value should be 'en' (from mock)
    expect(selectElement.value).toBe('en')

    // Find the selected option
    const selectedOption = selectElement.options[selectElement.selectedIndex]
    expect(selectedOption?.value).toBe('en')
    expect(selectedOption?.selected).toBe(true)
  })

  it('handles RTL locale display correctly', async () => {
    const screen = await render(<LocaleSwitcher />)

    // Get the select element
    const select = screen.container.querySelector('select')
    expect(select).toBeDefined()

    // Get all options from the select
    const options = [...select!.querySelectorAll('option')]
    const arabicOption = options.find((opt) => opt.value === 'ar')

    expect(arabicOption).toBeDefined()

    // Check that Arabic label is present
    expect(arabicOption!.textContent).toContain('العربية')
  })
})
