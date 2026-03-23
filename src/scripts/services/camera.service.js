import { CAMERA_CONFIG } from "../config.js";

class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = CAMERA_CONFIG;
    this.currentFPS = CAMERA_CONFIG.defaultFPS;
  }

  initializeElements(videoId, canvasId) {
    this.video = document.getElementById(videoId);
    this.canvas = document.getElementById(canvasId);
  }

  async loadCameras(cameraSelect) {
    if (!cameraSelect || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");

    cameraSelect.innerHTML = "";

    if (cameras.length === 0) {
      cameraSelect.innerHTML = '<option value="environment">Kamera default</option>';
      return [];
    }

    cameras.forEach((camera, index) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.textContent = camera.label || `Kamera ${index + 1}`;
      cameraSelect.appendChild(option);
    });

    const frontCamera = cameras.find((camera) =>
      /front|user|depan/i.test(camera.label),
    );
    const backCamera = cameras.find((camera) =>
      /back|rear|environment|belakang/i.test(camera.label),
    );

    if (backCamera) {
      cameraSelect.value = backCamera.deviceId;
    } else if (frontCamera) {
      cameraSelect.value = frontCamera.deviceId;
    }

    return cameras;
  }

  async startCamera(videoId, canvasId, cameraSelect) {
    this.initializeElements(videoId, canvasId);

    if (!this.video) {
      throw new Error("Elemen video tidak ditemukan.");
    }

    this.stopCamera();

    const selectedCamera = cameraSelect?.value || "environment";
    const useFacingMode = selectedCamera === "environment" || selectedCamera === "user";
    const constraints = {
      audio: false,
      video: {
        ...this.config.video,
        frameRate: {
          ideal: this.currentFPS,
          max: this.currentFPS,
        },
        ...(useFacingMode
          ? { facingMode: { ideal: selectedCamera } }
          : { deviceId: { exact: selectedCamera } }),
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
    await this.video.play();

    if (cameraSelect) {
      const previousValue = cameraSelect.value;
      const cameras = await this.loadCameras(cameraSelect);
      const matchedCamera = cameras.find(
        (camera) => camera.deviceId === previousValue,
      );

      if (matchedCamera) {
        cameraSelect.value = matchedCamera.deviceId;
      }
    }

    return this.stream;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
  }

  setFPS(fps) {
    const parsedFPS = Number(fps);
    const boundedFPS = Math.min(
      this.config.maxFPS,
      Math.max(this.config.minFPS, parsedFPS),
    );

    this.currentFPS = boundedFPS;

    const track = this.stream?.getVideoTracks?.()[0];
    if (track?.applyConstraints) {
      track
        .applyConstraints({
          frameRate: {
            ideal: boundedFPS,
            max: boundedFPS,
          },
        })
        .catch(() => {});
    }

    return boundedFPS;
  }

  isActive() {
    return Boolean(this.stream && this.stream.active);
  }
}

export default CameraService;
