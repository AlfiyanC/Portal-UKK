// ============================================================
// sheets.js — Google Sheets API Integration
// ============================================================
// Mengambil data dari Google Sheets Public JSON API
// Sheet harus diatur "Anyone with link can View"
// ============================================================

const SheetsAPI = {
  // Cache untuk data yang sudah diambil
  _cache: {},
  _cacheTime: {},
  CACHE_DURATION: 5 * 60 * 1000, // 5 menit

  /**
   * Ambil data dari tab tertentu di Google Sheet
   * @param {string} sheetName - Nama tab sheet
   * @returns {Promise<Array>} Array of objects
   */
  async fetchSheet(sheetName) {
    // Cek cache
    const cacheKey = `${CONFIG.SHEET_ID}_${sheetName}`;
    if (this._cache[cacheKey] && (Date.now() - this._cacheTime[cacheKey]) < this.CACHE_DURATION) {
      return this._cache[cacheKey];
    }

    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      const data = this._parseGVizResponse(text);
      const rows = this._transformToObjects(data);

      // Simpan ke cache
      this._cache[cacheKey] = rows;
      this._cacheTime[cacheKey] = Date.now();

      return rows;
    } catch (error) {
      console.error(`Gagal mengambil sheet "${sheetName}":`, error);
      throw error;
    }
  },

  /**
   * Ambil semua data yang diperlukan
   * @returns {Promise<Object>} Semua data portal
   */
  async fetchAll() {
    const [visualizations, datasets, publications, presentations] = await Promise.all([
      this.fetchSheet('visualizations'),
      this.fetchSheet('datasets'),
      this.fetchSheet('publications'),
      this.fetchSheet('presentations'),
    ]);

    return { visualizations, datasets, publications, presentations };
  },

  /**
   * Parse respons Google Visualization Query
   * @param {string} text - Raw response text
   * @returns {Object} Parsed JSON data
   */
  _parseGVizResponse(text) {
    // Format respons: /*O_o*/ google.visualization.Query.setResponse({...});
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
    if (!table || !table.cols || !table.rows) return [];

    const headers = table.cols.map(col => col.label || col.id);

    return table.rows
      .map(row => {
        const obj = {};
        row.c.forEach((cell, index) => {
          const header = headers[index];
          if (!header) return;
          obj[header] = cell ? this._parseValue(cell) : null;
        });
        return obj;
      })
      .filter(row => Object.values(row).some(v => v !== null && v !== ''));
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
