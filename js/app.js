/*
    ATLOF - JavaScript Frontend
    Pemrograman Web Dasar

    Tampilan ini belum menggunakan backend PHP atau MySQL.
    Akun CS di bawah ini hanya untuk pengembangan dan tidak boleh dipakai di server publik.
*/

var barang = [
    { id: 1, nama: "Tumbler Hitam", jenis: "hilang", kategori: "tumbler", lokasi: "Kampus 1", tanggal: "10-11-2026", status: "masih_dicari", penyimpanan: "-", pelapor: "Kelvin Utama", deskripsi: "Tumbler warna hitam, ukuran sedang.", gambar: "images/ph-tumbler.png", teams: "kelvin@students.uajy.ac.id" },
    { id: 2, nama: "Jaket Hoodie Abu-abu", jenis: "ditemukan", kategori: "pakaian_jaket", lokasi: "Kampus 2", tanggal: "09-11-2026", status: "belum_dikembalikan", penyimpanan: "CS Kampus 2", pelapor: "Petugas Kampus", deskripsi: "Jaket hoodie warna abu-abu polos.", gambar: "images/ph-pakaian_jaket.png", teams: "cs@uajy.ac.id" },
    { id: 3, nama: "Kotak Earphone Putih", jenis: "ditemukan", kategori: "elektronik", lokasi: "Kampus 3", tanggal: "08-11-2026", status: "belum_dikembalikan", penyimpanan: "CS Kampus 3", pelapor: "Petugas Kampus", deskripsi: "Kotak earphone putih tanpa isi.", gambar: "images/ph-elektronik.png", teams: "cs@uajy.ac.id" },
    { id: 4, nama: "Dompet Cokelat", jenis: "hilang", kategori: "dompet_kartu", lokasi: "Kampus 4", tanggal: "07-11-2026", status: "masih_dicari", penyimpanan: "-", pelapor: "Nadia Putri", deskripsi: "Dompet berwarna cokelat tua.", gambar: "images/ph-dompet_kartu.png", teams: "nadia@students.uajy.ac.id" },
    { id: 5, nama: "Kunci Motor", jenis: "ditemukan", kategori: "kunci", lokasi: "Kampus 1", tanggal: "06-11-2026", status: "belum_dikembalikan", penyimpanan: "Dibawa penemu", pelapor: "Nadia Putri", deskripsi: "Satu kunci motor dengan gantungan biru.", gambar: "images/ph-kunci.png", teams: "nadia@students.uajy.ac.id" },
    { id: 6, nama: "Kalkulator Ilmiah", jenis: "hilang", kategori: "elektronik", lokasi: "Kampus 2", tanggal: "05-11-2026", status: "sudah_ditemukan", penyimpanan: "-", pelapor: "Nadia Putri", deskripsi: "Kalkulator ilmiah warna hitam.", gambar: "images/ph-elektronik.png", teams: "nadia@students.uajy.ac.id" },
    { id: 7, nama: "Botol Minum Stainless", jenis: "ditemukan", kategori: "tumbler", lokasi: "Kampus 3", tanggal: "04-11-2026", status: "sudah_dikembalikan", penyimpanan: "CS Kampus 3", pelapor: "Petugas Kampus", deskripsi: "Botol stainless warna perak.", gambar: "images/ph-tumbler.png", teams: "cs@uajy.ac.id" },
    { id: 8, nama: "Payung Lipat Biru", jenis: "ditemukan", kategori: "lainnya", lokasi: "Kampus 4", tanggal: "03-11-2026", status: "belum_dikembalikan", penyimpanan: "CS Kampus 4", pelapor: "Petugas Kampus", deskripsi: "Payung lipat biru tua.", gambar: "images/ph-lainnya.png", teams: "cs@uajy.ac.id" },
    { id: 9, nama: "Tote Bag Kanvas", jenis: "hilang", kategori: "lainnya", lokasi: "Lainnya", tanggal: "02-11-2026", status: "masih_dicari", penyimpanan: "-", pelapor: "Kelvin Utama", deskripsi: "Tas kain warna krem.", gambar: "images/ph-lainnya.png", teams: "kelvin@students.uajy.ac.id" },
    { id: 10, nama: "Flashdisk 32 GB", jenis: "ditemukan", kategori: "elektronik", lokasi: "Kampus 1", tanggal: "01-11-2026", status: "sudah_dikembalikan", penyimpanan: "CS Kampus 1", pelapor: "Nadia Putri", deskripsi: "Flashdisk hitam ukuran kecil.", gambar: "images/ph-elektronik.png", teams: "nadia@students.uajy.ac.id" }
];

function ambil(id) {
    return document.getElementById(id);
}

function teks(id, isi) {
    if (ambil(id)) {
        ambil(id).textContent = isi;
    }
}

var pesanTimer = null;

// Tampilkan pesan di halaman, bukan alert(), agar tidak memutus alur visual.
function pesan(isi) {
    var kotak = ambil("pesan-global");
    if (!kotak) {
        kotak = document.createElementNS
            ? document.createElementNS("http://www.w3.org/1999/xhtml", "div")
            : document.createElement("div");
        kotak.id = "pesan-global";
        kotak.title = "Klik untuk menutup pesan";
        kotak.onclick = function () {
            this.style.display = "none";
        };
        document.body.appendChild(kotak);
    }
    var gagal = String(isi).toLowerCase().indexOf("berhasil") == -1;
    kotak.className = "pesan-form" + (gagal ? " gagal" : "");
    kotak.textContent = isi;
    kotak.style.display = "block";
    if (typeof setTimeout == "function") {
        if (pesanTimer) clearTimeout(pesanTimer);
        pesanTimer = setTimeout(function () {
            kotak.style.display = "none";
        }, 6000);
    }
}

// Simpan perubahan sementara selama tab browser masih dibuka.
function simpanSesi(nama, data) {
    sessionStorage.setItem(nama, JSON.stringify(data));
}

function bacaSesi(nama, nilaiAwal) {
    var data = sessionStorage.getItem(nama);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            return nilaiAwal;
        }
    }
    return nilaiAwal;
}

