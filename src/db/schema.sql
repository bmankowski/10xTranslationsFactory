-- Enable RLS
ALTER DATABASE postgres SET row_level_security = on;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS texts;

-- Create texts table if it doesn't exist
CREATE TABLE texts (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    language_id UUID NOT NULL,
    proficiency_level_id UUID NOT NULL,
    topic TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
    word_count INTEGER NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create questions table if it doesn't exist
CREATE TABLE questions (
    id UUID PRIMARY KEY,
    text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on texts table
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all public texts and their own private texts
CREATE POLICY texts_select_policy ON texts
    FOR SELECT
    USING (visibility = 'public' OR user_id = auth.uid());

-- Create policy to allow users to insert their own texts
CREATE POLICY texts_insert_policy ON texts
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to update their own texts
CREATE POLICY texts_update_policy ON texts
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to delete their own texts
CREATE POLICY texts_delete_policy ON texts
    FOR DELETE
    USING (user_id = auth.uid());

-- Enable RLS on questions table
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow access to questions based on text visibility
CREATE POLICY questions_policy ON questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM texts
            WHERE texts.id = questions.text_id
            AND (texts.visibility = 'public' OR texts.user_id = auth.uid())
        )
    ); 