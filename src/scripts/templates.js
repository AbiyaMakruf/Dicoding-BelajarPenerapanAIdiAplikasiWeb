export function generateCameraSection() {
  return `
    <section class="camera-section">
      <div class="camera-container">
        <div class="camera-wrapper">
          <video id="media-video" autoplay muted playsinline></video>
          <canvas id="media-canvas" class="hidden"></canvas>
          <div id="camera-overlay" class="camera-overlay">
            <div class="overlay-frame"></div>
          </div>
          <div id="camera-placeholder" class="camera-placeholder">
            <i data-lucide="camera" width="48" height="48"></i>
            <p>Kamera tidak aktif</p>
          </div>
        </div>

        <div class="camera-controls">
          <button id="btn-toggle" class="capture-btn">
            <i data-lucide="scan-line" width="24" height="24"></i>
          </button>
        </div>

        <div class="settings-bar">
          <div class="setting-item">
            <i data-lucide="camera" width="16" height="16"></i>
            <select id="camera-select">
              <option value="environment">Kamera belakang</option>
            </select>
          </div>
          <div class="setting-item fps-setting">
            <span id="fps-label">15 FPS</span>
            <input type="range" id="fps-slider" min="5" max="30" step="5" value="15">
          </div>
          <div class="setting-item tone-setting">
            <i data-lucide="sparkles" width="16" height="16"></i>
            <select id="tone-select">
              <option value="normal" selected>Natural</option>
              <option value="funny">Lucu</option>
              <option value="history">Sejarah</option>
              <option value="chef">Chef</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function generateInfoPanel() {
  return `
    <section class="results-section">
      ${generateIdleState()}
      ${generateLoadingState()}
      ${generateResultState()}
    </section>
  `;
}

function generateIdleState() {
  return `
    <div id="state-idle" class="result-card idle-card">
      <div class="idle-icon">
        <i data-lucide="sparkles" width="40" height="40"></i>
      </div>
      <h2>Scan Sayuran</h2>
      <p>Model AI sedang dipersiapkan. Setelah siap, aktifkan kamera dan arahkan sayuran ke dalam frame.</p>
    </div>
  `;
}

function generateLoadingState() {
  return `
    <div id="state-loading" class="result-card loading-card hidden">
      <div class="loading-animation">
        <div class="loading-ring"></div>
        <div class="loading-icon">
          <i data-lucide="search" width="24" height="24"></i>
        </div>
      </div>
      <h2 id="loading-title">Menunggu Model...</h2>
      <p id="loading-description">Sedang menyiapkan sistem deteksi</p>
      <div class="progress-block">
        <div class="progress-track">
          <div id="loading-progress-bar" class="progress-fill" style="width: 0%"></div>
        </div>
        <span id="loading-progress-text" class="progress-text">0%</span>
      </div>
    </div>
  `;
}

function generateResultState() {
  return `
    <div id="state-result" class="result-card result-main hidden">
      <div class="result-meta">
        <div class="detected-badge">
          <i data-lucide="check-circle" width="14" height="14"></i>
          <span id="detected-name">Sayuran</span>
        </div>
        <div id="backend-badge" class="backend-badge">Backend: -</div>
      </div>

      <div class="fact-style-pill">
        <i data-lucide="pen-square" width="14" height="14"></i>
        <span id="tone-label">Natural</span>
      </div>

      <div class="fun-fact-card">
        <div class="fun-fact-icon">
          <i data-lucide="lightbulb" width="28" height="28"></i>
        </div>
        <div id="fun-fact-loading" class="fun-fact-loading hidden">
          <div class="fun-fact-loading-spinner"></div>
          <span id="fun-fact-loading-text">Memuat fakta menarik...</span>
        </div>
        <div id="fun-fact-content">
          <p id="fun-fact-text" class="fun-fact-text">Fakta menarik akan muncul di sini...</p>
          <button id="btn-copy" class="copy-btn" title="Salin fakta">
            <i data-lucide="copy" width="18" height="18"></i>
          </button>
        </div>
      </div>

      <div class="confidence-bar">
        <span class="confidence-label">Kepercayaan</span>
        <div class="confidence-track">
          <div id="confidence-fill" class="confidence-fill" style="width: 0%"></div>
        </div>
        <span id="detected-confidence" class="confidence-value">0%</span>
      </div>

      <div class="share-hint">
        <i data-lucide="share-2" width="14" height="14"></i>
        <span id="result-hint">Salin dan bagikan ke teman!</span>
      </div>
    </div>
  `;
}

export function generateFooter() {
  return `
    <footer class="footer">
      <p>Powered by TensorFlow.js & Transformers.js</p>
    </footer>
  `;
}

export function generateInstallBanner() {
  return `
    <div id="install-banner" class="install-banner hidden">
      <div>
        <strong>Pasang RootFacts</strong>
        <p>Buka aplikasi lebih cepat dan tetap siap dipakai saat offline.</p>
      </div>
      <button id="btn-install" class="install-btn" type="button">Install</button>
    </div>
  `;
}

export function generateToast() {
  return `
    <div id="app-toast" class="app-toast hidden" role="status" aria-live="polite"></div>
  `;
}
