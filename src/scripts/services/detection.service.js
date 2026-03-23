import { APP_CONFIG } from "../config.js";
import { validateModelMetadata } from "../utils/index.js";

class DetectionService {
  constructor() {
    this.tf = null;
    this.model = null;
    this.labels = [];
    this.config = APP_CONFIG.detectionModel;
    this.imageSize = APP_CONFIG.detectionModel.imageSize;
    this.currentBackend = "cpu";
    this.loadPromise = null;
    this.performanceStats = {
      operations: 0,
      totalTime: 0,
      averageTime: 0,
    };
  }

  async loadModel(onProgress = () => {}) {
    if (this.model) {
      onProgress({ progress: 100, status: "ready", message: "Model deteksi siap." });
      return {
        backend: this.currentBackend,
        labels: this.labels,
      };
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await import("@tensorflow/tfjs-backend-webgpu");
      this.tf = tf;

      onProgress({
        progress: 5,
        status: "backend",
        message: "Menyiapkan backend TensorFlow.js...",
      });

      const preferredBackends = navigator.gpu
        ? ["webgpu", "webgl", "cpu"]
        : ["webgl", "cpu"];

      for (const backend of preferredBackends) {
        try {
          await this.tf.setBackend(backend);
          await this.tf.ready();
          this.currentBackend = backend;
          break;
        } catch (error) {
          if (backend === preferredBackends[preferredBackends.length - 1]) {
            throw error;
          }
        }
      }

      onProgress({
        progress: 20,
        status: "metadata",
        message: `Backend aktif: ${this.currentBackend.toUpperCase()}. Memuat metadata...`,
      });

      const metadataPromise = fetch(this.config.metadataUrl).then((response) => {
        if (!response.ok) {
          throw new Error("Metadata model tidak dapat dimuat.");
        }
        return response.json();
      });

      const modelPromise = this.tf.loadGraphModel(this.config.modelUrl, {
        onProgress: (fraction) => {
          onProgress({
            progress: 20 + Math.round(fraction * 75),
            status: "model",
            message: "Mengunduh model deteksi sayuran...",
          });
        },
      });

      const [metadata, model] = await Promise.all([metadataPromise, modelPromise]);

      if (!validateModelMetadata(metadata)) {
        throw new Error("Metadata model tidak valid.");
      }

      this.labels = metadata.labels;
      this.imageSize = metadata.imageSize || this.imageSize;
      this.model = model;

      onProgress({
        progress: 100,
        status: "ready",
        message: "Model deteksi siap digunakan.",
      });

      return {
        backend: this.currentBackend,
        labels: this.labels,
      };
    })();

    try {
      return await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  async predict(imageElement) {
    if (!this.model || !this.tf) {
      throw new Error("Model deteksi belum dimuat.");
    }

    if (!imageElement) {
      return null;
    }

    const startTime = performance.now();

    const result = this.tf.tidy(() => {
      const inputTensor = this.tf.browser
        .fromPixels(imageElement)
        .resizeBilinear([this.imageSize, this.imageSize])
        .toFloat()
        .div(127.5)
        .sub(1)
        .expandDims(0);

      const outputTensor = this.model.predict(inputTensor);
      const scores = Array.from(outputTensor.dataSync());
      const highestScore = Math.max(...scores);
      const classIndex = scores.indexOf(highestScore);

      return {
        label: this.labels[classIndex] || "Unknown vegetable",
        confidence: Math.round(highestScore * 100),
        scores,
        isValid:
          Number.isFinite(highestScore) &&
          Math.round(highestScore * 100) >= APP_CONFIG.detectionConfidenceThreshold,
      };
    });

    const duration = performance.now() - startTime;
    this.performanceStats.operations += 1;
    this.performanceStats.totalTime += duration;
    this.performanceStats.averageTime =
      this.performanceStats.totalTime / this.performanceStats.operations;

    return {
      ...result,
      duration,
      backend: this.currentBackend,
    };
  }
}

export default DetectionService;
