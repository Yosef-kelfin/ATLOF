<?php
/**
 * Backend Proses Login - ATLOF
 * Pemrograman Web Dasar
 */

// Mulai sesi
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

// Cek apakah permintaan dalam format JSON (misal dari fetch API)
$isJsonRequest = (
    (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
    (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
    (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
);

// Helper untuk mengirim respon (JSON atau Redirect)
function kirimRespon($status, $pesan, $data = [], $redirect = 'login.xhtml') {
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

    // Untuk form POST tradisional
    if ($status === 'success') {
        $_SESSION['pesan_sukses'] = $pesan;
        header('Location: ' . $redirect);
    } else {
        $_SESSION['pesan_error'] = $pesan;
        header('Location: login.xhtml?error=' . urlencode($pesan));
    }
    exit;
}

// Pastikan method adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    kirimRespon('error', 'Metode permintaan tidak valid. Harap gunakan POST.');
}

// Ambil data input baik dari JSON body maupun form standard POST
$input = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput) && ($decoded = json_decode($rawInput, true))) {
    $input = $decoded;
} else {
    $input = $_POST;
}

$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$tujuan   = trim($input['tujuan'] ?? '');

// Sanitasi parameter tujuan
if (!empty($tujuan)) {
    if (!preg_match('/^[a-z_]+\.xhtml(?:\?id=\d+)?$/', $tujuan)) {
        $tujuan = 'index.xhtml';
    }
} else {
    $tujuan = 'index.xhtml';
}

// 1. Validasi Input
if ($email === '' || $password === '') {
    kirimRespon('error', 'Masukkan email dan password yang benar.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    kirimRespon('error', 'Format email tidak valid.');
}

$emailLower = strtolower($email);

// 2. Query ke Database dengan Prepared Statement untuk mencegah SQL Injection
$sql = "SELECT id, nama, email, password, teams, telepon, foto, role, kampus_cs FROM users WHERE LOWER(email) = ? LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    kirimRespon('error', 'Gagal memproses permintaan database: ' . mysqli_error($conn));
}

mysqli_stmt_bind_param($stmt, 's', $emailLower);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($stmt ? $result : null);
mysqli_stmt_close($stmt);

// 3. Verifikasi Keberadaan Pengguna
if (!$user) {
    kirimRespon('error', 'Email belum terdaftar. Silakan daftar terlebih dahulu.');
}

// 4. Verifikasi Password (menggunakan password_verify dan fallback otomatis)
$passwordBenar = false;

if (password_verify($password, $user['password'])) {
    $passwordBenar = true;
} elseif ($password === $user['password']) {
    // Fallback jika password diinput plaintext via phpMyAdmin, otomatis re-hash ke bcrypt
    $passwordBenar = true;
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    $updateStmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?");
    if ($updateStmt) {
        mysqli_stmt_bind_param($updateStmt, 'si', $newHash, $user['id']);
        mysqli_stmt_execute($updateStmt);
        mysqli_stmt_close($updateStmt);
    }
}

if (!$passwordBenar) {
    $pesanGagal = ($user['role'] === 'admin_cs')
        ? 'Password akun CS tidak sesuai.'
        : 'Password tidak sesuai.';
    kirimRespon('error', $pesanGagal);
}

// 5. Autentikasi Berhasil - Set Session Server
session_regenerate_id(true);

$_SESSION['is_logged_in'] = true;
$_SESSION['user_id']      = (int)$user['id'];
$_SESSION['nama']         = $user['nama'];
$_SESSION['email']        = $user['email'];
$_SESSION['role']         = $user['role'];
$_SESSION['kampus_cs']    = $user['kampus_cs'];
$_SESSION['teams']        = $user['teams'];
$_SESSION['telepon']      = $user['telepon'];
$_SESSION['foto']         = $user['foto'] ?? null;

// Tentukan halaman pengalihan berdasarkan peran (Role)
$redirectUrl = ($user['role'] === 'admin_cs') ? 'admin_cs.xhtml' : 'index.xhtml';

// Format data user untuk dikirim balik (tanpa field password)
$userData = [
    'id'        => (int)$user['id'],
    'nama'      => $user['nama'],
    'email'     => $user['email'],
    'role'      => $user['role'],
    'kampus_cs' => $user['kampus_cs'],
    'teams'     => $user['teams'],
    'telepon'   => $user['telepon'],
    'foto'      => $user['foto'] ?? null
];

kirimRespon('success', 'Login berhasil! Selamat datang, ' . $user['nama'], ['user' => $userData], $redirectUrl);
?>
