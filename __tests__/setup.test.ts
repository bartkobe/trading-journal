/**
 * Basic setup test to verify Jest and React Testing Library are working correctly
 */
describe('Test Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to jest-dom matchers', () => {
    const element = document.createElement('div')
    element.className = 'test-class'
    expect(element).toHaveClass('test-class')
  })

  it('should have Next.js router mocks available', () => {
    const { useRouter } = require('next/navigation')
    const router = useRouter()
    expect(router.push).toBeDefined()
    expect(typeof router.push).toBe('function')
  })
})

