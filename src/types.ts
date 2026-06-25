/**
 * JSON Schema used by Exa structured output.
 */
export type JsonSchema = Record<string, unknown>;

/**
 * Current Exa search modes.
 */
export type CurrentExaSearchType =
  | "auto"
  | "fast"
  | "instant"
  | "deep-lite"
  | "deep"
  | "deep-reasoning";

/**
 * Legacy search modes accepted for backwards compatibility.
 */
export type LegacyExaSearchType = "keyword" | "neural";

export type ExaSearchType = CurrentExaSearchType | LegacyExaSearchType;

/**
 * Current documented Exa search categories.
 */
export type CurrentExaSearchCategory =
  | "company"
  | "people"
  | "research paper"
  | "news"
  | "personal site"
  | "financial report";

/**
 * Legacy categories accepted for backwards compatibility.
 */
export type LegacyExaSearchCategory =
  | "pdf"
  | "github"
  | "linkedin profile";

export type ExaSearchCategory =
  | CurrentExaSearchCategory
  | LegacyExaSearchCategory;

export type ExaTextSection =
  | "header"
  | "navigation"
  | "banner"
  | "body"
  | "sidebar"
  | "footer"
  | "metadata";

/**
 * Text content options
 */
export interface TextOptions {
  /** Maximum characters for the text content */
  maxCharacters?: number;
  /** Include HTML tags in the response */
  includeHtmlTags?: boolean;
  /** Text detail level */
  verbosity?: "compact" | "standard" | "full";
  /** Sections to include in extracted text */
  includeSections?: ExaTextSection[];
  /** Sections to exclude from extracted text */
  excludeSections?: ExaTextSection[];
}

/**
 * Summary options
 */
export interface SummaryOptions {
  /** Custom query for the summary */
  query?: string;
}

/**
 * Highlights options - text snippets the LLM identifies as most relevant from each page
 */
export interface HighlightsOptions {
  /** Maximum characters for each highlight */
  maxCharacters?: number;
  /** Custom query to direct the LLM's selection of highlights */
  query?: string;
  /** @deprecated Prefer maxCharacters for fixed budgets. */
  numSentences?: number;
  /** @deprecated Prefer maxCharacters for fixed budgets. */
  highlightsPerUrl?: number;
}

/**
 * Extras options
 */
export interface ExtrasOptions {
  /** Number of links to return from each page */
  links?: number;
  /** Number of image links to return */
  imageLinks?: number;
}

/**
 * Contents configuration - controls what content to retrieve from search results
 */
export interface ContentsOptions {
  /** Get page text content. Pass true or an object with options (default: {maxCharacters: 1000}) */
  text?: boolean | TextOptions;
  /** Get text snippets the LLM identifies as most relevant from each page */
  highlights?: boolean | HighlightsOptions;
  /** Get AI-generated summary */
  summary?: boolean | SummaryOptions;
  /** Freshness control in hours. Use 0 to force live crawl or -1 for cache-only. */
  maxAgeHours?: number;
  /** @deprecated Prefer maxAgeHours for new integrations. */
  livecrawl?: "never" | "fallback" | "always" | "preferred";
  /** Livecrawl timeout in milliseconds */
  livecrawlTimeout?: number;
  /** Number of subpages to crawl */
  subpages?: number;
  /** Keyword to find specific subpages */
  subpageTarget?: string | string[];
  /** Extra content to retrieve */
  extras?: ExtrasOptions;
}

/**
 * Main search configuration
 */
export interface ExaSearchConfig<TOutput = unknown> {
  /**
   * Your Exa API key. Get one at https://dashboard.exa.ai/api-keys
   * Defaults to process.env.EXA_API_KEY
   */
  apiKey?: string;
  
  /**
   * Search type (default: "auto")
   * - auto: General default
   * - fast: Low-latency apps
   * - instant: Lowest-latency path
   * - deep-lite: Lightweight synthesized output
   * - deep: Multi-step synthesis
   * - deep-reasoning: Hardest research tasks
   * - keyword/neural: Legacy aliases kept for backwards compatibility
   */
  type?: ExaSearchType;
  