function sudahMasuk() {
    return sessionStorage.getItem("atlofMasuk") == "ya";
}

// Akun dan password disimpan di localStorage browser, bukan di database.
// PERINGATAN: password tersimpan apa adanya (tanpa hash) untuk simulasi frontend saja.
function simpanLokal(nama, data) {
    localStorage.setItem(nama, JSON.stringify(data));
}

function bacaLokal(nama, nilaiAwal) {
    var data = localStorage.getItem(nama);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            return nilaiAwal;
        }
    }
    return nilaiAwal;
}

function semuaAkunLokal() {
    return bacaLokal("atlofAkunLokal", {});
}

function kataSandiCS() {
    return bacaLokal("atlofPasswordCS", {});
}

// Cari akun berdasarkan email, baik akun pengguna maupun Admin CS.
function cariAkunTerdaftar(email) {
    var alamat = (email || "").toLowerCase();
    var daftar = semuaAkunLokal();
    if (daftar[alamat]) return daftar[alamat];
    var admin = cariAkunAdmin(alamat);
    if (!admin) return null;
    var kataSandi = kataSandiCS();
    return {
        nama: admin.nama,
        email: admin.email,
        teams: "",
        password: kataSandi[admin.email] || "ATLOFcs2026!",
        role: "admin_cs",
        kampus_cs: admin.kampus
    };
}

// Simpan password baru untuk akun pengguna atau penimpa password uji Admin CS.
function simpanKataSandi(email, password) {
    var alamat = email.toLowerCase();
    if (cariAkunAdmin(alamat)) {
        var kataSandi = kataSandiCS();
        kataSandi[alamat] = password;
        simpanLokal("atlofPasswordCS", kataSandi);
        return;
    }
    var daftar = semuaAkunLokal();
    if (daftar[alamat]) {
        daftar[alamat].password = password;
        simpanLokal("atlofAkunLokal", daftar);
    }
}

// Empat identitas admin untuk mencoba tampilan sebelum backend dibuat.
// Password uji: ATLOFcs2026! (jangan digunakan sebagai password sungguhan).
var adminCS = [
    { email: "cs1@atlof.test", nama: "Admin CS Kampus 1", kampus: "Kampus 1" },
    { email: "cs2@atlof.test", nama: "Admin CS Kampus 2", kampus: "Kampus 2" },
    { email: "cs3@atlof.test", nama: "Admin CS Kampus 3", kampus: "Kampus 3" },
    { email: "cs4@atlof.test", nama: "Admin CS Kampus 4", kampus: "Kampus 4" }
];

function dataAkun() {
    return bacaSesi("atlofAkun", { nama: "Pengguna ATLOF", email: "", teams: "", role: "user" });
}

function adalahAdmin() {
    return sudahMasuk() && dataAkun().role == "admin_cs";
}

function cariAkunAdmin(email) {
    for (var i = 0; i < adminCS.length; i++) {
        if (adminCS[i].email == email.toLowerCase()) return adminCS[i];
    }
    return null;
}

// Data kontak setiap akun CS disimpan terpisah menurut alamat email.
function kontakAdmin() {
    return bacaSesi("atlofKontakAdmin", {});
}

function nomorAdmin(kampus) {
    for (var i = 0; i < adminCS.length; i++) {
        if (adminCS[i].kampus == kampus) {
            var semua = kontakAdmin();
            return semua[adminCS[i].email] ? semua[adminCS[i].email].telepon || "" : "";
        }
    }
    return "";
}

function akunAdmin(keterangan) {
    var semua = kontakAdmin();
    var data = semua[keterangan.email] || {};
    return {
        nama: data.nama || keterangan.nama,
        email: keterangan.email,
        teams: data.teams || "",
        telepon: data.telepon || "",
        role: "admin_cs",
        kampus_cs: keterangan.kampus
    };
}

function laporanSaya() {
    return bacaSesi("atlofLaporan", []);
}

function laporanMilikSaya() {
    var daftar = laporanSaya();
    var email = dataAkun().email;
    var hasil = [];
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].pelaporEmail == email) hasil.push(daftar[i]);
    }
    return hasil;
}

function namaKampus(nama) {
    var gedung = {
        "Kampus 1": "Gedung Alfonsus Mrican",
        "Kampus 2": "Gedung Thomas Aquinas",
        "Kampus 3": "Gedung Bonaventura",
        "Kampus 4": "Gedung Theresa"
    };
    if (gedung[nama]) return nama + " - " + gedung[nama];
    if (nama.indexOf("CS Kampus ") == 0) {
        var kampus = nama.replace("CS ", "");
        if (gedung[kampus]) return "CS " + namaKampus(kampus);
    }
    return nama;
}

function halamanIni() {
    var url = window.location.pathname.split("/");
    return url[url.length - 1] || "index.xhtml";
}

function tujuanSebelumnya() {
    var parameter = new URLSearchParams(window.location.search);
    var tujuan = parameter.get("tujuan") || "katalog.xhtml";
    // Hanya boleh pindah ke halaman dalam folder ini.
    if (!/^[a-z_]+\.xhtml(?:\?id=\d+)?$/.test(tujuan)) {
        tujuan = "katalog.xhtml";
    }
    return tujuan;
}

function halamanAkun() {
    return halamanIni() == "login.xhtml" || halamanIni() == "pendaftaran.xhtml";
}

function pergiKeAkses(tujuan) {
    window.location.href = "akses_akun.xhtml?tujuan=" + encodeURIComponent(tujuan);
}

function keluar() {
    sessionStorage.removeItem("atlofMasuk");
    window.location.href = "index.xhtml";
}

// Cegah kunjungan langsung ke halaman khusus pengguna sebelum masuk.
var halamanKhusus = ["katalog.xhtml", "detail.xhtml", "buat_laporan.xhtml", "edit_laporan.xhtml", "laporan_saya.xhtml", "profil.xhtml", "admin_cs.xhtml"];
var sekarang = halamanIni();
if (!sudahMasuk() && halamanKhusus.indexOf(sekarang) != -1) {
    var tujuanHalaman = sekarang + window.location.search;
    pergiKeAkses(tujuanHalaman);
}
if (sudahMasuk() && sekarang == "admin_cs.xhtml" && !adalahAdmin()) {
    window.location.href = "index.xhtml";
}

