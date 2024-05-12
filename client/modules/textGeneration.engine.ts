import { isWebGPUAvailable } from "./webGpu";
import {
  updatePrompt,
  updateSearchResults,
  getDisableAiResponseSetting,
  getSummarizeLinksSetting,
  getUseLargerModelSetting,
  updateResponse,
  getSearchResults,
  updateUrlsDescriptions,
  getUrlsDescriptions,
  getDisableWebGpuUsageSetting,
} from "./pubSub";
import { SearchResults, search } from "./search";
import { query, debug } from "./urlParams";
import toast from "react-hot-toast";
import { isRunningOnMobile } from "./mobileDetection";
import { messages } from "./messages.constants";
import { I18n, Model, Search } from "../constants/appInfo.constant";
import { Millisecond } from "../constants/time.constant";

export namespace Engine {
  export async function prepareTextGeneration() {
    if (query === null) return;

    document.title = query;

    updatePrompt(query);

    updateLoadingToast(messages.browseInternet);

    let searchResults = await search(
      query.length > Search.SEARCH_QUERY_LIMIT_LENGTH
        ? (await getKeywords(query, 20)).join(" ")
        : query,
      30,
    );

    if (searchResults.length === 0) {
      const queryKeywords = await getKeywords(query, 10);
      searchResults = await search(queryKeywords.join(" "), 30);
    }

    if (searchResults.length === 0) {
      toast(messages.researchReturnedNothing, {
        position: "bottom-center",
        duration: Millisecond.TWO_SECOND,
        icon: "🔎",
      });
    }

    updateSearchResults(searchResults);

    updateUrlsDescriptions(
      searchResults.reduce(
        (acc, [, snippet, url]) => ({ ...acc, [url]: snippet }),
        {},
      ),
    );

    dismissLoadingToast();

    if (getDisableAiResponseSetting() && !getSummarizeLinksSetting()) return;

    if (debug) console.time("Response Generation Time");

    updateLoadingToast(messages.loadingAiModel);

    try {
      try {
        if (!isWebGPUAvailable) {
          throw Error("WebGPU is not available.");
        }

        if (getDisableWebGpuUsageSetting()) throw Error("WebGPU is disabled.");

        if (getUseLargerModelSetting()) {
          try {
            await generateTextWithWebLlm();
          } catch (error) {
            await generateTextWithRatchet();
          }
        } else {
          try {
            await generateTextWithRatchet();
          } catch (error) {
            await generateTextWithWebLlm();
          }
        }
      } catch (error) {
        try {
          await generateTextWithWllama();
        } catch (error) {
          await generateTextWithWllama({ forceSingleThread: true });
        }
        await generateTextWithWllama();
      }
    } catch (error) {
      console.error("Error while generating response with wllama:", error);

      toast(messages.cannotGenerateResponse, {
        position: "bottom-right",
        duration: Millisecond.THREE_SECOND,
        icon: "♨️",
      });
    } finally {
      dismissLoadingToast();
    }

    if (debug) {
      console.timeEnd("Response Generation Time");
    }
  }

  function updateLoadingToast(text: string) {
    toast.loading(text, {
      id: "text-generation-loading-toast",
      position: "bottom-center",
    });
  }

  function dismissLoadingToast() {
    toast.dismiss("text-generation-loading-toast");
  }

