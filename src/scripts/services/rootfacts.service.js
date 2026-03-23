import { APP_CONFIG, FACT_TONE_CONFIG } from "../config.js";

class RootFactsService {
  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.config = APP_CONFIG.factsModel;
    this.currentBackend = null;
    this.currentTone = "normal";
    this.transformers = null;
    this.loadPromise = null;
  }

  async loadModel(onProgress = () => {}) {
    if (this.generator) {
      onProgress({ progress: 100, status: "ready", message: "Model storyteller siap." });
      return {
        backend: this.currentBackend,
      };
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      const { env, pipeline } = await import("@huggingface/transformers");
      this.transformers = { env, pipeline };

      env.useBrowserCache = true;
      env.allowLocalModels = false;
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.proxy = false;
      }

      const preferredDevice = navigator.gpu ? "webgpu" : "webgl";
      const fallbackDevices =
        preferredDevice === "webgpu"
          ? ["webgpu", "webgl", "wasm"]
          : ["webgl", "wasm"];

      onProgress({
        progress: 5,
        status: "backend",
        message: "Menyiapkan backend storyteller...",
      });

      let lastError = null;
      for (const device of fallbackDevices) {
        try {
          this.generator = await pipeline(this.config.task, this.config.modelId, {
            device,
            dtype: this.config.dtype,
            progress_callback: (progressData) => {
              const rawProgress = Number.isFinite(progressData.progress)
                ? progressData.progress
                : 0;
              const fraction = rawProgress > 1 ? rawProgress / 100 : rawProgress;
              onProgress({
                progress: 10 + Math.round(fraction * 90),
                status: "loading",
                message: "Mengunduh model fun fact lokal...",
              });
            },
          });
          this.currentBackend = device;
          this.isModelLoaded = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!this.generator) {
        throw lastError || new Error("Model fun fact gagal dimuat.");
      }

      onProgress({ progress: 100, status: "ready", message: "Model storyteller siap." });

      return {
        backend: this.currentBackend,
      };
    })();

    try {
      return await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  setTone(tone) {
    this.currentTone = FACT_TONE_CONFIG[tone] ? tone : "normal";
    return this.currentTone;
  }

  async generateFacts(vegetable, tone = "normal") {
    if (!this.generator) {
      await this.loadModel();
    }

    const safeVegetable = String(vegetable || "")
      .replace(/[^a-zA-Z\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, APP_CONFIG.maxInputLength);

    if (!safeVegetable) {
      throw new Error("Nama sayuran tidak valid untuk diproses.");
    }

    const selectedTone = this.setTone(tone);
    const toneConfig = FACT_TONE_CONFIG[selectedTone];
    const prompt = [
      "You are RootFacts, a local AI storyteller for vegetables.",
      `Vegetable: ${safeVegetable}.`,
      toneConfig.instruction,
      "Write exactly 2 short sentences in Indonesian.",
      "Include one accurate and surprising fun fact.",
      "Do not use bullet points or hashtags.",
      "Keep the total answer under 55 words.",
    ].join(" ");

    this.isGenerating = true;

    try {
      const outputs = await this.generator(prompt, {
        max_new_tokens: APP_CONFIG.generation.maxNewTokens,
        temperature: APP_CONFIG.generation.temperature,
        top_p: APP_CONFIG.generation.topP,
        do_sample: APP_CONFIG.generation.doSample,
      });

      const text = outputs?.[0]?.generated_text?.trim();
      if (!text) {
        throw new Error("Generator tidak mengembalikan teks.");
      }

      return {
        text,
        backend: this.currentBackend,
        tone: selectedTone,
      };
    } finally {
      this.isGenerating = false;
    }
  }

  isReady() {
    return this.isModelLoaded && Boolean(this.generator);
  }
}

export default RootFactsService;
