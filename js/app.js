/*
    ATLOF - JavaScript Frontend
    Pemrograman Web Dasar

    Data utama (akun, laporan, serah terima) disimpan di MySQL dan diakses
    lewat endpoint PHP. localStorage/sessionStorage hanya dipakai sebagai
    fallback offline (protokol file://) saat server tidak aktif.
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

// ========================================================
// Lapisan data server (MySQL melalui PHP)
// ========================================================
var modeServer = window.location.protocol === "http:" || window.location.protocol === "https:";
var cacheLaporan = null; // null = belum dimuat dari server
var cacheSerah = null;   // null = belum dimuat dari server

function mintaJson(url, opsi) {
    return fetch(url, opsi || {}).then(function (res) {
        return res.json().then(function (data) {
            return { ok: res.ok, data: data };
        });
    });
}

function kirimData(url, data) {
    return mintaJson(url, {
        method: "POST",
        body: data,
        headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" }
    });
}

// Sesi PHP adalah sumber kebenaran saat aplikasi berjalan lewat Apache.
function muatSesiServer() {
    if (!modeServer) return Promise.resolve();
    return mintaJson("cek_sesi.php", {
        headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" },
        cache: "no-store"
    }).then(function (hasil) {
        var data = hasil.data;
        if (hasil.ok && data && data.is_logged && data.user) {
            sessionStorage.setItem("atlofMasuk", "ya");
            sessionStorage.setItem("atlofSesiServer", "ya");
            simpanSesi("atlofAkun", {
                nama: data.user.nama,
                email: data.user.email,
                teams: data.user.teams || "",
                telepon: data.user.telepon || "",
                role: data.user.role || "user",
                kampus_cs: data.user.kampus_cs || null,
                foto: data.user.foto || ""
            });
        } else if (sessionStorage.getItem("atlofSesiServer") === "ya") {
            sessionStorage.removeItem("atlofMasuk");
            sessionStorage.removeItem("atlofAkun");
            sessionStorage.removeItem("atlofSesiServer");
        }
    }).catch(function () {
        // Server tidak dapat dihubungi: biarkan mode lokal tetap berjalan.
    });
}

function muatLaporanServer() {
    if (!modeServer || !sudahMasuk()) return Promise.resolve();
    return mintaJson("laporan.php?aksi=list", {
        headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" },
        cache: "no-store"
    }).then(function (hasil) {
        if (hasil.ok && hasil.data && hasil.data.status === "success" && Array.isArray(hasil.data.data)) {
            cacheLaporan = hasil.data.data;
        }
    }).catch(function () {
        // Tetap gunakan data lokal bila server gagal.
    });
}

function muatSerahServer() {
    if (!modeServer || !adalahAdmin()) return Promise.resolve();
    return mintaJson("serah_terima.php?aksi=list", {
        headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" },
        cache: "no-store"
    }).then(function (hasil) {
        if (hasil.ok && hasil.data && hasil.data.status === "success" && Array.isArray(hasil.data.data)) {
            cacheSerah = hasil.data.data;
        }
    }).catch(function () {
        // Tetap gunakan data lokal bila server gagal.
    });
}

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
    var daftar = semuaLaporan();
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
    sessionStorage.removeItem("atlofAkun");
    sessionStorage.removeItem("atlofSesiServer");
    if (window.fetch && modeServer) {
        fetch("logout.php", {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" }
        }).finally(function () {
            window.location.href = "index.xhtml";
        });
    } else {
        window.location.href = "index.xhtml";
    }
}

// Cegah kunjungan langsung ke halaman khusus pengguna sebelum masuk.
// Pemeriksaan dijalankan setelah sesi PHP selesai dimuat.
var halamanKhusus = ["katalog.xhtml", "detail.xhtml", "buat_laporan.xhtml", "edit_laporan.xhtml", "laporan_saya.xhtml", "profil.xhtml", "admin_cs.xhtml", "serah_terima.xhtml", "riwayat_serah_terima.xhtml"];
var halamanAdminSaja = ["admin_cs.xhtml", "serah_terima.xhtml", "riwayat_serah_terima.xhtml"];
var sekarang = halamanIni();

function cekAksesHalaman() {
    if (!sudahMasuk() && halamanKhusus.indexOf(sekarang) != -1) {
        pergiKeAkses(sekarang + window.location.search);
        return false;
    }
    if (sudahMasuk() && !adalahAdmin() && halamanAdminSaja.indexOf(sekarang) != -1) {
        window.location.href = "index.xhtml";
        return false;
    }
    return true;
}

// Atur tombol Masuk/Daftar pada header.
function pasangHeaderAkun() {
    if (!ambil("menu-akun") || !sudahMasuk()) return;
    ambil("menu-akun").innerHTML =
        '<a href="profil.xhtml" class="tombol tombol-outline tombol-kecil">Profil</a>' +
        '<button id="keluar-header" type="button" class="tombol tombol-kecil tombol-keluar">Keluar</button>';
    ambil("keluar-header").onclick = keluar;
    if (adalahAdmin()) {
        var daftarMenu = document.querySelector(".menu-links");
        if (daftarMenu) {
            daftarMenu.innerHTML += '<a href="admin_cs.xhtml"' +
                (sekarang == "admin_cs.xhtml" ? ' class="aktif"' : '') + '>Dashboard CS</a>';
        }
    }
}

// Tautan katalog / laporan dari beranda harus melewati halaman akun.
function pasangTautanAkses() {
    var tautan = document.getElementsByTagName("a");
    for (var t = 0; t < tautan.length; t++) {
        (function (link) {
            var halaman = link.getAttribute("href") || "";
            if (!sudahMasuk() && /^(katalog|detail|buat_laporan|edit_laporan|laporan_saya|profil|admin_cs|serah_terima|riwayat_serah_terima)\.xhtml/.test(halaman)) {
                link.onclick = function (event) {
                    event.preventDefault();
                    pergiKeAkses(halaman);
                };
            }
        })(tautan[t]);
    }
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
    // Saat data server sudah dimuat, pakai data MySQL sebagai sumber utama.
    if (cacheLaporan !== null) {
        return cacheLaporan;
    }
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
function tampilkanBeranda() {
    if (!ambil("bagian-cara") || !sudahMasuk()) return;
    ambil("bagian-cara").style.display = "none";
    ambil("bagian-terbaru").style.display = "block";
    ambil("aksi-beranda-tamu").style.display = "none";
    ambil("aksi-beranda-masuk").style.display = "flex";
    tampilkanBarang("barang-terbaru", semuaLaporan().slice(0, 6));
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

// Pendaftaran akun pengguna baru (mendukung backend PHP & fallback offline).
if (ambil("form-daftar")) {
    if (ambil("input-tujuan-daftar")) {
        ambil("input-tujuan-daftar").value = tujuanSebelumnya();
    }
    var paramDaftar = new URLSearchParams(window.location.search);
    if (paramDaftar.has("error")) {
        pesan(paramDaftar.get("error"));
    }

    ambil("form-daftar").onsubmit = function (event) {
        event.preventDefault();
        var nama = ambil("nama").value.trim();
        var email = ambil("email").value.trim().toLowerCase();
        var teams = ambil("teams").value.trim();
        var password = ambil("password").value;
        var konfirmasi = ambil("konfirmasi") ? ambil("konfirmasi").value : "";
        var tujuan = tujuanSebelumnya();

        if (!nama || !cekEmail(email) || !teams || password.length < 8) {
            pesan("Lengkapi data dengan benar. Password minimal 8 karakter.");
            return;
        }
        if (password !== konfirmasi) {
            pesan("Konfirmasi password tidak sama.");
            return;
        }

        function fallbackDaftarOffline() {
            if (cariAkunAdmin(email) || semuaAkunLokal()[email]) {
                pesan("Email ini sudah terdaftar. Silakan masuk.");
                return;
            }
            var akunBaru = { nama: nama, email: email, teams: teams, password: password, role: "user" };
            var daftar = semuaAkunLokal();
            daftar[email] = akunBaru;
            simpanLokal("atlofAkunLokal", daftar);
            simpanSesi("atlofAkun", { nama: nama, email: email, teams: teams, role: "user" });
            sessionStorage.setItem("atlofMasuk", "ya");
            window.location.href = tujuan;
        }

        if (modeServer) {
            var dataKirim = new FormData();
            dataKirim.append("nama", nama);
            dataKirim.append("email", email);
            dataKirim.append("teams", teams);
            dataKirim.append("password", password);
            dataKirim.append("konfirmasi", konfirmasi);
            dataKirim.append("tujuan", tujuan);

            fetch("proses_daftar.php", {
                method: "POST",
                body: dataKirim,
                headers: { "X-Requested-With": "XMLHttpRequest" }
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (hasil) {
                var data = hasil.data;
                if (!hasil.ok || data.status !== "success") {
                    pesan(data.message || "Pendaftaran gagal.");
                    return;
                }
                var user = data.user;
                simpanSesi("atlofAkun", {
                    nama: user.nama,
                    email: user.email,
                    teams: user.teams || "",
                    telepon: user.telepon || "",
                    role: user.role || "user"
                });
                sessionStorage.setItem("atlofMasuk", "ya");
                sessionStorage.setItem("atlofSesiServer", "ya");
                window.location.href = data.redirect || tujuan;
            })
            .catch(function () {
                fallbackDaftarOffline();
            });
        } else {
            fallbackDaftarOffline();
        }
    };
}

// Login pengguna dan Admin CS (mendukung backend PHP & fallback offline).
if (ambil("form-login")) {
    if (ambil("input-tujuan")) {
        ambil("input-tujuan").value = tujuanSebelumnya();
    }
    var paramUrl = new URLSearchParams(window.location.search);
    if (paramUrl.has("error")) {
        pesan(paramUrl.get("error"));
    }
    if (paramUrl.has("pesan")) {
        pesan(paramUrl.get("pesan"));
    }

    ambil("form-login").onsubmit = function (event) {
        event.preventDefault();
        var email = ambil("email").value.trim().toLowerCase();
        var password = ambil("password").value;
        var tujuan = tujuanSebelumnya();

        if (!cekEmail(email) || !password) {
            pesan("Masukkan email dan password yang benar.");
            return;
        }

        function fallbackLoginOffline() {
            var akun = cariAkunTerdaftar(email);
            if (!akun) {
                pesan("Email belum terdaftar. Silakan daftar terlebih dahulu.");
                return;
            }
            if (akun.password != password) {
                pesan(akun.role == "admin_cs"
                    ? "Password akun CS tidak sesuai."
                    : "Password tidak sesuai.");
                return;
            }
            if (akun.role == "admin_cs") {
                simpanSesi("atlofAkun", akunAdmin(cariAkunAdmin(email)));
                sessionStorage.setItem("atlofMasuk", "ya");
                window.location.href = "admin_cs.xhtml";
            } else {
                simpanSesi("atlofAkun", { nama: akun.nama, email: akun.email, teams: akun.teams, role: "user" });
                sessionStorage.setItem("atlofMasuk", "ya");
                window.location.href = tujuan == "admin_cs.xhtml" ? "index.xhtml" : tujuan;
            }
        }

        if (modeServer) {
            var dataKirim = new FormData();
            dataKirim.append("email", email);
            dataKirim.append("password", password);
            dataKirim.append("tujuan", tujuan);

            fetch("proses_login.php", {
                method: "POST",
                body: dataKirim,
                headers: { "X-Requested-With": "XMLHttpRequest" }
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (hasil) {
                var data = hasil.data;
                if (!hasil.ok || data.status !== "success") {
                    pesan(data.message || "Email atau password salah.");
                    return;
                }
                var user = data.user;
                if (user.role === "admin_cs") {
                    simpanSesi("atlofAkun", {
                        nama: user.nama,
                        email: user.email,
                        teams: user.teams || "",
                        telepon: user.telepon || "",
                        role: "admin_cs",
                        kampus_cs: user.kampus_cs
                    });
                    sessionStorage.setItem("atlofMasuk", "ya");
                    sessionStorage.setItem("atlofSesiServer", "ya");
                    window.location.href = data.redirect || "admin_cs.xhtml";
                } else {
                    simpanSesi("atlofAkun", {
                        nama: user.nama,
                        email: user.email,
                        teams: user.teams || "",
                        telepon: user.telepon || "",
                        role: "user"
                    });
                    sessionStorage.setItem("atlofMasuk", "ya");
                    sessionStorage.setItem("atlofSesiServer", "ya");
                    window.location.href = data.redirect || (tujuan == "admin_cs.xhtml" ? "index.xhtml" : tujuan);
                }
            })
            .catch(function () {
                fallbackLoginOffline();
            });
        } else {
            fallbackLoginOffline();
        }
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
function tampilkanDetail() {
    if (!ambil("detail-nama") || !sudahMasuk()) return;
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
            telepon = detail.telepon_cs || nomorAdmin(lokasiCS);
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
        isi += '<div class="kartu-kelola" id="kelola-' + b.id + '">' + buatKartu(b);
        if (dititipCS) {
            isi += '<p class="catatan-status">Status pengembalian dikelola oleh CS tempat barang dititipkan.</p>';
        } else {
            isi += '<div class="pengaturan-status"><label for="status-' + b.id + '">Ubah status laporan</label>' +
                pilihanStatus(b, "status-") +
                '<button type="button" class="tombol tombol-kuning tombol-kecil" onclick="simpanStatus(' + b.id + ')">Simpan status</button></div>';
        }
        isi += '<div class="aksi-kelola">' +
            '<a href="edit_laporan.xhtml?id=' + b.id + '" class="tombol tombol-outline tombol-kecil">Edit</a>' +
            '<button type="button" class="tombol tombol-bahaya tombol-kecil" onclick="hapusLaporan(' + b.id + ')">Hapus</button>' +
            '</div></div>';
    }
    ambil("barang-saya").innerHTML = isi;
    teks("total-saya", daftar.length);
    teks("jumlah-hilang", hilang);
    teks("jumlah-ditemukan", ditemukan);
    ambil("kosong-saya").style.display = daftar.length ? "none" : "block";
}

function simpanStatus(id) {
    var baru = ambil("status-" + id).value;
    var laporan = cariBarang(id);
    if (!laporan || laporan.pelaporEmail != dataAkun().email) return;
    if (laporan.status == baru) {
        pesan("Status laporan belum berubah.");
        return;
    }
    if (!confirm("Ubah status laporan menjadi '" + namaStatus(baru) + "'?")) return;

    if (modeServer && cacheLaporan !== null) {
        var dataKirim = new FormData();
        dataKirim.append("id", id);
        dataKirim.append("status", baru);
        kirimData("laporan.php?aksi=status", dataKirim).then(function (hasil) {
            if (!hasil.ok || hasil.data.status !== "success") {
                pesan(hasil.data.message || "Gagal memperbarui status laporan.");
                return;
            }
            laporan.status = baru;
            perbaruiLaporanSaya();
            pesan("Status laporan berhasil diperbarui.");
        }).catch(function () {
            pesan("Gagal menghubungi server.");
        });
        return;
    }

    var daftar = laporanSaya();
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].id == id && daftar[i].pelaporEmail == dataAkun().email) {
            daftar[i].status = baru;
            simpanSesi("atlofLaporan", daftar);
            perbaruiLaporanSaya();
            return;
        }
    }
}

function hapusLaporan(id) {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;

    if (modeServer && cacheLaporan !== null) {
        var dataKirim = new FormData();
        dataKirim.append("id", id);
        kirimData("laporan.php?aksi=delete", dataKirim).then(function (hasil) {
            if (!hasil.ok || hasil.data.status !== "success") {
                pesan(hasil.data.message || "Gagal menghapus laporan.");
                return;
            }
            var sisa = [];
            for (var i = 0; i < cacheLaporan.length; i++) {
                if (cacheLaporan[i].id != id) sisa.push(cacheLaporan[i]);
            }
            cacheLaporan = sisa;
            perbaruiLaporanSaya();
            pesan("Laporan berhasil dihapus.");
        }).catch(function () {
            pesan("Gagal menghubungi server.");
        });
        return;
    }

    var lama = laporanSaya();
    var baru = [];
    for (var i = 0; i < lama.length; i++) {
        if (lama[i].id != id || lama[i].pelaporEmail != dataAkun().email) baru.push(lama[i]);
    }
    simpanSesi("atlofLaporan", baru);
    perbaruiLaporanSaya();
}

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

    input.onclick = bukaKalender;
    input.onkeydown = function (event) {
        if (event.key == "Enter" || event.key == " ") {
            event.preventDefault();
            bukaKalender();
        }
    };
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

        if (modeServer) {
            var dataKirim = new FormData(form);
            if (dataEdit) dataKirim.append("id", dataEdit.id);
            kirimData("laporan.php?aksi=" + (dataEdit ? "update" : "create"), dataKirim).then(function (hasil) {
                if (!hasil.ok || hasil.data.status !== "success") {
                    pesan(hasil.data.message || "Gagal menyimpan laporan.");
                    return;
                }
                window.location.href = "laporan_saya.xhtml";
            }).catch(function () {
                pesan("Gagal menghubungi server.");
            });
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


// Profil: user melihat identitas; admin juga melihat kampus dan nomor layanan.
function perbaruiProfil() {
    var akun = dataAkun();
    teks("nama-profil", akun.nama);
    teks("email-profil", akun.email);
    teks("info-nama", akun.nama);
    teks("info-email", akun.email);
    teks("info-teams", akun.teams || "-");
    ambil("info-teams").className = akun.teams ? "" : "nilai-kosong";
    teks("avatar-profil", akun.nama.charAt(0).toUpperCase());
    if (adalahAdmin()) {
        ambil("label-peran-profil").style.display = "inline-block";
        ambil("identitas-admin").style.display = "grid";
        ambil("identitas-wa").style.display = "grid";
        ambil("form-nomor-cs").style.display = "block";
        teks("info-kampus-cs", namaKampus(akun.kampus_cs));
        teks("info-telepon", akun.telepon || "Belum diisi");
        ambil("info-telepon").className = akun.telepon ? "" : "nilai-kosong";
    }
}

function tampilkanForm(id) {
    ambil("data-profil").style.display = "none";
    ambil("profil-tombol").style.display = "none";
    ambil("form-profil").style.display = id == "form-profil" ? "block" : "none";
    ambil("form-password").style.display = id == "form-password" ? "block" : "none";
}

function tutupFormProfil() {
    ambil("data-profil").style.display = "grid";
    ambil("profil-tombol").style.display = "flex";
    ambil("form-profil").style.display = "none";
    ambil("form-password").style.display = "none";
}

if (ambil("form-profil")) {
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
        var telepon = adalahAdmin() ? ambil("nomor-cs").value.trim() : "";
        if (!nama || (!adalahAdmin() && !teams)) {
            pesan("Lengkapi nama dan kontak Teams.");
            return;
        }
        if (adalahAdmin() && telepon && !/^(\+?\d[\d\s-]{7,17})$/.test(telepon)) {
            pesan("Masukkan nomor WhatsApp layanan yang valid.");
            return;
        }

        if (modeServer) {
            var dataKirim = new FormData();
            dataKirim.append("nama", nama);
            dataKirim.append("teams", teams);
            dataKirim.append("telepon", telepon);
            kirimData("simpan_profil.php", dataKirim).then(function (hasil) {
                if (!hasil.ok || hasil.data.status !== "success") {
                    pesan(hasil.data.message || "Gagal memperbarui profil.");
                    return;
                }
                var akun = dataAkun();
                akun.nama = hasil.data.user.nama;
                akun.teams = hasil.data.user.teams || "";
                akun.telepon = hasil.data.user.telepon || "";
                simpanSesi("atlofAkun", akun);
                perbaruiProfil();
                tutupFormProfil();
                pesan("Profil berhasil diperbarui.");
            }).catch(function () {
                pesan("Gagal menghubungi server.");
            });
            return;
        }

        var akun = dataAkun();
        akun.nama = nama;
        akun.teams = teams;
        if (adalahAdmin()) {
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
        var passwordLama = ambil("password-lama").value;
        var passwordBaru = ambil("password-baru").value;
        var konfirmasi = ambil("konfirmasi-password").value;

        if (passwordBaru.length < 8) {
            pesan("Password baru minimal 8 karakter.");
            return;
        }
        if (passwordBaru != konfirmasi) {
            pesan("Konfirmasi password baru tidak sama.");
            return;
        }

        function suksesUbah() {
            simpanKataSandi(akun.email, passwordBaru);
            ambil("form-password").reset();
            tutupFormProfil();
            pesan("Password berhasil diubah.");
        }

        if (modeServer) {
            var dataKirim = new FormData();
            dataKirim.append("password_lama", passwordLama);
            dataKirim.append("password_baru", passwordBaru);
            dataKirim.append("konfirmasi", konfirmasi);

            fetch("ubah_password.php", {
                method: "POST",
                body: dataKirim,
                headers: { "X-Requested-With": "XMLHttpRequest" }
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (hasil) {
                if (!hasil.ok || hasil.data.status !== "success") {
                    pesan(hasil.data.message || "Gagal mengubah password.");
                    return;
                }
                suksesUbah();
            })
            .catch(function () {
                var tersimpan = cariAkunTerdaftar(akun.email);
                if (!tersimpan || tersimpan.password != passwordLama) {
                    pesan("Password sekarang tidak sesuai.");
                    return;
                }
                suksesUbah();
            });
            return;
        }

        var tersimpan = cariAkunTerdaftar(akun.email);
        if (!tersimpan || tersimpan.password != passwordLama) {
            pesan("Password sekarang tidak sesuai.");
            return;
        }
        suksesUbah();
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

var halamanAdmin = 1;
var jumlahPerHalamanAdmin = 5;

function tampilkanDashboardCS() {
    if (!ambil("daftar-admin") || !adalahAdmin()) return;
    var daftar = daftarBarangCS();
    var cari = ambil("cari-admin").value.toLowerCase().trim();
    var filter = ambil("filter-status-admin").value;
    var hasil = [];
    var menunggu = 0;
    var diterima = 0;
    var selesai = 0;

    for (var i = 0; i < daftar.length; i++) {
        var b = daftar[i];
        var kondisi = statusCS(b);
        if (kondisi == "menunggu") menunggu++;
        if (kondisi == "diterima") diterima++;
        if (kondisi == "dikembalikan") selesai++;
        var cocokNama = b.nama.toLowerCase().indexOf(cari) != -1;
        var cocokId = String(b.id).indexOf(cari) != -1;
        var cocokStatus = filter == "semua" || kondisi == filter;
        if ((cocokNama || cocokId) && cocokStatus) hasil.push(b);
    }

    // Tampilkan laporan paling baru di atas.
    hasil.sort(function (a, b) { return Number(b.id) - Number(a.id); });

    teks("subjudul-admin", "Kelola barang titipan di " + namaKampus(dataAkun().kampus_cs) + ".");
    teks("admin-total", daftar.length);
    teks("admin-menunggu", menunggu);
    teks("admin-diterima", diterima);
    teks("admin-selesai", selesai);
    teks("nomor-wa-admin", dataAkun().telepon || "Belum diatur");
    teks("jumlah-hasil-admin", hasil.length + " dari " + daftar.length + " barang");

    var totalHalaman = Math.max(1, Math.ceil(hasil.length / jumlahPerHalamanAdmin));
    if (halamanAdmin > totalHalaman) halamanAdmin = totalHalaman;
    var awal = (halamanAdmin - 1) * jumlahPerHalamanAdmin;
    var akhir = Math.min(awal + jumlahPerHalamanAdmin, hasil.length);
    var isi = "";

    for (var j = awal; j < akhir; j++) {
        var barangCS = hasil[j];
        var status = statusCS(barangCS);
        var namaTombol = status == "dikembalikan" ? "Lihat serah terima" : "Kelola serah terima";
        isi += '<div class="baris-admin">' +
            '<div class="info-admin"><img src="' + bersihkan(barangCS.gambar) + '" alt="Foto kategori barang" />' +
            '<div><h3><a href="detail.xhtml?id=' + Number(barangCS.id) + '">' + bersihkan(barangCS.nama) + '</a></h3>' +
            '<p>ID #' + Number(barangCS.id) + ' · ' + bersihkan(namaKampus(barangCS.lokasi)) + '</p>' +
            '<span class="lencana">' + namaStatusCS(status) + '</span></div></div>' +
            '<div class="kontrol-admin"><a class="tombol tombol-outline tombol-kecil" href="serah_terima.xhtml?id=' +
            Number(barangCS.id) + '">' + namaTombol + '</a></div></div>';
    }

    ambil("daftar-admin").innerHTML = isi;
    ambil("kosong-admin").style.display = hasil.length ? "none" : "block";
    ambil("halaman-dashboard").style.display = hasil.length ? "flex" : "none";
    teks("info-halaman-admin", "Halaman " + halamanAdmin + " dari " + totalHalaman);
    ambil("admin-sebelumnya").disabled = halamanAdmin == 1;
    ambil("admin-berikutnya").disabled = halamanAdmin == totalHalaman;
}

function siapkanDashboardCS() {
    if (!ambil("daftar-admin") || !adalahAdmin()) return;
    ambil("cari-admin").oninput = function () {
        halamanAdmin = 1;
        tampilkanDashboardCS();
    };
    ambil("filter-status-admin").onchange = function () {
        halamanAdmin = 1;
        tampilkanDashboardCS();
    };
    ambil("admin-sebelumnya").onclick = function () {
        if (halamanAdmin > 1) halamanAdmin--;
        tampilkanDashboardCS();
    };
    ambil("admin-berikutnya").onclick = function () {
        halamanAdmin++;
        tampilkanDashboardCS();
    };
    tampilkanDashboardCS();
}

/* ========== SERAH TERIMA BARANG (ADMIN CS) ========== */

