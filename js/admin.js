// ============================================================
// admin.js — Admin Panel Logic
// Portal Data Tim UKK BPS Provinsi NTB
// ============================================================

const Admin = {
  SESSION_KEY: 'bpsntb_admin_session',

  // ---- Init ----
  init() {
    this.checkSession();
    this.setupLoginForm();
    this.setupPasswordToggle();
  },

  // ---- Session Management ----
  checkSession() {
    const session = sessionStorage.getItem(this.SESSION_KEY);
    if (session === 'authenticated') {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-page').classList.remove('show');
  },

  showDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-page').classList.add('show');
    this.renderDashboard();
    if (typeof ChartBuilder !== 'undefined') {
      setTimeout(() => ChartBuilder.init(), 100);
    }
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.showLogin();
  },

  // ---- Login Form ----
  setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  },

  handleLogin() {
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');

    // Show loading
    if (btn) btn.classList.add('loading');
    if (errorEl) errorEl.classList.remove('show');

    // Simulate brief delay for UX
    setTimeout(() => {
      if (btn) btn.classList.remove('loading');

      if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
        sessionStorage.setItem(this.SESSION_KEY, 'authenticated');
        this.showDashboard();
      } else {
        if (errorEl) {
          errorEl.classList.add('show');
          errorEl.querySelector('span').textContent = 'Username atau password salah. Silakan coba lagi.';
        }
        // Shake effect on form
        const card = document.querySelector('.login-card');
        if (card) {
          card.style.animation = 'shake 0.4s ease';
          setTimeout(() => card.style.animation = '', 400);
        }
      }
    }, 600);
  },

  setupPasswordToggle() {
    const toggle = document.getElementById('password-toggle');
    const input = document.getElementById('login-password');
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      toggle.innerHTML = isVisible ? eyeIcon() : eyeOffIcon();
    });
  },

  // ---- Dashboard Rendering ----
  renderDashboard() {
    this.renderStats();
    this.renderConfigStatus();
    this.renderSheetRef();
    this.updateDateTime();
  },

  renderStats() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const isPub = item => String(item.status || 'published').trim().toLowerCase() !== 'draft';

    if (CONFIG.DEMO_MODE || !CONFIG.SHEET_ID) {
      setVal('admin-stat-datasets', DEMO_DATA.datasets.filter(isPub).length);
      setVal('admin-stat-publications', DEMO_DATA.publications.filter(isPub).length);
      setVal('admin-stat-visualizations', DEMO_DATA.visualizations.filter(isPub).length);
      setVal('admin-stat-presentations', DEMO_DATA.presentations.filter(isPub).length);
      return;
    }

    setVal('admin-stat-datasets', '…');
    setVal('admin-stat-publications', '…');
    setVal('admin-stat-visualizations', '…');
    setVal('admin-stat-presentations', '…');

    if (typeof SheetsAPI !== 'undefined') {
      SheetsAPI.fetchAll().then(data => {
        setVal('admin-stat-datasets', data.datasets.filter(isPub).length);
        setVal('admin-stat-publications', data.publications.filter(isPub).length);
        setVal('admin-stat-visualizations', data.visualizations.filter(isPub).length);
        setVal('admin-stat-presentations', data.presentations.filter(isPub).length);
      }).catch(err => {
        console.warn('Gagal memuat stats admin dari Sheets:', err);
        setVal('admin-stat-datasets', 0);
        setVal('admin-stat-publications', 0);
        setVal('admin-stat-visualizations', 0);
        setVal('admin-stat-presentations', 0);
      });
    }
  },

  renderConfigStatus() {
    const el = document.getElementById('config-status');
    if (!el) return;

    if (CONFIG.DEMO_MODE || !CONFIG.SHEET_ID) {
      el.className = 'config-status demo';
      el.innerHTML = `
        <span class="config-status-dot"></span>
        <span>Mode Demo — Google Sheet belum dikonfigurasi. Edit file <code style="background:rgba(0,0,0,0.08);padding:1px 6px;border-radius:4px;font-size:12px;">js/config.js</code> untuk menghubungkan ke Google Sheet.</span>
      `;
    } else {
      el.className = 'config-status connected';
      el.innerHTML = `
        <span class="config-status-dot"></span>
        <span>Terhubung ke Google Sheet — Sheet ID: <code style="background:rgba(0,0,0,0.08);padding:1px 6px;border-radius:4px;font-size:12px;">${CONFIG.SHEET_ID.substring(0, 16)}...</code></span>
      `;
    }
  },

  renderSheetRef() {
    // Sheet tab reference data
    const sheetDefs = {
      visualizations: [
        { col: 'id', type: 'Angka', desc: 'ID unik (1, 2, 3, ...)' },
        { col: 'title', type: 'Teks', desc: 'Judul visualisasi' },
        { col: 'description', type: 'Teks', desc: 'Deskripsi singkat' },
        { col: 'chart_type', type: 'Teks', desc: 'bar / line / pie / doughnut / radar' },
        { col: 'data_json', type: 'JSON', desc: '{"labels":[...],"datasets":[{...}]}' },
        { col: 'is_interactive', type: 'Boolean', desc: 'TRUE/FALSE — apakah pengunjung bisa ubah tipe chart' },
        { col: 'category', type: 'Teks', desc: 'Ekonomi / Kemiskinan / dll.' },
        { col: 'year', type: 'Angka', desc: 'Tahun data (2024)' },
        { col: 'tags', type: 'Teks', desc: 'tag1, tag2, tag3' },
        { col: 'featured', type: 'Boolean', desc: 'TRUE untuk tampilkan sebagai unggulan' },
        { col: 'status', type: 'Teks', desc: 'published / draft' },
      ],
      datasets: [
        { col: 'id', type: 'Angka', desc: 'ID unik' },
        { col: 'title', type: 'Teks', desc: 'Nama dataset' },
        { col: 'description', type: 'Teks', desc: 'Deskripsi dataset' },
        { col: 'category', type: 'Teks', desc: 'Kategori' },
        { col: 'year', type: 'Angka', desc: 'Tahun data' },
        { col: 'file_url', type: 'URL', desc: 'Link Google Drive (sharing link)' },
        { col: 'file_size', type: 'Teks', desc: 'Ukuran file (2.5 MB)' },
        { col: 'file_type', type: 'Teks', desc: 'CSV / XLSX / JSON' },
        { col: 'tags', type: 'Teks', desc: 'tag1, tag2' },
        { col: 'featured', type: 'Boolean', desc: 'TRUE/FALSE' },
        { col: 'status', type: 'Teks', desc: 'published / draft' },
      ],
      publications: [
        { col: 'id', type: 'Angka', desc: 'ID unik' },
        { col: 'title', type: 'Teks', desc: 'Judul publikasi' },
        { col: 'author', type: 'Teks', desc: 'Penulis/Tim' },
        { col: 'description', type: 'Teks', desc: 'Deskripsi' },
        { col: 'category', type: 'Teks', desc: 'Kategori' },
        { col: 'year', type: 'Angka', desc: 'Tahun terbit' },
        { col: 'file_url', type: 'URL', desc: 'Link Google Drive / file' },
        { col: 'file_type', type: 'Teks (Opsional)', desc: 'PDF / DOCX (otomatis terdeteksi jika kosong)' },
        { col: 'file_size', type: 'Teks (Opsional)', desc: 'Ukuran file (misal 1.5 MB)' },
        { col: 'tags', type: 'Teks', desc: 'tag1, tag2' },
        { col: 'featured', type: 'Boolean', desc: 'TRUE/FALSE' },
        { col: 'status', type: 'Teks', desc: 'published / draft' },
      ],
      presentations: [
        { col: 'id', type: 'Angka', desc: 'ID unik' },
        { col: 'title', type: 'Teks', desc: 'Judul presentasi / bahan' },
        { col: 'event', type: 'Teks', desc: 'Nama acara/kegiatan' },
        { col: 'presenter', type: 'Teks', desc: 'Nama presenter' },
        { col: 'description', type: 'Teks', desc: 'Deskripsi' },
        { col: 'year', type: 'Angka', desc: 'Tahun' },
        { col: 'file_url', type: 'URL', desc: 'Link Google Drive / file' },
        { col: 'file_type', type: 'Teks (Opsional)', desc: 'PPTX / PDF / DOCX (otomatis terdeteksi jika kosong)' },
        { col: 'file_size', type: 'Teks (Opsional)', desc: 'Ukuran file (misal 3.8 MB)' },
        { col: 'tags', type: 'Teks', desc: 'tag1, tag2' },
        { col: 'featured', type: 'Boolean', desc: 'TRUE/FALSE' },
        { col: 'status', type: 'Teks', desc: 'published / draft' },
      ],
    };

    // Render sheet tabs and table
    const tabsEl = document.getElementById('sheet-ref-tabs');
    const tableEl = document.getElementById('sheet-ref-table');
    if (!tabsEl || !tableEl) return;

    const keys = Object.keys(sheetDefs);
    let activeKey = keys[0];

    const renderTable = (key) => {
      const cols = sheetDefs[key];
      tableEl.innerHTML = `
        <table class="sheet-columns-table">
          <thead>
            <tr>
              <th>Nama Kolom</th>
              <th>Tipe</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${cols.map(c => `
              <tr>
                <td><code class="col-name">${c.col}</code></td>
                <td style="color:var(--slate-500);font-size:12px;">${c.type}</td>
                <td style="color:var(--slate-600);">${c.desc}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    };

    const tabLabels = { visualizations: 'Visualisasi', datasets: 'Dataset', publications: 'Publikasi', presentations: 'Presentasi' };

    tabsEl.innerHTML = keys.map(k => `
      <button class="sheet-tab ${k === activeKey ? 'active' : ''}" data-key="${k}">${tabLabels[k]}</button>
    `).join('');

    renderTable(activeKey);

    tabsEl.querySelectorAll('.sheet-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeKey = tab.dataset.key;
        tabsEl.querySelectorAll('.sheet-tab').forEach(t => t.classList.toggle('active', t.dataset.key === activeKey));
        renderTable(activeKey);
      });
    });
  },

  updateDateTime() {
    const el = document.getElementById('admin-datetime');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
};

