import { tool } from "ai";
import { z } from "zod";
import type { ContentsOptions, ExaApiResponse, ExaSearchConfig } from "./types";

declare const __PKG_VERSION__: string;

/**
 * Creates a web search tool powered by Exa for use with Vercel AI SDK
 * 
 * @param config - Configuration options for the Exa search
 * @returns A tool that can be used with AI SDK's generateText, streamText, etc.
 * 
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { webSearch } from "@exalabs/ai-sdk";
 * import { openai } from "@ai-sdk/openai";
 * 
 * // Just set EXA_API_KEY in .env, then:
 * const { text } = await generateText({
 *   model: openai('gpt-4o-mini'),
 *   prompt: 'What happened in San Francisco last week?',
 *   tools: {
 *     webSearch: webSearch({ numResults: 5 }),
 *   },
 * });
 * ```
 */

export function webSearch<TOutput = unknown>(
  config: ExaSearchConfig<TOutput> = {},
) {
  const {
    apiKey = process.env.EXA_API_KEY,
    ...searchOptions
  } = config;

  return tool({
    description: "Search the web for code docs, current information, news, articles, and content. Use this when you need up-to-date information or facts from the internet. Performs real-time web searches and can scrape content from specific URLs.",
    inputSchema: z.object({
      query: z.string().min(1).max(500).describe("The web search query - be specific and clear about what you're looking for"),
    }),
    execute: async ({ query }): Promise<ExaApiResponse<TOutput>> => {
      if (!apiKey) {
        throw new Error("EXA_API_KEY is required. Set it in environment variables or pass it in config.");
      }

      const requestBody: Record<string, unknown> = {
        query,
        type: searchOptions.type || "auto",
        numResults: searchOptions.numResults ?? 10,
      };

      if (searchOptions.category) {
        requestBody.category = searchOptions.category;
      }
      if (searchOptions.userLocation) {
        requestBody.userLocation = searchOptions.userLocation;
      }
      if (searchOptions.includeDomains && searchOptions.includeDomains.length > 0) {
        requestBody.includeDomains = searchOptions.includeDomains;
      }
      if (searchOptions.excludeDomains && searchOptions.excludeDomains.length > 0) {
        requestBody.excludeDomains = searchOptions.excludeDomains;
      }
      if (searchOptions.startCrawlDate) {
        requestBody.startCrawlDate = searchOptions.startCrawlDate;
      }
      if (searchOptions.endCrawlDate) {
        requestBody.endCrawlDate = searchOptions.endCrawlDate;
      }
      if (searchOptions.startPublishedDate) {
        requestBody.startPublishedDate = searchOptions.startPublishedDate;
      }
      if (searchOptions.endPublishedDate) {
        requestBody.endPublishedDate = searchOptions.endPublishedDate;
      }
      if (searchOptions.includeText && searchOptions.includeText.length > 0) {
        requestBody.includeText = searchOptions.includeText;
      }
      if (searchOptions.excludeText && searchOptions.excludeText.length > 0) {
        requestBody.excludeText = searchOptions.excludeText;
      }
      if (searchOptions.systemPrompt) {
        requestBody.systemPrompt = searchOptions.systemPrompt;
      }
      if (searchOptions.outputSchema) {
        requestBody.outputSchema = searchOptions.outputSchema;
      }

      const contents: ContentsOptions = searchOptions.contents || {};
      const requestContents: Record<string, unknown> = {};
      requestBody.contents = requestContents;
      const hasContentExtraction =
        contents.text !== undefined ||
        contents.highlights !== undefined ||
        contents.summary !== undefined;

      if (contents.text !== undefined) {
        requestContents.text = contents.text;
      } else if (!hasContentExtraction) {
        requestContents.text = { maxCharacters: 3000 };
      }

      if (contents.highlights !== undefined) {
        requestContents.highlights = contents.highlights;
      }
      if (contents.summary !== undefined) {
        requestContents.summary = contents.summary;
      }
      if (contents.maxAgeHours !== undefined) {
        requestContents.maxAgeHours = contents.maxAgeHours;
      }
      if (contents.livecrawl !== undefined) {
        requestContents.livecrawl = contents.livecrawl;
      } else if (contents.maxAgeHours === undefined) {
        requestContents.livecrawl = "fallback";
      }
      if (contents.livecrawlTimeout !== undefined) {
        requestContents.livecrawlTimeout = contents.livecrawlTimeout;
      }
      if (contents.subpages !== undefined) {
        requestContents.subpages = contents.subpages;
      }
      if (contents.subpageTarget !== undefined) {
        requestContents.subpageTarget = contents.subpageTarget;
      }
      if (contents.extras !== undefined) {
        requestContents.extras = contents.extras;
      }

      if (Object.keys(requestContents).length === 0) {
        delete requestBody.contents;
      }

      try {
        const response = await fetch("https://api.exa.ai/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "x-exa-integration": "vercel-ai-sdk",
            "User-Agent": `exa-vercel-ai-sdk ${__PKG_VERSION__}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Exa API error: ${response.status} - ${errorText}`);
        }

        return await response.json() as ExaApiResponse<TOutput>;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to search with Exa: ${error.message}`);
        }
        throw error;
      }
    },
  });
}

// Export types for users
export type {
  ContentsOptions,
  CurrentExaSearchCategory,
  CurrentExaSearchType,
  ExaApiResponse,
  ExaSearchCategory,
  ExaSearchConfig,
  ExaSearchOutput,
  ExaSearchResult,
  ExaSearchType,
  ExaTextSection,
  ExtrasOptions,
  HighlightsOptions,
  JsonSchema,
  LegacyExaSearchCategory,
  LegacyExaSearchType,
  SummaryOptions,
  TextOptions,
} from "./types";
