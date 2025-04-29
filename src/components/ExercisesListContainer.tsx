import React, { useState, useEffect, useCallback } from 'react';
import type {
  LanguageDTO,
  PaginatedListDTO,
  TextDTO,
} from '@/types'; // Assuming types are correctly exported from src/types.ts
import { fetchLanguages, fetchTexts } from '@/lib/apiClient'; // Import API client functions
import { format } from 'date-fns'; // For date formatting - ensure this is installed
import LanguageFilter from '@/components/LanguageFilter'; // Import LanguageFilter component

// --- Assume an auth hook/context exists ---
// import { useAuth } from '@/hooks/useAuth'; // Example path
const useAuth = () => {
  // Placeholder implementation - replace with your actual auth logic
  // It should return the user object or null/undefined if not logged in
  // This example simulates a logged-in user
  console.warn("Using placeholder useAuth hook!");
  return { user: { user_id: 'mock-user-123' }, isAuthenticated: true };
};
// --- End Auth Hook Assumption ---

// ViewModel defined in the plan
interface ExerciseCardViewModel {
  id: string;
  title: string;
  displayDate: string;
  visibility: 'public' | 'private';
  languageName: string;
  isOwner: boolean;
}

// State structure defined in the plan
interface ExercisesListState {
  texts: ExerciseCardViewModel[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
  };
  filter: {
    selectedLanguageId: string | null;
  };
  availableLanguages: LanguageDTO[];
  modal: {
    isDeleteModalOpen: boolean;
    textToDeleteId: string | null;
  };
  loggedInUserId: string | null;
}

const ExercisesListContainer: React.FC = () => {
  const { user, isAuthenticated } = useAuth(); // Use the auth hook

  const [state, setState] = useState<ExercisesListState>({
    texts: [],
    isLoading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      limit: 10, // Default page size
      totalItems: 0,
    },
    filter: {
      selectedLanguageId: null,
    },
    availableLanguages: [],
    modal: {
      isDeleteModalOpen: false,
      textToDeleteId: null,
    },
    loggedInUserId: isAuthenticated ? user?.user_id ?? null : null, // Set initial userId
  });

  // Update loggedInUserId if auth state changes (e.g., logout)
  useEffect(() => {
    setState(prev => ({ ...prev, loggedInUserId: isAuthenticated ? user?.user_id ?? null : null }));
  }, [isAuthenticated, user?.user_id]);

  // Fetch Languages - Only on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const languages = await fetchLanguages();
        setState(prev => ({ 
          ...prev, 
          availableLanguages: languages.filter(lang => lang.is_active), // Only show active languages
          isLoading: false 
        }));
      } catch (err) {
        console.error("Failed to fetch languages:", err);
        setState(prev => ({ 
          ...prev, 
          error: `Failed to load languages: ${err instanceof Error ? err.message : String(err)}`,
          isLoading: false 
        }));
      }
    };
    
    loadLanguages();
  }, []); // Only run once on mount

  // Function to fetch texts - extracted for reuse in different situations
  const loadTexts = useCallback(async () => {
    if (!state.loggedInUserId) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "User not authenticated", 
        texts: [] 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const offset = (state.pagination.currentPage - 1) * state.pagination.limit;
      const data = await fetchTexts(
        state.pagination.limit,
        offset,
        state.filter.selectedLanguageId
      );

      // Transform TextDTO[] to ExerciseCardViewModel[]
      const viewModels: ExerciseCardViewModel[] = data.items.map((text: TextDTO) => ({
        id: text.id,
        title: text.title,
        displayDate: format(new Date(text.created_at), 'MMMM d, yyyy'),
        visibility: text.visibility,
        languageName: text.language?.name ?? 'Unknown',
        isOwner: text.user_id === state.loggedInUserId,
      }));

      setState(prev => ({
        ...prev,
        texts: viewModels,
        pagination: {
          ...prev.pagination,
          totalPages: Math.ceil(data.total / state.pagination.limit),
          totalItems: data.total,
        },
        isLoading: false,
      }));
    } catch (err) {
      console.error("Failed to fetch texts:", err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load exercises: ${err instanceof Error ? err.message : String(err)}`,
      }));
    }
  }, [state.loggedInUserId, state.pagination.currentPage, state.pagination.limit, state.filter.selectedLanguageId]);

  // Fetch Texts when dependencies change
  useEffect(() => {
    loadTexts();
  }, [loadTexts]); // loadTexts already lists all the dependencies

  // Handler for language filter changes
  const handleLanguageFilterChange = useCallback((languageId: string | null) => {
    setState(prev => ({
      ...prev,
      filter: { selectedLanguageId: languageId },
      pagination: { ...prev.pagination, currentPage: 1 }, // Reset to page 1 on filter change
    }));
    // The effect hook will trigger loadTexts due to the dependency
  }, []);

  // TODO: Implement pagination handler
  // TODO: Implement delete flow handlers
  // TODO: Implement reattempt handler

  // Improved UI handling for loading and error states
  if (state.isLoading && state.texts.length === 0) {
    return <div className="flex justify-center p-8">Loading exercises...</div>;
  }

  if (state.error && state.texts.length === 0) {
    return (
      <div className="text-red-500 p-4 rounded border border-red-300 bg-red-50">
        <p>Error loading exercises: {state.error}</p>
        <button 
          onClick={() => loadTexts()} 
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div>
      {/* Language Filter */}
      <div className="mb-6">
        <LanguageFilter 
          languages={state.availableLanguages} 
          selectedLanguageId={state.filter.selectedLanguageId} 
          onFilterChange={handleLanguageFilterChange} 
        />
      </div>

      {/* Inline loading/error feedback for non-blocking updates */}
      {state.isLoading && <div className="text-sm text-gray-500 mb-4">Updating exercises...</div>}
      {state.error && !state.isLoading && state.texts.length > 0 && (
        <div className="text-red-500 text-sm mb-4">
          {state.error} 
          <button 
            onClick={() => loadTexts()} 
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Exercise Cards List */}
      <div className="space-y-4">
        {!state.isLoading && state.texts.length === 0 && !state.error ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No exercises found.</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Generate New Text
            </button>
          </div>
        ) : (
          state.texts.map(exercise => (
            <div key={exercise.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-medium">{exercise.title}</h3>
              <div className="text-sm text-gray-500">
                Language: {exercise.languageName} | Created: {exercise.displayDate} | 
                Visibility: {exercise.visibility === 'public' ? 'Public' : 'Private'}
              </div>
              <div className="mt-2 flex space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Reattempt
                </button>
                {exercise.isOwner && (
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls - TODO: Replace with actual component */}
      {state.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div>Pagination Controls Placeholder: Page {state.pagination.currentPage} of {state.pagination.totalPages}</div>
        </div>
      )}

      {/* Confirmation Modal - Will be conditionally rendered based on state */}
      {/* The modal will be hidden by default via its isOpen prop */}
      <div>Confirmation Modal Placeholder (hidden)</div>
    </div>
  );
};

export default ExercisesListContainer; 