// src/lib/metadata.js

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hireloop.com';
const siteName = 'HireLoop';

function formatPathTitle(pathname = '/') {
  if (!pathname || pathname === '/') return 'Home';

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, ' '));

  if (segments.length === 0) return 'Home';

  return segments
    .map((segment) => segment
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '))
    .join(' | ');
}

// ==========================================
// ROLE-AWARE PAGE RESOLVER
// ==========================================

export function resolvePageKey(pathname = '/', userRole = null) {
  const normalizedPath = (pathname || '/').replace(/\/+$/, '') || '/';
  const lowerPath = normalizedPath.toLowerCase();

  // ==========================================
  // 1. CHECK DYNAMIC ROUTES FIRST
  // ==========================================
  if (lowerPath.startsWith('/browse-jobs/')) return 'job-detail';
  if (lowerPath.startsWith('/jobs/')) return 'job-detail';
  if (lowerPath.startsWith('/companies/')) return 'company-detail';
  
  // ==========================================
  // 2. CHECK DASHBOARD ROUTES WITH ROLE
  // ==========================================
  if (lowerPath.startsWith('/dashboard/')) {
    const segments = lowerPath.split('/').filter(Boolean);
    
    // If we have a user role, use it to determine the page key
    if (userRole) {
      // Build the page key based on role and path
      let pageKey = '';
      
      if (segments.length === 1) {
        // Just /dashboard
        pageKey = `${userRole}-dashboard`;
      } else if (segments.length >= 2) {
        // /dashboard/xxx or /dashboard/xxx/yyy
        const subPath = segments.slice(1).join('-');
        pageKey = `${userRole}-${subPath}`;
      }
      
      // Check if this page key exists in config
      if (METADATA_CONFIG[pageKey]) {
        return pageKey;
      }
      
      // Fallback to role dashboard
      return `${userRole}-dashboard`;
    }
    
    // No role provided - try to detect from URL
    if (segments.length >= 2) {
      const possibleRole = segments[1];
      if (possibleRole === 'admin') return 'admin-dashboard';
      if (possibleRole === 'recruiter') return 'recruiter-dashboard';
      if (possibleRole === 'seeker') return 'seeker-dashboard';
    }
    
    // Default to recruiter if no role detected
    return 'recruiter-dashboard';
  }

  // ==========================================
  // 3. EXACT ROUTE MAPPINGS (FOR NON-DASHBOARD PAGES)
  // ==========================================
  const exactMatches = {
    '/': 'home',
    '/about': 'about',
    '/contact': 'contact',
    '/pricing': 'pricing',
    '/browse-jobs': 'jobs',
    '/jobs': 'jobs',
    '/companies': 'companies',
    '/profile': 'profile',
    '/signin': 'signin',
    '/signup': 'signup',
    '/forget-password': 'forget-password',
    '/reset-password': 'reset-password',
  };

  if (exactMatches[lowerPath]) {
    return exactMatches[lowerPath];
  }

  return 'home';
}

// ==========================================
// METADATA CONFIGURATION
// ==========================================

