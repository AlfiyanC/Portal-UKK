// ============================================================
// charts.js — Chart Rendering & Interactive Builder
// ============================================================

const ChartManager = {
  // Aktif chart instances (untuk di-destroy sebelum re-render)
  _instances: {},

  // Palet warna BPS NTB
  COLORS: {
    primary: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#0EA5E9', '#38BDF8', '#7C3AED', '#8B5CF6'],
    pastel: ['rgba(37, 99, 235, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(96, 165, 250, 0.7)', 'rgba(14, 165, 233, 0.7)', 'rgba(30, 64, 175, 0.7)', 'rgba(124, 58, 237, 0.7)', 'rgba(99, 102, 241, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)'],
    lines: ['#2563EB', '#0EA5E9', '#7C3AED', '#10B981', '#F59E0B'],
  },

  // Default Chart.js options
  DEFAULT_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 13, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
        titleColor: '#fff',
        bodyColor: '#CBD5E1',
      }
    },
    animation: { duration: 600, easing: 'easeInOutQuart' }
  },

  /**
   * Render chart ke canvas element
   * @param {string} canvasId - ID elemen canvas
   * @param {Object} vizItem - Data visualisasi dari Google Sheet / demo
   * @param {string} overrideType - Override tipe chart (opsional)
   * @returns {Chart} Chart.js instance
   */
  render(canvasId, vizItem, overrideType = null) {
    // Hancurkan instance lama jika ada
    if (this._instances[canvasId]) {
      this._instances[canvasId].destroy();
      delete this._instances[canvasId];
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const type = overrideType || vizItem.chart_type || 'bar';

    let chartData;
    try {
      chartData = typeof vizItem.data_json === 'string'
        ? JSON.parse(vizItem.data_json)
        : vizItem.data_json;
    } catch (e) {
      console.error('Gagal parse data_json:', e);
      return null;
    }

    // Terapkan warna default jika belum ada
    chartData = this._applyDefaultColors(chartData, type);

    const options = this._buildOptions(type);

    const chart = new Chart(ctx, {
      type: type === 'area' ? 'line' : type,
      data: chartData,
      options
    });

    this._instances[canvasId] = chart;
    return chart;
  },

  /**
   * Ganti tipe chart (untuk interactive builder)
   * @param {string} canvasId - ID canvas
   * @param {string} newType - Tipe chart baru
   * @param {Object} vizItem - Data visualisasi
   */
  changeType(canvasId, newType, vizItem) {
    this.render(canvasId, vizItem, newType);
  },

  /**
   * Destroy semua chart instances
   */
  destroyAll() {
    Object.values(this._instances).forEach(chart => chart.destroy());
    this._instances = {};
  },

  /**
   * Terapkan warna default ke dataset
   */
  _applyDefaultColors(chartData, type) {
    if (!chartData.datasets) return chartData;

    chartData.datasets = chartData.datasets.map((ds, i) => {
      const isPie = ['pie', 'doughnut'].includes(type);

      if (isPie && !ds.backgroundColor) {
        ds.backgroundColor = this.COLORS.primary;
        ds.borderColor = '#fff';
        ds.borderWidth = 2;
      } else if (!isPie) {
        if (!ds.borderColor) ds.borderColor = this.COLORS.lines[i % this.COLORS.lines.length];
        if (!ds.backgroundColor) {
          if (type === 'bar') {
            ds.backgroundColor = this.COLORS.pastel[i % this.COLORS.pastel.length];
          } else {
            const c = this.COLORS.lines[i % this.COLORS.lines.length];
            ds.backgroundColor = c.replace(')', ', 0.1)').replace('rgb', 'rgba');
          }
        }
        if (!ds.borderRadius && type === 'bar') ds.borderRadius = 6;
        if (!ds.borderWidth) ds.borderWidth = 2;
        if (type === 'line' && ds.tension === undefined) ds.tension = 0.4;
      }

      return ds;
    });

    return chartData;
  },

  /**
   * Buat options Chart.js berdasarkan tipe
   */
  _buildOptions(type) {
    const base = JSON.parse(JSON.stringify(this.DEFAULT_OPTIONS));

    const isPie = ['pie', 'doughnut'].includes(type);
    const isRadar = type === 'radar';

    if (!isPie && !isRadar) {
      base.scales = {
        x: {
          grid: { color: 'rgba(203, 213, 225, 0.4)', drawBorder: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }
        },
        y: {
          grid: { color: 'rgba(203, 213, 225, 0.4)', drawBorder: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' },
          beginAtZero: false
        }
      };
    }

    if (isRadar) {
      base.scales = {
        r: {
          grid: { color: 'rgba(203, 213, 225, 0.5)' },
          ticks: { font: { family: 'Inter', size: 10 }, color: '#64748B', backdropColor: 'transparent' },
          pointLabels: { font: { family: 'Inter', size: 11 }, color: '#334155' }
        }
      };
    }

    return base;
  },

  /**
   * Export chart sebagai gambar PNG
   * @param {string} canvasId - ID canvas
   * @param {string} filename - Nama file output
   */
  exportPNG(canvasId, filename = 'chart-bps-ntb') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};
