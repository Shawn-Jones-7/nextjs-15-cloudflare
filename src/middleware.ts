import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only locale routes, exclude static assets and API
  matcher: ['/', '/(en|zh|es|ar)/:path*'],
};
