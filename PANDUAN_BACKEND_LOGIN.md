# Panduan Backend Fitur Login - ATLOF (Atma Lost & Found)

Dokumentasi implementasi backend untuk fitur login dan otentikasi pada project **ATLOF** (Pemrograman Web Dasar).

---

## 1. Ringkasan File Backend yang Telah Dibuat

| Nama File | Lokasi | Fungsi |
|---|---|---|
| `koneksi.php` | Root folder | Menghubungkan aplikasi ke MySQL (`atlof_db`) menggunakan `mysqli` dengan charset UTF-8 (`utf8mb4`). |
| `atlof_db.sql` | `database/` | Script SQL untuk membuat database `atlof_db`, tabel `users`, serta seed data akun CS dan pengguna. |
| `proses_login.php` | Root folder | Memproses data login, validasi input, pencegahan SQL Injection via Prepared Statements, verifikasi password bcrypt (`password_verify`), inisialisasi sesi (`$_SESSION`), dan redirect berdasarkan role. |
| `cek_sesi.php` | Root folder | Endpoint REST/JSON untuk memeriksa status login dan data user pada sesi server saat ini. |
| `logout.php` | Root folder | Menghapus data sesi di server dan cookie sesi, lalu mengarahkan kembali ke halaman beranda. |
| `proses_daftar.php` | Root folder | Memproses pendaftaran user baru dengan enkripsi password menggunakan `password_hash(..., PASSWORD_DEFAULT)`. |

---

## 2. Struktur Tabel Pengguna (`users`)

```sql
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `teams` VARCHAR(100) DEFAULT NULL,
  `telepon` VARCHAR(25) DEFAULT NULL,
  `role` ENUM('user', 'admin_cs') NOT NULL DEFAULT 'user',
  `kampus_cs` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Akun Bawaan untuk Pengujian (Seed Data)

### A. Akun Admin CS
- **Password**: `cs1uajyATLOF` dst (atau `cs2uajyATLOF`, `cs3uajyATLOF`, `cs4uajyATLOF`)
- **Daftar Akun**:
  1. `cs1uajy@gmail.com` — Admin CS Kampus 1 (Gedung Alfonsus Mrican)
  2. `cs2uajy@gmail.com` — Admin CS Kampus 2 (Gedung Thomas Aquinas)
  3. `cs3uajy@gmail.com` — Admin CS Kampus 3 (Gedung Bonaventura)
  4. `cs4uajy@gmail.com` — Admin CS Kampus 4 (Gedung Theresa)

*Setelah login, Admin CS akan otomatis diarahkan ke `admin_cs.xhtml`.*

### B. Akun Mahasiswa / Pengguna Biasa
- **Password**: `Password123!`
- **Daftar Akun**:
  1. `kelvin@students.uajy.ac.id` (Kelvin Utama)
  2. `nadia@students.uajy.ac.id` (Nadia Putri)

*Setelah login, pengguna biasa akan diarahkan ke halaman tujuan atau `index.xhtml`.*

---

## 4. Cara Menjalankan dengan XAMPP

1. **Jalankan Apache & MySQL**:
   - Buka **XAMPP Control Panel** (ada di folder XAMPP atau folder `8. PHP\xampp-control.exe`).
   - Klik tombol **Start** pada modul **Apache** dan **MySQL**.

2. **Impor Database**:
   - Buka browser dan kunjungi `http://localhost/phpmyadmin`.
   - Klik menu **Import**.
   - Pilih file `database/atlof_db.sql`.
   - Klik tombol **Go / Impor** di bagian bawah.
   *(Database `atlof_db` dan tabel `users` beserta data awal akan otomatis terbuat).*

3. **Buka Halaman Login**:
   - Pastikan folder project berada di dalam `htdocs` (misal `C:\SEMESTER 3\Pemrograman Web Dasar D\8. PHP\htdocs\ATLOF-main` atau via virtual host / alias).
   - Akses via browser: `http://localhost/ATLOF-main/login.xhtml`.
   - Masukkan salah satu email dan password di atas.

---

## 5. Fitur Keamanan yang Diterapkan

1. **Prepared Statements (`mysqli_prepare` & `mysqli_stmt_bind_param`)**:
   Mencegah kerentanan **SQL Injection** saat memproses email pengguna.
2. **Password Hashing Modern (`password_hash` & `password_verify`)**:
   Password disimpan dalam bentuk hash bcrypt yang kuat, bukan plaintext.
3. **Session Fixation Protection**:
   Menggunakan `session_regenerate_id(true)` setelah login berhasil untuk mencegah pembajakan sesi.
4. **Validasi Server-Side**:
   Format email diperiksa menggunakan `filter_var(..., FILTER_VALIDATE_EMAIL)` dan seluruh string input dibersihkan dengan `trim()`.
5. **Dukungan Dual-Mode**:
   Mendukung pengiriman form standar HTML (`application/x-www-form-urlencoded`) maupun panggilan asynchronous modern (`Fetch API` / AJAX via JSON).
6. **Fallback Mode Offline**:
   Jika halaman dibuka tanpa server web yang aktif (protokol `file:///`), JavaScript frontend tetap memiliki fallback gracefully ke data lokal browser sehingga pengujian tampilan tetap berjalan mulus.
