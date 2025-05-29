import type { LanguageDTO, PaginatedListDTO, TextDTO } from "@/types";

// Determine if we're running in a browser or on the server
const isBrowser = typeof window !== "undefined";

// Base URL handling for both client and server environments
function getBaseUrl() {
  if (isBrowser) {
    // In browser, use relative URL
    return "/api";
  } else {
    // In server (SSR), use the current site URL
    // For Netlify, use the site URL from environment or build the correct URL
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || "https://teachme.mankowski.es";
    return `${siteUrl}/api`;
  }
}

// Helper to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to parse error response, provide fallback message
    let errorData: { message?: string } = {};
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `Invalid error response from server ${String(e)}` };
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle successful responses that might not have content (e.g., 204)
  if (response.status === 204) {
    return undefined as T; // Or appropriate value for void/no content responses
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches the list of available languages.
 */
export async function fetchLanguages(): Promise<LanguageDTO[]> {
  const response = await fetch(`${getBaseUrl()}/languages`);
  // The API is expected to return LanguageDTO[] directly based on plan
  return handleResponse<LanguageDTO[]>(response);
}

/**
 * Fetches a paginated list of texts, optionally filtered by language.
 * Filters implicitly based on logged-in user (private + public).
 */
export async function fetchTexts(
  limit: number,
  offset: number,
  languageId: string | null
): Promise<PaginatedListDTO<TextDTO>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (languageId) {
    params.append("language_id", languageId);
  }

  const exercisesURL = `${getBaseUrl()}/exercises?${params.toString()}`;
  // Ensure fetch uses credentials to send session cookies if needed
  const response = await fetch(exercisesURL, {
    credentials: "include", // Important for session-based auth
  });
  return handleResponse<PaginatedListDTO<TextDTO>>(response);
}

/**
 * Deletes a specific text exercise by its ID.
 * Requires authentication and ownership (handled by backend).
 */
export async function deleteText(textId: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/exercises/${textId}`, {
    method: "DELETE",
    credentials: "include", // Important for session-based auth
  });

  // Use the helper for consistent error handling
  // handleResponse will correctly handle 204 No Content success
  await handleResponse<undefined>(response);
}
