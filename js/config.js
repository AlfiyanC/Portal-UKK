// ============================================================
// config.js — Konfigurasi Portal Data Tim UKK BPS Provinsi NTB
// ============================================================
// PETUNJUK: Isi SHEET_ID dengan ID Google Sheet Anda.
// ID ada di URL: docs.google.com/spreadsheets/d/{SHEET_ID}/edit
// Ubah DEMO_MODE ke false setelah Google Sheet dikonfigurasi.
// ============================================================

const CONFIG = {
  // Google Sheets Configuration
  SHEET_ID: '17DzQkV1vssb9LSlqTJhIg3SWnHDtlxvB7_ID4jqlk_M',               // ← Isi Sheet ID Anda di sini
  DEMO_MODE: false,            // ← Ubah ke false setelah Sheet dikonfigurasi
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/17DzQkV1vssb9LSlqTJhIg3SWnHDtlxvB7_ID4jqlk_M/edit?usp=sharing',             // ← Link ke Google Sheet Anda
  DRIVE_FOLDER_URL: 'https://drive.google.com/drive/folders/1iKYLui7SOXZxO8Sl72c3qfBqeVUAD5Wz?usp=sharing',      // ← Link ke Google Drive Folder Anda

  // Organizational Info
  ORG_NAME: 'Tim UKK BPS Provinsi NTB',
  ORG_FULL: 'Badan Pusat Statistik Provinsi Nusa Tenggara Barat',
  ORG_SHORT: 'BPS NTB',
  TAGLINE: 'Pusat Data & Statistik Resmi Provinsi Nusa Tenggara Barat',
  CONTACT_EMAIL: 'tim.ukk@ntb.bps.go.id',
  CONTACT_PHONE: '(62-370) 621385',
  ADDRESS: 'Jl. Dr. Soedjono No. 74 Kelurahan Jempong Baru Kecamatan Sekarbela Kota Mataram Nusa Tenggara Barat 83116',

  // Admin (ganti password ini)
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'bpsntb2024',

  // Filter Options
  YEAR_START: 2018,
  YEAR_END: new Date().getFullYear(),
  CATEGORIES: ['Semua', 'Kependudukan', 'Ekonomi', 'Kemiskinan', 'Ketenagakerjaan', 'Pertanian', 'Sosial', 'Umum'],

  // Chart Types for interactive builder
  CHART_TYPES: [
    { id: 'bar', label: 'Bar', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>` },
    { id: 'line', label: 'Garis', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
    { id: 'pie', label: 'Pie', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>` },
    { id: 'doughnut', label: 'Donut', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>` },
    { id: 'radar', label: 'Radar', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="2"/><polyline points="2 8.5 12 12 22 8.5"/></svg>` },
  ],
};