// Catatan terpisah dari laporan barang, memakai id laporan sebagai penghubung.
// Pada versi frontend, data disimpan di sessionStorage.
function semuaCatatan() {
    if (cacheSerah !== null) return cacheSerah;
    return bacaSesi("atlofSerahTerima", []);
}

function simpanCatatan(daftar) {
    simpanSesi("atlofSerahTerima", daftar);
}

function catatanKampusSaya() {
    var daftar = semuaCatatan();
    var hasil = [];
    var kampus = dataAkun().kampus_cs;
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].kampus_cs == kampus) hasil.push(daftar[i]);
    }
    return hasil;
}

function cariCatatan(id) {
    var daftar = catatanKampusSaya();
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].id == id) return daftar[i];
    }
    return null;
}

function adaCatatan(daftar, idLaporan, jenis, kecualiId) {
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].id_laporan == idLaporan && daftar[i].jenis == jenis && daftar[i].id != kecualiId) {
            return true;
        }
    }
    return false;
}

function namaJenisSerah(jenis) {
    return jenis == "pengembalian" ? "Pengembalian barang" : "Penerimaan barang";
}

function waktuCatatan() {
    var waktu = new Date();
    function dua(angka) { return angka < 10 ? "0" + angka : String(angka); }
    return dua(waktu.getDate()) + "-" + dua(waktu.getMonth() + 1) + "-" + waktu.getFullYear() +
        " " + dua(waktu.getHours()) + ":" + dua(waktu.getMinutes());
}

