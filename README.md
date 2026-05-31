# 🎓 Sistem Penjadwalan Ujian YanNeri v9.2 Ultimate

Aplikasi web untuk tata kelola jadwal ujian akademik (SUP, SHP, dan Tesis) di tingkat pascasarjana. Dibangun sebagai **Single Page Application (SPA)** menggunakan HTML, CSS, dan JavaScript murni — tanpa framework backend.

---

## ✨ Fitur Utama v9.2

| Modul | Keterangan |
|-------|------------|
| **Multi-Role Login** | Admin, Dosen, dan Mahasiswa dengan hak akses berbeda |
| **Master Data Dosen** | CRUD data dosen lengkap dengan NIDN |
| **Database Mahasiswa** | Input manual, import/export Excel, bulk edit jadwal, filter status chip |
| **Matriks Jadwal** | Tampilan side-by-side 2 ruangan dengan deteksi bentrok otomatis |
| **Auto-Schedule** | Penjadwalan otomatis berurutan dengan slot waktu & rotasi ruangan |
| **Lock Mechanism** | Kunci jadwal yang sudah ujian agar tidak bisa diedit |
| **Submit Link Tesis** | Mahasiswa bisa mengunggah link Google Drive/Dropbox tesis sendiri |
| **Rekap Honor Dosen** | Export Excel rincian beban membimbing vs menguji |
| **Backup & Restore** | Export/import database dalam format JSON |
| **Dark Mode** | Toggle tema terang/gelap dengan persistensi |
| **Print/PDF Ready** | Layout khusus untuk cetak jadwal bersih, anti-potong, auto-hide ruangan kosong |
| **Share WhatsApp** | Kirim pemberitahuan jadwal individu atau grup ke WhatsApp |
| **Filter Status** | Chip filter: Menunggu Jadwal / Siap Ujian / Selesai / Semua |
| **Sticky Header Tabel** | Header tabel tetap terlihat saat scroll |
| **Collapsible Form** | Form input mahasiswa bisa disembunyikan untuk hemat ruang |
| **Cloud Sync Ready** | Siap integrasi Google Apps Script untuk sinkronisasi antar-perangkat |

---

## 🆕 Apa yang Baru di v9.2?

1. **Filter Status Chip** — Filter mahasiswa berdasarkan status: Menunggu Jadwal (🔴), Siap Ujian (🔵), Selesai (🟢)
2. **Status Badge Klik** — Klik langsung badge status di tabel untuk toggle lock/unlock
3. **Sticky Header** — Header tabel mahasiswa & dosen menempel saat scroll
4. **Collapsible Form** — Form input mahasiswa bisa dibuka/tutup dengan tombol
5. **Share Grup WA** — Admin bisa share seluruh jadwal aktif dalam 1 pesan WhatsApp grup
6. **Label Peran Dinamis** — Moderator/Penelaah untuk SHP, Penguji untuk Tesis
7. **Print Optimized** — Anti-potong halaman, auto-hide ruangan kosong saat cetak
8. **Truncate Judul** — Judul panjang dipotong dengan ellipsis, hover untuk lihat penuh
9. **Bulk Bar Auto-hide** — Panel bulk edit hanya muncul saat ada data terpilih
10. **Cloud Sync** — Siap terhubung ke Google Apps Script untuk sinkronisasi database

---

## 🚀 Deploy ke GitHub Pages (Gratis)

### 1. Buat Repository
1. Buka [github.com/new](https://github.com/new)
2. Isi **Repository name**: `yanneri-schedule`
3. Pilih **Public** → **Create repository**

### 2. Upload File
Drag & drop semua file dari folder ini ke repo:
- `index.html`
- `css/style.css`
- `js/app.js`
- `README.md`
- `.nojekyll`

### 3. Aktifkan GitHub Pages
1. **Settings** → **Pages** (sidebar kiri)
2. **Source**: `Deploy from a branch` → `main` → `/(root)`
3. Klik **Save**
4. Akses: `https://USERNAME.github.io/yanneri-schedule/`

---

## ✏️ Cara Edit

| File | Edit Jika Ingin |
|------|-----------------|
| `index.html` | Ubah layout, tambah field, modifikasi struktur halaman |
| `css/style.css` | Ganti warna tema, font, responsive mobile, layout cetak |
| `js/app.js` | Tambah fitur, ubah aturan bisnis, perbaiki logika |

**Edit Online:** Buka file di GitHub → ikon pensil ✏️ → edit → Commit → auto-update live.

---

## 📁 Struktur Folder

```
yanneri-schedule/
├── index.html          # Entry point (17.8 KB)
├── css/
│   └── style.css       # Styling & tema (9.9 KB)
├── js/
│   └── app.js          # Logika & data (35.2 KB)
├── README.md           # Dokumentasi
└── .nojekyll           # Disable Jekyll processing
```

---

## 🔐 Login Default

| Role | Cara Login | Password |
|------|-----------|----------|
| **Admin** | Username: `admin` | `cucu` |
| **Dosen** | Pilih dari dropdown | — |
| **Mahasiswa** | Pilih dari dropdown | — |

> **Penting:** Ganti password admin di `js/app.js` sebelum produksi! Cari `'cucu'`

---

## ⚠️ Catatan
- Data tersimpan di `localStorage` browser (per-perangkat)
- Gunakan **Backup JSON** rutin untuk keamanan data
- Fitur Cloud Sync memerlukan Google Apps Script terpisah

---

## 📱 Kompatibel
- Chrome / Edge / Firefox / Safari (terbaru)
- Android & iOS browser
- ❌ Internet Explorer tidak didukung

---

**Dibangun untuk kemudahan tata kelola ujian YanNeri.**
