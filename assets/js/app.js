/* ================================================================
   Wahab Ahmad Portfolio — Main Application Logic
   Reads from localStorage via store, renders everything live.
   ================================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Format helper for numbers with suffix
function fmtStat(stat) {
  return `${stat.value}${stat.suffix}`;
}

// Escape HTML
function esc(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/* ----------------------------------------------------------------
   Theme / Dark mode
   ---------------------------------------------------------------- */
const THEME_KEY = 'wahab_theme';
const htmlEl = document.documentElement;
const themeToggle = $('#themeToggle');

function applyTheme(theme) {
  if (theme === 'light') {
    htmlEl.classList.add('light');
    themeToggle.textContent = '☀️';
    localStorage.setItem(THEME_KEY, 'light');
  } else {
    htmlEl.classList.remove('light');
    themeToggle.textContent = '🌓';
    localStorage.setItem(THEME_KEY, 'dark');
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const defaultDark = store.get('settings.darkModeDefault');
  if (saved) {
    applyTheme(saved);
  } else {
    applyTheme(defaultDark ? 'dark' : 'light');
  }
}

themeToggle.addEventListener('click', () => {
  const isLight = htmlEl.classList.contains('light');
  applyTheme(isLight ? 'dark' : 'light');
});

/* ----------------------------------------------------------------
   Navbar scroll state
   ---------------------------------------------------------------- */
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

/* ----------------------------------------------------------------
   Mobile menu overlay
   ---------------------------------------------------------------- */
const mobileMenuBtn = $('#mobileMenuBtn');
const navOverlay = $('#navOverlay');
const navClose = $('#navClose');
const overlayLinks = $$('#overlayLinks a');

mobileMenuBtn.addEventListener('click', () => navOverlay.classList.add('open'));
navClose.addEventListener('click', () => navOverlay.classList.remove('open'));
overlayLinks.forEach((a) => a.addEventListener('click', () => navOverlay.classList.remove('open')));
navOverlay.addEventListener('click', (e) => {
  if (e.target === navOverlay) navOverlay.classList.remove('open');
});

/* ----------------------------------------------------------------
   Custom cursor (desktop only)
   ---------------------------------------------------------------- */
const cursorDot = $('.cursor-dot');
const cursorOutline = $('.cursor-outline');

if (window.matchMedia('(hover: hover)').matches) {
  document.body.classList.add('cursor-active');
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    cursorOutline.animate(
      { left: `${posX}px`, top: `${posY}px` },
      { duration: 500, fill: 'forwards' }
    );
  });

  $$('a, button, .btn, .filter-btn, .service-card, .skill-card, .portfolio-item, .testimonial-card, .why-card').forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ----------------------------------------------------------------
   Preloader
   ---------------------------------------------------------------- */
window.addEventListener('load', () => {
  const preloader = $('#preloader');
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 900);
});

/* ----------------------------------------------------------------
   Render Hero
   ---------------------------------------------------------------- */
function renderHero() {
  const content = store.get('siteContent');
  const target = $('.typing-target');
  const tagline = $('#heroTagline');
  const social = $('#heroSocial');
  const profile = $('#heroProfile');

  // Tagline
  if (tagline) tagline.textContent = content.tagline;

  // Typing effect rotating roles
  const roles = content.roles;
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = roles[roleIndex];
    if (isDeleting) {
      target.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      target.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let nextDelay = isDeleting ? 40 : 100;

    if (!isDeleting && charIndex === current.length) {
      nextDelay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      nextDelay = 500;
    }

    setTimeout(type, nextDelay);
  }

  type();

  // Social icons
  if (social) {
    const networks = [
      { key: 'facebook', label: 'Facebook', icon: 'f' },
      { key: 'instagram', label: 'Instagram', icon: 'camera' },
      { key: 'twitter', label: 'Twitter', icon: 'X' },
      { key: 'linkedin', label: 'LinkedIn', icon: 'in' },
      { key: 'behance', label: 'Behance', icon: 'B' },
      { key: 'whatsapp', label: 'WhatsApp', icon: '☎' }
    ];
    social.innerHTML = networks.map((n) => {
      const href = content.social[n.key] || '#';
      return `<a href="${href}" target="_blank" rel="noopener" title="${esc(n.label)}">${esc(n.icon)}</a>`;
    }).join('');
  }

  // Profile photo
  if (profile) {
    if (content.profilePhoto) {
      profile.innerHTML = `<img src="${esc(content.profilePhoto)}" alt="Profile" loading="lazy" />`;
    } else {
      profile.innerHTML = `<div class="placeholder-fallback">Your photo goes here<br><span style="font-size:0.8rem; opacity:0.7;">Upload from admin panel</span></div>`;
    }
  }
}

