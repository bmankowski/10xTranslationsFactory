-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create visibility enum type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_enum') THEN
        CREATE TYPE visibility_enum AS ENUM ('public', 'private');
    END IF;
END
$$;

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text UNIQUE NOT NULL,
    name text UNIQUE NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create proficiency levels table
CREATE TABLE IF NOT EXISTS proficiency_levels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

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