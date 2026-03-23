import { APP_CONFIG, FACT_TONE_CONFIG } from "../../config.js";
import CameraService from "../../services/camera.service.js";
import DetectionService from "../../services/detection.service.js";
import RootFactsService from "../../services/rootfacts.service.js";
import {
  createDelay,
  getCameraErrorMessage,
  isValidDetection,
  logError,
} from "../../utils/index.js";

class HomePresenter {
  constructor({ view }) {
    this.view = view;
    this.cameraService = new CameraService();
    this.detectionService = new DetectionService();
    this.rootFactsService = new RootFactsService();
    this.detectionTimer = null;
    this.lastPredictionAt = 0;
    this.lastStableLabel = null;
    this.isScanning = false;
    this.isInitializing = false;
    this.isFactsLoading = false;
    this.factCache = new Map();
  }

  async initialize() {
    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    this.view.bindEvents({
      onToggleScan: () => this.toggleScanning(),
      onCameraChange: () => this.handleCameraChange(),
      onFPSChange: (fps) => this.handleFPSChange(fps),
      onToneChange: (tone) => this.handleToneChange(tone),
      onCopy: () => this.handleCopy(),
      onInstall: () => this.view.promptInstall(),
    });

    this.view.updateToneLabel(FACT_TONE_CONFIG.normal.label);
    this.view.showLoadingState({
      title: "Menunggu Model...",
      description: "Sedang menyiapkan deteksi sayuran",
      progress: 0,
    });
    this.view.setHeaderStatus("Menyiapkan model 0%", false);

    try {
      await this.detectionService.loadModel((detail) => {
        this.view.showLoadingState({
          title: "Menunggu Model...",
          description: detail.message,
          progress: detail.progress,
        });
        this.view.setHeaderStatus(`Menyiapkan model ${detail.progress}%`, false);
      });

      await this.cameraService.loadCameras(this.view.getCameraSelect());
      this.handleFPSChange(this.view.getFPSValue());
      this.view.updateBackendBadge(this.detectionService.currentBackend, null);
      this.view.setHeaderStatus("Siap memindai", true);
      this.view.showIdleState();
    } catch (error) {
      logError("Gagal inisialisasi aplikasi", error);
      this.view.showLoadingState({
        title: "Inisialisasi gagal",
        description: error.message,
        progress: 100,
      });
      this.view.setHeaderStatus("Gagal memuat model", false);
      this.view.showToast("Model gagal dimuat. Coba refresh halaman.");
    } finally {
      this.isInitializing = false;
    }
  }

  async toggleScanning() {
    if (this.isScanning) {
      this.stopScanning();
      return;
    }

    try {
      await this.cameraService.startCamera(
        "media-video",
        "media-canvas",
        this.view.getCameraSelect(),
      );
      this.isScanning = true;
      this.view.setCameraActive(true);
      this.view.showLoadingState({
        title: "Mencari sayuran...",
        description: "Arahkan objek ke dalam frame kamera",
        progress: 100,
      });
      this.view.setHeaderStatus("Kamera aktif", true);
      this.scheduleNextPrediction();
    } catch (error) {
      logError("Gagal memulai kamera", error);
      this.view.showToast(getCameraErrorMessage(error));
      this.view.setHeaderStatus("Kamera tidak tersedia", false);
    }
  }

  stopScanning() {
    this.isScanning = false;
    if (this.detectionTimer) {
      clearTimeout(this.detectionTimer);
      this.detectionTimer = null;
    }
    this.cameraService.stopCamera();
    this.view.setCameraActive(false);
    this.view.showIdleState();
    this.view.setHeaderStatus("Kamera berhenti", false);
  }

  scheduleNextPrediction() {
    if (!this.isScanning) {
      return;
    }

    const fps = this.cameraService.currentFPS || 15;
    const interval = Math.max(1000 / fps, APP_CONFIG.detectionRetryInterval);

    this.detectionTimer = window.setTimeout(async () => {
      await this.detectCurrentFrame();
      this.scheduleNextPrediction();
    }, interval);
  }