/* ----------------------------------------------------------------
   Render Stats
   ---------------------------------------------------------------- */
function renderStats() {
  const grid = $('#statsGrid');
  if (!grid) return;
  const stats = store.get('siteContent.stats');
  grid.innerHTML = stats.map((s, i) => `
    <div class="stat-item reveal delay-${(i % 3) + 1}">
      <span class="stat-number" data-target="${s.value}">0</span>
      <span class="stat-label">${esc(s.label)}</span>
    </div>
  `).join('');

  // Animated counters
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target.querySelector('.stat-number');
        const target = +el.dataset.target;
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target + (el.parentElement.querySelector('.stat-label') ? '' : '');
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, 16);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  grid.children.forEach((child) => observer.observe(child));
}

/* ----------------------------------------------------------------
   Render About
   ---------------------------------------------------------------- */
function renderAbout() {
  const content = store.get('siteContent');
  const aboutContent = $('#aboutContent');
  const frame = $('#aboutImageFrame');
  const resume = $('#resumeDownload');

  if (aboutContent) {
    // Split about text into paragraphs
    const paras = content.about.split('\n').filter(p => p.trim());
    aboutContent.innerHTML = paras.map(p => `<p>${esc(p)}</p>`).join('');
  }

  if (frame) {
    if (content.profilePhoto) {
      frame.innerHTML = `<img src="${esc(content.profilePhoto)}" alt="About" loading="lazy" />`;
      frame.classList.remove('placeholder');
    } else {
      frame.innerHTML = `<div class="placeholder">Your photo goes here<br><span style="font-size:0.8rem; opacity:0.7;">Upload from admin panel</span></div>`;
      frame.classList.add('placeholder');
    }
  }

  if (resume) resume.href = content.resumeUrl || '#';
}

/* ----------------------------------------------------------------
   Render Services
   ---------------------------------------------------------------- */
function renderServices() {
  const grid = $('#servicesGrid');
  if (!grid) return;
  const services = store.get('services');
  const icons = {
    layout: '🎨',
    code: '💻',
    palette: '🎨',
    users: '👥',
    phone: '📱'
  };
  grid.innerHTML = services.map((s) => `
    <div class="service-card reveal" id="service-${s.id}">
      <div class="icon-box">${icons[s.icon] || '🎨'}</div>
      <h4>${esc(s.title)}</h4>
      <p>${esc(s.description)}</p>
      <ul>${s.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   Render Skills
   ---------------------------------------------------------------- */
function renderSkills() {
  const grid = $('#skillsGrid');
  if (!grid) return;
  const skills = store.get('skills');
  grid.innerHTML = skills.map((s, i) => `
    <div class="skill-card reveal delay-${(i % 3) + 1}" id="skill-${s.id}">
      <div class="skill-header">
        <span class="name">${esc(s.name)}</span>
        <span class="percent">${s.value}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-progress" data-width="${s.value}"></div>
      </div>
    </div>
  `).join('');

  // Animate skill bars on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target.querySelector('.skill-progress');
        bar.style.width = `${bar.dataset.width}%`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  grid.children.forEach((child) => observer.observe(child));
}

/* ----------------------------------------------------------------
   Render Portfolio
   ---------------------------------------------------------------- */
function renderPortfolio() {
  const grid = $('#portfolioGrid');
  if (!grid) return;
  const projects = store.get('projects').sort((a, b) => a.order - b.order);
  const categories = ['All', ...new Set(projects.map(p => p.category))];

  // Render filter buttons
  const filters = $('#portfolioFilters');
  filters.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-filter="${esc(cat)}">${esc(cat)}</button>
  `).join('');

  function renderItems(filterCat) {
    const filtered = filterCat === 'All'
      ? projects
      : projects.filter(p => p.category === filterCat);
    grid.innerHTML = filtered.map((p) => `
      <div class="portfolio-item reveal" data-id="${p.id}">
        <div class="sample-tag">Sample</div>
        <img class="bg-img" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />
        <div class="portfolio-content">
          <span class="portfolio-category">${esc(p.category)}</span>
          <h3 class="portfolio-title">${esc(p.title)}</h3>
          <p class="portfolio-description">${esc(p.description)}</p>
        </div>
      </div>
    `).join('');

    // Re-attach lightbox
    $$('.portfolio-item').forEach((item) => {
      item.addEventListener('click', () => {
        const pid = item.dataset.id;
        const proj = projects.find(p => p.id === pid);
        openLightbox(proj);
      });
    });
  }

  renderItems('All');

  $$('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderItems(btn.dataset.filter);
    });
  });
}

