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
(6, 'Nadia Putri', 'nadia@students.uajy.ac.id', '$2y$12$F4tnAGCjBlsE631ARGK.VePFQK1Sw8icX5CotgA/fncbXXpM2HEUK', 'nadia@students.uajy.ac.id', '089876543210', 'user', NULL)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);
