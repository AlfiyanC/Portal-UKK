// ============================================================
// app.js — Main Application Logic
// Portal Data Tim UKK BPS Provinsi NTB
// ============================================================

// ---- Application State ----
const App = {
  state: {
    activeTab: 'visualizations',
    searchQuery: '',
    selectedCategory: 'Semua',
    selectedYear: 'Semua',
    data: { visualizations: [], datasets: [], publications: [], presentations: [] },
    isLoading: true,
    activeChartType: 'bar',
    selectedVizIndex: 0,
    activeChartInstances: {},
  },

  // ---- Init ----
  async init() {
    this.showLoading();
    await this.loadData();
    this.renderHeroStats();
    this.buildYearFilter();
    this.setupEventListeners();
    this.renderActiveTab();
    this.hideLoading();
    this.animateCounters();
    this.initScrollEffects();
    this.updateTabCounts();
  },

  // ---- Data Loading ----
  async loadData() {
    if (CONFIG.DEMO_MODE || !CONFIG.SHEET_ID) {
      this.state.data = {
        visualizations: DEMO_DATA.visualizations,
        datasets: DEMO_DATA.datasets,
        publications: DEMO_DATA.publications,
        presentations: DEMO_DATA.presentations,
      };
      return;
    }
    try {
      this.state.data = await SheetsAPI.fetchAll();

      // Jika tab visualisasi kosong tapi ada data di tab lain (misal datasets),
      // otomatis alihkan tab aktif ke tab yang memiliki data agar halaman tidak terlihat kosong.
      const tabs = ['visualizations', 'datasets', 'publications', 'presentations'];
      const activeTabHasData = (this.state.data[this.state.activeTab] || []).length > 0;
      if (!activeTabHasData) {
        const firstWithData = tabs.find(t => (this.state.data[t] || []).length > 0);
        if (firstWithData) {
          this.state.activeTab = firstWithData;
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === firstWithData);
          });
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${firstWithData}`);
          });
        }
      }
    } catch (err) {
      console.error('Gagal memuat dari Google Sheets, beralih ke data demo:', err);
      this.state.data = {
        visualizations: DEMO_DATA.visualizations,
        datasets: DEMO_DATA.datasets,
        publications: DEMO_DATA.publications,
        presentations: DEMO_DATA.presentations,
      };
      this.showToast('Menggunakan data demo. Silakan konfigurasi Google Sheet ID.', 'info');
    }
  },

  // ---- Hero Stats ----
  renderHeroStats() {
    const { visualizations, datasets, publications, presentations } = this.state.data;
    const setCount = (id, val) => {
      const el = document.getElementById(id);
      if (el) { el.dataset.target = val; el.textContent = '0'; }
    };
    setCount('stat-datasets', datasets.filter(d => d.status !== 'draft').length);
    setCount('stat-publications', publications.filter(p => p.status !== 'draft').length);
    setCount('stat-visualizations', visualizations.filter(v => v.status !== 'draft').length);
    setCount('stat-presentations', presentations.filter(p => p.status !== 'draft').length);
  },

  animateCounters() {
    const counters = document.querySelectorAll('[data-target]');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();
      const update = (time) => {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else counter.textContent = target;
      };
      requestAnimationFrame(update);
    });
  },

  // ---- Tab Management ----
  switchTab(tabName) {
    this.state.activeTab = tabName;
    // Destroy chart instances when leaving visualizations tab
    if (tabName !== 'visualizations') {
      ChartManager.destroyAll();
    }
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
    this.renderActiveTab();
  },

  renderActiveTab() {
    switch (this.state.activeTab) {
      case 'visualizations': this.renderVisualizations(); break;
      case 'datasets': this.renderDatasets(); break;
      case 'publications': this.renderPublications(); break;
      case 'presentations': this.renderPresentations(); break;
    }
  },

  updateTabCounts() {
    const { visualizations, datasets, publications, presentations } = this.state.data;
    const setCnt = (tab, count) => {
      const el = document.querySelector(`[data-tab="${tab}"] .tab-count`);
      if (el) el.textContent = count;
    };
    setCnt('visualizations', visualizations.length);
    setCnt('datasets', datasets.length);
    setCnt('publications', publications.length);
    setCnt('presentations', presentations.length);
  },

  // ---- Filtering ----
  getFiltered(items) {
    const q = this.state.searchQuery.toLowerCase();
    return items.filter(item => {
      if (item.status === 'draft') return false;
      const matchSearch = !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.tags || '').toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q) ||
        (item.event || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);
      const matchCat = this.state.selectedCategory === 'Semua' || item.category === this.state.selectedCategory;
      const matchYear = this.state.selectedYear === 'Semua' || String(item.year) === String(this.state.selectedYear);
      return matchSearch && matchCat && matchYear;
    });
  },

  // ---- VISUALIZATIONS TAB ----
  renderVisualizations() {
    const vizData = this.getFiltered(this.state.data.visualizations);
    // Build dropdown options
    const sel = document.getElementById('viz-selector');
    if (sel) {
      const prev = sel.value;
      sel.innerHTML = vizData.map((v, i) => `<option value="${i}">${v.title}</option>`).join('');
      if (prev && sel.querySelector(`option[value="${prev}"]`)) sel.value = prev;
      else { sel.value = 0; this.state.selectedVizIndex = 0; }
    }
    // Render interactive builder
    this.renderChartBuilder(vizData);
    // Render static charts grid
    this.renderStaticCharts(vizData);
  },

  renderChartBuilder(vizData) {
    const builder = document.querySelector('.chart-builder');
    if (!vizData.length) {
      if (builder) builder.style.display = 'none';
      return;
    }
    if (builder) builder.style.display = '';

    const idx = Math.min(this.state.selectedVizIndex, vizData.length - 1);
    const viz = vizData[idx];
    if (!viz) return;

    const titleEl = document.getElementById('builder-chart-title');
    const descEl = document.getElementById('builder-chart-desc');
    if (titleEl) titleEl.textContent = viz.title;
    if (descEl) descEl.textContent = viz.description;

    // Update chart type buttons state
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === this.state.activeChartType);
    });

    // Render chart
    setTimeout(() => {
      ChartManager.render('builder-chart', viz, this.state.activeChartType);
    }, 50);
  },

  renderStaticCharts(vizData) {
    const grid = document.getElementById('static-charts-grid');
    if (!grid) return;
    if (!vizData.length) {
      grid.innerHTML = this.emptyState(
        iconBarChart(36),
        'Belum ada data visualisasi',
        'Tab "visualizations" pada Google Sheet Anda belum memiliki baris data grafik. Anda dapat menambahkan data visualisasi di Google Sheet atau menjelajahi tab Dataset.'
      );
      return;
    }
    grid.innerHTML = vizData.map((viz, i) => this.createChartCard(viz, i)).join('');
    // Render chart.js in each card
    setTimeout(() => {
      vizData.forEach((viz, i) => {
        ChartManager.render(`static-chart-${viz.id}`, viz);
      });
    }, 100);
  },

  createChartCard(viz, idx) {
    const typeLabel = CONFIG.CHART_TYPES.find(t => t.id === viz.chart_type)?.label || viz.chart_type;
    const tags = viz.tags ? viz.tags.split(',').map(t => t.trim()).slice(0, 3) : [];
    return `
    <div class="chart-card" data-id="${viz.id}">
      <div class="chart-card-header">
        <div class="chart-card-meta">
          <span class="chart-category-badge">${viz.category || 'Umum'}</span>
          <span class="chart-year-badge">${iconCalendar(12)} ${viz.year}</span>
          ${viz.featured ? `<span class="badge badge-featured">${iconStar(12)} Unggulan</span>` : ''}
        </div>
        <h3 class="chart-card-title">${viz.title}</h3>
        <p class="chart-card-desc">${viz.description}</p>
      </div>
      <div class="chart-card-body">
        <canvas id="static-chart-${viz.id}"></canvas>
      </div>
      <div class="chart-card-footer">
        <div class="chart-tags">
          ${tags.map(t => `<span class="chart-tag">#${t}</span>`).join('')}
        </div>
        <button class="btn btn-secondary" style="font-size:12px;padding:6px 12px;" onclick="App.downloadChart('static-chart-${viz.id}', '${viz.title}')">
          ${iconDownload(14)} Unduh
        </button>
      </div>
    </div>`;
  },

  downloadChart(canvasId, title) {
    ChartManager.exportPNG(canvasId, title.replace(/\s+/g, '-').toLowerCase());
    this.showToast('Chart berhasil diunduh sebagai PNG!', 'success');
  },

  // ---- DATASETS TAB ----
  renderDatasets() {
    const items = this.getFiltered(this.state.data.datasets);
    const grid = document.getElementById('datasets-grid');
    if (!grid) return;
    const featured = items.filter(i => i.featured);
    const rest = items.filter(i => !i.featured);
    grid.innerHTML = '';
    if (!items.length) { grid.innerHTML = this.emptyState(iconFolder(32), 'Tidak ada dataset ditemukan', 'Coba ubah kata kunci atau filter pencarian.'); return; }
    const sorted = [...featured, ...rest];
    grid.innerHTML = sorted.map(item => this.createDatasetCard(item)).join('');
  },

  createDatasetCard(item) {
    const tags = item.tags ? item.tags.split(',').map(t => t.trim()).slice(0, 3) : [];
    const fileType = detectFileType(item, 'XLSX');
    const typeClass = `badge-type-${fileType.toLowerCase()}`;
    const hasUrl = isValidUrl(item.file_url);
    return `
    <div class="content-card ${item.featured ? 'featured' : ''}" data-id="${item.id}">
      <div class="card-top">
        <div class="card-badges">
          ${item.featured ? `<span class="badge badge-featured">${iconStar(12)} Unggulan</span>` : ''}
          <span class="badge badge-category">${item.category || 'Umum'}</span>
          <span class="badge ${typeClass}">${fileType}</span>
        </div>
        <div class="card-icon card-icon-dataset">${iconFolder(24)}</div>
      </div>
      <h3 class="card-title">${item.title || item.description || 'Dataset Tanpa Judul'}</h3>
      <p class="card-desc">${item.description}</p>
      <div class="card-meta">
        <span class="card-meta-item">${iconCalendar(13)} ${item.year}</span>
        ${item.file_size ? `<span class="card-meta-item">${iconFile(13)} ${item.file_size}</span>` : ''}
      </div>
      ${tags.length ? `<div class="card-tags">${tags.map(t => `<span class="card-tag">#${t}</span>`).join('')}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="App.openModal(${item.id}, 'datasets')">
          ${iconEye(14)} Detail
        </button>
        <a href="${hasUrl ? item.file_url : '#'}" target="_blank" rel="noopener" class="btn btn-primary" ${hasUrl ? '' : 'onclick="return App.handleNoLink(event)"'}>
          ${iconDownload(14)} Unduh
        </a>
      </div>
    </div>`;
  },

  // ---- PUBLICATIONS TAB ----
  renderPublications() {
    const items = this.getFiltered(this.state.data.publications);
    const grid = document.getElementById('publications-grid');
    if (!grid) return;
    if (!items.length) { grid.innerHTML = this.emptyState(iconFileText(32), 'Tidak ada publikasi ditemukan', 'Coba ubah kata kunci atau filter pencarian.'); return; }
    const sorted = [...items.filter(i => i.featured), ...items.filter(i => !i.featured)];
    grid.innerHTML = sorted.map(item => this.createPublicationCard(item)).join('');
  },

  createPublicationCard(item) {
    const tags = item.tags ? item.tags.split(',').map(t => t.trim()).slice(0, 3) : [];
    const fileType = detectFileType(item, 'PDF');
    const typeClass = `badge-type-${fileType.toLowerCase()}`;
    const hasUrl = isValidUrl(item.file_url);
    return `
    <div class="content-card ${item.featured ? 'featured' : ''}">
      <div class="card-top">
        <div class="card-badges">
          ${item.featured ? `<span class="badge badge-featured">${iconStar(12)} Unggulan</span>` : ''}
          <span class="badge badge-category">${item.category || 'Umum'}</span>
          <span class="badge ${typeClass}">${fileType}</span>
        </div>
        <div class="card-icon card-icon-publication">${iconFileText(24)}</div>
      </div>
      <h3 class="card-title">${item.title}</h3>
      ${item.author ? `<p class="card-author">${iconPen(12)} ${item.author}</p>` : ''}
      <p class="card-desc">${item.description}</p>
      <div class="card-meta">
        <span class="card-meta-item">${iconCalendar(13)} ${item.year}</span>
      </div>
      ${tags.length ? `<div class="card-tags">${tags.map(t => `<span class="card-tag">#${t}</span>`).join('')}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="App.openModal(${item.id}, 'publications')">
          ${iconEye(14)} Detail
        </button>
        <a href="${hasUrl ? item.file_url : '#'}" target="_blank" rel="noopener" class="btn btn-primary" ${hasUrl ? '' : 'onclick="return App.handleNoLink(event)"'}>
          ${iconDownload(14)} Unduh
        </a>
      </div>
    </div>`;
  },

  // ---- PRESENTATIONS TAB ----
  renderPresentations() {
    const items = this.getFiltered(this.state.data.presentations);
    const grid = document.getElementById('presentations-grid');
    if (!grid) return;
    if (!items.length) { grid.innerHTML = this.emptyState(iconPresentation(32), 'Tidak ada bahan paparan ditemukan', 'Coba ubah kata kunci atau filter pencarian.'); return; }
    const sorted = [...items.filter(i => i.featured), ...items.filter(i => !i.featured)];
    grid.innerHTML = sorted.map(item => this.createPresentationCard(item)).join('');
  },

  createPresentationCard(item) {
    const tags = item.tags ? item.tags.split(',').map(t => t.trim()).slice(0, 3) : [];
    const fileType = detectFileType(item, 'PPTX');
    const typeClass = `badge-type-${fileType.toLowerCase()}`;
    const hasUrl = isValidUrl(item.file_url);
    return `
    <div class="content-card ${item.featured ? 'featured' : ''}">
      <div class="card-top">
        <div class="card-badges">
          ${item.featured ? `<span class="badge badge-featured">${iconStar(12)} Unggulan</span>` : ''}
          <span class="badge badge-category">${item.category || 'Umum'}</span>
          <span class="badge ${typeClass}">${fileType}</span>
        </div>
        <div class="card-icon card-icon-presentation">${fileType === 'PDF' ? iconFileText(24) : iconPresentation(24)}</div>
      </div>
      <h3 class="card-title">${item.title}</h3>
      ${item.event ? `<p class="card-author">${iconMic(12)} ${item.event}</p>` : ''}
      ${item.presenter ? `<p class="card-meta-item" style="font-size:12px;color:var(--slate-400);margin-top:4px;">${iconUser(12)} ${item.presenter}</p>` : ''}
      <p class="card-desc">${item.description}</p>
      <div class="card-meta">
        <span class="card-meta-item">${iconCalendar(13)} ${item.year}</span>
      </div>
      ${tags.length ? `<div class="card-tags">${tags.map(t => `<span class="card-tag">#${t}</span>`).join('')}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-secondary" onclick="App.openModal(${item.id}, 'presentations')">
          ${iconEye(14)} Detail
        </button>
        <a href="${hasUrl ? item.file_url : '#'}" target="_blank" rel="noopener" class="btn btn-primary" ${hasUrl ? '' : 'onclick="return App.handleNoLink(event)"'}>
          ${iconDownload(14)} Unduh
        </a>
      </div>
    </div>`;
  },

  handleNoLink(e) {
    e.preventDefault();
    this.showToast('Link file belum tersedia. Hubungi admin.', 'info');
    return false;
  },

  // ---- MODAL ----
  openModal(id, type) {
    const items = this.state.data[type];
    const item = items.find(i => String(i.id) === String(id));
    if (!item) return;
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    const titleEl = document.getElementById('modal-title');
    const categoryEl = document.getElementById('modal-category');
    if (!overlay || !body) return;

    const typeLabels = { datasets: 'Dataset', publications: 'Publikasi', presentations: 'Bahan Paparan', visualizations: 'Visualisasi' };
    categoryEl.textContent = typeLabels[type] || type;
    titleEl.textContent = item.title;

    const detectedType = detectFileType(item, type === 'datasets' ? 'XLSX' : type === 'publications' ? 'PDF' : 'PPTX');

    const fields = [];
    if (item.author) fields.push({ label: 'Penulis/Tim', value: item.author });
    if (item.event) fields.push({ label: 'Acara/Kegiatan', value: item.event });
    if (item.presenter) fields.push({ label: 'Presenter', value: item.presenter });
    if (item.description) fields.push({ label: 'Deskripsi', value: item.description });
    if (item.category) fields.push({ label: 'Kategori', value: item.category });
    if (item.year) fields.push({ label: 'Tahun', value: item.year });
    if (detectedType) fields.push({ label: 'Format File', value: detectedType });
    if (item.file_size) fields.push({ label: 'Ukuran File', value: item.file_size });
    if (item.tags) fields.push({ label: 'Tag', value: item.tags.split(',').map(t => `<span class="card-tag" style="display:inline-block;margin:2px;">#${t.trim()}</span>`).join('') });

    body.innerHTML = fields.map(f => `
      <div class="modal-field">
        <span class="modal-field-label">${f.label}</span>
        <div class="modal-field-value">${f.value}</div>
      </div>
    `).join('');

    const hasUrl = isValidUrl(item.file_url);
    const actionsEl = document.getElementById('modal-actions');
    if (actionsEl) {
      actionsEl.innerHTML = `
        <a href="${hasUrl ? item.file_url : '#'}" target="_blank" rel="noopener" class="btn btn-primary" style="flex:1;" ${hasUrl ? '' : 'onclick="return App.handleNoLink(event)"'}>
          ${iconDownload(16)} Unduh File
        </a>
        <button class="btn btn-secondary" onclick="App.copyLink('${hasUrl ? item.file_url : ''}')">
          ${iconCopy(14)} Salin Link
        </button>
      `;
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  copyLink(url) {
    if (!isValidUrl(url)) { this.showToast('Link file belum tersedia.', 'info'); return; }
    navigator.clipboard.writeText(url).then(() => this.showToast('Link berhasil disalin!', 'success'));
  },

  // ---- SEARCH & FILTER ----
  handleSearch(q) {
    this.state.searchQuery = q;
    this.renderActiveTab();
  },

  handleCategory(cat) {
    this.state.selectedCategory = cat;
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.cat === cat);
    });
    this.renderActiveTab();
  },

  handleYearFilter(year) {
    this.state.selectedYear = year;
    this.renderActiveTab();
  },

  buildYearFilter() {
    const sel = document.getElementById('year-filter');
    if (!sel) return;
    const years = [];
    for (let y = CONFIG.YEAR_END; y >= CONFIG.YEAR_START; y--) years.push(y);
    sel.innerHTML = `<option value="Semua">Semua Tahun</option>` +
      years.map(y => `<option value="${y}">${y}</option>`).join('');
  },

  // ---- CHART BUILDER CONTROLS ----
  handleVizSelect(idx) {
    this.state.selectedVizIndex = parseInt(idx, 10);
    const vizData = this.getFiltered(this.state.data.visualizations);
    this.renderChartBuilder(vizData);
  },

  handleChartType(type) {
    this.state.activeChartType = type;
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    const vizData = this.getFiltered(this.state.data.visualizations);
    this.renderChartBuilder(vizData);
  },

  // ---- UI HELPERS ----
  showLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.remove('hidden');
  },

  hideLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) {
      setTimeout(() => el.classList.add('hidden'), 400);
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = {
      success: iconCheck(16),
      error: iconX(16),
      info: iconInfo(16)
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  emptyState(icon, title, desc) {
    return `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-desc">${desc}</div>
    </div>`;
  },

  // ---- SCROLL EFFECTS ----
  initScrollEffects() {
    const nav = document.querySelector('.nav');
    const backTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 80);
      if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    if (backTop) {
      backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Intersection observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.hero-stat').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  },

  // ---- EVENT LISTENERS ----
  setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Search (hero)
    const heroInput = document.getElementById('hero-search-input');
    const heroBtn = document.getElementById('hero-search-btn');
    if (heroInput) {
      heroInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          this.handleSearch(heroInput.value);
          document.getElementById('tab-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        if (heroInput) this.handleSearch(heroInput.value);
        document.getElementById('tab-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Search in filter bar
    const filterInput = document.getElementById('filter-search-input');
    if (filterInput) {
      filterInput.addEventListener('input', debounce((e) => {
        this.handleSearch(e.target.value);
        if (heroInput) heroInput.value = e.target.value;
      }, 300));
    }

    // Category chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => this.handleCategory(chip.dataset.cat));
    });

    // Year filter
    const yearSel = document.getElementById('year-filter');
    if (yearSel) yearSel.addEventListener('change', (e) => this.handleYearFilter(e.target.value));

    // Viz selector
    const vizSel = document.getElementById('viz-selector');
    if (vizSel) vizSel.addEventListener('change', (e) => this.handleVizSelect(e.target.value));

    // Chart type buttons
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleChartType(btn.dataset.type));
    });

    // Export chart
    const exportBtn = document.getElementById('export-chart-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const vizData = this.getFiltered(this.state.data.visualizations);
        const viz = vizData[this.state.selectedVizIndex];
        this.downloadChart('builder-chart', viz?.title || 'chart-bps-ntb');
      });
    }

    // Modal
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
    }
    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    // Mobile nav toggle
    const toggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('nav-mobile');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
    }

    // Nav links scroll effect + active state
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        if (mobileNav) mobileNav.classList.remove('open');
      });
    });
  }
};

