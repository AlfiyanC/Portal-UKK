# Panduan Setup — Portal Data Tim UKK BPS Provinsi NTB

## Prasyarat

- Akun Google (untuk Google Sheets & Google Drive)
- Browser modern (Chrome, Firefox, Edge)

---

## Langkah 1: Buat Google Sheet

1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru
2. Beri nama spreadsheet: **"Portal Data Tim UKK BPS NTB"**
3. Buat **4 tab/sheet** dengan nama persis berikut:
   - `visualizations`
   - `datasets`
   - `publications`
   - `presentations`

---

## Langkah 2: Isi Header Kolom

Isi baris pertama (header) setiap tab seperti berikut:

### Tab `visualizations`
```
id | title | description | chart_type | data_json | is_interactive | category | year | tags | featured | status
```

### Tab `datasets`
```
id | title | description | category | year | file_url | file_size | file_type | tags | featured | status
```

### Tab `publications`
```
id | title | author | description | category | year | file_url | file_type | file_size | tags | featured | status
```
*(Catatan: `file_type` dan `file_size` bersifat opsional. Jika dikosongkan, portal akan mendeteksi format file secara otomatis dari link atau nama dokumen)*

### Tab `presentations`
```
id | title | event | presenter | description | year | file_url | file_type | file_size | tags | featured | status
```
*(Catatan: `file_type` dan `file_size` bersifat opsional. Jika dikosongkan, portal akan mendeteksi format file secara otomatis dari link atau nama dokumen)*

---

## Langkah 3: Atur Izin Akses Google Sheet

1. Klik tombol **"Share"** (Bagikan) di kanan atas
2. Klik **"Change to anyone with the link"**
3. Pastikan role-nya adalah **"Viewer"** (bukan Editor)
4. Klik **Done**

---

## Langkah 4: Ambil Sheet ID

Dari URL Google Sheet Anda, ambil bagian Sheet ID:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit#gid=0
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       Ini adalah SHEET_ID Anda
```

---

## Langkah 5: Konfigurasi Portal

Edit file `js/config.js` dan ubah nilai berikut:

```javascript
const CONFIG = {
  SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms', // ← Paste Sheet ID di sini
  DEMO_MODE: false,  // ← Ubah ke false
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/YOUR_ID/edit', // ← URL Sheet Anda
  DRIVE_FOLDER_URL: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID', // ← URL folder Drive

  // Ganti password admin
  ADMIN_PASSWORD: 'password_baru_yang_kuat',
  ...
};
```

---

## Langkah 6: Upload File ke Google Drive

1. Buka [Google Drive](https://drive.google.com)
2. Buat folder baru bernama **"Portal Data BPS NTB"**
3. Upload file (PDF, XLSX, CSV, PPTX, dll.) ke folder tersebut
4. Klik kanan file → **Share** → **Anyone with the link can view**
5. Salin link, lalu paste ke kolom `file_url` di Google Sheet

---

## Format Data JSON untuk Visualisasi

Kolom `data_json` pada tab `visualizations` harus berisi JSON valid dengan format Chart.js:

### Contoh Bar/Line Chart:
```json
{
  "labels": ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  "datasets": [
    {
      "label": "Pertumbuhan Ekonomi (%)",
      "data": [5.21, 4.85, -1.24, 3.12, 4.46, 4.83, 5.10]
    }
  ]
}
```

### Contoh Pie/Doughnut Chart:
```json
{
  "labels": ["Pertanian", "Industri", "Perdagangan", "Jasa"],
  "datasets": [
    {
      "label": "Distribusi PDRB (%)",
      "data": [22.1, 8.4, 13.1, 17.5]
    }
  ]
}
```

### Contoh Multi-Series:
```json
{
  "labels": ["2019", "2020", "2021", "2022", "2023", "2024"],
  "datasets": [
    {
      "label": "NTB",
      "data": [3.84, 5.36, 4.89, 4.21, 3.92, 3.74]
    },
    {
      "label": "Nasional",
      "data": [5.28, 7.07, 6.49, 5.86, 5.32, 4.91]
    }
  ]
}
```

---

## Cara Menambah Konten Baru (CRUD)

### Tambah Dataset Baru
1. Buka Google Sheet
2. Klik tab `datasets`
3. Tambah baris baru di bawah data terakhir
4. Isi semua kolom (minimal: id, title, description, year, status: published)
5. Upload file ke Google Drive, salin link, paste ke kolom `file_url`
6. Refresh portal → konten baru langsung muncul

### Sembunyikan Konten
- Ubah kolom `status` dari `published` menjadi `draft`

### Tandai sebagai Unggulan
- Ubah kolom `featured` dari `FALSE` menjadi `TRUE`

---

## Hosting / Deployment

Portal ini adalah **static website** — bisa di-host di mana saja:

| Platform | Cara | Biaya |
|---|---|---|
| **Google Sites** | Upload file + embed iframe | Gratis |
| **GitHub Pages** | Push ke repo GitHub | Gratis |
| **Netlify** | Drag & drop folder | Gratis |
| **Vercel** | Connect GitHub repo | Gratis |
| **Web hosting BPS** | Upload via FTP | Sesuai paket |

Untuk membuka lokal: Cukup klik dua kali `index.html` di Windows Explorer.

---

## Informasi Login Admin

- **URL Admin**: `admin.html`
- **Username default**: `admin`
- **Password default**: `bpsntb2024`

> ⚠️ **Segera ganti password default** setelah pertama kali digunakan!
> Edit di file `js/config.js` → nilai `ADMIN_PASSWORD`

---

## FAQ

**Q: Data tidak muncul setelah saya tambah di Google Sheet?**  
A: Pastikan Sheet sudah diset ke "Anyone with link can view". Coba clear browser cache atau Ctrl+Shift+R.

**Q: Chart tidak muncul?**  
A: Periksa format `data_json` — harus berupa JSON valid. Gunakan [JSONLint](https://jsonlint.com) untuk validasi.

**Q: Bagaimana cara share link file Google Drive yang benar?**  
A: Klik kanan file → Share → Change to anyone with link can view → Copy link. Pastikan link mengandung `/view?usp=sharing`.

**Q: Bisa pakai Google Sheets pribadi (bukan akun BPS)?**  
A: Bisa, selama Sheet-nya diset ke publik (Anyone with link can view).

---

*Dibuat untuk Tim UKK BPS Provinsi Nusa Tenggara Barat*
