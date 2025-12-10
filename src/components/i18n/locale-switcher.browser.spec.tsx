import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from '@vitest/browser/context'
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
    const { getByRole } = render(<LocaleSwitcher />)

    const select = getByRole('combobox')
    await expect.element(select).toBeVisible()

    // Check the selected value is 'en'
    const selectElement = select.element() as HTMLSelectElement
    expect(selectElement.value).toBe('en')
  })

  it('shows dropdown with all locales', async () => {
    const { container } = render(<LocaleSwitcher />)

    // Get the select element and its options
    const select = container.querySelector('select')
    expect(select).toBeDefined()

    const options = Array.from(select!.querySelectorAll('option'))

    // Should have 4 locales
    expect(options).toHaveLength(4)

    // Check locale values
    const values = options.map((el) => el.value)
    expect(values).toEqual(['en', 'zh', 'es', 'ar'])
  })

  it('navigates to correct path on locale select', async () => {
    mockUsePathname.mockReturnValue('/about')

    const { getByRole } = render(<LocaleSwitcher />)

    const select = getByRole('combobox')

    // Change to Chinese
    await userEvent.selectOptions(select, 'zh')

    // Wait for navigation
    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/about', { locale: 'zh' })
    })
  })

  it('highlights current locale in dropdown', async () => {
    // The mock returns 'en' as the current locale
    const { getByRole } = render(<LocaleSwitcher />)

    const select = getByRole('combobox')
    const selectElement = select.element() as HTMLSelectElement

    // Current value should be 'en' (from mock)
    expect(selectElement.value).toBe('en')

    // Find the selected option
    const selectedOption = selectElement.options[selectElement.selectedIndex]
    expect(selectedOption.value).toBe('en')
    expect(selectedOption.selected).toBe(true)
  })

  it('handles RTL locale display correctly', async () => {
    const { container } = render(<LocaleSwitcher />)

    // Get the select element
    const select = container.querySelector('select')
    expect(select).toBeDefined()

    // Get all options from the select
    const options = Array.from(select!.querySelectorAll('option'))
    const arabicOption = options.find((opt) => opt.value === 'ar')

    expect(arabicOption).toBeDefined()

    // Check that Arabic label is present
    expect(arabicOption!.textContent).toContain('العربية')
  })
})
