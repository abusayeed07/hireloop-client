// frontend/src/middleware.js
import { NextResponse } from 'next/server';
import { authClient } from '@/lib/auth-client';

// Route configuration
const ROUTES = {
  // Public routes - accessible to everyone
  public: [
    '/',
    '/signin',
    '/signup',
    '/pricing',
    '/contact',
    '/about',
    '/blog',
    '/privacy',
    '/terms',
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

  // Check if route is public
  const isPublicRoute = matchesRoute(path, ROUTES.public);

  // If public route, allow access immediately
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route is protected (requires authentication)
  const isProtectedRoute = matchesRoute(path, ROUTES.protected);

  // Get session using authClient
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    });

    const user = session?.data?.user;

    // If no user and route is protected, redirect to signin
    if (!user) {
      // If route is not protected, allow access (it might be a new route we haven't classified)
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
      const redirectPath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/seeker';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (isAdminRoute && userRole !== 'admin') {
      const redirectPath = userRole === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/seeker';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (isSeekerRoute && userRole !== 'seeker') {
      const redirectPath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/recruiter';
      return NextResponse.redirect(new URL(redirectPath, request.url));
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

    // If authenticated user tries to access signin/signup, redirect to dashboard
    if (path === '/signin' || path === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow all other requests
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // If auth check fails, redirect to signin for protected routes
    if (isProtectedRoute) {
      const loginUrl = new URL('/signin', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    
    // For other routes, allow access
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};