  /**
   * Category to focus the search on
   */
  category?: ExaSearchCategory;
  
  /**
   * Two-letter ISO country code for localized results (e.g., "US")
   */
  userLocation?: string;
  
  /**
   * Number of results to return (default: 10)
   */
  numResults?: number;
  
  /**
   * List of domains to include (e.g., ["arxiv.org", "github.com"])
   */
  includeDomains?: string[];
  
  /**
   * List of domains to exclude
   */
  excludeDomains?: string[];
  
  /**
   * Return results crawled after this date (ISO 8601 format)
   */
  startCrawlDate?: string;
  
  /**
   * Return results crawled before this date (ISO 8601 format)
   */
  endCrawlDate?: string;
  
  /**
   * Return results published after this date (ISO 8601 format)
   */
  startPublishedDate?: string;
  
  /**
   * Return results published before this date (ISO 8601 format)
   */
  endPublishedDate?: string;
  
  /**
   * Text that must be present in results (max 1 string, up to 5 words)
   */
  includeText?: string[];
  
  /**
   * Text that must not be present in results (max 1 string, up to 5 words)
   */
  excludeText?: string[];

  /**
   * Instructions for synthesized output and deep-search planning
   */
  systemPrompt?: string;

  /**
   * JSON Schema for structured output returned in output.content
   */
  outputSchema?: JsonSchema;
  
  /**
   * Contents options - what to retrieve from each result
   */
  contents?: ContentsOptions;
}

/**
 * Search result returned from Exa
 */
export interface ExaSearchResult {
  /** Title of the page */
  title: string;
  /** URL of the page */
  url: string;
  /** Unique ID for the result */
  id?: string;
  /** Published date (ISO 8601 format) */
  publishedDate?: string;
  /** Author of the content */
  author?: string;
  /** URL of an image associated with the result */
  image?: string;
  /** URL of the favicon */
  favicon?: string;
  /** Full text content of the page */
  text?: string;
  /** Array of highlights extracted from the search result content */
  highlights?: string[];
  /** Array of cosine similarity scores for each highlight */
  highlightScores?: number[];
  /** AI-generated summary */
  summary?: string;
  /** Array of subpages */
  subpages?: ExaSearchResult[];
  /** Extra content (links, images) */
  extras?: {
    links?: string[];
    imageLinks?: string[];
  };
}

/**
 * Structured output returned when outputSchema or synthesis options are used
 */
export interface ExaSearchOutput<TContent = unknown> {
  /** Structured or synthesized content returned by Exa */
  content: TContent;
  /** Grounding/citation metadata for the generated output */
  grounding?: Array<Record<string, unknown>>;
  /** Any additional output metadata from the API */
  [key: string]: unknown;
}

/**
 * API response from Exa search endpoint
 * This includes the full response with all metadata for maximum flexibility
 */
export interface ExaApiResponse<TOutput = unknown> {
  /** Unique request ID */
  requestId?: string;
  /** The search type that was ultimately used */
  resolvedSearchType?: string;
  /** Array of search results */
  results: ExaSearchResult[];
  /** Structured or synthesized output */
  output?: ExaSearchOutput<TOutput>;
  /** Detailed request tags and metadata */
  requestTags?: Record<string, unknown>;
  /** Filters that were applied to the search */
  effectiveFilters?: {
    includeDomains?: string[];
    excludeDomains?: string[];
    includeUrls?: string[];
    excludeUrls?: string[];
    includeText?: string[];
    excludeText?: string[];
  };
  /** Total search time in milliseconds */
  searchTime?: number;
  /** Cost breakdown for the request */
  costDollars?: {
    total?: number;
    search?: Record<string, number>;
    contents?: Record<string, number>;
  };
  /** Any additional fields from the API */
  [key: string]: unknown;
}
