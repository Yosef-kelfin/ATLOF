<?php
/**
 * API Laporan - ATLOF
 * Pemrograman Web Dasar
 *
 * Endpoint:
 *   GET  laporan.php?aksi=list[&q=&jenis=&kategori=&lokasi=&status=&terbaru=1&saya=1&cs=1]
 *   GET  laporan.php?aksi=detail&id=1
 *   POST laporan.php?aksi=create
 *   POST laporan.php?aksi=update
 *   POST laporan.php?aksi=delete
 *   POST laporan.php?aksi=status
 *   POST laporan.php?aksi=status_cs
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/koneksi.php';

header('Content-Type: application/json; charset=utf-8');

function balas($status, $pesan, $data = null, $kode = 200)
{
    http_response_code($kode);
    echo json_encode([
        'status'  => $status,
        'message' => $pesan,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Dukung input form biasa (multipart/urlencoded) maupun JSON.
$jsonInput = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput) && $rawInput[0] === '{') {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $jsonInput = $decoded;
    }
}

function ambilInput($kunci, $bawaan = '')
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

function tanggalKeSql($nilai)
{
    if (!preg_match('/^(\d{2})-(\d{2})-(\d{4})$/', trim($nilai), $bagian)) {
        return null;
    }
    $hari  = (int)$bagian[1];
    $bulan = (int)$bagian[2];
    $tahun = (int)$bagian[3];
    if (!checkdate($bulan, $hari, $tahun)) {
        return null;
    }
    return sprintf('%04d-%02d-%02d', $tahun, $bulan, $hari);
}

function ubahBarisLaporan($baris)
{
    $foto = $baris['foto'] ?? '';
    return [
        'id'            => (int)$baris['id'],
        'user_id'       => (int)$baris['user_id'],
        'nama'          => $baris['nama_barang'],
        'jenis'         => $baris['jenis'],
        'kategori'      => $baris['kategori'],
        'tanggal'       => $baris['tanggal'] ? date('d-m-Y', strtotime($baris['tanggal'])) : '',
        'lokasi'        => $baris['lokasi'],
        'detail_lokasi' => $baris['detail_lokasi'] ?? '',
        'penyimpanan'   => ($baris['penyimpanan'] === null || $baris['penyimpanan'] === '') ? '-' : $baris['penyimpanan'],
        'status'        => $baris['status'],
        'status_cs'     => $baris['status_cs'] ?? '',
        'deskripsi'     => $baris['deskripsi'],
        'pelapor'       => $baris['pelapor'],
        'pelaporEmail'  => $baris['pelaporEmail'],
        'teams'         => $baris['teams'] ?? '',
        'telepon'       => $baris['telepon'] ?? '',
        'telepon_cs'    => $baris['telepon_cs'] ?? '',
        'foto'          => $foto,
        'gambar'        => $foto !== '' ? $foto : 'images/ph-' . $baris['kategori'] . '.png'
    ];
}

function ambilSatuLaporan($conn, $id)
{
    $sql = "SELECT l.*, u.nama AS pelapor, u.email AS pelaporEmail, u.teams AS teams,
                   (SELECT u2.telepon FROM users u2
                    WHERE u2.role = 'admin_cs'
                      AND u2.kampus_cs = REPLACE(l.penyimpanan, 'CS ', '')
                    LIMIT 1) AS telepon_cs
            FROM laporan l
            INNER JOIN users u ON u.id = l.user_id
            WHERE l.id = ? LIMIT 1";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $id);
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);
    $baris = mysqli_fetch_assoc($hasil);
    mysqli_stmt_close($stmt);
    return $baris ?: null;
}

function simpanFotoLaporan($file, $userId)
{
    if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return [true, null];
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return [false, 'Terjadi kesalahan saat mengunggah foto.'];
    }
    if ($file['size'] > 1024 * 1024) {
        return [false, 'Ukuran foto maksimal 1 MB.'];
    }

    $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ekstensi, ['jpg', 'jpeg', 'png', 'webp'], true)) {
        return [false, 'Format foto harus JPG, PNG, atau WEBP.'];
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        return [false, 'Berkas bukan gambar yang valid.'];
    }

    $folder = __DIR__ . '/uploads/laporan/';
    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }
    $namaBaru = 'laporan_' . $userId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ekstensi;
    if (!move_uploaded_file($file['tmp_name'], $folder . $namaBaru)) {
        return [false, 'Gagal menyimpan foto ke server.'];
    }
    return [true, 'uploads/laporan/' . $namaBaru];
}

function hapusFotoLaporan($path)
{
    if (empty($path)) {
        return;
    }
    $path = str_replace('\\', '/', $path);
    if (strpos($path, 'uploads/laporan/') !== 0) {
        return;
    }
    $penuh = __DIR__ . '/' . $path;
    if (is_file($penuh)) {
        @unlink($penuh);
    }
}

// ---------------------------------------------------------
// Autentikasi
// ---------------------------------------------------------
if (empty($_SESSION['is_logged_in'])) {
    balas('error', 'Silakan masuk terlebih dahulu.', null, 401);
}

$userId = (int)($_SESSION['user_id'] ?? 0);
$role   = $_SESSION['role'] ?? 'user';
$kampus = $_SESSION['kampus_cs'] ?? '';
if ($userId <= 0) {
    balas('error', 'Identitas pengguna tidak ditemukan.', null, 401);
}

$aksi = $_GET['aksi'] ?? 'list';

// ---------------------------------------------------------
// Baca data
// ---------------------------------------------------------
if ($aksi === 'list' || $aksi === 'detail') {
    if ($aksi === 'detail') {
        $id = (int)($_GET['id'] ?? 0);
        $baris = ambilSatuLaporan($conn, $id);
        if (!$baris) {
            balas('error', 'Laporan tidak ditemukan.', null, 404);
        }
        balas('success', 'OK', ubahBarisLaporan($baris));
    }

    $where  = [];
    $params = [];
    $types  = '';

    $q = trim($_GET['q'] ?? '');
    if ($q !== '') {
        $like = '%' . $q . '%';
        $where[] = '(l.nama_barang LIKE ? OR l.deskripsi LIKE ? OR l.lokasi LIKE ?)';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
        $types .= 'sss';
    }

    foreach (['jenis', 'kategori', 'lokasi', 'status'] as $filter) {
        $nilai = trim($_GET[$filter] ?? '');
        if ($nilai !== '') {
            $where[] = 'l.' . $filter . ' = ?';
            $params[] = $nilai;
            $types .= 's';
        }
    }

    if (!empty($_GET['saya'])) {
        $where[] = 'l.user_id = ?';
        $params[] = $userId;
        $types .= 'i';
    }

    if (!empty($_GET['cs'])) {
        if ($role !== 'admin_cs' || $kampus === '') {
            balas('error', 'Hanya Admin CS yang dapat melihat daftar titipan.', null, 403);
        }
        $where[] = 'l.penyimpanan = ?';
        $params[] = 'CS ' . $kampus;
        $types .= 's';
    }

    $sql = "SELECT l.*, u.nama AS pelapor, u.email AS pelaporEmail, u.teams AS teams,
                   (SELECT u2.telepon FROM users u2
                    WHERE u2.role = 'admin_cs'
                      AND u2.kampus_cs = REPLACE(l.penyimpanan, 'CS ', '')
                    LIMIT 1) AS telepon_cs
            FROM laporan l
            INNER JOIN users u ON u.id = l.user_id";
    if (!empty($where)) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY l.created_at DESC, l.id DESC';
    if (!empty($_GET['terbaru'])) {
        $sql .= ' LIMIT 6';
    }

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        balas('error', 'Gagal memproses permintaan database: ' . mysqli_error($conn), null, 500);
    }
    if ($types !== '') {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    mysqli_stmt_execute($stmt);
    $hasil = mysqli_stmt_get_result($stmt);

    $daftar = [];
    while ($baris = mysqli_fetch_assoc($hasil)) {
        $daftar[] = ubahBarisLaporan($baris);
    }
    mysqli_stmt_close($stmt);

    balas('success', 'OK', $daftar);
}

// ---------------------------------------------------------
// Simpan data (buat / ubah)
// ---------------------------------------------------------
if ($aksi === 'create' || $aksi === 'update') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balas('error', 'Metode permintaan tidak valid.', null, 405);
    }

    $id           = (int)ambilInput('id', 0);
    $nama         = trim(ambilInput('nama-barang'));
    $jenis        = trim(ambilInput('jenis'));
    $kategori     = trim(ambilInput('kategori'));
    $tanggal      = tanggalKeSql(ambilInput('tanggal'));
    $lokasi       = trim(ambilInput('lokasi'));
    $detailLokasi = trim(ambilInput('detail-lokasi'));
    $penyimpanan  = trim(ambilInput('penyimpanan'));
    $deskripsi    = trim(ambilInput('deskripsi'));
    $telepon      = trim(ambilInput('telepon'));

    $kategoriValid = ['tumbler', 'pakaian_jaket', 'elektronik', 'dompet_kartu', 'kunci', 'lainnya'];
    $lokasiValid   = ['Kampus 1', 'Kampus 2', 'Kampus 3', 'Kampus 4', 'Lainnya'];
    $simpanValid   = ['CS Kampus 1', 'CS Kampus 2', 'CS Kampus 3', 'CS Kampus 4', 'Dibawa penemu'];

    if ($nama === '' || $deskripsi === '' || $tanggal === null) {
        balas('error', 'Lengkapi nama barang, tanggal, dan deskripsi.', null, 400);
    }
    if (!in_array($jenis, ['hilang', 'ditemukan'], true)) {
        balas('error', 'Jenis laporan tidak valid.', null, 400);
    }
    if (!in_array($kategori, $kategoriValid, true)) {
        balas('error', 'Kategori barang tidak valid.', null, 400);
    }
    if (!in_array($lokasi, $lokasiValid, true)) {
        balas('error', 'Lokasi kampus tidak valid.', null, 400);
    }
    if ($lokasi === 'Lainnya' && $detailLokasi === '') {
        balas('error', 'Tuliskan keterangan lokasi lainnya.', null, 400);
    }
    if ($jenis === 'hilang') {
        $penyimpanan = '-';
    } elseif (!in_array($penyimpanan, $simpanValid, true)) {
        balas('error', 'Lokasi penyimpanan barang tidak valid.', null, 400);
    }
    if ($telepon !== '' && !preg_match('/^\+?[0-9][0-9\s-]{7,17}$/', $telepon)) {
        balas('error', 'Nomor WhatsApp tidak valid.', null, 400);
    }

    list($fotoOk, $fotoBaru) = simpanFotoLaporan($_FILES['foto'] ?? null, $userId);
    if (!$fotoOk) {
        balas('error', $fotoBaru, null, 400);
    }

    if ($aksi === 'create') {
        $status = $jenis === 'hilang' ? 'masih_dicari' : 'belum_dikembalikan';
        $statusCs = null;
        if ($jenis === 'ditemukan' && strpos($penyimpanan, 'CS Kampus ') === 0) {
            $statusCs = ($role === 'admin_cs' && $penyimpanan === 'CS ' . $kampus) ? 'diterima' : 'menunggu';
        }

        $sql = "INSERT INTO laporan
                (user_id, nama_barang, jenis, kategori, tanggal, lokasi, detail_lokasi,
                 penyimpanan, status, status_cs, deskripsi, foto, telepon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param(
            $stmt,
            'issssssssssss',
            $userId,
            $nama,
            $jenis,
            $kategori,
            $tanggal,
            $lokasi,
            $detailLokasi,
            $penyimpanan,
            $status,
            $statusCs,
            $deskripsi,
            $fotoBaru,
            $telepon
        );
        if (!mysqli_stmt_execute($stmt)) {
            $pesanGagal = mysqli_stmt_error($stmt);
            mysqli_stmt_close($stmt);
            balas('error', 'Gagal menyimpan laporan: ' . $pesanGagal, null, 500);
        }
        $idBaru = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);

        $baris = ambilSatuLaporan($conn, $idBaru);
        balas('success', 'Laporan berhasil dibuat.', ubahBarisLaporan($baris));
    }

    // Update: pastikan laporan milik pengguna yang sedang masuk.
    $lama = ambilSatuLaporan($conn, $id);
    if (!$lama) {
        balas('error', 'Laporan tidak ditemukan.', null, 404);
    }
    if ((int)$lama['user_id'] !== $userId) {
        balas('error', 'Kamu hanya dapat mengubah laporan milikmu sendiri.', null, 403);
    }

    $fotoAkhir = $lama['foto'];
    if ($fotoBaru !== null) {
        $fotoAkhir = $fotoBaru;
        hapusFotoLaporan($lama['foto']);
    }

    // Catatan serah terima tidak berlaku lagi bila jenis atau lokasi titipan berubah.
    if ($jenis !== 'ditemukan' || $lama['penyimpanan'] !== $penyimpanan) {
        $hapusSerah = mysqli_prepare($conn, 'DELETE FROM serah_terima WHERE laporan_id = ?');
        if ($hapusSerah) {
            mysqli_stmt_bind_param($hapusSerah, 'i', $id);
            mysqli_stmt_execute($hapusSerah);
            mysqli_stmt_close($hapusSerah);
        }
    }

    $status = $lama['status'];
    if ($jenis === 'hilang' && in_array($status, ['belum_dikembalikan', 'sudah_dikembalikan'], true)) {
        $status = 'masih_dicari';
    } elseif ($jenis === 'ditemukan' && in_array($status, ['masih_dicari', 'sudah_ditemukan'], true)) {
        $status = 'belum_dikembalikan';
    }

    $statusCs = $lama['status_cs'];
    if ($jenis !== 'ditemukan' || strpos($penyimpanan, 'CS Kampus ') !== 0) {
        $statusCs = null;
    } elseif ($lama['penyimpanan'] !== $penyimpanan) {
        $statusCs = ($role === 'admin_cs' && $penyimpanan === 'CS ' . $kampus) ? 'diterima' : 'menunggu';
    }

    $sql = "UPDATE laporan SET
                nama_barang = ?, jenis = ?, kategori = ?, tanggal = ?, lokasi = ?,
                detail_lokasi = ?, penyimpanan = ?, status = ?, status_cs = ?,
                deskripsi = ?, foto = ?, telepon = ?
            WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param(
        $stmt,
        'ssssssssssssi',
        $nama,
        $jenis,
        $kategori,
        $tanggal,
        $lokasi,
        $detailLokasi,
        $penyimpanan,
        $status,
        $statusCs,
        $deskripsi,
        $fotoAkhir,
        $telepon,
        $id
    );
    if (!mysqli_stmt_execute($stmt)) {
        $pesanGagal = mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);
        balas('error', 'Gagal memperbarui laporan: ' . $pesanGagal, null, 500);
    }
    mysqli_stmt_close($stmt);

    $baris = ambilSatuLaporan($conn, $id);
    balas('success', 'Laporan berhasil diperbarui.', ubahBarisLaporan($baris));
}

// ---------------------------------------------------------
// Hapus laporan
// ---------------------------------------------------------
if ($aksi === 'delete') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balas('error', 'Metode permintaan tidak valid.', null, 405);
    }
    $id = (int)ambilInput('id', 0);
    $lama = ambilSatuLaporan($conn, $id);
    if (!$lama) {
        balas('error', 'Laporan tidak ditemukan.', null, 404);
    }
    if ((int)$lama['user_id'] !== $userId) {
        balas('error', 'Kamu hanya dapat menghapus laporan milikmu sendiri.', null, 403);
    }

    $stmt = mysqli_prepare($conn, 'DELETE FROM laporan WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'i', $id);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        balas('error', 'Gagal menghapus laporan.', null, 500);
    }
    mysqli_stmt_close($stmt);
    hapusFotoLaporan($lama['foto']);

    balas('success', 'Laporan berhasil dihapus.');
}

// ---------------------------------------------------------
// Ubah status laporan oleh pemilik
// ---------------------------------------------------------
if ($aksi === 'status') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balas('error', 'Metode permintaan tidak valid.', null, 405);
    }
    $id = (int)ambilInput('id', 0);
    $statusBaru = trim(ambilInput('status'));

    $lama = ambilSatuLaporan($conn, $id);
    if (!$lama) {
        balas('error', 'Laporan tidak ditemukan.', null, 404);
    }
    if ((int)$lama['user_id'] !== $userId) {
        balas('error', 'Kamu hanya dapat mengubah status laporan milikmu sendiri.', null, 403);
    }
    if ($lama['jenis'] === 'ditemukan' && strpos((string)$lama['penyimpanan'], 'CS Kampus ') === 0) {
        balas('error', 'Status pengembalian dikelola oleh CS tempat barang dititipkan.', null, 403);
    }

    $pilihan = $lama['jenis'] === 'hilang'
        ? ['masih_dicari', 'sudah_ditemukan']
        : ['belum_dikembalikan', 'sudah_dikembalikan'];
    if (!in_array($statusBaru, $pilihan, true)) {
        balas('error', 'Status laporan tidak valid.', null, 400);
    }

    $stmt = mysqli_prepare($conn, 'UPDATE laporan SET status = ? WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'si', $statusBaru, $id);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        balas('error', 'Gagal memperbarui status laporan.', null, 500);
    }
    mysqli_stmt_close($stmt);

    $baris = ambilSatuLaporan($conn, $id);
    balas('success', 'Status laporan berhasil diperbarui.', ubahBarisLaporan($baris));
}

// ---------------------------------------------------------
// Ubah status penanganan oleh Admin CS
// ---------------------------------------------------------
if ($aksi === 'status_cs') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        balas('error', 'Metode permintaan tidak valid.', null, 405);
    }
    if ($role !== 'admin_cs' || $kampus === '') {
        balas('error', 'Hanya Admin CS yang dapat mengubah status penanganan.', null, 403);
    }

    $id = (int)ambilInput('id', 0);
    $statusBaru = trim(ambilInput('status'));
    if (!in_array($statusBaru, ['menunggu', 'diterima', 'dikembalikan'], true)) {
        balas('error', 'Status penanganan tidak valid.', null, 400);
    }

    $lama = ambilSatuLaporan($conn, $id);
    if (!$lama) {
        balas('error', 'Laporan tidak ditemukan.', null, 404);
    }
    if ($lama['penyimpanan'] !== 'CS ' . $kampus) {
        balas('error', 'Barang ini bukan titipan kampusmu.', null, 403);
    }

    $statusSekarang = $lama['status_cs'] ?: 'menunggu';
    if ($statusSekarang === 'menunggu' && $statusBaru === 'dikembalikan') {
        balas('error', 'Konfirmasi penerimaan barang terlebih dahulu sebelum mencatat pengembalian.', null, 400);
    }

    $statusLaporan = $statusBaru === 'dikembalikan' ? 'sudah_dikembalikan' : 'belum_dikembalikan';
    $stmt = mysqli_prepare($conn, 'UPDATE laporan SET status_cs = ?, status = ? WHERE id = ?');
    mysqli_stmt_bind_param($stmt, 'ssi', $statusBaru, $statusLaporan, $id);
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        balas('error', 'Gagal memperbarui status penanganan.', null, 500);
    }
    mysqli_stmt_close($stmt);

    $baris = ambilSatuLaporan($conn, $id);
    balas('success', 'Status penanganan berhasil diperbarui.', ubahBarisLaporan($baris));
}

balas('error', 'Aksi tidak dikenal.', null, 400);
