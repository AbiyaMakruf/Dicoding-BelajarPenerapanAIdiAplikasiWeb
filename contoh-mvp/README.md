# NutriVision - MVP Version

NutriVision dengan arsitektur MVP (Model-View-Presenter) menggunakan Webpack.

## Arsitektur MVP

MVP adalah pola arsitektur yang memisahkan kode menjadi tiga komponen utama:

```
├── src/
│   ├── scripts/
│   │   ├── config.js              # MODEL: Konfigurasi aplikasi
│   │   ├── templates.js           # VIEW: Template HTML
│   │   ├── index.js               # Entry point
│   │   ├── pages/
│   │   │   ├── app.js             # Main app controller
│   │   │   └── home/
│   │   │       ├── home-page.js           # VIEW: UI rendering
│   │   │       └── home-presenter.js      # PRESENTER: Logic & coordination
│   │   ├── services/              # MODEL: Business logic & API
│   │   │   ├── camera.service.js
│   │   │   ├── detection.service.js
│   │   │   └── nutrition.service.js
│   │   └── utils/                 # HELPER: Utilities
│   │       └── index.js
│   └── styles/
│       └── styles.css
```

## Penjelasan Komponen

### 1. MODEL (Data & Business Logic)

Bertanggung jawab untuk data dan logika bisnis:

- **`config.js`** - Konfigurasi global (API, model paths, thresholds)
- **`services/`** - Layanan untuk:
  - `camera.service.js` - Akses kamera (WebRTC)
  - `detection.service.js` - Deteksi makanan (TensorFlow.js)
  - `nutrition.service.js` -生成 konten nutrisi (Transformers.js)

### 2. VIEW (Tampilan)

Bertanggung jawab untuk menampilkan UI:

- **`templates.js`** - Template HTML dinamis
- **`home-page.js`** - Merender UI dan menangani event user

### 3. PRESENTER (Koordinator)

Menghubungkan Model dan View:

- **`home-presenter.js`** - Mengatur alur kerja:
  - Memuat model saat aplikasi dimulai
  - Mengkoordinasikan deteksi kamera
  - Memanggil service dan update view

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Development
npm run start-dev

# Build production
npm run build

# Check formatting
npm run prettier

# Auto-format code
npm run prettier:write
```

## Teknologi

- **Webpack** - Module bundler
- **TensorFlow.js** - Deteksi makanan (WebGL/WebGPU)
- **Transformers.js** - AI generasi konten
- **Workbox** - Service Worker untuk PWA

## Struktur File

| File                | Peran     | Contoh              |
| ------------------- | --------- | ------------------- |
| `config.js`         | Model     | Constants, API URLs |
| `templates.js`      | View      | HTML templates      |
| `home-page.js`      | View      | DOM manipulation    |
| `home-presenter.js` | Presenter | Business logic      |
| `*.service.js`      | Model     | Data operations     |
| `utils/index.js`    | Helper    | Shared functions    |
