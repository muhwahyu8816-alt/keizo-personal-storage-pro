KEIZO PERSONAL STORAGE PRO — RESUMABLE UPLOAD

FITUR
- Upload semua tipe file, bukan hanya MP4.
- Upload file besar melalui Google Drive resumable session, dikirim dalam bagian 8 MB.
- Tidak menyimpan satu file utuh sebagai file sementara di disk lokal.
- Memilih banyak file dan memilih folder beserta subfolder melalui browser yang mendukung webkitdirectory.
- Antrean, progres, jeda antrean, lanjut/cek status, dan batal.
- Tetap memakai konfigurasi OAuth yang sudah ada di proyek.

PENTING SEBELUM MEMASANG
1. Tutup server lama dengan Ctrl+C.
2. Buat salinan cadangan folder proyek lama.
3. Ekstrak ZIP ini.
4. Salin server.js dan folder public dari ZIP ke folder proyek lama, timpa file server.js dan public/index.html.
5. JANGAN hapus atau timpa .env dan client_secret_123456.json.
6. Buka terminal di folder proyek, jalankan:
   npm install express express-session dotenv googleapis
7. Di Google Cloud Console, pastikan Authorized redirect URI persis:
   http://localhost:3000/auth/google/callback
   Jika PORT di .env bukan 3000, sesuaikan URI.
8. Jalankan start.bat atau:
   node server.js
9. Buka http://localhost:3000 dan hubungkan Google Drive.

PENGUJIAN
- Login lalu unggah file kecil terlebih dahulu.
- Berikutnya coba 100–500 MB, lalu 2 GB. Uji 9 GB setelah alur kecil terbukti berhasil.
- Pastikan Google Drive memiliki ruang yang cukup dan Wi-Fi stabil.

BATASAN / CATATAN
- Ini paket kode yang dibuat dan diperiksa secara statis; belum diuji end-to-end dengan OAuth atau Drive milik pengguna.
- Google Drive resumable session dapat kedaluwarsa. Sesi dan offset disimpan lokal di data/upload-temp, tetapi jika browser ditutup, Anda perlu memilih ulang file sumber yang sama dan menggunakan sesi yang sama. UI saat ini tidak sepenuhnya memulihkan antrean lama otomatis setelah reload.
- Express session bawaan disimpan di memori. Restart server biasanya mengharuskan login Google ulang.
- Folder lokal diproses dengan membuat struktur folder di Drive. Untuk struktur kompleks, periksa hasil setelah upload.
- File/folder Google Drive saat ini menampilkan isi root saja; operasi unggah mendukung tujuan folder yang ditampilkan di pilihan tujuan.
- Jangan pernah membagikan .env atau file OAuth JSON ke orang lain.
