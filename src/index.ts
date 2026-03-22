import { tool } from "ai";
import { z } from "zod";
import type { ExaSearchConfig } from "./types";
import packageJson from "../package.json" with { type: "json" };

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

export function webSearch(config: ExaSearchConfig = {}) {
  const {
    apiKey = process.env.EXA_API_KEY,
    ...searchOptions
  } = config;

  return tool({
    description: "Search the web for code docs, current information, news, articles, and content. Use this when you need up-to-date information or facts from the internet. Performs real-time web searches and can scrape content from specific URLs.",
    inputSchema: z.object({
      query: z.string().min(1).max(500).describe("The web search query - be specific and clear about what you're looking for"),
    }),
    execute: async ({ query }) => {
      if (!apiKey) {
        throw new Error("EXA_API_KEY is required. Set it in environment variables or pass it in config.");
      }

      // Build the request body matching Exa API structure
      const requestBody: any = {
        query,
        type: searchOptions.type || "auto",
        numResults: searchOptions.numResults || 10,
      };

      // Add optional search parameters
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

      // Build contents object with defaults
      // Defaults: text with 1000 chars, livecrawl: "fallback"
      const contents = searchOptions.contents || {};
      requestBody.contents = {};

      // Handle text content
      if (contents.text !== undefined) {
        if (typeof contents.text === "boolean") {
          requestBody.contents.text = contents.text;
        } else {
          requestBody.contents.text = contents.text;
        }
      } else {
        // Default: get text with 3000 characters
        requestBody.contents.text = { maxCharacters: 3000 };
      }

      // Add other content options
      if (contents.highlights !== undefined) {
        requestBody.contents.highlights = contents.highlights;
      }
      if (contents.summary !== undefined) {
        requestBody.contents.summary = contents.summary;
      }
      // Set livecrawl (default: "fallback")
      requestBody.contents.livecrawl = contents.livecrawl || "fallback";
      if (contents.livecrawlTimeout) {
        requestBody.contents.livecrawlTimeout = contents.livecrawlTimeout;
      }
      if (contents.subpages !== undefined) {
        requestBody.contents.subpages = contents.subpages;
      }
      if (contents.subpageTarget) {
        requestBody.contents.subpageTarget = contents.subpageTarget;
      }
      if (contents.extras) {
        requestBody.contents.extras = contents.extras;
      }

      // Call Exa API
      try {
        const response = await fetch("https://api.exa.ai/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "x-exa-integration": "vercel-ai-sdk",
            "User-Agent": `exa-vercel-ai-sdk ${packageJson.version}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Exa API error: ${response.status} - ${errorText}`);
        }

        // Return the full API response for maximum flexibility and future-proofing
        const data = await response.json();
        return data;
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
  ExaSearchConfig, 
  ExaSearchResult,
  ContentsOptions,
  TextOptions,
  HighlightsOptions,
  SummaryOptions,
  ExtrasOptions,
} from "./types";

