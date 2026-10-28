/* ================================================================
   Wahab Ahmad Portfolio — Admin Panel Logic
   ================================================================ */

const app = (() => {
  let currentSection = 'dashboard';
  let editingProjectId = null;
  let editingServiceId = null;
  let editingTestimonialId = null;

  // ----------------------------------------------------------------
  // Init
  // ----------------------------------------------------------------
  function init() {
    checkAuth();
    setupLogin();
    setupLogout();
    setupNav();
    setupSectionControl();
    setupThemeForm();
    setupSettingsForm();
    setupImport();
    renderDashboard();
    renderBadges();
  }

  // ----------------------------------------------------------------
  // Auth
  // ----------------------------------------------------------------
  function checkAuth() {
    const login = document.getElementById('adminLogin');
    const main = document.getElementById('adminMain');
    if (sessionStorage.getItem('wahab_admin_authed') === 'true') {
      login.classList.add('hidden');
      main.classList.remove('hidden');
      openSection('dashboard');
    } else {
      login.classList.remove('hidden');
      main.classList.add('hidden');
    }
  }

  function setupLogin() {
    const form = document.getElementById('loginForm');
    const error = document.getElementById('loginError');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = form.elements.password.value;
      const correct = store.get('settings.adminPassword');
      if (pw === correct) {
        sessionStorage.setItem('wahab_admin_authed', 'true');
        error.textContent = '';
        checkAuth();
      } else {
        error.textContent = 'Incorrect password. Try admin123.';
      }
    });
  }

  function setupLogout() {
    document.getElementById('adminLogout').addEventListener('click', () => {
      sessionStorage.removeItem('wahab_admin_authed');
      checkAuth();
    });
  }

  // ----------------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------------
  function setupNav() {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        if (section) openSection(section);
      });
    });
  }

  function openSection(section) {
    currentSection = section;

    // Update nav active states
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Hide all views, show selected
    document.querySelectorAll('.admin-view').forEach((v) => v.classList.add('hidden'));
    const view = document.getElementById(`view${section.charAt(0).toUpperCase() + section.slice(1)}`);
    if (view) view.classList.remove('hidden');

    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      projects: 'Portfolio Projects',
      content: 'Content Editor',
      services: 'Services Manager',
      skills: 'Skills Manager',
      testimonials: 'Testimonials Manager',
      messages: 'Messages Inbox',
      theme: 'Theme Customizer',
      sections: 'Section Control',
      settings: 'Settings & Backup'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;
    document.getElementById('pageSubtitle').textContent = 'Manage your portfolio website content';

    // Render view
    if (section === 'dashboard') renderDashboard();
    if (section === 'projects') renderProjects();
    if (section === 'content') renderContentForm();
    if (section === 'services') renderServicesTable();
    if (section === 'skills') renderSkillsTable();
    if (section === 'testimonials') renderTestimonialsTable();
    if (section === 'messages') renderMessages();
    if (section === 'theme') renderThemeForm();
    if (section === 'sections') renderSectionControl();
    if (section === 'settings') renderSettingsForm();

    renderBadges();

    // Close sidebar on mobile
    const sidebar = document.querySelector('.admin-sidebar');
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  }

  // ----------------------------------------------------------------
  // Badges
  // ----------------------------------------------------------------
  function renderBadges() {
    const projects = store.get('projects').length;
    const testimonials = store.get('testimonials').length;
    const messages = store.get('messages').length;
    const unread = store.get('messages').filter(m => !m.read).length;

    const el = (id, val) => {
      const e = document.getElementById(id);
      if (e) e.textContent = val;
    };
    el('badgeProjects', projects);
    el('badgeTestimonials', testimonials);
    el('badgeMessages', unread > 0 ? unread : 0);
    el('badgeDashboard', projects + testimonials + messages);
  }

  // ----------------------------------------------------------------
  // Dashboard
  // ----------------------------------------------------------------
  function renderDashboard() {
    document.getElementById('dashProjects').textContent = store.get('projects').length;
    document.getElementById('dashMessages').textContent = store.get('messages').length;
    document.getElementById('dashServices').textContent = store.get('services').length;
    document.getElementById('dashTestimonials').textContent = store.get('testimonials').length;
  }

  // ----------------------------------------------------------------
  // Content Editor
  // ----------------------------------------------------------------
  function renderContentForm() {
    const c = store.get('siteContent');
    const form = document.getElementById('contentForm');
    const saved = document.getElementById('contentSaved');

    form.elements.siteName.value = c.name || '';
    form.elements.tagline.value = c.tagline || '';
    form.elements.roles.value = (c.roles || []).join(', ');
    form.elements.about.value = c.about || '';

    const stats = c.stats || [];
    for (let i = 0; i < 4; i++) {
      const s = stats[i] || {};
      form.elements[`stat${i + 1}Label`].value = s.label || '';
      form.elements[`stat${i + 1}Value`].value = s.value || '';
      form.elements[`stat${i + 1}Suffix`].value = s.suffix || '';
    }

    form.elements.email.value = c.email || '';
    form.elements.whatsapp.value = c.whatsapp || '';
    form.elements.location.value = c.location || '';
    form.elements.resumeUrl.value = c.resumeUrl || '';
    form.elements.seoTitle.value = c.seoTitle || '';
    form.elements.seoDescription.value = c.seoDescription || '';

    saved.classList.add('hidden');

    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      const stats = [
        { label: fd.get('stat1Label'), value: fd.get('stat1Value'), suffix: fd.get('stat1Suffix') },
        { label: fd.get('stat2Label'), value: fd.get('stat2Value'), suffix: fd.get('stat2Suffix') },
        { label: fd.get('stat3Label'), value: fd.get('stat3Value'), suffix: fd.get('stat3Suffix') },
        { label: fd.get('stat4Label'), value: fd.get('stat4Value'), suffix: fd.get('stat4Suffix') }
      ];

      const roles = fd.get('roles')
        .split(',')
        .map(r => r.trim())
        .filter(r => r);

      const updates = {
        'siteContent.name': fd.get('siteName'),
        'siteContent.tagline': fd.get('tagline'),
        'siteContent.roles': roles,
        'siteContent.about': fd.get('about'),
        'siteContent.stats': stats,
        'siteContent.email': fd.get('email'),
        'siteContent.whatsapp': fd.get('whatsapp'),
        'siteContent.location': fd.get('location'),
        'siteContent.resumeUrl': fd.get('resumeUrl'),
        'siteContent.seoTitle': fd.get('seoTitle'),
        'siteContent.seoDescription': fd.get('seoDescription')
      };

      for (const [path, val] of Object.entries(updates)) {
        store.set(path, val);
      }

      saved.classList.remove('hidden');
      setTimeout(() => saved.classList.add('hidden'), 2500);
    };
  }

  // ----------------------------------------------------------------
  // Projects CRUD
  // ----------------------------------------------------------------
  function renderProjects() {
    const body = document.getElementById('projectsTableBody');
    const empty = document.getElementById('projectsEmpty');
    const projects = store.get('projects').sort((a, b) => a.order - b.order);

    if (projects.length === 0) {
      body.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    body.innerHTML = projects.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <img src="${p.image}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.1);" onerror="this.src='assets/img/placeholder.svg'" />
        </td>
        <td>${esc(p.title)}</td>
        <td><span style="font-size:0.8rem;padding:2px 8px;border-radius:4px;background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);">${esc(p.category)}</span></td>
        <td>${p.order}</td>
        <td>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;" onclick="app.editProject('${p.id}')">Edit</button>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:#ef4444;" onclick="app.deleteProject('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function openProjectModal(id = null) {
    editingProjectId = id;
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    const saved = document.getElementById('projectSaved');
    saved.classList.add('hidden');

    if (id) {
      const p = store.get('projects').find(x => x.id === id);
      title.textContent = 'Edit Project';
      form.elements.id.value = p.id;
      form.elements.title.value = p.title;
      form.elements.category.value = p.category;
      form.elements.description.value = p.description;
      form.elements.image.value = p.image;
      form.elements.order.value = p.order;
    } else {
      title.textContent = 'Add Project';
      form.reset();
      form.elements.id.value = '';
      form.elements.order.value = 0;
    }

    modal.classList.remove('hidden');

    form.onsubmit = (e) => {
      e.preventDefault();
      const project = {
        id: form.elements.id.value || 'p_' + Date.now(),
        title: form.elements.title.value,
        category: form.elements.category.value,
        description: form.elements.description.value,
        image: form.elements.image.value,
        order: parseInt(form.elements.order.value) || 0,
        featured: false
      };

      const projects = store.get('projects');
      if (editingProjectId) {
        const idx = projects.findIndex(x => x.id === editingProjectId);
        if (idx >= 0) projects[idx] = project;
      } else {
        projects.push(project);
      }
      store.set('projects', projects);
      renderProjects();
      renderBadges();
      closeProjectModal();
    };
  }

  function closeProjectModal() {
    document.getElementById('projectModal').classList.add('hidden');
    editingProjectId = null;
  }

  function editProject(id) { openProjectModal(id); }

  function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    const projects = store.get('projects').filter(x => x.id !== id);
    store.set('projects', projects);
    renderProjects();
    renderBadges();
  }

  // ----------------------------------------------------------------
  // Services CRUD
  // ----------------------------------------------------------------
  function renderServicesTable() {
    const body = document.getElementById('servicesTableBody');
    const services = store.get('services');
    body.innerHTML = services.map((s) => `
      <tr>
        <td>${esc(s.icon)}</td>
        <td>${esc(s.title)}</td>
        <td>${esc(s.description)}</td>
        <td>${(s.includes || []).join(', ')}</td>
        <td>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;" onclick="app.editService('${s.id}')">Edit</button>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:#ef4444;" onclick="app.deleteService('${s.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function openServiceModal(id = null) {
    editingServiceId = id;
    const modal = document.getElementById('serviceModal');
    const form = document.getElementById('serviceForm');
    const title = document.getElementById('serviceModalTitle');
    savedHide('serviceSaved');

    if (id) {
      const s = store.get('services').find(x => x.id === id);
      title.textContent = 'Edit Service';
      form.elements.id.value = s.id;
      form.elements.title.value = s.title;
      form.elements.icon.value = s.icon;
      form.elements.description.value = s.description;
      form.elements.includes.value = (s.includes || []).join(', ');
    } else {
      title.textContent = 'Add Service';
      form.reset();
      form.elements.id.value = '';
      form.elements.icon.value = '🎨';
    }

    modal.classList.remove('hidden');

    form.onsubmit = (e) => {
      e.preventDefault();
      const service = {
        id: form.elements.id.value || 's_' + Date.now(),
        title: form.elements.title.value,
        icon: form.elements.icon.value,
        description: form.elements.description.value,
        includes: form.elements.includes.value.split(',').map(i => i.trim()).filter(i => i)
      };
      const services = store.get('services');
      if (editingServiceId) {
        const idx = services.findIndex(x => x.id === editingServiceId);
        if (idx >= 0) services[idx] = service;
      } else {
        services.push(service);
      }
      store.set('services', services);
      renderServicesTable();
      closeServiceModal();
    };
  }

  function closeServiceModal() { document.getElementById('serviceModal').classList.add('hidden'); editingServiceId = null; }
  function editService(id) { openServiceModal(id); }
  function deleteService(id) {
    if (!confirm('Delete this service?')) return;
    store.set('services', store.get('services').filter(x => x.id !== id));
    renderServicesTable();
  }

  // ----------------------------------------------------------------
  // Skills
  // ----------------------------------------------------------------
  function renderSkillsTable() {
    const body = document.getElementById('skillsTableBody');
    const skills = store.get('skills');
    body.innerHTML = skills.map((s, i) => `
      <tr>
        <td>
          <input type="text" class="skill-edit" value="${esc(s.name)}" data-id="${s.id}" data-field="name" />
        </td>
        <td>
          <select class="skill-edit" data-id="${s.id}" data-field="category">
            <option value="Design" ${s.category === 'Design' ? 'selected' : ''}>Design</option>
            <option value="UI/UX" ${s.category === 'UI/UX' ? 'selected' : ''}>UI/UX</option>
            <option value="Development" ${s.category === 'Development' ? 'selected' : ''}>Development</option>
          </select>
        </td>
        <td>
          <div class="skill-slider-wrap">
            <input type="range" class="skill-slider" min="0" max="100" value="${s.value}" data-id="${s.id}" />
            <span class="skill-val">${s.value}%</span>
          </div>
        </td>
        <td>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:#ef4444;" onclick="app.deleteSkill('${s.id}')">Delete</button>
        </td>
      </tr>
    `).join('');

    // Wire up sliders
    document.querySelectorAll('.skill-slider').forEach((inp) => {
      const valSpan = inp.parentElement.querySelector('.skill-val');
      inp.addEventListener('input', () => {
        valSpan.textContent = `${inp.value}%`;
      });
    });

    // Wire up text/select changes -> debounced save
    const saveSkillsDebounced = debounce(() => {
      const skills = [];
      document.querySelectorAll('.skill-slider-wrap').forEach((wrap, i) => {
        const row = wrap.closest('tr');
        const id = wrap.querySelector('.skill-slider').dataset.id;
        const nameInput = row.querySelector('input[data-field="name"]');
        const catSelect = row.querySelector('select[data-field="category"]');
        const slider = row.querySelector('.skill-slider');
        skills.push({
          id,
          name: nameInput.value,
          category: catSelect.value,
          value: parseInt(slider.value) || 0
        });
      });
      store.set('skills', skills);
    }, 400);

    document.querySelectorAll('.skill-edit').forEach((el) => {
      el.addEventListener('change', saveSkillsDebounced);
      el.addEventListener('input', saveSkillsDebounced);
    });
    document.querySelectorAll('.skill-slider').forEach((el) => {
      el.addEventListener('input', saveSkillsDebounced);
    });
  }

  function addSkillRow() {
    const skills = store.get('skills');
    skills.push({ id: 'sk_' + Date.now(), name: 'New Skill', category: 'Design', value: 50 });
    store.set('skills', skills);
    renderSkillsTable();
  }

  function deleteSkill(id) {
    if (!confirm('Delete this skill?')) return;
    store.set('skills', store.get('skills').filter(x => x.id !== id));
    renderSkillsTable();
  }

  function saveSkills() {
    // Skills save automatically via debounce; this is a manual trigger
    renderSkillsTable();
  }

  // ----------------------------------------------------------------
  // Testimonials
  // ----------------------------------------------------------------
  function renderTestimonialsTable() {
    const body = document.getElementById('testimonialsTableBody');
    const testimonials = store.get('testimonials');
    body.innerHTML = testimonials.map((t) => `
      <tr>
        <td>
          ${t.photo ? `<img src="${t.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.1);" onerror="this.src='assets/img/placeholder.svg'" />` : `<div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.1);display:grid;place-items:center;font-size:0.8rem;">${t.name.charAt(0)}</div>`}
        </td>
        <td>${esc(t.name)}</td>
        <td>${esc(t.role)}</td>
        <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(t.text)}</td>
        <td>${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</td>
        <td>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;" onclick="app.editTestimonial('${t.id}')">Edit</button>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:#ef4444;" onclick="app.deleteTestimonial('${t.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function openTestimonialModal(id = null) {
    editingTestimonialId = id;
    const modal = document.getElementById('testimonialModal');
    const form = document.getElementById('testimonialForm');
    const title = document.getElementById('testimonialModalTitle');

    if (id) {
      const t = store.get('testimonials').find(x => x.id === id);
      title.textContent = 'Edit Testimonial';
      form.elements.id.value = t.id;
      form.elements.name.value = t.name;
      form.elements.role.value = t.role;
      form.elements.text.value = t.text;
      form.elements.photo.value = t.photo || '';
      form.elements.rating.value = t.rating;
      form.elements.sample.value = t.sample;
    } else {
      title.textContent = 'Add Testimonial';
      form.reset();
      form.elements.id.value = '';
      form.elements.rating.value = 5;
      form.elements.sample.value = true;
    }

    modal.classList.remove('hidden');

    form.onsubmit = (e) => {
      e.preventDefault();
      const testimonial = {
        id: form.elements.id.value || 't_' + Date.now(),
        name: form.elements.name.value,
        role: form.elements.role.value,
        text: form.elements.text.value,
        photo: form.elements.photo.value,
        rating: parseInt(form.elements.rating.value),
        sample: form.elements.sample.value === 'true'
      };
      const testimonials = store.get('testimonials');
      if (editingTestimonialId) {
        const idx = testimonials.findIndex(x => x.id === editingTestimonialId);
        if (idx >= 0) testimonials[idx] = testimonial;
      } else {
        testimonials.push(testimonial);
      }
      store.set('testimonials', testimonials);
      renderTestimonialsTable();
      renderBadges();
      closeTestimonialModal();
    };
  }

  function closeTestimonialModal() { document.getElementById('testimonialModal').classList.add('hidden'); editingTestimonialId = null; }
  function editTestimonial(id) { openTestimonialModal(id); }
  function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial?')) return;
    store.set('testimonials', store.get('testimonials').filter(x => x.id !== id));
    renderTestimonialsTable();
    renderBadges();
  }

  // ----------------------------------------------------------------
  // Messages
  // ----------------------------------------------------------------
  function renderMessages() {
    const body = document.getElementById('messagesTableBody');
    const messages = store.get('messages').slice().reverse(); // newest first

    if (messages.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748b;">No messages yet.</td></tr>`;
      return;
    }

    body.innerHTML = messages.map((m) => `
      <tr>
        <td>${esc(m.name)}</td>
        <td>${esc(m.email)}</td>
        <td>${esc(m.service)}</td>
        <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(m.message)}</td>
        <td>${new Date(m.date).toLocaleString()}</td>
        <td>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;" onclick="app.markRead('${m.id}')">${m.read ? 'Read' : 'Unread'}</button>
          <button class="btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:#ef4444;" onclick="app.deleteMessage('${m.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function markRead(id) {
    const messages = store.get('messages');
    const m = messages.find(x => x.id === id);
    if (m) {
      m.read = true;
      store.set('messages', messages);
      renderMessages();
      renderBadges();
    }
  }

  function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    store.set('messages', store.get('messages').filter(x => x.id !== id));
    renderMessages();
    renderBadges();
  }

  function clearMessages() {
    if (!confirm('Clear all messages? This cannot be undone.')) return;
    store.set('messages', []);
    renderMessages();
    renderBadges();
  }

  // ----------------------------------------------------------------
  // Theme Customizer
  // ----------------------------------------------------------------
  function renderThemeForm() {
    const s = store.get('settings');
    const form = document.getElementById('themeForm');
    const saved = document.getElementById('themeSaved');

    form.elements.accentStart.value = s.accentStart;
    form.elements.accentEnd.value = s.accentEnd;
    form.elements.primaryFont.value = s.primaryFont;
    form.elements.darkModeDefault.value = s.darkModeDefault;
    form.elements.logo.value = s.logo || '';
    form.elements.profilePhoto.value = s.profilePhoto || '';
    form.elements.socialFacebook.value = s.social.facebook || '';
    form.elements.socialInstagram.value = s.social.instagram || '';
    form.elements.socialTwitter.value = s.social.twitter || '';
    form.elements.socialLinkedin.value = s.social.linkedin || '';
    form.elements.socialBehance.value = s.social.behance || '';
    form.elements.socialWhatsapp.value = s.social.whatsapp || '';

    saved.classList.add('hidden');

    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const updates = {
        'settings.accentStart': fd.get('accentStart'),
        'settings.accentEnd': fd.get('accentEnd'),
        'settings.primaryFont': fd.get('primaryFont'),
        'settings.darkModeDefault': fd.get('darkModeDefault') === 'true',
        'siteContent.logo': fd.get('logo'),
        'siteContent.profilePhoto': fd.get('profilePhoto'),
        'siteContent.social.facebook': fd.get('socialFacebook'),
        'siteContent.social.instagram': fd.get('socialInstagram'),
        'siteContent.social.twitter': fd.get('socialTwitter'),
        'siteContent.social.linkedin': fd.get('socialLinkedin'),
        'siteContent.social.behance': fd.get('socialBehance'),
        'siteContent.social.whatsapp': fd.get('socialWhatsapp')
      };
      for (const [path, val] of Object.entries(updates)) store.set(path, val);

      // Dispatch update so live site picks it up immediately
      window.dispatchEvent(new CustomEvent('wahab-portfolio-update', { detail: store.data }));

      saved.classList.remove('hidden');
      setTimeout(() => saved.classList.add('hidden'), 2500);
    };
  }

  function setupThemeForm() {
    // Live preview of color pickers on the admin page itself isn't needed,
    // but the form submit handler is in renderThemeForm.
  }

  // ----------------------------------------------------------------
  // Section Control
  // ----------------------------------------------------------------
  function renderSectionControl() {
    const vis = store.get('sectionVisibility');
    const list = document.getElementById('sectionList');
    const sections = [
      { key: 'navbar', label: 'Navbar', desc: 'Top navigation bar' },
      { key: 'hero', label: 'Hero', desc: 'Main hero section' },
      { key: 'stats', label: 'Stats Bar', desc: 'Animated counters' },
      { key: 'about', label: 'About Me', desc: 'About section' },
      { key: 'services', label: 'Services', desc: 'Services cards' },
      { key: 'skills', label: 'Skills & Tools', desc: 'Animated skill bars' },
      { key: 'portfolio', label: 'Portfolio', desc: 'Project gallery' },
      { key: 'process', label: 'Process', desc: '5-step process' },
      { key: 'experience', label: 'Experience & Education', desc: 'Timeline' },
      { key: 'why', label: 'Why Choose Me', desc: 'Why cards' },
      { key: 'testimonials', label: 'Testimonials', desc: 'Client reviews' },
      { key: 'contact', label: 'Contact', desc: 'Contact form' },
      { key: 'footer', label: 'Footer', desc: 'Site footer' }
    ];

    list.innerHTML = sections.map((s) => `
      <div class="section-item">
        <div class="info">
          <h4>${esc(s.label)}</h4>
          <p>${esc(s.desc)}</p>
        </div>
        <div class="toggle-switch">
          <input type="checkbox" ${vis[s.key] ? 'checked' : ''} data-key="${s.key}" />
        </div>
      </div>
    `).join('');

    list.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('change', (e) => {
        store.set(`sectionVisibility.${e.target.dataset.key}`, e.target.checked);
        window.dispatchEvent(new CustomEvent('wahab-portfolio-update', { detail: store.data }));
      });
    });
  }

  function setupSectionControl() {
    // Handled in renderSectionControl
  }

  // ----------------------------------------------------------------
  // Settings
  // ----------------------------------------------------------------
  function renderSettingsForm() {
    const form = document.getElementById('settingsForm');
    const saved = document.getElementById('settingsSaved');
    saved.classList.add('hidden');

    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const current = fd.get('currentPassword');
      const correct = store.get('settings.adminPassword');
      if (current !== correct) {
        alert('Current password is incorrect.');
        return;
      }
      const newPw = fd.get('newPassword');
      const confirmPw = fd.get('confirmPassword');
      if (newPw !== confirmPw) {
        alert('New passwords do not match.');
        return;
      }
      store.set('settings.adminPassword', newPw);
      saved.classList.remove('hidden');
      setTimeout(() => saved.classList.add('hidden'), 2500);
      form.reset();
    };
  }

  // ----------------------------------------------------------------
  // Backup / Import / Reset
  // ----------------------------------------------------------------
  function exportBackup() {
    const json = store.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wahab-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setupImport() {
    const input = document.getElementById('importFile');
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ok = store.import(ev.target.result);
        if (ok) {
          alert('Backup imported successfully. The live site will update.');
          renderDashboard();
          renderBadges();
        } else {
          alert('Invalid backup file.');
        }
        input.value = '';
      };
      reader.readAsText(file);
    });
  }

  function resetDefaults() {
    if (!confirm('Reset everything to defaults? This cannot be undone. All your projects, content, and messages will be lost.')) return;
    if (!confirm('Are you absolutely sure?')) return;
    store.reset();
    renderDashboard();
    renderBadges();
    if (currentSection === 'projects') renderProjects();
    if (currentSection === 'services') renderServicesTable();
    if (currentSection === 'skills') renderSkillsTable();
    if (currentSection === 'testimonials') renderTestimonialsTable();
    if (currentSection === 'messages') renderMessages();
    if (currentSection === 'content') renderContentForm();
    if (currentSection === 'theme') renderThemeForm();
    if (currentSection === 'sections') renderSectionControl();
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  function esc(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function savedHide(id) {
    const e = document.getElementById(id);
    if (e) e.classList.add('hidden');
  }

  // Expose methods for inline HTML handlers
  return {
    init,
    openSection,
    openProjectModal,
    closeProjectModal,
    editProject,
    deleteProject,
    openServiceModal,
    closeServiceModal,
    editService,
    deleteService,
    addSkillRow,
    deleteSkill,
    saveSkills,
    openTestimonialModal,
    closeTestimonialModal,
    editTestimonial,
    deleteTestimonial,
    markRead,
    deleteMessage,
    clearMessages,
    exportBackup,
    resetDefaults
  };
})();

document.addEventListener('DOMContentLoaded', () => app.init());
