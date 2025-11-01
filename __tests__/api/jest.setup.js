// Setup file specifically for API route tests
// Polyfills for Request/Response must be set up before Next.js imports

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Ensure Request/Response are available for Next.js API routes
if (typeof global.Request === 'undefined' || typeof global.Response === 'undefined') {
  try {
    const { Request, Response, Headers } = require('undici');
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
  } catch (e) {
    console.warn('Could not load Request/Response polyfills from undici');
  }
}

// Setup environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

