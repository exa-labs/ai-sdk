/**
 * Text content options
 */
export interface TextOptions {
  /** Maximum characters for the text content */
  maxCharacters?: number;
  /** Include HTML tags in the response */
  includeHtmlTags?: boolean;
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
  /** Number of sentences to return for each snippet */
  numSentences?: number;
  /** Number of snippets to return for each result */
  highlightsPerUrl?: number;
  /** Custom query to direct the LLM's selection of highlights */
  query?: string;
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
  /** Livecrawl mode (default: "fallback"): "never", "fallback", "always", "preferred" */
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
export interface ExaSearchConfig {
  /**
   * Your Exa API key. Get one at https://dashboard.exa.ai/api-keys
   * Defaults to process.env.EXA_API_KEY
   */
  apiKey?: string;

  /**
   * Base URL of the Exa API, e.g. "https://api.eu.exa.ai" for EU data residency.
   * Defaults to process.env.EXA_BASE_URL, then "https://api.exa.ai"
   */
  baseURL?: string;
  
  /**
   * Search type (default: "auto")
   * - auto: Best search, intelligently combines keyword and neural
   * - keyword: Fast keyword search
   * - neural: Deep semantic search
   * - fast: Streamlined versions of neural and keyword
   * - deep: Comprehensive deep search with enhanced analysis
   */
  type?: "auto" | "keyword" | "neural" | "fast" | "deep";
  
  /**
   * Category to focus the search on
   */
  category?: "company" | "research paper" | "news" | "pdf" | "github" | "personal site" | "linkedin profile" | "financial report";
  
  /**
   * Two-letter ISO country code for localized results (e.g., "US")
   */
  userLocation?: string;
  
  /**
   * Number of results to return (default: 8)
   * Keyword max: 10, Neural max: 100
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
 * API response from Exa search endpoint
 * This includes the full response with all metadata for maximum flexibility
 */
export interface ExaApiResponse {
  /** Unique request ID */
  requestId?: string;
  /** The search type that was ultimately used */
  resolvedSearchType?: "neural" | "keyword" | "fast" | "deep";
  /** Array of search results */
  results: ExaSearchResult[];
  /** Detailed request tags and metadata */
  requestTags?: Record<string, any>;
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
  [key: string]: any;
}

