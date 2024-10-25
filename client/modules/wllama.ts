import {
  DownloadModelConfig,
  Wllama,
  WllamaConfig,
  SamplingConfig,
} from "@wllama/wllama/esm";
import singleThreadWllamaJsUrl from "@wllama/wllama/esm/single-thread/wllama.js?url";
import singleThreadWllamaWasmUrl from "@wllama/wllama/esm/single-thread/wllama.wasm?url";
import multiThreadWllamaJsUrl from "@wllama/wllama/esm/multi-thread/wllama.js?url";
import multiThreadWllamaWasmUrl from "@wllama/wllama/esm/multi-thread/wllama.wasm?url";
import multiThreadWllamaWorkerMjsUrl from "@wllama/wllama/esm/multi-thread/wllama.worker.mjs?url";

export async function initializeWllama(
  modelUrl: string | string[],
  config?: {
    wllama?: WllamaConfig;
    model?: DownloadModelConfig;
  },
) {
  const wllama = new Wllama(
    {
      "single-thread/wllama.js": singleThreadWllamaJsUrl,
      "single-thread/wllama.wasm": singleThreadWllamaWasmUrl,
      "multi-thread/wllama.js": multiThreadWllamaJsUrl,
      "multi-thread/wllama.wasm": multiThreadWllamaWasmUrl,
      "multi-thread/wllama.worker.mjs": multiThreadWllamaWorkerMjsUrl,
    },
    config?.wllama,
  );

  await wllama.loadModelFromUrl(modelUrl, config?.model);

  return wllama;
}

const commonSamplingConfig: SamplingConfig = {
  temp: 0.35,
  dynatemp_range: 0.25,
  top_k: 0,
  top_p: 1,
  min_p: 0.05,
  tfs_z: 0.95,
  typical_p: 0.85,
  penalty_freq: 0.5,
  penalty_repeat: 1.176,
  penalty_last_n: -1,
  mirostat: 2,
  mirostat_tau: 3.5,
};

export const availableModels: {
  [key in
    | "mobileDefault"
    | "mobileLarger"
    | "desktopDefault"
    | "desktopLarger"]: {
    url: string | string[];
    introduction: string;
    userPrefix: string;
    userSuffix: string;
    assistantPrefix: string;
    assistantSuffix: string;
    stopStrings: string[];
    cacheType: "f16" | "q8_0" | "q4_0";
    contextSize: number;
    sampling: SamplingConfig;
  };
} = {
  mobileDefault: {
    url: "https://huggingface.co/Felladrin/gguf-Llama-160M-Chat-v1/resolve/main/Llama-160M-Chat-v1.Q4_K_M.gguf",
    introduction:
      "<|im_start|>system\nYou are a highly knowledgeable and friendly assistant. Your goal is to understand and respond to user inquiries with clarity.<|im_end|>\n",
    userPrefix: "<|im_start|>user\n",
    userSuffix: "<|im_end|>\n",
    assistantPrefix: "<|im_start|>assistant\n",
    assistantSuffix: "<|im_end|>\n",
    stopStrings: ["<|im_start|>", "<|im_end|>"],
    cacheType: "f16",
    contextSize: 2048,
    sampling: commonSamplingConfig,
  },
  mobileLarger: {
    url: "https://huggingface.co/Felladrin/gguf-sharded-Llama-160M-Chat-v1/resolve/main/Llama-160M-Chat-v1.Q8_0.shard-00001-of-00007.gguf",
    introduction:
      "<|im_start|>system\nYou are a highly knowledgeable and friendly assistant. Your goal is to understand and respond to user inquiries with clarity.<|im_end|>\n",
    userPrefix: "<|im_start|>user\n",
    userSuffix: "<|im_end|>\n",
    assistantPrefix: "<|im_start|>assistant\n",
    assistantSuffix: "<|im_end|>\n",
    stopStrings: ["<|im_start|>", "<|im_end|>"],
    cacheType: "f16",
    contextSize: 2048,
    sampling: commonSamplingConfig,
  },
  desktopDefault: {
    url: "https://huggingface.co/Felladrin/gguf-sharded-Qwen2-0.5B-Instruct/resolve/main/Qwen2-0.5B-Instruct.Q8_0.shard-00001-of-00004.gguf",
    introduction:
      "<|im_start|>system\nYou are a highly knowledgeable and friendly assistant. Your goal is to understand and respond to user inquiries with clarity.<|im_end|>\n",
    userPrefix: "<|im_start|>user\n",
    userSuffix: "<|im_end|>\n",
    assistantPrefix: "<|im_start|>assistant\n",
    assistantSuffix: "<|im_end|>\n",
    stopStrings: ["<|im_start|>", "<|im_end|>"],
    cacheType: "f16",
    contextSize: 2048,
    sampling: commonSamplingConfig,
  },
  desktopLarger: {
    url: "https://huggingface.co/Felladrin/gguf-sharded-h2o-danube2-1.8b-chat/resolve/main/h2o-danube2-1.8b-chat.Q8_0.shard-00001-of-00026.gguf",
    introduction:
      "You are a highly knowledgeable and friendly assistant. Your goal is to understand and respond to user inquiries with clarity.</s>",
    userPrefix: "<|prompt|>",
    userSuffix: "</s>",
    assistantPrefix: "<|answer|>",
    assistantSuffix: "</s>",
    stopStrings: ["<|prompt|>", "<|answer|>", "</s>"],
    cacheType: "f16",
    contextSize: 2048,
    sampling: commonSamplingConfig,
  },
};
