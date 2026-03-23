const APP_CONFIG = {
  detectionConfidenceThreshold: 70,
  analyzingDelay: 250,
  factsGenerationDelay: 0,
  detectionRetryInterval: 100,
  maxInputLength: 32,
  loadingWeights: {
    detection: 1,
    facts: 1,
  },
  detectionModel: {
    modelUrl: "/model/model.json",
    metadataUrl: "/model/metadata.json",
    imageSize: 224,
  },
  factsModel: {
    task: "text2text-generation",
    modelId: "Xenova/flan-t5-small",
    dtype: "q4",
  },
  generation: {
    maxNewTokens: 110,
    temperature: 0.8,
    topP: 0.9,
    doSample: true,
  },
};

const UI_CONFIG = {
  animationDuration: 300,
  fadeAnimation: "fadeIn 0.5s ease-out forwards",
  confidenceThresholds: {
    excellent: 90,
    good: 80,
  },
  factsCardOpacity: {
    loading: 0.6,
    normal: 1.0,
  },
};

const CAMERA_CONFIG = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  defaultFPS: 15,
  minFPS: 5,
  maxFPS: 30,
};

const FACT_TONE_CONFIG = {
  normal: {
    label: "Natural",
    instruction:
      "Write in a friendly and clear tone. Keep it factual, concise, and easy to understand.",
  },
  funny: {
    label: "Lucu",
    instruction:
      "Write with light humor and playful wording, but keep the fact accurate and family friendly.",
  },
  history: {
    label: "Sejarah",
    instruction:
      "Highlight a short historical or cultural angle while keeping the fact accurate and engaging.",
  },
  chef: {
    label: "Chef",
    instruction:
      "Write like a culinary guide and connect the fact to cooking, flavor, or kitchen usage.",
  },
};

export {
  APP_CONFIG,
  UI_CONFIG,
  CAMERA_CONFIG,
  FACT_TONE_CONFIG,
};
