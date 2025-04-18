-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text UNIQUE NOT NULL,
    name text UNIQUE NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Initial languages data
INSERT INTO languages (code, name) VALUES 
    ('en', 'English'),
    ('es', 'Spanish')
ON CONFLICT (code) DO NOTHING;

-- Create proficiency levels table
CREATE TABLE IF NOT EXISTS proficiency_levels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Initial proficiency levels data
INSERT INTO proficiency_levels (name, display_order) VALUES 
    ('beginner', 1),
    ('intermediate', 2),
    ('advanced', 3)
ON CONFLICT (name) DO NOTHING;

-- Create visibility enum type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_enum') THEN
        CREATE TYPE visibility_enum AS ENUM ('public', 'private');
    END IF;
END
$$;

-- Create texts table
CREATE TABLE IF NOT EXISTS texts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    language_id uuid NOT NULL,
    proficiency_level_id uuid NOT NULL,
    topic TEXT NOT NULL,
    visibility visibility_enum NOT NULL DEFAULT 'private',
    word_count INTEGER NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CHECK (word_count > 0)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_id uuid NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_responses table
CREATE TABLE IF NOT EXISTS user_responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    response_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback TEXT,
    response_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id uuid PRIMARY KEY,
    primary_language_id uuid NOT NULL,
    ui_language_id uuid NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_learning_languages table
CREATE TABLE IF NOT EXISTS user_learning_languages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    language_id uuid NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    language_id uuid NOT NULL,
    total_attempts INTEGER DEFAULT 0 NOT NULL,
    correct_answers INTEGER DEFAULT 0 NOT NULL,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_is_active ON languages(is_active);
CREATE INDEX IF NOT EXISTS idx_proficiency_levels_display_order ON proficiency_levels(display_order);
CREATE INDEX IF NOT EXISTS idx_texts_user_id ON texts(user_id);
CREATE INDEX IF NOT EXISTS idx_texts_language_id ON texts(language_id);
CREATE INDEX IF NOT EXISTS idx_texts_proficiency_level_id ON texts(proficiency_level_id);
CREATE INDEX IF NOT EXISTS idx_texts_visibility ON texts(visibility);
CREATE INDEX IF NOT EXISTS idx_texts_language_visibility ON texts(language_id, visibility);
CREATE INDEX IF NOT EXISTS idx_texts_is_deleted ON texts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_questions_text_id ON questions(text_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_question_id ON user_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_is_correct ON user_responses(is_correct);
CREATE INDEX IF NOT EXISTS idx_user_responses_created_at ON user_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_primary_language_id ON user_preferences(primary_language_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_ui_language_id ON user_preferences(ui_language_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_languages_user_id ON user_learning_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_languages_language_id ON user_learning_languages(language_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_language_id ON user_statistics(language_id);

-- Add foreign keys
ALTER TABLE texts 
ADD CONSTRAINT texts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE texts 
ADD CONSTRAINT texts_language_id_fkey 
FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT;

ALTER TABLE texts 
ADD CONSTRAINT texts_proficiency_level_id_fkey 
FOREIGN KEY (proficiency_level_id) REFERENCES proficiency_levels(id) ON DELETE RESTRICT;

ALTER TABLE questions 
ADD CONSTRAINT questions_text_id_fkey 
FOREIGN KEY (text_id) REFERENCES texts(id) ON DELETE CASCADE;

ALTER TABLE user_responses 
ADD CONSTRAINT user_responses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_responses 
ADD CONSTRAINT user_responses_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_primary_language_id_fkey 
FOREIGN KEY (primary_language_id) REFERENCES languages(id) ON DELETE RESTRICT;

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_ui_language_id_fkey 
FOREIGN KEY (ui_language_id) REFERENCES languages(id) ON DELETE RESTRICT;

ALTER TABLE user_learning_languages 
ADD CONSTRAINT user_learning_languages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_learning_languages 
ADD CONSTRAINT user_learning_languages_language_id_fkey 
FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT;

ALTER TABLE user_statistics 
ADD CONSTRAINT user_statistics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_statistics 
ADD CONSTRAINT user_statistics_language_id_fkey 
FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT;

-- Add unique constraints
ALTER TABLE user_responses 
ADD CONSTRAINT user_responses_user_question_created_unique 
UNIQUE (user_id, question_id, created_at);

ALTER TABLE user_learning_languages 
ADD CONSTRAINT user_learning_languages_user_language_unique 
UNIQUE (user_id, language_id);

ALTER TABLE user_statistics 
ADD CONSTRAINT user_statistics_user_language_unique 
UNIQUE (user_id, language_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_languages_timestamp
BEFORE UPDATE ON languages
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_proficiency_levels_timestamp
BEFORE UPDATE ON proficiency_levels
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_texts_timestamp
BEFORE UPDATE ON texts
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_questions_timestamp
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_user_preferences_timestamp
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_user_statistics_timestamp
BEFORE UPDATE ON user_statistics
FOR EACH ROW EXECUTE PROCEDURE update_timestamp(); 