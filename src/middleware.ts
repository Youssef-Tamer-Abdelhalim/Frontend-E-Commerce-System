import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - static files
    // - _next internals
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
