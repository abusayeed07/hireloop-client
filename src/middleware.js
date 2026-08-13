import { NextResponse } from 'next/server';
import { authClient } from '@/lib/auth-client';

// Route configuration
const ROUTES = {
  // Routes restricted only to guests/unauthenticated users
  authOnly: ['/signin', '/signup'],

  // Public routes - accessible to everyone (guests & logged-in users)
  public: [
    '/',
    '/pricing',
    '/contact',
    '/about',
    '/blog',
    '/privacy',
    '/terms',
    '/unauthorized',
  ],
  
  // Protected routes - require authentication
  protected: [
    '/browse-jobs',
    '/companies',
    '/dashboard',
    '/profile',
    '/settings',
    '/applications',
    '/saved-jobs',
  ],
  
  // Role-specific routes
  recruiterOnly: [
    '/dashboard/recruiter',
    '/dashboard/recruiter/company',
    '/dashboard/recruiter/jobs',
    '/dashboard/recruiter/jobs/new',
  ],
  
  adminOnly: [
    '/dashboard/admin',
    '/dashboard/admin/users',
    '/dashboard/admin/companies',
    '/dashboard/admin/jobs',
    '/dashboard/admin/payments',
  ],
  
  seekerOnly: [
    '/dashboard/seeker',
    '/dashboard/seeker/saved-jobs',
    '/dashboard/seeker/applications',
  ],
};

// Helper function to check if path matches any route in a list
const matchesRoute = (path, routes) => {
  return routes.some(route => {
    if (route === '/') return path === '/';
    return path === route || path.startsWith(route + '/');
  });
};

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // 1. Truly public routes (e.g. /, /about, /pricing) can pass immediately without checking session
  const isPublicRoute = matchesRoute(path, ROUTES.public);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAuthRoute = matchesRoute(path, ROUTES.authOnly);
  const isProtectedRoute = matchesRoute(path, ROUTES.protected);

  // 2. Fetch user session for auth-only routes & protected routes
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    });

    const user = session?.data?.user;

    // 🛑 If authenticated user tries to access /signin or /signup, block them!
    if (user && isAuthRoute) {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('message', 'You are already logged in. Please log out first.');
      url.searchParams.set('redirect', '/dashboard');
      return NextResponse.redirect(url);
    }

    // If no user and route is protected, redirect to signin
    if (!user) {
      if (!isProtectedRoute) {
        return NextResponse.next();
      }
      
      const loginUrl = new URL('/signin', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated
    const userRole = user.role;

    // Check role-specific routes
    const isRecruiterRoute = matchesRoute(path, ROUTES.recruiterOnly);
    const isAdminRoute = matchesRoute(path, ROUTES.adminOnly);
    const isSeekerRoute = matchesRoute(path, ROUTES.seekerOnly);

    // Handle role-based access
    if (isRecruiterRoute && userRole !== 'recruiter') {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('message', 'This page is exclusively for Recruiters.');
      url.searchParams.set('redirect', '/dashboard');
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && userRole !== 'admin') {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('message', 'You must be an Admin to access this page.');
      url.searchParams.set('redirect', '/dashboard');
      return NextResponse.redirect(url);
    }

    if (isSeekerRoute && userRole !== 'seeker') {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('message', 'This page is exclusively for Job Seekers.');
      url.searchParams.set('redirect', '/dashboard');
      return NextResponse.redirect(url);
    }

    // Redirect /dashboard to role-specific dashboard
    if (path === '/dashboard') {
      const dashboardPath = userRole === 'admin' 
        ? '/dashboard/admin' 
        : userRole === 'recruiter' 
        ? '/dashboard/recruiter' 
        : '/dashboard/seeker';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Allow all other requests
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware auth error:', error);
    
    if (isProtectedRoute) {
      const loginUrl = new URL('/signin', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};