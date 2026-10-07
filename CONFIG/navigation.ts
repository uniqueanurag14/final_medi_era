import { dbService } from '../FRONTEND/src/services/mockDatabase';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconOnly?: boolean;
  icon?: 'home' | 'calendar';
  ariaLabel?: string;
  isSpecialAction?: boolean;
}

export interface FooterNavItem {
  id: string;
  label: string;
  path: string;
}

export interface RouteMetadata {
  title: string;
  description: string;
  canonicalPath: string;
}

// 1. Header Navigation Configuration
// Items:
// - Home (icon only, aria-label="Home")
// - Specialities
// - Services
// - Doctors
// - Health Packages
export const HEADER_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-home',
    label: 'Home',
    path: '/',
    iconOnly: true,
    icon: 'home',
    ariaLabel: 'Home',
  },
  {
    id: 'nav-specialities',
    label: 'Specialities',
    path: '/specialities',
  },
  {
    id: 'nav-services',
    label: 'Services',
    path: '/services',
  },
  {
    id: 'nav-doctors',
    label: 'Doctors',
    path: '/doctors',
  },
  {
    id: 'nav-packages',
    label: 'Health Packages',
    path: '/health-packages',
  },
];

// 2. Footer Navigation Configuration
// EXACT items requested:
// - About Us
// - Contact Us
// - FAQ
export const FOOTER_NAV_ITEMS: FooterNavItem[] = [
  {
    id: 'footer-about',
    label: 'About Us',
    path: '/about-us',
  },
  {
    id: 'footer-contact',
    label: 'Contact Us',
    path: '/contact-us',
  },
  {
    id: 'footer-faq',
    label: 'FAQ',
    path: '/faq',
  },
];

// 3. Route SEO Metadata Dictionary
export const ROUTE_SEO_METADATA: Record<string, RouteMetadata> = {
  '/': {
    title: 'MediEra - Medical CRM & ERP System | Multispecialty Clinical Healthcare',
    description: 'MediEra is an enterprise medical platform offering multispecialty healthcare, board-certified physician consultations, online appointment booking, and electronic health records.',
    canonicalPath: '/',
  },
  '/specialities': {
    title: 'Clinical Specialities & Medical Departments | MediEra Healthcare',
    description: 'Explore specialized medical departments at MediEra including Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, and Internal Medicine.',
    canonicalPath: '/specialities',
  },
  '/services': {
    title: 'Clinical Services, Diagnostics & Procedures | MediEra Healthcare',
    description: 'Browse standardized clinical services, advanced diagnostic imaging, pathology panels, and outpatient procedures with transparent pricing at MediEra.',
    canonicalPath: '/services',
  },
  '/doctors': {
    title: 'Find Doctors & Medical Specialists | MediEra Healthcare',
    description: 'Search our directory of board-certified medical doctors, physicians, surgeons, and healthcare specialists. Review qualifications and schedule an appointment.',
    canonicalPath: '/doctors',
  },
  '/health-packages': {
    title: 'Preventative Health Packages & Wellness Screenings | MediEra',
    description: 'Comprehensive preventative health checkup packages for individuals, seniors, cardiac wellness, and women health with same-day laboratory results.',
    canonicalPath: '/health-packages',
  },
  '/book-appointment': {
    title: 'Book an Appointment Online | MediEra Healthcare',
    description: 'Schedule an in-clinic consultation or teleconsultation with verified specialists. Choose your department, doctor, date, and time slot with instant token issuance.',
    canonicalPath: '/book-appointment',
  },
  '/about-us': {
    title: 'About MediEra Healthcare System | Excellence in Clinical Care',
    description: 'Learn about MediEra multi-specialty healthcare network, our board-certified clinical leadership, Joint Commission International standards, and patient-first mission.',
    canonicalPath: '/about-us',
  },
  '/contact-us': {
    title: 'Contact Us & Clinical Branch Locations | MediEra Healthcare',
    description: 'Get in touch with MediEra clinic branches, access 24/7 patient helpline support, or locate your nearest medical center and specialty pavilion.',
    canonicalPath: '/contact-us',
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) | MediEra Healthcare',
    description: 'Find answers about booking appointments, OPD live queue tokens, health insurance pre-authorization, teleconsultations, and clinic policies at MediEra.',
    canonicalPath: '/faq',
  },
  '/login': {
    title: 'Sign In to Patient & Staff Portal | MediEra Healthcare',
    description: 'Access your secure MediEra digital health portal for appointment history, digital prescriptions, lab reports, and clinical back office access.',
    canonicalPath: '/login',
  },
  '/register': {
    title: 'Patient Self-Registration | MediEra Healthcare',
    description: 'Register as a new patient to access digital health records, schedule priority appointments, and track your clinical visit history online.',
    canonicalPath: '/register',
  },
};