// Atur tombol Masuk/Daftar pada header.
if (ambil("menu-akun") && sudahMasuk()) {
    ambil("menu-akun").innerHTML =
        '<a href="profil.xhtml" class="tombol tombol-outline tombol-kecil">Profil</a>' +
        '<button id="keluar-header" type="button" class="tombol tombol-kecil tombol-logout-header">Keluar</button>';
    ambil("keluar-header").onclick = keluar;
    if (adalahAdmin()) {
        var daftarMenu = document.querySelector(".menu-links");
        if (daftarMenu) {
            daftarMenu.innerHTML += '<a href="admin_cs.xhtml"' +
                (sekarang == "admin_cs.xhtml" ? ' class="active"' : '') + '>Dasbor CS</a>';
        }
    }
}

// Tautan katalog / laporan dari beranda harus melewati halaman akun.
var tautan = document.getElementsByTagName("a");
for (var t = 0; t < tautan.length; t++) {
    (function (link) {
        var halaman = link.getAttribute("href") || "";
        if (!sudahMasuk() && /^(katalog|detail|buat_laporan|edit_laporan|laporan_saya|profil|admin_cs)\.xhtml/.test(halaman)) {
            link.onclick = function (event) {
                event.preventDefault();
                pergiKeAkses(halaman);
            };
        }
    })(tautan[t]);
}