// ---- Utility Functions ----
function isValidUrl(url) {
  return !!(url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')));
}

function detectFileType(item, fallback = 'DEFAULT') {
  if (!item) return fallback.toUpperCase();

  // 1. Jika kolom file_type diisi secara manual di Google Sheet
  if (item.file_type && typeof item.file_type === 'string' && item.file_type.trim() !== '') {
    return item.file_type.trim().toUpperCase();
  }

  // 2. Deteksi dari URL file
  const rawUrl = (item.file_url || '').trim();
  if (rawUrl && rawUrl !== '#') {
    const url = rawUrl.toLowerCase();

    // Deteksi Google Docs / Sheets / Slides
    if (url.includes('docs.google.com/presentation') || url.includes('slides.google.com')) return 'PPTX';
    if (url.includes('docs.google.com/spreadsheets') || url.includes('sheets.google.com')) return 'XLSX';
    if (url.includes('docs.google.com/document')) return 'DOCX';

    // Deteksi ekstensi file langsung di URL (sebelum query ? atau fragment #)
    const cleanUrl = url.split('?')[0].split('#')[0];
    const match = cleanUrl.match(/\.([a-z0-9]{2,5})$/i);
    if (match) {
      const ext = match[1].toUpperCase();
      const extMap = {
        'PDF': 'PDF',
        'XLSX': 'XLSX',
        'XLS': 'XLSX',
        'XLSM': 'XLSX',
        'CSV': 'CSV',
        'PPTX': 'PPTX',
        'PPT': 'PPTX',
        'PPS': 'PPTX',
        'DOCX': 'DOCX',
        'DOC': 'DOCX',
        'ZIP': 'ZIP',
        'RAR': 'RAR',
        '7Z': '7Z',
        'PNG': 'PNG',
        'JPG': 'JPG',
        'JPEG': 'JPG'
      };
      if (extMap[ext]) return extMap[ext];
    }
  }

  // 3. Deteksi dari teks judul atau deskripsi jika ada indikasi nama file / format
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  if (/\b(policy\s*brief|infografis|laporan|buku|jurnal|publikasi|pedoman)\b/.test(text) || /\.pdf\b|\(pdf\)/i.test(text)) {
    return 'PDF';
  }
  if (/\b(ppt|pptx|slide|paparan|presentasi|tayang)\b/.test(text) || /\.pptx?\b|\(pptx?\)/i.test(text)) {
    return 'PPTX';
  }
  if (/\b(excel|xlsx|xls|tabel|data\s*mentah)\b/.test(text) || /\.xlsx?\b|\(xlsx?\)/i.test(text)) {
    return 'XLSX';
  }
  if (/\b(csv)\b/.test(text) || /\.csv\b|\(csv\)/i.test(text)) {
    return 'CSV';
  }
  if (/\b(word|docx|doc)\b/.test(text) || /\.docx?\b|\(docx?\)/i.test(text)) {
    return 'DOCX';
  }

  // 4. Fallback default sesuai jenis tab
  return fallback.toUpperCase();
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---- SVG Icon Helpers ----
const SVG_ATTRS = `xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;

function iconDownload(size=16) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`; }
function iconEye(size=16) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`; }
function iconCalendar(size=13) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; }
function iconFile(size=13) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`; }
function iconUser(size=13) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`; }
function iconCopy(size=14) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`; }
function iconCheck(size=16) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><polyline points="20 6 9 17 4 12"/></svg>`; }
function iconX(size=16) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`; }
function iconInfo(size=16) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`; }
function iconStar(size=13) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }
function iconFolder(size=24) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`; }
function iconFileText(size=24) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`; }
function iconPresentation(size=24) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`; }
function iconBarChart(size=24) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>`; }
function iconMic(size=13) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`; }
function iconPen(size=13) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${SVG_ATTRS}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`; }

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => App.init());
