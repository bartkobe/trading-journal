// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Request/Response (needed for Next.js API routes)
// Must be set up BEFORE any Next.js imports
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill Request and Response for Next.js API routes
// Use require to ensure synchronous loading before Next.js imports
if (typeof global.Request === 'undefined' || typeof global.Response === 'undefined') {
  try {
    const { Request, Response, Headers } = require('undici')
    global.Request = Request
    global.Response = Response
    global.Headers = Headers
  } catch (e) {
    // If undici is not available, Request/Response may be available in Node 18+
    // Do nothing - let it use Node's built-in if available
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }) {
    const React = require('react')
    return React.createElement('a', { href, ...props }, children)
  }
})

// Mock next-intl translations
// Load English translations for testing
const commonTranslations = require('./locales/en/common.json')
const navigationTranslations = require('./locales/en/navigation.json')
const formsTranslations = require('./locales/en/forms.json')
const tradesTranslations = require('./locales/en/trades.json')
const analyticsTranslations = require('./locales/en/analytics.json')
const errorsTranslations = require('./locales/en/errors.json')

const translationMap = {
  common: commonTranslations,
  navigation: navigationTranslations,
  forms: formsTranslations,
  trades: tradesTranslations,
  analytics: analyticsTranslations,
  errors: errorsTranslations,
}

// Helper to get nested translation value
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Mock useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => {
    const translations = translationMap[namespace] || {}
    return (key, values) => {
      // Handle nested keys (e.g., 'analytics.chartLabels.cumulativePnl')
      if (key.includes('.')) {
        const value = getNestedValue(translations, key)
        if (value) {
          // Simple interpolation for {variable}
          return typeof value === 'string' && values
            ? value.replace(/\{(\w+)\}/g, (match, varName) => values[varName] || match)
            : value
        }
      }
      
      const value = translations[key] || key
      
      // Simple interpolation for {variable}
      if (typeof value === 'string' && values) {
        return value.replace(/\{(\w+)\}/g, (match, varName) => values[varName] || match)
      }
      
      return value
    }
  },
  getTranslations: async (options) => {
    const namespace = typeof options === 'string' ? options : options?.namespace || 'common'
    const translations = translationMap[namespace] || {}
    return (key, values) => {
      // Handle nested keys
      if (key.includes('.')) {
        const value = getNestedValue(translations, key)
        if (value) {
          return typeof value === 'string' && values
            ? value.replace(/\{(\w+)\}/g, (match, varName) => values[varName] || match)
            : value
        }
      }
      
      const value = translations[key] || key
      
      if (typeof value === 'string' && values) {
        return value.replace(/\{(\w+)\}/g, (match, varName) => values[varName] || match)
      }
      
      return value
    }
  },
}))

// Mock next-intl/routing
jest.mock('next-intl/routing', () => {
  const React = require('react')
  const MockLink = ({ href, children, ...props }) => {
    return React.createElement('a', { href, ...props }, children)
  }
  return {
    defineRouting: (config) => config,
    createNavigation: () => ({
      Link: MockLink,
      redirect: jest.fn(),
      usePathname: () => '/',
      useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
      }),
    }),
  }
})

// Mock next-intl/navigation
jest.mock('next-intl/navigation', () => {
  const React = require('react')
  const mockRouterImpl = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }
  
  const mockUseRouter = jest.fn(() => mockRouterImpl)
  const mockUsePathname = jest.fn(() => '/')
  
  const MockLink = ({ href, children, ...props }) => {
    return React.createElement('a', { href, ...props }, children)
  }
  
  return {
    useRouter: mockUseRouter,
    usePathname: mockUsePathname,
    useSearchParams: () => new URLSearchParams(),
    Link: MockLink,
    redirect: jest.fn(),
    createNavigation: (routing) => ({
      Link: MockLink,
      redirect: jest.fn(),
      usePathname: mockUsePathname,
      useRouter: mockUseRouter,
    }),
  }
})

// Setup environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