/* ----------------------------------------------------------------
   Lightbox
   ---------------------------------------------------------------- */
const lightbox = $('#lightbox');
const lightboxClose = $('#lightboxClose');

function openLightbox(proj) {
  $('#lightboxImage').src = proj.image;
  $('#lightboxImage').alt = esc(proj.title);
  $('#lightboxCategory').textContent = esc(proj.category);
  $('#lightboxTitle').textContent = esc(proj.title);
  $('#lightboxDescription').textContent = esc(proj.description);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ----------------------------------------------------------------
   Render Process
   ---------------------------------------------------------------- */
function renderProcess() {
  const grid = $('#processGrid');
  if (!grid) return;
  const steps = [
    { num: '01', title: 'Your Idea & Discussion', desc: 'We talk about your idea, goals, and requirements. You explain it — I listen and plan.' },
    { num: '02', title: 'Design Concept', desc: 'I create design concepts using Photoshop, Illustrator, Figma, or Adobe XD until you love the direction.' },
    { num: '03', title: 'Building / Development', desc: 'I build your website from scratch with HTML, CSS3, Python, and Next.js — fully custom, no templates.' },
    { num: '04', title: 'Revisions', desc: 'We review together and refine. I make revisions until the design and site match your demands exactly.' },
    { num: '05', title: 'Final Delivery & Launch', desc: 'I deliver your final design files or launch your website. Total time: 2 to 4 weeks.' }
  ];
  grid.innerHTML = steps.map((s, i) => `
    <div class="process-step reveal delay-${i + 1}">
      <div class="number">${s.num}</div>
      <h4>${esc(s.title)}</h4>
      <p>${esc(s.desc)}</p>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   Render Timeline (Experience / Education / Certificates)
   ---------------------------------------------------------------- */
function renderTimeline() {
  const tl = $('#timeline');
  if (!tl) return;
  const items = [
    { date: '2024 – Present', title: 'Textile & Screen Printing', desc: '1.5 years of hands-on experience in textile design and screen printing for apparel and fabric production.' },
    { date: '2023 – 2024', title: 'Intermediate (F.A.)', desc: 'Completed F.A. (Faculty of Arts) — foundation in communication and creative studies.' },
    { date: '2021 – 2023', title: 'Matric with Computer Science', desc: 'Matriculation with Computer Science — first step into technology and design.' },
    { date: '2024', title: 'Certificate in Graphic Designing', desc: 'Professional certificate in Graphic Designing covering Photoshop, Illustrator, and design fundamentals.' }
  ];
  tl.innerHTML = items.map((item, i) => `
    <div class="timeline-item reveal delay-${(i % 3) + 1}">
      <div class="timeline-dot"></div>
      <span class="timeline-date">${esc(item.date)}</span>
      <h4>${esc(item.title)}</h4>
      <p>${esc(item.desc)}</p>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   Render Why Choose Me
   ---------------------------------------------------------------- */
function renderWhy() {
  const grid = $('#whyGrid');
  if (!grid) return;
  const items = [
    { icon: '💡', title: 'Design From Just an Idea', desc: 'You explain your idea — I design it. No brief is too rough to start from.' },
    { icon: '🎯', title: 'Fully Custom (No Templates)', desc: 'Every design and website is built from scratch, exactly to your demands.' },
    { icon: '⚡', title: 'Fast Delivery: 2–4 Weeks', desc: 'From discussion to launch, your project is delivered in just 2 to 4 weeks.' },
    { icon: '👨‍💻', title: 'Designer + Developer in One', desc: 'I handle both design and development — no handoffs, no miscommunication.' },
    { icon: '🧵', title: 'Textile & Screen Printing', desc: '1.5 years of real production experience in textile and screen printing design.' },
    { icon: '🤖', title: 'AI-Enhanced Professionalism', desc: 'I use AI tools to make every design more professional and polished.' }
  ];
  grid.innerHTML = items.map((item, i) => `
    <div class="why-card reveal delay-${(i % 3) + 1}">
      <div class="icon-box">${esc(item.icon)}</div>
      <h4>${esc(item.title)}</h4>
      <p>${esc(item.desc)}</p>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   Render Testimonials
   ---------------------------------------------------------------- */
function renderTestimonials() {
  const grid = $('#testimonialsGrid');
  if (!grid) return;
  const testimonials = store.get('testimonials');
  grid.innerHTML = testimonials.map((t, i) => `
    <div class="testimonial-card reveal delay-${(i % 3) + 1}" id="testimonial-${t.id}">
      ${t.sample ? `<div class="sample-note">Sample</div>` : ''}
      <div class="rating">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <blockquote>${esc(t.text)}</blockquote>
      <div class="author">
        <div class="author-photo">${t.photo ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" />` : esc(t.name.charAt(0))}</div>
        <div class="author-info">
          <div class="name">${esc(t.name)}</div>
          <div class="role">${esc(t.role)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   Render Contact info
   ---------------------------------------------------------------- */
function renderContact() {
  const content = store.get('siteContent');
  $('#contactLocation').textContent = content.location;
  $('#contactEmail').textContent = content.email;
  $('#contactWhatsapp').textContent = content.whatsapp;
  $('#footerEmail').textContent = content.email;
  $('#footerWhatsapp').textContent = content.whatsapp;
  $('#footerEmail').href = `mailto:${content.email}`;
  $('#footerWhatsapp').href = `https://wa.me/${content.whatsapp.replace(/\D/g, '')}` || '#';

  const whatsappFloat = $('#whatsappFloat');
  if (whatsappFloat) {
    whatsappFloat.href = `https://wa.me/${content.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Wahab Ahmad, I want a design/website.')}`;
  }

  // Social in footer and hero
  renderSocials();
}

function renderSocials() {
  const content = store.get('siteContent');
  const networks = [
    { key: 'facebook', label: 'Facebook', icon: 'f' },
    { key: 'instagram', label: 'Instagram', icon: 'camera' },
    { key: 'twitter', label: 'Twitter', icon: 'X' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'in' },
    { key: 'behance', label: 'Behance', icon: 'B' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '☎' }
  ];
  const footerSocials = $('#footerSocials');
  if (footerSocials) {
    footerSocials.innerHTML = networks.map((n) => {
      const href = content.social[n.key] || '#';
      return `<a href="${href}" target="_blank" rel="noopener" title="${esc(n.label)}">${esc(n.icon)}</a>`;
    }).join('');
  }
}

/* ----------------------------------------------------------------
   Contact form
   ---------------------------------------------------------------- */
function initContactForm() {
  const form = $('#contactForm');
  const status = $('#formStatus');
  const submitBtn = $('#submitBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const message = {
      id: 'msg_' + Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      service: formData.get('service'),
      message: formData.get('message'),
      date: new Date().toISOString(),
      read: false
    };

    const messages = store.get('messages');
    messages.push(message);
    store.set('messages', messages);

    submitBtn.textContent = 'Sent!';
    submitBtn.style.background = '#10b981';
    status.textContent = 'Thank you! Your message has been saved to my inbox.';
    status.className = 'form-status success';
    form.reset();

    setTimeout(() => {
      submitBtn.textContent = 'Send Message';
      submitBtn.style.background = '';
      status.textContent = '';
    }, 4000);
  });
}

/* ----------------------------------------------------------------
   Section visibility control
   ---------------------------------------------------------------- */
function applySectionVisibility() {
  const vis = store.get('sectionVisibility');
  const map = {
    navbar: $('#navbar'),
    hero: $('#home'),
    stats: $('#stats'),
    about: $('#about'),
    services: $('#services'),
    skills: $('#skills'),
    portfolio: $('#portfolio'),
    process: $('#process'),
    experience: $('#experience'),
    why: $('#why'),
    testimonials: $('#testimonials'),
    contact: $('#contact'),
    footer: $('footer')
  };
  for (const key in map) {
    const el = map[key];
    if (el) {
      if (vis[key]) el.classList.remove('section-hidden');
      else el.classList.add('section-hidden');
    }
  }
}

/* ----------------------------------------------------------------
   Accent colors + fonts
   ---------------------------------------------------------------- */
function applyThemeCustomization() {
  const settings = store.get('settings');
  const root = document.documentElement;
  root.style.setProperty('--accent-start', settings.accentStart);
  root.style.setProperty('--accent-end', settings.accentEnd);

  if (settings.primaryFont) {
    root.style.setProperty('--primaryFont', settings.primaryFont);
  }
}

/* ----------------------------------------------------------------
   Init everything
   ---------------------------------------------------------------- */
function init() {
  initTheme();
  renderHero();
  renderStats();
  renderAbout();
  renderServices();
  renderSkills();
  renderPortfolio();
  renderProcess();
  renderTimeline();
  renderWhy();
  renderTestimonials();
  renderContact();
  initContactForm();
  applySectionVisibility();
  applyThemeCustomization();

  // Listen for live updates from admin panel
  window.addEventListener('wahab-portfolio-update', () => {
    renderHero();
    renderStats();
    renderAbout();
    renderServices();
    renderSkills();
    renderPortfolio();
    renderProcess();
    renderTimeline();
    renderWhy();
    renderTestimonials();
    renderContact();
    applySectionVisibility();
    applyThemeCustomization();
  });
}

// Reveal on scroll
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  initReveal();
});
