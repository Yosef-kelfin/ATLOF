<?php
/**
 * Backend Simpan Profil - ATLOF
 * Memperbarui nama, kontak Microsoft Teams, dan nomor WhatsApp layanan CS.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

header('Content-Type: application/json; charset=utf-8');

function balasProfil($status, $pesan, $data = null, $kode = 200)
{
    http_response_code($kode);
    echo json_encode([
        'status'  => $status,
        'message' => $pesan,
        'user'    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($_SESSION['is_logged_in'])) {
    balasProfil('error', 'Silakan masuk terlebih dahulu.', null, 401);
}

$userId = (int)($_SESSION['user_id'] ?? 0);
if ($userId <= 0) {
    balasProfil('error', 'Identitas pengguna tidak ditemukan.', null, 401);
}

$input = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput) && $rawInput[0] === '{') {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $input = $decoded;
    }
}
if (empty($input)) {
    $input = $_POST;
}

$nama   = trim($input['nama'] ?? '');
$teams  = trim($input['teams'] ?? '');
$telepon = trim($input['telepon'] ?? '');
$role   = $_SESSION['role'] ?? 'user';

if ($nama === '') {
    balasProfil('error', 'Nama lengkap wajib diisi.', null, 400);
}
if (strlen($nama) > 100 || strlen($teams) > 100) {
    balasProfil('error', 'Nama atau kontak Teams terlalu panjang.', null, 400);
}
if ($role !== 'admin_cs' && $teams === '') {
    balasProfil('error', 'Kontak Microsoft Teams wajib diisi.', null, 400);
}
if ($telepon !== '' && !preg_match('/^\+?[0-9][0-9\s-]{7,17}$/', $telepon)) {
    balasProfil('error', 'Nomor WhatsApp layanan tidak valid.', null, 400);
}
if ($role !== 'admin_cs') {
    // Pengguna biasa tidak mengubah nomor layanan CS.
    $telepon = $_SESSION['telepon'] ?? '';
}

if ($role === 'admin_cs') {
    $sql = 'UPDATE users SET nama = ?, teams = ?, telepon = ? WHERE id = ?';
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'sssi', $nama, $teams, $telepon, $userId);
} else {
    $sql = 'UPDATE users SET nama = ?, teams = ? WHERE id = ?';
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ssi', $nama, $teams, $userId);
}

if (!mysqli_stmt_execute($stmt)) {
    $pesanGagal = mysqli_stmt_error($stmt);
    mysqli_stmt_close($stmt);
    balasProfil('error', 'Gagal memperbarui profil: ' . $pesanGagal, null, 500);
}
mysqli_stmt_close($stmt);

$_SESSION['nama']    = $nama;
$_SESSION['teams']   = $teams;
$_SESSION['telepon'] = $telepon;

balasProfil('success', 'Profil berhasil diperbarui.', [
    'id'      => $userId,
    'nama'    => $nama,
    'email'   => $_SESSION['email'] ?? '',
    'teams'   => $teams,
    'telepon' => $telepon,
    'role'    => $role,
    'kampus_cs' => $_SESSION['kampus_cs'] ?? null,
    'foto'    => $_SESSION['foto'] ?? null
]);