// ---- Icon helpers ----
function eyeIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function eyeOffIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

// Shake animation CSS injection
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }`;
document.head.appendChild(shakeStyle);

// ============================================================
// ChartBuilder — Visual Chart Generator & Editor (Opsi 2)
// Mempermudah pembuatan & update visualisasi tanpa ketik JSON
// ============================================================
const ChartBuilder = {
  chartInstance: null,
  activeTab: 'json', // 'json' | 'row'
  initialized: false,
  rows: [
    { label: 'Jan 2024', val: 2.85 },
    { label: 'Feb 2024', val: 3.10 },
    { label: 'Mar 2024', val: 2.95 },
    { label: 'Apr 2024', val: 3.12 },
    { label: 'Mei 2024', val: 3.20 },
    { label: 'Jun 2024', val: 3.05 }
  ],

  // Warna Palette BPS NTB & Varian
  PALETTES: {
    blue: {
      border: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.2)',
      solid: 'rgba(37, 99, 235, 0.85)'
    },
    green: {
      border: '#059669',
      bg: 'rgba(5, 150, 105, 0.2)',
      solid: 'rgba(5, 150, 105, 0.85)'
    },
    orange: {
      border: '#D97706',
      bg: 'rgba(217, 119, 6, 0.2)',
      solid: 'rgba(217, 119, 6, 0.85)'
    },
    purple: {
      border: '#7C3AED',
      bg: 'rgba(124, 58, 237, 0.2)',
      solid: 'rgba(124, 58, 237, 0.85)'
    },
    multi: [
      'rgba(37, 99, 235, 0.85)',
      'rgba(16, 185, 129, 0.85)',
      'rgba(245, 158, 11, 0.85)',
      'rgba(239, 68, 68, 0.85)',
      'rgba(124, 58, 237, 0.85)',
      'rgba(14, 165, 233, 0.85)',
      'rgba(236, 72, 153, 0.85)',
      'rgba(100, 116, 139, 0.85)',
      'rgba(20, 184, 166, 0.85)',
      'rgba(249, 115, 22, 0.85)',
      'rgba(99, 102, 241, 0.85)',
      'rgba(132, 204, 22, 0.85)'
    ]
  },

  init() {
    this.renderTable();
    this.updateChart();
    this.initialized = true;
  },

  renderTable() {
    const tbody = document.getElementById('cb-table-body');
    const counter = document.getElementById('cb-row-counter');
    if (!tbody) return;

    if (counter) counter.textContent = `${this.rows.length} baris`;

    if (this.rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;padding:24px;color:var(--slate-400);">
            Tabel masih kosong. Klik <strong>+ Tambah Baris Bulan Baru</strong> atau gunakan preset di atas.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.rows.map((row, idx) => `
      <tr data-index="${idx}">
        <td style="text-align:center;color:var(--slate-400);font-weight:600;font-size:12px;">${idx + 1}</td>
        <td>
          <input
            type="text"
            class="cb-input-label"
            value="${this.escapeHtml(row.label)}"
            placeholder="Label (contoh: Jan 2024)"
            oninput="ChartBuilder.onCellChange(${idx}, 'label', this.value)"
          >
        </td>
        <td>
          <input
            type="text"
            class="cb-input-val"
            value="${row.val !== null && row.val !== undefined ? row.val : ''}"
            placeholder="Nilai (contoh: 2.85)"
            oninput="ChartBuilder.onCellChange(${idx}, 'val', this.value)"
          >
        </td>
        <td style="text-align:center;">
          <button type="button" class="cb-btn-del-row" onclick="ChartBuilder.deleteRow(${idx})" title="Hapus baris ini">
            ✕
          </button>
        </td>
      </tr>
    `).join('');
  },

  onCellChange(index, field, value) {
    if (!this.rows[index]) return;
    if (field === 'val') {
      // Support koma desimal khas Excel Indonesia
      const cleanVal = String(value).trim().replace(',', '.');
      this.rows[index].val = cleanVal;
    } else {
      this.rows[index].label = value;
    }
    this.updateChart();
  },

  addRow(label = '', val = '') {
    // Prediksi label berikutnya berdasarkan pola baris terakhir
    if (!label && this.rows.length > 0) {
      const lastLabel = this.rows[this.rows.length - 1].label;
      label = this.suggestNextLabel(lastLabel);
    } else if (!label) {
      label = `Periode ${this.rows.length + 1}`;
    }

    this.rows.push({ label, val });
    this.renderTable();
    this.updateChart();

    // Auto focus baris input nilai baru
    setTimeout(() => {
      const inputs = document.querySelectorAll('#cb-table-body .cb-input-val');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    }, 50);
  },

  suggestNextLabel(last) {
    if (!last) return 'Bulan Baru';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const fullMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // Pola "Bulan Tahun" misal "Jan 2024" atau "Januari 2024"
    for (let i = 0; i < months.length; i++) {
      const regex = new RegExp(`^(${months[i]}|${fullMonths[i]})\\s*(\\d{4})?$`, 'i');
      const match = last.trim().match(regex);
      if (match) {
        let nextMonthIdx = (i + 1) % 12;
        let year = match[2] ? parseInt(match[2], 10) : null;
        if (nextMonthIdx === 0 && year) year += 1;
        const monthName = match[1].length > 3 ? fullMonths[nextMonthIdx] : months[nextMonthIdx];
        return year ? `${monthName} ${year}` : monthName;
      }
    }

    // Pola angka tahun murni misal "2023" -> "2024"
    const yearMatch = last.trim().match(/^(\d{4})$/);
    if (yearMatch) {
      return String(parseInt(yearMatch[1], 10) + 1);
    }

    return `Bulan ${this.rows.length + 1}`;
  },

  deleteRow(index) {
    this.rows.splice(index, 1);
    this.renderTable();
    this.updateChart();
  },

  clearAllRows() {
    if (this.rows.length > 0 && !confirm('Apakah Anda yakin ingin mengosongkan semua baris data tabel?')) {
      return;
    }
    this.rows = [];
    this.renderTable();
    this.updateChart();
    showAdminToast('Tabel dikosongkan.', 'info');
  },

  add12MonthsPreset() {
    const curYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    this.rows = months.map(m => ({ label: `${m} ${curYear}`, val: '' }));
    this.renderTable();
    this.updateChart();
    showAdminToast(`Preset 12 Bulan (${curYear}) berhasil dimuat.`);
  },

  addNtbKabKotaPreset() {
    const kabKota = [
      'Lombok Barat',
      'Lombok Tengah',
      'Lombok Timur',
      'Lombok Utara',
      'Sumbawa Barat',
      'Sumbawa',
      'Dompu',
      'Bima',
      'Kota Mataram',
      'Kota Bima'
    ];
    this.rows = kabKota.map(k => ({ label: k, val: '' }));
    const typeSelect = document.getElementById('cb-chart-type');
    if (typeSelect && typeSelect.value === 'line') {
      typeSelect.value = 'bar';
      this.onTypeChange();
    }
    this.renderTable();
    this.updateChart();
    showAdminToast('Preset 10 Kab/Kota NTB berhasil dimuat.');
  },

  toggleExcelPaste(show) {
    const box = document.getElementById('cb-excel-paste-box');
    if (!box) return;
    const isVisible = show !== undefined ? show : box.style.display !== 'none';
    box.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      const textarea = document.getElementById('cb-excel-textarea');
      if (textarea) {
        textarea.value = '';
        textarea.focus();
      }
    }
  },

  applyExcelPaste() {
    const textarea = document.getElementById('cb-excel-textarea');
    if (!textarea || !textarea.value.trim()) {
      showAdminToast('Kotak teks Excel masih kosong.', 'error');
      return;
    }

    const lines = textarea.value.trim().split(/\r?\n/);
    const parsed = [];

    for (let line of lines) {
      if (!line.trim()) continue;
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split(',');
      if (parts.length < 2) parts = line.split(';');

      if (parts.length >= 2) {
        const label = parts[0].trim();
        let valStr = parts[1].trim().replace(/\s+/g, '').replace(',', '.');
        const num = parseFloat(valStr);
        parsed.push({
          label,
          val: isNaN(num) ? parts[1].trim() : num
        });
      } else {
        parsed.push({ label: parts[0].trim(), val: '' });
      }
    }

    if (parsed.length === 0) {
      showAdminToast('Tidak ada data valid yang dapat diproses.', 'error');
      return;
    }

    this.rows = parsed;
    this.renderTable();
    this.updateChart();
    this.toggleExcelPaste(false);
    showAdminToast(`${parsed.length} baris data berhasil diimpor dari Excel!`);
  },

  toggleJsonImport(show) {
    const drawer = document.getElementById('cb-json-import-drawer');
    if (!drawer) return;
    const isVisible = show !== undefined ? show : drawer.style.display !== 'none';
    drawer.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      const input = document.getElementById('cb-import-json-input');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  importJson() {
    const input = document.getElementById('cb-import-json-input');
    if (!input || !input.value.trim()) {
      showAdminToast('Silakan tempel kode data_json terlebih dahulu.', 'error');
      return;
    }

    try {
      const text = input.value.trim();
      let parsed = JSON.parse(text);

      if (!parsed.labels || !parsed.datasets || !Array.isArray(parsed.datasets) || parsed.datasets.length === 0) {
        throw new Error('Format JSON harus memiliki "labels" dan "datasets"');
      }

      const ds = parsed.datasets[0];
      const newRows = parsed.labels.map((lbl, i) => ({
        label: String(lbl),
        val: ds.data[i] !== undefined ? ds.data[i] : ''
      }));

      this.rows = newRows;

      // Update series name jika ada
      if (ds.label) {
        const sInput = document.getElementById('cb-series-name');
        if (sInput) sInput.value = ds.label;
      }

      // Check jika area
      const typeSelect = document.getElementById('cb-chart-type');
      if (typeSelect && ds.fill) {
        typeSelect.value = 'area';
        this.onTypeChange();
      }

      this.renderTable();
      this.updateChart();
      this.toggleJsonImport(false);
      showAdminToast(`Berhasil memuat ${newRows.length} data ke editor! Anda bisa menambah baris baru sekarang.`);
    } catch (err) {
      showAdminToast(`Gagal membaca JSON: ${err.message}`, 'error');
    }
  },

  onTypeChange() {
    const typeSelect = document.getElementById('cb-chart-type');
    const badge = document.getElementById('cb-badge-type');
    if (!typeSelect) return;
    const type = typeSelect.value;
    const labels = {
      line: 'Garis (Line)',
      area: 'Area Bertumpuk',
      bar: 'Batang (Bar)',
      horizontalBar: 'Batang Horizontal',
      pie: 'Lingkaran (Pie)',
      doughnut: 'Donat (Doughnut)'
    };
    if (badge) badge.textContent = labels[type] || type;
    this.updateChart();
  },

  updateChart() {
    const canvas = document.getElementById('cb-chart-canvas');
    if (!canvas || typeof Chart === 'undefined') {
      this.updateOutputText();
      return;
    }

    const typeSelect = document.getElementById('cb-chart-type');
    const seriesNameInput = document.getElementById('cb-series-name');
    const paletteSelect = document.getElementById('cb-palette');

    const chartType = typeSelect ? typeSelect.value : 'line';
    const seriesLabel = seriesNameInput ? seriesNameInput.value.trim() || 'Nilai' : 'Nilai';
    const paletteKey = paletteSelect ? paletteSelect.value : 'blue';

    // Parse valid rows
    const labels = [];
    const data = [];

    this.rows.forEach(r => {
      if (r.label !== undefined && r.label !== null && String(r.label).trim() !== '') {
        labels.push(String(r.label).trim());
        const num = parseFloat(String(r.val).trim().replace(',', '.'));
        data.push(isNaN(num) ? 0 : num);
      }
    });

    // Destroy instance lama
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    // Config dataset colors
    const isPieOrDonut = chartType === 'pie' || chartType === 'doughnut';
    const isArea = chartType === 'area';
    const isHorizontal = chartType === 'horizontalBar';
    const activePalette = this.PALETTES[paletteKey] || this.PALETTES.blue;

    let bgColors, borderColors;

    if (isPieOrDonut || paletteKey === 'multi') {
      bgColors = labels.map((_, i) => this.PALETTES.multi[i % this.PALETTES.multi.length]);
      borderColors = '#ffffff';
    } else if (isArea) {
      bgColors = activePalette.bg;
      borderColors = activePalette.border;
    } else if (chartType === 'line') {
      bgColors = 'transparent';
      borderColors = activePalette.border;
    } else {
      // Bar
      bgColors = activePalette.solid;
      borderColors = activePalette.border;
    }

    const dataset = {
      label: seriesLabel,
      data: data,
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: isPieOrDonut ? 2 : 2.5,
      tension: (chartType === 'line' || isArea) ? 0.35 : 0,
      fill: isArea,
      borderRadius: (chartType === 'bar' || isHorizontal) ? 6 : 0,
      pointRadius: (chartType === 'line' || isArea) ? 4.5 : 0,
      pointHoverRadius: 6.5,
      pointBackgroundColor: borderColors,
    };

    // Effective Chart.js Type
    let realChartType = 'bar';
    if (chartType === 'line' || isArea) realChartType = 'line';
    else if (chartType === 'pie') realChartType = 'pie';
    else if (chartType === 'doughnut') realChartType = 'doughnut';
    else if (isHorizontal) realChartType = 'bar';

    const ctx = canvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: realChartType,
      data: {
        labels: labels,
        datasets: [dataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isHorizontal ? 'y' : 'x',
        plugins: {
          legend: {
            display: isPieOrDonut || seriesLabel !== '',
            position: 'bottom',
            labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 14 }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
            padding: 10,
            cornerRadius: 6
          }
        },
        scales: isPieOrDonut ? {} : {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.7)' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        },
        animation: { duration: 350 }
      }
    });

    this.updateOutputText();
  },

  generateDataJson() {
    const seriesNameInput = document.getElementById('cb-series-name');
    const typeSelect = document.getElementById('cb-chart-type');
    const paletteSelect = document.getElementById('cb-palette');

    const chartType = typeSelect ? typeSelect.value : 'line';
    const seriesLabel = seriesNameInput ? seriesNameInput.value.trim() || 'Nilai' : 'Nilai';
    const paletteKey = paletteSelect ? paletteSelect.value : 'blue';

    const labels = [];
    const data = [];

    this.rows.forEach(r => {
      if (r.label !== undefined && r.label !== null && String(r.label).trim() !== '') {
        labels.push(String(r.label).trim());
        const num = parseFloat(String(r.val).trim().replace(',', '.'));
        data.push(isNaN(num) ? 0 : num);
      }
    });

    const isArea = chartType === 'area';
    const isPieOrDonut = chartType === 'pie' || chartType === 'doughnut';
    const activePalette = this.PALETTES[paletteKey] || this.PALETTES.blue;

    const datasetObj = {
      label: seriesLabel,
      data: data
    };

    if (isArea) {
      datasetObj.borderColor = activePalette.border;
      datasetObj.backgroundColor = activePalette.bg;
      datasetObj.fill = true;
      datasetObj.tension = 0.4;
    } else if (chartType === 'line') {
      datasetObj.borderColor = activePalette.border;
      datasetObj.tension = 0.35;
    } else if (isPieOrDonut || paletteKey === 'multi') {
      datasetObj.backgroundColor = labels.map((_, i) => this.PALETTES.multi[i % this.PALETTES.multi.length]);
    } else {
      datasetObj.backgroundColor = activePalette.solid;
    }

    return JSON.stringify({
      labels: labels,
      datasets: [datasetObj]
    });
  },

  updateOutputText() {
    const textarea = document.getElementById('cb-output-text');
    if (!textarea) return;

    if (this.activeTab === 'json') {
      textarea.value = this.generateDataJson();
    } else {
      // 1 Full Row for Google Sheets:
      // id | title | description | chart_type | data_json | is_interactive | category | year | tags | featured | status
      const title = document.getElementById('cb-title')?.value.trim() || 'Visualisasi Baru';
      const typeSelect = document.getElementById('cb-chart-type');
      let cType = typeSelect ? typeSelect.value : 'line';
      if (cType === 'area') cType = 'line';
      if (cType === 'horizontalBar') cType = 'bar';

      const category = document.getElementById('cb-category')?.value || 'Ekonomi';
      const year = new Date().getFullYear();
      const json = this.generateDataJson();

      // Tab separated row for Google Sheets
      const rowTsv = `99\t${title}\tVisualisasi data ${title}\t${cType}\t${json}\tTRUE\t${category}\t${year}\t${category.toLowerCase()}, NTB\tTRUE\tpublished`;
      textarea.value = rowTsv;
    }
  },

  switchOutputTab(tab) {
    this.activeTab = tab;
    const btnJson = document.getElementById('btn-tab-json');
    const btnRow = document.getElementById('btn-tab-row');
    const btnCopyLabel = document.getElementById('btn-cb-copy-label');

    if (btnJson) btnJson.classList.toggle('active', tab === 'json');
    if (btnRow) btnRow.classList.toggle('active', tab === 'row');

    if (btnCopyLabel) {
      btnCopyLabel.textContent = tab === 'json' ? 'Salin Kode data_json' : 'Salin 1 Baris Lengkap (TSV)';
    }

    this.updateOutputText();
  },

  copyOutput() {
    const textarea = document.getElementById('cb-output-text');
    const btn = document.getElementById('btn-cb-copy-main');
    if (!textarea || !textarea.value) {
      showAdminToast('Tidak ada data untuk disalin.', 'error');
      return;
    }

    const textToCopy = textarea.value;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (btn) {
        btn.classList.add('copied');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>✓ Berhasil Disalin!</span>`;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalText;
        }, 2000);
      }
      showAdminToast(
        this.activeTab === 'json'
          ? 'Kode data_json berhasil disalin! Silakan tempel di Google Sheet.'
          : '1 Baris penuh Google Sheet berhasil disalin!',
        'success'
      );
    }).catch(err => {
      textarea.select();
      document.execCommand('copy');
      showAdminToast('Berhasil disalin ke clipboard!', 'success');
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};

// Toast notification helper
function showAdminToast(msg, type = 'success') {
  let toastContainer = document.getElementById('admin-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'admin-toast-container';
    toastContainer.className = 'admin-toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span class="admin-toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="admin-toast-text">${msg}</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 20);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
  // Jika session sudah aktif, inisialisasi ChartBuilder
  if (sessionStorage.getItem(Admin.SESSION_KEY) === 'authenticated') {
    setTimeout(() => ChartBuilder.init(), 100);
  }
});
