/**
 * Deserialize a JSON response body when one is present.
 *
 * Returns `null` when the response is empty or not JSON.
 *
 * @param response - Fetch response to inspect and parse.
 * @returns Parsed JSON payload, or `null` when no JSON body is present.
 * @public
 */
export async function deserializeResponseBody(
  response: Response,
): Promise<unknown> {
  if (!isDeserializableResponse(response)) {
    return null;
  }
  return response.json();
}

/**
 * Determine whether a response is likely to contain a JSON body.
 *
 * Uses status codes, `content-length`, and `content-type` to avoid
 * JSON parsing on empty/non-JSON responses.
 *
 * @param response - Fetch response to inspect.
 * @returns `true` when it is reasonable to attempt JSON deserialization.
 * @public
 */
export function isDeserializableResponse(response: Response): boolean {
  // No response provided
  if (!response) return false;

  // No content responses
  if (
    response.status === 204 ||
    response.status === 205 ||
    response.status === 304
  ) {
    return false;
  }

  // Empty body by content-length
  const contentLength = response.headers?.get("content-length");
  if (contentLength !== null) {
    const length = Number(contentLength);
    if (!Number.isNaN(length) && length === 0) {
      return false;
    }
  }

  // Check content-type for JSON
  const contentType = response.headers?.get("content-type");
  if (!contentType) return false;

  return contentType.toLowerCase().includes("json");
}