// Ubah teks pengguna menjadi teks aman sebelum dimasukkan ke innerHTML.
function bersihkan(nilai) {
    return String(nilai).replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function namaKategori(kategori) {
    if (kategori == "pakaian_jaket") return "Pakaian / Jaket";
    if (kategori == "dompet_kartu") return "Dompet / Kartu";
    if (kategori == "lainnya") return "Lainnya";
    return kategori.charAt(0).toUpperCase() + kategori.slice(1);
}

function namaStatus(status) {
    if (status == "masih_dicari") return "Masih dicari";
    if (status == "belum_dikembalikan") return "Belum dikembalikan";
    if (status == "sudah_ditemukan") return "Sudah ditemukan";
    return "Sudah dikembalikan";
}

function semuaLaporan() {
    var contoh = bacaSesi("atlofPerubahanContoh", {});
    var daftarContoh = [];
    for (var i = 0; i < barang.length; i++) {
        var laporan = Object.assign({}, barang[i]);
        if (contoh[laporan.id]) {
            laporan.status = contoh[laporan.id].status;
            laporan.status_cs = contoh[laporan.id].status_cs;
        }
        daftarContoh.push(laporan);
    }
    return laporanSaya().concat(daftarContoh);
}

function gambarKategori(kategori) {
    return "images/ph-" + kategori + ".png";
}

function buatKartu(b) {
    return '<div class="kartu-barang">' +
        '<a class="gambar-barang" href="detail.xhtml?id=' + b.id + '"><img src="' + bersihkan(b.gambar) + '" alt="Gambar barang" /></a>' +
        '<div class="isi-kartu">' +
        '<div class="lencana-baris"><span class="lencana ' + b.jenis + '">' + (b.jenis == "hilang" ? "Hilang" : "Ditemukan") + '</span>' +
        '<span class="lencana">' + namaStatus(b.status) + '</span></div>' +
        '<h3><a href="detail.xhtml?id=' + b.id + '">' + bersihkan(b.nama) + '</a></h3>' +
        '<p>' + namaKategori(b.kategori) + '</p>' +
        '<p>Lokasi: ' + bersihkan(namaKampus(b.lokasi)) + '</p><p>' + bersihkan(b.tanggal) + '</p></div></div>';
}

function tampilkanBarang(id, daftar) {
    var bagian = ambil(id);
    if (!bagian) return;
    var hasil = "";
    for (var i = 0; i < daftar.length; i++) {
        hasil += buatKartu(daftar[i]);
    }
    bagian.innerHTML = hasil;
}

// Beranda: pengunjung melihat petunjuk, pengguna masuk melihat laporan terbaru.
if (ambil("bagian-cara")) {
    if (sudahMasuk()) {
        ambil("bagian-cara").style.display = "none";
        ambil("bagian-terbaru").style.display = "block";
        ambil("aksi-beranda-tamu").style.display = "none";
        ambil("aksi-beranda-masuk").style.display = "flex";
        tampilkanBarang("barang-terbaru", semuaLaporan().slice(0, 6));
    }
}

// Halaman pilihan masuk / daftar.
if (ambil("akses-masuk")) {
    var lokasiTujuan = encodeURIComponent(tujuanSebelumnya());
    ambil("akses-masuk").href = "login.xhtml?tujuan=" + lokasiTujuan;
    ambil("akses-daftar").href = "pendaftaran.xhtml?tujuan=" + lokasiTujuan;
    if (sudahMasuk()) window.location.href = tujuanSebelumnya();
}

// Pindah antara form login dan daftar dengan tujuan tetap sama.
if (halamanAkun()) {
    var tujuanLogin = encodeURIComponent(tujuanSebelumnya());
    if (ambil("link-daftar")) ambil("link-daftar").href = "pendaftaran.xhtml?tujuan=" + tujuanLogin;
    if (ambil("link-login")) ambil("link-login").href = "login.xhtml?tujuan=" + tujuanLogin;
}

function cekEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Pendaftaran hanya membuat akun pengguna biasa di browser.
if (ambil("form-daftar")) {
    ambil("form-daftar").onsubmit = function (event) {
        event.preventDefault();
        var nama = ambil("nama").value.trim();
        var email = ambil("email").value.trim().toLowerCase();
        var teams = ambil("teams").value.trim();
        var password = ambil("password").value;
        if (!nama || !cekEmail(email) || !teams || password.length < 8) {
            pesan("Lengkapi data dengan benar. Password minimal 8 karakter.");
            return;
        }
        if (cariAkunAdmin(email) || semuaAkunLokal()[email]) {
            pesan("Email ini sudah terdaftar. Silakan masuk atau gunakan Lupa password.");
            return;
        }
        if (password != ambil("konfirmasi").value) {
            pesan("Konfirmasi password tidak sama.");
            return;
        }
        var akunBaru = { nama: nama, email: email, teams: teams, password: password, role: "user" };
        var daftar = semuaAkunLokal();
        daftar[email] = akunBaru;
        simpanLokal("atlofAkunLokal", daftar);
        simpanSesi("atlofAkun", { nama: nama, email: email, teams: teams, role: "user" });
        sessionStorage.setItem("atlofMasuk", "ya");
        window.location.href = tujuanSebelumnya();
    };
}

if (ambil("form-login")) {
    ambil("form-login").onsubmit = function (event) {
        event.preventDefault();
        var email = ambil("email").value.trim().toLowerCase();
        var password = ambil("password").value;
        if (!cekEmail(email) || !password) {
            pesan("Masukkan email dan password yang benar.");
            return;
        }
        var akun = cariAkunTerdaftar(email);
        if (!akun) {
            pesan("Email belum terdaftar. Silakan daftar terlebih dahulu.");
            return;
        }
        if (akun.password != password) {
            pesan(akun.role == "admin_cs"
                ? "Password akun CS tidak sesuai."
                : "Password tidak sesuai. Gunakan Lupa password jika kamu lupa.");
            return;
        }
        if (akun.role == "admin_cs") {
            simpanSesi("atlofAkun", akunAdmin(cariAkunAdmin(email)));
            sessionStorage.setItem("atlofMasuk", "ya");
            window.location.href = "admin_cs.xhtml";
        } else {
            simpanSesi("atlofAkun", { nama: akun.nama, email: akun.email, teams: akun.teams, role: "user" });
            sessionStorage.setItem("atlofMasuk", "ya");
            window.location.href = tujuanSebelumnya() == "admin_cs.xhtml" ? "index.xhtml" : tujuanSebelumnya();
        }
    };
}

// Lupa password: cari akun di localStorage atau daftar Admin CS.
if (ambil("form-lupa")) {
    ambil("form-lupa").onsubmit = function (event) {
        event.preventDefault();
        var email = ambil("email-lupa").value.trim().toLowerCase();
        var hasil = ambil("hasil-lupa");
        hasil.style.display = "none";
        if (!cekEmail(email)) {
            teks("pesan-lupa", "Masukkan alamat email yang valid.");
            ambil("pesan-lupa").className = "bantuan pesan-gagal";
            return;
        }
        var akun = cariAkunTerdaftar(email);
        if (!akun) {
            teks("pesan-lupa", "Akun dengan email tersebut tidak ditemukan.");
            ambil("pesan-lupa").className = "bantuan pesan-gagal";
            return;
        }
        teks("pesan-lupa", "Akun ditemukan: " + akun.nama + ".");
        ambil("pesan-lupa").className = "bantuan pesan-berhasil";
        ambil("link-ubah-password").href = "ubah_password.xhtml?email=" + encodeURIComponent(email);
        hasil.style.display = "block";
    };
}

// Ubah password setelah akun ditemukan pada halaman Lupa password.
if (ambil("form-ubah-password")) {
    var parameterReset = new URLSearchParams(window.location.search);
    var emailReset = (parameterReset.get("email") || "").trim().toLowerCase();
    var akunReset = cariAkunTerdaftar(emailReset);
    if (akunReset) {
        teks("email-target", akunReset.email + " (" + akunReset.nama + ")");
    } else {
        teks("email-target", "Akun tidak ditemukan.");
        teks("pesan-ubah", "Buka halaman Lupa password dan masukkan email akun kamu terlebih dahulu.");
        ambil("pesan-ubah").className = "bantuan pesan-gagal";
        ambil("form-ubah-password").style.display = "none";
    }
    if (ambil("tampilkan-password-baru")) {
        ambil("tampilkan-password-baru").onchange = function () {
            var tipe = this.checked ? "text" : "password";
            ambil("password-baru").type = tipe;
            ambil("konfirmasi-ubah").type = tipe;
        };
    }
    ambil("form-ubah-password").onsubmit = function (event) {
        event.preventDefault();
        if (!akunReset) return;
        var passwordBaru = ambil("password-baru").value;
        if (passwordBaru.length < 8) {
            teks("pesan-ubah", "Password baru minimal 8 karakter.");
            ambil("pesan-ubah").className = "bantuan pesan-gagal";
            return;
        }
        if (passwordBaru != ambil("konfirmasi-ubah").value) {
            teks("pesan-ubah", "Konfirmasi password baru tidak sama.");
            ambil("pesan-ubah").className = "bantuan pesan-gagal";
            return;
        }
        simpanKataSandi(emailReset, passwordBaru);
        teks("pesan-ubah", "");
        ambil("pesan-ubah").className = "bantuan";
        ambil("form-ubah-password").style.display = "none";
        ambil("hasil-ubah").style.display = "block";
    };
}

var kotakPassword = document.querySelectorAll(".lihat-password");
for (var i = 0; i < kotakPassword.length; i++) {
    kotakPassword[i].onchange = function () {
        // Checkbox login atau register sama-sama mengarah ke id password.
        if (ambil("password")) ambil("password").type = this.checked ? "text" : "password";
    };
}

// Katalog: pencarian, kategori, jenis, lokasi dan status.
function filterBarang() {
    if (!ambil("semua-barang")) return;
    var kata = ambil("cari").value.toLowerCase();
    var jenis = ambil("filter-jenis").value;
    var kategori = ambil("filter-kategori").value;
    var lokasi = ambil("filter-lokasi").value;
    var status = ambil("filter-status").value;
    var hasil = [];
    var daftar = semuaLaporan();
    for (var i = 0; i < daftar.length; i++) {
        var b = daftar[i];
        if ((b.nama + " " + b.lokasi + " " + b.deskripsi).toLowerCase().indexOf(kata) == -1) continue;
        if (jenis && b.jenis != jenis) continue;
        if (kategori && b.kategori != kategori) continue;
        if (lokasi && b.lokasi != lokasi) continue;
        if (status && b.status != status) continue;
        hasil.push(b);
    }
    tampilkanBarang("semua-barang", hasil);
    teks("jumlah-barang", hasil.length + " laporan ditemukan");
    ambil("tidak-ada").style.display = hasil.length ? "none" : "block";
}

if (ambil("semua-barang")) {
    filterBarang();
    ambil("tombol-filter").onclick = filterBarang;
    ambil("form-cari").onsubmit = function (event) {
        event.preventDefault();
        filterBarang();
    };
    ambil("tombol-reset").onclick = function () {
        ambil("cari").value = "";
        ambil("filter-jenis").value = "";
        ambil("filter-kategori").value = "";
        ambil("filter-lokasi").value = "";
        ambil("filter-status").value = "";
        filterBarang();
    };
}

function cariBarang(id) {
    var daftar = semuaLaporan();
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].id == id) return daftar[i];
    }
    return null;
}