// Setelah CRUD serah terima, samakan status laporan dan status CS.
function sesuaikanStatusLaporan(idLaporan) {
    var daftar = semuaCatatan();
    var diterima = adaCatatan(daftar, idLaporan, "penerimaan", null);
    var kembali = adaCatatan(daftar, idLaporan, "pengembalian", null);
    var statusCSBaru = kembali ? "dikembalikan" : (diterima ? "diterima" : "menunggu");
    var statusLaporan = kembali ? "sudah_dikembalikan" : "belum_dikembalikan";

    if (cacheLaporan !== null) {
        for (var k = 0; k < cacheLaporan.length; k++) {
            if (cacheLaporan[k].id == idLaporan) {
                cacheLaporan[k].status_cs = statusCSBaru;
                cacheLaporan[k].status = statusLaporan;
            }
        }
        return;
    }

    var laporan = laporanSaya();
    var ditemukan = false;
    for (var i = 0; i < laporan.length; i++) {
        if (laporan[i].id == idLaporan) {
            laporan[i].status_cs = statusCSBaru;
            laporan[i].status = statusLaporan;
            ditemukan = true;
        }
    }
    if (ditemukan) {
        simpanSesi("atlofLaporan", laporan);
    } else {
        var contoh = bacaSesi("atlofPerubahanContoh", {});
        contoh[idLaporan] = { status_cs: statusCSBaru, status: statusLaporan };
        simpanSesi("atlofPerubahanContoh", contoh);
    }
}

