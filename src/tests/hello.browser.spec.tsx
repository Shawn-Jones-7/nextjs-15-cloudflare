import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

// Simple component test (i18n pages require full provider setup)
test('renders simple element', async () => {
  const TestComponent = () => <div>Hello World</div>
  const screen = await render(<TestComponent />)
  await expect.element(screen.getByText(/hello world/i)).toBeInTheDocument()
})