/**
 * Normalizes any input route or legacy token to a clean, canonical SEO-friendly path.
 * Handles redirects from legacy URLs.
 */
export function normalizePath(inputPath?: string): string {
  if (typeof inputPath !== 'string') {
    return '/';
  }

  // Trim and strip trailing slash (except for root '/')
  let clean = inputPath.trim();
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }

  // Remove leading '#' or '?' if hash-based or query-based navigation was used
  if (clean.startsWith('#')) {
    clean = clean.slice(1);
  }

  // Legacy route redirects & aliases
  const redirectMap: Record<string, string> = {
    '': '/',
    '/home': '/',
    'home': '/',
    'public-home': '/',
    '/public-home': '/',
    '/specialties': '/specialities',
    'specialties': '/specialities',
    'specialities': '/specialities',
    'public-specialties': '/specialities',
    'public-specialities': '/specialities',
    '/public-specialties': '/specialities',
    '/public-specialities': '/specialities',
    'services': '/services',
    'public-services': '/services',
    '/public-services': '/services',
    'doctors': '/doctors',
    'public-doctors': '/doctors',
    '/public-doctors': '/doctors',
    'packages': '/health-packages',
    'public-packages': '/health-packages',
    '/packages': '/health-packages',
    '/public-packages': '/health-packages',
    'about': '/about-us',
    'about-us': '/about-us',
    'public-about': '/about-us',
    '/about': '/about-us',
    '/public-about': '/about-us',
    'contact': '/contact-us',
    'contact-us': '/contact-us',
    'public-contact': '/contact-us',
    '/contact': '/contact-us',
    '/public-contact': '/contact-us',
    'faq': '/faq',
    'public-faq': '/faq',
    '/public-faq': '/faq',
    'login': '/login',
    'public-login': '/login',
    '/public-login': '/login',
    'register': '/registration',
    'registration': '/registration',
    'public-register': '/registration',
    '/public-register': '/registration',
    '/register': '/registration',
    '/registration': '/registration',
    'erp-login': '/erp/login',
    'erp/login': '/erp/login',
    '/erp/login': '/erp/login',
    '/erp-login': '/erp/login',
    '/admin/login': '/erp/login',
    'admin/login': '/erp/login',
    'dashboard': '/dashboard',
    'profile': '/profile',
    'my-profile': '/profile',
    '/my-profile': '/profile',
    'appointments': '/appointments',
    'my-appointments': '/appointments',
    '/my-appointments': '/appointments',
    'booking-confirmation': '/booking-confirmation',
    '/booking-confirmation': '/booking-confirmation',
    'confirmation': '/booking-confirmation',
    '/confirmation': '/booking-confirmation',
    'patient/dashboard': '/dashboard',
    '/patient/dashboard': '/dashboard',
    'patient/profile': '/profile',
    '/patient/profile': '/profile',
    'patient/appointments': '/appointments',
    '/patient/appointments': '/appointments',
    'book-appointment': '/book-appointment',
    'appointment': '/book-appointment',
    '/appointment': '/book-appointment',
    'admin': '/erp/dashboard',
    '/admin': '/erp/dashboard',
    'erp': '/erp/dashboard',
    '/erp': '/erp/dashboard',
  };

  if (redirectMap[clean]) {
    return redirectMap[clean];
  }

  // Doctor detail paths (e.g., doctor-detail-doc-1, public-doctor-detail-doc-1, /doctor/123, /doctors/doc-1)
  if (clean.startsWith('public-doctor-detail-')) {
    const docId = clean.replace('public-doctor-detail-', '');
    return `/doctors/${docId}`;
  }
  if (clean.startsWith('doctor-detail-')) {
    const docId = clean.replace('doctor-detail-', '');
    return `/doctors/${docId}`;
  }
  if (clean.startsWith('/doctor/')) {
    const docId = clean.replace('/doctor/', '');
    return `/doctors/${docId}`;
  }

  return clean;
}

/**
 * Updates document title, meta description, and canonical link tag for SEO.
 */
export function updateSEO(path: string, customMetadata?: Partial<RouteMetadata>) {
  if (typeof document === 'undefined') return;

  const canonicalPath = normalizePath(path);
  const metadata = customMetadata || ROUTE_SEO_METADATA[canonicalPath] || {
    title: 'MediEra - Medical CRM & ERP Platform',
    description: 'Enterprise Medical CRM & ERP platform by YantraEra for multispecialty healthcare, clinical practice, and patient records.',
    canonicalPath,
  };

  // Update Title
  if (metadata.title) {
    document.title = metadata.title;
  }

  // Update Meta Description
  if (metadata.description) {
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', metadata.description);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', metadata.description);
    }
  }

  // Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mediera.yantraera.com';
  canonicalLink.setAttribute('href', `${origin}${metadata.canonicalPath}`);
}