var idSerahSekarang = 0;
var idCatatanEditSerah = 0;
var halamanRiwayatCS = 1;
var jumlahRiwayatPerHalaman = 8;

// Ambil barang hanya dari daftar titipan kampus CS yang sedang login.
function barangSerahSaya(idLaporan) {
    var daftar = daftarBarangCS();
    for (var i = 0; i < daftar.length; i++) {
        if (Number(daftar[i].id) === Number(idLaporan)) return daftar[i];
    }
    return null;
}

function riwayatUntukBarang(idLaporan) {
    var semua = catatanKampusSaya();
    var hasil = [];
    for (var i = 0; i < semua.length; i++) {
        if (Number(semua[i].id_laporan) === Number(idLaporan)) hasil.push(semua[i]);
    }
    hasil.sort(function (a, b) { return Number(b.id) - Number(a.id); });
    return hasil;
}

function jenisBerikutnyaSerah(daftar) {
    var adaPenerimaan = false;
    var adaPengembalian = false;
    for (var i = 0; i < daftar.length; i++) {
        if (daftar[i].jenis === "penerimaan") adaPenerimaan = true;
        if (daftar[i].jenis === "pengembalian") adaPengembalian = true;
    }
    if (!adaPenerimaan) return "penerimaan";
    if (!adaPengembalian) return "pengembalian";
    return "selesai";
}

