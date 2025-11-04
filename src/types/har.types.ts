/**
 * HAR (HTTP Archive) 1.2 Type Definitions
 * Based on: http://www.softwareishard.com/blog/har-12-spec/
 */

// Root HAR structure
export interface HAR {
  log: Log;
}

// Main log object
export interface Log {
  version: string; // Version of the HAR format (e.g., "1.2")
  creator: Creator;
  browser?: Browser;
  pages?: Page[];
  entries: Entry[];
  comment?: string;
}

// Creator and Browser info
export interface Creator {
  name: string;
  version: string;
  comment?: string;
}

export interface Browser {
  name: string;
  version: string;
  comment?: string;
}

// Page object
export interface Page {
  startedDateTime: string; // ISO 8601 format
  id: string; // Unique identifier
  title: string;
  pageTimings: PageTimings;
  comment?: string;
}

export interface PageTimings {
  onContentLoad?: number; // Time in ms
  onLoad?: number; // Time in ms
  comment?: string;
}

// Entry object - represents a single HTTP request/response
export interface Entry {
  pageref?: string; // Reference to parent page
  startedDateTime: string; // ISO 8601 format
  time: number; // Total elapsed time in ms
  request: Request;
  response: Response;
  cache: Cache;
  timings: Timings;
  serverIPAddress?: string; // HAR 1.2+
  connection?: string; // HAR 1.2+ - unique connection ID
  comment?: string;
}

// Request object
export interface Request {
  method: string; // GET, POST, etc.
  url: string;
  httpVersion: string; // e.g., "HTTP/1.1", "HTTP/2"
  cookies: Cookie[];
  headers: Header[];
  queryString: QueryString[];
  postData?: PostData;
  headersSize: number; // -1 if not available
  bodySize: number; // -1 if not available
  comment?: string;
}

// Response object
export interface Response {
  status: number; // HTTP status code
  statusText: string;
  httpVersion: string;
  cookies: Cookie[];
  headers: Header[];
  content: Content;
  redirectURL: string;
  headersSize: number; // -1 if not available
  bodySize: number; // -1 if not available
  comment?: string;
}

// Cookie object
export interface Cookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string; // ISO 8601 format
  httpOnly?: boolean;
  secure?: boolean;
  comment?: string;
}

// Header object
export interface Header {
  name: string;
  value: string;
  comment?: string;
}

// QueryString parameter
export interface QueryString {
  name: string;
  value: string;
  comment?: string;
}

// PostData object
export interface PostData {
  mimeType: string;
  params?: Param[];
  text?: string; // Mutually exclusive with params
  comment?: string;
}

// Parameter object (for postData)
export interface Param {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
  comment?: string;
}

// Content object (response content)
export interface Content {
  size: number; // Size in bytes
  compression?: number; // Number of bytes saved
  mimeType: string;
  text?: string; // Response body
  encoding?: string; // e.g., "base64"
  comment?: string;
}

// Cache object
export interface Cache {
  beforeRequest?: CacheData;
  afterRequest?: CacheData;
  comment?: string;
}

export interface CacheData {
  expires?: string; // ISO 8601 format
  lastAccess: string; // ISO 8601 format
  eTag: string;
  hitCount: number;
  comment?: string;
}

// Timings object - breakdown of request/response timing
export interface Timings {
  blocked?: number; // Time in queue, -1 if not applicable
  dns?: number; // DNS resolution time, -1 if not applicable
  connect?: number; // TCP connection time, -1 if not applicable
  send: number; // Time to send request
  wait: number; // Waiting for response (TTFB)
  receive: number; // Time to receive response
  ssl?: number; // SSL/TLS time, -1 if not applicable (included in connect)
  comment?: string;
}

// Utility types for filtering and analysis
export type ResourceType =
  | 'html'
  | 'css'
  | 'javascript'
  | 'image'
  | 'font'
  | 'xhr'
  | 'fetch'
  | 'websocket'
  | 'media'
  | 'manifest'
  | 'other';

export type StatusCodeRange = '2xx' | '3xx' | '4xx' | '5xx' | 'all';

export interface EntryWithMetadata extends Entry {
  resourceType: ResourceType;
  domain: string;
  fileName: string;
  index: number;
}

export interface FilterOptions {
  statusCodes: StatusCodeRange[];
  resourceTypes: ResourceType[];
  domains: string[];
  searchTerm: string;
}

export interface SummaryStats {
  totalRequests: number;
  totalSize: number;
  totalCompressedSize: number;
  totalTime: number;
  dnsTime: number;
  connectTime: number;
  sslTime: number;
  sendTime: number;
  waitTime: number;
  receiveTime: number;
  blockedTime: number;
  requestsByType: Record<ResourceType, number>;
  requestsByStatus: Record<number, number>;
  domains: string[];
}
