<?php

/**
 * Backend Ubah Password - ATLOF
 * Pemrograman Web Dasar
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['is_logged_in']) || !$_SESSION['is_logged_in']) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Silakan masuk terlebih dahulu.']);
    exit;
}

$input = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput) && ($decoded = json_decode($rawInput, true))) {
    $input = $decoded;
} else {
    $input = $_POST;
}

$passwordLama = $input['password_lama'] ?? '';
$passwordBaru = $input['password_baru'] ?? '';
$konfirmasi   = $input['konfirmasi'] ?? '';
$email        = $_SESSION['email'] ?? '';

if ($passwordLama === '' || $passwordBaru === '' || $konfirmasi === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Semua kolom password wajib diisi.']);
    exit;
}

if ($passwordBaru !== $konfirmasi) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Konfirmasi password baru tidak sama.']);
    exit;
}

if (strlen($passwordBaru) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password baru minimal 8 karakter.']);
    exit;
}

// Cek data user dan password lama di database
$sql = "SELECT id, password FROM users WHERE LOWER(email) = ? LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);
$emailLower = strtolower($email);
mysqli_stmt_bind_param($stmt, 's', $emailLower);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$user) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Pengguna tidak ditemukan.']);
    exit;
}

$lamaCocok = false;
if (password_verify($passwordLama, $user['password'])) {
    $lamaCocok = true;
} elseif ($passwordLama === $user['password']) {
    $lamaCocok = true;
}

if (!$lamaCocok) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password sekarang tidak sesuai.']);
    exit;
}

// Enkripsi password baru dengan bcrypt dan perbarui di database
$newHash = password_hash($passwordBaru, PASSWORD_DEFAULT);
$updateSql = "UPDATE users SET password = ? WHERE id = ?";
$updateStmt = mysqli_prepare($conn, $updateSql);
mysqli_stmt_bind_param($updateStmt, 'si', $newHash, $user['id']);

if (!mysqli_stmt_execute($updateStmt)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui password di database.']);
    exit;
}
mysqli_stmt_close($updateStmt);

echo json_encode(['status' => 'success', 'message' => 'Password berhasil diubah.']);
exit;