function tampilkanHalamanSerah() {
    if (!ambil("serah-konten") || !adalahAdmin()) return;

    var barangCS = barangSerahSaya(idSerahSekarang);
    if (!barangCS) {
        ambil("serah-konten").style.display = "none";
        ambil("serah-tidak-ada").style.display = "block";
        return;
    }

    ambil("serah-tidak-ada").style.display = "none";
    ambil("serah-konten").style.display = "block";
    teks("serah-nama-barang", barangCS.nama);
    teks("serah-id-laporan", "#" + barangCS.id);
    teks("serah-kampus", namaKampus(dataAkun().kampus_cs));
    teks("serah-penyimpanan", namaKampus(barangCS.penyimpanan));

    var daftar = riwayatUntukBarang(idSerahSekarang);
    var berikutnya = jenisBerikutnyaSerah(daftar);
    var statusTampil = berikutnya === "penerimaan" ? "Menunggu pencatatan penerimaan" :
        berikutnya === "pengembalian" ? "Diterima CS" : "Sudah dikembalikan";
    teks("serah-status", statusTampil);
    ambil("kotak-form-serah").style.display = berikutnya === "selesai" ? "none" : "block";

    if (berikutnya !== "selesai") {
        ambil("form-serah-baru").reset();
        ambil("id-catatan-edit-baru").value = "";
        teks("judul-form-serah-baru", berikutnya === "penerimaan" ? "Catat penerimaan barang" : "Catat pengembalian barang");
        teks("keterangan-form-serah", berikutnya === "penerimaan" ?
            "Isi data setelah barang benar-benar diterima CS." :
            "Catat setelah barang diserahkan kepada pemilik yang sudah diverifikasi.");
        ambil("jenis-serah-tampil").value = namaJenisSerah(berikutnya);
        teks("label-pihak-serah", berikutnya === "penerimaan" ? "Nama penyerah" : "Nama penerima");
        teks("tombol-simpan-serah", "Simpan " + (berikutnya === "penerimaan" ? "penerimaan" : "pengembalian"));
        ambil("konfirmasi-kembali").style.display = berikutnya === "pengembalian" ? "block" : "none";
        ambil("batal-edit-serah").style.display = "none";
        idCatatanEditSerah = 0;
    }

    var isi = "";
    for (var i = 0; i < daftar.length; i++) {
        var c = daftar[i];
        isi += '<div class="serah-item">' +
            '<h3>' + bersihkan(namaJenisSerah(c.jenis)) + '</h3>' +
            '<p><strong>Waktu:</strong> ' + bersihkan(c.waktu) + '</p>' +
            '<p><strong>' + (c.jenis === "penerimaan" ? "Penyerah" : "Penerima") +
            ':</strong> ' + bersihkan(c.nama_pihak) + '</p>' +
            '<p><strong>Petugas:</strong> ' + bersihkan(c.petugas) + '</p>' +
            (c.catatan ? '<p><strong>Keterangan:</strong> ' + bersihkan(c.catatan) + '</p>' : '') +
            '<div class="aksi">' +
            '<button type="button" class="tombol tombol-outline tombol-kecil" onclick="mulaiEditSerah(' + Number(c.id) + ')">Edit</button>' +
            '<button type="button" class="tombol tombol-bahaya tombol-kecil" onclick="hapusCatatanSerah(' + Number(c.id) + ')">Hapus</button>' +
            '</div></div>';
    }
    ambil("riwayat-barang-serah").innerHTML = isi;
    ambil("kosong-riwayat-barang").style.display = daftar.length ? "none" : "block";
}

