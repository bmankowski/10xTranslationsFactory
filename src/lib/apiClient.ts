import type { LanguageDTO, PaginatedListDTO, TextDTO } from '@/types';

// Determine if we're running in a browser or on the server
const isBrowser = typeof window !== 'undefined';

// Base URL handling for both client and server environments
function getBaseUrl() {
  if (isBrowser) {
    // In browser, use relative URL
    return '/api';
  } else {
    // In server (SSR), use absolute URL with environment variable or hardcoded default
    // This should match your actual API server
    return process.env.API_BASE_URL || 'http://localhost:3000/api';
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
        console.error("Failed to parse error JSON:", e);
        errorData = { message: 'Invalid error response from server' };
    }
    console.error("API Error:", response.status, errorData);
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
    params.append('language_id', languageId);
  }

  const exercisesURL = `${getBaseUrl()}/exercises?${params.toString()}`;
  // Ensure fetch uses credentials to send session cookies if needed
  const response = await fetch(exercisesURL, {
    credentials: 'include' // Important for session-based auth
  });
  return handleResponse<PaginatedListDTO<TextDTO>>(response);
}

/**
 * Deletes a specific text exercise by its ID.
 * Requires authentication and ownership (handled by backend).
 */
export async function deleteText(textId: string): Promise<void> {
    const response = await fetch(`${getBaseUrl()}/exercises/${textId}`, {
        method: 'DELETE',
        credentials: 'include' // Important for session-based auth
    });

    // Use the helper for consistent error handling
    // handleResponse will correctly handle 204 No Content success
    await handleResponse<void>(response);
} 