<?php
/**
 * Backend Cek Sesi - ATLOF
 * Mengecek apakah pengguna sedang dalam keadaan login di server
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

if (!empty($_SESSION['is_logged_in']) && $_SESSION['is_logged_in'] === true) {
    echo json_encode([
        'status'    => 'logged_in',
        'is_logged' => true,
        'user'      => [
            'id'        => $_SESSION['user_id'] ?? null,
            'nama'      => $_SESSION['nama'] ?? '',
            'email'     => $_SESSION['email'] ?? '',
            'role'      => $_SESSION['role'] ?? 'user',
            'kampus_cs' => $_SESSION['kampus_cs'] ?? null,
            'teams'     => $_SESSION['teams'] ?? '',
            'telepon'   => $_SESSION['telepon'] ?? '',
            'foto'      => $_SESSION['foto'] ?? null
        ]
    ]);
} else {
    echo json_encode([
        'status'    => 'guest',
        'is_logged' => false,
        'user'      => null
    ]);
}
exit;
?>