// Detail barang.
if (ambil("detail-nama") && sudahMasuk()) {
    var detailId = Number(new URLSearchParams(window.location.search).get("id"));
    var detail = cariBarang(detailId);
    if (detail) {
        ambil("detail-foto").src = detail.gambar;
        teks("detail-nama", detail.nama);
        teks("detail-jenis", detail.jenis == "hilang" ? "Hilang" : "Ditemukan");
        teks("detail-status", namaStatus(detail.status));
        teks("detail-pelapor", "Dilaporkan oleh " + detail.pelapor);
        teks("detail-kategori", namaKategori(detail.kategori));
        teks("detail-lokasi", detail.detail_lokasi ? namaKampus(detail.lokasi) + " - " + detail.detail_lokasi : namaKampus(detail.lokasi));
        teks("detail-tanggal", detail.tanggal);
        teks("detail-simpan", namaKampus(detail.penyimpanan));
        teks("detail-deskripsi", detail.deskripsi);
        var titipCS = detail.penyimpanan && detail.penyimpanan.indexOf("CS Kampus ") == 0;
        var telepon = detail.telepon || "";
        var teams = detail.teams || "";
        if (titipCS) {
            var lokasiCS = detail.penyimpanan.replace("CS ", "");
            telepon = nomorAdmin(lokasiCS);
            teks("detail-info-kontak", "Barang ditangani oleh " + namaKampus(detail.penyimpanan) +
                ". Hubungi CS kampus untuk proses pengambilan dan verifikasi kepemilikan.");
            ambil("detail-teams").style.display = "none";
        } else {
            teks("detail-info-kontak", "Hubungi pelapor untuk menanyakan informasi dan verifikasi barang.");
            ambil("detail-teams").href = teams ?
                "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(teams) :
                "https://teams.microsoft.com/";
        }
        if (telepon) {
            var nomorWhatsapp = telepon.replace(/[^0-9]/g, "");
            if (nomorWhatsapp.charAt(0) == "0") nomorWhatsapp = "62" + nomorWhatsapp.slice(1);
            teks("detail-nomor", telepon);
            ambil("detail-whatsapp-link").href = "https://wa.me/" + nomorWhatsapp;
            ambil("detail-whatsapp").style.display = "flex";
        } else if (titipCS) {
            teks("detail-info-kontak", "Barang ditangani oleh " + namaKampus(detail.penyimpanan) +
                ". Nomor WhatsApp layanan belum tersedia.");
        }
    } else {
        teks("detail-nama", "Laporan tidak ditemukan");
    }
}

// Pengguna memilih status lewat dropdown, lalu menekan Simpan status.
function pilihanStatus(b, awalan) {
    var pilihan = b.jenis == "hilang" ? [
        ["masih_dicari", "Masih dicari"],
        ["sudah_ditemukan", "Sudah ditemukan"]
    ] : [
        ["belum_dikembalikan", "Belum dikembalikan"],
        ["sudah_dikembalikan", "Sudah dikembalikan"]
    ];
    var isi = '<select id="' + awalan + b.id + '" title="Pilih status laporan">';
    for (var i = 0; i < pilihan.length; i++) {
        isi += '<option value="' + pilihan[i][0] + '"' +
            (b.status == pilihan[i][0] ? ' selected="selected"' : '') +
            '>' + pilihan[i][1] + '</option>';
    }
    return isi + '</select>';
}

function perbaruiLaporanSaya() {
    if (!ambil("barang-saya")) return;
    var daftar = laporanMilikSaya();
    var isi = "";
    var hilang = 0;
    var ditemukan = 0;
    for (var i = 0; i < daftar.length; i++) {
        var b = daftar[i];
        if (b.jenis == "hilang") hilang++;
        else ditemukan++;
        var dititipCS = b.jenis == "ditemukan" && b.penyimpanan.indexOf("CS Kampus ") == 0;
        isi += '<div class="kartu-kelola" id="kelola-' + b.id + '">' + buatKartu(b) +
            '<div class="aksi-kelola">' +
            '<a href="edit_laporan.xhtml?id=' + b.id + '" class="tombol tombol-outline tombol-kecil">Edit</a>' +
            '<button type="button" class="tombol tombol-bahaya tombol-kecil" onclick="hapusLaporan(' + b.id + ')">Hapus</button>' +
            '</div>';
        if (dititipCS) {
            isi += '<p class="catatan-status">Status pengembalian dikelola oleh CS tempat barang dititipkan.</p>';
        } else {
            isi += '<div class="pengaturan-status"><label for="status-' + b.id + '">Ubah status laporan</label>' +
                pilihanStatus(b, "status-") +
                '<button type="button" class="tombol tombol-kuning tombol-kecil" onclick="simpanStatus(' + b.id + ')">Simpan status</button></div>';
        }
        isi += '</div>';
    }
    ambil("barang-saya").innerHTML = isi;
    teks("total-saya", daftar.length);
    teks("jumlah-hilang", hilang);
    teks("jumlah-ditemukan", ditemukan);
    ambil("kosong-saya").style.display = daftar.length ? "none" : "block";
}