  async function generateTextWithWebLlm() {
    const { CreateWebWorkerEngine, CreateEngine, hasModelInCache } =
      await import("@mlc-ai/web-llm");

    const selectedModel = getUseLargerModelSetting()
      ? Model.LLAMA
      : Model.GEMMA;

    const isModelCached = await hasModelInCache(selectedModel);

    let initProgressCallback:
      | import("@mlc-ai/web-llm").InitProgressCallback
      | undefined;

    if (isModelCached) {
      updateLoadingToast(messages.generatingResponse);
    } else {
      initProgressCallback = (report) => {
        updateLoadingToast(
          `Loading: ${report.text.replaceAll("[", "(").replaceAll("]", ")")}`,
        );
      };
    }

    const engine = Worker
      ? await CreateWebWorkerEngine(
          new Worker(new URL("./webLlmWorker.ts", import.meta.url), {
            type: "module",
          }),
          selectedModel,
          { initProgressCallback },
        )
      : await CreateEngine(selectedModel, { initProgressCallback });

    if (!getDisableAiResponseSetting()) {
      updateLoadingToast(messages.generatingResponse);

      let isAnswering = false;

      const completion = await engine.chat.completions.create({
        stream: true,
        messages: [{ role: "user", content: getMainPrompt() }],
        max_gen_len: 768,
      });

      let streamedMessage = "";

      for await (const chunk of completion) {
        const deltaContent = chunk.choices[0].delta.content;

        if (deltaContent) streamedMessage += deltaContent;

        if (!isAnswering) {
          isAnswering = true;
          updateLoadingToast(messages.givingAnswer);
        }

        updateResponse(streamedMessage);
      }
    }

    await engine.resetChat();

    if (getSummarizeLinksSetting()) {
      updateLoadingToast(messages.summarizeLinks);

      for (const [title, snippet, url] of getSearchResults()) {
        const completion = await engine.chat.completions.create({
          stream: true,
          messages: [
            {
              role: "user",
              content: await getLinkSummarizationPrompt([title, snippet, url]),
            },
          ],
          max_gen_len: 768,
        });

        let streamedMessage = "";

        for await (const chunk of completion) {
          const deltaContent = chunk.choices[0].delta.content;

          if (deltaContent) streamedMessage += deltaContent;

          updateUrlsDescriptions({
            ...getUrlsDescriptions(),
            [url]: streamedMessage,
          });
        }

        await engine.resetChat();
      }
    }

    if (debug) {
      console.info(await engine.runtimeStatsText());
    }

    engine.unload();
  }

