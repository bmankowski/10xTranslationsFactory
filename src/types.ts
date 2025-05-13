/* DTO and Command Model type definitions for 10xTranslationsFactory.
   These types are derived from the PostgreSQL database schema and the REST API plan.
   Each DTO directly refers to one or more database entities.
*/

// Language DTOs
export interface LanguageDTO {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string;
}

// A simplified DTO for nested language information
export interface LanguageSummaryDTO {
  id: string;
  code: string;
  name: string;
}

// Proficiency Level DTO
export interface ProficiencyLevelDTO {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// User DTO and related command
export interface UserDTO {
  user_id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Command to update a user - only full_name is allowed to be updated
export interface UpdateUserCommand {
  full_name: string;
}

// User Preferences DTOs
export interface UserPreferencesDTO {
  user_id: string;
  primary_language: LanguageSummaryDTO;
  ui_language: LanguageSummaryDTO;
  updated_at: string;
}

// Command to create/update user preferences
export interface UpdateUserPreferencesCommand {
  primary_language_id: string;
  ui_language_id: string;
}

// User Learning Languages DTOs
export interface UserLearningLanguageDTO {
  id: string;
  user_id: string;
  language: LanguageSummaryDTO;
  created_at: string;
}

// Command to add a user learning language
export interface AddUserLearningLanguageCommand {
  language_id: string;
}

// Text DTOs and related commands
export interface TextDTO {
  id: string;
  title: string;
  content: string;
  language_id: string;
  language?: LanguageDTO; // Nested language details for GET endpoints
  proficiency_level_id: string;
  proficiency_level?: ProficiencyLevelDTO; // Nested proficiency level details for GET endpoints
  topic: string;
  visibility: 'public' | 'private';
  word_count: number;
  user_id?: string; // Present in responses
  created_at: string;
  updated_at: string;
}

// Command to create a text (which will automatically generate questions)
export interface CreateTextCommand {
  language_id: string;
  proficiency_level_id: string;
  topic: string;
  visibility: 'public' | 'private';
}

// Response DTO that includes the created text and the generated questions
export interface CreateTextResponseDTO {
  text: TextDTO;
  questions: QuestionDTO[];
}

// Command to update a text's visibility
export interface UpdateTextVisibilityCommand {
  visibility: 'public' | 'private';
}

// Response DTO for updating text visibility
export interface UpdateTextVisibilityResponseDTO {
  id: string;
  visibility: 'public' | 'private';
  updated_at: string;
}

// Question DTOs
export interface QuestionDTO {
  id: string;
  text_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Detailed Question DTO with nested text details
export interface QuestionDetailDTO extends QuestionDTO {
  text: {
    id: string;
    title: string;
    content: string;
    language: LanguageSummaryDTO;
  };
}

// Command to submit a response to a question
export interface SubmitResponseCommand {
  response_text: string;
  response_time: number;
}

// User Response DTO
export interface UserResponseDTO {
  id: string;
  user_id: string;
  question_id: string;
  response_text: string;
  is_correct: boolean;
  feedback?: string;
  response_time: number;
  created_at: string;
}

// User Statistics DTO
export interface UserStatisticsDTO {
  id: string;
  user_id: string;
  language: LanguageSummaryDTO;
  total_attempts: number;
  correct_answers: number;
  last_activity_date: string;
  updated_at: string;
}

// Generic list DTOs for API responses
export interface ListDTO<T> {
  items: T[];
}

export interface PaginatedListDTO<T> {
  texts: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
} 