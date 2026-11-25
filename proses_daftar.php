<?php
/**
 * Backend Pendaftaran Akun - ATLOF
 * Pemrograman Web Dasar
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

$isJsonRequest = (
    (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
    (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
    (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
);

function kirimResponDaftar($status, $pesan, $data = [], $redirect = 'login.xhtml') {
    global $isJsonRequest;

    if ($isJsonRequest) {
        header('Content-Type: application/json; charset=utf-8');
        if ($status !== 'success') {
            http_response_code(400);
        }
        echo json_encode([
            'status'   => $status,
            'message'  => $pesan,
            'user'     => $data['user'] ?? null,
            'redirect' => $redirect
        ]);
        exit;
    }

    if ($status === 'success') {
        $_SESSION['pesan_sukses'] = $pesan;
        header('Location: ' . $redirect);
    } else {
        $_SESSION['pesan_error'] = $pesan;
        header('Location: pendaftaran.xhtml?error=' . urlencode($pesan));
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    kirimResponDaftar('error', 'Metode permintaan tidak valid. Harap gunakan POST.');
}

$input = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput) && ($decoded = json_decode($rawInput, true))) {
    $input = $decoded;
} else {
    $input = $_POST;
}

$nama       = trim($input['nama'] ?? '');
$email      = trim($input['email'] ?? '');
$teams      = trim($input['teams'] ?? '');
$password   = $input['password'] ?? '';
$konfirmasi = $input['konfirmasi'] ?? '';
$tujuan     = trim($input['tujuan'] ?? 'index.xhtml');

// Validasi
if ($nama === '' || $email === '' || $teams === '' || $password === '' || $konfirmasi === '') {
    kirimResponDaftar('error', 'Semua kolom wajib diisi.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    kirimResponDaftar('error', 'Format email tidak valid.');
}

if ($password !== $konfirmasi) {
    kirimResponDaftar('error', 'Password dan konfirmasi password tidak cocok.');
}

if (strlen($password) < 6) {
    kirimResponDaftar('error', 'Password minimal 6 karakter.');
}

$emailLower = strtolower($email);

// Cek apakah email sudah terdaftar
$cekSql = "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1";
$cekStmt = mysqli_prepare($conn, $cekSql);
mysqli_stmt_bind_param($cekStmt, 's', $emailLower);
mysqli_stmt_execute($cekStmt);
$cekResult = mysqli_stmt_get_result($cekStmt);
if (mysqli_fetch_assoc($cekResult)) {
    mysqli_stmt_close($cekStmt);
    kirimResponDaftar('error', 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
}
mysqli_stmt_close($cekStmt);

// Enkripsi password menggunakan bcrypt (standar PHP)
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$role = 'user';

$insertSql = "INSERT INTO users (nama, email, password, teams, role) VALUES (?, ?, ?, ?, ?)";
$insertStmt = mysqli_prepare($conn, $insertSql);
mysqli_stmt_bind_param($insertStmt, 'sssss', $nama, $emailLower, $hashedPassword, $teams, $role);

if (!mysqli_stmt_execute($insertStmt)) {
    kirimResponDaftar('error', 'Gagal mendaftarkan akun: ' . mysqli_stmt_error($insertStmt));
}

$userId = mysqli_insert_id($conn);
mysqli_stmt_close($insertStmt);

// Set sesi otomatis setelah daftar
session_regenerate_id(true);
$_SESSION['is_logged_in'] = true;
$_SESSION['user_id']      = $userId;
$_SESSION['nama']         = $nama;
$_SESSION['email']        = $emailLower;
$_SESSION['role']         = $role;
$_SESSION['kampus_cs']    = null;
$_SESSION['teams']        = $teams;
$_SESSION['telepon']      = '';

$userData = [
    'id'        => $userId,
    'nama'      => $nama,
    'email'     => $emailLower,
    'role'      => $role,
    'kampus_cs' => null,
    'teams'     => $teams,
    'telepon'   => ''
];

kirimResponDaftar('success', 'Pendaftaran berhasil! Selamat datang di ATLOF.', ['user' => $userData], $tujuan);
?>
