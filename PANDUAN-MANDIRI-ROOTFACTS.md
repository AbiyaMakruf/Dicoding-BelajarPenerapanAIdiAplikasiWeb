# Panduan Mengerjakan RootFacts Secara Mandiri

Dokumen ini dibuat agar Anda bisa membangun submission dari awal dengan memahami alurnya, bukan sekadar menyalin solusi. Fokus panduan ini adalah starter project MVP, karena jalur ini diperlukan untuk mencapai level advanced.

## 1. Tujuan Akhir Proyek

Anda sedang membangun aplikasi web bernama RootFacts dengan 3 kemampuan utama:

1. Mengakses kamera pengguna.
2. Mendeteksi jenis sayuran menggunakan TensorFlow.js.
3. Mengubah hasil deteksi menjadi fun fact menggunakan Transformers.js.

Selain itu, aplikasi harus:

1. Memiliki arsitektur MVP.
2. Menampilkan loading dan progress model.
3. Memiliki FPS limit.
4. Memiliki persona dinamis untuk gaya fun fact.
5. Bisa diinstal sebagai PWA.
6. Tetap bisa membuka aplikasi saat offline.
7. Mem-precache model AI lokal untuk deteksi.

## 2. Urutan Pengerjaan yang Benar

Jangan langsung mengerjakan semuanya sekaligus. Kerjakan berurutan seperti ini:

1. Pahami struktur project dan kriteria.
2. Rapikan konfigurasi pusat.
3. Selesaikan UI statis dulu.
4. Implementasikan kamera.
5. Implementasikan deteksi TensorFlow.js.
6. Buat presenter MVP untuk menghubungkan UI dan service.
7. Implementasikan Generative AI.
8. Tambahkan fitur advanced UI: tone, copy, progress, backend info.
9. Lengkapi PWA dan offline capability.
10. Tambahkan linter, build check, dan deployment.

Urutan ini penting karena setiap langkah bergantung pada langkah sebelumnya.

## 3. Pahami Struktur Project Dulu

Sebelum menulis kode, baca file berikut:

1. `Instruksi/pengantar.txt`
2. `Instruksi/kriteria.txt`
3. `Instruksi/starterproject.txt`
4. `Instruksi/tipsntrick.txt`

Lalu pahami folder `src/`:

1. `src/scripts/index.js`
   Titik masuk aplikasi.
2. `src/scripts/pages/app.js`
   Root page renderer.
3. `src/scripts/pages/home/home-page.js`
   View halaman utama.
4. `src/scripts/templates.js`
   Template HTML.
5. `src/scripts/services/camera.service.js`
   Semua urusan kamera.
6. `src/scripts/services/detection.service.js`
   Semua urusan TensorFlow.js.
7. `src/scripts/services/rootfacts.service.js`
   Semua urusan Transformers.js.
8. `src/scripts/config.js`
   Konfigurasi aplikasi.
9. `src/styles/styles.css`
   Styling.
10. `webpack.common.js` dan `webpack.prod.js`
    Untuk bundling dan PWA.

## 4. Kerjakan `config.js` Paling Awal

File pertama yang layak dirapikan adalah:

`src/scripts/config.js`

Kenapa mulai dari sini:

1. Banyak file lain bergantung pada konfigurasi.
2. Anda akan lebih mudah menghindari angka hard-coded.
3. Fitur advanced seperti FPS, threshold, dan generation parameter lebih mudah diatur.

Isi yang sebaiknya Anda siapkan:

1. Ambang confidence deteksi.
2. FPS default, minimum, maksimum.
3. URL model TensorFlow.js lokal.
4. Konfigurasi model Transformers.js.
5. Parameter generasi:
   `temperature`, `max_new_tokens`, `top_p`, `do_sample`.
6. Daftar persona/tone:
   `normal`, `funny`, `history`, `chef` atau variasi lain.

Checkpoint:

1. Semua konstanta aplikasi ada di satu tempat.
2. Tidak ada angka magic yang tersebar di banyak file.

## 5. Rapikan Tampilan Dasar Lebih Dulu

Sebelum logika AI, buat UI yang jelas.

File yang dikerjakan:

1. `src/scripts/templates.js`
2. `src/scripts/pages/home/home-page.js`
3. `src/styles/styles.css`

Tujuan tahap ini:

1. Halaman punya area kamera.
2. Halaman punya area hasil deteksi.
3. Halaman punya loading state.
4. Halaman punya kontrol:
   kamera, FPS, tone, copy, dan nanti install.

Elemen minimal yang perlu ada:

1. Video untuk preview kamera.
2. Canvas jika ingin dipakai bantu capture.
3. Tombol start/stop scan.
4. Select kamera.
5. Slider FPS.
6. Select tone/persona.
7. Card hasil deteksi.
8. Area fun fact.
9. Tombol copy.
10. Status loading dengan persentase.

Checkpoint:

1. Tanpa logika AI pun UI sudah lengkap.
2. Semua elemen penting punya `id` yang jelas.

Kesalahan umum:

1. UI belum siap tapi presenter/service sudah ditulis.
2. `id` elemen tidak konsisten dengan JavaScript.

## 6. Selesaikan Kamera Sebelum AI

File yang dikerjakan:

`src/scripts/services/camera.service.js`

Kerjakan fitur berikut secara berurutan:

1. Simpan referensi `video` dan `canvas`.
2. Ambil daftar kamera dengan `navigator.mediaDevices.enumerateDevices()`.
3. Isi dropdown kamera.
4. Buat method untuk start camera dengan `getUserMedia`.
5. Buat method untuk stop camera.
6. Buat method `setFPS`.
7. Buat method `isActive`.

Yang harus Anda pahami:

1. Kamera belakang/depan bisa dibedakan dengan `facingMode`.
2. Device tertentu bisa dipilih dengan `deviceId`.
3. FPS bisa dibatasi dengan dua cara:
   lewat constraints kamera dan lewat interval prediksi.

Checkpoint:

1. Kamera bisa aktif.
2. Kamera bisa berhenti.
3. Dropdown kamera bekerja.
4. Slider FPS mengubah nilai target FPS.

Kesalahan umum:

1. Tidak menghentikan track kamera saat stop.
2. Tidak menangani error izin kamera.
3. Mengira FPS limit cukup dari slider UI saja tanpa dipakai di loop prediksi.

## 7. Implementasikan Deteksi TensorFlow.js

File yang dikerjakan:

`src/scripts/services/detection.service.js`

Urutan kerjanya:

1. Import TensorFlow.js.
2. Import backend WebGPU.
3. Buat logika backend adaptif.
4. Muat metadata model.
5. Muat model TensorFlow.js.
6. Simpan label dari metadata.
7. Buat method `predict(imageElement)`.

Hal penting yang harus ada:

1. Cek `navigator.gpu`.
2. Jika ada, coba `webgpu`.
3. Jika gagal, fallback ke `webgl`.
4. Jika masih gagal, fallback ke `cpu`.

Untuk preprocessing input:

1. Ambil frame dari elemen video.
2. Resize ke ukuran model.
3. Normalisasi sesuai kebutuhan model.
4. Tambahkan batch dimension.

Untuk menjaga performa:

1. Gunakan `tf.tidy()` pada setiap siklus prediksi.
2. Hindari tensor yang tidak pernah di-dispose.

Output prediksi minimal berisi:

1. `label`
2. `confidence`
3. `isValid`
4. `backend`
5. `duration`

Checkpoint:

1. Model berhasil dimuat.
2. Progress loading tampil.
3. Prediksi bisa menghasilkan label.
4. Tidak ada memory leak yang jelas saat scanning lama.

Kesalahan umum:

1. Tidak import `@tensorflow/tfjs-backend-webgpu`.
2. Tidak memakai `tf.tidy()`.
3. Prediksi jalan, tapi label metadata tidak cocok dengan indeks output model.

## 8. Setelah Kamera dan Deteksi Siap, Buat Presenter MVP

File yang dikerjakan:

1. `src/scripts/pages/home/home-page.js`
2. Buat file baru, misalnya:
   `src/scripts/pages/home/home-presenter.js`

Kenapa presenter dikerjakan setelah service:

1. Presenter hanya akan menghubungkan komponen yang sudah jelas.
2. Anda jadi lebih paham batas tanggung jawab setiap layer.

Pembagian tanggung jawab yang benar:

1. View (`home-page.js`)
   Mengambil elemen DOM, bind event, update tampilan.
2. Presenter (`home-presenter.js`)
   Menentukan alur aplikasi.
3. Service
   Menangani kamera, deteksi, dan Generative AI.

Urutan kerja presenter:

1. Saat halaman selesai dirender, bind semua event.
2. Muat model deteksi.
3. Tampilkan progress loading.
4. Saat user menekan tombol scan, aktifkan kamera.
5. Jalankan loop prediksi sesuai FPS limit.
6. Jika confidence cukup tinggi, tampilkan hasil.
7. Kirim label ke service fun fact.

Checkpoint:

1. Arsitektur MVP benar-benar terasa.
2. `home-page.js` tidak penuh logika bisnis.
3. Service tidak menyentuh DOM.

Kesalahan umum:

1. Presenter berubah menjadi tempat semua hal, termasuk manipulasi DOM detail.
2. View memanggil TensorFlow.js langsung.

## 9. Implementasikan Generative AI Setelah Label Sudah Stabil

File yang dikerjakan:

`src/scripts/services/rootfacts.service.js`

Jangan kerjakan file ini sebelum deteksi berhasil. Jika label deteksi saja belum stabil, Anda akan sulit membedakan bug deteksi dan bug generasi teks.

Urutan pengerjaan:

1. Import `pipeline` dari `@huggingface/transformers`.
2. Pilih model text generation atau text2text.
3. Buat method `loadModel()`.
4. Terapkan backend adaptif:
   cek `navigator.gpu`, lalu pilih device yang sesuai.
5. Buat method `setTone(tone)`.
6. Buat method `generateFacts(label, tone)`.

Hal yang wajib ada:

1. Prompt harus dinamis berdasarkan label sayuran.
2. Input harus disanitasi.
3. Panjang input dibatasi.
4. Parameter generasi diatur.
5. Tone memengaruhi isi prompt.

Contoh pola prompt:

1. Identitas AI.
2. Nama sayuran hasil deteksi.
3. Instruksi gaya bahasa.
4. Batas panjang jawaban.
5. Larangan output yang tidak diinginkan.

Checkpoint:

1. Setiap sayuran menghasilkan fun fact yang berbeda.
2. Tone berbeda menghasilkan gaya bahasa berbeda.
3. Copy to clipboard bekerja.

Kesalahan umum:

1. Teks fun fact statis.
2. Tidak ada sanitasi input.
3. Parameter generasi terlalu besar hingga browser berat.

## 10. Implementasikan Fitur Advanced UI Setelah Semua Logika Dasar Jalan

File yang dikerjakan:

1. `src/scripts/templates.js`
2. `src/scripts/pages/home/home-page.js`
3. `src/styles/styles.css`

Fitur yang perlu Anda tambahkan setelah alur inti selesai:

1. Loading text dengan persentase.
2. Badge backend aktif.
3. Tampilan confidence.
4. Tombol copy.
5. Persona/tone dropdown.
6. Install banner atau tombol install.
7. Toast atau feedback kecil untuk user.

Kenapa dikerjakan belakangan:

1. Ini lapisan penyempurnaan.
2. Kalau dikerjakan terlalu awal, Anda mudah terdistraksi styling.

## 11. Baru Setelah Itu Kerjakan PWA dan Offline

File yang dikerjakan:

1. `src/index.html`
2. `src/public/manifest.webmanifest`
3. `src/scripts/index.js`
4. `webpack.common.js`
5. `webpack.prod.js`

Urutan kerja:

1. Tambahkan link manifest di HTML.
2. Buat file manifest lengkap:
   nama, short_name, icons, theme_color, background_color, display.
3. Daftarkan service worker di `index.js`.
4. Pastikan aset `public/` disalin ke `dist`.
5. Pastikan folder `model/` juga disalin ke `dist`.
6. Gunakan Workbox `GenerateSW`.
7. Pastikan model `.json` dan `.bin` masuk ke precache.

Yang harus Anda pahami:

1. Aplikasi offline bukan berarti semua AI generatif harus langsung selalu offline.
2. Kriteria advanced yang eksplisit untuk offline model adalah file model deteksi lokal.
3. Karena model TensorFlow.js berada di project, file itu harus ikut dibundel dan diprecache.

Checkpoint:

1. Browser mendeteksi manifest.
2. Service worker terpasang.
3. Cache Storage berisi aset inti.
4. Cache juga berisi model TensorFlow.js lokal.

Kesalahan umum:

1. Model ada di `src/model`, tapi tidak pernah disalin ke `dist`.
2. Manifest dibuat, tetapi tidak di-link di HTML.
3. Service worker dikonfigurasi, tetapi tidak diregister.

## 12. Tambahkan Linter Setelah Logika Utama Stabil

File yang dikerjakan:

1. `package.json`
2. `eslint.config.js` atau file config lint lain

Urutan kerja:

1. Tambahkan dependency ESLint.
2. Tambahkan script `lint`.
3. Buat config minimal.
4. Jalankan lint.
5. Rapikan error yang benar-benar penting dulu.

Kenapa jangan paling awal:

1. Saat struktur project belum stabil, lint akan sering berubah.
2. Lebih efisien jika lint ditambahkan saat fondasi kode sudah ada.

## 13. Terakhir Baru Deployment dan Submission

Yang harus dilakukan paling akhir:

1. Build production.
2. Deploy ke Netlify.
3. Uji aplikasi online.
4. Uji offline lewat DevTools.
5. Masukkan URL deployment ke `STUDENT.txt`.

Urutan submission yang aman:

1. Uji camera access.
2. Uji deteksi label.
3. Uji tone/persona.
4. Uji copy button.
5. Uji install prompt.
6. Uji offline load.
7. Uji model deteksi saat offline.
8. Isi `STUDENT.txt`.

## 14. Rencana Kerja Harian yang Paling Disarankan

Jika ingin mengerjakan bertahap, gunakan urutan berikut:

### Hari 1

1. Baca instruksi.
2. Pahami struktur file.
3. Rapikan `config.js`.
4. Lengkapi template UI dan CSS dasar.

### Hari 2

1. Selesaikan `camera.service.js`.
2. Uji start/stop kamera.
3. Selesaikan `detection.service.js`.
4. Uji model hingga label muncul.

### Hari 3

1. Buat presenter MVP.
2. Sambungkan UI dengan kamera dan deteksi.
3. Tambahkan loading state, confidence, dan FPS limit.

### Hari 4

1. Selesaikan `rootfacts.service.js`.
2. Tambahkan tone/persona.
3. Tambahkan copy to clipboard.
4. Uji hasil generasi.

### Hari 5

1. Selesaikan PWA.
2. Tambahkan manifest dan service worker.
3. Pastikan model lokal ikut cache.
4. Tambahkan lint.
5. Build dan deploy.

## 15. Prioritas File dari Paling Awal Sampai Akhir

Kalau Anda ingin daftar paling praktis tanpa penjelasan panjang, ikuti urutan ini:

1. `Instruksi/kriteria.txt`
2. `src/scripts/config.js`
3. `src/scripts/templates.js`
4. `src/styles/styles.css`
5. `src/scripts/services/camera.service.js`
6. `src/scripts/services/detection.service.js`
7. `src/scripts/pages/home/home-page.js`
8. `src/scripts/pages/home/home-presenter.js`
9. `src/scripts/services/rootfacts.service.js`
10. `src/scripts/index.js`
11. `src/index.html`
12. `src/public/manifest.webmanifest`
13. `webpack.common.js`
14. `webpack.prod.js`
15. `eslint.config.js`
16. `package.json`
17. `STUDENT.txt`

## 16. Tanda Bahwa Anda Sudah Siap Masuk Tahap Berikutnya

Gunakan aturan ini:

1. Jangan lanjut ke Generative AI jika kamera dan deteksi belum stabil.
2. Jangan lanjut ke PWA jika alur scan utama masih sering error.
3. Jangan deploy jika build production belum bersih.
4. Jangan submit jika offline mode belum diuji.

## 17. Checklist Akhir Sebelum Submit

### Kriteria 1

1. Kamera aktif.
2. Model TensorFlow.js termuat.
3. Label prediksi tampil.
4. Ada FPS limit.
5. Ada loading status dengan persentase.
6. Ada backend adaptif WebGPU ke WebGL.
7. Ada manajemen memori `tf.tidy()` atau `.dispose()`.
8. Menggunakan MVP.

### Kriteria 2

1. Label deteksi masuk ke prompt secara dinamis.
2. Fun fact relevan tampil di UI.
3. Ada copy to clipboard.
4. Parameter generasi diatur.
5. Ada persona dinamis.
6. Ada backend adaptif untuk model generatif.

### Kriteria 3

1. Ada manifest valid.
2. Ada service worker aktif.
3. Aset inti ter-cache.
4. Model `.json` dan `.bin` lokal ikut ter-cache.
5. Aplikasi installable.
6. Ada URL deployment di `STUDENT.txt`.

## 18. Saran Cara Belajar Agar Benar-Benar Paham

Saat mengerjakan, jangan hanya bertanya “kode apa yang harus ditulis”, tapi tanyakan juga:

1. Kenapa file ini dikerjakan sekarang?
2. Siapa yang bertanggung jawab atas logika ini: view, presenter, atau service?
3. Kalau fitur ini error, file mana yang paling mungkin bermasalah?
4. Kriteria submission ini dipenuhi oleh bagian kode yang mana?

Kalau Anda mengikuti urutan di dokumen ini, proses belajar akan jauh lebih masuk akal daripada langsung melompat ke bagian AI atau PWA.