export const METADATA_CONFIG = {
  // ==========================================
  // ADMIN PAGES
  // ==========================================
  'admin-dashboard': {
    title: 'Dashboard | HireLoop Admin',
    description: 'Real-time platform performance metrics, user analytics, and revenue insights.',
    keywords: 'admin dashboard, hiring analytics, recruiter metrics',
    path: '/dashboard/admin',
    image: '/images/og/dashboard.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-payments': {
    title: 'Payments Analytics | HireLoop Admin',
    description: 'Monitor platform revenue, subscription analytics, and payment transactions.',
    keywords: 'payment analytics, revenue tracking, subscription management',
    path: '/dashboard/admin/payments',
    image: '/images/og/payments.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-users': {
    title: 'Users Management | HireLoop Admin',
    description: 'Manage and monitor all users, recruiters, and job seekers on your platform.',
    keywords: 'user management, recruiters, job seekers',
    path: '/dashboard/admin/users',
    image: '/images/og/users.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-companies': {
    title: 'Companies | HireLoop Admin',
    description: 'Manage companies, verify business accounts, and monitor company activity.',
    keywords: 'company management, business verification, employer accounts',
    path: '/dashboard/admin/companies',
    image: '/images/og/companies.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-jobs': {
    title: 'Jobs Management | HireLoop Admin',
    description: 'Oversee all job postings, approve or reject listings, and manage job categories.',
    keywords: 'job management, job postings, career listings',
    path: '/dashboard/admin/jobs',
    image: '/images/og/jobs.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-settings': {
    title: 'Settings | HireLoop Admin',
    description: 'Configure platform settings, manage admin users, and customize preferences.',
    keywords: 'admin settings, platform configuration, user preferences',
    path: '/dashboard/admin/settings',
    image: '/images/og/settings.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-billing': {
    title: 'Billing | HireLoop Admin',
    description: 'Manage platform billing, invoices, and payment history.',
    keywords: 'billing, invoices, payments, subscriptions',
    path: '/dashboard/admin/billing',
    image: '/images/og/billing.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-profile': {
    title: 'Profile | HireLoop Admin',
    description: 'Manage your admin profile and account settings.',
    keywords: 'profile, account, settings, admin',
    path: '/dashboard/admin/profile',
    image: '/images/og/profile.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-recruiter': {
    title: 'Recruiters | HireLoop Admin',
    description: 'Manage recruiters, verify accounts, and monitor recruiter activity.',
    keywords: 'recruiters, talent acquisition, hiring managers',
    path: '/dashboard/admin/recruiter',
    image: '/images/og/recruiter.jpg',
    type: 'admin',
    noIndex: true,
  },
  'admin-seeker': {
    title: 'Job Seekers | HireLoop Admin',
    description: 'Manage job seekers, verify profiles, and monitor applicant activity.',
    keywords: 'job seekers, candidates, applicants, talent pool',
    path: '/dashboard/admin/seeker',
    image: '/images/og/seeker.jpg',
    type: 'admin',
    noIndex: true,
  },

  // ==========================================
  // RECRUITER PAGES
  // ==========================================
  'recruiter-dashboard': {
    title: 'Recruiter Dashboard | HireLoop',
    description: 'Manage your job postings, track applicants, and monitor your hiring performance.',
    keywords: 'recruiter dashboard, hiring, job postings, applicants',
    path: '/dashboard',
    image: '/images/og/recruiter-dashboard.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-company': {
    title: 'Company Profile | HireLoop Recruiter',
    description: 'Manage your company profile and brand presence on HireLoop.',
    keywords: 'company profile, employer brand, company page',
    path: '/dashboard/company',
    image: '/images/og/company-profile.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-company-profile': {
    title: 'Company Profile | HireLoop Recruiter',
    description: 'Manage your company profile and brand presence on HireLoop.',
    keywords: 'company profile, employer brand, company page',
    path: '/dashboard/company-profile',
    image: '/images/og/company-profile.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-post-job': {
    title: 'Post a New Job | HireLoop Recruiter',
    description: 'Create and publish new job listings to attract top talent.',
    keywords: 'post job, job listing, create job, hire talent',
    path: '/dashboard/post-job',
    image: '/images/og/post-job.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-manage-jobs': {
    title: 'Company Jobs | HireLoop Recruiter',
    description: 'View, edit, and manage all your job postings in one place.',
    keywords: 'manage jobs, job listings, edit jobs, company jobs',
    path: '/dashboard/manage-jobs',
    image: '/images/og/manage-jobs.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-billing': {
    title: 'Subscription & Billing | HireLoop Recruiter',
    description: 'Manage your subscription, payment methods, and billing history.',
    keywords: 'billing, subscription, invoices, payments, plan',
    path: '/dashboard/billing',
    image: '/images/og/billing.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-settings': {
    title: 'Account Settings | HireLoop Recruiter',
    description: 'Configure your recruiter account settings and preferences.',
    keywords: 'settings, preferences, account settings, notifications',
    path: '/dashboard/settings',
    image: '/images/og/settings.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-profile': {
    title: 'My Profile | HireLoop Recruiter',
    description: 'Manage your recruiter profile and account information.',
    keywords: 'profile, account, recruiter profile',
    path: '/dashboard/profile',
    image: '/images/og/profile.jpg',
    type: 'recruiter',
    noIndex: false,
  },
  'recruiter-subscription': {
    title: 'Subscription | HireLoop Recruiter',
    description: 'Manage your subscription plan and billing details.',
    keywords: 'subscription, plan, billing, upgrade',
    path: '/dashboard/subscription',
    image: '/images/og/subscription.jpg',
    type: 'recruiter',
    noIndex: false,
  },

  // ==========================================
  // SEEKER PAGES
  // ==========================================
  'seeker-dashboard': {
    title: 'Seeker Dashboard | HireLoop',
    description: 'Track your job applications, saved jobs, and career progress.',
    keywords: 'job seeker dashboard, applications, saved jobs, career',
    path: '/dashboard/seeker',
    image: '/images/og/seeker-dashboard.jpg',
    type: 'seeker',
    noIndex: false,
  },
  'seeker-applications': {
    title: 'My Applications | HireLoop',
    description: 'View and track all your job applications in one place.',
    keywords: 'job applications, applied jobs, application status',
    path: '/dashboard/seeker/applications',
    image: '/images/og/applications.jpg',
    type: 'seeker',
    noIndex: false,
  },
  'seeker-saved-jobs': {
    title: 'Saved Jobs | HireLoop',
    description: 'View and manage jobs you have saved for later.',
    keywords: 'saved jobs, wishlist, job alerts',
    path: '/dashboard/seeker/saved-jobs',
    image: '/images/og/saved-jobs.jpg',
    type: 'seeker',
    noIndex: false,
  },
  'seeker-profile': {
    title: 'My Profile | HireLoop Seeker',
    description: 'Manage your professional profile and resume.',
    keywords: 'profile, resume, CV, professional profile',
    path: '/dashboard/seeker/profile',
    image: '/images/og/profile.jpg',
    type: 'seeker',
    noIndex: false,
  },
  'seeker-settings': {
    title: 'Settings | HireLoop Seeker',
    description: 'Configure your job seeker account settings and preferences.',
    keywords: 'settings, preferences, account settings',
    path: '/dashboard/settings',
    image: '/images/og/settings.jpg',
    type: 'seeker',
    noIndex: false,
  },
  'seeker-billing': {
    title: 'Subscription & Billing | HireLoop Seeker',
    description: 'Manage your subscription and billing details.',
    keywords: 'billing, subscription, payments, plan',
    path: '/dashboard/billing',
    image: '/images/og/billing.jpg',
    type: 'seeker',
    noIndex: false,
  },

  // ==========================================
  // PUBLIC PAGES
  // ==========================================
  home: {
    title: 'HireLoop - Smart Hiring Platform',
    description: 'Find the best talent or discover your dream job with HireLoop.',
    keywords: 'job search, hiring platform, recruiters, job seekers, career',
    path: '/',
    image: '/images/og/home.jpg',
    type: 'public',
    noIndex: false,
  },
  jobs: {
    title: 'Browse Jobs | HireLoop',
    description: 'Find your dream job from thousands of listings across various industries.',
    keywords: 'job listings, career opportunities, job search, employment',
    path: '/browse-jobs',
    image: '/images/og/jobs.jpg',
    type: 'public',
    noIndex: false,
  },
  'job-detail': {
    title: 'Job Details | HireLoop',
    description: 'View and apply for job opportunities.',
    keywords: 'job details, apply now, career opportunity',
    path: '/jobs',
    image: '/images/og/job-detail.jpg',
    type: 'public',
    noIndex: false,
  },
  companies: {
    title: 'Company Directory | HireLoop',
    description: 'Discover and research top companies hiring in your area.',
    keywords: 'companies, employers, company directory, top employers',
    path: '/companies',
    image: '/images/og/companies.jpg',
    type: 'public',
    noIndex: false,
  },
  'company-detail': {
    title: 'Company Profile | HireLoop',
    description: 'Learn more about this company, their culture, and open positions.',
    keywords: 'company profile, company culture, employer, open jobs',
    path: '/companies',
    image: '/images/og/company-detail.jpg',
    type: 'public',
    noIndex: false,
  },
  profile: {
    title: 'My Profile | HireLoop',
    description: 'Manage your account, profile information, and security configuration.',
    keywords: 'profile, account, security, settings',
    path: '/profile',
    image: '/images/og/profile.jpg',
    type: 'public',
    noIndex: false,
  },
  about: {
    title: 'About HireLoop',
    description: 'Learn about HireLoop - the platform connecting talented professionals with great companies.',
    keywords: 'about, mission, vision, hiring platform',
    path: '/about',
    image: '/images/og/about.jpg',
    type: 'public',
    noIndex: false,
  },
  contact: {
    title: 'Contact HireLoop',
    description: 'Get in touch with the HireLoop team for support, partnerships, or inquiries.',
    keywords: 'contact, support, help, inquiries',
    path: '/contact',
    image: '/images/og/contact.jpg',
    type: 'public',
    noIndex: false,
  },
  blog: {
    title: 'Blog | HireLoop',
    description: 'Latest insights, tips, and news about hiring and career development.',
    keywords: 'blog, hiring tips, career advice, industry news',
    path: '/blog',
    image: '/images/og/blog.jpg',
    type: 'public',
    noIndex: false,
  },
  'blog-post': {
    title: 'Blog Post | HireLoop',
    description: 'Read the latest insights and tips about hiring and career development.',
    keywords: 'blog, article, hiring tips, career advice',
    path: '/blog',
    image: '/images/og/blog-post.jpg',
    type: 'public',
    noIndex: false,
  },
  pricing: {
    title: 'Pricing | HireLoop',
    description: 'Choose the right plan for your hiring needs. Flexible pricing for businesses of all sizes.',
    keywords: 'pricing, plans, subscription, hire talent',
    path: '/pricing',
    image: '/images/og/pricing.jpg',
    type: 'public',
    noIndex: false,
  },
  signin: {
    title: 'Sign In | HireLoop',
    description: 'Sign in to your HireLoop account to manage jobs, applications, and more.',
    keywords: 'sign in, login, account',
    path: '/signin',
    image: '/images/og/signin.jpg',
    type: 'public',
    noIndex: false,
  },
  signup: {
    title: 'Sign Up | HireLoop',
    description: 'Create your HireLoop account and start your job search or hiring journey.',
    keywords: 'sign up, register, create account',
    path: '/signup',
    image: '/images/og/signup.jpg',
    type: 'public',
    noIndex: false,
  },
};

// ==========================================
// DYNAMIC FUNCTIONS
// ==========================================

export function getPageMetadata(page, overrides = {}) {
  const config = METADATA_CONFIG[page] || METADATA_CONFIG.home;

  const title = overrides.title || config.title;
  const description = overrides.description || config.description;
  const image = overrides.image || config.image;
  const keywords = overrides.keywords || config.keywords;
  const path = overrides.path || config.path;
  const type = overrides.type || config.type || 'website';
  const noIndex = overrides.noIndex !== undefined ? overrides.noIndex : config.noIndex;

  return {
    title,
    description,
    keywords,
    noIndex,
    path,
    image,
    type,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: siteName,
      images: [
        {
          url: `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

export function addPageMetadata(pageKey, config) {
  METADATA_CONFIG[pageKey] = config;
}

export function updatePageMetadata(pageKey, updates) {
  if (METADATA_CONFIG[pageKey]) {
    METADATA_CONFIG[pageKey] = { ...METADATA_CONFIG[pageKey], ...updates };
  }
}

export function getDynamicMetadata(page, dynamicData = {}, overrides = {}) {
  const config = METADATA_CONFIG[page] || METADATA_CONFIG.home;
  
  let title = config.title;
  let description = config.description;
  let image = config.image;
  let keywords = config.keywords;
  let path = config.path;

  Object.keys(dynamicData).forEach(key => {
    if (title) title = title.replace(new RegExp(`{{${key}}}`, 'g'), dynamicData[key] || '');
    if (description) description = description.replace(new RegExp(`{{${key}}}`, 'g'), dynamicData[key] || '');
    if (path) path = path.replace(new RegExp(`{{${key}}}`, 'g'), dynamicData[key] || '');
  });

  title = overrides.title || title;
  description = overrides.description || description;
  image = overrides.image || image;
  keywords = overrides.keywords || keywords;
  path = overrides.path || path;

  const noIndex = overrides.noIndex !== undefined ? overrides.noIndex : config.noIndex;

  return {
    title,
    description,
    keywords,
    noIndex,
    path,
    image,
    type: config.type || 'website',
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: siteName,
      images: [
        {
          url: `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: config.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

export function createMetadata(page, overrides = {}) {
  return getPageMetadata(page, overrides);
}

export function getRouteMetadata(pathname, userRole = null, overrides = {}) {
  const page = resolvePageKey(pathname, userRole);
  const config = METADATA_CONFIG[page] || METADATA_CONFIG.home;
  const fallbackTitle = `${siteName} | ${formatPathTitle(pathname)}`;

  const metadata = getPageMetadata(page, {
    ...overrides,
    title: overrides.title || config.title || fallbackTitle,
    description: overrides.description || config.description || `Discover ${siteName} content for ${formatPathTitle(pathname)}.`,
    keywords: overrides.keywords || config.keywords,
    path: overrides.path || config.path || pathname,
    image: overrides.image || config.image,
    type: overrides.type || config.type || 'website',
    noIndex: overrides.noIndex !== undefined ? overrides.noIndex : config.noIndex,
  });

  return metadata || getPageMetadata('home');
}

export const SITE_CONFIG = {
  baseUrl,
  siteName,
  defaultImage: '/images/og/default.jpg',
};