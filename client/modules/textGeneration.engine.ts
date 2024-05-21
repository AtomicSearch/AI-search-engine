import { stripHtmlTags } from "./../../utils/strip-tags";
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
  getNumberOfThreadsSetting,
} from "./pubSub";
import { SearchResults, search } from "./search";
import { query, debug } from "./urlParams";
import toast from "react-hot-toast";
import { isRunningOnMobile } from "./mobileDetection";
import { messages } from "./en.messages.constants";
import { I18n, Model, Search } from "../../config/appInfo.config";
import { Millisecond } from "../constants/time.constant";

export namespace Engine {
  export async function prepareTextGeneration() {
    if (query === null) {
      // TODO If nothing returned - Look automatically with different keywords for the user
      return;
    }

    document.title = stripHtmlTags(query);

    updatePrompt(query);

    const searchPromise = getSearchPromise(query);

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
            await generateTextWithWebLlm(searchPromise);
          } catch (error) {
            await generateTextWithRatchet(searchPromise);
          }
        } else {
          try {
            await generateTextWithRatchet(searchPromise);
          } catch (error) {
            await generateTextWithWebLlm(searchPromise);
          }
        }
      } catch (error) {
        await generateTextWithWllama(searchPromise);
      }
    } catch (error) {
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

  async function generateTextWithWebLlm(searchPromise: Promise<void>) {
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
      await searchPromise;

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

  async function generateTextWithWllama(searchPromise: Promise<void>) {
    const { initializeWllama, availableModels } = await import("./wllama");

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

    const wllama = await initializeWllama(selectedModel.url, {
      wllama: {
        suppressNativeLog: !debug,
      },
      model: {
        n_ctx: 2 * 1024,
        n_threads: getNumberOfThreadsSetting(),
        cache_type_k: "q4_0",
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
      await searchPromise;

      updateLoadingToast(messages.generatingResponse);

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

      let isAnswering = false;

      const completion = await wllama.createCompletion(prompt, {
        nPredict: 768,
        sampling: selectedModel.sampling,
        onNewToken: (_token, _piece, currentText, { abortSignal }) => {
          if (!isAnswering) {
            isAnswering = true;
            updateLoadingToast(messages.givingAnswer);
          }

          updateResponse(currentText);

          if (currentText.includes(selectedModel.messageSuffix.trim())) {
            abortSignal();
          }
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

        const completion = await wllama.createCompletion(prompt, {
          nPredict: 128,
          sampling: selectedModel.sampling,
          onNewToken: (_token, _piece, currentText, { abortSignal }) => {
            updateUrlsDescriptions({
              ...getUrlsDescriptions(),
              [url]: `This link is about ${currentText}`,
            });

            if (currentText.includes(selectedModel.messageSuffix.trim())) {
              abortSignal();
            }
          },
        });

        updateUrlsDescriptions({
          ...getUrlsDescriptions(),
          [url]: `This link is about ${completion.replace(selectedModel.messageSuffix.trim(), "")}`,
        });
      }
    }

    await wllama.exit();
  }

  async function generateTextWithRatchet(searchPromise: Promise<void>) {
    const { initializeRatchet, runCompletion, exitRatchet } = await import(
      "./ratchet"
    );

    await initializeRatchet((loadingProgressPercentage) =>
      updateLoadingToast(`Loading: ${Math.floor(loadingProgressPercentage)}%`),
    );

    if (!getDisableAiResponseSetting()) {
      await searchPromise;

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
        maxLength: Search.SUMMARIZE_LINKS_LIMIT_LENGTH as number,
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

  async function getSearchPromise(query: string) {
    toast.loading("Searching the web...", {
      id: "search-progress-toast",
      position: "bottom-center",
    });

    let searchResults = await search(
      query.length > 2000 ? (await getKeywords(query, 20)).join(" ") : query,
      30,
    );

    if (searchResults.length === 0) {
      const queryKeywords = await getKeywords(query, 10);

      searchResults = await search(queryKeywords.join(" "), 30);
    }

    if (searchResults.length === 0) {
      toast(
        "It looks like your current search did not return any results. Try refining your search by adding more keywords or rephrasing your query.",
        {
          position: "bottom-center",
          duration: 10000,
          icon: "💡",
        },
      );
    }

    toast.dismiss("search-progress-toast");

    updateSearchResults(searchResults);

    updateUrlsDescriptions(
      searchResults.reduce(
        (acc, [, snippet, url]) => ({ ...acc, [url]: snippet }),
        {},
      ),
    );
  }
}
