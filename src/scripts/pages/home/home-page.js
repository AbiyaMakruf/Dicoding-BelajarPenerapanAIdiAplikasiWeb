import {
  generateCameraSection,
  generateInfoPanel,
  generateFooter,
  generateInstallBanner,
  generateToast,
} from "../../templates.js";
import HomePresenter from "./home-presenter.js";

export default class HomePage {
  #presenter = null;
  #deferredInstallPrompt = null;
  #elements = {};

  async render() {
    return `
      <main class="main-content">
        ${generateCameraSection()}
        ${generateInfoPanel()}
        ${generateInstallBanner()}
      </main>
      ${generateFooter()}
      ${generateToast()}
    `;
  }

  async afterRender() {
    this.#cacheElements();
    this.#registerInstallPrompt();
    this.#presenter = new HomePresenter({ view: this });
    await this.#presenter.initialize();
  }

  #cacheElements() {
    this.#elements = {
      idleState: document.getElementById("state-idle"),
      loadingState: document.getElementById("state-loading"),
      resultState: document.getElementById("state-result"),
      loadingTitle: document.getElementById("loading-title"),
      loadingDescription: document.getElementById("loading-description"),
      loadingProgressBar: document.getElementById("loading-progress-bar"),
      loadingProgressText: document.getElementById("loading-progress-text"),
      btnToggle: document.getElementById("btn-toggle"),
      cameraSelect: document.getElementById("camera-select"),
      fpsSlider: document.getElementById("fps-slider"),
      fpsLabel: document.getElementById("fps-label"),
      toneSelect: document.getElementById("tone-select"),
      toneLabel: document.getElementById("tone-label"),
      video: document.getElementById("media-video"),
      cameraOverlay: document.getElementById("camera-overlay"),
      cameraPlaceholder: document.getElementById("camera-placeholder"),
      detectedName: document.getElementById("detected-name"),
      detectedConfidence: document.getElementById("detected-confidence"),
      confidenceFill: document.getElementById("confidence-fill"),
      funFactText: document.getElementById("fun-fact-text"),
      funFactLoading: document.getElementById("fun-fact-loading"),
      funFactLoadingText: document.getElementById("fun-fact-loading-text"),
      btnCopy: document.getElementById("btn-copy"),
      backendBadge: document.getElementById("backend-badge"),
      resultHint: document.getElementById("result-hint"),
      statusDot: document.getElementById("status-dot"),
      statusText: document.getElementById("status-text"),
      toast: document.getElementById("app-toast"),
      installBanner: document.getElementById("install-banner"),
      btnInstall: document.getElementById("btn-install"),
      toastTimer: null,
    };
  }

  #registerInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.#deferredInstallPrompt = event;
      this.#elements.installBanner?.classList.remove("hidden");
    });

    window.addEventListener("appinstalled", () => {
      this.#deferredInstallPrompt = null;
      this.#elements.installBanner?.classList.add("hidden");
      this.showToast("RootFacts berhasil dipasang.");
    });
  }

  bindEvents({
    onToggleScan,
    onCameraChange,
    onFPSChange,
    onToneChange,
    onCopy,
    onInstall,
  }) {
    this.#elements.btnToggle?.addEventListener("click", onToggleScan);
    this.#elements.cameraSelect?.addEventListener("change", onCameraChange);
    this.#elements.fpsSlider?.addEventListener("input", (event) =>
      onFPSChange(event.target.value),
    );
    this.#elements.toneSelect?.addEventListener("change", (event) =>
      onToneChange(event.target.value),
    );
    this.#elements.btnCopy?.addEventListener("click", onCopy);
    this.#elements.btnInstall?.addEventListener("click", onInstall);
  }

  async promptInstall() {
    if (!this.#deferredInstallPrompt) {
      this.showToast("Opsi install belum tersedia di browser ini.");
      return;
    }

    await this.#deferredInstallPrompt.prompt();
    await this.#deferredInstallPrompt.userChoice;
    this.#deferredInstallPrompt = null;
    this.#elements.installBanner?.classList.add("hidden");
  }

  getCameraSelect() {
    return this.#elements.cameraSelect;
  }

  getFPSValue() {
    return this.#elements.fpsSlider?.value || "15";
  }

  getToneValue() {
    return this.#elements.toneSelect?.value || "normal";
  }

  getVideoElement() {
    return this.#elements.video;
  }

  getFunFactText() {
    const text = this.#elements.funFactText?.textContent?.trim() || "";
    if (text === "Fakta menarik akan muncul di sini...") {
      return "";
    }
    return text;
  }

  updateFPSLabel(fps) {
    if (this.#elements.fpsLabel) {
      this.#elements.fpsLabel.textContent = `${fps} FPS`;
    }
  }

  updateToneLabel(label) {
    if (this.#elements.toneLabel) {
      this.#elements.toneLabel.textContent = label;
    }
  }

  showIdleState() {
    this.#elements.idleState?.classList.remove("hidden");
    this.#elements.loadingState?.classList.add("hidden");
    this.#elements.resultState?.classList.add("hidden");
  }

  showLoadingState({ title, description, progress }) {
    this.#elements.idleState?.classList.add("hidden");
    this.#elements.loadingState?.classList.remove("hidden");
    this.#elements.resultState?.classList.add("hidden");

    if (this.#elements.loadingTitle) {
      this.#elements.loadingTitle.textContent = title;
    }
    if (this.#elements.loadingDescription) {
      this.#elements.loadingDescription.textContent = description;
    }
    if (this.#elements.loadingProgressBar) {
      this.#elements.loadingProgressBar.style.width = `${progress}%`;
    }
    if (this.#elements.loadingProgressText) {
      this.#elements.loadingProgressText.textContent = `${progress}%`;
    }
  }

  showResultState() {
    this.#elements.idleState?.classList.add("hidden");
    this.#elements.loadingState?.classList.add("hidden");
    this.#elements.resultState?.classList.remove("hidden");
  }

  updateDetection(prediction) {
    if (this.#elements.detectedName) {
      this.#elements.detectedName.textContent = prediction.label;
    }
    if (this.#elements.detectedConfidence) {
      this.#elements.detectedConfidence.textContent = `${prediction.confidence}%`;
    }
    if (this.#elements.confidenceFill) {
      this.#elements.confidenceFill.style.width = `${prediction.confidence}%`;
    }
    if (this.#elements.resultHint) {
      this.#elements.resultHint.textContent = `Prediksi ${Math.round(prediction.duration)} ms, siap disalin.`;
    }
  }

  setFunFactLoading(isLoading, text = "Memuat fakta menarik...") {
    this.#elements.funFactLoading?.classList.toggle("hidden", !isLoading);
    if (this.#elements.funFactLoadingText) {
      this.#elements.funFactLoadingText.textContent = text;
    }
  }

  updateFunFact(text) {
    if (this.#elements.funFactText) {
      this.#elements.funFactText.textContent = text;
    }
  }

  markCopySuccess() {
    this.#elements.btnCopy?.classList.add("copied");
    window.setTimeout(() => {
      this.#elements.btnCopy?.classList.remove("copied");
    }, 1500);
  }

  setCameraActive(isActive) {
    this.#elements.cameraOverlay?.classList.toggle("active", isActive);
    this.#elements.cameraPlaceholder?.classList.toggle("hidden", isActive);
    this.#elements.btnToggle?.classList.toggle("scanning", isActive);
  }

  setHeaderStatus(text, isActive) {
    if (this.#elements.statusText) {
      this.#elements.statusText.textContent = text;
    }
    this.#elements.statusDot?.classList.toggle("active", isActive);
  }

  updateBackendBadge(detectionBackend, factsBackend) {
    if (!this.#elements.backendBadge) {
      return;
    }

    const detectionLabel = detectionBackend
      ? `CV ${String(detectionBackend).toUpperCase()}`
      : "CV -";
    const factsLabel = factsBackend
      ? `GenAI ${String(factsBackend).toUpperCase()}`
      : "GenAI menunggu";
    this.#elements.backendBadge.textContent = `${detectionLabel} • ${factsLabel}`;
  }

  showToast(message) {
    if (!this.#elements.toast) {
      return;
    }

    this.#elements.toast.textContent = message;
    this.#elements.toast.classList.remove("hidden");
    this.#elements.toast.classList.add("show");

    window.clearTimeout(this.#elements.toastTimer);
    this.#elements.toastTimer = window.setTimeout(() => {
      this.#elements.toast?.classList.remove("show");
      this.#elements.toast?.classList.add("hidden");
    }, 2200);
  }
}

