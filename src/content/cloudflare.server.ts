// The live site's storage on Cloudflare: the D1 database (saved content, added admins) and
// the R2 bucket (uploaded photos and videos). Both are bindings set in wrangler.jsonc; the
// Worker receives them with each request, and nitro keeps them on globalThis.__env__.
//
// Only the few calls this site uses are typed here.

export interface D1Result<T> {
  results: T[];
}
export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<unknown[]>;
}

export interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}
export interface R2Object {
  size: number;
  etag: string;
  httpEtag: string;
  range?: R2Range;
  httpMetadata?: { contentType?: string };
}
export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
}
export interface R2Bucket {
  get(
    key: string,
    options?: { range?: R2Range | Headers; onlyIf?: Headers },
  ): Promise<R2ObjectBody | R2Object | null>;
  head(key: string): Promise<R2Object | null>;
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream | Blob,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<R2Object | null>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    objects: { key: string; uploaded: Date }[];
    truncated: boolean;
    cursor?: string;
  }>;
}

interface CloudflareEnv {
  DB?: D1Database;
  UPLOADS?: R2Bucket;
}

const env = (): CloudflareEnv =>
  ((globalThis as { __env__?: CloudflareEnv }).__env__ ?? {}) as CloudflareEnv;

/** The content database, or null when it isn't connected (local development, or not set up). */
export const database = () => env().DB ?? null;

/** The uploads bucket, or null when it isn't connected. */
export const uploadsBucket = () => env().UPLOADS ?? null;