function simpanStatus(id) {
    var daftar = laporanSaya();
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].id == id && daftar[i].pelaporEmail == dataAkun().email) {
            var baru = ambil("status-" + id).value;
            if (daftar[i].status == baru) {
                pesan("Status laporan belum berubah.");
                return;
            }
            if (!confirm("Ubah status laporan menjadi '" + namaStatus(baru) + "'?")) return;
            daftar[i].status = baru;
            simpanSesi("atlofLaporan", daftar);
            perbaruiLaporanSaya();
            return;
        }
    }
}

function hapusLaporan(id) {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;
    var lama = laporanSaya();
    var baru = [];
    for (var i = 0; i < lama.length; i++) {
        if (lama[i].id != id || lama[i].pelaporEmail != dataAkun().email) baru.push(lama[i]);
    }
    simpanSesi("atlofLaporan", baru);
    perbaruiLaporanSaya();
}

if (ambil("barang-saya")) perbaruiLaporanSaya();

function tanggalBenar(input) {
    var bagian = input.split("-");
    if (bagian.length != 3) return false;
    var hari = Number(bagian[0]);
    var bulan = Number(bagian[1]);
    var tahun = Number(bagian[2]);
    var tanggal = new Date(tahun, bulan - 1, hari);
    return tanggal.getFullYear() == tahun &&
        tanggal.getMonth() == bulan - 1 &&
        tanggal.getDate() == hari;
}

// Kalender sederhana dibuat dengan JavaScript agar cocok untuk XHTML 1.0 Strict.
function pasangKalender() {
    if (!ambil("tanggal") || !ambil("kotak-kalender")) return;

    var bulanSaatIni = new Date().getMonth();
    var tahunSaatIni = new Date().getFullYear();
    var namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var kalender = ambil("kotak-kalender");
    var input = ambil("tanggal");

    function duaAngka(angka) {
        return angka < 10 ? "0" + angka : String(angka);
    }

    function gambarKalender() {
        teks("nama-bulan", namaBulan[bulanSaatIni] + " " + tahunSaatIni);
        var urutanHari = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        var isi = "";
        for (var i = 0; i < urutanHari.length; i++) {
            isi += '<span class="nama-hari">' + urutanHari[i] + '</span>';
        }

        var hariPertama = new Date(tahunSaatIni, bulanSaatIni, 1).getDay();
        var kolomAwal = (hariPertama + 6) % 7;
        var jumlahHari = new Date(tahunSaatIni, bulanSaatIni + 1, 0).getDate();

        for (var kosong = 0; kosong < kolomAwal; kosong++) {
            isi += '<span class="tanggal-kosong"></span>';
        }
        for (var hari = 1; hari <= jumlahHari; hari++) {
            isi += '<button type="button" class="pilih-hari" value="' + hari + '">' + hari + '</button>';
        }
        ambil("hari-kalender").innerHTML = isi;

        var tombolHari = kalender.querySelectorAll(".pilih-hari");
        for (var j = 0; j < tombolHari.length; j++) {
            tombolHari[j].onclick = function () {
                var hariDipilih = Number(this.value);
                input.value = duaAngka(hariDipilih) + "-" + duaAngka(bulanSaatIni + 1) + "-" + tahunSaatIni;
                kalender.style.display = "none";
            };
        }
    }

    function bukaKalender() {
        // Bila tanggal sudah dipilih, buka pada bulan tanggal tersebut.
        if (tanggalBenar(input.value)) {
            var bagian = input.value.split("-");
            bulanSaatIni = Number(bagian[1]) - 1;
            tahunSaatIni = Number(bagian[2]);
        }
        gambarKalender();
        kalender.style.display = "block";
    }

    ambil("buka-kalender").onclick = bukaKalender;
    input.onclick = bukaKalender;
    ambil("bulan-sebelum").onclick = function () {
        bulanSaatIni--;
        if (bulanSaatIni < 0) {
            bulanSaatIni = 11;
            tahunSaatIni--;
        }
        gambarKalender();
    };
    ambil("bulan-berikut").onclick = function () {
        bulanSaatIni++;
        if (bulanSaatIni > 11) {
            bulanSaatIni = 0;
            tahunSaatIni++;
        }
        gambarKalender();
    };
    document.addEventListener("click", function (event) {
        var areaTanggal = document.querySelector(".tanggal-pilih");
        if (areaTanggal && !areaTanggal.contains(event.target)) {
            kalender.style.display = "none";
        }
    });
}

pasangKalender();

