<?php

/**
 * API Serah Terima - ATLOF
 * Mencatat penerimaan dan pengembalian barang titipan CS.
 *
 * Endpoint:
 *   GET  serah_terima.php?aksi=list[&laporan_id=1]
 *   POST serah_terima.php?aksi=create
 *   POST serah_terima.php?aksi=update
 *   POST serah_terima.php?aksi=delete
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

header('Content-Type: application/json; charset=utf-8');

function balasSerah($status, $pesan, $data = null, $kode = 200)
{
    http_response_code($kode);
    echo json_encode([
        'status' => $status,
        'message' => $pesan,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$jsonInput = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput) && $rawInput[0] === '{') {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $jsonInput = $decoded;
    }
}

function ambilInputSerah($kunci, $bawaan = '')
{
    global $jsonInput;
    if (isset($_POST[$kunci])) {
        return $_POST[$kunci];
    }
    if (isset($jsonInput[$kunci])) {
        return $jsonInput[$kunci];
    }
    return $bawaan;
}

function ubahCatatanSerah($baris)
{
    return [
        'id' => (int) $baris['id'],
        'id_laporan' => (int) $baris['laporan_id'],
        'kampus_cs' => $baris['kampus_cs'],
        'email_cs' => $baris['email_cs'],
        'jenis' => $baris['jenis'],
        'nama_pihak' => $baris['nama_pihak'],
        'catatan' => $baris['catatan'] ?? '',
        'petugas' => $baris['petugas'],
        'waktu' => date('d-m-Y H:i', strtotime($baris['waktu'])),
        'nama_barang' => $baris['nama_barang'] ?? ''
    ];
}

function ambilCatatanSerah($conn, $id)
{
    $sql = "SELECT s.*, u.nama AS petugas, u.email AS email_cs, l.nama_barang
            FROM serah_terima s
            INNER JOIN users u ON u.id = s.user_id
            INNER JOIN laporan l ON l.id = s.laporan_id
            WHERE s.id = ? LIMIT 1";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $id);
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);
    $baris = mysqli_fetch_assoc($hasil);
    mysqli_stmt_close($stmt);
    return $baris ?: null;
}

// Samakan status laporan dengan catatan serah terima yang ada.
function sinkronStatusLaporan($conn, $laporanId)
{
    $stmt = mysqli_prepare($conn, 'SELECT jenis FROM serah_terima WHERE laporan_id = ?');
    mysqli_stmt_bind_param($stmt, 'i', $laporanId);
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);

    $diterima = false;
    $kembali = false;
    while ($baris = mysqli_fetch_assoc($hasil)) {
        if ($baris['jenis'] === 'penerimaan') {
            $diterima = true;
        } elseif ($baris['jenis'] === 'pengembalian') {
            $kembali = true;
        }
    }
    mysqli_stmt_close($stmt);

    $statusCs = $kembali ? 'dikembalikan' : ($diterima ? 'diterima' : 'menunggu');
    $status = $kembali ? 'sudah_dikembalikan' : 'belum_dikembalikan';

    $update = mysqli_prepare($conn, 'UPDATE laporan SET status_cs = ?, status = ? WHERE id = ?');
    mysqli_stmt_bind_param($update, 'ssi', $statusCs, $status, $laporanId);
    mysqli_stmt_execute($update);
    mysqli_stmt_close($update);
}

// ---------------------------------------------------------
// Autentikasi: hanya Admin CS
// ---------------------------------------------------------
if (empty($_SESSION['is_logged_in'])) {
    balasSerah('error', 'Silakan masuk terlebih dahulu.', null, 401);
}

$userId = (int) ($_SESSION['user_id'] ?? 0);
$role = $_SESSION['role'] ?? 'user';
$kampus = $_SESSION['kampus_cs'] ?? '';

if ($role !== 'admin_cs' || $kampus === '' || $userId <= 0) {
    balasSerah('error', 'Hanya Admin CS yang dapat mengelola serah terima.', null, 403);
}

$aksi = $_GET['aksi'] ?? 'list';

// ---------------------------------------------------------
// Baca riwayat
// ---------------------------------------------------------
if ($aksi === 'list') {
    $where = ['s.kampus_cs = ?'];
    $params = [$kampus];
    $types = 's';

    $laporanId = (int) ($_GET['laporan_id'] ?? 0);
    if ($laporanId > 0) {
        $where[] = 's.laporan_id = ?';
        $params[] = $laporanId;
        $types .= 'i';
    }

    $sql = "SELECT s.*, u.nama AS petugas, u.email AS email_cs, l.nama_barang
            FROM serah_terima s
            INNER JOIN users u ON u.id = s.user_id
            INNER JOIN laporan l ON l.id = s.laporan_id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY s.id DESC";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        balasSerah('error', 'Gagal memproses permintaan database: ' . mysqli_error($conn), null, 500);
    }
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);

    $daftar = [];
    while ($baris = mysqli_fetch_assoc($hasil)) {
        $daftar[] = ubahCatatanSerah($baris);
    }
    mysqli_stmt_close($stmt);

    balasSerah('success', 'OK', $daftar);
}

// ---------------------------------------------------------
// Simpan catatan baru
// ---------------------------------------------------------
if ($aksi === 'create') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balasSerah('error', 'Metode permintaan tidak valid.', null, 405);
    }

    $laporanId = (int) ambilInputSerah('laporan_id', 0);
    $namaPihak = trim(ambilInputSerah('nama_pihak'));
    $catatan = trim(ambilInputSerah('catatan'));
    $verifikasi = ambilInputSerah('cek_verifikasi', '');

    if ($laporanId <= 0 || $namaPihak === '') {
        balasSerah('error', 'Barang dan nama penyerah/penerima wajib diisi.', null, 400);
    }
    if (strlen($namaPihak) > 100) {
        balasSerah('error', 'Nama penyerah/penerima terlalu panjang.', null, 400);
    }

    $stmt = mysqli_prepare($conn, 'SELECT id, penyimpanan FROM laporan WHERE id = ? LIMIT 1');
    mysqli_stmt_bind_param($stmt, 'i', $laporanId);
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);
    $laporan = mysqli_fetch_assoc($hasil);
    mysqli_stmt_close($stmt);

    if (!$laporan) {
        balasSerah('error', 'Laporan tidak ditemukan.', null, 404);
    }
    if ($laporan['penyimpanan'] !== 'CS ' . $kampus) {
        balasSerah('error', 'Barang ini bukan titipan kampusmu.', null, 403);
    }

    $stmt = mysqli_prepare($conn, 'SELECT jenis FROM serah_terima WHERE laporan_id = ?');
    mysqli_stmt_bind_param($stmt, 'i', $laporanId);
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);

    $adaPenerimaan = false;
    $adaPengembalian = false;
    while ($baris = mysqli_fetch_assoc($hasil)) {
        if ($baris['jenis'] === 'penerimaan') {
            $adaPenerimaan = true;
        } elseif ($baris['jenis'] === 'pengembalian') {
            $adaPengembalian = true;
        }
    }
    mysqli_stmt_close($stmt);

    if ($adaPenerimaan && $adaPengembalian) {
        balasSerah('error', 'Penerimaan dan pengembalian barang sudah dicatat.', null, 400);
    }

    $jenis = $adaPenerimaan ? 'pengembalian' : 'penerimaan';
    if ($jenis === 'pengembalian' && !in_array(strtolower((string) $verifikasi), ['1', 'on', 'true', 'ya'], true)) {
        balasSerah('error', 'Centang konfirmasi verifikasi kepemilikan sebelum mencatat pengembalian.', null, 400);
    }

    $sql = 'INSERT INTO serah_terima (laporan_id, user_id, kampus_cs, jenis, nama_pihak, catatan, waktu)
            VALUES (?, ?, ?, ?, ?, ?, NOW())';
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iissss', $laporanId, $userId, $kampus, $jenis, $namaPihak, $catatan);
    if (!mysqli_stmt_execute($stmt)) {
        $pesanGagal = mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);
        balasSerah('error', 'Gagal menyimpan catatan: ' . $pesanGagal, null, 500);
    }
    $idBaru = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);

    sinkronStatusLaporan($conn, $laporanId);

    $baris = ambilCatatanSerah($conn, $idBaru);
    balasSerah('success', 'Catatan berhasil disimpan.', ubahCatatanSerah($baris));
}

// ---------------------------------------------------------
// Ubah catatan
// ---------------------------------------------------------
if ($aksi === 'update') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balasSerah('error', 'Metode permintaan tidak valid.', null, 405);
    }

    $id = (int) ambilInputSerah('id', 0);
    $namaPihak = trim(ambilInputSerah('nama_pihak'));
    $catatan = trim(ambilInputSerah('catatan'));

    if ($id <= 0 || $namaPihak === '') {
        balasSerah('error', 'Nama penyerah/penerima wajib diisi.', null, 400);
    }

    $lama = ambilCatatanSerah($conn, $id);
    if (!$lama) {
        balasSerah('error', 'Catatan tidak ditemukan.', null, 404);
    }
    if ($lama['kampus_cs'] !== $kampus) {
        balasSerah('error', 'Catatan ini bukan milik kampusmu.', null, 403);
    }

    $stmt = mysqli_prepare($conn, 'UPDATE serah_terima SET nama_pihak = ?, catatan = ? WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'ssi', $namaPihak, $catatan, $id);
    if (!mysqli_stmt_execute($stmt)) {
        $pesanGagal = mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);
        balasSerah('error', 'Gagal memperbarui catatan: ' . $pesanGagal, null, 500);
    }
    mysqli_stmt_close($stmt);

    $baris = ambilCatatanSerah($conn, $id);
    balasSerah('success', 'Catatan berhasil diperbarui.', ubahCatatanSerah($baris));
}

// ---------------------------------------------------------
// Hapus catatan
// ---------------------------------------------------------
if ($aksi === 'delete') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balasSerah('error', 'Metode permintaan tidak valid.', null, 405);
    }

    $id = (int) ambilInputSerah('id', 0);
    $lama = ambilCatatanSerah($conn, $id);
    if (!$lama) {
        balasSerah('error', 'Catatan tidak ditemukan.', null, 404);
    }
    if ($lama['kampus_cs'] !== $kampus) {
        balasSerah('error', 'Catatan ini bukan milik kampusmu.', null, 403);
    }

    if ($lama['jenis'] === 'penerimaan') {
        $stmt = mysqli_prepare($conn, "SELECT id FROM serah_terima WHERE laporan_id = ? AND jenis = 'pengembalian' LIMIT 1");
        mysqli_stmt_bind_param($stmt, 'i', $lama['laporan_id']);
        mysqli_stmt_execute($stmt);
        $hasil = mysqli_stmt_get_result($stmt);
        $adaKembali = (bool) mysqli_fetch_assoc($hasil);
        mysqli_stmt_close($stmt);
        if ($adaKembali) {
            balasSerah('error', 'Hapus catatan pengembalian terlebih dahulu sebelum menghapus penerimaan.', null, 400);
        }
    }

    $stmt = mysqli_prepare($conn, 'DELETE FROM serah_terima WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'i', $id);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        balasSerah('error', 'Gagal menghapus catatan.', null, 500);
    }
    mysqli_stmt_close($stmt);

    sinkronStatusLaporan($conn, (int) $lama['laporan_id']);

    balasSerah('success', 'Catatan berhasil dihapus.');
}

balasSerah('error', 'Aksi tidak dikenal.', null, 400);
