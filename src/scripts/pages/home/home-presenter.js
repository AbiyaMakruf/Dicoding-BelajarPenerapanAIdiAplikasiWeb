import { APP_CONFIG } from "../../config.js";
import CameraService from "../../services/camera.service.js";
import DetectionService from "../../services/detection.service.js";
import { createDelay, isValidDetection, logError } from "../../utils/index.js";

export default class HomePresenter {
  #view = null;
  #cameraService = null;
  #detectionService = null;
  #timer = null;
  #currentLoopId = null;

  constructor({ view }) {
    this.#view = view;
    this.#cameraService = new CameraService();
    this.#detectionService = new DetectionService((progress) => {
      this.#view.showModelLoading(progress.progress, progress.message);
    });
  }

  async initialApp() {
    this.#view.showInitialLoading();

    try {
      await this.#cameraService.loadCameras(this.#view.getCameraSelectElement());
      const modelInfo = await this.#detectionService.loadModel();

      this.#view.showModelReady(modelInfo.backend);
      this.#view.enableToggleButton();
      this.#view.showIdleState();
    } catch (error) {
      logError("Initial app gagal", error);
      this.#view.showError(error.message);
    }
  }

  async startCamera() {
    this.#view.showCameraLoading();
    this.#view.showStatus("Mengakses kamera...");

    try {
      await this.#cameraService.startCamera(
        "media-video",
        "media-canvas",
        this.#view.getCameraSelectElement(),
      );

      this.#view.hideCameraLoading();
      this.#view.showCameraActive();
      this.#view.showLoadingState(
        "Arahkan kamera ke sayuran hingga sistem menemukan label yang paling yakin.",
        "Mencari Sayuran...",
      );
      this.#view.showStatus("Kamera aktif. Memulai deteksi...");

      this.#startDetectionLoop();
    } catch (error) {
      logError("Start camera gagal", error);
      this.#view.showError(error.message);
    }
  }

  stopCamera() {
    this.#stopDetectionLoop();
    this.#cameraService.stopCamera();
    this.#view.showCameraInactive();
    this.#view.showIdleState();
    this.#view.showStatus("Siap untuk scan");
  }

  toggleCamera() {
    if (this.#cameraService.isActive()) {
      this.stopCamera();
      return;
    }

    this.startCamera();
  }

  async changeCamera() {
    if (!this.#cameraService.isActive()) {
      return;
    }

    this.#stopDetectionLoop();
    await this.startCamera();
  }

  setFPS(fps) {
    this.#cameraService.setFPS(fps);

    if (this.#cameraService.isActive()) {
      this.#startDetectionLoop();
    }
  }

  #startDetectionLoop() {
    this.#stopDetectionLoop();

    const fps = Math.max(15, Math.min(60, this.#view.getFPSValue()));
    const interval = Math.round(1000 / fps);
    const loopId = Date.now();

    this.#currentLoopId = loopId;
    this.#runDetectionLoop(loopId, interval);
  }

  #stopDetectionLoop() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }

    this.#currentLoopId = null;
  }

  async #runDetectionLoop(loopId, interval) {
    if (!this.#cameraService.isActive() || this.#currentLoopId !== loopId) {
      return;
    }

    await this.#detectionLoop(loopId);

    if (!this.#cameraService.isActive() || this.#currentLoopId !== loopId) {
      return;
    }

    this.#timer = setTimeout(() => {
      this.#runDetectionLoop(loopId, interval);
    }, interval);
  }

  async #detectionLoop(loopId) {
    if (!this.#cameraService.isActive() || this.#currentLoopId !== loopId) {
      return;
    }

    const canvas = this.#cameraService.captureFrame();

    if (!canvas) {
      return;
    }

    try {
      const result = await this.#detectionService.predict(canvas);

      if (isValidDetection(result)) {
        this.#stopDetectionLoop();
        this.#view.showLoadingState(
          `Label ${result.className} terdeteksi dengan kepercayaan ${result.confidence}%.`,
          "Menganalisis Hasil...",
        );

        await createDelay(APP_CONFIG.analyzingDelay);

        this.#cameraService.stopCamera();
        this.#view.showCameraInactive();
        this.#view.showResultState(result);
        this.#view.showStatus(
          `Terdeteksi: ${result.className} (${result.confidence}%)`,
        );

        return;
      }

      const topPrediction = result.allPredictions?.[0];
      if (topPrediction) {
        this.#view.showScanningHint(topPrediction);
      }
    } catch (error) {
      logError("Loop deteksi gagal", error);
      this.#view.showStatus("Prediksi gagal. Sistem mencoba ulang...");
    }
  }
}
