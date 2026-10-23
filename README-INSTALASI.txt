KEIZO PERSONAL STORAGE PRO — PANDUAN INSTALASI WINDOWS

TUJUAN
Aplikasi berjalan secara lokal di laptop Windows. Setiap pengguna memakai konfigurasi Google OAuth miliknya sendiri. GitHub digunakan untuk menyimpan kode proyek, bukan file rahasia pengguna.

FITUR
- Upload berbagai tipe file ke Google Drive.
- Upload file besar menggunakan resumable upload dengan bagian 8 MB.
- Memilih banyak file atau folder beserta subfolder.
- Antrean upload, progres, jeda, lanjut, dan batal.
- Riwayat upload tersimpan secara lokal.

A. PERSIAPAN
1. Pasang Node.js versi LTS dari situs resmi: https://nodejs.org/
2. Unduh atau ekstrak proyek Keizo Personal Storage Pro ke sebuah folder.
3. Buka folder proyek.
4. Jangan mengunggah file .env, file OAuth JSON, token, atau data pribadi ke GitHub.

B. SIAPKAN GOOGLE OAUTH
1. Buka Google Cloud Console: https://console.cloud.google.com/
2. Buat atau pilih sebuah project Google Cloud.
3. Aktifkan Google Drive API.
4. Siapkan OAuth Client ID untuk aplikasi desktop/lokal berbasis web sesuai konfigurasi aplikasi.
5. Tambahkan Authorized redirect URI berikut:
   http://localhost:3000/auth/google/callback
6. Unduh file konfigurasi OAuth JSON.
7. Simpan file tersebut di folder utama proyek dengan nama:
   client_secret.json

PENTING: Jangan membagikan file OAuth JSON kepada orang lain. Nama file harus sesuai dengan pengaturan GOOGLE_OAUTH_FILE di .env.

C. SIAPKAN FILE .ENV
1. Salin .env.example.
2. Ubah nama salinannya menjadi .env.
3. Buka .env menggunakan Notepad.
4. Atur nilainya sendiri:
   PORT=3000
   SESSION_SECRET=ganti_dengan_secret_acak_yang_panjang
   GOOGLE_OAUTH_FILE=client_secret.json
5. Ganti SESSION_SECRET dengan nilai acak milik sendiri. Jangan membagikan isi .env kepada siapa pun.

Jangan menimpa atau membagikan file .env yang sudah digunakan oleh pengguna lain.

D. INSTALASI DAN MENJALANKAN APLIKASI
1. Pastikan Node.js sudah terpasang.
2. Buka folder proyek di File Explorer.
3. Klik dua kali start.bat.
4. Tunggu sampai server berjalan.
5. Buka browser dan kunjungi:
   http://localhost:3000
6. Hubungkan Google Drive melalui halaman aplikasi.

Jika port di .env diubah, sesuaikan alamat browser dan Authorized redirect URI di Google Cloud Console.

E. PENGUJIAN
1. Login Google Drive.
2. Coba upload satu file kecil.
3. Jika berhasil, coba file 100–500 MB.
4. Lanjutkan ke 2 GB, kemudian ukuran yang lebih besar jika pengujian sebelumnya berhasil.
5. Pastikan kapasitas Google Drive mencukupi dan koneksi internet stabil.

F. BATASAN DAN CATATAN
- Pengujian OAuth dan Google Drive harus dilakukan oleh masing-masing pengguna.
- Resumable session dapat kedaluwarsa.
- Setelah browser dimuat ulang atau ditutup, pemulihan antrean lama mungkin tidak sepenuhnya otomatis. Ikuti kemampuan yang tersedia di halaman aplikasi.
- Restart server biasanya mengharuskan login Google ulang karena session disimpan di memori.
- Periksa struktur folder dan hasil upload setelah operasi selesai.

G. KEAMANAN
Jangan membagikan atau mengunggah file berikut ke GitHub:
- .env
- client_secret*.json
- credentials*.json
- token*.json
- tokens/
- data pribadi dan riwayat upload pengguna

Sebelum melakukan commit atau push ke GitHub, pastikan file rahasia tetap diabaikan oleh .gitignore.