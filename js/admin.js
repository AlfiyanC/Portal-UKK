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

    if (CONFIG.DEMO_MODE || !CONFIG.SHEET_ID) {
      setVal('admin-stat-datasets', DEMO_DATA.datasets.length);
      setVal('admin-stat-publications', DEMO_DATA.publications.length);
      setVal('admin-stat-visualizations', DEMO_DATA.visualizations.length);
      setVal('admin-stat-presentations', DEMO_DATA.presentations.length);
      return;
    }

    setVal('admin-stat-datasets', '…');
    setVal('admin-stat-publications', '…');
    setVal('admin-stat-visualizations', '…');
    setVal('admin-stat-presentations', '…');

    if (typeof SheetsAPI !== 'undefined') {
      SheetsAPI.fetchAll().then(data => {
        setVal('admin-stat-datasets', data.datasets.length);
        setVal('admin-stat-publications', data.publications.length);
        setVal('admin-stat-visualizations', data.visualizations.length);
        setVal('admin-stat-presentations', data.presentations.length);
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
        { col: 'file_url', type: 'URL', desc: 'Link Google Drive PDF' },
        { col: 'tags', type: 'Teks', desc: 'tag1, tag2' },
        { col: 'featured', type: 'Boolean', desc: 'TRUE/FALSE' },
        { col: 'status', type: 'Teks', desc: 'published / draft' },
      ],
      presentations: [
        { col: 'id', type: 'Angka', desc: 'ID unik' },
        { col: 'title', type: 'Teks', desc: 'Judul presentasi' },
        { col: 'event', type: 'Teks', desc: 'Nama acara/kegiatan' },
        { col: 'presenter', type: 'Teks', desc: 'Nama presenter' },
        { col: 'description', type: 'Teks', desc: 'Deskripsi' },
        { col: 'year', type: 'Angka', desc: 'Tahun' },
        { col: 'file_url', type: 'URL', desc: 'Link Google Drive PPT/PDF' },
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

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => Admin.init());