function mulaiEditSerah(idCatatan) {
    if (!adalahAdmin()) return;
    var catatan = cariCatatan(Number(idCatatan));
    if (!catatan || Number(catatan.id_laporan) !== idSerahSekarang) return;

    idCatatanEditSerah = Number(catatan.id);
    ambil("kotak-form-serah").style.display = "block";
    ambil("id-catatan-edit-baru").value = String(catatan.id);
    ambil("jenis-serah-tampil").value = namaJenisSerah(catatan.jenis);
    ambil("nama-pihak-serah").value = catatan.nama_pihak;
    ambil("keterangan-serah-baru").value = catatan.catatan || "";
    teks("judul-form-serah-baru", "Edit catatan " + (catatan.jenis === "penerimaan" ? "penerimaan" : "pengembalian"));
    teks("label-pihak-serah", catatan.jenis === "penerimaan" ? "Nama penyerah" : "Nama penerima");
    teks("keterangan-form-serah", "Perbaiki nama pihak atau keterangan. Jenis transaksi dan barang tidak bisa diubah.");
    teks("tombol-simpan-serah", "Simpan perubahan");
    ambil("konfirmasi-kembali").style.display = "none";
    ambil("batal-edit-serah").style.display = "inline-block";
    ambil("kotak-form-serah").scrollIntoView({ behavior: "smooth", block: "start" });
}

function batalEditSerah() {
    idCatatanEditSerah = 0;
    tampilkanHalamanSerah();
}

