export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  alt: string;
  features: string[];
  primaryCta: {
    label: string;
    action: 'booking' | 'navigate';
    target?: string;
  };
  secondaryCta: {
    label: string;
    action: 'navigate' | 'booking';
    target?: string;
  };
  rating?: {
    score: number;
    count: string;
  };
  statBadge?: {
    value: string;
    label: string;
  };
}

export const HERO_THEME = {
  primary: '#0284c7', // Professional Medical Blue
  primaryHover: '#0369a1',
  accent: '#38bdf8',
  darkBg: '#070d18',
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'Next-Generation Healthcare Management',
    title: 'Compassionate Clinical Care,',
    highlight: 'Precision Medicine.',
    description: 'Book instant specialist consultations, access lifetime digital health records, and experience integrated healthcare powered by board-certified physicians.',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1600',
    alt: 'Modern medical facility and certified physicians',
    features: [
      '100% Board-Certified Doctors',
      'Zero Wait Live Queue Tokens',
      'Instant Digital Rx & Diagnostics',
      'JCI & ISO 9001 Accredited',
    ],
    primaryCta: {
      label: 'Book Instant Appointment',
      action: 'booking',
    },
    secondaryCta: {
      label: 'Meet Our Specialists',
      action: 'navigate',
      target: 'public-doctors',
    },
    rating: {
      score: 4.9,
      count: '1,200+ Patient Reviews',
    },
    statBadge: {
      value: '24/7',
      label: 'Emergency & Triage Support',
    },
  },
  {
    id: 'slide-2',
    eyebrow: 'Pathology & Diagnostic Laboratory',
    title: 'Precision Diagnostics With',
    highlight: '4-Hour Fast Turnaround.',
    description: 'Fully automated biochemistry, haematology, microbiology, and molecular pathology with direct doctor verification and instant portal PDF downloads.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600',
    alt: 'Pathology laboratory diagnostics',
    features: [
      '100+ NABL Accredited Test Panels',
      'Home Sample Collection Available',
      'Encrypted Real-Time Lab Reports',
      'Barcode-Tracked Specimen Safety',
    ],
    primaryCta: {
      label: 'Explore Health Packages',
      action: 'navigate',
      target: 'public-packages',
    },
    secondaryCta: {
      label: 'Book Lab Appointment',
      action: 'booking',
    },
    rating: {
      score: 4.95,
      count: '15,000+ Tests Processed',
    },
    statBadge: {
      value: '4h',
      label: 'Average Report Delivery',
    },
  },
  {
    id: 'slide-3',
    eyebrow: 'In-House Formulary & Dispensary',
    title: 'Smart e-Prescription &',
    highlight: 'Verified Batch Dispensary.',
    description: 'Avoid counterfeit medicines and dosage errors. Our smart pharmacy integrates barcode verification, drug interaction checking, and doorstep fulfillment.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600',
    alt: 'Modern pharmacy and clinical dispensary',
    features: [
      'Automated Drug Interaction Screening',
      'Real-Time Batch Expiry Safeguards',
      'Refill Reminders via SMS & WhatsApp',
      'Direct Doctor-to-Dispensary e-Rx',
    ],
    primaryCta: {
      label: 'Consult a Doctor Today',
      action: 'booking',
    },
    secondaryCta: {
      label: 'View Pharmacy Services',
      action: 'navigate',
      target: 'public-services',
    },
    rating: {
      score: 4.88,
      count: '99.9% Fulfillment Rate',
    },
    statBadge: {
      value: '100%',
      label: 'Authentic Sourced Drugs',
    },
  },
  {
    id: 'slide-4',
    eyebrow: 'Patient 360° Health Portal',
    title: 'Your Complete Medical History,',
    highlight: 'Always in Your Hands.',
    description: 'Lifetime unified electronic health records. Access doctor notes, vital trends, invoices, and lab diagnostics anywhere with end-to-end security.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1600',
    alt: 'Patient viewing digital health records',
    features: [
      'Lifetime EHR History Storage',
      'Instant Download of Tax Invoices',
      'Family Dependent Profiles',
      'HIPAA & GDPR Compliant Security',
    ],
    primaryCta: {
      label: 'Access Patient Portal',
      action: 'navigate',
      target: 'public-login',
    },
    secondaryCta: {
      label: 'Book Consultation',
      action: 'booking',
    },
    rating: {
      score: 4.92,
      count: '5,000+ Active Health Charts',
    },
    statBadge: {
      value: '256-bit',
      label: 'Military Grade Encryption',
    },
  },
  {
    id: 'slide-5',
    eyebrow: 'Multi-Specialty Clinical Excellence',
    title: 'Cardiology, Neurology, Pediatrics &',
    highlight: 'Comprehensive Surgery.',
    description: 'Equipped with ultra-modern outpatient suites, diagnostic imaging, and multi-disciplinary teams dedicated to exceptional patient outcomes.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600',
    alt: 'Multi-specialty hospital infrastructure',
    features: [
      '12+ Dedicated Medical Departments',
      'Full Digital ICU & Emergency Wing',
      'Transparent Itemized Pricing',
      'Multi-Branch Network Records Sync',
    ],
    primaryCta: {
      label: 'Schedule a Consultation',
      action: 'booking',
    },
    secondaryCta: {
      label: 'Explore Specialities',
      action: 'navigate',
      target: 'public-specialities',
    },
    rating: {
      score: 4.94,
      count: 'Over 25,000 Consultations',
    },
    statBadge: {
      value: '12+',
      label: 'Medical Specialities',
    },
  },
];