function aturFormLaporan(idForm) {
    var form = ambil(idForm);
    if (!form) return;
    var tombolJenis = form.querySelectorAll('input[name="jenis"]');
    var editId = new URLSearchParams(window.location.search).get("id");
    var dataEdit = null;

    function aturPilihan() {
        var ditemukan = tombolJenis[1].checked;
        ambil("wadah-penyimpanan").style.display = ditemukan ? "block" : "none";
        teks("label-lokasi", ditemukan ? "Lokasi ditemukan *" : "Lokasi hilang *");
        aturLokasiLainnya();
    }

    function aturLokasiLainnya() {
        ambil("wadah-detail-lokasi").style.display = ambil("lokasi").value == "Lainnya" ? "block" : "none";
    }

    tombolJenis[0].onchange = aturPilihan;
    tombolJenis[1].onchange = aturPilihan;
    ambil("lokasi").onchange = aturLokasiLainnya;

    if (idForm == "form-edit") {
        dataEdit = cariBarang(editId);
        if (dataEdit && dataEdit.pelaporEmail != dataAkun().email) {
            window.location.href = "laporan_saya.xhtml";
            return;
        }
        if (dataEdit) {
            ambil("nama-barang").value = dataEdit.nama;
            ambil("kategori").value = dataEdit.kategori;
            ambil("tanggal").value = dataEdit.tanggal;
            ambil("lokasi").value = dataEdit.lokasi;
            ambil("detail-lokasi").value = dataEdit.detail_lokasi || "";
            ambil("deskripsi").value = dataEdit.deskripsi;
            ambil("telepon").value = dataEdit.telepon || "";
            ambil("penyimpanan").value = dataEdit.penyimpanan == "-" ? "" : dataEdit.penyimpanan;
            if (dataEdit.jenis == "ditemukan") tombolJenis[1].checked = true;
        }
    }
    aturPilihan();

    if (adalahAdmin()) {
        var akunCs = dataAkun();
        if (idForm == "form-laporan") ambil("telepon").value = akunCs.telepon || "";
        ambil("telepon").readOnly = true;
        teks("bantuan-telepon", "Kontak laporan CS mengikuti nomor WhatsApp layanan yang diatur di halaman profil admin.");
    }

    form.onsubmit = function (event) {
        event.preventDefault();
        var nama = ambil("nama-barang").value.trim();
        var jenis = tombolJenis[1].checked ? "ditemukan" : "hilang";
        var kategori = ambil("kategori").value;
        var tanggal = ambil("tanggal").value.trim();
        var lokasi = ambil("lokasi").value;
        var deskripsi = ambil("deskripsi").value.trim();
        var penyimpanan = jenis == "ditemukan" ? ambil("penyimpanan").value : "-";
        var foto = ambil("foto").files[0];
        if (!nama || !kategori || !tanggalBenar(tanggal) || !lokasi || !deskripsi || (jenis == "ditemukan" && !penyimpanan)) {
            pesan("Lengkapi formulir dan pilih tanggal kejadian dari kalender.");
            return;
        }
        if (lokasi == "Lainnya" && !ambil("detail-lokasi").value.trim()) {
            pesan("Tuliskan keterangan lokasi lainnya.");
            return;
        }
        if (foto && !/^image\/(jpeg|png|webp)$/.test(foto.type)) {
            pesan("Gunakan foto JPG, PNG, atau WEBP.");
            return;
        }
        if (foto && foto.size > 1000000) {
            pesan("Ukuran foto maksimal 1 MB.");
            return;
        }
        var akun = dataAkun();
        var daftar = laporanSaya();
        var laporan = {
            id: dataEdit ? dataEdit.id : Date.now(),
            nama: nama,
            jenis: jenis,
            kategori: kategori,
            tanggal: tanggal,
            lokasi: lokasi,
            status: dataEdit ? dataEdit.status : (jenis == "hilang" ? "masih_dicari" : "belum_dikembalikan"),
            penyimpanan: penyimpanan,
            detail_lokasi: ambil("detail-lokasi").value.trim(),
            status_cs: jenis == "ditemukan" && penyimpanan.indexOf("CS Kampus ") == 0 ?
                (dataEdit ? dataEdit.status_cs : (adalahAdmin() && penyimpanan == "CS " + akun.kampus_cs ? "diterima" : "menunggu")) : "",
            deskripsi: deskripsi,
            pelapor: akun.nama,
            pelaporEmail: akun.email,
            teams: akun.teams,
            telepon: ambil("telepon").value.trim(),
            gambar: gambarKategori(kategori)
        };
        if (dataEdit) {
            for (var i = 0; i < daftar.length; i++) {
                if (daftar[i].id == dataEdit.id) daftar[i] = laporan;
            }
        } else {
            daftar.unshift(laporan);
        }
        simpanSesi("atlofLaporan", daftar);
        window.location.href = "laporan_saya.xhtml";
    };
}

aturFormLaporan("form-laporan");
aturFormLaporan("form-edit");

// Profil: user melihat identitas; admin juga melihat kampus dan nomor layanan.
function perbaruiProfil() {
    var akun = dataAkun();
    teks("nama-profil", akun.nama);
    teks("email-profil", akun.email);
    teks("info-nama", akun.nama);
    teks("info-email", akun.email);
    teks("info-teams", akun.teams || "-");
    teks("avatar-profil", akun.nama.charAt(0).toUpperCase());
    if (adalahAdmin()) {
        ambil("label-peran").style.display = "inline-block";
        ambil("identitas-admin").style.display = "grid";
        ambil("identitas-wa").style.display = "grid";
        ambil("form-nomor-cs").style.display = "block";
        teks("info-kampus-cs", namaKampus(akun.kampus_cs));
        teks("info-telepon", akun.telepon || "Belum diisi");
    }
}

function tampilkanForm(id) {
    ambil("profil-identitas").style.display = "none";
    ambil("profil-tombol").style.display = "none";
    ambil("form-profil").style.display = id == "form-profil" ? "block" : "none";
    ambil("form-password").style.display = id == "form-password" ? "block" : "none";
}

function tutupFormProfil() {
    ambil("profil-identitas").style.display = "grid";
    ambil("profil-tombol").style.display = "flex";
    ambil("form-profil").style.display = "none";
    ambil("form-password").style.display = "none";
}

