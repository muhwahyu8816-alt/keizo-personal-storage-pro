# KEIZO PERSONAL STORAGE PRO
## Panduan Instalasi dan Penggunaan di Windows

Versi panduan: 1.1

---

## 1. Tentang Aplikasi

Keizo Personal Storage Pro adalah aplikasi web lokal yang berjalan di komputer Windows dan terhubung ke Google Drive milik pengguna melalui Google OAuth.

Fitur yang tersedia pada versi ini:

- Mengunggah berbagai tipe file ke Google Drive.
- Mengunggah file besar menggunakan resumable upload dengan bagian hingga 8 MB.
- Memilih beberapa file sekaligus.
- Memilih folder beserta subfolder melalui pemilih file browser, jika didukung.
- Menampilkan antrean upload, progres, jeda, lanjut, dan pembatalan.
- Melihat riwayat upload yang tersimpan secara lokal.
- Melihat isi Google Drive, informasi penyimpanan, dan pratinjau file yang didukung.
- Mengunduh, mengganti nama, dan menghapus file di Google Drive.

Catatan: fitur yang tersedia bergantung pada versi kode yang dipasang. Upload yang terputus tidak selalu dapat dilanjutkan otomatis setelah browser ditutup atau server dimulai ulang.

## 2. Persyaratan

Siapkan:

1. Komputer dengan Windows 10 atau Windows 11.
2. Koneksi internet.
3. Node.js versi LTS dari situs resmi:
   https://nodejs.org/
4. Akun Google dengan akses ke Google Drive.
5. Browser modern, misalnya Google Chrome atau Microsoft Edge.

Pastikan Node.js dan npm sudah terpasang. Buka Command Prompt (CMD), kemudian jalankan:

```cmd
node --version
npm --version
```

Jika kedua perintah menampilkan nomor versi, lanjutkan. Jika tidak, pasang Node.js LTS dan buka kembali CMD.

## 3. Mengunduh Proyek dari GitHub

Repositori proyek:

https://github.com/muhwahyu8816-alt/keizo-personal-storage-pro

Cara mengunduh:

1. Buka halaman repositori GitHub.
2. Pilih tombol **Code**.
3. Pilih **Download ZIP**.
4. Ekstrak ZIP ke folder yang mudah ditemukan, misalnya:

```text
C:\Keizo Personal Storage Pro
```

5. Buka folder hasil ekstraksi.
6. Pastikan file `server.js`, `package.json`, `package-lock.json`, `start.bat`, `.env.example`, dan folder `public` tersedia.

Jangan menjalankan aplikasi dari dalam arsip ZIP. Ekstrak terlebih dahulu.

## 4. Menyiapkan Google Drive API dan OAuth

Setiap pengguna harus memakai konfigurasi OAuth miliknya sendiri.

### 4.1 Membuat proyek Google Cloud

1. Buka https://console.cloud.google.com/
2. Masuk dengan akun Google.
3. Buat proyek Google Cloud baru atau pilih proyek yang sudah tersedia.
4. Buka bagian **APIs & Services → Library**.
5. Cari **Google Drive API**.
6. Pilih Google Drive API dan tekan **Enable**.

Nama menu dapat berubah mengikuti tampilan Google Cloud Console.

### 4.2 Menyiapkan layar persetujuan OAuth

1. Buka bagian Google Auth Platform atau pengaturan OAuth.
2. Lengkapi informasi aplikasi yang diminta.
3. Jika aplikasi berstatus pengujian dan menggunakan tipe pengguna eksternal, tambahkan akun Google sendiri sebagai pengguna uji jika diperlukan.
4. Simpan pengaturan.

Untuk aplikasi pribadi, jangan memublikasikan aplikasi OAuth atau memperluas akses pengguna tanpa memahami persyaratan Google.

### 4.3 Membuat OAuth Client ID

1. Buka bagian **Clients** atau **Credentials**.
2. Buat OAuth Client ID dengan tipe **Web application**.
3. Tambahkan Authorized redirect URI berikut:

```text
http://localhost:3000/auth/google/callback
```

4. Simpan konfigurasi.
5. Unduh file JSON kredensial OAuth.

Simpan file JSON tersebut di folder utama proyek. Nama file harus sama dengan nilai `GOOGLE_OAUTH_FILE` di `.env`.

Contoh nama yang digunakan pada konfigurasi ini:

```text
client_secret_123456.json
```

Nama di atas hanya contoh. Gunakan nama file JSON milik sendiri dan sesuaikan konfigurasi `.env`.

**Jangan mengirim file OAuth JSON kepada orang lain atau mengunggahnya ke GitHub.**