function hapusCatatanSerah(idCatatan) {
    if (!adalahAdmin()) return;
    var c = cariCatatan(Number(idCatatan));
    if (!c || Number(c.id_laporan) !== idSerahSekarang) return;
    var daftar = semuaCatatan();
    if (c.jenis === "penerimaan" && adaCatatan(daftar, idSerahSekarang, "pengembalian", null)) {
        pesan("Hapus catatan pengembalian terlebih dahulu sebelum menghapus penerimaan.");
        return;
    }
    if (!confirm("Hapus catatan " + namaJenisSerah(c.jenis).toLowerCase() + " ini?")) return;

    if (modeServer && cacheSerah !== null) {
        var dataKirim = new FormData();
        dataKirim.append("id", idCatatan);
        kirimData("serah_terima.php?aksi=delete", dataKirim).then(function (hasil) {
            if (!hasil.ok || hasil.data.status !== "success") {
                pesan(hasil.data.message || "Gagal menghapus catatan.");
                return;
            }
            return muatLaporanServer().then(muatSerahServer).then(function () {
                idCatatanEditSerah = 0;
                tampilkanHalamanSerah();
                pesan("Catatan berhasil dihapus.");
            });
        }).catch(function () {
            pesan("Gagal menghubungi server.");
        });
        return;
    }

    var hasil = [];
    for (var i = 0; i < daftar.length; i++) {
        if (Number(daftar[i].id) !== Number(idCatatan)) hasil.push(daftar[i]);
    }
    simpanCatatan(hasil);
    sesuaikanStatusLaporan(idSerahSekarang);
    idCatatanEditSerah = 0;
    tampilkanHalamanSerah();
    pesan("Catatan berhasil dihapus.");
}

// Halaman Kelola Serah Terima dibuka dengan serah_terima.xhtml?id=ID_LAPORAN.
function siapkanHalamanSerah() {
    if (!ambil("serah-konten") || !adalahAdmin()) return;

    var parameterSerah = new URLSearchParams(window.location.search);
    var idDariAlamat = parameterSerah.get("id");
    idSerahSekarang = /^\d+$/.test(idDariAlamat || "") ? Number(idDariAlamat) : 0;

    tampilkanHalamanSerah();
    ambil("batal-edit-serah").onclick = batalEditSerah;
    ambil("form-serah-baru").onsubmit = function (event) {
        event.preventDefault();
        var barangCS = barangSerahSaya(idSerahSekarang);
        if (!barangCS) return;

        var nama = ambil("nama-pihak-serah").value.trim();
        var keterangan = ambil("keterangan-serah-baru").value.trim();
        if (!nama) {
            pesan("Nama penyerah atau penerima harus diisi.");
            return;
        }

        if (modeServer && cacheSerah !== null) {
            var dataKirim = new FormData();
            dataKirim.append("nama_pihak", nama);
            dataKirim.append("catatan", keterangan);
            var aksi = "create";

            if (idCatatanEditSerah) {
                var lamaCatatan = cariCatatan(idCatatanEditSerah);
                if (!lamaCatatan || Number(lamaCatatan.id_laporan) !== idSerahSekarang) return;
                if (!confirm("Simpan perubahan catatan ini?")) return;
                aksi = "update";
                dataKirim.append("id", idCatatanEditSerah);
            } else {
                var jenis = jenisBerikutnyaSerah(riwayatUntukBarang(idSerahSekarang));
                if (jenis === "selesai") {
                    pesan("Penerimaan dan pengembalian barang sudah dicatat.");
                    return;
                }
                if (jenis === "pengembalian" && !ambil("cek-verifikasi-serah").checked) {
                    pesan("Centang konfirmasi verifikasi kepemilikan sebelum mencatat pengembalian.");
                    return;
                }
                if (!confirm("Simpan catatan " + namaJenisSerah(jenis).toLowerCase() + " ini?")) return;
                dataKirim.append("laporan_id", idSerahSekarang);
                if (ambil("cek-verifikasi-serah").checked) {
                    dataKirim.append("cek_verifikasi", "1");
                }
            }

            kirimData("serah_terima.php?aksi=" + aksi, dataKirim).then(function (hasil) {
                if (!hasil.ok || hasil.data.status !== "success") {
                    pesan(hasil.data.message || "Gagal menyimpan catatan.");
                    return;
                }
                return muatLaporanServer().then(muatSerahServer).then(function () {
                    idCatatanEditSerah = 0;
                    tampilkanHalamanSerah();
                    pesan("Catatan berhasil disimpan.");
                });
            }).catch(function () {
                pesan("Gagal menghubungi server.");
            });
            return;
        }

        var daftar = semuaCatatan();
        if (idCatatanEditSerah) {
            var lama = cariCatatan(idCatatanEditSerah);
            if (!lama || Number(lama.id_laporan) !== idSerahSekarang) return;
            if (!confirm("Simpan perubahan catatan ini?")) return;
            for (var i = 0; i < daftar.length; i++) {
                if (Number(daftar[i].id) === idCatatanEditSerah) {
                    daftar[i].nama_pihak = nama;
                    daftar[i].catatan = keterangan;
                }
            }
        } else {
            var jenis = jenisBerikutnyaSerah(riwayatUntukBarang(idSerahSekarang));
            if (jenis === "selesai") {
                pesan("Penerimaan dan pengembalian barang sudah dicatat.");
                return;
            }
            if (jenis === "pengembalian" && !ambil("cek-verifikasi-serah").checked) {
                pesan("Centang konfirmasi verifikasi kepemilikan sebelum mencatat pengembalian.");
                return;
            }
            if (!confirm("Simpan catatan " + namaJenisSerah(jenis).toLowerCase() + " ini?")) return;
            var idBaru = Date.now();
            for (var j = 0; j < daftar.length; j++) {
                if (Number(daftar[j].id) >= idBaru) idBaru = Number(daftar[j].id) + 1;
            }
            daftar.push({
                id: idBaru,
                id_laporan: idSerahSekarang,
                kampus_cs: dataAkun().kampus_cs,
                email_cs: dataAkun().email,
                jenis: jenis,
                nama_pihak: nama,
                catatan: keterangan,
                petugas: dataAkun().nama,
                waktu: waktuCatatan()
            });
        }
        simpanCatatan(daftar);
        sesuaikanStatusLaporan(idSerahSekarang);
        idCatatanEditSerah = 0;
        tampilkanHalamanSerah();
        pesan("Catatan berhasil disimpan.");
    };
}

