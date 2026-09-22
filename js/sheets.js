// ============================================================
// sheets.js — Google Sheets API Integration
// ============================================================
// Mengambil data dari Google Sheets Public API
// Mendukung protokol file:// via JSONP dan http/https via fetch + JSONP fallback
// ============================================================

const SheetsAPI = {
  // Cache untuk data yang sudah diambil
  _cache: {},
  _cacheTime: {},
  CACHE_DURATION: 30 * 1000, // 30 detik

  /**
   * Ambil data dari tab tertentu di Google Sheet
   * @param {string} sheetName - Nama tab sheet
   * @returns {Promise<Array>} Array of objects
   */
  async fetchSheet(sheetName) {
    if (!CONFIG.SHEET_ID) {
      throw new Error('CONFIG.SHEET_ID belum diisi');
    }

    // Cek cache
    const cacheKey = `${CONFIG.SHEET_ID}_${sheetName}`;
    if (this._cache[cacheKey] && (Date.now() - this._cacheTime[cacheKey]) < this.CACHE_DURATION) {
      return this._cache[cacheKey];
    }

    let rows;
    // Pada protokol file:// (misal dibuka langsung dengan klik ganda index.html),
    // fetch() diblokir oleh browser karena kebijakan keamanan CORS / null origin.
    // Gunakan JSONP secara langsung jika file://, atau coba fetch() dengan fallback JSONP.
    const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

    if (isFileProtocol) {
      rows = await this._fetchJSONP(sheetName);
    } else {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&headers=1&t=${Date.now()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const data = this._parseGVizResponse(text);
        rows = this._transformToObjects(data);
      } catch (err) {
        console.warn(`Fetch langsung gagal untuk tab "${sheetName}", beralih ke JSONP:`, err);
        rows = await this._fetchJSONP(sheetName);
      }
    }

    // Simpan ke cache
    this._cache[cacheKey] = rows;
    this._cacheTime[cacheKey] = Date.now();

    return rows;
  },

  /**
   * Ambil data menggunakan JSONP (<script> tag)
   * Kebal terhadap blokir CORS pada protokol file:// maupun server lokal
   */
  _fetchJSONP(sheetName) {
    return new Promise((resolve, reject) => {
      const cbName = 'gviz_cb_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const script = document.createElement('script');
      const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=responseHandler:${cbName}&sheet=${encodeURIComponent(sheetName)}&headers=1&t=${Date.now()}`;

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Waktu tunggu habis (timeout) saat memuat tab "${sheetName}"`));
      }, 12000);

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      window[cbName] = (data) => {
        cleanup();
        try {
          const rows = SheetsAPI._transformToObjects(data);
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      };

      script.onerror = () => {
        cleanup();
        reject(new Error(`Gagal memuat script data Google Sheets untuk tab "${sheetName}"`));
      };

      script.src = url;
      document.head.appendChild(script);
    });
  },

  /**
   * Ambil semua data yang diperlukan
   * @returns {Promise<Object>} Semua data portal
   */
  async fetchAll() {
    const [visualizations, datasets, publications, presentations] = await Promise.all([
      this.fetchSheet('visualizations').catch(e => { console.warn('visualizations fetch failed:', e); return []; }),
      this.fetchSheet('datasets').catch(e => { console.warn('datasets fetch failed:', e); return []; }),
      this.fetchSheet('publications').catch(e => { console.warn('publications fetch failed:', e); return []; }),
      this.fetchSheet('presentations').catch(e => { console.warn('presentations fetch failed:', e); return []; }),
    ]);

    return { visualizations, datasets, publications, presentations };
  },

  /**
   * Parse respons Google Visualization Query
   * @param {string} text - Raw response text
   * @returns {Object} Parsed JSON data
   */
  _parseGVizResponse(text) {
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);?\s*$/);
    if (!match) throw new Error('Format respons Google Sheets tidak dikenali');
    return JSON.parse(match[1]);
  },

  /**
   * Transform table data ke array of objects
   * @param {Object} data - Parsed GViz response
   * @returns {Array} Array of row objects
   */
  _transformToObjects(data) {
    const table = data.table;
    if (!table || !table.cols || !table.rows || table.rows.length === 0) return [];

    let headers = [];
    let dataRows = [];

    const hasColLabels = table.cols.some(col => col.label && col.label.trim() !== '');

    if (hasColLabels) {
      headers = table.cols.map(col => (col.label || col.id).trim());
      dataRows = table.rows;
    } else {
      // Baris pertama di table.rows adalah header
      const headerRow = table.rows[0];
      if (!headerRow || !headerRow.c) return [];
      headers = headerRow.c.map(cell => (cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : ''));
      dataRows = table.rows.slice(1);
    }

    return dataRows
      .map(row => {
        if (!row || !row.c) return null;
        const obj = {};
        let hasValue = false;
        row.c.forEach((cell, index) => {
          const header = headers[index];
          if (!header) return;
          const val = cell ? this._parseValue(cell) : null;
          const cleanHeader = header.trim();
          obj[cleanHeader] = val;
          obj[cleanHeader.toLowerCase()] = val;
          if (val !== null && val !== '') hasValue = true;
        });
        return hasValue ? obj : null;
      })
      .filter(row => row !== null);
  },

  /**
   * Parse nilai cell dengan tipe yang benar
   * @param {Object} cell - Cell object dari GViz
   * @returns {*} Parsed value
   */
  _parseValue(cell) {
    if (cell.v === null || cell.v === undefined) return null;

    // Boolean
    if (cell.v === true || cell.v === false) return cell.v;

    // String TRUE/FALSE dari boolean column
    const strVal = String(cell.v).trim();
    if (strVal.toUpperCase() === 'TRUE') return true;
    if (strVal.toUpperCase() === 'FALSE') return false;

    return cell.v;
  },

  /**
   * Bersihkan cache (paksa refresh data)
   */
  clearCache() {
    this._cache = {};
    this._cacheTime = {};
  }
};