if (ambil("form-profil")) {
    perbaruiProfil();
    ambil("tombol-edit-profil").onclick = function () {
        var akun = dataAkun();
        ambil("nama").value = akun.nama;
        ambil("email").value = akun.email;
        ambil("teams").value = akun.teams || "";
        if (adalahAdmin()) ambil("nomor-cs").value = akun.telepon || "";
        tampilkanForm("form-profil");
    };
    ambil("tombol-ganti-password").onclick = function () {
        tampilkanForm("form-password");
    };
    ambil("tombol-logout").onclick = keluar;
    var batal = document.querySelectorAll(".batal-profil");
    for (var i = 0; i < batal.length; i++) batal[i].onclick = tutupFormProfil;
    ambil("form-profil").onsubmit = function (event) {
        event.preventDefault();
        var nama = ambil("nama").value.trim();
        var teams = ambil("teams").value.trim();
        if (!nama || (!adalahAdmin() && !teams)) {
            pesan("Lengkapi nama dan kontak Teams.");
            return;
        }
        var akun = dataAkun();
        akun.nama = nama;
        akun.teams = teams;
        if (adalahAdmin()) {
            var telepon = ambil("nomor-cs").value.trim();
            if (telepon && !/^(\+?\d[\d\s-]{7,17})$/.test(telepon)) {
                pesan("Masukkan nomor WhatsApp layanan yang valid.");
                return;
            }
            akun.telepon = telepon;
            var semua = kontakAdmin();
            semua[akun.email] = { nama: nama, teams: teams, telepon: telepon };
            simpanSesi("atlofKontakAdmin", semua);
        }
        simpanSesi("atlofAkun", akun);
        perbaruiProfil();
        tutupFormProfil();
        pesan("Profil berhasil diperbarui.");
    };
    ambil("form-password").onsubmit = function (event) {
        event.preventDefault();
        var akun = dataAkun();
        var tersimpan = cariAkunTerdaftar(akun.email);
        if (!tersimpan || tersimpan.password != ambil("password-lama").value) {
            pesan("Password sekarang tidak sesuai.");
            return;
        }
        if (ambil("password-baru").value.length < 8) {
            pesan("Password baru minimal 8 karakter.");
            return;
        }
        if (ambil("password-baru").value != ambil("konfirmasi-password").value) {
            pesan("Konfirmasi password baru tidak sama.");
            return;
        }
        simpanKataSandi(akun.email, ambil("password-baru").value);
        ambil("form-password").reset();
        tutupFormProfil();
        pesan("Password berhasil diubah.");
    };
}

// Dashboard Admin CS hanya menampilkan barang yang dititipkan di kampusnya.
function statusCS(b) {
    if (b.status_cs) return b.status_cs;
    if (b.status == "sudah_dikembalikan") return "dikembalikan";
    return "menunggu";
}

function namaStatusCS(status) {
    if (status == "diterima") return "Diterima CS";
    if (status == "dikembalikan") return "Sudah dikembalikan";
    return "Menunggu diterima";
}

function daftarBarangCS() {
    var daftar = semuaLaporan();
    var hasil = [];
    if (!adalahAdmin()) return hasil;
    var lokasi = "CS " + dataAkun().kampus_cs;
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].jenis == "ditemukan" && daftar[i].penyimpanan == lokasi) hasil.push(daftar[i]);
    }
    return hasil;
}

function tampilkanDashboardCS() {
    if (!ambil("daftar-admin") || !adalahAdmin()) return;
    var daftar = daftarBarangCS();
    var isi = "";
    var menunggu = 0;
    var diterima = 0;
    var selesai = 0;
    for (var i = 0; i < daftar.length; i++) {
        var b = daftar[i];
        var kondisi = statusCS(b);
        if (kondisi == "menunggu") menunggu++;
        if (kondisi == "diterima") diterima++;
        if (kondisi == "dikembalikan") selesai++;
        isi += '<div class="baris-admin">' +
            '<div class="info-admin"><img src="' + bersihkan(b.gambar) + '" alt="Foto kategori barang" />' +
            '<div><h3><a href="detail.xhtml?id=' + b.id + '">' + bersihkan(b.nama) + '</a></h3>' +
            '<p>' + bersihkan(b.pelapor) + ' · ' + bersihkan(namaKampus(b.lokasi)) + '</p>' +
            '<span class="lencana">' + namaStatusCS(kondisi) + '</span></div></div>' +
            '<div class="kontrol-admin"><label for="status-cs-' + b.id + '">Status penanganan</label>' +
            '<select id="status-cs-' + b.id + '">' +
            '<option value="menunggu"' + (kondisi == "menunggu" ? ' selected="selected"' : '') + '>Menunggu diterima</option>' +
            '<option value="diterima"' + (kondisi == "diterima" ? ' selected="selected"' : '') + '>Diterima CS</option>' +
            '<option value="dikembalikan"' + (kondisi == "dikembalikan" ? ' selected="selected"' : '') + '>Sudah dikembalikan</option>' +
            '</select><button type="button" class="tombol tombol-kuning tombol-kecil" onclick="simpanStatusCS(' + b.id + ')">Simpan status</button></div></div>';
    }
    teks("subjudul-admin", "Kelola barang yang dititipkan di " + namaKampus(dataAkun().kampus_cs) + ".");
    teks("admin-total", daftar.length);
    teks("admin-menunggu", menunggu);
    teks("admin-diterima", diterima);
    teks("admin-selesai", selesai);
    teks("nomor-wa-admin", dataAkun().telepon || "Belum diatur");
    ambil("daftar-admin").innerHTML = isi;
    ambil("kosong-admin").style.display = daftar.length ? "none" : "block";
}

function simpanStatusCS(id) {
    if (!adalahAdmin()) return;
    var laporan = cariBarang(id);
    if (!laporan || laporan.penyimpanan != "CS " + dataAkun().kampus_cs) return;
    var statusBaru = ambil("status-cs-" + id).value;
    if (statusCS(laporan) == statusBaru) {
        pesan("Status penanganan belum berubah.");
        return;
    }
    if (statusBaru == "dikembalikan" && statusCS(laporan) == "menunggu") {
        pesan("Konfirmasi penerimaan barang terlebih dahulu sebelum mencatat pengembalian.");
        return;
    }
    if (!confirm("Ubah penanganan barang menjadi '" + namaStatusCS(statusBaru) + "'?")) return;
    laporan.status_cs = statusBaru;
    laporan.status = statusBaru == "dikembalikan" ? "sudah_dikembalikan" : "belum_dikembalikan";
    var daftar = laporanSaya();
    var ditemukan = false;
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].id == id) {
            daftar[i].status_cs = laporan.status_cs;
            daftar[i].status = laporan.status;
            ditemukan = true;
        }
    }
    if (ditemukan) {
        simpanSesi("atlofLaporan", daftar);
    } else {
        var perubahan = bacaSesi("atlofPerubahanContoh", {});
        perubahan[id] = { status_cs: laporan.status_cs, status: laporan.status };
        simpanSesi("atlofPerubahanContoh", perubahan);
    }
    tampilkanDashboardCS();
}

if (ambil("daftar-admin")) tampilkanDashboardCS();