// ============================================================
// DEMO DATA — Data sampel untuk tampilan awal
// Ganti dengan data nyata dari Google Sheet
// ============================================================
const DEMO_DATA = {
  visualizations: [
    {
      id: 1,
      title: 'Pertumbuhan Ekonomi NTB 2018–2024',
      description: 'Laju pertumbuhan PDRB Provinsi NTB dari tahun 2018 hingga 2024 berdasarkan harga konstan.',
      chart_type: 'line',
      is_interactive: true,
      category: 'Ekonomi',
      year: 2024,
      tags: 'PDRB, ekonomi, pertumbuhan',
      featured: true,
      status: 'published',
      data_json: JSON.stringify({
        labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        datasets: [{
          label: 'Pertumbuhan Ekonomi (%)',
          data: [5.21, 4.85, -1.24, 3.12, 4.46, 4.83, 5.10],
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4
        }]
      })
    },
    {
      id: 2,
      title: 'Tingkat Kemiskinan per Kabupaten/Kota 2024',
      description: 'Persentase penduduk miskin di setiap kabupaten/kota di Provinsi NTB tahun 2024.',
      chart_type: 'bar',
      is_interactive: true,
      category: 'Kemiskinan',
      year: 2024,
      tags: 'kemiskinan, kabupaten, kota',
      featured: true,
      status: 'published',
      data_json: JSON.stringify({
        labels: ['Lobar', 'Loteng', 'Lotim', 'KLU', 'Sumbawa', 'Dompu', 'Bima', 'KSB', 'Mataram', 'Kota Bima'],
        datasets: [{
          label: 'Tingkat Kemiskinan (%)',
          data: [13.2, 14.5, 16.8, 28.3, 14.2, 18.9, 17.3, 9.8, 9.5, 8.6],
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(96, 165, 250, 0.8)',
            'rgba(239, 68, 68, 0.8)', 'rgba(37, 99, 235, 0.8)', 'rgba(59, 130, 246, 0.8)',
            'rgba(96, 165, 250, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ],
          borderRadius: 6
        }]
      })
    },
    {
      id: 3,
      title: 'Distribusi Lapangan Usaha PDRB NTB 2024',
      description: 'Komposisi lapangan usaha dalam Produk Domestik Regional Bruto Provinsi NTB tahun 2024.',
      chart_type: 'doughnut',
      is_interactive: true,
      category: 'Ekonomi',
      year: 2024,
      tags: 'PDRB, lapangan usaha, sektor',
      featured: false,
      status: 'published',
      data_json: JSON.stringify({
        labels: ['Pertanian', 'Pertambangan', 'Industri', 'Konstruksi', 'Perdagangan', 'Transportasi', 'Jasa Keuangan', 'Jasa Lainnya'],
        datasets: [{
          label: 'Distribusi PDRB (%)',
          data: [22.1, 18.3, 8.4, 10.2, 13.1, 5.6, 4.8, 17.5],
          backgroundColor: [
            '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA',
            '#93C5FD', '#BFDBFE', '#0EA5E9', '#38BDF8'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      })
    },
    {
      id: 4,
      title: 'Tingkat Pengangguran Terbuka NTB 2019–2024',
      description: 'Perkembangan Tingkat Pengangguran Terbuka (TPT) di Provinsi NTB dari 2019 hingga 2024.',
      chart_type: 'line',
      is_interactive: true,
      category: 'Ketenagakerjaan',
      year: 2024,
      tags: 'pengangguran, TPT, ketenagakerjaan',
      featured: false,
      status: 'published',
      data_json: JSON.stringify({
        labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
        datasets: [
          {
            label: 'TPT NTB (%)',
            data: [3.84, 5.36, 4.89, 4.21, 3.92, 3.74],
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'TPT Nasional (%)',
            data: [5.28, 7.07, 6.49, 5.86, 5.32, 4.91],
            borderColor: '#0EA5E9',
            backgroundColor: 'rgba(14, 165, 233, 0.05)',
            fill: true,
            tension: 0.4,
            borderDash: [5, 5]
          }
        ]
      })
    },
    {
      id: 5,
      title: 'Indikator Kesejahteraan Rakyat NTB 2024',
      description: 'Perbandingan berbagai indikator kesejahteraan rakyat di Provinsi NTB tahun 2024.',
      chart_type: 'radar',
      is_interactive: false,
      category: 'Sosial',
      year: 2024,
      tags: 'kesejahteraan, IPM, sosial',
      featured: false,
      status: 'published',
      data_json: JSON.stringify({
        labels: ['IPM', 'AHH', 'HLS', 'RLS', 'Pengeluaran', 'Elektrifikasi'],
        datasets: [{
          label: 'NTB 2024',
          data: [68.4, 66.8, 14.2, 7.8, 72.3, 91.2],
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: '#2563EB',
          pointBackgroundColor: '#2563EB'
        }, {
          label: 'Nasional 2024',
          data: [73.5, 71.9, 13.1, 8.7, 78.4, 98.7],
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          borderColor: '#0EA5E9',
          pointBackgroundColor: '#0EA5E9'
        }]
      })
    }
  ],

  datasets: [
    {
      id: 1,
      title: 'Data Kemiskinan Kabupaten/Kota NTB 2024',
      description: 'Dataset lengkap indikator kemiskinan meliputi persentase penduduk miskin, garis kemiskinan, dan indeks kemiskinan per kabupaten/kota di Provinsi NTB tahun 2024.',
      category: 'Kemiskinan',
      year: 2024,
      file_url: '#',
      file_size: '1.2 MB',
      file_type: 'XLSX',
      tags: 'kemiskinan, P0, P1, P2, kabupaten',
      featured: true,
      status: 'published'
    },
    {
      id: 2,
      title: 'PDRB Kabupaten/Kota NTB 2019–2024',
      description: 'Produk Domestik Regional Bruto (PDRB) menurut lapangan usaha dan pengeluaran untuk seluruh kabupaten/kota di NTB periode 2019–2024.',
      category: 'Ekonomi',
      year: 2024,
      file_url: '#',
      file_size: '3.8 MB',
      file_type: 'XLSX',
      tags: 'PDRB, ekonomi, lapangan usaha, pengeluaran',
      featured: true,
      status: 'published'
    },
    {
      id: 3,
      title: 'Indikator Ketenagakerjaan NTB 2024',
      description: 'Data Sakernas meliputi TPT, TPAK, upah buruh, dan kondisi ketenagakerjaan Provinsi NTB tahun 2024.',
      category: 'Ketenagakerjaan',
      year: 2024,
      file_url: '#',
      file_size: '2.1 MB',
      file_type: 'CSV',
      tags: 'sakernas, TPT, TPAK, ketenagakerjaan',
      featured: false,
      status: 'published'
    },
    {
      id: 4,
      title: 'Data Kependudukan NTB 2024',
      description: 'Proyeksi penduduk, persebaran, dan struktur demografis Provinsi NTB tahun 2024 berdasarkan SP2020.',
      category: 'Kependudukan',
      year: 2024,
      file_url: '#',
      file_size: '4.5 MB',
      file_type: 'XLSX',
      tags: 'penduduk, demografi, SP2020, proyeksi',
      featured: false,
      status: 'published'
    },
    {
      id: 5,
      title: 'Rekapitulasi UKK Semester I 2024',
      description: 'Data rekapitulasi pelaksanaan kegiatan Unit Kegiatan Khusus (UKK) BPS Provinsi NTB semester I tahun 2024.',
      category: 'Umum',
      year: 2024,
      file_url: '#',
      file_size: '890 KB',
      file_type: 'XLSX',
      tags: 'UKK, rekapitulasi, kegiatan, semester',
      featured: true,
      status: 'published'
    },
    {
      id: 6,
      title: 'Data Harga Konsumen NTB 2023–2024',
      description: 'Perkembangan Indeks Harga Konsumen (IHK) dan laju inflasi Kota Mataram dan Kota Bima tahun 2023–2024.',
      category: 'Ekonomi',
      year: 2024,
      file_url: '#',
      file_size: '1.7 MB',
      file_type: 'CSV',
      tags: 'IHK, inflasi, harga konsumen, Mataram, Bima',
      featured: false,
      status: 'published'
    },
  ],

  publications: [
    {
      id: 1,
      title: 'Laporan Pelaksanaan UKK Semester I 2024',
      author: 'Tim UKK BPS Provinsi NTB',
      description: 'Laporan komprehensif pelaksanaan kegiatan Unit Kegiatan Khusus BPS Provinsi NTB pada semester pertama tahun 2024.',
      category: 'Umum',
      year: 2024,
      file_url: '#',
      tags: 'UKK, laporan, semester I',
      featured: true,
      status: 'published'
    },
    {
      id: 2,
      title: 'Statistik Daerah Provinsi NTB 2024',
      author: 'BPS Provinsi NTB',
      description: 'Publikasi tahunan yang menyajikan informasi dan analisis data statistik daerah Provinsi Nusa Tenggara Barat tahun 2024.',
      category: 'Umum',
      year: 2024,
      file_url: '#',
      tags: 'statistik daerah, profil, NTB',
      featured: true,
      status: 'published'
    },
    {
      id: 3,
      title: 'Analisis Situasi Kemiskinan NTB 2024',
      author: 'Bidang Statistik Sosial BPS NTB',
      description: 'Analisis mendalam mengenai kondisi dan dinamika kemiskinan di Provinsi NTB berdasarkan data Susenas 2024.',
      category: 'Kemiskinan',
      year: 2024,
      file_url: '#',
      tags: 'kemiskinan, susenas, analisis, sosial',
      featured: false,
      status: 'published'
    },
    {
      id: 4,
      title: 'Indikator Kesejahteraan Rakyat NTB 2024',
      author: 'BPS Provinsi NTB',
      description: 'Publikasi yang menyajikan berbagai indikator kesejahteraan rakyat Provinsi NTB mencakup pendidikan, kesehatan, dan ekonomi.',
      category: 'Sosial',
      year: 2024,
      file_url: '#',
      tags: 'kesejahteraan, IPM, sosial, pendidikan, kesehatan',
      featured: false,
      status: 'published'
    },
    {
      id: 5,
      title: 'Profil Kemiskinan NTB Maret 2024',
      author: 'Tim Kemiskinan BPS NTB',
      description: 'Profil detail karakteristik penduduk miskin Provinsi NTB berdasarkan hasil Susenas Maret 2024.',
      category: 'Kemiskinan',
      year: 2024,
      file_url: '#',
      tags: 'profil kemiskinan, karakteristik, Maret 2024',
      featured: true,
      status: 'published'
    },
    {
      id: 6,
      title: 'Laporan Audit Kualitas Data UKK 2023',
      author: 'Tim UKK BPS Provinsi NTB',
      description: 'Laporan hasil audit kualitas data kegiatan UKK BPS Provinsi NTB tahun 2023 beserta rekomendasi perbaikan.',
      category: 'Umum',
      year: 2023,
      file_url: '#',
      tags: 'audit, kualitas data, UKK, 2023',
      featured: false,
      status: 'published'
    },
  ],

  presentations: [
    {
      id: 1,
      title: 'Paparan Rapat Koordinasi Statistik 2024',
      event: 'Rapat Koordinasi Statistik Provinsi NTB',
      presenter: 'Kepala BPS Provinsi NTB',
      description: 'Bahan paparan pada rapat koordinasi statistik tingkat provinsi yang membahas perkembangan indikator makro NTB.',
      year: 2024,
      file_url: '#',
      tags: 'rakorstat, koordinasi, statistik, makro',
      featured: true,
      status: 'published'
    },
    {
      id: 2,
      title: 'Bahan FGD Penghitungan UKK 2024',
      event: 'Focus Group Discussion UKK BPS NTB',
      presenter: 'Tim UKK BPS Provinsi NTB',
      description: 'Bahan diskusi kelompok terfokus mengenai metodologi dan penghitungan kegiatan UKK BPS Provinsi NTB tahun 2024.',
      year: 2024,
      file_url: '#',
      tags: 'FGD, UKK, metodologi, penghitungan',
      featured: true,
      status: 'published'
    },
    {
      id: 3,
      title: 'Diseminasi Data Kemiskinan NTB 2024',
      event: 'Rilis Berita Resmi Statistik BPS NTB',
      presenter: 'Bidang Statistik Sosial',
      description: 'Materi diseminasi Berita Resmi Statistik kemiskinan Provinsi NTB yang dirilis pada September 2024.',
      year: 2024,
      file_url: '#',
      tags: 'diseminasi, kemiskinan, BRS, rilis',
      featured: false,
      status: 'published'
    },
    {
      id: 4,
      title: 'Workshop Metadata Statistik Sektoral 2024',
      event: 'Workshop Metadata & Kualitas Data',
      presenter: 'Tim Metadata BPS NTB',
      description: 'Materi workshop pengisian metadata statistik sektoral untuk keperluan Satu Data Indonesia di lingkungan Provinsi NTB.',
      year: 2024,
      file_url: '#',
      tags: 'metadata, satu data, sektoral, workshop',
      featured: false,
      status: 'published'
    },
    {
      id: 5,
      title: 'Evaluasi Program UKK Semester II 2023',
      event: 'Rapat Evaluasi Internal BPS NTB',
      presenter: 'Tim UKK BPS Provinsi NTB',
      description: 'Paparan evaluasi capaian dan realisasi program kegiatan UKK BPS Provinsi NTB pada semester kedua tahun 2023.',
      year: 2023,
      file_url: '#',
      tags: 'evaluasi, UKK, semester II, capaian',
      featured: false,
      status: 'published'
    },
  ],

  config: {
    site_title: 'Portal Data Tim UKK BPS Provinsi NTB',
    total_datasets: 6,
    total_publications: 6,
    total_visualizations: 5,
    total_presentations: 5,
  }
};
