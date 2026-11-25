<?php
/**
 * Backend Ubah Foto Profil - ATLOF
 * Pemrograman Web Dasar
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

header('Content-Type: application/json; charset=utf-8');

// Pastikan pengguna sudah login
if (empty($_SESSION['is_logged_in']) || !$_SESSION['is_logged_in']) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Silakan masuk terlebih dahulu.']);
    exit;
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$email = strtolower($_SESSION['email'] ?? '');

// Jika userId belum ada di sesi, cari berdasarkan email
if ($userId <= 0 && $email !== '') {
    $cQuery = mysqli_prepare($conn, "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1");
    mysqli_stmt_bind_param($cQuery, 's', $email);
    mysqli_stmt_execute($cQuery);
    $cRes = mysqli_stmt_get_result($cQuery);
    if ($row = mysqli_fetch_assoc($cRes)) {
        $userId = (int)$row['id'];
        $_SESSION['user_id'] = $userId;
    }
    mysqli_stmt_close($cQuery);
}

if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Identitas pengguna tidak ditemukan.']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/profil/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// -------------------------------------------------------------
// OPSI A: Hapus Foto Profil
// -------------------------------------------------------------
$aksi = $_POST['action'] ?? $_GET['action'] ?? '';
if ($aksi === 'hapus') {
    // Ambil foto lama
    $stmtCari = mysqli_prepare($conn, "SELECT foto FROM users WHERE id = ? LIMIT 1");
    mysqli_stmt_bind_param($stmtCari, 'i', $userId);
    mysqli_stmt_execute($stmtCari);
    $res = mysqli_stmt_get_result($stmtCari);
    if ($oldUser = mysqli_fetch_assoc($res)) {
        $oldFile = $oldUser['foto'];
        if (!empty($oldFile) && file_exists(__DIR__ . '/' . $oldFile)) {
            @unlink(__DIR__ . '/' . $oldFile);
        }
    }
    mysqli_stmt_close($stmtCari);

    // Update kolom foto menjadi NULL di database
    $stmtReset = mysqli_prepare($conn, "UPDATE users SET foto = NULL WHERE id = ?");
    mysqli_stmt_bind_param($stmtReset, 'i', $userId);
    mysqli_stmt_execute($stmtReset);
    mysqli_stmt_close($stmtReset);

    $_SESSION['foto'] = null;

    echo json_encode([
        'status'  => 'success',
        'message' => 'Foto profil berhasil dihapus.',
        'foto'    => null
    ]);
    exit;
}

// -------------------------------------------------------------
// OPSI B: Unggah Foto Profil Baru
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metode permintaan tidak valid.']);
    exit;
}

if (!isset($_FILES['foto']) || $_FILES['foto']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Pilih berkas foto terlebih dahulu.']);
    exit;
}

$file = $_FILES['foto'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Terjadi kesalahan saat mengunggah foto.']);
    exit;
}

// Validasi ukuran (maksimal 2MB)
$maxBytes = 2 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ukuran foto maksimal 2 MB.']);
    exit;
}

// Validasi tipe berkas / ekstensi
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Format file tidak didukung. Harap gunakan JPG, PNG, atau WEBP.']);
    exit;
}

// Validasi MIME Type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Berkas bukan gambar yang valid.']);
    exit;
}

// Generate nama berkas unik
$namaBerkasBaru = 'user_' . $userId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$targetPath = $uploadDir . $namaBerkasBaru;
$relativeUrl = 'uploads/profil/' . $namaBerkasBaru;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan foto ke server.']);
    exit;
}

// Hapus foto lama jika ada
$stmtCari = mysqli_prepare($conn, "SELECT foto FROM users WHERE id = ? LIMIT 1");
mysqli_stmt_bind_param($stmtCari, 'i', $userId);
mysqli_stmt_execute($stmtCari);
$res = mysqli_stmt_get_result($stmtCari);
if ($oldUser = mysqli_fetch_assoc($res)) {
    $oldFile = $oldUser['foto'];
    if (!empty($oldFile) && file_exists(__DIR__ . '/' . $oldFile)) {
        @unlink(__DIR__ . '/' . $oldFile);
    }
}
mysqli_stmt_close($stmtCari);

// Perbarui path foto di database
$stmtUpdate = mysqli_prepare($conn, "UPDATE users SET foto = ? WHERE id = ?");
mysqli_stmt_bind_param($stmtUpdate, 'si', $relativeUrl, $userId);

if (!mysqli_stmt_execute($stmtUpdate)) {
    @unlink($targetPath); // Bersihkan file jika query gagal
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui foto profil di database.']);
    exit;
}
mysqli_stmt_close($stmtUpdate);

$_SESSION['foto'] = $relativeUrl;

echo json_encode([
    'status'  => 'success',
    'message' => 'Foto profil berhasil diperbarui.',
    'foto'    => $relativeUrl
]);
exit;
?>