  async detectCurrentFrame() {
    if (!this.isScanning) {
      return;
    }

    const video = this.view.getVideoElement();
    if (!video || video.readyState < 2) {
      return;
    }

    const now = performance.now();
    if (now - this.lastPredictionAt < APP_CONFIG.analyzingDelay) {
      return;
    }
    this.lastPredictionAt = now;

    try {
      const prediction = await this.detectionService.predict(video);
      if (!prediction) {
        return;
      }

      if (!isValidDetection(prediction)) {
        this.view.showLoadingState({
          title: "Mencari sayuran...",
          description: "Deteksi belum cukup yakin, coba dekatkan objek ke kamera.",
          progress: 100,
        });
        return;
      }

      this.view.showResultState();
      this.view.updateDetection(prediction);
      this.view.updateBackendBadge(
        this.detectionService.currentBackend,
        this.rootFactsService.currentBackend,
      );

      if (prediction.label !== this.lastStableLabel) {
        this.lastStableLabel = prediction.label;
        await createDelay(APP_CONFIG.factsGenerationDelay);
        await this.generateFactsForCurrentLabel(prediction.label);
      }
    } catch (error) {
      logError("Gagal melakukan prediksi", error);
      this.view.showToast("Prediksi gagal diproses. Coba arahkan ulang kamera.");
    }
  }

  async generateFactsForCurrentLabel(label) {
    const tone = this.view.getToneValue();
    const cacheKey = `${label}:${tone}`;

    if (this.factCache.has(cacheKey)) {
      const cachedFact = this.factCache.get(cacheKey);
      this.view.updateFunFact(cachedFact.text);
      this.view.updateToneLabel(FACT_TONE_CONFIG[tone].label);
      this.view.updateBackendBadge(
        this.detectionService.currentBackend,
        cachedFact.backend,
      );
      return;
    }

    this.view.setFunFactLoading(true, "Memuat storyteller lokal...");

    try {
      if (!this.rootFactsService.isReady() && !this.isFactsLoading) {
        this.isFactsLoading = true;
        await this.rootFactsService.loadModel((detail) => {
          this.view.setFunFactLoading(true, `${detail.message} ${detail.progress}%`);
          this.view.updateBackendBadge(
            this.detectionService.currentBackend,
            detail.progress === 100 ? this.rootFactsService.currentBackend : null,
          );
        });
      }

      const fact = await this.rootFactsService.generateFacts(label, tone);
      this.factCache.set(cacheKey, fact);
      this.view.updateFunFact(fact.text);
      this.view.updateToneLabel(FACT_TONE_CONFIG[fact.tone].label);
      this.view.updateBackendBadge(
        this.detectionService.currentBackend,
        fact.backend,
      );
    } catch (error) {
      logError("Gagal membuat fun fact", error);
      this.view.updateFunFact(
        `${label} berhasil dikenali, tetapi storyteller lokal belum dapat menghasilkan fakta saat ini.`,
      );
      this.view.showToast("Fun fact belum berhasil dibuat. Coba lagi beberapa detik.");
    } finally {
      this.isFactsLoading = false;
      this.view.setFunFactLoading(false);
    }
  }

  async handleCameraChange() {
    if (!this.isScanning) {
      return;
    }

    try {
      await this.cameraService.startCamera(
        "media-video",
        "media-canvas",
        this.view.getCameraSelect(),
      );
      this.view.showToast("Kamera diganti.");
    } catch (error) {
      logError("Gagal mengganti kamera", error);
      this.view.showToast(getCameraErrorMessage(error));
    }
  }

  handleFPSChange(fps) {
    const appliedFPS = this.cameraService.setFPS(fps);
    this.view.updateFPSLabel(appliedFPS);
  }

  async handleToneChange(tone) {
    const selectedTone = this.rootFactsService.setTone(tone);
    this.view.updateToneLabel(FACT_TONE_CONFIG[selectedTone].label);

    if (this.lastStableLabel) {
      await this.generateFactsForCurrentLabel(this.lastStableLabel);
    }
  }

  async handleCopy() {
    const text = this.view.getFunFactText();
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.view.markCopySuccess();
      this.view.showToast("Fakta berhasil disalin.");
    } catch (error) {
      logError("Gagal menyalin fakta", error);
      this.view.showToast("Clipboard tidak tersedia pada browser ini.");
    }
  }
}

export default HomePresenter;
