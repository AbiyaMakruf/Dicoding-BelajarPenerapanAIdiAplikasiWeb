export function generateCameraSection() {
  return `
    <section class="camera-card" aria-label="Camera Feed and Controls">
      <div class="viewport">
        <div class="live-indicator">
          <span id="status-dot" class="dot"></span>
          <span id="status-text-camera" class="live-text">OFFLINE</span>
        </div>

        <div id="view-inactive" class="view-content view-inactive">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <p>Kamera sedang tidak aktif</p>
        </div>

        <div id="view-active" class="view-content view-active">
          <video id="media-video" autoplay muted playsinline></video>
          <canvas id="media-canvas" width="640" height="480" style="display:none;"></canvas>

          <div id="scanner-overlay" class="scanner-overlay">
            <div class="scanner-line"></div>
            <div class="scanner-border"></div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button id="btn-toggle" class="btn btn-start" aria-label="Mulai Stream Kamera">
          <span id="btn-text">Mulai Scan</span>
        </button>

        <div class="settings-group">
          <div class="select-wrapper">
            <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <select id="camera-select">
              <option value="">Memuat kamera...</option>
            </select>
          </div>

          <div class="fps-control">
            <div class="fps-label">
              <label for="fps-slider">Batas FPS</label>
              <span id="fps-value">30</span>
            </div>
            <input id="fps-slider" type="range" min="15" max="60" step="15" value="30" />
          </div>
        </div>
      </div>
    </section>
  `;
}

export function generateInfoPanel() {
  return `
    <section class="info-panel" aria-live="polite">
      ${generateIdleState()}
      ${generateAnalyzingState()}
      ${generateResultState()}
    </section>
  `;
}

function generateIdleState() {
  return `
    <div id="state-idle" class="state-container state-idle">
      <div class="state-idle-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>
      <h2>Siap untuk Scan</h2>
      <p>Mulai kamera dan arahkan ke buah atau sayuran untuk mendapatkan wawasan nutrisi instan.</p>
    </div>
  `;
}

function generateAnalyzingState() {
  return `
    <div id="state-analyzing" class="state-container state-analyzing" style="display:none;">
      <div class="spinner"></div>
      <h2>Menganalisis Gambar...</h2>
      <p>Mengidentifikasi jenis produk dan menghitung metrik.</p>
    </div>
  `;
}

function generateResultState() {
  return `
    <div id="state-result" class="result-container" style="display:none;">
      <div id="result-card" class="result-card theme-green">
        <div class="result-header">
          <div>
            <p class="result-label">Objek Terdeteksi</p>
            <h2 id="res-name" class="result-title">-</h2>
          </div>
          <div class="confidence-score">
            <span id="res-confidence" class="score-val text-green">-%</span>
            <span class="score-label">Kepercayaan</span>
          </div>
        </div>
        
        <div class="confidence-bar-bg">
          <div id="res-bar" class="confidence-bar-fill"></div>
        </div>
      </div>

      <div class="nutrition-card">
        <div class="nutri-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <h3 id="nutri-header-title">Fakta Nutrisi</h3>
        </div>
        
        <div class="nutri-content">
          <p id="nutri-fact" class="nutri-text">Menghasilkan informasi nutrisi...</p>
        </div>
      </div>

      <div class="disclaimer">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p class="disclaimer-text">
          <strong>Catatan:</strong> Nilai nutrisi adalah perkiraan berdasarkan data generik rata-rata.
        </p>
      </div>
    </div>
  `;
}
