-- ========================================================
-- Database: atlof_db
-- Aplikasi: ATLOF (Atma Lost & Found)
-- Pemrograman Web Dasar
-- ========================================================

CREATE DATABASE IF NOT EXISTS `atlof_db`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `atlof_db`;

-- --------------------------------------------------------
-- Struktur Tabel `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `teams` VARCHAR(100) DEFAULT NULL,
  `telepon` VARCHAR(25) DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('user', 'admin_cs') NOT NULL DEFAULT 'user',
  `kampus_cs` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Struktur Tabel `laporan`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `laporan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `nama_barang` VARCHAR(150) NOT NULL,
  `jenis` ENUM('hilang', 'ditemukan') NOT NULL,
  `kategori` ENUM('tumbler', 'pakaian_jaket', 'elektronik', 'dompet_kartu', 'kunci', 'lainnya') NOT NULL,
  `tanggal` DATE NOT NULL,
  `lokasi` VARCHAR(50) NOT NULL,
  `detail_lokasi` VARCHAR(150) DEFAULT NULL,
  `penyimpanan` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('masih_dicari', 'sudah_ditemukan', 'belum_dikembalikan', 'sudah_dikembalikan') NOT NULL,
  `status_cs` ENUM('menunggu', 'diterima', 'dikembalikan') DEFAULT NULL,
  `deskripsi` TEXT NOT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `telepon` VARCHAR(25) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_laporan_user` (`user_id`),
  KEY `idx_laporan_status` (`status`),
  KEY `idx_laporan_penyimpanan` (`penyimpanan`),
  CONSTRAINT `fk_laporan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Struktur Tabel `serah_terima`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `serah_terima` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `laporan_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `kampus_cs` VARCHAR(50) NOT NULL,
  `jenis` ENUM('penerimaan', 'pengembalian') NOT NULL,
  `nama_pihak` VARCHAR(100) NOT NULL,
  `catatan` TEXT DEFAULT NULL,
  `waktu` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_laporan_jenis` (`laporan_id`, `jenis`),
  KEY `idx_serah_kampus` (`kampus_cs`),
  CONSTRAINT `fk_serah_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_serah_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Data Awal Pengguna & Admin CS (Seed Data)
-- Password Admin CS : cs1uajyATLOF dst (cs2uajyATLOF, cs3uajyATLOF, cs4uajyATLOF)
-- Password User     : Password123!
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `teams`, `telepon`, `role`, `kampus_cs`) VALUES
(1, 'Admin CS Kampus 1', 'cs1uajy@gmail.com', '$2y$12$VQhWTzoRmuMcUezDcuV35upJb9CxLiG5mDM8PSk2LELycUo.mQXPu', '', '', 'admin_cs', 'Kampus 1'),
(2, 'Admin CS Kampus 2', 'cs2uajy@gmail.com', '$2y$12$5Wsn8dr6gkJjul3pR9LRh.KTsskXCgLJy3I1KAV1q0k6/zSWtZ96e', '', '', 'admin_cs', 'Kampus 2'),
(3, 'Admin CS Kampus 3', 'cs3uajy@gmail.com', '$2y$12$rIM2G09.tQPNoe1B8Y4eCezbstT2cZoLXeIBd0Td0uOgXXDjJmYTy', '', '', 'admin_cs', 'Kampus 3'),
(4, 'Admin CS Kampus 4', 'cs4uajy@gmail.com', '$2y$12$5ITxc7K2f7..KZdqXMBXhuXRbyes/TJ6xXNiVKYMx.nTACqhVcZUi', '', '', 'admin_cs', 'Kampus 4'),
(5, 'Kelvin Utama', 'kelvin@students.uajy.ac.id', '$2y$12$F4tnAGCjBlsE631ARGK.VePFQK1Sw8icX5CotgA/fncbXXpM2HEUK', 'kelvin@students.uajy.ac.id', '081234567890', 'user', NULL),
(6, 'Nadia Putri', 'nadia@students.uajy.ac.id', '$2y$12$F4tnAGCjBlsE631ARGK.VePFQK1Sw8icX5CotgA/fncbXXpM2HEUK', 'nadia@students.uajy.ac.id', '089876543210', 'user', NULL),
(7, 'Petugas Kampus', 'petugas@uajy.ac.id', '$2y$12$F4tnAGCjBlsE631ARGK.VePFQK1Sw8icX5CotgA/fncbXXpM2HEUK', 'cs@uajy.ac.id', '', 'user', NULL)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- --------------------------------------------------------
-- Data Awal Laporan (Seed Data)
-- --------------------------------------------------------
INSERT INTO `laporan` (`id`, `user_id`, `nama_barang`, `jenis`, `kategori`, `tanggal`, `lokasi`, `detail_lokasi`, `penyimpanan`, `status`, `status_cs`, `deskripsi`, `foto`, `telepon`, `created_at`) VALUES
(1, 5, 'Tumbler Hitam', 'hilang', 'tumbler', '2026-11-10', 'Kampus 1', NULL, '-', 'masih_dicari', NULL, 'Tumbler warna hitam, ukuran sedang.', NULL, NULL, '2026-11-10 10:00:00'),
(2, 7, 'Jaket Hoodie Abu-abu', 'ditemukan', 'pakaian_jaket', '2026-11-09', 'Kampus 2', NULL, 'CS Kampus 2', 'belum_dikembalikan', 'diterima', 'Jaket hoodie warna abu-abu polos.', NULL, NULL, '2026-11-09 10:00:00'),
(3, 7, 'Kotak Earphone Putih', 'ditemukan', 'elektronik', '2026-11-08', 'Kampus 3', NULL, 'CS Kampus 3', 'belum_dikembalikan', 'menunggu', 'Kotak earphone putih tanpa isi.', NULL, NULL, '2026-11-08 10:00:00'),
(4, 6, 'Dompet Cokelat', 'hilang', 'dompet_kartu', '2026-11-07', 'Kampus 4', NULL, '-', 'masih_dicari', NULL, 'Dompet berwarna cokelat tua.', NULL, NULL, '2026-11-07 10:00:00'),
(5, 6, 'Kunci Motor', 'ditemukan', 'kunci', '2026-11-06', 'Kampus 1', NULL, 'Dibawa penemu', 'belum_dikembalikan', NULL, 'Satu kunci motor dengan gantungan biru.', NULL, NULL, '2026-11-06 10:00:00'),
(6, 6, 'Kalkulator Ilmiah', 'hilang', 'elektronik', '2026-11-05', 'Kampus 2', NULL, '-', 'sudah_ditemukan', NULL, 'Kalkulator ilmiah warna hitam.', NULL, NULL, '2026-11-05 10:00:00'),
(7, 7, 'Botol Minum Stainless', 'ditemukan', 'tumbler', '2026-11-04', 'Kampus 3', NULL, 'CS Kampus 3', 'sudah_dikembalikan', 'dikembalikan', 'Botol stainless warna perak.', NULL, NULL, '2026-11-04 10:00:00'),
(8, 7, 'Payung Lipat Biru', 'ditemukan', 'lainnya', '2026-11-03', 'Kampus 4', NULL, 'CS Kampus 4', 'belum_dikembalikan', 'menunggu', 'Payung lipat biru tua.', NULL, NULL, '2026-11-03 10:00:00'),
(9, 5, 'Tote Bag Kanvas', 'hilang', 'lainnya', '2026-11-02', 'Lainnya', NULL, '-', 'masih_dicari', NULL, 'Tas kain warna krem.', NULL, NULL, '2026-11-02 10:00:00'),
(10, 6, 'Flashdisk 32 GB', 'ditemukan', 'elektronik', '2026-11-01', 'Kampus 1', NULL, 'CS Kampus 1', 'sudah_dikembalikan', 'dikembalikan', 'Flashdisk hitam ukuran kecil.', NULL, NULL, '2026-11-01 10:00:00')
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

-- --------------------------------------------------------
-- Data Awal Serah Terima (Seed Data)
-- --------------------------------------------------------
INSERT INTO `serah_terima` (`id`, `laporan_id`, `user_id`, `kampus_cs`, `jenis`, `nama_pihak`, `catatan`, `waktu`) VALUES
(1, 2, 2, 'Kampus 2', 'penerimaan', 'Petugas Kampus', 'Barang diterima dalam kondisi baik.', '2026-11-09 11:00:00'),
(2, 7, 3, 'Kampus 3', 'penerimaan', 'Petugas Kampus', 'Barang diterima dalam kondisi baik.', '2026-11-04 11:00:00'),
(3, 7, 3, 'Kampus 3', 'pengembalian', 'Nadia Putri', 'Kepemilikan sudah diverifikasi.', '2026-11-05 09:00:00'),
(4, 10, 1, 'Kampus 1', 'penerimaan', 'Petugas Kampus', 'Barang diterima dalam kondisi baik.', '2026-11-01 11:00:00'),
(5, 10, 1, 'Kampus 1', 'pengembalian', 'Nadia Putri', 'Kepemilikan sudah diverifikasi.', '2026-11-02 09:00:00')
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);