// Halaman Riwayat Serah Terima: tampilkan semua transaksi kampus yang sedang login.
function tampilkanRiwayatCS() {
    if (!ambil("daftar-riwayat-cs") || !adalahAdmin()) return;
    var seluruh = catatanKampusSaya();
    var cari = ambil("cari-riwayat-cs").value.toLowerCase().trim();
    var filter = ambil("jenis-riwayat-cs").value;
    var hasil = [];

    for (var i = 0; i < seluruh.length; i++) {
        var c = seluruh[i];
        var b = barangSerahSaya(c.id_laporan);
        if (!b) continue;
        var kata = (b.nama + " " + b.id + " " + c.nama_pihak).toLowerCase();
        if ((filter === "semua" || filter === c.jenis) && kata.indexOf(cari) !== -1) {
            hasil.push(c);
        }
    }

    hasil.sort(function (a, b) { return Number(b.id) - Number(a.id); });
    teks("jumlah-riwayat-cs", hasil.length + " dari " + seluruh.length + " catatan");
    teks("keterangan-riwayat-cs", "Riwayat penerimaan dan pengembalian di " + namaKampus(dataAkun().kampus_cs) + ".");

    var jumlahHalaman = Math.max(1, Math.ceil(hasil.length / jumlahRiwayatPerHalaman));
    if (halamanRiwayatCS > jumlahHalaman) halamanRiwayatCS = jumlahHalaman;
    var awal = (halamanRiwayatCS - 1) * jumlahRiwayatPerHalaman;
    var akhir = Math.min(awal + jumlahRiwayatPerHalaman, hasil.length);
    var html = "";

    for (var j = awal; j < akhir; j++) {
        var catatan = hasil[j];
        var barangCS = barangSerahSaya(catatan.id_laporan);
        html += '<div class="serah-item">' +
            '<h3>' + bersihkan(barangCS.nama) + ' <span class="teks-abu">#' + Number(barangCS.id) + '</span></h3>' +
            '<p><strong>Jenis:</strong> ' + bersihkan(namaJenisSerah(catatan.jenis)) + '</p>' +
            '<p><strong>Waktu:</strong> ' + bersihkan(catatan.waktu) + '</p>' +
            '<p><strong>' + (catatan.jenis === "penerimaan" ? "Penyerah" : "Penerima") +
            ':</strong> ' + bersihkan(catatan.nama_pihak) + '</p>' +
            '<p><strong>Petugas:</strong> ' + bersihkan(catatan.petugas) + '</p>' +
            (catatan.catatan ? '<p><strong>Keterangan:</strong> ' + bersihkan(catatan.catatan) + '</p>' : '') +
            '<div class="aksi"><a class="tombol tombol-outline tombol-kecil" href="serah_terima.xhtml?id=' +
            Number(barangCS.id) + '">Lihat / kelola barang</a></div></div>';
    }
    ambil("daftar-riwayat-cs").innerHTML = html;
    ambil("riwayat-cs-kosong").style.display = hasil.length ? "none" : "block";
    ambil("halaman-riwayat-cs").style.display = hasil.length > jumlahRiwayatPerHalaman ? "flex" : "none";
    teks("info-halaman-riwayat", "Halaman " + halamanRiwayatCS + " dari " + jumlahHalaman);
    ambil("riwayat-sebelumnya").disabled = halamanRiwayatCS === 1;
    ambil("riwayat-berikutnya").disabled = halamanRiwayatCS === jumlahHalaman;
}

function siapkanRiwayatCS() {
    if (!ambil("daftar-riwayat-cs") || !adalahAdmin()) return;
    ambil("cari-riwayat-cs").oninput = function () {
        halamanRiwayatCS = 1;
        tampilkanRiwayatCS();
    };
    ambil("jenis-riwayat-cs").onchange = function () {
        halamanRiwayatCS = 1;
        tampilkanRiwayatCS();
    };
    ambil("riwayat-sebelumnya").onclick = function () {
        if (halamanRiwayatCS > 1) halamanRiwayatCS--;
        tampilkanRiwayatCS();
    };
    ambil("riwayat-berikutnya").onclick = function () {
        halamanRiwayatCS++;
        tampilkanRiwayatCS();
    };
    tampilkanRiwayatCS();
}

// ========================================================
// Mulai aplikasi: sinkronkan sesi, muat data MySQL, lalu render halaman.
// ========================================================
function renderHalaman() {
    if (ambil("akses-masuk") && sudahMasuk()) {
        window.location.href = tujuanSebelumnya();
        return;
    }

    tampilkanBeranda();

    if (ambil("semua-barang")) filterBarang();
    if (ambil("detail-nama")) tampilkanDetail();
    if (ambil("barang-saya")) perbaruiLaporanSaya();
    if (ambil("form-laporan")) aturFormLaporan("form-laporan");
    if (ambil("form-edit")) aturFormLaporan("form-edit");
    if (ambil("form-profil")) perbaruiProfil();

    siapkanDashboardCS();
    siapkanHalamanSerah();
    siapkanRiwayatCS();
}

function mulai() {
    var bolehLanjut = true;
    muatSesiServer().then(function () {
        bolehLanjut = cekAksesHalaman();
        if (bolehLanjut) {
            pasangHeaderAkun();
            pasangTautanAkses();
        }
        return bolehLanjut ? muatLaporanServer() : null;
    }).then(function () {
        return bolehLanjut ? muatSerahServer() : null;
    }).then(function () {
        if (bolehLanjut) renderHalaman();
    });
}

mulai();
