/**
 * fetch() that rejects on non-2xx responses so callers never store an API
 * error body (e.g. `{ error: "Unauthorized" }`) as if it were data.
 */
export class HttpError extends Error {
  constructor(public readonly status: number, public readonly url: string) {
    super(`${status} from ${url}`);
    this.name = "HttpError";
  }
}

export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new HttpError(res.status, url);
  return (await res.json()) as T;
}