## 5. Menyiapkan File .env

Di folder utama proyek terdapat file `.env.example`.

1. Salin `.env.example`.
2. Ubah nama salinannya menjadi `.env`.
3. Buka `.env` menggunakan Notepad.
4. Atur nilai berikut sesuai konfigurasi sendiri:

```dotenv
PORT=3000
SESSION_SECRET=ganti_dengan_secret_acak_yang_panjang
GOOGLE_OAUTH_FILE=client_secret_123456.json
```

Sesuaikan nama file OAuth pada baris ketiga dengan nama file yang benar-benar disimpan.

Ganti nilai `SESSION_SECRET` dengan teks acak yang panjang dan sulit ditebak. Jangan gunakan contoh di atas sebagai secret produksi.

Perhatikan:

- Jangan menambahkan spasi di sekitar tanda `=`.
- Jangan membagikan isi `.env`.
- Jangan menimpa `.env` yang sudah digunakan tanpa membuat cadangan.
- Jangan memasukkan `.env` ke repositori Git.

## 6. Menginstal dan Menjalankan Aplikasi

### Cara yang disarankan

1. Buka File Explorer.
2. Masuk ke folder proyek.
3. Klik dua kali `start.bat`.
4. Jika dependensi belum tersedia, skrip akan mencoba memasangnya.
5. Tunggu sampai CMD menampilkan pesan bahwa Keizo Personal Storage Pro berjalan.
6. Buka browser dan kunjungi:

```text
http://localhost:3000
```

Jangan menutup jendela CMD ketika aplikasi sedang digunakan. Menutup jendela tersebut akan menghentikan server.

### Jika start.bat gagal

Buka CMD, lalu masuk ke folder proyek. Contoh:

```cmd
cd /d "C:\Keizo Personal Storage Pro"
```

Jalankan:

```cmd
npm install
node server.js
```

Biarkan CMD tetap terbuka dan periksa pesan error jika server gagal berjalan.

## 7. Menghubungkan Google Drive

1. Buka `http://localhost:3000`.
2. Pilih tombol untuk menghubungkan Google Drive.
3. Browser akan membuka halaman autentikasi Google.
4. Pilih akun Google yang ingin digunakan.
5. Tinjau izin yang diminta dan lanjutkan jika setuju.
6. Setelah proses berhasil, browser akan kembali ke aplikasi.

Jika autentikasi gagal, periksa bahwa:

- Google Drive API sudah diaktifkan.
- File OAuth JSON benar dan dapat dibaca.
- `GOOGLE_OAUTH_FILE` sesuai dengan nama file.
- Redirect URI sama dengan alamat callback yang digunakan aplikasi.
- Port pada `.env` sesuai dengan alamat aplikasi.
- Pengaturan layar persetujuan dan akun penguji sudah benar jika aplikasi masih dalam mode pengujian.

## 8. Cara Mengunggah File

1. Hubungkan Google Drive.
2. Pilih file atau folder melalui pemilih file yang tersedia.
3. Pastikan file yang dipilih muncul pada antrean.
4. Mulai antrean upload.
5. Pantau progres sampai upload selesai.
6. Periksa daftar file Google Drive atau buka Google Drive melalui browser untuk memastikan file telah tersedia.

Untuk pengujian awal, gunakan satu file kecil. Jika berhasil, lanjutkan dengan file lebih besar.

Pastikan koneksi internet stabil dan kapasitas Google Drive mencukupi.

## 9. Mengelola File dan Riwayat

Aplikasi menyediakan fitur pengelolaan file berdasarkan fungsi yang tersedia pada halaman web, termasuk melihat file, membuka pratinjau file yang didukung, mengunduh, mengganti nama, dan menghapus file.

**Perhatian:** penghapusan melalui aplikasi dapat menghapus file dari Google Drive. Periksa nama file sebelum mengonfirmasi tindakan tersebut.

Riwayat upload disimpan di komputer lokal dalam folder `data`. Jangan mengunggah data riwayat atau metadata sementara ke repositori publik.

## 10. Jeda, Lanjut, dan Pemulihan Upload

Aplikasi menggunakan resumable upload Google Drive. Server menyimpan metadata sementara untuk melacak sesi dan posisi upload.

Jika koneksi terputus:

1. Jangan langsung menghapus folder data aplikasi.
2. Periksa pesan status pada halaman web.
3. Gunakan fungsi lanjut atau periksa status jika tersedia.
4. Jika sesi tidak dapat dipulihkan, pilih ulang file sumber dan mulai upload baru.

Perlu diketahui:

- Sesi resumable Google Drive dapat kedaluwarsa.
- Browser yang ditutup atau dimuat ulang dapat kehilangan antrean yang belum disimpan secara permanen.
- Memulai ulang server dapat membuat pengguna perlu menghubungkan Google Drive kembali.
- Metadata upload sementara yang selesai, dibatalkan, atau berusia lebih dari 30 hari dapat dibersihkan oleh server.

Jangan menganggap file yang belum selesai pasti bisa dilanjutkan setelah semua jenis gangguan.

## 11. Troubleshooting

### A. Browser menampilkan halaman tidak dapat diakses

- Pastikan `start.bat` masih berjalan.
- Periksa apakah CMD menampilkan pesan server berjalan.
- Pastikan alamatnya `http://localhost:3000`.
- Jika port sudah digunakan aplikasi lain, periksa konfigurasi port sebelum mengubahnya.

### B. Error SESSION_SECRET

Pastikan `.env` tersedia di folder utama dan memiliki nilai `SESSION_SECRET` yang tidak kosong.

### C. File OAuth JSON tidak ditemukan

Periksa nama file JSON dan samakan dengan nilai `GOOGLE_OAUTH_FILE` pada `.env`.

### D. Redirect URI tidak cocok

Pastikan Authorized redirect URI di Google Cloud sama persis dengan:

```text
http://localhost:3000/auth/google/callback
```

Jika port diubah, sesuaikan juga konfigurasi Google Cloud dan alamat yang digunakan.

### E. Upload gagal atau berhenti

- Periksa koneksi internet.
- Pastikan ruang Google Drive mencukupi.
- Periksa pesan error pada halaman dan CMD.
- Coba periksa status upload jika tersedia.
- Jika sesi tidak berlaku, mulai upload baru.

### F. Perintah npm tidak berjalan di PowerShell

Gunakan Command Prompt (CMD) atau sesuaikan kebijakan PowerShell dengan aman. Jangan mengubah kebijakan keamanan komputer tanpa memahami dampaknya.

### G. Port 3000 sudah digunakan

Pastikan tidak ada instance aplikasi lain yang sedang berjalan. Jika perlu menggunakan port lain, sesuaikan `.env`, alamat browser, dan redirect URI Google Cloud.

## 12. Backup dan Pemulihan

Sebelum memperbarui kode atau memperbaiki masalah:

1. Hentikan server.
2. Buat salinan folder proyek yang diperlukan.
3. Lindungi file `.env`, file OAuth JSON, dan folder `data`.
4. Jangan menimpa konfigurasi pribadi dengan contoh konfigurasi.
5. Jalankan kembali aplikasi setelah perubahan dan uji upload kecil terlebih dahulu.

Jangan menghapus folder `data` jika masih ada metadata sesi upload yang mungkin dibutuhkan.

## 13. Keamanan

Jangan pernah mengunggah atau membagikan:

- `.env`
- File `client_secret*.json`
- File `credentials*.json`
- Token akses atau refresh token
- Folder `tokens`
- Data riwayat upload dan metadata sesi pribadi
- Informasi akun atau kredensial Google

Sebelum commit atau push ke GitHub, periksa status Git dan aturan `.gitignore`.

Ingat: `.gitignore` tidak otomatis menghapus rahasia yang sebelumnya sudah pernah dilacak atau diunggah. Jika kredensial pernah terpublikasi, cabut atau rotasi kredensial tersebut melalui layanan Google yang terkait.

## 14. Memperbarui Proyek dari GitHub

Sebelum memperbarui aplikasi:

1. Hentikan server.
2. Cadangkan `.env`, file OAuth JSON, dan data lokal.
3. Periksa perubahan kode dan catatan rilis proyek.
4. Pastikan perubahan tidak menimpa konfigurasi pribadi.
5. Instal dependensi sesuai instruksi versi proyek.
6. Jalankan aplikasi dan uji koneksi serta upload.

Jangan menimpa file konfigurasi pribadi dengan file dari repositori.

## 15. Bantuan dan Pelaporan Masalah

Jika menemukan masalah, siapkan informasi berikut:

- Sistem operasi Windows.
- Versi Node.js dan npm.
- Langkah yang dilakukan sebelum error muncul.
- Pesan error yang relevan dari browser atau CMD.

Sebelum membagikan log, hapus token, secret, alamat email pribadi, dan informasi sensitif lainnya.

Repositori proyek:
https://github.com/muhwahyu8816-alt/keizo-personal-storage-pro

---

**Akhir panduan**

Keizo Personal Storage Pro berjalan secara lokal di komputer pengguna. Setiap pengguna bertanggung jawab menjaga konfigurasi Google OAuth, data lokal, dan keamanan akun Google miliknya.