  async function generateTextWithWllama(options?: {
    forceSingleThread?: boolean;
  }) {
    const { initializeWllama, runCompletion, exitWllama } = await import(
      "./wllama"
    );

    const commonSamplingConfig: import("@wllama/wllama").SamplingConfig = {
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

    const availableModels: {
      [key in
        | "mobileDefault"
        | "mobileLarger"
        | "desktopDefault"
        | "desktopLarger"]: {
        url: string | string[];
        userPrefix: string;
        assistantPrefix: string;
        messageSuffix: string;
        sampling: import("@wllama/wllama").SamplingConfig;
      };
    } = {
      mobileDefault: {
        url: Array.from(
          { length: 7 },
          (_, i) =>
            `https://huggingface.co/Felladrin/gguf-sharded-Llama-160M-Chat-v1/resolve/main/Llama-160M-Chat-v1.F16.shard-${(
              i + 1
            )
              .toString()
              .padStart(5, "0")}-of-00007.gguf`,
        ),
        userPrefix: "<|im_start|>user\n",
        assistantPrefix: "<|im_start|>assistant\n",
        messageSuffix: "<|im_end|>\n",
        sampling: commonSamplingConfig,
      },
      mobileLarger: {
        url: Array.from(
          { length: 10 },
          (_, i) =>
            `https://huggingface.co/Felladrin/gguf-sharded-TinyLlama-1.1B-1T-OpenOrca/resolve/main/tinyllama-1.1b-1t-openorca.Q3_K_S.shard-${(
              i + 1
            )
              .toString()
              .padStart(5, "0")}-of-00010.gguf`,
        ),
        userPrefix: "<|im_start|>user\n",
        assistantPrefix: "<|im_start|>assistant\n",
        messageSuffix: "<|im_end|>\n",
        sampling: commonSamplingConfig,
      },
      desktopDefault: {
        url: Array.from(
          { length: 7 },
          (_, i) =>
            `https://huggingface.co/Felladrin/gguf-sharded-stablelm-2-1_6b-chat/resolve/main/stablelm-2-1_6b-chat.Q8_0.shard-${(
              i + 1
            )
              .toString()
              .padStart(5, "0")}-of-00007.gguf`,
        ),
        userPrefix: "<|im_start|>user\n",
        assistantPrefix: "<|im_start|>assistant\n",
        messageSuffix: "<|im_end|>\n",
        sampling: commonSamplingConfig,
      },
      desktopLarger: {
        url: Array.from(
          { length: 51 },
          (_, i) =>
            `https://huggingface.co/Felladrin/gguf-sharded-Phi-3-mini-4k-instruct-iMat/resolve/main/phi-3-mini-4k-instruct-imat-Q5_K_M.shard-${(
              i + 1
            )
              .toString()
              .padStart(5, "0")}-of-00051.gguf`,
        ),
        userPrefix: "<|user|>\n",
        assistantPrefix: "<|assistant|>\n",
        messageSuffix: "<|end|>\n",
        sampling: commonSamplingConfig,
      },
    };

    const threadsToUse =
      !options?.forceSingleThread && (navigator.hardwareConcurrency ?? 1) > 1
        ? Math.max(navigator.hardwareConcurrency - 2, 2)
        : 1;

    if (threadsToUse === 1) {
      availableModels.desktopDefault = availableModels.mobileDefault;
      availableModels.desktopLarger = availableModels.mobileLarger;
      availableModels.mobileDefault = {
        url: Array.from(
          { length: 7 },
          (_, i) =>
            `https://huggingface.co/Felladrin/gguf-sharded-Llama-160M-Chat-v1/resolve/main/Llama-160M-Chat-v1.Q8_0.shard-${(
              i + 1
            )
              .toString()
              .padStart(5, "0")}-of-00007.gguf`,
        ),
        userPrefix: "<|im_start|>user\n",
        assistantPrefix: "<|im_start|>assistant\n",
        messageSuffix: "<|im_end|>\n",
        sampling: commonSamplingConfig,
      };
      availableModels.mobileLarger = {
        url: Array.from(
          { length: 7 },
          (_, i) =>
            `https://huggingface.co/Felladrin/gguf-sharded-Llama-160M-Chat-v1/resolve/main/Llama-160M-Chat-v1.F16.shard-${(
              i + 1
            )
              .toString()
              .padStart(5, "0")}-of-00007.gguf`,
        ),
        userPrefix: "<|im_start|>user\n",
        assistantPrefix: "<|im_start|>assistant\n",
        messageSuffix: "<|im_end|>\n",
        sampling: commonSamplingConfig,
      };
    }

    const defaultModel = isRunningOnMobile
      ? availableModels.mobileDefault
      : availableModels.desktopDefault;

    const largerModel = isRunningOnMobile
      ? availableModels.mobileLarger
      : availableModels.desktopLarger;

    const selectedModel = getUseLargerModelSetting()
      ? largerModel
      : defaultModel;

    let loadingPercentage = 0;

    await initializeWllama({
      modelUrl: selectedModel.url,
      modelConfig: {
        n_ctx: 2048,
        n_threads: threadsToUse,
        progressCallback: ({ loaded, total }) => {
          const progressPercentage = Math.round((loaded / total) * 100);

          if (loadingPercentage !== progressPercentage) {
            loadingPercentage = progressPercentage;

            if (loadingPercentage === 100) {
              updateLoadingToast(`AI model loaded.`);
            } else {
              updateLoadingToast(`Loading: ${loadingPercentage}%`);
            }
          }
        },
      },
    });

    if (!getDisableAiResponseSetting()) {
      const prompt = [
        selectedModel.userPrefix,
        "Hello!",
        selectedModel.messageSuffix,
        selectedModel.assistantPrefix,
        "Hi! How can I help you?",
        selectedModel.messageSuffix,
        selectedModel.userPrefix,
        ["Take a look at this info:", getFormattedSearchResults(5)].join(
          "\n\n",
        ),
        selectedModel.messageSuffix,
        selectedModel.assistantPrefix,
        "Alright!",
        selectedModel.messageSuffix,
        selectedModel.userPrefix,
        "Now I'm going to write my question, and if this info is useful you can use them in your answer. Ready?",
        selectedModel.messageSuffix,
        selectedModel.assistantPrefix,
        "I'm ready to answer!",
        selectedModel.messageSuffix,
        selectedModel.userPrefix,
        query,
        selectedModel.messageSuffix,
        selectedModel.assistantPrefix,
      ].join("");

      if (!query) throw Error("Query is empty.");

      updateLoadingToast(messages.generatingResponse);

      let isAnswering = false;

      const completion = await runCompletion({
        prompt,
        nPredict: 768,
        sampling: selectedModel.sampling,
        onNewToken: (_token, _piece, currentText) => {
          if (!isAnswering) {
            isAnswering = true;
            updateLoadingToast(messages.givingAnswer);
          }
          updateResponse(currentText);
        },
      });

      updateResponse(
        completion.replace(selectedModel.messageSuffix.trim(), ""),
      );
    }

    if (getSummarizeLinksSetting()) {
      updateLoadingToast(messages.summarizeLinks);

      for (const [title, snippet, url] of getSearchResults()) {
        const prompt = [
          selectedModel.userPrefix,
          "Hello!",
          selectedModel.messageSuffix,
          selectedModel.assistantPrefix,
          "Hi! How can I help you?",
          selectedModel.messageSuffix,
          selectedModel.userPrefix,
          ["Context:", `${title}: ${snippet}`].join("\n"),
          "\n",
          ["Question:", "What is this text about?"].join("\n"),
          selectedModel.messageSuffix,
          selectedModel.assistantPrefix,
          ["Answer:", "This text is about"].join("\n"),
        ].join("");

        const completion = await runCompletion({
          prompt,
          nPredict: 128,
          sampling: selectedModel.sampling,
          onNewToken: (_token, _piece, currentText) => {
            updateUrlsDescriptions({
              ...getUrlsDescriptions(),
              [url]: `This link is about ${currentText}`,
            });
          },
        });

        updateUrlsDescriptions({
          ...getUrlsDescriptions(),
          [url]: `This link is about ${completion.replace(selectedModel.messageSuffix.trim(), "")}`,
        });
      }
    }

    await exitWllama();
  }

  async function generateTextWithRatchet() {
    const { initializeRatchet, runCompletion, exitRatchet } = await import(
      "./ratchet"
    );

    await initializeRatchet((loadingProgressPercentage) =>
      updateLoadingToast(`Loading: ${Math.floor(loadingProgressPercentage)}%`),
    );

    if (!getDisableAiResponseSetting()) {
      if (!query) {
        throw Error("Query is empty.");
      }

      updateLoadingToast(messages.generatingResponse);

      let isAnswering = false;
      let response = "";

      await runCompletion(getMainPrompt(), (completionChunk) => {
        if (!isAnswering) {
          isAnswering = true;
          updateLoadingToast(messages.givingAnswer);
        }

        response += completionChunk;
        updateResponse(response);
      });

      if (!endsWithASign(response)) {
        response += ".";
        updateResponse(response);
      }
    }

    if (getSummarizeLinksSetting()) {
      updateLoadingToast(messages.summarizeLinks);

      for (const [title, snippet, url] of getSearchResults()) {
        let response = "";

        await runCompletion(
          await getLinkSummarizationPrompt([title, snippet, url]),
          (completionChunk) => {
            response += completionChunk;
            updateUrlsDescriptions({
              ...getUrlsDescriptions(),
              [url]: response,
            });
          },
        );

        if (!endsWithASign(response)) {
          response += ".";
          updateUrlsDescriptions({
            ...getUrlsDescriptions(),
            [url]: response,
          });
        }
      }
    }

    await exitRatchet();
  }

  async function fetchPageContent(
    url: string,
    options?: {
      maxLength?: number;
    },
  ) {
    const jinaResponse = await fetch(`https://r.jina.ai/${url}`);

    if (!jinaResponse) {
      throw new Error("No response from server");
    } else if (!jinaResponse.ok) {
      throw new Error(`HTTP error! status: ${jinaResponse.status}`);
    }

    const text = await jinaResponse.text();

    return text.trim().substring(0, options?.maxLength);
  }

  function endsWithASign(text: string) {
    return text.endsWith(".") || text.endsWith("!") || text.endsWith("?");
  }

  function getMainPrompt(): string {
    return [
      "Provide a concise response to the request below.",
      "If the information from the Web Search Results below is useful, you can use it to complement your response. Otherwise, ignore it.",
      "",
      "Web Search Results:",
      "",
      getFormattedSearchResults(5),
      "",
      "Request:",
      "",
      query,
    ].join("\n");
  }

  async function getLinkSummarizationPrompt([
    title,
    snippet,
    url,
  ]: SearchResults[0]) {
    let prompt: string;

    try {
      const pageContent = await fetchPageContent(url, {
        maxLength: Search.SUMMARIZE_LINKS_LIMIT_LENGTH,
      });

      prompt = [
        `The context below is related to a link found when searching for "${query}":`,
        "",
        "[BEGIN OF CONTEXT]",
        `Snippet: ${snippet}`,
        "",
        pageContent,
        "[END OF CONTEXT]",
        "",
        "Tell me what this link is about and how it is related to the search?",
        "",
        "Note: Don't cite the link in your response. Just write a few sentences to indicate if it's worth visiting.",
      ].join("\n");
    } catch (error) {
      prompt = [
        `When searching for "${query}", this link was found: [${title}](${url} "${snippet}")`,
        "",
        "Tell me what this link is about and how it is related to the search?",
        "",
        "Note: Don't cite the link in your response. Just write a few sentences to indicate if it's worth visiting.",
      ].join("\n");
    }

    return prompt;
  }

  function getFormattedSearchResults(limit?: number): string {
    return getSearchResults()
      .slice(0, limit)
      .map(([title, snippet, url]) => `${title}\n${url}\n${snippet}`)
      .join("\n\n");
  }

  async function getKeywords(text: string, limit?: number) {
    return (await import("keyword-extractor")).default
      .extract(text, { language: I18n.DEFAULT_LANGUAGE })
      .slice(0, limit);
  }
}