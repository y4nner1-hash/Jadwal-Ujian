# 🎓 Sistem Penjadwalan Ujian YanNeri v9.1 Ultimate

Aplikasi web untuk tata kelola jadwal ujian akademik (SUP, SHP, dan Tesis) di tingkat pascasarjana. Dibangun sebagai **Single Page Application (SPA)** menggunakan HTML, CSS, dan JavaScript murni — tanpa framework backend.

---

## ✨ Fitur Utama

| Modul | Keterangan |
|-------|------------|
| **Multi-Role Login** | Admin, Dosen, dan Mahasiswa dengan hak akses berbeda |
| **Master Data Dosen** | CRUD data dosen lengkap dengan NIDN |
| **Database Mahasiswa** | Input manual, import/export Excel, bulk edit jadwal |
| **Matriks Jadwal** | Tampilan side-by-side 2 ruangan dengan deteksi bentrok otomatis |
| **Auto-Schedule** | Penjadwalan otomatis berurutan dengan slot waktu & rotasi ruangan |
| **Lock Mechanism** | Kunci jadwal yang sudah ujian agar tidak bisa diedit |
| **Submit Link Tesis** | Mahasiswa bisa mengunggah link Google Drive/Dropbox tesis sendiri |
| **Rekap Honor Dosen** | Export Excel rincian beban membimbing vs menguji |
| **Backup & Restore** | Export/import database dalam format JSON |
| **Dark Mode** | Toggle tema terang/gelap dengan persistensi |
| **Print/PDF Ready** | Layout khusus untuk cetak jadwal bersih |
| **Share WhatsApp** | Kirim pemberitahuan jadwal langsung ke WhatsApp |

---

## 🚀 Cara Deploy ke GitHub Pages (Gratis)

GitHub Pages menyediakan hosting statis gratis dengan subdomain `github.io`. Ikuti langkah berikut:

### 1. Buat Repository Baru
1. Buka [github.com/new](https://github.com/new)
2. Isi **Repository name**: `yanneri-schedule` (atau nama lain)
3. Pilih **Public**
4. Klik **Create repository**

### 2. Upload File ke Repository
**Opsi A: Via Web (Paling Mudah)**
1. Di halaman repo baru, klik **"uploading an existing file"**
2. Drag & drop semua file dari folder ini:
   - `index.html`
   - `css/style.css`
   - `js/app.js`
   - `README.md`
   - `.nojekyll`
3. Klik **Commit changes**

**Opsi B: Via Git Command Line**
```bash
git clone https://github.com/USERNAME/yanneri-schedule.git
cd yanneri-schedule
# copy semua file ke folder ini
git add .
git commit -m "Initial deploy"
git push origin main
```

### 3. Aktifkan GitHub Pages
1. Di repo, masuk ke menu **Settings** → **Pages** (di sidebar kiri)
2. Pada bagian **Build and deployment**:
   - **Source**: Pilih **Deploy from a branch**
   - **Branch**: Pilih `main` → folder `/(root)`
3. Klik **Save**
4. Tunggu 1–2 menit, lalu akses:  
   `https://USERNAME.github.io/yanneri-schedule/`

> **Catatan**: Ganti `USERNAME` dengan username GitHub Anda.

---

## 🛠️ Cara Edit / Kontribusi

Karena file sudah dipisah, Anda bisa mengedit bagian tertentu tanpa risiko merusak yang lain:

| File | Isi | Edit Jika |
|------|-----|-----------|
| `index.html` | Struktur halaman, form, tabel | Mengubah layout atau menambah field baru |
| `css/style.css` | Semua styling, tema, responsive, print | Mengubah warna, font, tampilan mobile, atau layout cetak |
| `js/app.js` | Logika aplikasi, data, fungsi | Mengubah aturan bisnis, menambah fitur, memperbaiki bug |

### Edit Online (Tanpa Install Apa Pun)
1. Buka repo di GitHub
2. Klik file yang ingin diedit (misal: `js/app.js`)
3. Klik ikon pensil **✏️ Edit this file**
4. Lakukan perubahan, scroll ke bawah, isi **Commit changes** → klik **Commit**
5. Perubahan langsung live di website dalam 1–2 menit!

### Edit Lokal (Lebih Nyaman)
1. Clone repo ke komputer
2. Buka folder di VS Code / editor favorit Anda
3. Edit file, lalu commit & push

---

## 📁 Struktur Folder

```
yanneri-schedule/
├── index.html          # Entry point aplikasi
├── css/
│   └── style.css       # Styling & tema
├── js/
│   └── app.js          # Logika & data aplikasi
├── README.md           # Dokumentasi ini
└── .nojekyll           # Menonaktifkan Jekyll (opsional tapi direkomendasikan)
```

---

## 🔐 Informasi Login Default

| Role | Username/Cara Login | Password |
|------|---------------------|----------|
| **Admin** | `admin` | `cucu` |
| **Dosen** | Pilih dari dropdown | — |
| **Mahasiswa** | Pilih dari dropdown | — |

> **Penting**: Ganti password admin di file `js/app.js` sebelum digunakan produksi! Cari `document.getElementById('login-pass').value === 'cucu'`

---

## ⚠️ Catatan Keamanan
- Aplikasi ini berjalan **100% di client-side** (browser). Data disimpan di `localStorage` per browser/perangkat.
- Untuk multi-device sync, aktifkan fitur **Backup/Restore JSON** secara rutin.
- Tidak ada enkripsi data di localStorage. Hindari menyimpan data sensitif sebenarnya jika perangkat bersifat publik.

---

## 📱 Kompatibilitas
- ✅ Chrome / Edge / Firefox / Safari (terbaru)
- ✅ Android Browser & Chrome Mobile
- ✅ iOS Safari
- ⚠️ Internet Explorer tidak didukung

---

## 📝 Lisensi
Proyek ini dibuat untuk keperluan akademik. Bebas digunakan, dimodifikasi, dan didistribusikan ulang untuk kepentingan non-komersial.

---

**Dibangun dengan ❤️ untuk kemudahan tata kelola ujian YanNeri.**
