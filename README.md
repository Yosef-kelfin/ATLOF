# ATLOF — Dokumentasi Lengkap

Dokumentasi aplikasi **ATLOF (Atma Lost & Found)** untuk Pemrograman Web Dasar: frontend XHTML, backend PHP, database MySQL, alur login, laporan barang, dan serah terima barang titipan CS.

Dokumen ini menggabungkan panduan frontend, panduan backend login, serta panduan backend laporan dan serah terima. Nama class dan ID yang dipakai adalah nama yang **sudah ada** di project; tidak ada rename.

Cakupan dokumen:

- 13 halaman `.xhtml`, `css/style.css`, dan logika `js/app.js`.
- Seluruh endpoint PHP dan struktur database `atlof_db`.
- Alur login, hak akses, laporan, serah terima, dan fallback offline.
- Referensi class CSS dan ID HTML, termasuk elemen yang dibuat JavaScript.

## Daftar isi

1. [Ringkasan](#1-ringkasan)
2. [Struktur file](#2-struktur-file)
3. [Cara menjalankan](#3-cara-menjalankan)
4. [Akun uji dan peran](#4-akun-uji-dan-peran)
5. [Backend dan database](#5-backend-dan-database)
6. [Alur komunikasi frontend dan backend](#6-alur-komunikasi-frontend-dan-backend)
7. [Ringkasan sesi dan hak akses](#7-ringkasan-sesi-dan-hak-akses)
8. [API laporan](#8-api-laporan)
9. [API serah terima](#9-api-serah-terima)
10. [Profil dan password](#10-profil-dan-password)
11. [Keamanan backend](#11-keamanan-backend)
12. [Mode offline dan fallback](#12-mode-offline-dan-fallback)
13. [Panduan pengujian cepat](#13-panduan-pengujian-cepat)
14. [Aturan penamaan yang dipakai](#14-aturan-penamaan-yang-dipakai)
15. [Referensi class CSS](#15-referensi-class-css)
16. [Referensi ID per halaman](#16-referensi-id-per-halaman)
17. [ID yang dibuat JavaScript](#17-id-yang-dibuat-javascript)
18. [Contoh kombinasi class](#18-contoh-kombinasi-class)
19. [Catatan penting](#19-catatan-penting)
20. [Perawatan CSS](#20-perawatan-css)

## 1. Ringkasan

ATLOF adalah aplikasi **barang hilang dan ditemukan** untuk lingkungan Universitas Atma Jaya Yogyakarta. Pengguna dapat melaporkan barang hilang atau barang yang ditemukan, mencari barang di katalog, lalu menghubungi pelapor atau CS kampus. Admin CS mengelola barang titipan melalui alur **serah terima**: penerimaan barang, lalu pengembalian kepada pemilik yang sudah diverifikasi.

Komponen utama:

- **Frontend**: 13 halaman XHTML 1.0 Strict dengan CSS di `css/style.css` dan logika di `js/app.js`.
- **Backend**: PHP native (`mysqli`) di root project.
- **Database**: MySQL `atlof_db` dengan tabel `users`, `laporan`, dan `serah_terima`.
- **Sesi**: sesi PHP menjadi sumber kebenaran saat aplikasi dijalankan lewat Apache.
- **Fallback offline**: `localStorage`/`sessionStorage` dipakai hanya jika halaman dibuka lewat `file://` atau server tidak dapat dihubungi.

Fitur utama:

- Registrasi, login, logout, ubah profil, dan ubah password.
- CRUD laporan barang hilang/ditemukan.
- Katalog dengan pencarian dan filter jenis, kategori, lokasi, dan status.
- Halaman detail barang dengan kontak pelapor/CS dan tautan WhatsApp.
- Dashboard Admin CS per kampus.
- Pencatatan penerimaan dan pengembalian barang titipan.
- Riwayat serah terima dengan pencarian, filter, dan navigasi halaman.

## 2. Struktur file

```text
ATLOF_Frontend_Revisi_5/
├── index.xhtml
├── katalog.xhtml
├── buat_laporan.xhtml
├── edit_laporan.xhtml
├── laporan_saya.xhtml
├── detail.xhtml
├── login.xhtml
├── pendaftaran.xhtml
├── profil.xhtml
├── admin_cs.xhtml
├── serah_terima.xhtml
├── riwayat_serah_terima.xhtml
├── akses_akun.xhtml
├── css/
│   └── style.css
├── js/
│   └── app.js
├── fonts/
│   ├── Poppins-400-latin.woff2
│   ├── Poppins-500-latin.woff2
│   ├── Poppins-600-latin.woff2
│   ├── Poppins-700-latin.woff2
│   ├── IBMPlexSans-latin.woff2
│   ├── IBMPlexMono-400-latin.woff2
│   └── IBMPlexMono-600-latin.woff2
├── images/
├── uploads/
│   ├── laporan/
│   └── profil/
├── database/
│   └── atlof_db.sql
├── koneksi.php
├── cek_sesi.php
├── proses_login.php
├── proses_daftar.php
├── logout.php
├── laporan.php
├── serah_terima.php
├── simpan_profil.php
├── ubah_password.php
├── ubah_foto_profil.php
├── README.md
└── PANDUAN_FRONTEND.txt
```

Keterangan folder:

- `images/` berisi aset gambar dan ikon, termasuk `logo-atlof-ikon.svg`.
- `fonts/` berisi font lokal; jangan dihapus agar tampilan tidak bergantung internet.
- `uploads/laporan/` menyimpan foto laporan yang diunggah.
- `uploads/profil/` menyimpan foto profil (endpoint tersedia, UI revisi ini belum memakainya).
- `database/atlof_db.sql` membuat database, tabel, dan data awal.
- `js/app.js` menangani seluruh interaksi frontend dan komunikasi ke endpoint PHP.

## 3. Cara menjalankan

### 3.1 Persiapan XAMPP

1. Pastikan folder project berada di `D:\XAMPP\htdocs\ATLOF_Frontend_Revisi_5`.
2. Buka **XAMPP Control Panel**.
3. Klik **Start** pada modul **Apache** dan **MySQL**.

### 3.2 Import database

1. Buka browser, kunjungi `http://localhost/phpmyadmin`.
2. Pilih menu **Import**.
3. Pilih file `database/atlof_db.sql` dari folder project.
4. Klik tombol **Go / Impor**.

Script tersebut akan membuat database `atlof_db`, tabel `users`, `laporan`, `serah_terima`, dan mengisi data awal. Script memakai `CREATE TABLE IF NOT EXISTS` dan `ON DUPLICATE KEY UPDATE`, sehingga **aman dijalankan ulang** pada database yang sudah ada; data laporan milik pengguna tidak akan ditimpa.

### 3.3 Buka aplikasi

```text
http://localhost/ATLOF_Frontend_Revisi_5/index.xhtml
```

Gunakan alamat `localhost`, bukan `file://`, karena `fetch()` dan sesi PHP hanya bekerja lewat server web. Jangan lupa mengimpor database sebelum mencoba login.

### 3.4 Perilaku jika server tidak aktif

Jika Apache/MySQL mati atau halaman dibuka langsung lewat browser, aplikasi masih menampilkan tampilan dengan data fallback di `localStorage`/`sessionStorage`. Mode ini hanya untuk simulasi UI dan **tidak aman** untuk menyimpan akun atau data sungguhan.

## 4. Akun uji dan peran

Daftar akun di bawah diambil dari tabel `users` pada database `atlof_db` (seed `database/atlof_db.sql`). Password disimpan sebagai hash bcrypt di kolom `users.password`.

Untuk melihat akun yang benar-benar ada di database:

```sql
SELECT id, nama, email, role, kampus_cs
FROM users
ORDER BY id;
```

### 4.1 Ringkasan akun bawaan

| Peran | Email | Password | Keterangan |
|---|---|---|---|
| Admin CS Kampus 1 | `cs1uajy@gmail.com` | `cs1uajyATLOF` | Masuk ke Dashboard CS Kampus 1 |
| Admin CS Kampus 2 | `cs2uajy@gmail.com` | `cs2uajyATLOF` | Masuk ke Dashboard CS Kampus 2 |
| Admin CS Kampus 3 | `cs3uajy@gmail.com` | `cs3uajyATLOF` | Masuk ke Dashboard CS Kampus 3 |
| Admin CS Kampus 4 | `cs4uajy@gmail.com` | `cs4uajyATLOF` | Masuk ke Dashboard CS Kampus 4 |
| Pengguna | `kelvin@students.uajy.ac.id` | `Password123!` | Kelvin Utama |
| Pengguna | `nadia@students.uajy.ac.id` | `Password123!` | Nadia Putri |
| Pengguna | `petugas@uajy.ac.id` | `Password123!` | Petugas Kampus (pelapor contoh) |

Semua akun di atas tersimpan di tabel `users` dan **hanya berlaku saat login lewat Apache/MySQL**.

### 4.2 Admin CS

| Email | Password | Kampus |
|---|---|---|
| `cs1uajy@gmail.com` | `cs1uajyATLOF` | Kampus 1 — Gedung Alfonsus Mrican |
| `cs2uajy@gmail.com` | `cs2uajyATLOF` | Kampus 2 — Gedung Thomas Aquinas |
| `cs3uajy@gmail.com` | `cs3uajyATLOF` | Kampus 3 — Gedung Bonaventura |
| `cs4uajy@gmail.com` | `cs4uajyATLOF` | Kampus 4 — Gedung Theresa |

Setelah login, Admin CS otomatis diarahkan ke `admin_cs.xhtml` dan hanya melihat barang yang dititipkan di kampusnya. Nomor WhatsApp layanan tiap kampus dapat diatur lewat `profil.xhtml`.

### 4.3 Pengguna biasa

| Email | Password | Nama |
|---|---|---|
| `kelvin@students.uajy.ac.id` | `Password123!` | Kelvin Utama |
| `nadia@students.uajy.ac.id` | `Password123!` | Nadia Putri |
| `petugas@uajy.ac.id` | `Password123!` | Petugas Kampus (pelapor contoh) |

Pengguna biasa diarahkan ke halaman tujuan (`?tujuan=...`) atau `index.xhtml`.

### 4.4 Akun tambahan dan fallback

Database dapat berisi akun tambahan hasil pendaftaran lewat `pendaftaran.xhtml`. Akun tersebut tidak dicantumkan di sini karena password-nya hanya diketahui pemilik akun. Untuk melihat seluruh akun yang terdaftar, jalankan query pada bagian awal bab ini.

Akun `cs1@atlof.test` sampai `cs4@atlof.test` dengan password `ATLOFcs2026!` yang disebut di `PANDUAN_FRONTEND.txt` **bukan akun database**. Akun itu hanya dipakai mode offline/fallback saat halaman dibuka lewat `file://` atau server tidak dapat dihubungi. Untuk login lewat Apache, gunakan akun database di tabel 4.1–4.3.

## 5. Backend dan database

### 5.1 File backend

| File | Fungsi |
|---|---|
| `koneksi.php` | Koneksi `mysqli` ke `atlof_db` dengan charset `utf8mb4`; mengembalikan JSON error bila koneksi gagal. |
| `proses_login.php` | Menerima email/password, verifikasi bcrypt, membuat sesi, mengembalikan data user tanpa password. |
| `proses_daftar.php` | Membuat akun pengguna baru, cek duplikat email, hash password. |
| `cek_sesi.php` | Endpoint JSON untuk memeriksa status login dan data user pada sesi PHP. |
| `logout.php` | Menghapus `$_SESSION`, cookie sesi, dan mengarahkan ke beranda. |
| `laporan.php` | API laporan: list, detail, create, update, delete, status user, status CS. |
| `serah_terima.php` | API catatan penerimaan/pengembalian barang titipan CS. |
| `simpan_profil.php` | Memperbarui nama, kontak Teams, dan nomor WhatsApp layanan CS. |
| `ubah_password.php` | Memverifikasi password lama dan menyimpan password baru yang di-hash. |
| `ubah_foto_profil.php` | Mengunggah/menghapus foto profil; endpoint tersedia untuk pemakaian lanjutan. |

### 5.2 Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT` | Primary key, dipakai sebagai `user_id` di tabel lain. |
| `nama` | `VARCHAR(100)` | Nama lengkap atau nama Admin CS. |
| `email` | `VARCHAR(100) UNIQUE` | Email login, disimpan huruf kecil. |
| `password` | `VARCHAR(255)` | Hash bcrypt dari `password_hash()`. |
| `teams` | `VARCHAR(100)` | Kontak Microsoft Teams. |
| `telepon` | `VARCHAR(25)` | Nomor WhatsApp; untuk Admin CS ditampilkan sebagai kontak layanan. |
| `foto` | `VARCHAR(255)` | Path foto profil di `uploads/profil/`. |
| `role` | `ENUM('user','admin_cs')` | Menentukan hak akses dan halaman tujuan. |
| `kampus_cs` | `VARCHAR(50)` | Kampus pelayanan Admin CS. |
| `created_at`, `updated_at` | `TIMESTAMP` | Audit waktu. |

### 5.3 Tabel `laporan`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT` | ID laporan; dipakai di URL `detail.xhtml?id=...`. |
| `user_id` | `INT` | Foreign key ke `users.id`; pelapor tidak disimpan duplikat. |
| `nama_barang` | `VARCHAR(150)` | Nama barang. |
| `jenis` | `ENUM('hilang','ditemukan')` | Jenis laporan. |
| `kategori` | `ENUM('tumbler','pakaian_jaket','elektronik','dompet_kartu','kunci','lainnya')` | Kategori barang. |
| `tanggal` | `DATE` | Tanggal kejadian, disimpan `YYYY-MM-DD`. |
| `lokasi` | `VARCHAR(50)` | `Kampus 1`–`Kampus 4` atau `Lainnya`. |
| `detail_lokasi` | `VARCHAR(150)` | Keterangan bila lokasi `Lainnya`. |
| `penyimpanan` | `VARCHAR(50)` | `CS Kampus 1`–`CS Kampus 4`, `Dibawa penemu`, atau `-`. |
| `status` | `ENUM('masih_dicari','sudah_ditemukan','belum_dikembalikan','sudah_dikembalikan')` | Status laporan. |
| `status_cs` | `ENUM('menunggu','diterima','dikembalikan')` | Status penanganan CS; NULL untuk laporan non-titipan. |
| `deskripsi` | `TEXT` | Ciri umum barang. |
| `foto` | `VARCHAR(255)` | Path foto di `uploads/laporan/`; NULL memakai placeholder kategori. |
| `telepon` | `VARCHAR(25)` | Nomor WhatsApp alternatif pelapor. |
| `created_at`, `updated_at` | `TIMESTAMP` | Audit waktu dan urutan laporan terbaru. |

### 5.4 Tabel `serah_terima`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT` | ID catatan. |
| `laporan_id` | `INT` | Foreign key ke `laporan.id`. |
| `user_id` | `INT` | Foreign key ke `users.id` (Admin CS yang mencatat). |
| `kampus_cs` | `VARCHAR(50)` | Kampus CS pencatat. |
| `jenis` | `ENUM('penerimaan','pengembalian')` | Jenis transaksi. |
| `nama_pihak` | `VARCHAR(100)` | Nama penyerah atau penerima barang. |
| `catatan` | `TEXT` | Keterangan tambahan. |
| `waktu` | `DATETIME` | Waktu transaksi. |
| `created_at`, `updated_at` | `TIMESTAMP` | Audit waktu. |

Tabel ini memiliki `UNIQUE KEY (laporan_id, jenis)`, sehingga satu laporan hanya boleh memiliki satu catatan penerimaan dan satu catatan pengembalian.

### 5.5 Relasi antartabel

```text
users (1) ────< (N) laporan
laporan (1) ──< (N) serah_terima
users (1) ────< (N) serah_terima
```

- `ON DELETE CASCADE`: menghapus user akan menghapus laporan dan catatannya; menghapus laporan akan menghapus catatan serah terimanya.
- Nama, email, dan Teams pelapor **tidak disimpan duplikat** di `laporan`; diambil dari `users` lewat join.

### 5.6 Upload

- Foto laporan: `uploads/laporan/`, maksimal 1 MB, format JPG/PNG/WEBP.
- Foto profil: `uploads/profil/`, maksimal 2 MB, format JPG/PNG/WEBP.
- Pastikan folder dapat ditulis oleh Apache.

## 6. Alur komunikasi frontend dan backend

Bagian ini menjelaskan bagaimana setiap file saling berkomunikasi: halaman XHTML memanggil `js/app.js`, `app.js` memanggil endpoint PHP lewat `fetch()`, PHP mengakses MySQL dengan `mysqli`, lalu mengembalikan JSON yang dipakai untuk memperbarui tampilan.

### 6.1 Model komunikasi

```text
┌──────────────────────────────┐
│ Browser                      │
│  XHTML + CSS + js/app.js     │
└──────────────┬───────────────┘
               │ fetch() / form POST
               │ cookie PHPSESSID
               ▼
┌──────────────────────────────┐
│ Apache + PHP                 │
│  proses_login.php            │
│  proses_daftar.php           │
│  cek_sesi.php                │
│  logout.php                  │
│  laporan.php                 │
│  serah_terima.php            │
│  simpan_profil.php           │
│  ubah_password.php           │
└──────────────┬───────────────┘
               │ mysqli prepared statement
               ▼
┌──────────────────────────────┐
│ MySQL: atlof_db              │
│  users, laporan, serah_terima│
└──────────────┬───────────────┘
               │ hasil query
               ▲
               │ JSON { status, message, data }
               └────────────► Browser
```

Prinsip yang dipakai:

- **Same-origin**: frontend dan backend berada di folder yang sama, sehingga cookie sesi otomatis ikut pada setiap `fetch()`.
- **JSON**: semua endpoint API mengembalikan `Content-Type: application/json`.
- **Sesi PHP**: status login tidak ditentukan oleh JavaScript, tetapi oleh `$_SESSION` di server.
- **Cache di browser**: `cacheLaporan` dan `cacheSerah` menyimpan hasil GET agar tampilan tidak memanggil server berulang kali.
- **Fallback**: bila server tidak dapat dihubungi, `app.js` memakai `localStorage`/`sessionStorage`.

### 6.2 Inisialisasi setiap halaman

Urutan yang dijalankan `app.js` saat halaman dibuka:

1. **Muat `app.js`** dari `<script src="js/app.js">` di akhir `<body>`.
2. **`mulai()`** dijalankan.
3. **`muatSesiServer()`** memanggil `cek_sesi.php`:
   - Jika sesi PHP aktif, data user disalin ke `sessionStorage.atlofAkun`, lalu `atlofMasuk = ya` dan `atlofSesiServer = ya`.
   - Jika sesi PHP tidak aktif dan `atlofSesiServer` pernah diset, sesi lokal dihapus.
   - Jika server tidak merespons, sesi lokal dibiarkan (mode offline).
4. **`cekAksesHalaman()`** memeriksa halaman:
   - Halaman khusus pengguna (`katalog`, `detail`, `buat_laporan`, `edit_laporan`, `laporan_saya`, `profil`, `admin_cs`, `serah_terima`, `riwayat_serah_terima`) akan mengarahkan tamu ke `akses_akun.xhtml`.
   - Halaman khusus admin akan mengarahkan pengguna biasa ke `index.xhtml`.
5. **`pasangHeaderAkun()`** mengganti tombol Masuk/Daftar menjadi Profil/Keluar dan menambah menu Dashboard CS untuk admin.
6. **`pasangTautanAkses()`** mencegat tautan ke halaman khusus bila belum login.
7. **`muatLaporanServer()`** memanggil `laporan.php?aksi=list` dan mengisi `cacheLaporan`.
8. **`muatSerahServer()`** (khusus admin) memanggil `serah_terima.php?aksi=list` dan mengisi `cacheSerah`.
9. **`renderHalaman()`** memanggil fungsi render sesuai elemen yang ada di halaman.

Tabel render per halaman:

| Halaman | Fungsi render | Sumber data |
|---|---|---|
| `index.xhtml` | `tampilkanBeranda()` | `cacheLaporan` |
| `katalog.xhtml` | `filterBarang()` | `cacheLaporan` |
| `detail.xhtml` | `tampilkanDetail()` | `cacheLaporan` |
| `laporan_saya.xhtml` | `perbaruiLaporanSaya()` | `cacheLaporan` |
| `buat_laporan.xhtml` | `aturFormLaporan("form-laporan")` | sesi + `cacheLaporan` |
| `edit_laporan.xhtml` | `aturFormLaporan("form-edit")` | `cacheLaporan` |
| `profil.xhtml` | `perbaruiProfil()` | `sessionStorage.atlofAkun` |
| `admin_cs.xhtml` | `siapkanDashboardCS()` | `cacheLaporan` |
| `serah_terima.xhtml` | `siapkanHalamanSerah()` | `cacheLaporan` + `cacheSerah` |
| `riwayat_serah_terima.xhtml` | `siapkanRiwayatCS()` | `cacheLaporan` + `cacheSerah` |

### 6.3 Alur login

```text
login.xhtml
  form-login submit
        │ fetch POST (email, password, tujuan)
        ▼
proses_login.php
  1. trim + validasi email
  2. SELECT ... FROM users WHERE LOWER(email) = ?
  3. password_verify()
  4. session_regenerate_id(true)
  5. isi $_SESSION
  6. balas JSON { status, message, user, redirect }
        │
        ▼
js/app.js
  - simpan user ke sessionStorage.atlofAkun
  - set atlofMasuk = ya, atlofSesiServer = ya
  - redirect ke admin_cs.xhtml atau halaman tujuan
```

Detail penting:

- `proses_login.php` mendukung form biasa dan `fetch()`. Deteksi dilakukan lewat `Content-Type`, `Accept`, atau `X-Requested-With`.
- Password yang salah tidak pernah mengembalikan data user.
- Jika password di database masih plaintext (misalnya diinput lewat phpMyAdmin), `proses_login.php` melakukan fallback verifikasi lalu otomatis me-rehash dengan `password_hash()`.
- Respons sukses tidak menyertakan kolom `password`.

### 6.4 Alur pendaftaran

```text
pendaftaran.xhtml
  form-daftar submit
        │ validasi di browser (nama, email, teams, password >= 8, konfirmasi)
        │ fetch POST (nama, email, teams, password, konfirmasi, tujuan)
        ▼
proses_daftar.php
  1. validasi field wajib
  2. cek email duplikat
  3. password_hash()
  4. INSERT INTO users
  5. session_regenerate_id(true)
  6. isi $_SESSION
  7. balas JSON { status, user, redirect }
        │
        ▼
js/app.js
  - simpan sesi lokal
  - redirect ke halaman tujuan
```

Jika `proses_daftar.php` tidak dapat dihubungi, `app.js` menjalankan `fallbackDaftarOffline()` dan menyimpan akun di `localStorage.atlofAkunLokal`. Akun ini hanya untuk mode offline.

### 6.5 Alur logout

```text
tombol Keluar
  └─ keluar()
       ├─ hapus atlofMasuk, atlofAkun, atlofSesiServer
       ├─ fetch POST logout.php
       │     ├─ $_SESSION = []
       │     ├─ hapus cookie sesi
       │     └─ session_destroy()
       └─ redirect ke index.xhtml
```

`logout.php` mengembalikan JSON bila dipanggil dengan `X-Requested-With`, atau redirect langsung bila diakses sebagai form biasa.

### 6.6 Alur baca laporan

Pembacaan data dilakukan **sekali di awal halaman**, lalu dipakai ulang oleh beberapa fitur:

| Fitur | Fungsi | Cara mengambil data |
|---|---|---|
| Beranda terbaru | `tampilkanBeranda()` | `semuaLaporan().slice(0, 6)` dari `cacheLaporan` |
| Katalog | `filterBarang()` | `semuaLaporan()` lalu filter di browser |
| Detail | `tampilkanDetail()` | `cariBarang(id)` dari `cacheLaporan` |
| Laporan Saya | `perbaruiLaporanSaya()` | `laporanMilikSaya()` memfilter `cacheLaporan` berdasarkan email |
| Dashboard CS | `tampilkanDashboardCS()` | `daftarBarangCS()` memfilter `cacheLaporan` berdasarkan `penyimpanan = CS <kampus>` |

Catatan: filter katalog (kata kunci, jenis, kategori, lokasi, status) dilakukan di browser, bukan query ulang ke database. Untuk jumlah data kecil ini lebih cepat dan tetap bersumber dari MySQL.

Jika `cacheLaporan` masih `null` karena server gagal, `semuaLaporan()` memakai array contoh di `app.js` dan perubahan status lokal di `sessionStorage`.

### 6.7 Alur tulis laporan

#### Buat laporan

```text
buat_laporan.xhtml
  form-laporan submit
    ├─ validasi field, tanggal, ukuran/tipe foto
    ├─ new FormData(form)
    └─ fetch POST laporan.php?aksi=create
          ├─ cek sesi
          ├─ validasi enum, tanggal, lokasi, penyimpanan
          ├─ upload foto ke uploads/laporan/ (jika ada)
          ├─ INSERT INTO laporan
          └─ JSON data laporan baru
    └─ redirect ke laporan_saya.xhtml
```

#### Edit laporan

- `edit_laporan.xhtml` memuat data awal dari `cariBarang(id)` di `cacheLaporan`.
- Saat submit, `FormData` ditambah `id`, lalu dikirim ke `laporan.php?aksi=update`.
- Server memeriksa `laporan.user_id == $_SESSION['user_id']`. Jika bukan pemilik, respons `403`.
- Jika lokasi penyimpanan berubah, catatan serah terima lama dihapus dan `status_cs` dihitung ulang.

#### Hapus laporan

- `hapusLaporan(id)` mengirim `id` ke `laporan.php?aksi=delete`.
- Server memeriksa kepemilikan, menghapus foto, lalu `DELETE`.
- Foreign key `ON DELETE CASCADE` menghapus catatan serah terima terkait.
- Frontend menghapus item dari `cacheLaporan` dan merender ulang.

#### Ubah status laporan

- `simpanStatus(id)` mengirim `id` dan `status` ke `laporan.php?aksi=status`.
- Server menolak perubahan status untuk barang titipan CS (`penyimpanan = CS Kampus ...`).
- Status yang diizinkan mengikuti jenis: `masih_dicari/sudah_ditemukan` atau `belum_dikembalikan/sudah_dikembalikan`.

### 6.8 Alur serah terima

```text
admin_cs.xhtml
  klik "Kelola serah terima"
        │
        ▼
serah_terima.xhtml?id=ID_LAPORAN
  ├─ muatSesiServer()
  ├─ muatLaporanServer()
  ├─ muatSerahServer()  → serah_terima.php?aksi=list
  └─ siapkanHalamanSerah()
        ├─ barangSerahSaya(id) dari cacheLaporan
        ├─ riwayatUntukBarang(id) dari cacheSerah
        └─ tampilkanHalamanSerah()
```

Saat menyimpan catatan:

```text
form-serah-baru submit
  ├─ validasi nama pihak
  ├─ jika edit: fetch POST serah_terima.php?aksi=update (id, nama_pihak, catatan)
  └─ jika baru:
       ├─ tentukan jenis berikutnya (penerimaan/pengembalian)
       ├─ jika pengembalian, wajib centang verifikasi
       └─ fetch POST serah_terima.php?aksi=create
             (laporan_id, nama_pihak, catatan, cek_verifikasi)
                   │
                   ▼
             server menentukan jenis, INSERT, lalu sinkronStatusLaporan()
                   │
                   ▼
             muatLaporanServer() + muatSerahServer()
             tampilkanHalamanSerah()
```

Aturan yang dijaga server:

- Penerimaan harus lebih dulu; pengembalian tidak bisa dicatat langsung.
- Pengembalian wajib `cek_verifikasi=1`.
- Penerimaan tidak bisa dihapus selama pengembalian masih ada.
- Hanya Admin CS dengan kampus yang sama yang boleh mengubah catatan.

### 6.9 Alur profil dan password

#### Ubah profil

```text
profil.xhtml → form-profil submit
  ├─ validasi nama dan Teams (pengguna) / nomor WhatsApp (admin)
  └─ fetch POST simpan_profil.php (nama, teams, telepon)
        ├─ cek sesi
        ├─ UPDATE users SET nama, teams, telepon
        ├─ perbarui $_SESSION
        └─ JSON user terbaru
  └─ perbarui sessionStorage.atlofAkun + render profil
```

#### Ubah password

```text
profil.xhtml → form-password submit
  ├─ validasi password baru >= 8 dan konfirmasi sama
  └─ fetch POST ubah_password.php
        (password_lama, password_baru, konfirmasi)
        ├─ cek sesi
        ├─ SELECT password FROM users WHERE email = sesi
        ├─ password_verify(password_lama)
        ├─ password_hash(password_baru)
        └─ UPDATE users SET password
```

Jika endpoint gagal, `app.js` memakai pengecekan password lokal sebagai fallback (khusus mode offline).

### 6.10 Alur upload foto

| Jenis | Endpoint | Field | Folder |
|---|---|---|---|
| Foto laporan | `laporan.php?aksi=create/update` | `foto` | `uploads/laporan/` |
| Foto profil | `ubah_foto_profil.php` | `foto` / `action=hapus` | `uploads/profil/` |

Validasi server:

- Ekstensi: `jpg`, `jpeg`, `png`, `webp`.
- MIME type: `image/jpeg`, `image/png`, `image/webp`.
- Ukuran: laporan maksimal 1 MB; profil maksimal 2 MB.
- Nama file dibuat unik dengan `user_id`, timestamp, dan `random_bytes`.
- Foto lama dihapus saat diganti atau dihapus.

### 6.11 Format request dan response

Request API laporan/serah terima memakai `FormData` (multipart) atau `application/x-www-form-urlencoded`. Endpoint juga menerima JSON body untuk pemakaian lanjutan.

Contoh respons sukses:

```json
{
  "status": "success",
  "message": "Laporan berhasil dibuat.",
  "data": {
    "id": 11,
    "nama": "Tas Kanvas",
    "jenis": "hilang",
    "status": "masih_dicari"
  }
}
```

Contoh respons gagal:

```json
{
  "status": "error",
  "message": "Kamu hanya dapat mengubah laporan milikmu sendiri.",
  "data": null
}
```

Kode HTTP yang dipakai:

| Kode | Arti |
|---|---|
| `200` | Berhasil. |
| `400` | Input tidak valid. |
| `401` | Belum login / sesi berakhir. |
| `403` | Tidak punya hak akses. |
| `404` | Data tidak ditemukan. |
| `405` | Method salah. |
| `500` | Kesalahan server/database. |

### 6.12 Penanganan error dan fallback

- `mintaJson()` membungkus `fetch()` dan `res.json()` menjadi `{ ok, data }`.
- `kirimData()` dipakai untuk semua POST dari `app.js`.
- Jika respons `401`, frontend tidak memaksa render data server; `cacheLaporan` tetap `null` dan data lokal dipakai.
- Jika `fetch()` gagal total:
  - Login/daftar memakai fallback offline.
  - Operasi tulis menampilkan pesan “Gagal menghubungi server.”
  - Halaman baca memakai data contoh di `app.js`.
- Setelah operasi tulis berhasil, frontend biasanya memuat ulang data dari server (`muatLaporanServer`, `muatSerahServer`) atau memperbarui `cacheLaporan` secara langsung.

### 6.13 Ringkasan komunikasi per file

| File | Dipanggil oleh | Endpoint | Data yang dikirim | Hasil |
|---|---|---|---|---|
| `login.xhtml` | pengguna | `proses_login.php` | email, password, tujuan | sesi + redirect |
| `pendaftaran.xhtml` | pengguna | `proses_daftar.php` | nama, email, teams, password, konfirmasi | akun + sesi |
| `js/app.js` (setiap halaman) | otomatis | `cek_sesi.php` | cookie sesi | data user / guest |
| `js/app.js` (logout) | tombol Keluar | `logout.php` | cookie sesi | sesi dihapus |
| `katalog.xhtml` | `filterBarang()` | `laporan.php?aksi=list` | cookie sesi | `cacheLaporan` |
| `detail.xhtml` | `tampilkanDetail()` | `laporan.php?aksi=list` | cookie sesi | `cacheLaporan` |
| `buat_laporan.xhtml` | form | `laporan.php?aksi=create` | field laporan + foto | laporan baru |
| `edit_laporan.xhtml` | form | `laporan.php?aksi=update` | field laporan + id | laporan diperbarui |
| `laporan_saya.xhtml` | tombol aksi | `laporan.php?aksi=status/delete` | id + status | status/hapus |
| `admin_cs.xhtml` | dashboard | `laporan.php?aksi=list` | cookie sesi | `cacheLaporan` |
| `serah_terima.xhtml` | form | `serah_terima.php?aksi=create/update/delete` | catatan serah terima | catatan + status laporan |
| `riwayat_serah_terima.xhtml` | halaman | `serah_terima.php?aksi=list` | cookie sesi | `cacheSerah` |
| `profil.xhtml` | form | `simpan_profil.php` | nama, teams, telepon | profil diperbarui |
| `profil.xhtml` | form | `ubah_password.php` | password lama/baru | password diperbarui |
| `profil.xhtml` | input foto (endpoint tersedia, UI belum memakainya) | `ubah_foto_profil.php` | file foto | path foto |

## 7. Ringkasan sesi dan hak akses

### 7.1 Data sesi PHP

| Key `$_SESSION` | Isi |
|---|---|
| `is_logged_in` | `true` setelah login berhasil. |
| `user_id` | ID user di tabel `users`. |
| `nama` | Nama lengkap. |
| `email` | Email login. |
| `role` | `user` atau `admin_cs`. |
| `kampus_cs` | Kampus pelayanan untuk Admin CS. |
| `teams` | Kontak Microsoft Teams. |
| `telepon` | Nomor WhatsApp layanan/user. |
| `foto` | Path foto profil. |

Sesi ini dibuat oleh `proses_login.php`/`proses_daftar.php`, dibaca oleh `cek_sesi.php`, dan dihapus oleh `logout.php`.

### 7.2 Matriks akses halaman

| Halaman | Tamu | Pengguna | Admin CS |
|---|---|---|---|
| `index.xhtml`, `katalog.xhtml`, `akses_akun.xhtml` | Boleh | Boleh | Boleh |
| `detail.xhtml`, `laporan_saya.xhtml`, `buat_laporan.xhtml`, `edit_laporan.xhtml`, `profil.xhtml` | Diarahkan ke `akses_akun.xhtml` | Boleh | Boleh |
| `admin_cs.xhtml`, `serah_terima.xhtml`, `riwayat_serah_terima.xhtml` | Diarahkan ke `akses_akun.xhtml` | Diarahkan ke `index.xhtml` | Boleh |

Pengecekan di browser dilakukan `cekAksesHalaman()`. Pengecekan sebenarnya tetap dilakukan server pada setiap endpoint (`401` untuk tamu, `403` untuk role/kepemilikan yang salah).

### 7.3 Aturan redirect

- Login Admin CS → `admin_cs.xhtml`.
- Login pengguna → `?tujuan=...` bila valid, atau `index.xhtml`.
- Tamu membuka halaman khusus → `akses_akun.xhtml?tujuan=<halaman>`.
- Pengguna biasa membuka halaman admin → `index.xhtml`.
- Logout → `index.xhtml`.

### 7.4 Siklus sesi

1. **Masuk**: `proses_login.php` membuat sesi dan `session_regenerate_id(true)`.
2. **Pindah halaman**: `cek_sesi.php` memulihkan data sesi ke `sessionStorage`.
3. **Sesi berakhir**: `cek_sesi.php` mengembalikan `guest`; jika `atlofSesiServer` pernah diset, sesi lokal dihapus.
4. **Keluar**: `logout.php` menghancurkan sesi dan cookie; frontend menghapus `atlofMasuk`, `atlofAkun`, dan `atlofSesiServer`.

## 8. API laporan

Semua endpoint memerlukan sesi login. Format respons umum:

```json
{
  "status": "success",
  "message": "OK",
  "data": [ ... ]
}
```

### 8.1 Endpoint

| Method | URL | Keterangan |
|---|---|---|
| GET | `laporan.php?aksi=list` | Semua laporan, urut dari terbaru. |
| GET | `laporan.php?aksi=list&q=kata` | Pencarian nama, deskripsi, atau lokasi. |
| GET | `laporan.php?aksi=list&jenis=&kategori=&lokasi=&status=` | Filter field tertentu. |
| GET | `laporan.php?aksi=list&terbaru=1` | Enam laporan terbaru untuk beranda. |
| GET | `laporan.php?aksi=list&saya=1` | Laporan milik pengguna yang sedang masuk. |
| GET | `laporan.php?aksi=list&cs=1` | Barang titipan kampus Admin CS; khusus `admin_cs`. |
| GET | `laporan.php?aksi=detail&id=1` | Detail satu laporan. |
| POST | `laporan.php?aksi=create` | Buat laporan baru. |
| POST | `laporan.php?aksi=update` | Ubah laporan milik sendiri. |
| POST | `laporan.php?aksi=delete` | Hapus laporan milik sendiri. |
| POST | `laporan.php?aksi=status` | Ubah `status` laporan milik sendiri. |
| POST | `laporan.php?aksi=status_cs` | Ubah `status_cs` oleh Admin CS. |

### 8.2 Field form

Nama field mengikuti markup XHTML:

| Field form | Keterangan |
|---|---|
| `jenis` | `hilang` atau `ditemukan` (radio). |
| `nama-barang` | Nama barang, wajib. |
| `kategori` | Salah satu nilai enum kategori. |
| `tanggal` | Format `dd-mm-yyyy`; server mengonversi ke `YYYY-MM-DD`. |
| `lokasi` | `Kampus 1`–`Kampus 4` atau `Lainnya`. |
| `detail-lokasi` | Wajib bila `lokasi = Lainnya`. |
| `penyimpanan` | Wajib bila `jenis = ditemukan`; diabaikan untuk `hilang`. |
| `deskripsi` | Ciri umum barang, wajib. |
| `telepon` | Opsional. |
| `foto` | Opsional, `multipart/form-data`. |
| `id` | Dikirim pada `update`, `delete`, `status`, dan `status_cs`. |

### 8.3 Aturan server

- Buat/update/delete/status hanya boleh dilakukan oleh pemilik laporan (`user_id` harus sama dengan sesi), kecuali `status_cs` yang hanya untuk Admin CS.
- Laporan ditemukan yang dititipkan ke `CS Kampus ...` tidak boleh diubah status pengembaliannya oleh pengguna; statusnya dikelola CS.
- `status_cs` hanya bisa diubah oleh Admin CS dan hanya untuk barang dengan `penyimpanan = CS <kampusnya>`.
- Transisi `menunggu → dikembalikan` ditolak; penerimaan harus dicatat terlebih dahulu.
- Saat jenis atau lokasi penyimpanan diubah, catatan serah terima lama dihapus dan `status_cs` dihitung ulang.
- Field tanggal divalidasi dengan `checkdate()` sebelum disimpan.
- Upload foto divalidasi berdasarkan ekstensi, MIME type, dan ukuran.

## 9. API serah terima

Khusus Admin CS. Semua endpoint memerlukan role `admin_cs`.

### 9.1 Endpoint

| Method | URL | Keterangan |
|---|---|---|
| GET | `serah_terima.php?aksi=list` | Semua catatan kampus Admin CS. |
| GET | `serah_terima.php?aksi=list&laporan_id=1` | Riwayat satu barang. |
| POST | `serah_terima.php?aksi=create` | Catat penerimaan/pengembalian. |
| POST | `serah_terima.php?aksi=update` | Ubah `nama_pihak` dan `catatan`. |
| POST | `serah_terima.php?aksi=delete` | Hapus catatan. |

Field create: `laporan_id`, `nama_pihak`, `catatan`, dan `cek_verifikasi` untuk pengembalian.
Field update: `id`, `nama_pihak`, `catatan`.
Field delete: `id`.

### 9.2 Aturan

- Penerimaan harus dicatat lebih dulu; server menentukan `jenis` otomatis dari catatan yang sudah ada.
- Pengembalian wajib mengirim `cek_verifikasi=1`.
- Penerimaan tidak dapat dihapus selama catatan pengembalian masih ada.
- Catatan hanya dapat diubah/dihapus oleh Admin CS kampus yang bersangkutan.
- Barang harus berada di `CS <kampus Admin CS>` agar dapat dicatat.

### 9.3 Sinkronisasi status

Setiap create/delete memanggil `sinkronStatusLaporan()`:

| Catatan yang ada | `status_cs` | `status` |
|---|---|---|
| Belum ada | `menunggu` | `belum_dikembalikan` |
| Penerimaan saja | `diterima` | `belum_dikembalikan` |
| Penerimaan + pengembalian | `dikembalikan` | `sudah_dikembalikan` |

Frontend membaca hasil ini dari API `laporan.php`, sehingga Dashboard CS, Laporan Saya, dan halaman detail selalu konsisten.

## 10. Profil dan password

### 10.1 `simpan_profil.php`

Menerima `nama`, `teams`, dan `telepon`.

- Nama wajib diisi.
- Pengguna biasa wajib mengisi `teams`; nomor `telepon` tidak diubah.
- Admin CS boleh mengosongkan `teams` dan dapat mengubah `telepon` layanan kampusnya.
- Nomor divalidasi dengan pola `+?` diikuti 8–18 karakter angka, spasi, atau tanda hubung.
- Data yang berhasil disimpan juga diperbarui di `$_SESSION` dan `sessionStorage.atlofAkun`.

Nomor WhatsApp Admin CS ditampilkan di `detail.xhtml` untuk barang yang dititipkan di kampusnya.

### 10.2 `ubah_password.php`

- Menerima `password_lama`, `password_baru`, `konfirmasi`.
- Password baru minimal 8 karakter dan harus sama dengan konfirmasi.
- Password lama diverifikasi dengan `password_verify()`.
- Password baru disimpan dengan `password_hash(..., PASSWORD_DEFAULT)`.

### 10.3 `ubah_foto_profil.php`

Mendukung unggah dan penghapusan foto. Endpoint ini sudah tersedia, tetapi UI `profil.xhtml` revisi ini belum menampilkan kontrol unggah foto.

## 11. Keamanan backend

1. **Prepared statement** — seluruh query dengan input pengguna memakai `mysqli_prepare()` dan `mysqli_stmt_bind_param()` untuk mencegah SQL injection.
2. **Password hash** — password tidak pernah disimpan plaintext; `password_hash()` saat daftar/ubah password dan `password_verify()` saat login.
3. **Session fixation protection** — `session_regenerate_id(true)` setelah login dan pendaftaran.
4. **Validasi server-side** — email, tanggal, enum, panjang teks, format nomor, ukuran dan MIME file dicek ulang di server, bukan hanya di browser.
5. **Pengecekan hak akses** — role Admin CS hanya berlaku untuk dashboard/serah terima; kepemilikan laporan dicek untuk edit/hapus/status; kampus CS dicek untuk status penanganan.
6. **Dual-mode request** — endpoint menerima form biasa maupun `fetch()`/AJAX, dengan deteksi header `X-Requested-With`, `Accept`, atau `Content-Type`.
7. **Fallback offline** — aplikasi tetap bisa ditampilkan lewat `file://`, tetapi autentikasi dan kontrol akses tidak berlaku dalam mode ini.

Yang **belum** ada: token CSRF, pembatasan percobaan login, dan verifikasi email. Password seed hanya untuk pengujian lokal dan tidak boleh dipakai di server publik.

## 12. Mode offline dan fallback

`js/app.js` menetapkan `modeServer = true` hanya ketika protokol halaman `http:` atau `https:`. Jika `false`, seluruh data diambil dari browser.

| Penyimpanan | Isi |
|---|---|
| `sessionStorage.atlofMasuk` | Penanda sudah masuk. |
| `sessionStorage.atlofAkun` | Nama, email, role, kampus, Teams, telepon, foto. |
| `sessionStorage.atlofSesiServer` | Penanda bahwa sesi berasal dari login PHP. |
| `sessionStorage.atlofLaporan` | Laporan buatan pengguna saat offline. |
| `sessionStorage.atlofPerubahanContoh` | Perubahan status pada data contoh. |
| `sessionStorage.atlofSerahTerima` | Catatan serah terima saat offline. |
| `sessionStorage.atlofKontakAdmin` | Nomor layanan CS saat offline. |
| `localStorage.atlofAkunLokal` | Akun uji offline. |
| `localStorage.atlofPasswordCS` | Password uji Admin CS offline. |

Aturan fallback:

- `muatSesiServer()` dipanggil lebih dulu; jika sesi PHP berakhir dan penanda `atlofSesiServer` ada, sesi lokal dihapus.
- `muatLaporanServer()` mengisi `cacheLaporan`; bila gagal, `cacheLaporan` tetap `null` dan `semuaLaporan()` memakai data contoh/local.
- `muatSerahServer()` melakukan hal yang sama untuk `cacheSerah`.
- Katalog, beranda, detail, dan dashboard memakai `cacheLaporan` bila tersedia; filter katalog dilakukan di browser atas data yang sudah dimuat dari database.

## 13. Panduan pengujian cepat

1. Import `database/atlof_db.sql` lewat phpMyAdmin.
2. Buka `http://localhost/ATLOF_Frontend_Revisi_5/login.xhtml`.
3. Login sebagai `cs1uajy@gmail.com` / `cs1uajyATLOF`. Pastikan masuk ke Dashboard CS Kampus 1.
4. Di Dashboard CS, cari/filter barang titipan, lalu buka **Kelola serah terima** pada laporan `#10`.
5. Catat penerimaan, lalu pengembalian dengan mencentang verifikasi. Cek di `laporan.php?aksi=detail&id=10` bahwa status berubah menjadi `sudah_dikembalikan`.
6. Buka `riwayat_serah_terima.xhtml` untuk melihat catatan kampus tersebut.
7. Logout, lalu login sebagai `kelvin@students.uajy.ac.id` / `Password123!`.
8. Buat laporan baru, ubah di `Laporan Saya`, coba status, lalu hapus. Cek di phpMyAdmin bahwa baris di `laporan` ikut berubah.
9. Buka `profil.xhtml`, ubah nama/Teams/password, lalu cek kembali lewat `cek_sesi.php`.

Contoh pengecekan API dengan `curl`. Login dulu untuk menyimpan cookie sesi, lalu panggil endpoint:

```bash
curl -c cookie.txt -H "X-Requested-With: XMLHttpRequest" \
  -d "email=cs1uajy@gmail.com&password=cs1uajyATLOF" \
  "http://localhost/ATLOF_Frontend_Revisi_5/proses_login.php"

curl -b cookie.txt "http://localhost/ATLOF_Frontend_Revisi_5/laporan.php?aksi=list&saya=1"

curl -b cookie.txt "http://localhost/ATLOF_Frontend_Revisi_5/serah_terima.php?aksi=list&laporan_id=10"

curl -b cookie.txt -d "id=3&status=diterima" \
  "http://localhost/ATLOF_Frontend_Revisi_5/laporan.php?aksi=status_cs"
```

Endpoint `laporan.php?aksi=status_cs` dipakai untuk status penanganan CS; endpoint `serah_terima.php` dipakai untuk mencatat riwayat penerimaan/pengembalian.

## 14. Aturan penamaan yang dipakai

- **Class** dipakai untuk styling dan penanda struktur.
- **ID** dipakai sebagai hook JavaScript, target `label for`, dan penanda elemen unik.
- Sebagian class dan ID dibuat langsung oleh `js/app.js`, bukan ditulis di file `.xhtml`.
- Prefix yang sudah dipakai:
  - `halaman-` untuk scope halaman.
  - `tombol-` untuk varian tombol.
  - `kartu-` untuk kartu.
  - `baris-` untuk baris layout.
  - `panel-` untuk panel.
  - `footer-` untuk bagian footer.
  - `admin-` dan `cs` untuk Dashboard CS.
- ID harus unik dalam satu halaman. ID yang sama boleh muncul di halaman berbeda.

## 15. Referensi class CSS

### 15.1 Class global dan layout

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `container` | Pembungkus konten dengan lebar maksimum 1280px | Semua halaman |
| `bagian` | Memberi padding atas dan bawah pada isi halaman | `admin_cs`, `buat_laporan`, `detail`, `edit_laporan`, `index`, `katalog`, `laporan_saya`, `profil` |
| `subjudul` | Teks pengantar abu-abu di bawah judul | `admin_cs`, `buat_laporan`, `edit_laporan`, `katalog`, `laporan_saya`, `login`, `pendaftaran` |
| `teks-abu` | Teks sekunder berwarna abu-abu | `admin_cs`, `detail`, `index`, `katalog` |
| `teks-emas` | Teks aksen emas | 11 halaman; `pendaftaran` dan `profil` memakai `footer-pesan` |
| `label-kecil` | Label kecil huruf kapital di atas judul | `admin_cs`, `login`, `pendaftaran` |
| `link-kembali` | Tautan kembali ke halaman sebelumnya | `akses_akun`, `detail` |
| `judul-bagian` | Baris judul dan tombol aksi di atas konten | `admin_cs`, `index`, `katalog`, `laporan_saya` |
| `judul-terpusat` | Judul dan deskripsi rata tengah | `index` |
| `pengantar` | Blok pengantar halaman | `buat_laporan`, `edit_laporan`, `katalog` |
| `form-besar` | Kartu form lebar | `buat_laporan`, `edit_laporan`, `profil` |
| `grid-barang` | Grid kartu barang | `index`, `katalog`, `laporan_saya` |
| `grid-katalog` | Grid kartu khusus halaman katalog | `katalog` |
| `layout-katalog` | Grid dua kolom: panel filter dan daftar barang | `katalog` |
| `statistik` | Baris ringkasan angka laporan | `laporan_saya` |
| `kosong` | Kotak keadaan kosong | `admin_cs`, `katalog`, `laporan_saya` |
| `katalog-page` | Penanda halaman katalog; belum punya aturan CSS | `katalog` |

### 15.2 Header dan navigasi

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `header-utama` | Header biru yang menempel di atas saat scroll | Semua halaman |
| `navbar` | Baris navigasi utama | Semua halaman |
| `logo` | Blok merek ATLOF berisi ikon SVG dan teks | Semua halaman |
| `menu-links` | Menu navigasi utama | Semua halaman |
| `menu-akun` | Area tombol akun di kanan header | Semua halaman |
| `aktif` | Menandai link navigasi yang sedang dibuka | `buat_laporan`, `detail`, `edit_laporan`, `index`, `katalog`, `laporan_saya`, dan link Dashboard CS yang dibuat JavaScript |
| `tombol-keluar` | Varian tombol keluar di header | Dibuat JavaScript setelah login |

### 15.3 Tombol dan baris aksi

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `tombol` | Class dasar semua tombol | Semua halaman |
| `tombol-kuning` | Tombol utama berwarna kuning | Semua halaman |
| `tombol-outline` | Tombol sekunder bergaris | Semua halaman |
| `tombol-putih` | Tombol putih untuk latar gelap | `index` |
| `tombol-kecil` | Tombol ukuran kecil | Semua halaman |
| `tombol-bahaya` | Tombol untuk aksi berbahaya seperti hapus | `profil` dan tombol Hapus yang dibuat `app.js` |
| `lebar-penuh` | Membuat tombol atau tautan selebar container | `katalog`, `login`, `pendaftaran` |
| `aksi` | Baris berisi beberapa tombol | `akses_akun`, `buat_laporan`, `edit_laporan`, `index`, `profil` |
| `aksi-form` | Baris aksi di bagian bawah form | `buat_laporan`, `edit_laporan` |
| `aksi-tengah` | Baris aksi rata tengah | `akses_akun` |
| `aksi-kelola` | Baris tombol Edit dan Hapus di bawah panel status, masih dalam satu kartu laporan | Dibuat `app.js` di `laporan_saya` |
| `batal-profil` | Penanda tombol Batal pada form profil; belum punya aturan CSS | `profil` |
| `lihat-password` | Hook checkbox untuk menampilkan password; belum punya aturan CSS | `login`, `pendaftaran` |

### 15.4 Beranda

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `hero` | Bagian pembuka berwarna biru | `index` |
| `hero-isi` | Isi teks dan tombol di dalam hero | `index` |
| `bagian-cara` | Seksi penjelasan cara kerja ATLOF | `index` |
| `bagian-terbaru` | Seksi laporan barang terbaru | `index` |
| `tiga-langkah` | Grid tiga langkah | `index` |
| `kartu-langkah` | Kartu satu langkah | `index` |
| `nomor-langkah` | Nomor urut langkah | `index` |

### 15.5 Katalog

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `pencarian` | Kotak form pencarian | `katalog` |
| `baris-pencarian` | Baris input pencarian dan tombol cari | `katalog` |
| `panel-filter` | Panel filter yang menempel saat scroll | `katalog` |
| `daftar-barang` | Pembungkus daftar hasil pencarian; belum punya aturan CSS | `katalog` |
| `field` | Grup label dan input pada filter | `katalog` |

### 15.6 Form dan input

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `halaman-form` | Scope halaman form buat dan edit laporan | `buat_laporan`, `edit_laporan` |
| `field` | Grup label, input, dan teks bantuan | `buat_laporan`, `edit_laporan`, `katalog`, `login`, `pendaftaran`, `profil` |
| `dua-kolom` | Grid dua kolom untuk field | `buat_laporan`, `edit_laporan` |
| `pilih-jenis` | Grup radio untuk jenis laporan | `buat_laporan`, `edit_laporan` |
| `judul-form` | Judul di dalam kartu form | `buat_laporan`, `edit_laporan` |
| `bantuan` | Teks bantuan kecil di bawah input | `buat_laporan`, `detail`, `edit_laporan`, `login`, `profil` |

| `centang` | Label untuk checkbox | `login`, `pendaftaran` |
| `panel-form` | Panel form yang bisa dibuka dan ditutup | `profil` |
| `catatan` | Kotak catatan verifikasi barang | `detail` |

### 15.7 Kalender

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `tanggal-pilih` | Pembungkus input tanggal; klik input membuka kalender | `buat_laporan`, `edit_laporan` |
| `kalender` | Panel kalender yang muncul di bawah input | `buat_laporan`, `edit_laporan` |
| `kalender-atas` | Header kalender berisi tombol bulan dan nama bulan | `buat_laporan`, `edit_laporan` |
| `kalender-grid` | Grid tujuh kolom untuk tanggal | `buat_laporan`, `edit_laporan` |
| `nama-hari` | Label nama hari di kalender | Dibuat `app.js` |
| `pilih-hari` | Tombol satu tanggal di kalender | Dibuat `app.js` |
| `tanggal-kosong` | Sel kosong sebelum tanggal pertama; belum punya aturan CSS | Dibuat `app.js` |

### 15.8 Kartu barang

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `kartu-barang` | Kartu satu barang | Dibuat `app.js` untuk beranda, katalog, dan laporan saya |
| `gambar-barang` | Tautan pembungkus gambar barang | Dibuat `app.js` |
| `isi-kartu` | Bagian teks di dalam kartu barang | Dibuat `app.js` |
| `lencana-baris` | Baris berisi lencana jenis barang | `detail` dan dibuat `app.js` |
| `lencana` | Lencana kecil (IBM Plex Sans 11px) untuk jenis barang dan status | `detail` dan dibuat `app.js` |
| `hilang` | Modifier lencana untuk laporan hilang | Dibuat `app.js` melalui `class="lencana ' + b.jenis + '"` |
| `ditemukan` | Modifier lencana untuk laporan ditemukan | Dibuat `app.js` melalui `class="lencana ' + b.jenis + '"` |
| `kartu-kelola` | Satu kartu laporan di Laporan Saya: info barang, panel status, dan tombol aksi | Dibuat `app.js` |
| `pengaturan-status` | Panel "Ubah status laporan": label di atas, dropdown dan tombol "Simpan status" sejajar | Dibuat `app.js` |
| `catatan-status` | Catatan bahwa status dikelola CS, menggantikan panel status | Dibuat `app.js` |

### 15.9 Detail barang

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `detail-grid` | Grid dua kolom: foto dan informasi barang | `detail` |
| `foto-detail` | Kartu pembungkus foto barang | `detail` |
| `kotak-detail` | Kartu informasi detail barang | `detail` |
| `tabel-detail` | Tabel spesifikasi barang | `detail` |
| `kontak-detail` | Blok kontak pelapor atau CS | `detail` |
| `kontak-whatsapp` | Kotak kontak WhatsApp | `detail` |
| `catatan` | Catatan verifikasi kepemilikan | `detail` |

### 15.10 Profil

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `halaman-profil` | Scope halaman profil | `profil` |
| `profil-container` | Pembungkus konten profil | `profil` |
| `profil-atas-judul` | Judul halaman profil | `profil` |
| `profil-kartu` | Kartu utama profil | `profil` |
| `profil-atas` | Header kartu berisi avatar dan nama | `profil` |
| `avatar` | Lingkaran inisial pengguna | `profil` |
| `profil-identitas` | Grid data identitas | `profil` |
| `detail-identitas` | Satu baris data identitas: label di kiri, nilai di kanan | `profil` |
| `nilai-kosong` | Penanda nilai belum terisi; miring dan abu-abu | `profil`, class diatur `app.js` |
| `label-peran` | Lencana peran Admin CS | `profil` |
| `profil-tombol` | Pembungkus tombol profil; belum punya aturan CSS | `profil` |
| `tombol-bahaya` | Tombol Keluar berwarna merah | `profil` |

### 15.11 Autentikasi

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `grid-akun` | Grid dua kolom: panel informasi dan kartu form | `login`, `pendaftaran` |
| `panel-samping` | Panel informasi berwarna biru di kiri | `login`, `pendaftaran` |
| `panel-tengah` | Modifier `panel-samping` di pendaftaran: lebar dan padding tetap sama seperti login, kotak dipusatkan (`align-self: center`) dengan tinggi minimal 440px, tidak mengikuti tinggi form | `pendaftaran` |
| `kotak-form` | Kartu form autentikasi | `login`, `pendaftaran` |
| `halaman-akses` | Scope halaman persyaratan akses | `akses_akun` |
| `kotak-akses` | Kartu ajakan masuk atau daftar | `akses_akun` |
| `aksi-tengah` | Baris tombol rata tengah | `akses_akun` |

### 15.12 Dashboard CS

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `halaman-admin` | Scope halaman Dashboard CS | `admin_cs` |
| `dashboard-cs` | Penanda dan scope tambahan Dashboard CS | `admin_cs` |
| `judul-dashboard` | Baris judul dan tombol aksi Dashboard CS | `admin_cs` |
| `tombol-dashboard` | Grup tombol "+ Buat laporan" dan "Riwayat serah terima" | `admin_cs` |
| `ringkasan-admin` | Grid empat kartu ringkasan | `admin_cs` |
| `angka-admin` | Satu kartu angka ringkasan | `admin_cs` |
| `panel-admin` | Panel judul dan kontak CS | `admin_cs` |
| `baris-kontak-cs` | Baris nomor WhatsApp layanan CS | `admin_cs` |
| `filter-dashboard` | Baris pencarian dan filter status barang titipan | `admin_cs` |
| `cari-dashboard` | Kolom pencarian nama atau ID barang | `admin_cs` |
| `status-dashboard` | Kolom filter status penanganan | `admin_cs` |
| `jumlah-hasil-admin` | Teks jumlah barang yang cocok dengan filter | `admin_cs` |
| `daftar-admin` | Wadah daftar barang titipan | `admin_cs` |
| `baris-admin` | Satu baris barang titipan | Dibuat `app.js` |
| `info-admin` | Bagian foto dan info barang | Dibuat `app.js` |
| `kontrol-admin` | Tombol "Kelola serah terima" per barang | Dibuat `app.js` |
| `halaman-dashboard` | Baris navigasi halaman daftar barang | `admin_cs` |

### 15.13 Footer

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `footer-utama` | Footer biru tua | Semua halaman |
| `footer-isi` | Grid isi footer | Semua halaman |
| `footer-tentang` | Kolom tentang ATLOF; belum punya aturan CSS | Semua halaman |
| `footer-merk` | Blok merek di footer | Semua halaman |
| `footer-menu` | Kolom menu footer | Semua halaman |
| `footer-kampus` | Kolom informasi kampus | Semua halaman |
| `footer-bawah` | Baris copyright di dasar footer | Semua halaman |
| `footer-pesan` | Slogan footer berwarna emas | `pendaftaran`, `profil` |

### 15.14 Notifikasi dan status

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `pesan-form` | Kotak notifikasi global di kanan bawah | Dibuat `app.js` melalui `pesan()` |
| `gagal` | Modifier merah untuk notifikasi gagal | Dibuat `app.js` melalui `pesan()` |

### 15.15 Class yang dibuat JavaScript

Tabel ini merangkum class yang tidak selalu terlihat di file `.xhtml`.

| Class | Dibuat oleh | Fungsi |
| --- | --- | --- |
| `kartu-barang` | `buatKartu()` | Kartu barang |
| `gambar-barang` | `buatKartu()` | Tautan gambar barang |
| `isi-kartu` | `buatKartu()` | Isi teks kartu |
| `lencana-baris` | `buatKartu()` | Baris lencana |
| `lencana` | `buatKartu()`, `tampilkanDashboardCS()` | Lencana jenis barang atau status |
| `hilang` | `buatKartu()` | Modifier lencana jenis hilang |
| `ditemukan` | `buatKartu()` | Modifier lencana jenis ditemukan |
| `kartu-kelola` | `perbaruiLaporanSaya()` | Kartu laporan di Laporan Saya |
| `aksi-kelola` | `perbaruiLaporanSaya()` | Tombol Edit dan Hapus |
| `pengaturan-status` | `perbaruiLaporanSaya()` | Panel ubah status |
| `catatan-status` | `perbaruiLaporanSaya()` | Catatan status CS |
| `baris-admin` | `tampilkanDashboardCS()` | Baris barang titipan |
| `info-admin` | `tampilkanDashboardCS()` | Info barang titipan |
| `kontrol-admin` | `tampilkanDashboardCS()` | Tombol kelola serah terima barang |
| `nama-hari` | `pasangKalender()` | Label hari kalender |
| `pilih-hari` | `pasangKalender()` | Tombol tanggal kalender |
| `tanggal-kosong` | `pasangKalender()` | Sel kosong kalender |
| `pesan-form` | `pesan()` | Notifikasi global |
| `gagal` | `pesan()` | Modifier notifikasi gagal |
| `tombol-keluar` | Header setelah login | Tombol keluar |
| `aktif` | Header admin | Menandai link Dashboard CS |

### 15.16 Serah terima barang

| Class | Fungsi | Dipakai di |
| --- | --- | --- |
| `halaman-serah` | Scope halaman Kelola dan Riwayat Serah Terima | `serah_terima`, `riwayat_serah_terima` |
| `serah-info-barang` | Kartu ringkasan barang yang dipilih | `serah_terima` |
| `serah-info-grid` | Grid dua kolom info barang | `serah_terima` |
| `layout-serah-baru` | Grid form catatan dan riwayat barang | `serah_terima` |
| `kotak-daftar-serah` | Kartu riwayat barang | `serah_terima` |
| `serah-list` | Wadah daftar catatan serah terima | `serah_terima`, `riwayat_serah_terima` |
| `serah-item` | Satu catatan serah terima | Dibuat `app.js` |
| `serah-kosong` | Keadaan kosong daftar catatan | `serah_terima`, `riwayat_serah_terima` |
| `filter-riwayat-cs` | Baris pencarian dan filter riwayat | `riwayat_serah_terima` |
| `serah-jumlah` | Teks jumlah catatan riwayat | `riwayat_serah_terima` |
| `serah-pagination` | Navigasi halaman riwayat | `riwayat_serah_terima` |

## 16. Referensi ID per halaman

Semua halaman memiliki `#menu-akun` di header. ID tersebut dipakai `app.js` untuk mengganti tombol Masuk/Daftar menjadi Profil/Keluar setelah login.

### 16.1 `index.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `aksi-beranda-tamu` | Blok tombol untuk pengunjung |
| `aksi-beranda-masuk` | Blok tombol untuk pengguna yang sudah masuk |
| `bagian-cara` | Seksi cara kerja ATLOF |
| `bagian-terbaru` | Seksi laporan terbaru |
| `barang-terbaru` | Grid laporan terbaru |

### 16.2 `katalog.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `form-cari` | Form pencarian barang |
| `cari` | Input kata kunci; target `label for` |
| `filter-jenis` | Dropdown jenis laporan |
| `filter-kategori` | Dropdown kategori |
| `filter-lokasi` | Dropdown lokasi kampus |
| `filter-status` | Dropdown status barang |
| `tombol-filter` | Tombol terapkan filter |
| `tombol-reset` | Tombol bersihkan filter |
| `jumlah-barang` | Teks jumlah hasil pencarian |
| `semua-barang` | Grid semua hasil laporan |
| `tidak-ada` | Pesan saat tidak ada hasil |

### 16.3 `buat_laporan.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `form-laporan` | Form buat laporan |
| `nama-barang` | Input nama barang |
| `kategori` | Dropdown kategori |
| `tanggal` | Input tanggal kejadian, readonly |
| `label-lokasi` | Label lokasi yang berubah sesuai jenis laporan |
| `lokasi` | Dropdown lokasi kampus |
| `wadah-detail-lokasi` | Grup keterangan lokasi lainnya |
| `detail-lokasi` | Input keterangan lokasi lainnya |
| `wadah-penyimpanan` | Grup lokasi penyimpanan barang |
| `penyimpanan` | Dropdown lokasi penyimpanan |
| `deskripsi` | Textarea deskripsi barang |
| `foto` | Input file foto barang |
| `telepon` | Input nomor WhatsApp alternatif |
| `bantuan-telepon` | Teks bantuan nomor WhatsApp |
| `kotak-kalender` | Panel kalender |
| `bulan-sebelum` | Tombol bulan sebelumnya |
| `bulan-berikut` | Tombol bulan berikutnya |
| `nama-bulan` | Label bulan dan tahun |
| `hari-kalender` | Grid tanggal kalender |

### 16.4 `edit_laporan.xhtml`

ID di halaman ini sama dengan `buat_laporan.xhtml`, kecuali form utama memakai `form-edit`.

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `form-edit` | Form edit laporan |
| `nama-barang` | Input nama barang |
| `kategori` | Dropdown kategori |
| `tanggal` | Input tanggal kejadian, readonly |
| `label-lokasi` | Label lokasi yang berubah sesuai jenis laporan |
| `lokasi` | Dropdown lokasi kampus |
| `wadah-detail-lokasi` | Grup keterangan lokasi lainnya |
| `detail-lokasi` | Input keterangan lokasi lainnya |
| `wadah-penyimpanan` | Grup lokasi penyimpanan barang |
| `penyimpanan` | Dropdown lokasi penyimpanan |
| `deskripsi` | Textarea deskripsi barang |
| `foto` | Input file foto barang |
| `telepon` | Input nomor WhatsApp alternatif |
| `bantuan-telepon` | Teks bantuan nomor WhatsApp |
| `kotak-kalender` | Panel kalender |
| `bulan-sebelum` | Tombol bulan sebelumnya |
| `bulan-berikut` | Tombol bulan berikutnya |
| `nama-bulan` | Label bulan dan tahun |
| `hari-kalender` | Grid tanggal kalender |

### 16.5 `laporan_saya.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `total-saya` | Jumlah total laporan pengguna |
| `jumlah-hilang` | Jumlah laporan barang hilang |
| `jumlah-ditemukan` | Jumlah laporan barang ditemukan |
| `barang-saya` | Grid laporan milik pengguna |
| `kosong-saya` | Keadaan kosong saat belum ada laporan |
| `status-<id>` | Dropdown status per laporan, dibuat `app.js` |
| `kelola-<id>` | Pembungkus kartu per laporan, dibuat `app.js` |

### 16.6 `detail.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `detail-foto` | Gambar barang |
| `detail-nama` | Nama barang |
| `detail-jenis` | Jenis laporan: hilang atau ditemukan |
| `detail-status` | Status barang |
| `detail-pelapor` | Nama pelapor |
| `detail-kategori` | Kategori barang |
| `detail-lokasi` | Lokasi kampus barang |
| `detail-tanggal` | Tanggal kejadian |
| `detail-simpan` | Lokasi penyimpanan barang |
| `detail-deskripsi` | Deskripsi barang |
| `detail-info-kontak` | Keterangan cara menghubungi |
| `detail-teams` | Tautan Microsoft Teams |
| `detail-whatsapp` | Kotak kontak WhatsApp |
| `detail-nomor` | Nomor WhatsApp yang ditampilkan |
| `detail-whatsapp-link` | Tautan WhatsApp |

### 16.7 `login.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `form-login` | Form masuk |
| `email` | Input email |
| `password` | Input password |
| `link-daftar` | Tautan ke halaman pendaftaran |

### 16.8 `pendaftaran.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `form-daftar` | Form pendaftaran akun |
| `nama` | Input nama lengkap |
| `email` | Input email |
| `teams` | Input kontak Microsoft Teams |
| `password` | Input password |
| `konfirmasi` | Input konfirmasi password |
| `link-login` | Tautan ke halaman masuk |

### 16.9 `profil.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `nama-profil` | Nama pengguna di kartu profil |
| `email-profil` | Email pengguna di kartu profil |
| `avatar-profil` | Inisial avatar pengguna |
| `label-peran-profil` | Label peran Admin CS |
| `data-profil` | Grid data identitas |
| `info-nama` | Nilai nama lengkap |
| `info-email` | Nilai email |
| `info-teams` | Nilai kontak Teams |
| `identitas-admin` | Baris lokasi pelayanan CS |
| `info-kampus-cs` | Nilai kampus CS |
| `identitas-wa` | Baris WhatsApp layanan CS |
| `info-telepon` | Nilai WhatsApp layanan CS |
| `profil-tombol` | Baris tombol profil |
| `tombol-edit-profil` | Tombol ubah profil |
| `tombol-ganti-password` | Tombol ubah password |
| `tombol-logout` | Tombol keluar |
| `form-profil` | Form edit profil |
| `nama` | Input nama lengkap |
| `email` | Input email, readonly |
| `teams` | Input kontak Teams |
| `form-nomor-cs` | Grup WhatsApp layanan CS |
| `nomor-cs` | Input WhatsApp layanan CS |
| `form-password` | Form ubah password dari profil |
| `password-lama` | Input password sekarang |
| `password-baru` | Input password baru |
| `konfirmasi-password` | Input konfirmasi password baru |

### 16.10 `admin_cs.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `subjudul-admin` | Subjudul dasbor sesuai kampus |
| `admin-total` | Jumlah total barang titipan |
| `admin-menunggu` | Jumlah barang menunggu diterima |
| `admin-diterima` | Jumlah barang diterima CS |
| `admin-selesai` | Jumlah barang sudah dikembalikan |
| `nomor-wa-admin` | Nomor WhatsApp layanan CS |
| `cari-admin` | Input pencarian nama atau ID barang |
| `filter-status-admin` | Dropdown filter status penanganan |
| `jumlah-hasil-admin` | Teks jumlah barang yang cocok dengan filter |
| `daftar-admin` | Wadah daftar barang titipan |
| `kosong-admin` | Keadaan kosong saat tidak ada barang yang cocok |
| `halaman-dashboard` | Baris navigasi halaman daftar barang |
| `admin-sebelumnya` | Tombol halaman sebelumnya |
| `info-halaman-admin` | Teks posisi halaman daftar barang |
| `admin-berikutnya` | Tombol halaman berikutnya |

### 16.11 `akses_akun.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `akses-masuk` | Tombol menuju halaman masuk |
| `akses-daftar` | Tombol menuju halaman pendaftaran |

### 16.12 `serah_terima.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `serah-tidak-ada` | Pesan saat barang tidak tersedia untuk CS ini |
| `serah-konten` | Wadah seluruh konten serah terima |
| `serah-nama-barang` | Nama barang yang dipilih |
| `serah-id-laporan` | ID laporan barang |
| `serah-kampus` | Nama kampus CS |
| `serah-penyimpanan` | Lokasi penyimpanan barang |
| `serah-status` | Status serah terima barang |
| `kotak-form-serah` | Kartu form catatan serah terima |
| `judul-form-serah-baru` | Judul form penerimaan/pengembalian |
| `keterangan-form-serah` | Keterangan pengantar form |
| `form-serah-baru` | Form catatan serah terima |
| `id-catatan-edit-baru` | ID catatan yang sedang diedit |
| `jenis-serah-tampil` | Jenis transaksi yang ditampilkan |
| `label-pihak-serah` | Label nama penyerah atau penerima |
| `nama-pihak-serah` | Input nama penyerah atau penerima |
| `keterangan-serah-baru` | Input keterangan tambahan |
| `konfirmasi-kembali` | Blok konfirmasi pengembalian |
| `cek-verifikasi-serah` | Checkbox verifikasi kepemilikan |
| `tombol-simpan-serah` | Tombol simpan catatan |
| `batal-edit-serah` | Tombol batal edit |
| `riwayat-barang-serah` | Daftar riwayat barang ini |
| `kosong-riwayat-barang` | Keadaan kosong riwayat barang |

### 16.13 `riwayat_serah_terima.xhtml`

| ID | Fungsi |
| --- | --- |
| `menu-akun` | Wadah tombol akun di header |
| `keterangan-riwayat-cs` | Keterangan riwayat sesuai kampus CS |
| `cari-riwayat-cs` | Input pencarian riwayat |
| `jenis-riwayat-cs` | Dropdown filter jenis transaksi |
| `jumlah-riwayat-cs` | Teks jumlah catatan yang cocok |
| `daftar-riwayat-cs` | Wadah daftar catatan riwayat |
| `riwayat-cs-kosong` | Keadaan kosong daftar riwayat |
| `halaman-riwayat-cs` | Baris navigasi halaman riwayat |
| `riwayat-sebelumnya` | Tombol halaman sebelumnya |
| `info-halaman-riwayat` | Teks posisi halaman riwayat |
| `riwayat-berikutnya` | Tombol halaman berikutnya |

## 17. ID yang dibuat JavaScript

| ID | Dibuat oleh | Fungsi |
| --- | --- | --- |
| `status-<id>` | `pilihanStatus()` dipanggil `perbaruiLaporanSaya()` | Dropdown status laporan pengguna |
| `kelola-<id>` | `perbaruiLaporanSaya()` | Pembungkus kartu laporan di Laporan Saya |
| `pesan-global` | `pesan()` | Kotak notifikasi global |
| `keluar-header` | Header setelah login | Tombol keluar di header |

Keterangan: `<id>` adalah ID laporan. Laporan contoh memakai angka 1 sampai 10, sedangkan laporan baru memakai `Date.now()`.

## 18. Contoh kombinasi class

Tombol utama:

```html
<a class="tombol tombol-kuning tombol-kecil" href="katalog.xhtml">Lihat katalog</a>
```

Field form:

```html
<div class="field">
  <label for="nama-barang">Nama barang <em>*</em></label>
  <input id="nama-barang" name="nama-barang" type="text" />
</div>
```

Kartu barang yang dibuat `app.js`:

```html
<div class="kartu-barang">
  <a class="gambar-barang" href="detail.xhtml?id=1">
    <img src="images/ph-tumbler.png" alt="Gambar barang" />
  </a>
  <div class="isi-kartu">
    <div class="lencana-baris">
      <span class="lencana hilang">Hilang</span>
      <span class="lencana">Masih dicari</span>
    </div>
    <h3><a href="detail.xhtml?id=1">Tumbler Hitam</a></h3>
    <p>Tumbler</p>
  </div>
</div>
```

Kartu Laporan Saya juga menampilkan lencana jenis dan status, lalu panel status dan tombol aksi dalam satu kartu:

```html
<div class="kartu-kelola">
  <div class="kartu-barang">...</div>
  <div class="pengaturan-status">
    <label for="status-1">Ubah status laporan</label>
    <select id="status-1">...</select>
    <button type="button" class="tombol tombol-kuning tombol-kecil">Simpan status</button>
  </div>
  <div class="aksi-kelola">
    <a class="tombol tombol-outline tombol-kecil" href="edit_laporan.xhtml?id=1">Edit</a>
    <button type="button" class="tombol tombol-bahaya tombol-kecil">Hapus</button>
  </div>
</div>
```

Lencana jenis barang:

```html
<!-- Pilih salah satu sesuai jenis laporan. -->
<span class="lencana hilang">Hilang</span>
<span class="lencana ditemukan">Ditemukan</span>
```

Notifikasi gagal yang dibuat `app.js`:

```html
<div class="pesan-form gagal">Lengkapi formulir terlebih dahulu.</div>
```

## 19. Catatan penting

- `hilang` dan `ditemukan` bukan class mandiri. Keduanya modifier untuk `lencana`, sehingga di HTML menjadi `class="lencana hilang"` atau `class="lencana ditemukan"`.
- `pesan-form` dan `gagal` juga dipakai bersama, sehingga notifikasi gagal menjadi `class="pesan-form gagal"`.
- `#detail-lokasi` punya arti berbeda di halaman berbeda:
  - Di `buat_laporan.xhtml` dan `edit_laporan.xhtml`: input keterangan lokasi lainnya.
  - Di `detail.xhtml`: sel tabel lokasi kampus.
- `#email`, `#password`, `#nama`, dan `#teams` muncul di beberapa halaman. Ini aman karena setiap halaman dimuat terpisah.
- `#menu-akun` ada di semua halaman dan isinya diganti oleh `app.js` setelah login.
- Class berikut dipakai di HTML atau dibuat JavaScript, tetapi belum punya aturan CSS:
  - `batal-profil`
  - `daftar-barang`
  - `footer-tentang`
  - `katalog-page`
  - `lihat-password`
  - `profil-tombol`
  - `tanggal-kosong`
- `teks-emas` dan `footer-pesan` sama-sama memberi warna aksen pada slogan footer, tetapi warnanya berbeda. Saat ini `pendaftaran` dan `profil` memakai `footer-pesan`, halaman lain memakai `teks-emas`.
- ID `status-<id>` dan `kelola-<id>` harus unik dalam satu halaman. Jangan memakai ID laporan yang sama dua kali.
- Jika nanti ada rename class atau ID, file yang perlu diperbarui adalah semua `.xhtml`, `css/style.css`, dan string HTML di `js/app.js`.

## 20. Perawatan CSS

`css/style.css` sudah dirapikan dari aturan yang tidak berefek pada tampilan.

### 20.1 Yang sudah dihapus

- Seluruh aturan responsif `@media` (480px, 700px, 760px, 900px, 1000px, 1170px) dan tag `meta viewport` di semua halaman. Layout desktop dipakai di semua lebar layar.
- `.footer-kampus img`: tidak ada gambar di dalam footer kampus.
- `.footer-isi h3`: semua `h3` footer ada di dalam `.footer-merk`, dan warnanya ditentukan `.footer-merk h3`.
- `input[type="email"]`, `input[type="search"]`, `input[type="date"]`, `input[type="tel"]`: tidak ada input dengan tipe tersebut.
- `position: relative` dan `overflow: hidden` pada `.hero`.
- `position: relative` dan `z-index: 1` pada `.hero-isi`.
- `overflow: hidden` pada `.gambar-barang`; parent `.kartu-barang` sudah memotong gambar.
- Properti flex pada elemen yang hanya punya satu anak: `.footer-merk`, `.footer-bawah`, dan `.footer-kampus`.

### 20.2 Yang sengaja dipertahankan

- `display: flex` pada `.footer-kampus` tetap ada karena memengaruhi lebar konten; yang dihapus hanya `gap` dan `align-items`.
- `.logo` memakai `align-items: center` dan `gap: 10px` karena memiliki dua anak: ikon SVG dan teks.
- Logo SVG memakai `alt=""` karena teks “ATLOF” di sebelahnya sudah memberi nama yang dapat dibaca pembaca layar.
- `.detail-identitas` tetap dua kolom (label 170px dan nilai fleksibel) di semua lebar layar.
- `input[type="text"]`, `input[type="password"]`, `input[type="file"]`, `select`, dan `textarea` tetap dipakai dan berbagi gaya kotak input yang sama.
- `overflow: hidden` pada `.kartu-barang` tetap dipakai untuk memotong gambar dan sudut kartu.

### 20.3 Font

- IBM Plex Sans tetap dipakai untuk seluruh teks sans melalui `--font-display` dan `--font-body`.
- Poppins weight 400, 500, 600, dan 700 (`Poppins-<weight>-latin.woff2`) hanya dipakai di navbar melalui `--font-navbar`: logo, menu navigasi, dan tombol Masuk/Daftar/Keluar di header.
- IBM Plex Mono dipakai untuk label kecil, kalender, dan ID melalui `--font-mono`. Lencana jenis barang dan label pada daftar identitas profil memakai IBM Plex Sans, seperti dijelaskan di 19.4.

### 20.4 Tipografi daftar identitas profil

| Elemen | Font | Ukuran | Berat |
| --- | --- | --- | --- |
| Label kiri (`Nama lengkap`, `Email akun`, `Microsoft Teams`, `Lokasi pelayanan`, `WhatsApp layanan`) | IBM Plex Sans (`--font-body`) | 15px | 600 |
| Nilai kanan (`Admin CS Kampus 3`, `cs3@atlof.test`, `Kampus 3 - Gedung Bonaventura`, dll.) | IBM Plex Sans (`--font-body`) | 15px | 400 |
| Nilai kosong (`-`, `Belum diisi`) | IBM Plex Sans (`--font-body`) | 15px | 400, miring, abu-abu |

Kedua kolom memakai font yang sama. Label dibedakan hanya dari berat hurufnya, bukan dari jenis font atau huruf kapital. Class `.nilai-kosong` dipasang di markup sebagai kondisi awal, lalu dihapus oleh `perbaruiProfil()` di `app.js` saat nilainya terisi.
