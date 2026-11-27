<?php

/**
 * Koneksi Database ATLOF (Atma Lost & Found)
 * Pemrograman Web Dasar
 */

$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'atlof_db';

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    // Jika koneksi gagal, kembalikan respons error
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Koneksi database gagal: ' . mysqli_connect_error()
        ]);
        exit;
    }
    die('Koneksi database gagal: ' . mysqli_connect_error());
}

// Set karakter encoding ke utf8mb4
mysqli_set_charset($conn, 'utf8mb4');
