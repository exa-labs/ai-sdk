# Exa AI SDK

Exa is a Web Search API. Add Exa web search to your LLMs in a few lines of code. Works with AI SDK by Vercel.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Setup](#setup)
- [Example](#example)
- [Structured Output](#structured-output)
- [All Options](#all-options)
- [TypeScript Support](#typescript-support)
- [Links](#links)
- [License](#license)

## Installation

```bash
npm install @exalabs/ai-sdk
```

## Quick Start

```typescript
import { generateText, stepCountIs } from "ai";
import { webSearch } from "@exalabs/ai-sdk";
import { openai } from "@ai-sdk/openai";

const { text } = await generateText({
  model: openai('gpt-5-nano'),
  prompt: 'Tell me the latest developments in AI',
  system: "Only use web search once per turn. Answer based on the information you have.",
  tools: {
    webSearch: webSearch(),
  },
  stopWhen: stepCountIs(3),
});

console.log(text);
```

Get your API key from the [Exa Dashboard](https://dashboard.exa.ai/api-keys).

**Defaults when you use `webSearch()`:**
- Type: `auto` (best search)
- Results: `10`
- Text: `3000 characters per result`
- Livecrawl: `fallback` for backwards compatibility. Prefer `contents.maxAgeHours` when you need explicit freshness.

## Setup

1. Get your API key from the [Exa Dashboard](https://dashboard.exa.ai/api-keys)
2. Add it to your `.env` file:

```bash
EXA_API_KEY=your-api-key-here
```

That's it! The package reads it automatically.

## Example

Here's a focused example combining current Search settings:

```typescript
const { text } = await generateText({
  model: openai('gpt-5-nano'),
  prompt: 'Find recent AI regulation news from trusted sources',
  tools: {
    webSearch: webSearch({
      type: "fast",                           // low-latency search
      numResults: 6,                          // return up to 6 results
      category: "news",                       // focus on news
      includeDomains: ["reuters.com", "bbc.com"],
      contents: {
        highlights: { maxCharacters: 800 },   // token-efficient excerpts
        maxAgeHours: 24,                      // prefer fresh content
      },
    }),
  },
  stopWhen: stepCountIs(5),
});

console.log(text);
```

## Structured Output

Use `systemPrompt` and `outputSchema` to ask Exa for generated structured output in addition to the retrieved results:

```typescript
type CompanyFunding = {
  companies: Array<{
    name: string;
    latestRound: string;
    sourceUrl: string;
  }>;
};

const { toolResults } = await generateText({
  model: openai('gpt-5-nano'),
  prompt: 'Find recent AI company funding announcements in Europe',
  tools: {
    webSearch: webSearch<CompanyFunding>({
      type: "deep-lite",
      systemPrompt: "Prefer primary sources and include the source URL for each company.",
      outputSchema: {
        type: "object",
        properties: {
          companies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                latestRound: { type: "string" },
                sourceUrl: { type: "string" },
              },
              required: ["name", "latestRound", "sourceUrl"],
            },
          },
        },
        required: ["companies"],
      },
      contents: {
        highlights: true,
      },
    }),
  },
  stopWhen: stepCountIs(3),
});

const searchResult = toolResults[0]?.output;
const structured = searchResult?.output?.content;
```

## All Options

```typescript
webSearch({
  // Search settings
  type: "auto",           // "auto", "fast", "instant", "deep-lite", "deep", "deep-reasoning"
                          // Legacy values "keyword" and "neural" are still accepted
  category: "news",       // "company", "people", "research paper", "news",
                          // "personal site", "financial report"
                          // Legacy values "pdf", "github", "linkedin profile" are still accepted
  numResults: 10,
  
  // Filter by domain
  includeDomains: ["linkedin.com", "github.com"],
  excludeDomains: ["wikipedia.com"],
  
  // Filter by date (ISO 8601)
  startPublishedDate: "2025-01-01T00:00:00.000Z",
  endPublishedDate: "2025-12-31T23:59:59.999Z",
  startCrawlDate: "2025-01-01T00:00:00.000Z",
  endCrawlDate: "2025-12-31T23:59:59.999Z",
  
  // Filter by text
  includeText: ["AI"],    // Must contain
  excludeText: ["spam"],  // Must not contain
  
  // Location
  userLocation: "US",     // Two-letter country code

  // Structured output
  systemPrompt: "Prefer primary sources.",
  outputSchema: {
    type: "object",
    properties: {
      answer: { type: "string" },
      sourceUrls: { type: "array", items: { type: "string" } },
    },
    required: ["answer", "sourceUrls"],
  },
  
  // Content options
  contents: {
    // Pick one of text, highlights, or summary by default; all are shown here for reference.
    text: {
      maxCharacters: 1000,
      includeHtmlTags: false,
      verbosity: "standard",
      includeSections: ["body"],
    },
    highlights: {
      maxCharacters: 800,
    },
    summary: {
      query: "Main points",
    },
    maxAgeHours: 24,           // Preferred freshness control
    livecrawl: "fallback",     // Legacy: "never", "fallback", "always", "preferred"
    livecrawlTimeout: 10000,
    subpages: 5,
    subpageTarget: "about",
    extras: {
      links: 5,
      imageLinks: 3,
    },
  },
})
```

## TypeScript Support

Full TypeScript types included, including typed structured output:

```typescript
import { webSearch, ExaSearchConfig, ExaSearchResult } from "@exalabs/ai-sdk";

type ResearchOutput = { answer: string; sourceUrls: string[] };

const config: ExaSearchConfig<ResearchOutput> = {
  numResults: 10,
  type: "deep-lite",
};

const search = webSearch<ResearchOutput>(config);
```

## Links

- [GitHub Repository](https://github.com/exa-labs/ai-sdk) - View source code of this npm package
- [Try npm Package](https://www.npmjs.com/package/@exalabs/ai-sdk) - View on npm
- [Vercel AI SDK Cookbook](https://ai-sdk.dev/cookbook/node/web-search-agent#exa) - Web search agent example featuring Exa
- [API Dashboard](https://dashboard.exa.ai) - Try Exa API on the dashboard
- [Get your API Keys](https://dashboard.exa.ai/api-keys) - Get your API keys
- [Documentation](https://exa.ai/docs) - Exa API documentation
- [Exa Website](https://exa.ai) - Learn more about Exa

## License

MIT
