/* ================================================================
   Wahab Ahmad Portfolio — Shared Data Storage Layer
   All website data lives in browser localStorage. No backend needed.
   ================================================================ */

const STORAGE_KEY = 'wahab_portfolio_v1';

const DEFAULT_IMAGE = (label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#0b0e1a"/>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <circle cx="300" cy="150" r="70" fill="none" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <path d="M 225 205 L 255 235 L 285 205" fill="none" stroke="url(#g)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="300" y="295" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="17" fill="#64748b" text-anchor="middle">${label}</text>
    <text x="300" y="320" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="13" fill="#475569" text-anchor="middle">Upload your image from the admin panel</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

const DEFAULTS = {
  siteContent: {
    name: 'Wahab Ahmad',
    tagline: 'I turn your idea into a professional design, and your idea into a fully custom website — in just 2 to 4 weeks.',
    roles: ['Graphic Designer', 'Web Builder', 'UI/UX Designer', 'Textile & Screen Printing Designer'],
    about: `I'm Wahab Ahmad, a 19-year-old Graphic Designer and Web Builder from Faisalabad, Punjab, Pakistan. I turn your idea into a professional design — and your idea into a fully custom website — delivered in just 2 to 4 weeks.

With 1.5 years of hands-on experience in Textile and Screen Printing and a certificate in Graphic Designing, I combine creativity with technical skill. I build full-stack, creative, professional websites from scratch, exactly to your demands, and I can customize or redesign your existing website to make it modern, fast, and professional.

Whether you need a logo, a brand identity, a UI/UX design, a website, or textile and screen printing artwork — you explain the idea, I design it.`,

    stats: [
      { label: 'Years Textile Experience', value: '1.5+', suffix: '' },
      { label: 'Website Delivery Time', value: '2–4', suffix: ' Weeks' },
      { label: 'Fully Custom Work', value: '100%', suffix: '' },
      { label: 'Designer + Developer', value: 'In One Place', suffix: '' }
    ],

    email: 'hello@wahabahmad.com',
    whatsapp: '+92 300 0000000',
    phone: '+92 300 0000000',
    location: 'Faisalabad, Punjab, Pakistan',
    resumeUrl: '#',
    seoTitle: 'Wahab Ahmad | Graphic Designer + Web Builder',
    seoDescription: 'Wahab Ahmad — 19-year-old Graphic Designer and Web Builder from Faisalabad, Punjab, Pakistan. I turn ideas into professional designs and fully custom websites in 2 to 4 weeks.',
    profilePhoto: '',
    logo: '',
    social: {
      facebook: '#',
      instagram: '#',
      twitter: '#',
      linkedin: '#',
      behance: '#',
      whatsapp: '#'
    }
  },

  projects: [
    { id: 'p1', title: 'Lumina Brand Identity', category: 'Branding & Logo', description: 'Sample project — replace with your real work from the admin panel. Complete brand identity including logo, color system, typography, and brand guidelines.', image: DEFAULT_IMAGE('Sample Project 1'), order: 1, featured: true },
    { id: 'p2', title: 'Summer Social Media Kit', category: 'Social Media Design', description: 'Sample project — replace with your real work from the admin panel. Engaging social media post designs for Instagram and Facebook.', image: DEFAULT_IMAGE('Sample Project 2'), order: 2, featured: true },
    { id: 'p3', title: 'Textile Screen Print Collection', category: 'Print & Textile', description: 'Sample project — replace with your real work from the admin panel. Screen printing designs for textile and apparel production.', image: DEFAULT_IMAGE('Sample Project 3'), order: 3, featured: false },
    { id: 'p4', title: 'Fintech Mobile App UI/UX', category: 'UI/UX', description: 'Sample project — replace with your real work from the admin panel. User experience and interface design for a mobile banking application, designed in Figma.', image: DEFAULT_IMAGE('Sample Project 4'), order: 4, featured: true },
    { id: 'p5', title: 'Creative Agency Website', category: 'Websites', description: 'Sample project — replace with your real work from the admin panel. Fully custom website built from scratch with HTML, CSS, and JavaScript.', image: DEFAULT_IMAGE('Sample Project 5'), order: 5, featured: false },
    { id: 'p6', title: 'Modern Logo Design', category: 'Branding & Logo', description: 'Sample project — replace with your real work from the admin panel. Minimalist and professional logo design for a creative studio.', image: DEFAULT_IMAGE('Sample Project 6'), order: 6, featured: false },
    { id: 'p7', title: 'Instagram Story Templates', category: 'Social Media Design', description: 'Sample project — replace with your real work from the admin panel. Animated Instagram story template set for brand promotion.', image: DEFAULT_IMAGE('Sample Project 7'), order: 7, featured: false },
    { id: 'p8', title: 'E-Commerce Storefront', category: 'Websites', description: 'Sample project — replace with your real work from the admin panel. Custom e-commerce website design with product catalog and checkout experience.', image: DEFAULT_IMAGE('Sample Project 8'), order: 8, featured: false }
  ],

  services: [
    { id: 's1', title: 'Graphic Design', icon: 'layout', description: 'I create any design from just an idea — logos, branding, social media posts, banners, and print design that looks professional and memorable.', includes: ['Logo Design', 'Brand Identity', 'Social Media Posts', 'Banners', 'Print Design'] },
    { id: 's2', title: 'UI/UX Design', icon: 'layout', description: 'User-friendly interfaces designed in Figma and Adobe XD. Clean, modern, and conversion-focused designs for web and mobile apps.', includes: ['Figma Design', 'Adobe XD', 'User Research', 'Wireframes', 'Prototypes'] },
    { id: 's3', title: 'Web Building', icon: 'code', description: 'Fully custom websites built from scratch with HTML, CSS3, Python, and Next.js. I also customize and redesign existing websites to be modern, fast, and professional.', includes: ['Custom Websites', 'Website Redesign', 'Next.js Development', 'Python Backend', 'Responsive Design'] },
    { id: 's4', title: 'Textile & Screen Printing', icon: 'layout', description: 'Professional textile and screen printing designs with 1.5 years of hands-on experience. High-quality artwork ready for production.', includes: ['Textile Design', 'Screen Printing', 'Apparel Artwork', 'Print Preparation'] }
  ],

  skills: [
    { id: 'sk1', name: 'Adobe Photoshop', value: 90, category: 'Design' },
    { id: 'sk2', name: 'Adobe Illustrator', value: 85, category: 'Design' },
    { id: 'sk3', name: 'Adobe InDesign', value: 75, category: 'Design' },
    { id: 'sk4', name: 'Adobe XD', value: 80, category: 'UI/UX' },
    { id: 'sk5', name: 'Figma', value: 88, category: 'UI/UX' },
    { id: 'sk6', name: 'AI Tools', value: 92, category: 'Design' },
    { id: 'sk7', name: 'HTML', value: 85, category: 'Development' },
    { id: 'sk8', name: 'CSS3', value: 80, category: 'Development' },
    { id: 'sk9', name: 'Python', value: 70, category: 'Development' },
    { id: 'sk10', name: 'Next.js', value: 75, category: 'Development' }
  ],

  testimonials: [
    { id: 't1', name: 'Ahmed Raza', role: 'Business Owner', text: 'Wahab turned my rough idea into a stunning brand identity in just two weeks. Professional, fast, and exactly what I needed.', rating: 5, sample: true },
    { id: 't2', name: 'Sara Khan', role: 'Startup Founder', text: 'The website he built for my business is modern, fast, and fully custom. I highly recommend Wahab Ahmad for web design and development.', rating: 5, sample: true },
    { id: 't3', name: 'Ali Hassan', role: 'Clothing Brand', text: 'Excellent textile and screen printing work. The designs came out better than I expected. Great communication and on-time delivery.', rating: 4, sample: true }
  ],

  messages: [],

  settings: {
    accentStart: '#a855f7',
    accentEnd: '#06b6d4',
    primaryFont: 'system-ui',
    darkModeDefault: true,
    adminPassword: 'admin123'
  },

  sectionVisibility: {
    navbar: true, hero: true, stats: true, about: true, services: true,
    skills: true, portfolio: true, process: true, experience: true,
    why: true, testimonials: true, contact: true, footer: true
  }
};

class Storage {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.clone(DEFAULTS);
      const parsed = JSON.parse(raw);
      return this.mergeDefaults(this.clone(DEFAULTS), parsed);
    } catch (e) {
      console.error('Failed to load portfolio data', e);
      return this.clone(DEFAULTS);
    }
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  mergeDefaults(def, src) {
    for (const key in def) {
      if (src[key] === undefined) continue;
      if (typeof def[key] === 'object' && !Array.isArray(def[key]) && typeof src[key] === 'object' && !Array.isArray(src[key])) {
        this.mergeDefaults(def[key], src[key]);
      } else {
        def[key] = src[key];
      }
    }
    return def;
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    window.dispatchEvent(new CustomEvent('wahab-portfolio-update', { detail: this.data }));
  }

  get(path) {
    const parts = path.split('.');
    let cur = this.data;
    for (const p of parts) cur = cur[p];
    return cur;
  }

  set(path, value) {
    const parts = path.split('.');
    let cur = this.data;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
    this.save();
  }

  push(path, item) {
    const arr = this.get(path);
    arr.push(item);
    this.save();
  }

  splice(path, index, count) {
    const arr = this.get(path);
    arr.splice(index, count);
    this.save();
  }

  move(path, fromIndex, toIndex) {
    const arr = this.get(path);
    const [removed] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, removed);
    this.save();
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.clone(DEFAULTS);
    this.save();
    return this.data;
  }

  export() {
    return JSON.stringify(this.data, null, 2);
  }

  import(json) {
    try {
      const parsed = JSON.parse(json);
      this.data = this.mergeDefaults(this.clone(DEFAULTS), parsed);
      this.save();
      return true;
    } catch (e) {
      return false;
    }
  }
}

const store = new Storage();
